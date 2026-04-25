# Ingest Report: voice-first-media-interface-2026-04

## Source

- Source ID: `voice-first-media-interface-2026-04`
- Title: Voice-First Media Agent：影音內容的對話式知識介面
- Source type: markdown
- Source file: `sources/inbox/voice-first-media-interface-2026-04.md`
- Manifest: `examples/voice-first-media-interface-2026-04.source-manifest.json`
- Content hash: `sha256:0c38e5194977cb40711ffb66cf0ad07c52ab7dca577a189070dc6bec3ee0b3de`

## Files

- manifest: `examples/voice-first-media-interface-2026-04.source-manifest.json`
- digest: `digests/voice-first-media-interface-2026-04.digest.json`
- patch: `graph_patches/voice-first-media-interface-2026-04.patch.json`
- report: `reports/voice-first-media-interface-2026-04-ingest.md` (missing)

## Registry

- Source entry: yes
- Runs: 2
  - 2026-04-25T22:57:34.388Z — source_manifest_created
  - 2026-04-25T22:59:11.147Z — graph_patch_applied

## Digest

- Digest ID: `voice-first-media-interface-2026-04.digest`
- Items: 5
  - `media-should-be-operable-not-just-played` [claim] 影音內容不該只能被播放而應能被操作 (confidence: 0.97)
  - `lost-media-memory-is-unsolved-use-case` [claim] 長影音與 podcast 的觀點回找目前幾乎無解 (confidence: 0.94)
  - `five-layer-media-interface-model` [pattern] 影音知識介面可拆成找得到、變短、可以問、可導航與模式轉換五層 (confidence: 0.96)
  - `language-navigation-replaces-timeline-ui` [pattern] 用語言在影片中移動可能取代 timeline UI (confidence: 0.95)
  - `voice-first-mode-shift-is-differentiator` [question] 若完全沒有畫面仍成立，voice-first 就是強差異化 (confidence: 0.95)

## Graph Patch

- Patch ID: `voice-first-media-interface-2026-04.patch`
- Digest ID: `voice-first-media-interface-2026-04.digest`
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
node scripts/quality-gate.mjs --digest digests/voice-first-media-interface-2026-04.digest.json --patch graph_patches/voice-first-media-interface-2026-04.patch.json
node scripts/ingest-checklist.mjs --manifest examples/voice-first-media-interface-2026-04.source-manifest.json --digest digests/voice-first-media-interface-2026-04.digest.json --patch graph_patches/voice-first-media-interface-2026-04.patch.json
node scripts/ingest-bundle-summary.mjs --source-id voice-first-media-interface-2026-04
```

## Notes

This report is generated from current manifest, digest, patch, registry, and graph state. Do not edit counts manually; rerun `generate-ingest-report.mjs` or `finalize-ingest.mjs` instead.
