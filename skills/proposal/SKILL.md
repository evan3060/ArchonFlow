---
name: proposal
description: "Collect requirements and create a proposal spec. First step in the ArchonFlow pipeline — context-aware for both greenfield and incremental projects. Uses Change-Based tracking."
---

# Proposal Skill

Collect project requirements and create a proposal spec. Automatically detects greenfield vs incremental context.

## ArchonFlow Core Rules

1. **Design Contract is the single source of truth** — derived from design export, obeyed by all agents
2. **No Invention Rule** — if Contract does not specify something, stop and ask Design Authority
3. **Design Authority has final interpretation** — disputes resolved by Authority
4. **Cognitive Isolation** — each agent sees ONLY what it needs; auditors never see source code

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
2. Check `archonflow/specs/` for existing system specs (incremental)
3. Check `archonflow/changes/` for active changes (incremental)
4. Check `archonflow/memory/` for agent memories (incremental)
5. Check `design-references/` for design files (auto-discovery)
6. Read `archonflow/config/project.config.json` for project setup

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

### Phase 3: Approach Proposal

1. Propose 2-3 approaches with trade-offs
2. Each approach includes: description, pros, cons, applicable scenarios
3. Give recommended approach with reasoning
4. User selects approach

### Phase 4: Spec Generation

Generate the proposal spec document.

#### Greenfield Spec Structure

```markdown
# Proposal: {project-name}

## Overview
{project description}

## Target Users
{user personas}

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

### Phase 5: Spec Self-Review

After generating the spec, perform self-review:

1. **Placeholder scan** — any TBD, TODO, incomplete sections? Fix them
2. **Internal consistency** — do any sections contradict each other?
3. **Scope check** — is this focused enough for a single change, or needs decomposition?
4. **Ambiguity check** — could any requirement be interpreted two ways? Make it explicit
5. **Incremental checks** (if applicable):
   - Conflict with existing specs in `archonflow/specs/`
   - Breaking change assessment
   - Regression risk validation

Fix any issues inline. No need to re-review.

### Phase 6: User Approval Gate

Present the complete spec to the user:

> "Spec written. Please review and let me know if you want to make any changes before we proceed to design."

Wait for user response. If changes requested, update spec and re-run self-review. Only proceed once user approves.

### Phase 7: Save and Track

1. Create change directory: `archonflow/changes/{change-name}/`
2. Save spec to: `archonflow/changes/{change-name}/proposal.md`
3. Initialize `archonflow/changelog.md` if it doesn't exist
4. Update `archonflow/changelog.md` with new entry:

```markdown
## YYYY-MM-DD — {change-name}
- Type: greenfield / incremental
- Status: 📋 Proposed
- Proposal: archonflow/changes/{change-name}/proposal.md
```

5. Git commit

## Output

- `archonflow/changes/{change-name}/proposal.md` — proposal spec
- `archonflow/changelog.md` — updated changelog

## Next Step

Invoke the `/design` skill to generate design contracts, API contracts, data layer contracts, and implementation plan.
