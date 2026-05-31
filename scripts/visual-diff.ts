import * as fs from 'fs';
import * as path from 'path';
import { createCanvas, loadImage, type Canvas, type Image } from 'canvas';

interface DiffConfig {
  stitchImagePath: string;
  implementationImagePath: string;
  outputDir: string;
  threshold?: number;
  ignoreRegions?: Region[];
}

interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DiffRegion {
  bounds: Region;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  expectedColor: [number, number, number];
  actualColor: [number, number, number];
  colorDistance: number;
  area: number;
}

interface DiffResult {
  totalPixels: number;
  differentPixels: number;
  diffPercentage: number;
  maxColorDistance: number;
  meanColorDistance: number;
  regions: DiffRegion[];
  diffImagePath: string;
  heatmapImagePath: string;
  overlayImagePath: string;
}

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  let rl = r / 255;
  let gl = g / 255;
  let bl = b / 255;

  rl = rl > 0.04045 ? Math.pow((rl + 0.055) / 1.055, 2.4) : rl / 12.92;
  gl = gl > 0.04045 ? Math.pow((gl + 0.055) / 1.055, 2.4) : gl / 12.92;
  bl = bl > 0.04045 ? Math.pow((bl + 0.055) / 1.055, 2.4) : bl / 12.92;

  rl *= 100;
  gl *= 100;
  bl *= 100;

  const x = rl * 0.4124 + gl * 0.3576 + bl * 0.1805;
  const y = rl * 0.2126 + gl * 0.7152 + bl * 0.0722;
  const z = rl * 0.0193 + gl * 0.1192 + bl * 0.9505;

  const xn = 95.047, yn = 100.0, zn = 108.883;

  let xv = x / xn, yv = y / yn, zv = z / zn;

  const epsilon = 0.008856;
  const kappa = 903.3;

  xv = xv > epsilon ? Math.cbrt(xv) : (kappa * xv + 16) / 116;
  yv = yv > epsilon ? Math.cbrt(yv) : (kappa * yv + 16) / 116;
  zv = zv > epsilon ? Math.cbrt(zv) : (kappa * zv + 16) / 116;

  return [
    116 * yv - 16,
    500 * (xv - yv),
    200 * (yv - zv),
  ];
}

function ciede2000(
  lab1: [number, number, number],
  lab2: [number, number, number]
): number {
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cab = (C1 + C2) / 2;

  const Cab7 = Math.pow(Cab, 7);
  const G = 0.5 * (1 - Math.sqrt(Cab7 / (Cab7 + Math.pow(25, 7))));

  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);

  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  const h1p = Math.atan2(b1, a1p) * 180 / Math.PI + (Math.atan2(b1, a1p) < 0 ? 360 : 0);
  const h2p = Math.atan2(b2, a2p) * 180 / Math.PI + (Math.atan2(b2, a2p) < 0 ? 360 : 0);

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp: number;
  if (C1p * C2p === 0) {
    dhp = 0;
  } else if (Math.abs(h2p - h1p) <= 180) {
    dhp = h2p - h1p;
  } else if (h2p - h1p > 180) {
    dhp = h2p - h1p - 360;
  } else {
    dhp = h2p - h1p + 360;
  }

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp * Math.PI / 360);

  const Lbp = (L1 + L2) / 2;
  const Cbp = (C1p + C2p) / 2;

  let hbp: number;
  if (C1p * C2p === 0) {
    hbp = h1p + h2p;
  } else if (Math.abs(h1p - h2p) <= 180) {
    hbp = (h1p + h2p) / 2;
  } else if (h1p + h2p < 360) {
    hbp = (h1p + h2p + 360) / 2;
  } else {
    hbp = (h1p + h2p - 360) / 2;
  }

  const T = 1
    - 0.17 * Math.cos((hbp - 30) * Math.PI / 180)
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

  const dE = Math.sqrt(
    Math.pow(dLp / SL, 2)
    + Math.pow(dCp / SC, 2)
    + Math.pow(dHp / SH, 2)
    + RT * (dCp / SC) * (dHp / SH)
  );

  return Math.max(0, dE);
}

function isInIgnoreRegion(x: number, y: number, regions: Region[]): boolean {
  return regions.some(r =>
    x >= r.x && x < r.x + r.width &&
    y >= r.y && y < r.y + r.height
  );
}

async function generateVisualDiff(config: DiffConfig): Promise<DiffResult> {
  const threshold = config.threshold || 5;
  const ignoreRegions = config.ignoreRegions || [];
  const outputDir = path.resolve(config.outputDir);

  fs.mkdirSync(outputDir, { recursive: true });

  const stitchImage = await loadImage(config.stitchImagePath);
  const implImage = await loadImage(config.implementationImagePath);

  const width = Math.max(stitchImage.width, implImage.width);
  const height = Math.max(stitchImage.height, implImage.height);

  const stitchCanvas = createCanvas(width, height);
  const stitchCtx = stitchCanvas.getContext('2d');
  stitchCtx.drawImage(stitchImage, 0, 0);
  const stitchData = stitchCtx.getImageData(0, 0, width, height);

  const implCanvas = createCanvas(width, height);
  const implCtx = implCanvas.getContext('2d');
  implCtx.drawImage(implImage, 0, 0);
  const implData = implCtx.getImageData(0, 0, width, height);

  const diffCanvas = createCanvas(width, height);
  const diffCtx = diffCanvas.getContext('2d');
  const diffData = diffCtx.createImageData(width, height);

  const heatmapCanvas = createCanvas(width, height);
  const heatmapCtx = heatmapCanvas.getContext('2d');
  const heatmapData = heatmapCtx.createImageData(width, height);

  const overlayCanvas = createCanvas(width * 2 + 20, height);
  const overlayCtx = overlayCanvas.getContext('2d');
  overlayCtx.drawImage(stitchImage, 0, 0);
  overlayCtx.globalAlpha = 0.5;
  overlayCtx.drawImage(implImage, 0, 0);
  overlayCtx.globalAlpha = 1.0;

  let totalPixels = 0;
  let differentPixels = 0;
  let totalColorDistance = 0;
  let maxColorDistance = 0;
  const diffRegions: DiffRegion[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      if (isInIgnoreRegion(x, y, ignoreRegions)) {
        diffData.data[idx] = 128;
        diffData.data[idx + 1] = 128;
        diffData.data[idx + 2] = 128;
        diffData.data[idx + 3] = 255;
        heatmapData.data[idx] = 128;
        heatmapData.data[idx + 1] = 128;
        heatmapData.data[idx + 2] = 128;
        heatmapData.data[idx + 3] = 255;
        continue;
      }

      totalPixels++;

      const sr = stitchData.data[idx];
      const sg = stitchData.data[idx + 1];
      const sb = stitchData.data[idx + 2];
      const ir = implData.data[idx];
      const ig = implData.data[idx + 1];
      const ib = implData.data[idx + 2];

      const lab1 = rgbToLab(sr, sg, sb);
      const lab2 = rgbToLab(ir, ig, ib);
      const de = ciede2000(lab1, lab2);

      totalColorDistance += de;
      if (de > maxColorDistance) maxColorDistance = de;

      if (de > threshold) {
        differentPixels++;

        const intensity = Math.min(255, Math.floor(de * 10));

        diffData.data[idx] = 255;
        diffData.data[idx + 1] = 255 - intensity;
        diffData.data[idx + 2] = 0;
        diffData.data[idx + 3] = 255;

        const heatR = Math.min(255, Math.floor(de * 15));
        const heatG = Math.max(0, 255 - Math.floor(de * 10));
        const heatB = 0;
        heatmapData.data[idx] = heatR;
        heatmapData.data[idx + 1] = heatG;
        heatmapData.data[idx + 2] = heatB;
        heatmapData.data[idx + 3] = 255;
      } else {
        diffData.data[idx] = sr;
        diffData.data[idx + 1] = sg;
        diffData.data[idx + 2] = sb;
        diffData.data[idx + 3] = 255;

        heatmapData.data[idx] = 0;
        heatmapData.data[idx + 1] = Math.floor(de * 50);
        heatmapData.data[idx + 2] = 0;
        heatmapData.data[idx + 3] = 255;
      }
    }
  }

  diffCtx.putImageData(diffData, 0, 0);
  heatmapCtx.putImageData(heatmapData, 0, 0);

  const diffImagePath = path.join(outputDir, 'diff-overlay.png');
  const heatmapImagePath = path.join(outputDir, 'diff-heatmap.png');
  const overlayImagePath = path.join(outputDir, 'diff-side-by-side.png');

  fs.writeFileSync(diffImagePath, diffCanvas.toBuffer('image/png'));
  fs.writeFileSync(heatmapImagePath, heatmapCanvas.toBuffer('image/png'));
  fs.writeFileSync(overlayImagePath, overlayCanvas.toBuffer('image/png'));

  const meanColorDistance = totalPixels > 0 ? totalColorDistance / totalPixels : 0;

  return {
    totalPixels,
    differentPixels,
    diffPercentage: totalPixels > 0 ? (differentPixels / totalPixels) * 100 : 0,
    maxColorDistance,
    meanColorDistance,
    regions: diffRegions,
    diffImagePath,
    heatmapImagePath,
    overlayImagePath,
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log('Usage: ts-node visual-diff.ts <stitch-image> <implementation-image> <output-dir> [threshold]');
    process.exit(1);
  }

  const config: DiffConfig = {
    stitchImagePath: args[0],
    implementationImagePath: args[1],
    outputDir: args[2],
    threshold: args[3] ? parseFloat(args[3]) : 5,
  };

  console.log('Generating visual diff...');
  console.log(`  Stitch: ${config.stitchImagePath}`);
  console.log(`  Implementation: ${config.implementationImagePath}`);
  console.log(`  Threshold: ΔE00 ${config.threshold}`);

  const result = await generateVisualDiff(config);

  console.log('\nResults:');
  console.log(`  Total pixels: ${result.totalPixels}`);
  console.log(`  Different pixels: ${result.differentPixels}`);
  console.log(`  Diff percentage: ${result.diffPercentage.toFixed(2)}%`);
  console.log(`  Max color distance (ΔE00): ${result.maxColorDistance.toFixed(2)}`);
  console.log(`  Mean color distance (ΔE00): ${result.meanColorDistance.toFixed(2)}`);
  console.log(`  Diff image: ${result.diffImagePath}`);
  console.log(`  Heatmap: ${result.heatmapImagePath}`);

  const reportPath = path.join(config.outputDir, 'diff-result.json');
  fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
  console.log(`  Report: ${reportPath}`);
}

main().catch(console.error);

export { generateVisualDiff, ciede2000, rgbToLab };
export type { DiffConfig, DiffResult, DiffRegion, Region };
