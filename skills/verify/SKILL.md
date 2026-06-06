---
name: verify
description: "Three-layer audit: spec compliance, contract assertion, then code quality. Fourth step in the ArchonFlow pipeline. Invokes Visual Auditor, API & Integration Auditor, UX Compliance, and Code & Backend Reviewer with Fix Loop and Arbiter mechanism. Includes Spec Compliance verification and archive readiness check."
---

# Verify Skill

Three-layer audit pipeline: Spec Compliance first, then Contract Assertion, then Code Quality. Includes Fix Loop with Arbiter mechanism for deadlock resolution.

## ArchonFlow Core Rules

1. **Contract First Development** — design contract is the single source of truth, derived from design export, obeyed by all agents
2. **Assumption Log** — if contract doesn't specify something, record assumptions in assumptions.md; structural/visual assumptions are forbidden
3. **Design Authority has final interpretation** — disputes resolved by Authority
4. **Cognitive Isolation** — each agent sees ONLY what it needs; auditors never see source code
5. **Visual Audit Separation** — scripts compute differences, LLM interprets results
6. **Spec-Driven Verification** — implementation MUST satisfy Spec Scenarios (GIVEN/WHEN/THEN) in addition to Contract Assertions

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

1. Read `archonflow/changes/{YYYYMMDD-change-name}/design/design.md` — design contracts
2. Read `archonflow/changes/{YYYYMMDD-change-name}/design/api-contract.md` — API contracts
3. Read `archonflow/changes/{YYYYMMDD-change-name}/design/data-contract.md` — data layer contracts
4. Read `archonflow/changes/{YYYYMMDD-change-name}/specs/` — Delta Specs with Scenarios
5. Read `archonflow/changes/{YYYYMMDD-change-name}/tests/` — test skeletons from build phase
6. Read `archonflow/config/project.config.json` for thresholds and profile
7. Start the application (if not running)
8. Wait for application to be ready
9. Git commit current state (for Fix Loop rollback)

### Phase 2: Spec Compliance Verification (Layer 1)

**Purpose**: Verify that the implementation satisfies the behavioral specifications (Spec Scenarios) from the Delta Specs. This is the highest-level verification — "does the system behave as specified?"

**Process**:
1. Read all Delta Specs from `archonflow/changes/{YYYYMMDD-change-name}/specs/`
2. For each Requirement with Scenarios:
   - Run the corresponding test from `archonflow/changes/{YYYYMMDD-change-name}/tests/`
   - If test passes → Scenario SATISFIED
   - If test fails → Scenario VIOLATED, record violation
3. For Scenarios without automated tests:
   - Manual verification checklist (for HITL scenarios)
   - Record as MANUAL_VERIFICATION_NEEDED

**Spec Compliance Report**:
```markdown
## Spec Compliance Report

| Requirement | Scenario | Status | Evidence |
|-------------|----------|--------|----------|
| Email/Password Login | Successful login | ✅ SATISFIED | test: auth-login.spec.ts:it#1 |
| Email/Password Login | Invalid credentials | ✅ SATISFIED | test: auth-login.spec.ts:it#2 |
| OAuth Login | First-time OAuth login | ❌ VIOLATED | test: auth-oauth.spec.ts:it#1 — account not created |
| Login Rate Limiting | Account lockout | ⚠️ MANUAL | no automated test |
```

**Gate**: All Spec Scenarios must be SATISFIED or MANUAL_VERIFICATION_NEEDED. Any VIOLATED Scenario blocks proceeding.

### Phase 3: Contract Assertion Audit (Layer 2)

Stage 1 auditors test from the OUTSIDE — they never read source code.

#### 3.1 Visual Audit

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

#### 3.2 API & Integration Audit

Invoke: `@api-integration-auditor`

Memory: read `archonflow/memory/api-integration-auditor.md` before invocation.

Input: running app URL, API contracts, data contracts, memory
Output: API compliance score, integration score, and findings

The api-integration-auditor performs two functions:
1. API Compliance — verify schema, status codes, error format, auth
2. Integration Check — verify frontend-backend data flow

Threshold: ≥ {apiThreshold from config, default 95}

#### 3.3 UX Compliance Audit

Invoke: `@ux-compliance`

Memory: read `archonflow/memory/ux-compliance.md` before invocation.

Input: running app URL, design contracts, memory
Output: UX compliance score and findings

Threshold: ≥ {uxThreshold from config, default 90}

#### Layer 2 Gate

All Layer 2 audits must pass before proceeding to Layer 3.
If any audit fails, enter Fix Loop for that audit.

### Phase 4: Fix Loop (Layer 2)

For each failing audit:

```
Iteration 1:
  1. [MEMORY RESET] Spawn FRESH Engineer agent (no history from previous work)
  2. Engineer reads: current code + FAIL-only violation report + contracts + excluded_hypotheses.json
  3. [SURGICAL FIX CONTRACT] Engineer fixes ONLY the violations listed
  4. Re-run Phase 4 verification

Iteration 2:
  1. [MEMORY RESET] Spawn FRESH Engineer agent
  2. Engineer reads: current code + FAIL-only report + contracts + excluded_hypotheses.json
  3. [SURGICAL FIX CONTRACT] Engineer fixes ONLY the violations listed
  4. Re-run Phase 4 verification

Iteration 3 (Arbiter triggered):
  1. Invoke @system-architect as Arbiter
  2. Arbiter reviews contract, code, and audit reports
  3. Arbiter issues Directive
  4. Engineer follows Directive
  5. Re-audit

If still fails after Arbiter → HUMAN_INTERVENTION
```

**Git Reset Mechanism**: Before each fix attempt, the current code state is committed. If a fix makes things worse, reset to the pre-fix commit and try a different approach.

### Phase 5: Code Quality Review (Layer 3)

Layer 3 reviewers READ source code for quality assessment.

#### 5.1 Code & Backend Review

Invoke: `@code-backend-reviewer`

Memory: read `archonflow/memory/code-backend-reviewer.md` before invocation.

Input: source code, contracts, assumption log, memory
Output: code quality score, backend quality score, and findings

The code-backend-reviewer performs two functions:
1. Backend Quality — security, performance, data integrity, error handling
2. Code Quality — readability, patterns, test coverage, assumption compliance

Threshold: ≥ {codeThreshold from config, default 85}

#### Layer 3 Gate

Code quality must pass before proceeding.
If it fails, enter Fix Loop for code quality.

### Phase 6: Fix Loop (Layer 3)

Same Fix Loop mechanism as Layer 2, but for code quality issues.

### Phase 7: Final Report

After all audits pass, generate the final verification report:

```markdown
# Verification Report: {change-name}

## Summary
- Overall: ✅ PASS / ❌ FAIL
- Date: {timestamp}

## Layer 1: Spec Compliance
| Requirement | Scenario | Status | Evidence |
|-------------|----------|--------|----------|
| {requirement} | {scenario} | ✅/❌/⚠️ | {evidence} |

## Layer 2: Contract Assertion
| Auditor | Score | Threshold | Status |
|---------|-------|-----------|--------|
| Visual Auditor | {score} | ≥ {threshold} | ✅/❌ |
| API & Integration Auditor | {score} | ≥ {threshold} | ✅/❌ |
| UX Compliance | {score} | ≥ {threshold} | ✅/❌ |

## Layer 3: Code Quality
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

Save to `archonflow/changes/{YYYYMMDD-change-name}/verify-report.md`

### Phase 8: Archive Readiness Check

If all three layers pass, check archive readiness and notify the user:

```
✅ Verification PASSED — all specs, contracts, and code quality satisfied.

📦 This change is ready to archive.
Run /archonflow:archive {YYYYMMDD-change-name} to:
  - Merge Delta Specs into archonflow/specs/
  - Move change to archonflow/archive/
  - Update archonflow/changelog.md
  - Update version number

Or continue with other changes.
```

**Do NOT auto-archive**. The user decides when to archive.

### Phase 9: Save and Track

1. Update `archonflow/changelog.md`:

```markdown
## YYYY-MM-DD — {change-name}
- Type: greenfield / incremental
- Status: ✅ Verified
- Proposal: archonflow/changes/{YYYYMMDD-change-name}/proposal.md
- Design: archonflow/changes/{YYYYMMDD-change-name}/design/design.md
- API: archonflow/changes/{YYYYMMDD-change-name}/design/api-contract.md
- Data: archonflow/changes/{YYYYMMDD-change-name}/design/data-contract.md
- Plan: archonflow/changes/{YYYYMMDD-change-name}/plan.md
- Tests: archonflow/changes/{YYYYMMDD-change-name}/tests/
- Verify: archonflow/changes/{YYYYMMDD-change-name}/verify-report.md
- Archive: ready / not ready
```

2. Git commit

## Output

- `archonflow/changes/{YYYYMMDD-change-name}/verify-report.md` — verification report
- `archonflow/audits/*.md` — individual audit reports
- `archonflow/reviews/*.md` — code review reports
- Updated agent memory files

## Next Step

If all audits pass → user can run `/archonflow:archive` to archive the change.
If any audit fails after max iterations → invoke `/archonflow:fix` for targeted bug fixing.
