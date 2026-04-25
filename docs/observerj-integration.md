# ObserverJ 整合

ObserverJ 若要接入 Thought Atlas Core，角色應該是來源觀察者與事件輸入者，不是 graph 的直接寫入者。

## 可能責任

- 觀察本地資料夾或 repo 狀態變化
- 把新 Markdown、STATE.md、研究筆記放進 `sources/inbox/`
- 建立 source manifest
- 觸發 validation script
- 通知 Jarvis 有新來源需要 digest

## 不應負責

ObserverJ 不應直接修改 `graph/graph.json`。Graph mutation 應該經過 digest 和 graph patch，保留可審查的中間檔。

## 整合邊界

ObserverJ 可以把事件寫成 source：

```text
sources/inbox/observerj-YYYY-MM-DD-event.md
```

接著由 Jarvis 產生：

```text
digests/observerj-YYYY-MM-DD-event.digest.json
graph_patches/observerj-YYYY-MM-DD-event.patch.json
```

最後才套用到 `graph/graph.json`。

## 原則

ObserverJ 提供觀察，Thought Atlas Core 提供資料契約，Jarvis 負責判斷與套用。這樣可以避免 background watcher 直接污染長期思想圖譜。
