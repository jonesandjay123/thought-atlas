# No-ingest Regression Workflow

Thought Atlas must not ingest every Slack attachment by default.

## Trigger rule

Only ingest when Jones explicitly says something like:

- `這篇收進 Thought Atlas`
- `ingest`
- `進圖譜`
- `消化成 graph`

Do **not** ingest when Jones says something like:

- `只是參考`
- `不要收進 Thought Atlas`
- `看一下`
- `照這個做`
- `這是任務上下文`

In no-ingest mode, Jarvis may read and use the file as task context, but must not create or mutate:

- `sources/inbox/*`
- `examples/*.source-manifest.json`
- `digests/*.digest.json`
- `graph_patches/*.patch.json`
- `reports/*-ingest.md`
- `graph/graph.json`
- `sources/registry.json`

## Check command

After a no-ingest context-only run, use:

```bash
node scripts/no-ingest-check.mjs \
  --source-id expected-source-id \
  --file /path/to/context-only.md
```

If the source id is unknown, checking by file hash still catches duplicate registry entries:

```bash
node scripts/no-ingest-check.mjs --file /path/to/context-only.md
```

## Regression scenario

1. Jones uploads a Markdown file and says: `只是參考，不要收進 Thought Atlas`.
2. Jarvis reads the file as task context only.
3. Jarvis runs `no-ingest-check`.
4. The check must pass.

If it fails, Jarvis should reset accidental ingest immediately and explain what changed.
