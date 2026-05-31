# Visual Audit Report Template

Use this template when generating a Visual Audit Report. Every section is required. Screenshots and diff images must be included.

---

# Visual Audit Report: {Page Name}

## Metadata

| Field | Value |
|-------|-------|
| Page | `{page-name}` |
| Audit Timestamp | `{ISO timestamp}` |
| Auditor | `Visual Auditor Agent` |
| Contract Version | `{version}` |
| Contract File | `archonflow/contracts/{page-name}.contract.md` |
| App URL | `{url}` |
| Viewport | `{width}x{height}` |
| Browser | `Chromium (Playwright)` |

## Overall Score

| Score | Verdict |
|-------|---------|
| **{score}/100** | **{PASS / FIX REQUIRED / REJECT}** |

### Verdict Thresholds

| Score Range | Verdict | Required Action |
|-------------|---------|-----------------|
| 95–100 | ✅ PASS | Proceed to UX Compliance |
| 85–94 | ⚠️ FIX REQUIRED | Engineer fixes, then re-audit |
| <85 | ❌ REJECT | Full re-implementation required |

## Dimension Scores

| Dimension | Weight | Score | Weighted Score | Status |
|-----------|--------|-------|----------------|--------|
| Color Fidelity | 25% | {score} | {weighted} | ✅/⚠️/❌ |
| Typography Fidelity | 20% | {score} | {weighted} | ✅/⚠️/❌ |
| Spacing Fidelity | 20% | {score} | {weighted} | ✅/⚠️/❌ |
| Radius Fidelity | 15% | {score} | {weighted} | ✅/⚠️/❌ |
| Layout Fidelity | 15% | {score} | {weighted} | ✅/⚠️/❌ |
| Shadow Fidelity | 5% | {score} | {weighted} | ✅/⚠️/❌ |
| **Overall** | **100%** | | **{total}** | |

## Phase 1: Static Analysis Results

### DOM Style Verification

| # | Selector | Property | Expected (Contract) | Actual (Computed) | Match | Severity |
|---|----------|----------|--------------------|--------------------|-------|----------|
| 1 | `{selector}` | `{property}` | `{expected}` | `{actual}` | ✅/❌ | CRITICAL/WARNING/INFO |
| 2 | `{selector}` | `{property}` | `{expected}` | `{actual}` | ✅/❌ | CRITICAL/WARNING/INFO |

### Summary

- Total checks: `{count}`
- Passed: `{count}`
- Failed: `{count}`
  - CRITICAL: `{count}`
  - WARNING: `{count}`
  - INFO: `{count}`

## Phase 2: Visual Diff Results

### Screenshot Comparison

| Viewport | Design Reference | Implementation | Diff Image | Diff % |
|----------|-----------------|----------------|------------|--------|
| Mobile (375x812) | `{path}` | `{path}` | `{path}` | `{percentage}%` |
| Tablet (768x1024) | `{path}` | `{path}` | `{path}` | `{percentage}%` |
| Desktop (1440x900) | `{path}` | `{path}` | `{path}` | `{percentage}%` |

### Color Distance Analysis

| Region | Expected Color | Actual Color | ΔE00 | Severity |
|--------|---------------|-------------|------|----------|
| `{region}` | `{hex}` | `{hex}` | `{value}` | CRITICAL/WARNING/INFO |

## Findings

### CRITICAL (Must Fix)

#### C-{id}: {Title}

- **Selector**: `{CSS selector}`
- **Property**: `{property name}`
- **Expected**: `{contract value}` (Contract: `{section}`, Line `{number}`)
- **Actual**: `{computed value}`
- **Impact**: `{user-facing impact description}`
- **Screenshot**: `![diff]({path})`
- **Fix Guidance**: `{specific fix instruction}`

### WARNING (Should Fix)

#### W-{id}: {Title}

- **Selector**: `{CSS selector}`
- **Property**: `{property name}`
- **Expected**: `{contract value}`
- **Actual**: `{computed value}`
- **Impact**: `{description}`
- **Fix Guidance**: `{specific fix instruction}`

### INFO (Cosmetic)

#### I-{id}: {Title}

- **Description**: `{description}`
- **Note**: `{additional context}`

## Screenshots

### Design Reference
`![stitch-reference]({path})`

### Implementation
`![implementation]({path})`

### Visual Diff (Overlay)
`![diff-overlay]({path})`

### Visual Diff (Heatmap)
`![diff-heatmap]({path})`

## Audit Trail

| Step | Timestamp | Action | Result |
|------|-----------|--------|--------|
| 1 | `{time}` | Launch browser | ✅ |
| 2 | `{time}` | Navigate to `{url}` | ✅ |
| 3 | `{time}` | Capture screenshots | ✅ |
| 4 | `{time}` | Run DOM inspection | ✅ |
| 5 | `{time}` | Run visual diff | ✅ |
| 6 | `{time}` | Calculate scores | ✅ |

## Next Steps

{If PASS: "Proceed to UX Compliance audit."}
{If FIX REQUIRED: "Frontend Engineer must address CRITICAL and WARNING findings. Re-audit required after fixes."}
{If REJECT: "Full re-implementation required. Frontend Engineer should re-read the Design Contract before starting."}
