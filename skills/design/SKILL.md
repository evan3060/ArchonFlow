---
name: design
description: "Generate design contracts, API contracts, data layer contracts, and implementation plan. Second step in the ArchonFlow pipeline. Invokes System Architect, Design Authority, Data Architect, and API Architect."
---

# Design Skill

Generate all contracts and the implementation plan from the proposal spec. This is the contract generation phase — contracts are the law that all subsequent phases obey.

## ArchonFlow Core Rules

1. **Contract First Development** — design contract is the single source of truth, derived from design export, obeyed by all agents
2. **Assumption Log** — if contract doesn't specify something, record assumptions in assumptions.md; structural/visual assumptions are forbidden
3. **Design Authority has final interpretation** — disputes resolved by Authority
4. **Cognitive Isolation** — each agent sees ONLY what it needs; auditors never see source code
5. **Precision Context Injection** — only load relevant files based on module dependency map

## Autonomous Execution

This skill runs autonomously. Do NOT:
- Ask "Should I invoke the next agent?" — INVOKE AUTOMATICALLY
- Ask "Should I continue?" — CONTINUE
- Pause between agent invocations

Only stop for:
- **MISSING INPUT**: proposal spec not found
- **AGENT FAILURE**: an agent returns an error
- **USER APPROVAL GATE**: contracts must be approved before proceeding

## Process

### Phase 1: Load Context

1. Read `archonflow/changes/{YYYYMMDD-change-name}/proposal.md`
2. Read `archonflow/changes/{YYYYMMDD-change-name}/specs/` for Delta Specs from proposal phase
3. Read `archonflow/changes/{YYYYMMDD-change-name}/tasks.md` for task breakdown
4. Read `archonflow/config/project.config.json` for project setup and profile
5. Check `archonflow/specs/` for existing specs (incremental)
6. Check `archonflow/contracts/` for existing contracts (incremental)
7. Check `design-references/` for design files (auto-discovery)

### Phase 2: Structural Analysis

Invoke: `@system-architect`

Memory: read `archonflow/memory/system-architect.md` before invocation.

Input:
- Design export files from design-references/
- Proposal spec from archonflow/changes/{YYYYMMDD-change-name}/proposal.md
- Delta Specs from archonflow/changes/{YYYYMMDD-change-name}/specs/
- Existing source code in src/ (incremental)
- Existing specs from archonflow/specs/ (incremental)

Output: `archonflow/changes/{YYYYMMDD-change-name}/analysis.md`

The system-architect produces:
- Page structure and navigation hierarchy
- Component decomposition
- Shared design patterns
- Module dependency map (for precision context injection)
- Impact on existing architecture (incremental)

### Phase 3: Design Contract Generation

Invoke: `@design-authority`

Memory: read `archonflow/memory/design-authority.md` before invocation.

Input:
- Design export files from design-references/
- Proposal spec from archonflow/changes/{YYYYMMDD-change-name}/proposal.md
- Delta Specs from archonflow/changes/{YYYYMMDD-change-name}/specs/
- Structural analysis from archonflow/changes/{YYYYMMDD-change-name}/analysis.md
- Existing contracts in archonflow/contracts/ (incremental)
- Existing tokens from src/styles/tokens/ (incremental)

Output:
- `archonflow/changes/{YYYYMMDD-change-name}/design/design.md` — design contracts with behavioral specs
- `src/styles/tokens/colors.css` — color tokens
- `src/styles/tokens/typography.css` — typography tokens
- `src/styles/tokens/spacing.css` — spacing tokens
- `src/styles/tokens/shadows.css` — shadow tokens

The design-authority performs three tasks in sequence:
1. Interpret design — resolve ambiguities, clarify intent
2. Generate contract — produce formal Design Contracts with Given/When/Then specs
3. Extract tokens — generate CSS custom properties / design token files

**Contract DSL Format**: Design contracts MUST include a Layout Contract table for each component, using the structured DSL format that the Contract Compiler can parse:

```markdown
## Component: FloatingTabBar

### Selector
`.floating-tabbar`

### Layout Contract
| Property | Value | Tolerance |
|----------|-------|-----------|
| position | fixed | - |
| bottom | 0px | 1px |
| tab_count | 5 | exact |
| icon_label_alignment | center-x | 2px |
| icon_label_gap | 2px | 1px |
| icon_size | 24x24 | 1px |
| active_color | #156969 | ΔE00<5 |
```

This table format is machine-parseable by `scripts/contract-compiler.ts` and will be compiled into `assertions.json` for deterministic verification.

### Phase 4: Data Layer Design

Invoke: `@data-architect`

Memory: read `archonflow/memory/data-architect.md` before invocation.

Input:
- Design contracts from archonflow/changes/{YYYYMMDD-change-name}/design/design.md
- Proposal spec from archonflow/changes/{YYYYMMDD-change-name}/proposal.md
- Existing database schema (incremental)

Output: `archonflow/changes/{YYYYMMDD-change-name}/design/data-contract.md`

### Phase 5: API Contract Design + Mock Generation

Invoke: `@api-architect`

Memory: read `archonflow/memory/api-architect.md` before invocation.

Input:
- Design contracts from archonflow/changes/{YYYYMMDD-change-name}/design/design.md
- Data layer contracts from archonflow/changes/{YYYYMMDD-change-name}/design/data-contract.md
- Proposal spec from archonflow/changes/{YYYYMMDD-change-name}/proposal.md
- Existing API contracts from archonflow/specs/ (incremental)

Output:
- `archonflow/changes/{YYYYMMDD-change-name}/design/api-contract.md` — API contracts with behavioral specs
- `archonflow/mock/{page}.json` — mock data files
- `archonflow/mock/routes.json` — mock server route configuration

The api-architect performs two tasks in sequence:
1. Design API contracts with OpenAPI-level detail
2. Generate deterministic mock data covering all scenarios

### Phase 6: Assets Import

Auto-discover and import design assets into the change directory.

1. Scan `design-references/` for design files (Figma, Sketch, Stitch, etc.)
2. For each discovered design file:
   - Copy to `archonflow/changes/{YYYYMMDD-change-name}/assets/figma/` (or sketch/, stitch/)
   - If Figma: attempt to export screenshots and design tokens via Figma API / Token plugin
   - If Sketch: copy the .sketch file
   - If Stitch: export JSON via API
3. Check for user-provided seed data or config files → copy to `assets/seed/` or `assets/imports/`
4. Record imported assets in `archonflow/changes/{YYYYMMDD-change-name}/history.md`

**Assets Directory Structure**:
```
archonflow/changes/{YYYYMMDD-change-name}/assets/
├── figma/                  # Figma exports (auto)
│   ├── auth-page.fig       # Original Figma file
│   ├── auth-page.png       # Exported design screenshot
│   └── auth-page.tokens.json # Exported design tokens
├── sketch/                 # Sketch exports (auto)
├── seed/                   # Seed data (user-provided or script-generated)
│   └── users.json
└── imports/                # Other imported resources
    └── google-oauth-config.json
```

If no design files are found, skip this phase and note in assumptions.md.

### Phase 7: Implementation Plan

After all agents complete, synthesize the implementation plan.

Read the module dependency map from analysis.md. Use it to:
1. Determine build order (data → backend → frontend)
2. Identify parallel opportunities (independent modules)
3. Define precision context for each build step

Generate `archonflow/changes/{YYYYMMDD-change-name}/plan.md`:

```markdown
# Implementation Plan: {change-name}

## Module Dependency Map
| Module | Depends On | Build Order |
|--------|-----------|-------------|
| {module} | {deps} | {order} |

## Build Sequence

### Step 1: Data Layer
- Files: {list from data.md}
- Context: data.md, design.md

### Step 2: Backend API
- Files: {list from api.md}
- Context: api.md, data.md, mock/
- TDD: RED-GREEN-REFACTOR

### Step 3: Frontend UI
- Files: {list from design.md}
- Context: design.md, api.md, tokens/, mock/
- TDD: RED-GREEN-REFACTOR

### Step 4: Integration
- Connect frontend ↔ backend
- Replace mock with real API calls

## Micro-tasks
{detailed task breakdown per step}
```

### Phase 8: Assumption Log

Create `archonflow/changes/{YYYYMMDD-change-name}/assumptions.md`:

```markdown
# Assumption Log: {change-name}

## Design Assumptions
| # | Assumption | Type | Rationale | Status |
|---|-----------|------|-----------|--------|
| 1 | {assumption} | REQUIRED/OPTIONAL | {why} | PENDING |

## Implementation Assumptions
| # | Assumption | Type | Rationale | Status |
|---|-----------|------|-----------|--------|
| 1 | {assumption} | REQUIRED/OPTIONAL | {why} | PENDING |

## Classification
- **REQUIRED**: Must be validated before build; wrong assumption = rework
- **OPTIONAL**: Nice-to-have assumption; wrong assumption = minor adjustment
- **FORBIDDEN**: Structural/visual assumptions are never allowed — ask Design Authority
```

### Phase 9: Contract Self-Review

After generating all contracts, perform self-review:

1. **Cross-contract consistency** — do design, API, and data contracts align?
2. **Behavioral spec completeness** — does every interaction have Given/When/Then?
3. **Token completeness** — are all design values captured as tokens?
4. **Mock coverage** — do mocks cover all contract scenarios?
5. **Incremental compatibility** — do new contracts conflict with existing specs?
6. **Assumption boundary** — are any assumptions crossing forbidden territory?
7. **Layout Contract DSL completeness** — does every visual component have a Layout Contract table with selector, properties, and tolerances?

Fix any issues inline.

### Phase 9.5: Contract Compilation

Compile the Layout Contract DSL tables into machine-executable assertions:

```bash
npx ts-node scripts/contract-compiler.ts \
  archonflow/changes/{YYYYMMDD-change-name}/design/design.md \
  archonflow/changes/{YYYYMMDD-change-name}/assertions.json
```

This produces `assertions.json` which will be used by:
- `contract-assert.ts` for deterministic verification in the build and fix phases
- Visual Auditor for Layer 1 verification

If compilation produces warnings (e.g., unrecognized property types), fix the DSL tables in design.md and re-compile.

### Phase 9.6: Feasibility Check

Before proceeding to user approval, run the feasibility check:

```bash
npx ts-node scripts/feasibility-check.ts \
  archonflow/changes/{YYYYMMDD-change-name}/design/design.md \
  archonflow/config/project.config.json
```

This checks:
1. **Token consistency** — do referenced CSS custom properties exist?
2. **Platform constraints** — are specified features supported on the target platform?
3. **Selector validity** — can the specified CSS selectors resolve?
4. **Contract conflicts** — do new contracts conflict with existing ones?
5. **Behavioral spec completeness** — do interactive elements have Given/When/Then?

If any FAIL items → fix the contract and re-run.
If only WARNING items → document in assumptions.md and proceed.

### Phase 10: User Approval Gate

Present the contracts summary to the user:

> "Contracts generated. Key decisions: {list}. Please review and let me know if you want to make any changes before we proceed to build."

Wait for user response. Only proceed once user approves.

### Phase 11: Save and Track

1. Copy contracts to `archonflow/contracts/` for centralized access
2. Update `archonflow/changelog.md`:

```markdown
## YYYY-MM-DD — {change-name}
- Type: greenfield / incremental
- Status: 🎨 Designed
- Proposal: archonflow/changes/{YYYYMMDD-change-name}/proposal.md
- Design: archonflow/changes/{YYYYMMDD-change-name}/design/design.md
- API: archonflow/changes/{YYYYMMDD-change-name}/design/api-contract.md
- Data: archonflow/changes/{YYYYMMDD-change-name}/design/data-contract.md
- Plan: archonflow/changes/{YYYYMMDD-change-name}/plan.md
- Assets: archonflow/changes/{YYYYMMDD-change-name}/assets/
```

3. Git commit

## Output

- `archonflow/changes/{YYYYMMDD-change-name}/analysis.md` — structural analysis with module dependency map
- `archonflow/changes/{YYYYMMDD-change-name}/design/design.md` — design contracts with behavioral specs + Layout Contract DSL
- `archonflow/changes/{YYYYMMDD-change-name}/design/api-contract.md` — API contracts with behavioral specs
- `archonflow/changes/{YYYYMMDD-change-name}/design/data-contract.md` — data layer contracts
- `archonflow/changes/{YYYYMMDD-change-name}/assertions.json` — compiled assertions from Contract Compiler
- `archonflow/changes/{YYYYMMDD-change-name}/plan.md` — implementation plan with micro-tasks
- `archonflow/changes/{YYYYMMDD-change-name}/assumptions.md` — assumption log
- `archonflow/changes/{YYYYMMDD-change-name}/assets/` — imported design assets
- `src/styles/tokens/*.css` — design token files
- `archonflow/mock/*.json` — mock data files

## Next Step

Invoke the `/archonflow:build` skill to implement the contracts using TDD.
