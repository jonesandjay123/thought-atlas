# Firebase Plan

Status: Firebase project created, but sync is still planned only. Do not add Firebase sync yet.

## Project strategy

Use one Firebase project for the full Thought Atlas system. Jones successfully created the clean project id:

```text
Firebase project: thought-atlas
Firestore: Production mode, nam7
Hosting: enabled
```

The repos remain separate, but they will target the same Firebase project later:

```text
thought-atlas     = local-first core / Jarvis ingestion engine
thought-atlas-ui  = hosted private UI shell
Firebase project  = Firestore / Hosting / Auth / Storage / IAM container
```


## Actual Firebase setup

Jones confirmed the current Firebase setup:

```text
Firebase project ID: thought-atlas
Firestore mode: Production
Firestore location: nam7
Hosting: enabled
Owner: jonesandjay123@gmail.com
Operator accounts: raijax.ai@gmail.com, jarvis.mac.ai@gmail.com
```

No real Firebase writes should happen until the write step is explicitly implemented and approved.

## Account strategy

Recommended ownership and operation model:

```text
Project owner: jonesandjay123@gmail.com
Mac mini Firebase CLI operator: raijax.ai@gmail.com
Additional operator account: jarvis.mac.ai@gmail.com
Future Jarvis sync identity: dedicated service account
jarvis.mac.ai@gmail.com: operator account, never sole owner
```

Rationale:

- Thought Atlas is Jones's personal thought system, so Jones's private account should own the Firebase project and billing relationship.
- `raijax.ai@gmail.com` is added as an operator account and can remain the Mac mini Firebase CLI/operator account if useful.
- `jarvis.mac.ai@gmail.com` is also added as an operator account, but should not be the sole owner.
- Jarvis should eventually write Firestore through a dedicated service account, not through a human login token.
- Project ownership, billing, and recovery should remain under Jones's control.

## Current boundary

Do not implement Firebase sync until the local core reaches the agreed hardening gates:

1. At least 3 different real sources ingested locally.
2. At least 1 no-ingest/context-only regression test passes.
3. `finalize-ingest` one-command pipeline exists.
4. Ingest reports are generated from state, not hand-written.
5. Graph schema is not obviously still changing.

## Future sync shape

When ready, Firebase sync should be downstream of local state:

```text
local graph.json / registry / digests / reports
→ Firestore collections
→ thought-atlas-ui read-only display
```

Firebase should not participate in core extraction, reasoning, or graph patch decisions.

## Dry-run export before sync

Before writing Firestore, build and inspect the deterministic export payload locally:

```bash
node scripts/export-firestore-payload.mjs \
  --project-id thought-atlas \
  --dry-run \
  --output /tmp/thought-atlas-firestore-payload.json
```

This produces documents for:

- `thoughtAtlasMeta/current`
- `thoughtSources/{sourceId}`
- `thoughtDigests/{digestId}`
- `thoughtNodes/{nodeId}`
- `thoughtEdges/{edgeId}`
- `thoughtReports/{sourceId}`
- `thoughtRegistryRuns/{runId}`

This command does not contact Firebase and does not require credentials.

## Firestore writer staging

`sync-firestore.mjs` is intentionally staged and safe by default.

Dry-run is the default and performs no writes:

```bash
node scripts/sync-firestore.mjs \
  --project-id thought-atlas \
  --dry-run
```

Service account default path:

```text
.secrets/service-account.json
```

For this personal local-first project, keep the service account key inside the repo-local `.secrets/` directory for easier maintenance.

The `.secrets/` directory is local-only and must never be committed.

Do not use `~/.config/thought-atlas/service-account.json` as a fallback; Jones prefers avoiding extra hidden config locations for this project.

Safety rules:

- Never commit `.secrets/` or any service account key.
- Never print or paste credential contents.
- Real writes require explicit `--write`.
- Use `--limit N` for first small-batch writes.
- Use `--collections thoughtSources,thoughtNodes` to restrict which collections are selected.

First real write, after human confirmation, should be small and explicit, for example:

```bash
node scripts/sync-firestore.mjs \
  --project-id thought-atlas \
  --write \
  --limit 5
```

Do not run a full write until the limited write is confirmed in Firebase Console.
