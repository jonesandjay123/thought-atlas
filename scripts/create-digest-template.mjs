import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { readJson, validateDigest, validateSourceManifest } from "./validators.mjs";

export function createDigestTemplate(options) {
  const manifestPath = required(options.manifestPath, "--manifest");
  const manifest = readJson(manifestPath);
  validateSourceManifest(manifest);

  const digestPath = options.outputPath ?? `digests/${manifest.source_id}.digest.json`;
  const digest = {
    digest_id: `${manifest.source_id}.digest`,
    source_id: manifest.source_id,
    created_at: options.createdAt ?? new Date().toISOString(),
    summary: options.summary ?? `TODO: summarize ${manifest.title}`,
    items: [
      {
        id: `${manifest.source_id}.first-thought`,
        kind: "claim",
        title: "TODO: durable thought title",
        body: "TODO: explain why this thought should be preserved.",
        source_refs: [
          {
            source_id: manifest.source_id,
            path: manifest.path,
            start_line: 1,
            end_line: 1
          }
        ],
        confidence: 0.5,
        tags: manifest.tags ?? []
      }
    ]
  };

  validateDigest(digest);
  fs.mkdirSync(path.dirname(digestPath), { recursive: true });
  if (fs.existsSync(digestPath) && !options.force) {
    throw new Error(`digest already exists: ${digestPath} (use --force to overwrite)`);
  }
  fs.writeFileSync(digestPath, `${JSON.stringify(digest, null, 2)}\n`);
  return { digest, digestPath };
}

function required(value, label) {
  if (!value) throw new Error(`${label} is required`);
  return value;
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => argv[++index];
    if (arg === "--manifest") options.manifestPath = next();
    else if (arg === "--output") options.outputPath = next();
    else if (arg === "--created-at") options.createdAt = next();
    else if (arg === "--summary") options.summary = next();
    else if (arg === "--force") options.force = true;
    else throw new Error(`unknown argument: ${arg}`);
  }
  return options;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = createDigestTemplate(parseArgs(process.argv.slice(2)));
    console.log(`digest template written: ${result.digestPath}`);
    console.log(JSON.stringify({ digest_id: result.digest.digest_id, source_id: result.digest.source_id, items: result.digest.items.length }, null, 2));
  } catch (error) {
    console.error(error.message);
    console.error("usage: node scripts/create-digest-template.mjs --manifest <source-manifest.json> [--output path] [--force]");
    process.exit(1);
  }
}
