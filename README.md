# ArchonFlow

**Multi-Agent Full-Stack Delivery Pipeline** — A project-agnostic, multi-agent governance system that enforces design fidelity, API compliance, and code quality through cognitive isolation and contract-driven development.

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
  ┌─ Contract Phase ─────────────────────────────────────────┐
  │  System Architect     ← Architecture, modules, routing    │
  │  Design Authority     ← Interprets design → Contract      │
  │  Contract Generator   ← Extracts design tokens            │
  │  API Architect        ← Designs API contract               │
  │  Mock Server Generator← Creates deterministic mock data   │
  └──────────────────────────────────────────────────────────┘
        ↓
  ┌─ Frontend Building ──────────────────────────────────────┐
  │  Frontend Engineer    ← Implements from Contract only     │
  │  Visual Auditor       ← Playwright + screenshot diff      │
  │  UX Compliance        ← Interaction & accessibility       │
  │  Code Reviewer        ← Code quality                      │
  │  (Repair Loop: score < 95 → fix → re-audit)              │
  └──────────────────────────────────────────────────────────┘
        ↓
  ┌─ Backend Building ───────────────────────────────────────┐
  │  Backend Engineer     ← Implements API contract layer     │
  │  Integration Checker  ← API compliance testing            │
  │  Code Reviewer        ← Code quality                      │
  │  (Repair Loop: score < 90 → fix → re-test)               │
  └──────────────────────────────────────────────────────────┘
        ↓
  ┌─ Integration Audit ──────────────────────────────────────┐
  │  Integration Checker  ← Full-stack API verification       │
  │  Visual Auditor       ← End-to-end visual verification    │
  │  UX Compliance        ← End-to-end UX verification        │
  │  Code Reviewer        ← Final quality gate                 │
  └──────────────────────────────────────────────────────────┘
        ↓
  Ship
```

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
| Proposal | `/archonflow:proposal` | Socratic Q&A → project brief, design source decision |
| Contract | `/archonflow:contract <target>` | Generate all contracts (design + API + mock data) |
| Frontend Building | `/archonflow:frontend-building <target>` | Implement UI + visual audit + UX audit + code review |
| Backend Building | `/archonflow:backend-building <target>` | Implement API + compliance test + code review |
| Integration Audit | `/archonflow:integration-audit <target>` | Full-stack integration verification |
| Status | `/archonflow:status` | Show pipeline progress and scores |

---

## Agent Council — 12 Agents

### Contract Phase

| Agent | Role | Sees | Never Sees |
|-------|------|------|------------|
| System Architect | Architecture design | contracts, src/ | design-references/ |
| Design Authority | Design interpretation | design-references, contracts | src/ |
| Contract Generator | Token extraction | contracts | src/, design-references/ |
| API Architect | API contract design | contracts | src/, design-references/ |
| Mock Server Generator | Mock data creation | contracts | src/, design-references/ |

### Frontend Phase

| Agent | Role | Sees | Never Sees |
|-------|------|------|------------|
| Design System Guardian | Token maintenance | contracts, tokens | components, pages |
| Frontend Engineer | UI implementation | contracts, tokens, src, audits | design-references/ |
| Visual Auditor | Visual fidelity | contracts, running app | **src/** |
| UX Compliance | Interaction check | contracts, running app | **src/** |
| Code Reviewer | Code quality | src/ | contracts, audits |

### Backend Phase

| Agent | Role | Sees | Never Sees |
|-------|------|------|------------|
| Backend Engineer | API implementation | contracts, mock, audits | design-references/, frontend src/ |
| Integration Checker | API compliance | contracts, running server | **src/** |

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
    ├── contract/SKILL.md
    └── ...
```

Just copy and start using `/archonflow:proposal` or any skill.

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
| system-architect | Read, Grep, Glob, LS | ❌ | Read-only, no implementation |
| design-authority | Read, Grep, Glob, LS | ❌ | Read-only, no implementation |
| contract-generator | Read, Grep, Glob | ❌ | Read-only, no implementation |
| api-architect | Read, Grep, Glob | ❌ | Read-only, no implementation |
| mock-server-generator | Read, Grep, Glob, Write | ✅ mock/ | Only writes mock data |
| design-system-guardian | Read, Grep, Glob, Write, Edit | ✅ tokens/ | Only writes tokens |
| frontend-engineer | Read, Grep, Glob, LS, Write, Edit, Bash | ✅ src/ | Full dev tools |
| backend-engineer | Read, Grep, Glob, LS, Write, Edit, Bash | ✅ backend/ | Full dev tools |
| visual-auditor | Read, Grep, Glob, Bash | ❌ | **No Write/Edit — cannot modify code** |
| ux-compliance | Read, Grep, Glob, Bash | ❌ | **No Write/Edit — cannot modify code** |
| integration-checker | Read, Grep, Glob, Bash | ❌ | **No Write/Edit — cannot modify code** |
| code-reviewer | Read, Grep, Glob | ❌ | **Read-only — review only** |

### Agent Team Mode (Experimental)

For parallel execution (e.g., building multiple pages simultaneously), you can request Agent Teams:

```
Use team agents to build analysis, growth, and knowledge pages in parallel
```

This spawns multiple Claude Code instances in tmux panes, each running the full frontend-building pipeline independently. Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` enabled.

---

## Design Contract

The Design Contract is the **constitutional document** of the system. It's not a casual description — it's an executable specification that all agents must obey.

### Why Contracts?

Without a Contract, every agent interprets the design export differently. The Contract eliminates ambiguity by being the single, authoritative interpretation.

### Contract Structure

```markdown
# {Page Name} Design Contract

## Metadata
- Version, timestamp, design source, status

## Design Tokens Used
- Every color, spacing, radius, font, shadow referenced

## Page Structure
- Container specs → Section specs → Component specs → Element specs
- Every visual property with exact value and token reference

## Interaction States
- For every interactive element: default, hover, focus, active, disabled

## Responsive Behavior
- Mobile / Tablet / Desktop breakpoints and adaptations

## AMBIGUOUS Items
- Anything not clearly specified in design export (flagged, not guessed)
```

---

## API Contract

The API Contract defines the contract between frontend and backend. It specifies:

- Endpoint paths, methods, request/response schemas
- Status codes and error response formats
- Pagination, filtering, sorting conventions
- Data relationships and dependencies

The Backend Engineer implements ONLY the contract layer. Out-of-scope items (database, auth, business logic) are stubbed with TODOs and tracked in `api-todo.md`.

Mock Server Generator creates deterministic mock data from the API contract, enabling frontend development to proceed independently.

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
| Schema Compliance | 40% | Response matches contract schema |
| Status Code Accuracy | 20% | HTTP status codes match contract |
| Edge Case Handling | 20% | Empty data, errors, pagination |
| Data Integrity | 20% | CRUD operations produce correct data |

### Verdicts

| Score | Verdict | Action |
|-------|---------|--------|
| 95–100 (visual) / 90–100 (API) | ✅ PASS | Proceed to next phase |
| 85–94 (visual) / 80–89 (API) | ⚠️ FIX REQUIRED | Engineer fixes, re-audit |
| <85 (visual) / <80 (API) | ❌ REJECT | Re-implement from Contract |

### Color Comparison: CIEDE2000

We use CIEDE2000 (not simple RGB distance) for perceptually accurate color comparison:
- ΔE00 < 2: Imperceptible to humans
- ΔE00 2–5: Slight difference
- ΔE00 > 5: Visible difference

---

## Repair Loop

When an audit score is below the threshold, the system automatically enters a repair loop:

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
- Visual audit must PASS → UX compliance → Code Review
- Integration check must PASS → Code Review
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
│   ├── agents/                      # 12 subagent definitions
│   │   ├── system-architect.md
│   │   ├── visual-auditor.md
│   │   └── ...
│   └── skills/                      # 6 pipeline skills
│       ├── proposal/SKILL.md
│       ├── contract/SKILL.md
│       └── ...
├── archonflow/               ← All ArchonFlow files in one place
│   ├── config/                      # Project configuration
│   │   ├── project.config.json      # ← EDIT THIS for your project
│   │   └── scoring-criteria.json
│   ├── templates/                   # Report & contract templates
│   ├── scripts/                     # Playwright capture, visual diff, scoring
│   ├── contracts/                   # Generated contracts (auto-created)
│   ├── audits/                      # Audit reports (auto-created)
│   ├── ux-reports/                  # UX compliance reports (auto-created)
│   ├── reports/                     # Code review & final reports (auto-created)
│   ├── mock/                        # Generated mock data (auto-created)
│   └── memory/                      # Agent memory files (auto-created)
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

Or install directly from the official marketplace (if published):

```bash
/plugin install archonflow@claude-plugins-official
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
/archonflow:proposal

# Step 2: Generate all contracts
/archonflow:contract analysis

# Step 3: Build frontend (with visual audit)
/archonflow:frontend-building analysis

# Step 4: Build backend (with API compliance)
/archonflow:backend-building analysis

# Step 5: Integration audit
/archonflow:integration-audit analysis

# Check status anytime
/archonflow:status
```

---

## Design Philosophy

### Why "Design Authority" instead of "Design Architect"?

The name reflects the role's true purpose: **final interpretation authority**, not just architecture. When agents disagree on what the design means, the Design Authority has the final say. This aligns with the "Contract is Law" principle — a constitution needs a constitutional court to interpret it.

### Why Not Bind to Specific Design Tools?

Design tools change. Today it's Stitch, tomorrow Figma, next year something new. The framework serves **design intent**, not specific tools. The Design Authority accepts input from any design source and produces the same structured Contract.

### Why Separate Visual Auditor and UX Compliance?

Visual Auditor checks what things **look like**. UX Compliance checks what things **behave like**. A button can have the correct default color but missing hover/focus/disabled states. These are different failure modes requiring different expertise.

### Why Backend Only Implements the API Contract Layer?

Full backend implementation (database, auth, business logic) requires human judgment and domain expertise. The pipeline implements the **contract layer** — routes, controllers, request/response formatting — ensuring the API surface matches the contract. Everything else is tracked in `api-todo.md` for manual completion.

### Why Mock Server as Standard?

Mock data enables **parallel development**: frontend builds against mock while backend implements the real API. When both are ready, the integration audit verifies they match. This eliminates the "waiting for backend" bottleneck.

### Why CIEDE2000 for Color Comparison?

Simple RGB distance treats all color differences equally, but human perception doesn't work that way. CIEDE2000 accounts for perceptual uniformity — a ΔE00 < 1 difference is imperceptible to humans, regardless of the color pair.

---

## License

MIT
