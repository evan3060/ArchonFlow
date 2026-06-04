/**
 * Contract Assertion — Runs deterministic Playwright assertions against
 * the compiled assertions.json from contract-compiler.ts.
 *
 * This script performs Step 1 of the three-layer visual verification:
 *   Contract Assertion (deterministic) → VRT (perceptual) → Human confirmation
 *
 * It uses getComputedStyle() and getBoundingClientRect() to verify
 * layout, spacing, alignment, and color properties against the contract.
 * No LLM is involved — results are pure PASS/FAIL.
 *
 * Usage:
 *   ts-node scripts/contract-assert.ts <url> <assertions-json> [output-dir]
 *   ts-node scripts/contract-assert.ts http://localhost:5173 archonflow/changes/my-feature/assertions.json test/vrt/results
 */

import { chromium, type Page, type Browser } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import type {
  AssertionsFile,
  Assertion,
  PropertyAssertion,
  ChildCountAssertion,
  RectCenterAlignmentAssertion,
  RectGapAssertion,
  RectSizeAssertion,
  RectPositionAssertion,
  ColorAssertion,
} from './contract-compiler';

// ─── Types ───────────────────────────────────────────────────────────

interface AssertionResult {
  component: string;
  assertion: string;
  status: 'PASS' | 'FAIL';
  type: string;
  expected: string;
  actual: string;
  violation_id: string;
  description: string;
  suggested_fix: string;
}

interface AssertionReport {
  version: string;
  source: string;
  url: string;
  timestamp: string;
  summary: {
    total: number;
    pass: number;
    fail: number;
  };
  results: AssertionResult[];
}

// ─── Color Comparison (CIEDE2000) ────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  return [
    parseInt(full.substring(0, 2), 16),
    parseInt(full.substring(2, 4), 16),
    parseInt(full.substring(4, 6), 16),
  ];
}

function parseRgbString(rgb: string): [number, number, number] | null {
  const match = rgb.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (match) return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  return null;
}

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  let rl = r / 255, gl = g / 255, bl = b / 255;
  rl = rl > 0.04045 ? Math.pow((rl + 0.055) / 1.055, 2.4) : rl / 12.92;
  gl = gl > 0.04045 ? Math.pow((gl + 0.055) / 1.055, 2.4) : gl / 12.92;
  bl = bl > 0.04045 ? Math.pow((bl + 0.055) / 1.055, 2.4) : bl / 12.92;
  rl *= 100; gl *= 100; bl *= 100;
  const x = rl * 0.4124 + gl * 0.3576 + bl * 0.1805;
  const y = rl * 0.2126 + gl * 0.7152 + bl * 0.0722;
  const z = rl * 0.0193 + gl * 0.1192 + bl * 0.9505;
  const xn = 95.047, yn = 100.0, zn = 108.883;
  const epsilon = 0.008856, kappa = 903.3;
  let xv = x / xn, yv = y / yn, zv = z / zn;
  xv = xv > epsilon ? Math.cbrt(xv) : (kappa * xv + 16) / 116;
  yv = yv > epsilon ? Math.cbrt(yv) : (kappa * yv + 16) / 116;
  zv = zv > epsilon ? Math.cbrt(zv) : (kappa * zv + 16) / 116;
  return [116 * yv - 16, 500 * (xv - yv), 200 * (yv - zv)];
}

function ciede2000(lab1: [number, number, number], lab2: [number, number, number]): number {
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;
  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cab = (C1 + C2) / 2;
  const Cab7 = Math.pow(Cab, 7);
  const G = 0.5 * (1 - Math.sqrt(Cab7 / (Cab7 + Math.pow(25, 7))));
  const a1p = a1 * (1 + G), a2p = a2 * (1 + G);
  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);
  const h1p = Math.atan2(b1, a1p) * 180 / Math.PI + (Math.atan2(b1, a1p) < 0 ? 360 : 0);
  const h2p = Math.atan2(b2, a2p) * 180 / Math.PI + (Math.atan2(b2, a2p) < 0 ? 360 : 0);
  const dLp = L2 - L1, dCp = C2p - C1p;
  let dhp: number;
  if (C1p * C2p === 0) dhp = 0;
  else if (Math.abs(h2p - h1p) <= 180) dhp = h2p - h1p;
  else if (h2p - h1p > 180) dhp = h2p - h1p - 360;
  else dhp = h2p - h1p + 360;
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp * Math.PI / 360);
  const Lbp = (L1 + L2) / 2, Cbp = (C1p + C2p) / 2;
  let hbp: number;
  if (C1p * C2p === 0) hbp = h1p + h2p;
  else if (Math.abs(h1p - h2p) <= 180) hbp = (h1p + h2p) / 2;
  else if (h1p + h2p < 360) hbp = (h1p + h2p + 360) / 2;
  else hbp = (h1p + h2p - 360) / 2;
  const T = 1 - 0.17 * Math.cos((hbp - 30) * Math.PI / 180)
    + 0.24 * Math.cos(2 * hbp * Math.PI / 180)
    + 0.32 * Math.cos((3 * hbp + 6) * Math.PI / 180)
    - 0.20 * Math.cos((4 * hbp - 63) * Math.PI / 180);
  const Lbp50 = Math.pow(Lbp - 50, 2);
  const SL = 1 + 0.015 * Lbp50 / Math.sqrt(20 + Lbp50);
  const SC = 1 + 0.045 * Cbp;
  const SH = 1 + 0.015 * Cbp * T;
  const Cbp7 = Math.pow(Cbp, 7);
  const RT = -2 * Math.sqrt(Cbp7 / (Cbp7 + Math.pow(25, 7)))
    * Math.sin((60 - Math.abs(hbp % 360 - 180 < 0 ? hbp % 360 + 180 : hbp % 360 - 180)) * Math.PI / 180);
  return Math.max(0, Math.sqrt(
    Math.pow(dLp / SL, 2) + Math.pow(dCp / SC, 2) + Math.pow(dHp / SH, 2)
    + RT * (dCp / SC) * (dHp / SH)
  ));
}

// ─── Assertion Evaluators ────────────────────────────────────────────

function parsePxValue(value: string): number {
  const match = value.match(/(-?\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
}

function withinTolerance(actual: number, expected: number, tolerance: string | null): boolean {
  if (tolerance === null) return actual === expected;
  const tol = parsePxValue(tolerance);
  return Math.abs(actual - expected) <= tol;
}

async function evaluatePropertyAssertion(
  page: Page, componentSelector: string, assertion: PropertyAssertion
): Promise<AssertionResult> {
  const selector = assertion.selector || componentSelector;
  const violationId = `CONTRACT-${assertion.property.toUpperCase()}`;

  const actual = await page.evaluate(
    ({ selector, property }) => {
      const el = document.querySelector(selector);
      if (!el) return { found: false, value: 'ELEMENT_NOT_FOUND' };
      const computed = getComputedStyle(el);
      return { found: true, value: computed.getPropertyValue(property).trim() };
    },
    { selector, property: assertion.property }
  );

  if (!actual.found) {
    return fail(componentSelector, assertion.property, 'property', assertion.expected, 'ELEMENT_NOT_FOUND', violationId, `Element not found: ${selector}`);
  }

  const pass = actual.value === assertion.expected;
  return {
    component: componentSelector,
    assertion: assertion.property,
    status: pass ? 'PASS' : 'FAIL',
    type: 'property',
    expected: assertion.expected,
    actual: actual.value,
    violation_id: pass ? '' : violationId,
    description: assertion.description,
    suggested_fix: pass ? '' : `Set ${assertion.property} to "${assertion.expected}" on ${selector}`,
  };
}

async function evaluateChildCountAssertion(
  page: Page, componentSelector: string, name: string, assertion: ChildCountAssertion
): Promise<AssertionResult> {
  const selector = assertion.selector || componentSelector;
  const violationId = `CONTRACT-${name.toUpperCase()}`;

  const actual = await page.evaluate(
    (selector) => {
      const el = document.querySelector(selector);
      if (!el) return { found: false, count: 0 };
      return { found: true, count: el.children.length };
    },
    selector
  );

  if (!actual.found) {
    return fail(componentSelector, name, 'child_count', String(assertion.expected), 'ELEMENT_NOT_FOUND', violationId, `Element not found: ${selector}`);
  }

  const pass = actual.count === assertion.expected;
  return {
    component: componentSelector,
    assertion: name,
    status: pass ? 'PASS' : 'FAIL',
    type: 'child_count',
    expected: String(assertion.expected),
    actual: String(actual.count),
    violation_id: pass ? '' : violationId,
    description: assertion.description,
    suggested_fix: pass ? '' : `Ensure ${selector} has exactly ${assertion.expected} children (found ${actual.count})`,
  };
}

async function evaluateRectCenterAlignmentAssertion(
  page: Page, componentSelector: string, name: string, assertion: RectCenterAlignmentAssertion
): Promise<AssertionResult> {
  const selectorA = assertion.selector_a;
  const selectorB = assertion.selector_b;
  const violationId = `CONTRACT-${name.toUpperCase()}`;

  const result = await page.evaluate(
    ({ selectorA, selectorB }) => {
      const elA = document.querySelector(selectorA);
      const elB = document.querySelector(selectorB);
      if (!elA || !elB) return { found: false, offset_x: 0, offset_y: 0, centerA: { x: 0, y: 0 }, centerB: { x: 0, y: 0 } };
      const rectA = elA.getBoundingClientRect();
      const rectB = elB.getBoundingClientRect();
      const centerAx = rectA.left + rectA.width / 2;
      const centerAy = rectA.top + rectA.height / 2;
      const centerBx = rectB.left + rectB.width / 2;
      const centerBy = rectB.top + rectB.height / 2;
      return {
        found: true,
        offset_x: Math.abs(centerAx - centerBx),
        offset_y: Math.abs(centerAy - centerBy),
        centerA: { x: centerAx, y: centerAy },
        centerB: { x: centerBx, y: centerBy },
      };
    },
    { selectorA, selectorB }
  );

  if (!result.found) {
    return fail(componentSelector, name, 'rect_center_alignment', `≤ ${assertion.tolerance || '0px'}`, 'ELEMENT_NOT_FOUND', violationId, `Elements not found: ${selectorA} or ${selectorB}`);
  }

  const tolerance = parsePxValue(assertion.tolerance || '0px');
  const offsetX = result.offset_x;
  const offsetY = result.offset_y;

  let pass: boolean;
  let actualStr: string;
  let expectedStr: string;

  if (assertion.axis === 'x') {
    pass = offsetX <= tolerance;
    actualStr = `offset_x = ${offsetX.toFixed(1)}px`;
    expectedStr = `offset_x ≤ ${tolerance}px`;
  } else if (assertion.axis === 'y') {
    pass = offsetY <= tolerance;
    actualStr = `offset_y = ${offsetY.toFixed(1)}px`;
    expectedStr = `offset_y ≤ ${tolerance}px`;
  } else {
    pass = offsetX <= tolerance && offsetY <= tolerance;
    actualStr = `offset_x = ${offsetX.toFixed(1)}px, offset_y = ${offsetY.toFixed(1)}px`;
    expectedStr = `both offsets ≤ ${tolerance}px`;
  }

  return {
    component: componentSelector,
    assertion: name,
    status: pass ? 'PASS' : 'FAIL',
    type: 'rect_center_alignment',
    expected: expectedStr,
    actual: actualStr,
    violation_id: pass ? '' : violationId,
    description: assertion.description,
    suggested_fix: pass ? '' : `Adjust alignment of ${selectorA} and ${selectorB} so centers are within ${tolerance}px on ${assertion.axis}-axis. Current: A center=(${result.centerA.x.toFixed(1)}, ${result.centerA.y.toFixed(1)}), B center=(${result.centerB.x.toFixed(1)}, ${result.centerB.y.toFixed(1)})`,
  };
}

async function evaluateRectGapAssertion(
  page: Page, componentSelector: string, name: string, assertion: RectGapAssertion
): Promise<AssertionResult> {
  const selectorA = assertion.selector_a;
  const selectorB = assertion.selector_b;
  const violationId = `CONTRACT-${name.toUpperCase()}`;

  const result = await page.evaluate(
    ({ selectorA, selectorB }) => {
      const elA = document.querySelector(selectorA);
      const elB = document.querySelector(selectorB);
      if (!elA || !elB) return { found: false, gap_vertical: 0, gap_horizontal: 0, rectA: null, rectB: null };
      const rectA = elA.getBoundingClientRect();
      const rectB = elB.getBoundingClientRect();
      return {
        found: true,
        gap_vertical: rectB.top - rectA.bottom,
        gap_horizontal: rectB.left - rectA.right,
        rectA: { top: rectA.top, bottom: rectA.bottom, left: rectA.left, right: rectA.right },
        rectB: { top: rectB.top, bottom: rectB.bottom, left: rectB.left, right: rectB.right },
      };
    },
    { selectorA, selectorB }
  );

  if (!result.found) {
    return fail(componentSelector, name, 'rect_gap', assertion.expected, 'ELEMENT_NOT_FOUND', violationId, `Elements not found: ${selectorA} or ${selectorB}`);
  }

  const expectedGap = parsePxValue(assertion.expected);
  const tolerance = parsePxValue(assertion.tolerance || '0px');
  const actualGap = assertion.direction === 'vertical' ? result.gap_vertical : result.gap_horizontal;
  const pass = withinTolerance(actualGap, expectedGap, assertion.tolerance);

  const isOverlap = actualGap < 0;
  const actualStr = isOverlap ? `${actualGap.toFixed(1)}px (OVERLAP)` : `${actualGap.toFixed(1)}px`;

  return {
    component: componentSelector,
    assertion: name,
    status: pass ? 'PASS' : 'FAIL',
    type: 'rect_gap',
    expected: `${assertion.expected} (tolerance: ±${tolerance}px)`,
    actual: actualStr,
    violation_id: pass ? '' : violationId,
    description: assertion.description,
    suggested_fix: pass ? '' : isOverlap
      ? `Elements ${selectorA} and ${selectorB} overlap by ${Math.abs(actualGap).toFixed(1)}px. Increase ${assertion.direction} gap to ≥ ${(expectedGap - tolerance).toFixed(0)}px`
      : `Adjust ${assertion.direction} gap between ${selectorA} and ${selectorB} to ${assertion.expected}. Current: ${actualGap.toFixed(1)}px`,
  };
}

async function evaluateRectSizeAssertion(
  page: Page, componentSelector: string, name: string, assertion: RectSizeAssertion
): Promise<AssertionResult> {
  const selector = assertion.selector || componentSelector;
  const violationId = `CONTRACT-${name.toUpperCase()}`;

  const result = await page.evaluate(
    (selector) => {
      const el = document.querySelector(selector);
      if (!el) return { found: false, width: 0, height: 0 };
      const rect = el.getBoundingClientRect();
      return { found: true, width: rect.width, height: rect.height };
    },
    selector
  );

  if (!result.found) {
    return fail(componentSelector, name, 'rect_size', `${assertion.expected_width} × ${assertion.expected_height}`, 'ELEMENT_NOT_FOUND', violationId, `Element not found: ${selector}`);
  }

  const expectedW = parsePxValue(assertion.expected_width);
  const expectedH = parsePxValue(assertion.expected_height);
  const tolerance = parsePxValue(assertion.tolerance || '0px');
  const passW = withinTolerance(result.width, expectedW, assertion.tolerance);
  const passH = withinTolerance(result.height, expectedH, assertion.tolerance);
  const pass = passW && passH;

  return {
    component: componentSelector,
    assertion: name,
    status: pass ? 'PASS' : 'FAIL',
    type: 'rect_size',
    expected: `${assertion.expected_width} × ${assertion.expected_height} (tolerance: ±${tolerance}px)`,
    actual: `${result.width.toFixed(1)}px × ${result.height.toFixed(1)}px`,
    violation_id: pass ? '' : violationId,
    description: assertion.description,
    suggested_fix: pass ? '' : `Adjust size of ${selector} to ${assertion.expected_width} × ${assertion.expected_height}. Current: ${result.width.toFixed(1)}px × ${result.height.toFixed(1)}px`,
  };
}

async function evaluateRectPositionAssertion(
  page: Page, componentSelector: string, name: string, assertion: RectPositionAssertion
): Promise<AssertionResult> {
  const selector = assertion.selector || componentSelector;
  const violationId = `CONTRACT-${name.toUpperCase()}`;

  const result = await page.evaluate(
    (selector) => {
      const el = document.querySelector(selector);
      if (!el) return { found: false, top: 0, bottom: 0, left: 0, right: 0 };
      const rect = el.getBoundingClientRect();
      return { found: true, top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
    },
    selector
  );

  if (!result.found) {
    return fail(componentSelector, name, 'rect_position', assertion.expected, 'ELEMENT_NOT_FOUND', violationId, `Element not found: ${selector}`);
  }

  const actual = result[assertion.position_property as keyof typeof result] as number;
  const expected = parsePxValue(assertion.expected);
  const pass = withinTolerance(actual, expected, assertion.tolerance);

  return {
    component: componentSelector,
    assertion: name,
    status: pass ? 'PASS' : 'FAIL',
    type: 'rect_position',
    expected: `${assertion.position_property} = ${assertion.expected}`,
    actual: `${assertion.position_property} = ${actual.toFixed(1)}px`,
    violation_id: pass ? '' : violationId,
    description: assertion.description,
    suggested_fix: pass ? '' : `Adjust ${assertion.position_property} of ${selector} to ${assertion.expected}. Current: ${actual.toFixed(1)}px`,
  };
}

async function evaluateColorAssertion(
  page: Page, componentSelector: string, name: string, assertion: ColorAssertion
): Promise<AssertionResult> {
  const selector = assertion.selector || componentSelector;
  const violationId = `CONTRACT-${name.toUpperCase()}`;

  const actual = await page.evaluate(
    ({ selector, colorProperty }) => {
      const el = document.querySelector(selector);
      if (!el) return { found: false, value: '' };
      const computed = getComputedStyle(el);
      return { found: true, value: computed.getPropertyValue(colorProperty).trim() };
    },
    { selector, colorProperty: assertion.color_property }
  );

  if (!actual.found) {
    return fail(componentSelector, name, 'color', assertion.expected, 'ELEMENT_NOT_FOUND', violationId, `Element not found: ${selector}`);
  }

  const expectedRgb = hexToRgb(assertion.expected);
  const actualRgb = parseRgbString(actual.value);

  if (!actualRgb) {
    return fail(componentSelector, name, 'color', assertion.expected, actual.value, violationId, `Cannot parse color: ${actual.value}`);
  }

  const lab1 = rgbToLab(...expectedRgb);
  const lab2 = rgbToLab(...actualRgb);
  const deltaE = ciede2000(lab1, lab2);
  const pass = deltaE <= assertion.tolerance_ciede2000;

  return {
    component: componentSelector,
    assertion: name,
    status: pass ? 'PASS' : 'FAIL',
    type: 'color',
    expected: `${assertion.expected} (ΔE00 < ${assertion.tolerance_ciede2000})`,
    actual: `${actual.value} (ΔE00 = ${deltaE.toFixed(2)})`,
    violation_id: pass ? '' : violationId,
    description: assertion.description,
    suggested_fix: pass ? '' : `Set ${assertion.color_property} to ${assertion.expected} on ${selector}. Current ΔE00 = ${deltaE.toFixed(2)}`,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────

function fail(
  component: string, assertion: string, type: string,
  expected: string, actual: string, violationId: string, suggestedFix: string
): AssertionResult {
  return {
    component,
    assertion,
    status: 'FAIL',
    type,
    expected,
    actual,
    violation_id: violationId,
    description: `Assert ${assertion}`,
    suggested_fix: suggestedFix,
  };
}

// ─── Main Runner ─────────────────────────────────────────────────────

async function runAssertions(
  page: Page,
  assertionsFile: AssertionsFile
): Promise<AssertionReport> {
  const results: AssertionResult[] = [];

  for (const [componentName, componentConfig] of Object.entries(assertionsFile.components)) {
    const componentSelector = componentConfig.selector;

    for (const [assertionName, assertion] of Object.entries(componentConfig.assertions)) {
      let result: AssertionResult;

      switch (assertion.type) {
        case 'property':
          result = await evaluatePropertyAssertion(page, componentSelector, assertion as PropertyAssertion);
          result.assertion = assertionName;
          break;
        case 'child_count':
          result = await evaluateChildCountAssertion(page, componentSelector, assertionName, assertion as ChildCountAssertion);
          break;
        case 'rect_center_alignment':
          result = await evaluateRectCenterAlignmentAssertion(page, componentSelector, assertionName, assertion as RectCenterAlignmentAssertion);
          break;
        case 'rect_gap':
          result = await evaluateRectGapAssertion(page, componentSelector, assertionName, assertion as RectGapAssertion);
          break;
        case 'rect_size':
          result = await evaluateRectSizeAssertion(page, componentSelector, assertionName, assertion as RectSizeAssertion);
          break;
        case 'rect_position':
          result = await evaluateRectPositionAssertion(page, componentSelector, assertionName, assertion as RectPositionAssertion);
          break;
        case 'color':
          result = await evaluateColorAssertion(page, componentSelector, assertionName, assertion as ColorAssertion);
          break;
        default:
          result = fail(componentSelector, assertionName, assertion.type, '', 'UNKNOWN_TYPE', `CONTRACT-${assertionName.toUpperCase()}`, `Unknown assertion type: ${assertion.type}`);
      }

      results.push(result);
    }
  }

  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;

  return {
    version: '0.4.0',
    source: assertionsFile.source,
    url: page.url(),
    timestamp: new Date().toISOString(),
    summary: { total: results.length, pass, fail },
    results,
  };
}

function formatReport(report: AssertionReport, failOnly: boolean = false): string {
  const lines: string[] = [];
  lines.push('# Contract Violation Report');
  if (failOnly) lines.push('**(Fail-Only Mode — PASS items omitted for context efficiency)**');
  lines.push('');
  lines.push(`**Source**: ${report.source}`);
  lines.push(`**URL**: ${report.url}`);
  lines.push(`**Timestamp**: ${report.timestamp}`);
  lines.push('');
  lines.push('## Summary');
  lines.push(`- Total: ${report.summary.total} assertions`);
  lines.push(`- PASS: ${report.summary.pass}`);
  lines.push(`- FAIL: ${report.summary.fail}`);
  lines.push('');

  const failures = report.results.filter(r => r.status === 'FAIL');
  if (failures.length > 0) {
    lines.push('## Violations');
    lines.push('');
    for (const f of failures) {
      lines.push(`### ${f.violation_id}`);
      lines.push(`- Component: ${f.component}`);
      lines.push(`- Assertion: ${f.assertion}`);
      lines.push(`- Type: ${f.type}`);
      lines.push(`- Expected: ${f.expected}`);
      lines.push(`- Actual: ${f.actual}`);
      lines.push(`- **Suggested Fix**: ${f.suggested_fix}`);
      lines.push(`- **Engineer may choose any implementation approach that satisfies the acceptance criteria**`);
      lines.push('');
    }
  }

  if (!failOnly) {
    const passes = report.results.filter(r => r.status === 'PASS');
    if (passes.length > 0) {
      lines.push('## Passed Assertions');
      lines.push('');
      for (const p of passes) {
        lines.push(`- ${p.component} / ${p.assertion}: ${p.expected}`);
      }
    }
  } else if (report.summary.pass > 0) {
    lines.push(`## Passed: ${report.summary.pass} assertions (omitted)`);
    lines.push('');
  }

  return lines.join('\n');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: ts-node contract-assert.ts <url> <assertions-json> [output-dir] [--fail-only]');
    console.log('');
    console.log('Runs deterministic Playwright assertions against compiled assertions.json.');
    console.log('');
    console.log('Options:');
    console.log('  --fail-only   Generate a compact report with FAIL items only (for context efficiency)');
    console.log('');
    console.log('Example:');
    console.log('  ts-node contract-assert.ts http://localhost:5173 archonflow/changes/my-feature/assertions.json test/vrt/results --fail-only');
    process.exit(1);
  }

  const failOnly = args.includes('--fail-only');
  const positionalArgs = args.filter(a => !a.startsWith('--'));

  const url = positionalArgs[0];
  const assertionsPath = path.resolve(positionalArgs[1]);
  const outputDir = path.resolve(positionalArgs[2] || 'test/vrt/results');

  if (!fs.existsSync(assertionsPath)) {
    console.error(`Error: Assertions file not found: ${assertionsPath}`);
    process.exit(1);
  }

  const assertionsFile: AssertionsFile = JSON.parse(fs.readFileSync(assertionsPath, 'utf-8'));

  fs.mkdirSync(outputDir, { recursive: true });

  const browser: Browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for fonts and layout to stabilize
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      document.getAnimations().forEach(a => a.finish());
    });
    await page.waitForTimeout(300);

    console.log('Running contract assertions...');
    const report = await runAssertions(page, assertionsFile);

    // Save JSON report (always full)
    const jsonPath = path.join(outputDir, 'contract-assertion-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // Save Markdown report (full or fail-only)
    const mdPath = path.join(outputDir, failOnly ? 'contract-violation-report-compact.md' : 'contract-violation-report.md');
    fs.writeFileSync(mdPath, formatReport(report, failOnly));

    console.log('');
    console.log(`Results: ${report.summary.pass} PASS, ${report.summary.fail} FAIL out of ${report.summary.total}`);
    console.log(`JSON report: ${jsonPath}`);
    console.log(`Markdown report: ${mdPath}${failOnly ? ' (fail-only)' : ''}`);

    if (report.summary.fail > 0) {
      console.log('');
      console.log('VIOLATIONS:');
      for (const f of report.results.filter(r => r.status === 'FAIL')) {
        console.log(`  ${f.violation_id}: ${f.actual} (expected ${f.expected})`);
      }
      process.exit(1);
    }

    await context.close();
  } finally {
    await browser.close();
  }
}

main().catch(console.error);

export { runAssertions, formatReport };
export type { AssertionResult, AssertionReport };
