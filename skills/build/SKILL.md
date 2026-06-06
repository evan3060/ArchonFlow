---
name: build
description: "Implement contracts using TDD. Third step in the ArchonFlow pipeline. Invokes Backend Engineer and Frontend Engineer in sequence with precision context injection. Generates test skeletons from Spec Scenarios before implementation (TDD RED-GREEN-REFACTOR)."
---

# Build Skill

Implement all contracts using strict TDD discipline. Build order: tests from Spec Scenarios (RED) → data → backend → frontend → integration (GREEN).

## ArchonFlow Core Rules

1. **Contract First Development** — design contract is the single source of truth, derived from design export, obeyed by all agents
2. **Assumption Log** — if contract doesn't specify something, record assumptions in assumptions.md; structural/visual assumptions are forbidden
3. **Design Authority has final interpretation** — disputes resolved by Authority
4. **Cognitive Isolation** — each agent sees ONLY what it needs; auditors never see source code
5. **Precision Context Injection** — only load relevant files based on module dependency map
6. **TDD Discipline** — RED-GREEN-REFACTOR, no code before test
7. **Spec-Driven Testing** — test skeletons are auto-generated from Spec Scenarios (GIVEN/WHEN/THEN) before implementation begins

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

1. Read `archonflow/changes/{YYYYMMDD-change-name}/plan.md` — implementation plan
2. Read `archonflow/changes/{YYYYMMDD-change-name}/analysis.md` — module dependency map
3. Read `archonflow/changes/{YYYYMMDD-change-name}/design/design.md` — design contracts
4. Read `archonflow/changes/{YYYYMMDD-change-name}/design/api-contract.md` — API contracts
5. Read `archonflow/changes/{YYYYMMDD-change-name}/design/data-contract.md` — data layer contracts
6. Read `archonflow/changes/{YYYYMMDD-change-name}/specs/` — Delta Specs with Scenarios
7. Read `archonflow/changes/{YYYYMMDD-change-name}/tasks.md` — task breakdown
8. Read `archonflow/changes/{YYYYMMDD-change-name}/assumptions.md` — assumption log
9. Read `archonflow/config/project.config.json` for project setup

### Phase 2: Test Skeleton Generation (TDD RED)

**Purpose**: Auto-generate test skeletons from Spec Scenarios BEFORE any implementation code is written. This is the TDD RED phase — all generated tests should fail.

**Transformation Rules**:

| Spec Scenario Element | Test Code |
|----------------------|-----------|
| `GIVEN` a registered user | `beforeEach`: create test user, set up preconditions |
| `WHEN` they submit valid credentials | `it('should return token on valid login')` |
| `THEN` the system returns an access token | `expect(response.body.token).toBeDefined()` |
| `AND` redirects to the dashboard | `expect(response.headers.location).toBe('/dashboard')` |

**Process**:
1. Read all Delta Specs from `archonflow/changes/{YYYYMMDD-change-name}/specs/`
2. For each Requirement with Scenarios:
   - Generate a test file: `archonflow/changes/{YYYYMMDD-change-name}/tests/{domain}-{requirement}.spec.ts`
   - Each Scenario becomes an `it()` test case
   - GIVEN → `beforeEach` or test setup
   - WHEN → test action
   - THEN → assertions
3. Run all generated tests → confirm ALL FAIL (RED)
4. Write test report to `archonflow/changes/{YYYYMMDD-change-name}/history.md`

**Example** — From Spec Scenario to Test:

```typescript
// Spec: Requirement "Email/Password Login", Scenario "Invalid credentials"
// GIVEN a registered user
// WHEN they submit an incorrect password
// THEN the system returns a 401 error
// AND displays "Invalid email or password"
// AND does NOT reveal whether the email exists

describe('Email/Password Login', () => {
  let testUser: User;

  beforeEach(async () => {
    testUser = await createTestUser({ email: 'user@example.com' });
  });

  it('should return 401 on invalid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'wrong-password' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid email or password');
  });

  it('should not reveal whether email exists', async () => {
    const responseExisting = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'wrong' });

    const responseNonExisting = await request(app)
      .post('/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'wrong' });

    expect(responseExisting.body.message).toBe(responseNonExisting.body.message);
  });
});
```

### Phase 3: Precision Context Preparation

Based on the module dependency map from analysis.md, prepare context for each agent:

For each module to be built:
1. Identify the module's direct dependencies
2. List only the files that the module depends on
3. Exclude files from unrelated modules

This prevents context window overflow and ensures agents focus on relevant code.

### Phase 4: Backend Implementation (TDD GREEN)

Invoke: `@backend-engineer`

Memory: read `archonflow/memory/backend-engineer.md` before invocation.

Input (precision context):
- API contracts from archonflow/changes/{YYYYMMDD-change-name}/design/api-contract.md
- Data layer contracts from archonflow/changes/{YYYYMMDD-change-name}/design/data-contract.md
- Test skeletons from archonflow/changes/{YYYYMMDD-change-name}/tests/
- Mock data from archonflow/mock/
- Relevant source files from src/ (based on module dependency map)

The backend-engineer follows TDD:
1. Tests are already RED (from Phase 2)
2. GREEN — write minimal code to pass each test
3. Verify GREEN — run test, confirm pass; run all tests, confirm no regression
4. REFACTOR — clean up while keeping tests green
5. Repeat for next micro-task

**Contract Dispute Protocol**: If the engineer discovers a contract issue:
1. Record the issue in assumptions.md
2. Request clarification from Design Authority via `@design-authority`
3. Wait for ruling before proceeding
4. Design Authority's ruling is final

### Phase 5: Frontend Implementation (TDD GREEN)

Invoke: `@frontend-engineer`

Memory: read `archonflow/memory/frontend-engineer.md` before invocation.

Input (precision context):
- Design contracts from archonflow/changes/{YYYYMMDD-change-name}/design/design.md
- API contracts from archonflow/changes/{YYYYMMDD-change-name}/design/api-contract.md
- Test skeletons from archonflow/changes/{YYYYMMDD-change-name}/tests/
- Design tokens from src/styles/tokens/
- Mock data from archonflow/mock/
- Assets from archonflow/changes/{YYYYMMDD-change-name}/assets/
- Relevant source files from src/ (based on module dependency map)

The frontend-engineer follows TDD:
1. Tests are already RED (from Phase 2)
2. GREEN — write minimal code to pass each test
3. Verify GREEN — run test, confirm pass; run all tests, confirm no regression
4. REFACTOR — clean up while keeping tests green
5. Repeat for next micro-task

**No Invention Rule**: If the design contract doesn't specify something:
1. Do NOT guess or invent a value
2. Mark as `[UNSPECIFIED]` in code
3. Record in assumptions.md
4. Request clarification from Design Authority via `@design-authority`

### Phase 6: Integration

After both engineers complete:

1. Start the application
2. Replace mock API calls with real backend calls
3. Verify frontend ↔ backend data flow
4. Run all tests (unit + integration)
5. Fix any integration issues

### Phase 7: Build Self-Review

After build completes, perform self-review:

1. **Contract coverage** — does every contract clause have a test?
2. **Spec coverage** — does every Spec Scenario have a corresponding test?
3. **Assumption validation** — are all REQUIRED assumptions resolved?
4. **Test quality** — do tests verify behavior, not just execution?
5. **Integration completeness** — are all API endpoints connected?
6. **No invention check** — are there any `[UNSPECIFIED]` markers remaining?

Fix any issues inline.

### Phase 8: Save and Track

1. Update `archonflow/changelog.md`:

```markdown
## YYYY-MM-DD — {change-name}
- Type: greenfield / incremental
- Status: 🔨 Built
- Proposal: archonflow/changes/{YYYYMMDD-change-name}/proposal.md
- Design: archonflow/changes/{YYYYMMDD-change-name}/design/design.md
- API: archonflow/changes/{YYYYMMDD-change-name}/design/api-contract.md
- Data: archonflow/changes/{YYYYMMDD-change-name}/design/data-contract.md
- Plan: archonflow/changes/{YYYYMMDD-change-name}/plan.md
- Tests: archonflow/changes/{YYYYMMDD-change-name}/tests/
```

2. Git commit all changes

## Output

- Test skeletons in `archonflow/changes/{YYYYMMDD-change-name}/tests/` (from Spec Scenarios)
- Implemented source code in src/
- Updated assumption log in archonflow/changes/{YYYYMMDD-change-name}/assumptions.md
- Running application

## Next Step

Invoke the `/archonflow:verify` skill to audit the implementation against contracts and specs.
