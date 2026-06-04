/**
 * Visual Impact Analysis — Determines whether code changes affect visual output.
 *
 * This script analyzes git diff output to classify changed files and determine
 * if VRT should be triggered. It maps changed files to affected components
 * using the module dependency map.
 *
 * Usage:
 *   ts-node scripts/visual-impact.ts [git-diff-file] [dependency-map]
 *   ts-node scripts/visual-impact.ts                     # Uses git diff HEAD
 *   ts-node scripts/visual-impact.ts changes.diff archonflow/changes/my-feature/analysis.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ─── Types ───────────────────────────────────────────────────────────

type ChangeCategory = 'visual' | 'logic' | 'data' | 'config' | 'docs' | 'test' | 'meta';

interface FileChange {
  path: string;
  category: ChangeCategory;
  affectedComponents: string[];
  reason: string;
}

interface VisualImpactResult {
  hasVisualImpact: boolean;
  confidence: 'high' | 'medium' | 'low';
  changedFiles: FileChange[];
  affectedComponents: string[];
  shouldTriggerVrt: boolean;
  shouldTriggerContractAssertion: boolean;
  summary: string;
}

// ─── File Classification ─────────────────────────────────────────────

const VISUAL_EXTENSIONS = new Set([
  '.vue', '.svelte', '.jsx', '.tsx', '.html',
  '.css', '.scss', '.sass', '.less', '.styl',
  '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico',
]);

const LOGIC_EXTENSIONS = new Set([
  '.ts', '.js', '.py', '.go', '.java', '.rb',
]);

const DATA_EXTENSIONS = new Set([
  '.json', '.yaml', '.yml', '.xml', '.csv', '.sql',
]);

const CONFIG_EXTENSIONS = new Set([
  '.config.js', '.config.ts', '.env', '.toml', '.ini',
]);

const DOC_EXTENSIONS = new Set([
  '.md', '.txt', '.adoc', '.rst',
]);

const TEST_EXTENSIONS = new Set([
  '.test.ts', '.test.js', '.spec.ts', '.spec.js', '.e2e.ts',
]);

function classifyFile(filePath: string): ChangeCategory {
  const ext = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath).toLowerCase();

  // Check compound extensions first
  if (basename.endsWith('.test.ts') || basename.endsWith('.spec.ts')) return 'test';
  if (basename.endsWith('.config.ts') || basename.endsWith('.config.js')) return 'config';

  if (VISUAL_EXTENSIONS.has(ext)) return 'visual';
  if (LOGIC_EXTENSIONS.has(ext)) {
    // Logic files in component directories are likely visual
    if (filePath.includes('/components/') || filePath.includes('/views/') || filePath.includes('/pages/')) {
      return 'visual';
    }
    return 'logic';
  }
  if (DATA_EXTENSIONS.has(ext)) return 'data';
  if (DOC_EXTENSIONS.has(ext)) return 'docs';

  return 'meta';
}

function getVisualReason(filePath: string, category: ChangeCategory): string {
  switch (category) {
    case 'visual':
      return `Direct visual file: ${path.extname(filePath)}`;
    case 'logic':
      if (filePath.includes('/components/') || filePath.includes('/views/')) {
        return `Logic in component directory — may affect rendering`;
      }
      return `Logic change — may indirectly affect visual output`;
    case 'data':
      if (filePath.includes('mock') || filePath.includes('fixture')) {
        return `Mock/fixture data — may change rendered content`;
      }
      return `Data change — unlikely to affect visual`;
    case 'config':
      return `Configuration change — check if affects build output`;
    default:
      return `Non-visual change`;
  }
}

// ─── Component Mapping ───────────────────────────────────────────────

function extractAffectedComponents(filePath: string, dependencyMap?: string): string[] {
  const components: string[] = [];

  // Extract component name from file path
  const parts = filePath.split('/');
  const filename = parts[parts.length - 1];

  // Common patterns: src/components/ComponentName.vue → ComponentName
  const componentMatch = filePath.match(/\/components\/([^/]+)\//);
  if (componentMatch) {
    components.push(componentMatch[1]);
  }

  // Pattern: src/views/ViewName.vue → ViewName
  const viewMatch = filePath.match(/\/views\/([^/]+)\//);
  if (viewMatch) {
    components.push(viewMatch[1]);
  }

  // Pattern: src/pages/PageName.vue → PageName
  const pageMatch = filePath.match(/\/pages\/([^/]+)\//);
  if (pageMatch) {
    components.push(pageMatch[1]);
  }

  // Token/style changes affect ALL components
  if (filePath.includes('/tokens/') || filePath.includes('/styles/')) {
    components.push('*');
  }

  return components.length > 0 ? components : ['unknown'];
}

// ─── Analysis ────────────────────────────────────────────────────────

function analyzeChanges(diffOutput: string, dependencyMap?: string): VisualImpactResult {
  if (!diffOutput.trim()) {
    return {
      hasVisualImpact: false,
      confidence: 'high',
      changedFiles: [],
      affectedComponents: [],
      shouldTriggerVrt: false,
      shouldTriggerContractAssertion: false,
      summary: 'No changes detected.',
    };
  }

  // Parse changed files from git diff
  const changedFilePaths = diffOutput
    .split('\n')
    .filter(line => line.startsWith('+++ ') || line.startsWith('--- '))
    .map(line => line.replace(/^[+-]{3}\s+[ab]\//, ''))
    .filter(p => p && p !== '/dev/null');

  // Deduplicate
  const uniquePaths = [...new Set(changedFilePaths)];

  const fileChanges: FileChange[] = uniquePaths.map(filePath => ({
    path: filePath,
    category: classifyFile(filePath),
    affectedComponents: extractAffectedComponents(filePath, dependencyMap),
    reason: getVisualReason(filePath, classifyFile(filePath)),
  }));

  // Determine visual impact
  const visualFiles = fileChanges.filter(f => f.category === 'visual');
  const logicInComponentDirs = fileChanges.filter(
    f => f.category === 'logic' && (f.path.includes('/components/') || f.path.includes('/views/'))
  );
  const tokenChanges = fileChanges.filter(f => f.path.includes('/tokens/') || f.path.includes('/styles/'));

  const hasDirectVisualChange = visualFiles.length > 0;
  const hasIndirectVisualChange = logicInComponentDirs.length > 0 || tokenChanges.length > 0;

  const allAffectedComponents = [...new Set(fileChanges.flatMap(f => f.affectedComponents))];

  let confidence: 'high' | 'medium' | 'low';
  let shouldTriggerVrt: boolean;
  let shouldTriggerContractAssertion: boolean;

  if (hasDirectVisualChange) {
    confidence = 'high';
    shouldTriggerVrt = true;
    shouldTriggerContractAssertion = true;
  } else if (hasIndirectVisualChange) {
    confidence = 'medium';
    shouldTriggerVrt = true;
    shouldTriggerContractAssertion = true;
  } else {
    confidence = 'low';
    shouldTriggerVrt = false;
    shouldTriggerContractAssertion = false;
  }

  // Token changes always trigger full VRT
  if (tokenChanges.length > 0) {
    shouldTriggerVrt = true;
    shouldTriggerContractAssertion = true;
  }

  const summary = hasDirectVisualChange
    ? `${visualFiles.length} visual file(s) changed → VRT REQUIRED`
    : hasIndirectVisualChange
    ? `${logicInComponentDirs.length} logic file(s) in component dirs → VRT RECOMMENDED`
    : 'No visual impact detected → VRT SKIPPED';

  return {
    hasVisualImpact: hasDirectVisualChange || hasIndirectVisualChange,
    confidence,
    changedFiles: fileChanges,
    affectedComponents: allAffectedComponents,
    shouldTriggerVrt,
    shouldTriggerContractAssertion,
    summary,
  };
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  let diffOutput: string;

  if (args.length > 0 && fs.existsSync(args[0])) {
    diffOutput = fs.readFileSync(args[0], 'utf-8');
  } else {
    // Use git diff HEAD
    try {
      diffOutput = execSync('git diff HEAD --stat', { encoding: 'utf-8' });
      const nameOnly = execSync('git diff HEAD --name-only', { encoding: 'utf-8' });
      // Re-parse with full diff for file list
      diffOutput = nameOnly.split('\n').map(f => `+++ b/${f}`).join('\n');
    } catch {
      console.error('Error: Could not get git diff. Provide a diff file as argument.');
      process.exit(1);
    }
  }

  const dependencyMap = args[1] && fs.existsSync(args[1]) ? args[1] : undefined;
  const result = analyzeChanges(diffOutput, dependencyMap);

  // Output
  const output = {
    ...result,
    timestamp: new Date().toISOString(),
  };

  console.log(JSON.stringify(output, null, 2));

  // Exit code: 0 = no visual impact, 1 = visual impact detected
  if (result.shouldTriggerVrt) {
    console.error(`\nVISUAL IMPACT: ${result.summary}`);
    console.error(`Affected components: ${result.affectedComponents.join(', ')}`);
    process.exit(1);
  } else {
    console.error(`\nNO VISUAL IMPACT: ${result.summary}`);
    process.exit(0);
  }
}

main().catch(console.error);

export { analyzeChanges, classifyFile, extractAffectedComponents };
export type { VisualImpactResult, FileChange, ChangeCategory };
