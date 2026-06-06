# ArchonFlow Changelog

All notable changes are documented here. Each entry traces back to an archived change proposal in `archonflow/archive/`.

## [0.5.0] - 2026-06-06

### ADDED
- **Spec-Driven Development**: behavioral specifications (SHALL/MUST + GIVEN/WHEN/THEN) generated from proposals as Delta Specs
- **Delta Spec Management**: ADDED/MODIFIED/REMOVED Requirements with OpenSpec convention, merged into Source of Truth on archive
- **Task Breakdown**: atomic, verifiable tasks with Spec Requirement + Scenario traceability
- **TDD RED Phase**: test skeletons auto-generated from Spec Scenarios before implementation
- **Spec Compliance Verification**: Layer 1 audit verifying implementation satisfies Spec Scenarios
- **Assets Import**: auto-discover and import Figma/Sketch/Stitch design files into change directory
- **Archive Skill**: merge Delta Specs → Source of Truth, move to archive, update changelog
- **History Tracking**: structured lifecycle log with date, stage, event, agent, git hash, summary
- **Time-labeled Change Directories**: `{YYYYMMDD-change-name}` format for natural chronological ordering

### MODIFIED
- **Proposal Skill**: added Phase 6 Spec Generation + Phase 7 Task Breakdown + Phase 8 enhanced Self-Review
- **Design Skill**: merged contracts into `design/` directory, added Phase 6 Assets Import, updated paths
- **Build Skill**: added Phase 2 Test Skeleton Generation (TDD RED), Spec-Driven Testing rule
- **Verify Skill**: added Layer 1 Spec Compliance, Phase 8 Archive Readiness Check, three-layer audit pipeline
- **Fix Skill**: Phase 1 now reads `archonflow/specs/` for Spec Scenario violations
- **Status Skill**: added Spec Coverage display (Requirements, Scenarios, Test coverage)
- **Init Skill**: added `archonflow/archive/` directory, updated descriptions

### Incident
- **TabBar Icon Clipping** (2026-06-05): 8+ fix iterations failed due to unverified root cause hypothesis. All iterations assumed "box model overlap" without measuring the actual DOM. This incident motivated the Spec-Driven Development and Root Cause Gate features in v0.4.2, and the Delta Spec Management in v0.5.0.

## [0.4.2] - 2026-06-05

### ADDED
- **Root Cause Gate** (Phase 2.7): hard gate blocking code modification until root cause is proven through hypothesis-disprove cycle
- **Diagnostic Experiment** (Phase 2.5): structured experiment framework with destructive diagnostic code authorization and git checkout cleanup
- **Excluded Hypotheses**: `excluded_hypotheses.json` persists across Fix Loop iterations, preventing repetition of disproved approaches
- **Active Disprove**: at least 1 counter-evidence experiment required before root cause is considered proven

### MODIFIED
- **Memory Reset**: now preserves `excluded_hypotheses.json` across iterations
- **Fix Report**: includes Diagnostic Evidence and Disprove Experiments tables

### Incident
- **TabBar Icon Clipping** (2026-06-05): 8+ fix iterations all failed — all guessed "box model overlap" without measuring. Playwright boundingBox later proved a 2px gap (no overlap). Root cause: FILL=1 font-variation-settings caused home glyph rendering defect. This incident directly motivated the Root Cause Gate.

## [0.4.1] - 2026-06-04

### ADDED
- **Agent Routing**: model decoupling via config, vision model only invoked when visual audit is needed
- **Context Control**: memory_reset + viewport_snippet + surgical_fix_contract + context_compress
- **Vision Flag**: `vision: true` in visual-auditor.md frontmatter
- **Fail-Only Reports**: `--fail-only` flag generates compact violation reports

## [0.4.0] - 2026-06-03

### ADDED
- **Contract-Driven Pipeline**: proposal → design → build → verify → fix with contract-first development
- **Multi-Agent Council**: 10 specialized agents with cognitive isolation
- **Contract Compiler**: DSL tables compiled into machine-executable assertions
- **Visual Regression Testing**: Playwright-based VRT with baseline management
- **Two-Stage Review**: spec compliance (outside-in) then code quality (inside-out)
- **Fix Loop with Arbiter**: iterative fix with deadlock resolution via System Architect
- **Agent Memory**: persistent memory files for cross-session learning
- **Project Profiles**: enterprise, normal, internal with different thresholds
