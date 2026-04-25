import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { validateSourceManifest } from "./validators.mjs";

const SOURCE_TYPES = new Set(["markdown", "conversation", "report", "repo_state", "manual", "slack_file", "slack_message"]);

export function createSourceManifest(options) {
  const inputPath = required(options.input, "--input");
  const sourceId = options.sourceId ?? slugify(path.basename(inputPath, path.extname(inputPath)));
  const title = options.title ?? titleFromFilename(inputPath);
  const sourceType = options.sourceType ?? "markdown";
  const destinationPath = options.destination ?? `sources/inbox/${sourceId}${path.extname(inputPath) || ".md"}`;
  const manifestPath = options.manifest ?? `examples/${sourceId}.source-manifest.json`;

  if (!SOURCE_TYPES.has(sourceType)) {
    throw new Error(`unsupported source type: ${sourceType}`);
  }

  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });

  const raw = fs.readFileSync(inputPath, "utf8");
  const content = options.stripOpenClawWrapper ? stripOpenClawWrapper(raw) : raw;
  fs.writeFileSync(destinationPath, ensureTrailingNewline(content));

  const manifest = {
    source_id: sourceId,
    title,
    source_type: sourceType,
    path: destinationPath,
    captured_at: options.capturedAt ?? new Date().toISOString(),
    content_hash: hashFile(destinationPath),
    language: options.language ?? "zh-Hant",
    tags: options.tags ?? [],
    status: options.status ?? "inbox"
  };

  if (options.notes) manifest.notes = options.notes;
  if (options.origin) manifest.origin = options.origin;

  validateSourceManifest(manifest);
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  return { manifest, manifestPath, destinationPath };
}

function required(value, label) {
  if (!value) throw new Error(`${label} is required`);
  return value;
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "source";
}

function titleFromFilename(filePath) {
  return path.basename(filePath, path.extname(filePath)).replace(/[-_]+/g, " ");
}

function hashFile(filePath) {
  const digest = crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
  return `sha256:${digest}`;
}

function stripOpenClawWrapper(raw) {
  const start = raw.indexOf("---\n");
  const end = raw.indexOf("<<<END_EXTERNAL_UNTRUSTED_CONTENT");
  if (start !== -1 && end !== -1 && end > start) {
    return raw.slice(start + 4, end).trim();
  }
  return raw;
}

function ensureTrailingNewline(value) {
  return value.endsWith("\n") ? value : `${value}\n`;
}

function parseArgs(argv) {
  const options = { tags: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => argv[++index];
    if (arg === "--input") options.input = next();
    else if (arg === "--source-id") options.sourceId = next();
    else if (arg === "--title") options.title = next();
    else if (arg === "--source-type") options.sourceType = next();
    else if (arg === "--destination") options.destination = next();
    else if (arg === "--manifest") options.manifest = next();
    else if (arg === "--captured-at") options.capturedAt = next();
    else if (arg === "--language") options.language = next();
    else if (arg === "--tag") options.tags.push(next());
    else if (arg === "--status") options.status = next();
    else if (arg === "--notes") options.notes = next();
    else if (arg === "--origin-channel") options.origin = { ...(options.origin ?? {}), channel: next() };
    else if (arg === "--origin-message-id") options.origin = { ...(options.origin ?? {}), message_id: next() };
    else if (arg === "--origin-thread-id") options.origin = { ...(options.origin ?? {}), thread_id: next() };
    else if (arg === "--origin-sender") options.origin = { ...(options.origin ?? {}), sender: next() };
    else if (arg === "--strip-openclaw-wrapper") options.stripOpenClawWrapper = true;
    else if (arg === "--help") options.help = true;
    else throw new Error(`unknown argument: ${arg}`);
  }
  return options;
}

function usage() {
  return `usage: node scripts/create-source-manifest.mjs --input <file> [options]\n\nOptions:\n  --source-id <id>\n  --title <title>\n  --source-type <markdown|conversation|report|repo_state|manual|slack_file|slack_message>\n  --destination <path>\n  --manifest <path>\n  --captured-at <iso>\n  --language <lang>\n  --tag <tag> (repeatable)\n  --notes <text>\n  --origin-channel slack --origin-message-id ... --origin-thread-id ... --origin-sender Jones\n  --strip-openclaw-wrapper\n`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log(usage());
      process.exit(0);
    }
    const result = createSourceManifest(options);
    console.log(`source copied: ${result.destinationPath}`);
    console.log(`manifest written: ${result.manifestPath}`);
    console.log(JSON.stringify({
      source_id: result.manifest.source_id,
      content_hash: result.manifest.content_hash,
      source_type: result.manifest.source_type,
      status: result.manifest.status
    }, null, 2));
  } catch (error) {
    console.error(error.message);
    console.error(usage());
    process.exit(1);
  }
}
