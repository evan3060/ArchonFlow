---
name: design
description: "Generate design contracts, API contracts, data layer contracts, and implementation plan from proposal spec. Context-aware for greenfield and incremental. Includes behavioral specs (Given/When/Then)."
---

# Design Skill

Generate all contracts and implementation plan from the proposal spec. Automatically detects greenfield vs incremental context.

## ArchonFlow Core Rules

1. **Design Contract is the single source of truth** — derived from design export, obeyed by all agents
2. **No Invention Rule** — if Contract does not specify something, stop and ask Design Authority
3. **Visual Score ≥ 95 required** — no page ships below this threshold
4. **API Compliance ≥ 95 required** — no API ships below this threshold
5. **Design Authority has final interpretation** — disputes resolved by Authority
6. **Cognitive Isolation** — each agent sees ONLY what it needs; auditors never see source code

## Autonomous Execution

This skill runs autonomously from start to finish. Do NOT:
- Ask "Should I generate the contract?" — GENERATE IT
- Ask "Should I continue to next agent?" — CONTINUE
- Ask "Proceed to API contract?" — PROCEED
- Pause for user confirmation between phases (except approval gates)

Only stop for:
- **BLOCKED**: proposal spec missing or invalid
- **AMBIGUITY**: design export genuinely unclear, Design Authority cannot resolve
- **USER APPROVAL GATE**: contracts and plan must be approved before proceeding

## Agent Memory

Each agent maintains a memory file for continuity across invocations.

Before invoking any agent:
1. Read `archonflow/memory/{agent-name}.md` if it exists
2. Pass the memory content as context to the subagent

After agent completes:
1. Update `archonflow/memory/{agent-name}.md` with:
   - What was done
   - Key decisions made
   - Files created
   - Issues encountered
   - Ambiguities found (if any)

## Context Detection

Read `archonflow/changelog.md` to determine mode:
- No existing specs → **Greenfield**: generate full contracts
- Existing specs → **Incremental**: generate delta contracts only

## Process

### Phase 1: Context Loading

1. Read proposal spec from `archonflow/changes/{change-name}/proposal.md`
2. Read `archonflow/changelog.md` for project history
3. Read `archonflow/specs/` for existing system specs (incremental)
4. Read `archonflow/memory/` for agent memories
5. Auto-discover design files from `design-references/`
6. Read `archonflow/config/project.config.json`

### Phase 2: System Architecture

Invoke: `@system-architect`

Memory: read `archonflow/memory/system-architect.md` before invocation.

The system-architect analyzes design exports and existing code to produce structural analysis.

- Greenfield: full structural analysis
- Incremental: impact analysis on existing architecture

Input: design exports, existing source code, existing specs, memory
Output: `archonflow/changes/{change-name}/analysis.md`

After completion, update `archonflow/memory/system-architect.md`.

### Phase 3: Design Authority Review

Invoke: `@design-authority`

Memory: read `archonflow/memory/design-authority.md` before invocation.

The design-authority reviews the analysis and resolves any ambiguities.

Input: design exports, analysis, proposal spec, memory
Output: clarifications (appended to analysis.md)

After completion, update `archonflow/memory/design-authority.md`.

### Phase 4: Design Contract Generation

Invoke: `@contract-generator`

Memory: read `archonflow/memory/contract-generator.md` before invocation.

The contract-generator produces formal Design Contracts with behavioral specs (Given/When/Then).

- Greenfield: full design contracts for all pages
- Incremental: delta contracts for new/modified pages only

Input: design exports, analysis, clarifications, existing contracts (incremental), memory
Output: `archonflow/changes/{change-name}/design.md`

After completion, update `archonflow/memory/contract-generator.md`.

### Phase 5: Data Layer Design

Invoke: `@data-architect`

Memory: read `archonflow/memory/data-architect.md` before invocation.

The data-architect designs database schemas, migrations, indexes, and validation rules.

- Greenfield: full schema design
- Incremental: delta schema + migration plan

Input: design contracts, API contracts (from Phase 6 if available), existing data specs (incremental), memory
Output: `archonflow/changes/{change-name}/data.md`

After completion, update `archonflow/memory/data-architect.md`.

### Phase 6: API Contract Generation

Invoke: `@api-architect`

Memory: read `archonflow/memory/api-architect.md` before invocation.

The api-architect designs API contracts with OpenAPI-level detail and behavioral specs.

- Greenfield: full API contracts
- Incremental: delta API contracts with backward compatibility declarations

Input: design contracts, data layer contracts, existing API specs (incremental), memory
Output: `archonflow/changes/{change-name}/api.md`

After completion, update `archonflow/memory/api-architect.md`.

### Phase 7: Design System Tokens

Invoke: `@design-system-guardian`

Memory: read `archonflow/memory/design-system-guardian.md` before invocation.

The design-system-guardian extracts and validates design tokens.

- Greenfield: establish base token system
- Incremental: extend existing tokens, validate consistency

Input: design contracts, existing tokens, memory
Output: `src/styles/tokens/*.css`

After completion, update `archonflow/memory/design-system-guardian.md`.

### Phase 8: Mock Data Generation

Invoke: `@mock-server-generator`

Memory: read `archonflow/memory/mock-server-generator.md` before invocation.

The mock-server-generator creates mock data covering all Given/When/Then scenarios.

Input: API contracts, design contracts, memory
Output: `archonflow/mock/`

After completion, update `archonflow/memory/mock-server-generator.md`.

### Phase 9: Implementation Plan Generation

Generate a detailed implementation plan by decomposing the design into micro-tasks:

1. Break design into tasks (each 2-5 minutes of work)
2. Each task includes:
   - Precise file paths
   - Complete code snippets
   - Verification command
   - Commit step
3. Order tasks by dependency
4. Incremental mode: mark each task's impact scope (new/modify)

Save to `archonflow/changes/{change-name}/plan.md`

### Phase 10: Design Self-Review

After all contracts are generated, perform self-review:

1. **Placeholder scan** — any TBD, TODO in contracts? Must eliminate
2. **Cross-contract consistency** — design ↔ API ↔ data layer ↔ plan
3. **Token conflicts** — new tokens vs existing tokens
4. **Incremental conflict check** — new contracts vs existing specs
5. **API backward compatibility** — no breaking changes without migration path
6. **Plan completeness** — every spec requirement has a corresponding task
7. **Given/When/Then coverage** — every interactive element has scenarios

Fix any issues inline.

### Phase 11: User Approval Gate

Present contracts to the user in sections:
1. Design contract → user confirms
2. Data layer contract → user confirms
3. API contract → user confirms
4. Implementation plan → user confirms

If changes requested, update and re-run self-review. Only proceed once all approved.

### Phase 12: Save and Track

1. All contracts saved to `archonflow/changes/{change-name}/`
2. Update `archonflow/changelog.md`:

```markdown
## YYYY-MM-DD — {change-name}
- Type: greenfield / incremental
- Status: 🎨 Designed
- Proposal: archonflow/changes/{change-name}/proposal.md
- Design: archonflow/changes/{change-name}/design.md
- API: archonflow/changes/{change-name}/api.md
- Data: archonflow/changes/{change-name}/data.md
- Plan: archonflow/changes/{change-name}/plan.md
```

3. Git commit

## Parallel Execution (Optional)

By default, this skill runs sequentially. For parallel execution:

"Use team agents for archonflow:design"

This spawns parallel Claude Code instances for independent contract generation.
Requires tmux and CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS enabled.

## Output

All contracts and supporting files:
- `archonflow/changes/{change-name}/design.md` — design contracts with behavioral specs
- `archonflow/changes/{change-name}/api.md` — API contracts with behavioral specs
- `archonflow/changes/{change-name}/data.md` — data layer contracts
- `archonflow/changes/{change-name}/plan.md` — implementation plan
- `archonflow/changes/{change-name}/analysis.md` — structural analysis
- `archonflow/mock/` — mock data
- `src/styles/tokens/` — design tokens
- `archonflow/memory/` — agent memory files
- `archonflow/changelog.md` — updated changelog

## Next Step

Invoke the `/build` skill to implement from contracts using TDD.
