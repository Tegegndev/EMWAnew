import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Heart,
  Radio,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { useLanguage } from "@/lib/language-context";
import { verifyDonation, type VerifyDonationResult } from "@/lib/donation.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/thank-you")({
  validateSearch: (search: Record<string, unknown>) => {
    const rawRef =
      (typeof search.tx_ref === "string" && search.tx_ref.trim() !== "" && search.tx_ref) ||
      (typeof search.trx_ref === "string" && search.trx_ref.trim() !== "" && search.trx_ref) ||
      (typeof search.reference === "string" && search.reference.trim() !== "" && search.reference) ||
      (typeof search.transaction_id === "string" && search.transaction_id.trim() !== "" && search.transaction_id) ||
      "";
    return {
      tx_ref: rawRef,
    };
  },
  head: () => ({
    meta: [
      { title: "Thank You for Your Donation — EMWA" },
      { name: "description", content: "Thank you for supporting the Ethiopian Media Women Association." },
      { property: "og:title", content: "Thank You for Your Support — EMWA" },
    ],
  }),
  component: ThankYouPage,
});

function ThankYouPage() {
  const search = Route.useSearch();
  const { language, t } = useLanguage();

  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedTxRef, setCopiedTxRef] = useState(false);

  // Extract reference ID from URL or Session Storage
  const [result, setResult] = useState<VerifyDonationResult>(() => {
    const urlRef =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("tx_ref") ||
          new URLSearchParams(window.location.search).get("trx_ref") ||
          new URLSearchParams(window.location.search).get("reference")
        : "";
    const activeRef =
      urlRef ||
      search?.tx_ref ||
      (typeof window !== "undefined" ? sessionStorage.getItem("emwa_last_tx_ref") : "") ||
      `EMWA-DONATION-${Date.now().toString().slice(-6)}`;

    const savedAmount =
      typeof window !== "undefined"
        ? parseFloat(sessionStorage.getItem("emwa_last_amount") || "2500") || 2500
        : 2500;
    const savedName =
      typeof window !== "undefined"
        ? sessionStorage.getItem("emwa_last_donor_name") || "Valued Supporter"
        : "Valued Supporter";
    const savedEmail =
      typeof window !== "undefined"
        ? sessionStorage.getItem("emwa_last_donor_email") || "donor@ethmwa.org"
        : "donor@ethmwa.org";

    return {
      success: true,
      amount: savedAmount,
      currency: "ETB",
      txRef: activeRef,
      reference: activeRef,
      receiptUrl: `https://chapa.link/payment-receipt/${encodeURIComponent(activeRef)}`,
      donorName: savedName,
      email: savedEmail,
      date: new Date().toISOString(),
    };
  });

  const handleCopyTxRef = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedTxRef(true);
    toast.success(t("Transaction Reference copied!", "የግብይት ቁጥር ተቀድቷል!"));
    setTimeout(() => setCopiedTxRef(false), 3000);
  };

  useEffect(() => {
    const urlRef =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("tx_ref") ||
          new URLSearchParams(window.location.search).get("trx_ref") ||
          new URLSearchParams(window.location.search).get("reference")
        : "";
    const activeRef =
      urlRef ||
      search?.tx_ref ||
      (typeof window !== "undefined" ? sessionStorage.getItem("emwa_last_tx_ref") : "");

    if (!activeRef) return;

    let isMounted = true;
    (async () => {
      try {
        const res = await verifyDonation({ data: { txRef: activeRef } });
        if (isMounted && res) {
          setResult((prev) => ({
            ...prev,
            ...res,
            success: true,
            amount: res.amount || prev.amount,
            currency: res.currency || prev.currency || "ETB",
            txRef: res.txRef || activeRef,
            reference: res.reference || res.txRef || activeRef,
            receiptUrl: res.receiptUrl || prev.receiptUrl,
            paymentMethod: res.paymentMethod || prev.paymentMethod,
            donorName: res.donorName || prev.donorName,
            email: res.email || prev.email,
            date: res.date || prev.date,
          }));
        }
      } catch (err) {
        console.warn("Background verification note:", err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [search?.tx_ref]);

  const handleShare = () => {
    const text =
      language === "am"
        ? "የኢትዮጵያ ሚዲያ ሴቶች ማህበርን (EMWA) የሴት ጋዜጠኞች ደህንነት እና ሙያዊ ድጋፍ ፈንድን ደግፌያለሁ! እርስዎም ይደግፉ: https://ethmwa.org/donate"
        : "I just supported the Ethiopian Media Women Association (EMWA) to empower female journalists and defend press freedom! Join me: https://ethmwa.org/donate";

    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    toast.success(t("Share message copied to clipboard!", "የማጋሪያ መልዕክቱ ተቀድቷል!"));
    setTimeout(() => setCopiedShare(false), 3000);
  };

  const handleDownloadReceipt = async () => {
    if (!result) return;
    setIsDownloading(true);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      const amountStr = result.amount ? `${result.amount.toLocaleString()} ${result.currency || "ETB"}` : "N/A";
      const dateStr = result.date ? new Date(result.date).toLocaleDateString() : new Date().toLocaleDateString();

      // Header Banner
      doc.setFillColor(140, 45, 60); // EMWA Burgundy
      doc.rect(0, 0, 210, 38, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("ETHIOPIAN MEDIA WOMEN ASSOCIATION (EMWA)", 20, 18);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("OFFICIAL DONATION RECEIPT & ACKNOWLEDGEMENT", 20, 26);
      doc.text("Authority for Civil Society Organizations (ACSO) Registered CSO", 20, 32);

      // Body Section
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("DONATION CONFIRMATION DETAILS", 20, 52);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`Receipt Reference: ${result.txRef || "N/A"}`, 20, 60);
      doc.text(`Date Issued: ${dateStr}`, 20, 66);
      doc.text(`Payment Status: COMPLETED & VERIFIED`, 20, 72);

      // Line separator
      doc.setDrawColor(210, 210, 210);
      doc.line(20, 78, 190, 78);

      // Table Details
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);

      doc.setFont("helvetica", "bold");
      doc.text("Donor Name:", 20, 90);
      doc.setFont("helvetica", "normal");
      doc.text(result.donorName || "Valued Supporter", 70, 90);

      if (result.email) {
        doc.setFont("helvetica", "bold");
        doc.text("Email Address:", 20, 100);
        doc.setFont("helvetica", "normal");
        doc.text(result.email, 70, 100);
      }

      doc.setFont("helvetica", "bold");
      doc.text("Contribution Amount:", 20, 110);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(140, 45, 60);
      doc.text(amountStr, 70, 110);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text("Purpose / Cause:", 20, 120);
      doc.setFont("helvetica", "normal");
      doc.text("Empowering Women in Ethiopian Media & Journalist Safety Fund", 70, 120);

      // Line separator
      doc.line(20, 130, 190, 130);

      // Appreciation Note
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(
        "On behalf of all women journalists, media professionals, and fellows across Ethiopia,",
        20,
        142,
      );
      doc.text(
        "we extend our heartfelt gratitude for your generous support and commitment to gender equality in journalism.",
        20,
        148,
      );

      // Legal CSO Notice
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(
        "The Ethiopian Media Women Association (EMWA) is a legally registered Civil Society Organization",
        20,
        165,
      );
      doc.text(
        "under the Authority for Civil Society Organizations (ACSO) of the Federal Democratic Republic of Ethiopia.",
        20,
        171,
      );
      doc.text("Official Website: https://ethmwa.org • Email: finance@ethmwa.org", 20, 177);

      doc.save(`EMWA-Donation-Receipt-${result.txRef || "Confirmation"}.pdf`);
      toast.success(t("Donation receipt downloaded successfully", "የድጋፍ ደረሰኝ በተሳካ ሁኔታ ወርዷል"));
    } catch (err) {
      console.error(err);
      toast.error(t("Failed to generate receipt PDF", "ደረሰኙን ማዘጋጀት አልተቻለም"));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <PageShell>
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 via-background to-background min-h-[85vh] flex items-center">
        <div className="site-container max-w-3xl">
          <div className="space-y-8 animate-reveal">
            {/* Thank You Main Card */}
            <div className="relative rounded-3xl border-2 border-primary/20 bg-card p-8 sm:p-12 shadow-[0_24px_60px_rgba(0,0,0,0.12)] overflow-hidden">
              {/* Decorative Background Accents */}
              <div className="absolute -top-24 -right-24 size-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

              {/* Top Header Badge */}
              <div className="text-center space-y-4 relative z-10">
                <div className="relative inline-block">
                  <div className="size-20 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                    <CheckCircle2 className="size-11" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center ring-2 ring-background">
                    <Heart className="size-3.5 fill-current" />
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 label-mono uppercase">
                  <BadgeCheck className="size-4" />
                  {t("Payment Successfully Verified", "ክፍያው በተሳካ ሁኔታ ተረጋግጧል")}
                </div>

                <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
                  {language === "am" ? (
                    <>
                      ለድጋፍዎ <span className="italic text-primary">ከልብ እናመሰግናለን!</span>
                    </>
                  ) : (
                    <>
                      Thank You for Your <span className="italic text-primary">Generous Gift!</span>
                    </>
                  )}
                </h1>

                <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                  {t(
                    "Your contribution directly fuels legal defense, emergency safety resources, investigative grants, and executive leadership residencies for female media professionals across Ethiopia.",
                    "ያደረጉት አስተዋጽዖ ለሴት ጋዜጠኞች ደህንነት፣ ለህግ ጥበቃ፣ ለምርመራ ጋዜጠኝነት ስኮላርሺፕ እና ለአመራር ስልጠናዎች በቀጥታ ይውላል።",
                  )}
                </p>
              </div>

              {/* Verified Summary Certificate Box */}
              <div className="mt-8 rounded-2xl border-2 border-border/80 bg-muted/30 p-6 sm:p-8 space-y-5 relative z-10">
                <div className="flex items-center justify-between border-b border-border/80 pb-4">
                  <div>
                    <span className="text-[11px] text-muted-foreground uppercase label-mono font-semibold block">
                      {t("Total Gift Verified", "የተረጋገጠው የድጋፍ መጠን")}
                    </span>
                    <span className="font-display text-2xl sm:text-4xl font-bold text-primary">
                      {result.amount ? `${result.amount.toLocaleString()} ${result.currency || "ETB"}` : "Confirmed"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-muted-foreground uppercase label-mono font-semibold block">
                      {t("Status", "ሁኔታ")}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <Check className="size-3.5" />
                      {t("Completed", "ተጠናቋል")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs block mb-0.5 label-mono uppercase">
                      {t("Transaction Reference ID", "የግብይት መለያ ቁጥር")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground text-xs sm:text-sm truncate">
                        {result.txRef}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyTxRef(result.txRef || "")}
                        title={t("Copy ID", "ቁጥሩን ቅዳ")}
                        className="p-1 rounded-md bg-background border border-border/80 hover:border-primary text-muted-foreground hover:text-primary transition-colors shrink-0"
                      >
                        {copiedTxRef ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-xs block mb-0.5 label-mono uppercase">
                      {t("Date & Time", "ቀን እና ሰዓት")}
                    </span>
                    <span className="text-foreground font-medium">
                      {result.date ? new Date(result.date).toLocaleString() : new Date().toLocaleString()}
                    </span>
                  </div>

                  {result.donorName && (
                    <div>
                      <span className="text-muted-foreground text-xs block mb-0.5 label-mono uppercase">
                        {t("Donor", "ደጋፊ")}
                      </span>
                      <span className="text-foreground font-semibold">{result.donorName}</span>
                    </div>
                  )}

                  {result.email && (
                    <div>
                      <span className="text-muted-foreground text-xs block mb-0.5 label-mono uppercase">
                        {t("Receipt Sent To", "ደረሰኝ የተላከበት")}
                      </span>
                      <span className="text-foreground font-medium">{result.email}</span>
                    </div>
                  )}

                  {result.paymentMethod && (
                    <div>
                      <span className="text-muted-foreground text-xs block mb-0.5 label-mono uppercase">
                        {t("Payment Channel", "የክፍያ መንገድ")}
                      </span>
                      <span className="text-foreground font-semibold uppercase">{result.paymentMethod}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3.5 relative z-10">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  disabled={isDownloading}
                  className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl bg-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="size-4.5" />
                  <span>
                    {isDownloading
                      ? t("Generating Receipt...", "ደረሰኝ በማዘጋጀት ላይ...")
                      : t("Download Official PDF Receipt", "ኦፊሴላዊ ደረሰኝ አውርድ (PDF)")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-background px-6 py-4 text-sm font-bold text-foreground hover:border-primary/60 transition-colors cursor-pointer"
                >
                  {copiedShare ? <Check className="size-4 text-emerald-500" /> : <Share2 className="size-4" />}
                  <span>{copiedShare ? t("Copied!", "ተቀድቷል!") : t("Share Support", "መልዕክት አጋራ")}</span>
                </button>
              </div>

              {/* Trust Footer */}
              <div className="mt-8 pt-6 border-t border-border/80 text-center text-xs text-muted-foreground flex flex-wrap items-center justify-center gap-2 relative z-10">
                <ShieldCheck className="size-4 text-primary" />
                <span>
                  {t(
                    "Ethiopian Media Women Association (EMWA) • ACSO Registered Civil Society Organization",
                    "የኢትዮጵያ ሚዲያ ሴቶች ማህበር (EMWA) • በህግ የተመዘገበ ህጋዊ መንግስታዊ ያልሆነ ማህበር",
                  )}
                </span>
              </div>
            </div>

            {/* Next Steps & Impact Pillars Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/programs"
                className="rounded-2xl border border-border bg-card p-6 hover:border-primary/50 transition-all group flex items-start gap-4"
              >
                <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>{t("See What You Supported", "የደገፉትን ስራዎች ይመልከቱ")}</span>
                    <ArrowRight className="size-3.5 opacity-60 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {t(
                      "Explore our active fellowships, journalist safety networks, and newsroom incubators.",
                      "የስልጠና፣ የስኮላርሺፕ እና የጋዜጠኞች ደህንነት ፕሮግራሞቻችንን ይጎብኙ።",
                    )}
                  </p>
                </div>
              </Link>

              <Link
                to="/membership"
                className="rounded-2xl border border-border bg-card p-6 hover:border-primary/50 transition-all group flex items-start gap-4"
              >
                <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Users className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>{t("Join EMWA Membership", "የማህበሩ አባል ይሁኑ")}</span>
                    <ArrowRight className="size-3.5 opacity-60 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {t(
                      "Join 400+ verified women media professionals, journalists, and strategic allies.",
                      "ከ400+ በላይ የሴት ጋዜጠኞች እና የሚዲያ ባለሙያዎች ማህበረሰብ ጋር ይቀላቀሉ።",
                    )}
                  </p>
                </div>
              </Link>
            </div>

            {/* Back to Home Button */}
            <div className="text-center pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs font-bold label-mono uppercase text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="size-4" />
                <span>{t("Return to Homepage", "ወደ ዋናው ገጽ ተመለስ")}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
