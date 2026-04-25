# Jarvis Output Contract

Thought Atlas Core 的使用者主要是 Jarvis。每次 Jarvis 決定把一篇來源正式送進 Thought Atlas，都要產出三個可檢查的檔案：

```text
source_manifest.json
 digest.json
 graph_patch.json
```

這份文件定義 Jarvis 在 Slack、檔案附件、貼文、或本地 markdown 來源之間應該如何判斷與輸出。

## Slack 使用情境

Jones 日常會透過 Slack 跟 Jarvis 溝通，也可能在 Slack 裡貼上 `.md` 或直接上傳 markdown file。不是每個 Slack 附件都應該進 Thought Atlas。

### 預設判斷

- 如果 Jones 說「參考這個」、「看一下這個 GPT 回饋」、「照這個方向做」：這是 *給 Jarvis 的任務上下文*，不要自動 ingest 到 Thought Atlas。
- 如果 Jones 說「把這篇收進 Thought Atlas」、「ingest 這份」、「這篇進圖譜」、「幫我消化成 thought-atlas」：這是 *Thought Atlas source*，Jarvis 應建立 source manifest / digest / graph patch。
- 如果 Jones 同時給任務與附件，Jarvis 應先完成任務；只有在明確要求收錄時，才把附件當 source。
- 不確定時，先問一句：「這份是給我參考，還是要收進 Thought Atlas？」

### Slack source manifest origin

來自 Slack 的 source manifest 應使用：

```json
{
  "source_type": "slack_file",
  "origin": {
    "channel": "slack",
    "message_id": "...",
    "thread_id": "...",
    "sender": "Jones"
  }
}
```

若內容是 Jones 直接貼在 Slack 訊息裡，使用 `source_type: "slack_message"`。

## Source manifest contract

Source manifest 描述來源身份，不取代原文。

必填：

- `source_id`：穩定 lowercase id
- `title`
- `source_type`
- `path`
- `captured_at`
- `content_hash`：`sha256:<hash>`
- `status`

Jarvis 可用：

```bash
node scripts/hash-source.mjs sources/inbox/some-source.md
node scripts/validate-source-manifest.mjs examples/sample-source-manifest.json
```

## Digest contract

Digest 是 Jarvis 對 source 的結構化消化。它不是完整摘要，也不是逐句轉錄。

Digest item 只能使用：

- `claim`：可被討論或驗證的主張
- `question`：值得保留的開放問題
- `decision`：Jones / Jarvis 已做出的方向決定
- `pattern`：反覆出現的方法、偏好、風險或設計模式
- `action`：後續可執行事項
- `reference`：值得保留的外部概念、工具、文章、repo

每個 item 必須有：

- `source_refs`
- `confidence`
- `tags`

## 不應 promote 的內容

不要把以下內容升級成 durable graph node：

- 普通閒聊
- 純情緒反應，除非它揭示長期偏好或風險
- 沒有長期價值的 UI 裝飾意見
- 重複 phrasing
- 沒有 provenance 的猜測
- 只對當下執行有效、完成後不再重要的短期狀態

這些內容可以留在 raw source 或 digest summary，不一定進 graph。

## Graph patch contract

Graph patch 是對 `graph/graph.json` 的明確變更。Jarvis 產生 patch 後，應先 dry-run，再決定是否 apply。

支援 operation：

- `add_node`
- `update_node`
- `add_edge`
- `update_edge`

Edge 本體必須有：

- `confidence`
- `source_refs`
- `rationale`

因為 UI 或未來 Firestore 讀 graph state 時，不能只依賴 operation history 才知道一條 edge 為什麼存在。

## Jarvis 回報格式

完成 ingest 時，Jarvis 應回報：

- source id / digest id / patch id
- dry-run 結果
- apply 結果
- 新增 / 更新哪些 nodes
- 新增 / 更新哪些 edges
- 有哪些低信心或需要 Jones 判斷的地方

不要只說「完成」。Thought Atlas 的價值在於可追蹤的資料變化。
