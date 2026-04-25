# Ingest Report: ikigai-2026-04-25

## Source

- Source ID: `ikigai-2026-04-25`
- Title: Ikigai、生活系統與 Playable Life System
- Source type: slack_file
- Source file: `sources/inbox/ikigai-2026-04-25.md`
- Manifest: `examples/ikigai-2026-04-25.source-manifest.json`
- Content hash: `sha256:1141e7ebcc4bf4d7e445c6d2dc5847074bddea5eb11f3cd300ac431d725295d7`
- Origin channel: slack
- Origin sender: Jones
- Origin message: `1777145324.050329`

## Files

- manifest: `examples/ikigai-2026-04-25.source-manifest.json`
- digest: `digests/ikigai-2026-04-25.digest.json`
- patch: `graph_patches/ikigai-2026-04-25.patch.json`
- report: `reports/ikigai-2026-04-25-ingest.md`

## Registry

- Source entry: yes
- Runs: 4
  - 2026-04-25T19:29:04.118Z — source_manifest_created
  - 2026-04-25T19:30:49.373Z — graph_patch_applied
  - 2026-04-25T19:31:05.316Z — graph_patch_upserted
  - 2026-04-25T19:31:17.309Z — graph_patch_upserted

## Digest

- Digest ID: `ikigai-2026-04-25.digest`
- Items: 15
  - `ikigai-knowing-self-before-doing` [claim] Jones 已更知道自己是誰但尚未明朗要做什麼 (confidence: 0.96)
  - `jones-love-strength-system-builder` [claim] Jones 的 Love 與 Strength 交集是創造、架構與 system builder (confidence: 0.95)
  - `need-money-problem-selection-gap` [question] Jones 的卡點是能力要用來解什麼問題 (confidence: 0.95)
  - `candidate-ikigai-directions` [pattern] 三個候選 Ikigai 方向是 AI × 社交、資訊、行為 (confidence: 0.94)
  - `direction-too-many-commitment-gap` [claim] Jones 不是沒有方向而是方向太多所以難以 commit (confidence: 0.93)
  - `three-loop-operating-architecture` [pattern] Jones 的當前運作架構是內在探索、生活創作、自我進化三個 loop (confidence: 0.96)
  - `externalization-choice-for-main-life` [question] Ikigai 的分水嶺是是否讓生活方式外化成主線人生 (confidence: 0.95)
  - `process-oriented-entrepreneurship-fit` [claim] Jones 不是不適合創業而是不適合用賺錢導向當核心驅動 (confidence: 0.96)
  - `life-system-sustainability-structure` [claim] Jones 在找能承載其活法的長期結構而非單純備案 (confidence: 0.94)
  - `productization-as-natural-overflow` [decision] 產品化應是生活系統自然外溢而非為產品而產品 (confidence: 0.97)
  - `sustainability-compromise-boundary` [question] 可持續化需要適度妥協但不能被市場反向吞沒 (confidence: 0.94)
  - `ai-as-natural-leverage` [claim] AI 對 Jones 不是風口而是最自然的槓桿 (confidence: 0.97)
  - `playable-life-system-prototype` [pattern] Playable Life System 是可外化但不破壞動力的 prototype (confidence: 0.97)
  - `playable-life-system-layers` [pattern] Playable Life System 由 Mind、Timeline、Agent、Evolution、Curiosity 五層組成 (confidence: 0.95)
  - `externalization-phases-from-private-to-monetization` [pattern] 外化路徑應從完全自用到自然外溢、弱產品化、再到真正變現 (confidence: 0.96)

## Graph Patch

- Patch ID: `ikigai-2026-04-25.patch`
- Digest ID: `ikigai-2026-04-25.digest`
- Operations: 30
- Add nodes: 15
- Update nodes: 0
- Add edges: 15
- Update edges: 0

## Graph Impact

- Nodes in graph from source: 15
- Edges in graph from source: 15

## Validation Commands

```bash
node scripts/quality-gate.mjs --digest digests/ikigai-2026-04-25.digest.json --patch graph_patches/ikigai-2026-04-25.patch.json
node scripts/ingest-checklist.mjs --manifest examples/ikigai-2026-04-25.source-manifest.json --digest digests/ikigai-2026-04-25.digest.json --patch graph_patches/ikigai-2026-04-25.patch.json
node scripts/ingest-bundle-summary.mjs --source-id ikigai-2026-04-25
```

## Notes

This report is generated from current manifest, digest, patch, registry, and graph state. Do not edit counts manually; rerun `generate-ingest-report.mjs` or `finalize-ingest.mjs` instead.
