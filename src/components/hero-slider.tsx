import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { API_BASE } from "@/lib/admin-api";

export type HeroSlide = {
  id?: string;
  img: string;
  text: string;
  textAm: string;
  author: string;
  role: string;
  roleAm: string;
};

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    img: "https://images.unsplash.com/photo-1585637071663-799845ad5212?w=1600&q=80",
    text: "Women journalists on the frontlines are reshaping how the world sees conflict.",
    textAm: "በግንባር ላይ ያሉ ሴት ጋዜጠኞች ዓለም ግጭትን የሚያይበትን መንገድ እየቀየሩ ይገኛሉ።",
    author: "Reuters Institute",
    role: "Global Press Freedom Report 2026",
    roleAm: "ዓለም አቀፍ የፕሬስ ነፃነት ሪፖርት 2026",
  },
  {
    img: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1600&q=80",
    text: "A record number of women now lead major international newsrooms.",
    textAm: "በታሪክ ከፍተኛ ቁጥር ያላቸው ሴቶች አሁን ዋና ዋና ዓለም አቀፍ የዜና ክፍሎችን ይመራሉ።",
    author: "UNESCO",
    role: "Women in News, Global Report",
    roleAm: "ሴቶች በዜና፣ ዓለም አቀፍ ሪፖርት",
  },
  {
    img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&q=80",
    text: "From Addis to Nairobi, women reporters are driving accountability journalism.",
    textAm: "ከአዲስ አበባ እስከ ናይሮቢ፣ ሴት ሪፖርተሮች ተጠያቂነትን የሚያረጋግጥ ጋዜጠኝነትን እየመሩ ነው።",
    author: "International Women's Media Foundation",
    role: "2026 Courage in Journalism Awards",
    roleAm: "የ2026 በጋዜጠኝነት የጽናትና የድፍረት ሽልማት",
  },
];

const resolveImageUrl = (value: unknown) => {
  if (!value) return "";
  try {
    const origin = new URL(API_BASE).origin;
    const url = new URL(String(value), origin);
    return url.pathname.startsWith("/uploads/") ? `${origin}${url.pathname}` : url.toString();
  } catch {
    return String(value);
  }
};

export default function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(`${API_BASE}/public/hero-slides`, { signal: controller.signal });
        if (!response.ok) return;
        const payload = await response.json();
        if (payload.success && Array.isArray(payload.data) && payload.data.length > 0) {
          const fetchedSlides: HeroSlide[] = payload.data.map((row: Record<string, unknown>) => ({
            id: String(row.id ?? ""),
            img: resolveImageUrl(row.imageUrl ?? row.image_url),
            text: String(row.text ?? ""),
            textAm: String(row.textAm ?? row.text_am ?? row.text ?? ""),
            author: String(row.author ?? ""),
            role: String(row.role ?? ""),
            roleAm: String(row.roleAm ?? row.role_am ?? row.role ?? ""),
          }));
          setSlides(fetchedSlides);
        }
      } catch {
        // Fall back to default slides on fetch error or offline mode
      }
    })();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!autoPlay || slides.length === 0) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 3500);
    return () => clearInterval(id);
  }, [autoPlay, slides.length]);

  const handleDotClick = (i: number) => {
    setIndex(i);
    setAutoPlay(false);
  };

  const activeSlides = slides.length > 0 ? slides : DEFAULT_SLIDES;
  const currentSlideIndex = index % activeSlides.length;

  return (
    <section 
      className="py-16 md:py-24 border-y border-border bg-background"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <p className="label-mono text-primary mb-8 text-center">
          {t("Voices in Motion", "በእንቅስቃሴ ላይ ያሉ ድምጾች")}
        </p>

        <div className="relative aspect-[16/9] md:aspect-[20/9] overflow-hidden bg-foreground">
          {/* Images */}
          {activeSlides.map((s, i) => (
            <img
              key={s.id || i}
              src={s.img}
              alt={s.author}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                i === currentSlideIndex
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-105"
              }`}
            />
          ))}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/40 to-transparent" />
          
          {/* Navigation Dots - Bottom */}
          <div className="absolute bottom-8 left-8 right-8 flex gap-3">
            {activeSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1 transition-all duration-500 ${
                  i === currentSlideIndex 
                    ? "w-12 bg-primary" 
                    : "w-3 bg-background/40 hover:bg-background/70"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Quotation Text - Centered Below */}
        <div className="mt-12 max-w-4xl mx-auto text-center">
          <div className="relative overflow-hidden h-40">
            {activeSlides.map((s, i) => (
              <div
                key={s.id || i}
                className={`absolute inset-x-0 transition-all duration-1000 ease-in-out ${
                  i === currentSlideIndex
                    ? "opacity-100 translate-y-0"
                    : i < currentSlideIndex
                    ? "opacity-0 -translate-y-8"
                    : "opacity-0 translate-y-8"
                }`}
              >
                <blockquote className="font-display text-3xl md:text-5xl leading-tight tracking-tight mb-6">
                  &ldquo;{language === "am" ? s.textAm : s.text}&rdquo;
                </blockquote>
                <p className="label-mono text-primary">
                  {s.author} <span className="text-muted-foreground">· {language === "am" ? s.roleAm : s.role}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Slide Counter */}
        <div className="flex justify-center mt-8 label-mono text-muted-foreground">
          <span>{currentSlideIndex + 1} / {activeSlides.length}</span>
        </div>
      </div>
    </section>
  );
}

