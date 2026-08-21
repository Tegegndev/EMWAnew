import { Link } from "@tanstack/react-router";
import { Facebook, Linkedin, Music2, Twitter } from "lucide-react";
import logo from "@/assets/emwa-logo-new.png";
import { useLanguage } from "@/lib/language-context";

const SOCIALS = [
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@emwa302",
    Icon: Music2,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/ethiopian-media-women-association/",
    Icon: Linkedin,
  },
  {
    label: "Twitter",
    href: "https://x.com/EthMediaWomen",
    Icon: Twitter,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/Ethiopianmediawomen",
    Icon: Facebook,
  },
];

const NAV_ORG = [
  { to: "/about", label: "About" },
  { to: "/programs", label: "Programs" },
  { to: "/membership", label: "Membership" },
  { to: "/partners", label: "Partners" },
  { to: "/donate", label: "Donate" },
];

const NAV_DISCOVER = [
  { to: "/experts", label: "Experts Directory" },
  { to: "/updates", label: "Updates" },
  { to: "/resources", label: "Resource Center" },
];

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="sf-footer" role="contentinfo">
      {/* Decorative ghost word */}
      <span className="sf-bg-word" aria-hidden="true">
        EMWA
      </span>

      <div className="sf-container">
        {/* ── Top grid ── */}
        <div className="sf-grid">
          {/* Brand column */}
          <div className="sf-brand">
            <Link to="/" className="sf-logo-row group" aria-label="EMWA home">
              <img
                src={logo}
                alt="EMWA logo"
                className="h-11 w-11 object-contain transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110"
              />
              <span className="font-display text-2xl tracking-tighter transition-colors group-hover:text-primary">
                <span className="text-primary">E</span>MWA
              </span>
            </Link>
            <p className="sf-tagline">
              {t(
                "The Ethiopian Media Women Association is a legally registered professional organization dedicated to ensuring gender equality in and through media across Ethiopia since 1998.",
                "የኢትዮጵያ ሚዲያ ሴቶች ማህበር ከ1998 ጀምሮ በኢትዮጵያ ሚዲያ ውስጥና በሚዲያ አማካይነት የፆታ እኩልነትን ለማረጋገጥ የሚሰራ በህጋዊነት የተመዘገበ የሙያ ማህበር ነው።",
              )}
            </p>
            <div className="sf-socials">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  className="sf-social-btn"
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon className="sf-social-icon" />
                </a>
              ))}
            </div>
          </div>

          {/* Org links */}
          <div className="sf-col">
            <p className="sf-col-heading">{t("Organization", "ድርጅቱ")}</p>
            <ul className="sf-col-list">
              {NAV_ORG.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="sf-link"
                    {...(l.to === "/donate" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {t(l.label, {
                      About: "ስለ እኛ",
                      Programs: "ፕሮግራሞች",
                      Membership: "አባልነት",
                      Partners: "አጋሮች",
                      Donate: "ይደግፉ",
                    }[l.label] ?? l.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover links */}
          <div className="sf-col">
            <p className="sf-col-heading">{t("Discover", "ያስሱ")}</p>
            <ul className="sf-col-list">
              {NAV_DISCOVER.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="sf-link">
                    {t(l.label, {
                      "Experts Directory": "የባለሙያዎች ማውጫ",
                      Updates: "ወቅታዊ መረጃ",
                      "Resource Center": "የመረጃ ማዕከል",
                    }[l.label] ?? l.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="sf-col">
            <p className="sf-col-heading">{t("Contact", "ያግኙን")}</p>
            <address className="sf-address">
              <p>{t("Addis Ababa, Arada Sub-city", "አዲስ አበባ፣ አራዳ ክፍለ ከተማ")}</p>
              <p>{t("Near Rad Mekonenne Bridge", "ራድ መኮንን ድልድይ አቅራቢያ")}</p>
              <p className="sf-address-gap">
                <a href="mailto:info@ethmwa.org" className="sf-link">
                  info@ethmwa.org
                </a>
              </p>
              <p>
                <a href="mailto:contact@ethmwa.org" className="sf-link">
                  contact@ethmwa.org
                </a>
              </p>
              <p className="sf-address-gap">
                <a href="tel:+251977300031" className="sf-link">
                  +251 977 300 031
                </a>
              </p>
              <p>
                <a href="tel:+251998139676" className="sf-link">
                  +251 998 139 676
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="sf-bottom">
          <p className="sf-copy">© {new Date().getFullYear()} EMWA. All rights reserved.</p>
          <div className="sf-legal-links">
            <Link to="/privacy" className="sf-legal-link">
              Privacy
            </Link>
            <Link to="/terms" className="sf-legal-link">
              Terms
            </Link>
            <Link to="/search" search={{ q: "" }} className="sf-legal-link">
              Search
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
