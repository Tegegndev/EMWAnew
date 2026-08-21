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

export const initializeDonation = createServerFn({ method: "POST" })
  .validator((data: InitializeDonationPayload) => data)
  .handler(async ({ data }): Promise<InitializeDonationResult> => {
    const secretKey =
      process.env.CHAPA_SECRET_KEY ||
      "CHASECK_TEST-fKGMgwXlDNj76afswCLd1PN6YoWN4Jjr";

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

    if (!data.email || !data.firstName || !data.lastName) {
      return {
        success: false,
        error: "Please provide your first name, last name, and a valid email address.",
      };
    }

    const txRef = `EMWA-DONATION-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Compute guaranteed return URL with tx_ref parameter
    const rawBase = data.returnUrl || process.env.APP_BASE_URL || "http://localhost:5173";
    const cleanOrigin = rawBase.split("?")[0].replace(/\/donate\/success\/?$/, "").replace(/\/thank-you\/?$/, "").replace(/\/$/, "");
    const returnUrl = `${cleanOrigin}/thank-you?tx_ref=${encodeURIComponent(txRef)}`;

    try {
      const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: String(data.amount),
          currency: "ETB",
          email: data.email.trim(),
          first_name: data.firstName.trim(),
          last_name: data.lastName.trim(),
          phone_number: data.phone?.trim() || undefined,
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
        message?: string;
        data?: { checkout_url?: string };
      };

      if (!response.ok || payload.status !== "success" || !payload.data?.checkout_url) {
        return {
          success: false,
          error: payload.message || "Failed to initialize secure checkout.",
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
    const secretKey =
      process.env.CHAPA_SECRET_KEY ||
      "CHASECK_TEST-fKGMgwXlDNj76afswCLd1PN6YoWN4Jjr";

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
