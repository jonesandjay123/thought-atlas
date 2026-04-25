# Jarvis Workflow

Jarvis 處理 Thought Atlas Core 時，應該把自己當成本地資料管線執行者，而不是 UI builder。

## 標準流程

1. 把新來源放進 `sources/inbox/`
2. 建立或更新 source manifest
3. 從來源產生 digest JSON
4. 驗證 digest
5. 從 digest 產生 graph patch JSON
6. 驗證 graph patch
7. 套用 patch 到 `graph/graph.json`
8. 回報新增 nodes、edges、更新內容與仍需人工判斷的問題

## 回報格式

Jarvis 回報時應該聚焦在資料變化：

- 新增了哪些 durable thoughts
- 哪些想法只是低信心假設
- 哪些 edge 有明確來源支撐
- 哪些內容需要 Jones 補 context
- graph 是否成功通過 validation

## 操作規則

不要為了展示效果改 UI。不要新增 hosted deployment。不要用雲端資料庫。不要把 LLM API 接進 core pipeline。必要時可以人工建立 digest 或 patch，先把資料契約穩住。

## 檔案流

Inbox source 處理完成後，可以移到 `sources/processed/`。Digest 放 `digests/`，graph patch 放 `graph_patches/`。Reports 只放派生結果，不作為 graph 的唯一真相來源。
