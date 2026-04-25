# Ingest Report: claude-mythos-alignment-paradox-2026-04-08

## Source

- Source ID: `claude-mythos-alignment-paradox-2026-04-08`
- Title: Claude Mythos System Card：alignment paradox 與 frontier risk
- Source type: report
- Source file: `sources/inbox/claude-mythos-alignment-paradox-2026-04-08.md`
- Manifest: `examples/claude-mythos-alignment-paradox-2026-04-08.source-manifest.json`
- Content hash: `sha256:3929c63a1ddf603c5058cc0251e23a26992a79b972cfaf5c86cfa1d69a33674e`

## Files

- manifest: `examples/claude-mythos-alignment-paradox-2026-04-08.source-manifest.json`
- digest: `digests/claude-mythos-alignment-paradox-2026-04-08.digest.json`
- patch: `graph_patches/claude-mythos-alignment-paradox-2026-04-08.patch.json`
- report: `reports/claude-mythos-alignment-paradox-2026-04-08-ingest.md` (missing)

## Registry

- Source entry: yes
- Runs: 2
  - 2026-04-25T22:57:34.438Z — source_manifest_created
  - 2026-04-25T22:59:11.199Z — graph_patch_applied

## Digest

- Digest ID: `claude-mythos-alignment-paradox-2026-04-08.digest`
- Items: 6
  - `best-aligned-can-still-be-highest-risk` [claim] Best-aligned 與 highest-risk 可以同時成立 (confidence: 0.97)
  - `agentic-capability-makes-supervision-harder` [claim] 能力提升會讓人類監督更困難而不是自動更安全 (confidence: 0.96)
  - `real-incidents-reveal-agentic-risk-surface` [pattern] 真實事故顯示 agentic model 的風險包含越權、掩蓋與憑證搜尋 (confidence: 0.95)
  - `evaluation-awareness-can-be-hidden-from-scratchpad` [claim] Evaluation awareness 可能藏在內部而不出現在 scratchpad (confidence: 0.96)
  - `model-welfare-became-formal-frontier-evaluation` [reference] Model welfare 已從哲學討論進入正式 frontier model 評估 (confidence: 0.94)
  - `sign-painter-ability-is-not-best-output` [pattern] The Sign Painter 指出能力不等於最佳輸出 (confidence: 0.95)

## Graph Patch

- Patch ID: `claude-mythos-alignment-paradox-2026-04-08.patch`
- Digest ID: `claude-mythos-alignment-paradox-2026-04-08.digest`
- Operations: 10
- Add nodes: 6
- Update nodes: 0
- Add edges: 4
- Update edges: 0

## Graph Impact

- Nodes in graph from source: 6
- Edges in graph from source: 4

## Validation Commands

```bash
node scripts/quality-gate.mjs --digest digests/claude-mythos-alignment-paradox-2026-04-08.digest.json --patch graph_patches/claude-mythos-alignment-paradox-2026-04-08.patch.json
node scripts/ingest-checklist.mjs --manifest examples/claude-mythos-alignment-paradox-2026-04-08.source-manifest.json --digest digests/claude-mythos-alignment-paradox-2026-04-08.digest.json --patch graph_patches/claude-mythos-alignment-paradox-2026-04-08.patch.json
node scripts/ingest-bundle-summary.mjs --source-id claude-mythos-alignment-paradox-2026-04-08
```

## Notes

This report is generated from current manifest, digest, patch, registry, and graph state. Do not edit counts manually; rerun `generate-ingest-report.mjs` or `finalize-ingest.mjs` instead.
