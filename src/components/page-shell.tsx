import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[100] -translate-y-20 bg-foreground px-5 py-3 text-background label-mono focus:translate-y-0"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: string;
}) {
  return (
    <section className="border-b border-border">
      <div className="site-container pt-16 pb-14 md:pt-28 md:pb-24">
        <p className="label-mono text-primary animate-reveal">{eyebrow}</p>
        <h1 className="font-display text-5xl sm:text-6xl md:text-8xl lg:text-9xl leading-[0.92] tracking-tighter mt-5 md:mt-6 max-w-5xl text-balance animate-reveal">
          {title}
        </h1>
        {lede && (
          <p className="mt-8 text-lg md:text-xl max-w-2xl text-muted-foreground leading-relaxed animate-reveal">
            {lede}
          </p>
        )}
      </div>
    </section>
  );
}
