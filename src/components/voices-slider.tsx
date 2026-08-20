import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { useCallback, useState, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/language-context";

type Testimonial = {
  quote: string;
  author: string;
  role: string;
  sourceUrl?: string;
};

const FALLBACK_VOICES: Testimonial[] = [
  {
    quote:
      "Independent journalism becomes stronger when women have equal authority to investigate, edit, publish, and lead public conversations.",
    author: "Maria Ressa",
    role: "Journalist and press-freedom advocate",
    sourceUrl: "https://www.nobelprize.org/prizes/peace/2021/ressa/facts/",
  },
  {
    quote:
      "Women belong at the center of international reporting—not only as subjects, but as correspondents, editors, experts, and decision-makers.",
    author: "Christiane Amanpour",
    role: "International journalist",
    sourceUrl: "https://www.christianeamanpour.com/",
  },
  {
    quote:
      "Reporting across borders requires local knowledge, editorial courage, and a commitment to keeping communities visible beyond moments of crisis.",
    author: "Nima Elbagir",
    role: "International correspondent",
    sourceUrl: "https://www.cnn.com/profiles/nima-elbagir",
  },
  {
    quote:
      "International reporting is most valuable when it brings patience, context, and humanity to communities too often reduced to headlines.",
    author: "Lyse Doucet",
    role: "International journalist",
    sourceUrl: "https://www.bbc.co.uk/programmes/profiles/4qm2V0VvF1Y3xqKz9NfM2Jw/lyse-doucet",
  },
  {
    quote:
      "Journalism can connect history to the present and ensure African experiences are represented with depth, authority, and complexity.",
    author: "Zeinab Badawi",
    role: "Journalist and broadcaster",
    sourceUrl: "https://www.zeinabbadawi.com/",
  },
  {
    quote:
      "Courageous reporting requires preparation, trusted teams, and an unwavering responsibility to the people whose stories are being told.",
    author: "Clarissa Ward",
    role: "International correspondent",
    sourceUrl: "https://www.cnn.com/profiles/clarissa-ward-profile",
  },
  {
    quote:
      "Public-interest journalism earns trust by asking precise questions, explaining complexity clearly, and staying accountable to its audience.",
    author: "Amna Nawaz",
    role: "Journalist and news anchor",
    sourceUrl: "https://www.pbs.org/newshour/author/amna-nawaz",
  },
  {
    quote:
      "Media leadership should create room for new voices, invest in young journalists, and make representation visible in everyday editorial decisions.",
    author: "Julie Gichuru",
    role: "Journalist and media leader",
    sourceUrl: "https://juliegichuru.com/",
  },
  {
    quote:
      "The strongest interviews combine rigorous preparation with curiosity, giving audiences the context they need to understand power and policy.",
    author: "Yamiche Alcindor",
    role: "Journalist and correspondent",
    sourceUrl: "https://www.nbcnews.com/meet-the-press/meetthepressblog/yamiche-alcindor-n1296311",
  },
  {
    quote:
      "Local journalists carry essential knowledge. International media works best when it listens to, credits, and collaborates with that expertise.",
    author: "Rana Rahimpour",
    role: "International journalist",
    sourceUrl: "https://www.bbc.com/persian",
  },
  {
    quote:
      "Women in media reshape public conversation when they are supported not only to enter newsrooms, but to lead them and define their priorities.",
    author: "Femi Oke",
    role: "International journalist and moderator",
    sourceUrl: "https://www.aljazeera.com/author/femi_oke_2012125151254764110",
  },
];

function useVoicesInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

export default function VoicesSlider() {
  const [voices, setVoices] = useState<Testimonial[]>(FALLBACK_VOICES);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const { ref, inView } = useVoicesInView();
  const { t } = useLanguage();

  useEffect(() => {
    const feedUrl = import.meta.env.VITE_GLOBAL_VOICES_API_URL;
    if (!feedUrl) return;

    const controller = new AbortController();
    const loadVoices = async () => {
      try {
        const response = await fetch(feedUrl, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        const candidates = Array.isArray(payload) ? payload : payload?.data;
        if (!Array.isArray(candidates)) return;
        const valid = candidates.filter(
          (item): item is Testimonial =>
            typeof item?.quote === "string" &&
            typeof item?.author === "string" &&
            typeof item?.role === "string",
        );
        if (valid.length) {
          setVoices(valid);
          setActiveIndex(0);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.warn("Global voices feed unavailable; using curated content.");
        }
      }
    };

    void loadVoices();
    const refresh = window.setInterval(loadVoices, 60 * 60 * 1000);
    return () => {
      controller.abort();
      window.clearInterval(refresh);
    };
  }, []);

  const handleNext = useCallback(() => {
    if (isSliding) return;
    setIsSliding(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % voices.length);
      setIsSliding(false);
    }, 400); // match fade duration
  }, [isSliding, voices.length]);

  const handlePrev = () => {
    if (isSliding) return;
    setIsSliding(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev - 1 + voices.length) % voices.length);
      setIsSliding(false);
    }, 400); // match fade duration
  };

  // Auto-play feature
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 7000); // Slide every 7 seconds
    return () => clearInterval(interval);
  }, [handleNext]);

  const activeTestimonial = voices[activeIndex];

  // Helper to color/highlight key words inside testimonials
  const renderQuoteText = (text: string) => {
    const highlights = [
      "peer network",
      "women editors",
      "hard story",
      "digital safety toolkit",
      "rapid-response",
      "real solidarity",
    ];
    let styledText = text;

    highlights.forEach((phrase) => {
      const regex = new RegExp(`(${phrase})`, "gi");
      styledText = styledText.replace(regex, `<span class="voices-highlight">$1</span>`);
    });

    return <p dangerouslySetInnerHTML={{ __html: styledText }} />;
  };

  return (
    <section
      ref={ref}
      className={`voices-section${inView ? " voices-section--visible" : ""}`}
      id="voices-slider"
      aria-label="Global media voices"
    >
      {/* Left gold border accent */}
      <div className="voices-accent-bar" aria-hidden="true" />

      {/* Background scanline grid pattern */}
      <div className="voices-scanlines" aria-hidden="true" />

      {/* Decorative large background text */}
      <span className="voices-bg-word" aria-hidden="true">
        VOICES
      </span>

      <div className="voices-container">
        {/* Voices section eyebrow */}
        <div className="voices-header">
          <p className="voices-eyebrow">{t("Global media voices", "ዓለም አቀፍ የሜዲያ ድምጾች")}</p>
          <div className="voices-header-rule" aria-hidden="true" />
          <div className="voices-counter" aria-hidden="true">
            <span className="voices-counter-current">0{activeIndex + 1}</span>
            <span className="voices-counter-separator">/</span>
            <span className="voices-counter-total">0{voices.length}</span>
          </div>
        </div>

        <div className="voices-content">
          <blockquote className="voices-blockquote">
            {/* Opening mark */}
            <div className="voices-top-row">
              <span className="voices-quote-mark" aria-hidden="true">
                "
              </span>
            </div>

            {/* Quote content block */}
            <div
              className={`voices-quote-wrapper${isSliding ? " voices-quote-wrapper--sliding" : ""}`}
            >
              <div className="voices-quote-text">{renderQuoteText(t(activeTestimonial.quote, activeTestimonial.quote))}</div>

              {/* Divider line */}
              <div className="voices-divider" aria-hidden="true" />

              {/* Author footer */}
              <footer className="voices-footer">
                <cite className="voices-cite">
                  <span className="voices-author">{activeTestimonial.author}</span>
                  <span className="voices-dot" aria-hidden="true">
                    {" "}
                    ·{" "}
                  </span>
                  <span className="voices-role">{activeTestimonial.role}</span>
                </cite>
                {activeTestimonial.sourceUrl && (
                  <a
                    href={activeTestimonial.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="voices-source"
                  >
                    Profile <ExternalLink aria-hidden="true" />
                  </a>
                )}
              </footer>
            </div>
          </blockquote>

          {/* Navigation Controls */}
          <div className="voices-controls">
            <button onClick={handlePrev} className="voices-btn" aria-label="Previous quote">
              <ArrowLeft className="voices-btn-icon" />
            </button>
            <button onClick={handleNext} className="voices-btn" aria-label="Next quote">
              <ArrowRight className="voices-btn-icon" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
