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
  const summary = { added_nodes: 0, updated_nodes: 0, added_edges: 0 };

  for (const operation of patch.operations) {
    if (operation.op === "add_node") {
      if (nodesById.has(operation.node.id)) {
        throw new Error(`node already exists: ${operation.node.id}`);
      }
      graph.nodes.push(operation.node);
      nodesById.set(operation.node.id, operation.node);
      summary.added_nodes += 1;
    }

    if (operation.op === "update_node") {
      const node = nodesById.get(operation.node_id);
      if (!node) {
        throw new Error(`cannot update missing node: ${operation.node_id}`);
      }
      Object.assign(node, operation.fields);
      summary.updated_nodes += 1;
    }

    if (operation.op === "add_edge") {
      if (edgesById.has(operation.edge.id)) {
        throw new Error(`edge already exists: ${operation.edge.id}`);
      }
      if (!nodesById.has(operation.edge.from)) {
        throw new Error(`edge references missing from node: ${operation.edge.from}`);
      }
      if (!nodesById.has(operation.edge.to)) {
        throw new Error(`edge references missing to node: ${operation.edge.to}`);
      }
      graph.edges.push(operation.edge);
      edgesById.set(operation.edge.id, operation.edge);
      summary.added_edges += 1;
    }
  }

  graph.updated_at = patch.created_at;

  if (!dryRun) {
    fs.writeFileSync(graphPath, `${JSON.stringify(graph, null, 2)}\n`);
  }

  return summary;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const patchPath = process.argv[2] ?? "examples/sample-graph-patch.json";
  const graphPath = process.argv[3] ?? "graph/graph.json";
  const dryRun = process.argv.includes("--dry-run");
  const summary = applyGraphPatch(patchPath, graphPath, { dryRun });

  const mode = dryRun ? "dry-run" : "applied";
  console.log(`${mode} graph patch: ${patchPath}`);
  console.log(JSON.stringify(summary, null, 2));
}
