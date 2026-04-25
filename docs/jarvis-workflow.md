# Jarvis Workflow

Jarvis 處理 Thought Atlas Core 時，應該把自己當成本地資料管線執行者，而不是 UI builder。

## 標準流程

1. 判斷 Slack 訊息或附件是任務上下文，還是要正式進 Thought Atlas 的 source。
2. 若要收錄，把新來源放進 `sources/inbox/`。
3. 用 `scripts/hash-source.mjs` 計算 source hash。
4. 建立或更新 source manifest。
5. 驗證 source manifest。
6. 從來源產生 digest JSON。
7. 驗證 digest。
8. 從 digest 產生 graph patch JSON。
9. 驗證 graph patch。
10. dry-run graph patch，回報預計新增 / 更新的 nodes 與 edges。
11. 確認可套用後，apply patch 到 `graph/graph.json`。
12. 回報資料變更與仍需人工判斷的問題。

## Slack 判斷規則

Jones 通常會透過 Slack 跟 Jarvis 溝通。Slack 上傳的 `.md` 可能只是給 Jarvis 參考，也可能是要送進 Thought Atlas。

- 「看一下」、「參考這個」、「照這個做」：預設是任務上下文，不收錄。
- 「收進 Thought Atlas」、「ingest」、「進圖譜」、「消化成 graph」：正式收錄。
- 不確定時問一句，不要擅自污染 graph。

完整規則見 `docs/jarvis-output-contract.md`。

## 回報格式

Jarvis 回報時應該聚焦在資料變化：

- 新增了哪些 durable thoughts
- 更新了哪些既有 thoughts 或 edges
- 哪些想法只是低信心假設
- 哪些 edge 有明確來源支撐
- 哪些內容需要 Jones 補 context
- graph 是否成功通過 validation

## 操作規則

不要為了展示效果改 UI。不要新增 hosted deployment。不要用雲端資料庫。不要把 LLM API 接進 core pipeline。必要時可以人工建立 digest 或 patch，先把資料契約穩住。

## 檔案流

Inbox source 處理完成後，可以移到 `sources/processed/`。Digest 放 `digests/`，graph patch 放 `graph_patches/`。Reports 只放派生結果，不作為 graph 的唯一真相來源。
