import fs from "node:fs";
import path from "node:path";

export const DEFAULT_REGISTRY_PATH = "sources/registry.json";

export function loadRegistry(registryPath = DEFAULT_REGISTRY_PATH) {
  if (!fs.existsSync(registryPath)) {
    return { schema_version: "0.1.0", updated_at: null, sources: [], runs: [] };
  }
  return JSON.parse(fs.readFileSync(registryPath, "utf8"));
}

export function saveRegistry(registry, registryPath = DEFAULT_REGISTRY_PATH) {
  registry.updated_at = new Date().toISOString();
  registry.sources ??= [];
  registry.runs ??= [];
  fs.mkdirSync(path.dirname(registryPath), { recursive: true });
  fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
}

export function recordSourceManifest(manifest, manifestPath, options = {}) {
  const registryPath = options.registryPath ?? DEFAULT_REGISTRY_PATH;
  const registry = loadRegistry(registryPath);
  registry.sources ??= [];

  const now = options.at ?? new Date().toISOString();
  const existingIndex = registry.sources.findIndex((source) => source.source_id === manifest.source_id);
  const entry = {
    source_id: manifest.source_id,
    title: manifest.title,
    source_type: manifest.source_type,
    path: manifest.path,
    manifest_path: manifestPath,
    content_hash: manifest.content_hash,
    status: manifest.status,
    tags: manifest.tags ?? [],
    origin: manifest.origin,
    first_seen_at: existingIndex >= 0 ? registry.sources[existingIndex].first_seen_at : now,
    last_seen_at: now
  };

  if (existingIndex >= 0) registry.sources[existingIndex] = entry;
  else registry.sources.push(entry);

  addRun(registry, {
    type: "source_manifest_created",
    source_id: manifest.source_id,
    content_hash: manifest.content_hash,
    manifest_path: manifestPath,
    source_path: manifest.path,
    origin: manifest.origin,
    at: now
  });

  saveRegistry(registry, registryPath);
  return registry;
}

export function recordIngestRun(details, options = {}) {
  const registryPath = options.registryPath ?? DEFAULT_REGISTRY_PATH;
  const registry = loadRegistry(registryPath);
  addRun(registry, { ...details, at: details.at ?? new Date().toISOString() });
  if (details.source_id) {
    const source = registry.sources?.find((entry) => entry.source_id === details.source_id);
    if (source && details.status) {
      source.status = details.status;
      source.last_seen_at = details.at ?? new Date().toISOString();
    }
  }
  saveRegistry(registry, registryPath);
  return registry;
}

export function removeSourceFromRegistry(sourceId, details = {}, options = {}) {
  const registryPath = options.registryPath ?? DEFAULT_REGISTRY_PATH;
  const registry = loadRegistry(registryPath);
  registry.sources = (registry.sources ?? []).filter((source) => source.source_id !== sourceId);
  addRun(registry, {
    type: "source_reset",
    source_id: sourceId,
    ...details,
    at: details.at ?? new Date().toISOString()
  });
  saveRegistry(registry, registryPath);
  return registry;
}

export function findSources(query = {}, registryPath = DEFAULT_REGISTRY_PATH) {
  const registry = loadRegistry(registryPath);
  return (registry.sources ?? []).filter((source) => {
    if (query.sourceId && source.source_id !== query.sourceId) return false;
    if (query.hash && source.content_hash !== query.hash) return false;
    return true;
  });
}

function addRun(registry, run) {
  registry.runs ??= [];
  registry.runs.push({
    run_id: run.run_id ?? `${run.type ?? "run"}-${Date.now()}-${registry.runs.length + 1}`,
    ...run
  });
}
