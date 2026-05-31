---
name: bug-fix
description: "Fix bugs with targeted repair and audit. Analyzes bug type, invokes the right engineer, runs targeted audit, and loops until pass. Covers visual, interaction, frontend logic, backend API, and full-stack bugs."
---

# Bug Fix Skill

Fix bugs reported by users or discovered during manual review, with targeted repair and audit verification.

## ArchonFlow Core Rules

1. **Design Contract is the single source of truth** — derived from design export, obeyed by all agents
2. **No Invention Rule** — if Contract does not specify something, stop and ask Design Authority
3. **Visual Score ≥ 95 required** — no page ships below this threshold
4. **API Compliance ≥ 90 required** — no backend ships below this threshold
5. **Design Authority has final interpretation** — disputes resolved by Authority
6. **Cognitive Isolation** — each agent sees ONLY what it needs; auditors never see source code

## Autonomous Execution

This skill runs autonomously from start to finish. Do NOT:
- Ask "Should I fix this?" — FIX IT
- Ask "Should I continue?" — CONTINUE
- Ask "Proceed to audit?" — PROCEED
- Pause for user confirmation between phases
- Ask "Want me to re-audit?" — RE-AUDIT AUTOMATICALLY

Only stop for:
- **BLOCKED**: cannot resolve a dependency (app not running, contracts missing)
- **AMBIGUITY**: bug description genuinely unclear, need user clarification
- **ALL PHASES COMPLETE**: present fix report

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

## Bug Type Classification

The skill analyzes the bug description to determine the type and route to the right engineer:

| Bug Type | Engineer | Auditor | Examples |
|----------|----------|---------|---------|
| visual | @frontend-engineer | @visual-auditor | Spacing too large, color mismatch, wrong font |
| interaction | @frontend-engineer | @ux-compliance | Missing hover state, focus lost, no keyboard nav |
| frontend-logic | @frontend-engineer | @integration-checker | Click error, state management bug, form validation |
| backend-api | @backend-engineer | @integration-checker | API 500, wrong response format, missing endpoint |
| full-stack | Both sequentially | @integration-checker + @visual-auditor | Frontend sends wrong params + backend rejects |
| code-quality | Corresponding engineer | @code-reviewer | Performance issue, security vulnerability |

Classification rules:
- If bug mentions visual appearance (color, spacing, layout, font) → **visual**
- If bug mentions interaction behavior (hover, focus, click feedback, animation) → **interaction**
- If bug mentions frontend error (console error, UI broken, state issue) → **frontend-logic**
- If bug mentions API error (500, timeout, wrong data, missing data) → **backend-api**
- If bug involves both frontend and backend → **full-stack**
- If bug mentions performance, security, code smell → **code-quality**
- If unsure → default to **frontend-logic**, escalate if audit reveals backend issue

## When to Use

After any pipeline skill has completed, when bugs are found during:
- Manual user review
- Production monitoring
- User feedback
- Regression after updates

This skill is NOT for initial implementation — use `/frontend-building` or `/backend-building` for that.

## Process

### Phase 1: Context Loading

1. Read `archonflow/config/project.config.json` for project setup
2. Read all agent memory files from `archonflow/memory/` to understand current state
3. Read latest audit/review reports from `archonflow/audits/`, `archonflow/ux-reports/`, `archonflow/reports/`
4. Analyze the bug description and classify bug type

### Phase 2: Bug Fix

Based on bug type classification:

#### Visual / Interaction / Frontend-Logic Bugs

Invoke: `@frontend-engineer`

Memory: read `archonflow/memory/frontend-engineer.md` before invocation.

Input: bug description, design contracts, audit reports, memory
Output: fixed source files

After completion, update `archonflow/memory/frontend-engineer.md`.

#### Backend-API Bugs

Invoke: `@backend-engineer`

Memory: read `archonflow/memory/backend-engineer.md` before invocation.

Input: bug description, API contracts, audit reports, memory
Output: fixed backend source files

After completion, update `archonflow/memory/backend-engineer.md`.

#### Full-Stack Bugs

1. Invoke `@frontend-engineer` (with memory) to fix frontend side
2. Update `archonflow/memory/frontend-engineer.md`
3. Invoke `@backend-engineer` (with memory) to fix backend side
4. Update `archonflow/memory/backend-engineer.md`

#### Code-Quality Bugs

Invoke the corresponding engineer (frontend or backend) based on the affected code.

### Phase 3: Targeted Audit

Based on bug type, run ONLY the relevant audit:

| Bug Type | Audit Phase | Threshold |
|----------|------------|-----------|
| visual | @visual-auditor | ≥ 95 |
| interaction | @ux-compliance | ≥ 95 |
| frontend-logic | @integration-checker | ≥ 90 |
| backend-api | @integration-checker | ≥ 90 |
| full-stack | @integration-checker + @visual-auditor | ≥ 90 / ≥ 95 |
| code-quality | @code-reviewer | APPROVE |

Memory: read the auditor's memory file before invocation.

After audit completion, update the auditor's memory file.

### Phase 4: Verification Loop (MANDATORY)

If audit score is below threshold:

1. Read audit report
2. Feed audit report + memory to the corresponding engineer
3. Engineer fixes the issues
4. Update engineer's memory file
5. Re-run THE SAME audit phase (fresh subagent, but with memory)
6. If PASS → proceed
7. If FAIL → loop again (max 3 iterations per phase)
8. If max iterations reached → HALT, present failure report

**Critical rules:**
- Do NOT skip re-auditing after a fix — always verify
- Do NOT ask user for permission to fix — just fix
- Each audit phase must PASS before the skill is complete

### Phase 5: Regression Check (Optional)

After the targeted audit passes, optionally run a quick regression check:

Invoke: `@visual-auditor` (for visual/interaction fixes)
or `@integration-checker` (for API/backend fixes)

This ensures the fix didn't break anything else.

## Fix Report

After all phases pass, generate a fix report:

```
# Bug Fix Report

## Bug Description
{original bug description}

## Classification
- Type: {visual|interaction|frontend-logic|backend-api|full-stack|code-quality}
- Engineer: {@frontend-engineer|@backend-engineer|both}

## Fix Applied
- What was changed
- Files modified
- Root cause analysis

## Audit Results
| Audit | Score | Iterations | Status |
|-------|-------|------------|--------|
| visual-auditor | 97 | 1 | ✅ PASS |
| integration-checker | 95 | 2 | ✅ PASS |

## Regression Check
- Status: ✅ No regressions / ⚠️ Regressions found (details)

## Summary
- Bug fixed: ✅
- Total fix iterations: N
- Files modified: N
```

Save to `archonflow/reports/bug-fix.{ts}.md`.

## Output

- Fixed source files
- Audit reports in `archonflow/audits/`, `archonflow/ux-reports/`, `archonflow/reports/`
- Updated agent memory in `archonflow/memory/`
- Fix report in `archonflow/reports/bug-fix.{ts}.md`
