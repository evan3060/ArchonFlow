/**
 * VRT Baseline Manager — Manages visual regression test baseline screenshots.
 *
 * Features:
 *   - Generate baselines from running application or design exports
 *   - Record environment metadata (OS, browser, DPR) for cross-platform awareness
 *   - List and verify baseline environments
 *   - Update baselines with audit trail (Baseline Drift protection)
 *
 * Usage:
 *   ts-node scripts/vrt-baseline.ts --init <url> [output-dir]     # Generate initial baselines
 *   ts-node scripts/vrt-baseline.ts --update <name> <url> [dir]   # Update specific baseline
 *   ts-node scripts/vrt-baseline.ts --list [dir]                  # List all baselines
 *   ts-node scripts/vrt-baseline.ts --verify [dir]                # Check environment consistency
 */

import { chromium, type Browser } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// ─── Types ───────────────────────────────────────────────────────────

interface BaselineMeta {
  name: string;
  os: string;
  browser: string;
  deviceScaleFactor: number;
  viewport: { width: number; height: number };
  createdAt: string;
  updatedAt: string;
  updateHistory: BaselineUpdateEntry[];
}

interface BaselineUpdateEntry {
  timestamp: string;
  reason: 'init' | 'human_override' | 'auto_update';
  diffRate?: number;
  commitHash?: string;
  note?: string;
}

interface VrtConfig {
  baselinesDir: string;
  resultsDir: string;
  viewports: Record<string, { width: number; height: number }>;
  deviceScaleFactor: number;
  maskSelectors: string[];
  maskColor: string;
  components: VrtComponent[];
}

interface VrtComponent {
  name: string;
  selector: string;
  url: string;
}

// ─── Environment Detection ───────────────────────────────────────────

function getEnvironmentInfo() {
  return {
    os: `${os.type()} ${os.release()}`,
    browser: 'chromium', // Playwright always uses Chromium for screenshots
    deviceScaleFactor: 2,
    timestamp: new Date().toISOString(),
  };
}

// ─── Baseline Generation ─────────────────────────────────────────────

async function generateBaselines(
  url: string,
  outputDir: string,
  components: VrtComponent[],
  viewport: { width: number; height: number },
  dpr: number
): Promise<void> {
  const baselinesDir = path.join(outputDir, 'baselines');
  fs.mkdirSync(baselinesDir, { recursive: true });

  const browser: Browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: dpr,
    });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      document.getAnimations().forEach(a => a.finish());
    });
    await page.waitForTimeout(300);

    const envInfo = getEnvironmentInfo();

    for (const component of components) {
      // Navigate to component's URL if different
      if (component.url && component.url !== page.url()) {
        await page.goto(component.url, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(300);
      }

      const element = page.locator(component.selector);
      const exists = await element.count();
      if (exists === 0) {
        console.warn(`  SKIP: ${component.name} — selector not found: ${component.selector}`);
        continue;
      }

      // Screenshot the component
      const screenshotPath = path.join(baselinesDir, `${component.name}.png`);
      await element.screenshot({ path: screenshotPath });

      // Generate metadata
      const meta: BaselineMeta = {
        name: component.name,
        os: envInfo.os,
        browser: envInfo.browser,
        deviceScaleFactor: dpr,
        viewport,
        createdAt: envInfo.timestamp,
        updatedAt: envInfo.timestamp,
        updateHistory: [{
          timestamp: envInfo.timestamp,
          reason: 'init',
          note: 'Initial baseline generation',
        }],
      };

      const metaPath = path.join(baselinesDir, `${component.name}.meta.json`);
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

      console.log(`  OK: ${component.name} → ${screenshotPath}`);
    }

    await context.close();
  } finally {
    await browser.close();
  }
}

async function updateBaseline(
  name: string,
  url: string,
  outputDir: string,
  selector: string,
  viewport: { width: number; height: number },
  dpr: number,
  reason: 'human_override' | 'auto_update' = 'auto_update',
  diffRate?: number
): Promise<void> {
  const baselinesDir = path.join(outputDir, 'baselines');
  const metaPath = path.join(baselinesDir, `${name}.meta.json`);
  const screenshotPath = path.join(baselinesDir, `${name}.png`);

  const browser: Browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport, deviceScaleFactor: dpr });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      document.getAnimations().forEach(a => a.finish());
    });
    await page.waitForTimeout(300);

    const element = page.locator(selector);
    await element.screenshot({ path: screenshotPath });

    const envInfo = getEnvironmentInfo();

    // Update or create metadata
    let meta: BaselineMeta;
    if (fs.existsSync(metaPath)) {
      meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      meta.updatedAt = envInfo.timestamp;
      meta.updateHistory.push({
        timestamp: envInfo.timestamp,
        reason,
        diffRate,
        note: reason === 'human_override'
          ? `[WARN] Baseline "${name}" forcefully overwritten by Human. Diff Rate was ${diffRate?.toFixed(1) || 'unknown'}%.`
          : `Auto-update. Diff Rate: ${diffRate?.toFixed(1) || 'unknown'}%`,
      });
    } else {
      meta = {
        name,
        os: envInfo.os,
        browser: envInfo.browser,
        deviceScaleFactor: dpr,
        viewport,
        createdAt: envInfo.timestamp,
        updatedAt: envInfo.timestamp,
        updateHistory: [{
          timestamp: envInfo.timestamp,
          reason,
          diffRate,
        }],
      };
    }

    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

    // If human override, also write to changelog.vrt.md
    if (reason === 'human_override') {
      const changelogPath = path.join(outputDir, 'changelog.vrt.md');
      const entry = `- [${envInfo.timestamp}] Baseline "${name}" forcefully overwritten by Human. Diff Rate was ${diffRate?.toFixed(1) || 'unknown'}%\n`;
      if (fs.existsSync(changelogPath)) {
        fs.appendFileSync(changelogPath, entry);
      } else {
        fs.writeFileSync(changelogPath, `# VRT Baseline Changelog\n\n${entry}`);
      }
    }

    console.log(`Updated baseline: ${name}`);
    if (reason === 'human_override') {
      console.log(`  [WARN] Baseline drift logged to changelog.vrt.md`);
    }

    await context.close();
  } finally {
    await browser.close();
  }
}

function listBaselines(outputDir: string): void {
  const baselinesDir = path.join(outputDir, 'baselines');
  if (!fs.existsSync(baselinesDir)) {
    console.log('No baselines found.');
    return;
  }

  const metaFiles = fs.readdirSync(baselinesDir).filter(f => f.endsWith('.meta.json'));
  if (metaFiles.length === 0) {
    console.log('No baselines found.');
    return;
  }

  console.log(`Found ${metaFiles.length} baselines:\n`);

  const currentEnv = getEnvironmentInfo();

  for (const metaFile of metaFiles) {
    const meta: BaselineMeta = JSON.parse(
      fs.readFileSync(path.join(baselinesDir, metaFile), 'utf-8')
    );

    const envMatch = meta.os === currentEnv.os;
    const status = envMatch ? 'OK' : 'WARN (env mismatch)';

    console.log(`  ${meta.name}:`);
    console.log(`    OS: ${meta.os} ${status}`);
    console.log(`    Browser: ${meta.browser}`);
    console.log(`    DPR: ${meta.deviceScaleFactor}`);
    console.log(`    Viewport: ${meta.viewport.width}x${meta.viewport.height}`);
    console.log(`    Created: ${meta.createdAt}`);
    console.log(`    Updated: ${meta.updatedAt}`);
    console.log(`    Updates: ${meta.updateHistory.length}`);
    console.log('');
  }
}

function verifyEnvironment(outputDir: string): boolean {
  const baselinesDir = path.join(outputDir, 'baselines');
  if (!fs.existsSync(baselinesDir)) {
    console.log('No baselines found to verify.');
    return true;
  }

  const currentEnv = getEnvironmentInfo();
  let allMatch = true;

  const metaFiles = fs.readdirSync(baselinesDir).filter(f => f.endsWith('.meta.json'));
  for (const metaFile of metaFiles) {
    const meta: BaselineMeta = JSON.parse(
      fs.readFileSync(path.join(baselinesDir, metaFile), 'utf-8')
    );

    if (meta.os !== currentEnv.os) {
      console.warn(`WARN: Baseline "${meta.name}" was generated on ${meta.os}, current is ${currentEnv.os}`);
      allMatch = false;
    }
    if (meta.deviceScaleFactor !== currentEnv.deviceScaleFactor) {
      console.warn(`WARN: Baseline "${meta.name}" DPR ${meta.deviceScaleFactor}, current ${currentEnv.deviceScaleFactor}`);
      allMatch = false;
    }
  }

  if (allMatch) {
    console.log('All baselines match current environment.');
  } else {
    console.warn('Environment mismatch detected. Screenshots may differ due to OS/font rendering.');
    console.warn('Consider regenerating baselines on this machine.');
  }

  return allMatch;
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log('Usage:');
    console.log('  ts-node vrt-baseline.ts --init <url> [output-dir]');
    console.log('  ts-node vrt-baseline.ts --update <name> <url> [output-dir]');
    console.log('  ts-node vrt-baseline.ts --list [output-dir]');
    console.log('  ts-node vrt-baseline.ts --verify [output-dir]');
    process.exit(1);
  }

  const outputDir = path.resolve(args.find(a => !a.startsWith('--')) || 'test/vrt');

  switch (command) {
    case '--init': {
      const url = args[1];
      if (!url) {
        console.error('Error: URL required for --init');
        process.exit(1);
      }
      // Default: capture full page + common component selectors
      const defaultComponents: VrtComponent[] = [
        { name: 'fullpage', selector: 'body', url },
      ];
      console.log(`Generating baselines from ${url}...`);
      await generateBaselines(url, outputDir, defaultComponents, { width: 375, height: 812 }, 2);
      console.log('Done.');
      break;
    }

    case '--update': {
      const name = args[1];
      const url = args[2];
      if (!name || !url) {
        console.error('Error: name and URL required for --update');
        process.exit(1);
      }
      const selector = args[3] || `.${name.replace(/-/g, '_')}`;
      await updateBaseline(name, url, outputDir, selector, { width: 375, height: 812 }, 2);
      break;
    }

    case '--list': {
      listBaselines(outputDir);
      break;
    }

    case '--verify': {
      const match = verifyEnvironment(outputDir);
      process.exit(match ? 0 : 1);
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

main().catch(console.error);

export { generateBaselines, updateBaseline, listBaselines, verifyEnvironment };
export type { BaselineMeta, BaselineUpdateEntry, VrtConfig, VrtComponent };
