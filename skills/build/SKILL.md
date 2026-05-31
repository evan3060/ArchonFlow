---
name: build
description: "Implement from contracts using TDD. Orchestrates frontend and backend engineers with RED-GREEN-REFACTOR discipline. Change-Based tracking."
---

# Build Skill

Implement from design contracts, API contracts, and data layer contracts using TDD. Orchestrates frontend and backend engineers.

## ArchonFlow Core Rules

1. **Design Contract is the single source of truth** — derived from design export, obeyed by all agents
2. **No Invention Rule** — if Contract does not specify something, stop and ask Design Authority
3. **TDD Discipline (MANDATORY)** — RED-GREEN-REFACTOR for every micro-task
4. **Design Authority has final interpretation** — disputes resolved by Authority
5. **Cognitive Isolation** — each agent sees ONLY what it needs; auditors never see source code

## Autonomous Execution

This skill runs autonomously from start to finish. Do NOT:
- Ask "Should I start building?" — START BUILDING
- Ask "Should I proceed to next task?" — PROCEED
- Ask "Should I run tests?" — RUN TESTS (TDD mandates it)
- Pause for user confirmation between tasks

Only stop for:
- **BLOCKED**: contracts missing or invalid
- **AMBIGUITY**: contract genuinely unclear, cannot resolve without Design Authority
- **BUILD FAILURE**: compilation/build error that cannot be self-resolved
- **ALL TESTS RED**: if all tests fail after implementation, stop and report

## Agent Memory

Each agent maintains a memory file for continuity across invocations.

Before invoking any agent:
1. Read `archonflow/memory/{agent-name}.md` if it exists
2. Pass the memory content as context to the subagent

After agent completes:
1. Update `archonflow/memory/{agent-name}.md` with:
   - What was done
   - Files created/modified
   - Tests written
   - Issues encountered
   - TDD cycle status (RED/GREEN/REFACTOR)

## Process

### Phase 1: Context Loading

1. Read proposal spec from `archonflow/changes/{change-name}/proposal.md`
2. Read design contracts from `archonflow/changes/{change-name}/design.md`
3. Read API contracts from `archonflow/changes/{change-name}/api.md`
4. Read data layer contracts from `archonflow/changes/{change-name}/data.md`
5. Read implementation plan from `archonflow/changes/{change-name}/plan.md`
6. Read `archonflow/config/project.config.json`
7. Read `archonflow/memory/` for agent memories
8. Verify dev server is running (start if needed)

### Phase 2: Data Layer Implementation

Invoke: `@backend-engineer` (data layer focus)

Memory: read `archonflow/memory/backend-engineer.md` before invocation.

The backend engineer implements the data layer:
- Database schema / migrations
- ORM models
- Seed data
- Data validation rules

**TDD Discipline:**
1. RED — Write migration/model test
2. Verify RED — Run test, confirm failure
3. GREEN — Write migration/model code
4. Verify GREEN — Run test, confirm pass
5. REFACTOR — Clean up
6. Repeat for next data entity

After completion, update `archonflow/memory/backend-engineer.md`.

### Phase 3: Backend API Implementation

Invoke: `@backend-engineer` (API focus)

Memory: read `archonflow/memory/backend-engineer.md` before invocation.

The backend engineer implements API endpoints:
- Route handlers
- Middleware
- Request validation
- Response formatting
- Error handling

**TDD Discipline:**
1. RED — Write API test for endpoint
2. Verify RED — Run test, confirm failure
3. GREEN — Write endpoint handler
4. Verify GREEN — Run test, confirm pass; run ALL tests, confirm none broke
5. REFACTOR — Clean up
6. Repeat for next endpoint

After completion, update `archonflow/memory/backend-engineer.md`.

### Phase 4: Frontend Implementation

Invoke: `@frontend-engineer`

Memory: read `archonflow/memory/frontend-engineer.md` before invocation.

The frontend engineer implements UI from design contracts:
- Components
- Pages
- State management
- API integration
- Styling

**TDD Discipline:**
1. RED — Write component test for behavior
2. Verify RED — Run test, confirm failure
3. GREEN — Write component code
4. Verify GREEN — Run test, confirm pass; run ALL tests, confirm none broke
5. REFACTOR — Clean up
6. Repeat for next component

After completion, update `archonflow/memory/frontend-engineer.md`.

### Phase 5: Integration Wiring

The orchestrator (main agent) handles integration wiring:
- Connect frontend API calls to backend endpoints
- Verify mock server matches API contract
- Run full integration smoke test
- Verify dev server renders all pages

### Phase 6: Build Self-Check

After all implementation is complete:

1. **Run all tests** — confirm all pass
2. **Build check** — confirm no compilation errors
3. **Lint check** — confirm no lint errors
4. **Dev server check** — confirm app loads
5. **Contract traceability** — every contract requirement has implementation

If any check fails, fix immediately using the same TDD discipline.

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
- Build: All tests passing ✅
```

2. Git commit

## Parallel Execution (Optional)

By default, this skill runs sequentially (data → backend → frontend).

For parallel execution:
"Use team agents for archonflow:build"

This spawns parallel Claude Code instances:
- Instance 1: Data layer + Backend API
- Instance 2: Frontend (after API contract is ready)

Requires tmux and CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS enabled.

## Output

- Implemented source code in `src/`
- Test files alongside source code
- Updated `archonflow/memory/` for all agents
- Updated `archonflow/changelog.md`
- All tests passing ✅

## Next Step

Invoke the `/verify` skill to audit implementation against contracts.
