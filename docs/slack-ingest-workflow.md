# Slack Ingest Workflow

Thought Atlas 的主要操作入口是 Slack。Jones 可能直接貼文字、上傳 `.md`，或用一句話要求 Jarvis 收進 Thought Atlas。本文件定義 Jarvis 的標準流程。

## 觸發語意

### 正式 ingest

以下語句代表附件或貼文要進 Thought Atlas：

- 「這篇收進 Thought Atlas」
- 「ingest 這份」
- 「進圖譜」
- 「消化成 graph」
- 「把這段放進 thought-atlas」

Jarvis 應建立 source、manifest、digest、graph patch，dry-run，apply，commit，push。

### 任務上下文，不 ingest

以下語句預設只是給 Jarvis 參考：

- 「看一下這個」
- 「參考這個 GPT 回饋」
- 「照這個方向做」
- 「你覺得呢？」

Jarvis 應完成任務，但不要污染 `graph/graph.json`。

### 不確定

如果語意不明，先問一句：

> 這份是給我參考，還是要正式收進 Thought Atlas？

## 標準檔案流

假設 source id 是 `some-source`：

```text
sources/inbox/some-source.md
examples/some-source.source-manifest.json
digests/some-source.digest.json
graph_patches/some-source.patch.json
reports/some-source-ingest.md
graph/graph.json
```

## 建立 source manifest

如果 Slack attachment 已下載成 inbound file，可用：

```bash
node scripts/create-source-manifest.mjs \
  --input /path/to/inbound.md \
  --source-id some-source \
  --title "Some Source" \
  --source-type slack_file \
  --destination sources/inbox/some-source.md \
  --manifest examples/some-source.source-manifest.json \
  --origin-channel slack \
  --origin-message-id 123.456 \
  --origin-thread-id 123.000 \
  --origin-sender Jones \
  --tag thought-atlas \
  --strip-openclaw-wrapper
```

`--strip-openclaw-wrapper` 會移除 OpenClaw external content wrapper，只保留原文。

## Digest 與 graph patch

目前 digest / patch 由 Jarvis 依照 `docs/jarvis-output-contract.md` 產生。產生後跑：

```bash
node scripts/ingest-checklist.mjs \
  --manifest examples/some-source.source-manifest.json \
  --digest digests/some-source.digest.json \
  --patch graph_patches/some-source.patch.json
```

這會驗證 manifest / digest / patch，並對 graph patch 做 dry-run。

## Apply

確認 dry-run 合理後：

```bash
node scripts/apply-graph-patch.mjs graph_patches/some-source.patch.json graph/graph.json
npm run build
git add -A
git commit -m "data: ingest some source"
git push
```

## 回報格式

Jarvis 回報 Jones 時應包含：

- source id / digest id / patch id
- 新增 / 更新 nodes 數量
- 新增 / 更新 edges 數量
- 主要 promoted nodes
- validation 是否通過
- commit hash

## Graph inspection

Ingest 後可用：

```bash
npm run graph:summary
node scripts/graph-node.mjs trigger-expand-package-compound
node scripts/graph-search.mjs 創作
```

## Reset a test ingest

如果 Jones 要用同一份 `.md` 反覆測試，可以先清掉某個 source 的 ingest 結果：

```bash
node scripts/reset-source-ingest.mjs --source-id some-source --dry-run
node scripts/reset-source-ingest.mjs --source-id some-source
npm run build
```

這會移除：

- graph 中所有 `source_refs` 指向該 source 的 nodes
- 連到那些 nodes 的 edges
- 該 source 對應的 manifest / digest / patch / report / source file

這個工具是測試輔助，不應用來刪除正式重要資料，除非 Jones 明確要求。

## Duplicate and upsert checks

Before ingesting a Slack file, Jarvis can check whether the same source already exists:

```bash
node scripts/source-status.mjs --file /path/to/inbound.md
node scripts/source-status.mjs --source-id some-source
node scripts/source-status.mjs --hash sha256:<hash>
```

If a source with the same hash already exists, Jarvis should not blindly create duplicate graph nodes. The safe choices are:

1. report that the source already exists and ask Jones whether to reset or upsert;
2. run `source:reset` if this is a regression test;
3. run patch apply with `--upsert` only when the intended behavior is to refresh existing nodes/edges.

Strict apply remains the default:

```bash
node scripts/apply-graph-patch.mjs graph_patches/some-source.patch.json graph/graph.json
```

Upsert mode must be explicit:

```bash
node scripts/apply-graph-patch.mjs graph_patches/some-source.patch.json graph/graph.json --upsert
```

`--upsert` updates existing nodes/edges with incoming data and merges provenance (`source_refs`). It is useful for re-running the same source after digest logic improves, but should still be reported clearly to Jones.

## Registry and run log

`source:create`, `apply-graph-patch --record-registry`, and `source:reset` can record source/run history in:

```text
sources/registry.json
```

Inspect it with:

```bash
npm run registry:summary
```

Recommended apply command for a real ingest:

```bash
node scripts/apply-graph-patch.mjs graph_patches/some-source.patch.json graph/graph.json \
  --record-registry \
  --source-id some-source
```

For temporary experiments, use `--skip-registry` on source creation or reset if you do not want the event logged.

## Bundle summary

After an ingest, Jarvis can generate a stable summary from the repo state:

```bash
node scripts/ingest-bundle-summary.mjs --source-id some-source
node scripts/ingest-bundle-summary.mjs --source-id some-source --json
```

This checks the expected manifest, digest, patch, report, registry entry, registry runs, and graph impact for one source. Use this when reporting final Slack ingest results to Jones.

## Digest and patch templates

To reduce hand-written JSON mistakes, Jarvis can generate starter files after creating a source manifest:

```bash
node scripts/create-digest-template.mjs \
  --manifest examples/some-source.source-manifest.json

node scripts/create-graph-patch-template.mjs \
  --digest digests/some-source.digest.json
```

These templates are intentionally conservative and contain TODO text. Jarvis must replace TODO content with real extracted ideas before applying a graph patch.
