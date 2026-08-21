import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Copy,
  CreditCard,
  Heart,
  HelpCircle,
  Radio,
  Shield,
  ShieldAlert,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";
import { initializeDonation } from "@/lib/donation.functions";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate & Support — EMWA" },
      {
        name: "description",
        content:
          "Support the Ethiopian Media Women Association. Your contribution empowers female journalists, provides safety legal funds, and enhances media diversity in Ethiopia.",
      },
      { property: "og:title", content: "Donate to EMWA — Ethiopian Media Women Association" },
      {
        property: "og:description",
        content:
          "Empower women journalists through training, emergency safety funds, and investigative reporting grants.",
      },
    ],
  }),
  component: DonatePage,
});

const PRESET_AMOUNTS = [
  { amount: 50, labelEn: "50 ETB", labelAm: "50 ብር", impactEn: "Community contribution", impactAm: "የማህበረሰብ ድጋፍ" },
  { amount: 100, labelEn: "100 ETB", labelAm: "100 ብር", impactEn: "Member support", impactAm: "የአባልነት ድጋፍ" },
  { amount: 500, labelEn: "500 ETB", labelAm: "500 ብር", impactEn: "Mentorship session kit", impactAm: "የአማካሪነት ድጋፍ" },
  { amount: 1000, labelEn: "1,000 ETB", labelAm: "1,000 ብር", impactEn: "Safety & legal resource access", impactAm: "የህግና ደህንነት ድጋፍ" },
  { amount: 2500, labelEn: "2,500 ETB", labelAm: "2,500 ብር", featured: true, impactEn: "Workshop seat & materials", impactAm: "የስልጠና እና ቁሳቁስ ድጋፍ" },
  { amount: 5000, labelEn: "5,000 ETB", labelAm: "5,000 ብር", impactEn: "Mini-reporting grant contribution", impactAm: "ለጋዜጠኝነት ስኮላርሺፕ" },
  { amount: 10000, labelEn: "10,000 ETB", labelAm: "10,000 ብር", impactEn: "Regional chapter safety toolkit", impactAm: "የክልል ቅርንጫፍ ድጋፍ" },
];

const BANK_ACCOUNTS = [
  {
    bankEn: "Commercial Bank of Ethiopia (CBE)",
    bankAm: "የኢትዮጵያ ንግድ ባንክ (CBE)",
    accountName: "Ethiopian Media Women Association",
    accountNumber: "1000123456789",
    branch: "Finfinne Branch, Addis Ababa",
  },
  {
    bankEn: "Awash Bank",
    bankAm: "አዋሽ ባንክ",
    accountName: "Ethiopian Media Women Association",
    accountNumber: "013208765432100",
    branch: "HQ Branch, Addis Ababa",
  },
  {
    bankEn: "Bank of Abyssinia (BOA)",
    bankAm: "የአቢሲኒያ ባንክ",
    accountName: "Ethiopian Media Women Association",
    accountNumber: "84729104",
    branch: "Legehar Branch, Addis Ababa",
  },
  {
    bankEn: "Electronic Merchant Account",
    bankAm: "የዲጂታል ክፍያ ሂሳብ",
    accountName: "EMWA Donation",
    accountNumber: "998877",
    branch: "Merchant Shortcode",
  },
];

const IMPACT_AREAS = [
  {
    icon: ShieldAlert,
    titleEn: "Journalist Safety & Legal Defense",
    titleAm: "የጋዜጠኞች ደህንነት እና የህግ ድጋፍ",
    descEn:
      "Rapid emergency assistance, psycho-social support, and legal representation for women journalists facing threats or harassment.",
    descAm:
      "ዛቻና ጥቃት ለሚደርስባቸው ሴት ጋዜጠኞች ፈጣን የድንገተኛ ጊዜ ድጋፍ፣ የስነ-ልቦና ምክር እና የህግ ጥበቃ ሽፋን መስጠት።",
  },
  {
    icon: Radio,
    titleEn: "Skills & Digital Media Hub",
    titleAm: "የዲጂታል ሚዲያ ክህሎት እና የስራ መሳሪያዎች",
    descEn:
      "Hands-on training in investigative reporting, digital security, podcasting, and modern newsroom technologies.",
    descAm:
      "በምርመራ ጋዜጠኝነት፣ በዲጂታል ደህንነት፣ በፖድካስት እና በዘመናዊ የዜና ክፍል ቴክኖሎጂዎች ላይ ተግባራዊ ስልጠና።",
  },
  {
    icon: Sparkles,
    titleEn: "Fellowships & Investigation Grants",
    titleAm: "የምርመራ ጋዜጠኝነት ስኮላርሺፕ እና ድጋፍ",
    descEn:
      "Direct financial stipends enabling women reporters to produce deep investigative stories on gender equity and public issues.",
    descAm:
      "ሴት ጋዜጠኞች በፆታ እኩልነት እና ማህበራዊ ጉዳዮች ላይ ጥልቅ የምርመራ ዘገባዎችን እንዲያዘጋጁ ቀጥተኛ የገንዘብ ድጋፍ።",
  },
  {
    icon: Users,
    titleEn: "Regional Grassroots Mentorship",
    titleAm: "የክልል ማህበረሰብ የሚዲያ ድጋፍ",
    descEn:
      "Extending peer networks, safety hubs, and professional mentorship to community broadcasters across all regional states.",
    descAm:
      "በሁሉም የክልል ከተሞች ለሚገኙ የማህበረሰብ ሬዲዮ እና ጋዜጠኞች የሙያ ማስተሳሰር እና የአማካሪነት ድጋፍ ማድረስ።",
  },
];

const FAQS = [
  {
    qEn: "How is my online donation processed?",
    qAm: "የኦንላይን ድጋፌ እንዴት ይከናወናል?",
    aEn:
      "Your donation is processed securely via 256-bit encrypted checkout supporting debit/credit cards and digital payment methods.",
    aAm:
      "ክፍያዎች ደህንነቱ በተጠበቀ ባለ 256-ቢት ኢንክሪፕሽን የኦንላይን ክፍያ ስርዓት አማካኝነት በካርድ እና በዲጂታል የክፍያ መንገዶች ይከናወናሉ።",
  },
  {
    qEn: "Can I donate from outside Ethiopia?",
    qAm: "ከኢትዮጵያ ውጭ ሆኜ መደገፍ እችላለሁ?",
    aEn:
      "Yes! International payment cards can be processed through our online gateway, or you can perform an international SWIFT wire transfer.",
    aAm:
      "አዎ! በአለም አቀፍ የክፍያ ካርዶች መደገፍ ይችላሉ ወይም በባንክ ዓለም አቀፍ የሃዋላ (SWIFT) ዝውውር ማድረግ ይቻላል።",
  },
  {
    qEn: "Will I receive an official receipt?",
    qAm: "ህጋዊ ደረሰኝ ማግኘት እችላለሁ?",
    aEn:
      "Yes. Every transaction automatically receives a digital receipt via email. For institutional and tax-deductible receipts, our finance office issues official ACSO-compliant receipts.",
    aAm:
      "አዎ። ለእያንዳንዱ ድጋፍ በኢሜይል ዲጂታል ደረሰኝ ይላክልዎታል። ለተቋማትም ህጋዊ የሲቪል ማህበረሰብ ድርጅቶች ባለስልጣን ደረሰኝ እንሰጣለን።",
  },
  {
    qEn: "Is EMWA a registered non-profit organization?",
    qAm: "ማህበሩ በህግ የተመዘገበ ህጋዊ መንግስታዊ ያልሆነ ድርጅት ነው?",
    aEn:
      "Yes. EMWA is a legally registered non-governmental, non-profit organization with the Ethiopian Authority for Civil Society Organizations (ACSO).",
    aAm:
      "አዎ። የኢትዮጵያ ሚዲያ ሴቶች ማህበር በኢትዮጵያ የሲቪል ማህበረሰብ ድርጅቶች ባለስልጣን በህግ የተመዘገበ መንግስታዊ ያልሆነ ለትርፍ ያልተቋቋመ ማህበር ነው።",
  },
];

function DonatePage() {
  const { language, t } = useLanguage();

  const [method, setMethod] = useState<"online" | "bank">("online");
  const [selectedAmount, setSelectedAmount] = useState<number>(2500);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleCopy = (accountNum: string, bankLabel: string) => {
    navigator.clipboard.writeText(accountNum);
    setCopiedAccount(accountNum);
    toast.success(`${bankLabel} ${t("account copied to clipboard", "የሂሳብ ቁጥር ተቀድቷል")}`);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const handleOnlineCheckout = async (e: FormEvent) => {
    e.preventDefault();
    if (effectiveAmount < 50) {
      toast.error(t("Minimum donation amount is 50 ETB", "ዝቅተኛው የድጋፍ መጠን 50 ብር ነው"));
      return;
    }
    if (!email || !firstName || !lastName) {
      toast.error(t("Please fill in required contact details", "እባክዎን አስፈላጊውን መረጃ ይሙሉ"));
      return;
    }

    setIsSubmitting(true);

    try {
      toast.info(
        t(
          `Connecting to secure checkout for ${effectiveAmount.toLocaleString()} ETB...`,
          `የ ${effectiveAmount.toLocaleString()} ብር ክፍያ እየተዘጋጀ ነው...`,
        ),
      );

      const result = await initializeDonation({
        data: {
          amount: effectiveAmount,
          email,
          firstName,
          lastName,
          phone,
          notes,
          isAnonymous,
          returnUrl: `${window.location.origin}/thank-you`,
        },
      });

      if (result.success && result.checkoutUrl) {
        if (typeof window !== "undefined") {
          if (result.txRef) sessionStorage.setItem("emwa_last_tx_ref", result.txRef);
          sessionStorage.setItem("emwa_last_amount", String(effectiveAmount));
          sessionStorage.setItem("emwa_last_donor_name", `${firstName} ${lastName}`.trim());
          sessionStorage.setItem("emwa_last_donor_email", email.trim());
        }
        const opened = window.open(result.checkoutUrl, "_blank", "noopener,noreferrer");
        if (!opened || opened.closed || typeof opened.closed === "undefined") {
          window.location.href = result.checkoutUrl;
        }
      } else {
        throw new Error(
          result.error ||
            t("Unable to initialize payment. Please try again.", "ክፍያውን ማከናወን አልተቻለም። እባክዎ እንደገና ይሞክሩ።"),
        );
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : t(
              "Unable to initialize payment. Please try again or use direct bank transfer.",
              "ክፍያውን ማከናወን አልተቻለም። እባክዎ እንደገና ይሞክሩ ወይም የባንክ ዝውውር ይጠቀሙ。",
            );
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 via-background to-background pt-16 pb-16 md:pt-24 md:pb-20">
        <div className="site-container relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary mb-6">
            <Heart className="size-3.5 fill-primary" />
            <span className="label-mono">{t("Support EMWA • Stand with Women in Media", "የኢትዮጵያ ሚዲያ ሴቶች ማህበርን ይደግፉ")}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Context and Story */}
            <div className="lg:col-span-5">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight text-foreground">
                {language === "am" ? (
                  <>
                    የሴት ጋዜጠኞችን ድምፅ <span className="italic text-primary">እናበርታ።</span> ለውጥን እናፋጥን።
                  </>
                ) : (
                  <>
                    Empower Women in Media. <span className="italic text-primary">Fuel Change.</span>
                  </>
                )}
              </h1>
              <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
                {t(
                  "For over 25 years, the Ethiopian Media Women Association (EMWA) has championed gender equality, investigative journalism, and safety for female media professionals across Ethiopia. Your contribution directly funds legal aid, training, and emergency defense.",
                  "ከ25 ዓመታት በላይ የኢትዮጵያ ሚዲያ ሴቶች ማህበር (EMWA) የፆታ እኩልነትን፣ የምርመራ ጋዜጠኝነትን እና የሴት ጋዜጠኞችን ደህንነት ሲደግፍ ቆይቷል። የእርስዎ ድጋፍ የህግ ድጋፍን፣ ስልጠናዎችን እና የድንገተኛ ጊዜ ጥበቃዎችን ያግዛል።",
                )}
              </p>

              {/* Quick Impact Highlight Badges */}
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-border/80 pt-6">
                <div>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-foreground">25+</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 label-mono">
                    {t("Years Active", "የዓመታት ተሟጋችነት")}
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-foreground">1.2K+</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 label-mono">
                    {t("Trained", "የሰለጠኑ")}
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-foreground">100%</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 label-mono">
                    {t("Direct Impact", "ቀጥተኛ ተፅዕኖ")}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Donation Card Main Interface */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-border/80 bg-card shadow-[0_24px_60px_rgba(0,0,0,0.12)] overflow-hidden backdrop-blur-md">
                {/* Method Switcher Header */}
                <div className="grid grid-cols-2 border-b border-border bg-muted/40 p-2 gap-2 text-xs sm:text-sm font-semibold label-mono">
                  <button
                    type="button"
                    onClick={() => setMethod("online")}
                    className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl transition-all cursor-pointer ${
                      method === "online"
                        ? "bg-background text-foreground shadow-sm font-bold border border-border/80"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <CreditCard className="size-4 text-primary" />
                    <span>{t("Online Payment", "በኦንላይን ይክፈሉ")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod("bank")}
                    className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl transition-all cursor-pointer ${
                      method === "bank"
                        ? "bg-background text-foreground shadow-sm font-bold border border-border/80"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Wallet className="size-4 text-primary" />
                    <span>{t("Bank Transfer", "የባንክ ሂሳቦች")}</span>
                  </button>
                </div>

                {/* Tab 1: Secure Online Donation */}
                {method === "online" && (
                  <form onSubmit={handleOnlineCheckout} className="p-8 sm:p-10 space-y-7">
                    {/* Amount Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-xs font-semibold text-muted-foreground label-mono uppercase">
                          {t("Select Donation Amount (ETB)", "የድጋፍ መጠን ይምረጡ (በብር)")}
                        </label>
                        {effectiveAmount > 0 && (
                          <span className="text-xs font-bold text-primary font-mono bg-primary/10 px-2.5 py-0.5 rounded-md">
                            {effectiveAmount.toLocaleString()} ETB
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {PRESET_AMOUNTS.map((p) => {
                          const isSelected = selectedAmount === p.amount && !customAmount;
                          return (
                            <button
                              key={p.amount}
                              type="button"
                              onClick={() => {
                                setSelectedAmount(p.amount);
                                setCustomAmount("");
                              }}
                              className={`relative rounded-2xl border-2 p-4 text-center transition-all cursor-pointer flex flex-col justify-center items-center gap-1 ${
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary ring-4 ring-primary/15 font-bold shadow-md"
                                  : "border-border bg-background hover:border-primary/50 text-foreground hover:bg-muted/30"
                              }`}
                            >
                              {p.featured && (
                                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground uppercase shadow-xs">
                                  {t("Popular", "ተመራጭ")}
                                </span>
                              )}
                              <span className="text-base sm:text-lg font-bold font-display block">
                                {language === "am" ? p.labelAm : p.labelEn}
                              </span>
                              <span className="text-[10px] text-muted-foreground/80 leading-tight block">
                                {language === "am" ? p.impactAm : p.impactEn}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Amount */}
                      <div className="mt-4">
                        <div className="relative">
                          <span className="absolute inset-y-0 left-4 flex items-center text-sm font-bold text-muted-foreground">
                            ETB
                          </span>
                          <input
                            type="number"
                            min="50"
                            step="50"
                            placeholder={t("Enter custom amount in ETB (min. 50)", "ብጁ መጠን ያስገቡ (ቢያንስ 50)...")}
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            className="w-full rounded-2xl border-2 border-border bg-background pl-16 pr-5 py-3.5 text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-hidden focus:ring-4 focus:ring-primary/15"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Donor Information */}
                    <div className="space-y-4 pt-4 border-t border-border/80">
                      <label className="block text-xs font-semibold text-muted-foreground label-mono uppercase">
                        {t("Donor Contact Details", "የእርስዎ የመገናኛ መረጃ")}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <input
                          type="text"
                          required
                          placeholder={t("First Name *", "ስም *")}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                        />
                        <input
                          type="text"
                          required
                          placeholder={t("Last Name *", "የአባት ስም *")}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <input
                          type="email"
                          required
                          placeholder={t("Email address for receipt *", "የኢሜይል አድራሻ ለደረሰኝ *")}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                        />
                        <input
                          type="tel"
                          placeholder={t("Phone number (optional)", "ስልክ ቁጥር (አማራጭ)")}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <textarea
                        rows={2}
                        placeholder={t("Add a message or dedication (optional)", "አጭር መልዕክት ወይም ማስታወሻ (አማራጭ)")}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />

                      <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="rounded-md border-border text-primary focus:ring-primary size-4.5"
                        />
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {t("Make this an anonymous donation", "ስሜ እንዳይገለጽ እፈልጋለሁ")}
                        </span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-primary px-8 py-4.5 font-bold text-primary-foreground text-base tracking-wide shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
                    >
                      <Heart className="size-5 fill-current" />
                      <span>
                        {isSubmitting
                          ? t("Connecting to secure checkout...", "ክፍያውን በማዘጋጀት ላይ...")
                          : language === "am"
                            ? `${effectiveAmount > 0 ? `${effectiveAmount.toLocaleString()} ብር` : ""} ይደግፉ`
                            : `Donate ${effectiveAmount > 0 ? `${effectiveAmount.toLocaleString()} ETB` : ""}`}
                      </span>
                      <ArrowRight className="size-5" />
                    </button>
                  </form>
                )}

                {/* Tab 2: Direct Bank Transfer */}
                {method === "bank" && (
                  <div className="p-8 sm:p-10 space-y-6">
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
                      <div className="flex gap-3 items-start">
                        <Shield className="size-5 text-primary shrink-0 mt-0.5" />
                        <div className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                          <strong className="text-foreground font-semibold block mb-1">
                            {t("Official EMWA Accounts", "ህጋዊ የ EMWA የባንክ ሂሳቦች")}
                          </strong>
                          {t(
                            "You can directly transfer to any of our registered accounts below. Please keep your transaction confirmation slip.",
                            "ከታች ወደ ተዘረዘሩት ማንኛውም ህጋዊ የባንክ ሂሳቦች ቀጥታ ገቢ ማድረግ ይችላሉ። የዝውውር ደረሰኙን እንዲይዙ በአክብሮት እናሳስባለን።",
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5">
                      {BANK_ACCOUNTS.map((bank) => (
                        <div
                          key={bank.accountNumber}
                          className="rounded-2xl border border-border bg-background p-5 hover:border-primary/40 transition-colors shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="text-sm sm:text-base font-bold text-foreground block">
                                {language === "am" ? bank.bankAm : bank.bankEn}
                              </span>
                              <span className="text-xs text-muted-foreground block mt-0.5">
                                {bank.accountName} • {bank.branch}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(bank.accountNumber, language === "am" ? bank.bankAm : bank.bankEn)
                              }
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted hover:border-primary/50 transition-colors label-mono text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                            >
                              {copiedAccount === bank.accountNumber ? (
                                <>
                                  <Check className="size-3.5 text-emerald-500" />
                                  <span className="text-emerald-500">{t("Copied", "ተቀድቷል")}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="size-3.5" />
                                  <span>{t("Copy", "ቅዳ")}</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="mt-3.5 flex items-center justify-between bg-muted/40 rounded-xl px-4 py-2.5 border border-border/60">
                            <span className="font-mono text-base sm:text-lg font-bold text-foreground tracking-wider">
                              {bank.accountNumber}
                            </span>
                            <span className="text-[11px] uppercase label-mono text-muted-foreground font-semibold">
                              {t("Account No", "የሂሳብ ቁጥር")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-border p-5 bg-muted/20 text-xs sm:text-sm text-muted-foreground space-y-2.5">
                      <p className="font-semibold text-foreground">
                        {t("Notify Us of Your Transfer:", "የባንክ ዝውውር መረጃዎን ያሳውቁን:")}
                      </p>
                      <p>
                        {t(
                          "After transferring, send your transaction reference or receipt to:",
                          "ዝውውሩን እንደፈጸሙ የደረሰኙን ኮፒ ወይም ማረጋገጫ በኢሜይል ይላኩልን:",
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2.5 font-mono text-xs sm:text-sm text-foreground font-semibold pt-1">
                        <span className="bg-background border border-border px-3 py-1.5 rounded-lg">
                          finance@ethmwa.org
                        </span>
                        <span className="bg-background border border-border px-3 py-1.5 rounded-lg">
                          +251 11 123 4567
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Security Notice */}
                <div className="border-t border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <BadgeCheck className="size-4 text-primary" />
                  <span>
                    {t(
                      "Registered Civil Society Organization under Ethiopian Law (ACSO No. 0000)",
                      "በኢትዮጵያ ሲቪል ማህበረሰብ ድርጅቶች ባለስልጣን በህግ የተመዘገበ",
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Areas Section */}
      <section className="py-20 border-b border-border bg-card/40">
        <div className="site-container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="label-mono text-primary text-xs uppercase tracking-wider mb-2">
              {t("Transparent Allocation", "ግልጽ እና ተጠያቂነት ያለው አጠቃቀም")}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground">
              {t("How your donation makes an impact", "የእርስዎ ድጋፍ የሚያመጣው ተጨባጭ ለውጥ")}
            </h2>
            <p className="mt-4 text-muted-foreground text-sm sm:text-base">
              {t(
                "Every Ethiopian Birr contributed to EMWA goes directly into high-impact initiatives advancing press freedom, female leadership, and journalist protection.",
                "ለማህበሩ የሚደረገው እያንዳንዱ ድጋፍ የፕሬስ ነፃነትን፣ የሴት አመራርን እና የጋዜጠኞችን ደህንነት ለማስጠበቅ በቀጥታ ይውላል።",
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {IMPACT_AREAS.map((area, index) => {
              const Icon = area.icon;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-background p-6 flex flex-col justify-between hover:border-primary/50 transition-all group"
                >
                  <div>
                    <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <Icon className="size-6" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                      {language === "am" ? area.titleAm : area.titleEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {language === "am" ? area.descAm : area.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 border-b border-border">
        <div className="site-container max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 text-primary text-xs label-mono uppercase mb-2">
              <HelpCircle className="size-4" />
              <span>{t("Donation FAQ", "ተደጋግመው የሚጠየቁ ጥያቄዎች")}</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-foreground">
              {t("Frequently Asked Questions", "የድጋፍ ጥያቄዎች እና መልሶች")}
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30"
              >
                <h3 className="font-display text-base sm:text-lg font-bold text-foreground mb-2">
                  {language === "am" ? faq.qAm : faq.qEn}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {language === "am" ? faq.aAm : faq.aEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="site-container text-center max-w-2xl">
          <h2 className="font-display text-3xl sm:text-4xl text-foreground">
            {t("Want to partner as an institution or sponsor?", "በተቋም ደረጃ አጋር ወይም ስፖንሰር መሆን ይፈልጋሉ?")}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t(
              "We collaborate with media houses, embassies, international development agencies, and civil society partners.",
              "ከሚዲያ ተቋማት፣ ኤምባሲዎች፣ ዓለም አቀፍ ድርጅቶች እና የሲቪል ማህበረሰብ አጋሮች ጋር በጋራ እንሰራለን።",
            )}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="bg-foreground text-background px-6 py-3 rounded-xl label-mono text-xs uppercase font-bold hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-md"
            >
              {t("Contact Partnerships Team", "የአጋርነት ቡድናችንን ያነጋግሩ")}
            </Link>
            <Link
              to="/membership"
              className="border border-border bg-background text-foreground px-6 py-3 rounded-xl label-mono text-xs uppercase font-bold hover:border-primary transition-all duration-300"
            >
              {t("Explore Membership", "የአባልነት መረጃ")}
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
