---
name: status
description: "Show ArchonFlow pipeline status. Displays which phases are complete, which pages have contracts, audit scores, and agent memory state."
---

# Status Skill

Show the current status of the ArchonFlow pipeline.

## Process

### Step 1: Check Configuration

Read `archonflow/config/project.config.json` to understand project setup.

### Step 2: Scan Contracts

Check `archonflow/contracts/` for:
- `design-source-map.json` — proposal phase complete?
- `{page}.contract.md` — contract phase complete?
- `api-contract.json` — API contract generated?

### Step 3: Scan Implementation

Check source directories for implemented pages and components.

### Step 4: Scan Audits

Check `archonflow/audits/`, `archonflow/ux-reports/`, `archonflow/reports/` for:
- Latest audit scores
- Pending fix requirements
- Review findings

### Step 5: Scan Agent Memory

Check `archonflow/memory/` for:
- Which agents have been invoked
- What each agent remembers
- Pending fix states

### Step 6: Display Status

Present a status table:

```
| Phase | Status | Pages | Score |
|-------|--------|-------|-------|
| Proposal | ✅ Complete | 5 | — |
| Contract | ✅ Complete | 5 | — |
| Frontend | ⚠️ In Progress | 3/5 | 92 (fix needed) |
| Backend | ⏳ Pending | 0/5 | — |
| Integration | ⏳ Pending | — | — |

## Agent Memory
| Agent | Last Invoked | Memory State |
|-------|-------------|--------------|
| frontend-engineer | 2 iterations | 3 pages done, 2 pending fixes |
| visual-auditor | 2 iterations | home: 88, record: 95 |
| backend-engineer | not invoked | — |

## Fix Loop Status
| Page | Visual | UX | Code Review | Iterations |
|------|--------|----|-------------|------------|
| home | 88 ❌ | — | — | 2/3 |
| record | 95 ✅ | 92 ⚠️ | — | 1/3 |
```

## Output

Status report displayed to user. No files written.
