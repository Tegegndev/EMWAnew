import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROUTES = [
  "/",
  "/about",
  "/updates",
  "/programs",
  "/membership",
  "/experts",
  "/resources",
  "/contact",
  "/search",
  "/testimonials",
  "/partners",
  "/voices-in-motion",
  "/privacy",
  "/terms",
  "/admin",
  "/donate",
  "/thank-you",
];

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function main() {
  const ssrPath = path.resolve(process.cwd(), ".output/server/_ssr/ssr.mjs");
  const publicDir = path.resolve(process.cwd(), ".output/public");
  const distDir = path.resolve(process.cwd(), "dist");

  if (!fs.existsSync(ssrPath)) {
    console.error(`❌ SSR module not found at ${ssrPath}. Run 'npm run build' first.`);
    process.exit(1);
  }

  const { default: ssrHandler } = await import(pathToFileURL(ssrPath).href);

  console.log("⚡ Pre-rendering static HTML for all routes...");

  let rootHtml = "";

  for (const route of ROUTES) {
    try {
      let url = `http://localhost${route}`;
      let response = await ssrHandler.fetch(new Request(url));
      let html = await response.text();

      // If route returned a redirect, follow it
      if ((response.status === 307 || response.status === 302 || response.status === 301) && response.headers.get("location")) {
        const loc = response.headers.get("location");
        const nextUrl = loc.startsWith("http") ? loc : `http://localhost${loc}`;
        response = await ssrHandler.fetch(new Request(nextUrl));
        html = await response.text();
      }

      // If still empty, fallback to rootHtml template
      if (!html.trim() && rootHtml) {
        html = rootHtml;
      }

      if (route === "/") {
        rootHtml = html;
        fs.writeFileSync(path.join(publicDir, "index.html"), html, "utf-8");
        console.log(`  ✓ / -> .output/public/index.html (${html.length} bytes)`);
      } else {
        const routeClean = route.replace(/^\/+/, "");
        const routeDir = path.join(publicDir, routeClean);
        fs.mkdirSync(routeDir, { recursive: true });
        fs.writeFileSync(path.join(routeDir, "index.html"), html, "utf-8");
        fs.writeFileSync(path.join(publicDir, `${routeClean}.html`), html, "utf-8");
        console.log(`  ✓ ${route} -> .output/public/${routeClean}/index.html (${html.length} bytes)`);
      }
    } catch (err) {
      console.error(`❌ Failed to pre-render route ${route}:`, err);
    }
  }

  const htaccessSrc = path.resolve(process.cwd(), "public/.htaccess");
  if (fs.existsSync(htaccessSrc)) {
    fs.copyFileSync(htaccessSrc, path.join(publicDir, ".htaccess"));
    console.log("  ✓ .htaccess copied to .output/public/.htaccess");
  }

  // Generate clean root dist/ folder
  console.log("📦 Creating clean 'dist/' deployment folder...");
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  copyDirRecursive(publicDir, distDir);

  if (fs.existsSync(htaccessSrc)) {
    fs.copyFileSync(htaccessSrc, path.join(distDir, ".htaccess"));
  }

  console.log("✅ Static pre-rendering completed! Production bundle is ready in 'dist/' folder.");
}

main();
