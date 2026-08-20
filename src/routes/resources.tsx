import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, BookOpen, Download, FileCheck2, Search } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { API_BASE } from "@/lib/admin-api";
import { useLanguage } from "@/lib/language-context";

export const Route = createFileRoute("/resources")({
  head: () => ({ meta: [
    { title: "Resource Center — EMWA" },
    { name: "description", content: "Research, reports, practical toolkits, and policy resources from the Ethiopian Media Women Association." },
  ] }),
  component: Resources,
});

type ResourceDocument = {
  id: string; title: string; format: string; size: string;
  year: string; description: string; accent: "burgundy" | "ochre" | "sage" | "blue";
  fileUrl: string; createdAt: string;
};

const formatFileSize = (value: unknown) => {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return "File";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const resolveFileUrl = (value: unknown) => {
  if (!value) return "";
  try {
    const origin = new URL(API_BASE).origin;
    const url = new URL(String(value), origin);
    return url.pathname.startsWith("/uploads/") ? `${origin}${url.pathname}` : url.toString();
  } catch { return ""; }
};

function Resources() {
  const { t, language } = useLanguage();
  const [documents, setDocuments] = useState<ResourceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "popular" | "title">("newest");

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(`${API_BASE}/public/resources`, { signal: controller.signal });
        if (!response.ok) throw new Error(t("Unable to load resources", "መረጃዎችን መጫን አልተቻለም"));
        const payload = await response.json();
        const accents: ResourceDocument["accent"][] = ["burgundy", "ochre", "sage", "blue"];
        setDocuments((Array.isArray(payload.data) ? payload.data : []).map((row: Record<string, unknown>, index: number) => {
          const createdAt = String(row.created_at ?? new Date().toISOString());
          const mime = String(row.mime_type ?? "");
          return {
            id: String(row.id), title: String(row.title), description: String(row.description),
            format: mime.includes("pdf") ? "PDF" : mime.split("/")[1]?.toUpperCase() || "FILE",
            size: formatFileSize(row.file_size), year: String(new Date(createdAt).getFullYear()),
            accent: accents[index % accents.length], fileUrl: resolveFileUrl(row.file_url), createdAt,
          };
        }));
        setLoadError("");
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") setLoadError(t("The resource library could not be loaded. Please try again.", "የመረጃ ቤተ-መጽሐፍቱን መጫን አልተቻለም። እባክዎን እንደገና ይሞክሩ።"));
      } finally { if (!controller.signal.aborted) setLoading(false); }
    })();
    return () => controller.abort();
  }, [t]);

  const featured = documents[0];
  const filtered = useMemo(() => documents.filter((item) =>
    (!query.trim() || `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase())))
    .sort((a, b) => sort === "title" ? a.title.localeCompare(b.title) : b.createdAt.localeCompare(a.createdAt)),
  [documents, query, sort]);

  return <PageShell>
    <section className="resources-hero">
      <div className="resources-hero-copy">
        <p className="resources-eyebrow">{t("Open knowledge / EMWA", "ክፍት እውቀት / EMWA")}</p>
        <h1>
          {language === "am" ? (
            <>
              ለተግባር የሚሆን ማስረጃ።<br /><em>ለስራው የሚሆኑ መሳሪያዎች።</em>
            </>
          ) : (
            <>
              Evidence for action.<br /><em>Tools for the work.</em>
            </>
          )}
        </h1>
        <p>{t("A public collection of research, practical guidance, and policy thinking for journalists, newsrooms, educators, and advocates.", "ለጋዜጠኞች፣ ለዜና ክፍሎች፣ ለአስተማሪዎች እና ለተሟጋቾች የቀረበ የምርምር፣ የተግባር መመሪያዎች እና የፖሊሲ ሃሳቦች ህዝባዊ ስብስብ።")}</p>
        <a href="#resource-library">{t("Explore the library", "ቤተ-መጽሐፍቱን ያስሱ")} <ArrowRight /></a>
        <div className="resources-hero-note">
          <FileCheck2 />
          <span>
            {t("Free to download", "በነፃ የሚወርድ")}
            <br />
            <strong>{t("Designed to be cited and shared", "ለመጠቀስ እና ለመጋራት የተዘጋጀ")}</strong>
          </span>
        </div>
      </div>
      {featured && <article className="resources-featured">
        <div className="resources-featured-cover"><span>EMWA<br />{t("Resource", "መረጃ")}</span><strong>{featured.year}</strong><i aria-hidden="true">01</i></div>
        <div className="resources-featured-copy">
          <p>{t("Featured publication", "ልዩ ህትመት")}</p>
          <h2>{featured.title}</h2>
          <p>{featured.description}</p>
          <div><span>{featured.format}</span><span>{t("Open access", "ክፍት ተደራሽነት")}</span><span>{featured.size}</span></div>
          <a href={`${API_BASE}/public/resources/${featured.id}/download`} download>{t("Download resource", "መረጃውን ያውርዱ")} <Download /></a>
        </div>
      </article>}
    </section>

    <section className="resources-library" id="resource-library" aria-labelledby="resource-library-heading">
      <header className="resources-section-head">
        <div>
          <p className="resources-eyebrow">{t("Resource library", "የመረጃ ቤተ-መጽሐፍት")}</p>
          <h2 id="resource-library-heading">{t("Find what you need.", "የሚያስፈልግዎትን ያግኙ።")}</h2>
        </div>
        <p>{t("Search the complete archive by topic or browse collections built for research, practice, and policy.", "ሙሉውን መዝገብ በርዕስ ጉዳይ ይፈልጉ ወይም ለምርምር፣ ለተግባር እና ለፖሊሲ የተሰበሰቡትን ይመልከቱ።")}</p>
      </header>
      <div className="resources-controls">
        <label className="resources-search">
          <Search />
          <span className="sr-only">{t("Search resources", "መረጃዎችን ይፈልጉ")}</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Search title or topic", "በስም ወይም በርዕስ ጉዳይ ይፈልጉ")} />
        </label>
        <label className="resources-sort">
          <span>{t("Sort", "ክፍልፍል")}</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}>
            <option value="newest">{t("Newest first", "አዲስ የመጀመሪያ")}</option>
            <option value="popular">{t("Most downloaded", "በብዛት የወረዱ")}</option>
            <option value="title">{t("Title A–Z", "በአርእስት A–Z")}</option>
          </select>
        </label>
      </div>
      <div className="resources-result-count">
        <p>
          {language === "am" ? (
            <>
              <strong>{filtered.length}</strong> መረጃዎች ይገኛሉ
            </>
          ) : (
            <>
              <strong>{filtered.length}</strong> resources available
            </>
          )}
        </p>
        <span>{t("Live resource library", "የቀጥታ የመረጃ ቤተ-መጽሐፍት")}</span>
      </div>
      {loading ? <Empty title={t("Loading resources...", "መረጃዎችን በመጫን ላይ...")} /> : loadError ? <Empty title={t("Resources unavailable.", "መረጃዎች አይገኙም።")} message={loadError} /> : filtered.length ?
        <div className="resources-grid" aria-live="polite">{filtered.map((document, index) => <article className={`resource-card resource-card--${document.accent}`} key={document.id}>
          <div className="resource-card-cover"><span>{t("Publication", "ህትመት")}</span><strong>{document.year}</strong><i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i><small>{t("EMWA Resource Center", "የEMWA የመረጃ ማዕከል")}</small></div>
          <div className="resource-card-content">
            <div className="resource-card-meta"><span>{document.format} / {document.size}</span><span>{t("Open access", "ክፍት ተደራሽነት")}</span></div>
            <h3>{document.title}</h3>
            <p>{document.description}</p>
            <div className="resource-card-actions">
              <a href={`${API_BASE}/public/resources/${document.id}/download`} download><Download /> {t("Download", "አውርድ")}</a>
              <a href={document.fileUrl} target="_blank" rel="noreferrer" aria-label={`View ${document.title}`}><ArrowUpRight /></a>
            </div>
          </div>
        </article>)}</div> :
        <div className="resources-empty">
          <BookOpen />
          <h3>{t("No resources found.", "ምንም መረጃ አልተገኘም።")}</h3>
          <p>{t("Try another search term.", "በሌላ የፍለጋ ቃል ይሞክሩ።")}</p>
          <button onClick={() => setQuery("")}>{t("Reset library", "ቤተ-መጽሐፍቱን እንደገና አስጀምር")}</button>
        </div>}
    </section>

    <section className="resources-guidance">
      <div>
        <p className="resources-eyebrow">{t("Using our resources", "መረጃዎቻችንን መጠቀም")}</p>
        <h2>
          {language === "am" ? (
            <>
              ተጠቀሙባቸው። ጥቀሷቸው።<br />ለስራ ውሏቸው።
            </>
          ) : (
            <>
              Use them. Cite them.<br />Put them to work.
            </>
          )}
        </h2>
      </div>
      <div className="resources-guidance-list">
        <article>
          <span>01</span>
          <div>
            <h3>{t("Open access", "ክፍት ተደራሽነት")}</h3>
            <p>{t("Resources are free for professional, educational, and advocacy use.", "መረጃዎቹ ለሙያዊ፣ ለትምህርታዊ እና ለተሟጋችነት አገልግሎት በነፃ የቀረቡ ናቸው።")}</p>
          </div>
        </article>
        <article>
          <span>02</span>
          <div>
            <h3>{t("Credit the source", "ምንጩን ይጠቅሱ")}</h3>
            <p>{t("Use the publication title, EMWA, and publication year when citing.", "በሚጠቅሱበት ጊዜ የህትመቱን ርዕስ፣ EMWA እና የታተመበትን ዓመት ይጠቀሙ።")}</p>
          </div>
        </article>
        <article>
          <span>03</span>
          <div>
            <h3>{t("Need another format?", "ሌላ ፎርማት ይፈልጋሉ?")}</h3>
            <p>{t("Contact our team for accessible or print-ready versions.", "ለህትመት የተዘጋጁ ወይም ተደራሽ የሆኑ ፎርማቶችን ለማግኘት ቡድናችንን ያነጋግሩ።")}</p>
          </div>
        </article>
      </div>
    </section>

    <section className="resources-request">
      <div>
        <p className="resources-eyebrow">{t("Can't find it?", "አላገኙትም?")}</p>
        <h2>
          {language === "am" ? (
            <>
              ለዜና ክፍልዎ ምን እንደሚጠቅም<br />ይንገሩን።
            </>
          ) : (
            <>
              Tell us what would<br />help your newsroom.
            </>
          )}
        </h2>
      </div>
      <Link to="/contact">{t("Request a resource", "መረጃ ይጠይቁ")} <ArrowUpRight /></Link>
    </section>
  </PageShell>;
}

function Empty({ title, message }: { title: string; message?: string }) {
  return <div className="resources-empty" role="status"><BookOpen /><h3>{title}</h3>{message && <p>{message}</p>}</div>;
}

