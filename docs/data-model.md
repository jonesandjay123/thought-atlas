# 資料模型

資料模型分成三個穩定輸入：source manifest、digest、graph patch。graph state 則是 patch 套用後的結果。

## Source Manifest

Source manifest 描述一個原始來源的身份和處理狀態。它不取代原始檔，只提供可追蹤 metadata。

必要欄位：

- `source_id`：穩定 ID
- `title`：來源標題
- `source_type`：`markdown`、`conversation`、`report`、`repo_state`、`manual`、`slack_file` 或 `slack_message`
- `path`：本地相對路徑
- `captured_at`：收錄時間
- `content_hash`：`sha256:<64 lowercase hex chars>`，用來去重與確認 source 未變動
- `status`：`inbox`、`processed` 或 `archived`

Slack 來源可以額外保留 `origin.channel`、`origin.message_id`、`origin.thread_id` 與 `origin.sender`。

## Digest

Digest 是來源的結構化理解。它應該比 summary 更細，能拆出 claim、question、decision、pattern、action 和 reference。

必要欄位：

- `digest_id`
- `source_id`
- `created_at`
- `summary`
- `items`

每個 item 要有 `id`、`kind`、`title`、`body`、`source_refs`、`confidence` 與 `tags`。

## Graph Patch

Graph patch 是對本地 graph 的明確變更，不是隱含 side effect。

支援 operation：

- `add_node`
- `update_node`
- `add_edge`
- `update_edge`

每個 operation 都要有 `rationale`，讓 Jarvis 能說明為什麼 graph 需要改。

Edge 本體也必須保留 `confidence`、`source_refs`、`rationale`。原因是 `graph/graph.json` 需要能獨立被 UI 或 Firestore sync 讀取；不能只有 patch history 才知道 edge 為什麼存在。

## Graph State

`graph/graph.json` 保存目前本地 graph：

- `schema_version`
- `updated_at`
- `nodes`
- `edges`

Node 代表 durable thought。Edge 代表語意關係，例如 `supports`、`contrasts`、`extends`、`depends_on`、`blocks`、`duplicates`、`resonates_with`。
