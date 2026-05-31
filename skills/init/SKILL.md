---
name: init
description: "Initialize ArchonFlow in the current project. Creates directory structure, copies runtime files (config, templates, scripts), and sets up project configuration. Run once after /plugin install archonflow."
---

# Init Skill

Initialize ArchonFlow in the current project. This skill sets up the directory structure, copies runtime files from the plugin, and prepares the project configuration.

## When to Run

Run this skill once after installing the ArchonFlow plugin:

```
/plugin marketplace add evan3060/ArchonFlow
/plugin install archonflow
/archonflow:init
```

## Steps

### 1. Locate Plugin Files

Find the installed plugin directory. It should be at one of these paths:

- `.claude/plugins/archonflow/`
- Or check the plugin install location

Verify the plugin is installed by checking for `agents/` and `skills/` directories.

If the plugin is not found, stop and inform the user:

> ArchonFlow plugin not found. Please install it first:
> `/plugin marketplace add evan3060/ArchonFlow`
> `/plugin install archonflow`

### 2. Create Directory Structure

Create the ArchonFlow runtime directories in the project root:

```bash
mkdir -p archonflow/config
mkdir -p archonflow/templates
mkdir -p archonflow/scripts
mkdir -p archonflow/memory
mkdir -p archonflow/changes
mkdir -p archonflow/specs
mkdir -p archonflow/contracts
mkdir -p archonflow/audits
mkdir -p archonflow/visual-reports
mkdir -p archonflow/ux-reports
mkdir -p archonflow/reports
mkdir -p archonflow/mock
mkdir -p design-references
```

### 3. Copy Runtime Files

Copy static files from the plugin directory to the project:

```bash
cp .claude/plugins/archonflow/config/project.config.json archonflow/config/project.config.json
cp -r .claude/plugins/archonflow/templates/* archonflow/templates/
cp -r .claude/plugins/archonflow/scripts/* archonflow/scripts/
```

If any of these files already exist in the project, do NOT overwrite them — ask the user whether to keep existing files or replace with defaults.

### 4. Initialize Changelog

Create `archonflow/changelog.md` if it doesn't exist:

```markdown
# ArchonFlow Changelog

| Change | Status | Date | Notes |
|--------|--------|------|-------|
```

### 5. Configure Project

Read `archonflow/config/project.config.json` and prompt the user to fill in:

1. **Project name** — the name of the project
2. **Design source mode** — Mode A (external design) or Mode B (default design)
3. **Project profile** — enterprise, normal, or internal
4. **Tech stack** — framework, language, styling, state management, build tool

Update the config file with the user's answers.

### 6. Install Script Dependencies

If the project will use visual audit, install the script dependencies:

```bash
cd archonflow/scripts && npm install
```

Ask the user whether they plan to use visual audit. If yes, run the install. If no, skip this step.

### 7. Verify Installation

Check that all required files and directories are in place:

- [ ] `archonflow/config/project.config.json` exists and is configured
- [ ] `archonflow/templates/` contains template files
- [ ] `archonflow/scripts/` contains script files
- [ ] `archonflow/changelog.md` exists
- [ ] `archonflow/memory/` directory exists
- [ ] `design-references/` directory exists

### 8. Report

Print the initialization summary:

```
✅ ArchonFlow initialized successfully!

Project: {project name}
Design mode: {A/B}
Profile: {enterprise/normal/internal}
Tech stack: {framework} + {language}

Directory structure created:
  archonflow/config/       — Project configuration
  archonflow/templates/    — Report templates
  archonflow/scripts/      — Visual audit scripts
  archonflow/memory/       — Agent memory (runtime)
  archonflow/changes/      — Active changes
  archonflow/specs/        — Archived specs
  archonflow/contracts/    — Design & API contracts
  design-references/       — Place design exports here

Next steps:
1. Place design files in design-references/ (if Mode A)
2. Run /archonflow:proposal to start the pipeline
```
