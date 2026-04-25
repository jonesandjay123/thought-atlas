import fs from "node:fs";

export function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`${path}: invalid JSON (${error.message})`);
  }
}

export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertId(value, label) {
  assert(typeof value === "string" && /^[a-z0-9][a-z0-9._-]*$/.test(value), `${label} must be a stable lowercase id`);
}

export function assertHash(value, label) {
  assert(typeof value === "string" && /^sha256:[a-f0-9]{64}$/.test(value), `${label} must be sha256:<64 lowercase hex chars>`);
}

export function assertDateTime(value, label) {
  assert(typeof value === "string" && !Number.isNaN(Date.parse(value)), `${label} must be an ISO date-time string`);
}

export function assertString(value, label) {
  assert(typeof value === "string" && value.trim().length > 0, `${label} must be a non-empty string`);
}

export function assertOptionalString(value, label) {
  if (value !== undefined) {
    assertString(value, label);
  }
}

export function assertArray(value, label) {
  assert(Array.isArray(value), `${label} must be an array`);
}

export function assertObject(value, label) {
  assert(value && typeof value === "object" && !Array.isArray(value), `${label} must be an object`);
}

export function validateSourceManifest(manifest) {
  assertId(manifest.source_id, "source_id");
  assertString(manifest.title, "title");
  assert(new Set(["markdown", "conversation", "report", "repo_state", "manual", "slack_file", "slack_message"]).has(manifest.source_type), "source_type is not supported");
  assertString(manifest.path, "path");
  assertDateTime(manifest.captured_at, "captured_at");
  assertHash(manifest.content_hash, "content_hash");
  assert(new Set(["inbox", "processed", "archived"]).has(manifest.status), "status is not supported");

  if (manifest.language !== undefined) assertString(manifest.language, "language");
  if (manifest.tags !== undefined) assertArray(manifest.tags, "tags");
  if (manifest.notes !== undefined) assertString(manifest.notes, "notes");
  if (manifest.origin !== undefined) {
    assertObject(manifest.origin, "origin");
    assertOptionalString(manifest.origin.channel, "origin.channel");
    assertOptionalString(manifest.origin.message_id, "origin.message_id");
    assertOptionalString(manifest.origin.thread_id, "origin.thread_id");
    assertOptionalString(manifest.origin.sender, "origin.sender");
  }
}

export function validateDigest(digest) {
  assertId(digest.digest_id, "digest_id");
  assertId(digest.source_id, "source_id");
  assertDateTime(digest.created_at, "created_at");
  assertString(digest.summary, "summary");
  assertArray(digest.items, "items");
  assert(digest.items.length > 0, "items must contain at least one item");

  const allowedKinds = new Set(["claim", "question", "decision", "pattern", "action", "reference"]);
  const itemIds = new Set();

  for (const [index, item] of digest.items.entries()) {
    const label = `items[${index}]`;
    assertId(item.id, `${label}.id`);
    assert(!itemIds.has(item.id), `${label}.id duplicates ${item.id}`);
    itemIds.add(item.id);
    assert(allowedKinds.has(item.kind), `${label}.kind is not supported`);
    assertString(item.title, `${label}.title`);
    assertString(item.body, `${label}.body`);
    assert(typeof item.confidence === "number" && item.confidence >= 0 && item.confidence <= 1, `${label}.confidence must be between 0 and 1`);
    assertArray(item.tags, `${label}.tags`);
    validateSourceRefs(item.source_refs, `${label}.source_refs`);
  }
}

export function validateGraphPatch(patch) {
  assertId(patch.patch_id, "patch_id");
  assertId(patch.digest_id, "digest_id");
  assertDateTime(patch.created_at, "created_at");
  assertArray(patch.operations, "operations");
  assert(patch.operations.length > 0, "operations must contain at least one operation");

  const allowedOps = new Set(["add_node", "update_node", "add_edge", "update_edge"]);

  for (const [index, operation] of patch.operations.entries()) {
    const label = `operations[${index}]`;
    assert(allowedOps.has(operation.op), `${label}.op is not supported`);
    assertString(operation.rationale, `${label}.rationale`);

    if (operation.op === "add_node") {
      validatePatchNode(operation.node, `${label}.node`);
    }

    if (operation.op === "update_node") {
      assertId(operation.node_id, `${label}.node_id`);
      assertObject(operation.fields, `${label}.fields`);
    }

    if (operation.op === "add_edge") {
      validatePatchEdge(operation.edge, `${label}.edge`);
    }

    if (operation.op === "update_edge") {
      assertId(operation.edge_id, `${label}.edge_id`);
      assertObject(operation.fields, `${label}.fields`);
      if (operation.fields.weight !== undefined) {
        assert(typeof operation.fields.weight === "number" && operation.fields.weight >= 0 && operation.fields.weight <= 1, `${label}.fields.weight must be between 0 and 1`);
      }
      if (operation.fields.confidence !== undefined) {
        assert(typeof operation.fields.confidence === "number" && operation.fields.confidence >= 0 && operation.fields.confidence <= 1, `${label}.fields.confidence must be between 0 and 1`);
      }
      if (operation.fields.source_refs !== undefined) validateSourceRefs(operation.fields.source_refs, `${label}.fields.source_refs`);
      if (operation.fields.rationale !== undefined) assertString(operation.fields.rationale, `${label}.fields.rationale`);
    }
  }
}

export function validatePatchNode(node, label) {
  assertObject(node, label);
  assertId(node.id, `${label}.id`);
  assert(new Set(["claim", "question", "decision", "pattern", "action", "reference", "concept"]).has(node.kind), `${label}.kind is not supported`);
  assertString(node.title, `${label}.title`);
  assertString(node.body, `${label}.body`);
  assert(typeof node.confidence === "number" && node.confidence >= 0 && node.confidence <= 1, `${label}.confidence must be between 0 and 1`);
  assertArray(node.tags, `${label}.tags`);
  validateSourceRefs(node.source_refs, `${label}.source_refs`);
}

export function validatePatchEdge(edge, label) {
  assertObject(edge, label);
  assertId(edge.id, `${label}.id`);
  assertId(edge.from, `${label}.from`);
  assertId(edge.to, `${label}.to`);
  assert(new Set(["supports", "contrasts", "extends", "depends_on", "blocks", "duplicates", "resonates_with"]).has(edge.relation), `${label}.relation is not supported`);
  if (edge.weight !== undefined) {
    assert(typeof edge.weight === "number" && edge.weight >= 0 && edge.weight <= 1, `${label}.weight must be between 0 and 1`);
  }
  assert(typeof edge.confidence === "number" && edge.confidence >= 0 && edge.confidence <= 1, `${label}.confidence must be between 0 and 1`);
  validateSourceRefs(edge.source_refs, `${label}.source_refs`);
  assertString(edge.rationale, `${label}.rationale`);
}

export function validateSourceRefs(sourceRefs, label) {
  assertArray(sourceRefs, label);
  assert(sourceRefs.length > 0, `${label} must contain provenance`);

  for (const [refIndex, ref] of sourceRefs.entries()) {
    assertObject(ref, `${label}[${refIndex}]`);
    assertString(ref.source_id, `${label}[${refIndex}].source_id`);
    assertString(ref.path, `${label}[${refIndex}].path`);
    if (ref.start_line !== undefined) assert(Number.isInteger(ref.start_line) && ref.start_line >= 1, `${label}[${refIndex}].start_line must be a positive integer`);
    if (ref.end_line !== undefined) assert(Number.isInteger(ref.end_line) && ref.end_line >= 1, `${label}[${refIndex}].end_line must be a positive integer`);
    if (ref.quote !== undefined) assertString(ref.quote, `${label}[${refIndex}].quote`);
  }
}
