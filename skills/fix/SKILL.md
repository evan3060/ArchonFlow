---
name: fix
description: "Targeted bug fixing with three-layer verification (Contract Assertion → VRT → Human). Includes Arbiter mechanism for Fix Loop deadlocks, Git Reset for rollback, and context control (memory reset, surgical fix, viewport snippet)."
---

# Fix Skill

Targeted bug fixing with three-layer verification. Fixes specific issues identified during verification or reported by the user, then verifies using Contract Assertion → VRT → Human Confirmation.

## ArchonFlow Core Rules

1. **Contract First Development** — design contract is the single source of truth, derived from design export, obeyed by all agents
2. **Assumption Log** — if contract doesn't specify something, record assumptions in assumptions.md; structural/visual assumptions are forbidden
3. **Design Authority has final interpretation** — disputes resolved by Authority
4. **Cognitive Isolation** — each agent sees ONLY what it needs; auditors never see source code
5. **Git Reset in Fix Loop** — commit before fix, rollback if fix makes things worse
6. **Three-Layer Verification** — Contract Assertion (deterministic) → VRT (perceptual) → Human (HITL)
7. **Surgical Fix Contract** — Engineer MUST fix ONLY the violations listed in the report. No refactoring, no optimization, no changes to unrelated code
8. **Memory Reset** — each fix iteration starts with a fresh agent session. Previous iteration history is NOT carried forward. Only current code + latest violation report
9. **Viewport Snippet** — violation reports passed to Engineer contain ONLY FAIL items. PASS items are omitted to save context

## Usage

```
/archonflow:fix "Login button doesn't navigate to dashboard"
/archonflow:fix "API returns 500 on empty body"
/archonflow:fix "Visual audit score 82, below threshold 95"
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

After the fix, detect bug type from changed files and run the appropriate verification:

**Step 1: Detect bug type from changed files**
- If changed files include .vue/.css/.scss/.less/.svg → VISUAL bug
- If changed files include .api./.route./.controller. → API bug
- Otherwise → infer from bug description

**Step 2: Run verification by bug type**

#### Visual Bug — Three-Layer Verification

```
┌─ Visual Bug Verification ──────────────────────────────────┐
│                                                            │
│ 4.1 Contract Assertion (Deterministic)                     │
│     Run: npx ts-node scripts/contract-assert.ts            │
│          <url> <assertions.json> <results-dir> --fail-only │
│     Input: contracts/assertions.json                       │
│     Output: Compact Violation Report (FAIL items only)     │
│     If ALL PASS → proceed to 4.2                           │
│     If ANY FAIL → Engineer MUST read Violation Report      │
│       and fix ONLY the violated items                      │
│       Re-run 4.1 until ALL PASS                            │
│                                                            │
│ 4.2 VRT Visual Regression (Perceptual)                     │
│     Run: npx ts-node scripts/vrt-assert.ts                 │
│          <url> [config] [results-dir]                      │
│     Input: Baseline screenshots + Actual screenshots       │
│     Output: Diff rate + Three-Image Context                │
│     If diff < 1% → proceed to 4.3                          │
│     If diff ≥ 1% → Visual Auditor reads Three-Image        │
│       Context → generates Visual_Fix_Spec                  │
│       → Engineer fixes per Visual_Fix_Spec                 │
│       → Re-run 4.1 + 4.2                                   │
│                                                            │
│ 4.3 Human Confirmation (HITL)                              │
│     If AI fix fails 2 times → HITL                         │
│     Terminal outputs screenshot paths:                      │
│       Baseline: test/vrt/baselines/{component}.png         │
│       Actual:   test/vrt/results/{component}-actual.png    │
│       Diff:     test/vrt/results/{component}-diff.png      │
│     Wait for user input:                                   │
│       y = approved, proceed                                │
│       n = rejected, enter Fix Loop                         │
│       u = update baseline (with drift warning)             │
└────────────────────────────────────────────────────────────┘
```

#### API Bug — Contract Testing

```
┌─ API Bug Verification ─────────────────────────────────────┐
│ Run: API contract tests (from archonflow/specs/)            │
│ Run: @api-integration-auditor                               │
│ If ALL PASS → fix confirmed                                 │
│ If ANY FAIL → enter Fix Loop                                │
└─────────────────────────────────────────────────────────────┘
```

#### Code Quality Bug — Code Review

```
┌─ Code Quality Verification ────────────────────────────────┐
│ Run: @code-backend-reviewer                                 │
│ If score ≥ threshold → fix confirmed                        │
│ If score < threshold → enter Fix Loop                       │
└─────────────────────────────────────────────────────────────┘
```

### Phase 5: Fix Loop

```
Iteration 1:
  1. [MEMORY RESET] Spawn FRESH Engineer agent (no history from previous work)
  2. Engineer reads: current code + FAIL-only violation report + contracts
  3. [SURGICAL FIX CONTRACT] Engineer fixes ONLY the violations listed
  4. Re-run Phase 4 verification

Iteration 2:
  1. [MEMORY RESET] Spawn FRESH Engineer agent (no history from iteration 1)
  2. Engineer reads: current code + FAIL-only violation report + contracts
  3. [SURGICAL FIX CONTRACT] Engineer fixes ONLY the violations listed
  4. Re-run Phase 4 verification

Iteration 3 (Arbiter + Context Compress):
  1. [CONTEXT COMPRESS] Summarize iterations 1-2 into structured state:
     - What was tried
     - What failed and why
     - Current violation state
     - Max ~500 tokens
  2. Invoke @system-architect as Arbiter
  3. Arbiter reviews: compressed history + contract + code + audit reports
  4. Arbiter issues Directive
  5. [MEMORY RESET] Spawn FRESH Engineer agent
  6. Engineer reads: current code + Directive + compressed summary
  7. Re-run Phase 4 verification

If still fails after Arbiter → HUMAN_INTERVENTION
```

**Memory Reset Protocol**: Each fix iteration MUST spawn a new subagent instance. The Engineer must NOT carry conversation history from previous iterations. This prevents:
- Context inflation across iterations
- Fix attempts influenced by previous failed approaches
- "Sunk cost" bias where the agent keeps trying variations of the same approach

**Surgical Fix Contract**: The Engineer agent MUST be given this explicit instruction:

> You are performing a surgical fix. You received a Violation Report listing specific failures. You are ONLY authorized to modify code that directly causes these violations. You MUST NOT:
> - Refactor any code not mentioned in the violation report
> - Optimize any code not mentioned in the violation report
> - Modify any HTML structure, CSS property, or JS logic not directly related to the violations
> - Change any code that is currently PASSING its assertions
>
> If CONTRACT-TAB_ITEM-ICON_LABEL_GAP reports a gap of 8px instead of 2px, you fix ONLY that gap. You do not touch the icon size, the label font, or the container layout unless they are also in the violation report.

**Context Compress Protocol** (Iteration 3+): Before invoking the Arbiter, compress the fix history:

```markdown
## Fix History Summary (Compressed)

### Violations (current state)
- [FAIL] CONTRACT-TAB_ITEM-ICON_LABEL_GAP: actual=8px, expected=2px
- [PASS] CONTRACT-TAB_ITEM-ICON_SIZE: 24x24

### Attempts
1. Iteration 1: Changed gap from 8px→4px via CSS. Result: gap=4px, still FAIL (expected 2px)
2. Iteration 2: Changed gap from 4px→2px via CSS. Result: gap=6px (SVG padding interference)

### Key Finding
SVG icon has internal padding (2px each side) causing effective gap to be 6px even when CSS gap=2px.

### Current Code State
File: src/components/TabBar.vue (last modified: iteration 2)
```

**Git Reset Mechanism**: If a fix attempt makes things worse (score decreases or new violations appear), rollback to the checkpoint commit and try a different approach.

**Baseline Drift Protection**: If user chooses `u` (update baseline) in HITL:
- Log to `test/vrt/changelog.vrt.md` with timestamp, component name, and diff rate
- Mark the baseline update with `[WARN] Baseline drift` tag
- This ensures intentional baseline changes are tracked and auditable

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
| Layer | Before | After | Threshold | Status |
|-------|--------|-------|-----------|--------|
| Contract Assertion | {fail count} | 0 | ALL PASS | ✅/❌ |
| VRT Diff | {before}% | {after}% | < 1% | ✅/❌ |
| Human Confirm | - | y/n | - | ✅/❌ |

## Fix Loop History
| Iteration | Score Change | Action |
|-----------|-------------|--------|
| 1 | {before} → {after} | {action} |

## Arbiter Directives (if any)
{Arbiter rulings}

## Baseline Updates (if any)
| Component | Diff Rate | Reason | Timestamp |
|-----------|-----------|--------|-----------|
| {name} | {rate}% | human_override | {ts} |

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

2. Git commit with message: `fix: {bug description} — assertion PASS, VRT diff {rate}%`

## Output

- Fixed source code in src/
- `archonflow/changes/{change-name}/fix-report.md` — fix report
- `test/vrt/results/contract-violation-report.md` — assertion results
- `test/vrt/results/vrt-report.md` — VRT results
- `test/vrt/results/*-three-image-context.md` — Three-Image Context (if VRT failed)
- Updated audit reports
- Updated agent memory files
