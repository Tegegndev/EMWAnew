import { createServerFn } from "@tanstack/react-start";

export interface InitializeDonationPayload {
  amount: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  notes?: string;
  isAnonymous?: boolean;
  returnUrl?: string;
}

export interface InitializeDonationResult {
  success: boolean;
  checkoutUrl?: string;
  txRef?: string;
  error?: string;
}

export interface VerifyDonationResult {
  success: boolean;
  status?: string;
  amount?: number;
  currency?: string;
  txRef?: string;
  reference?: string;
  paymentMethod?: string;
  receiptUrl?: string;
  donorName?: string;
  email?: string;
  date?: string;
  isAnonymous?: boolean;
  error?: string;
}

const getChapaSecretKey = (): string => {
  const env = typeof process !== "undefined" ? process.env : {};
  const metaEnv = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};
  const key =
    env.CHAPA_SECRET_KEY ||
    (metaEnv as Record<string, string | undefined>).VITE_CHAPA_SECRET_KEY ||
    (metaEnv as Record<string, string | undefined>).CHAPA_SECRET_KEY ||
    "";
  return (key || "").trim();
};

const formatChapaErrorMessage = (payload: { message?: unknown }): string => {
  if (!payload || !payload.message) return "Failed to initialize secure checkout.";
  if (typeof payload.message === "string") return payload.message;
  if (typeof payload.message === "object") {
    try {
      const messages: string[] = [];
      for (const [, val] of Object.entries(payload.message as Record<string, unknown>)) {
        if (Array.isArray(val)) {
          messages.push(val.join(", "));
        } else if (typeof val === "string") {
          messages.push(val);
        }
      }
      if (messages.length > 0) return messages.join(" | ");
    } catch {
      // fallback
    }
  }
  return "Payment gateway reported a validation issue.";
};

export const initializeDonation = createServerFn({ method: "POST" })
  .validator((data: InitializeDonationPayload) => data)
  .handler(async ({ data }): Promise<InitializeDonationResult> => {
    const secretKey = getChapaSecretKey();

    if (!secretKey) {
      return {
        success: false,
        error: "CHAPA_NOT_CONFIGURED",
      };
    }

    if (!data.amount || data.amount < 50) {
      return {
        success: false,
        error: "Minimum donation amount is 50 ETB.",
      };
    }

    const isAnonymous = Boolean(data.isAnonymous);
    const txRef = `EMWA-DONATION-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    let email = (data.email || "").trim();
    let firstName = (data.firstName || "").trim();
    let lastName = (data.lastName || "").trim();

    if (isAnonymous) {
      if (!firstName) firstName = "Anonymous";
      if (!lastName) lastName = "Supporter";
      if (!email) {
        // Generate compact anonymous placeholder email (under 50 chars for Chapa)
        const shortStamp = Date.now().toString().slice(-6);
        const shortRand = Math.random().toString(36).substring(2, 7);
        email = `anon.${shortStamp}.${shortRand}@ethmwa.org`;
      }
    } else {
      if (!email || !firstName || !lastName) {
        return {
          success: false,
          error: "Please provide your first name, last name, and a valid email address.",
        };
      }
      if (email.length > 50) {
        return {
          success: false,
          error: "Email address must not exceed 50 characters.",
        };
      }
    }

    // Clean phone number: keep numbers and optional leading +
    let cleanPhone: string | undefined = undefined;
    if (!isAnonymous && data.phone && data.phone.trim()) {
      const formatted = data.phone.trim().replace(/[^\d+]/g, "");
      if (formatted.length >= 9 && formatted.length <= 16) {
        cleanPhone = formatted;
      }
    }

    // Compute guaranteed return URL with tx_ref parameter
    const rawBase = data.returnUrl || (typeof process !== "undefined" ? process.env?.APP_BASE_URL : "") || "http://localhost:5173";
    const cleanOrigin = rawBase.split("?")[0].replace(/\/donate\/success\/?$/, "").replace(/\/thank-you\/?$/, "").replace(/\/$/, "");
    const returnUrl = `${cleanOrigin}/thank-you?tx_ref=${encodeURIComponent(txRef)}&anon=${isAnonymous ? "1" : "0"}`;

    try {
      const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: String(data.amount),
          currency: "ETB",
          email,
          first_name: firstName,
          last_name: lastName,
          phone_number: cleanPhone,
          tx_ref: txRef,
          return_url: returnUrl,
          customization: {
            title: isAnonymous ? "EMWA Anonymous" : "EMWA Donation", // strictly <= 16 characters
            description: "Supporting Women in Ethiopian Media",
          },
          meta: {
            is_anonymous: isAnonymous ? "true" : "false",
            notes: data.notes || "",
          },
        }),
      });

      const payload = (await response.json()) as {
        status?: string;
        message?: unknown;
        data?: { checkout_url?: string };
      };

      if (!response.ok || payload.status !== "success" || !payload.data?.checkout_url) {
        const errorDetail = formatChapaErrorMessage(payload);
        console.warn("Chapa initialization response error:", payload);
        return {
          success: false,
          error: errorDetail,
        };
      }

      return {
        success: true,
        checkoutUrl: payload.data.checkout_url,
        txRef,
      };
    } catch (err) {
      console.error("Donation initialization error:", err);
      return {
        success: false,
        error: "Network error connecting to payment gateway.",
      };
    }
  });

export const verifyDonation = createServerFn({ method: "POST" })
  .validator((data: { txRef: string }) => data)
  .handler(async ({ data }): Promise<VerifyDonationResult> => {
    const secretKey = getChapaSecretKey();

    if (!data.txRef) {
      return { success: false, error: "Transaction reference is required." };
    }

    try {
      const response = await fetch(
        `https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(data.txRef)}`,
        {
          headers: {
            Authorization: `Bearer ${secretKey.trim()}`,
          },
        },
      );

      const payload = (await response.json()) as {
        status?: string;
        message?: string;
        data?: {
          status?: string;
          amount?: number | string;
          currency?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          reference?: string;
          method?: string;
          payment_method?: string;
          created_at?: string;
          tx_ref?: string;
          meta?: { is_anonymous?: string };
        };
      };

      if (!response.ok || payload.status !== "success" || !payload.data) {
        return {
          success: false,
          error: payload.message || "Unable to verify transaction.",
        };
      }

      const txData = payload.data;
      const isSuccess = txData.status === "success";
      const reference = txData.reference || data.txRef;

      const isAnon =
        txData.meta?.is_anonymous === "true" ||
        (txData.email && (txData.email.startsWith("anon.") || txData.email.startsWith("anonymous."))) ||
        (txData.first_name === "Anonymous" && txData.last_name === "Supporter");

      return {
        success: isSuccess,
        status: txData.status,
        amount: typeof txData.amount === "string" ? parseFloat(txData.amount) : txData.amount,
        currency: txData.currency || "ETB",
        txRef: txData.tx_ref || data.txRef,
        reference,
        paymentMethod: txData.method || txData.payment_method,
        receiptUrl: `https://chapa.link/payment-receipt/${encodeURIComponent(reference)}`,
        donorName: isAnon ? "Anonymous Supporter" : `${txData.first_name || ""} ${txData.last_name || ""}`.trim(),
        email: isAnon ? undefined : txData.email,
        isAnonymous: isAnon,
        date: txData.created_at || new Date().toISOString(),
      };
    } catch (err) {
      console.error("Donation verification error:", err);
      return {
        success: false,
        error: "Network error verifying transaction.",
      };
    }
  });
