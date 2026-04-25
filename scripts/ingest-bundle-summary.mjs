import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { readJson } from "./validators.mjs";
import { loadRegistry } from "./registry.mjs";

export function summarizeIngestBundle(sourceId, options = {}) {
  const registryPath = options.registryPath ?? "sources/registry.json";
  const graphPath = options.graphPath ?? "graph/graph.json";
  const manifestPath = options.manifestPath ?? `examples/${sourceId}.source-manifest.json`;
  const digestPath = options.digestPath ?? `digests/${sourceId}.digest.json`;
  const patchPath = options.patchPath ?? `graph_patches/${sourceId}.patch.json`;
  const reportPath = options.reportPath ?? `reports/${sourceId}-ingest.md`;

  const registry = loadRegistry(registryPath);
  const registrySource = (registry.sources ?? []).find((source) => source.source_id === sourceId);
  const registryRuns = (registry.runs ?? []).filter((run) => run.source_id === sourceId);

  const manifest = readIfExists(manifestPath);
  const digest = readIfExists(digestPath);
  const patch = readIfExists(patchPath);
  const graph = readIfExists(graphPath);

  const graphNodes = (graph?.nodes ?? []).filter((node) => hasSourceRef(node, sourceId));
  const graphNodeIds = new Set(graphNodes.map((node) => node.id));
  const graphEdges = (graph?.edges ?? []).filter(
    (edge) => hasSourceRef(edge, sourceId) || graphNodeIds.has(edge.from) || graphNodeIds.has(edge.to)
  );

  return {
    source_id: sourceId,
    files: {
      manifest: fileInfo(manifestPath),
      digest: fileInfo(digestPath),
      patch: fileInfo(patchPath),
      report: fileInfo(reportPath)
    },
    registry: {
      source: registrySource,
      runs: registryRuns
    },
    manifest,
    digest_summary: digest ? {
      digest_id: digest.digest_id,
      item_count: digest.items?.length ?? 0,
      items: (digest.items ?? []).map((item) => ({ id: item.id, kind: item.kind, title: item.title, confidence: item.confidence }))
    } : null,
    patch_summary: patch ? summarizePatch(patch) : null,
    graph_summary: graph ? {
      node_count: graphNodes.length,
      edge_count: graphEdges.length,
      nodes: graphNodes.map((node) => ({ id: node.id, kind: node.kind, title: node.title, confidence: node.confidence })),
      edges: graphEdges.map((edge) => ({ id: edge.id, relation: edge.relation, from: edge.from, to: edge.to, confidence: edge.confidence }))
    } : null
  };
}

function readIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  if (filePath.endsWith(".json")) return readJson(filePath);
  return fs.readFileSync(filePath, "utf8");
}

function fileInfo(filePath) {
  if (!fs.existsSync(filePath)) return { path: filePath, exists: false };
  const stat = fs.statSync(filePath);
  return { path: filePath, exists: true, bytes: stat.size, modified_at: stat.mtime.toISOString() };
}

function hasSourceRef(item, sourceId) {
  return (item.source_refs ?? []).some((ref) => ref.source_id === sourceId);
}

function summarizePatch(patch) {
  const operations = patch.operations ?? [];
  const byOp = new Map();
  for (const operation of operations) byOp.set(operation.op, (byOp.get(operation.op) ?? 0) + 1);
  return {
    patch_id: patch.patch_id,
    digest_id: patch.digest_id,
    operation_count: operations.length,
    operations_by_type: Object.fromEntries([...byOp.entries()].sort()),
    node_ids: operations.filter((op) => op.node?.id).map((op) => op.node.id),
    edge_ids: operations.filter((op) => op.edge?.id || op.edge_id).map((op) => op.edge?.id ?? op.edge_id)
  };
}

function renderHuman(summary) {
  const lines = [];
  lines.push(`# Ingest bundle: ${summary.source_id}`);
  lines.push("");
  lines.push("## Files");
  for (const [label, info] of Object.entries(summary.files)) {
    lines.push(`- ${label}: ${info.exists ? info.path : `${info.path} (missing)`}`);
  }
  lines.push("");
  lines.push("## Registry");
  lines.push(`- source entry: ${summary.registry.source ? "yes" : "no"}`);
  lines.push(`- runs: ${summary.registry.runs.length}`);
  for (const run of summary.registry.runs.slice(-5)) {
    lines.push(`  - ${run.at} ${run.type}`);
  }
  lines.push("");
  lines.push("## Digest");
  if (!summary.digest_summary) lines.push("- missing");
  else {
    lines.push(`- digest id: ${summary.digest_summary.digest_id}`);
    lines.push(`- items: ${summary.digest_summary.item_count}`);
    for (const item of summary.digest_summary.items) lines.push(`  - ${item.id} [${item.kind}] ${item.title}`);
  }
  lines.push("");
  lines.push("## Patch");
  if (!summary.patch_summary) lines.push("- missing");
  else {
    lines.push(`- patch id: ${summary.patch_summary.patch_id}`);
    lines.push(`- operations: ${summary.patch_summary.operation_count}`);
    lines.push(`- by type: ${JSON.stringify(summary.patch_summary.operations_by_type)}`);
  }
  lines.push("");
  lines.push("## Graph impact");
  if (!summary.graph_summary) lines.push("- graph missing");
  else {
    lines.push(`- nodes in graph from source: ${summary.graph_summary.node_count}`);
    lines.push(`- edges in graph from source: ${summary.graph_summary.edge_count}`);
    for (const node of summary.graph_summary.nodes) lines.push(`  - ${node.id} [${node.kind}] ${node.title}`);
  }
  return lines.join("\n");
}

function parseArgs(argv) {
  const options = { format: "human" };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => argv[++index];
    if (arg === "--source-id") options.sourceId = next();
    else if (arg === "--json") options.format = "json";
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
    const summary = summarizeIngestBundle(options.sourceId, options);
    if (options.format === "json") console.log(JSON.stringify(summary, null, 2));
    else console.log(renderHuman(summary));
  } catch (error) {
    console.error(error.message);
    console.error("usage: node scripts/ingest-bundle-summary.mjs --source-id <source-id> [--json]");
    process.exit(1);
  }
}
