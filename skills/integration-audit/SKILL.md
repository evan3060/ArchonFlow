---
name: integration-audit
description: "Full-stack integration verification with mandatory fix loops. Runs visual-auditor → ux-compliance → integration-checker to verify the complete application until all checks pass."
---

# Integration Audit Skill

Verify the complete integrated application against all contracts.

## ArchonFlow Core Rules

1. **Design Contract is the single source of truth** — derived from design export, obeyed by all agents
2. **Visual Score ≥ 95 required** — no page ships below this threshold
3. **API Compliance ≥ 90 required** — no backend ships below this threshold
4. **Cognitive Isolation** — auditors never see source code

## Autonomous Execution

This skill runs autonomously from start to finish. Do NOT:
- Ask "Should I fix this?" — FIX IT
- Ask "Should I continue?" — CONTINUE
- Ask "Proceed to next phase?" — PROCEED
- Pause for user confirmation between phases
- Ask "Want me to re-audit?" — RE-AUDIT AUTOMATICALLY

Only stop for:
- **BLOCKED**: cannot resolve a dependency (app not running, contracts missing)
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
   - Issues encountered
   - Pending fixes (if any)

This ensures the same agent "remembers" what it did in previous iterations,
even though Claude Code spawns a fresh subagent each time.

## Scoring Thresholds

| Check | Pass | Fix Required | Reject |
|-------|------|-------------|--------|
| Visual | ≥95 | 85-94 | <85 |
| UX | ≥95 | 85-94 | <85 |
| API | ≥90 | 80-89 | <80 |

All three checks must pass for the integration audit to succeed.

## When to Use

After both `frontend-building` and `backend-building` are complete. This skill verifies the full stack works together.

## Process

### Phase 1: Visual Audit (Full Stack)

Invoke: `@visual-auditor`

Memory: read `archonflow/memory/visual-auditor.md` before invocation.

Audit the full-stack application's visual fidelity against design contracts.
The running application now has real API data instead of mocks.

Input: running app URL, design contracts, memory
Output: `archonflow/audits/{page}.audit.{ts}.md`

After completion, update `archonflow/memory/visual-auditor.md`.

Scoring:
- ≥95: PASS → proceed to Phase 2
- 85-94: FIX REQUIRED → enter Fix Loop
- <85: REJECT → enter Fix Loop

### Phase 2: UX Compliance (Full Stack)

Invoke: `@ux-compliance`

Memory: read `archonflow/memory/ux-compliance.md` before invocation.

Test UX compliance on the full-stack application with real data.

Input: running app URL, design contracts, memory
Output: `archonflow/ux-reports/{page}.ux.{ts}.md`

After completion, update `archonflow/memory/ux-compliance.md`.

Scoring: same thresholds as visual audit.

### Phase 3: Integration Check (Full Stack)

Invoke: `@integration-checker`

Memory: read `archonflow/memory/integration-checker.md` before invocation.

Verify API compliance between frontend and backend with real endpoints.

Input: running app URL, API contracts, memory
Output: `archonflow/audits/integration.audit.{ts}.md`

After completion, update `archonflow/memory/integration-checker.md`.

Scoring:
- ≥90: PASS → proceed to Code Review
- 80-89: FIX REQUIRED → enter Fix Loop
- <80: REJECT → enter Fix Loop

### Phase 4: Code Review (Full Stack)

Invoke: `@code-reviewer`

Memory: read `archonflow/memory/code-reviewer.md` before invocation.

Review full-stack source code for quality, patterns, and best practices.

Input: source code, contracts, memory
Output: `archonflow/reports/integration.review.{ts}.md`

After completion, update `archonflow/memory/code-reviewer.md`.

## Fix Loop (MANDATORY)

After each audit phase, if score is below threshold:

1. Read audit report
2. Determine which engineer to invoke:
   - Visual/UX issues → `@frontend-engineer` (with memory)
   - API integration issues → `@backend-engineer` (with memory)
   - Both → invoke both engineers sequentially
3. Engineer fixes the issues
4. Update `archonflow/memory/{engineer-name}.md`
5. Re-run THE SAME audit phase (fresh subagent, but with memory)
6. If PASS → proceed to next audit phase
7. If FAIL → loop again (max 3 iterations per phase)
8. If max iterations reached → HALT, present failure report

**Critical rules:**
- Fix loop applies to EACH audit phase independently
- Visual audit must PASS before UX compliance starts
- UX compliance must PASS before Integration Check starts
- Integration Check must PASS before Code Review starts
- Code Review must APPROVE before the skill is complete
- Do NOT skip re-auditing after a fix — always verify
- Do NOT ask user for permission to fix — just fix

## Parallel Execution (Optional)

By default, this skill runs sequentially. For parallel execution:

"Use team agents for archonflow:integration-audit"

This spawns parallel Claude Code instances for independent audit checks.
Requires tmux and CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS enabled.

## Final Report

After ALL phases pass, generate a comprehensive integration report:

```
# Integration Audit Report

## Application Status
- App URL: http://localhost:3000
- Audit Date: YYYY-MM-DD

## Visual Audit
| Page | Score | Iterations | Status |
|------|-------|------------|--------|
| home-dashboard | 97 | 1 | ✅ PASS |
| record-index | 95 | 2 | ✅ PASS |

## UX Compliance
| Page | Score | Iterations | Status |
|------|-------|------------|--------|
| home-dashboard | 96 | 1 | ✅ PASS |
| record-index | 98 | 1 | ✅ PASS |

## Integration Check
| Endpoint | Score | Iterations | Status |
|----------|-------|------------|--------|
| GET /api/records | 95 | 1 | ✅ PASS |
| POST /api/records | 92 | 2 | ✅ PASS |

## Code Review
| Scope | Verdict | Iterations |
|-------|---------|------------|
| Frontend | APPROVE | 1 |
| Backend | APPROVE | 2 |

## Summary
- Visual: ✅ All pages ≥ 95
- UX: ✅ All pages ≥ 95
- API: ✅ All endpoints ≥ 90
- Code Review: ✅ All approved
- Total fix iterations: N
- Overall: ✅ PASS / ❌ FAIL
```

Save to `archonflow/reports/integration-audit.report.md`.

## Output

- Visual audit reports in `archonflow/audits/`
- UX reports in `archonflow/ux-reports/`
- Integration audit in `archonflow/audits/`
- Code review in `archonflow/reports/`
- Agent memory in `archonflow/memory/`
- Final report in `archonflow/reports/integration-audit.report.md`
