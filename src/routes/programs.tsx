import { createFileRoute, Link } from "@tanstack/react-router";
import { type CSSProperties, useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import heroImg from "@/assets/programs.png";
import { useLanguage } from "@/lib/language-context";

export const Route = createFileRoute("/programs")({
  head: () => ({ meta: [
    { title: "Programs & Projects — EMWA" },
    { name: "description", content: "Explore EMWA's seven strategic programs advancing women in Ethiopian media." },
    { property: "og:title", content: "Programs & Projects — EMWA" },
  ] }),
  component: Programs,
});

const PROGRAMS = [
  {
    titleEn: "Organizational Development",
    titleAm: "የድርጅት ልማት",
    focusEn: "Institution",
    focusAm: "ተቋም",
    itemsEn: ["Institutional capacity building", "Governance strengthening", "Accountability systems", "Policy and bylaw development"],
    itemsAm: ["የተቋማት አቅም ግንባታ", "የመልካም አስተዳደር ማጠናከሪያ", "የተጠያቂነት ስርዓቶች", "የፖሊሲ እና ደንብ ልማት"],
  },
  {
    titleEn: "Membership Development",
    titleAm: "የአባልነት ልማት",
    focusEn: "Membership",
    focusAm: "አባልነት",
    itemsEn: ["Membership recruitment", "Member engagement", "Member rights and benefits", "Professional development"],
    itemsAm: ["አባላትን መመልመል", "የአባላት ተሳትፎ", "የአባላት መብቶች እና ጥቅሞች", "የሙያ ማበልጸግ"],
  },
  {
    titleEn: "Capacity Building",
    titleAm: "የአቅም ግንባታ",
    focusEn: "Professional growth",
    focusAm: "የሙያ እድገት",
    itemsEn: ["Training programs", "Mentorship", "Coaching", "Exchange programs", "Knowledge sharing"],
    itemsAm: ["የስልጠና ፕሮግራሞች", "የአማካሪነት ድጋፍ", "አሰልጣኝነት", "የልምድ ልውውጥ ፕሮግራሞች", "የእውቀት ሼሪንግ"],
  },
  {
    titleEn: "Research & Knowledge",
    titleAm: "ምርምር እና እውቀት",
    focusEn: "Evidence",
    focusAm: "ማስረጃ",
    itemsEn: ["Gender and media research", "Policy papers", "Publications", "Knowledge hub development"],
    itemsAm: ["በፆታ እና በሚዲያ ዙሪያ ምርምር", "የፖሊሲ ሰነዶች", "ህትመቶች", "የእውቀት ማዕከል ማልማት"],
  },
  {
    titleEn: "Advocacy & Visibility",
    titleAm: "ተሟጋችነት እና ተደራሽነት",
    focusEn: "Influence",
    focusAm: "ተፅዕኖ",
    itemsEn: ["Gender-sensitive media advocacy", "Public awareness campaigns", "Policy dialogue", "Communication and media engagement"],
    itemsAm: ["ለፆታ ተቆርቋሪ የሚዲያ ተሟጋችነት", "የሕዝብ ንቅናቄ ዘመቻዎች", "የፖሊሲ ውይይቶች", "የኮሙኒኬሽን እና ሚዲያ ተሳትፎ"],
  },
  {
    titleEn: "Resource Mobilization",
    titleAm: "የሀብት ማሰባሰብ",
    focusEn: "Sustainability",
    focusAm: "ዘላቂነት",
    itemsEn: ["Fundraising initiatives", "Income-generating activities", "Volunteer engagement", "Donor relationship management"],
    itemsAm: ["የገንዘብ ማሰባሰብ ተነሳሽነቶች", "ገቢ ማስገኛ እንቅስቃሴዎች", "የበጎ ፈቃደኞች ተሳትፎ", "የለጋሾች ግንኙነት አስተዳደር"],
  },
  {
    titleEn: "Partnerships & Networking",
    titleAm: "አጋርነት እና ትስስር",
    focusEn: "Collaboration",
    focusAm: "ትብብር",
    itemsEn: ["Strategic partnerships", "National and international collaboration", "Stakeholder engagement", "Media coalition building"],
    itemsAm: ["ስትራቴጂያዊ አጋርነቶች", "ሀገራዊ እና ዓለም አቀፋዊ ትብብር", "የባለድርሻ አካላት ተሳትፎ", "የሚዲያ ጥረት ትስስር"],
  },
];

const SERVICES = [
  {
    titleEn: "Capacity Building",
    titleAm: "የአቅም ግንባታ",
    textEn: "Strengthen media practitioners through tailor-made training, mentorship, internships, experience-sharing platforms, and roundtable discussions.",
    textAm: "በተዘጋጁ ስልጠናዎች፣ የአማካሪነት ድጋፍ፣ የልምድ ልውውጥ መድረኮች እና የክብ ጠረጴዛ ውይይቶች አማካይነት የሚዲያ ባለሙያዎችን ማጠናከር።",
  },
  {
    titleEn: "Evidence-Based Advocacy",
    titleAm: "በማስረጃ የተደገፈ ተሟጋችነት",
    textEn: "Champion the rights of women and women media professionals by amplifying their voices and advancing gender equality across the media sector.",
    textAm: "ድምፃቸውን በማጎላት እና በሚዲያ ዘርፍ የፆታ እኩልነትን በማሳደግ የሴቶችን እና የሴት የሚዲያ ባለሙያዎችን መብት ማስበሰር።",
  },
  {
    titleEn: "Women’s Empowerment",
    titleAm: "የሴቶች ማብቃት",
    textEn: "Promote resilience and wellbeing through mental health services and awareness training tailored to women media practitioners.",
    textAm: "ለሴት የሚዲያ ባለሙያዎች በተዘጋጁ የስነ-ልቦና ጤና አገልግሎቶች እና የግንዛቤ ስልጠናዎች አማካይነት ጽናትን እና ደህንነትን ማሳደግ።",
  },
  {
    titleEn: "Amplifying Women’s Voices",
    titleAm: "የሴቶችን ድምጽ ማጎላት",
    textEn: "Enhance visibility and influence through the Women Experts’ Directory and awareness initiatives addressing issues that affect women.",
    textAm: "በሴት ባለሙያዎች ማውጫ እና ሴቶችን በሚነኩ ጉዳዮች ዙሪያ በሚደረጉ የግንዛቤ ተነሳሽነቶች ተደራሽነትን እና ተፅዕኖን ማሳደግ።",
  },
  {
    titleEn: "Evidence Generation",
    titleAm: "ማስረጃ ማመንጨት",
    textEn: "Conduct assessments and collaborate on research to identify barriers facing women in media, ensuring data-driven solutions.",
    textAm: "በሚዲያ ውስጥ ሴቶችን የሚያጋጥሟቸውን እንቅፋቶች ለመለየት ግምገማዎችን ማካሄድ እና በምርምር ላይ መተባበር።",
  },
  {
    titleEn: "Promoting Gender Transformation",
    titleAm: "የፆታ ለውጥን ማሳደግ",
    textEn: "Recognize and celebrate progress through Gender Transformative Media Awards that highlight institutions and individuals driving change.",
    textAm: "ለውጥ የሚያመጡ ተቋማትን እና ግለሰቦችን በሚሸልሙ የፆታ ለውጥ አምጪ የሚዲያ ሽልማቶች አማካይነት እድገትን እውቅና መስጠት።",
  },
  {
    titleEn: "Excellence Hub",
    titleAm: "የልቀት ማዕከል",
    textEn: "Serve as a central hub of excellence for gender and media.",
    textAm: "በፆታ እና በሚዲያ ዙሪያ የማዕከላዊ ልቀት ማዕከል ሆኖ ማገልገል።",
  },
];

const PROJECTS = [
  {
    period: "2020–2023",
    partner: "Civil Rights Defender",
    titleEn: "Solidarity Network and Capacity Building for Women Journalists in Ethiopia",
    titleAm: "በኢትዮጵያ ለሴት ጋዜጠኞች የአንድነት መረብ እና የአቅም ግንባታ",
    textEn: "Capacity development support for the revival of EMWA.",
    textAm: "ለEMWA ዳግም መነሳት የተደረገ የአቅም ግንባታ ድጋፍ።",
    statusEn: "Completed",
    statusAm: "ተጠናቋል",
  },
  {
    period: "Completed 2025",
    partner: "Civil Rights Defender",
    titleEn: "Consolidating Women Media Professionals’ Solidarity in Ethiopia",
    titleAm: "በኢትዮጵያ የሴት የሚዲያ ባለሙያዎችን አንድነት ማጠናከር",
    textEn: "Strengthened EMWA’s capacity, safeguarded women journalists, and fostered mentorship, internships, and solidarity.",
    textAm: "የEMWAን አቅም ማጠናከር፣ ሴት ጋዜጠኞችን መጠበቅ እና የአማካሪነት ድጋፍን እና አንድነትን ማሳደግ።",
    statusEn: "Completed",
    statusAm: "ተጠናቋል",
  },
  {
    period: "2025",
    partner: "Fojo Media Institute",
    titleEn: "Gender Equality in the Workplace",
    titleAm: "በስራ ቦታ የፆታ እኩልነት",
    textEn: "Advanced Ethiopia’s media gender policy through development, advocacy, stakeholder engagement, and awareness.",
    textAm: "በልማት፣ በተሟጋችነት፣ በባለድርሻ አካላት ተሳትፎ እና በግንዛቤ አማካይነት የኢትዮጵያን የሚዲያ ፆታ ፖሊሲ ማሳደግ።",
    statusEn: "Completed",
    statusAm: "ተጠናቋል",
  },
  {
    period: "2025",
    partner: "EliDA",
    titleEn: "Increasing Resilience to Online and Offline Violence in Ethiopia",
    titleAm: "በኢትዮጵያ ለኦንላይን እና ኦፍላይን ጥቃቶች የሚኖረውን ጽናት ማሳደግ",
    textEn: "Empowered women in media to counter online hate speech and technology-facilitated gender-based violence through digital literacy and advocacy.",
    textAm: "በዲጂታል እውቀት እና ተሟጋችነት አማካይነት በሴቶች ላይ የሚሰነዘሩ የኦንላይን የጥላቻ ንግግሮችን የመመከት አቅም ማሳደግ።",
    statusEn: "Completed",
    statusAm: "ተጠናቋል",
  },
  {
    period: "2024–2025",
    partner: "UNESCO",
    titleEn: "Women Journalists’ Mental Health Safety and Trauma Reporting",
    titleAm: "የሴት ጋዜጠኞች የስነ-ልቦና ጤና ደህንነት እና የአደጋ ዘገባ",
    textEn: "Strengthened the capacity of women journalists in conflict regions through trauma-informed reporting and mental wellbeing support.",
    textAm: "በግጭት ቀጠናዎች ውስጥ ያሉ ሴት ጋዜጠኞች የስነ-ልቦና ድጋፍ እና አደጋን ያገናዘበ ዘገባ እንዲያቀርቡ አቅማቸውን ማጠናከር።",
    statusEn: "Completed",
    statusAm: "ተጠናቋል",
  },
  {
    period: "2026",
    partner: "Grassroot Soccer",
    titleEn: "Mental Health Prevention and Promotion through Mass Media",
    titleAm: "በመገናኛ ብዙሃን አማካይነት የስነ-ልቦና ጤና መከላከል እና ማሳደግ",
    textEn: "Improving adolescent mental wellbeing through cognitive-behavioral approaches.",
    textAm: "የወጣቶችን የስነ-ልቦና ጤና ደህንነት በአስተሳሰብ እና በባህሪ አቀራረቦች ማሻሻል።",
    statusEn: "2026",
    statusAm: "2026",
  },
  {
    period: "2026",
    partner: "Partner initiative",
    titleEn: "Gender Equality in the Workplace II",
    titleAm: "በስራ ቦታ የፆታ እኩልነት II",
    textEn: "Developing a national media gender policy module and launching a dynamic Women Experts’ Directory.",
    textAm: "ሀገራዊ የሚዲያ ፆታ ፖሊሲ ሞጁል ማልማት እና የሴት ባለሙያዎች ማውጫን ማስመርቃት።",
    statusEn: "Ongoing",
    statusAm: "በተግባር ላይ",
  },
  {
    period: "2026–2028",
    partner: "Civil Society Innovation Fund",
    titleEn: "Amplifying Voices, Safeguarding Rights",
    titleAm: "ድምጾችን ማጎላት፣ መብቶችን ማስከበር",
    textEn: "Promoting media freedom and gender equality in Ethiopia.",
    textAm: "በኢትዮጵያ የሚዲያ ነፃነትን እና የፆታ እኩልነትን ማሳደግ።",
    statusEn: "Ongoing",
    statusAm: "በተግባር ላይ",
  },
];

function Programs() {
  const [activeView, setActiveView] = useState<"strategies" | "services" | "projects">("strategies");
  const { t, language } = useLanguage();

  return <PageShell>
    <section className="programs-hero" aria-labelledby="programs-heading">
      <div className="programs-hero-copy">
        <p className="programs-eyebrow">{t("Programs & Projects / EMWA", "ፕሮግራሞች እና ፕሮጀክቶች / EMWA")}</p>
        <h1 className="programs-hero-title" id="programs-heading">
          {language === "am" ? (
            <>
              ፕሮጀክቶችን ብቻ አንሰራም።<br />ኃይልን <em>እንገነባለን።</em>
            </>
          ) : (
            <>
              We don&apos;t run projects.<br />We build <em>power.</em>
            </>
          )}
        </h1>
        <p className="programs-hero-lede">
          {t(
            "Seven connected strategic programs that strengthen women media professionals, the Association, and the wider Ethiopian media sector.",
            "ሴት የሚዲያ ባለሙያዎችን፣ ማህበሩን እና ሰፊውን የኢትዮጵያ የሚዲያ ዘርፍ የሚያጠናክሩ ሰባት የተሳሰሩ ስትራቴጂያዊ ፕሮግራሞች።",
          )}
        </p>
        <div className="programs-hero-actions">
          <a href="#program-index" className="programs-primary-action">
            {t("Explore the work", "ስራዎቹን ይመልከቱ")} <ArrowDown aria-hidden="true" />
          </a>
          <Link to="/contact" className="programs-text-action">
            {t("Partner with us", "ከእኛ ጋር ይስሩ")} <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="programs-hero-visual">
        <img src={heroImg} alt="Women media professionals collaborating at an EMWA program" fetchPriority="high" />
        <div className="programs-hero-overlay" aria-hidden="true" />
        <div className="programs-hero-caption">
          <span>{t("From capacity to transformation", "ከአቅም ግንባታ እስከ ለውጥ")}</span>
          <strong>{t("Seven programs / One direction", "ሰባት ፕሮግራሞች / አንድ አቅጣጫ")}</strong>
        </div>
        <span className="programs-hero-ghost" aria-hidden="true">BUILD</span>
      </div>
    </section>

    <section className="programs-index" id="program-index">
      <nav className="programs-view-tabs" aria-label="Programs content">
        {([
          ["strategies", t("Core Strategies", "መሰረታዊ ስትራቴጂዎች")],
          ["services", t("Services", "አገልግሎቶች")],
          ["projects", t("Projects", "ፕሮጀክቶች")],
        ] as const).map(([value, label]) => (
          <button key={value} type="button" className={activeView === value ? "is-active" : ""} onClick={() => setActiveView(value as "strategies" | "services" | "projects")} aria-pressed={activeView === value}>
            <span>0{value === "strategies" ? 1 : value === "services" ? 2 : 3}</span>{label}
          </button>
        ))}
      </nav>
      <header className="programs-index-header">
        <div>
          <p className="programs-eyebrow">
            {activeView === "strategies"
              ? t("Core Strategies", "መሰረታዊ ስትራቴጂዎች")
              : activeView === "services"
              ? t("What we offer", "የምናቀርበው")
              : t("Our portfolio", "የፕሮጀክቶቻችን ማህደር")}
          </p>
          <h2>
            {activeView === "strategies"
              ? t("Find your pathway.", "መንገድዎን ያግኙ።")
              : activeView === "services"
              ? t("Services that move media forward.", "ሚዲያን ወደፊት የሚያራምዱ አገልግሎቶች።")
              : t("Change, delivered.", "የተከናወኑ ለውጦች።")}
          </h2>
        </div>
        <p>
          {activeView === "strategies"
            ? t("Explore EMWA's seven strategic areas for institutional strength, professional growth, knowledge, advocacy, sustainability, and partnership.", "ለተቋማዊ ጥንካሬ፣ ለሙያ እድገት፣ በእውቀት፣ በተሟጋችነት፣ በዘላቂነት እና በአጋርነት የEMWAን ሰባት ስትራቴጂያዊ ዘርፎች ይመልከቱ።")
            : activeView === "services"
            ? t("Practical, evidence-led services designed to strengthen women media practitioners and transform Ethiopia’s media sector.", "ሴት የሚዲያ ባለሙያዎችን ለማጠናከር እና የኢትዮጵያን የሚዲያ ዘርፍ ለመለወጥ የተነደፉ ተግባራዊ አገልግሎቶች።")
            : t("A record of partnerships that turn solidarity, safety, equality, and professional growth into measurable action.", "አንድነትን፣ ደህንነትን፣ እኩልነትን እና የሙያ እድገትን ወደ ተግባር የለወጡ የአጋርነቶች ታሪክ።")}
        </p>
      </header>
      {activeView === "strategies" && <div className="programs-grid programs-view-enter" aria-live="polite">
        {PROGRAMS.map((program, index) => <article key={program.titleEn} className="program-card" style={{ "--program-index": index } as CSSProperties}>
          <div className="program-card-top"><span>0{index + 1}</span><span className="program-status is-live">{t("Strategic program", "ስትራቴጂያዊ ፕሮግራም")}</span></div>
          <div className="program-card-main">
            <p>{language === "am" ? program.focusAm : program.focusEn}</p>
            <h3>{language === "am" ? program.titleAm : program.titleEn}</h3>
            <div className="program-card-hidden">
              <ul className="program-card-priorities">
                {(language === "am" ? program.itemsAm : program.itemsEn).map((item) => <li key={item}>{item}</li>)}
              </ul>
              <Link to="/contact">{t("Connect with the program", "ከፕሮግራሙ ጋር ይገናኙ")} <ArrowUpRight aria-hidden="true" /></Link>
            </div>
          </div>
          <div className="program-card-impact"><span>{t("Priority areas", "የቅድሚያ ዘርፎች")}</span><strong>{program.itemsEn.length}</strong></div>
        </article>)}
      </div>}
      {activeView === "services" && <div className="programs-services programs-view-enter" aria-live="polite">
        {SERVICES.map((service, index) => <article key={service.titleEn}>
          <span>0{index + 1}</span>
          <div>
            <p className="programs-eyebrow">{t("EMWA service", "የEMWA አገልግሎት")}</p>
            <h3>{language === "am" ? service.titleAm : service.titleEn}</h3>
            <p>{language === "am" ? service.textAm : service.textEn}</p>
          </div>
          <ArrowUpRight aria-hidden="true" />
        </article>)}
      </div>}
      {activeView === "projects" && <div className="programs-projects programs-view-enter" aria-live="polite">
        {PROJECTS.map((project, index) => <article key={project.titleEn}>
          <div className="programs-project-rail"><span>0{index + 1}</span><i /></div>
          <div className="programs-project-copy">
            <div className="programs-project-meta">
              <span>{project.period}</span>
              <span>{project.partner}</span>
              <b className={project.statusEn === "Ongoing" ? "is-ongoing" : ""}>{language === "am" ? project.statusAm : project.statusEn}</b>
            </div>
            <h3>{language === "am" ? project.titleAm : project.titleEn}</h3>
            <p>{language === "am" ? project.textAm : project.textEn}</p>
          </div>
        </article>)}
      </div>}
    </section>

    <section className="programs-cta">
      <p className="programs-eyebrow">{t("Your next chapter", "ቀጣዩ ምዕራፍዎ")}</p>
      <h2>
        {language === "am" ? (
          <>
            ድምፅዎን ያምጡ።<br /><em>መድረኩን እንገነባለን።</em>
          </>
        ) : (
          <>
            Bring your voice.<br /><em>We&apos;ll build the platform.</em>
          </>
        )
        }
      </h2>
      <div>
        <Link to="/membership">{t("Join the association", "ማህበሩን ይቀላቀሉ")} <ArrowUpRight aria-hidden="true" /></Link>
        <Link to="/contact">{t("Fund a program", "ፕሮግራም ይደግፉ")}</Link>
      </div>
    </section>
  </PageShell>;
}
