import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { summarizeIngestBundle } from "./ingest-bundle-summary.mjs";

export function generateIngestReport(sourceId, options = {}) {
  const summary = summarizeIngestBundle(sourceId, options);
  const outputPath = options.outputPath ?? summary.files.report.path;
  const markdown = renderReport(summary);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${markdown}\n`);
  return { outputPath, summary, markdown };
}

function renderReport(summary) {
  const manifest = summary.manifest;
  const digest = summary.digest_summary;
  const patch = summary.patch_summary;
  const graph = summary.graph_summary;
  const registryRuns = summary.registry.runs ?? [];
  const operationsByType = patch?.operations_by_type ?? {};

  const lines = [];
  lines.push(`# Ingest Report: ${summary.source_id}`);
  lines.push("");
  lines.push("## Source");
  lines.push("");
  lines.push(`- Source ID: \`${summary.source_id}\``);
  lines.push(`- Title: ${manifest?.title ?? "(missing manifest)"}`);
  lines.push(`- Source type: ${manifest?.source_type ?? "unknown"}`);
  lines.push(`- Source file: \`${manifest?.path ?? "missing"}\``);
  lines.push(`- Manifest: \`${summary.files.manifest.path}\`${summary.files.manifest.exists ? "" : " (missing)"}`);
  lines.push(`- Content hash: \`${manifest?.content_hash ?? "unknown"}\``);
  if (manifest?.origin?.channel) lines.push(`- Origin channel: ${manifest.origin.channel}`);
  if (manifest?.origin?.sender) lines.push(`- Origin sender: ${manifest.origin.sender}`);
  if (manifest?.origin?.message_id) lines.push(`- Origin message: \`${manifest.origin.message_id}\``);
  lines.push("");
  lines.push("## Files");
  lines.push("");
  for (const [label, info] of Object.entries(summary.files)) {
    lines.push(`- ${label}: ${info.exists ? `\`${info.path}\`` : `\`${info.path}\` (missing)`}`);
  }
  lines.push("");
  lines.push("## Registry");
  lines.push("");
  lines.push(`- Source entry: ${summary.registry.source ? "yes" : "no"}`);
  lines.push(`- Runs: ${registryRuns.length}`);
  for (const run of registryRuns) {
    lines.push(`  - ${run.at} — ${run.type}`);
  }
  lines.push("");
  lines.push("## Digest");
  lines.push("");
  if (!digest) {
    lines.push("- Missing digest.");
  } else {
    lines.push(`- Digest ID: \`${digest.digest_id}\``);
    lines.push(`- Items: ${digest.item_count}`);
    for (const item of digest.items) {
      lines.push(`  - \`${item.id}\` [${item.kind}] ${item.title} (confidence: ${item.confidence})`);
    }
  }
  lines.push("");
  lines.push("## Graph Patch");
  lines.push("");
  if (!patch) {
    lines.push("- Missing graph patch.");
  } else {
    lines.push(`- Patch ID: \`${patch.patch_id}\``);
    lines.push(`- Digest ID: \`${patch.digest_id}\``);
    lines.push(`- Operations: ${patch.operation_count}`);
    lines.push(`- Add nodes: ${operationsByType.add_node ?? 0}`);
    lines.push(`- Update nodes: ${operationsByType.update_node ?? 0}`);
    lines.push(`- Add edges: ${operationsByType.add_edge ?? 0}`);
    lines.push(`- Update edges: ${operationsByType.update_edge ?? 0}`);
  }
  lines.push("");
  lines.push("## Graph Impact");
  lines.push("");
  if (!graph) {
    lines.push("- Missing graph.");
  } else {
    lines.push(`- Nodes in graph from source: ${graph.node_count}`);
    lines.push(`- Edges in graph from source: ${graph.edge_count}`);
  }
  lines.push("");
  lines.push("## Validation Commands");
  lines.push("");
  lines.push("```bash");
  lines.push(`node scripts/quality-gate.mjs --digest digests/${summary.source_id}.digest.json --patch graph_patches/${summary.source_id}.patch.json`);
  lines.push(`node scripts/ingest-checklist.mjs --manifest examples/${summary.source_id}.source-manifest.json --digest digests/${summary.source_id}.digest.json --patch graph_patches/${summary.source_id}.patch.json`);
  lines.push(`node scripts/ingest-bundle-summary.mjs --source-id ${summary.source_id}`);
  lines.push("```");
  lines.push("");
  lines.push("## Notes");
  lines.push("");
  lines.push("This report is generated from current manifest, digest, patch, registry, and graph state. Do not edit counts manually; rerun `generate-ingest-report.mjs` or `finalize-ingest.mjs` instead.");
  return lines.join("\n");
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => argv[++index];
    if (arg === "--source-id") options.sourceId = next();
    else if (arg === "--output") options.outputPath = next();
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
    const result = generateIngestReport(options.sourceId, options);
    console.log(`ingest report written: ${result.outputPath}`);
    console.log(JSON.stringify({
      source_id: options.sourceId,
      digest_items: result.summary.digest_summary?.item_count ?? 0,
      patch_operations: result.summary.patch_summary?.operation_count ?? 0,
      graph_nodes: result.summary.graph_summary?.node_count ?? 0,
      graph_edges: result.summary.graph_summary?.edge_count ?? 0
    }, null, 2));
  } catch (error) {
    console.error(error.message);
    console.error("usage: node scripts/generate-ingest-report.mjs --source-id <source-id> [--output path]");
    process.exit(1);
  }
}
