import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useState, useEffect } from "react";
import { ExternalLink, Volume2 } from "lucide-react";

export const Route = createFileRoute("/voices-in-motion")({
  component: VoicesInMotion,
});

interface NewsChannel {
  id: string;
  name: string;
  logo: string;
  title: string;
  description: string;
  youtubeUrl: string;
  color: string;
}

const NEWS_CHANNELS: NewsChannel[] = [
  {
    id: "bbc",
    name: "BBC",
    logo: "🔴",
    title: "BBC News Africa",
    description: "Breaking news from across the African continent with in-depth analysis.",
    youtubeUrl: "https://www.youtube.com/@BBCAfrika/live",
    color: "from-red-600 to-red-800",
  },
  {
    id: "cnn",
    name: "CNN",
    logo: "🔵",
    title: "CNN International",
    description: "Global headlines with a focus on African and Ethiopian stories.",
    youtubeUrl: "https://www.youtube.com/@CNN/live",
    color: "from-blue-600 to-blue-800",
  },
  {
    id: "algeciras",
    name: "Algeciras",
    logo: "📡",
    title: "Algeciras Network",
    description: "Mediterranean and African news coverage with expert analysis.",
    youtubeUrl: "https://www.youtube.com/",
    color: "from-yellow-600 to-yellow-800",
  },
  {
    id: "foxnews",
    name: "Fox News",
    logo: "🦊",
    title: "Fox News World",
    description: "International reporting including coverage of East African developments.",
    youtubeUrl: "https://www.youtube.com/@FoxNews/live",
    color: "from-orange-600 to-orange-800",
  },
];

function NewsChannelCard({ channel, index }: { channel: NewsChannel; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={channel.youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group block h-full"
    >
      <div
        className={`relative h-80 md:h-96 overflow-hidden bg-gradient-to-br ${channel.color} rounded-lg transition-all duration-500 transform cursor-pointer hover:shadow-2xl hover:-translate-y-2`}
        style={{
          animation: isHovered ? "none" : `slideIn 0.6s ease-out 0.${index * 100}ms forwards`,
        }}
      >
        {/* Background Animation */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />

        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between p-8 md:p-10 text-white transform transition-all duration-500 group-hover:scale-105">
          {/* Logo */}
          <div className="flex items-center justify-center">
            <div className="text-7xl md:text-8xl animate-pulse group-hover:animate-bounce transition-all duration-300">
              {channel.logo}
            </div>
          </div>

          {/* Title and Description */}
          <div className="text-center transform transition-transform duration-500 group-hover:-translate-y-4">
            <h3 className="font-display text-2xl md:text-3xl mb-3 font-bold">
              {channel.title}
            </h3>
            <p className="text-sm md:text-base text-white/80 leading-relaxed max-w-sm mx-auto">
              {channel.description}
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-4 transition-all duration-500">
            <span className="label-mono text-white flex items-center gap-2">
              Watch on YouTube <ExternalLink className="size-4" />
            </span>
          </div>

          {/* Sound Wave Animation */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Volume2 className="size-3 text-white/60" />
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-2 w-1 bg-white/60 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

function VoicesInMotion() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % NEWS_CHANNELS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <PageShell>
      {/* HERO */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-foreground/5 to-background">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-16">
            <p className="label-mono text-primary mb-4 animate-reveal">Global Voices</p>
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl leading-[0.85] tracking-tighter mb-8 animate-reveal">
              Voices in
              <br />
              <span className="text-secondary">Motion</span>
            </h1>
            <p className="text-lg leading-snug max-w-2xl text-muted-foreground animate-reveal">
              Connect with leading international news networks covering Ethiopian and African stories. 
              Watch live broadcasts and stay informed with global perspectives on our continent.
            </p>
          </div>
        </div>
      </section>

      {/* NEWS CHANNELS GRID */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-12">
            <p className="label-mono text-primary mb-4">Featured Networks</p>
            <h2 className="font-display text-5xl md:text-7xl tracking-tighter leading-none">
              Your window to the world.
            </h2>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {NEWS_CHANNELS.map((channel, index) => (
              <NewsChannelCard key={channel.id} channel={channel} index={index} />
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-20 bg-muted/40 border border-border rounded-lg p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-display text-2xl md:text-3xl mb-4">Why Global Coverage Matters</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ethiopian and African stories deserve to be told on the world stage. These channels 
                  provide platforms where our voices are heard, our achievements are celebrated, and our 
                  challenges are understood in a global context.
                </p>
              </div>
              <div>
                <h3 className="font-display text-2xl md:text-3xl mb-4">Stay Connected</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Click on any channel above to watch live broadcasts. Subscribe to stay updated on the 
                  latest developments affecting our region. Engage with international journalism that 
                  covers stories that matter to you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <section className="py-24 md:py-32 bg-muted/40 border-y border-border">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-16">
            <p className="label-mono text-primary mb-4">Latest Coverage</p>
            <h2 className="font-display text-5xl md:text-7xl tracking-tighter leading-none">
              Recent stories from our networks.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Women in Journalism: Breaking Barriers",
                source: "BBC Africa",
                date: "Nov 15, 2026",
              },
              {
                title: "Ethiopia's Media Revolution",
                source: "CNN International",
                date: "Nov 12, 2026",
              },
              {
                title: "East Africa Business Growth",
                source: "Fox News World",
                date: "Nov 10, 2026",
              },
            ].map((story, idx) => (
              <article
                key={idx}
                className="bg-background border border-border p-8 hover:bg-muted/50 hover:border-primary transition-all duration-300 cursor-pointer group"
              >
                <p className="label-mono text-primary mb-3 group-hover:text-secondary transition-colors">
                  {story.source}
                </p>
                <h3 className="font-display text-2xl leading-tight mb-4 group-hover:text-primary transition-colors">
                  {story.title}
                </h3>
                <p className="label-mono text-muted-foreground text-sm">{story.date}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 bg-secondary text-secondary-foreground">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-5xl md:text-7xl leading-none tracking-tighter mb-8">
            Share Your Voice
          </h2>
          <p className="text-lg leading-relaxed mb-10">
            Have a story that deserves international coverage? Connect with EMWA to amplify your voice 
            and reach audiences worldwide.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-background text-foreground px-8 py-4 label-mono hover:bg-foreground hover:text-background transition-all duration-300 hover:shadow-lg"
          >
            Get in Touch <ExternalLink className="size-4" />
          </Link>
        </div>
      </section>

      {/* Animation Styles */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </PageShell>
  );
}
