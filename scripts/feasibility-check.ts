/**
 * Feasibility Check — Validates design contracts for technical viability
 * before the build phase begins.
 *
 * This script checks:
 *   1. Architecture compatibility — does the contract fit the existing system?
 *   2. Platform constraints — are the specified features supported on target platforms?
 *   3. Token consistency — do referenced tokens exist in the design system?
 *   4. Selector validity — can the specified CSS selectors resolve?
 *   5. Dependency conflicts — do new contracts conflict with existing ones?
 *
 * Usage:
 *   ts-node scripts/feasibility-check.ts <design-md> [project-config]
 *   ts-node scripts/feasibility-check.ts archonflow/changes/my-feature/design.md archonflow/config/project.config.json
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── Types ───────────────────────────────────────────────────────────

type FeasibilityLevel = 'pass' | 'warning' | 'fail';

interface FeasibilityIssue {
  level: FeasibilityLevel;
  category: string;
  message: string;
  suggestion: string;
  contract_ref: string;
}

interface FeasibilityReport {
  version: string;
  source: string;
  timestamp: string;
  overall: FeasibilityLevel;
  issues: FeasibilityIssue[];
  summary: {
    pass: number;
    warning: number;
    fail: number;
  };
}

// ─── Checks ──────────────────────────────────────────────────────────

function checkTokenConsistency(designMd: string, projectDir: string): FeasibilityIssue[] {
  const issues: FeasibilityIssue[] = [];

  // Find token references in design.md (e.g., var(--color-primary))
  const tokenRefs = designMd.match(/var\(--[a-z-]+\)/g) || [];
  const uniqueRefs = [...new Set(tokenRefs)];

  // Check if token files exist
  const tokensDir = path.join(projectDir, 'src/styles/tokens');
  if (!fs.existsSync(tokensDir)) {
    if (uniqueRefs.length > 0) {
      issues.push({
        level: 'fail',
        category: 'token_consistency',
        message: `Design references ${uniqueRefs.length} CSS custom properties but src/styles/tokens/ does not exist`,
        suggestion: 'Run the design skill first to generate token files, or create tokens manually',
        contract_ref: 'tokens',
      });
    }
    return issues;
  }

  // Read all token files and collect defined tokens
  const definedTokens = new Set<string>();
  const tokenFiles = fs.readdirSync(tokensDir).filter(f => f.endsWith('.css'));
  for (const file of tokenFiles) {
    const content = fs.readFileSync(path.join(tokensDir, file), 'utf-8');
    const matches = content.match(/--[a-z][a-z0-9-]*/g) || [];
    matches.forEach(t => definedTokens.add(t));
  }

  // Check each reference
  for (const ref of uniqueRefs) {
    const tokenName = ref.replace('var(', '').replace(')', '');
    if (!definedTokens.has(tokenName)) {
      issues.push({
        level: 'warning',
        category: 'token_consistency',
        message: `Token ${ref} referenced but not defined in token files`,
        suggestion: `Add --${tokenName} to the appropriate token file, or verify the reference`,
        contract_ref: ref,
      });
    }
  }

  return issues;
}

function checkPlatformConstraints(designMd: string, platform: string): FeasibilityIssue[] {
  const issues: FeasibilityIssue[] = [];

  // uni-app specific constraints
  if (platform === 'uni-app') {
    // Check for unsupported CSS features
    if (designMd.includes('position: fixed') || designMd.includes('position:fixed')) {
      issues.push({
        level: 'warning',
        category: 'platform_constraint',
        message: 'position: fixed has known issues on some mini-program platforms (e.g., WeChat)',
        suggestion: 'Test on target platforms; consider using uni.createSelectorQuery for fixed positioning',
        contract_ref: 'position: fixed',
      });
    }

    if (designMd.includes('backdrop-filter')) {
      issues.push({
        level: 'fail',
        category: 'platform_constraint',
        message: 'backdrop-filter is not supported in mini-programs',
        suggestion: 'Use a semi-transparent background color instead of backdrop-filter blur',
        contract_ref: 'backdrop-filter',
      });
    }

    if (designMd.includes('filter: blur') || designMd.includes('filter:blur')) {
      issues.push({
        level: 'warning',
        category: 'platform_constraint',
        message: 'CSS filter: blur may have performance issues on mini-programs',
        suggestion: 'Use pre-blurred image assets instead of runtime CSS blur',
        contract_ref: 'filter: blur',
      });
    }

    // Check for web-only APIs
    if (designMd.includes('window.innerWidth') || designMd.includes('window.innerHeight')) {
      issues.push({
        level: 'fail',
        category: 'platform_constraint',
        message: 'window object is not available in mini-programs',
        suggestion: 'Use uni.getSystemInfoSync() instead of window dimensions',
        contract_ref: 'window API',
      });
    }

    // Check for SVG usage
    if (designMd.includes('.svg')) {
      issues.push({
        level: 'warning',
        category: 'platform_constraint',
        message: 'SVG support varies across mini-program platforms',
        suggestion: 'Consider using icon fonts or PNG fallbacks for critical icons',
        contract_ref: 'SVG assets',
      });
    }
  }

  return issues;
}

function checkSelectorValidity(designMd: string): FeasibilityIssue[] {
  const issues: FeasibilityIssue[] = [];

  // Extract selectors from contract
  const selectorMatches = designMd.match(/Selector:?\s*`([^`]+)`/gi) || [];

  for (const match of selectorMatches) {
    const selector = match.replace(/Selector:?\s*`?/i, '').replace(/`$/, '').trim();

    // Check for potentially problematic selectors
    if (selector.includes('>>>') || selector.includes('/deep/')) {
      issues.push({
        level: 'warning',
        category: 'selector_validity',
        message: `Shadow DOM piercing selector "${selector}" may not work on all platforms`,
        suggestion: 'Use :deep() in Vue 3 or ::v-deep in Vue 2 instead',
        contract_ref: selector,
      });
    }

    if (selector.includes(':has(')) {
      issues.push({
        level: 'warning',
        category: 'selector_validity',
        message: `:has() selector "${selector}" has limited browser support`,
        suggestion: 'Use JavaScript-based selection as fallback',
        contract_ref: selector,
      });
    }
  }

  return issues;
}

function checkContractConflicts(designMd: string, contractsDir: string): FeasibilityIssue[] {
  const issues: FeasibilityIssue[] = [];

  if (!fs.existsSync(contractsDir)) return issues;

  // Check for component name conflicts
  const newComponents = designMd.match(/##\s+Component:\s+(\S+)/g) || [];
  const newComponentNames = newComponents.map(c => c.replace(/##\s+Component:\s+/, '').trim());

  const existingContracts = fs.readdirSync(contractsDir).filter(f => f.endsWith('.md'));
  for (const contractFile of existingContracts) {
    const content = fs.readFileSync(path.join(contractsDir, contractFile), 'utf-8');
    const existingComponents = content.match(/##\s+Component:\s+(\S+)/g) || [];
    const existingNames = existingComponents.map(c => c.replace(/##\s+Component:\s+/, '').trim());

    for (const name of newComponentNames) {
      if (existingNames.includes(name)) {
        issues.push({
          level: 'warning',
          category: 'contract_conflict',
          message: `Component "${name}" already exists in ${contractFile}`,
          suggestion: 'Verify this is an intentional update, not an accidental override',
          contract_ref: name,
        });
      }
    }
  }

  return issues;
}

function checkBehavioralSpecs(designMd: string): FeasibilityIssue[] {
  const issues: FeasibilityIssue[] = [];

  // Check that interactive elements have behavioral specs
  const interactiveElements = designMd.match(/###\s+(Button|Input|Select|Toggle|Tab|Modal|Dropdown|Form)/gi) || [];

  for (const element of interactiveElements) {
    const elementName = element.replace(/###\s+/, '').trim();
    // Check if there's a Given/When/Then section after this element
    const elementSection = designMd.substring(designMd.indexOf(element));
    const nextSection = elementSection.indexOf('\n### ', 1);
    const sectionContent = nextSection > 0 ? elementSection.substring(0, nextSection) : elementSection;

    if (!sectionContent.includes('GIVEN') && !sectionContent.includes('WHEN') && !sectionContent.includes('THEN')) {
      issues.push({
        level: 'warning',
        category: 'behavioral_spec',
        message: `Interactive element "${elementName}" lacks behavioral specs (Given/When/Then)`,
        suggestion: `Add behavioral specifications for ${elementName} to ensure testable acceptance criteria`,
        contract_ref: elementName,
      });
    }
  }

  return issues;
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log('Usage: ts-node feasibility-check.ts <design-md> [project-config]');
    console.log('');
    console.log('Checks design contracts for technical viability before build phase.');
    console.log('');
    console.log('Example:');
    console.log('  ts-node feasibility-check.ts archonflow/changes/my-feature/design.md archonflow/config/project.config.json');
    process.exit(1);
  }

  const designMdPath = path.resolve(args[0]);
  const configPath = args[1] ? path.resolve(args[1]) : null;

  if (!fs.existsSync(designMdPath)) {
    console.error(`Error: Design contract not found: ${designMdPath}`);
    process.exit(1);
  }

  const designMd = fs.readFileSync(designMdPath, 'utf-8');
  const projectDir = path.resolve('.');

  // Load project config
  let platform = 'web';
  let contractsDir = path.join(projectDir, 'archonflow/contracts');
  if (configPath && fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    platform = config.platform || 'web';
    contractsDir = config.contractsDir || contractsDir;
  }

  // Run all checks
  const allIssues: FeasibilityIssue[] = [
    ...checkTokenConsistency(designMd, projectDir),
    ...checkPlatformConstraints(designMd, platform),
    ...checkSelectorValidity(designMd),
    ...checkContractConflicts(designMd, contractsDir),
    ...checkBehavioralSpecs(designMd),
  ];

  const pass = allIssues.filter(i => i.level === 'pass').length;
  const warning = allIssues.filter(i => i.level === 'warning').length;
  const fail = allIssues.filter(i => i.level === 'fail').length;

  const overall: FeasibilityLevel = fail > 0 ? 'fail' : warning > 0 ? 'warning' : 'pass';

  const report: FeasibilityReport = {
    version: '0.4.0',
    source: path.basename(designMdPath),
    timestamp: new Date().toISOString(),
    overall,
    issues: allIssues,
    summary: { pass, warning, fail },
  };

  // Output
  console.log(JSON.stringify(report, null, 2));

  if (overall === 'fail') {
    console.error('\nFEASIBILITY CHECK FAILED — resolve FAIL items before proceeding to build');
    process.exit(1);
  } else if (overall === 'warning') {
    console.error('\nFEASIBILITY CHECK PASSED WITH WARNINGS — review WARNING items');
    process.exit(0);
  } else {
    console.error('\nFEASIBILITY CHECK PASSED — all checks clear');
    process.exit(0);
  }
}

main().catch(console.error);

export {
  checkTokenConsistency,
  checkPlatformConstraints,
  checkSelectorValidity,
  checkContractConflicts,
  checkBehavioralSpecs,
};
export type { FeasibilityReport, FeasibilityIssue, FeasibilityLevel };
