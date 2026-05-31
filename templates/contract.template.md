# Design Contract Template

Use this template when generating a new Design Contract. Every section is required. If information is missing from the design export, mark it as `[AMBIGUOUS]` rather than leaving it blank or guessing.

---

# {Page Name} Design Contract

## Metadata

| Field | Value |
|-------|-------|
| Page | `{page-name}` |
| Version | `0.1.0` |
| Generated | `{ISO timestamp}` |
| Design Source | `design-references/{page-name}/` |
| Status | `DRAFT` |
| Architect | `Design Authority Agent` |

## Design Tokens Used

| Token Name | Value | Category | Contract Reference |
|------------|-------|----------|-------------------|
| `color-surface` | `#f9f9ff` | color | Section → Container |
| `color-card` | `#ffffff` | color | Section → Card |
| `color-primary` | `{value}` | color | Section → Button |
| `color-on-primary` | `{value}` | color | Section → Button |
| `color-text-primary` | `{value}` | color | Section → Text |
| `color-text-secondary` | `{value}` | color | Section → Text |
| `radius-card` | `{value}px` | radius | Section → Card |
| `radius-button` | `{value}px` | radius | Section → Button |
| `radius-input` | `{value}px` | radius | Section → Input |
| `spacing-page` | `{value}px` | spacing | Section → Container |
| `spacing-section` | `{value}px` | spacing | Section → Section gap |
| `spacing-component` | `{value}px` | spacing | Section → Component gap |
| `spacing-element` | `{value}px` | spacing | Section → Element gap |
| `font-heading` | `{font-name}` | typography | Section → Heading |
| `font-body` | `{font-name}` | typography | Section → Body |
| `shadow-card` | `{value}` | shadow | Section → Card |
| `shadow-elevated` | `{value}` | shadow | Section → Elevated |

## Page Structure

### Container

| Property | Value | Token |
|----------|-------|-------|
| width | `100%` | — |
| min-height | `100vh` | — |
| padding | `{value}px` | `spacing-page` |
| background | `{value}` | `color-surface` |
| overflow | `auto` | — |

### Section: {Section Name}

| Property | Value | Token |
|----------|-------|-------|
| display | `flex` | — |
| direction | `column` | — |
| gap | `{value}px` | `spacing-section` |
| padding | `{value}px` | — |

#### Component: {Component Name}

| Property | Value | Token |
|----------|-------|-------|
| background | `{value}` | `color-card` |
| border-radius | `{value}px` | `radius-card` |
| padding | `{value}px` | `spacing-component` |
| box-shadow | `{value}` | `shadow-card` |
| border | `{value}` | — |

##### Sub-element: {Element Name}

| Property | Value | Token |
|----------|-------|-------|
| font-family | `{value}` | `font-heading` |
| font-size | `{value}px` | — |
| font-weight | `{value}` | — |
| line-height | `{value}px` | — |
| color | `{value}` | `color-text-primary` |
| margin-bottom | `{value}px` | `spacing-element` |

## Interaction States

### {Component Name} — {Element Type}

| State | Property | Value | Token |
|-------|----------|-------|-------|
| default | background | `{value}` | `color-primary` |
| default | color | `{value}` | `color-on-primary` |
| default | border-radius | `{value}px` | `radius-button` |
| hover | background | `{value}` | — |
| hover | scale | `{value}` | — |
| focus | outline | `{value}` | — |
| focus | outline-offset | `{value}` | — |
| active | background | `{value}` | — |
| active | scale | `{value}` | — |
| disabled | background | `{value}` | — |
| disabled | opacity | `{value}` | — |
| disabled | cursor | `not-allowed` | — |

## Responsive Behavior

### Mobile (<768px)

| Element | Property | Value |
|---------|----------|-------|
| Container | padding | `{value}px` |
| {Component} | layout | `{value}` |
| {Component} | gap | `{value}px` |
| {Text} | font-size | `{value}px` |

### Tablet (768px–1024px)

| Element | Property | Value |
|---------|----------|-------|
| Container | padding | `{value}px` |
| {Component} | layout | `{value}` |

### Desktop (>1024px)

| Element | Property | Value |
|---------|----------|-------|
| Container | max-width | `{value}px` |
| {Component} | layout | `{value}` |

## Animations & Transitions

| Animation | Trigger | Duration | Easing | Properties |
|-----------|---------|----------|--------|------------|
| {name} | {trigger} | `{value}ms` | `{easing}` | {properties} |

## AMBIGUOUS Items

| ID | Item | Description | Resolution | Status |
|----|------|-------------|------------|--------|
| AMB-001 | {item} | {why it's ambiguous} | {resolution or blank} | OPEN |

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | {date} | Initial contract from design export |
