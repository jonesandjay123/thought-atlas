import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { readJson } from "./validators.mjs";

export function resetSourceIngest(options) {
  const sourceId = required(options.sourceId, "--source-id");
  const graphPath = options.graphPath ?? "graph/graph.json";
  const dryRun = options.dryRun ?? false;

  const graph = fs.existsSync(graphPath)
    ? readJson(graphPath)
    : { schema_version: "0.1.0", updated_at: null, nodes: [], edges: [] };

  const nodes = graph.nodes ?? [];
  const edges = graph.edges ?? [];
  const nodeIdsFromSource = new Set(
    nodes
      .filter((node) => hasSourceRef(node, sourceId))
      .map((node) => node.id)
  );
  const edgesToRemove = edges.filter(
    (edge) => hasSourceRef(edge, sourceId) || nodeIdsFromSource.has(edge.from) || nodeIdsFromSource.has(edge.to)
  );

  const filesToRemove = unique([
    `examples/${sourceId}.source-manifest.json`,
    `digests/${sourceId}.digest.json`,
    `graph_patches/${sourceId}.patch.json`,
    `reports/${sourceId}-ingest.md`,
    `sources/inbox/${sourceId}.md`,
    `sources/processed/${sourceId}.md`,
    ...(options.extraFiles ?? [])
  ]).filter((filePath) => fs.existsSync(filePath));

  const summary = {
    source_id: sourceId,
    graph_path: graphPath,
    removed_nodes: [...nodeIdsFromSource],
    removed_edges: edgesToRemove.map((edge) => edge.id),
    removed_files: filesToRemove
  };

  if (!dryRun) {
    graph.nodes = nodes.filter((node) => !nodeIdsFromSource.has(node.id));
    graph.edges = edges.filter((edge) => !summary.removed_edges.includes(edge.id));
    graph.updated_at = new Date().toISOString();
    fs.writeFileSync(graphPath, `${JSON.stringify(graph, null, 2)}\n`);

    for (const filePath of filesToRemove) {
      fs.rmSync(filePath, { force: true });
    }
  }

  return summary;
}

function hasSourceRef(item, sourceId) {
  return (item.source_refs ?? []).some((ref) => ref.source_id === sourceId);
}

function required(value, label) {
  if (!value) throw new Error(`${label} is required`);
  return value;
}

function unique(values) {
  return [...new Set(values)];
}

function parseArgs(argv) {
  const options = { extraFiles: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => argv[++index];
    if (arg === "--source-id") options.sourceId = next();
    else if (arg === "--graph") options.graphPath = next();
    else if (arg === "--extra-file") options.extraFiles.push(next());
    else if (arg === "--dry-run") options.dryRun = true;
    else throw new Error(`unknown argument: ${arg}`);
  }
  return options;
}

function renderSummary(summary, dryRun) {
  const prefix = dryRun ? "Would remove" : "Removed";
  const lines = [];
  lines.push(`${dryRun ? "Dry-run" : "Reset"} source ingest: ${summary.source_id}`);
  lines.push(formatList(`${prefix} nodes`, summary.removed_nodes));
  lines.push(formatList(`${prefix} edges`, summary.removed_edges));
  lines.push(formatList(`${prefix} files`, summary.removed_files));
  if (dryRun) lines.push("No files written or deleted.");
  return lines.join("\n");
}

function formatList(label, items) {
  if (!items.length) return `${label}: none`;
  return `${label}:\n${items.map((item) => `- ${item}`).join("\n")}`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const summary = resetSourceIngest(options);
    console.log(renderSummary(summary, options.dryRun));
    console.log(JSON.stringify({
      removed_nodes: summary.removed_nodes.length,
      removed_edges: summary.removed_edges.length,
      removed_files: summary.removed_files.length
    }, null, 2));
  } catch (error) {
    console.error(error.message);
    console.error("usage: node scripts/reset-source-ingest.mjs --source-id <source-id> [--graph graph/graph.json] [--dry-run]");
    process.exit(1);
  }
}
