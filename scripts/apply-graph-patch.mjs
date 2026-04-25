import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { readJson, validateGraphPatch } from "./validators.mjs";

export function applyGraphPatch(patchPath, graphPath, options = {}) {
  const dryRun = options.dryRun ?? false;
  const patch = readJson(patchPath);
  validateGraphPatch(patch);

  const graph = fs.existsSync(graphPath)
    ? readJson(graphPath)
    : { schema_version: "0.1.0", updated_at: null, nodes: [], edges: [] };

  graph.nodes ??= [];
  graph.edges ??= [];

  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  const edgesById = new Map(graph.edges.map((edge) => [edge.id, edge]));
  const summary = {
    added_nodes: [],
    updated_nodes: [],
    added_edges: [],
    updated_edges: []
  };

  for (const operation of patch.operations) {
    if (operation.op === "add_node") {
      if (nodesById.has(operation.node.id)) {
        throw new Error(`node already exists: ${operation.node.id}`);
      }
      graph.nodes.push(operation.node);
      nodesById.set(operation.node.id, operation.node);
      summary.added_nodes.push(operation.node.id);
    }

    if (operation.op === "update_node") {
      const node = nodesById.get(operation.node_id);
      if (!node) {
        throw new Error(`cannot update missing node: ${operation.node_id}`);
      }
      Object.assign(node, operation.fields);
      summary.updated_nodes.push(operation.node_id);
    }

    if (operation.op === "add_edge") {
      if (edgesById.has(operation.edge.id)) {
        throw new Error(`edge already exists: ${operation.edge.id}`);
      }
      assertEdgeNodesExist(operation.edge, nodesById);
      graph.edges.push(operation.edge);
      edgesById.set(operation.edge.id, operation.edge);
      summary.added_edges.push(operation.edge.id);
    }

    if (operation.op === "update_edge") {
      const edge = edgesById.get(operation.edge_id);
      if (!edge) {
        throw new Error(`cannot update missing edge: ${operation.edge_id}`);
      }
      Object.assign(edge, operation.fields);
      assertEdgeNodesExist(edge, nodesById);
      summary.updated_edges.push(operation.edge_id);
    }
  }

  graph.updated_at = patch.created_at;

  if (!dryRun) {
    fs.writeFileSync(graphPath, `${JSON.stringify(graph, null, 2)}\n`);
  }

  return summary;
}

function assertEdgeNodesExist(edge, nodesById) {
  if (!nodesById.has(edge.from)) {
    throw new Error(`edge references missing from node: ${edge.from}`);
  }
  if (!nodesById.has(edge.to)) {
    throw new Error(`edge references missing to node: ${edge.to}`);
  }
}

export function formatSummary(summary, { dryRun = false } = {}) {
  const lines = [];
  lines.push(dryRun ? "Dry-run graph patch summary (no file written):" : "Applied graph patch summary:");
  const prefix = dryRun ? "Will" : "Did";
  lines.push(formatList(`${prefix} add nodes`, summary.added_nodes));
  lines.push(formatList(`${prefix} update nodes`, summary.updated_nodes));
  lines.push(formatList(`${prefix} add edges`, summary.added_edges));
  lines.push(formatList(`${prefix} update edges`, summary.updated_edges));
  if (dryRun) lines.push("No file written.");
  return lines.filter(Boolean).join("\n");
}

function formatList(label, items) {
  if (!items.length) return `${label}: none`;
  return `${label}:\n${items.map((item) => `- ${item}`).join("\n")}`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const patchPath = process.argv[2] ?? "examples/sample-graph-patch.json";
  const graphPath = process.argv[3] ?? "graph/graph.json";
  const dryRun = process.argv.includes("--dry-run");
  const summary = applyGraphPatch(patchPath, graphPath, { dryRun });

  console.log(`${dryRun ? "dry-run" : "applied"} graph patch: ${patchPath}`);
  console.log(formatSummary(summary, { dryRun }));
  console.log(JSON.stringify({
    added_nodes: summary.added_nodes.length,
    updated_nodes: summary.updated_nodes.length,
    added_edges: summary.added_edges.length,
    updated_edges: summary.updated_edges.length
  }, null, 2));
}
