import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { readJson } from "./validators.mjs";

export function sourceStatus(options = {}) {
  const manifests = findManifestFiles(options.manifestDir ?? "examples")
    .map((filePath) => ({ filePath, manifest: readJson(filePath) }));

  let contentHash = options.hash;
  if (options.file) contentHash = hashFile(options.file);

  const matches = manifests.filter(({ manifest }) => {
    if (options.sourceId && manifest.source_id !== options.sourceId) return false;
    if (contentHash && manifest.content_hash !== contentHash) return false;
    return true;
  });

  return { query: { source_id: options.sourceId, content_hash: contentHash }, matches };
}

function findManifestFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const filePath = path.join(dir, entry.name);
      if (entry.isDirectory()) return findManifestFiles(filePath);
      return entry.isFile() && entry.name.endsWith(".source-manifest.json") ? [filePath] : [];
    });
}

function hashFile(filePath) {
  const digest = crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
  return `sha256:${digest}`;
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => argv[++index];
    if (arg === "--source-id") options.sourceId = next();
    else if (arg === "--hash") options.hash = next();
    else if (arg === "--file") options.file = next();
    else if (arg === "--manifest-dir") options.manifestDir = next();
    else throw new Error(`unknown argument: ${arg}`);
  }
  return options;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = sourceStatus(parseArgs(process.argv.slice(2)));
    console.log("Source status");
    console.log(JSON.stringify(result.query, null, 2));
    if (!result.matches.length) {
      console.log("No matching source manifests.");
    } else {
      console.log(`Matches: ${result.matches.length}`);
      for (const { filePath, manifest } of result.matches) {
        console.log(`- ${manifest.source_id} (${manifest.status})`);
        console.log(`  manifest: ${filePath}`);
        console.log(`  path: ${manifest.path}`);
        console.log(`  hash: ${manifest.content_hash}`);
        if (manifest.origin?.message_id) console.log(`  slack: ${manifest.origin.message_id}`);
      }
    }
  } catch (error) {
    console.error(error.message);
    console.error("usage: node scripts/source-status.mjs [--source-id id] [--hash sha256:...] [--file path]");
    process.exit(1);
  }
}
