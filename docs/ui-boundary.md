# UI 邊界

Thought Atlas Core 不是 hosted UI repo。React / Vite prototype 已移到 `prototypes/web-shell/`，只能當作過去探索互動模型的參考。

## Core 不負責

- 不做 production web shell
- 不做 Firebase Hosting
- 不做 graph visualization
- 不做登入、分享、同步或多人協作
- 不做漂亮 dashboard

## 允許的 UI 形式

短期只允許以下形式存在：

- `prototypes/` 裡的封存 prototype
- 文件中的資料流程圖
- CLI 輸出的文字摘要
- reports 裡的人類可讀 Markdown

任何新 UI 想法都必須先證明它不會污染 core pipeline。資料契約穩定前，不應投入 UI improvement。

## 未來可能

未來如果需要正式 UI，應該另開 repo 或至少獨立 app package。Core repo 只提供 graph JSON、schemas、examples 和 CLI contract。
