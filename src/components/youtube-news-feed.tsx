import { ArrowUpRight, Play } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

type NewsSource = {
  name: string;
  nameAm?: string;
  shortName: string;
  description: string;
  descriptionAm?: string;
  domain: string;
  url: string;
  platform: string;
  cta: string;
  ctaAm?: string;
  accentColor?: string; // top border / accent color per card
  featured?: boolean;
};

// Edit this list to add, remove, or reorder the news sources shown on the home page.
const NEWS_SOURCES: NewsSource[] = [
  {
    name: "Women in Media — Featured Video",
    nameAm: "ሴቶች በሚዲያ — ልዩ ቪዲዮ",
    shortName: "VIDEO 01",
    description: "Watch this featured video highlighting women, media, and the issues shaping today's conversation.",
    descriptionAm: "ሴቶችን፣ ሚዲያን እና የዛሬውን ውይይት የሚቀርጹ ጉዳዮችን የሚያሳይ ልዩ ቪዲዮ ይመልከቱ።",
    domain: "youtube.com",
    url: "https://youtu.be/XYZQHfEM0B0?si=2TWKtBA9k2GyCm98",
    platform: "YouTube",
    cta: "Watch video",
    ctaAm: "ቪዲዮ ይመልከቱ",
    accentColor: "#ff0033",
    featured: true,
  },
  {
    name: "Women in Media — Featured Video",
    nameAm: "ሴቶች በሚዲያ — ልዩ ቪዲዮ",
    shortName: "VIDEO 02",
    description: "A featured video connecting audiences with current stories and perspectives from women in media.",
    descriptionAm: "ተመልካቾችን በሚዲያ ውስጥ ካሉ ሴቶች ወቅታዊ ታሪኮች እና አመለካከቶች ጋር የሚያገናኝ ቪዲዮ።",
    domain: "youtube.com",
    url: "https://youtu.be/3ONtCRmfovk?si=V7wQf24HpsNfSK1C",
    platform: "YouTube",
    cta: "Watch video",
    ctaAm: "ቪዲዮ ይመልከቱ",
    accentColor: "#ff0033",
  },
  {
    name: "Gender Equality Policies for Women Journalists",
    nameAm: "ለሴት ጋዜጠኞች የጾታ እኩልነት ፖሊሲዎች",
    shortName: "ELHAM",
    description: "A conversation about gender equality, women journalists, and stronger gender-equality policies in media workplaces.",
    descriptionAm: "ስለ ጾታ እኩልነት፣ ሴት ጋዜጠኞች እና በሚዲያ የስራ ቦታዎች ጠንካራ የጾታ እኩልነት ፖሊሲዎች ዙሪያ የተደረገ ውይይት።",
    domain: "linkedin.com",
    url: "https://www.linkedin.com/posts/elham-ali-70080051_genderequality-womenjournalists-genderequalitypolicies-activity-7483596857089298432-dRqd?utm_source=share&utm_medium=member_android&rcm=ACoAAB7x23MBzhbztek48HAxH4_eZ8P8WAv-AGE",
    platform: "LinkedIn",
    cta: "Read post",
    ctaAm: "ጽሁፍ ያንብቡ",
    accentColor: "#0a66c2",
  },
  {
    name: "Safety of Journalists in Ethiopia",
    nameAm: "በኢትዮጵያ የጋዜጠኞች ደህንነት",
    shortName: "SAFETY",
    description: "Highlights from the 2025 assessment of the risks, violations, and systemic threats facing journalists across Ethiopia.",
    descriptionAm: "በኢትዮጵያ የሚገኙ ጋዜጠኞችን የሚያጋጥሟቸው ስጋቶች፣ ጥሰቶች እና አደጋዎች የ2025 ግምገማ ዋና ዋና ነጥቦች።",
    domain: "linkedin.com",
    url: "https://www.linkedin.com/posts/tewodrosnegashbayu_ethiopia-journalistsafety-safetyofjournalists-activity-7432155946061205505-aM_8?utm_source=share&utm_medium=member_android&rcm=ACoAAB7x23MBzhbztek48HAxH4_eZ8P8WAv-AGE",
    platform: "LinkedIn",
    cta: "Read post",
    ctaAm: "ጽሁፍ ያንብቡ",
    accentColor: "#0a66c2",
  },
  {
    name: "Fojo and EMWA Link Journalists to Women Experts",
    nameAm: "ፎጆ እና ኢኤምደብሊውኤ ጋዜጠኞችን ከሴት ባለሙያዎች ጋር ያገናኛሉ",
    shortName: "CHARM",
    description: "How the Women Experts Directory is helping journalists find authoritative women sources across 18 fields.",
    descriptionAm: "የሴት ባለሙያዎች ማውጫ ጋዜጠኞች በ18 ዘርፎች ተአማኒ የሆኑ ሴት ምንጮችን እንዲያገኙ እንዴት እየረዳ እንደሚገኝ።",
    domain: "charmafrica.org",
    url: "https://charmafrica.org/fojo-and-emwa-links-journalists-to-women-experts/",
    platform: "CHARM",
    cta: "Read story",
    ctaAm: "ታሪክ ያንብቡ",
    accentColor: "#e05a3f",
  },
  {
    name: "Directory Amplifies Ethiopian Women's Voices",
    nameAm: "ማውጫው የኢትዮጵያውያን ሴቶችን ድምጽ ያጎላል",
    shortName: "FOJO",
    description: "EMWA's directory connects journalists with women experts, challenges stereotypes, and broadens representation in news coverage.",
    descriptionAm: "የኢኤምደብሊውኤ ማውጫ ጋዜጠኞችን ከሴት ባለሙያዎች ጋር ያገናኛል፣ አመለካከቶችን ይሞግታል፣ በሚዲያ ሽፋንም ተሳትፎን ያሰፋል።",
    domain: "fojo.se",
    url: "https://fojo.se/directory-of-experts-to-amplify-ethiopian-womens-voices-in-the-media/",
    platform: "Fojo",
    cta: "Read story",
    ctaAm: "ታሪክ ያንብቡ",
    accentColor: "#E5A933",
  },
  {
    name: "Women Experts Directory",
    nameAm: "የሴት ባለሙያዎች ማውጫ",
    shortName: "DW",
    description: "DW Amharic highlights EMWA's Women Experts Directory and its work to bring more Ethiopian women into media coverage.",
    descriptionAm: "ዶይቼ ቬለ (DW) አማርኛ የኢኤምደብሊውኤን የሴት ባለሙያዎች ማውጫ እና ተጨማሪ ሴቶችን በሚዲያ ሽፋን ለማሳተፍ የሚደረገውን ጥረት አጉልቷል።",
    domain: "facebook.com",
    url: "https://web.facebook.com/dw.amharic/posts/women-experts-directory-%E1%8B%A8%E1%89%B0%E1%88%B0%E1%8A%98%E1%8B%8D-%E1%88%98%E1%8C%BD%E1%88%83%E1%8D%89-%E1%89%A0%E1%8A%A2%E1%89%B5%E1%8B%AE%E1%8C%B5%E1%8B%AB-%E1%88%98%E1%8C%88%E1%8A%93%E1%8A%9B-%E1%89%A5%E1%8B%99%E1%88%83%E1%8A%95-%E1%88%B4%E1%89%B6%E1%89%BD-%E1%88%9B%E1%88%85%E1%89%A0%E1%88%AD-%E1%8A%90%E1%8B%8D-%E1%89%B3%E1%89%B5%E1%88%9E-%E1%88%88%E1%88%98%E1%8C%88%E1%8A%93%E1%8A%9B-%E1%89%A5%E1%8B%99%E1%88%83%E1%8A%95-%E1%89%A3/6717947304904975/?_rdc=1&_rdr#",
    platform: "Facebook",
    cta: "View post",
    ctaAm: "ፖስት ይመልከቱ",
    accentColor: "#1877f2",
  },
  {
    name: "A Milestone for Gender Equality in Ethiopian Media",
    nameAm: "በኢትዮጵያ ሚዲያ ለጾታ እኩልነት ትልቅ እርምጃ",
    shortName: "MILESTONE",
    description: "EMWA and three independent media houses commit to gender policies and safer, more inclusive workplaces for women journalists.",
    descriptionAm: "ኢኤምደብሊውኤ እና ሶስት ነጻ የዜና ማዕከላት ለጾታ ፖሊሲዎችና ለሴት ጋዜጠኞች ደህንነቱ የተጠበቀ የስራ ቦታ ቁርጠኝነት ገቡ።",
    domain: "fojo.se",
    url: "https://fojo.se/en/a-milestone-for-gender-equality-in-ethiopian-media/",
    platform: "Fojo",
    cta: "Read story",
    ctaAm: "ታሪክ ያንብቡ",
    accentColor: "#E5A933",
  },
];

export default function YoutubeNewsFeed() {
  const { t, language } = useLanguage();

  return (
    <section className="ynf-section">
      <div className="ynf-container">
        {/* Header row */}
        <div className="ynf-header">
          <div className="ynf-header-left">
            <h2 className="ynf-headline">
              {language === "am" ? (
                <>
                  ሴቶች በዜና፣ <span className="ynf-headline-accent">በአሁኑ ሰዓት።</span>
                </>
              ) : (
                <>
                  Women in the news,{" "}
                  <span className="ynf-headline-accent">right now.</span>
                </>
              )}
            </h2>
            <p className="ynf-subtext">
              {t(
                "Explore current videos, reporting, and conversations advancing women's voices, gender equality, and safer media in Ethiopia.",
                "የሴቶችን ድምጽ፣ የጾታ እኩልነትንና ደህንነቱ የተጠበቀ ሚዲያን በኢትዮጵያ የሚያጎሉ ወቅታዊ ቪዲዮዎችንና ዘገባዎችን ይመልከቱ።",
              )}
            </p>
          </div>
          <div className="ynf-header-right">
            <span className="ynf-live-badge">
              <span className="ynf-live-dot" aria-hidden="true" />
              {t("Latest coverage", "አዳዲስ ዘገባዎች")}
            </span>
          </div>
        </div>

        {/* Card grid */}
        <div className="ynf-grid">
          {NEWS_SOURCES.map((source) => (
            <NewsSourceCard key={source.name} source={source} />
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsSourceCard({ source }: { source: NewsSource }) {
  const logoUrl = `https://www.google.com/s2/favicons?domain=${source.domain}&sz=128`;
  const accent = source.accentColor ?? "#E5A933";
  const { language } = useLanguage();

  const cardTitle = language === "am" && source.nameAm ? source.nameAm : source.name;
  const cardDesc = language === "am" && source.descriptionAm ? source.descriptionAm : source.description;
  const cardCta = language === "am" && source.ctaAm ? source.ctaAm : source.cta;

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${cardCta}: ${cardTitle} on ${source.platform} (opens in a new tab)`}
      className={`ynf-card${source.featured ? " ynf-card--featured" : ""}`}
      style={{ "--card-accent": accent } as React.CSSProperties}
    >
      {/* Faded background short name */}
      <span className="ynf-card-bg-name" aria-hidden="true">
        {source.shortName}
      </span>

      {/* Top row: logo + play button */}
      <div className="ynf-card-top">
        <div className="ynf-logo-wrap">
          <img
            src={logoUrl}
            alt=""
            width={128}
            height={128}
            loading="lazy"
            className="ynf-logo-img"
          />
        </div>
        <span className="ynf-play-btn" aria-hidden="true">
          <Play className="ynf-play-icon" fill="currentColor" />
        </span>
      </div>

      {/* Bottom row: meta + title + description + cta */}
      <div className="ynf-card-body">
        <p className="ynf-card-meta">
          {source.shortName} / {source.platform}
        </p>
        <h3 className="ynf-card-title">{cardTitle}</h3>
        <p className="ynf-card-desc">{cardDesc}</p>
        <span className="ynf-card-cta">
          {cardCta} <ArrowUpRight className="ynf-cta-icon" aria-hidden="true" />
        </span>
      </div>
    </a>
  );
}
