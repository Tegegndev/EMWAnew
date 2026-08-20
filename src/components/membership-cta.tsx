import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/language-context";

function useMembershipInView() {
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
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

export default function MembershipCta() {
  const { ref, inView } = useMembershipInView();
  const { t, language } = useLanguage();

  const BENEFITS = [
    {
      en: "Full access to the Experts Directory",
      am: "የባለሙያዎች ማውጫ ሙሉ አገልግሎት",
    },
    {
      en: "Legal and digital safety support",
      am: "የህግ እና የዲጂታል ደህንነት ድጋፍ",
    },
    {
      en: "Priority for grants, fellowships, and residencies",
      am: "የእርዳታ፣ የትምህርት ዕድልና የልምድ ልውውጥ ቅድሚያ",
    },
    {
      en: "Regional chapter membership",
      am: "የክልል ቅርንጫፎች አባልነት",
    },
  ];

  return (
    <section
      ref={ref}
      className={`member-section ${inView ? "member-section--visible" : ""}`}
      id="membership-cta"
      aria-labelledby="member-heading"
    >
      {/* Decorative large background text */}
      <div className="member-bg-text" aria-hidden="true">
        JOIN EMWA
      </div>

      <div className="member-container">
        <div className="member-grid">
          {/* Left Column: Heading & Subtitle */}
          <div className="member-left">
            <p className="member-eyebrow">{t("Membership", "አባልነት")}</p>
            <h2 className="member-heading" id="member-heading">
              {language === "am" ? (
                <>
                  ድምፅዎን <span className="member-heading-accent">ይቀላቅሉ።</span>
                </>
              ) : (
                <>
                  Add your <span className="member-heading-accent">voice.</span>
                </>
              )}
            </h2>
            <p className="member-description">
              {t(
                "EMWA membership is open to Ethiopian women working in journalism, broadcasting, communications, academia, and independent media — from Addis Ababa to Assosa.",
                "የኢኤምደብሊውኤ አባልነት በጋዜጠኝነት፣ በብሮድካስት፣ በኮሙኒኬሽን፣ በአካዳሚ እና በነጻ ሚዲያ ውስጥ ለሚሰሩ የኢትዮጵያ ሴቶች ሁሉ ክፍት ነው — ከአዲስ አበባ እስከ አሶሳ።",
              )}
            </p>
          </div>

          {/* Right Column: Benefits & Button */}
          <div className="member-right">
            <h3 className="member-right-title">{t("Member Benefits", "የአባልነት ጥቅሞች")}</h3>
            <ul className="member-benefits-list">
              {BENEFITS.map((b, i) => (
                <li
                  key={i}
                  className="member-benefit-item"
                  style={{ "--item-index": i } as React.CSSProperties}
                >
                  <CheckCircle2 className="member-benefit-icon" aria-hidden="true" />
                  <span className="member-benefit-text">{language === "am" ? b.am : b.en}</span>
                </li>
              ))}
            </ul>

            <div className="member-action-wrap">
              <Link
                to="/membership"
                className="member-btn"
                aria-label="Apply for membership online"
              >
                {t("Apply for membership", "ለአባልነት ይመዝገቡ")}
                <ArrowUpRight className="member-btn-icon" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
