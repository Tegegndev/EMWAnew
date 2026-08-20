import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { EMWA_PARTNERS, type EmwaPartner } from "@/lib/partners";
import { useLanguage } from "@/lib/language-context";

export const Route = createFileRoute("/partners")({
  head: () => ({ meta: [
    { title: "Partners & Alliances — EMWA" },
    { name: "description", content: "The media, government, international, and civil-society partners working with EMWA." },
    { property: "og:title", content: "Partners & Alliances — EMWA" },
  ] }),
  component: Partners,
});

const STRATEGIC_PARTNERS = [
  { en: "Government institutions", am: "የመንግስት ተቋማት" },
  { en: "Media organizations", am: "የመገናኛ ብዙሃን ድርጅቶች" },
  { en: "Development partners and donors", am: "የልማት አጋሮች እና ለጋሾች" },
  { en: "Civil Society Organizations (CSOs)", am: "የሲቪል ማህበረሰብ ድርጅቶች (CSOs)" },
  { en: "National and international media associations", am: "ሀገራዊ እና ዓለም አቀፋዊ የሚዲያ ማህበራት" },
  { en: "Universities and research institutions", am: "ዩኒቨርሲቲዎች እና የምርምር ተቋማት" },
  { en: "Women's organizations", am: "የሴቶች ድርጅቶች" },
  { en: "Professional associations", am: "የሙያ ማህበራት" },
  { en: "Media coalitions and networks", am: "የሚዲያ ጥረቶች እና መረቦች" },
];

function PartnerLogo({ partner, compact = false }: { partner: EmwaPartner; compact?: boolean }) {
  return (
    <div className={`partners-logo-card${compact ? " is-compact" : ""}`}>
      <div className={`partners-logo-mark ${partner.logoClass ?? ""}`}>
        <img src={partner.logo} alt={`${partner.name} logo`} loading="lazy" />
      </div>
      <div className="partners-placeholder-copy">
        <strong>{partner.name}</strong>
        <span>{partner.focus}</span>
      </div>
    </div>
  );
}

function Partners() {
  const { t, language } = useLanguage();

  return (
    <PageShell>
      <section className="partners2-hero">
        <p className="partners-eyebrow">{t("Partners & alliances / EMWA", "አጋሮች እና ትስስሮች / EMWA")}</p>
        <h1>
          {language === "am" ? (
            <>
              ዕድገት የጋራ<br /><em>ጥረት ውጤት ነው።</em>
            </>
          ) : (
            <>
              Progress is<br /><em>a collective act.</em>
            </>
          )}
        </h1>
        <p>
          {t(
            "We work across institutions, borders, and disciplines to create lasting opportunity for women in Ethiopian media.",
            "በኢትዮጵያ ሚዲያ ውስጥ ለሴቶች ዘላቂ ዕድል ለመፍጠር በተቋማት፣ በድንበሮች እና በሙያዎች ዙሪያ እንሰራለን።",
          )}
        </p>
        <a href="#partner-network">{t("Meet the network", "መረቡን ይወቁ")} <ArrowRight /></a>
        <span className="partners2-hero-word" aria-hidden="true">TOGETHER</span>
      </section>

      <section className="partners2-marquee" aria-label="Selected EMWA partners">
        <div className="partners2-marquee-label">
          <span>{t("Selected partners", "የተመረጡ አጋሮች")}</span>
          <small>{t("Scroll / Right to left", "በስተቀኝ ወደ ግራ")}</small>
        </div>
        <div className="partners2-marquee-window">
          <div className="partners2-marquee-track">
            {[...EMWA_PARTNERS, ...EMWA_PARTNERS].map((partner, index) => <PartnerLogo key={`${partner.name}-${index}`} partner={partner} compact />)}
          </div>
        </div>
      </section>

      <section className="partners2-purpose">
        <header>
          <p className="partners-eyebrow">{t("Why we partner", "ለምን አጋር እንሆናለን")}</p>
          <h2>
            {language === "am" ? (
              <>
                የጋራ ጥረት።<br />ሊለካ የሚችል ለውጥ።
              </>
            ) : (
              <>
                Shared effort.<br />Measurable change.
              </>
            )}
          </h2>
        </header>
        <div>
          <article>
            <span>01</span>
            <h3>{t("Knowledge", "እውቀት")}</h3>
            <p>{t("Research, training, and practical expertise shaped around real newsroom conditions.", "በእውነተኛ የዜና ክፍል ሁኔታዎች ዙሪያ የተቀረፀ ምርምር፣ ስልጠና እና ተግባራዊ ልምድ።")}</p>
          </article>
          <article>
            <span>02</span>
            <h3>{t("Access", "ተደራሽነት")}</h3>
            <p>{t("Pathways into leadership, regional networks, funding, platforms, and public influence.", "ወደ አመራርነት፣ የክልል መረቦች፣ የገንዘብ ድጋፍ፣ መድረኮች እና ህዝባዊ ተፅዕኖ የሚወስዱ መንገዶች።")}</p>
          </article>
          <article>
            <span>03</span>
            <h3>{t("Accountability", "ተጠያቂነት")}</h3>
            <p>{t("Clear outcomes, transparent roles, and institutional changes that last beyond a grant.", "ከስጦታ በላይ የሚቆዩ ግልጽ ውጤቶች፣ አስተማማኝ ሚናዎች እና ተቋማዊ ለውጦች።")}</p>
          </article>
        </div>
      </section>

      <section className="about2-partners" id="partner-network">
        <header>
          <p className="about2-eyebrow">{t("Strategic partners", "ስትራቴጂያዊ አጋሮች")}</p>
          <h2>
            {language === "am" ? (
              <>
                ዕድገት በአጋርነት<br />ይገነባል።
              </>
            ) : (
              <>
                Progress is built<br />in partnership.
              </>
            )}
          </h2>
          <p>{t("EMWA collaborates across public institutions, civil society, education, media, and development networks.", "EMWA ከህዝብ ተቋማት፣ ከሲቪል ማህበረሰብ፣ ከትምህርት፣ ከሚዲያ እና ከልማት መረቦች ጋር ይተባበራል።")}</p>
        </header>
        <div>
          {STRATEGIC_PARTNERS.map((item, index) => (
            <article key={item.en}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{language === "am" ? item.am : item.en}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="partners2-story">
        <div>
          <span>{t("Partnership in practice", "ተግባራዊ አጋርነት")}</span>
          <strong>06</strong>
          <small>{t("Years working together", "የጋራ ስራ ዓመታት")}</small>
        </div>
        <blockquote style={{ fontFamily: language === "am" ? '"Noto Sans Ethiopic", var(--font-sans)' : undefined }}>
          {language === "am"
            ? '“ትልቁ ውጤት አንድ ዘመቻ አልነበረም። ይልቁንም ብዙ ሴቶች የሚመሩበት፣ የሚመድቡበት እና ውሳኔ የሚሰጡበት የዜና ክፍል ባህል ነው።”'
            : '“The strongest outcome was not one campaign. It was a newsroom culture where more women can lead, commission, and make decisions.”'
          }
          <cite>
            <strong>{t("Head of News", "የዜና መምሪያ ኃላፊ")}</strong> / {t("Ethiopian Broadcasting Corporation", "የኢትዮጵያ ብሮድካስቲንግ ኮርፖሬሽን")}
          </cite>
        </blockquote>
      </section>

      <section className="partners2-cta">
        <p className="partners-eyebrow">{t("Build something durable", "ዘላቂ ነገር እንገንባ")}</p>
        <h2>
          {language === "am" ? (
            <>
              ስራውን በአንድነት<br /><em>ወደፊት እናራምደው።</em>
            </>
          ) : (
            <>
              Let&apos;s move the work<br /><em>forward—together.</em>
            </>
          )}
        </h2>
        <Link to="/contact">{t("Start Partnership", "አጋርነት ይጀምሩ")} <ArrowUpRight /></Link>
      </section>
    </PageShell>
  );
}

