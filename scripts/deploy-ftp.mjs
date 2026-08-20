import * as ftp from "basic-ftp";
import path from "node:path";
import fs from "node:fs";

async function main() {
  const host = process.env.FTP_SERVER?.trim();
  const user = process.env.FTP_USERNAME?.trim();
  const password = process.env.FTP_PASSWORD?.trim();
  const port = parseInt(process.env.FTP_PORT?.trim() || "21", 10);
  const secure = process.env.FTP_PROTOCOL?.trim() === "ftps";
  const distDir = path.resolve(process.cwd(), "dist");
  const localDir = fs.existsSync(distDir) ? distDir : path.resolve(process.cwd(), ".output/public");

  if (!host || !user || !password) {
    console.error("❌ Missing required FTP credentials: FTP_SERVER, FTP_USERNAME, or FTP_PASSWORD.");
    process.exit(1);
  }

  if (!fs.existsSync(localDir)) {
    console.error(`❌ Local directory not found: ${localDir}. Make sure 'npm run build' ran first.`);
    process.exit(1);
  }

  const client = new ftp.Client(60000);
  client.ftp.verbose = true;

  try {
    console.log(`📡 Connecting to FTP server: ${host}:${port} (secure: ${secure})...`);
    await client.access({
      host,
      user,
      password,
      port,
      secure,
      secureOptions: { rejectUnauthorized: false },
    });

    const initialPwd = await client.pwd();
    console.log(`📍 Initial FTP working directory: ${initialPwd}`);

    const rootListing = await client.list();
    console.log("📂 Directory listing:", rootListing.map((i) => `${i.isDirectory ? "[DIR]" : "[FILE]"} ${i.name}`).join(", "));

    // Determine correct target directory:
    // 1. If FTP user is already inside /public_html or home root is public_html
    // 2. If FTP user is at /home/user and public_html is a child folder
    let targetDir = "./";
    if (process.env.FTP_SERVER_DIR?.trim()) {
      targetDir = process.env.FTP_SERVER_DIR.trim();
    } else if (initialPwd.includes("public_html")) {
      targetDir = "./";
    } else if (rootListing.some((i) => i.name === "public_html" && i.isDirectory)) {
      // Check if this public_html is the real document root or a nested one
      if (rootListing.some((i) => i.name === "mail" || i.name === "etc" || i.name === "logs" || i.name === "ssl")) {
        targetDir = "public_html/";
      } else {
        targetDir = "./";
      }
    }

    console.log(`🎯 Target deployment directory: ${targetDir}`);
    await client.ensureDir(targetDir);

    // Remove any leftover default placeholder files if present
    const targetListing = await client.list();
    for (const item of targetListing) {
      if (item.name.toLowerCase() === "default.html" || item.name.toLowerCase() === "index.htm") {
        try {
          console.log(`🗑️ Removing legacy placeholder file: ${item.name}`);
          await client.remove(item.name);
        } catch {
          // ignore
        }
      }
    }

    console.log(`🚀 Uploading all build files from ${localDir} -> ${targetDir}...`);
    await client.uploadFromDir(localDir);

    const postListing = await client.list();
    console.log("📋 Verified deployed files in target directory:", postListing.map((i) => `${i.isDirectory ? "[DIR]" : "[FILE]"} ${i.name}`).join(", "));

    console.log("✅ Frontend deployed successfully to ethmwa.org!");
  } catch (err) {
    console.error("❌ Deployment failed with error:", err);
    process.exit(1);
  } finally {
    client.close();
  }
}

main();
