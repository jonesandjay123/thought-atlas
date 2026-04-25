import { readJson, validateDigest } from "./validators.mjs";

const path = process.argv[2] ?? "examples/sample-digest.json";
validateDigest(readJson(path));
console.log(`valid digest: ${path}`);
