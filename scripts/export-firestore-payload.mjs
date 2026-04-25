import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { summarizeIngestBundle } from "./ingest-bundle-summary.mjs";
import { loadRegistry } from "./registry.mjs";
import { readJson } from "./validators.mjs";

export function buildFirestorePayload(options = {}) {
  const projectId = options.projectId ?? "thought-atlas";
  const registryPath = options.registryPath ?? "sources/registry.json";
  const graphPath = options.graphPath ?? "graph/graph.json";
  const digestDir = options.digestDir ?? "digests";
  const reportsDir = options.reportsDir ?? "reports";
  const exportedAt = options.exportedAt ?? new Date().toISOString();

  const registry = loadRegistry(registryPath);
  const graph = readJson(graphPath);
  const digestFiles = listFiles(digestDir, ".digest.json");
  const reportFiles = listFiles(reportsDir, "-ingest.md");

  const sources = (registry.sources ?? []).map((source) => ({
    collection: "thoughtSources",
    id: source.source_id,
    data: compact({
      source_id: source.source_id,
      title: source.title,
      source_type: source.source_type,
      status: source.status,
      path: source.path,
      manifest_path: source.manifest_path,
      content_hash: source.content_hash,
      tags: source.tags ?? [],
      origin: source.origin ?? null,
      first_seen_at: source.first_seen_at ?? null,
      last_seen_at: source.last_seen_at ?? null,
      created_at: source.created_at ?? null,
      updated_at: exportedAt
    })
  }));

  const digests = digestFiles.map((filePath) => {
    const digest = readJson(filePath);
    return {
      collection: "thoughtDigests",
      id: digest.digest_id,
      data: {
        digest_id: digest.digest_id,
        source_id: digest.source_id,
        created_at: digest.created_at,
        summary: digest.summary,
        item_count: digest.items?.length ?? 0,
        items: digest.items ?? [],
        path: filePath
      }
    };
  });

  const nodes = (graph.nodes ?? []).map((node) => ({
    collection: "thoughtNodes",
    id: node.id,
    data: {
      ...node,
      source_ids: sourceIdsFromRefs(node.source_refs),
      updated_at: graph.updated_at ?? null
    }
  }));

  const edges = (graph.edges ?? []).map((edge) => ({
    collection: "thoughtEdges",
    id: edge.id,
    data: {
      weight: null,
      ...edge,
      source_ids: sourceIdsFromRefs(edge.source_refs),
      updated_at: graph.updated_at ?? null
    }
  }));

  const reports = reportFiles.map((filePath) => {
    const sourceId = path.basename(filePath).replace(/-ingest\.md$/, "");
    const summary = summarizeIngestBundle(sourceId, { registryPath, graphPath });
    return {
      collection: "thoughtReports",
      id: sourceId,
      data: {
        source_id: sourceId,
        path: filePath,
        markdown: fs.readFileSync(filePath, "utf8"),
        digest_id: summary.digest_summary?.digest_id ?? null,
        patch_id: summary.patch_summary?.patch_id ?? null,
        digest_items: summary.digest_summary?.item_count ?? 0,
        patch_operations: summary.patch_summary?.operation_count ?? 0,
        graph_nodes: summary.graph_summary?.node_count ?? 0,
        graph_edges: summary.graph_summary?.edge_count ?? 0,
        updated_at: summary.files.report.modified_at ?? exportedAt
      }
    };
  });

  const runs = (registry.runs ?? []).map((run) => ({
    collection: "thoughtRegistryRuns",
    id: run.run_id,
    data: compact({
      run_id: run.run_id,
      type: run.type,
      source_id: run.source_id ?? null,
      at: run.at,
      content_hash: run.content_hash ?? null,
      manifest_path: run.manifest_path ?? null,
      source_path: run.source_path ?? null,
      digest_id: run.digest_id ?? null,
      patch_id: run.patch_id ?? null,
      graph_path: run.graph_path ?? null,
      status: run.status ?? null,
      summary: run.summary ?? null,
      origin: run.origin ?? null
    })
  }));

  const meta = {
    collection: "thoughtAtlasMeta",
    id: "current",
    data: {
      schema_version: graph.schema_version ?? "0.1.0",
      project_id: projectId,
      exported_at: exportedAt,
      source_count: sources.length,
      digest_count: digests.length,
      node_count: nodes.length,
      edge_count: edges.length,
      report_count: reports.length,
      registry_run_count: runs.length,
      local_graph_updated_at: graph.updated_at ?? null
    }
  };

  const documents = [meta, ...sources, ...digests, ...nodes, ...edges, ...reports, ...runs];
  return {
    project_id: projectId,
    exported_at: exportedAt,
    counts: countByCollection(documents),
    documents
  };
}

function listFiles(dir, suffix) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(suffix))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

function sourceIdsFromRefs(refs = []) {
  return [...new Set(refs.map((ref) => ref.source_id).filter(Boolean))].sort();
}

function compact(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}

function countByCollection(documents) {
  const counts = {};
  for (const doc of documents) counts[doc.collection] = (counts[doc.collection] ?? 0) + 1;
  return counts;
}

function writePayload(payload, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
}

function parseArgs(argv) {
  const options = { dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => argv[++index];
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--output") options.outputPath = next();
    else if (arg === "--project-id") options.projectId = next();
    else if (arg === "--registry") options.registryPath = next();
    else if (arg === "--graph") options.graphPath = next();
    else if (arg === "--digest-dir") options.digestDir = next();
    else if (arg === "--reports-dir") options.reportsDir = next();
    else throw new Error(`unknown argument: ${arg}`);
  }
  return options;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const payload = buildFirestorePayload(options);
    if (options.outputPath) writePayload(payload, options.outputPath);
    console.log(options.dryRun ? "Firestore export dry-run payload built." : "Firestore export payload built.");
    console.log(JSON.stringify({
      project_id: payload.project_id,
      exported_at: payload.exported_at,
      counts: payload.counts,
      total_documents: payload.documents.length,
      output: options.outputPath ?? null,
      dry_run: options.dryRun
    }, null, 2));
  } catch (error) {
    console.error(error.message);
    console.error("usage: node scripts/export-firestore-payload.mjs [--dry-run] [--output path] [--project-id thought-atlas]");
    process.exit(1);
  }
}
