import { pathToFileURL } from "node:url";
import { readJson } from "./validators.mjs";

export function searchGraph(query, graphPath = "graph/graph.json", limit = 20) {
  const graph = readJson(graphPath);
  const normalized = query.trim().toLowerCase();
  if (!normalized) throw new Error("query is required");
  const terms = normalized.split(/\s+/).filter(Boolean);

  const results = [];
  for (const node of graph.nodes ?? []) {
    const haystack = [node.id, node.title, node.body, ...(node.tags ?? [])].join(" \n").toLowerCase();
    const score = terms.reduce((sum, term) => sum + occurrences(haystack, term), 0);
    if (score > 0) results.push({ type: "node", id: node.id, title: node.title, score });
  }
  for (const edge of graph.edges ?? []) {
    const haystack = [edge.id, edge.from, edge.to, edge.relation, edge.rationale].join(" \n").toLowerCase();
    const score = terms.reduce((sum, term) => sum + occurrences(haystack, term), 0);
    if (score > 0) results.push({ type: "edge", id: edge.id, title: `${edge.from} ${edge.relation} ${edge.to}`, score });
  }

  return results.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, limit);
}

function occurrences(value, term) {
  return value.split(term).length - 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const query = process.argv[2];
  const graphPath = process.argv[3] ?? "graph/graph.json";
  if (!query) {
    console.error("usage: node scripts/graph-search.mjs <query> [graph/graph.json]");
    process.exit(1);
  }
  const results = searchGraph(query, graphPath);
  console.log(`Search: ${query}`);
  if (!results.length) console.log("No matches.");
  for (const result of results) {
    console.log(`- [${result.type}] ${result.id} (${result.score}) ${result.title}`);
  }
}
