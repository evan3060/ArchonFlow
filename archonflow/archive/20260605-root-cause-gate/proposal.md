# Proposal: Root Cause Gate

## Feature Description
Prevent unproven root cause fixes by adding a hard gate between diagnosis and code modification. Requires structured hypothesis-disprove cycle with at least 1 supporting evidence and 1 counter-evidence experiment.

## Domain Impact
### New/Modified Entities
| Entity | Change Type | Description |
|--------|------------|-------------|
| Phase 2.5 Diagnostic Experiment | NEW | Structured experiment framework |
| Phase 2.7 Root Cause Gate | NEW | Hard gate blocking Phase 3 until root cause proven |
| excluded_hypotheses.json | NEW | Cross-iteration negative knowledge persistence |
| diagnostic-report.json | NEW | Structured experiment output |

### Incident
**TabBar Icon Clipping** (2026-06-05): 8+ fix iterations all failed because every iteration assumed "box model overlap" without measuring the actual DOM. Playwright boundingBox measurement later proved a 2px gap (no overlap). Root cause was FILL=1 font-variation-settings causing home glyph rendering defect.

## Success Criteria
1. No code modification allowed without diagnostic-report.json with rootCauseProven === true
2. At least 1 disprove experiment required before root cause is considered proven
3. excluded_hypotheses.json prevents repetition of disproved approaches across iterations
4. Destructive diagnostic code is explicitly authorized (Git Checkpoint guarantees rollback)

## Regression Risk
- Risk level: MEDIUM
- Affected areas: fix skill, all future bug fix workflows
