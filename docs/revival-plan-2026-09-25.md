# Thought Atlas Revival Plan — 2026-09-25

## Why revive now

Thought Atlas stopped at a sensible point in April 2026: the core ingest/data pipeline existed, the UI was usable, but the graph was still too small for a large "brain universe" visualization to be meaningfully informative.

That constraint has changed.

Current local graph:

- 76 nodes
- 62 edges
- last graph update: 2026-04-27

Since then, `thinking_with_ai`, `Jones-Manual`, project notes, agent work, JEV experiments, and recurring AI/philosophy discussions have accumulated enough durable material that a global graph can now become an analytical surface rather than a decorative one.

The revival goal is therefore **not** to rebuild the product or start with a prettier graph. It is to make the Atlas self-growing again, then add a second layer that distinguishes semantic relationship from Jones's actual attention and resonance.

---

## Product direction

Thought Atlas should become:

> **A self-growing map of Jones's ideas, interests, recurring themes, and conceptual bridges.**

The desired loop is:

```text
conversations / reports / projects / manuals
              ↓
        AI-assisted digest
              ↓
      durable thought nodes
              ↓
       weighted relations
              ↓
     attention / resonance
              ↓
       global atlas view
```

Jones should not become a graph data-entry clerk.

The system should be maintainable by GPT / Muse / Jarvis-style agents operating against a stable contract.

---

## Keep the repo boundaries

### `thought-atlas`

Canonical core:

- source ingestion
- digest
- node / edge graph
- scoring
- validation
- local source of truth
- optional Firestore mirror

### `thought-atlas-ui`

Read-only visualization:

- dashboard
- node / edge exploration
- theme views
- global graph
- trend / attention views

### `thinking-canvas`

Historical prototype only.

Do not restart it as the main product.

---

## Phase 0 — Gold-standard restart

Before schema changes or bulk ingestion, ingest a very small set of recent, high-signal sources manually and treat them as gold-standard examples.

Recommended first two:

1. `thinking_with_ai/conversations/ai-selection-jev-play-the-ball-2026-09-21/`
2. `thinking_with_ai/conversations/ai-irreplaceability-lived-experience-2026-09-25/`

Why these two:

- they directly connect to the existing Playable Life / AI collaboration graph;
- they contain explicit durable principles;
- they expose the difference between semantic edge strength and personal importance;
- they are recent enough to test temporal scoring.

Do **not** bulk-ingest the last five months before this gold-standard pair looks right.

---

## Phase 1 — Separate relationship strength from personal importance

Current edge `weight` should continue to mean:

> **How strong is this relationship between thought A and thought B?**

It should **not** be overloaded to mean "how much Jones cares about this."

Proposed node-level signals:

```text
resonance_score
attention_score
recurrence_score
recency_score
interest_score
```

Suggested semantics:

### `resonance_score`

How strongly the concept appears to align with recurring Jones values / concerns.

This can be AI/JEV-assisted, but should remain explainable.

### `attention_score`

Behavioral evidence that Jones invested attention.

Possible signals:

- number of distinct conversations
- follow-up depth
- explicit "save this" / "important" actions
- conversion into project / manual / principle
- repeated return across sessions

### `recurrence_score`

How often the concept returns across independent time windows.

Repeated appearance across months should count more than repeated mentions in one conversation.

### `recency_score`

Time decay / current salience.

This should be computed, not manually authored.

### `interest_score`

A derived display signal.

Do not hard-code the final formula yet.

A first experimental model could combine:

```text
resonance × recurrence × attention × recency
```

but the actual formula should be calibrated against real graph behavior.

---

## Phase 2 — JEV's role

JEV should **not** become the sole authority for "what Jones cares about."

Use JEV as one signal inside selection / weighting.

Good uses:

- rank candidate durable thoughts from a digest;
- rank candidate cross-source edges;
- estimate which nodes appear to have long-term personal resonance;
- distinguish a central idea from a one-off analogy;
- produce an explanation for why one relationship deserves higher weight.

Bad use:

> "JEV says this topic is important, therefore it is important."

Behavioral evidence and recurrence should remain separate inputs.

---

## Phase 3 — Make ingestion agent-friendly

The core requirement for GPT / Muse / Jarvis is one deterministic handoff contract.

Each ingest agent should produce:

1. source manifest
2. digest
3. candidate nodes
4. candidate edges
5. rationales
6. source refs
7. optional scoring hints

Then existing validators / graph patch tools should decide whether the artifact is structurally valid.

Important rule:

> Agents may propose graph changes; the repo contract defines what a valid graph change is.

This avoids GPT, Muse, and Jarvis each inventing a slightly different ontology.

---

## Phase 4 — Backfill recent history

Only after the gold-standard pair and scoring semantics are stable:

Priority sources:

1. `thinking_with_ai` conversations and principles
2. `Jones-Manual`
3. high-signal research / project docs
4. selected agent/project handoffs where durable thought exists

Do not ingest every commit or every project log.

The Atlas is a durable thought graph, not a full activity log.

Target milestone:

> grow from 76 nodes to a few hundred high-quality nodes before optimizing the global visualization.

---

## Phase 5 — Global Atlas / Nebula view

This is now worth revisiting, but only after Phase 0–4 provide enough density.

Desired visual encodings:

- node size → `interest_score`
- cluster / position → semantic neighborhood
- edge thickness → relationship `weight`
- edge opacity → `confidence`
- optional halo → recent attention
- optional pulse / trend badge → rising theme

Clicking a node should expose:

- title / body
- first seen / last seen
- source count
- related nodes
- edge rationales
- attention / resonance components
- source evidence

Global visualization must remain exploratory, not merely decorative.

### Future surface: mobile companion (non-binding note)

For now the existing web UI (`thought-atlas-ui`) remains the visualization surface. Once the graph and data contract is stable, consider a polished mobile companion app as another read-only Thought Atlas client. It would make the Atlas feel personal and always available:

- global graph browsing
- theme / trend dashboard
- node drill-down
- "what have I been thinking about lately?"
- bridge thoughts
- source trails back to the original evidence

Modern coding agents make a high-quality mobile UI much cheaper and faster to build than before, so this is now a realistic future surface.

This is a note, not a decision. No framework (React Native / Flutter / native Android) is chosen, no app repo exists, and nothing should be implemented until the contract, including scoring, is stable.

---

## Dashboard questions worth answering

The UI becomes valuable when it can answer questions like:

- What has Jones been thinking about in the last 30 / 90 days?
- Which themes are rising?
- Which themes are dormant?
- Which concepts recur across many months?
- Which nodes act as bridges between otherwise separate clusters?
- Which ideas became projects?
- Which ideas became operating principles?
- Which recent idea connects to an old one unexpectedly?

A particularly useful derived view is **Bridge Thoughts**:

> nodes with unusually high graph-bridging / betweenness behavior.

This may reveal hidden recurring concepts such as autonomy, freedom, creation, or system-building even when they are not the most frequently mentioned tags.

---

## Tonight / next-session boundary

Do not start a large schema migration, UI rewrite, or bulk ingest tonight.

> **2026-09-25 late-night note:** the scoring/temporal semantics contract is now written — see `docs/scoring-temporal-semantics-contract-2026-09-25.md` (spec only; no schema/graph/code changes). It settles `occurred_at` vs `captured_at`, the recurrence merge policy, behavioral attention signals, resonance vs JEV's capped role, recency anchors, edge `evidence_type`, legacy calibration policy, and 10 acceptance tests. Next implementation step: manifest `occurred_at` + `occurred_precision` and backfill dates for the 11 existing sources.

The next coding session should begin with:

1. re-read this revival plan;
2. ingest the two gold-standard recent sources;
3. inspect the resulting nodes / edges manually;
4. draft scoring fields against real examples;
5. only then modify schemas;
6. run existing validation;
7. keep Firestore write/deploy explicit and separate.

No Firebase write is implied by this plan.

---

## Agent split

### GPT

Best first role:

- preserve continuity with the current graph architecture;
- define the canonical contract;
- create the first gold-standard ingests;
- review schema changes conservatively.

### Muse

Best later role:

- fast second-opinion review;
- bulk candidate extraction once the contract is stable;
- large-source triage;
- alternate scoring/ranking proposals.

### Jarvis

Best operational role later:

- ongoing ingestion trigger from normal workflows;
- scheduled / event-driven maintenance;
- routine graph refresh after the contract is stable.

Do not put multiple agents on free-form ingestion before the ontology and scoring semantics are fixed.

---

## Durable rule

> **First make the graph truthful and self-growing. Then make it beautiful.**
