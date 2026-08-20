import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Download,
  Heart,
  Loader2,
  Share2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { useLanguage } from "@/lib/language-context";
import { verifyDonation, type VerifyDonationResult } from "@/lib/donation.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/donate/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    tx_ref: typeof search.tx_ref === "string" ? search.tx_ref : "",
  }),
  head: () => ({
    meta: [
      { title: "Thank You for Your Donation — EMWA" },
      { name: "description", content: "Thank you for supporting the Ethiopian Media Women Association." },
      { property: "og:title", content: "Donation Confirmed — EMWA" },
    ],
  }),
  component: DonationSuccessPage,
});

function DonationSuccessPage() {
  const { tx_ref } = Route.useSearch();
  const { language, t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerifyDonationResult | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!tx_ref) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const res = await verifyDonation({ data: { txRef: tx_ref } });
        if (isMounted) {
          setResult(res);
        }
      } catch (err) {
        if (isMounted) {
          setResult({
            success: false,
            error: "Failed to verify transaction.",
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [tx_ref]);

  const handleDownloadReceipt = async () => {
    if (!result) return;
    setIsDownloading(true);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      const amountStr = result.amount ? `${result.amount.toLocaleString()} ${result.currency || "ETB"}` : "N/A";
      const dateStr = result.date ? new Date(result.date).toLocaleDateString() : new Date().toLocaleDateString();

      // Receipt Styling
      doc.setFillColor(140, 45, 60); // EMWA Burgundy
      doc.rect(0, 0, 210, 35, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("ETHIOPIAN MEDIA WOMEN ASSOCIATION", 20, 18);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("OFFICIAL DONATION RECEIPT", 20, 26);

      // Body
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("DONATION CONFIRMATION", 20, 52);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(90, 90, 90);
      doc.text(`Receipt Reference: ${result.txRef || tx_ref || "N/A"}`, 20, 60);
      doc.text(`Date Issued: ${dateStr}`, 20, 66);
      doc.text(`Status: COMPLETED / VERIFIED`, 20, 72);

      // Line separator
      doc.setDrawColor(220, 220, 220);
      doc.line(20, 78, 190, 78);

      // Table details
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

      // Notice footer
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(
        "The Ethiopian Media Women Association (EMWA) is a legally registered Civil Society Organization",
        20,
        142,
      );
      doc.text(
        "under the Authority for Civil Society Organizations (ACSO) of the Federal Democratic Republic of Ethiopia.",
        20,
        148,
      );
      doc.text("Thank you for your generous dedication to press freedom and gender equality.", 20, 154);

      doc.save(`EMWA-Donation-Receipt-${tx_ref || "Confirmation"}.pdf`);
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
      <section className="py-20 md:py-28">
        <div className="site-container max-w-2xl">
          {loading ? (
            <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-xl space-y-4">
              <Loader2 className="size-10 animate-spin text-primary mx-auto" />
              <h2 className="font-display text-2xl font-bold text-foreground">
                {t("Verifying your donation...", "የድጋፍ ክፍያዎን በማረጋገጥ ላይ...")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t(
                  "Please wait while we confirm your transaction with the payment gateway.",
                  "እባክዎ ክፍያው እስኪረጋገጥ ድረስ ለጥቂት ሰከንዶች ይጠብቁ።",
                )}
              </p>
            </div>
          ) : result?.success ? (
            <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-2xl space-y-8 animate-reveal">
              <div className="text-center space-y-3">
                <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
                  <CheckCircle2 className="size-9" />
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 label-mono">
                  <BadgeCheck className="size-3.5" />
                  {t("Payment Confirmed", "ክፍያው ተረጋግጧል")}
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                  {language === "am" ? "ለድጋፍዎ ከልብ እናመሰግናለን!" : "Thank you for your generous support!"}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
                  {t(
                    "Your contribution directly powers journalist safety, legal defense, and investigative media fellowships across Ethiopia.",
                    "ያደረጉት አስተዋጽዖ ለሴት ጋዜጠኞች ደህንነት፣ ለህግ ጥበቃ እና ለምርመራ ጋዜጠኝነት ስልጠናዎች በቀጥታ ይውላል።",
                  )}
                </p>
              </div>

              {/* Receipt Summary Box */}
              <div className="rounded-2xl border border-border bg-muted/30 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <span className="text-xs text-muted-foreground uppercase label-mono">
                    {t("Donation Amount", "የድጋፍ መጠን")}
                  </span>
                  <span className="font-display text-2xl font-bold text-primary">
                    {result.amount ? `${result.amount.toLocaleString()} ${result.currency || "ETB"}` : "Confirmed"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block mb-0.5">{t("Reference ID", "የማረጋገጫ ቁጥር")}</span>
                    <span className="font-mono font-medium text-foreground">{result.txRef || tx_ref}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">{t("Date", "ቀን")}</span>
                    <span className="text-foreground">
                      {result.date ? new Date(result.date).toLocaleString() : new Date().toLocaleDateString()}
                    </span>
                  </div>
                  {result.donorName && (
                    <div>
                      <span className="text-muted-foreground block mb-0.5">{t("Donor", "ደጋፊ")}</span>
                      <span className="text-foreground font-medium">{result.donorName}</span>
                    </div>
                  )}
                  {result.email && (
                    <div>
                      <span className="text-muted-foreground block mb-0.5">{t("Receipt Sent To", "ደረሰኝ የተላከበት")}</span>
                      <span className="text-foreground font-medium">{result.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  disabled={isDownloading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-foreground text-background px-6 py-3.5 text-xs font-bold label-mono uppercase hover:bg-primary transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Download className="size-4" />
                  <span>{isDownloading ? t("Generating PDF...", "በማዘጋጀት ላይ...") : t("Download Receipt (PDF)", "ደረሰኝ አውርድ (PDF)")}</span>
                </button>
                <Link
                  to="/"
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3.5 text-xs font-bold label-mono uppercase text-foreground hover:border-primary transition-colors"
                >
                  <ArrowLeft className="size-4" />
                  <span>{t("Return Home", "ወደ ዋናው ገጽ")}</span>
                </Link>
              </div>

              <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5 pt-2">
                <ShieldCheck className="size-4 text-primary" />
                <span>{t("Official ACSO Certified Civil Society Organization", "በኢትዮጵያ ሲቪል ማህበረሰብ ድርጅቶች ባለስልጣን ህጋዊ እውቅና ያለው")}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 text-center shadow-xl space-y-6">
              <div className="size-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <XCircle className="size-9" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {t("Payment Status Verification", "የክፍያ ሁኔታ ማረጋገጫ")}
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {result?.error ||
                    t(
                      "We could not confirm the completed status for this transaction reference. If your account was charged, please contact us.",
                      "የክፍያ ማረጋገጫውን ማጠናቀቅ አልተቻለም። ሂሳብዎ ተቀናሽ ከተደረገ እባክዎን የፋይናንስ ክፍላችንን ያነጋግሩ።",
                    )}
                </p>
              </div>

              {tx_ref && (
                <div className="font-mono text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg max-w-sm mx-auto">
                  Ref: {tx_ref}
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link
                  to="/donate"
                  className="rounded-xl bg-primary text-primary-foreground px-6 py-3 text-xs font-bold label-mono uppercase hover:bg-primary/90 transition-colors shadow-md"
                >
                  {t("Try Again", "እንደገና ይሞክሩ")}
                </Link>
                <Link
                  to="/contact"
                  className="rounded-xl border border-border px-6 py-3 text-xs font-bold label-mono uppercase text-foreground hover:border-primary transition-colors"
                >
                  {t("Contact Support", "ያነጋግሩን")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
