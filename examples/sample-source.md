---
source_id: sample-source
title: Thought Atlas Core direction correction
source_type: markdown
captured_at: 2026-04-25T12:00:00.000Z
status: inbox
---

# Thought Atlas Core direction correction

This repo should be treated as Thought Atlas Core, not the hosted UI. The production responsibility is a local-first Jarvis-native ingestion and data engine.

The core milestone is:

```text
source.md -> digest.json -> graph_patch.json -> local graph JSON
```

The existing React / Vite prototype should remain outside the main app path and should not drive future development. UI work is explicitly out of scope until the data pipeline is stable.
