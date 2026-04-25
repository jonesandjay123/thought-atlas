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
