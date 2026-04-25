# 產品定義

Thought Atlas Core 是 Jarvis 的本地思想資料引擎。它接收 Markdown、對話摘錄、repo 狀態、研究筆記與手動來源，把它們整理成 digest，再轉成可審查的 graph patch，最後更新本地 graph JSON。

這個 repo 的產品責任是資料流，不是介面。UI 可以存在於 prototype 目錄作為概念參考，但核心價值來自可追蹤、可 diff、可由 Jarvis 自動處理的本地資料。

## 核心使用者

主要使用者是 Jarvis。Jones 可能閱讀輸出的報告或修改來源檔，但日常流程應該能由 Jarvis 在本機完成：收來源、產 digest、建立 patch、驗證、套用、回報改動。

## 核心里程碑

```text
source.md -> digest.json -> graph_patch.json -> local graph JSON
```

每一階段都應該留下檔案，不依賴記憶中的暫態 state。任何重要 claim、decision、question 都要能追回來源。

## 成功標準

- 新來源能放進 `sources/inbox/`
- digest 能被 schema 驗證
- graph patch 能被 schema 驗證
- patch 能套用到 `graph/graph.json`
- Jarvis 能用文字回報新增、更新、連線與衝突
- 整個流程不需要 hosted UI、雲端資料庫或 LLM API

## 非目標

這不是 Firebase app，不是 Graph UI，不是知識庫 SaaS，也不是聊天機器人的記憶後端。它是 Jarvis 在 Mac 上可操作的本地 ingestion / graph data engine。
