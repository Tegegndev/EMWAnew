import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Check,
  MapPin,
  Share2,
  Users,
  X,
} from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import globalImg from "@/assets/emwa-group-photo.png";
import { useLanguage } from "@/lib/language-context";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About EMWA — Ethiopian Media Women Association" },
    { name: "description", content: "Learn about EMWA's mission, vision, values, strategic programs, services, and commitment to women in Ethiopian media." },
    { property: "og:title", content: "About EMWA" },
    { property: "og:description", content: "Empowering women in and through the media since 1999." },
  ] }),
  component: About,
});

const VALUES = [
  {
    en: ["Integrity", "Upholding honesty, transparency, and ethical conduct."],
    am: ["ታማኝነት", "ታማኝነትን፣ ግልጽነትን እና ሥነ-ምግባራዊ አሰራርን ማስከበር።"],
  },
  {
    en: ["Solidarity", "Promoting unity, collaboration, and mutual support."],
    am: ["አንድነት", "አንድነትን፣ ትብብርን እና பரஸ்பር ድጋፍን ማሳደግ።"],
  },
  {
    en: ["Inclusiveness", "Ensuring diversity, equal opportunity, and meaningful participation."],
    am: ["አካታችነት", "ብዝሃነትን፣ እኩል ዕድልን እና ትርጉም ያለው ተሳትፎን ማረጋገጥ።"],
  },
  {
    en: ["Professionalism", "Maintaining excellence, competence, and ethical standards."],
    am: ["ሙያዊነት", "ልቀትን፣ ብቃትን እና የሥነ-ምግባር ደረጃዎችን መጠበቅ።"],
  },
  {
    en: ["Accountability & Transparency", "Taking responsibility and promoting openness in decision-making."],
    am: ["ተጠያቂነት እና ግልጽነት", "ኃላፊነትን መውሰድ እና በውሳኔ አሰጣጥ ላይ ግልጽነትን ማሳደግ።"],
  },
];

const WORK = [
  {
    en: "Empower women journalists and media professionals",
    am: "ሴት ጋዜጠኞችን እና የሚዲያ ባለሙያዎችን ማብቃት",
  },
  {
    en: "Promote gender equality and women's leadership in media",
    am: "በሚዲያ ውስጥ የፆታ እኩልነትን እና የሴቶችን አመራርነት ማሳደግ",
  },
  {
    en: "Advocate for safe, ethical, and gender-sensitive journalism",
    am: "ደህንነቱ የተጠበቀ፣ ሥነ-ምግባራዊ እና ለፆታ ተቆርቋሪ የሆነ ጋዜጠኝነትን መሟገት",
  },
  {
    en: "Build professional capacity through training, mentoring, and coaching",
    am: "በስልጠና፣ በምክር እና በአሰልጣኝነት የሙያ አቅምን መገንባት",
  },
  {
    en: "Conduct research on gender and media",
    am: "በፆታ እና በሚዲያ ዙሪያ ምርምሮችን ማካሄድ",
  },
  {
    en: "Support policy advocacy and media-sector reform",
    am: "የፖሊሲ ተሟጋችነትን እና የሚዲያ ዘርፍ ማሻሻያዎችን መደገፍ",
  },
  {
    en: "Strengthen networking and collaboration among media professionals",
    am: "በሚዲያ ባለሙያዎች መካከል ትስስርን እና ትብብርን ማጠናከር",
  },
  {
    en: "Increase women's participation in leadership and decision-making",
    am: "በአመራርነት እና በውሳኔ ሰጪነት የሴቶችን ተሳትፎ ማሳደግ",
  },
  {
    en: "Promote media freedom, professionalism, and ethical standards",
    am: "የሚዲያ ነፃነትን፣ ሙያዊነትን እና የሥነ-ምግባር ደረጃዎችን ማሳደግ",
  },
];

const SERVICES = [
  { en: "Professional training", am: "የሙያ ስልጠና" },
  { en: "Capacity-building workshops", am: "የአቅም ግንባታ ወርክሾፖች" },
  { en: "Research and publications", am: "ምርምር እና ህትመቶች" },
  { en: "Policy advocacy", am: "የፖሊሲ ተሟጋችነት" },
  { en: "Networking opportunities", am: "የትስስር ዕድሎች" },
  { en: "Media development initiatives", am: "የሚዲያ ልማት ተነሳሽነቶች" },
  { en: "Mentorship programs", am: "የአማካሪነት ፕሮግራሞች" },
  { en: "Resource center", am: "የመረጃ ማዕከል" },
  { en: "Knowledge sharing", am: "የእውቀት ልውውጥ" },
  { en: "Consultation on gender and media", am: "በፆታ እና በሚዲያ ዙሪያ የምክር አገልግሎት" },
];

const BENEFICIARIES = [
  { en: "Women journalists", am: "ሴት ጋዜጠኞች" },
  { en: "Media professionals", am: "የሚዲያ ባለሙያዎች" },
  { en: "Young journalists", am: "ወጣት ጋዜጠኞች" },
  { en: "Journalism students", am: "የጋዜጠኝነት ተማሪዎች" },
  { en: "Media organizations", am: "የሚዲያ ተቋማት" },
  { en: "Civil society organizations", am: "የሲቪል ማህበረሰብ ድርጅቶች" },
  { en: "Government institutions", am: "የመንግስት ተቋማት" },
  { en: "Researchers", am: "ተመራማሪዎች" },
  { en: "Development partners", am: "የልማት አጋሮች" },
];

const STAKEHOLDERS = [
  { en: "EMWA Members", am: "የEMWA አባላት" },
  { en: "Media Houses", am: "የመገናኛ ብዙሃን ማዕከላት" },
  { en: "Government Agencies", am: "የመንግስት ኤጀንሲዎች" },
  { en: "Donors", am: "ለጋሾች" },
  { en: "Peer Associations", am: "እህት ማህበራት" },
  { en: "Board of Directors", am: "የሥራ አስፈጻሚ ቦርድ" },
  { en: "EMWA Management", am: "የEMWA ማኔጅመንት" },
  { en: "EMWA Staff", am: "የEMWA ሠራተኞች" },
];

const VALUE_IMAGES = [
  "/about/integrity.png",
  "/about/Solidarity.jpg",
  "/about/inclusiveness.jpg",
  "/about/Professionalism.jpg",
  "/about/accountability%20and%20transparency.jpg",
];

const BOARD_MEMBERS = [
  {
    name: "Konjit Zewede",
    nameAm: "ኮንጅት ዘውዴ",
    role: "Media and Advocacy Expert",
    roleAm: "የሚዲያ እና የተሟጋችነት ባለሙያ",
    image: "/bord_memeberes/konjit%20zewde.jpg",
    bio: "Konjit Zewede is a media and advocacy expert, communication and public relations specialist with over ten years of experience across Ethiopia's public and private media. She has worked with leading organizations including Fana Broadcasting Corporation as a reporter and news anchor, and currently serves as Chief Editor at National Broadcasting Services (NBC) Ethiopia, one of the country's leading broadcasters. Her career highlights include successful documentary production, government and community project follow-up, impactful news coverage, and advancing women's empowerment initiatives across diverse sectors. Konjit combines technical excellence in media production with a strong commitment to gender equality and amplifying women's voices.",
    bioAm: "ኮንጅት ዘውዴ በኢትዮጵያ የመንግሥትና የሕዝብ ሚዲያ ውስጥ ከአሥር ዓመታት በላይ ልምድ ያላት የሚዲያ፣ የተሟጋችነት፣ የኮሙኒኬሽንና የሕዝብ ግንኙነት ስፔሻሊስት ናት። በፋና ብሮድካስቲንግ ኮርፖሬሽን በሪፖርተርነትና በዜና አቅራቢነት የሠራች ሲሆን፣ በአሁኑ ወቅት የናሽናል ብሮድካስቲንግ ሰርቪስ (NBC) ኢትዮጵያ ዋና አዘጋጅ ሆና ታገለግላለች።",
  },
  {
    name: "Sara Moges",
    nameAm: "ሳራ ሞገስ",
    role: "Media Executive",
    roleAm: "የሚዲያ ስራ አስፈጻሚ",
    image: "/bord_memeberes/sara%20moges.jpg",
    bio: "Sara Moges is an Ethiopian media executive, journalist, producer, strategic communications professional, trainer, and author with more than a decade of experience in broadcasting, public relations, media research, broadcast program production, and leadership. She is Chief Executive Officer of Tirita FM 97.6, providing strategic, editorial, operational, and business-development leadership while heading the Fact-Checking Desk to strengthen information integrity and public trust. She designs and delivers training on communication, content development, fact-checking, media literacy, and awareness creation. Her career spans Tirita FM, NBC Ethiopia, Seba Dereja Media Network, Ethiopian Tourism Organization, and cultural-event production. Sara holds an MA in Documentary Linguistics and Culture and a BA in Foreign Languages and Literature from Addis Ababa University. She is the author of the Amharic poetry collection ሰካራሙ ስንኞች.",
    bioAm: "ሳራ ሞገስ በብሮድካስቲንግ፣ በሕዝብ ግንኙነት፣ በሚዲያ ምርምር እና በአመራርነት ከአሥር ዓመታት በላይ ልምድ ያላት የሚዲያ ሥራ አስፈጻሚ፣ ጋዜጠኛ፣ ፕሮዲዩሰር እና ደራሲ ናት። የጥሪታ ኤፍኤም 97.6 ዋና ሥራ አስፈጻሚ ስትሆን፣ የሐሰተኛ መረጃ ማጣሪያ ክፍሉንም ትመራለች። የሰካራሙ ስንኞች የቅኔ መድበል ደራሲ ናት።",
  },
  {
    name: "Fitih Alemu",
    nameAm: "ፍትህ አለሙ",
    role: "Journalism Educator",
    roleAm: "የጋዜጠኝነት አስተማሪ",
    image: "/bord_memeberes/fitih-alemu.jpeg",
    bio: "Fitih Alemu is a journalism educator, researcher, media development professional, and trainer with more than 13 years of experience in journalism teaching, corporate communication, and public relations. She has worked extensively in strategic communication and project implementation, with a strong focus on advancing gender equality in Ethiopian journalism practice and education. As co-founder of the Ethiopian Journalism Educators' Network, she has taught and mentored aspiring journalists at the university level and serves as a research and training consultant specializing in gender, media, communication, and institutional capacity building. Her work includes initiatives that strengthen the role of women journalists, promote gender equality in media, and advance ethical, inclusive journalism.",
    bioAm: "ፍትህ አለሙ በጋዜጠኝነት ማስተማር፣ በኮርፖሬት ኮሙኒኬሽን እና በሕዝብ ግንኙነት ከ13 ዓመታት በላይ ልምድ ያላት የጋዜጠኝነት አስተማሪ፣ ተመራማሪ እና አሰልጣኝ ናት። የኢትዮጵያ ጋዜጠኝነት አስተማሪዎች መረብ መስራች አባል ናት።",
  },
  {
    name: "Mihret Aschalew",
    nameAm: "ምህረት አስቻለው",
    role: "Media and Communications Specialist",
    roleAm: "የሚዲያ እና ኮሙኒኬሽን ስፔሻሊስት",
    image: "/bord_memeberes/mihret-aschalew.jpeg",
    bio: "Mihret Aschalew is a senior media and communications specialist with extensive leadership experience in international journalism, global development, and public health. She currently serves as Communications Advisor at JSI, a U.S.-based international organization advancing global health and education. Her career includes senior roles such as Senior Editor at The Reporter Newspaper, Multimedia Journalist for BBC World Horn of Africa Service, Project Manager at BBC Media Action, and Communications Officer for UN Women. Her expertise lies at the intersection of media, communications, and gender advocacy. Mihret holds a Master's in Journalism and Communication, a BA in Political Science, and specialized training in Project Planning and Management from Makerere University. She is a member of FEMNET.",
    bioAm: "ምህረት አስቻለው በዓለም አቀፍ ጋዜጠኝነት፣ በልማት እና በሕዝብ ጤና ዘርፍ ሰፊ የአመራር ልምድ ያላት ከፍተኛ የሚዲያ እና ኮሙኒኬሽን ስፔሻሊስት ናት። በJSI የኮሙኒኬሽን አማካሪ ሆና የምትሰራ ሲሆን በሪፖርተር ጋዜጣ፣ በቢቢሲ እና በUN Women በከፍተኛ ኃላፊነት አገልግላለች።",
  },
  {
    name: "Tsega Tariku",
    nameAm: "ፀጋ ታሪኩ",
    role: "Journalist and Media Leader",
    roleAm: "ጋዜጠኛ እና የሚዲያ መሪ",
    image: "/bord_memeberes/tsega-tariku.jpeg",
    bio: "Tsega Tariku is a distinguished Ethiopian journalist and media leader with over sixteen years of dynamic experience at Fana Media Corporation. Rising from reporter to Editor-in-Chief, she has excelled as a radio host, television presenter, and digital content creator. Her work is defined by specialization in gender, environment, health, and business reporting, consistently championing gender advocacy across platforms. Holding a Master's in Public Diplomacy from Jilin University, China, Tsega is also a trainer, public speaker, and regional media representative. Currently serving as Director of Branding, Creative and Quality Control at Fana Media Corporation, she continues to shape impactful narratives and drive innovation in Ethiopian media.",
    bioAm: "ፀጋ ታሪኩ በፋና ሚዲያ ኮርፖሬሽን ከአሥራ ስድስት ዓመታት በላይ ልምድ ያላት ታዋቂ ጋዜጠኛ እና የሚዲያ መሪ ናት። ከሪፖርተርነት እስከ ዋና አዘጋጅነት የሰራች ሲሆን በአሁኑ ወቅት በፋና ሚዲያ ኮርፖሬሽን የብራንዲንግ፣ ክሬኤቲቭ እና ጥራት ቁጥጥር ዳይሬክተር ሆና ታገለግላለች።",
  },
  {
    name: "Rihana Abdella Ahmed",
    nameAm: "ሪሃና አብደላ አህመድ",
    role: "Journalist",
    roleAm: "ጋዜጠኛ",
    image: "/bord_memeberes/rihana.jpg",
    bio: "Rihana Abdella Ahmed is a seasoned journalist with over a decade of experience. She spent five years at Afar Region Television Station as a reporter and news anchor, covering regional, national, and international issues, including frontline conflict reporting. Passionate about mentoring, she volunteered at Samara University to share field experiences with journalism students and trained graduates on bridging academic and professional practice. She also empowered young women through life skills training at a local boarding school. Rihana holds degrees in Management and Civil Engineering, and a Master's in Political Science and International Relations. She currently serves as Senior Reporter at Addis Media Network.",
    bioAm: "ሪሃና አብደላ አህመድ ከአሥር ዓመታት በላይ ልምድ ያላት ልምድ ያለው ጋዜጠኛ ናት። በአፋር ክልል ቴሌቪዥን ጣቢያ በሪፖርተርነትና በዜና አቅራቢነት የሰራች ሲሆን በአሁኑ ወቅት በአዲስ ሚዲያ ኔትወርክ மூስተኛ ሪፖርተር ሆና ታገለግላለች።",
  },
  {
    name: "Maya Misikir",
    nameAm: "ማያ ምስክር",
    role: "Journalist & Communications Specialist",
    roleAm: "ጋዜጠኛ እና ኮሙኒኬሽን ስፔሻሊስት",
    image: "/bord_memeberes/maya misikr.jpg",
    bio: "Maya Misikir is an award-winning freelance journalist and communications specialist based in Addis Ababa with over a decade of experience reporting on politics, human rights, governance, and social issues. She founded Sifter, a weekly newsletter analyzing Ethiopia's leading human rights stories, and previously produced newsletters for The Fuller Project. Maya has reported for Voice of America and developed strategic communications for the EU Delegation to Ethiopia, UNECA, USAID, and GIZ. Her expertise spans writing, editing, media analysis, multimedia storytelling, and training. Formerly Deputy Editor-in-Chief of Addis Fortune, she has reported on women's rights, migration, labor, and conflict for outlets including The New York Times, Foreign Policy, and The Continent.",
    bioAm: "ማያ ምስክር በአዲስ አበባ የምትኖር ተሸላሚ ነፃ ጋዜጠኛ እና የኮሙኒኬሽን ስፔሻሊስት ናት። ስለ ፖለቲካ፣ ሰብአዊ መብቶች እና ማህበራዊ ጉዳዮች የሚዘግበውን 'Sifter' የተሰኘ ሳምንታዊ መጽሔት መስራች ናት።",
  },
];

type BoardMember = (typeof BOARD_MEMBERS)[number];

const memberSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function BoardSection() {
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { t, language } = useLanguage();

  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const targetOffsetRef = useRef(0);
  const isNudgingRef = useRef(false);
  const directionRef = useRef<1 | -1>(1);

  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const hasDraggedRef = useRef(false);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    const speed = 0.045; // smooth scrolling speed in px/ms

    const animate = (time: number) => {
      const delta = Math.min(time - lastTime, 64);
      lastTime = time;

      const track = trackRef.current;
      if (track) {
        const singleGroup = track.firstElementChild as HTMLElement | null;
        const groupWidth = singleGroup ? singleGroup.offsetWidth : track.scrollWidth / 3;

        if (groupWidth > 0) {
          if (isNudgingRef.current) {
            const diff = targetOffsetRef.current - offsetRef.current;
            if (Math.abs(diff) > 0.5) {
              offsetRef.current += diff * 0.14;
            } else {
              offsetRef.current = targetOffsetRef.current;
              isNudgingRef.current = false;
            }
          } else if (!isPaused && !isHovered && !isDraggingRef.current) {
            offsetRef.current += directionRef.current * speed * delta;
          }

          while (offsetRef.current >= groupWidth) {
            offsetRef.current -= groupWidth;
            if (isNudgingRef.current) targetOffsetRef.current -= groupWidth;
          }
          while (offsetRef.current < 0) {
            offsetRef.current += groupWidth;
            if (isNudgingRef.current) targetOffsetRef.current += groupWidth;
          }

          track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, isHovered]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartOffsetRef.current = offsetRef.current;
    isNudgingRef.current = false;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = dragStartXRef.current - e.clientX;
    if (Math.abs(dx) > 6) {
      hasDraggedRef.current = true;
    }
    offsetRef.current = dragStartOffsetRef.current + dx;
    if (dx !== 0) {
      directionRef.current = dx > 0 ? 1 : -1;
    }
  };

  const handlePointerUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY * 0.75;
    if (Math.abs(delta) > 0.5) {
      offsetRef.current += delta;
      directionRef.current = delta > 0 ? 1 : -1;
      isNudgingRef.current = false;
    }
  };

  return (
    <section className="about-board" aria-labelledby="board-heading">
      <header className="about-board-header">
        <div>
          <p className="about2-eyebrow">{t("Our leadership", "የእኛ አመራር")}</p>
          <h2 id="board-heading">{t("Meet the Board.", "የቦርድ አባላታችንን ይወቁ።")}</h2>
        </div>
        <p>
          {t(
            "EMWA's Board provides strategic direction, governance, and oversight while championing the Association's commitment to women in media. Select a portrait to learn more.",
            "የEMWA ቦርድ ስትራቴጂያዊ አቅጣጫን፣ አስተዳደርን እና ቁጥጥርን ይሰጣል፤ በሚዲያ ውስጥ ላሉ ሴቶች ያለውን ቁርጠኝነት ያጎላል። ተጨማሪ ለማወቅ ምስሉን ይምረጡ።",
          )}
        </p>
      </header>

      <div
        className={`about-board-carousel ${isDragging ? "is-dragging" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handlePointerUp();
        }}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      >
        <div className="about-board-track" ref={trackRef}>
          {[0, 1, 2].map((group) => (
            <div className="about-board-group" aria-hidden={group > 0} key={group}>
              {BOARD_MEMBERS.map((member) => (
                <article className="about-board-card" key={`${group}-${member.name}`}>
                  <a
                    className="about-board-portrait"
                    href={`/about?member=${encodeURIComponent(memberSlug(member.name))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (hasDraggedRef.current) {
                        e.preventDefault();
                      }
                    }}
                    aria-label={`Read more about ${member.name} in a new tab`}
                    tabIndex={group > 0 ? -1 : 0}
                  >
                    <img src={member.image} alt="" loading="lazy" />
                    <span>{t("View profile", "መገለጫ ይመልከቱ")}</span>
                  </a>
                  <div className="about-board-card-body">
                    <p className="about-board-role">
                      {language === "am" ? member.roleAm : member.role}
                    </p>
                    <h3>
                      <a
                        href={`/about?member=${encodeURIComponent(memberSlug(member.name))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (hasDraggedRef.current) {
                            e.preventDefault();
                          }
                        }}
                        tabIndex={group > 0 ? -1 : 0}
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        {language === "am" ? member.nameAm : member.name}
                      </a>
                    </h3>
                  </div>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ValueStory({ value, index }: { value: { en: string[]; am: string[] }; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const currentVal = language === "am" ? value.am : value.en;

  return <article ref={ref} className={`about-manifesto-item about-scroll-reveal${index % 2 ? " about-manifesto-item--reverse" : ""}${visible ? " is-visible" : ""}`}>
    <span className="about-manifesto-number" aria-hidden="true">0{index + 1}</span>
    <div className="about-manifesto-image-wrap"><img src={VALUE_IMAGES[index]} alt="" loading="lazy" className="about-manifesto-image" /><span className="about-manifesto-image-shade" aria-hidden="true" /></div>
    <div className="about-manifesto-panel"><p className="about-manifesto-kicker">{language === "am" ? `ቁርጠኝነት 0${index + 1}` : `Commitment 0${index + 1}`}</p><h3 className="about-manifesto-name">{currentVal[0]}</h3><p className="about-manifesto-body">{currentVal[1]}</p><span className="about-manifesto-rule" aria-hidden="true" /></div>
  </article>;
}

function About() {
  const { t, language } = useLanguage();
  const [selectedMember, setSelectedMember] = useState<BoardMember | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const selectMember = (member: BoardMember | null, replace = false) => {
    setSelectedMember(member);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (member) {
      url.searchParams.set("member", memberSlug(member.name));
      if (replace) {
        window.history.replaceState({}, "", url.toString());
      } else {
        window.history.pushState({}, "", url.toString());
      }
    } else {
      url.searchParams.delete("member");
      url.searchParams.delete("board");
      const cleanUrl = url.pathname + (url.search ? url.search : "");
      if (replace) {
        window.history.replaceState({}, "", cleanUrl);
      } else {
        window.history.pushState({}, "", cleanUrl);
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const target = params.get("member") || params.get("board");
    if (target) {
      const match = BOARD_MEMBERS.find(
        (m) =>
          memberSlug(m.name) === target.toLowerCase() ||
          m.name.toLowerCase() === decodeURIComponent(target).toLowerCase() ||
          (m.nameAm && m.nameAm === decodeURIComponent(target)),
      );
      if (match) {
        setSelectedMember(match);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const target = params.get("member") || params.get("board");
      if (target) {
        const match = BOARD_MEMBERS.find(
          (m) =>
            memberSlug(m.name) === target.toLowerCase() ||
            m.name.toLowerCase() === decodeURIComponent(target).toLowerCase() ||
            (m.nameAm && m.nameAm === decodeURIComponent(target)),
        );
        setSelectedMember(match || null);
      } else {
        setSelectedMember(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (selectedMember) {
      document.title = `${language === "am" ? selectedMember.nameAm : selectedMember.name} — EMWA Board of Directors`;
    } else {
      document.title = "About EMWA — Ethiopian Media Women Association";
    }
  }, [selectedMember, language]);

  const copyMemberLink = async (member: BoardMember) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set("member", memberSlug(member.name));
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      const input = document.createElement("input");
      input.value = url.toString();
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (selectedMember) {
    const otherMembers = BOARD_MEMBERS.filter((m) => m.name !== selectedMember.name);
    return (
      <PageShell>
        <div className="expert-detail-container">
          <div className="expert-detail-top-nav">
            <button
              type="button"
              className="expert-detail-back"
              onClick={() => {
                selectMember(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <ArrowLeft />
              <span>{t("Back to About EMWA", "ወደ ስለ ማህበሩ ተመለስ")}</span>
            </button>

            <div className="expert-detail-actions">
              <button
                type="button"
                className={`expert-detail-action-btn${copiedLink ? " is-active" : ""}`}
                onClick={() => void copyMemberLink(selectedMember)}
                aria-label={copiedLink ? t("Link copied!", "ሊንኩ ተገልብጧል!") : t("Copy profile link", "የመገለጫ ሊንክ ቅዳ")}
                title={copiedLink ? t("Link copied to clipboard!", "ሊንኩ ተገልብጧል!") : t("Copy profile link to share", "ሊንክ ገልብጥና አጋራ")}
              >
                {copiedLink ? <Check /> : <Share2 />}
                <span>{copiedLink ? t("Link copied!", "ተገልብጧል!") : t("Share profile", "መገለጫ አጋራ")}</span>
              </button>
            </div>
          </div>

          <div className="expert-detail-grid">
            <aside className="expert-detail-sidebar">
              <div className="expert-detail-media">
                <div className="expert-detail-photo">
                  <img
                    src={selectedMember.image}
                    alt={language === "am" ? selectedMember.nameAm : selectedMember.name}
                    className="size-full object-cover object-top"
                  />
                </div>
              </div>
            </aside>

            <main className="expert-detail-main">
              <p className="expert-detail-eyebrow">
                <BadgeCheck /> {t("EMWA Executive Board Member", "የEMWA ሥራ አስፈጻሚ ቦርድ አባል")}
              </p>
              <h1 className="expert-detail-title">{language === "am" ? selectedMember.nameAm : selectedMember.name}</h1>
              <p className="expert-detail-field">{language === "am" ? selectedMember.roleAm : selectedMember.role}</p>
              <p className="expert-detail-region">
                <MapPin /> {t("Addis Ababa, Ethiopia", "አዲስ አበባ፣ ኢትዮጵያ")}
              </p>
              <div className="expert-detail-rule" />

              <h2 className="expert-detail-section-title">{t("Leadership Biography", "የአመራር ታሪክ")}</h2>
              <p className="expert-detail-bio">
                {language === "am" && selectedMember.bioAm ? selectedMember.bioAm : selectedMember.bio}
              </p>

              <h2 className="expert-detail-section-title">{t("Strategic Focus & Oversight", "ስትራቴጂያዊ ትኩረት እና ቁጥጥር")}</h2>
              <div className="expert-detail-tags">
                <span>{language === "am" ? selectedMember.roleAm : selectedMember.role}</span>
                <span>{t("Strategic Governance", "ስትራቴጂያዊ አስተዳደር")}</span>
                <span>{t("Media & Advocacy Leadership", "የሚዲያና የተሟጋችነት አመራር")}</span>
                <span>{t("Gender Equality Champion", "የፆታ እኩልነት ተሟጋች")}</span>
                <span>{t("Institutional Oversight", "ተቋማዊ ቁጥጥር")}</span>
              </div>
            </main>
          </div>

          {otherMembers.length > 0 && (
            <section className="expert-detail-related">
              <div className="expert-detail-related-header">
                <div>
                  <p className="experts-eyebrow">{t("Executive Leadership", "የሥራ አስፈጻሚ አመራር")}</p>
                  <h2>{t("Explore Other Board Members", "ሌሎች የቦርድ አባላትን ይመልከቱ")}</h2>
                </div>
                <button
                  type="button"
                  className="expert-detail-back"
                  onClick={() => {
                    selectMember(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {t("View All Leadership", "ሁሉንም አመራሮች ይመልከቱ")} <ArrowUpRight aria-hidden="true" />
                </button>
              </div>

              <div className="expert-detail-related-grid">
                {otherMembers.map((member) => (
                  <article className="expert-card" key={member.name}>
                    <button
                      type="button"
                      className="expert-card-image"
                      onClick={() => {
                        selectMember(member);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      aria-label={`View ${member.name}'s profile`}
                    >
                      <img
                        src={member.image}
                        alt={member.name}
                        loading="lazy"
                        className="absolute inset-0 size-full object-cover object-top"
                      />
                      <span className="expert-card-category">{language === "am" ? member.roleAm : member.role}</span>
                      <span className="expert-card-open">
                        <ArrowUpRight aria-hidden="true" />
                      </span>
                    </button>
                    <div className="expert-card-copy">
                      <p className="expert-card-verified">
                        <BadgeCheck aria-hidden="true" /> {t("EMWA Board", "የEMWA ቦርድ")}
                      </p>
                      <h3>{language === "am" ? member.nameAm : member.name}</h3>
                      <p className="expert-card-field">{language === "am" ? member.roleAm : member.role}</p>
                      <p className="expert-card-region">
                        <MapPin aria-hidden="true" /> {t("Addis Ababa, Ethiopia", "አዲስ አበባ፣ ኢትዮጵያ")}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          selectMember(member);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        {t("View profile", "መገለጫ ይመልከቱ")} <ArrowUpRight aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="expert-detail-cta-banner">
            <div>
              <p className="experts-eyebrow">{t("Governance & Association Leadership", "አስተዳደር እና የማህበሩ አመራር")}</p>
              <h3>{t("Engage with Ethiopian Media Women Association", "ከኢትዮጵያ ሚዲያ ሴቶች ማህበር ጋር ይገናኙ")}</h3>
              <p>{t("EMWA's Board provides strategic direction, governance, and oversight while championing the Association's commitment to women in media.", "የEMWA ቦርድ ስትራቴጂያዊ አቅጣጫን፣ አስተዳደርን እና ቁጥጥርን ይሰጣል፤ በሚዲያ ውስጥ ላሉ ሴቶች ያለውን ቁርጠኝነት ያጎላል።")}</p>
            </div>
            <button
              type="button"
              className="expert-detail-cta-btn"
              onClick={() => {
                selectMember(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <span>{t("Explore Association Overview", "ስለ ማህበሩ ሙሉ መረጃ ይመልከቱ")}</span>
              <ArrowUpRight />
            </button>
          </section>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHero
        eyebrow={t("About the Association / Since 1998", "ስለ ማህበሩ / ከ1998 ጀምሮ")}
        title={<>{t("Women shaping media.", "ሴቶች ሚዲያን ይቀርጻሉ።")}<br /><span className="text-primary">{t("Media shaping equality.", "ሚዲያ እኩልነትን ይገነባል።")}</span></>}
        lede={t(
          "The Ethiopian Media Women Association is a membership organization advancing gender equality, professional excellence, and inclusive practices across Ethiopia's media sector.",
          "የኢትዮጵያ ሚዲያ ሴቶች ማህበር በኢትዮጵያ የሚዲያ ዘርፍ የፆታ እኩልነትን፣ የሙያ ልቀትንና አካታች አሠራሮችን የሚያራምድ የአባልነት ማህበር ነው።",
        )}
      />

      <section className="about2-intro">
        <div className="about2-image"><img src={globalImg} alt="Women media professionals working together" loading="eager" /><span>{t("Established / 1998", "ተመሠረተ / 1998 ዓ.ም")}</span></div>
        <div className="about2-story">
          <p className="about2-eyebrow">{t("Who we are", "እኛ ማን ነን")}</p>
          <h2>{t("Built by women journalists.", "በሴት ጋዜጠኞች የተገነባ።")}<br />{t("Driven by lasting change.", "በዘላቂ ለውጥ የሚመራ።")}</h2>
          <p>{t(
            "The Ethiopian Media Women Association (EMWA), established in 1998, is a membership organization with members across all regions of Ethiopia. Guided by its bylaw, EMWA offers full membership to women media practitioners, while also welcoming associate members—individuals interested in media as well as male practitioners—who share our vision of advancing gender equality in the sector.",
            "በ1998 የተመሠረተው የኢትዮጵያ ሚዲያ ሴቶች ማህበር (EMWA) በሁሉም የኢትዮጵያ ክልሎች አባላት ያሉት የአባልነት ድርጅት ነው። በመተዳደሪያ ደንቡ መሠረት ለሴት የሚዲያ ባለሙያዎች ሙሉ አባልነት ይሰጣል፤ በሚዲያ ፍላጎት ያላቸውን ግለሰቦችና ወንድ ባለሙያዎችንም በተባባሪ አባልነት ይቀበላል።",
          )}</p>
          <p>{t(
            "EMWA's strategic priorities are anchored in capacity building, evidence-based research and advocacy, strategic partnerships, and resource mobilization. Through these pillars, we empower women media practitioners, support media institutions in creating enabling workplaces, and promote inclusive practices that reflect the full diversity of Ethiopian society.",
            "የEMWA ስትራቴጂያዊ ቅድሚያዎች የአቅም ግንባታ፣ በማስረጃ የተመሠረተ ጥናትና ቅስቀሳ፣ ስትራቴጂያዊ አጋርነት እና የሀብት ማሰባሰብ ናቸው። በእነዚህ ምሰሶዎች ሴት የሚዲያ ባለሙያዎችን እናበረታታለን፣ የሚዲያ ተቋማት ምቹ የሥራ ቦታዎችን እንዲፈጥሩ እንደግፋለን።",
          )}</p>
          <p>{t(
            "EMWA is working to position itself as a hub at the nexus of gender and media, serving as a platform for knowledge, collaboration, and transformation. By advancing professional excellence and advocating for women's rights, we aim to build a vibrant, equitable, and gender-responsive media landscape in Ethiopia.",
            "EMWA በፆታና በሚዲያ መገናኛ ላይ የእውቀት፣ የትብብርና የለውጥ ማዕከል ለመሆን እየሠራ ነው። የሙያ ልቀትን በማሳደግና ለሴቶች መብት በመሟገት በኢትዮጵያ ንቁ፣ ፍትሐዊና ለፆታ ምላሽ ሰጪ የሚዲያ ምህዳር ለመገንባት እንጥራለን።",
          )}</p>
          <p>{t(
            "Our work is guided by a commitment to innovation, accountability, and inclusivity—empowering women media practitioners, amplifying their voices, and advancing a gender-responsive media sector that reflects Ethiopia's diverse society.",
            "ሥራችን በፈጠራ፣ በተጠያቂነትና በአካታችነት ቁርጠኝነት ይመራል፤ ሴት የሚዲያ ባለሙያዎችን እናበረታታለን፣ ድምፃቸውን እናጎላለን፣ የኢትዮጵያን ብዝሃነት የሚያንጸባርቅ ለፆታ ምላሽ ሰጪ የሚዲያ ዘርፍ እናራምዳለን።",
          )}</p>
          <blockquote><span>{t("Our motto", "መottoችን")}</span>“{t("Empowering Women in and Through the Media!", "በሚዲያ ውስጥ እና በሚዲያ አማካይነት ሴቶችን ማብቃት!")}”</blockquote>
        </div>
      </section>

      <section className="about-vmr-section">
        <div className="about-vmr-container"><div className="about-vmr-grid">
          <article className="about-vmr-card"><p className="about-vmr-badge">{t("Vision", "ራዕይ")}</p><h2 className="about-vmr-heading">{t("A secure, inclusive and vibrant media sector.", "ደህንነቱ የተጠበቀ፣ አካታች እና ንቁ የሚዲያ ዘርፍ።")}</h2><p className="about-vmr-body">{t("To see a vibrant media profession and media sector that is secure, inclusive, and conducive for women media professionals.", "ደህንነቱ የተጠበቀ፣ አካታች እና ለሴት የሚዲያ ባለሙያዎች ምቹ የሆነ ንቁ የሚዲያ ሙያ እና ዘርፍ ማየት።")}</p></article>
          <article className="about-vmr-card"><p className="about-vmr-badge">{t("Mission", "ተልዕኮ")}</p><h2 className="about-vmr-heading">{t("Capacity. Equality. Positive change.", "አቅም፤ እኩልነት፤ አዎንታዊ ለውጥ።")}</h2><p className="about-vmr-body">{t("To empower women media professionals through continuous capacity building, advocacy for gender equality and equity, and positive change that advances ethical, safe, and professional media development.", "በተ निरंतर የአቅም ግንባታ፣ ለፆታ እኩልነት ተሟጋችነት እና ሥነ-ምግባራዊ፣ ደህንነቱ የተጠበቀ እና ሙያዊ የሚዲያ ልማት አዎንታዊ ለውጥ በማምጣት ሴት የሚዲያ ባለሙያዎችን ማብቃት።")}</p></article>
          <article className="about-vmr-card about-vmr-card--statement"><p className="about-vmr-badge">{t("Our mandate", "የእኛ ተልዕኮ")}</p><h2 className="about-vmr-heading">{t("In media and through media.", "በሚዲያ ውስጥ እና በሚዲያ አማካይነት።")}</h2><p className="about-vmr-body">{t("We connect professional empowerment with the wider transformation of how women are represented, heard, protected, and supported across the media sector.", "የሙያ ማብቃትን ሴቶች በሚዲያ ዘርፍ የሚወከሉበት፣ የሚሰሙበት፣ የሚጠበቁበት እና የሚደገፉበት ሰፊ ለውጥ ጋር እናገናኛለን።")}</p></article>
        </div></div>
      </section>

      <section className="about-values-section" aria-labelledby="values-heading"><div className="about-values-container">
        <header className="about-values-header"><div><p className="about-values-eyebrow">{t("Core values", "መሰረታዊ እሴቶች")}</p><h2 className="about-values-title" id="values-heading">{t("Principles that guide", "ሥራችንን የሚመሩ")} <span>{t("the work.", "መሰረታዊ መبادዎች።")}</span></h2></div><p className="about-values-intro">{t("Five commitments shape how EMWA governs, collaborates, advocates, and serves its community.", "አምስት ቁርጠኝነቶች EMWA የሚያስተዳድርበትን፣ የሚያበራውን፣ የሚሟገትበትን እና ማህበረሰቡን የሚያገለግልበትን መንገድ ይቀርፃሉ።")}</p></header>
        <div className="about-values-manifesto">{VALUES.map((value, index) => <ValueStory value={value} index={index} key={value.en[0]} />)}</div>
      </div></section>

      <section className="about2-work">
        <header>
          <p className="about2-eyebrow">{t("What we do", "ምን እንሰራለን")}</p>
          <h2>{t("Turning commitment", "ቁርጠኝነትን ወደ")} <br />{t("into sector-wide action.", "ዘርፍ አቀፍ ተግባር መለወጥ።")}</h2>
          <p>{t("EMWA works across professional development, evidence, advocacy, safety, leadership, and collective action.", "EMWA በሙያ ማበልጸግ፣ በማስረጃ፣ በተሟጋችነት፣ በደህንነት፣ በአመራርነት እና በጋራ እንቅስቃሴ ላይ ይሰራል።")}</p>
        </header>
        <div className="about2-work-list">
          {WORK.map((item, index) => (
            <article key={item.en}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{language === "am" ? item.am : item.en}</p>
              <Check aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="about2-services">
        <div className="about2-services-intro">
          <p className="about2-eyebrow">{t("Our services", "አገልግሎቶቻችን")}</p>
          <h2>{t("Practical support for a stronger profession.", "ለተጠናከረ ሙያ ተግባራዊ ድጋፍ።")}</h2>
          <p>{t("Programs and services designed to build knowledge, capability, connection, and influence.", "እውቀትን፣ ብቃትን፣ ትስስርን እና ተፅዕኖን ለመገንባት የተነደፉ ፕሮግራሞች እና አገልግሎቶች።")}</p>
          <Link to="/programs">{t("Explore our programs", "ፕሮግራሞቻችንን ይመልከቱ")} <ArrowUpRight /></Link>
        </div>
        <div className="about2-tag-cloud">
          {SERVICES.map((item) => (
            <span key={item.en}>{language === "am" ? item.am : item.en}</span>
          ))}
        </div>
      </section>

      <BoardSection />

      <section className="about2-community">
        <div>
          <p className="about2-eyebrow">{t("Who we serve", "ማንን እንሰራለን")}</p>
          <h2>{t("Our beneficiaries.", "ተጠቃሚዎቻችን።")}</h2>
          <div className="about2-people-grid">
            {BENEFICIARIES.map((item) => (
              <span key={item.en}><Users />{language === "am" ? item.am : item.en}</span>
            ))}
          </div>
        </div>
        <aside>
          <p className="about2-eyebrow">{t("Key stakeholders", "ዋና ዋና ባለድርሻ አካላት")}</p>
          <h2>{t("Accountability starts with relationship.", "ተጠያቂነት ከግንኙነት ይጀምራል።")}</h2>
          <ul>
            {STAKEHOLDERS.map((item) => (
              <li key={item.en}>{language === "am" ? item.am : item.en}</li>
            ))}
          </ul>
        </aside>
      </section>

    </PageShell>
  );
}
