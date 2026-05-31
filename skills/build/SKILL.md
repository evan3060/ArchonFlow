---
name: build
description: "Implement contracts using TDD. Third step in the ArchonFlow pipeline. Invokes Backend Engineer and Frontend Engineer in sequence with precision context injection."
---

# Build Skill

Implement all contracts using strict TDD discipline. Build order: data → backend → frontend → integration.

## ArchonFlow Core Rules

1. **Contract First Development** — design contract is the single source of truth, derived from design export, obeyed by all agents
2. **Assumption Log** — if contract doesn't specify something, record assumptions in assumptions.md; structural/visual assumptions are forbidden
3. **Design Authority has final interpretation** — disputes resolved by Authority
4. **Cognitive Isolation** — each agent sees ONLY what it needs; auditors never see source code
5. **Precision Context Injection** — only load relevant files based on module dependency map
6. **TDD Discipline** — RED-GREEN-REFACTOR, no code before test

## Autonomous Execution

This skill runs autonomously. Do NOT:
- Ask "Should I invoke the next agent?" — INVOKE AUTOMATICALLY
- Ask "Should I continue?" — CONTINUE
- Pause between agent invocations

Only stop for:
- **MISSING INPUT**: contracts not found
- **AGENT FAILURE**: an agent returns an error
- **BUILD FAILURE**: TDD tests fail and agent cannot fix
- **CONTRACT DISPUTE**: engineer identifies a contract issue requiring Design Authority

## Process

### Phase 1: Load Context

1. Read `archonflow/changes/{change-name}/plan.md` — implementation plan
2. Read `archonflow/changes/{change-name}/analysis.md` — module dependency map
3. Read `archonflow/changes/{change-name}/design.md` — design contracts
4. Read `archonflow/changes/{change-name}/api.md` — API contracts
5. Read `archonflow/changes/{change-name}/data.md` — data layer contracts
6. Read `archonflow/changes/{change-name}/assumptions.md` — assumption log
7. Read `archonflow/config/project.config.json` for project setup

### Phase 2: Precision Context Preparation

Based on the module dependency map from analysis.md, prepare context for each agent:

For each module to be built:
1. Identify the module's direct dependencies
2. List only the files that the module depends on
3. Exclude files from unrelated modules

This prevents context window overflow and ensures agents focus on relevant code.

### Phase 3: Backend Implementation (TDD)

Invoke: `@backend-engineer`

Memory: read `archonflow/memory/backend-engineer.md` before invocation.

Input (precision context):
- API contracts from archonflow/changes/{change-name}/api.md
- Data layer contracts from archonflow/changes/{change-name}/data.md
- Mock data from archonflow/mock/
- Relevant source files from src/ (based on module dependency map)
- Existing tests from tests/ (incremental)

The backend-engineer follows TDD:
1. RED — write failing test for each API endpoint
2. Verify RED — run test, confirm failure
3. GREEN — write minimal code to pass
4. Verify GREEN — run test, confirm pass; run all tests, confirm no regression
5. REFACTOR — clean up while keeping tests green
6. Repeat for next micro-task

**Contract Dispute Protocol**: If the engineer discovers a contract issue:
1. Record the issue in assumptions.md
2. Request clarification from Design Authority via `@design-authority`
3. Wait for ruling before proceeding
4. Design Authority's ruling is final

### Phase 4: Frontend Implementation (TDD)

Invoke: `@frontend-engineer`

Memory: read `archonflow/memory/frontend-engineer.md` before invocation.

Input (precision context):
- Design contracts from archonflow/changes/{change-name}/design.md
- API contracts from archonflow/changes/{change-name}/api.md
- Design tokens from src/styles/tokens/
- Mock data from archonflow/mock/
- Relevant source files from src/ (based on module dependency map)
- Existing tests from tests/ (incremental)

The frontend-engineer follows TDD:
1. RED — write failing test for each component/interaction
2. Verify RED — run test, confirm failure
3. GREEN — write minimal code to pass
4. Verify GREEN — run test, confirm pass; run all tests, confirm no regression
5. REFACTOR — clean up while keeping tests green
6. Repeat for next micro-task

**No Invention Rule**: If the design contract doesn't specify something:
1. Do NOT guess or invent a value
2. Mark as `[UNSPECIFIED]` in code
3. Record in assumptions.md
4. Request clarification from Design Authority via `@design-authority`

### Phase 5: Integration

After both engineers complete:

1. Start the application
2. Replace mock API calls with real backend calls
3. Verify frontend ↔ backend data flow
4. Run all tests (unit + integration)
5. Fix any integration issues

### Phase 6: Build Self-Review

After build completes, perform self-review:

1. **Contract coverage** — does every contract clause have a test?
2. **Assumption validation** — are all REQUIRED assumptions resolved?
3. **Test quality** — do tests verify behavior, not just execution?
4. **Integration completeness** — are all API endpoints connected?
5. **No invention check** — are there any `[UNSPECIFIED]` markers remaining?

Fix any issues inline.

### Phase 7: Save and Track

1. Update `archonflow/changelog.md`:

```markdown
## YYYY-MM-DD — {change-name}
- Type: greenfield / incremental
- Status: 🔨 Built
- Proposal: archonflow/changes/{change-name}/proposal.md
- Design: archonflow/changes/{change-name}/design.md
- API: archonflow/changes/{change-name}/api.md
- Data: archonflow/changes/{change-name}/data.md
- Plan: archonflow/changes/{change-name}/plan.md
```

2. Git commit all changes

## Output

- Implemented source code in src/
- Test files in tests/
- Updated assumption log in archonflow/changes/{change-name}/assumptions.md
- Running application

## Next Step

Invoke the `/verify` skill to audit the implementation against contracts.
