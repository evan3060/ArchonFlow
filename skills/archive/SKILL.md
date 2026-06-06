---
name: archive
description: "Archive a verified change: merge Delta Specs into Source of Truth, move change to archive, update changelog. Final step in the ArchonFlow pipeline."
---

# Archive Skill

Archive a verified change by merging Delta Specs into the Source of Truth (`archonflow/specs/`), moving the change directory to `archonflow/archive/`, and updating the changelog.

## When to Run

Run this skill after `/archonflow:verify` passes and the user confirms archiving:

```
/archonflow:archive {YYYYMMDD-change-name}
```

## Prerequisites

- `archonflow/changes/{YYYYMMDD-change-name}/verify-report.md` exists and shows all audits passed
- User has confirmed archiving

## Process

### Phase 1: Pre-Archive Validation

1. Verify `archonflow/changes/{YYYYMMDD-change-name}/` exists
2. Verify `verify-report.md` exists and shows overall PASS
3. Verify `specs/` directory exists in the change (Delta Specs)
4. If any prerequisite fails → stop and inform the user

### Phase 2: Merge Delta Specs

Merge Delta Specs from the change into the Source of Truth (`archonflow/specs/`).

**Merge Order** (OpenSpec convention): `RENAMED → REMOVED → MODIFIED → ADDED`

For each Delta Spec file in `archonflow/changes/{YYYYMMDD-change-name}/specs/`:

1. **ADDED Requirements**: Create new spec file in `archonflow/specs/{domain}/spec.md` or append to existing
2. **MODIFIED Requirements**: Update the corresponding section in `archonflow/specs/{domain}/spec.md`
   - Replace the old Requirement text with the complete updated text from the Delta
   - Preserve the Requirement name/ID
3. **REMOVED Requirements**: Remove the corresponding section from `archonflow/specs/{domain}/spec.md`
4. **RENAMED Requirements**: Rename the corresponding section

**Merge Rules**:
- If `archonflow/specs/{domain}/spec.md` doesn't exist, create it with a header and the ADDED Requirements
- If a MODIFIED/REMOVED Requirement doesn't exist in the target, log a warning and skip
- After merge, the Source of Truth spec should be self-contained (no Delta markers)

### Phase 3: Move to Archive

Move the entire change directory to archive:

```
archonflow/changes/{YYYYMMDD-change-name}/
  → archonflow/archive/{YYYYMMDD-change-name}/
```

**What gets archived**:
- `proposal.md`
- `specs/` (Delta Specs, for historical reference)
- `design/` (design decisions + contracts)
- `tasks.md`
- `tests/` (test files)
- `assets/` (imported resources)
- `history.md`
- `verify-report.md`
- `fix-report.md` (if exists)
- `assumptions.md`
- `plan.md`
- `analysis.md`

**What does NOT get archived** (stays in project):
- Source code in `src/`
- Test files in `tests/` (if moved to project test directory)
- Design tokens in `src/styles/tokens/`
- Mock data in `archonflow/mock/`

### Phase 4: Update Changelog

Update `archonflow/changelog.md` with the archived change:

```markdown
## [YYYY-MM-DD] — {change-name}

### ADDED
- **{Requirement Name}**: {brief description of what was added}

### MODIFIED
- **{Requirement Name}**: {brief description of what changed}

### REMOVED
- **{Requirement Name}**: {brief description of what was removed}

### Incident (if any)
- **{Incident Title}**: {brief description of what went wrong and how it was resolved}

### Artifacts
- Proposal: archonflow/archive/{YYYYMMDD-change-name}/proposal.md
- Specs: archonflow/archive/{YYYYMMDD-change-name}/specs/
- Design: archonflow/archive/{YYYYMMDD-change-name}/design/
- Tests: archonflow/archive/{YYYYMMDD-change-name}/tests/
- Verify: archonflow/archive/{YYYYMMDD-change-name}/verify-report.md
```

### Phase 5: Update History

Append archive event to `archonflow/archive/{YYYYMMDD-change-name}/history.md`:

```markdown
| {date} | archive | Archived by user | @user | {git-hash} | Delta merged to specs/{domain}/spec.md |
```

### Phase 6: Version Update (Optional)

If the user requests a version bump:

1. Read current version from `archonflow/config/project.config.json`
2. Increment version number
3. Update version in all config files:
   - `package.json`
   - `archonflow/config/project.config.json`
   - `.claude-plugin/plugin.json`
   - `skills/status/SKILL.md`

### Phase 7: Git Commit

```bash
git add -A
git commit -m "archive: {YYYYMMDD-change-name} — {brief description}"
```

## Output

- Updated `archonflow/specs/` — Source of Truth with merged Delta Specs
- `archonflow/archive/{YYYYMMDD-change-name}/` — archived change directory
- Updated `archonflow/changelog.md` — changelog entry
- Updated `archonflow/archive/{YYYYMMDD-change-name}/history.md` — archive event

## Next Step

The change is now archived. The Source of Truth in `archonflow/specs/` reflects the current state of the system. Future incremental changes will reference these specs for conflict detection and impact analysis.
