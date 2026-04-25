import { pathToFileURL } from "node:url";
import { readJson, validateDigest, validateGraphPatch } from "./validators.mjs";

export function runQualityGate(options = {}) {
  const minConfidence = options.minConfidence ?? 0.65;
  const maxRefSpan = options.maxRefSpan ?? 80;
  const issues = [];

  let digest = null;
  let patch = null;

  if (options.digestPath) {
    digest = readJson(options.digestPath);
    validateDigest(digest);
    checkDigest(digest, { issues, minConfidence, maxRefSpan });
  }

  if (options.patchPath) {
    patch = readJson(options.patchPath);
    validateGraphPatch(patch);
    checkPatch(patch, { issues, minConfidence, maxRefSpan });
  }

  return { ok: issues.length === 0, issues, digest_id: digest?.digest_id, patch_id: patch?.patch_id };
}

function checkDigest(digest, context) {
  checkText(digest.summary, "digest.summary", context);
  for (const [index, item] of digest.items.entries()) {
    const label = `digest.items[${index}](${item.id})`;
    checkText(item.id, `${label}.id`, context);
    checkText(item.title, `${label}.title`, context);
    checkText(item.body, `${label}.body`, context);
    checkConfidence(item.confidence, `${label}.confidence`, context);
    checkTags(item.tags, `${label}.tags`, context);
    checkSourceRefs(item.source_refs, `${label}.source_refs`, context);
  }
}

function checkPatch(patch, context) {
  for (const [index, operation] of patch.operations.entries()) {
    const label = `patch.operations[${index}](${operation.op})`;
    checkText(operation.rationale, `${label}.rationale`, context);
    if (operation.node) {
      checkText(operation.node.title, `${label}.node.title`, context);
      checkText(operation.node.body, `${label}.node.body`, context);
      checkConfidence(operation.node.confidence, `${label}.node.confidence`, context);
      checkTags(operation.node.tags, `${label}.node.tags`, context);
      checkSourceRefs(operation.node.source_refs, `${label}.node.source_refs`, context);
    }
    if (operation.edge) {
      checkText(operation.edge.rationale, `${label}.edge.rationale`, context);
      checkConfidence(operation.edge.confidence, `${label}.edge.confidence`, context);
      checkSourceRefs(operation.edge.source_refs, `${label}.edge.source_refs`, context);
    }
    if (operation.fields) {
      if (operation.fields.rationale !== undefined) checkText(operation.fields.rationale, `${label}.fields.rationale`, context);
      if (operation.fields.confidence !== undefined) checkConfidence(operation.fields.confidence, `${label}.fields.confidence`, context);
      if (operation.fields.source_refs !== undefined) checkSourceRefs(operation.fields.source_refs, `${label}.fields.source_refs`, context);
    }
  }
}

function checkText(value, label, { issues }) {
  if (typeof value === "string" && /TODO|TBD|placeholder/i.test(value)) {
    issues.push({ severity: "error", label, message: "contains TODO/TBD/placeholder text" });
  }
}

function checkConfidence(value, label, { issues, minConfidence }) {
  if (typeof value === "number" && value < minConfidence) {
    issues.push({ severity: "warning", label, message: `confidence ${value} is below ${minConfidence}` });
  }
}

function checkTags(tags, label, { issues }) {
  if (!Array.isArray(tags) || tags.length === 0) {
    issues.push({ severity: "warning", label, message: "tags are empty" });
  }
}

function checkSourceRefs(refs, label, { issues, maxRefSpan }) {
  if (!Array.isArray(refs) || refs.length === 0) {
    issues.push({ severity: "error", label, message: "missing source refs" });
    return;
  }
  for (const [index, ref] of refs.entries()) {
    const refLabel = `${label}[${index}]`;
    if (!ref.start_line || !ref.end_line) {
      issues.push({ severity: "warning", label: refLabel, message: "source ref missing line range" });
      continue;
    }
    const span = ref.end_line - ref.start_line + 1;
    if (span > maxRefSpan) {
      issues.push({ severity: "warning", label: refLabel, message: `source ref spans ${span} lines (>${maxRefSpan})` });
    }
  }
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => argv[++index];
    if (arg === "--digest") options.digestPath = next();
    else if (arg === "--patch") options.patchPath = next();
    else if (arg === "--min-confidence") options.minConfidence = Number(next());
    else if (arg === "--max-ref-span") options.maxRefSpan = Number(next());
    else if (arg === "--json") options.json = true;
    else throw new Error(`unknown argument: ${arg}`);
  }
  return options;
}

function render(result) {
  const lines = [];
  lines.push(result.ok ? "Quality gate passed." : "Quality gate found issues.");
  if (result.digest_id) lines.push(`digest: ${result.digest_id}`);
  if (result.patch_id) lines.push(`patch: ${result.patch_id}`);
  if (!result.issues.length) return lines.join("\n");
  lines.push("Issues:");
  for (const issue of result.issues) {
    lines.push(`- [${issue.severity}] ${issue.label}: ${issue.message}`);
  }
  return lines.join("\n");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (!options.digestPath && !options.patchPath) throw new Error("at least one of --digest or --patch is required");
    const result = runQualityGate(options);
    if (options.json) console.log(JSON.stringify(result, null, 2));
    else console.log(render(result));
    const hasErrors = result.issues.some((issue) => issue.severity === "error");
    process.exit(hasErrors ? 1 : 0);
  } catch (error) {
    console.error(error.message);
    console.error("usage: node scripts/quality-gate.mjs --digest <digest.json> --patch <patch.json> [--min-confidence 0.65] [--max-ref-span 80]");
    process.exit(1);
  }
}
