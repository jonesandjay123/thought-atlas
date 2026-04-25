import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { applyGraphPatch, formatSummary } from "./apply-graph-patch.mjs";
import { generateIngestReport } from "./generate-ingest-report.mjs";
import { runIngestChecklist } from "./ingest-checklist.mjs";
import { runQualityGate } from "./quality-gate.mjs";
import { summarizeIngestBundle } from "./ingest-bundle-summary.mjs";
import { readJson, validateDigest, validateGraphPatch, validateSourceManifest } from "./validators.mjs";

export function finalizeIngest(sourceId, options = {}) {
  const paths = resolvePaths(sourceId, options);
  assertExists(paths.manifestPath, "source manifest");
  assertExists(paths.digestPath, "digest");
  assertExists(paths.patchPath, "graph patch");

  const manifest = readJson(paths.manifestPath);
  const digest = readJson(paths.digestPath);
  const patch = readJson(paths.patchPath);
  validateSourceManifest(manifest);
  validateDigest(digest);
  validateGraphPatch(patch);

  if (manifest.source_id !== sourceId) throw new Error(`manifest.source_id (${manifest.source_id}) does not match ${sourceId}`);
  if (digest.source_id !== sourceId) throw new Error(`digest.source_id (${digest.source_id}) does not match ${sourceId}`);
  if (patch.digest_id !== digest.digest_id) throw new Error(`patch.digest_id (${patch.digest_id}) does not match digest.digest_id (${digest.digest_id})`);

  const quality = runQualityGate({ digestPath: paths.digestPath, patchPath: paths.patchPath });
  const errors = quality.issues.filter((issue) => issue.severity === "error");
  if (errors.length) {
    throw new Error(`quality gate failed: ${errors.map((issue) => `${issue.label}: ${issue.message}`).join("; ")}`);
  }

  const checklist = runIngestChecklist({
    manifestPath: paths.manifestPath,
    digestPath: paths.digestPath,
    patchPath: paths.patchPath,
    graphPath: paths.graphPath,
    upsert: options.upsert
  });

  const dryRunSummary = applyGraphPatch(paths.patchPath, paths.graphPath, { dryRun: true, upsert: options.upsert });
  let applySummary = null;
  if (!options.dryRun) {
    applySummary = applyGraphPatch(paths.patchPath, paths.graphPath, {
      upsert: options.upsert,
      recordRegistry: true,
      sourceId,
      registryPath: paths.registryPath
    });
  }

  const report = generateIngestReport(sourceId, {
    ...paths,
    outputPath: paths.reportPath
  });
  const bundle = summarizeIngestBundle(sourceId, paths);

  return { paths, manifest, digest, patch, quality, checklist, dryRunSummary, applySummary, report, bundle };
}

function resolvePaths(sourceId, options) {
  return {
    registryPath: options.registryPath ?? "sources/registry.json",
    graphPath: options.graphPath ?? "graph/graph.json",
    manifestPath: options.manifestPath ?? `examples/${sourceId}.source-manifest.json`,
    digestPath: options.digestPath ?? `digests/${sourceId}.digest.json`,
    patchPath: options.patchPath ?? `graph_patches/${sourceId}.patch.json`,
    reportPath: options.reportPath ?? `reports/${sourceId}-ingest.md`
  };
}

function assertExists(filePath, label) {
  if (!fs.existsSync(filePath)) throw new Error(`missing ${label}: ${filePath}`);
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => argv[++index];
    if (arg === "--source-id") options.sourceId = next();
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--upsert") options.upsert = true;
    else if (arg === "--registry") options.registryPath = next();
    else if (arg === "--graph") options.graphPath = next();
    else if (arg === "--manifest") options.manifestPath = next();
    else if (arg === "--digest") options.digestPath = next();
    else if (arg === "--patch") options.patchPath = next();
    else if (arg === "--report") options.reportPath = next();
    else throw new Error(`unknown argument: ${arg}`);
  }
  return options;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (!options.sourceId) throw new Error("--source-id is required");
    const result = finalizeIngest(options.sourceId, options);

    console.log(options.dryRun ? "Finalize ingest dry-run passed." : "Finalize ingest complete.");
    console.log(JSON.stringify({
      source_id: options.sourceId,
      digest_items: result.digest.items.length,
      operations: result.patch.operations.length,
      quality_issues: result.quality.issues.length,
      graph_nodes_from_source: result.bundle.graph_summary?.node_count ?? 0,
      graph_edges_from_source: result.bundle.graph_summary?.edge_count ?? 0,
      report: result.report.outputPath,
      mode: options.upsert ? "upsert" : "strict",
      applied: !options.dryRun
    }, null, 2));

    if (result.quality.issues.length) {
      console.log("Quality gate warnings:");
      for (const issue of result.quality.issues) console.log(`- [${issue.severity}] ${issue.label}: ${issue.message}`);
    }
    console.log(formatSummary(options.dryRun ? result.dryRunSummary : result.applySummary, { dryRun: options.dryRun }));
  } catch (error) {
    console.error(error.message);
    console.error("usage: node scripts/finalize-ingest.mjs --source-id <source-id> [--upsert] [--dry-run]");
    process.exit(1);
  }
}
