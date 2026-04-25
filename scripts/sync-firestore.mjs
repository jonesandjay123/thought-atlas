import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildFirestorePayload } from "./export-firestore-payload.mjs";

const DEFAULT_SERVICE_ACCOUNT_PATHS = [
  ".secrets/service-account.json",
  "~/.config/thought-atlas/service-account.json"
];

export async function syncFirestore(options = {}) {
  const dryRun = options.write ? false : true;
  const projectId = options.projectId ?? "thought-atlas";
  const credential = resolveCredentialPath(options.credentialPath);
  const credentialPath = credential.path;
  const credentialExists = credential.exists;
  const payload = buildFirestorePayload({
    projectId,
    registryPath: options.registryPath,
    graphPath: options.graphPath,
    digestDir: options.digestDir,
    reportsDir: options.reportsDir
  });
  const selectedDocuments = selectDocuments(payload.documents, options);

  let adminInitialized = false;
  if (credentialExists) {
    await initializeFirebaseAdmin({ projectId, credentialPath });
    adminInitialized = true;
  }

  if (!dryRun && !credentialExists) {
    throw new Error(`service account key not found at ${credentialPath}`);
  }

  const summary = {
    project_id: projectId,
    dry_run: dryRun,
    write_enabled: !dryRun,
    credential_path: credentialPath,
    credential_source: credential.source,
    credential_exists: credentialExists,
    admin_initialized: adminInitialized,
    selected_collections: options.collections ?? null,
    limit: options.limit ?? null,
    total_payload_documents: payload.documents.length,
    selected_documents: selectedDocuments.length,
    selected_counts: countByCollection(selectedDocuments)
  };

  if (dryRun) {
    return { summary, payload, selectedDocuments, writeResult: null };
  }

  const { getFirestore } = await import("firebase-admin/firestore");
  const db = getFirestore();
  const writeResult = await writeDocuments(db, selectedDocuments);
  return { summary: { ...summary, written_documents: writeResult.written_documents }, payload, selectedDocuments, writeResult };
}

function selectDocuments(documents, options) {
  let selected = documents;
  if (options.collections?.length) {
    const allowed = new Set(options.collections);
    selected = selected.filter((doc) => allowed.has(doc.collection));
  }
  if (Number.isInteger(options.limit)) selected = selected.slice(0, options.limit);
  return selected;
}

async function initializeFirebaseAdmin({ projectId, credentialPath }) {
  const { cert, getApps, initializeApp } = await import("firebase-admin/app");
  if (getApps().length) return;
  const serviceAccount = JSON.parse(fs.readFileSync(credentialPath, "utf8"));
  initializeApp({
    credential: cert(serviceAccount),
    projectId
  });
}

async function writeDocuments(db, documents) {
  const chunks = chunk(documents, 450);
  let written = 0;
  for (const docs of chunks) {
    const batch = db.batch();
    for (const doc of docs) {
      const ref = db.collection(doc.collection).doc(doc.id);
      batch.set(ref, doc.data, { merge: true });
    }
    await batch.commit();
    written += docs.length;
  }
  return { written_documents: written };
}

function countByCollection(documents) {
  const counts = {};
  for (const doc of documents) counts[doc.collection] = (counts[doc.collection] ?? 0) + 1;
  return counts;
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
  return chunks;
}

function resolveCredentialPath(explicitPath) {
  if (explicitPath) {
    const resolved = expandHome(explicitPath);
    return { path: resolved, exists: fs.existsSync(resolved), source: "explicit" };
  }

  for (const candidate of DEFAULT_SERVICE_ACCOUNT_PATHS) {
    const resolved = expandHome(candidate);
    if (fs.existsSync(resolved)) return { path: resolved, exists: true, source: candidate };
  }

  const fallback = expandHome(DEFAULT_SERVICE_ACCOUNT_PATHS[0]);
  return { path: fallback, exists: false, source: DEFAULT_SERVICE_ACCOUNT_PATHS[0] };
}

function expandHome(filePath) {
  if (filePath === "~") return os.homedir();
  if (filePath.startsWith("~/")) return path.join(os.homedir(), filePath.slice(2));
  return filePath;
}

function parseArgs(argv) {
  const options = { write: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => argv[++index];
    if (arg === "--dry-run") options.write = false;
    else if (arg === "--write") options.write = true;
    else if (arg === "--project-id") options.projectId = next();
    else if (arg === "--service-account") options.credentialPath = next();
    else if (arg === "--limit") options.limit = Number.parseInt(next(), 10);
    else if (arg === "--collections") options.collections = next().split(",").map((item) => item.trim()).filter(Boolean);
    else if (arg === "--registry") options.registryPath = next();
    else if (arg === "--graph") options.graphPath = next();
    else if (arg === "--digest-dir") options.digestDir = next();
    else if (arg === "--reports-dir") options.reportsDir = next();
    else throw new Error(`unknown argument: ${arg}`);
  }
  if (options.limit !== undefined && (!Number.isInteger(options.limit) || options.limit < 1)) {
    throw new Error("--limit must be a positive integer");
  }
  return options;
}

function printSummary(result) {
  console.log(result.summary.dry_run ? "Firestore sync dry-run complete." : "Firestore sync write complete.");
  console.log(JSON.stringify(result.summary, null, 2));
  console.log("Selected document preview:");
  for (const doc of result.selectedDocuments.slice(0, 12)) {
    console.log(`- ${doc.collection}/${doc.id}`);
  }
  if (result.selectedDocuments.length > 12) {
    console.log(`... ${result.selectedDocuments.length - 12} more`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await syncFirestore(parseArgs(process.argv.slice(2)));
    printSummary(result);
  } catch (error) {
    console.error(error.message);
    console.error("usage: node scripts/sync-firestore.mjs [--dry-run] [--write] [--project-id thought-atlas] [--service-account path] [--limit N] [--collections a,b]");
    process.exit(1);
  }
}
