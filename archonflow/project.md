# ArchonFlow Project

## Metadata
- **Name**: ArchonFlow
- **Description**: Multi-Agent Full-Stack Delivery Pipeline with Contract-Driven Development and Spec-Driven Verification
- **Version**: 0.5.0
- **License**: MIT

## Principles

1. **Contract First Development** — design contract is the single source of truth, derived from design export, obeyed by all agents
2. **Spec-Driven Development** — every feature MUST have behavioral specifications (SHALL/MUST + GIVEN/WHEN/THEN) before implementation begins
3. **Cognitive Isolation** — each agent sees ONLY what it needs; auditors never see source code
4. **Root Cause Gate** — no code modification allowed until root cause is proven through hypothesis-disprove cycle
5. **TDD Discipline** — RED-GREEN-REFACTOR, test skeletons generated from Spec Scenarios before implementation
6. **Surgical Fix Contract** — Engineer MUST fix ONLY the violations listed, no refactoring or unrelated changes
7. **Delta Spec Management** — changes are tracked as Delta Specs (ADDED/MODIFIED/REMOVED), merged into Source of Truth on archive

## Pipeline

```
Proposal → Design → Build → Verify → Fix → Archive
   │         │        │       │       │       │
   └─Specs───┘        └─Tests─┘       │       └─Merge Delta→SoT
                                      └─Root Cause Gate
```

## Directory Convention

```
archonflow/
├── project.md              # This file
├── changelog.md            # Change history
├── specs/                  # Source of Truth (merged Delta Specs)
├── changes/{YYYYMMDD-id}/  # Active changes
│   ├── proposal.md
│   ├── specs/              # Delta Specs
│   ├── design/             # Design decisions + contracts
│   ├── tasks.md
│   ├── tests/              # Test skeletons from Spec Scenarios
│   ├── assets/             # Imported design resources
│   └── history.md          # Change lifecycle log
├── archive/{YYYYMMDD-id}/  # Archived changes
├── contracts/              # Global contracts
├── audits/                 # Audit reports
├── memory/                 # Agent memory
└── config/                 # Configuration
```
