import { createServerFn } from "@tanstack/react-start";

export interface InitializeDonationPayload {
  amount: number;
  email: string;
  firstName: string;
  lastName: string;
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
  error?: string;
}

const getChapaSecretKey = (): string => {
  const env = typeof process !== "undefined" ? process.env : {};
  const metaEnv = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};
  const key =
    env.CHAPA_SECRET_KEY ||
    (metaEnv as Record<string, string | undefined>).VITE_CHAPA_SECRET_KEY ||
    (metaEnv as Record<string, string | undefined>).CHAPA_SECRET_KEY ||
    "CHASECK_TEST-fKGMgwXlDNj76afswCLd1PN6YoWN4Jjr";
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
        error: "Payment gateway configuration is missing.",
      };
    }

    if (!data.amount || data.amount < 50) {
      return {
        success: false,
        error: "Minimum donation amount is 50 ETB.",
      };
    }

    const email = (data.email || "").trim();
    const firstName = (data.firstName || "").trim();
    const lastName = (data.lastName || "").trim();

    if (!email || !firstName || !lastName) {
      return {
        success: false,
        error: "Please provide your first name, last name, and a valid email address.",
      };
    }

    // Clean phone number: keep numbers and optional leading +
    let cleanPhone: string | undefined = undefined;
    if (data.phone && data.phone.trim()) {
      const formatted = data.phone.trim().replace(/[^\d+]/g, "");
      if (formatted.length >= 9 && formatted.length <= 16) {
        cleanPhone = formatted;
      }
    }

    const txRef = `EMWA-DONATION-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Compute guaranteed return URL with tx_ref parameter
    const rawBase = data.returnUrl || (typeof process !== "undefined" ? process.env?.APP_BASE_URL : "") || "http://localhost:5173";
    const cleanOrigin = rawBase.split("?")[0].replace(/\/donate\/success\/?$/, "").replace(/\/thank-you\/?$/, "").replace(/\/$/, "");
    const returnUrl = `${cleanOrigin}/thank-you?tx_ref=${encodeURIComponent(txRef)}`;

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
            title: "EMWA Donation",
            description: "Supporting Women in Ethiopian Media",
          },
          meta: {
            is_anonymous: data.isAnonymous ? "true" : "false",
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

      return {
        success: isSuccess,
        status: txData.status,
        amount: typeof txData.amount === "string" ? parseFloat(txData.amount) : txData.amount,
        currency: txData.currency || "ETB",
        txRef: txData.tx_ref || data.txRef,
        reference,
        paymentMethod: txData.method || txData.payment_method,
        receiptUrl: `https://chapa.link/payment-receipt/${encodeURIComponent(reference)}`,
        donorName: `${txData.first_name || ""} ${txData.last_name || ""}`.trim(),
        email: txData.email,
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
