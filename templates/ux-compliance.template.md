# UX Compliance Report Template

Use this template when generating a UX Compliance Report. This report is only generated AFTER the Visual Audit has PASSED (score ≥ 95).

---

# UX Compliance Report: {Page Name}

## Metadata

| Field | Value |
|-------|-------|
| Page | `{page-name}` |
| Report Timestamp | `{ISO timestamp}` |
| Officer | `UX Compliance Agent` |
| Contract Version | `{version}` |
| Visual Audit Status | `PASS (score: {visual_score}/100)` |
| Visual Audit Report | `archonflow/audits/{page-name}.audit.{timestamp}.md` |

## Overall Verdict

| Verdict | Description |
|---------|-------------|
| **{PASS / CONDITIONAL / FAIL}** | {explanation} |

### Verdict Definitions

| Verdict | Condition |
|---------|-----------|
| ✅ PASS | All checks pass, no critical findings |
| ⚠️ CONDITIONAL | Non-critical findings, can proceed with noted issues |
| ❌ FAIL | Critical findings, must fix before proceeding |

## State Compliance

### Interactive Elements Inventory

| # | Element | Selector | Type | States in Contract | States Implemented |
|---|---------|----------|------|--------------------|--------------------|
| 1 | `{name}` | `{selector}` | button | default, hover, focus, active, disabled | default, hover, focus, active, disabled |

### State Verification Matrix

| Element | Default | Hover | Focus | Active | Disabled | Loading | Error | Empty |
|---------|---------|-------|-------|--------|----------|---------|-------|-------|
| `{selector}` | ✅ | ✅ | ❌ | ✅ | ⚠️ | N/A | N/A | N/A |
| `{selector}` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |

### State Detail Findings

#### S-{id}: {Element} — {State} State Mismatch

- **Selector**: `{CSS selector}`
- **State**: `{state name}`
- **Contract Specifies**: `{expected behavior/styles}`
- **Implementation Does**: `{actual behavior/styles}`
- **How to Reproduce**: `{steps}`
- **Impact**: `{user impact}`
- **Severity**: CRITICAL / WARNING / INFO

## Animation Compliance

### Animation Inventory

| # | Animation | Element | Trigger | Contract Duration | Actual Duration | Match |
|---|-----------|---------|---------|-------------------|-----------------|-------|
| 1 | `{name}` | `{selector}` | `{trigger}` | `{duration}ms` | `{duration}ms` | ✅/❌ |

### Easing Verification

| Animation | Contract Easing | Actual Easing | Match |
|-----------|----------------|---------------|-------|
| `{name}` | `{easing function}` | `{easing function}` | ✅/❌ |

### Animation Detail Findings

#### A-{id}: {Animation Name} Mismatch

- **Element**: `{selector}`
- **Trigger**: `{trigger}`
- **Contract Duration**: `{expected}ms`
- **Actual Duration**: `{actual}ms`
- **Contract Easing**: `{expected}`
- **Actual Easing**: `{actual}`
- **Impact**: `{user impact}`
- **Severity**: CRITICAL / WARNING / INFO

## Navigation Compliance

### Route Verification

| # | Route | Contract Path | Actual Path | Match |
|---|-------|--------------|-------------|-------|
| 1 | `{name}` | `{path}` | `{path}` | ✅/❌ |

### Transition Verification

| From | To | Contract Transition | Actual Transition | Match |
|------|----|--------------------|-------------------|-------|
| `{page}` | `{page}` | `{type}` | `{type}` | ✅/❌ |

### Back Navigation

| Route | Back Target | Works Correctly |
|-------|------------|-----------------|
| `{path}` | `{path}` | ✅/❌ |

## Accessibility Compliance

### Keyboard Navigation

| Check | Result | Details |
|-------|--------|---------|
| All interactive elements reachable via Tab | ✅/❌ | `{details}` |
| Focus order is logical | ✅/❌ | `{details}` |
| Enter/Space activates buttons | ✅/❌ | `{details}` |
| Escape closes modals/overlays | ✅/❌ | `{details}` |
| Tab trapping in modals | ✅/❌ | `{details}` |

### Focus Indicators

| Element | Focus Visible | Focus Style Matches Contract | Contrast Ratio |
|---------|--------------|------------------------------|----------------|
| `{selector}` | ✅/❌ | ✅/❌ | `{ratio}:1` |

### ARIA Labels

| Element | Accessible Name | Method | Status |
|---------|----------------|--------|--------|
| `{selector}` | `{name}` | aria-label / text content / aria-labelledby | ✅/❌ |

### Color Contrast

| Element | Text Color | Background | Ratio | WCAG Level | Status |
|---------|-----------|------------|-------|------------|--------|
| `{selector}` | `{color}` | `{color}` | `{ratio}:1` | AA/AAA/FAIL | ✅/❌ |

### Touch Targets (Mobile)

| Element | Size | Minimum 44x44 | Gap to Adjacent | Minimum 8px | Status |
|---------|------|----------------|-----------------|-------------|--------|
| `{selector}` | `{W}x{H}` | ✅/❌ | `{gap}px` | ✅/❌ | ✅/❌ |

## Findings Summary

### CRITICAL (Must Fix)

#### UX-C-{id}: {Title}

- **Category**: State / Animation / Navigation / Accessibility
- **Element**: `{selector}`
- **Contract Reference**: `{contract section}`
- **Issue**: `{description}`
- **Impact**: `{user impact}`
- **Fix Guidance**: `{specific instruction}`

### WARNING (Should Fix)

#### UX-W-{id}: {Title}

- **Category**: State / Animation / Navigation / Accessibility
- **Issue**: `{description}`
- **Fix Guidance**: `{specific instruction}`

### INFO (Noted)

#### UX-I-{id}: {Title}

- **Description**: `{description}`

## Next Steps

{If PASS: "Page passes UX compliance. Proceed to Code Review."}
{If CONDITIONAL: "Page can proceed with noted issues. Warnings should be addressed in next iteration."}
{If FAIL: "Critical UX issues must be fixed. Frontend Engineer must address CRITICAL findings. Re-audit required after fixes."}
