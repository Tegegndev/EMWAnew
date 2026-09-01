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
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { useLanguage } from "@/lib/language-context";
import { verifyDonation, type VerifyDonationResult } from "@/lib/donation.functions";
import { toast } from "sonner";
import logo from "@/assets/emwa-logo-new.png";

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
      { title: "Donation Receipt — Ethiopian Media Women Association" },
      { name: "description", content: "Thank you for supporting the Ethiopian Media Women Association." },
      { property: "og:title", content: "Donation Receipt — EMWA" },
    ],
  }),
  component: ThankYouPage,
});

function numberToWords(num: number): string {
  if (!num || isNaN(num)) return "Zero";
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const g = ["", "Thousand", "Million", "Billion"];

  function helper(n: number): string {
    if (n === 0) return "";
    if (n < 20) return a[n] + " ";
    if (n < 100) return b[Math.floor(n / 10)] + " " + (n % 10 !== 0 ? a[n % 10] + " " : "");
    return a[Math.floor(n / 100)] + " Hundred " + helper(n % 100);
  }

  let str = "";
  let i = 0;
  let temp = Math.floor(num);
  while (temp > 0) {
    const chunk = temp % 1000;
    if (chunk > 0) {
      str = helper(chunk) + g[i] + " " + str;
    }
    temp = Math.floor(temp / 1000);
    i++;
  }
  return (str.trim() || "Zero") + " Ethiopian Birr Only";
}

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
      `EMWA-${Date.now().toString().slice(-6)}`;

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
    toast.success(t("Transaction Reference copied!", "የደረሰኝ ቁጥር ተቀድቷል!"));
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
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a5" });

      const isAnon =
        result.isAnonymous ||
        !result.email ||
        result.email.startsWith("anon.") ||
        result.email.startsWith("anonymous.") ||
        result.donorName === "Anonymous Supporter";

      const amountStr = result.amount ? `${result.amount.toLocaleString()} ${result.currency || "ETB"}` : "N/A";
      const dateStr = result.date ? new Date(result.date).toLocaleDateString() : new Date().toLocaleDateString();

      // Top Red Wave Banner
      doc.setFillColor(140, 45, 60); // EMWA Burgundy/Red
      doc.rect(0, 0, 210, 22, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("ETHIOPIAN MEDIA WOMEN ASSOCIATION", 14, 12);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("OFFICIAL DONATION RECEIPT VOUCHER", 14, 18);

      // Receipt Badge in Header
      doc.setFillColor(255, 255, 255);
      doc.rect(160, 6, 35, 10, "F");
      doc.setTextColor(140, 45, 60);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("RECEIPT", 168, 13);

      // Body Section
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`No: ${result.txRef || "N/A"}`, 14, 34);
      doc.text(`Date: ${dateStr}`, 150, 34);

      // Fill lines
      let y = 46;
      doc.setFont("helvetica", "normal");
      doc.text("Received from:", 14, y);
      doc.setFont("helvetica", "bold");
      doc.text(isAnon ? "Anonymous Supporter (Protected)" : (result.donorName || "Valued Supporter"), 42, y);
      doc.setDrawColor(200, 200, 200);
      doc.line(40, y + 2, 195, y + 2);

      y += 12;
      doc.setFont("helvetica", "normal");
      doc.text("The sum of:", 14, y);
      doc.setFont("helvetica", "bold");
      doc.text(numberToWords(result.amount || 0), 42, y);
      doc.line(40, y + 2, 195, y + 2);

      y += 12;
      doc.setFont("helvetica", "normal");
      doc.text("For / Purpose:", 14, y);
      doc.setFont("helvetica", "bold");
      doc.text("Empowering Women in Ethiopian Media & Journalist Safety Fund", 42, y);
      doc.line(40, y + 2, 195, y + 2);

      // Amount Box on the right
      y += 12;
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(145, y - 4, 50, 16, 2, 2, "F");
      doc.setDrawColor(140, 45, 60);
      doc.setLineWidth(0.5);
      doc.roundedRect(145, y - 4, 50, 16, 2, 2, "D");

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("Amount:", 148, y + 2);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(140, 45, 60);
      doc.text(amountStr, 148, y + 9);

      // Signature line on the left
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "normal");
      doc.text("Authorized Signature:", 14, y + 6);
      doc.line(48, y + 8, 130, y + 8);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(16, 185, 129);
      doc.text("EMWA Finance Office (Digitally Verified)", 52, y + 6);

      // Bottom Red Stripe
      doc.setFillColor(140, 45, 60);
      doc.rect(0, 135, 210, 13, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Official Website: https://ethmwa.org  •  Email: finance@ethmwa.org", 14, 143);

      doc.save(`EMWA-Donation-Receipt-${result.txRef || "Receipt"}.pdf`);
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

  const dateObj = result.date ? new Date(result.date) : new Date();
  const dayStr = String(dateObj.getDate()).padStart(2, "0");
  const monthStr = String(dateObj.getMonth() + 1).padStart(2, "0");
  const yearStr = String(dateObj.getFullYear());

  return (
    <PageShell>
      {/* Custom Styles for Checkbook / Voucher Book Slip */}
      <style>{`
        @keyframes voucherSlideIn {
          0% {
            transform: translateY(-30px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-voucher-in {
          animation: voucherSlideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .book-spiral-binding {
          background: linear-gradient(90deg, #e5e7eb 0%, #ffffff 40%, #d1d5db 70%, #9ca3af 100%);
          box-shadow: inset -3px 0 6px rgba(0, 0, 0, 0.15), 4px 0 10px rgba(0, 0, 0, 0.08);
        }
        .dark .book-spiral-binding {
          background: linear-gradient(90deg, #374151 0%, #4b5563 40%, #1f2937 70%, #111827 100%);
          box-shadow: inset -3px 0 6px rgba(0, 0, 0, 0.4), 4px 0 10px rgba(0, 0, 0, 0.2);
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-voucher-card, #printable-voucher-card * {
            visibility: visible;
          }
          #printable-voucher-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

      <section className="py-12 md:py-20 bg-gradient-to-b from-primary/5 via-background to-background min-h-[90vh]">
        <div className="site-container max-w-6xl w-full">
          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Voucher Booklet Style Receipt (8 Cols) */}
            <div className="lg:col-span-8 animate-voucher-in w-full">
              {/* Receipt Voucher Booklet Main Card */}
              <div
                id="printable-voucher-card"
                className="relative flex flex-row rounded-2xl md:rounded-3xl border border-neutral-300 dark:border-neutral-700 bg-white text-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.14)] overflow-hidden w-full"
              >
                {/* Left Booklet Spine with Perforated Punch-Hole Dots */}
                <div className="flex flex-col items-center justify-between w-9 sm:w-11 book-spiral-binding shrink-0 py-6 border-r border-neutral-300 dark:border-neutral-700 relative z-20">
                  <div className="space-y-4.5 flex flex-col items-center">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="size-2.5 rounded-full bg-neutral-400 dark:bg-neutral-800 shadow-inner border border-neutral-500/40"
                      />
                    ))}
                  </div>
                </div>

                {/* Right Voucher Slip Main Paper */}
                <div className="flex-1 flex flex-col justify-between relative overflow-hidden min-w-0">
                  {/* Top Red Ribbon Curved Wave Accent */}
                  <div className="relative bg-[#8C2D3C] text-white pt-5 pb-7 px-5 sm:px-8">
                    {/* SVG Smooth Wave at the Bottom */}
                    <div className="absolute inset-x-0 bottom-0 overflow-hidden leading-none pointer-events-none">
                      <svg
                        viewBox="0 0 1200 120"
                        preserveAspectRatio="none"
                        className="relative block w-full h-4 sm:h-6 text-white fill-current"
                      >
                        <path d="M0,0 C150,60 400,60 600,30 C800,0 1050,40 1200,20 L1200,120 L0,120 Z" />
                      </svg>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Logo + Company Name */}
                      <div className="flex items-center gap-3">
                        <img
                          src={logo}
                          alt="EMWA Logo"
                          className="h-11 sm:h-13 w-auto object-contain bg-white rounded-lg p-1 shadow-sm shrink-0"
                        />
                        <div>
                          <h2 className="font-display font-extrabold text-base sm:text-lg text-white tracking-tight leading-tight">
                            Ethiopian Media Women Association
                          </h2>
                          <p className="text-[11px] text-rose-100 font-medium leading-tight mt-0.5">
                            Empowering Women in Media • Defending Press Freedom
                          </p>
                          <p className="text-[10px] text-rose-200 font-mono mt-0.5">
                            Addis Ababa, Ethiopia • info@ethmwa.org
                          </p>
                        </div>
                      </div>

                      {/* Red Box Badge: RECEIPT */}
                      <div className="self-end sm:self-center bg-white text-[#8C2D3C] px-5 py-1.5 rounded-md shadow-md">
                        <span className="font-display font-extrabold text-sm sm:text-base tracking-wider uppercase">
                          RECEIPT
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Big Thank You Banner Inside Voucher */}
                  <div className="px-5 sm:px-8 pt-4 pb-2 text-center border-b border-neutral-200/80 bg-rose-50/40">
                    <h1 className="font-display text-xl sm:text-2xl font-extrabold text-[#8C2D3C] tracking-tight">
                      {language === "am" ? "ለድጋፍዎ ከልብ እናመሰግናለን!" : "Thank You for Your Generous Support!"}
                    </h1>
                    <p className="text-xs text-neutral-600 mt-0.5 max-w-lg mx-auto">
                      {t(
                        "Your contribution directly fuels safety resources, legal defense, and grants for women journalists.",
                        "ያደረጉት አስተዋጽዖ ለሴት ጋዜጠኞች ደህንነት እና ለምርመራ ጋዜጠኝነት ስኮላርሺፕ በቀጥታ ይውላል።",
                      )}
                    </p>
                  </div>

                  {/* Voucher Body (Ledger Fill-in Lines) */}
                  <div className="p-5 sm:p-8 space-y-4">
                    {/* Top Row: No. + Date Box */}
                    <div className="flex items-center justify-between gap-4 pb-1">
                      {/* No. */}
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-xs sm:text-sm text-neutral-700">No.</span>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-xs sm:text-sm text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                          <span>{result.txRef}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyTxRef(result.txRef || "")}
                            className="text-neutral-500 hover:text-neutral-900 cursor-pointer p-0.5"
                            title="Copy Ref"
                          >
                            {copiedTxRef ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                          </button>
                        </div>
                      </div>

                      {/* 3-Cell Date Box matching Reference Layout */}
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-xs sm:text-sm text-neutral-700">Date</span>
                        <div className="flex border border-neutral-400 rounded overflow-hidden text-xs font-mono font-bold">
                          <span className="px-2 py-0.5 bg-neutral-100 border-r border-neutral-400 text-center" title="Day">
                            {dayStr}
                          </span>
                          <span className="px-2 py-0.5 bg-neutral-100 border-r border-neutral-400 text-center" title="Month">
                            {monthStr}
                          </span>
                          <span className="px-2 py-0.5 bg-neutral-100 text-center" title="Year">
                            {yearStr}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Main 2-Column Ledger & Amount Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-2">
                      {/* Left 8 Cols: Underline Fields */}
                      <div className="md:col-span-8 space-y-4 text-xs sm:text-sm">
                        {/* Received from */}
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-neutral-700 whitespace-nowrap">Received from</span>
                          <div className="flex-1 border-b-2 border-neutral-400 pb-0.5 px-2 font-bold text-neutral-900 truncate">
                            {isAnon ? "Anonymous Supporter (Protected)" : result.donorName || "Valued Supporter"}
                          </div>
                        </div>

                        {/* The sum of */}
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-neutral-700 whitespace-nowrap">The sum of</span>
                          <div className="flex-1 border-b-2 border-neutral-400 pb-0.5 px-2 font-medium text-neutral-800 text-xs truncate">
                            {numberToWords(result.amount || 0)}
                          </div>
                        </div>

                        {/* For / Purpose */}
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-neutral-700 whitespace-nowrap">For</span>
                          <div className="flex-1 border-b-2 border-neutral-400 pb-0.5 px-2 font-medium text-neutral-800 text-xs truncate">
                            {t("Women in Media & Safety Fund", "የሴት ጋዜጠኞች ደህንነት እና ሙያዊ ድጋፍ ፈንድ")}
                          </div>
                        </div>

                        {/* Signature */}
                        <div className="flex items-baseline gap-2 pt-2">
                          <span className="font-semibold text-neutral-700 whitespace-nowrap">Signature</span>
                          <div className="flex-1 border-b-2 border-neutral-400 pb-0.5 px-2 flex items-center justify-between">
                            <span className="font-serif italic font-bold text-[#8C2D3C] text-sm">
                              EMWA Finance Office
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
                              <BadgeCheck className="size-3" />
                              VERIFIED
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right 4 Cols: Amount Box & Payment Checkboxes */}
                      <div className="md:col-span-4 space-y-3">
                        {/* Amount Box */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-neutral-700">Amount:</span>
                          </div>
                          <div className="border-2 border-[#8C2D3C] rounded-xl p-2.5 bg-rose-50/50 text-center shadow-sm">
                            <span className="font-display font-black text-xl sm:text-2xl text-[#8C2D3C]">
                              {result.amount ? `${result.amount.toLocaleString()} ${result.currency || "ETB"}` : "2,500 ETB"}
                            </span>
                          </div>
                        </div>

                        {/* Payment Method Checkbox List (Exact checkbook style) */}
                        <div className="space-y-1.5 pt-1 text-xs text-neutral-700 font-medium">
                          <div className="flex items-center gap-2">
                            <div className="size-4 rounded border border-neutral-400 bg-[#8C2D3C] text-white flex items-center justify-center text-[10px]">
                              ✓
                            </div>
                            <span className="font-bold text-neutral-900">
                              {result.paymentMethod || "Online / Card"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-neutral-400">
                            <div className="size-4 rounded border border-neutral-300 bg-white" />
                            <span>Bank Transfer</span>
                          </div>

                          <div className="flex items-center gap-2 text-neutral-400">
                            <div className="size-4 rounded border border-neutral-300 bg-white" />
                            <span>Telebirr / CBE Birr</span>
                          </div>

                          <div className="flex items-center gap-2 text-neutral-400">
                            <div className="size-4 rounded border border-neutral-300 bg-white" />
                            <span>Other</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Red Bar with Website URL */}
                  <div className="bg-[#8C2D3C] text-white px-5 sm:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
                    <a
                      href="https://ethmwa.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold hover:underline flex items-center gap-1.5 text-white"
                    >
                      <span>Website: https://ethmwa.org</span>
                      <ExternalLink className="size-3" />
                    </a>
                    <span className="text-rose-200">Email: finance@ethmwa.org</span>
                  </div>
                </div>
              </div>

              {/* Actions Row Beneath Voucher */}
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  disabled={isDownloading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="size-4" />
                  <span>
                    {isDownloading
                      ? t("Generating...", "ደረሰኝ በማዘጋጀት ላይ...")
                      : t("Download Official PDF Receipt", "ኦፊሴላዊ ደረሰኝ አውርድ (PDF)")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3.5 text-xs sm:text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <Printer className="size-4 text-muted-foreground" />
                  <span>{t("Print Voucher", "ደረሰኝ አትም")}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Impact Realized & Social Sharing (4 Cols) */}
            <div className="lg:col-span-4 space-y-5">
              {/* Dynamic Impact Card */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-primary font-display font-bold text-lg">
                  <Sparkles className="size-5" />
                  <span>{t("What Your Gift Accomplishes", "የእርስዎ ድጋፍ የሚያመጣው ተጨባጭ ለውጥ")}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
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
                      {t("Programs", "ፕሮግራሞቻችን")}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      {t("Explore fellowships", "ስኮላርሺፖችን ይጎብኙ")}
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
                      {t("400+ Journalists", "400+ ጋዜጠኞች")}
                    </span>
                  </div>
                </Link>
              </div>

              {/* Home Link */}
              <div className="pt-1 text-center">
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
