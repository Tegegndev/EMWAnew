import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";
import globalImg from "@/assets/emwa-replace.jpg";
import { Play } from "lucide-react";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Testimonials & Success Stories — EMWA" },
      { name: "description", content: "Member stories, partner testimonials, and community impact from the Ethiopian Media Women Association." },
      { property: "og:title", content: "Testimonials & Success Stories — EMWA" },
      { property: "og:description", content: "Member and partner stories of impact from EMWA." },
    ],
  }),
  component: Testimonials,
});

const STORIES = [
  { q: "EMWA didn't just train me. It gave me a peer network of women editors who I still call when I need to check my instincts on a hard story.", a: "Meskerem H.", r: "Senior Editor, Fana Broadcasting", img: globalImg },
  { q: "The digital safety toolkit and legal help arrived within hours of a coordinated harassment campaign against me. That is what real solidarity looks like.", a: "Yordanos M.", r: "Independent Journalist, Mekelle", img: globalImg },
  { q: "The Regional Grant funded my six-month investigation into healthcare gaps in South Omo. It ran on the front page. It changed regulation.", a: "Ayantu B.", r: "Investigative Reporter, Arba Minch", img: globalImg },
  { q: "Our partnership with EMWA reshaped how we recruit and retain women editors. Six years in, our newsroom looks like the country we cover.", a: "Head of News", r: "Ethiopian Broadcasting Corporation", img: globalImg },
];

function Testimonials() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Voices"
        title={<>Stories from our <span className="text-primary">members.</span></>}
        lede="What EMWA looks like from the inside — from members, partners, and the communities our members serve."
      />

      {/* Big quote stack */}
      <section className="py-16">
        <div className="max-w-[1400px] mx-auto px-6 space-y-24">
          {STORIES.map((s, i) => (
            <figure
              key={s.a}
              className={`grid md:grid-cols-12 gap-8 items-center ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
            >
              <div className={`md:col-span-5 ${i % 2 === 1 ? "md:order-2" : ""}`}>
                <div className="aspect-square overflow-hidden">
                  <img src={s.img} alt={s.a} width={800} height={800} loading="lazy" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className={`md:col-span-7 ${i % 2 === 1 ? "md:order-1" : ""}`}>
                <p className="label-mono text-primary mb-6">Story {String(i + 1).padStart(2, "0")}</p>
                <blockquote className="font-display text-3xl md:text-5xl leading-[1.1] tracking-tight">
                  "{s.q}"
                </blockquote>
                <figcaption className="mt-8 label-mono">
                  <span className="text-primary">{s.a}</span> · {s.r}
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </section>

      {/* Video */}
      <section className="py-24 border-t border-border">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="label-mono text-primary mb-4">Video Testimonials</p>
          <h2 className="font-display text-5xl md:text-6xl mb-16">In their own voice.</h2>
          <div className="grid md:grid-cols-3 gap-6">
          {[globalImg, globalImg, globalImg].map((img, i) => (
              <div key={i} className="relative aspect-[4/5] overflow-hidden group cursor-pointer">
                <img src={img} alt="" width={800} height={1000} loading="lazy" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                <div className="absolute inset-0 bg-foreground/40 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground grid place-items-center group-hover:scale-110 transition-transform">
                    <Play className="size-6 ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 text-background">
                  <p className="font-display text-2xl">Story {i + 1}</p>
                  <p className="label-mono">3:24</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
