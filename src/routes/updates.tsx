import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  Clock,
  Copy,
  MapPin,
  Play,
  Search,
  Share2,
  X,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { API_BASE } from "@/lib/admin-api";
import { useLanguage } from "@/lib/language-context";

export const Route = createFileRoute("/updates")({
  validateSearch: (search: Record<string, unknown>): { story?: string; event?: string } => ({
    story: typeof search.story === "string" ? search.story : undefined,
    event: typeof search.event === "string" ? search.event : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Updates & Events — EMWA" },
      {
        name: "description",
        content: "EMWA updates, analysis, press releases, events, and opportunities.",
      },
      { property: "og:title", content: "Updates & Events — EMWA" },
    ],
  }),
  component: Updates,
});

const TABS = ["All", "Updates", "Press", "Articles", "Photos", "Video"] as const;

const TAB_MAP_AM: Record<string, string> = {
  All: "ሁሉም",
  Updates: "ወቅታዊ",
  Press: "ጋዜጣዊ",
  Articles: "ጽሁፎች",
  Photos: "ፎቶዎች",
  Video: "ቪዲዮ",
};

type StoryBlock = {
  id?: string;
  type: "text" | "image" | "video" | "header";
  position?: number;
  content?: string;
  url?: string;
  caption?: string;
};

type Story = {
  d: string;
  t: (typeof TABS)[number];
  h: string;
  hAm?: string;
  e: string;
  eAm?: string;
  img: string;
  read: string;
  readAm?: string;
  slug?: string;
  content?: string;
  featured?: boolean;
  blocks?: StoryBlock[];
};

type PublicEvent = {
  id?: string;
  day: string;
  month: string;
  year?: string;
  title: string;
  titleAm?: string;
  description: string;
  descriptionAm?: string;
  type: string;
  typeAm?: string;
  loc: string;
  locAm?: string;
  time: string;
  startsAt?: string;
  endsAt?: string;
  img?: string;
  full?: boolean;
  capacityStatus?: string;
  registrationUrl?: string;
};

const NEWS_IMG_FALLBACK =
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";

const resolveMediaUrl = (url?: string | null, fallback = NEWS_IMG_FALLBACK) => {
  if (!url) return fallback;
  const str = String(url).trim();
  if (!str) return fallback;
  if (str.startsWith("http://") || str.startsWith("https://") || str.startsWith("data:") || str.startsWith("blob:")) {
    return str;
  }
  try {
    const origin =
      typeof window !== "undefined" && !/^https?:\/\//i.test(API_BASE)
        ? window.location.origin
        : /^https?:\/\//i.test(API_BASE)
          ? new URL(API_BASE).origin
          : "";
    const cleanPath = str.startsWith("/") ? str : `/${str}`;
    return origin ? `${origin}${cleanPath}` : cleanPath;
  } catch {
    return str;
  }
};

const useNewsImageFallback = (event: React.SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.src = NEWS_IMG_FALLBACK;
};

function Updates() {
  const { t, language } = useLanguage();
  const search = Route.useSearch();
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [query, setQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(null);
  const [standaloneStory, setStandaloneStory] = useState<Story | null>(null);
  const [standaloneLoading, setStandaloneLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [stories, setStories] = useState<Story[]>([]);
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  const labelsMap: Record<string, Story["t"]> = {
    NEWS: "Updates",
    PRESS: "Press",
    ARTICLE: "Articles",
    PHOTO: "Photos",
    VIDEO: "Video",
  };

  useEffect(() => {
    if (!search.story) {
      setStandaloneStory(null);
      return;
    }
    const slug = search.story;
    setStandaloneLoading(true);

    const fetchStoryDetail = async () => {
      try {
        const response = await fetch(`${API_BASE}/public/updates/${encodeURIComponent(slug)}`);
        if (!response.ok) {
          setStandaloneLoading(false);
          return;
        }
        const payload = await response.json();
        if (payload.data) {
          const row = payload.data;
          const detail: Story = {
            d: new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(new Date(String(row.published_at ?? row.created_at))),
            t: labelsMap[String(row.content_type)] ?? "Updates",
            h: String(row.title),
            e: String(row.excerpt),
            img: resolveMediaUrl(row.featured_image_url, NEWS_IMG_FALLBACK),
            read: row.content_type === "VIDEO" ? "Video" : "Read",
            slug: String(row.slug),
            content: String(row.content || ""),
            featured: Boolean(row.is_featured),
            blocks: Array.isArray(row.blocks) ? (row.blocks as StoryBlock[]) : undefined,
          };
          setStandaloneStory(detail);
        }
      } catch {
        // Handled
      } finally {
        setStandaloneLoading(false);
      }
    };

    void fetchStoryDetail();
  }, [search.story]);

  const lead = useMemo(() => stories.find((story) => story.featured) || stories[0], [stories]);

  const filtered = useMemo(
    () =>
      stories.filter(
        (story) =>
          (tab === "All" || story.t === tab) &&
          (!query.trim() || `${story.h} ${story.e}`.toLowerCase().includes(query.toLowerCase())),
      ),
    [tab, query, stories],
  );

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const [updatesResult, eventsResult] = await Promise.allSettled([
          fetch(`${API_BASE}/public/updates?page=1&limit=100`, { signal: controller.signal }),
          fetch(`${API_BASE}/public/events?page=1&limit=100&order=asc`, { signal: controller.signal }),
        ]);

        if (updatesResult.status === "fulfilled" && updatesResult.value.ok) {
          const updatesPayload = await updatesResult.value.json();
          const loaded = (Array.isArray(updatesPayload.data) ? updatesPayload.data : []).map((row: Record<string, unknown>) => ({
            d: new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(new Date(String(row.published_at ?? row.created_at))),
            t: labelsMap[String(row.content_type)] ?? "Updates",
            h: String(row.title),
            e: String(row.excerpt),
            img: resolveMediaUrl(row.featured_image_url, NEWS_IMG_FALLBACK),
            read: row.content_type === "VIDEO" ? "Video" : "Read",
            slug: String(row.slug),
            featured: Boolean(row.is_featured),
            blocks: Array.isArray(row.blocks) ? (row.blocks as StoryBlock[]) : undefined,
          }));
          if (loaded.length) setStories(loaded);
        }

        if (eventsResult.status === "fulfilled" && eventsResult.value.ok) {
          const eventsPayload = await eventsResult.value.json();
          const loadedEvents = (Array.isArray(eventsPayload.data) ? eventsPayload.data : []).map((row: Record<string, unknown>) => {
            const starts = new Date(String(row.starts_at));
            return {
              id: String(row.id),
              day: String(starts.getDate()).padStart(2, "0"),
              month: starts.toLocaleString("en", { month: "short" }).toUpperCase(),
              year: String(starts.getFullYear()),
              title: String(row.title),
              description: String(row.description),
              type: String(row.event_type),
              loc: String(row.location),
              time: starts.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
              startsAt: starts.toISOString(),
              endsAt: row.ends_at ? new Date(String(row.ends_at)).toISOString() : undefined,
              img: resolveMediaUrl(row.featured_image_url, NEWS_IMG_FALLBACK),
              full: row.capacity_status !== "AVAILABLE",
              capacityStatus: String(row.capacity_status),
              registrationUrl: row.registration_url ? String(row.registration_url) : undefined,
            };
          });
          if (loadedEvents.length) setEvents(loadedEvents);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError")
          setFeedError(t("The live newsroom feed is temporarily unavailable.", "የቀጥታ ዜና ክፍል መረጃ በጊዜያዊነት አይገኝም።"));
      } finally {
        if (!controller.signal.aborted) setFeedLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();

    if (!email) {
      setNewsletterStatus("error");
      setNewsletterMessage(t("Please enter a valid email address.", "እባክዎ የትክክለኛ ኢሜይል አድራሻ ያስገቡ።"));
      return;
    }

    setNewsletterStatus("submitting");
    setNewsletterMessage("");

    try {
      const response = await fetch(`${API_BASE}/public/newsletter-subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error?.message ?? t("Unable to subscribe right now.", "አሁን ለማስመዝገብ አንችልም።"));
      }
      setNewsletterStatus("success");
      setNewsletterMessage(t("You’re subscribed to The Narrative Shift.", "ወደ The Narrative Shift ተመዝግበዋል።"));
      form.reset();
    } catch (error) {
      setNewsletterStatus("error");
      setNewsletterMessage(error instanceof Error ? error.message : t("Unable to subscribe.", "ማስመዝገብ አልተቻለም።"));
    }
  };

  if (search.story && (standaloneStory || standaloneLoading)) {
    const article = standaloneStory;
    return (
      <PageShell>
        <div className="updates-article-page py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="mb-8 flex items-center justify-between border-b border-black/10 pb-4">
            <Link
              to="/updates"
              className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#8c2d3c] hover:underline"
            >
              <ArrowLeft className="size-4" />
              <span>{t("Back to all updates", "ወደ ሁሉም መረጃዎች ተመለስ")}</span>
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-3.5 py-1.5 font-mono text-xs font-bold text-black/70 hover:bg-black/5 transition"
                title="Copy story link"
              >
                {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                <span>{copied ? t("Copied!", "ተቀድቷል!") : t("Share link", "ሊንክ አጋራ")}</span>
              </button>
            </div>
          </div>

          {standaloneLoading && !article ? (
            <div className="py-24 text-center">
              <p className="font-mono text-sm text-black/50">{t("Loading story…", "ታሪኩን በመጫን ላይ…")}</p>
            </div>
          ) : article ? (
            <article className="space-y-8">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-black/50">
                  <span className="rounded bg-[#8c2d3c] px-3 py-1 font-bold text-white uppercase tracking-wider">
                    {language === "am" ? TAB_MAP_AM[article.t] ?? article.t : article.t}
                  </span>
                  <span>•</span>
                  <time>{article.d}</time>
                  <span>•</span>
                  <span>{article.read}</span>
                </div>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-black">
                  {article.h}
                </h1>

                {article.e && (
                  <p className="font-[var(--font-editorial)] text-xl sm:text-2xl leading-relaxed text-black/75 border-l-4 border-[#e4ab3a] pl-5 py-1 italic bg-[#fbf9f4] rounded-r-xl">
                    {article.e}
                  </p>
                )}
              </div>

              {article.img && (
                <div className="aspect-[16/9] w-full overflow-hidden rounded-3xl border border-black/10 bg-black/5 shadow-lg">
                  <img
                    src={article.img}
                    alt={article.h}
                    className="h-full w-full object-cover"
                    onError={useNewsImageFallback}
                  />
                </div>
              )}

              <div className="updates-article-body space-y-6 pt-4 font-[var(--font-body)] text-lg sm:text-xl leading-relaxed text-black/85 max-w-3xl mx-auto">
                {article.blocks && article.blocks.length > 0 ? (
                  article.blocks.map((block, idx) => {
                    if (block.type === "image") {
                      return (
                        <figure key={block.id || idx} className="my-10 space-y-2">
                          <img
                            src={resolveMediaUrl(block.url, article.img)}
                            alt={block.caption || article.h}
                            className="w-full rounded-2xl object-cover max-h-[580px] shadow-md border border-black/10"
                            onError={useNewsImageFallback}
                          />
                          {block.caption && (
                            <figcaption className="text-center font-mono text-xs italic text-black/60 pt-1">
                              {block.caption}
                            </figcaption>
                          )}
                        </figure>
                      );
                    }
                    return (
                      <p key={block.id || idx} className="whitespace-pre-wrap leading-8 text-black/80">
                        {block.content}
                      </p>
                    );
                  })
                ) : (
                  (article.content
                    ? article.content.split(/\n{2,}/).filter(Boolean)
                    : [article.e]
                  ).map((paragraph, idx) => (
                    <p key={idx} className="whitespace-pre-wrap leading-8 text-black/80">
                      {paragraph}
                    </p>
                  ))
                )}
              </div>

              <div className="mt-16 border-t border-black/10 pt-8 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <p className="font-mono text-xs font-bold text-black/40 uppercase tracking-wider">
                    Published By
                  </p>
                  <p className="font-bold text-base text-black mt-1">EMWA Media & Newsroom Desk</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#8c2d3c] px-4 py-2.5 font-bold text-sm text-white hover:bg-[#6e222e] transition"
                  >
                    <Share2 className="size-4" />
                    <span>{copied ? t("Link Copied!", "ሊንክ ተቀድቷል!") : t("Share Article", "ጽሑፉን አጋራ")}</span>
                  </button>
                </div>
              </div>
            </article>
          ) : (
            <div className="py-20 text-center space-y-4">
              <h2 className="text-2xl font-bold">{t("Update Not Found", "መረጃው አልተገኘም")}</h2>
              <p className="text-black/60">{t("The requested update story could not be found.", "የተፈለገው መረጃ ሊገኝ አልቻለም።")}</p>
              <Link
                to="/updates"
                className="inline-block rounded-xl bg-[#8c2d3c] px-5 py-2.5 text-sm font-bold text-white"
              >
                {t("Return to Newsroom", "ወደ ዜና ክፍል ተመለስ")}
              </Link>
            </div>
          )}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="updates2-hero">
        <div className="updates2-hero-intro">
          <p className="updates2-eyebrow">{t("Updates, ideas & opportunities", "ወቅታዊ መረጃዎች፣ ሃሳቦች እና ዕድሎች")}</p>
          <h1>
            {language === "am" ? (
              <>
                EMWAን ወደፊት<br />
                <em>ሚያራምዱ ነገሮች።</em>
              </>
            ) : (
              <>
                What&apos;s moving
                <br />
                <em>EMWA forward.</em>
              </>
            )}
          </h1>
          <p>
            {t(
              "Reporting from our programs, public positions, member community, and the wider movement for gender equality in Ethiopian media.",
              "ከፕሮግራሞቻችን፣ ከህዝባዊ አቋሞቻችን፣ ከአባላቶቻችን እና በኢትዮጵያ ሚዲያ የፆታ እኩልነት እንቅስቃሴ የሚቀርቡ ዘገባዎች።",
            )}
          </p>
          <div className="updates2-hero-meta">
            <span>
              <strong>{String(stories.length).padStart(2, "0")}</strong> {t("latest stories", "አዳዲስ ታሪኮች")}
            </span>
            <span>
              <strong>{String(events.length).padStart(2, "0")}</strong> {t("upcoming events", "ቀጣይ ዝግጅቶች")}
            </span>
            <span>{t("Updated 12 Nov 2026", "የተሻሻለው 12 ኖቬምበር 2026")}</span>
          </div>
        </div>
        {lead ? (
          <article className="updates2-lead">
            <img
              src={lead.img}
              alt="Journalists collaborating in a professional newsroom"
              fetchPriority="high"
              onError={useNewsImageFallback}
            />
            <div className="updates2-lead-shade" />
            <div className="updates2-lead-copy">
              <div>
                <span>{t("Lead story", "ዋና ታሪክ")}</span>
                <time>{lead.d}</time>
              </div>
              <h2>{language === "am" && lead.hAm ? lead.hAm : lead.h}</h2>
              <p>{language === "am" && lead.eAm ? lead.eAm : lead.e}</p>
              <a
                href={`/updates?story=${encodeURIComponent(lead.slug || lead.h)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2.5 font-bold text-black hover:bg-white transition"
              >
                <span>{t("Read story", "ታሪኩን ያንብቡ")}</span> <ArrowUpRight className="size-4" />
              </a>
            </div>
            <small>Documentary photograph / Unsplash</small>
          </article>
        ) : (
          <div className="updates2-lead updates2-lead-empty" role="status">
            <div>
              <span>{feedLoading ? t("Connecting to newsroom", "ከዜና ክፍሉ ጋር በመገናኘት ላይ") : t("From the newsroom", "ከዜና ክፍሉ")}</span>
              <h2>{feedLoading ? t("Loading the latest updates…", "አዳዲስ መረጃዎችን በመጫን ላይ…") : t("No published updates yet.", "ገና የታተሙ መረጃዎች የሉም።")}</h2>
              <p>{feedLoading ? t("Please wait while we retrieve EMWA's latest stories.", "እባክዎን የEMWA አዳዲስ ታሪኮች እስከሚጫኑ ይታገሱ።") : t("Published stories from the EMWA administration desk will appear here.", "ከEMWA አስተዳደር የሚወጡ ታሪኮች እዚህ ይታያሉ።")}</p>
            </div>
          </div>
        )}
      </section>

      <section className="updates2-stories" id="stories">
        <header className="updates2-section-head">
          <div>
            <p className="updates2-eyebrow">{t("From the newsroom", "ከዜና ክፍሉ")}</p>
            <h2>{t("Latest stories.", "አዳዲስ ታሪኮች።")}</h2>
          </div>
          <label>
            <Search />
            <span className="sr-only">{t("Search stories", "ታሪኮችን ይፈልጉ")}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("Search updates", "ወቅታዊ መረጃዎችን ይፈልጉ")}
            />
          </label>
        </header>
        {feedError && (
          <p className="updates2-feed-note" role="status">
            {feedError}
          </p>
        )}
        <div className="updates2-tabs" role="group" aria-label="Filter stories">
          {TABS.map((item) => (
            <button
              key={item}
              className={tab === item ? "is-active" : ""}
              aria-pressed={tab === item}
              onClick={() => setTab(item)}
            >
              {language === "am" ? TAB_MAP_AM[item] ?? item : item}
            </button>
          ))}
        </div>
        {feedLoading ? (
          <div className="updates2-empty" role="status">
            <Search />
            <h3>{t("Loading newsroom updates…", "የዜና ክፍል መረጃዎችን በመጫን ላይ…")}</h3>
          </div>
        ) : filtered.length ? (
          <div className="updates2-grid">
            {filtered.map((story, index) => (
              <article
                className={`updates2-card${index === 0 ? " is-featured" : ""}`}
                key={story.h}
              >
                <a
                  href={`/updates?story=${encodeURIComponent(story.slug || story.h)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="updates2-card-image block"
                >
                  <img src={story.img} alt="" loading="lazy" onError={useNewsImageFallback} />
                  {story.t === "Video" && (
                    <span>
                      <Play fill="currentColor" />
                    </span>
                  )}
                  <small>{language === "am" ? TAB_MAP_AM[story.t] ?? story.t : story.t}</small>
                </a>
                <div className="updates2-card-copy">
                  <div>
                    <time>{story.d}</time>
                    <span>{language === "am" && story.readAm ? story.readAm : story.read}</span>
                  </div>
                  <h3>
                    <a
                      href={`/updates?story=${encodeURIComponent(story.slug || story.h)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#8c2d3c] transition-colors"
                    >
                      {language === "am" && story.hAm ? story.hAm : story.h}
                    </a>
                  </h3>
                  <p>{language === "am" && story.eAm ? story.eAm : story.e}</p>
                  <a
                    href={`/updates?story=${encodeURIComponent(story.slug || story.h)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-sm text-[#8c2d3c] hover:underline mt-auto pt-2"
                  >
                    <span>{t("Continue reading", "ንባቡን ይቀጥሉ")}</span> <ArrowRight className="size-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="updates2-empty">
            <Search />
            <h3>{t("No matching updates.", "ተዛማጅ መረጃዎች አልተገኙም።")}</h3>
            <button
              onClick={() => {
                setQuery("");
                setTab("All");
              }}
            >
              {t("Clear search", "ፍለጋውን አጽዳ")}
            </button>
          </div>
        )}
      </section>

      <section className="updates2-events" id="events">
        <header>
          <div>
            <p className="updates2-eyebrow">{t("Gather with us", "ከእኛ ጋር ይሰብሰቡ")}</p>
            <h2>{t("Upcoming events.", "ቀጣይ ዝግጅቶች።")}</h2>
          </div>
          <p>
            {t(
              "Workshops, conversations, and member gatherings created to move knowledge into action.",
              "እውቀትን ወደ ተግባር ለመለወጥ የተዘጋጁ ወርክሾፖች፣ ውይይቶች እና የአባላት ስብሰባዎች።",
            )}
          </p>
        </header>
        <div className="updates2-event-grid">
          {events.map((event, index) => (
            <article className={index === 0 ? "is-next" : ""} key={event.title}>
              <div className="updates2-event-date">
                <strong>{event.day}</strong>
                <span>{event.month}</span>
              </div>
              <div className="updates2-event-copy">
                <div>
                  <span className="updates2-event-tag">{event.type}</span>
                  {event.full && <span className="updates2-event-tag is-full">{t("Full", "ተሞልቷል")}</span>}
                </div>
                <h3>{language === "am" && event.titleAm ? event.titleAm : event.title}</h3>
                <p>{language === "am" && event.descriptionAm ? event.descriptionAm : event.description}</p>
                <div className="updates2-event-meta">
                  <span>
                    <Clock /> {event.time}
                  </span>
                  <span>
                    <MapPin /> {language === "am" && event.locAm ? event.locAm : event.loc}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(event)}
                  className="updates2-event-more"
                >
                  {t("Event details", "የዝግጅቱ ዝርዝር")} <ArrowRight />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="updates2-subscribe">
        <div>
          <p className="updates2-eyebrow">{t("Newsletter", "ጋዜጣ")}</p>
          <h2>{t("The Narrative Shift.", "የአተረካክ ለውጥ።")}</h2>
          <p>
            {t(
              "A monthly digest of our stories, media analysis, policy briefs, and upcoming opportunities. Sent to journalists, researchers, and media leaders across Ethiopia.",
              "የታሪኮቻችን፣ የሚዲያ ትንተናዎች፣ የፖሊሲ ማጠቃለያዎች እና መጪ ዕድሎች ወርሃዊ መድብል። በመላው ኢትዮጵያ ለሚገኙ ጋዜጠኞች፣ ተመራማሪዎች እና የሚዲያ መሪዎች የሚላክ።",
            )}
          </p>
        </div>
        <form className="updates2-subscribe-form" onSubmit={handleSubscribe}>
          <div className="updates2-subscribe-row">
            <label>
              <span>{t("Email address", "የኢሜይል አድራሻ")}</span>
              <input
                name="email"
                type="email"
                required
                placeholder="name@example.com"
                disabled={newsletterStatus === "submitting"}
              />
            </label>
            <button type="submit" disabled={newsletterStatus === "submitting"}>
              {newsletterStatus === "submitting" ? t("Joining…", "በማስቀላቀል ላይ…") : t("Join the list", "ዝርዝሩን ይቀላቀሉ")} <ArrowRight />
            </button>
          </div>
          {newsletterMessage && (
            <p className={`updates2-subscribe-note${newsletterStatus === "success" ? " is-success" : newsletterStatus === "error" ? " is-error" : ""}`} role="status">
              {newsletterMessage}
            </p>
          )}
        </form>
      </section>

      {selectedEvent && (
        <div className="updates-story-backdrop" onMouseDown={() => setSelectedEvent(null)}>
          <article
            className="updates-story-modal updates-event-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="updates-event-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="updates-story-close"
              onClick={() => setSelectedEvent(null)}
              aria-label="Close event details"
            >
              <X />
            </button>
            <img
              src={selectedEvent.img || NEWS_IMG_FALLBACK}
              alt=""
              className="updates-story-image"
              onError={useNewsImageFallback}
            />
            <div className="updates-story-content">
              <div className="updates-story-meta">
                <span>{language === "am" && selectedEvent.typeAm ? selectedEvent.typeAm : selectedEvent.type}</span>
                <time>
                  {new Intl.DateTimeFormat("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(selectedEvent.startsAt))}
                </time>
                <small>{selectedEvent.full ? t("At capacity", "ቦታ አልቋል") : t("Registration available", "ምዝገባ ክፍት ነው")}</small>
              </div>
              <h2 id="updates-event-title">{language === "am" && selectedEvent.titleAm ? selectedEvent.titleAm : selectedEvent.title}</h2>
              <p className="updates-story-intro">{language === "am" && selectedEvent.descriptionAm ? selectedEvent.descriptionAm : selectedEvent.description}</p>
              <div className="updates-event-facts">
                <div><MapPin /><span>{t("Location", "ቦታ")}<strong>{language === "am" && selectedEvent.locAm ? selectedEvent.locAm : selectedEvent.loc}</strong></span></div>
                <div><Clock /><span>{t("Starts", "ይጀምራል")}<strong>{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(selectedEvent.startsAt))}</strong></span></div>
                {selectedEvent.endsAt && (
                  <div><Calendar /><span>{t("Ends", "ይጠናቀቃል")}<strong>{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(selectedEvent.endsAt))}</strong></span></div>
                )}
              </div>
              {!selectedEvent.full && selectedEvent.registrationUrl && (
                <a
                  className="updates-event-register"
                  href={selectedEvent.registrationUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("Register for this event", "ለዚህ ዝግጅት ይመዝገቡ")} <ArrowUpRight />
                </a>
              )}
            </div>
          </article>
        </div>
      )}
    </PageShell>
  );
}
