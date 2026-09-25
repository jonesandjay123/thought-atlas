# Ingest Report: ai-selection-jev-play-the-ball-2026-09-21

## Source

- Source ID: `ai-selection-jev-play-the-ball-2026-09-21`
- Title: AI Selection、JEV 與「有球來就打」
- Source type: conversation
- Source file: `sources/inbox/ai-selection-jev-play-the-ball-2026-09-21.md`
- Manifest: `examples/ai-selection-jev-play-the-ball-2026-09-21.source-manifest.json`
- Content hash: `sha256:6100b3ddd7deb3375212f64c9f9c37f52403570f53a6bed3d7474b54e102d24e`
- Origin channel: github
- Origin sender: Jones

## Files

- manifest: `examples/ai-selection-jev-play-the-ball-2026-09-21.source-manifest.json`
- digest: `digests/ai-selection-jev-play-the-ball-2026-09-21.digest.json`
- patch: `graph_patches/ai-selection-jev-play-the-ball-2026-09-21.patch.json`
- report: `reports/ai-selection-jev-play-the-ball-2026-09-21-ingest.md`

## Registry

- Source entry: yes
- Runs: 2
  - 2026-09-25T04:52:22.565Z — source_manifest_created
  - 2026-09-25T04:57:13.532Z — graph_patch_applied

## Digest

- Digest ID: `ai-selection-jev-play-the-ball-2026-09-21.digest`
- Items: 8
  - `ai-capability-stack-node-to-selection` [pattern] AI 能力正從 Node → Edge → Graph 一路往下吃進 Selection (confidence: 0.95)
  - `what-humans-keep-when-ai-selects` [question] 當 AI 也會連線、建圖、加權、推薦，人還要保留什麼？ (confidence: 0.94)
  - `ai-recommendation-is-not-commitment` [decision] AI 可以推薦最優選項，但不能替人認領人生 (confidence: 0.96)
  - `choice-transforms-the-chooser` [claim] 選擇會改寫做選擇的人，人生不是固定 utility function 上的 argmax (confidence: 0.93)
  - `direction-stable-path-fluid` [decision] 方向穩定，路徑流動 (confidence: 0.97)
  - `play-the-ball-when-it-comes` [pattern] 有球來就打：把規劃從固定路線改成維持可回應性 (confidence: 0.96)
  - `present-is-not-future-consumable` [claim] 當下不是未來的耗材 (confidence: 0.94)
  - `jones-version-lineage-selection-patch` [pattern] Jones 1.0 → 4.0 自我探索序列與 2026-09-21 Selection Patch (confidence: 0.88)

## Graph Patch

- Patch ID: `ai-selection-jev-play-the-ball-2026-09-21.patch`
- Digest ID: `ai-selection-jev-play-the-ball-2026-09-21.digest`
- Operations: 20
- Add nodes: 8
- Update nodes: 0
- Add edges: 12
- Update edges: 0

## Graph Impact

- Nodes in graph from source: 8
- Edges in graph from source: 17

## Validation Commands

```bash
node scripts/quality-gate.mjs --digest digests/ai-selection-jev-play-the-ball-2026-09-21.digest.json --patch graph_patches/ai-selection-jev-play-the-ball-2026-09-21.patch.json
node scripts/ingest-checklist.mjs --manifest examples/ai-selection-jev-play-the-ball-2026-09-21.source-manifest.json --digest digests/ai-selection-jev-play-the-ball-2026-09-21.digest.json --patch graph_patches/ai-selection-jev-play-the-ball-2026-09-21.patch.json
node scripts/ingest-bundle-summary.mjs --source-id ai-selection-jev-play-the-ball-2026-09-21
```

## Notes

This report is generated from current manifest, digest, patch, registry, and graph state. Do not edit counts manually; rerun `generate-ingest-report.mjs` or `finalize-ingest.mjs` instead.
