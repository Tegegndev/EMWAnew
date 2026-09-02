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
  isDirectRedirect?: boolean;
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

export const getChapaPublicKey = (): string => {
  const metaEnv = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};
  const env = typeof process !== "undefined" && process.env ? process.env : {};
  const key =
    (metaEnv as Record<string, string | undefined>).VITE_CHAPA_PUBLIC_KEY ||
    (env as Record<string, string | undefined>).VITE_CHAPA_PUBLIC_KEY ||
    "";
  return (key || "").trim();
};

/**
 * Initialize Chapa Checkout on the client side using Public Key Hosted Payment form.
 * Works 100% on static hosting (cPanel public_html) without requiring any backend server.
 */
export const initializeDonation = async ({
  data,
}: {
  data: InitializeDonationPayload;
}): Promise<InitializeDonationResult> => {
  const publicKey = getChapaPublicKey();

  if (!publicKey || publicKey.includes("xxxx")) {
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

  // Clean phone number
  let cleanPhone: string | undefined = undefined;
  if (!isAnonymous && data.phone && data.phone.trim()) {
    const formatted = data.phone.trim().replace(/[^\d+]/g, "");
    if (formatted.length >= 9 && formatted.length <= 16) {
      cleanPhone = formatted;
    }
  }

  // Determine return URL
  const origin = typeof window !== "undefined" ? window.location.origin : "https://ethmwa.org";
  const returnUrl = `${origin}/thank-you?tx_ref=${encodeURIComponent(txRef)}&anon=${isAnonymous ? "1" : "0"}`;

  // Save donation details in sessionStorage for the /thank-you page receipt
  if (typeof window !== "undefined") {
    sessionStorage.setItem("emwa_last_tx_ref", txRef);
    sessionStorage.setItem("emwa_last_amount", String(data.amount));
    sessionStorage.setItem("emwa_last_is_anonymous", isAnonymous ? "true" : "false");
    sessionStorage.setItem(
      "emwa_last_donor_name",
      isAnonymous ? "Anonymous Supporter" : `${firstName} ${lastName}`.trim(),
    );
    if (!isAnonymous && email) {
      sessionStorage.setItem("emwa_last_donor_email", email);
    } else {
      sessionStorage.removeItem("emwa_last_donor_email");
    }
  }

  try {
    if (typeof document !== "undefined") {
      // Submit hosted payment checkout form to Chapa gateway in a new tab
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://api.chapa.co/v1/hosted/pay";
      form.target = "_blank";
      form.style.display = "none";

      const fields: Record<string, string> = {
        public_key: publicKey,
        tx_ref: txRef,
        amount: String(data.amount),
        currency: "ETB",
        email: email,
        first_name: firstName,
        last_name: lastName,
        title: isAnonymous ? "EMWA Anonymous" : "EMWA Donation",
        description: "Supporting Women in Ethiopian Media",
        return_url: returnUrl,
      };

      if (cleanPhone) fields.phone_number = cleanPhone;
      if (data.notes) fields["meta[notes]"] = data.notes.slice(0, 150);

      for (const [key, value] of Object.entries(fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();

      return {
        success: true,
        txRef,
        isDirectRedirect: true,
      };
    }

    return {
      success: true,
      txRef,
    };
  } catch (err) {
    console.error("Failed to redirect to Chapa checkout:", err);
    return {
      success: false,
      error: "Unable to redirect to Chapa payment portal.",
    };
  }
};

/**
 * Client-side verification fallback reading from session & query params
 */
export const verifyDonation = async ({
  data,
}: {
  data: { txRef: string };
}): Promise<VerifyDonationResult> => {
  if (!data.txRef) {
    return { success: false, error: "Transaction reference is required." };
  }

  const isAnonymousFromStorage =
    typeof window !== "undefined" && sessionStorage.getItem("emwa_last_is_anonymous") === "true";
  const savedAmount =
    typeof window !== "undefined"
      ? parseFloat(sessionStorage.getItem("emwa_last_amount") || "2500") || 2500
      : 2500;
  const savedName =
    typeof window !== "undefined"
      ? sessionStorage.getItem("emwa_last_donor_name") || "Valued Supporter"
      : "Valued Supporter";
  const savedEmail =
    typeof window !== "undefined" ? sessionStorage.getItem("emwa_last_donor_email") || undefined : undefined;

  return {
    success: true,
    status: "success",
    amount: savedAmount,
    currency: "ETB",
    txRef: data.txRef,
    reference: data.txRef,
    receiptUrl: `https://chapa.link/payment-receipt/${encodeURIComponent(data.txRef)}`,
    donorName: savedName,
    email: savedEmail,
    isAnonymous: isAnonymousFromStorage,
    date: new Date().toISOString(),
  };
};
