---
name: proposal
description: "Collect requirements, create proposal spec with domain modeling, and generate Delta Specs (behavioral specifications). First step in the ArchonFlow pipeline — context-aware for both greenfield and incremental projects. Uses Change-Based tracking with OpenSpec Delta format."
---

# Proposal Skill

Collect project requirements, perform domain modeling, create proposal spec, and generate Delta Specs (behavioral specifications with GIVEN/WHEN/THEN scenarios). Automatically detects greenfield vs incremental context.

## ArchonFlow Core Rules

1. **Contract First Development** — design contract is the single source of truth, derived from design export, obeyed by all agents
2. **Assumption Log** — if contract doesn't specify something, record assumptions in assumptions.md; structural/visual assumptions are forbidden
3. **Design Authority has final interpretation** — disputes resolved by Authority
4. **Cognitive Isolation** — each agent sees ONLY what it needs; auditors never see source code
5. **Spec-Driven Development** — every feature MUST have behavioral specifications (SHALL/MUST + GIVEN/WHEN/THEN) before implementation begins

## Autonomous Execution

This skill runs autonomously except for user interaction points. Do NOT:
- Ask "Should I scan for design files?" — SCAN AUTOMATICALLY
- Ask "Should I continue?" — CONTINUE
- Pause for user confirmation between steps (except where explicitly noted)

Only stop for:
- **BLOCKED**: no design files found in the project (greenfield) and no user input
- **AMBIGUITY**: multiple possible interpretations, need user clarification
- **USER APPROVAL GATE**: Spec must be approved before proceeding

## Context Detection

At the start, detect the project context:

| Condition | Mode | Behavior |
|-----------|------|----------|
| `archonflow/changelog.md` does NOT exist | **Greenfield** | Deep Q&A (5-10 questions) |
| `archonflow/changelog.md` exists | **Incremental** | Quick confirm (2-3 questions) |

## Process

### Phase 1: Context Probe

1. Check if `archonflow/changelog.md` exists → determine mode
2. Check `archonflow/specs/` for existing behavioral specs (incremental)
3. Check `archonflow/changes/` for active changes (incremental)
4. Check `archonflow/memory/` for agent memories (incremental)
5. Check `design-references/` for design files (auto-discovery)
6. Read `archonflow/config/project.config.json` for project setup and profile

### Phase 2: Requirements Clarification

#### Greenfield Mode (5-10 questions, one at a time)

Ask one question at a time, prefer multiple choice:
1. What is the project goal?
2. Who are the target users?
3. What are the core features?
4. What is the preferred tech stack?
5. What is the design source? (Figma / Sketch / Stitch / Description)
6. What are the boundary conditions?
7. What are the success criteria?
8. Any non-functional requirements? (performance, security, accessibility)
9. Any constraints or preferences?
10. What is the priority order of features?

#### Incremental Mode (2-3 questions, one at a time)

1. Feature description — what are you adding/changing?
2. Impact scope — which existing pages/APIs are affected?
3. Relationship to existing features — dependencies or conflicts?

### Phase 3: Domain Modeling

Before proposing approaches, identify the core domain concepts:

1. List the key domain entities (e.g., User, Order, Product)
2. Define relationships between entities (1:1, 1:N, N:M)
3. Identify the core business rules and invariants
4. Map domain concepts to pages/APIs

This step ensures the proposal is grounded in business reality, not just UI features.

### Phase 4: Approach Proposal

1. Propose 2-3 approaches with trade-offs
2. Each approach includes: description, pros, cons, applicable scenarios
3. Give recommended approach with reasoning
4. User selects approach

### Phase 5: Proposal Generation

Generate the proposal spec document.

#### Greenfield Spec Structure

```markdown
# Proposal: {project-name}

## Overview
{project description}

## Target Users
{user personas}

## Domain Model
### Core Entities
| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| {name} | {description} | {attributes} |

### Entity Relationships
| From | To | Type | Description |
|------|-----|------|-------------|
| {entity} | {entity} | 1:N | {description} |

### Business Rules
1. {rule}
2. {rule}

## Feature List
1. {feature} — {description} (Priority: P0/P1/P2)

## Tech Stack
- Framework: {framework}
- Language: {language}
- Styling: {styling}
- State Management: {state}
- Backend: {backend}

## Design Source
- Tool: {figma/sketch/stitch/description}
- Files: {file list or auto-discovery}

## Pages
| Page | Description | Priority |
|------|-------------|----------|
| {name} | {description} | P0/P1/P2 |

## Success Criteria
1. {criterion}
2. {criterion}

## Non-Functional Requirements
- Performance: {requirement}
- Security: {requirement}
- Accessibility: WCAG 2.1 AA
```

#### Incremental Spec Structure

```markdown
# Proposal: {feature-name}

## Feature Description
{what is being added/changed}

## Domain Impact
### New/Modified Entities
| Entity | Change Type | Description |
|--------|------------|-------------|
| {name} | NEW/MODIFY | {description} |

### New/Modified Business Rules
1. {rule}

## Incremental Impact Analysis
### New Pages/Components
| Page/Component | Description |
|----------------|-------------|
| {name} | {description} |

### Modified Existing Files
| File | Change Type | Description |
|------|------------|-------------|
| {path} | ADD/MODIFY | {description} |

### Affected APIs
| Endpoint | Change Type | Description |
|----------|------------|-------------|
| {path} | ADD/MODIFY/DEPRECATE | {description} |

## Dependencies
- Depends on: {existing feature}
- Blocks: {future feature}

## Success Criteria
1. {criterion}
2. {criterion}

## Regression Risk
- Risk level: LOW/MEDIUM/HIGH
- Affected areas: {list}
```

Present spec in sections, get user confirmation after each section.

### Phase 6: Spec Generation (Delta Specs)

**Purpose**: Extract behavioral specifications from the proposal. Every feature and business rule MUST have formal Requirements with testable Scenarios.

**Transformation Rules**:

| Proposal Content | Spec Format |
|-----------------|-------------|
| "用户可以登录" | `### Requirement: User Login` + Scenario |
| "登录失败不超过5次" | `### Requirement: Rate Limiting` + Scenario |
| "支付超时自动取消" | `### Requirement: Payment Timeout` + Scenario |
| Business Rule | `The system SHALL ...` |
| Success Criterion | `#### Scenario: ...` GIVEN/WHEN/THEN |

**Delta Format** (OpenSpec convention):

For **greenfield** projects, all Requirements use `## ADDED Requirements`.

For **incremental** projects, classify each change:
- `## ADDED Requirements` — new features or capabilities
- `## MODIFIED Requirements` — updates to existing behavior (include complete updated text)
- `## REMOVED Requirements` — features being deleted

**Each Requirement MUST**:
1. Use `SHALL` or `MUST` keyword (EARS-style)
2. Have at least one `#### Scenario:` with GIVEN/WHEN/THEN structure
3. Be atomic — one behavior per Requirement

**Example** — Proposal says "支持邮箱密码和 Google OAuth 登录，失败5次后锁定15分钟":

```markdown
## ADDED Requirements

### Requirement: Email/Password Login
The system SHALL allow users to authenticate with registered email and password.

#### Scenario: Successful login
- **GIVEN** a registered user with email `user@example.com`
- **WHEN** they submit valid credentials
- **THEN** the system returns an access token
- **AND** redirects to the dashboard

#### Scenario: Invalid credentials
- **GIVEN** a registered user
- **WHEN** they submit an incorrect password
- **THEN** the system returns a 401 error
- **AND** displays "Invalid email or password"
- **AND** does NOT reveal whether the email exists

### Requirement: OAuth Login
The system SHALL support Google OAuth login.

#### Scenario: First-time OAuth login
- **GIVEN** a user who has never logged in before
- **WHEN** they complete the OAuth flow with Google
- **THEN** the system creates a new account linked to their Google identity

### Requirement: Login Rate Limiting
The system SHALL lock login attempts for 15 minutes after 5 consecutive failures.

#### Scenario: Account lockout
- **GIVEN** a user who has failed login 4 times
- **WHEN** they submit an incorrect password for the 5th time
- **THEN** the account is locked for 15 minutes
- **AND** subsequent login attempts return "Account temporarily locked"
```

**Output**: Write Delta Specs to `archonflow/changes/{YYYYMMDD-change-name}/specs/{domain}/spec.md`

### Phase 7: Task Breakdown

**Purpose**: Break Delta Specs into atomic, verifiable implementation tasks. Each task MUST trace back to a Spec Requirement + Scenario.

**Task Format**:

```markdown
# Tasks: {change-name}

## Task 1: Email/Password Login API
- [ ] Create POST /auth/login endpoint
- [ ] Validate email format and password hash
- [ ] Return JWT access + refresh tokens
- **Verifies**: Requirement "Email/Password Login", Scenario "Successful login"

## Task 2: Login Error Handling
- [ ] Return 401 for invalid credentials
- [ ] Generic error message (no email existence leak)
- **Verifies**: Requirement "Email/Password Login", Scenario "Invalid credentials"

## Task 3: Google OAuth Integration
- [ ] Add Google OAuth provider configuration
- [ ] Handle OAuth callback
- [ ] Auto-create account for first-time users
- **Verifies**: Requirement "OAuth Login", Scenario "First-time OAuth login"

## Task 4: Rate Limiting
- [ ] Track failed login attempts per account
- [ ] Lock after 5 consecutive failures for 15 minutes
- [ ] Return locked status in login response
- **Verifies**: Requirement "Login Rate Limiting", Scenario "Account lockout"
```

**Output**: Write to `archonflow/changes/{YYYYMMDD-change-name}/tasks.md`

### Phase 8: Self-Review

After generating proposal + specs + tasks, perform self-review:

1. **Placeholder scan** — any TBD, TODO, incomplete sections? Fix them
2. **Internal consistency** — do any sections contradict each other?
3. **Scope check** — is this focused enough for a single change, or needs decomposition?
4. **Ambiguity check** — could any requirement be interpreted two ways? Make it explicit
5. **Domain model completeness** — are all core entities and relationships captured?
6. **Spec completeness** — does every feature have at least one Requirement with Scenario?
7. **Task traceability** — does every task reference a Spec Requirement + Scenario?
8. **Delta format correctness** — are ADDED/MODIFIED/REMOVED headers used correctly?
9. **Incremental checks** (if applicable):
   - Conflict with existing specs in `archonflow/specs/`
   - Breaking change assessment
   - Regression risk validation

Fix any issues inline. No need to re-review.

### Phase 9: User Approval Gate

Present the complete spec to the user:

> "Spec written. Proposal + Delta Specs + Tasks generated. Please review and let me know if you want to make any changes before we proceed to design."

Wait for user response. If changes requested, update spec and re-run self-review. Only proceed once user approves.

### Phase 10: Save and Track

1. Create change directory: `archonflow/changes/{YYYYMMDD-change-name}/`
2. Save proposal to: `archonflow/changes/{YYYYMMDD-change-name}/proposal.md`
3. Save Delta Specs to: `archonflow/changes/{YYYYMMDD-change-name}/specs/{domain}/spec.md`
4. Save tasks to: `archonflow/changes/{YYYYMMDD-change-name}/tasks.md`
5. Initialize `archonflow/changelog.md` if it doesn't exist
6. Update `archonflow/changelog.md` with new entry:

```markdown
## YYYY-MM-DD — {change-name}
- Type: greenfield / incremental
- Status: 📋 Proposed
- Proposal: archonflow/changes/{YYYYMMDD-change-name}/proposal.md
- Specs: archonflow/changes/{YYYYMMDD-change-name}/specs/
- Tasks: archonflow/changes/{YYYYMMDD-change-name}/tasks.md
```

7. Git commit

## Output

- `archonflow/changes/{YYYYMMDD-change-name}/proposal.md` — proposal spec with domain model
- `archonflow/changes/{YYYYMMDD-change-name}/specs/{domain}/spec.md` — Delta Specs (behavioral specifications)
- `archonflow/changes/{YYYYMMDD-change-name}/tasks.md` — task breakdown with Spec traceability
- `archonflow/changelog.md` — updated changelog

## Next Step

Invoke the `/archonflow:design` skill to generate design contracts, API contracts, data layer contracts, and implementation plan.
