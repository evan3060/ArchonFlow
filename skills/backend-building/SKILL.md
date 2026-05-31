---
name: backend-building
description: "Implement API from contracts with compliance testing and code review. Runs backend-engineer → integration-checker → code-reviewer pipeline with mandatory fix loops."
---

# Backend Building Skill

Implement API endpoints from API contracts, then verify compliance and review code quality.

## ArchonFlow Core Rules

1. **Design Contract is the single source of truth** — derived from design export, obeyed by all agents
2. **No Invention Rule** — if Contract does not specify something, stop and ask Design Authority
3. **API Compliance ≥ 90 required** — no backend ships below this threshold
4. **Design Authority has final interpretation** — disputes resolved by Authority
5. **Cognitive Isolation** — each agent sees ONLY what it needs; auditors never see source code

## Autonomous Execution

This skill runs autonomously from start to finish. Do NOT:
- Ask "Should I fix this?" — FIX IT
- Ask "Should I continue?" — CONTINUE
- Ask "Proceed to next phase?" — PROCEED
- Pause for user confirmation between phases
- Ask "Want me to re-check?" — RE-CHECK AUTOMATICALLY

Only stop for:
- **BLOCKED**: cannot resolve a dependency (missing contract, server not running)
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
| 90–100 | PASS | Next phase |
| 80–89 | FIX REQUIRED | Engineer fixes, re-check |
| <80 | REJECT | Re-implement from Contract |

## When to Use

After the `contract` skill has generated API contracts. This skill implements the backend and verifies compliance.

## Process

### Phase 1: Backend Engineer

Invoke: `@backend-engineer`

Memory: read `archonflow/memory/backend-engineer.md` before invocation.

The backend-engineer subagent implements API endpoints from API contracts.
Has full dev tools for backend source directory.

Input: API contracts, mock data, audit reports (for fixes), memory
Output: backend source files

After completion, update `archonflow/memory/backend-engineer.md`.

### Phase 2: Integration Check

Invoke: `@integration-checker`

Memory: read `archonflow/memory/integration-checker.md` before invocation.

The integration-checker subagent tests API compliance between frontend
and backend against API contracts. NEVER reads source code — tests via
HTTP requests.

Input: running app URL, API contracts, memory
Output: `archonflow/audits/integration.audit.{ts}.md`

After completion, update `archonflow/memory/integration-checker.md`.

Scoring:
- 90-100: PASS → proceed to Phase 3
- 80-89: FIX REQUIRED → enter Fix Loop (Phase 2 → Phase 1 → Phase 2)
- <80: REJECT → enter Fix Loop (Phase 2 → Phase 1 → Phase 2)

### Phase 3: Code Review

Invoke: `@code-reviewer`

Memory: read `archonflow/memory/code-reviewer.md` before invocation.

The code-reviewer subagent reviews backend source code for quality,
patterns, and best practices. Read-only access.

Input: backend source code, API contracts, memory
Output: `archonflow/reports/backend.review.{ts}.md`

After completion, update `archonflow/memory/code-reviewer.md`.

## Fix Loop (MANDATORY)

After integration check, if score is below threshold:

1. Read audit report
2. Feed audit report + memory to `@backend-engineer`
3. @backend-engineer fixes the issues
4. Update `archonflow/memory/backend-engineer.md`
5. Re-run integration check (fresh subagent, but with memory)
6. If PASS → proceed to Code Review
7. If FAIL → loop again (max 3 iterations)
8. If max iterations reached → HALT, present failure report

After Code Review, if issues found:
1. Feed review findings + memory to `@backend-engineer`
2. @backend-engineer fixes the issues
3. Update `archonflow/memory/backend-engineer.md`
4. Re-run Code Review
5. If APPROVE → skill complete
6. If still issues → loop again (max 3 iterations)

**Critical rules:**
- Integration check must PASS before Code Review starts
- Code Review must APPROVE before the skill is complete
- Do NOT skip re-checking after a fix — always verify
- Do NOT ask user for permission to fix — just fix

## Parallel Execution (Optional)

By default, this skill runs sequentially. For parallel execution across
independent API modules:

"Use team agents for archonflow:backend-building"

This spawns parallel Claude Code instances, each running the full
pipeline for a different API module. Requires tmux and
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS enabled.

## Final Report

After ALL phases pass, generate a summary report:

```
# Backend Building Report

## API Endpoints Implemented
- GET /api/records — list records
- POST /api/records — create record
- ...

## Audit Scores
| Endpoint | Compliance | Code Review | Iterations |
|----------|-----------|-------------|------------|
| GET /api/records | 95 | APPROVE | 1 |
| POST /api/records | 92 | APPROVE | 2 |
| ... | ... | ... | ... |

## Files Modified
- src/api/records.ts (created)
- src/middleware/auth.ts (created)
- ...

## Summary
- Total endpoints: N
- All passed: ✅/❌
- Total fix iterations: N
```

Save to `archonflow/reports/backend-building.report.md`.

## Output

- Implemented API endpoints
- Integration audit in `archonflow/audits/`
- Code review in `archonflow/reports/`
- Agent memory in `archonflow/memory/`
- Final report in `archonflow/reports/backend-building.report.md`
