# Source Type Strategy

Thought Atlas should accept more than conversational longform. Different source shapes need slightly different digest habits.

## Conversation / reflection source

Use when the source is a dialogue, journal-like reflection, or exploratory conversation.

Digest style:

- preserve emergent claims, questions, decisions, and patterns;
- look for self-model updates and methodology updates;
- connect later insights back to earlier graph nodes;
- avoid over-indexing every conversational turn.

Good node kinds:

- `claim`
- `question`
- `pattern`
- `decision`

## Report / checklist source

Use when the source is already structured: validation checklist, research report, spec, SOP, architecture doc.

Digest style:

- extract operating principles, evaluation frameworks, criteria, gates, and recommended sequences;
- preserve the structure as reusable patterns/actions rather than rewriting it as personal reflection;
- prefer fewer high-level nodes over one node per checklist item;
- connect the report's framework to existing decisions or architecture nodes.

Good node kinds:

- `decision` for durable rules/gates;
- `pattern` for evaluation frameworks and classification systems;
- `action` for ordered test plans or SOP steps;
- `claim` for explicit predictions or conclusions.

Quality guardrails:

- source refs should point to the actual checklist section, not the entire document;
- generated reports must come from `generate-ingest-report.mjs`, not hand-written counts;
- if the report is only task context, run `no-ingest-check` instead of creating graph files.

## Current source classes tested

- `original-conversation-2026-04-11`: conversation/reflection source.
- `ikigai-2026-04-25`: conversation/reflection source with product-strategy content.
- `codex-app-validation-checklist-2026-04-18`: report/checklist source.
