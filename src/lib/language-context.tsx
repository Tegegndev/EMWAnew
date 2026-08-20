import {
  createContext,
  useCallback,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { API_BASE } from "@/lib/admin-api";

export type SiteLanguage = "en" | "am";

type LanguageContextValue = {
  language: SiteLanguage;
  setLanguage: (language: SiteLanguage) => void;
  t: (english: string, amharic: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SiteLanguage>("en");
  const [initialized, setInitialized] = useState(false);
  const [translationVersion, setTranslationVersion] = useState(0);
  const translations = useRef(new Map<string, string>());
  const pendingTranslations = useRef(new Map<string, string>());
  const translationUnavailable = useRef(false);

  useEffect(() => {
    let initial: SiteLanguage = "en";
    try {
      const stored = localStorage.getItem("emwa-language");
      if (stored === "am" || stored === "en") {
        initial = stored;
      }
    } catch {
      // Language switching should still work when browser storage is unavailable.
    }
    setLanguageState(initial);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    document.documentElement.lang = language;
    document.documentElement.dataset.language = language;
    try {
      localStorage.setItem("emwa-language", language);
    } catch {
      // Keep the in-memory language active even when persistence is blocked.
    }
  }, [initialized, language]);

  const setLanguage = useCallback((nextLanguage: SiteLanguage) => {
    translationUnavailable.current = false;
    setLanguageState(nextLanguage);
    document.documentElement.lang = nextLanguage;
    document.documentElement.dataset.language = nextLanguage;
    try {
      localStorage.setItem("emwa-language", nextLanguage);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (language !== "am" || translationUnavailable.current || !pendingTranslations.current.size)
      return;

    const batch = Array.from(pendingTranslations.current.entries()).slice(0, 50);
    batch.forEach(([english]) => pendingTranslations.current.delete(english));
    const controller = new AbortController();

    void fetch(`${API_BASE}/public/translations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: batch.map(([english]) => english), source: "en", target: "am" }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok || !Array.isArray(payload?.data)) throw new Error("Translation unavailable");
        batch.forEach(([english], index) => {
          const translated = String(payload.data[index] ?? "").trim();
          if (translated) translations.current.set(english, translated);
        });
        setTranslationVersion((current) => current + 1);
      })
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === "AbortError"))
          translationUnavailable.current = true;
      });

    return () => controller.abort();
  }, [language, translationVersion]);

  const translate = useCallback(
    (english: string, amharic: string) => {
      if (language === "en") return english;
      if (amharic && amharic !== english) return amharic;
      const translated = translations.current.get(english);
      if (translated) return translated;
      if (!translationUnavailable.current) pendingTranslations.current.set(english, amharic);
      return amharic || english;
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translate,
    }),
    [language, setLanguage, translate],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
