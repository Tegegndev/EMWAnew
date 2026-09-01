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
  ExternalLink,
  Heart,
  MessageSquare,
  Printer,
  Radio,
  RotateCcw,
  Send,
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
    const isAnon = search.anon === "1" || search.is_anonymous === "true" || search.is_anonymous === true;
    return {
      tx_ref: rawRef,
      anon: isAnon ? "1" : "0",
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
  const [printKey, setPrintKey] = useState(1);
  const [isPrinting, setIsPrinting] = useState(true);

  // Trigger sound / visual timer for the printing simulation
  useEffect(() => {
    setIsPrinting(true);
    const timer = setTimeout(() => {
      setIsPrinting(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [printKey]);

  const handleReplayPrint = () => {
    setPrintKey((prev) => prev + 1);
  };

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

    const isAnonymousFromStorage =
      typeof window !== "undefined" && sessionStorage.getItem("emwa_last_is_anonymous") === "true";
    const isAnon = search?.anon === "1" || isAnonymousFromStorage;

    const savedAmount =
      typeof window !== "undefined"
        ? parseFloat(sessionStorage.getItem("emwa_last_amount") || "2500") || 2500
        : 2500;
    const savedName = isAnon
      ? "Anonymous Supporter"
      : typeof window !== "undefined"
        ? sessionStorage.getItem("emwa_last_donor_name") || "Valued Supporter"
        : "Valued Supporter";
    const savedEmail = isAnon
      ? undefined
      : typeof window !== "undefined"
        ? sessionStorage.getItem("emwa_last_donor_email") || undefined
        : undefined;

    return {
      success: true,
      amount: savedAmount,
      currency: "ETB",
      txRef: activeRef,
      reference: activeRef,
      receiptUrl: `https://chapa.link/payment-receipt/${encodeURIComponent(activeRef)}`,
      donorName: savedName,
      email: savedEmail,
      isAnonymous: isAnon,
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
          const isAnon =
            res.isAnonymous ||
            search?.anon === "1" ||
            (typeof window !== "undefined" && sessionStorage.getItem("emwa_last_is_anonymous") === "true") ||
            res.email?.startsWith("anon.") ||
            res.email?.startsWith("anonymous.") ||
            res.donorName === "Anonymous Supporter";

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
            donorName: isAnon ? "Anonymous Supporter" : res.donorName || prev.donorName,
            email: isAnon ? undefined : res.email || prev.email,
            isAnonymous: isAnon,
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
  }, [search?.tx_ref, search?.anon]);

  const shareText =
    language === "am"
      ? "የኢትዮጵያ ሚዲያ ሴቶች ማህበርን (EMWA) የሴት ጋዜጠኞች ደህንነት እና ሙያዊ ድጋፍ ፈንድን ደግፌያለሁ! እርስዎም ይደግፉ:"
      : "I just supported the Ethiopian Media Women Association (EMWA) to empower female journalists and defend press freedom! Join me:";
  const shareUrl = "https://ethmwa.org/donate";

  const handleShareClipboard = () => {
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
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

      const isAnon =
        result.isAnonymous ||
        !result.email ||
        result.email.startsWith("anon.") ||
        result.email.startsWith("anonymous.") ||
        result.donorName === "Anonymous Supporter";

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

      let currentY = 90;

      doc.setFont("helvetica", "bold");
      doc.text("Donor Name:", 20, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(isAnon ? "Anonymous Donor (Protected)" : (result.donorName || "Valued Supporter"), 70, currentY);

      if (!isAnon && result.email) {
        currentY += 10;
        doc.setFont("helvetica", "bold");
        doc.text("Email Address:", 20, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(result.email, 70, currentY);
      }

      currentY += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Contribution Amount:", 20, currentY);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(140, 45, 60);
      doc.text(amountStr, 70, currentY);

      currentY += 10;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text("Purpose / Cause:", 20, currentY);
      doc.setFont("helvetica", "normal");
      doc.text("Empowering Women in Ethiopian Media & Journalist Safety Fund", 70, currentY);

      // Line separator
      currentY += 10;
      doc.line(20, currentY, 190, currentY);

      // Appreciation Note
      currentY += 12;
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(
        "On behalf of all women journalists, media professionals, and fellows across Ethiopia,",
        20,
        currentY,
      );
      currentY += 6;
      doc.text(
        "we extend our heartfelt gratitude for your generous support and commitment to gender equality in journalism.",
        20,
        currentY,
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

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const isAnon =
    result.isAnonymous ||
    !result.email ||
    result.email.startsWith("anon.") ||
    result.email.startsWith("anonymous.") ||
    result.donorName === "Anonymous Supporter";

  return (
    <PageShell>
      {/* Custom Keyframe Styles for the Receipt Printer Machine */}
      <style>{`
        @keyframes thermalPrintFeed {
          0% {
            transform: translateY(-85%);
            clip-path: inset(0 0 88% 0);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-65%);
            clip-path: inset(0 0 65% 0);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-40%);
            clip-path: inset(0 0 40% 0);
            opacity: 0.95;
          }
          75% {
            transform: translateY(-15%);
            clip-path: inset(0 0 15% 0);
            opacity: 1;
          }
          100% {
            transform: translateY(0);
            clip-path: inset(0 0 0 0);
            opacity: 1;
          }
        }
        .animate-thermal-print {
          animation: thermalPrintFeed 1.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        @keyframes stampPopIn {
          0%, 60% {
            transform: scale(2.5) rotate(-30deg);
            opacity: 0;
          }
          85% {
            transform: scale(0.9) rotate(-10deg);
            opacity: 0.9;
          }
          100% {
            transform: scale(1) rotate(-12deg);
            opacity: 1;
          }
        }
        .animate-stamp-verified {
          animation: stampPopIn 2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt-card, #printable-receipt-card * {
            visibility: visible;
          }
          #printable-receipt-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

      <section className="py-12 md:py-20 bg-gradient-to-b from-primary/5 via-background to-background min-h-[90vh]">
        <div className="site-container max-w-5xl">
          {/* Top Success Banner */}
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 label-mono uppercase">
              <CheckCircle2 className="size-4" />
              <span>{t("Payment Successfully Verified", "ክፍያው በተሳካ ሁኔታ ተረጋግጧል")}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
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

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t(
                "Your contribution empowers women journalists with legal aid, safety resources, and investigative reporting grants across Ethiopia.",
                "ያደረጉት አስተዋጽዖ ለሴት ጋዜጠኞች ደህንነት፣ ለህግ ጥበቃ እና ለምርመራ ጋዜጠኝነት ስኮላርሺፕ በቀጥታ ይውላል።",
              )}
            </p>
          </div>

          {/* Main 2-Column Grid: Animated Receipt Dispenser + Impact & Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: The Receipt Printing Machine (7 Cols) */}
            <div className="lg:col-span-7">
              {/* POS Machine Dispenser Top Bar */}
              <div className="relative z-30 mx-auto w-[94%] rounded-t-2xl bg-neutral-900 dark:bg-neutral-950 px-5 py-3.5 shadow-2xl border-t border-x border-neutral-700">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {isPrinting ? (
                      <span className="size-2.5 rounded-full bg-amber-400 animate-ping" />
                    ) : (
                      <span className="size-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                    )}
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-200">
                      {isPrinting
                        ? t("PRINTING RECEIPT...", "ደረሰኝ በማተም ላይ...")
                        : t("EMWA RECEIPT DISPENSED", "የተረጋገጠ ደረሰኝ")}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleReplayPrint}
                    className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2.5 py-1 rounded-md border border-neutral-600 transition-colors cursor-pointer"
                    title={t("Replay Print Animation", "እንደገና አትም")}
                  >
                    <RotateCcw className="size-3" />
                    <span>{t("Re-print", "እንደገና")}</span>
                  </button>
                </div>
                {/* Physical Slit opening */}
                <div className="mt-2.5 h-1.5 w-full rounded-full bg-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]" />
              </div>

              {/* The Animated Receipt Paper rolling out from the slot */}
              <div
                key={printKey}
                className="relative z-10 -mt-1 animate-thermal-print origin-top overflow-hidden"
              >
                <div
                  id="printable-receipt-card"
                  className="rounded-b-3xl border-x-2 border-b-2 border-border/90 bg-card p-6 sm:p-9 shadow-[0_25px_60px_rgba(0,0,0,0.16)] relative overflow-hidden"
                >
                  {/* Subtle Background Watermark Stamp with pop-in animation */}
                  <div className="absolute right-4 top-1/3 border-4 border-emerald-500/30 text-emerald-600 dark:text-emerald-400/30 rounded-2xl px-5 py-2 pointer-events-none select-none animate-stamp-verified">
                    <span className="font-display font-extrabold text-2xl sm:text-3xl tracking-widest uppercase">
                      VERIFIED & PAID
                    </span>
                  </div>

                  {/* Receipt Header */}
                  <div className="flex items-start justify-between border-b-2 border-dashed border-border/80 pb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold font-display text-sm">
                          E
                        </div>
                        <span className="font-display font-bold text-base text-foreground tracking-tight">
                          ETHIOPIAN MEDIA WOMEN ASSOCIATION
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 label-mono">
                        {t("ACSO Registered CSO No. 0000 • Addis Ababa, Ethiopia", "በሲቪል ማህበረሰብ ድርጅቶች ባለስልጣን የተመዘገበ CSO")}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md label-mono uppercase">
                        <Check className="size-3" />
                        {t("Paid", "ተከፍሏል")}
                      </span>
                    </div>
                  </div>

                  {/* Main Amount Callout */}
                  <div className="py-6 border-b border-dashed border-border/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase label-mono text-muted-foreground font-semibold block mb-0.5">
                        {t("Amount Contributed", "የተበረከተው ድጋፍ መጠን")}
                      </span>
                      <div className="font-display text-3xl sm:text-4xl font-extrabold text-primary">
                        {result.amount ? `${result.amount.toLocaleString()} ${result.currency || "ETB"}` : "Confirmed"}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs uppercase label-mono text-muted-foreground font-semibold block mb-0.5">
                        {t("Payment Method", "የክፍያ መንገድ")}
                      </span>
                      <span className="text-sm font-semibold uppercase text-foreground font-mono">
                        {result.paymentMethod || "Chapa Secure Gateway"}
                      </span>
                    </div>
                  </div>

                  {/* Key Receipt Fields Table */}
                  <div className="py-5 border-b-2 border-dashed border-border/80 space-y-3 text-xs sm:text-sm font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground label-mono uppercase">{t("Transaction Ref", "የግብይት መለያ")}</span>
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <span className="truncate max-w-[180px] sm:max-w-[240px]">{result.txRef}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyTxRef(result.txRef || "")}
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                          title={t("Copy ID", "ቁጥሩን ቅዳ")}
                        >
                          {copiedTxRef ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground label-mono uppercase">{t("Date & Time", "ቀን እና ሰዓት")}</span>
                      <span className="text-foreground font-medium">
                        {result.date ? new Date(result.date).toLocaleString() : new Date().toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground label-mono uppercase">{t("Donor", "ደጋፊ")}</span>
                      <span className="text-foreground font-bold">
                        {isAnon
                          ? t("Anonymous Donor (Protected)", "ስም-አልባ ደጋፊ (የተጠበቀ)")
                          : result.donorName || "Valued Supporter"}
                      </span>
                    </div>

                    {!isAnon && result.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground label-mono uppercase">{t("Receipt Sent To", "ኢሜይል")}</span>
                        <span className="text-foreground">{result.email}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground label-mono uppercase">{t("Purpose", "አላማ")}</span>
                      <span className="text-foreground text-right">
                        {t("Women in Media & Safety Fund", "የሴት ጋዜጠኞች ደህንነት ፈንድ")}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleDownloadReceipt}
                      disabled={isDownloading}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Download className="size-4" />
                      <span>
                        {isDownloading
                          ? t("Generating...", "በማዘጋጀት ላይ...")
                          : t("Download PDF Receipt", "ደረሰኝ አውርድ (PDF)")}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3.5 text-xs sm:text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      <Printer className="size-4 text-muted-foreground" />
                      <span>{t("Print", "አትም")}</span>
                    </button>
                  </div>

                  {/* Micro Footer Notice */}
                  <div className="mt-5 text-center text-[10px] text-muted-foreground font-mono">
                    *** {t("OFFICIAL DONATION RECORD • KEEP FOR YOUR TAX RECORDS", "ህጋዊ የድጋፍ ሰነድ • ለግብር ቅነሳ መረጃዎ ይያዙት")} ***
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Impact Realized & Social Sharing (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Dynamic Impact Card */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-primary font-display font-bold text-lg">
                  <Sparkles className="size-5" />
                  <span>{t("What Your Gift Accomplishes", "የእርስዎ ድጋፍ የሚያመጣው ተጨባጭ ለውጥ")}</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t(
                    "Your generous donation directly funds emergency defense, hands-on newsroom fellowships, and regional safety kits for women journalists across Ethiopia.",
                    "ያደረጉት አስተዋጽዖ ለሴት ጋዜጠኞች ደህንነት፣ ለምርመራ ጋዜጠኝነት ስኮላርሺፕ እና ለክልል ጋዜጠኞች ድጋፍ በቀጥታ ይውላል።",
                  )}
                </p>

                <div className="space-y-2.5 pt-2 border-t border-border/80">
                  <div className="flex items-start gap-2.5 text-xs text-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{t("Direct emergency support for journalists under threat", "ለሴት ጋዜጠኞች የድንገተኛ ጊዜ ደህንነት ሽፋን")}</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{t("Digital security and investigative journalism masterclasses", "የምርመራ ጋዜጠኝነትና የዲጂታል ደህንነት ስልጠና")}</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{t("Community media mentorship across regional states", "በክልል ከተሞች ለሚገኙ ማህበረሰብ ሬዲዮዎች ድጋፍ")}</span>
                  </div>
                </div>
              </div>

              {/* 1-Click Share Hub */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-foreground font-display font-bold text-base">
                    <Share2 className="size-4 text-primary" />
                    <span>{t("Inspire Others to Support", "ሌሎች እንዲደግፉ ያጋሩ")}</span>
                  </div>
                  <span className="text-[10px] uppercase label-mono text-muted-foreground">{t("Spread Impact", "አጋራ")}</span>
                </div>

                <p className="text-xs text-muted-foreground">
                  {t(
                    "Encourage your network to stand with female reporters and media diversity in Ethiopia.",
                    "ጓደኞችዎ እና ማህበረሰብዎ ለሴት ጋዜጠኞች ድምፅ እንዲሆኑ ያበረታቱ።",
                  )}
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {/* Telegram */}
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-muted/30 transition-all text-xs font-semibold text-foreground group"
                  >
                    <Send className="size-4 text-[#229ED9] mb-1 group-hover:scale-110 transition-transform" />
                    <span>Telegram</span>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-muted/30 transition-all text-xs font-semibold text-foreground group"
                  >
                    <MessageSquare className="size-4 text-[#25D366] mb-1 group-hover:scale-110 transition-transform" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={handleShareClipboard}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-muted/30 transition-all text-xs font-semibold text-foreground group cursor-pointer"
                  >
                    {copiedShare ? (
                      <Check className="size-4 text-emerald-500 mb-1" />
                    ) : (
                      <Copy className="size-4 text-muted-foreground mb-1 group-hover:scale-110 transition-transform" />
                    )}
                    <span>{copiedShare ? t("Copied!", "ተቀድቷል!") : t("Copy Link", "ሊንኩን ቅዳ")}</span>
                  </button>
                </div>
              </div>

              {/* Next Steps: Membership & Programs */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/programs"
                  className="rounded-2xl border border-border bg-card p-4 hover:border-primary/50 transition-all group flex flex-col justify-between"
                >
                  <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Radio className="size-4" />
                  </div>
                  <div>
                    <span className="font-display text-xs font-bold text-foreground group-hover:text-primary transition-colors block">
                      {t("Our Programs", "ፕሮግራሞቻችን")}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      {t("Explore fellowships & hubs", "ስኮላርሺፖችን ይጎብኙ")}
                    </span>
                  </div>
                </Link>

                <Link
                  to="/membership"
                  className="rounded-2xl border border-border bg-card p-4 hover:border-primary/50 transition-all group flex flex-col justify-between"
                >
                  <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Users className="size-4" />
                  </div>
                  <div>
                    <span className="font-display text-xs font-bold text-foreground group-hover:text-primary transition-colors block">
                      {t("Join Network", "አባል ይሁኑ")}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      {t("400+ Media Professionals", "400+ የሚዲያ ባለሙያዎች")}
                    </span>
                  </div>
                </Link>
              </div>

              {/* Home Link */}
              <div className="pt-2 text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs font-bold label-mono uppercase text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>{t("Return to Homepage", "ወደ ዋናው ገጽ ተመለስ")}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
