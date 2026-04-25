# 架構

Thought Atlas Core 採 local-first file pipeline。所有 durable state 都落在 repo 內的 JSON 或 Markdown 檔案，讓 git diff、人工 review 和 Jarvis automation 都能直接工作。

## Pipeline

```text
sources/inbox/*.md
  -> source manifest
  -> digest JSON
  -> graph patch JSON
  -> graph/graph.json
  -> reports/*.md
```

`source.md` 是原始材料，`digest.json` 是結構化摘要，`graph_patch.json` 是明確的 graph mutation，`graph/graph.json` 是本地 durable state。

## 分層

- Source Layer：原始 Markdown、對話、repo 狀態、研究筆記
- Digest Layer：摘要、claims、questions、decisions、source refs
- Patch Layer：新增 node、更新 node、新增 edge、記錄 rationale
- Graph Layer：本地 JSON graph state
- Report Layer：由 graph 派生的人類可讀整理
- Script Layer：validation、sample apply、未來可加入 importer

## 原則

- 本地優先：檔案是第一級資料庫
- Provenance-first：沒有來源的想法不能成為高信心 node
- Patch-first：不要直接手改 graph，優先產生可審查 patch
- UI-optional：任何核心流程都不能依賴 React app
- Agent-native：Jarvis 能用 CLI 腳本執行和驗證

## 邊界

根目錄不放 hosted app entrypoint，不接 Firebase Hosting，不加入 graph visualization runtime，不整合 LLM API。任何 UI 實驗都放在 `prototypes/` 或 `archive/`，不得成為核心 build。
