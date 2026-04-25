import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { readJson, validateDigest, validateGraphPatch, validateSourceManifest } from "./validators.mjs";
import { applyGraphPatch } from "./apply-graph-patch.mjs";

const schemaPaths = [
  "schemas/source_manifest.schema.json",
  "schemas/digest.schema.json",
  "schemas/graph_patch.schema.json"
];

for (const schemaPath of schemaPaths) {
  readJson(schemaPath);
}

validateSourceManifest(readJson("examples/sample-source-manifest.json"));
validateDigest(readJson("examples/sample-digest.json"));
validateGraphPatch(readJson("examples/sample-graph-patch.json"));

const tempGraphPath = path.join(os.tmpdir(), `thought-atlas-validate-${process.pid}.json`);
fs.writeFileSync(tempGraphPath, JSON.stringify({ schema_version: "0.1.0", updated_at: null, nodes: [], edges: [] }));
applyGraphPatch("examples/sample-graph-patch.json", tempGraphPath, { dryRun: true });
fs.rmSync(tempGraphPath, { force: true });

const requiredDirs = [
  "schemas",
  "examples",
  "sources/inbox",
  "sources/processed",
  "digests",
  "graph_patches",
  "graph",
  "reports",
  "docs"
];

for (const dir of requiredDirs) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error(`missing required directory: ${dir}`);
  }
}

console.log("valid Thought Atlas Core files");
