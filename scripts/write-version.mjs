import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const outputPath = path.join(publicDir, "version.json");

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const payload = {
  version: `${Date.now()}`,
  built_at: new Date().toISOString(),
};

fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log(`[version] wrote ${outputPath}`);
