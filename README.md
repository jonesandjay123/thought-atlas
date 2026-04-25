# Thought Atlas

Thought Atlas 是給 Jarvis 使用的 local-first 個人思想圖譜原型。它的目標不是把所有筆記變成漂亮節點，而是把長篇 AI 對話、Markdown notes、研究報告裡真正會影響判斷的 claims、問題、決策、矛盾和下一步，整理成會持續演化的 dense thought graph。

目前這個 repo 是 Vite + React + TypeScript 的靜態 prototype，重點是產品骨架、資料模型和互動方向。可以用 `npm install && npm run build` 驗證。

## 願景

Jones 和 Jarvis 會累積大量長篇對話、repo 狀態、研究摘要、策略文件和臨時想法。單純搜尋 transcript 不夠，因為真正需要的是：

- 從 raw source 提取出可追蹤的 thought nodes
- 把節點連成 supports、contrasts、extends、depends-on 等關係
- 保留來源、信心分數、freshness、tag、cluster
- 讓 Jarvis 能看出哪些想法已經穩定，哪些只是 inbox 裡待整理的素材
- 從 cluster 生成持續更新的 reports，而不是一次性 summary

Thought Atlas 應該成為 Jarvis 的本地知識工作台：可讀、可改、可版本控制、可被 agent 操作。

## 現有原型

Prototype 包含：

- `src/data/seedThoughtAtlas.ts`：可重用 seed data，包含 nodes、edges、idea inbox、cluster reports
- SVG force-inspired atlas：沒有 heavy graph runtime dependency，先用固定座標展示互動模型
- Idea inbox mock：模擬長篇來源進來後的 triage queue
- Inspector：查看節點摘要、來源、信心分數、狀態、tags、鄰近關係
- Cluster/report panels：每個 cluster 有 thesis、open questions、next moves

## 架構方向

短期可以保持簡單：

```text
raw sources
  -> import manifest
  -> extracted thoughts
  -> graph state
  -> cluster reports
  -> review / edit / promote
```

中期應該把資料拆成可版本控制的本地檔案：

- `sources/`：原始 markdown、conversation export、research report
- `graph/nodes.json`：durable thought nodes
- `graph/edges.json`：節點關係
- `graph/clusters.json`：cluster 定義與 report state
- `inbox/`：尚未 promote 的片段與建議
- `reports/`：由 cluster 生成或人工修訂的 living reports

UI 可以仍然是 React，但資料層應避免綁死到單一前端 state。Jarvis 應該能用 CLI 或 script 直接更新資料。

## 資料模型

核心物件：

- `ThoughtNode`：一個 durable idea、claim、question、decision 或 pattern
- `ThoughtEdge`：節點之間的語意關係
- `IdeaInboxItem`：還在等待 triage 的來源片段
- `ClusterReport`：一群節點形成的 thesis、問題與下一步

每個 node 必須保留來源脈絡。沒有 provenance 的漂亮節點沒有長期價值。

## 與 Graphify / thinking-canvas 的關係

Graphify 類工具擅長從文字抽 entity 和 relation，但 Thought Atlas 的重點更個人化：不是「文字裡有哪些東西」，而是「這些東西對 Jones / Jarvis 的判斷有什麼意義」。

Thinking canvas 類工具擅長空間排列與視覺思考，但 Thought Atlas 不應只是一張手排白板。它需要 queryable、可 diff、可生成 report，也要能被 Jarvis 在背景維護。

所以定位是：

- Graphify 提供抽取靈感
- thinking-canvas 提供互動靈感
- Thought Atlas 做 Jarvis-native 的本地思想作業系統

## Roadmap

1. 建立本地 JSON / Markdown 儲存格式
2. 加入 markdown importer，把 heading、blockquote、frontmatter 轉成 inbox items
3. 加入 node promotion workflow：excerpt -> claim / question / decision
4. 支援 source anchors，讓每個 node 能回到原始段落
5. 建立 cluster report generator，輸出可人工編輯的 Markdown
6. 加入 graph diff，讓 Jarvis 能說明本次 ingest 改變了什麼
7. 接上 repo-local `STATE.md`，讓專案狀態進入 atlas

## 開發

```bash
npm install
npm run dev
npm run build
```

這個 repo 目前尚未 commit。完成 prototype 後應先 review UI 與資料模型，再決定是否加入真實 import pipeline。
