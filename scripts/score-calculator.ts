import * as fs from 'fs';
import * as path from 'path';

interface ScoringCriteria {
  dimensions: Record<string, DimensionCriteria>;
  overall: {
    calculation: string;
    verdicts: Record<string, VerdictRange>;
  };
}

interface DimensionCriteria {
  weight: number;
  description: string;
  scoring?: Record<string, number>;
  sub_dimensions?: Record<string, SubDimensionCriteria>;
  thresholds?: Record<string, number>;
}

interface SubDimensionCriteria {
  weight: number;
  exact_match: number;
  [key: string]: number;
}

interface VerdictRange {
  min: number;
  max: number;
  action: string;
}

interface VerificationItem {
  selector: string;
  property: string;
  expected: string;
  actual: string;
  contractRef: string;
}

interface DimensionScore {
  color: number;
  typography: number;
  spacing: number;
  radius: number;
  layout: number;
  shadow: number;
  overall: number;
}

interface ScoreResult {
  dimensions: Record<string, number>;
  overall: number;
  verdict: string;
  action: string;
  details: ScoreDetail[];
}

interface ScoreDetail {
  dimension: string;
  item: string;
  expected: string;
  actual: string;
  score: number;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
}

function loadScoringCriteria(configPath: string): ScoringCriteria {
  const raw = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(raw);
}

function scoreColorDimension(
  items: VerificationItem[],
  thresholds: Record<string, number>
): { score: number; details: ScoreDetail[] } {
  const details: ScoreDetail[] = [];
  let totalScore = 0;

  for (const item of items) {
    const expected = parseColorValue(item.expected);
    const actual = parseColorValue(item.actual);

    if (!expected || !actual) {
      details.push({
        dimension: 'color',
        item: item.selector,
        expected: item.expected,
        actual: item.actual,
        score: 0,
        severity: 'CRITICAL',
      });
      totalScore += 0;
      continue;
    }

    const deltaE = simpleColorDistance(expected, actual);

    let score: number;
    let severity: 'CRITICAL' | 'WARNING' | 'INFO';

    if (deltaE < 2) {
      score = thresholds.delta_e_00_lt_2 || 98;
      severity = 'INFO';
    } else if (deltaE < 5) {
      score = thresholds.delta_e_00_2_to_5 || 85;
      severity = 'WARNING';
    } else if (deltaE < 10) {
      score = thresholds.delta_e_00_5_to_10 || 60;
      severity = 'CRITICAL';
    } else {
      score = 0;
      severity = 'CRITICAL';
    }

    details.push({
      dimension: 'color',
      item: `${item.selector} → ${item.property}`,
      expected: item.expected,
      actual: item.actual,
      score,
      severity,
    });

    totalScore += score;
  }

  const avgScore = items.length > 0 ? totalScore / items.length : 100;
  return { score: Math.round(avgScore), details };
}

function scoreSpacingDimension(
  items: VerificationItem[],
  scoring: Record<string, number>
): { score: number; details: ScoreDetail[] } {
  const details: ScoreDetail[] = [];
  let totalScore = 0;

  for (const item of items) {
    const expectedPx = parsePixelValue(item.expected);
    const actualPx = parsePixelValue(item.actual);

    if (expectedPx === null || actualPx === null) {
      details.push({
        dimension: 'spacing',
        item: item.selector,
        expected: item.expected,
        actual: item.actual,
        score: 0,
        severity: 'CRITICAL',
      });
      totalScore += 0;
      continue;
    }

    const diff = Math.abs(expectedPx - actualPx);
    let score: number;
    let severity: 'CRITICAL' | 'WARNING' | 'INFO';

    if (diff === 0) {
      score = scoring.exact_match || 100;
      severity = 'INFO';
    } else if (diff <= 2) {
      score = scoring.within_2px || 90;
      severity = 'INFO';
    } else if (diff <= 4) {
      score = scoring.within_4px || 70;
      severity = 'WARNING';
    } else if (diff <= 8) {
      score = scoring.within_8px || 40;
      severity = 'CRITICAL';
    } else {
      score = scoring.beyond_8px || 0;
      severity = 'CRITICAL';
    }

    details.push({
      dimension: 'spacing',
      item: `${item.selector} → ${item.property}`,
      expected: item.expected,
      actual: item.actual,
      score,
      severity,
    });

    totalScore += score;
  }

  const avgScore = items.length > 0 ? totalScore / items.length : 100;
  return { score: Math.round(avgScore), details };
}

function scoreRadiusDimension(
  items: VerificationItem[],
  scoring: Record<string, number>
): { score: number; details: ScoreDetail[] } {
  const details: ScoreDetail[] = [];
  let totalScore = 0;

  for (const item of items) {
    const expectedPx = parsePixelValue(item.expected);
    const actualPx = parsePixelValue(item.actual);

    if (expectedPx === null || actualPx === null) {
      details.push({
        dimension: 'radius',
        item: item.selector,
        expected: item.expected,
        actual: item.actual,
        score: 0,
        severity: 'CRITICAL',
      });
      totalScore += 0;
      continue;
    }

    const diff = Math.abs(expectedPx - actualPx);
    let score: number;
    let severity: 'CRITICAL' | 'WARNING' | 'INFO';

    if (diff === 0) {
      score = scoring.exact_match || 100;
      severity = 'INFO';
    } else if (diff <= 1) {
      score = scoring.within_1px || 95;
      severity = 'INFO';
    } else if (diff <= 2) {
      score = scoring.within_2px || 80;
      severity = 'WARNING';
    } else if (diff <= 4) {
      score = scoring.within_4px || 50;
      severity = 'CRITICAL';
    } else {
      score = scoring.beyond_4px || 0;
      severity = 'CRITICAL';
    }

    details.push({
      dimension: 'radius',
      item: `${item.selector} → ${item.property}`,
      expected: item.expected,
      actual: item.actual,
      score,
      severity,
    });

    totalScore += score;
  }

  const avgScore = items.length > 0 ? totalScore / items.length : 100;
  return { score: Math.round(avgScore), details };
}

function calculateOverallScore(
  dimensionScores: Record<string, number>,
  criteria: ScoringCriteria
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [dimName, score] of Object.entries(dimensionScores)) {
    const dimCriteria = criteria.dimensions[dimName];
    if (dimCriteria) {
      weightedSum += score * dimCriteria.weight;
      totalWeight += dimCriteria.weight;
    }
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

function getVerdict(score: number, criteria: ScoringCriteria): { verdict: string; action: string } {
  for (const [name, range] of Object.entries(criteria.overall.verdicts)) {
    if (score >= range.min && score <= range.max) {
      return { verdict: name, action: range.action };
    }
  }
  return { verdict: 'reject', action: 'Unknown score range' };
}

function parseColorValue(value: string): [number, number, number] | null {
  const hexMatch = value.match(/^#?([0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    return [
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16),
    ];
  }

  const rgbMatch = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
  }

  return null;
}

function parsePixelValue(value: string): number | null {
  const match = value.match(/^([\d.]+)px$/);
  return match ? parseFloat(match[1]) : null;
}

function simpleColorDistance(a: [number, number, number], b: [number, number, number]): number {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db) / 4.4;
}

function calculateScores(
  verificationItems: VerificationItem[],
  criteriaPath: string
): ScoreResult {
  const criteria = loadScoringCriteria(criteriaPath);

  const itemsByDimension: Record<string, VerificationItem[]> = {
    color: [],
    typography: [],
    spacing: [],
    radius: [],
    layout: [],
    shadow: [],
  };

  for (const item of verificationItems) {
    const prop = item.property.toLowerCase();
    if (prop.includes('color') || prop.includes('background')) {
      itemsByDimension.color.push(item);
    } else if (prop.includes('font')) {
      itemsByDimension.typography.push(item);
    } else if (prop.includes('padding') || prop.includes('margin') || prop.includes('gap')) {
      itemsByDimension.spacing.push(item);
    } else if (prop.includes('radius')) {
      itemsByDimension.radius.push(item);
    } else if (prop.includes('shadow')) {
      itemsByDimension.shadow.push(item);
    } else {
      itemsByDimension.layout.push(item);
    }
  }

  const dimensionScores: Record<string, number> = {};
  const allDetails: ScoreDetail[] = [];

  const colorResult = scoreColorDimension(
    itemsByDimension.color,
    criteria.dimensions.color?.thresholds || {}
  );
  dimensionScores.color = colorResult.score;
  allDetails.push(...colorResult.details);

  const spacingResult = scoreSpacingDimension(
    itemsByDimension.spacing,
    criteria.dimensions.spacing?.scoring || {}
  );
  dimensionScores.spacing = spacingResult.score;
  allDetails.push(...spacingResult.details);

  const radiusResult = scoreRadiusDimension(
    itemsByDimension.radius,
    criteria.dimensions.radius?.scoring || {}
  );
  dimensionScores.radius = radiusResult.score;
  allDetails.push(...radiusResult.details);

  dimensionScores.typography = itemsByDimension.typography.length > 0 ? 90 : 100;
  dimensionScores.layout = itemsByDimension.layout.length > 0 ? 90 : 100;
  dimensionScores.shadow = itemsByDimension.shadow.length > 0 ? 90 : 100;

  const overall = calculateOverallScore(dimensionScores, criteria);
  const { verdict, action } = getVerdict(overall, criteria);

  return {
    dimensions: dimensionScores,
    overall,
    verdict,
    action,
    details: allDetails,
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: ts-node score-calculator.ts <verification-results.json> <scoring-criteria.json>');
    process.exit(1);
  }

  const verificationPath = args[0];
  const criteriaPath = args[1];

  const verificationItems: VerificationItem[] = JSON.parse(
    fs.readFileSync(verificationPath, 'utf-8')
  );

  const result = calculateScores(verificationItems, criteriaPath);

  console.log('\n=== Score Report ===\n');
  for (const [dim, score] of Object.entries(result.dimensions)) {
    console.log(`  ${dim}: ${score}/100`);
  }
  console.log(`\n  Overall: ${result.overall}/100`);
  console.log(`  Verdict: ${result.verdict}`);
  console.log(`  Action: ${result.action}`);

  const outputPath = verificationPath.replace('.json', '.score.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\n  Full report: ${outputPath}`);
}

main().catch(console.error);

export { calculateScores, scoreColorDimension, scoreSpacingDimension, scoreRadiusDimension };
export type { VerificationItem, DimensionScore, ScoreResult, ScoreDetail };
