---
name: verify
description: "Two-stage audit: spec compliance then code quality. Fourth step in the ArchonFlow pipeline. Invokes Visual Auditor, API & Integration Auditor, UX Compliance, and Code & Backend Reviewer with Fix Loop and Arbiter mechanism."
---

# Verify Skill

Two-stage audit pipeline: spec compliance first, then code quality. Includes Fix Loop with Arbiter mechanism for deadlock resolution.

## ArchonFlow Core Rules

1. **Contract First Development** — design contract is the single source of truth, derived from design export, obeyed by all agents
2. **Assumption Log** — if contract doesn't specify something, record assumptions in assumptions.md; structural/visual assumptions are forbidden
3. **Design Authority has final interpretation** — disputes resolved by Authority
4. **Cognitive Isolation** — each agent sees ONLY what it needs; auditors never see source code
5. **Visual Audit Separation** — scripts compute differences, LLM interprets results

## Autonomous Execution

This skill runs autonomously. Do NOT:
- Ask "Should I invoke the next auditor?" — INVOKE AUTOMATICALLY
- Ask "Should I fix this?" — FIX AUTOMATICALLY
- Ask "Should I re-audit?" — RE-AUDIT AUTOMATICALLY

Only stop for:
- **HUMAN_INTERVENTION**: Fix Loop reaches max iterations after Arbiter ruling
- **CRITICAL FAILURE**: application cannot start

## Process

### Phase 1: Pre-Verify Setup

1. Read `archonflow/changes/{change-name}/design.md` — design contracts
2. Read `archonflow/changes/{change-name}/api.md` — API contracts
3. Read `archonflow/changes/{change-name}/data.md` — data layer contracts
4. Read `archonflow/config/project.config.json` for thresholds and profile
5. Start the application (if not running)
6. Wait for application to be ready
7. Git commit current state (for Fix Loop rollback)

### Phase 2: Spec Compliance Audit (Stage 1)

Stage 1 auditors test from the OUTSIDE — they never read source code.

#### 2.1 Visual Audit

Invoke: `@visual-auditor`

Memory: read `archonflow/memory/visual-auditor.md` before invocation.

Input: running app URL, design contracts, memory
Output: visual fidelity score and findings

**Calculation-Interpretation Separation**:
1. Run `npm run capture` — Playwright captures screenshots
2. Run `npm run diff` — script computes pixel/color/layout differences
3. Run `npm run score` — script calculates dimension scores
4. Invoke `@visual-auditor` — LLM interprets the computed results only

The visual-auditor NEVER computes color distances or pixel differences — it only reads pre-computed results and interprets them.

Threshold: ≥ {visualThreshold from config, default 95}

#### 2.2 API & Integration Audit

Invoke: `@api-integration-auditor`

Memory: read `archonflow/memory/api-integration-auditor.md` before invocation.

Input: running app URL, API contracts, data contracts, memory
Output: API compliance score, integration score, and findings

The api-integration-auditor performs two functions:
1. API Compliance — verify schema, status codes, error format, auth
2. Integration Check — verify frontend-backend data flow

Threshold: ≥ {apiThreshold from config, default 95}

#### 2.3 UX Compliance Audit

Invoke: `@ux-compliance`

Memory: read `archonflow/memory/ux-compliance.md` before invocation.

Input: running app URL, design contracts, memory
Output: UX compliance score and findings

Threshold: ≥ {uxThreshold from config, default 90}

#### Stage 1 Gate

All Stage 1 audits must pass before proceeding to Stage 2.
If any audit fails, enter Fix Loop for that audit.

### Phase 3: Fix Loop (Stage 1)

For each failing audit:

```
Iteration 1:
  1. Engineer reads audit report + memory + contracts
  2. Engineer fixes issues
  3. Update agent memory
  4. Re-audit with new subagent (but with memory)

Iteration 2:
  1. Engineer reads audit report + memory + contracts
  2. Engineer fixes issues
  3. Update agent memory
  4. Re-audit with new subagent (but with memory)

Iteration 3 (Arbiter triggered):
  1. Invoke @system-architect as Arbiter
  2. Arbiter reviews contract, code, and audit reports
  3. Arbiter issues Directive
  4. Engineer follows Directive
  5. Re-audit

If still fails after Arbiter → HUMAN_INTERVENTION
```

**Git Reset Mechanism**: Before each fix attempt, the current code state is committed. If a fix makes things worse, reset to the pre-fix commit and try a different approach.

### Phase 4: Code Quality Review (Stage 2)

Stage 2 reviewers READ source code for quality assessment.

#### 4.1 Code & Backend Review

Invoke: `@code-backend-reviewer`

Memory: read `archonflow/memory/code-backend-reviewer.md` before invocation.

Input: source code, contracts, assumption log, memory
Output: code quality score, backend quality score, and findings

The code-backend-reviewer performs two functions:
1. Backend Quality — security, performance, data integrity, error handling
2. Code Quality — readability, patterns, test coverage, assumption compliance

Threshold: ≥ {codeThreshold from config, default 85}

#### Stage 2 Gate

Code quality must pass before proceeding.
If it fails, enter Fix Loop for code quality.

### Phase 5: Fix Loop (Stage 2)

Same Fix Loop mechanism as Stage 1, but for code quality issues.

### Phase 6: Final Report

After all audits pass, generate the final verification report:

```markdown
# Verification Report: {change-name}

## Summary
- Overall: ✅ PASS / ❌ FAIL
- Date: {timestamp}

## Stage 1: Spec Compliance
| Auditor | Score | Threshold | Status |
|---------|-------|-----------|--------|
| Visual Auditor | {score} | ≥ {threshold} | ✅/❌ |
| API & Integration Auditor | {score} | ≥ {threshold} | ✅/❌ |
| UX Compliance | {score} | ≥ {threshold} | ✅/❌ |

## Stage 2: Code Quality
| Reviewer | Score | Threshold | Status |
|----------|-------|-----------|--------|
| Code & Backend Reviewer | {score} | ≥ {threshold} | ✅/❌ |

## Fix Loop History
| Iteration | Auditor | Score Change | Action |
|-----------|---------|-------------|--------|
| 1 | {auditor} | {before} → {after} | {action} |

## Arbiter Directives (if any)
{Arbiter rulings}

## Assumption Log Status
| # | Assumption | Type | Status |
|---|-----------|------|--------|
| 1 | {assumption} | REQUIRED/OPTIONAL | RESOLVED/PENDING |

## Recommendations
1. {recommendation}
```

Save to `archonflow/changes/{change-name}/verify-report.md`

### Phase 7: Save and Track

1. Update `archonflow/changelog.md`:

```markdown
## YYYY-MM-DD — {change-name}
- Type: greenfield / incremental
- Status: ✅ Verified
- Proposal: archonflow/changes/{change-name}/proposal.md
- Design: archonflow/changes/{change-name}/design.md
- API: archonflow/changes/{change-name}/api.md
- Data: archonflow/changes/{change-name}/data.md
- Plan: archonflow/changes/{change-name}/plan.md
- Verify: archonflow/changes/{change-name}/verify-report.md
```

2. Archive to `archonflow/specs/` if all audits pass
3. Git commit

## Output

- `archonflow/changes/{change-name}/verify-report.md` — verification report
- `archonflow/audits/*.md` — individual audit reports
- `archonflow/reviews/*.md` — code review reports
- Updated agent memory files

## Next Step

If all audits pass → project is ready for release.
If any audit fails after max iterations → invoke `/fix` for targeted bug fixing.
