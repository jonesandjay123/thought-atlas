import crypto from "node:crypto";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { summarizeIngestBundle } from "./ingest-bundle-summary.mjs";
import { findSources } from "./registry.mjs";

export function checkNoIngest(options = {}) {
  const issues = [];
  const contentHash = options.filePath ? hashFile(options.filePath) : options.hash;

  if (contentHash) {
    const hashMatches = findSources({ hash: contentHash }, options.registryPath ?? "sources/registry.json");
    for (const match of hashMatches) {
      issues.push(`registry contains source with matching hash: ${match.source_id}`);
    }
  }

  if (options.sourceId) {
    const summary = summarizeIngestBundle(options.sourceId, {
      registryPath: options.registryPath,
      graphPath: options.graphPath
    });
    if (summary.registry.source) issues.push(`registry contains source entry: ${options.sourceId}`);
    if (summary.registry.runs.length) issues.push(`registry contains ${summary.registry.runs.length} runs for source: ${options.sourceId}`);
    for (const [label, info] of Object.entries(summary.files)) {
      if (info.exists) issues.push(`${label} file exists: ${info.path}`);
    }
    if ((summary.graph_summary?.node_count ?? 0) > 0) issues.push(`graph contains ${summary.graph_summary.node_count} nodes from source: ${options.sourceId}`);
    if ((summary.graph_summary?.edge_count ?? 0) > 0) issues.push(`graph contains ${summary.graph_summary.edge_count} edges from source: ${options.sourceId}`);
  }

  return { ok: issues.length === 0, issues, query: { source_id: options.sourceId, content_hash: contentHash } };
}

function hashFile(filePath) {
  const digest = crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
  return `sha256:${digest}`;
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => argv[++index];
    if (arg === "--source-id") options.sourceId = next();
    else if (arg === "--file") options.filePath = next();
    else if (arg === "--hash") options.hash = next();
    else if (arg === "--registry") options.registryPath = next();
    else if (arg === "--graph") options.graphPath = next();
    else throw new Error(`unknown argument: ${arg}`);
  }
  return options;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = checkNoIngest(parseArgs(process.argv.slice(2)));
    console.log(result.ok ? "No-ingest check passed." : "No-ingest check failed.");
    console.log(JSON.stringify(result.query, null, 2));
    if (result.issues.length) {
      console.log("Issues:");
      for (const issue of result.issues) console.log(`- ${issue}`);
    }
    process.exit(result.ok ? 0 : 1);
  } catch (error) {
    console.error(error.message);
    console.error("usage: node scripts/no-ingest-check.mjs [--source-id id] [--file path|--hash sha256:...]");
    process.exit(1);
  }
}
