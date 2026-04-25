# 資料模型

資料模型分成三個穩定輸入：source manifest、digest、graph patch。graph state 則是 patch 套用後的結果。

## Source Manifest

Source manifest 描述一個原始來源的身份和處理狀態。它不取代原始檔，只提供可追蹤 metadata。

必要欄位：

- `source_id`：穩定 ID
- `title`：來源標題
- `source_type`：`markdown`、`conversation`、`report`、`repo_state` 或 `manual`
- `path`：本地相對路徑
- `captured_at`：收錄時間
- `status`：`inbox`、`processed` 或 `archived`

## Digest

Digest 是來源的結構化理解。它應該比 summary 更細，能拆出 claim、question、decision 和 action candidate。

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

每個 operation 都要有 `rationale`，讓 Jarvis 能說明為什麼 graph 需要改。

## Graph State

`graph/graph.json` 保存目前本地 graph：

- `schema_version`
- `updated_at`
- `nodes`
- `edges`

Node 代表 durable thought。Edge 代表語意關係，例如 `supports`、`contrasts`、`extends`、`depends_on`、`blocks`、`duplicates`。
