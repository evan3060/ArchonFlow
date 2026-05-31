---
name: verify
description: "Three-dimension verification: Completeness, Correctness, Coherence. Two-stage review: spec compliance first, then code quality. Fix loop until all audits pass."
---

# Verify Skill

Three-dimension verification of the implementation against contracts. Two-stage review process with mandatory fix loop.

## ArchonFlow Core Rules

1. **Design Contract is the single source of truth** — derived from design export, obeyed by all agents
2. **Visual Score ≥ 95 required** — no page ships below this threshold
3. **API Compliance ≥ 95 required** — no API ships below this threshold
4. **UX Compliance ≥ 90 required** — no page ships below this threshold
5. **Code Quality ≥ 85 required** — no code ships below this threshold
6. **Cognitive Isolation** — each agent sees ONLY what it needs; auditors never see source code

## Autonomous Execution

This skill runs autonomously from start to finish. Do NOT:
- Ask "Should I run the audit?" — RUN IT
- Ask "Should I fix the issues?" — FIX THEM
- Ask "Should I re-audit?" — RE-AUDIT
- Pause for user confirmation between audit stages

Only stop for:
- **ALL AUDITS PASS** — present final report
- **MAX ITERATIONS (3) REACHED** — present partial report with remaining issues
- **BLOCKED**: dev server not running, cannot access application

## Three Verification Dimensions

| Dimension | What | Auditors | Threshold |
|-----------|------|----------|-----------|
| **Completeness** | All contract requirements implemented | @visual-auditor, @api-compliance | Visual ≥ 95, API ≥ 95 |
| **Correctness** | Behavior matches Given/When/Then specs | @ux-compliance, @integration-checker | UX ≥ 90 |
| **Coherence** | Code quality and consistency | @code-reviewer, @backend-auditor | Code ≥ 85 |

## Two-Stage Review

### Stage 1: Spec Compliance (Completeness + Correctness)

Auditors test from the OUTSIDE — they never read source code.

Order:
1. @visual-auditor — visual compliance vs design contract
2. @api-compliance — API compliance vs API contract
3. @ux-compliance — UX compliance vs design contract
4. @integration-checker — frontend-backend integration vs API contract

All must PASS before Stage 2.

### Stage 2: Code Quality (Coherence)

Reviewers read source code for quality.

Order:
5. @backend-auditor — backend security, performance, data integrity
6. @code-reviewer — code quality, patterns, test coverage

## Agent Memory

Each agent maintains a memory file for continuity across invocations.

Before invoking any agent:
1. Read `archonflow/memory/{agent-name}.md` if it exists
2. Pass the memory content as context to the subagent

After agent completes:
1. Update `archonflow/memory/{agent-name}.md` with:
   - What was audited
   - Scores given
   - Issues found
   - Whether previous issues were resolved

## Process

### Phase 1: Context Loading

1. Read proposal spec from `archonflow/changes/{change-name}/proposal.md`
2. Read design contracts from `archonflow/changes/{change-name}/design.md`
3. Read API contracts from `archonflow/changes/{change-name}/api.md`
4. Read data layer contracts from `archonflow/changes/{change-name}/data.md`
5. Read `archonflow/config/project.config.json`
6. Read `archonflow/memory/` for agent memories
7. Verify dev server is running

### Phase 2: Spec Compliance Audit (Stage 1)

#### 2.1 Visual Audit

Invoke: `@visual-auditor`

Memory: read `archonflow/memory/visual-auditor.md` before invocation.

Input: running app URL, design contracts, memory
Output: visual compliance score and findings

If score < 95: collect issues for fix loop.

After completion, update `archonflow/memory/visual-auditor.md`.

#### 2.2 API Compliance Audit

Invoke: `@api-compliance`

Memory: read `archonflow/memory/api-compliance.md` before invocation.

Input: running app URL, API contracts, memory
Output: API compliance score and findings

If score < 95: collect issues for fix loop.

After completion, update `archonflow/memory/api-compliance.md`.

#### 2.3 UX Compliance Audit

Invoke: `@ux-compliance`

Memory: read `archonflow/memory/ux-compliance.md` before invocation.

Input: running app URL, design contracts, memory
Output: UX compliance score and findings

If score < 90: collect issues for fix loop.

After completion, update `archonflow/memory/ux-compliance.md`.

#### 2.4 Integration Check

Invoke: `@integration-checker`

Memory: read `archonflow/memory/integration-checker.md` before invocation.

Input: running app URL, API contracts, memory
Output: integration compliance score and findings

If score < 90: collect issues for fix loop.

After completion, update `archonflow/memory/integration-checker.md`.

### Phase 3: Fix Loop (if any Stage 1 audit failed)

If any spec compliance audit scored below threshold:

**Fix Loop Rules:**
- Maximum 3 iterations
- Each iteration: fix → re-audit failed stages only
- All failed stages must pass before proceeding to Stage 2
- If max iterations reached, report remaining issues

**Fix Process:**

1. Collect all issues from failed audits
2. Invoke the appropriate engineer agent to fix:
   - Visual issues → `@frontend-engineer`
   - API issues → `@backend-engineer`
   - UX issues → `@frontend-engineer`
   - Integration issues → `@frontend-engineer` + `@backend-engineer`
3. Fix using TDD discipline (RED-GREEN-REFACTOR)
4. Re-audit ONLY the failed stages
5. If still failing, increment iteration counter and repeat
6. If all pass, proceed to Stage 2

### Phase 4: Code Quality Review (Stage 2)

Only proceed if ALL Stage 1 audits passed.

#### 4.1 Backend Audit

Invoke: `@backend-auditor`

Memory: read `archonflow/memory/backend-auditor.md` before invocation.

Input: source code, API contracts, data layer contracts, memory
Output: backend quality score and findings

If score < 85: collect issues for fix loop.

After completion, update `archonflow/memory/backend-auditor.md`.

#### 4.2 Code Review

Invoke: `@code-reviewer`

Memory: read `archonflow/memory/code-reviewer.md` before invocation.

Input: source code, design contracts, spec compliance reports, memory
Output: code quality score and findings

If score < 85: collect issues for fix loop.

After completion, update `archonflow/memory/code-reviewer.md`.

### Phase 5: Fix Loop (if any Stage 2 audit failed)

Same fix loop rules as Phase 3, but for code quality issues:

1. Collect all issues from failed reviews
2. Invoke the appropriate engineer agent to fix
3. Fix using TDD discipline
4. Re-review ONLY the failed stages
5. If still failing, increment iteration counter and repeat
6. If all pass, proceed to final report

### Phase 6: Final Report

Generate comprehensive verification report:

```markdown
# Verification Report: {change-name}

## Summary
- Overall Status: ✅ PASS / ⚠️ PARTIAL / ❌ FAIL
- Date: YYYY-MM-DD HH:mm

## Stage 1: Spec Compliance

| Auditor | Score | Threshold | Status |
|---------|-------|-----------|--------|
| Visual | {score}/100 | ≥95 | ✅/❌ |
| API Compliance | {score}/100 | ≥95 | ✅/❌ |
| UX Compliance | {score}/100 | ≥90 | ✅/❌ |
| Integration | {score}/100 | ≥90 | ✅/❌ |

## Stage 2: Code Quality

| Reviewer | Score | Threshold | Status |
|----------|-------|-----------|--------|
| Backend Audit | {score}/100 | ≥85 | ✅/❌ |
| Code Review | {score}/100 | ≥85 | ✅/❌ |

## Fix Loop History

| Iteration | Issues Fixed | Remaining | Re-audit Result |
|-----------|-------------|-----------|-----------------|
| 1 | {count} | {count} | {result} |
| 2 | {count} | {count} | {result} |
| 3 | {count} | {count} | {result} |

## Detailed Findings
{per-auditor detailed findings}

## Files Modified During Fix Loop
{list of files modified}
```

Save to: `archonflow/changes/{change-name}/verify-report.md`

### Phase 7: Save and Track

1. Update `archonflow/changelog.md`:

```markdown
## YYYY-MM-DD — {change-name}
- Type: greenfield / incremental
- Status: ✅ Verified / ⚠️ Partial / ❌ Failed
- Proposal: archonflow/changes/{change-name}/proposal.md
- Design: archonflow/changes/{change-name}/design.md
- API: archonflow/changes/{change-name}/api.md
- Data: archonflow/changes/{change-name}/data.md
- Plan: archonflow/changes/{change-name}/plan.md
- Verify Report: archonflow/changes/{change-name}/verify-report.md
- Scores: Visual={score} API={score} UX={score} Integration={score} Backend={score} Code={score}
```

2. If all audits PASS: archive change to `archonflow/specs/`
3. Git commit

## Output

- Verification report: `archonflow/changes/{change-name}/verify-report.md`
- Audit reports: `archonflow/audits/`, `archonflow/visual-reports/`, `archonflow/ux-reports/`
- Updated agent memories: `archonflow/memory/`
- Updated changelog: `archonflow/changelog.md`

## Next Step

If verification passed: the change is complete. Use `/status` to view overall project status.
If verification failed after max iterations: use `/fix` for targeted bug fixing.
