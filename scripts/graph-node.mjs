import { pathToFileURL } from "node:url";
import { readJson } from "./validators.mjs";

export function inspectNode(nodeId, graphPath = "graph/graph.json") {
  const graph = readJson(graphPath);
  const node = (graph.nodes ?? []).find((candidate) => candidate.id === nodeId);
  if (!node) throw new Error(`node not found: ${nodeId}`);
  const edges = (graph.edges ?? []).filter((edge) => edge.from === nodeId || edge.to === nodeId);
  return { node, edges };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const nodeId = process.argv[2];
  const graphPath = process.argv[3] ?? "graph/graph.json";
  if (!nodeId) {
    console.error("usage: node scripts/graph-node.mjs <node-id> [graph/graph.json]");
    process.exit(1);
  }

  const { node, edges } = inspectNode(nodeId, graphPath);
  console.log(`# ${node.title}`);
  console.log(`id: ${node.id}`);
  console.log(`kind: ${node.kind}`);
  console.log(`confidence: ${node.confidence}`);
  console.log(`tags: ${(node.tags ?? []).join(", ")}`);
  console.log("\nbody:");
  console.log(node.body);
  console.log("\nsource_refs:");
  for (const ref of node.source_refs ?? []) {
    console.log(`- ${ref.path}${ref.start_line ? `:${ref.start_line}` : ""}${ref.end_line ? `-${ref.end_line}` : ""}`);
  }
  console.log("\nedges:");
  if (!edges.length) console.log("- none");
  for (const edge of edges) {
    const direction = edge.from === node.id ? "out" : "in";
    const other = edge.from === node.id ? edge.to : edge.from;
    console.log(`- ${direction} ${edge.relation} ${other} (${edge.id}, confidence ${edge.confidence ?? "n/a"})`);
  }
}
