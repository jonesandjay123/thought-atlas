# Thought Atlas Core

Thought Atlas Core 是 Jarvis-native、local-first 的 ingestion / data engine。它的責任不是提供 hosted UI，也不是做圖形化展示，而是把本機來源穩定地轉成可驗證、可版本控制、可由 Jarvis 操作的思想資料。

> 新 session 接手請先讀：`docs/handoff.md`。它記錄目前 backend / Firestore sync / seed data / 下一步 UI 對接狀態。

核心里程碑：

```text
source.md + source_manifest.json + digest.json + graph_patch.json -> local graph JSON -> Firestore mirror
```

目前 v0 backend 已完成三篇 seed source ingestion，並已 full sync 到 Firebase project `thought-atlas`。Firestore 是 downstream mirror；本 repo 的 local files 仍是目前 source of truth。

目前根目錄只保留資料結構、範例、文件與本地腳本。舊的 React / Vite UI prototype 已移到 `prototypes/web-shell/`，它只作為互動概念參考，不是 production app path，也不是此 repo 的主要責任。

## 目錄

- `schemas/`：source manifest、digest、graph patch 的 JSON Schema
- `examples/`：最小可跑的 sample source / source manifest / digest / graph patch
- `sources/inbox/`：待 ingestion 的原始來源
- `sources/processed/`：已處理並可追蹤的來源
- `digests/`：由 source 產生的 digest JSON
- `graph_patches/`：由 digest 產生的 graph patch JSON
- `graph/`：本地 graph JSON 狀態
- `reports/`：由 graph / digest 派生的本地報告
- `docs/`：handoff、產品、架構、資料模型、Jarvis workflow、UI 邊界、Firebase/Firestore、ObserverJ 整合與 Jarvis output contract
- `scripts/`：本地 validation、hash 與 patch apply 腳本
- `prototypes/web-shell/`：封存的 React / Vite UI shell prototype

## 驗證

```bash
npm install
npm run build
```

`npm run build` 等同本地資料驗證，不會啟動 Vite、不會部署、不會呼叫 LLM API。

可單獨驗證：

```bash
npm run validate:source
npm run validate:digest
npm run validate:patch
```

計算 source hash：

```bash
node scripts/hash-source.mjs examples/sample-source.md
```

Dry-run graph patch：

```bash
node scripts/apply-graph-patch.mjs examples/sample-graph-patch.json graph/graph.json --dry-run
```

套用範例 graph patch：

```bash
npm run sample:apply
```

## Slack 使用方式

Jones 未來多半會透過 Slack 貼文件或上傳 `.md`。Jarvis 不應把所有 Slack 附件都自動收進 Thought Atlas。

- 如果 Jones 說「看一下 / 參考 / 照這個做」，附件是任務上下文。
- 如果 Jones 說「收進 Thought Atlas / ingest / 進圖譜 / 消化成 graph」，附件才是 Thought Atlas source。
- 不確定時，Jarvis 應先問一句。

完整規則見 `docs/jarvis-output-contract.md`。

## Firestore sync

Firebase project:

```text
project_id: thought-atlas
firestore: Production, nam7
hosting: enabled
```

Dry-run:

```bash
node scripts/sync-firestore.mjs --project-id thought-atlas --dry-run
```

Full sync（必須明確確認後才執行）：

```bash
node scripts/sync-firestore.mjs --project-id thought-atlas --write
```

Service account key 使用 repo-local secret：

```text
.secrets/service-account.json
```

`.secrets/` 已 gitignored；不要印出、貼出或 commit credential。

## 明確不做

- 不在此 repo 做 Firebase Hosting UI
- 不加入 graph visualization libraries 到 core
- 不加入 LLM API integration 到 core
- 不繼續改善 UI
- 不把 hosted web app 當成 production responsibility
