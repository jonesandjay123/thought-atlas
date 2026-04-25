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

export function assertDateTime(value, label) {
  assert(typeof value === "string" && !Number.isNaN(Date.parse(value)), `${label} must be an ISO date-time string`);
}

export function assertString(value, label) {
  assert(typeof value === "string" && value.trim().length > 0, `${label} must be a non-empty string`);
}

export function assertArray(value, label) {
  assert(Array.isArray(value), `${label} must be an array`);
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
    assertArray(item.source_refs, `${label}.source_refs`);
    assert(item.source_refs.length > 0, `${label}.source_refs must contain provenance`);

    for (const [refIndex, ref] of item.source_refs.entries()) {
      assertString(ref.source_id, `${label}.source_refs[${refIndex}].source_id`);
      assertString(ref.path, `${label}.source_refs[${refIndex}].path`);
    }
  }
}

export function validateGraphPatch(patch) {
  assertId(patch.patch_id, "patch_id");
  assertId(patch.digest_id, "digest_id");
  assertDateTime(patch.created_at, "created_at");
  assertArray(patch.operations, "operations");
  assert(patch.operations.length > 0, "operations must contain at least one operation");

  const allowedOps = new Set(["add_node", "update_node", "add_edge"]);
  const allowedRelations = new Set(["supports", "contrasts", "extends", "depends_on", "blocks", "duplicates"]);

  for (const [index, operation] of patch.operations.entries()) {
    const label = `operations[${index}]`;
    assert(allowedOps.has(operation.op), `${label}.op is not supported`);
    assertString(operation.rationale, `${label}.rationale`);

    if (operation.op === "add_node") {
      validatePatchNode(operation.node, `${label}.node`);
    }

    if (operation.op === "update_node") {
      assertId(operation.node_id, `${label}.node_id`);
      assert(operation.fields && typeof operation.fields === "object" && !Array.isArray(operation.fields), `${label}.fields must be an object`);
    }

    if (operation.op === "add_edge") {
      const edge = operation.edge;
      assert(edge && typeof edge === "object" && !Array.isArray(edge), `${label}.edge must be an object`);
      assertId(edge.id, `${label}.edge.id`);
      assertId(edge.from, `${label}.edge.from`);
      assertId(edge.to, `${label}.edge.to`);
      assert(allowedRelations.has(edge.relation), `${label}.edge.relation is not supported`);
      if (edge.weight !== undefined) {
        assert(typeof edge.weight === "number" && edge.weight >= 0 && edge.weight <= 1, `${label}.edge.weight must be between 0 and 1`);
      }
    }
  }
}

export function validatePatchNode(node, label) {
  assert(node && typeof node === "object" && !Array.isArray(node), `${label} must be an object`);
  assertId(node.id, `${label}.id`);
  assertString(node.kind, `${label}.kind`);
  assertString(node.title, `${label}.title`);
  assertString(node.body, `${label}.body`);
  assert(typeof node.confidence === "number" && node.confidence >= 0 && node.confidence <= 1, `${label}.confidence must be between 0 and 1`);
  assertArray(node.tags, `${label}.tags`);
  assertArray(node.source_refs, `${label}.source_refs`);
  assert(node.source_refs.length > 0, `${label}.source_refs must contain provenance`);
}
