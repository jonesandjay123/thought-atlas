# Ingest Report: ai-irreplaceability-lived-experience-2026-09-25

## Source

- Source ID: `ai-irreplaceability-lived-experience-2026-09-25`
- Title: AI、不可取代性與「不要錯過自己真正想活的人生」
- Source type: conversation
- Source file: `sources/inbox/ai-irreplaceability-lived-experience-2026-09-25.md`
- Manifest: `examples/ai-irreplaceability-lived-experience-2026-09-25.source-manifest.json`
- Content hash: `sha256:b2d58a915be8d15bcdcec5c661df32670860fedea29f47ae035a39f3546559d8`
- Origin channel: github
- Origin sender: Jones

## Files

- manifest: `examples/ai-irreplaceability-lived-experience-2026-09-25.source-manifest.json`
- digest: `digests/ai-irreplaceability-lived-experience-2026-09-25.digest.json`
- patch: `graph_patches/ai-irreplaceability-lived-experience-2026-09-25.patch.json`
- report: `reports/ai-irreplaceability-lived-experience-2026-09-25-ingest.md`

## Registry

- Source entry: yes
- Runs: 2
  - 2026-09-25T04:52:22.645Z — source_manifest_created
  - 2026-09-25T04:57:13.618Z — graph_patch_applied

## Digest

- Digest ID: `ai-irreplaceability-lived-experience-2026-09-25.digest`
- Items: 8
  - `irreplaceability-is-unstable-self-worth-foundation` [claim] 把自我價值建立在不可取代性上，在 AI 時代是不穩的地基 (confidence: 0.96)
  - `worth-doing-without-being-the-only-one` [claim] 一件事情值得做，不必因為只有你做得到 (confidence: 0.96)
  - `artifact-commodified-experience-not-voided` [claim] 成果可以被商品化；經歷不會被追溯作廢 (confidence: 0.97)
  - `scarcity-moves-to-taste-intent-experience` [claim] 當 execution 趨近免費，稀缺性上移到 taste、curiosity、intent 與值得活過的經歷 (confidence: 0.94)
  - `creation-as-lived-activity-rises` [claim] AI 讓作為商品的技能貶值，讓作為活動的創造升值 (confidence: 0.95)
  - `ambition-redirected-to-exploration` [decision] 不是躺平：把野心從成為不可取代的人轉向探索這一生能走到哪裡 (confidence: 0.94)
  - `outer-inner-principle-pair` [pattern] 一外一內：對世界有球來就打，對自己不必證明不可取代 (confidence: 0.95)
  - `do-not-miss-the-life-you-want-to-live` [decision] 不必成為不可取代的人；只要不要錯過自己真正想活的人生 (confidence: 0.97)

## Graph Patch

- Patch ID: `ai-irreplaceability-lived-experience-2026-09-25.patch`
- Digest ID: `ai-irreplaceability-lived-experience-2026-09-25.digest`
- Operations: 27
- Add nodes: 8
- Update nodes: 0
- Add edges: 19
- Update edges: 0

## Graph Impact

- Nodes in graph from source: 8
- Edges in graph from source: 19

## Validation Commands

```bash
node scripts/quality-gate.mjs --digest digests/ai-irreplaceability-lived-experience-2026-09-25.digest.json --patch graph_patches/ai-irreplaceability-lived-experience-2026-09-25.patch.json
node scripts/ingest-checklist.mjs --manifest examples/ai-irreplaceability-lived-experience-2026-09-25.source-manifest.json --digest digests/ai-irreplaceability-lived-experience-2026-09-25.digest.json --patch graph_patches/ai-irreplaceability-lived-experience-2026-09-25.patch.json
node scripts/ingest-bundle-summary.mjs --source-id ai-irreplaceability-lived-experience-2026-09-25
```

## Notes

This report is generated from current manifest, digest, patch, registry, and graph state. Do not edit counts manually; rerun `generate-ingest-report.mjs` or `finalize-ingest.mjs` instead.
