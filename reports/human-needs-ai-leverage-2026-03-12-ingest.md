# Ingest Report: human-needs-ai-leverage-2026-03-12

## Source

- Source ID: `human-needs-ai-leverage-2026-03-12`
- Title: 降維打擊與人性需求
- Source type: markdown
- Source file: `sources/inbox/human-needs-ai-leverage-2026-03-12.md`
- Manifest: `examples/human-needs-ai-leverage-2026-03-12.source-manifest.json`
- Content hash: `sha256:970f821ada91f14c421162f8e998261ae761e140f528675a4ff823a8ebfdcdd1`

## Files

- manifest: `examples/human-needs-ai-leverage-2026-03-12.source-manifest.json`
- digest: `digests/human-needs-ai-leverage-2026-03-12.digest.json`
- patch: `graph_patches/human-needs-ai-leverage-2026-03-12.patch.json`
- report: `reports/human-needs-ai-leverage-2026-03-12-ingest.md` (missing)

## Registry

- Source entry: yes
- Runs: 2
  - 2026-04-25T22:57:34.338Z — source_manifest_created
  - 2026-04-25T22:59:11.093Z — graph_patch_applied

## Digest

- Digest ID: `human-needs-ai-leverage-2026-03-12.digest`
- Items: 6
  - `dimension-reduction-means-ai-compresses-traditional-knowhow` [pattern] 降維打擊是用 AI 壓縮傳統 know-how 進入低技術市場 (confidence: 0.97)
  - `human-need-business-four-conditions` [pattern] 可行的人性需求生意需立刻賺錢、抓住人性、AI 加速 know-how、前台有人味 (confidence: 0.96)
  - `four-layer-human-needs-stack` [pattern] 人性需求可分身體、心理、社交、虛榮四層且越往上溢價越高 (confidence: 0.97)
  - `psychological-layer-sells-being-understood` [claim] 心理層的高溢價來自被理解、被安慰與知道未來 (confidence: 0.95)
  - `vanity-layer-highest-margin-ai-fit` [claim] 虛榮層最適合 AI 槓桿因為人會為被看見與地位付高價 (confidence: 0.94)
  - `frontstage-human-backstage-ai-service-model` [decision] 最佳服務模型是前台人溫度、後台 AI 效率 (confidence: 0.96)

## Graph Patch

- Patch ID: `human-needs-ai-leverage-2026-03-12.patch`
- Digest ID: `human-needs-ai-leverage-2026-03-12.digest`
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
node scripts/quality-gate.mjs --digest digests/human-needs-ai-leverage-2026-03-12.digest.json --patch graph_patches/human-needs-ai-leverage-2026-03-12.patch.json
node scripts/ingest-checklist.mjs --manifest examples/human-needs-ai-leverage-2026-03-12.source-manifest.json --digest digests/human-needs-ai-leverage-2026-03-12.digest.json --patch graph_patches/human-needs-ai-leverage-2026-03-12.patch.json
node scripts/ingest-bundle-summary.mjs --source-id human-needs-ai-leverage-2026-03-12
```

## Notes

This report is generated from current manifest, digest, patch, registry, and graph state. Do not edit counts manually; rerun `generate-ingest-report.mjs` or `finalize-ingest.mjs` instead.
