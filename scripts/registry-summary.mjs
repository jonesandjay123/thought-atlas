import { pathToFileURL } from "node:url";
import { loadRegistry } from "./registry.mjs";

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const registryPath = process.argv[2] ?? "sources/registry.json";
  const registry = loadRegistry(registryPath);
  const sources = registry.sources ?? [];
  const runs = registry.runs ?? [];
  console.log(`Registry: ${registryPath}`);
  console.log(`updated_at: ${registry.updated_at ?? "never"}`);
  console.log(`sources: ${sources.length}`);
  console.log(`runs: ${runs.length}`);
  console.log("\nSources:");
  if (!sources.length) console.log("- none");
  for (const source of sources) {
    console.log(`- ${source.source_id} (${source.status}) ${source.content_hash}`);
    console.log(`  ${source.path}`);
  }
  console.log("\nRecent runs:");
  for (const run of runs.slice(-10).reverse()) {
    console.log(`- ${run.at} ${run.type} ${run.source_id ?? ""}`.trim());
  }
}
