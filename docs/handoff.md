# Thought Atlas Backend Handoff

Last updated: 2026-09-25

This document is the fastest entry point for a future Jarvis/session that needs to continue Thought Atlas backend work.


> **2026-09-25 revival note:** Thought Atlas is being resumed as a self-growing personal thought graph. Before changing schema, UI, or bulk-ingesting recent history, read [`docs/revival-plan-2026-09-25.md`](./revival-plan-2026-09-25.md). The immediate restart sequence is: ingest two recent gold-standard conversations, inspect graph quality, then define personal-interest scoring.

> **2026-09-25 scoring contract (spec only):** scoring/temporal semantics are now settled in [`docs/scoring-temporal-semantics-contract-2026-09-25.md`](./scoring-temporal-semantics-contract-2026-09-25.md) — definitions, 10 invariants, worked examples against the live graph, and acceptance tests. No schema, graph, or code was changed. The recommended next implementation step is: add `occurred_at` + `occurred_precision` to the source manifest and backfill dates for the 11 existing sources (migration step 1 of 8; see contract §10).

## Current status

Thought Atlas backend v0 remains structurally usable, but the canonical graph is an April snapshot and now needs a controlled revival.

Current local graph (after Revival Phase 0 gold-standard ingest):

```text
nodes: 92
edges: 93
graph updated_at: 2026-09-25T05:03:00.000Z
```

The April snapshot was 76 nodes / 62 edges. The two gold-standard sources added 16 nodes and 31 edges without modifying any existing node or edge. See [`docs/revival-phase0-observations-2026-09-25.md`](./revival-phase0-observations-2026-09-25.md). This local graph has **not** been synced to Firestore.

The next milestone is **not** a UI rewrite. It is to restart ingestion with recent high-signal sources and separate semantic relationship weight from Jones-specific attention / resonance.

Original v0 state remains valid:

- Local ingest pipeline works.
- Three seed sources are committed and synced to Firestore.
- Firestore project exists and has full seed data.
- UI work can now start from `thought-atlas-ui` as a read-only Firestore client.

Firebase:

```text
Project ID: thought-atlas
Firestore mode: Production
Firestore location: nam7
Hosting: enabled
Owner: jonesandjay123@gmail.com
Operator accounts: raijax.ai@gmail.com, jarvis.mac.ai@gmail.com
```

## Repo roles

```text
~/Downloads/code/thought-atlas
= local-first core backend / ingestion / graph / Firestore sync

~/Downloads/code/thought-atlas-ui
= hosted UI shell / future Firebase Hosting frontend

~/Downloads/code/jarvis-firebase-ops/projects/thought-atlas
= cross-project Firebase ops entrypoint and handoff pointer
```

Keep this separation. Do not put UI feature work in `thought-atlas` core.

## Seed dataset currently in Firestore

Current local graph and Firestore mirror contain:

```text
sources: 3
nodes: 38
edges: 37
digests: 3
reports: 3
registry runs: 11
```

Sources:

1. `original-conversation-2026-04-11`
   - conversation/reflection source
   - covers labor devotion, happiness/comparison, AI as forge, Trigger → Expand → Package → Compound
2. `ikigai-2026-04-25`
   - conversation/product-strategy source
   - covers Ikigai, externalization, natural-overflow productization, Playable Life System
3. `codex-app-validation-checklist-2026-04-18`
   - checklist/report source
   - covers Codex validation, Slack-first gate, Codex as likely inner worker

## Critical files

```text
graph/graph.json                              # local graph state
sources/registry.json                         # source + run log
digests/*.digest.json                         # extracted source digests
graph_patches/*.patch.json                    # graph mutations
reports/*-ingest.md                           # generated reports
scripts/finalize-ingest.mjs                   # one-command local finalize
scripts/sync-firestore.mjs                    # Firestore sync writer
scripts/export-firestore-payload.mjs          # no-write export payload
.secrets/service-account.json                 # local secret, ignored, never print/commit
```

## Standard local checks

```bash
npm run build
npm run graph:summary
npm run registry:summary
```

Expected graph summary after the current seed sync:

```text
nodes: 38
edges: 37
```

## Firestore sync commands

Dry-run full payload:

```bash
node scripts/sync-firestore.mjs --project-id thought-atlas --dry-run
```

Expected current dry-run count:

```text
total_payload_documents: 96
thoughtAtlasMeta: 1
thoughtSources: 3
thoughtDigests: 3
thoughtNodes: 38
thoughtEdges: 37
thoughtReports: 3
thoughtRegistryRuns: 11
```

Full sync, only when explicitly approved:

```bash
node scripts/sync-firestore.mjs --project-id thought-atlas --write
```

The first full sync was already completed successfully on 2026-04-25 and wrote 96 documents.

## Credential policy

Service account key lives at:

```text
.secrets/service-account.json
```

Rules:

- `.secrets/` is gitignored.
- Never print key contents.
- Never commit key contents.
- Do not use `~/.config/thought-atlas/service-account.json`; Jones prefers avoiding extra hidden config locations for this personal project.

## Ingest rules

Do not ingest every Slack attachment.

Formal ingest triggers:

- `收進 Thought Atlas`
- `ingest`
- `進圖譜`
- `消化成 graph`

Context-only examples:

- `只是參考`
- `不要收進 Thought Atlas`
- `看一下`
- `照這個做`

For context-only files, use:

```bash
node scripts/no-ingest-check.mjs --source-id some-id --file /path/to/file.md
```

## Adding a new source

1. Create source manifest:

```bash
node scripts/create-source-manifest.mjs \
  --input /path/to/inbound.md \
  --source-id my-source-id \
  --title "Human readable title" \
  --source-type slack_file \
  --strip-openclaw-wrapper \
  --origin-channel slack \
  --origin-sender Jones \
  --origin-message-id <slack-message-id> \
  --tag tag1 \
  --tag tag2
```

2. Create/edit digest and graph patch.

Optional starter templates:

```bash
node scripts/create-digest-template.mjs --manifest examples/my-source-id.source-manifest.json
node scripts/create-graph-patch-template.mjs --digest digests/my-source-id.digest.json
```

3. Finalize:

```bash
node scripts/finalize-ingest.mjs --source-id my-source-id
```

4. Validate and commit/push:

```bash
npm run build
npm run graph:summary
git status
git add -A
git commit -m "data: ingest my source"
git push
```

5. Sync to Firestore only if desired:

```bash
node scripts/sync-firestore.mjs --project-id thought-atlas --write
```

## Source type strategy

See `docs/source-type-strategy.md`.

Short version:

- conversation/reflection sources → extract emergent claims, questions, decisions, patterns, self-model updates;
- report/checklist sources → extract principles, evaluation frameworks, gates, ordered actions;
- do not create one node per checklist bullet unless each bullet is durable and reusable.

## Revival next session

Start here:

1. Read `docs/revival-plan-2026-09-25.md`.
2. ~~Ingest these two gold-standard sources from `thinking_with_ai`~~ — done 2026-09-25:
   - `ai-selection-jev-play-the-ball-2026-09-21`
   - `ai-irreplaceability-lived-experience-2026-09-25`
3. Review the generated nodes / edges and read `docs/revival-phase0-observations-2026-09-25.md` before adding scoring fields.
4. Draft `resonance_score`, `attention_score`, `recurrence_score`, `recency_score`, and derived `interest_score` semantics against those real examples.
5. Only then change schemas and validators.
6. Do not bulk backfill or write Firestore as part of the first revival pass.

Muse can be added after the contract is stable for fast candidate extraction and second-opinion ranking. GPT should own the first canonical examples so multiple agents do not diverge on ontology.

## UI next step

Move to `~/Downloads/code/thought-atlas-ui`.

Frontend should initially be read-only:

- read `thoughtSources`
- read `thoughtNodes`
- read `thoughtEdges`
- read `thoughtReports`
- render list/search/report/graph preview

Do not add editing or Firestore write flows to UI yet.

## Last known good commits

Core backend milestones:

```text
31a86c4 data: ingest codex validation checklist source
3d4c7ea feat: add firestore export dry run
1064729 feat: add firestore sync writer dry run
5071272 fix: remove config service account fallback
01eb36a feat: prefer repo local service account path
df016de feat: add per-collection firestore sync limit
```

Note: later commits may supersede this list; use `git log --oneline -10`.
