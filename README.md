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
  ┌─ /proposal ─────────────────────────────────────────────┐
  │  Context Probe        ← Greenfield vs Incremental       │
  │  Requirements Q&A     ← Socratic clarification          │
  │  Approach Proposal    ← 2-3 options with trade-offs     │
  │  Spec Generation      ← Proposal document               │
  └─────────────────────────────────────────────────────────┘
        ↓
  ┌─ /design ───────────────────────────────────────────────┐
  │  System Architect     ← Architecture, modules, routing   │
  │  Design Authority     ← Interprets design → Contract     │
  │  Contract Generator   ← Design contracts (Given/When/Then)│
  │  Data Architect       ← Database schema, migrations      │
  │  API Architect        ← API contracts (Given/When/Then)  │
  │  Design System Guardian← Token extraction & validation   │
  │  Mock Server Generator← Deterministic mock data          │
  │  Implementation Plan  ← Micro-task decomposition         │
  └─────────────────────────────────────────────────────────┘
        ↓
  ┌─ /build ────────────────────────────────────────────────┐
  │  Backend Engineer     ← Data layer + API (TDD)           │
  │  Frontend Engineer    ← UI implementation (TDD)          │
  │  Integration Wiring   ← Frontend ↔ Backend connection    │
  └─────────────────────────────────────────────────────────┘
        ↓
  ┌─ /verify ───────────────────────────────────────────────┐
  │  Stage 1: Spec Compliance                               │
  │    Visual Auditor      ← Visual fidelity (≥95)           │
  │    API Compliance      ← API contract match (≥95)        │
  │    UX Compliance       ← Interaction & a11y (≥90)        │
  │    Integration Checker ← Frontend-backend (≥90)          │
  │  Stage 2: Code Quality                                  │
  │    Backend Auditor     ← Security, perf, data (≥85)      │
  │    Code Reviewer       ← Code quality & patterns (≥85)   │
  │  Fix Loop: fail → fix → re-audit (max 3 iterations)     │
  └─────────────────────────────────────────────────────────┘
        ↓
  Ship
```

---

## What's New in v2.0

| Feature | Description |
|---------|-------------|
| **TDD Discipline** | RED-GREEN-REFACTOR mandatory for all implementation |
| **Change-Based Architecture** | Each feature/fix as independent Change folder |
| **Two-Stage Review** | Spec compliance first, then code quality |
| **Three Verification Dimensions** | Completeness, Correctness, Coherence |
| **Behavioral Specs** | Given/When/Then format for all interactions |
| **API Compliance Agent** | Dedicated API contract compliance auditing |
| **Backend Auditor Agent** | Security, performance, data integrity auditing |
| **Data Architect Agent** | Database schema and migration design |
| **Unified Pipeline** | `/proposal → /design → /build → /verify → /fix → /status` |
| **Agent Memory** | Persistent memory files for continuity across iterations |

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
| Proposal | `/proposal` | Context-aware Q&A → proposal spec (greenfield/incremental) |
| Design | `/design` | Generate design contracts, API contracts, data layer, plan |
| Build | `/build` | Implement with TDD (data → backend → frontend) |
| Verify | `/verify` | Three-dimension audit with two-stage review |
| Fix | `/fix "<description>"` | Targeted bug fix with audit verification |
| Status | `/status` | Show pipeline progress, scores, changelog |

---

## Agent Council — 15 Agents

### Design Phase

| Agent | Role | Sees | Never Sees |
|-------|------|------|------------|
| System Architect | Architecture design | contracts, src/ | design-references/ |
| Design Authority | Design interpretation | design-references, contracts | src/ |
| Contract Generator | Design contracts (Given/When/Then) | contracts | src/, design-references/ |
| Data Architect | Database schema & migrations | contracts | src/, design-references/ |
| API Architect | API contracts (Given/When/Then) | contracts | src/, design-references/ |
| Mock Server Generator | Mock data creation | contracts | src/, design-references/ |
| Design System Guardian | Token maintenance | contracts, tokens | components, pages |

### Build Phase

| Agent | Role | Sees | Never Sees |
|-------|------|------|------------|
| Frontend Engineer | UI implementation (TDD) | contracts, tokens, src, audits | design-references/ |
| Backend Engineer | API implementation (TDD) | contracts, mock, audits | design-references/, frontend src/ |

### Verify Phase

| Agent | Role | Sees | Never Sees |
|-------|------|------|------------|
| Visual Auditor | Visual fidelity | contracts, running app | **src/** |
| API Compliance | API contract match | contracts, running app | **src/** |
| UX Compliance | Interaction & a11y | contracts, running app | **src/** |
| Integration Checker | Frontend-backend | contracts, running server | **src/** |
| Backend Auditor | Security, perf, data | src/, contracts | — |
| Code Reviewer | Code quality | src/, contracts | — |

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

**Why Integration Checker must NOT see source code:**

Same principle. It tests the API from the outside, like a real client. It can't be influenced by seeing how the backend was implemented — only whether the API behaves as contracted.

**Why Frontend Engineer must NOT see design exports:**

If the engineer sees the original design file, they'll "just copy" instead of following the Contract. The Contract exists to eliminate ambiguity — bypassing it defeats the purpose.

---

## Subagent Architecture

ArchonFlow uses Claude Code's native Subagent system. Each agent is defined in `agents/*.md` with YAML frontmatter that controls tools, model, and permissions.

### Setup

No setup needed. Copy agents and skills into your project's
`.claude/` directory — Claude Code auto-discovers them on startup.

```
your-project/.claude/
├── agents/             ← Subagent definitions (auto-discovered)
│   ├── visual-auditor.md
│   └── ...
└── skills/             ← Pipeline skills (auto-discovered)
    ├── proposal/SKILL.md
    └── ...
```

Just copy and start using `/proposal` or any skill.

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
| system-architect | Read, Grep, Glob, LS | ❌ | Read-only |
| design-authority | Read, Grep, Glob, LS | ❌ | Read-only |
| contract-generator | Read, Grep, Glob | ❌ | Read-only |
| data-architect | Read, Grep, Glob | ❌ | Read-only |
| api-architect | Read, Grep, Glob | ❌ | Read-only |
| mock-server-generator | Read, Grep, Glob, Write | ✅ mock/ | Only writes mock data |
| design-system-guardian | Read, Grep, Glob, Write, Edit | ✅ tokens/ | Only writes tokens |
| frontend-engineer | Read, Grep, Glob, LS, Write, Edit, Bash | ✅ src/ | Full dev tools |
| backend-engineer | Read, Grep, Glob, LS, Write, Edit, Bash | ✅ backend/ | Full dev tools |
| visual-auditor | Read, Grep, Glob, Bash | ❌ | **No Write/Edit** |
| api-compliance | Read, Grep, Glob, Bash | ❌ | **No Write/Edit** |
| ux-compliance | Read, Grep, Glob, Bash | ❌ | **No Write/Edit** |
| integration-checker | Read, Grep, Glob, Bash | ❌ | **No Write/Edit** |
| backend-auditor | Read, Grep, Glob, Bash | ❌ | **No Write/Edit** |
| code-reviewer | Read, Grep, Glob | ❌ | **Read-only** |

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
├── analysis.md      ← Structural analysis
├── design.md        ← Design contracts (Given/When/Then)
├── api.md           ← API contracts (Given/When/Then)
├── data.md          ← Data layer contracts
├── plan.md          ← Implementation plan (micro-tasks)
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
2. @api-compliance — API compliance vs API contract
3. @ux-compliance — UX compliance vs design contract
4. @integration-checker — frontend-backend integration

All must PASS before Stage 2.

### Stage 2: Code Quality (Coherence)

Reviewers read source code for quality.

5. @backend-auditor — backend security, performance, data integrity
6. @code-reviewer — code quality, patterns, test coverage

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

### API Compliance Scoring

| Dimension | Weight | What It Checks |
|-----------|--------|---------------|
| Schema Compliance | 35% | Response matches contract schema |
| Status Code Accuracy | 20% | HTTP status codes match contract |
| Error Format | 15% | Unified error format compliance |
| Authentication | 15% | Auth/authorization as specified |
| Backward Compatibility | 15% | No breaking changes to existing APIs |

### Backend Audit Scoring

| Dimension | Weight | What It Checks |
|-----------|--------|---------------|
| Security | 30% | SQL injection, XSS, CSRF, auth bypass |
| Performance | 25% | N+1 queries, missing indexes, pagination |
| Data Integrity | 25% | Constraints, validation, cascading |
| Error Handling | 20% | Error format, logging, recovery |

### Thresholds

| Auditor | Pass Threshold |
|---------|---------------|
| Visual Auditor | ≥ 95 |
| API Compliance | ≥ 95 |
| UX Compliance | ≥ 90 |
| Integration Checker | ≥ 90 |
| Backend Auditor | ≥ 85 |
| Code Reviewer | ≥ 85 |

### Color Comparison: CIEDE2000

We use CIEDE2000 (not simple RGB distance) for perceptually accurate color comparison:
- ΔE00 < 2: Imperceptible to humans
- ΔE00 2–5: Slight difference
- ΔE00 > 5: Visible difference

---

## Fix Loop

When an audit score is below the threshold, the system automatically enters a fix loop:

```
Auditor (score < threshold)
    ↓
Engineer (reads audit report + memory + contracts, fixes issues)
    ↓
Update agent memory file
    ↓
Auditor (fresh subagent, but with memory, re-audits)
    ↓
If score ≥ threshold → PASS → proceed to NEXT audit phase
If score < threshold → Loop again (max 3 iterations per phase)
If max iterations reached → HALT with failure report
```

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

## Project Structure

**Plugin install** copies `agents/` and `skills/` into `.claude/` automatically.
You only need to copy `config/`, `templates/`, `scripts/` into `archonflow/`.

```bash
# After /plugin install archonflow, copy runtime files:
mkdir -p archonflow
cp -r .claude/plugins/archonflow/config archonflow/config
cp -r .claude/plugins/archonflow/templates archonflow/templates
cp -r .claude/plugins/archonflow/scripts archonflow/scripts
```

After copying, your project looks like:

```
your-project/
├── .claude/                  ← Claude Code auto-discovers from here
│   ├── agents/                      # 15 subagent definitions
│   │   ├── system-architect.md
│   │   ├── visual-auditor.md
│   │   ├── api-compliance.md
│   │   ├── backend-auditor.md
│   │   ├── data-architect.md
│   │   └── ...
│   └── skills/                      # 6 pipeline skills
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

Design files are **auto-discovered** — wherever they are in your project,
the proposal skill will find them. No need to move or rename anything.

---

## Quick Start

### 1. Install Plugin

In Claude Code, register the marketplace and install:

```bash
/plugin marketplace add evan3060/ArchonFlow
/plugin install archonflow
```

This automatically copies agents and skills into your project's `.claude/` directory.
Then copy runtime files to `archonflow/`:

```bash
mkdir -p archonflow
cp -r .claude/plugins/archonflow/config archonflow/config
cp -r .claude/plugins/archonflow/templates archonflow/templates
cp -r .claude/plugins/archonflow/scripts archonflow/scripts
```

### Manual Installation

If you prefer manual setup, clone the repo and copy:

```bash
# Clone and copy:
git clone https://github.com/evan3060/ArchonFlow.git /tmp/archonflow
cp -r /tmp/archonflow/agents .claude/agents
cp -r /tmp/archonflow/skills .claude/skills
mkdir -p archonflow
cp -r /tmp/archonflow/config archonflow/config
cp -r /tmp/archonflow/templates archonflow/templates
cp -r /tmp/archonflow/scripts archonflow/scripts
```

All rules are self-contained in each SKILL.md.
This won't conflict with your existing `.claude/` settings.

### 2. Configure

Edit `archonflow/config/project.config.json` — fill in your project details:

- **Project identity** — name, tech stack (Vue, React, etc.)
- **Backend tech** — framework, language, source directory
- **Design source** — tool type (Figma, Stitch, v0, etc.), export format
- **Directory conventions** — map to your existing source structure
- **Scoring thresholds** — customize pass/fail/reject thresholds
- **Viewport settings** — target devices and breakpoints
- **Agent overrides** — project-specific agent rules

### 3. Add Design Exports

Design files are auto-discovered — place them anywhere in your project.
No specific directory required.

### 4. Run the Pipeline

```bash
# Step 1: Create project proposal (interactive)
/proposal

# Step 2: Generate all contracts and plan
/design

# Step 3: Build with TDD
/build

# Step 4: Verify with two-stage review
/verify

# Check status anytime
/status
```

### 5. Fix Bugs After Manual Review

When you find issues during manual testing:

```bash
# Any type of bug
/fix "首页卡片间距偏大，按钮颜色不对"
/fix "提交按钮没有 hover 效果"
/fix "点击记录卡片报错"
/fix "GET /api/records 返回 500 错误"
/fix "提交表单后接口报错，前端也没有错误提示"
```

---

## Design Philosophy

### Why "Design Authority" instead of "Design Architect"?

The name reflects the role's true purpose: **final interpretation authority**, not just architecture. When agents disagree on what the design means, the Design Authority has the final say. This aligns with the "Contract is Law" principle — a constitution needs a constitutional court to interpret it.

### Why Not Bind to Specific Design Tools?

Design tools change. Today it's Stitch, tomorrow Figma, next year something new. The framework serves **design intent**, not specific tools. The Design Authority accepts input from any design source and produces the same structured Contract.

### Why Separate Visual Auditor and UX Compliance?

Visual Auditor checks what things **look like**. UX Compliance checks what things **behave like**. A button can have the correct default color but missing hover/focus/disabled states. These are different failure modes requiring different expertise.

### Why Two-Stage Review?

Spec compliance (does it match the contract?) is fundamentally different from code quality (is it well-written?). A perfectly coded page that doesn't match the design is wrong. A page that matches the design but has security vulnerabilities is also wrong. Both need checking, but by different criteria.

### Why TDD?

TDD ensures every piece of functionality has a test that verifies it. When the fix loop runs, tests prevent regressions. When a change is incremental, existing tests catch breaking changes. The RED-GREEN-REFACTOR cycle also naturally produces better-designed code.

### Why Change-Based Architecture?

Each change is self-contained and traceable. You can see the full lifecycle of a feature from proposal to verification. Incremental changes don't interfere with each other. When something goes wrong, you know exactly which change caused it.

### Why Backend Only Implements the API Contract Layer?

Full backend implementation (database, auth, business logic) requires human judgment and domain expertise. The pipeline implements the **contract layer** — routes, controllers, request/response formatting — ensuring the API surface matches the contract. Everything else is tracked in `api-todo.md` for manual completion.

### Why Mock Server as Standard?

Mock data enables **parallel development**: frontend builds against mock while backend implements the real API. When both are ready, the integration audit verifies they match. This eliminates the "waiting for backend" bottleneck.

### Why CIEDE2000 for Color Comparison?

Simple RGB distance treats all color differences equally, but human perception doesn't work that way. CIEDE2000 accounts for perceptual uniformity — a ΔE00 < 1 difference is imperceptible to humans, regardless of the color pair.

---

## License

MIT
