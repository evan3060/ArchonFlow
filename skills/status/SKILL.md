---
name: status
description: "Show ArchonFlow pipeline status. Displays change tracking, audit scores, agent memory state, and changelog history."
---

# Status Skill

Show the current status of the ArchonFlow pipeline with Change-Based tracking.

## Process

### Step 1: Check Configuration

Read `archonflow/config/project.config.json` to understand project setup.

### Step 2: Read Changelog

Read `archonflow/changelog.md` for complete project history:
- All changes (greenfield, incremental, fix)
- Current status of each change
- Dates and progression

### Step 3: Scan Active Changes

Check `archonflow/changes/` for active changes:
- Which changes are in progress
- Which phase each change is at
- Proposal, design, API, data, plan, build, verify reports

### Step 4: Scan Archived Specs

Check `archonflow/specs/` for completed changes that have been archived.

### Step 5: Scan Audits

Check `archonflow/audits/`, `archonflow/visual-reports/`, `archonflow/ux-reports/`, `archonflow/reports/` for:
- Latest audit scores per change
- Pending fix requirements
- Review findings

### Step 6: Scan Agent Memory

Check `archonflow/memory/` for:
- Which agents have been invoked
- What each agent remembers
- Pending fix states
- Iteration counts

### Step 7: Display Status

Present a comprehensive status report:

```
## ArchonFlow Pipeline Status

### Project: {project-name}
Mode: Greenfield / Incremental

### Change History
| Date | Change | Type | Status |
|------|--------|------|--------|
| YYYY-MM-DD | {name} | greenfield | ✅ Verified |
| YYYY-MM-DD | {name} | incremental | 🔨 Built |
| YYYY-MM-DD | {name} | fix | 📋 Proposed |

### Active Change: {change-name}
| Phase | Status | Details |
|-------|--------|---------|
| 📋 Proposal | ✅ Complete | archonflow/changes/{name}/proposal.md |
| 🎨 Design | ✅ Complete | design.md, api.md, data.md, plan.md |
| 🔨 Build | ⚠️ In Progress | Frontend 3/5 pages |
| ✅ Verify | ⏳ Pending | — |

### Audit Scores (Latest)
| Auditor | Score | Threshold | Status |
|---------|-------|-----------|--------|
| Visual | 92/100 | ≥95 | ❌ Below |
| API Compliance | 97/100 | ≥95 | ✅ Pass |
| UX Compliance | 91/100 | ≥90 | ✅ Pass |
| Integration | 88/100 | ≥90 | ❌ Below |
| Backend Audit | 85/100 | ≥85 | ✅ Pass |
| Code Review | 82/100 | ≥85 | ❌ Below |

### Agent Memory
| Agent | Last Invoked | Memory State |
|-------|-------------|--------------|
| frontend-engineer | 2 iterations | 3 pages done, 2 pending fixes |
| backend-engineer | 1 iteration | API complete, data layer complete |
| visual-auditor | 2 iterations | home: 88, record: 95 |
| api-compliance | 1 iteration | 97/100 pass |
| backend-auditor | 1 iteration | 85/100 pass |
| code-reviewer | 1 iteration | 82/100 below threshold |

### Fix Loop Status
| Change | Auditor | Score | Iterations | Status |
|--------|---------|-------|------------|--------|
| {name} | visual-auditor | 88→92 | 2/3 | ⚠️ In Progress |
| {name} | integration-checker | 85→88 | 1/3 | ⚠️ In Progress |

### Next Recommended Action
→ Run /verify to re-audit failed stages
→ Or run /fix for targeted bug fixing
```

## Output

Status report displayed to user. No files written.
