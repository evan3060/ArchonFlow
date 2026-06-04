---
name: status
description: "Display pipeline progress, audit scores, and changelog. Shows current state of all changes and their verification status."
---

# Status Skill

Display the current pipeline progress, audit scores, and changelog for all changes.

## Process

### Phase 1: Load State

1. Read `archonflow/changelog.md` — all changes and their status
2. Read `archonflow/config/project.config.json` — project setup and thresholds
3. Check `archonflow/changes/` — active changes
4. Check `archonflow/specs/` — archived changes

### Phase 2: Display Status

```
╔══════════════════════════════════════════════════════════════╗
║                   ArchonFlow Pipeline Status                 ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Project: {project-name}                                     ║
║  Profile: {enterprise/normal/internal}                       ║
║  Version: 0.4.1                                              ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  Changes                                                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  📋 {change-1} — Proposed                                   ║
║  🎨 {change-2} — Designed                                   ║
║  🔨 {change-3} — Built                                      ║
║  ✅ {change-4} — Verified                                   ║
║  🔧 {change-5} — Fixed                                      ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  Latest Audit Scores                                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
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
## {change-name} — {status}

### Files
- Proposal: archonflow/changes/{change-name}/proposal.md
- Analysis: archonflow/changes/{change-name}/analysis.md
- Design: archonflow/changes/{change-name}/design.md
- API: archonflow/changes/{change-name}/api.md
- Data: archonflow/changes/{change-name}/data.md
- Plan: archonflow/changes/{change-name}/plan.md
- Assumptions: archonflow/changes/{change-name}/assumptions.md
- Verify: archonflow/changes/{change-name}/verify-report.md
- Fix: archonflow/changes/{change-name}/fix-report.md

### Latest Scores
| Auditor | Score | Threshold | Status |
|---------|-------|-----------|--------|
| Visual Auditor | {score} | ≥ {threshold} | ✅/❌ |
| API & Integration Auditor | {score} | ≥ {threshold} | ✅/❌ |
| UX Compliance | {score} | ≥ {threshold} | ✅/❌ |
| Code & Backend Reviewer | {score} | ≥ {threshold} | ✅/❌ |
```

## Output

- Pipeline status display
- Change details
- Audit scores
