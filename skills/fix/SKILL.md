---
name: fix
description: "Targeted bug fixing with audit verification. Fixes specific issues and re-audits to confirm. Includes Arbiter mechanism for Fix Loop deadlocks and Git Reset for rollback."
---

# Fix Skill

Targeted bug fixing with audit verification. Fixes specific issues identified during verification or reported by the user, then re-audits to confirm the fix.

## ArchonFlow Core Rules

1. **Contract First Development** — design contract is the single source of truth, derived from design export, obeyed by all agents
2. **Assumption Log** — if contract doesn't specify something, record assumptions in assumptions.md; structural/visual assumptions are forbidden
3. **Design Authority has final interpretation** — disputes resolved by Authority
4. **Cognitive Isolation** — each agent sees ONLY what it needs; auditors never see source code
5. **Git Reset in Fix Loop** — commit before fix, rollback if fix makes things worse

## Usage

```
/fix "Login button doesn't navigate to dashboard"
/fix "API returns 500 on empty body"
/fix "Visual audit score 82, below threshold 95"
```

## Process

### Phase 1: Bug Analysis

1. Parse the bug description from user input
2. Read `archonflow/changes/{change-name}/verify-report.md` (if exists)
3. Read relevant audit reports from `archonflow/audits/` and `archonflow/reviews/`
4. Read relevant contracts from `archonflow/contracts/` or `archonflow/changes/`
5. Read `archonflow/changes/{change-name}/assumptions.md`
6. Identify the root cause and affected components

### Phase 2: Git Checkpoint

Before making any changes:

1. Git commit current state with message: `chore: checkpoint before fix — {bug description}`
2. Record the commit hash for potential rollback

### Phase 3: Targeted Fix

Based on bug type, invoke the appropriate engineer:

#### Visual/UX Bug → Frontend Engineer

Invoke: `@frontend-engineer`

Memory: read `archonflow/memory/frontend-engineer.md` before invocation.

Input: bug description, audit report, design contracts, relevant source code
Output: fixed source code

#### API/Backend Bug → Backend Engineer

Invoke: `@backend-engineer`

Memory: read `archonflow/memory/backend-engineer.md` before invocation.

Input: bug description, audit report, API contracts, relevant source code
Output: fixed source code

#### Cross-cutting Bug → Both Engineers

Invoke in sequence: `@backend-engineer` then `@frontend-engineer`

### Phase 4: Fix Verification

After the fix, re-run the relevant audit:

| Bug Type | Re-audit With |
|----------|--------------|
| Visual issue | `@visual-auditor` |
| API issue | `@api-integration-auditor` |
| UX issue | `@ux-compliance` |
| Code quality issue | `@code-backend-reviewer` |

If the audit passes → fix confirmed.
If the audit fails → enter Fix Loop.

### Phase 5: Fix Loop

```
Iteration 1:
  1. Engineer reads audit report + memory + contracts
  2. Engineer fixes issues
  3. Update agent memory
  4. Re-audit

Iteration 2:
  1. Engineer reads audit report + memory + contracts
  2. Engineer fixes issues
  3. Update agent memory
  4. Re-audit

Iteration 3 (Arbiter triggered):
  1. Invoke @system-architect as Arbiter
  2. Arbiter reviews contract, code, and audit reports
  3. Arbiter issues Directive
  4. Engineer follows Directive
  5. Re-audit

If still fails after Arbiter → HUMAN_INTERVENTION
```

**Git Reset Mechanism**: If a fix attempt makes things worse (score decreases), rollback to the checkpoint commit and try a different approach.

### Phase 6: Fix Report

Generate the fix report:

```markdown
# Fix Report: {change-name}

## Bug Description
{original bug description}

## Root Cause
{analysis of root cause}

## Fix Applied
{what was changed and why}

## Verification
| Auditor | Before | After | Threshold | Status |
|---------|--------|-------|-----------|--------|
| {auditor} | {before} | {after} | ≥ {threshold} | ✅/❌ |

## Fix Loop History
| Iteration | Score Change | Action |
|-----------|-------------|--------|
| 1 | {before} → {after} | {action} |

## Arbiter Directives (if any)
{Arbiter rulings}

## Assumption Updates
| # | Assumption | Change |
|---|-----------|--------|
| 1 | {assumption} | {added/resolved/modified} |
```

Save to `archonflow/changes/{change-name}/fix-report.md`

### Phase 7: Save and Track

1. Update `archonflow/changelog.md`:

```markdown
## YYYY-MM-DD — {change-name}
- Type: greenfield / incremental
- Status: 🔧 Fixed
- Fix: archonflow/changes/{change-name}/fix-report.md
```

2. Git commit with message: `fix: {bug description} — score {after}`

## Output

- Fixed source code in src/
- `archonflow/changes/{change-name}/fix-report.md` — fix report
- Updated audit reports
- Updated agent memory files
