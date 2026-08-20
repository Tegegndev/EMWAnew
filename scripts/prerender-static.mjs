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

  for (const route of ROUTES) {
    try {
      const url = `http://localhost${route}`;
      const response = await ssrHandler.fetch(new Request(url));
      const html = await response.text();

      if (response.status !== 200 && response.status !== 302 && response.status !== 307) {
        console.warn(`⚠️ Warning: Route ${route} returned status ${response.status}`);
      }

      if (route === "/") {
        fs.writeFileSync(path.join(publicDir, "index.html"), html, "utf-8");
        console.log(`  ✓ / -> .output/public/index.html (${html.length} bytes)`);
      } else {
        const routeClean = route.replace(/^\/+/, "");
        const routeDir = path.join(publicDir, routeClean);
        fs.mkdirSync(routeDir, { recursive: true });
        fs.writeFileSync(path.join(routeDir, "index.html"), html, "utf-8");
        fs.writeFileSync(path.join(publicDir, `${routeClean}.html`), html, "utf-8");
        console.log(`  ✓ ${route} -> .output/public/${routeClean}/index.html`);
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
