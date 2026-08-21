import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Globe2, Heart, Menu, Moon, Sun, X } from "lucide-react";
import logo from "@/assets/emwa-logo-new.png";
import { useLanguage } from "@/lib/language-context";

const NAV = [
  { to: "/", label: "Home", am: "መነሻ" },
  { to: "/about", label: "About", am: "ስለ እኛ" },
  { to: "/programs", label: "Programs", am: "ፕሮግራሞች" },
  { to: "/experts", label: "Experts", am: "ባለሙያዎች" },
  { to: "/updates", label: "Updates", am: "ወቅታዊ መረጃ" },
  { to: "/resources", label: "Resources", am: "ምንጮች" },
  { to: "/partners", label: "Partners", am: "አጋሮች" },
  { to: "/contact", label: "Contact", am: "ያግኙን" },
] as const;

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("emwa-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("emwa-theme", next ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className="grid size-10 shrink-0 place-items-center border border-border transition-colors hover:border-primary hover:text-primary"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-background/95 supports-[backdrop-filter]:bg-background/85 backdrop-blur-xl border-b border-border shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      <div className="site-container min-h-16 py-2 flex justify-between items-center gap-4">
        <Link to="/" className="flex shrink-0 items-center gap-3 group">
          <img
            src={logo}
            alt="EMWA logo"
            className="h-11 w-11 object-contain transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110"
          />
          <span
            className="font-display text-2xl tracking-tighter hidden sm:inline transition-colors group-hover:text-primary"
            aria-hidden="true"
          >
            <span className="text-primary">E</span>MWA
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-5 xl:gap-7 label-mono"
        >
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="relative py-1 transition-colors hover:text-primary after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100"
              activeProps={{ className: "text-primary after:scale-x-100" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {language === "am" ? item.am : item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2.5">
          <div className="language-switcher" role="group" aria-label={t("Choose language", "ቋንቋ ይምረጡ")}>
            <Globe2 aria-hidden="true" />
            <button
              type="button"
              className={`px-2 py-1 cursor-pointer transition-colors ${language === "en" ? "is-active text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setLanguage("en")}
              aria-pressed={language === "en"}
            >
              EN
            </button>
            <span aria-hidden="true" className="text-muted-foreground/50">/</span>
            <button
              type="button"
              className={`px-2 py-1 cursor-pointer transition-colors ${language === "am" ? "is-active text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setLanguage("am")}
              aria-pressed={language === "am"}
            >
              አማ
            </button>
          </div>
          <ThemeToggle />
          <Link
            to="/donate"
            target="_blank"
            rel="noopener noreferrer"
            className="group hidden h-10 shrink-0 items-center gap-2 whitespace-nowrap border border-[#dca332] bg-[#e5a933] px-4 label-mono !text-[8px] text-[#171513] shadow-[0_6px_18px_rgba(229,169,51,.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f0b83f] hover:shadow-[0_10px_24px_rgba(229,169,51,.28)] sm:inline-flex"
          >
            <Heart className="size-3.5 transition-transform duration-300 group-hover:scale-110 group-hover:fill-current" />
            {t("Donate", "ይደግፉ")}
          </Link>
          <Link
            to="/membership"
            className="hidden h-10 shrink-0 items-center whitespace-nowrap bg-foreground px-5 label-mono text-background transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary hover:shadow-lg md:inline-flex"
          >
            {t("Join Association", "ማህበሩን ይቀላቀሉ")}
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden size-10 grid shrink-0 place-items-center border border-border transition-colors hover:border-primary hover:text-primary"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-navigation"
          className="lg:hidden border-t border-border bg-background animate-reveal"
        >
          <nav
            aria-label="Mobile navigation"
            className="site-container flex flex-col py-4 gap-1 max-h-[calc(100dvh-4rem)] overflow-y-auto"
          >
            {/* Mobile language switcher */}
            <div className="flex items-center justify-between py-2.5 px-1 border-b border-border/60 mb-2">
              <span className="label-mono text-xs text-muted-foreground flex items-center gap-2">
                <Globe2 className="size-4" /> {t("Language", "ቋንቋ")}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1 text-xs label-mono border transition-colors ${language === "en" ? "bg-primary text-white border-primary" : "border-border text-foreground"}`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("am")}
                  className={`px-3 py-1 text-xs label-mono border transition-colors ${language === "am" ? "bg-primary text-white border-primary" : "border-border text-foreground"}`}
                >
                  አማርኛ
                </button>
              </div>
            </div>

            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="label-mono py-3 border-b border-border/60 hover:pl-3 hover:text-primary transition-all duration-300"
                activeProps={{ className: "text-primary pl-3" }}
              >
                {language === "am" ? item.am : item.label}
              </Link>
            ))}
            <Link
              to="/donate"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 bg-[#e5a933] px-5 py-3 label-mono text-[#171513]"
            >
              <Heart className="size-3.5" /> {t("Donate", "ይደግፉ")}
            </Link>
            <Link
              to="/membership"
              onClick={() => setOpen(false)}
              className="bg-foreground text-background px-5 py-3 label-mono text-center"
            >
              {t("Join Association", "ማህበሩን ይቀላቀሉ")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
