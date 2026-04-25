import { readJson, validateGraphPatch } from "./validators.mjs";

const path = process.argv[2] ?? "examples/sample-graph-patch.json";
validateGraphPatch(readJson(path));
console.log(`valid graph patch: ${path}`);
