---
name: status
description: "Display pipeline progress, audit scores, spec coverage, and changelog. Shows current state of all changes and their verification status."
---

# Status Skill

Display the current pipeline progress, audit scores, spec coverage, and changelog for all changes.

## Process

### Phase 1: Load State

1. Read `archonflow/changelog.md` — all changes and their status
2. Read `archonflow/config/project.config.json` — project setup and thresholds
3. Check `archonflow/changes/` — active changes
4. Check `archonflow/specs/` — Source of Truth specs
5. Check `archonflow/archive/` — archived changes

### Phase 2: Display Status

```
╔══════════════════════════════════════════════════════════════╗
║                   ArchonFlow Pipeline Status                 ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Project: {project-name}                                     ║
║  Profile: {enterprise/normal/internal}                       ║
║  Version: 0.5.0                                              ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  Active Changes                                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  📋 {YYYYMMDD-change-1} — Proposed                          ║
║  🎨 {YYYYMMDD-change-2} — Designed                          ║
║  🔨 {YYYYMMDD-change-3} — Built                             ║
║  ✅ {YYYYMMDD-change-4} — Verified (ready to archive)       ║
║  🔧 {YYYYMMDD-change-5} — Fixed                             ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  Spec Coverage                                               ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Source of Truth: {N} specs in archonflow/specs/             ║
║  ├── auth/spec.md — 4 Requirements, 9 Scenarios             ║
║  ├── payment/spec.md — 3 Requirements, 7 Scenarios          ║
║  └── tabbar/spec.md — 2 Requirements, 4 Scenarios           ║
║                                                              ║
║  Active Deltas: {N} changes with unmerged specs             ║
║  Archived: {N} changes in archonflow/archive/                ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  Latest Audit Scores                                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Spec Compliance:       {score}%  ({satisfied}/{total})      ║
║  Visual Auditor:        {score}/100  (threshold: ≥{th})     ║
║  API & Integration:     {score}/100  (threshold: ≥{th})     ║
║  UX Compliance:         {score}/100  (threshold: ≥{th})     ║
║  Code & Backend:        {score}/100  (threshold: ≥{th})     ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  Agent Council (10 Agents)                                   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Design:  System Architect, Design Authority,                ║
║           Data Architect, API Architect                      ║
║  Build:   Frontend Engineer, Backend Engineer                ║
║  Verify:  Visual Auditor, API & Integration Auditor,         ║
║           UX Compliance, Code & Backend Reviewer             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### Phase 3: Detailed Change Info

For each active change, show:

```markdown
## {YYYYMMDD-change-name} — {status}

### Files
- Proposal: archonflow/changes/{YYYYMMDD-change-name}/proposal.md
- Specs: archonflow/changes/{YYYYMMDD-change-name}/specs/
- Design: archonflow/changes/{YYYYMMDD-change-name}/design/
- Tasks: archonflow/changes/{YYYYMMDD-change-name}/tasks.md
- Tests: archonflow/changes/{YYYYMMDD-change-name}/tests/
- Assets: archonflow/changes/{YYYYMMDD-change-name}/assets/
- History: archonflow/changes/{YYYYMMDD-change-name}/history.md
- Verify: archonflow/changes/{YYYYMMDD-change-name}/verify-report.md
- Fix: archonflow/changes/{YYYYMMDD-change-name}/fix-report.md

### Spec Coverage
| Domain | Requirements | Scenarios | Tested | Status |
|--------|-------------|-----------|--------|--------|
| auth | 4 | 9 | 8 | ⚠️ 1 MANUAL |
| payment | 3 | 7 | 7 | ✅ |

### Latest Scores
| Auditor | Score | Threshold | Status |
|---------|-------|-----------|--------|
| Spec Compliance | 89% | 100% | ⚠️ |
| Visual Auditor | {score} | ≥ {threshold} | ✅/❌ |
| API & Integration Auditor | {score} | ≥ {threshold} | ✅/❌ |
| UX Compliance | {score} | ≥ {threshold} | ✅/❌ |
| Code & Backend Reviewer | {score} | ≥ {threshold} | ✅/❌ |
```

## Output

- Pipeline status display
- Change details
- Spec coverage report
- Audit scores
