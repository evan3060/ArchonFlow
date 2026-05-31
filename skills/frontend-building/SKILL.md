---
name: frontend-building
description: "Implement UI from design contracts with visual audit, UX audit, and code review. Runs frontend-engineer → visual-auditor → ux-compliance → code-reviewer pipeline with mandatory fix loops."
---

# Frontend Building Skill

Implement UI components and pages from design contracts, then audit for visual fidelity and UX compliance.

## ArchonFlow Core Rules

1. **Design Contract is the single source of truth** — derived from design export, obeyed by all agents
2. **No Invention Rule** — if Contract does not specify something, stop and ask Design Authority
3. **Visual Score ≥ 95 required** — no page ships below this threshold
4. **Design Authority has final interpretation** — disputes resolved by Authority
5. **Cognitive Isolation** — each agent sees ONLY what it needs; auditors never see source code

## Autonomous Execution

This skill runs autonomously from start to finish. Do NOT:
- Ask "Should I fix this?" — FIX IT
- Ask "Should I continue?" — CONTINUE
- Ask "Proceed to next phase?" — PROCEED
- Pause for user confirmation between phases
- Ask "Want me to re-audit?" — RE-AUDIT AUTOMATICALLY

Only stop for:
- **BLOCKED**: cannot resolve a dependency (missing contract, app not running)
- **AMBIGUITY**: contract genuinely unclear, Design Authority needed
- **ALL PHASES COMPLETE**: present final report

## Agent Memory

Each agent maintains a memory file for continuity across fix iterations.

Before invoking any agent:
1. Read `archonflow/memory/{agent-name}.md` if it exists
2. Pass the memory content as context to the subagent

After agent completes:
1. Update `archonflow/memory/{agent-name}.md` with:
   - What was done
   - Key decisions made
   - Files modified
   - Issues encountered
   - Pending fixes (if any)

This ensures the same agent "remembers" what it did in previous iterations,
even though Claude Code spawns a fresh subagent each time.

## Scoring

| Score | Verdict | Action |
|-------|---------|--------|
| 95–100 | PASS | Next phase |
| 85–94 | FIX REQUIRED | Engineer fixes, re-audit |
| <85 | REJECT | Re-implement from Contract |

## When to Use

After the `contract` skill has generated all contracts. This skill implements the frontend and verifies quality.

## Process

### Phase 1: Frontend Engineer

Invoke: `@frontend-engineer`

Memory: read `archonflow/memory/frontend-engineer.md` before invocation.

The frontend-engineer subagent implements UI components and pages from
design contracts. Has full dev tools for src/ directory.

Input: design contracts, design tokens, audit reports (for fixes), memory
Output: `src/pages/{page}/`, `src/components/`

After completion, update `archonflow/memory/frontend-engineer.md`.

### Phase 2: Visual Audit

Invoke: `@visual-auditor`

Memory: read `archonflow/memory/visual-auditor.md` before invocation.

The visual-auditor subagent captures screenshots and compares the running
application against design contracts. NEVER reads source code — pure user
perspective.

Input: running app URL, design contracts, memory
Output: `archonflow/audits/{page}.audit.{ts}.md`

After completion, update `archonflow/memory/visual-auditor.md`.

Scoring:
- 95-100: PASS → proceed to Phase 3
- 85-94: FIX REQUIRED → enter Fix Loop (Phase 2 → Phase 1 → Phase 2)
- <85: REJECT → enter Fix Loop (Phase 2 → Phase 1 → Phase 2)

### Phase 3: UX Compliance

Invoke: `@ux-compliance`

Memory: read `archonflow/memory/ux-compliance.md` before invocation.

The ux-compliance subagent tests accessibility, usability, and interaction
patterns. NEVER reads source code — tests from the outside.

Input: running app URL, design contracts, memory
Output: `archonflow/ux-reports/{page}.ux.{ts}.md`

After completion, update `archonflow/memory/ux-compliance.md`.

Scoring: same thresholds as visual audit.

### Phase 4: Code Review

Invoke: `@code-reviewer`

Memory: read `archonflow/memory/code-reviewer.md` before invocation.

The code-reviewer subagent reviews source code for quality, patterns,
and best practices. Read-only access.

Input: source code, design contracts, memory
Output: `archonflow/reports/frontend.review.{ts}.md`

After completion, update `archonflow/memory/code-reviewer.md`.

## Fix Loop (MANDATORY)

After each audit phase, if score is below threshold:

1. Read audit report
2. Feed audit report + memory to `@frontend-engineer`
3. @frontend-engineer fixes the issues
4. Update `archonflow/memory/frontend-engineer.md`
5. Re-run THE SAME audit phase (fresh subagent, but with memory)
6. If PASS → proceed to next audit phase
7. If FAIL → loop again (max 3 iterations per phase)
8. If max iterations reached → HALT, present failure report

**Critical rules:**
- Fix loop applies to EACH audit phase independently
- Visual audit must PASS before UX compliance starts
- UX compliance must PASS before Code Review starts
- Code Review must APPROVE before the skill is complete
- Do NOT skip re-auditing after a fix — always verify
- Do NOT ask user for permission to fix — just fix

## Parallel Execution (Optional)

By default, this skill runs sequentially. For parallel execution across pages:

"Use team agents for archonflow:frontend-building"

This spawns parallel Claude Code instances, each running the full
pipeline for a different page. Requires tmux and
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS enabled.

## Final Report

After ALL phases pass, generate a summary report:

```
# Frontend Building Report

## Pages Implemented
- home-dashboard: src/pages/index/index.vue
- record-index: src/pages/record/index.vue
- ...

## Audit Scores
| Page | Visual | UX | Code Review | Iterations |
|------|--------|----|-------------|------------|
| home-dashboard | 97 | 96 | APPROVE | 2 |
| record-index | 95 | 98 | APPROVE | 1 |
| ... | ... | ... | ... | ... |

## Files Modified
- src/pages/index/index.vue (created)
- src/components/RecordCard.vue (created)
- ...

## Summary
- Total pages: N
- All passed: ✅/❌
- Total fix iterations: N
```

Save to `archonflow/reports/frontend-building.report.md`.

## Output

- Implemented pages in `src/pages/`
- Implemented components in `src/components/`
- Audit reports in `archonflow/audits/`
- UX reports in `archonflow/ux-reports/`
- Code review in `archonflow/reports/`
- Agent memory in `archonflow/memory/`
- Final report in `archonflow/reports/frontend-building.report.md`
