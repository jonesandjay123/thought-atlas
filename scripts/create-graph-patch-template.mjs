import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { readJson, validateDigest, validateGraphPatch } from "./validators.mjs";

export function createGraphPatchTemplate(options) {
  const digestPath = required(options.digestPath, "--digest");
  const digest = readJson(digestPath);
  validateDigest(digest);

  const sourceId = digest.source_id;
  const patchPath = options.outputPath ?? `graph_patches/${sourceId}.patch.json`;
  const operations = [];

  for (const item of digest.items) {
    operations.push({
      op: "add_node",
      rationale: `Promote digest item ${item.id} into the graph.`,
      node: {
        id: item.id,
        kind: item.kind,
        title: item.title,
        body: item.body,
        source_refs: item.source_refs,
        confidence: item.confidence,
        tags: item.tags
      }
    });
  }

  if (digest.items.length >= 2) {
    operations.push({
      op: "add_edge",
      rationale: "TODO: explain why these two thoughts are related.",
      edge: {
        id: `edge-${digest.items[0].id}-to-${digest.items[1].id}`,
        from: digest.items[0].id,
        to: digest.items[1].id,
        relation: "supports",
        weight: 0.5,
        confidence: 0.5,
        source_refs: digest.items[0].source_refs,
        rationale: "TODO: edge rationale."
      }
    });
  }

  const patch = {
    patch_id: `${sourceId}.patch`,
    digest_id: digest.digest_id,
    created_at: options.createdAt ?? new Date().toISOString(),
    operations
  };

  validateGraphPatch(patch);
  fs.mkdirSync(path.dirname(patchPath), { recursive: true });
  if (fs.existsSync(patchPath) && !options.force) {
    throw new Error(`graph patch already exists: ${patchPath} (use --force to overwrite)`);
  }
  fs.writeFileSync(patchPath, `${JSON.stringify(patch, null, 2)}\n`);
  return { patch, patchPath };
}

function required(value, label) {
  if (!value) throw new Error(`${label} is required`);
  return value;
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => argv[++index];
    if (arg === "--digest") options.digestPath = next();
    else if (arg === "--output") options.outputPath = next();
    else if (arg === "--created-at") options.createdAt = next();
    else if (arg === "--force") options.force = true;
    else throw new Error(`unknown argument: ${arg}`);
  }
  return options;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = createGraphPatchTemplate(parseArgs(process.argv.slice(2)));
    console.log(`graph patch template written: ${result.patchPath}`);
    console.log(JSON.stringify({ patch_id: result.patch.patch_id, digest_id: result.patch.digest_id, operations: result.patch.operations.length }, null, 2));
  } catch (error) {
    console.error(error.message);
    console.error("usage: node scripts/create-graph-patch-template.mjs --digest <digest.json> [--output path] [--force]");
    process.exit(1);
  }
}
