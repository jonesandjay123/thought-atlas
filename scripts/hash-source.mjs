import crypto from "node:crypto";
import fs from "node:fs";

const path = process.argv[2];
if (!path) {
  console.error("usage: node scripts/hash-source.mjs <path>");
  process.exit(1);
}

const digest = crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex");
console.log(`sha256:${digest}`);
