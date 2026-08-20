import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "";

const paths = [
  { path: "/", priority: "1.0", changefreq: "weekly" as const },
  { path: "/about", priority: "0.9", changefreq: "monthly" as const },
  { path: "/programs", priority: "0.9", changefreq: "weekly" as const },
  { path: "/membership", priority: "0.9", changefreq: "monthly" as const },
  { path: "/experts", priority: "0.8", changefreq: "weekly" as const },
  { path: "/updates", priority: "0.9", changefreq: "daily" as const },
  { path: "/resources", priority: "0.7", changefreq: "monthly" as const },
  { path: "/partners", priority: "0.6", changefreq: "monthly" as const },
  { path: "/testimonials", priority: "0.6", changefreq: "monthly" as const },
  { path: "/contact", priority: "0.7", changefreq: "yearly" as const },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = paths.map(e => [
          `  <url>`,
          `    <loc>${BASE_URL}${e.path}</loc>`,
          `    <changefreq>${e.changefreq}</changefreq>`,
          `    <priority>${e.priority}</priority>`,
          `  </url>`,
        ].join("\n"));

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
