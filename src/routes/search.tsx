import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import { useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  head: () => ({
    meta: [
      { title: "Search — EMWA" },
      { name: "description", content: "Search across EMWA pages, experts, updates, and resources." },
      { property: "og:title", content: "Search — EMWA" },
      { property: "og:description", content: "Global search across the EMWA website." },
    ],
  }),
  component: SearchPage,
});

type Doc = { title: string; type: string; href: string; excerpt: string };

const INDEX: Doc[] = [
  { title: "About EMWA", type: "Page", href: "/about", excerpt: "History, vision, mission, and leadership since 1998." },
  { title: "Membership", type: "Page", href: "/membership", excerpt: "Tiers, benefits, eligibility, application." },
  { title: "Experts Directory", type: "Page", href: "/experts", excerpt: "400+ verified women media experts." },
  { title: "Programs", type: "Page", href: "/programs", excerpt: "Leadership incubator, safety network, grants, fellowships." },
  { title: "Updates", type: "Page", href: "/updates", excerpt: "Latest press releases, articles, events, and workshops." },
  { title: "Resource Center", type: "Page", href: "/resources", excerpt: "Research, reports, toolkits." },
  { title: "Digital Safety Toolkit", type: "Resource", href: "/resources", excerpt: "PDF · 1.8 MB · 5,210 downloads." },
  { title: "Media Ethics Symposium 2026", type: "Event", href: "/updates", excerpt: "05 December 2026, Addis Ababa." },
  { title: "Soliyana Gebre", type: "Expert", href: "/experts", excerpt: "Broadcast Strategy · Addis Ababa." },
  { title: "Leadership Incubator", type: "Program", href: "/programs", excerpt: "Six-month executive residency." },
];

const POPULAR = ["membership", "safety", "experts", "grants", "leadership"];

function SearchPage() {
  const { q: initialQuery } = Route.useSearch();
  const [q, setQ] = useState(initialQuery);
  const results = useMemo(() => {
    if (!q.trim()) return [];
    return INDEX.filter(d =>
      d.title.toLowerCase().includes(q.toLowerCase()) ||
      d.excerpt.toLowerCase().includes(q.toLowerCase())
    );
  }, [q]);

  return (
    <PageShell>
      <PageHero
        eyebrow="Search"
        title={<>Find <span className="text-primary">anything.</span></>}
      />

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="relative border-b-2 border-foreground focus-within:border-primary transition-colors">
            <SearchIcon className="absolute left-0 top-1/2 -translate-y-1/2 size-6" />
            <input
              autoFocus
              aria-label="Search the EMWA website"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search EMWA..."
              className="w-full pl-10 py-5 bg-transparent outline-none font-display text-4xl"
            />
          </div>

          {!q && (
            <div className="mt-12 space-y-8">
              <div>
                <p className="label-mono text-primary mb-4">Popular searches</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map(p => (
                    <button key={p} onClick={() => setQ(p)} className="label-mono border border-border px-4 py-2 hover:border-foreground hover:text-primary transition-all">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="label-mono text-primary mb-4">Suggestions</p>
                <ul className="space-y-3">
                  {INDEX.slice(0, 5).map(d => (
                    <li key={d.title}>
                      <Link to={d.href} className="flex justify-between border-b border-border py-3 hover:text-primary">
                        <span className="font-display text-2xl">{d.title}</span>
                        <span className="label-mono text-muted-foreground self-center">{d.type}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {q && (
            <div className="mt-12">
              <p className="label-mono text-muted-foreground mb-8">{results.length} results for "{q}"</p>
              {results.length === 0 ? (
                <p className="font-display text-3xl">No results. Try a broader term.</p>
              ) : (
                <ul className="space-y-6">
                  {results.map(r => (
                    <li key={r.title} className="border-t border-border pt-6">
                      <Link to={r.href} className="group block">
                        <p className="label-mono text-primary mb-2">{r.type}</p>
                        <p className="font-display text-3xl group-hover:text-primary transition-colors">{r.title}</p>
                        <p className="text-muted-foreground mt-2">{r.excerpt}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
