import { chromium, type Page, type Browser } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface CaptureConfig {
  url: string;
  pageName: string;
  viewports: Record<string, { width: number; height: number }>;
  selectors?: string[];
  states?: boolean;
  outputDir: string;
  deviceScaleFactor?: number;
}

interface CaptureResult {
  pageName: string;
  screenshots: ScreenshotInfo[];
  styles: StyleInspectionResult[];
}

interface ScreenshotInfo {
  viewport: string;
  selector?: string;
  state?: string;
  path: string;
}

interface StyleInspectionResult {
  selector: string;
  properties: Record<string, string>;
}

const DEFAULT_VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
};

const STYLE_PROPERTIES = [
  'background-color',
  'color',
  'border-radius',
  'padding',
  'margin',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'box-shadow',
  'border-color',
  'opacity',
  'gap',
];

async function captureScreenshots(config: CaptureConfig): Promise<CaptureResult> {
  const viewports = config.viewports || DEFAULT_VIEWPORTS;
  const dpr = config.deviceScaleFactor || 2;
  const outputDir = path.resolve(config.outputDir);

  fs.mkdirSync(outputDir, { recursive: true });

  const browser: Browser = await chromium.launch();
  const screenshots: ScreenshotInfo[] = [];
  const styles: StyleInspectionResult[] = [];

  try {
    for (const [viewportName, viewport] of Object.entries(viewports)) {
      const context = await browser.newContext({
        viewport,
        deviceScaleFactor: dpr,
      });
      const page = await context.newPage();

      await page.goto(config.url, { waitUntil: 'networkidle' });
      await page.evaluate(() => {
        document.getAnimations().forEach(a => a.finish());
      });

      const screenshotName = `default-${viewportName}.png`;
      const screenshotPath = path.join(outputDir, screenshotName);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      screenshots.push({
        viewport: viewportName,
        state: 'default',
        path: screenshotPath,
      });

      if (config.selectors) {
        for (const selector of config.selectors) {
          const element = page.locator(selector);
          const exists = await element.count();
          if (exists === 0) {
            console.warn(`Selector not found: ${selector}`);
            continue;
          }

          const elementScreenshotName = `default-${selector.replace(/[^a-zA-Z0-9]/g, '-')}-${viewportName}.png`;
          const elementScreenshotPath = path.join(outputDir, elementScreenshotName);
          await element.screenshot({ path: elementScreenshotPath });
          screenshots.push({
            viewport: viewportName,
            selector,
            state: 'default',
            path: elementScreenshotPath,
          });

          if (config.states) {
            const stateScreenshots = await captureInteractionStates(
              page, selector, viewportName, outputDir
            );
            screenshots.push(...stateScreenshots);
          }

          const elementStyles = await inspectElementStyles(page, selector);
          styles.push({
            selector,
            properties: elementStyles,
          });
        }
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  return {
    pageName: config.pageName,
    screenshots,
    styles,
  };
}

async function captureInteractionStates(
  page: Page,
  selector: string,
  viewportName: string,
  outputDir: string
): Promise<ScreenshotInfo[]> {
  const screenshots: ScreenshotInfo[] = [];
  const element = page.locator(selector);
  const safeSelector = selector.replace(/[^a-zA-Z0-9]/g, '-');

  const states: Array<{ name: string; action: () => Promise<void>; cleanup?: () => Promise<void> }> = [
    {
      name: 'hover',
      action: async () => { await element.hover(); },
    },
    {
      name: 'focus',
      action: async () => { await element.focus(); },
    },
    {
      name: 'active',
      action: async () => {
        await element.hover();
        await page.mouse.down();
      },
      cleanup: async () => { await page.mouse.up(); },
    },
    {
      name: 'disabled',
      action: async () => {
        await element.evaluate(el => el.setAttribute('disabled', ''));
      },
      cleanup: async () => {
        await element.evaluate(el => el.removeAttribute('disabled'));
      },
    },
  ];

  for (const state of states) {
    try {
      await state.action();
      await page.waitForTimeout(300);

      const screenshotName = `${state.name}-${safeSelector}-${viewportName}.png`;
      const screenshotPath = path.join(outputDir, screenshotName);
      await element.screenshot({ path: screenshotPath });
      screenshots.push({
        viewport: viewportName,
        selector,
        state: state.name,
        path: screenshotPath,
      });

      if (state.cleanup) {
        await state.cleanup();
        await page.waitForTimeout(100);
      }
    } catch (err) {
      console.warn(`Failed to capture ${state.name} state for ${selector}:`, err);
    }
  }

  return screenshots;
}

async function inspectElementStyles(
  page: Page,
  selector: string
): Promise<Record<string, string>> {
  return page.evaluate(
    ({ selector, properties }) => {
      const el = document.querySelector(selector);
      if (!el) return { error: 'NOT_FOUND' };
      const computed = getComputedStyle(el);
      const values: Record<string, string> = {};
      for (const prop of properties) {
        values[prop] = computed.getPropertyValue(prop);
      }
      return values;
    },
    { selector, properties: STYLE_PROPERTIES }
  );
}

async function main() {
  const args = process.argv.slice(2);
  const url = args[0] || 'http://localhost:5173';
  const pageName = args[1] || 'index';
  const outputDir = args[2] || `docs/audit-reports/${pageName}.screenshots`;
  const selectorsArg = args[3];

  const config: CaptureConfig = {
    url,
    pageName,
    viewports: DEFAULT_VIEWPORTS,
    selectors: selectorsArg ? selectorsArg.split(',') : undefined,
    states: true,
    outputDir,
  };

  console.log(`Capturing screenshots for: ${pageName}`);
  console.log(`URL: ${url}`);
  console.log(`Output: ${outputDir}`);

  const result = await captureScreenshots(config);

  console.log(`\nCaptured ${result.screenshots.length} screenshots`);
  console.log(`Inspected ${result.styles.length} elements`);

  const stylesPath = path.join(outputDir, 'computed-styles.json');
  fs.writeFileSync(stylesPath, JSON.stringify(result.styles, null, 2));
  console.log(`Computed styles saved to: ${stylesPath}`);
}

main().catch(console.error);

export { captureScreenshots, inspectElementStyles, captureInteractionStates };
export type { CaptureConfig, CaptureResult, ScreenshotInfo, StyleInspectionResult };
