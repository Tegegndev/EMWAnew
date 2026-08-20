import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  Facebook,
  Linkedin,
  MapPin,
  Music2,
  Navigation,
  Send,
  Twitter,
  X,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { API_BASE } from "@/lib/admin-api";
import { useLanguage } from "@/lib/language-context";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — EMWA" },
      { name: "description", content: "Contact the Ethiopian Media Women Association." },
      { property: "og:title", content: "Contact — EMWA" },
    ],
  }),
  component: Contact,
});

const SOCIALS = [
  { label: "TikTok", href: "https://www.tiktok.com/@emwa302", icon: Music2 },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/ethiopian-media-women-association/",
    icon: Linkedin,
  },
  { label: "Twitter", href: "https://x.com/EthMediaWomen", icon: Twitter },
  {
    label: "Facebook",
    href: "https://www.facebook.com/Ethiopianmediawomen",
    icon: Facebook,
  },
];

function Contact() {
  const { t, language } = useLanguage();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const submitMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setSending(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/public/contact-messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.get("fullName"),
          email: values.get("email"),
          companyName: values.get("companyName"),
          subject: values.get("subject"),
          message: values.get("message"),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const fieldErrors = payload?.error?.details?.fieldErrors as
          Record<string, string[] | undefined> | undefined;
        const firstError = fieldErrors
          ? Object.values(fieldErrors).find((messages) => messages?.length)?.[0]
          : undefined;
        throw new Error(firstError ?? payload?.error?.message ?? t("Unable to send your message.", "መልዕክትዎን መላክ አልተቻለም።"));
      }
      form.reset();
      setSent(true);
    } catch (cause) {
      setError(
        cause instanceof TypeError
          ? t("Cannot reach the EMWA server. Please check your connection and try again.", "ወደ EMWA አገልጋይ መድረስ አልተቻለም። እባክዎን ግንኙነትዎን አረጋግጠው እንደገና ይሞክሩ።")
          : cause instanceof Error
            ? cause.message
            : t("Unable to send your message.", "መልዕክትዎን መላክ አልተቻለም።"),
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell>
      <section className="contact3-hero">
        <p className="contact3-eyebrow">{t("Contact / EMWA", "ግንኙነት / EMWA")}</p>
        <h1>
          {language === "am" ? (
            <>
              ውይይት <em>ይጀምሩ።</em>
            </>
          ) : (
            <>
              Start a <em>conversation.</em>
            </>
          )}
        </h1>
        <p>{t("Have a question, an idea, or a reason to work together? Send us a message.", "ጥያቄ፣ ሃሳብ ወይም አብረው ለመስራት ምክንያት አለዎት? መልዕክት ይላኩልን።")}</p>
      </section>

      <section className="contact3-main" id="donate">
        <form onSubmit={submitMessage}>
          <header>
            <p className="contact3-eyebrow">{t("Write to us", "ይጻፉልን")}</p>
            <h2>{t("Send a message.", "መልዕክት ይላኩ።")}</h2>
          </header>
          <div className="contact3-fields">
            <label>
              <span>{t("Your name", "ስምዎ")}</span>
              <input
                name="fullName"
                autoComplete="name"
                placeholder={t("Full name", "ሙሉ ስም")}
                minLength={2}
                maxLength={150}
                required
              />
            </label>
            <label>
              <span>{t("Email address", "የኢሜይል አድራሻ")}</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                maxLength={320}
                required
              />
            </label>
            <label className="is-wide">
              <span>{t("Company name", "የድርጅት ስም")}</span>
              <input
                name="companyName"
                autoComplete="organization"
                placeholder={t("Organization or company", "ድርጅት ወይም ኩባንያ")}
                maxLength={200}
              />
            </label>
            <label className="is-wide">
              <span>{t("Subject", "ርዕስ ጉዳይ")}</span>
              <select name="subject" defaultValue="" required>
                <option value="" disabled>
                  {t("Select a subject", "ርዕስ ጉዳይ ይምረጡ")}
                </option>
                <option value="Membership">{t("Membership", "አባልነት")}</option>
                <option value="Partnership">{t("Partnership", "አጋርነት")}</option>
                <option value="Media enquiry">{t("Media enquiry", "የሚዲያ ጥያቄ")}</option>
                <option value="Programme collaboration">{t("Programme collaboration", "የፕሮግራም ትብብር")}</option>
                <option value="Other">{t("Other", "ሌላ")}</option>
              </select>
            </label>
            <label className="is-wide">
              <span>{t("Message", "መልዕክት")}</span>
              <textarea
                name="message"
                rows={5}
                minLength={10}
                maxLength={10000}
                placeholder={t("How can we help?", "እንዴት እንረዳዎ?")}
                required
              />
            </label>
          </div>
          <button type="submit" className={sent ? "is-sent" : ""} disabled={sending || sent}>
            {sent ? (
              <>
                <Check /> {t("Message sent", "መልዕክቱ ተልቋል")}
              </>
            ) : (
              <>
                {sending ? t("Sending…", "በመላክ ላይ…") : t("Send message", "መልዕክት ላክ")} <Send />
              </>
            )}
          </button>
        </form>

        <div className="contact3-map-wrap">
          <header className="contact3-map-header">
            <div>
              <p className="contact3-eyebrow">{t("Visit EMWA", "EMWAን ይጎብኙ")}</p>
              <h2>{t("Find us in Addis Ababa.", "አዲስ አበባ ውስጥ ያግኙን።")}</h2>
            </div>
            <span className="contact3-map-pin" aria-hidden="true">
              <MapPin />
            </span>
          </header>
          <div className="contact3-map">
            <iframe
              title="EMWA headquarters in Addis Ababa"
              src="https://www.google.com/maps?q=9.0396455%2C38.7555613&z=17&output=embed"
              loading="lazy"
            />
          </div>
          <div className="contact3-map-caption">
            <div>
              <p className="contact3-eyebrow">{t("Physical address", "አድራሻ")}</p>
              <strong>{t("Addis Ababa, Arada Sub-city, near Ras Mekonnen Bridge", "አዲስ አበባ፣ አራዳ ክፍለ ከተማ፣ ራስ መኮንን ድልድይ አጠገብ")}</strong>
            </div>
            <a
              href="https://maps.app.goo.gl/xcC5bYanr3m98Psv6"
              target="_blank"
              rel="noreferrer"
            >
              <Navigation /> {t("Open in Google Maps", "በGoogle Maps ክፈት")} <ArrowUpRight />
            </a>
          </div>
        </div>
      </section>

      <section className="contact3-details" aria-labelledby="contact-details-title">
        <div>
          <p className="contact3-eyebrow">{t("Direct contact", "ቀጥታ ግንኙነት")}</p>
          <h2 id="contact-details-title">{t("Reach our team.", "ቡድናችንን ያግኙ።")}</h2>
        </div>
        <address>
          <div>
            <span>{t("Email addresses", "የኢሜይል አድራሻዎች")}</span>
            <a href="mailto:info@ethmwa.org">info@ethmwa.org</a>
            <a href="mailto:contact@ethmwa.org">contact@ethmwa.org</a>
          </div>
          <div>
            <span>{t("Phone numbers", "የስልክ ቁጥሮች")}</span>
            <a href="tel:+251977300031">+251 977 300 031</a>
            <a href="tel:+251998139676">+251 998 139 676</a>
          </div>
        </address>
      </section>

      <section className="contact3-socials">
        <div>
          <p className="contact3-eyebrow">{t("Follow our work", "ስራችንን ይከታተሉ")}</p>
          <h2>{t("Stay connected.", "ተገናኝተው ይቆዩ።")}</h2>
        </div>
        <nav aria-label="Social media links">
          {SOCIALS.map(({ label, href, icon: Icon }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer">
              <Icon />
              <span>{label}</span>
              <ArrowUpRight />
            </a>
          ))}
        </nav>
      </section>

      {(sent || error) && (
        <div
          className="contact3-notice-backdrop"
          onMouseDown={() => {
            setSent(false);
            setError("");
          }}
        >
          <section
            className={`contact3-notice ${error ? "is-error" : "is-success"}`}
            role={error ? "alertdialog" : "dialog"}
            aria-modal="true"
            aria-labelledby="contact-notice-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="contact3-notice-close"
              aria-label="Close message"
              onClick={() => {
                setSent(false);
                setError("");
              }}
            >
              <X />
            </button>
            <span className="contact3-notice-icon">{error ? <AlertCircle /> : <Check />}</span>
            <p className="contact3-eyebrow">{error ? t("Message not sent", "መልዕክቱ አልተላከም") : t("Message received", "መልዕክቱ ደርሶናል")}</p>
            <h2 id="contact-notice-title">
              {error ? t("Something went wrong.", "ችግር አጋጥሟል።") : t("Thank you for reaching out.", "ስላነጋገሩን እናመሰግናለን።")}
            </h2>
            <p>
              {error ||
                t(
                  "Your message has been received successfully. The EMWA team will review it and contact you as soon as possible.",
                  "መልዕክትዎ በስኬት ደርሶናል። የEMWA ቡድን ገምግሞ በተቻለ ፍጥነት ያነጋግርዎታል።",
                )}
            </p>
            <button
              type="button"
              className="contact3-notice-action"
              onClick={() => {
                setSent(false);
                setError("");
              }}
            >
              {error ? t("Try again", "እንደገና ይሞክሩ") : t("Done", "ጨርስ")}
            </button>
          </section>
        </div>
      )}
    </PageShell>
  );
}
