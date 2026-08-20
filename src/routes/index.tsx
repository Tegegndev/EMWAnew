import { createFileRoute, Link } from "@tanstack/react-router";
import React, { type FormEvent, useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import YoutubeNewsFeed from "@/components/youtube-news-feed";
import OurMandate from "@/components/our-mandate";
import OurBlueprint from "@/components/our-blueprint";
import StrategicAlliances from "@/components/strategic-alliances";
import InspirationalQuotes from "@/components/inspirational-quotes";
import { CountUp } from "@/components/count-up";
import { useLanguage } from "@/lib/language-context";
import {
  ArrowUpRight,
  ArrowDown,
  Radio,
  Globe2,
  Newspaper,
  BookOpen,
  Landmark,
  Tv,
  ShieldCheck,
  Signal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageCircleQuestion,
} from "lucide-react";

// Landing-page placeholder images. Replace any `src` value here to update the
// corresponding image without changing the page layout.
const LANDING_IMAGES = {
  hero: {
    src: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1800&q=85",
    alt: "Confident African woman representing women working in media",
  },
} as const;

import { API_BASE } from "@/lib/admin-api";

const FAQS = [
  [
    "Who are members of EMWA?",
    <>A woman media practitioner with at least one year of experience in media and communication is eligible to become a Full Member of the Association. Interested applicants must complete the <Link to="/membership" hash="apply">Registration Form</Link> to express their intent. Upon approval by EMWA, the applicant is required to pay the membership fee, a formal commitment that signifies active participation and support for the Association&apos;s mission.</>,
  ],
  [
    "Can men join EMWA?",
    <>Yes. Men may join as Associate Members. They must complete the <Link to="/membership" hash="apply">Registration Form</Link> to apply. Once EMWA reviews and approves the application, payment of the membership fee is required.</>,
  ],
  ["Does EMWA have branch offices?", "No. EMWA operates through elected members organized under committees, who serve as the link between members and the Association. Once committee members are elected, they serve for at least two consecutive years."],
  ["What is EMWA's structure?", "The General Assembly is the highest decision-making body, convening annually. It elects a seven-member Executive Board, composed exclusively of women. The Executive Board serves a minimum term of two consecutive years."],
  ["Can men be employed at EMWA?", "Yes. Except for the Executive Board and the Executive Directress, all other positions are open to both men and women."],
] as const;

const AMHARIC_FAQS = [
  ["የEMWA አባላት እነማን ናቸው?", "በሚዲያና ኮሙኒኬሽን ሙያ ቢያንስ የአንድ ዓመት ልምድ ያላት ሴት የማህበሩ ሙሉ አባል ለመሆን ብቁ ናት። አመልካቾች የምዝገባ ቅጹን መሙላት አለባቸው። ማመልከቻው በEMWA ከጸደቀ በኋላ የአባልነት ክፍያ ይፈጸማል።"],
  ["ወንዶች EMWAን መቀላቀል ይችላሉ?", "አዎ። ወንዶች ተባባሪ አባላት ሆነው መቀላቀል ይችላሉ። የምዝገባ ቅጹን ሞልተው ካመለከቱና በEMWA ከጸደቀ በኋላ የአባልነት ክፍያ ይፈጽማሉ።"],
  ["EMWA ቅርንጫፍ ጽሕፈት ቤቶች አሉት?", "የሉትም። EMWA በኮሚቴዎች ሥር በተደራጁ በተመረጡ አባላት አማካይነት ይሠራል። እነዚህ አባላት በአባላትና በማህበሩ መካከል ድልድይ ሆነው ቢያንስ ለሁለት ተከታታይ ዓመታት ያገለግላሉ።"],
  ["የEMWA መዋቅር ምንድን ነው?", "በየዓመቱ የሚሰበሰበው ጠቅላላ ጉባኤ የማህበሩ ከፍተኛው ውሳኔ ሰጪ አካል ነው። ጉባኤው ሰባት ሴቶችን ያካተተ ሥራ አስፈጻሚ ቦርድ ይመርጣል። ቦርዱ ቢያንስ ለሁለት ተከታታይ ዓመታት ያገለግላል።"],
  ["ወንዶች በEMWA ተቀጥረው መሥራት ይችላሉ?", "አዎ። ከሥራ አስፈጻሚ ቦርድና ከሥራ አስፈጻሚ ዳይሬክተር ሹመት በስተቀር ሌሎች የሥራ መደቦች ለሴቶችና ለወንዶች ክፍት ናቸው።"],
] as const;

export const Route = createFileRoute("/")({
  component: Home,
});

const STATS = [
  { value: 1200, suffix: "+", label: "Active Members", labelAm: "ንቁ አባላት", color: "text-primary" },
  { value: 12, suffix: "", label: "Regional Chapters", labelAm: "የክልል ቅርንጫፎች", color: "text-secondary" },
  { value: 450, suffix: "", label: "Trained Journalists", labelAm: "የሰለጠኑ ጋዜጠኞች", color: "text-accent" },
  { value: 25, suffix: "+", label: "Year Legacy", labelAm: "ዓመታት ታሪክ", color: "" },
];

type HomeExpert = {
  id: string;
  name: string;
  field: string;
  region: string;
  image?: string;
};

type HomeUpdate = {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
};

type HeroSlide = {
  id?: string;
  img: string;
  title?: string;
  titleAm?: string;
  description?: string;
  descriptionAm?: string;
  text: string;
  textAm: string;
  signoff?: string;
  signoffAm?: string;
  author: string;
  role: string;
  roleAm: string;
};

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    img: "/Fitsum%20Alemayehu.png",
    title: "A legacy of service.",
    titleAm: "የአገልግሎት ውርስ።",
    description: "Fitsum Alemayehu, the first president of EMWA, served the association with diligence and competence for which it is forever grateful.",
    descriptionAm: "የEMWA የመጀመሪያዋ ፕሬዝዳንት ፍጹም ዓለማየሁ ማህበሩን በትጋትና በብቃት ያገለገሉ ሲሆን ማህበሩ ዘወትር ምስጋናውን ያቀርባል።",
    text: "I have many happy memories in Ethiopia and sad to leave. But, I am saddened most because I will miss being part of EMWA.",
    textAm: "በኢትዮጵያ ውስጥ ብዙ አስደሳች ትዝታዎች አሉኝ፤ በመለየቴም አዝናለሁ። ይሁን እንጂ ከሁሉ በላይ የሚያሳዝነኝ የEMWA አካል መሆኔ ስለሚቀር ነው።",
    signoff: "EMWA extends its gratitude to Wzo. Fitsum and wishes her success and all the best.",
    signoffAm: "EMWA ለወ/ሮ ፍጹም ያለውን ልባዊ ምስጋና እያቀረበ ስኬትና መልካሙን ሁሉ ይመኛል።",
    author: "Fitsum Alemayehu",
    role: "Founding leadership",
    roleAm: "የመሥራች አመራር",
  },
];

function HomeHero({ t, language }: { t: (english: string, amharic: string) => string; language: string }) {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [loopKey, setLoopKey] = useState(0);
  const INTERVAL_MS = 4500; // 4.5 seconds per slide (faster auto-rotation)
  const EXIT_MS     = 350;  // fast crisp transition

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(`${API_BASE}/public/hero-slides?_t=${Date.now()}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = await response.json();
        if (payload.success && Array.isArray(payload.data) && payload.data.length > 0) {
          const apiOrigin = new URL(API_BASE).origin;
          const fetchedSlides: HeroSlide[] = payload.data.map((row: Record<string, unknown>) => {
            const rawImg = String(row.imageUrl ?? row.image_url ?? "");
            let img = rawImg;
            try {
              if (rawImg.startsWith("/uploads/")) {
                img = `${apiOrigin}${rawImg}`;
              } else if (!rawImg.startsWith("http://") && !rawImg.startsWith("https://") && !rawImg.startsWith("/")) {
                img = `${apiOrigin}/${rawImg}`;
              }
            } catch {
              img = rawImg;
            }
            return {
              id: String(row.id ?? ""),
              img: img || "/Fitsum%20Alemayehu.png",
              title: row.title ? String(row.title) : undefined,
              titleAm: (row.titleAm ?? row.title_am) ? String(row.titleAm ?? row.title_am) : undefined,
              description: (row.description ?? row.description_text) ? String(row.description ?? row.description_text) : undefined,
              descriptionAm: (row.descriptionAm ?? row.description_am) ? String(row.descriptionAm ?? row.description_am) : undefined,
              text: String(row.text ?? row.quote ?? ""),
              textAm: String(row.textAm ?? row.text_am ?? row.quote_am ?? row.text ?? ""),
              signoff: (row.signoff ?? row.signoff_text) ? String(row.signoff ?? row.signoff_text) : undefined,
              signoffAm: (row.signoffAm ?? row.signoff_am) ? String(row.signoffAm ?? row.signoff_am) : undefined,
              author: String(row.author ?? "EMWA"),
              role: String(row.role ?? row.position ?? "Founding leadership"),
              roleAm: String(row.roleAm ?? row.role_am ?? row.role ?? "የመሥራች አመራር"),
            };
          });
          setSlides(fetchedSlides);
        }
      } catch {
        // Fallback to default slides on error
      }
    })();
    return () => controller.abort();
  }, []);

  const activeSlides = slides.length > 0 ? slides : DEFAULT_HERO_SLIDES;
  const currentSlide = activeSlides[slideIndex % activeSlides.length];

  const goToSlide = (nextIndex: number) => {
    if (isExiting || nextIndex === slideIndex) return;
    setIsExiting(true);
    setTimeout(() => {
      setSlideIndex((nextIndex + activeSlides.length) % activeSlides.length);
      setIsExiting(false);
      setLoopKey((k) => k + 1);
    }, EXIT_MS);
  };

  useEffect(() => {
    if (!autoPlay || activeSlides.length <= 1) return;
    const id = setInterval(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsExiting(false);
        setSlideIndex((i) => (i + 1) % activeSlides.length);
        setLoopKey((k) => k + 1);
      }, EXIT_MS);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [activeSlides.length, autoPlay]);

  // ── Premium easing curves ──────────────────────────────────────────────────
  const EASE_ENTER = "cubic-bezier(0.16, 1, 0.3, 1)";
  const EASE_EXIT  = "cubic-bezier(0.7, 0, 1, 0.6)";

  const exitTransition = isExiting
    ? `opacity ${EXIT_MS}ms ${EASE_EXIT}, transform ${EXIT_MS}ms ${EASE_EXIT}, filter ${EXIT_MS}ms ${EASE_EXIT}`
    : "none";

  const imgStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    objectPosition: "center",
    padding: "clamp(1rem, 2.5vw, 2.5rem)",
    opacity:   isExiting ? 0 : 1,
    transform: isExiting ? "scale(0.94)" : "scale(1)",
    filter:    isExiting ? "blur(6px) saturate(0.4)" : "blur(0px) saturate(1)",
    transition: exitTransition,
    animation: isExiting
      ? "none"
      : `hero-enter-img 0.9s ${EASE_ENTER} both, ken-burns 16s ease-in-out 0.9s infinite alternate`,
    willChange: "transform, opacity, filter",
  };

  const textStyle: React.CSSProperties = {
    opacity:    isExiting ? 0 : 1,
    transform:  isExiting ? "translateY(-16px) scale(0.98)" : "translateY(0) scale(1)",
    filter:     isExiting ? "blur(3px)" : "blur(0px)",
    transition: exitTransition,
    animation:  isExiting ? "none" : `hero-enter-text 0.9s ${EASE_ENTER} both`,
  };

  return (
    <>
      <style>{`
        @keyframes hero-enter-img {
          0%   { opacity: 0; transform: scale(1.06) translateY(8px);  filter: blur(8px) saturate(0.3); }
          60%  { opacity: 1; filter: blur(1px) saturate(0.85); }
          100% { opacity: 1; transform: scale(1)    translateY(0);    filter: blur(0px) saturate(1); }
        }

        @keyframes hero-enter-text {
          0%   { opacity: 0; transform: translateY(20px) scale(0.97); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0px); }
        }

        @keyframes ken-burns {
          0%   { transform: scale(1.00) translate(0,     0);    }
          25%  { transform: scale(1.04) translate(-0.8%, 0.3%); }
          50%  { transform: scale(1.06) translate(0.3%,  -0.6%);}
          75%  { transform: scale(1.04) translate(-0.4%, 0.5%); }
          100% { transform: scale(1.07) translate(0.2%,  0.8%); }
        }

        @keyframes hero-progress {
          from { width: 0; }
          to   { width: 100%; }
        }
        @keyframes progress-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .hero-progress-bar {
          display: block; height: 100%; width: 0;
          background: linear-gradient(
            90deg,
            var(--color-primary, #8c2d3c) 0%,
            color-mix(in srgb, var(--color-primary, #8c2d3c) 60%, #e9a84c) 50%,
            var(--color-primary, #8c2d3c) 100%
          );
          background-size: 200% 100%;
          animation:
            hero-progress ${INTERVAL_MS}ms linear forwards,
            progress-shimmer 2.5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-progress-bar { animation: none; width: 100%; }
        }
      `}</style>

      <section
        className="home-hero-slider relative group"
        aria-label="EMWA Hero Slider"
        onMouseEnter={() => setAutoPlay(false)}
        onMouseLeave={() => setAutoPlay(true)}
      >
        {/* Image / Visual Side */}
        <div
          className="home-hero-visual relative"
          style={{ background: "linear-gradient(145deg, #171310, #2b211b)" }}
        >
          <img
            key={loopKey}
            src={currentSlide.img}
            alt={currentSlide.author || "EMWA"}
            width={1200}
            height={1600}
            style={imgStyle}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/Fitsum%20Alemayehu.png";
            }}
          />

          {/* Slide Arrow Navigation Overlay */}
          {activeSlides.length > 1 && (
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20">
              <button
                type="button"
                onClick={() => goToSlide(slideIndex - 1)}
                aria-label="Previous hero slide"
                className="pointer-events-auto size-10 rounded-full bg-black/40 hover:bg-[#8c2d3c] text-white flex items-center justify-center backdrop-blur-sm transition-all duration-300 shadow-lg border border-white/10 opacity-70 group-hover:opacity-100"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => goToSlide(slideIndex + 1)}
                aria-label="Next hero slide"
                className="pointer-events-auto size-10 rounded-full bg-black/40 hover:bg-[#8c2d3c] text-white flex items-center justify-center backdrop-blur-sm transition-all duration-300 shadow-lg border border-white/10 opacity-70 group-hover:opacity-100"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          )}
        </div>

        {/* Text Copy Side */}
        <div
          key={loopKey}
          className="home-hero-copy relative"
          style={textStyle}
          aria-live="polite"
        >
          <p className="label-mono text-primary">
            EMWA legacy · {language === "am" ? (currentSlide.roleAm || currentSlide.role) : currentSlide.role}
          </p>

          <h1 className="is-tribute">
            {language === "am"
              ? (currentSlide.titleAm || currentSlide.title || "የአገልግሎት ውርስ።")
              : (currentSlide.title || "A legacy of service.")}
          </h1>

          {currentSlide.description && (
            <p className="home-hero-tribute">
              {language === "am" ? (currentSlide.descriptionAm || currentSlide.description) : currentSlide.description}
            </p>
          )}

          {currentSlide.text && (
            <blockquote>
              &ldquo;{language === "am" ? (currentSlide.textAm || currentSlide.text) : currentSlide.text}&rdquo;
            </blockquote>
          )}

          {currentSlide.signoff && (
            <p className="home-hero-signoff">
              {language === "am" ? (currentSlide.signoffAm || currentSlide.signoff) : currentSlide.signoff}
            </p>
          )}

          <div className="home-hero-actions">
            <Link to="/membership">{t("Become a member", "አባል ይሁኑ")} <ArrowUpRight /></Link>
            <Link to="/programs">{t("Explore programs", "ፕሮግራሞችን ይመልከቱ")}</Link>
          </div>

          {/* Dots Indicator */}
          {activeSlides.length > 1 && (
            <div className="flex items-center gap-2 mt-4 pt-2">
              {activeSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 transition-all duration-300 rounded-full ${
                    idx === slideIndex % activeSlides.length
                      ? "w-8 bg-[#8c2d3c]"
                      : "w-2 bg-black/20 hover:bg-black/40"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Progress bar */}
          <div
            aria-hidden="true"
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: "rgb(255 255 255 / 8%)", overflow: "hidden" }}
          >
            <span key={loopKey} className="hero-progress-bar" />
          </div>
        </div>

      </section>
    </>
  );
}

function Home() {
  const { language, t } = useLanguage();
  const [newsletterStatus, setNewsletterStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [experts, setExperts] = useState<HomeExpert[]>([]);
  const [expertsLoading, setExpertsLoading] = useState(true);
  const [updates, setUpdates] = useState<HomeUpdate[]>([]);
  const [updatesLoading, setUpdatesLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(`${API_BASE}/public/experts`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load experts");
        const payload = await response.json();
        const apiOrigin = new URL(API_BASE).origin;
        const rows = Array.isArray(payload?.data) ? payload.data : [];
        setExperts(
          rows.map((row: Record<string, unknown>) => {
            const photo = String(row.profile_photo_url ?? "");
            return {
              id: String(row.id),
              name: String(row.full_name ?? "EMWA expert"),
              field: String(row.professional_title ?? row.primary_expertise ?? "Media expert"),
              region: String(row.location ?? "Ethiopia"),
              image: photo
                ? `${apiOrigin}${new URL(photo, apiOrigin).pathname}`
                : undefined,
            };
          }),
        );
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setExperts([]);
      } finally {
        if (!controller.signal.aborted) setExpertsLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(`${API_BASE}/public/updates?page=1&limit=3&type=NEWS`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load updates");
        const payload = await response.json();
        const rows = Array.isArray(payload?.data) ? payload.data : [];
        setUpdates(
          rows.map((row: Record<string, unknown>) => ({
            slug: String(row.slug),
            date: new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(new Date(String(row.published_at ?? row.created_at))),
            title: String(row.title ?? "EMWA update"),
            excerpt: String(row.excerpt ?? ""),
          })),
        );
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setUpdates([]);
      } finally {
        if (!controller.signal.aborted) setUpdatesLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const subscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setNewsletterStatus("submitting");
    setNewsletterMessage("");
    const form = new FormData(formElement);
    const email = String(form.get("email") ?? "").trim();

    try {
      const response = await fetch(`${API_BASE}/public/newsletter-subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Unable to subscribe right now.");
      }
      setNewsletterStatus("success");
      setNewsletterMessage("You’re subscribed to The Narrative Shift.");
      formElement.reset();
    } catch (error) {
      setNewsletterStatus("error");
      setNewsletterMessage(error instanceof Error ? error.message : "Unable to subscribe.");
    }
  };

  return (
    <PageShell>
      {/* HERO */}
      <HomeHero t={t} language={language} />
      {false && (
        <section className="relative flex flex-col md:flex-row min-h-[calc(100svh-65px)] border-b border-border">
          <div className="md:w-7/12 relative order-2 md:order-1 overflow-hidden min-h-[42svh] md:min-h-0 bg-muted">
            <img
              src={LANDING_IMAGES.hero.src}
              alt={LANDING_IMAGES.hero.alt}
              width={1800}
              height={1200}
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] hover:scale-[1.02]"
            />
          </div>
          <div className="md:w-5/12 flex flex-col justify-center px-5 py-14 sm:px-8 md:p-12 lg:p-16 xl:p-20 order-1 md:order-2">
            <p className="label-mono text-primary mb-6 animate-reveal">{t("Est. 1998 · Addis Ababa", "ተመሠረተ 1998 · አዲስ አበባ")}</p>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.88] tracking-tighter mb-7 md:mb-8 text-balance animate-reveal">
              {t("The Voice", "የኢትዮጵያ")}<br />
              {t("of Ethiopia's", "ፈር ቀዳጅ")}<br />
              <span className="text-secondary">{t("Vanguard", "የሴቶች ድምፅ")}</span>
            </h1>
            <p className="text-lg leading-snug max-w-md text-muted-foreground animate-reveal">
              {t(
                "Empowering Ethiopian women in media through strategic advocacy, professional development, and a collective roar that echoes across the Horn of Africa.",
                "በስትራቴጂያዊ ቅስቀሳ፣ በሙያ ማበልጸግና በጋራ ድምፅ በሚዲያ ውስጥ የሚሠሩ ኢትዮጵያዊ ሴቶችን እናበረታታለን።",
              )}
            </p>
            <div className="mt-10 flex flex-wrap gap-3 animate-reveal">
              <Link
                to="/membership"
                className="bg-foreground text-background px-6 py-3 label-mono hover:bg-primary transition-colors inline-flex items-center gap-2"
              >
                {t("Become a member", "አባል ይሁኑ")} <ArrowUpRight className="size-3" />
              </Link>
              <Link
                to="/programs"
                className="border border-foreground px-6 py-3 label-mono hover:bg-foreground hover:text-background transition-colors"
              >
                {t("Explore programs", "ፕሮግራሞችን ይመልከቱ")}
              </Link>
            </div>
            <div className="mt-10 lg:mt-16 hidden md:flex items-center gap-3 label-mono text-muted-foreground animate-reveal">
              <ArrowDown className="size-3 animate-bounce" /> {t("Scroll", "ወደ ታች ይሂዱ")}
            </div>
          </div>
        </section>
      )}

      {/* WOMEN NEWS FEED (YouTube) */}
      <YoutubeNewsFeed />

      {/* STATS */}
      <section className="py-20 border-y border-border">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-10">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className={`font-display text-6xl md:text-7xl ${s.color}`}>
                <CountUp end={s.value} suffix={s.suffix} />
              </div>
              <div className="label-mono mt-3">{language === "am" ? s.labelAm : s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* OUR MANDATE */}
      <OurMandate />

      {/* BLUEPRINT / TIMELINE */}
      <OurBlueprint />

      {/* EXPERTS SPOTLIGHT */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <p className="label-mono text-primary mb-4">{t("Experts Directory", "የባለሙያዎች ማውጫ")}</p>
              <h2 className="font-display text-5xl md:text-7xl tracking-tighter leading-none">
                {t("Women who move", "የኢትዮጵያን ሚዲያ")}<br />
                {t("Ethiopian media forward.", "ወደፊት የሚያራምዱ ሴቶች።")}
              </h2>
            </div>
            <Link
              to="/experts"
              className="label-mono border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-all"
            >
              {experts.length
                ? t(`View all ${experts.length} experts`, `${experts.length} ባለሙያዎችን ይመልከቱ`)
                : t("Explore the directory", "ማውጫውን ያስሱ")} →
            </Link>
          </div>
          {expertsLoading ? (
            <div className="grid gap-8 md:grid-cols-3 md:gap-12" aria-label="Loading experts">
              {[0, 1, 2].map((item) => (
                <div key={item} className="animate-pulse">
                  <div className="mb-6 aspect-[4/5] bg-muted" />
                  <div className="h-8 w-2/3 bg-muted" />
                  <div className="mt-3 h-3 w-1/2 bg-muted" />
                </div>
              ))}
            </div>
          ) : experts.length ? (
            <div className="grid gap-8 md:grid-cols-3 md:gap-12">
              {experts.slice(0, 3).map((expert) => (
                <Link
                  to="/experts"
                  key={expert.id}
                  className="group block cursor-pointer no-underline"
                >
                  <div className="relative mb-6 grid aspect-[4/5] overflow-hidden bg-muted">
                    <span className="m-auto font-display text-7xl text-primary/35">
                      {expert.name
                        .split(" ")
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    {expert.image && (
                      <img
                        src={expert.image}
                        alt={expert.name}
                        loading="lazy"
                        width={800}
                        height={1000}
                        className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
                        onError={(event) => event.currentTarget.remove()}
                      />
                    )}
                  </div>
                  <h3 className="font-display text-3xl transition-colors group-hover:text-primary">
                    {expert.name}
                  </h3>
                  <p className="label-mono mt-2 text-primary">
                    {expert.field} / {expert.region}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-border bg-muted/30 px-8 py-14 text-center md:px-14">
              <p className="label-mono text-primary">{t("The directory is growing", "ማውጫው እያደገ ነው")}</p>
              <h3 className="mt-4 font-display text-4xl">{t("Be among the voices featured here.", "እዚህ ከሚቀርቡ ድምፆች አንዷ ይሁኑ።")}</h3>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                {t(
                  "Approved women experts will appear here automatically. Submit your professional profile to join Ethiopia's trusted media expert directory.",
                  "የጸደቀላቸው ሴት ባለሙያዎች እዚህ ይታያሉ። የሙያ መገለጫዎን በማስገባት የኢትዮጵያን ታማኝ የሚዲያ ባለሙያዎች ማውጫ ይቀላቀሉ።",
                )}
              </p>
              <Link
                to="/experts"
                className="mt-8 inline-flex border border-foreground px-6 py-3 label-mono transition-colors hover:border-primary hover:bg-primary hover:text-white"
              >
                {t("Join the expert directory", "የባለሙያዎች ማውጫውን ይቀላቀሉ")} <ArrowUpRight className="ml-2 size-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* NEWS */}
      <section className="py-24 md:py-32 bg-muted/40 border-y border-border">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <p className="label-mono text-primary mb-4">{t("Latest Dispatches", "የቅርብ ጊዜ መረጃዎች")}</p>
              <h2 className="font-display text-5xl md:text-7xl tracking-tighter leading-none">
                {t("Newsroom", "የዜና ክፍል")}
              </h2>
            </div>
            <Link
              to="/updates"
              hash="news"
              className="label-mono border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-all"
            >
              {t("All stories", "ሁሉም ታሪኮች")} →
            </Link>
          </div>
          {updates.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-px bg-border">
              {updates.map((n) => (
                <a
                  key={n.slug}
                  href={`/updates?story=${encodeURIComponent(n.slug)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block no-underline"
                >
                  <article className="h-full bg-background p-8 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex justify-between label-mono text-muted-foreground mb-6">
                      <span>{n.date}</span>
                      <span className="text-primary">Update</span>
                    </div>
                    <h3 className="font-display text-2xl leading-tight mb-4">{n.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{n.excerpt}</p>
                    <div className="mt-6 label-mono inline-flex items-center gap-1 group text-primary font-bold">
                      {t("Read", "ያንብቡ")}{" "}
                      <ArrowUpRight className="size-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </article>
                </a>
              ))}
            </div>
          ) : (
            <div className="border border-border bg-background px-8 py-12 text-center text-muted-foreground">
              {updatesLoading ? "Loading the latest updates…" : "No published updates yet."}
            </div>
          )}
        </div>
      </section>

      {/* STRATEGIC ALLIANCES */}
      <StrategicAlliances />

      {/* NEWSLETTER */}
      <section className="nl-section" id="newsletter" aria-labelledby="nl-heading">
        {/* Decorative background word */}
        <span className="nl-bg-word" aria-hidden="true">
          DISPATCH
        </span>

        <div className="nl-inner">
          {/* Left: copy */}
          <div className="nl-left">
            <p className="nl-eyebrow">{t("The Narrative Shift", "የትርክት ለውጥ")}</p>
            <h2 className="nl-heading" id="nl-heading">
              {t("Monthly insights", "ከአፍሪካ ቀንድ")}<br />
              {t("from the Horn.", "ወርሃዊ ምልከታዎች።")}
            </h2>
            <p className="nl-body">
              {t(
                "A curated dispatch on media, gender, and policy across Ethiopia and East Africa — straight to your inbox.",
                "በኢትዮጵያና በምሥራቅ አፍሪካ ሚዲያ፣ ፆታና ፖሊሲን የሚመለከት የተመረጠ መረጃ በቀጥታ ወደ ኢሜይልዎ።",
              )}
            </p>
          </div>

          {/* Right: form */}
          <div className="nl-right">
            <form className="nl-form" onSubmit={subscribe}>
              <label htmlFor="nl-email" className="nl-label">
                {t("Your email address", "የኢሜይል አድራሻዎ")}
              </label>
              <div className="nl-field-row">
                <input
                  id="nl-email"
                  name="email"
                  type="email"
                  required
                  maxLength={320}
                  placeholder="name@example.com"
                  className="nl-input"
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  className="nl-btn"
                  disabled={newsletterStatus === "submitting"}
                >
                  {newsletterStatus === "submitting" ? t("Subscribing…", "በማስመዝገብ ላይ…") : t("Subscribe", "ይመዝገቡ")}
                  <svg className="nl-btn-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <p
                className={`nl-note${newsletterStatus === "success" ? " is-success" : newsletterStatus === "error" ? " is-error" : ""}`}
                role={newsletterMessage ? "status" : undefined}
              >
                {newsletterMessage || t("One dispatch per month · Unsubscribe anytime · No spam.", "በወር አንድ መረጃ · በፈለጉት ጊዜ ይውጡ · አላስፈላጊ መልዕክት የለም።")}
              </p>
            </form>
          </div>
        </div>

        <InspirationalQuotes />
      </section>

      <section className="home-faq" aria-labelledby="home-faq-heading">
        <div className="home-faq-intro">
          <span className="home-faq-icon"><MessageCircleQuestion aria-hidden="true" /></span>
          <p className="home-faq-eyebrow">{t("Questions / Answers", "ጥያቄዎች / መልሶች")}</p>
          <h2 id="home-faq-heading">{t("Frequently", "በተደጋጋሚ")}<br /><em>{t("asked.", "የሚጠየቁ።")}</em></h2>
          <p>{t("Everything you need to know about EMWA, membership, services, partnerships, and ways to take part.", "ስለ EMWA፣ አባልነት፣ አገልግሎቶች፣ አጋርነትና የተሳትፎ መንገዶች ማወቅ የሚፈልጉት ሁሉ።")}</p>
          <Link to="/contact">{t("Still have a question?", "ተጨማሪ ጥያቄ አለዎት?")} <ArrowUpRight aria-hidden="true" /></Link>
        </div>
        <div className="home-faq-list">
          {(language === "am" ? AMHARIC_FAQS : FAQS).map(([question, answer], index) => {
            const isOpen = openFaq === index;
            return <article className={isOpen ? "is-open" : ""} key={question}>
              <h3><button type="button" aria-expanded={isOpen} aria-controls={`home-faq-answer-${index}`} onClick={() => setOpenFaq(isOpen ? null : index)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{question}</strong><i><ChevronDown aria-hidden="true" /></i></button></h3>
              <div id={`home-faq-answer-${index}`} className="home-faq-answer" aria-hidden={!isOpen}><p>{answer}</p></div>
            </article>;
          })}
        </div>
      </section>
    </PageShell>
  );
}
