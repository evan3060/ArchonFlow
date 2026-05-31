---
name: proposal
description: "Collect requirements and decide design source. First step in the ArchonFlow pipeline — identifies design exports and maps them to pages."
---

# Proposal Skill

Collect project requirements and identify design source files.

## ArchonFlow Core Rules

1. **Design Contract is the single source of truth** — derived from design export, obeyed by all agents
2. **No Invention Rule** — if Contract does not specify something, stop and ask Design Authority
3. **Design Authority has final interpretation** — disputes resolved by Authority
4. **Cognitive Isolation** — each agent sees ONLY what it needs; auditors never see source code

## Autonomous Execution

This skill runs autonomously from start to finish. Do NOT:
- Ask "Should I scan for design files?" — SCAN AUTOMATICALLY
- Ask "Should I continue?" — CONTINUE
- Ask "Proceed to contract generation?" — PROCEED
- Pause for user confirmation between steps

Only stop for:
- **BLOCKED**: no design files found in the project
- **AMBIGUITY**: multiple possible page mappings, need user clarification
- **ALL PHASES COMPLETE**: present mapping result

Note: The mapping confirmation step (Phase 3) is the ONE exception where
user input is required — the user must confirm or adjust the page-to-design
mapping before proceeding.

## When to Use

Starting a new project or adding pages to an existing project. This is always the first skill in the pipeline.

## Process

### Phase 1: Project Context

Read `archonflow/config/project.config.json` to understand:
- Project name and framework
- Design source patterns
- Existing pages

### Phase 2: Design Source Discovery

Scan the project for design export files using glob patterns from config:
1. Search for HTML files matching `design-references/**/*.html`
2. Search for screenshot files matching `design-references/**/*.{png,jpg,svg}`
3. Identify each HTML file's page name (read `<title>`, `<h1>`, or content)
4. Match screenshots to pages by name similarity

### Phase 3: Mapping Confirmation

Present the discovered mapping to the user:

```
| Page Name | Design File | Screenshots |
|-----------|-------------|-------------|
| Analysis  | design-references/analysis.html | analysis-1.png, analysis-2.png |
| Growth    | design-references/growth.html  | growth-1.png |
```

Ask user to confirm or adjust the mapping. This is the only step that
requires user input — the rest runs autonomously.

### Phase 4: Save Mapping

Write confirmed mapping to `archonflow/contracts/design-source-map.json`:

```json
{
  "pages": {
    "analysis": {
      "designFile": "design-references/analysis.html",
      "screenshots": ["design-references/analysis-1.png"]
    }
  }
}
```

## Output

- `archonflow/contracts/design-source-map.json` — page-to-design mapping

## Next Step

Invoke the `contract` skill to generate design contracts for each mapped page.
