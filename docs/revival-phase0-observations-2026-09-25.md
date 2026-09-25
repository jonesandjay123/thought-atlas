# Revival Phase 0 Observations — 2026-09-25

This document records what actually happened when the two gold-standard sources were ingested through the existing v0 contract, so the next session can design scoring against real graph data instead of theory.

No schema, validator, UI, or Firestore change was made in this pass.

## Sources ingested

| source_id | upstream | content_hash |
| --- | --- | --- |
| `ai-selection-jev-play-the-ball-2026-09-21` | `jonesandjay123/thinking_with_ai` `conversations/ai-selection-jev-play-the-ball-2026-09-21/README.md` @ `a613104` | `sha256:6100b3dd…` |
| `ai-irreplaceability-lived-experience-2026-09-25` | `jonesandjay123/thinking_with_ai` `conversations/ai-irreplaceability-lived-experience-2026-09-25/README.md` @ `a613104` | `sha256:b2d58a91…` |

- Each inbox file is a byte-identical copy of the upstream `README.md` (hash verified against the clone).
- Each upstream folder also has a `summary.md`, which condenses the README. It was read but not ingested, to avoid double-counting the same text.
- Pipeline used: `create-source-manifest.mjs` → hand-curated digest + patch → `quality-gate.mjs` → `finalize-ingest.mjs` (strict mode, no upsert) → `generate-ingest-report.mjs`.
- Quality gate: 0 errors, 0 warnings for both sources.

## Graph counts

| | nodes | edges | connected components | largest component | isolated nodes |
| --- | --- | --- | --- | --- | --- |
| before (April snapshot) | 76 | 62 | 17 | 31 | 4 |
| after | 92 | 93 | 11 | 65 | 2 |

- No existing node or edge was modified or removed. All 76 old nodes and 62 old edges are byte-identical after the ingest.
- Integrity checks passed: no duplicate node or edge IDs, no dangling edges, no self-loops, and no parallel edges. Every source ref points to a registered source path with a valid line range. Every new quote is a verbatim substring of its cited range.

## New nodes (16)

Source A — `ai-selection-jev-play-the-ball-2026-09-21`

| id | kind | title |
| --- | --- | --- |
| `ai-capability-stack-node-to-selection` | pattern | AI 能力正從 Node → Edge → Graph 一路往下吃進 Selection |
| `what-humans-keep-when-ai-selects` | question | 當 AI 也會連線、建圖、加權、推薦，人還要保留什麼？ |
| `ai-recommendation-is-not-commitment` | decision | AI 可以推薦最優選項，但不能替人認領人生 |
| `choice-transforms-the-chooser` | claim | 選擇會改寫做選擇的人，人生不是固定 utility function 上的 argmax |
| `direction-stable-path-fluid` | decision | 方向穩定，路徑流動 |
| `play-the-ball-when-it-comes` | pattern | 有球來就打：把規劃從固定路線改成維持可回應性 |
| `present-is-not-future-consumable` | claim | 當下不是未來的耗材 |
| `jones-version-lineage-selection-patch` | pattern | Jones 1.0 → 4.0 自我探索序列與 2026-09-21 Selection Patch |

Source B — `ai-irreplaceability-lived-experience-2026-09-25`

| id | kind | title |
| --- | --- | --- |
| `irreplaceability-is-unstable-self-worth-foundation` | claim | 把自我價值建立在不可取代性上，在 AI 時代是不穩的地基 |
| `worth-doing-without-being-the-only-one` | claim | 一件事情值得做，不必因為只有你做得到 |
| `artifact-commodified-experience-not-voided` | claim | 成果可以被商品化；經歷不會被追溯作廢 |
| `scarcity-moves-to-taste-intent-experience` | claim | 當 execution 趨近免費，稀缺性上移到 taste、curiosity、intent 與值得活過的經歷 |
| `creation-as-lived-activity-rises` | claim | AI 讓作為商品的技能貶值，讓作為活動的創造升值 |
| `ambition-redirected-to-exploration` | decision | 不是躺平：把野心從成為不可取代的人轉向探索這一生能走到哪裡 |
| `outer-inner-principle-pair` | pattern | 一外一內：對世界有球來就打，對自己不必證明不可取代 |
| `do-not-miss-the-life-you-want-to-live` | decision | 不必成為不可取代的人；只要不要錯過自己真正想活的人生 |

Curation choices:

- JEV is not its own node. It is a tool/project, not a thought, and appears inside `ai-capability-stack-node-to-selection` and `what-humans-keep-when-ai-selects`.
- Source B's sections 5 (creation as commodity vs activity) and 6 (skill ↓ / creation ↑) were merged into `creation-as-lived-activity-rises` to avoid two near-duplicate nodes.
- The diagnosis (`irreplaceability-is-unstable-self-worth-foundation`, a claim) is kept separate from the durable line (`do-not-miss-the-life-you-want-to-live`, a decision). Otherwise "don't aim to be irreplaceable" would appear twice.

## New edges (31)

- 15 edges stay within a single source (7 in A, 8 in B).
- 5 edges connect A ↔ B:

| edge | relation | weight | note |
| --- | --- | --- | --- |
| `play-the-ball-when-it-comes` → `outer-inner-principle-pair` | supports | 0.90 | Source B explicitly names A's principle as the outer half |
| `ai-capability-stack-node-to-selection` → `scarcity-moves-to-taste-intent-experience` | extends | 0.86 | B quotes A's stack and adds a layer |
| `ai-recommendation-is-not-commitment` → `scarcity-moves-to-taste-intent-experience` | extends | 0.82 | Near-identical phrasing across 4 days |
| `present-is-not-future-consumable` → `artifact-commodified-experience-not-voided` | extends | 0.88 | A side line on 9/21 becomes B's central claim |
| `play-the-ball-when-it-comes` → `irreplaceability-is-unstable-self-worth-foundation` | resonates_with | 0.66 | Precursor line in A, not cited by B |

- 12 edges connect new nodes to existing March/April concepts. Each cites both the new source and the existing node's own evidence:

| new node | relation | existing node | weight |
| --- | --- | --- | --- |
| `choice-transforms-the-chooser` | resonates_with | `direction-too-many-commitment-gap` (Ikigai) | 0.76 |
| `direction-stable-path-fluid` | resonates_with | `playable-life-system-prototype` (Ikigai) | 0.72 |
| `ai-era-compresses-workflows-into-agents` (Rubik's) | extends | `ai-capability-stack-node-to-selection` | 0.74 |
| `human-computer-hybrid-optimization-beats-pure-optimality` (Rubik's) | extends | `ai-recommendation-is-not-commitment` | 0.70 |
| `blind-assist-and-polymarket-share-decision-augmentation` (Breakfast) | resonates_with | `ai-capability-stack-node-to-selection` | 0.60 |
| `irreplaceability-is-unstable-self-worth-foundation` | resonates_with | `comparison-awakens-happiness` (Original) | 0.78 |
| `irreplaceability-is-unstable-self-worth-foundation` | contrasts | `dimension-reduction-means-ai-compresses-traditional-knowhow` (Human needs) | 0.70 |
| `worth-doing-without-being-the-only-one` | extends | `devotion-three-sources` (Original) | 0.76 |
| `creation-as-lived-activity-rises` | supports | `jones-intrinsic-creator-profile` (Original) | 0.80 |
| `artifact-commodified-experience-not-voided` | contrasts | `ai-forge-not-final-vehicle` (Original) | 0.68 |
| `ambition-redirected-to-exploration` | resonates_with | `process-oriented-entrepreneurship-fit` (Ikigai) | 0.74 |
| `ambition-redirected-to-exploration` | extends | `ai-as-natural-leverage` (Ikigai) | 0.66 |

Effect on structure: the September pair acted as a bridge. Before the ingest, the Original (4/11), Ikigai (4/25), Codex, and Rubik's clusters were only partly joined. Afterwards the largest component holds nodes from 8 of 11 sources, and components dropped from 17 to 11.

## Semantic weight ≠ personal importance: concrete cases from this graph

1. **The most central node is a checklist hub.** `codex-three-core-questions` has the highest degree in the whole graph (7). That comes from one validation checklist fanning out into sub-tests, not from recurring importance to Jones. Degree and centrality measure how a source was decomposed, not how much Jones cares.
2. **The line Jones cares most about is structurally modest.** `do-not-miss-the-life-you-want-to-live` is the source's own "durable takeaway". It is formatted as `> ## **…**` (the only heading-in-blockquote in either file), repeated in `summary.md`, and echoed in the conversation title. Yet it has degree 3 and ranks 38th of 92 on betweenness. It is a conclusion, so it naturally sits at a leaf.
3. **The highest weight means near-identity, not interest.** `direction-stable-path-fluid` → `play-the-ball-when-it-comes` (0.92) is almost definitional: the source fuses them in one sentence. A high `weight` here signals redundancy or tight coupling. It should never be read as "Jones cares about this pair more".
4. **A weak semantic edge touches a highly salient topic.** `blind-assist-…-decision-augmentation` → `ai-capability-stack-node-to-selection` is weight 0.60, the lowest new edge, and marked as curator-inferred. JEV itself is clearly a live interest: there is a dedicated research note `reports/2026-09-19-jev-research.md` upstream, and it triggered a whole conversation two days later. That salience is attention evidence, and no edge weight captures it.
5. **Contrast edges carry evolution, not strength.** Two `contrasts` edges have moderate weight (0.68 / 0.70):
   - `artifact-commodified-experience-not-voided` ↔ `ai-forge-not-final-vehicle`. In April, the packaged artifact is what lasts. In September, the artifact is what gets commodified.
   - `irreplaceability-…` ↔ `dimension-reduction-…`. In March, AI compressing know-how is a market opportunity. In September, it is a threat to scarcity-based identity.

   These are among the most informative edges for a dashboard question like "how has Jones's thinking changed?", yet weight ranks them low.

## Observations that should inform the scoring schema

### Time

- **There is no conversation date anywhere in the contract.** Nodes and edges carry no timestamps. The only time on a source is `captured_at`, which records ingest time: both new sources show 2026-09-25, although A happened on 09-21, and Rubik's was captured 04-27 for a 04-26 conversation. Today the real date lives only inside `source_id` and title strings. A bulk backfill would collapse months of history onto its ingest date, which would make `recency_score` and `recurrence_score` meaningless. The first schema change should probably add something like `occurred_at` / `source_date` to the source manifest, distinct from `captured_at`.
- **Old nodes were reactivated.** Five months after creation, `jones-intrinsic-creator-profile`, `comparison-awakens-happiness`, `direction-too-many-commitment-gap`, `devotion-three-sources` and `ai-forge-not-final-vehicle` all gained new evidence edges. Recency should therefore be computed from the node's latest evidence (latest source touching it, directly or via an edge), not from its creation date.

### Recurrence

- **Continuation vs independent recurrence.** "經歷不會被追溯作廢" appears first as a side line in A (line 111), then as B's central claim four days later. B explicitly says it continues A. That is real recurrence, but it is the same thread. `recurrence_score` should discount explicit continuations and weight recurrences that are months apart and come from independent sources more heavily. Recurrence via long-range edges (April ↔ September) is the stronger signal.
- **Node-vs-ref policy decides whether recurrence is countable.** `ai-recommendation-is-not-commitment` (9/21: "由自己決定哪一段人生值得親自走過") and `scarcity-moves-to-taste-intent-experience` (9/25: "哪一段經歷值得我親自活過") are close restatements. I kept them as two nodes joined by an `extends` edge because B adds real content. But if recurring ideas become new nodes, recurrence is spread across neighbours. If they are merged via `--upsert` (adding source refs to the existing node), recurrence becomes a simple count of refs per node. The recurrence formula depends on which policy is chosen, so decide it before backfill.

### Attention, resonance and provenance

- **Attention evidence exists outside the graph and is cheap to derive.** These signals are behavioral and are not model judgment:
  - the upstream repo packages a conversation as README + summary, which is an explicit save;
  - it promotes some ideas to `principles/` (Playable Life System);
  - later conversations cite earlier ones (B cites A);
  - self-model series are versioned (Jones 1.0 → 4.0).

  `attention_score` could start from these structural facts before any JEV input.
- **Author emphasis is a distinct, observable signal.** Sections titled "Durable Takeaway", heading-level bold, and restatement in `summary.md` mark what Jones and GPT chose to keep. This is closer to resonance than to weight, and it is not JEV judgment. It could be one explainable input to `resonance_score`.
- **Edge provenance is invisible in the schema.** Some edges are stated by the source (B explicitly names A's principle as "一外一內"). Others are curator inference (the decision-augmentation resonance). Right now the only place to record which is which is the free-text `rationale`. Bridge and betweenness views are sensitive to this:
  - After this ingest, `ai-capability-stack-node-to-selection` (#2), `direction-stable-path-fluid` (#5) and `worth-doing-without-being-the-only-one` (#7) jumped into the top betweenness ranks. That happened partly because one curator cross-linked them carefully in one session.
  - An `evidence_type` such as `source_stated | cross_source_inferred` would let the dashboard keep curator effort separate from Jones's actual recurring bridges.

### Existing data quality

- **17 of the 62 pre-existing edges carry identical `weight: 0.82 / confidence: 0.93`.** They come from the five-source batch ingest on 2026-04-25, and those values are template defaults, not calibrated judgments. Any formula or visualization that uses `weight` should treat these as uncalibrated or re-grade them first.
- **`confidence` is not importance either.** All new nodes are 0.88–0.97 because the text is explicit. Confidence measures extraction faithfulness, and it should stay that way.
- **31 of the 123 pre-existing `quote` fields are not verbatim.** They are condensed or compound paraphrases, for example `方向太多 → 不敢 commit` stored as a single string across several source lines. The line ranges are valid, so provenance is intact, but the contract should decide whether `quote` means verbatim. All quotes added tonight are verbatim. For the one cross-source edge whose existing endpoint had a non-verbatim quote, I cited a fresh verbatim quote from the same Ikigai range instead of copying it.

## Ontology ambiguities found during ingestion

- **`decision` covers two different things.** It holds life principles (`direction-stable-path-fluid`, `do-not-miss-the-life-you-want-to-live`) and product or engineering decisions (`animal-shogi-v2-should-start-with-minimax-baseline`). A `principle` kind, or at least a tag convention, would help dashboard questions like "which ideas became operating principles?".
- **Evolving views have no relation of their own.** `contrasts` is currently used for "Jones's view evolved" (April → September), which is different from two ideas that simply oppose each other. A future `revises` / `evolves_from` relation could make theme evolution queryable.
- **Composite nodes vs edges.** `outer-inner-principle-pair` encodes a pairing that edges could also express. I kept it because the source explicitly names the pair ("一外一內") as a concept. The contract should decide when a named grouping earns a node.
- **Lineage and meta nodes point at un-ingested sources.** `jones-version-lineage-selection-patch` summarizes Jones 1.0–4.0 from A's own recap; those conversations exist upstream but are not in the Atlas. When they are backfilled, they should attach to this node rather than create a parallel lineage node.
- **Direction convention for question → answer.** I followed the existing precedent (`labor-devotion-question` —extends→ `devotion-three-sources`), but `extends` from a question to its answer reads oddly. A `answered_by` relation, or a documented convention, would remove guesswork for other agents.
- **Entities vs thoughts.** JEV, Playable Life System, and Jarvis are projects or tools that many thoughts reference. The graph currently has no entity layer, so they appear either as prose inside bodies or as full `pattern` nodes. This matters for dashboard questions like "which ideas became projects?".
- **Source granularity and origin.** The upstream unit is a folder (README + summary), but the contract holds one file per source. `origin` has no fields for repo, path, or commit, so upstream provenance currently lives in manifest `notes`, with `origin.channel: github`.

## Suggested inputs for the next session's scoring draft

- Keep `weight` semantic only, and stop reading degree or centrality as interest.
- Add a conversation date (`occurred_at`) before any scoring or backfill.
- Derive `attention_score` from structural behavior first: packaging, promotion to principles, citation by later sources, versioned series.
- Derive `recurrence_score` from distinct independent sources across time windows, discounting explicit continuations. Decide the node-vs-ref merge policy first.
- Treat JEV as one optional ranking input to `resonance_score` alongside author-emphasis markers, never as the sole source.
- Consider edge `evidence_type` so bridge views separate source-stated links from curator inference.
