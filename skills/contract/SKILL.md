---
name: contract
description: "Generate all contracts from design exports. Runs system-architect → design-authority → contract-generator → api-architect → mock-server-generator → design-system-guardian pipeline."
---

# Contract Generation Skill

Generate design contracts, API contracts, mock data, and design tokens from design exports.

## ArchonFlow Core Rules

1. **Design Contract is the single source of truth** — derived from design export, obeyed by all agents
2. **No Invention Rule** — if Contract does not specify something, stop and ask Design Authority
3. **Visual Score ≥ 95 required** — no page ships below this threshold
4. **API Compliance ≥ 90 required** — no backend ships below this threshold
5. **Design Authority has final interpretation** — disputes resolved by Authority
6. **Cognitive Isolation** — each agent sees ONLY what it needs; auditors never see source code

## Autonomous Execution

This skill runs autonomously from start to finish. Do NOT:
- Ask "Should I generate the contract?" — GENERATE IT
- Ask "Should I continue to next agent?" — CONTINUE
- Ask "Proceed to API contract?" — PROCEED
- Pause for user confirmation between phases

Only stop for:
- **BLOCKED**: design-source-map.json missing or invalid
- **AMBIGUITY**: design export genuinely unclear, Design Authority cannot resolve
- **ALL PHASES COMPLETE**: present contract summary

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

This ensures the same agent "remembers" what it did in previous iterations,
even though Claude Code spawns a fresh subagent each time.

## When to Use

After the `proposal` skill has mapped design files to pages. This skill produces all contracts needed for implementation.

## Process

### Phase 1: System Architect

Invoke: `@system-architect`

Memory: read `archonflow/memory/system-architect.md` before invocation.

The system-architect subagent runs in its own context window with
read-only access. It analyzes design exports and existing code to produce
structural analysis reports.

Input: design exports, existing source code, memory
Output: `archonflow/contracts/{page}.analysis.md`

After completion, update `archonflow/memory/system-architect.md`.

### Phase 2: Design Authority

Invoke: `@design-authority`

Memory: read `archonflow/memory/design-authority.md` before invocation.

The design-authority subagent reviews the analysis and resolves any
ambiguities found in the design exports. It has final say on design intent.

Input: design exports, analysis reports, memory
Output: `archonflow/contracts/{page}.clarification.md`

After completion, update `archonflow/memory/design-authority.md`.

### Phase 3: Contract Generator

Invoke: `@contract-generator`

Memory: read `archonflow/memory/contract-generator.md` before invocation.

The contract-generator subagent produces formal Design Contracts from
the analysis and clarifications. Every specification traces to a design export.

Input: design exports, analysis, clarifications, memory
Output: `archonflow/contracts/{page}.contract.md`

After completion, update `archonflow/memory/contract-generator.md`.

### Phase 4: API Architect

Invoke: `@api-architect`

Memory: read `archonflow/memory/api-architect.md` before invocation.

The api-architect subagent designs API contracts that satisfy all
frontend contract requirements. RESTful by default.

Input: design contracts, project config, memory
Output: `archonflow/contracts/api-contract.json`

After completion, update `archonflow/memory/api-architect.md`.

### Phase 5: Mock Server Generator

Invoke: `@mock-server-generator`

Memory: read `archonflow/memory/mock-server-generator.md` before invocation.

The mock-server-generator subagent creates realistic mock data and
server configuration from API contracts. Only writes to archonflow/mock/ directory.

Input: API contracts, design contracts, memory
Output: `archonflow/mock/{page}.json`, `archonflow/mock/routes.json`

After completion, update `archonflow/memory/mock-server-generator.md`.

### Phase 6: Design System Guardian

Invoke: `@design-system-guardian`

Memory: read `archonflow/memory/design-system-guardian.md` before invocation.

The design-system-guardian subagent extracts design tokens from
contracts and generates CSS custom properties. Only writes to tokens/.

Input: design contracts, existing tokens, memory
Output: `src/styles/tokens/*.css`

After completion, update `archonflow/memory/design-system-guardian.md`.

## Parallel Execution (Optional)

By default, this skill runs sequentially. For parallel execution:

"Use team agents for archonflow:contract"

This spawns parallel Claude Code instances, each generating contracts
for a different page. Requires tmux and
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS enabled.

## Output

All contracts and supporting files:
- `archonflow/contracts/{page}.contract.md` — design contracts
- `archonflow/contracts/api-contract.json` — API contract
- `archonflow/mock/` — mock data and server config
- `src/styles/tokens/` — design tokens
- `archonflow/memory/` — agent memory files

## Next Step

Invoke `frontend-building` or `backend-building` skill to implement from contracts.
