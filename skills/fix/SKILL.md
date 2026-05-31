---
name: fix
description: "Targeted bug fixing and audit verification. Handles visual, interaction, frontend-backend logic bugs. Includes fix loop with re-audit until pass."
---

# Fix Skill

Targeted bug fixing with audit verification. Handles all types of bugs: visual, interaction, frontend logic, backend logic, and integration issues.

## ArchonFlow Core Rules

1. **Design Contract is the single source of truth** — derived from design export, obeyed by all agents
2. **No Invention Rule** — if Contract does not specify something, stop and ask Design Authority
3. **TDD Discipline (MANDATORY)** — write a failing test for the bug, then fix it
4. **Fix Loop** — fix → re-audit → repeat until pass (max 3 iterations)
5. **Cognitive Isolation** — each agent sees ONLY what it needs; auditors never see source code

## Autonomous Execution

This skill runs autonomously from start to finish. Do NOT:
- Ask "Should I fix this bug?" — FIX IT
- Ask "Should I re-audit?" — RE-AUDIT
- Ask "Should I continue to next bug?" — CONTINUE
- Pause for user confirmation between fixes

Only stop for:
- **ALL BUGS FIXED AND VERIFIED** — present final report
- **MAX ITERATIONS (3) REACHED** — report remaining issues
- **BLOCKED**: cannot reproduce bug or contract is ambiguous

## Bug Classification

| Category | Description | Fix Agent | Audit Agent |
|----------|-------------|-----------|-------------|
| **Visual** | Layout, color, spacing, typography mismatch | @frontend-engineer | @visual-auditor |
| **Interaction** | Click, hover, focus, keyboard issues | @frontend-engineer | @ux-compliance |
| **Frontend Logic** | State, data binding, routing errors | @frontend-engineer | @code-reviewer |
| **Backend Logic** | API errors, data validation, auth issues | @backend-engineer | @backend-auditor |
| **Integration** | Frontend-backend mismatch | @frontend-engineer + @backend-engineer | @integration-checker |
| **API Compliance** | API doesn't match contract | @backend-engineer | @api-compliance |

## Agent Memory

Each agent maintains a memory file for continuity across invocations.

Before invoking any agent:
1. Read `archonflow/memory/{agent-name}.md` if it exists
2. Pass the memory content as context to the subagent

After agent completes:
1. Update `archonflow/memory/{agent-name}.md` with:
   - What was fixed
   - How it was fixed
   - Tests written
   - Verification result

## Process

### Phase 1: Bug Intake

Accept bug descriptions from:
- User report (natural language)
- Failed audit report from `/verify`
- Manual testing findings

For each bug, classify:
1. Category (visual / interaction / frontend-logic / backend-logic / integration / api-compliance)
2. Severity (critical / warning / info)
3. Affected component/page
4. Expected behavior (from contract)
5. Actual behavior (observed)

### Phase 2: Bug Reproduction

1. Start dev server if not running
2. Attempt to reproduce the bug
3. If cannot reproduce: mark as "cannot reproduce" and ask user for more details
4. If reproduced: document exact reproduction steps

### Phase 3: Fix Implementation

For each bug, invoke the appropriate engineer agent:

**TDD Bug Fix Discipline:**
1. **RED** — Write a failing test that reproduces the bug
2. **Verify RED** — Run test, confirm it fails (proves bug exists)
3. **GREEN** — Write the minimum fix to make the test pass
4. **Verify GREEN** — Run test, confirm it passes; run ALL tests, confirm none broke
5. **REFACTOR** — Clean up the fix
6. **Verify** — Run all tests again

#### Visual Bugs → @frontend-engineer

Memory: read `archonflow/memory/frontend-engineer.md` before invocation.

Input: bug description, design contract, screenshot evidence, memory
Output: fixed code, test

#### Interaction Bugs → @frontend-engineer

Memory: read `archonflow/memory/frontend-engineer.md` before invocation.

Input: bug description, design contract, reproduction steps, memory
Output: fixed code, test

#### Frontend Logic Bugs → @frontend-engineer

Memory: read `archonflow/memory/frontend-engineer.md` before invocation.

Input: bug description, design contract, reproduction steps, memory
Output: fixed code, test

#### Backend Logic Bugs → @backend-engineer

Memory: read `archonflow/memory/backend-engineer.md` before invocation.

Input: bug description, API contract, data layer contract, reproduction steps, memory
Output: fixed code, test

#### Integration Bugs → @frontend-engineer + @backend-engineer

Memory: read both memory files before invocation.

Input: bug description, API contract, reproduction steps, memory
Output: fixed code on both sides, tests

#### API Compliance Bugs → @backend-engineer

Memory: read `archonflow/memory/backend-engineer.md` before invocation.

Input: bug description, API contract, compliance report, memory
Output: fixed code, test

### Phase 4: Audit Verification

After each fix, invoke the appropriate auditor to verify:

| Bug Category | Audit Agent | Threshold |
|-------------|-------------|-----------|
| Visual | @visual-auditor | ≥ 95 |
| Interaction | @ux-compliance | ≥ 90 |
| Frontend Logic | @code-reviewer | ≥ 85 |
| Backend Logic | @backend-auditor | ≥ 85 |
| Integration | @integration-checker | ≥ 90 |
| API Compliance | @api-compliance | ≥ 95 |

Memory: read and update the auditor's memory file.

### Phase 5: Fix Loop

If audit does not pass:

1. Collect remaining issues from audit
2. Invoke the appropriate engineer to fix
3. Re-audit
4. Repeat until pass or max 3 iterations

**Fix Loop Rules:**
- Maximum 3 iterations per bug
- Each iteration: fix → re-audit
- If max iterations reached, report remaining issues to user

### Phase 6: Final Report

Generate bug fix report:

```markdown
# Bug Fix Report: {change-name}

## Summary
- Total Bugs: {count}
- Fixed: {count}
- Remaining: {count}
- Date: YYYY-MM-DD HH:mm

## Bug Details

### Bug 1: {title}
- Category: {category}
- Severity: {severity}
- Status: ✅ Fixed / ❌ Remaining
- Fix: {description}
- Test: {test file path}
- Audit Score: {score}
- Iterations: {count}

{... per bug ...}

## Files Modified
| File | Change Type | Description |
|------|------------|-------------|
| {path} | FIX | {description} |

## Audit Results
| Auditor | Score | Threshold | Status |
|---------|-------|-----------|--------|
| {name} | {score}/100 | ≥{threshold} | ✅/❌ |
```

Save to: `archonflow/changes/{change-name}/fix-report.md`

### Phase 7: Save and Track

1. Update `archonflow/changelog.md`:

```markdown
## YYYY-MM-DD — {change-name}
- Type: fix
- Status: ✅ Fixed / ⚠️ Partial / ❌ Failed
- Fix Report: archonflow/changes/{change-name}/fix-report.md
- Bugs Fixed: {count}/{count}
```

2. Git commit

## Output

- Fix report: `archonflow/changes/{change-name}/fix-report.md`
- Fixed source code
- Bug reproduction tests
- Updated agent memories
- Updated changelog

## Next Step

If all bugs fixed: use `/status` to view overall project status.
If bugs remain: user may file additional `/fix` requests.
