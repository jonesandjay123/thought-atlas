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

## Account strategy

Recommended ownership and operation model:

```text
Project owner: jonesandjay123@gmail.com
Mac mini Firebase CLI operator: raijax.ai@gmail.com
Future Jarvis sync identity: dedicated service account
jarvis.mac.ai@gmail.com: optional Viewer/operator, never sole owner
```

Rationale:

- Thought Atlas is Jones's personal thought system, so Jones's private account should own the Firebase project and billing relationship.
- `raijax.ai@gmail.com` can remain the Mac mini Firebase CLI/operator account if useful.
- Jarvis should eventually write Firestore through a dedicated service account, not through a human login token.
- `jarvis.mac.ai@gmail.com` should not be the only owner because project ownership, billing, and recovery should remain under Jones's control.

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
