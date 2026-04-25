# Thought Atlas Core

Thought Atlas Core 是 Jarvis-native、local-first 的 ingestion / data engine。它的責任不是提供 hosted UI，也不是做圖形化展示，而是把本機來源穩定地轉成可驗證、可版本控制、可由 Jarvis 操作的思想資料。

核心里程碑：

```text
source.md -> digest.json -> graph_patch.json -> local graph JSON
```

目前根目錄只保留資料結構、範例、文件與本地腳本。舊的 React / Vite UI prototype 已移到 `prototypes/web-shell/`，它只作為互動概念參考，不是 production app path，也不是此 repo 的主要責任。

## 目錄

- `schemas/`：source manifest、digest、graph patch 的 JSON Schema
- `examples/`：最小可跑的 sample source / digest / graph patch
- `sources/inbox/`：待 ingestion 的原始來源
- `sources/processed/`：已處理並可追蹤的來源
- `digests/`：由 source 產生的 digest JSON
- `graph_patches/`：由 digest 產生的 graph patch JSON
- `graph/`：本地 graph JSON 狀態
- `reports/`：由 graph / digest 派生的本地報告
- `docs/`：產品、架構、資料模型、Jarvis workflow、UI 邊界與 ObserverJ 整合說明
- `scripts/`：本地 validation 與 sample patch apply 腳本
- `prototypes/web-shell/`：封存的 React / Vite UI shell prototype

## 驗證

```bash
npm install
npm run build
```

`npm run build` 等同本地資料驗證，不會啟動 Vite、不會部署、不會呼叫 LLM API。

如要把範例 graph patch 套到本地 graph：

```bash
npm run sample:apply
```

## 明確不做

- 不接 Firebase Hosting
- 不加入 graph visualization libraries
- 不加入 LLM API integration
- 不繼續改善 UI
- 不把 hosted web app 當成 production responsibility
