# Thought Atlas Scoring & Temporal Semantics Contract — 2026-09-25

**Status:** design contract (spec pass only — no schema, graph, or code changes).
**Purpose:** settle the semantics of time, recurrence, attention, resonance, recency, and interest *before* anyone changes schemas or writes scoring code.
**Applies to:** the next implementation pass on `thought-atlas` core. `thought-atlas-ui` is out of scope except as a consumer of derived scores.

**Grounding:** every semantic decision below was checked against the live graph at commit `9c03bf9` (92 nodes / 93 edges, after Revival Phase 0). See §8 for the independent verification log.

---

## 1. Definitions

### 1.1 The four things that must never be confused

| Term | Meaning | Where it lives | What it is NOT |
|---|---|---|---|
| **Semantic relationship strength** (`weight` on edges) | How tightly two thoughts are conceptually coupled | edge field, 0–1 | Not how much Jones cares |
| **Confidence** (`confidence` on nodes/edges) | How faithfully the node/edge was extracted from its cited source text | node/edge field, 0–1 | Not importance, not truth |
| **Graph centrality** (degree, betweenness, etc.) | Structural position produced by how sources were decomposed and linked | computed | Not personal interest |
| **Personal importance** (the scoring family below) | How alive an idea is in Jones's thinking | derived scores | Not any of the above |

### 1.2 Time: two clocks

- **`occurred_at`** — when the thought, conversation, or event *actually happened*. Lives on the **source manifest**. This is the clock all scoring uses.
- **`captured_at`** — when the source *entered the Atlas* (ingest time). Lives on the source manifest. Used only for pipeline bookkeeping (dedup, ordering of ingest runs, audit). **Must never feed a scoring formula.**

Rationale: both Phase 0 sources show `captured_at = 2026-09-25`, but source A is a 2026-09-21 conversation. A bulk backfill would collapse months of history onto one ingest date and make `recency_score` / `recurrence_score` meaningless.

**Precision model.** `occurred_at` is paired with `occurred_precision`:

```text
exact       # 2026-09-21 — a dated conversation
month       # 2026-09    — only the month is known
year        # 2026       — only the year is known
approximate # circa 2026-09 — curator's best estimate, flagged
unknown     # no date recoverable
timeless    # the document has no meaningful event date (a manual, a principle list)
```

Scoring rules per precision: `exact`/`month`/`year` participate normally (compared at the coarsest common precision). `approximate` participates but is flagged in any UI display. `unknown` is excluded from time-windowed scores (it can still carry attention/resonance evidence). `timeless` sources are excluded from recency decay entirely — they are evergreen by declaration, not by neglect.

**Which time each future score uses** (§3–§6 detail the scores; this is the summary):

| Score | Time anchor |
|---|---|
| `recurrence_score` | `occurred_at` of the *distinct independent sources* in the node's recurrence group |
| `recency_score` | `last_direct_evidence_at` — latest `occurred_at` among the node's **own** `source_refs` |
| `attention_score` | event dates where behavior happened (mostly = `occurred_at` of the evidencing sources; promotion events use their own date) |
| `resonance_score` | timeless by design — resonance is about durable alignment, not freshness. Time enters only via recurrence/attention inputs, never as decay |

**Node activity timeline (derived, not stored).** For each node, derive a sorted list of `(occurred_at, occurred_precision, source_id, evidence_kind)` from its `source_refs` → source manifests. `evidence_kind` is `direct` (the node's own refs) or `edge_mediated` (a source that touches the node only through an edge's `source_refs`). Recency uses the direct timeline. The edge-mediated timeline is shown as a "reactivated" indicator, discounted and labeled (see §6).

**Which sources get which treatment:**

- *Conversations* → `occurred_at` = conversation date (usually in the folder name / README header).
- *Reports* → `occurred_at` = report date or the period it covers (use `approximate` if the latter).
- *Project docs* → `occurred_at` = last substantive edit date if known, else `approximate`.
- *Backfilled historical material* → `occurred_at` = original date, `captured_at` = backfill date; the gap is expected and must be visible.
- *Timeless documents* (manuals, principle lists) → `occurred_at = null`, `occurred_precision = timeless`.

### 1.3 Recurrence

**Recurrence** = the same idea (or its recognizable evolution) appearing across **independent sources separated in time**.

An *independent source* for recurrence purposes satisfies all three:

1. different `source_id` from the other evidencing sources;
2. `occurred_at` outside the **continuation window** of the others (provisional: 30 days — tunable, but must be a single global parameter, not per-node judgment);
3. not an explicitly declared continuation ("this continues our 9/21 conversation" collapses the pair into one thread).

**The six cases, decided:**

| Case | Counts as recurrence? | Treatment |
|---|---|---|
| Same conversation repeats an idea | No | One source, one node; extra mentions are not evidence |
| Direct continuation 4 days later, explicitly citing the earlier thought (B cites A) | Weak — same thread | The pair counts as **one** independent cluster, not two |
| Independent recurrence months later, no citation | Yes — strong | Each source is its own cluster |
| Recurrence in another domain | Yes | Usually a new node + `extends`/`resonates_with`; the *family* recurs |
| Later source explicitly cites the earlier thought | Yes for the *cited* thought | The citation is evidence the old thought is alive; the citing node earns its own recurrence separately |
| Genuinely evolved version of an older thought | Yes — evolution | New node + `revises` (new relation, §7); the lineage recurs |

**Same node vs new node — the merge policy.** This decision determines whether recurrence is countable, so it is settled here, not left to curator taste:

- **Same node + new `source_ref` (merge, `--upsert`)** when the restatement adds no new claim: near-verbatim restatement, same question asked again, same principle re-asserted. The node's recurrence then counts sources directly.
- **New node + `extends` / `resonates_with` / `revises`** when the restatement adds real content, shifts domain, changes the claim, or inverts it. Recurrence is then measured over the node's **recurrence group**: the node plus nodes reachable via `extends`, `answered_by`, and `revises` edges in either direction, deduplicated to independent source clusters.

The curator's test: *"If I merged these, would any source_ref's quote stop being a faithful gloss of the node body?"* If yes → new node. (Example: `creation-as-lived-activity-rises` correctly merged two near-duplicate sections in Phase 0 — merging was right there. `ai-recommendation-is-not-commitment` → `scarcity-moves-to-taste-intent-experience` correctly stayed split — B adds the taste/curiosity/intent layer.)

`direction-stable-path-fluid` → `play-the-ball-when-it-comes` (weight 0.92, "almost definitional") is the boundary case: keep split (a *decision* vs a *pattern*, reused differently), but any edge with weight ≥ 0.90 must carry a curator note justifying the split. Near-identity edges are redundancy flags, not interest signals.

### 1.4 Attention

**Attention** = *behavioral, observable evidence that Jones invested effort or made a consequential choice around an idea.* It is never model opinion.

**Useful signals (in priority order):**

1. **Explicit ingest/save instruction** — Jones saying "收進 Thought Atlas / ingest" about a source is itself attention evidence for that source's nodes. This is the cheapest, most reliable signal in the system.
2. **Promotion into durable structures** — an idea promoted to `principles/` upstream, into Jones-Manual, or into a versioned self-model series (Jones 1.0 → 4.0). Promotion is a deliberate act.
3. **Becoming a project** — the idea spawned or anchored a real project (JEV, Playable Life System). Project-hood is the strongest attention signal there is.
4. **Citation by later, independent sources** — B citing A unprompted means A stayed alive in Jones's head for 4+ days.
5. **Recurrence across independent dates** — overlaps with recurrence_score as an *input*; attention counts the behavior, recurrence counts the pattern.
6. **Follow-up depth** — a second conversation going deeper (not just repeating) on the same idea.
7. **Repeated edits / expansions** — the same source file revised across versions upstream.

**Signals that risk overfitting — excluded or discounted:**

- Restatement in an auto-generated `summary.md` (derived artifact, not new behavior).
- Checklist fan-out structure (`codex-three-core-questions` degree 7 comes from one checklist decomposed into sub-tests — decomposition effort, not Jones's attention to the hub).
- Tag count, body length, quote count.
- Curator edge count — how hard the curator cross-linked is *curator* attention, not Jones's. (This is why `ai-capability-stack-node-to-selection` sits at betweenness rank #2: careful curation in one session, not necessarily Jones's bridge concept.)

No final numeric formula tonight. Provisional shape: attention is a saturating count of *distinct behavioral event types* (not raw event counts) — the third "explicit save" adds less than the first "became a project".

### 1.5 Resonance

**Resonance** = how strongly a concept aligns with Jones's *durable values and concerns*, as evidenced by **Jones's own emphasis** — not by what the graph structure says, not by what any model judges.

How it differs from its neighbors:

- vs **attention**: attention is *what Jones did* (behavior); resonance is *what Jones marked as mattering* (emphasis). An idea can have high attention (he spent weeks on it) but modest resonance (it was instrumental), or high resonance (a life principle) with low attention (stated once, never revisited).
- vs **recurrence**: recurrence is *that it returned*; resonance is *why it would be worth returning to*.
- vs **edge weight**: weight is about the *relationship between two thoughts*; resonance is a property of *one thought's* standing with Jones.
- vs **confidence**: confidence is *extraction faithfulness*; a perfectly extracted triviality has confidence 0.97 and resonance ~0.

**Observable author-emphasis signals** (all checkable in source text, none requiring model judgment):

1. "Durable Takeaway" / equivalent takeaway sections.
2. Heading-level or blockquote-level typographic emphasis (e.g., the only heading-in-blockquote in either Phase 0 file marks `do-not-miss-the-life-you-want-to-live`).
3. Conversation title echo — the idea appears in the title.
4. Restatement in the author's own summary (upstream `summary.md`).
5. Explicit importance statements ("this is important", "不要錯過…").
6. Inclusion in Jones-Manual / `principles/`.
7. Position as a conclusion the whole source converges on (leaf position is *evidence for* resonance, not against it — conclusions sit at leaves).

**AI/JEV judgment:** JEV (or Opus/Muse) may contribute *one* labeled input to resonance — a "second opinion" score with its rationale — but it must be **capped** (provisional: ≤ 30% of the resonance input weight), **labeled** (every resonance display shows the JEV contribution separately), and **never decisive**: removing the JEV input must not move any node across a resonance tier boundary on the gold-standard set (acceptance test, §9). Behavioral/emphasis evidence is the independent backbone.

### 1.6 Recency

**Recency** = current salience of a thought, computed from time — not authored.

Settled: recency belongs to **last direct evidence time** (`last_direct_evidence_at`), not creation time. A thought created in April but strongly resurfacing in September must not look old.

Mechanics:

- Primary: `recency_score = decay(now − last_direct_evidence_at)`. Decay shape TBD in implementation; the contract fixes only that it is monotone decreasing, bounded [0,1], and has a **floor for high-resonance nodes** — durable principles do not decay to zero just because Jones hasn't mentioned them lately. (Forgetting a principle is not the same as outgrowing it.)
- Reactivation: when a node gains edge-mediated evidence (a new source touches it only via an edge), surface a separate `reactivated_at` indicator. It does not move `last_direct_evidence_at`, but the UI may show "resurfaced via *source*" — this is exactly what happened to `jones-intrinsic-creator-profile`, `comparison-awakens-happiness`, `direction-too-many-commitment-gap`, `devotion-three-sources`, and `ai-forge-not-final-vehicle` in Phase 0.
- Timeless sources (§1.2) are exempt from decay.

### 1.7 Interest score

**`interest_score` = "how alive is this idea in Jones's thinking right now"** — the single display signal for node sizing in the Atlas view. It is *derived*, never authored, and never the only number shown.

- **Intended meaning:** current aliveness = durable mattering × invested behavior × return pattern × freshness.
- **May use:** `resonance_score`, `attention_score`, `recurrence_score`, `recency_score` — and nothing else.
- **Must NOT use:** edge `weight`, degree/betweenness/any centrality, `confidence`, raw JEV judgment (only via its capped resonance contribution), curator effort proxies (edge count), tag/body/quote counts.
- **Stored or derived:** derived at query/build time from stored components. The repo may materialize a snapshot per release for the UI, but the snapshot must ship with its component breakdown and input versions.
- **UI exposure:** the UI must expose the four components alongside (not behind) the single number. One opaque number is a product bug: Jones should be able to see *why* the Atlas thinks something is alive — e.g. "high resonance, dormant 4 months" vs "low resonance, very active this week" are different truths.
- **No final formula tonight.** Provisional shape (for calibration experiments only):

```text
interest = g(resonance, attention, recurrence, recency)
```

with invariants: monotone non-decreasing in each input; bounded [0,1]; `recency → 0` attenuates but does not zero out high resonance (the floor from §1.6); `attention = 0` with high resonance is allowed (a stated-but-unacted principle — display it as such, don't suppress it).

---

## 2. Invariants

These hold across every future implementation. If an implementation violates one, the implementation is wrong, not the contract.

1. **`weight` is semantic only.** No formula, view, or ranking may treat edge weight as personal importance.
2. **Centrality is not interest.** Degree/betweenness may describe graph *shape*; they may never rank what Jones cares about. Any view that sizes or orders nodes by "importance" must use `interest_score` or its components.
3. **Confidence is extraction faithfulness.** It gates *trust in the data*, never *importance of the thought*.
4. **Every personal-importance signal has at least one behavioral or author-emphasis input.** No score may be computed from model judgment alone.
5. **Model judgment is advisory, capped, and labeled.** JEV/Opus/Muse inputs to resonance carry their weight visibly and can never be the sole decider (§1.5).
6. **Two clocks, one for scoring.** `occurred_at` feeds scores; `captured_at` feeds bookkeeping. Mixing them is a data bug.
7. **Recurrence requires independence.** Same-source repetition and explicit continuations do not count as independent recurrence (§1.3).
8. **Scores are derived and explainable.** Components are visible; snapshots carry input versions.
9. **Legacy data stays marked.** Template defaults and paraphrase quotes are labeled, never silently re-graded (§5).
10. **Provenance labels every personal-importance input.** If the dashboard can't say *why* it believes something, it shouldn't display it as belief.

---

## 3. Worked examples

All node/edge facts below were read from `graph/graph.json` at `9c03bf9` (see §8).

### 3.1 `do-not-miss-the-life-you-want-to-live` — high importance, low centrality

- kind `decision`, confidence 0.97, **degree 3**, betweenness rank **38/92**.
- Yet: it is source B's "Durable Takeaway", the only heading-in-blockquote in either file, echoed in the conversation title and the upstream `summary.md`, and tagged `durable-principle`.
- Under this contract: **resonance high** (emphasis signals 1, 2, 3, 4, 7 all fire), attention moderate (one explicit conversation + citation of A), recurrence low so far (single source — correctly low; it must *earn* recurrence over months), recency fresh.
- Expected outcome: `interest_score` ranks it **above** `codex-three-core-questions` despite degree 3 vs 7. If any future formula fails this case, the formula is wrong. (Acceptance test A1.)

### 3.2 `play-the-ball-when-it-comes` — attention via continuation

- kind `pattern`, confidence 0.96. Source A's outer principle; explicitly named by B four days later as the "outer" half of `outer-inner-principle-pair` (`supports`, 0.90, source-stated).
- Under this contract: the A→B pair is a **continuation**, not independent recurrence (explicit citation, 4-day gap < 30-day window) — it counts as one cluster. But it *is* attention evidence (signal 4: cited by a later source) and it feeds the lineage that later becomes Jones's 1.0→4.0 self-model.
- The `resonates_with` 0.66 edge to `irreplaceability-is-unstable-self-worth-foundation` ("precursor line in A, not cited by B") is curator-inferred — under §4 it would carry `evidence_type = cross_source_inferred`, and bridge views must be able to exclude it.

### 3.3 `direction-stable-path-fluid` — the near-identity boundary

- kind `decision`, confidence 0.97. Edge to `play-the-ball-when-it-comes`: `extends`, **0.92** — "almost definitional; the source fuses them in one sentence."
- Under this contract: weight 0.92 flags **near-duplicate**, never interest. The split is justified (decision vs pattern, different reuse), but the ≥ 0.90 rule (§1.3) requires the curator's split justification to be recorded. A future dedup review should re-examine this pair first.

### 3.4 `artifact-commodified-experience-not-voided` — evolution, not opposition

- kind `claim`. `contrasts` edge (0.68) to April's `ai-forge-not-final-vehicle`: in April the packaged artifact is what lasts; in September the artifact is what gets commodified. Jones's view *evolved*.
- Under this contract: this is not "two ideas oppose each other" — it is a view revision. The recommended `revises` relation (§7) exists for exactly this. Same for `irreplaceability-is-unstable-self-worth-foundation` → `dimension-reduction-means-ai-compresses-traditional-knowhow` (`contrasts`, 0.70): March opportunity → September identity threat.
- These two edges are among the most informative for "how has Jones's thinking changed?" — and weight ranks them low. Correct: weight was never supposed to rank informativeness.

### 3.5 `creation-as-lived-activity-rises` — correct merge

- kind `claim`. Phase 0 merged source B's sections 5 and 6 into one node rather than creating near-duplicates.
- Under this contract: textbook application of the merge policy — the restatement added no new claim. Its `supports` edge (0.80) to April's `jones-intrinsic-creator-profile` then correctly *reactivates* a 5-month-old node (edge-mediated evidence, §1.6).

### 3.6 `codex-three-core-questions` — the checklist hub anti-pattern

- Highest degree in the graph (**7**), betweenness rank 11 — both from one validation checklist fanning out into sub-tests.
- Under this contract: centrality here measures *decomposition granularity*, not Jones's interest. Its resonance inputs are weak (no durable-takeaway emphasis, no promotion, no recurrence), so `interest_score` must rank it **below** `do-not-miss-the-life-you-want-to-live`. Any "top ideas" view driven by degree would crown a checklist — this is the canonical example of why invariant 2 exists.

### 3.7 April Playable Life / Ikigai nodes — reactivation done right

- `playable-life-system-prototype` (Ikigai): degree 6, betweenness 3 — structurally prominent *and* genuinely load-bearing (promoted to `principles/` upstream = attention signal 2). Structure and behavior agree here; the contract doesn't distrust centrality, it just refuses to *derive* interest from it.
- `direction-too-many-commitment-gap`, `devotion-three-sources`, `comparison-awakens-happiness`, `ai-forge-not-final-vehicle`: all gained September edges. Under §1.6 these are `reactivated_at` events on 2026-09-21/25, while their `last_direct_evidence_at` stays in April — the timeline shows both, honestly.

---

## 4. Edge provenance

Phase 0 finding: source-stated edges and curator-inferred edges are indistinguishable except in free-text `rationale`. Adopted taxonomy (field `evidence_type` on edges, next implementation pass — **not tonight**):

| Value | Meaning | Example from this graph |
|---|---|---|
| `source_stated` | The source text explicitly asserts the link | `play-the-ball-when-it-comes` → `outer-inner-principle-pair` (B names A's principle as the outer half) |
| `cross_source_inferred` | Curator/agent inferred the link across sources; neither source states it | `blind-assist-…` → `ai-capability-stack-node-to-selection` (0.60, marked curator-inferred) |
| `within_source_inferred` | Inferred within a single source's text | most Phase 0 A-internal / B-internal edges |
| `behaviorally_observed` | Jones's own behavior asserts the link (explicit "this continues X", paired ingest) | (none yet — reserved) |
| `human_confirmed` | Jones reviewed and confirmed the edge | (none yet — reserved) |

Effects, settled:

- **Bridge-thought rankings** must be computable on the `source_stated` + `human_confirmed` subgraph alone, with the full-graph version shown as a separate, labeled view. (After Phase 0, `ai-capability-stack-node-to-selection` hit betweenness #2 partly through careful curation — the dashboard must not present curator effort as Jones's bridge concept without saying so.)
- **Graph centrality** displays carry a provenance-mix badge: what fraction of the traversed edges are inferred.
- **Trust:** `source_stated` > `human_confirmed` > `behaviorally_observed` > `within_source_inferred` > `cross_source_inferred` for any "Jones believes X relates to Y" claim. Inferred edges are hypotheses with rationales, not facts.
- **Future automatic ingestion:** agents may propose `cross_source_inferred` / `within_source_inferred` edges freely, but may **never** author `source_stated` (only the source text can do that) or `human_confirmed` (only Jones). An auto-ingested edge asserting `source_stated` fails validation.

---

## 5. Legacy calibration

Phase 0 findings: 17 of the 62 April edges share template values (`weight: 0.82`, `confidence: 0.93`) from the 2026-04-25 batch ingest — uncalibrated defaults, not judgments. 31 of the 123 pre-existing `quote` fields are paraphrases, not verbatim.

Policy — **mark, don't rewrite**:

1. Add `calibration_status` to edges: `uncalibrated` (template/batch defaults) → `curated` (hand-set per edge) → `regraded` (reviewed later). The 17 template edges ship as `uncalibrated`. (Schema change next pass; no data rewrite tonight.)
2. `quote` means **verbatim** going forward. Legacy paraphrase quotes get `quote_fidelity: paraphrase` (mechanical audit where source files exist); new ingests must be verbatim — the quality gate already enforces this for new nodes.
3. **Migrate on touch:** when an old node/edge is re-touched by a new ingest, the curator re-grades its weight/confidence and flips its status; untouched legacy stays as-is, labeled.
4. **Audit before visualization:** any dashboard view that uses `weight` (edge thickness) or `confidence` (edge opacity) must display calibration coverage ("17/93 edges uncalibrated") and offer an uncalibrated-excluded mode. No silent rendering of template values as judgments.

---

## 6. JEV's eventual role

**Useful (advisory, capped, labeled):**

- Ranking *candidate* durable thoughts from a digest (triage, not decision).
- Ranking *candidate* cross-source edges (proposal, not assertion).
- Resonance **second opinion** — one labeled input, ≤ 30% input weight, never tier-decisive (§1.5).
- Adjudicating duplicate / near-duplicate concept selection (which phrasing survives a merge).

**Dangerous (forbidden as authority):**

- "JEV says this topic is important, therefore it is important."
- Scoring attention (attention is behavioral by definition; a model cannot observe Jones's behavior better than the behavior log).
- Labeling backfill material without behavioral corroboration.
- Any path where removing behavioral inputs leaves JEV as the only signal.

**Proposed experiment (future, not tonight):** on a fixed candidate set (e.g., the next 20 digest items), collect four independent rankings — Opus judgment, Muse judgment, JEV judgment, behavioral-signal score — and measure agreement. Adopt JEV inputs only where they agree with behavior or add *explained* variance. Publish the agreement matrix in the repo before JEV touches any production score.

---

## 7. Recommended schema changes (NEXT implementation pass — not tonight)

Ordered by dependency. None of these are made in this pass.

1. **Source manifest: `occurred_at` + `occurred_precision`.** `captured_at` stays, semantics unchanged (ingest time). Backfill for all 11 existing sources.
2. **Edge: `evidence_type`** enum (§4). Label the 31 Phase 0 edges; default existing 62 to `within_source_inferred` pending review, except where rationale clearly shows otherwise.
3. **Edge: `calibration_status`** enum (§5). The 17 template edges → `uncalibrated`.
4. **Relations: add `revises` and `answered_by`.** Reclassify the two evolution `contrasts` edges (§3.4) to `revises`. Document the question→answer convention (`labor-devotion-question` —extends→ `devotion-three-sources` becomes `answered_by`).
5. **source_ref: `quote_fidelity`** (`verbatim` | `paraphrase`). Mechanical audit for legacy; gate enforces `verbatim` for new.
6. **Digest: optional `scoring_hints` object** — factual author-emphasis markers observed at digest time (`has_durable_takeaway`, `title_echo`, `heading_emphasis`, `explicit_importance_statement`). Hints are *observations*, not scores; scoring reads them later.
7. **Node kind: no new kind.** Keep the `durable-principle` **tag** as the canonical principle marker (already in use on `do-not-miss-the-life-you-want-to-live`); do not proliferate kinds.
8. **Derived (not stored): node activity timeline + `interest_score` components.** Spec the derivation in code; materialize snapshots only with input versions attached.

---

## 8. Independent verification of Phase 0 observations (2026-09-25)

Re-checked against `graph/graph.json` at `9c03bf9` with fresh scripts (not by re-reading the observations doc). All counts below are computed, not quoted.

**Agree (verified exactly):**

- 16 new nodes present, all IDs match; 31 edges touch new nodes (19 both-new + 12 new↔old).
- 17 of the 62 pre-existing edges carry `weight: 0.82 / confidence: 0.93` (template defaults).
- Nodes and edges carry no timestamps; manifest schema has `captured_at` (required) and no `occurred_at`; registry uses `first_seen_at`/`last_seen_at` (ingest times).
- Source A manifest: `captured_at = 2026-09-25T04:52:22` (ingest), actual conversation 2026-09-21 lives only in `notes` free text and the `source_id` string. `origin` has no repo/path/commit fields.
- `codex-three-core-questions` has the highest degree (7); `do-not-miss-the-life-you-want-to-live` has degree 3.
- Betweenness (Brandes, undirected, computed fresh): `do-not-miss…` rank 38/92; `ai-capability-stack-node-to-selection` #2; `direction-stable-path-fluid` #5; `worth-doing-without-being-the-only-one` #7.
- The 5-edge A↔B table and the 12-edge new↔old table match the graph exactly (endpoints, relations, weights).
- New node confidences span 0.88–0.97.
- Relations in use: `contrasts`, `depends_on`, `extends`, `resonates_with`, `supports`. Node kinds: `action`, `claim`, `decision`, `pattern`, `question`, `reference`.
- `finalize-ingest.mjs` supports `--upsert` (merge machinery exists; the *policy* for when to merge is what §1.3 now settles).
- No `occurred_at`/`source_date` anywhere in scripts or schemas.

**One correction (immaterial to design):** the observations doc says "15 edges stay within a single source (7 in A, 8 in B)". The graph contains **14** within-source edges among new nodes: **7 in A, 7 in B** (plus the 5 A↔B edges = 19 both-new). The 31-edge total is unaffected.

**Could not fully re-verify:** "31 of 123 pre-existing quote fields are paraphrases" — April source files are not in `sources/inbox/` or `sources/processed/` in this checkout, so verbatimness couldn't be mechanically re-checked. The *mechanism* (quotes live on `source_refs`; new quotes are verbatim per the quality gate) is confirmed. Recommend the mechanical audit in §7.5 settle the exact count.

---

## 9. Unresolved questions

1. **Continuation window length.** 30 days is provisional (§1.3). Needs calibration against real backfill data — too short and slow-burn threads split; too long and distinct seasons merge.
2. **Recency decay shape and the resonance floor.** The contract fixes monotonicity, bounds, and the floor's existence — not the curve. Calibrate on the gold-standard set before backfill.
3. **Attention event-type weights.** "Became a project" vs "was cited once" — relative weights need data, not armchair values. Start with rank-order only.
4. **The `interest` combination function.** Deliberately deferred until components are computed on real data (§1.7 invariants constrain the search space).
5. **Composite nodes** (`outer-inner-principle-pair`): when does a named grouping earn a node vs being expressed as edges? Current rule of thumb — "the source explicitly names the pairing as a concept" — worked in Phase 0 but isn't a contract yet. Needs 2–3 more cases before settling.
6. **Entity layer.** JEV / Playable Life System / Jarvis are projects many thoughts reference; currently prose or full nodes. Whether a lightweight entity layer is worth it is deferred until dashboard questions demand it.
7. **`revises` vs `contrasts` boundary.** §3.4 settles the two clear evolution cases; mixed cases (partial revision + genuine opposition) will need a convention.

---

## 10. Recommended migration order

1. Manifest `occurred_at`/`occurred_precision` + backfill dates for the 11 existing sources (blocks everything time-based).
2. Edge `evidence_type` + `calibration_status`; label Phase 0's 31 edges; mark the 17 template edges `uncalibrated`.
3. `quote_fidelity` mechanical audit.
4. Add `revises` / `answered_by`; reclassify the evolution edges; document conventions.
5. Implement derived activity timelines + `recency_score` on the gold-standard set.
6. Implement `attention_score` / `recurrence_score` / `resonance_score` derivations; calibrate against §3 examples.
7. `interest_score` derived view with component exposure; acceptance tests (§11).
8. Only then: backfill recent history (revival plan Phase 4).

## 11. Acceptance tests for the implementation pass

- **A1 (interest ≠ centrality):** `do-not-miss-the-life-you-want-to-live` (degree 3) ranks above `codex-three-core-questions` (degree 7) on `interest_score`.
- **A2 (weight ≠ importance):** the 0.92 `direction-stable-path-fluid` → `play-the-ball-when-it-comes` edge never surfaces in any "most important" view.
- **A3 (two clocks):** a source ingested 90 days after its conversation scores recency from `occurred_at`, not `captured_at`; a test ingest with a backdated `occurred_at` is covered.
- **A4 (recurrence independence):** restating an idea 5 times in one conversation adds 0 to `recurrence_score`; an explicit 4-day continuation adds 0 *independent clusters*; a 4-months-later independent source adds 1.
- **A5 (JEV cap):** removing the JEV input changes no node's resonance tier on the gold-standard set.
- **A6 (legacy honesty):** any weight-based view renders with calibration coverage shown; `uncalibrated`-excluded mode exists; the 17 template edges are excluded by default from bridge rankings.
- **A7 (provenance-labeled bridges):** bridge ranking is available on the `source_stated`+`human_confirmed` subgraph; its result is labeled as such and differs visibly from the full-graph ranking where curation drove the difference.
- **A8 (reactivation):** an April node gaining a September edge shows `reactivated_at` = September while `last_direct_evidence_at` stays April.
- **A9 (timeless exemption):** a `timeless` source's nodes do not decay in `recency_score`.
- **A10 (explainability):** every `interest_score` rendered in the UI can expand to its four components with their top contributing evidence.

---

*End of contract. Implementation begins next session — not tonight.*
