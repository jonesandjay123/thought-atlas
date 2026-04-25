# Ingest Report: breakfast-product-theory-2026-03-31

## Source

- Source ID: `breakfast-product-theory-2026-03-31`
- Title: 早餐店理論與 Decision Augmentation
- Source type: markdown
- Source file: `sources/inbox/breakfast-product-theory-2026-03-31.md`
- Manifest: `examples/breakfast-product-theory-2026-03-31.source-manifest.json`
- Content hash: `sha256:0728094e194f4464cf303f2810f836b9301634c7724afef784c9cab91997a91e`

## Files

- manifest: `examples/breakfast-product-theory-2026-03-31.source-manifest.json`
- digest: `digests/breakfast-product-theory-2026-03-31.digest.json`
- patch: `graph_patches/breakfast-product-theory-2026-03-31.patch.json`
- report: `reports/breakfast-product-theory-2026-03-31-ingest.md` (missing)

## Registry

- Source entry: yes
- Runs: 2
  - 2026-04-25T22:57:34.288Z — source_manifest_created
  - 2026-04-25T22:59:11.041Z — graph_patch_applied

## Digest

- Digest ID: `breakfast-product-theory-2026-03-31.digest`
- Items: 5
  - `blind-assist-and-polymarket-share-decision-augmentation` [pattern] 視障輔助與預測市場本質上都是 Decision Augmentation (confidence: 0.94)
  - `haro-is-phase-ten-not-current-mvp` [decision] Haro 式 ambient companion 是遠期願景不是當前 MVP (confidence: 0.95)
  - `breakfast-product-four-conditions` [pattern] 早餐店產品必須每天會用、不用學、一個功能就夠、做完能收錢 (confidence: 0.97)
  - `queue-turn-reminder-first-wedge` [action] 輪到你提醒器是最該先驗證的蛋餅級 wedge (confidence: 0.95)
  - `validation-before-more-framing` [decision] 下一步是驗證痛點而不是繼續重新 frame (confidence: 0.96)

## Graph Patch

- Patch ID: `breakfast-product-theory-2026-03-31.patch`
- Digest ID: `breakfast-product-theory-2026-03-31.digest`
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
node scripts/quality-gate.mjs --digest digests/breakfast-product-theory-2026-03-31.digest.json --patch graph_patches/breakfast-product-theory-2026-03-31.patch.json
node scripts/ingest-checklist.mjs --manifest examples/breakfast-product-theory-2026-03-31.source-manifest.json --digest digests/breakfast-product-theory-2026-03-31.digest.json --patch graph_patches/breakfast-product-theory-2026-03-31.patch.json
node scripts/ingest-bundle-summary.mjs --source-id breakfast-product-theory-2026-03-31
```

## Notes

This report is generated from current manifest, digest, patch, registry, and graph state. Do not edit counts manually; rerun `generate-ingest-report.mjs` or `finalize-ingest.mjs` instead.
