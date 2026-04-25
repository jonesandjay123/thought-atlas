import { pathToFileURL } from "node:url";
import { readJson } from "./validators.mjs";

export function summarizeGraph(graphPath = "graph/graph.json") {
  const graph = readJson(graphPath);
  const nodes = graph.nodes ?? [];
  const edges = graph.edges ?? [];
  const kinds = countBy(nodes, "kind");
  const relations = countBy(edges, "relation");
  const tags = new Map();
  for (const node of nodes) {
    for (const tag of node.tags ?? []) tags.set(tag, (tags.get(tag) ?? 0) + 1);
  }
  return { graph, nodes, edges, kinds, relations, tags };
}

function countBy(items, key) {
  const counts = new Map();
  for (const item of items) counts.set(item[key] ?? "unknown", (counts.get(item[key] ?? "unknown") ?? 0) + 1);
  return counts;
}

function renderCounts(title, counts, limit = 20) {
  const entries = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit);
  if (!entries.length) return `${title}: none`;
  return `${title}:\n${entries.map(([key, count]) => `- ${key}: ${count}`).join("\n")}`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const graphPath = process.argv[2] ?? "graph/graph.json";
  const { graph, nodes, edges, kinds, relations, tags } = summarizeGraph(graphPath);
  console.log(`Graph: ${graphPath}`);
  console.log(`schema_version: ${graph.schema_version ?? "unknown"}`);
  console.log(`updated_at: ${graph.updated_at ?? "unknown"}`);
  console.log(`nodes: ${nodes.length}`);
  console.log(`edges: ${edges.length}`);
  console.log(renderCounts("node kinds", kinds));
  console.log(renderCounts("edge relations", relations));
  console.log(renderCounts("top tags", tags, 12));
}
