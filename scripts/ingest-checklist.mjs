import { pathToFileURL } from "node:url";
import { readJson, validateDigest, validateGraphPatch, validateSourceManifest } from "./validators.mjs";
import { applyGraphPatch, formatSummary } from "./apply-graph-patch.mjs";
import { runQualityGate } from "./quality-gate.mjs";

export function runIngestChecklist({ manifestPath, digestPath, patchPath, graphPath = "graph/graph.json", skipQualityGate = false, upsert = false }) {
  const manifest = readJson(manifestPath);
  const digest = readJson(digestPath);
  const patch = readJson(patchPath);

  validateSourceManifest(manifest);
  validateDigest(digest);
  validateGraphPatch(patch);

  if (digest.source_id !== manifest.source_id) {
    throw new Error(`digest.source_id (${digest.source_id}) does not match manifest.source_id (${manifest.source_id})`);
  }
  if (patch.digest_id !== digest.digest_id) {
    throw new Error(`patch.digest_id (${patch.digest_id}) does not match digest.digest_id (${digest.digest_id})`);
  }

  const quality = skipQualityGate ? { ok: true, issues: [] } : runQualityGate({ digestPath, patchPath });
  const blockingIssues = quality.issues.filter((issue) => issue.severity === "error");
  if (blockingIssues.length) {
    const details = blockingIssues.map((issue) => `${issue.label}: ${issue.message}`).join("; ");
    throw new Error(`quality gate failed: ${details}`);
  }

  const summary = applyGraphPatch(patchPath, graphPath, { dryRun: true, upsert });

  return { manifest, digest, patch, summary, quality };
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => argv[++index];
    if (arg === "--manifest") options.manifestPath = next();
    else if (arg === "--digest") options.digestPath = next();
    else if (arg === "--patch") options.patchPath = next();
    else if (arg === "--graph") options.graphPath = next();
    else if (arg === "--skip-quality-gate") options.skipQualityGate = true;
    else if (arg === "--upsert") options.upsert = true;
    else throw new Error(`unknown argument: ${arg}`);
  }
  return options;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const options = parseArgs(process.argv.slice(2));
  if (!options.manifestPath || !options.digestPath || !options.patchPath) {
    console.error("usage: node scripts/ingest-checklist.mjs --manifest <manifest.json> --digest <digest.json> --patch <patch.json> [--graph graph/graph.json]");
    process.exit(1);
  }

  const result = runIngestChecklist(options);
  console.log("Ingest checklist passed.");
  console.log(JSON.stringify({
    source_id: result.manifest.source_id,
    digest_id: result.digest.digest_id,
    patch_id: result.patch.patch_id,
    digest_items: result.digest.items.length,
    operations: result.patch.operations.length,
    quality_issues: result.quality.issues.length,
    mode: options.upsert ? "upsert" : "strict"
  }, null, 2));
  if (result.quality.issues.length) {
    console.log("Quality gate warnings:");
    for (const issue of result.quality.issues) console.log(`- [${issue.severity}] ${issue.label}: ${issue.message}`);
  }
  console.log(formatSummary(result.summary, { dryRun: true }));
}
