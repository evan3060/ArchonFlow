# ArchonFlow

**Multi-Agent Full-Stack Delivery Pipeline** — A project-agnostic, multi-agent governance system with TDD, Change-Based Architecture, and Two-Stage Review. Enforces design fidelity, API compliance, and code quality through cognitive isolation and contract-driven development.

[中文文档](./README.zh-CN.md)

---

## The Problem

AI coding agents can write code, but they don't know when they've written it **correctly**. There are two worlds:

- **Design Truth** — what the designer intended (from Figma, Stitch, v0, etc.)
- **Code Truth** — what the AI actually implemented

These worlds naturally diverge. AI models drift toward statistically common values: `12px` radius instead of `32px`, `#ffffff` instead of `#f9f9ff`, system font instead of the specified typeface. These deviations don't cause errors, but users notice them immediately.

The same problem applies to backend APIs — contracts get written, but implementations drift from the specification.

**ArchonFlow closes these gaps by making design intent and API contracts machine-verifiable through isolated, specialized agents.**

---

## Core Idea

```
Design Export (any tool)
        ↓
  ┌─ /archonflow:proposal ──────────────────────────────────┐
  │  Context Probe        ← Greenfield vs Incremental       │
  │  Requirements Q&A     ← Socratic clarification          │
  │  Domain Modeling      ← Core entities & relationships   │
  │  Approach Proposal    ← 2-3 options with trade-offs     │
  │  Spec Generation      ← Proposal document               │
  └─────────────────────────────────────────────────────────┘
        ↓
  ┌─ /archonflow:design ─────────────────────────────────────┐
  │  System Architect     ← Architecture, modules, Arbiter  │
  │  Design Authority     ← Interpret → Contract → Tokens   │
  │  Data Architect       ← Database schema, migrations     │
  │  API Architect        ← API contracts + Mock data       │
  │  Assumption Log       ← Track implementation assumptions│
  │  Implementation Plan  ← Micro-task decomposition        │
  └─────────────────────────────────────────────────────────┘
        ↓
  ┌─ /archonflow:build ─────────────────────────────────────┐
  │  Backend Engineer     ← Data layer + API (TDD)          │
  │  Frontend Engineer    ← UI implementation (TDD)         │
  │  Integration Wiring   ← Frontend ↔ Backend connection   │
  └─────────────────────────────────────────────────────────┘
        ↓
  ┌─ /archonflow:verify ─────────────────────────────────────┐
  │  Stage 1: Spec Compliance                               │
  │    Visual Auditor      ← Visual fidelity (≥95)          │
  │    API & Integration   ← API match + Integration (≥95)  │
  │    UX Compliance       ← Interaction & a11y (≥90)       │
  │  Stage 2: Code Quality                                  │
  │    Code & Backend      ← Quality + Security (≥85)       │
  │  Fix Loop: fail → fix → re-audit (max 3 iterations)    │
  │  Arbiter: System Architect resolves deadlocks           │
  └─────────────────────────────────────────────────────────┘
        ↓
  ┌─ /archonflow:fix "<bug>" ───────────────────────────────┐
  │  Bug Analysis         ← Root cause from audit reports   │
  │  Git Checkpoint       ← Commit before fix (rollback)    │
  │  Targeted Fix         ← Frontend/Backend Engineer       │
  │  Re-audit             ← Verify fix passes threshold     │
  │  Fix Loop             ← Max 3 iterations + Arbiter      │
  │  Git Reset            ← Rollback if fix makes worse     │
  └─────────────────────────────────────────────────────────┘

  ┌─ /archonflow:status ────────────────────────────────────┐
  │  Pipeline Progress     ← Change status per phase        │
  │  Audit Scores          ← All auditor scores vs thresh   │
  │  Changelog             ← Full history of changes        │
  └─────────────────────────────────────────────────────────┘
        ↓
  Ship
```

---

## What's New in v0.3

| Feature | Description |
|---------|-------------|
| **Agent Consolidation (15→10)** | Merged same-perspective agents to reduce context switching while preserving cognitive isolation |
| **Design Authority (merged)** | Design interpretation + Contract generation + Token extraction in one agent |
| **API & Integration Auditor (merged)** | API compliance + Integration testing unified as black-box testing |
| **Code & Backend Reviewer (merged)** | Code quality + Backend audit unified as white-box review |
| **API Architect + Mock (merged)** | API contract design + Mock data generation in one workflow |
| **Arbiter Mechanism** | System Architect resolves Fix Loop deadlocks with binding Directives |
| **Assumption Log** | Track implementation assumptions with REQUIRED/OPTIONAL/FORBIDDEN classification |
| **Precision Context Injection** | Module dependency map ensures agents only load relevant files |
| **Git Reset in Fix Loop** | Auto-commit before fix; rollback if fix makes things worse |
| **Visual Audit Separation** | Scripts compute differences (CIEDE2000, pixel diff), LLM only interprets results |
| **Project Profiles** | Enterprise/Normal/Internal presets with different threshold levels |
| **Contract Dispute Protocol** | Build agents can challenge contracts; Design Authority has final say |

---

## The "No Invention" Rule

This is the most critical rule in the framework:

> **If the Design Contract does not specify something, the Frontend Engineer MUST NOT invent it. The Engineer MUST stop and ask the Design Authority for clarification.**

This rule exists to counteract AI's statistical drift toward "common" values:

| Contract Specifies | AI Typically Generates | Why |
|--------------------|-----------------------|-----|
| `border-radius: 32px` | `border-radius: 12px` | 12px is more common in training data |
| `#f9f9ff` | `#ffffff` | Pure white is the default |
| Custom font | System font | System font is the fallback |
| Custom navigation | Standard navigation | Standard patterns are more common |

The same principle applies to backend: **If the API contract specifies a response schema, the Backend Engineer MUST NOT deviate from it.**

However, the "No Invention" rule is softened by the **Assumption Log** — engineers can record implementation assumptions for later review, rather than blocking on every unspecified detail. Structural and visual assumptions remain strictly forbidden.

---

## Design Source Modes

ArchonFlow supports two modes, decided during the proposal phase:

### Mode A: External Design (recommended)

You have design exports from Figma, Stitch, v0, or similar tools.

- Full pipeline: Visual Audit + UX Compliance + Code Review
- Visual Score ≥ 95 required to ship
- Place exports in `design-references/`

### Mode B: Default Design (no external design)

No design tool exports available. You describe the page structure.

- Simplified pipeline: Code Review only (no Visual/UX audit)
- Design Authority generates structural contracts from your descriptions
- Focus on functional correctness, not visual fidelity

---

## Pipeline Skills

| Skill | Command | What It Does |
|-------|---------|-------------|
| Init | `/archonflow:init` | Initialize directory structure, copy runtime files, configure project |
| Proposal | `/archonflow:proposal` | Context-aware Q&A → proposal spec (greenfield/incremental) |
| Design | `/archonflow:design` | Generate design contracts, API contracts, data layer, plan |
| Build | `/archonflow:build` | Implement with TDD (data → backend → frontend) |
| Verify | `/archonflow:verify` | Two-stage audit with Fix Loop and Arbiter |
| Fix | `/archonflow:fix "<description>"` | Targeted bug fix with audit verification |
| Status | `/archonflow:status` | Show pipeline progress, scores, changelog |

---

## Agent Council — 10 Agents

### Design Phase

| Agent | Role | Sees | Never Sees |
|-------|------|------|------------|
| System Architect | Architecture + Arbiter | contracts, src/ | design-references/ |
| Design Authority | Interpret → Contract → Tokens | design-references, contracts | src/ |
| Data Architect | Database schema & migrations | contracts | src/, design-references/ |
| API Architect | API contracts + Mock data | contracts | src/, design-references/ |

### Build Phase

| Agent | Role | Sees | Never Sees |
|-------|------|------|------------|
| Frontend Engineer | UI implementation (TDD) | contracts, tokens, src, audits | design-references/ |
| Backend Engineer | API implementation (TDD) | contracts, mock, audits | design-references/, frontend src/ |

### Verify Phase

| Agent | Role | Sees | Never Sees |
|-------|------|------|------------|
| Visual Auditor | Visual fidelity | contracts, running app | **src/** |
| API & Integration Auditor | API compliance + Integration | contracts, running app | **src/** |
| UX Compliance | Interaction & a11y | contracts, running app | **src/** |
| Code & Backend Reviewer | Code quality + Backend audit | src/, contracts | — |

---

## Cognitive Isolation

This is the key insight that separates ArchonFlow from "just using multiple prompts":

> **Agent isolation ≠ Prompt isolation**
>
> Agent isolation = **Cognitive isolation** + Permission isolation + Context isolation

Most AI coding teams do this:

```
Frontend Agent  ─┐
Backend Agent   ─┤── Same context, same repo, same cognition
QA Agent        ─┘
```

That's one model with three names — no real checks and balances.

ArchonFlow enforces **cognitive isolation** through Claude Code's native Subagent system:

**How Subagents provide true isolation:**

Each `@agent-name` invocation spawns a **new subagent** with:
- Its own context window (no shared memory with other agents)
- Restricted tools (auditors have no Write/Edit — they physically cannot modify code)
- Its own system prompt (loaded from the agent's .md definition)

**Why Visual Auditor must NOT see source code:**

If an auditor sees `border-radius: 16px` in the code, it creates cognitive bias: *"maybe the developer intended this."* Without source code access, the auditor can only compare what it **sees** (screenshots, DOM) against the Contract — exactly like a real user would.

**Why API & Integration Auditor must NOT see source code:**

Same principle. It tests the API from the outside, like a real client. It can't be influenced by seeing how the backend was implemented — only whether the API behaves as contracted.

**Why Frontend Engineer must NOT see design exports:**

If the engineer sees the original design file, they'll "just copy" instead of following the Contract. The Contract exists to eliminate ambiguity — bypassing it defeats the purpose.

---

## Subagent Architecture

ArchonFlow uses Claude Code's native Subagent system. Each agent is defined in `agents/*.md` with YAML frontmatter that controls tools, model, and permissions.

### Setup

1. Add the plugin marketplace and install:
```bash
/plugin marketplace add evan3060/ArchonFlow
/plugin install archonflow
```

2. Initialize the project:
```bash
/archonflow:init
```

This creates the directory structure, copies runtime files, and configures the project. After that, use `/archonflow:proposal` or any skill.

### How It Works

When a Skill invokes `@agent-name`:
1. Claude Code spawns a **new subagent** with its own context window
2. The subagent loads its .md definition (tools, rules, mission)
3. It works in isolation — cannot see files outside its scope
4. It returns results to the parent conversation
5. The parent invokes the next subagent

### Agent Tool Permissions

| Agent | Tools | Can Write? | Key Restriction |
|-------|-------|-----------|-----------------|
| system-architect | Read, Grep, Glob, LS | ❌ | Read-only; Arbiter role |
| design-authority | Read, Grep, Glob, LS, Write, Edit | ✅ contracts, tokens | No src/ access |
| data-architect | Read, Grep, Glob, Write | ✅ data contracts | No src/ access |
| api-architect | Read, Grep, Glob, Write | ✅ API contracts, mock | No src/ access |
| frontend-engineer | Read, Grep, Glob, LS, Write, Edit, Bash | ✅ src/ | Full dev tools |
| backend-engineer | Read, Grep, Glob, LS, Write, Edit, Bash | ✅ backend/ | Full dev tools |
| visual-auditor | Read, Grep, Glob, Bash | ❌ | **No Write/Edit** |
| api-integration-auditor | Read, Grep, Glob, Bash | ❌ | **No Write/Edit** |
| ux-compliance | Read, Grep, Glob, Bash | ❌ | **No Write/Edit** |
| code-backend-reviewer | Read, Grep, Glob, Bash | ❌ | **No Write/Edit** |

### Agent Team Mode (Experimental)

For parallel execution (e.g., building multiple pages simultaneously), you can request Agent Teams:

```
Use team agents for archonflow:build
```

This spawns multiple Claude Code instances in tmux panes, each running independently. Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` enabled.

---

## TDD Discipline (MANDATORY)

All implementation agents follow RED-GREEN-REFACTOR:

1. **RED** — Write a failing test that describes the expected behavior
2. **Verify RED** — Run the test, confirm it fails for the right reason
3. **GREEN** — Write the minimum code to make the test pass
4. **Verify GREEN** — Run the test, confirm it passes; run ALL tests, confirm none broke
5. **REFACTOR** — Clean up the code while keeping all tests green
6. **Repeat** — Move to the next micro-task

**If you wrote code before a test: delete the code and start from the test.**

---

## Change-Based Architecture

Each feature or fix is tracked as an independent Change:

```
archonflow/changes/{change-name}/
├── proposal.md      ← Requirements spec
├── analysis.md      ← Structural analysis + module dependency map
├── design.md        ← Design contracts (Given/When/Then)
├── api.md           ← API contracts (Given/When/Then)
├── data.md          ← Data layer contracts
├── plan.md          ← Implementation plan (micro-tasks)
├── assumptions.md   ← Assumption log (REQUIRED/OPTIONAL/FORBIDDEN)
├── verify-report.md ← Verification results
└── fix-report.md    ← Bug fix results (if any)
```

When a Change passes verification, it's archived to `archonflow/specs/`.

The `archonflow/changelog.md` tracks all Changes with status progression:
📋 Proposed → 🎨 Designed → 🔨 Built → ✅ Verified

---

## Two-Stage Review

### Stage 1: Spec Compliance (Completeness + Correctness)

Auditors test from the OUTSIDE — they never read source code.

1. @visual-auditor — visual compliance vs design contract
2. @api-integration-auditor — API compliance + frontend-backend integration
3. @ux-compliance — UX compliance vs design contract

All must PASS before Stage 2.

### Stage 2: Code Quality (Coherence)

Reviewers read source code for quality.

4. @code-backend-reviewer — code quality + backend security, performance, data integrity

---

## Behavioral Specs (Given/When/Then)

All contracts use the Given/When/Then format for behavioral specifications:

```markdown
### Requirement: Login button click
The system SHALL navigate to the dashboard on successful login.

#### Scenario: Valid credentials
- GIVEN user is on the login page
- WHEN user enters valid credentials and clicks "Login"
- THEN the system navigates to the dashboard
- AND the user session is established
```

Use RFC 2119 keywords: SHALL (mandatory), MUST (absolute), SHOULD (recommended), MAY (optional).

---

## Scoring System

### Visual Audit Scoring

| Dimension | Weight | What It Checks |
|-----------|--------|---------------|
| Color Fidelity | 25% | All colors match Contract (CIEDE2000) |
| Typography Fidelity | 20% | Font family, size, weight match |
| Spacing Fidelity | 20% | Padding, margin, gap match |
| Radius Fidelity | 15% | Border-radius matches |
| Layout Fidelity | 15% | Structure, alignment, positioning |
| Shadow Fidelity | 5% | Box-shadow matches |

### API & Integration Scoring

| Dimension | Weight | What It Checks |
|-----------|--------|---------------|
| Schema Compliance | 35% | Response matches contract schema |
| Status Code Accuracy | 20% | HTTP status codes match contract |
| Error Format | 15% | Unified error format compliance |
| Authentication | 15% | Auth/authorization as specified |
| Backward Compatibility | 15% | No breaking changes to existing APIs |

### Code & Backend Scoring

| Dimension | Weight | What It Checks |
|-----------|--------|---------------|
| Security | 30% | SQL injection, XSS, CSRF, auth bypass |
| Performance | 25% | N+1 queries, missing indexes, pagination |
| Data Integrity | 25% | Constraints, validation, cascading |
| Error Handling | 20% | Error format, logging, recovery |
| Readability | 25% | Naming, structure, clarity |
| Pattern Consistency | 25% | Follows existing codebase patterns |
| Test Coverage | 25% | TDD tests exist and cover contract scenarios |
| Assumption Compliance | 25% | Assumptions don't violate business boundaries |

### Thresholds by Project Profile

| Auditor | Enterprise | Normal | Internal |
|---------|-----------|--------|----------|
| Visual Auditor | ≥ 95 | ≥ 85 | ≥ 70 |
| API & Integration | ≥ 95 | ≥ 90 | ≥ 85 |
| UX Compliance | ≥ 90 | ≥ 85 | ≥ 80 |
| Code & Backend | ≥ 90 | ≥ 85 | ≥ 80 |

### Color Comparison: CIEDE2000

We use CIEDE2000 (not simple RGB distance) for perceptually accurate color comparison:
- ΔE00 < 2: Imperceptible to humans
- ΔE00 2–5: Slight difference
- ΔE00 > 5: Visible difference

---

## Fix Loop with Arbiter

When an audit score is below the threshold, the system automatically enters a fix loop:

```
Auditor (score < threshold)
    ↓
Git commit (checkpoint for rollback)
    ↓
Engineer (reads audit report + memory + contracts, fixes issues)
    ↓
Update agent memory file
    ↓
Auditor (fresh subagent, but with memory, re-audits)
    ↓
If score ≥ threshold → PASS → proceed to NEXT audit phase
If score < threshold → Loop again
```

**Arbiter Mechanism**: When the Fix Loop reaches 2 consecutive failures, the System Architect is invoked as Arbiter. The Arbiter reviews the contract, the code, and the audit reports, then issues a binding **Directive**. If the Directive still fails → HUMAN_INTERVENTION.

**Git Reset**: Before each fix attempt, the current code state is committed. If a fix makes things worse (score decreases), rollback to the pre-fix commit and try a different approach.

**Mandatory rules:**
- Each audit phase must PASS before the next phase starts
- Stage 1 (spec compliance) must fully pass before Stage 2 (code quality)
- Do NOT skip re-auditing after a fix — always verify
- Do NOT ask user for permission to fix — just fix
- All phases must pass before generating the final report

### Agent Memory

Each agent maintains a memory file at `archonflow/memory/{agent-name}.md`.
This ensures continuity across fix iterations — when the same agent is
re-invoked, it receives its previous work history as context:

- What was done in previous iterations
- Key decisions made
- Files modified
- Issues encountered
- Pending fixes

This solves the "fresh subagent" problem: even though Claude Code spawns
a new subagent each time, the memory file preserves the agent's context.

---

## Assumption Log

When the contract doesn't specify something, engineers don't just invent — they record assumptions:

| Type | Description | Example |
|------|-------------|---------|
| **REQUIRED** | Must validate before build; wrong = rework | "Assuming user session expires after 30 min" |
| **OPTIONAL** | Nice-to-have; wrong = minor adjustment | "Assuming date format is ISO 8601" |
| **FORBIDDEN** | Never allowed — ask Design Authority | "Assuming border-radius should be 8px" |

The Assumption Log is reviewed during Code & Backend Review to ensure no assumption violates business boundaries.

---

## Precision Context Injection

Based on the module dependency map generated by System Architect, each agent only receives the files it needs:

```
Module: UserAuth
  Depends On: Database, SessionManager
  Files: src/auth/*, src/models/user.ts, src/middleware/auth.ts

→ Frontend Engineer receives: design.md, api.md, tokens, src/auth/*
→ Backend Engineer receives: api.md, data.md, src/models/user.ts, src/middleware/auth.ts
→ Visual Auditor receives: design.md, running app (no source code)
```

This prevents context window overflow and ensures agents focus on relevant code.

---

## Visual Audit Separation (Calculation vs. Interpretation)

LLMs are unreliable at numerical computation — they hallucinate color distances and pixel differences. ArchonFlow separates **calculation** from **interpretation**:

1. **Scripts compute** (deterministic):
   - `npm run capture` — Playwright captures screenshots
   - `npm run diff` — computes pixel/color/layout differences using CIEDE2000 + Pixelmatch
   - `npm run score` — calculates dimension scores from diff results

2. **LLM interprets** (judgment):
   - Reads pre-computed diff results
   - Interprets whether differences are acceptable
   - Provides qualitative assessment and recommendations

The Visual Auditor NEVER computes color distances or pixel differences — it only reads pre-computed results and interprets them.

---

## Contract Dispute Protocol

Build agents can challenge contracts when they identify technical issues:

1. Engineer discovers a contract problem
2. Records the issue in assumptions.md
3. Requests clarification from Design Authority via `@design-authority`
4. Design Authority's ruling is final
5. Engineer proceeds based on the ruling

This creates a feedback loop from Build → Design, preventing the waterfall problem where contracts are written once and never questioned.

---

## Project Structure

After `/plugin install archonflow` and `/archonflow:init`, your project looks like:

```
your-project/
├── .claude/                  ← Claude Code auto-discovers from here
│   ├── agents/                      # 10 subagent definitions
│   │   ├── system-architect.md
│   │   ├── design-authority.md
│   │   ├── api-architect.md
│   │   ├── data-architect.md
│   │   ├── frontend-engineer.md
│   │   ├── backend-engineer.md
│   │   ├── visual-auditor.md
│   │   ├── api-integration-auditor.md
│   │   ├── ux-compliance.md
│   │   └── code-backend-reviewer.md
│   └── skills/                      # 7 pipeline skills
│       ├── init/SKILL.md
│       ├── proposal/SKILL.md
│       ├── design/SKILL.md
│       ├── build/SKILL.md
│       ├── verify/SKILL.md
│       ├── fix/SKILL.md
│       └── status/SKILL.md
├── archonflow/               ← All ArchonFlow files in one place
│   ├── config/                      # Project configuration
│   │   └── project.config.json      # ← EDIT THIS for your project
│   ├── templates/                   # Report & contract templates
│   ├── scripts/                     # Playwright capture, visual diff, scoring
│   ├── changes/                     # Change-Based tracking (auto-created)
│   │   └── {change-name}/           # Each feature/fix as a folder
│   ├── specs/                       # Archived completed changes
│   ├── contracts/                   # Generated contracts (auto-created)
│   ├── audits/                      # Audit reports (auto-created)
│   ├── visual-reports/              # Visual audit reports (auto-created)
│   ├── ux-reports/                  # UX compliance reports (auto-created)
│   ├── reports/                     # Code review & final reports (auto-created)
│   ├── mock/                        # Generated mock data (auto-created)
│   ├── memory/                      # Agent memory files (auto-created)
│   └── changelog.md                 # Change history tracker
├── src/                      ← Your existing source code (untouched)
└── ... (your existing project files, untouched)
```

Design files are **auto-discovered** — wherever they are in the project, the proposal skill will find them. No need to move or rename.

---

## Quick Start

### 1. Add Plugin Marketplace

ArchonFlow is distributed through its own plugin marketplace. Add it first:

```bash
# In Claude Code, add the ArchonFlow marketplace
/plugin marketplace add evan3060/ArchonFlow
```

> **What is a plugin marketplace?** Claude Code plugins are distributed through marketplaces — curated catalogs hosted in Git repositories. You need to add a marketplace before you can install plugins from it. See [Claude Code Plugin Marketplaces](https://docs.claude.com/en/docs/claude-code/plugin-marketplaces) for details.

### 2. Install Plugin

```bash
/plugin install archonflow
```

### 3. Initialize Project

```bash
/archonflow:init
```

This automatically creates the directory structure, copies runtime files (config, templates, scripts), and guides you through project configuration (name, design mode, profile, tech stack).

### 4. Start Pipeline

```
/archonflow:proposal
```

The pipeline will guide you through proposal → design → build → verify.

---

## Design Trade-offs & Decisions

This section documents the key design decisions made during v0.3 development, including the reasoning process and alternatives considered. This is intended for future reference when revisiting these decisions.

### Agent Consolidation (15 → 10)

**Decision**: Merge same-perspective agents into unified agents.

**Reasoning**: Three experts reviewed the original 15-agent architecture and independently identified the same problem — too many agents with overlapping perspectives creates unnecessary context switching and coordination overhead. The key insight was that agents sharing the same "view" of the system (e.g., both API Compliance and Integration Checker test from outside via HTTP) can be merged without losing cognitive isolation, because cognitive isolation is about what an agent CAN'T see, not about having separate agents.

**Merges**:
| Before | After | Rationale |
|--------|-------|-----------|
| Design Authority + Contract Generator + Design System Guardian | Design Authority | Same perspective (design interpretation), sequential workflow |
| API Compliance + Integration Checker | API & Integration Auditor | Same perspective (black-box HTTP testing) |
| Backend Auditor + Code Reviewer | Code & Backend Reviewer | Same perspective (white-box source code review) |
| API Architect + Mock Server Generator | API Architect | Sequential workflow — contract then mock |

**Alternatives Considered**:
- Keep all 15 agents: Too much coordination overhead, agents with same perspective produce redundant findings
- Merge more aggressively (e.g., all auditors into one): Would lose the black-box vs white-box distinction that's critical for cognitive isolation
- Merge by phase only (e.g., one "Design Agent"): Would lose specialist knowledge within each function

**Trade-off**: Merged agents have larger individual context windows but fewer total context switches. The net effect is positive because sequential steps within one agent share context naturally.

### Arbiter Mechanism

**Decision**: System Architect doubles as Arbiter for Fix Loop deadlocks.

**Reasoning**: In the original design, Fix Loops could cycle endlessly between Engineer and Auditor with no resolution path. The Arbiter provides an escape hatch — a neutral third party that can break deadlocks. System Architect was chosen because:
1. It already has read access to both contracts and source code
2. It understands the architectural intent
3. It has no bias toward either Engineer or Auditor

**Alternatives Considered**:
- Dedicated Arbiter agent: Adds another agent (back to 11), and the Arbiter role is only needed in edge cases
- User as Arbiter: Breaks autonomous execution; user shouldn't need to resolve technical disputes
- Design Authority as Arbiter: Would create bias toward design interpretation over implementation reality

**Trade-off**: System Architect has broader context but may not have deep design interpretation expertise. The Arbiter Directive format forces structured reasoning, mitigating this risk.

### Assumption Log vs. Strict "No Invention"

**Decision**: Soften the "No Invention" rule with a classified Assumption Log.

**Reasoning**: The original strict "No Invention" rule was theoretically pure but practically problematic. Engineers would block on every unspecified detail, creating constant back-and-forth with Design Authority. The Assumption Log provides a middle ground:
- **REQUIRED** assumptions must be validated before build
- **OPTIONAL** assumptions can proceed but are tracked
- **FORBIDDEN** assumptions (structural/visual) remain strictly prohibited

**Alternatives Considered**:
- Keep strict "No Invention": Too many blocking points, slows pipeline
- Allow all assumptions: Defeats the purpose of contracts
- No classification: Without REQUIRED/OPTIONAL/FORBIDDEN, there's no way to prioritize review

**Trade-off**: Engineers may over-classify assumptions as OPTIONAL to avoid blocking. Mitigated by Code & Backend Review checking assumption compliance.

### Visual Audit: Calculation vs. Interpretation

**Decision**: Scripts compute differences, LLM only interprets results.

**Reasoning**: LLMs are unreliable at numerical computation. Testing showed that LLMs would hallucinate CIEDE2000 values, misreport pixel differences, and produce inconsistent scores for the same screenshot. By moving all computation to deterministic scripts (Playwright + Pixelmatch/OpenCV), the LLM only needs to exercise judgment — something it's good at.

**Alternatives Considered**:
- Full LLM visual audit: Inconsistent, hallucinated numbers
- Full script-based audit: Can't interpret qualitative differences (e.g., "this layout shift is acceptable because it's responsive")
- Hybrid with LLM verification: LLM verifying its own computation doesn't solve the hallucination problem

**Trade-off**: Requires maintaining visual diff scripts, but the reliability gain is worth it. Scripts produce deterministic results that can be version-controlled and reproduced.

### Precision Context Injection

**Decision**: Use module dependency map to inject only relevant files into each agent.

**Reasoning**: As projects grow, loading the entire codebase into every agent's context becomes impractical. The module dependency map (generated by System Architect) allows each agent to receive only the files it needs, preventing context window overflow and reducing hallucination from irrelevant code.

**Alternatives Considered**:
- Load everything: Context window overflow for large projects
- Manual file selection: Error-prone, requires user intervention
- Heuristic-based (e.g., "load all files modified in last commit"): Misses dependencies

**Trade-off**: Dependency map accuracy depends on System Architect's analysis. Incorrect maps may miss relevant files. Mitigated by allowing agents to request additional context.

### Git Reset in Fix Loop

**Decision**: Auto-commit before each fix attempt; rollback if fix makes things worse.

**Reasoning**: In Fix Loops, engineers sometimes make changes that fix one issue but break another, or apply a fix that doesn't work and leaves the code in a worse state. Git Reset provides a safety net — you can always go back to the last known-good state.

**Alternatives Considered**:
- No rollback: Code can degrade through multiple fix attempts
- Manual rollback: Breaks autonomous execution
- Branch per fix: Too much git complexity for automated pipeline

**Trade-off**: Adds git operations to each fix iteration, but the safety net is essential for maintaining code quality through multiple fix attempts.

### Project Profiles

**Decision**: Provide Enterprise/Normal/Internal presets with different threshold levels.

**Reasoning**: Not all projects need the same quality bar. An internal tool doesn't need 95% visual fidelity, but a customer-facing product does. Profiles make it easy to set appropriate thresholds without manually editing every value.

**Alternatives Considered**:
- Single threshold set: Too rigid for different project types
- Fully manual configuration: Too much setup overhead
- Auto-detect project type: Unreliable without explicit user input

**Trade-off**: Profiles are coarse-grained. Projects may need to override individual thresholds. The config file supports both profile selection and per-threshold overrides.

---

## License

MIT
