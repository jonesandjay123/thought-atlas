import { readJson, validateSourceManifest } from "./validators.mjs";

const path = process.argv[2] ?? "examples/sample-source-manifest.json";
validateSourceManifest(readJson(path));
console.log(`valid source manifest: ${path}`);
