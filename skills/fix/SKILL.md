---
name: fix
description: "Targeted bug fixing with Root Cause Gate, Diagnostic Experiment, and three-layer verification. No code changes allowed until root cause is proven through hypothesis-disprove cycle."
---

# Fix Skill

Targeted bug fixing with Root Cause Gate. The key principle: **no code changes until root cause is proven**. Fixes specific issues identified during verification or reported by the user, then verifies using Contract Assertion → VRT → Human Confirmation.

## ArchonFlow Core Rules

1. **Contract First Development** — design contract is the single source of truth, derived from design export, obeyed by all agents
2. **Assumption Log** — if contract doesn't specify something, record assumptions in assumptions.md; structural/visual assumptions are forbidden
3. **Design Authority has final interpretation** — disputes resolved by Authority
4. **Cognitive Isolation** — each agent sees ONLY what it needs; auditors never see source code
5. **Git Reset in Fix Loop** — commit before fix, rollback if fix makes things worse
6. **Three-Layer Verification** — Contract Assertion (deterministic) → VRT (perceptual) → Human (HITL)
7. **Surgical Fix Contract** — Engineer MUST fix ONLY the violations listed in the report. No refactoring, no optimization, no changes to unrelated code
8. **Memory Reset** — each fix iteration starts with a fresh agent session. Previous iteration history is NOT carried forward. Only current code + latest violation report + excluded_hypotheses.json
9. **Viewport Snippet** — violation reports passed to Engineer contain ONLY FAIL items. PASS items are omitted to save context
10. **Root Cause Gate** — no code modification allowed until root cause is proven through hypothesis-disprove cycle. Unproven root cause → HUMAN_INTERVENTION

## Usage

```
/archonflow:fix "Login button doesn't navigate to dashboard"
/archonflow:fix "API returns 500 on empty body"
/archonflow:fix "Visual audit score 82, below threshold 95"
```

## Process

### Phase 1: Bug Analysis

1. Parse the bug description from user input
2. Read `archonflow/changes/{YYYYMMDD-change-name}/verify-report.md` (if exists)
3. Read relevant audit reports from `archonflow/audits/` and `archonflow/reviews/`
4. Read relevant contracts from `archonflow/contracts/` or `archonflow/changes/{YYYYMMDD-change-name}/design/`
5. Read relevant Specs from `archonflow/specs/` — check if the bug violates any Spec Scenario
6. Read `archonflow/changes/{YYYYMMDD-change-name}/assumptions.md`
7. Read `test/vrt/diagnostics/excluded_hypotheses.json` (if exists from previous iterations)
8. Formulate initial hypotheses about root cause
9. Identify the affected components

### Phase 2: Git Checkpoint

Before making any changes:

1. Git commit current state with message: `chore: checkpoint before fix — {bug description}`
2. Record the commit hash for potential rollback

### Phase 2.5: Diagnostic Experiment

**Purpose**: Prove or disprove root cause hypotheses through controlled experiments BEFORE modifying business code.

**Authorization**: In this phase, you are explicitly authorized and encouraged to inject "destructive diagnostic code" into source files — temporary CSS overrides, element removal, style injection, DOM measurement scripts. Phase 2's Git Checkpoint guarantees a clean rollback.

```
┌─ Phase 2.5: Diagnostic Experiment ─────────────────────────┐
│                                                             │
│ Step 1: List Hypotheses                                     │
│   - List all plausible root cause hypotheses (max 5)        │
│   - Check excluded_hypotheses.json to avoid retrying        │
│     already-disproved hypotheses                            │
│                                                             │
│ Step 2: Design Experiments                                  │
│   - For each hypothesis, design a MINIMUM experiment        │
│     that can prove or disprove it                           │
│   - Preferred methods (in order):                           │
│     a. Playwright boundingBox / computedStyle measurement   │
│     b. Temporary CSS injection (border: 1px solid red,     │
│        overflow: visible, etc.)                             │
│     c. Element isolation (remove siblings, change parent)   │
│     d. Attribute toggle (FILL=0 vs FILL=1, etc.)           │
│                                                             │
│ Step 3: Execute Experiments                                 │
│   - Run experiments using Playwright or Bash                │
│   - Collect HARD DATA: boundingBox values, computed styles, │
│     screenshot evidence                                     │
│   - NEVER rely on "reading code" alone as proof            │
│                                                             │
│ Step 4: Disprove (Active Counter-Evidence)                  │
│   - For the leading hypothesis, design at least ONE         │
│     experiment that could DISPROVE it                       │
│   - Example: if "FILL=1 causes rendering bug" is the       │
│     hypothesis, test ALL icons with FILL=1, not just the    │
│     broken one                                              │
│   - If counter-evidence disproves the hypothesis,           │
│     go back to Step 1 with refined hypotheses               │
│                                                             │
│ Step 5: Output Diagnostic Report                            │
│   - Write structured report to                              │
│     test/vrt/diagnostics/diagnostic-report.json             │
│   - Update excluded_hypotheses.json                         │
│                                                             │
│ Step 6: Cleanup                                             │
│   - Run: git checkout .                                     │
│   - This erases ALL diagnostic code injected during         │
│     experiments, ensuring Phase 3 starts from a             │
│     clean state                                             │
└─────────────────────────────────────────────────────────────┘
```

**Diagnostic Report Format** (`test/vrt/diagnostics/diagnostic-report.json`):

```json
{
  "bugDescription": "Tab Bar icon clipped by text below",
  "timestamp": "2026-06-05T10:30:00Z",
  "hypotheses": [
    {
      "id": "H1",
      "description": "Box model overlap: icon.bottom > label.top",
      "experiment": "Playwright boundingBox measurement",
      "evidence": "icon.bottom=807px, label.top=809px, gap=2px — NO overlap",
      "conclusion": "DISPROVED"
    },
    {
      "id": "H2",
      "description": "Container overflow clipping",
      "experiment": "Ancestor chain overflow audit + inject overflow:visible",
      "evidence": "All ancestors have overflow:visible, no clip/contain/transform",
      "conclusion": "DISPROVED"
    },
    {
      "id": "H3",
      "description": "FILL=1 font-variation-settings causes home glyph rendering defect",
      "experiment": "FILL=0 vs FILL=1 comparison on all 5 icons",
      "evidence": "FILL=0: all icons complete; FILL=1: only home is truncated",
      "conclusion": "PARTIALLY_SUPPORTED"
    }
  ],
  "disproveExperiments": [
    {
      "targetHypothesis": "H3",
      "hypothesis": "If FILL=1 is the root cause, ALL icons should be truncated with FILL=1",
      "experiment": "Set all 5 tab icons to FILL=1, screenshot each",
      "result": "Only home truncated; other 4 icons render correctly with FILL=1",
      "conclusion": "FILL=1 alone is not sufficient; home glyph has specific sensitivity"
    }
  ],
  "rootCause": "Home icon glyph renders defectively under FILL=1 + opsz=24 combination; other icons are unaffected",
  "rootCauseProven": true,
  "provenBy": {
    "supportingEvidence": 2,
    "disproveExperiments": 1,
    "excludedHypotheses": 2
  },
  "excludedHypotheses": [
    {
      "hypothesis": "Box model overlap",
      "evidence": "boundingBox shows 2px gap",
      "disprovedAt": "2026-06-05T10:30:00Z"
    },
    {
      "hypothesis": "Container overflow clipping",
      "evidence": "All ancestors overflow:visible",
      "disprovedAt": "2026-06-05T10:35:00Z"
    }
  ]
}
```

**Excluded Hypotheses File** (`test/vrt/diagnostics/excluded_hypotheses.json`):

This file persists across Fix Loop iterations. When Memory Reset spawns a fresh Engineer, this file is the ONLY link to previous iterations — it prevents repeating already-disproved approaches.

```json
{
  "bugId": "tabbar-icon-clipped",
  "excluded": [
    {
      "hypothesis": "Box model overlap (icon.bottom > label.top)",
      "evidence": "Playwright boundingBox: icon.bottom=807, label.top=809, gap=2px",
      "disprovedAt": "2026-06-05T10:30:00Z"
    },
    {
      "hypothesis": "Container overflow clipping",
      "evidence": "Ancestor chain audit: all overflow:visible, no clip/contain/transform",
      "disprovedAt": "2026-06-05T10:35:00Z"
    }
  ]
}
```

### Phase 2.7: Root Cause Gate

**This is a hard gate. Phase 3 (Targeted Fix) MUST NOT proceed unless this gate passes.**

Check the following conditions:

| Condition | Check | On Failure |
|-----------|-------|------------|
| Diagnostic report exists | `test/vrt/diagnostics/diagnostic-report.json` file exists | → HUMAN_INTERVENTION |
| Root cause proven | `rootCauseProven === true` | → HUMAN_INTERVENTION |
| At least 1 supporting evidence | `provenBy.supportingEvidence >= 1` | → HUMAN_INTERVENTION |
| At least 1 disprove experiment | `provenBy.disproveExperiments >= 1` | → HUMAN_INTERVENTION |
| All hypotheses resolved | Every hypothesis has `conclusion: SUPPORTED` or `DISPROVED` | → Return to Phase 2.5 Step 1 |

**If gate passes**: proceed to Phase 3 with confirmed root cause.

**If gate fails**: do NOT modify code. Output the gate failure report and trigger HUMAN_INTERVENTION:

```
⚠️ ROOT CAUSE GATE FAILED

Missing: {which conditions failed}

Current hypotheses:
{list from diagnostic-report.json}

Excluded hypotheses:
{list from excluded_hypotheses.json}

Action required: Provide additional evidence or clarify root cause before code modification is allowed.
```

### Phase 3: Targeted Fix

Based on bug type, invoke the appropriate engineer:

#### Visual/UX Bug → Frontend Engineer

Invoke: `@frontend-engineer`

Memory: read `archonflow/memory/frontend-engineer.md` before invocation.

Input: confirmed root cause (from diagnostic-report.json), audit report, design contracts, relevant source code, excluded_hypotheses.json
Output: fixed source code

#### API/Backend Bug → Backend Engineer

Invoke: `@backend-engineer`

Memory: read `archonflow/memory/backend-engineer.md` before invocation.

Input: confirmed root cause (from diagnostic-report.json), audit report, API contracts, relevant source code, excluded_hypotheses.json
Output: fixed source code

#### Cross-cutting Bug → Both Engineers

Invoke in sequence: `@backend-engineer` then `@frontend-engineer``

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
  2. Engineer reads: current code + FAIL-only violation report + contracts + excluded_hypotheses.json
  3. [SURGICAL FIX CONTRACT] Engineer fixes ONLY the violations listed
  4. Re-run Phase 4 verification

Iteration 2:
  1. [MEMORY RESET] Spawn FRESH Engineer agent (no history from iteration 1)
  2. Engineer reads: current code + FAIL-only violation report + contracts + excluded_hypotheses.json
  3. [SURGICAL FIX CONTRACT] Engineer fixes ONLY the violations listed
  4. Re-run Phase 4 verification

Iteration 3 (Arbiter + Context Compress):
  1. [CONTEXT COMPRESS] Summarize iterations 1-2 into structured state:
     - What was tried
     - What failed and why
     - Current violation state
     - Max ~500 tokens
  2. Invoke @system-architect as Arbiter
  3. Arbiter reviews: compressed history + contract + code + audit reports + excluded_hypotheses.json
  4. Arbiter issues Directive
  5. [MEMORY RESET] Spawn FRESH Engineer agent
  6. Engineer reads: current code + Directive + compressed summary + excluded_hypotheses.json
  7. Re-run Phase 4 verification

If still fails after Arbiter → HUMAN_INTERVENTION
```

**Memory Reset Protocol**: Each fix iteration MUST spawn a new subagent instance. The Engineer must NOT carry conversation history from previous iterations. However, `excluded_hypotheses.json` is ALWAYS passed to the new Engineer — this is the ONLY cross-iteration link, preventing repetition of already-disproved approaches. This prevents:
- Context inflation across iterations
- Fix attempts influenced by previous failed approaches
- "Sunk cost" bias where the agent keeps trying variations of the same approach
- Repeating already-disproved hypotheses (the key anti-pattern from the TabBar incident)

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
{confirmed root cause from diagnostic-report.json}

## Diagnostic Evidence
| Hypothesis | Experiment | Evidence | Conclusion |
|------------|-----------|----------|------------|
| {H1} | {experiment} | {evidence} | DISPROVED/SUPPORTED |
| {H2} | {experiment} | {evidence} | DISPROVED/SUPPORTED |

## Disprove Experiments
| Target | Counter-Hypothesis | Result | Conclusion |
|--------|-------------------|--------|------------|
| {H2} | {counter-hypothesis} | {result} | {conclusion} |

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
- `test/vrt/diagnostics/diagnostic-report.json` — structured diagnostic report
- `test/vrt/diagnostics/excluded_hypotheses.json` — disproved hypotheses (persists across iterations)
- `archonflow/changes/{change-name}/fix-report.md` — fix report
- `test/vrt/results/contract-violation-report.md` — assertion results
- `test/vrt/results/vrt-report.md` — VRT results
- `test/vrt/results/*-three-image-context.md` — Three-Image Context (if VRT failed)
- Updated audit reports
- Updated agent memory files
