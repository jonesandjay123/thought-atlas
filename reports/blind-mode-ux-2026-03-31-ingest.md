# Ingest Report: blind-mode-ux-2026-03-31

## Source

- Source ID: `blind-mode-ux-2026-03-31`
- Title: Blind Mode UX 與無介面時代
- Source type: markdown
- Source file: `sources/inbox/blind-mode-ux-2026-03-31.md`
- Manifest: `examples/blind-mode-ux-2026-03-31.source-manifest.json`
- Content hash: `sha256:e73e93daf293ba38873439dffafcd80a7c966ad6050bc641b3a54cbd02a48428`

## Files

- manifest: `examples/blind-mode-ux-2026-03-31.source-manifest.json`
- digest: `digests/blind-mode-ux-2026-03-31.digest.json`
- patch: `graph_patches/blind-mode-ux-2026-03-31.patch.json`
- report: `reports/blind-mode-ux-2026-03-31-ingest.md` (missing)

## Registry

- Source entry: yes
- Runs: 2
  - 2026-04-25T22:57:34.238Z — source_manifest_created
  - 2026-04-25T22:59:10.987Z — graph_patch_applied

## Digest

- Digest ID: `blind-mode-ux-2026-03-31.digest`
- Items: 5
  - `blind-mode-as-premium-ux` [pattern] Blind mode 不是 disability feature 而是 premium UX mode (confidence: 0.97)
  - `post-ui-agent-interface-shift` [claim] 下一代介面會從點擊與觀看轉向 agent、語音與無介面 (confidence: 0.95)
  - `signal-api-high-signal-transformation` [pattern] Signal API 的價值是抽取有用訊號而非描述畫面 (confidence: 0.96)
  - `assistive-products-are-trust-business` [claim] 視障產品不是流量生意而是信任生意 (confidence: 0.96)
  - `niche-lifestyle-saas-over-startup` [decision] 適合的商業模式是高頻小場景的 niche lifestyle SaaS (confidence: 0.95)

## Graph Patch

- Patch ID: `blind-mode-ux-2026-03-31.patch`
- Digest ID: `blind-mode-ux-2026-03-31.digest`
- Operations: 8
- Add nodes: 5
- Update nodes: 0
- Add edges: 3
- Update edges: 0

## Graph Impact

- Nodes in graph from source: 5
- Edges in graph from source: 3

## Validation Commands

```bash
node scripts/quality-gate.mjs --digest digests/blind-mode-ux-2026-03-31.digest.json --patch graph_patches/blind-mode-ux-2026-03-31.patch.json
node scripts/ingest-checklist.mjs --manifest examples/blind-mode-ux-2026-03-31.source-manifest.json --digest digests/blind-mode-ux-2026-03-31.digest.json --patch graph_patches/blind-mode-ux-2026-03-31.patch.json
node scripts/ingest-bundle-summary.mjs --source-id blind-mode-ux-2026-03-31
```

## Notes

This report is generated from current manifest, digest, patch, registry, and graph state. Do not edit counts manually; rerun `generate-ingest-report.mjs` or `finalize-ingest.mjs` instead.
