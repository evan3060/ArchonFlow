/**
 * Contract Compiler — Compiles structured DSL from design.md into
 * machine-executable assertions.json for Playwright verification.
 *
 * This is a DETERMINISTIC script (no LLM involved).
 * It parses the Layout Contract tables in design.md and extracts
 * assertion rules. This eliminates the "second translation layer" problem:
 * Design Contract → LLM generates assertions → drift
 * Instead:
 * Design Contract → Compiler (script) → assertions.json → zero drift
 *
 * Usage:
 *   ts-node scripts/contract-compiler.ts <design-md-path> <output-path>
 *   ts-node scripts/contract-compiler.ts archonflow/changes/my-feature/design.md archonflow/changes/my-feature/assertions.json
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── Types ───────────────────────────────────────────────────────────

interface AssertionBase {
  /** Human-readable description of what this assertion checks */
  description: string;
  /** Tolerance for the assertion (e.g. "2px", "1px", null for exact) */
  tolerance: string | null;
}

interface PropertyAssertion extends AssertionBase {
  type: 'property';
  /** CSS selector to target (supports >> for Shadow DOM piercing) */
  selector: string;
  /** CSS property name to check via getComputedStyle() */
  property: string;
  /** Expected value */
  expected: string;
}

interface ChildCountAssertion extends AssertionBase {
  type: 'child_count';
  /** CSS selector for the parent container */
  selector: string;
  /** Expected number of child elements */
  expected: number;
}

interface RectCenterAlignmentAssertion extends AssertionBase {
  type: 'rect_center_alignment';
  /** CSS selector for element A */
  selector_a: string;
  /** CSS selector for element B */
  selector_b: string;
  /** Axis to check: 'x' or 'y' or 'both' */
  axis: 'x' | 'y' | 'both';
}

interface RectGapAssertion extends AssertionBase {
  type: 'rect_gap';
  /** CSS selector for element A */
  selector_a: string;
  /** CSS selector for element B */
  selector_b: string;
  /** Direction: 'vertical' or 'horizontal' */
  direction: 'vertical' | 'horizontal';
  /** Expected gap in px */
  expected: string;
}

interface RectSizeAssertion extends AssertionBase {
  type: 'rect_size';
  /** CSS selector for the element */
  selector: string;
  /** Expected width (e.g. "24px") */
  expected_width: string;
  /** Expected height (e.g. "24px") */
  expected_height: string;
}

interface RectPositionAssertion extends AssertionBase {
  type: 'rect_position';
  /** CSS selector for the element */
  selector: string;
  /** Expected position property (e.g. "top", "left", "bottom", "right") */
  position_property: string;
  /** Expected value */
  expected: string;
}

interface ColorAssertion extends AssertionBase {
  type: 'color';
  /** CSS selector for the element */
  selector: string;
  /** CSS color property: 'color', 'background-color', 'border-color' */
  color_property: string;
  /** Expected color value (hex, rgb, etc.) */
  expected: string;
  /** CIEDE2000 tolerance (e.g. 5) */
  tolerance_ciede2000: number;
}

type Assertion =
  | PropertyAssertion
  | ChildCountAssertion
  | RectCenterAlignmentAssertion
  | RectGapAssertion
  | RectSizeAssertion
  | RectPositionAssertion
  | ColorAssertion;

interface ComponentAssertions {
  /** CSS selector for the component container */
  selector: string;
  /** List of assertions for this component */
  assertions: Record<string, Assertion>;
}

interface AssertionsFile {
  version: string;
  source: string;
  generated_at: string;
  components: Record<string, ComponentAssertions>;
}

// ─── Parser ──────────────────────────────────────────────────────────

/**
 * Parse a Layout Contract table from design.md.
 *
 * Expected format:
 *
 * ## Component: FloatingTabBar
 *
 * ### Layout Contract
 * | Property | Value | Tolerance |
 * |----------|-------|-----------|
 * | position | fixed | - |
 * | bottom | 0px | 1px |
 * | tab_count | 5 | exact |
 * | icon_label_alignment | center-x | 2px |
 * | icon_label_gap | 2px | 1px |
 * | icon_size | 24x24 | 1px |
 * | active_color | #156969 | ΔE00<5 |
 */
function parseDesignMd(content: string, sourcePath: string): AssertionsFile {
  const result: AssertionsFile = {
    version: '0.4.0',
    source: path.basename(sourcePath),
    generated_at: new Date().toISOString(),
    components: {},
  };

  // Split into component sections
  const componentRegex = /##\s+Component:\s+(\S+)[\s\S]*?(?=##\s+Component:|$)/g;
  let componentMatch: RegExpExecArray | null;

  while ((componentMatch = componentRegex.exec(content)) !== null) {
    const componentName = toSnakeCase(componentMatch[1]);
    const section = componentMatch[0];

    // Extract selector from ### Selector line
    const selectorMatch = section.match(/###\s+Selector\s*\n\s*`?([^`\n]+)`?/);
    const selector = selectorMatch ? selectorMatch[1].trim() : `.${componentMatch[1].toLowerCase()}`;

    // Extract Layout Contract table
    const tableMatch = section.match(/###\s+Layout\s+Contract\s*\n([\s\S]*?)(?=###|$)/);
    if (!tableMatch) continue;

    const tableContent = tableMatch[1];
    const assertions = parseTable(tableContent);

    result.components[componentName] = {
      selector,
      assertions,
    };
  }

  return result;
}

function parseTable(tableContent: string): Record<string, Assertion> {
  const assertions: Record<string, Assertion> = {};
  const lines = tableContent.split('\n').filter(l => l.trim().startsWith('|'));

  // Skip header and separator rows
  const dataLines = lines.filter(l => {
    const cells = l.split('|').map(c => c.trim()).filter(Boolean);
    return cells.length >= 2 && !cells.every(c => /^[-:]+$/.test(c));
  });

  for (const line of dataLines) {
    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length < 2) continue;

    const property = cells[0];
    const value = cells[1];
    const tolerance = cells.length >= 3 ? cells[2] : '-';

    const assertion = parseAssertion(property, value, tolerance);
    if (assertion) {
      assertions[toSnakeCase(property)] = assertion;
    }
  }

  return assertions;
}

function parseAssertion(property: string, value: string, tolerance: string): Assertion | null {
  const tol = parseTolerance(tolerance);
  const desc = `Assert ${property} equals ${value}`;

  // Property-based assertions (CSS computed style)
  if (['position', 'display', 'overflow', 'z-index', 'flex-direction', 'align-items', 'justify-content'].includes(property)) {
    return {
      type: 'property',
      description: desc,
      selector: '', // Will be filled from component selector
      property,
      expected: value,
      tolerance: tol,
    };
  }

  // Child count
  if (property.endsWith('_count')) {
    return {
      type: 'child_count',
      description: desc,
      selector: '',
      expected: parseInt(value, 10),
      tolerance: tol,
    };
  }

  // Center alignment
  if (property.includes('alignment') || property.includes('align')) {
    const axis = value.includes('y') ? 'y' : value.includes('both') ? 'both' : 'x';
    return {
      type: 'rect_center_alignment',
      description: desc,
      selector_a: '', // Will be filled from sub-selectors
      selector_b: '',
      axis,
      tolerance: tol,
    };
  }

  // Gap between elements
  if (property.includes('gap') || property.includes('spacing') || property.includes('distance')) {
    const direction = property.includes('vertical') || property.includes('v_') ? 'vertical' : 'horizontal';
    return {
      type: 'rect_gap',
      description: desc,
      selector_a: '',
      selector_b: '',
      direction,
      expected: value,
      tolerance: tol,
    };
  }

  // Size (WxH format like "24x24")
  if (/^\d+x\d+$/.test(value) || property.includes('size')) {
    const parts = value.split('x');
    return {
      type: 'rect_size',
      description: desc,
      selector: '',
      expected_width: parts[0] + 'px',
      expected_height: (parts[1] || parts[0]) + 'px',
      tolerance: tol,
    };
  }

  // Color (hex, rgb, or named)
  if (property.includes('color') || property.includes('colour')) {
    const ciedeMatch = tolerance.match(/ΔE00<(\d+)/);
    const ciedeTolerance = ciedeMatch ? parseInt(ciedeMatch[1], 10) : 5;
    return {
      type: 'color',
      description: desc,
      selector: '',
      color_property: property.includes('background') ? 'background-color' : 'color',
      expected: value,
      tolerance_ciede2000: ciedeTolerance,
      tolerance: tol,
    };
  }

  // Position (top, bottom, left, right)
  if (['top', 'bottom', 'left', 'right'].includes(property)) {
    return {
      type: 'rect_position',
      description: desc,
      selector: '',
      position_property: property,
      expected: value,
      tolerance: tol,
    };
  }

  // Generic property assertion as fallback
  return {
    type: 'property',
    description: desc,
    selector: '',
    property,
    expected: value,
    tolerance: tol,
  };
}

function parseTolerance(tolerance: string): string | null {
  if (!tolerance || tolerance === '-' || tolerance === 'exact' || tolerance === 'none') {
    return null;
  }
  // Extract numeric value with unit
  const match = tolerance.match(/(\d+\.?\d*)(px|%)?/);
  if (match) {
    return match[1] + (match[2] || 'px');
  }
  return tolerance;
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: ts-node contract-compiler.ts <design-md-path> <output-path>');
    console.log('');
    console.log('Compiles Layout Contract DSL tables from design.md into');
    console.log('machine-executable assertions.json for Playwright verification.');
    console.log('');
    console.log('Example:');
    console.log('  ts-node contract-compiler.ts archonflow/changes/my-feature/design.md archonflow/changes/my-feature/assertions.json');
    process.exit(1);
  }

  const designMdPath = path.resolve(args[0]);
  const outputPath = path.resolve(args[1]);

  if (!fs.existsSync(designMdPath)) {
    console.error(`Error: Design contract not found: ${designMdPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(designMdPath, 'utf-8');
  const assertions = parseDesignMd(content, designMdPath);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(outputPath, JSON.stringify(assertions, null, 2));

  const componentCount = Object.keys(assertions.components).length;
  const assertionCount = Object.values(assertions.components).reduce(
    (sum, c) => sum + Object.keys(c.assertions).length, 0
  );

  console.log(`Contract compiled successfully.`);
  console.log(`  Source: ${designMdPath}`);
  console.log(`  Output: ${outputPath}`);
  console.log(`  Components: ${componentCount}`);
  console.log(`  Assertions: ${assertionCount}`);
}

main().catch(console.error);

export { parseDesignMd, parseAssertion, parseTolerance, toSnakeCase };
export type {
  Assertion,
  PropertyAssertion,
  ChildCountAssertion,
  RectCenterAlignmentAssertion,
  RectGapAssertion,
  RectSizeAssertion,
  RectPositionAssertion,
  ColorAssertion,
  ComponentAssertions,
  AssertionsFile,
};
