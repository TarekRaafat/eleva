/**
 * @fileoverview Documentation Metrics Benchmark for Eleva.js
 *
 * This benchmark suite measures the specific metrics displayed in the
 * Performance Benchmarks table in the documentation (README.md, docs/index.md).
 *
 * Metrics measured:
 * - Bundle Size (min+gzip): Actual file sizes of production builds
 * - Hydration Time: Time to initialize framework and mount first component
 * - DOM Update: Time to update DOM elements via reactive signals
 * - Memory: Memory footprint during operations
 *
 * @author Tarek Raafat
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 */

import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import fs from "fs";
import path from "path";
import { gzipSync } from "zlib";

import Eleva from "../../dist/eleva.js";

// ============================================================================
// Types
// ============================================================================

interface DocumentationMetrics {
  bundleSize: {
    raw: number;
    minified: number;
    gzipped: number;
    formatted: string;
  };
  hydrationTime: {
    median: number;
    min: number;
    max: number;
    formatted: string;
  };
  domUpdate: {
    median: number;
    min: number;
    max: number;
    formatted: string;
  };
  memory: {
    baseline: number;
    afterInit: number;
    afterMount: number;
    peak: number;
    formatted: string;
  };
  timestamp: string;
  version: string;
  runtime: string;
  platform: string;
}

// ============================================================================
// Configuration
// ============================================================================

const RESULTS_DIR = path.join(process.cwd(), "test/__results__/performance");
const METRICS_FILE = path.join(RESULTS_DIR, "documentation-metrics.json");
const REPORT_FILE = path.join(RESULTS_DIR, "DOCUMENTATION-METRICS.md");

const BENCHMARK_RUNS = 50; // More runs for statistical accuracy
const WARMUP_RUNS = 10;

// ============================================================================
// Utilities
// ============================================================================

/**
 * Get memory usage in MB (Bun-specific)
 */
function getMemoryUsage(): number {
  const usage = process.memoryUsage();
  return usage.heapUsed / (1024 * 1024);
}

async function settleAndSampleMemoryMB(
  samples: number = 5,
  delayMs: number = 25
): Promise<number> {
  if (typeof Bun !== "undefined" && Bun.gc) {
    Bun.gc(true);
  }
  await new Promise((r) => setTimeout(r, delayMs));
  if (typeof Bun !== "undefined" && Bun.gc) {
    Bun.gc(true);
  }
  await new Promise((r) => setTimeout(r, delayMs));

  const readings: number[] = [];
  for (let i = 0; i < samples; i++) {
    readings.push(getMemoryUsage());
    await new Promise((r) => setTimeout(r, delayMs));
  }

  return median(readings);
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Format milliseconds to human-readable string
 */
function formatMs(ms: number): string {
  if (ms < 0.001) return `< 0.001 ms`;
  if (ms < 1) return `${ms.toFixed(3)} ms`;
  return `${ms.toFixed(2)} ms`;
}

/**
 * Calculate median of array
 */
function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Remove outliers using IQR method
 */
function removeOutliers(arr: number[]): number[] {
  if (arr.length < 4) return arr;
  const sorted = [...arr].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;
  return arr.filter((v) => v >= lower && v <= upper);
}

/**
 * Run high-precision timing measurement
 */
async function measureTime(fn: () => Promise<void> | void): Promise<number> {
  const start = performance.now();
  await fn();
  return performance.now() - start;
}

// ============================================================================
// Bundle Size Measurement
// ============================================================================

function measureBundleSize(): DocumentationMetrics["bundleSize"] {
  const distPath = path.join(process.cwd(), "dist");

  // Measure ESM bundle (primary bundle for modern usage)
  const esmPath = path.join(distPath, "eleva.js");
  const umdMinPath = path.join(distPath, "eleva.umd.min.js");

  let raw = 0;
  let minified = 0;
  let gzipped = 0;

  if (fs.existsSync(esmPath)) {
    raw = fs.statSync(esmPath).size;
  }

  if (fs.existsSync(umdMinPath)) {
    const content = fs.readFileSync(umdMinPath);
    minified = content.length;
    gzipped = gzipSync(content).length;
  }

  return {
    raw,
    minified,
    gzipped,
    formatted: formatBytes(gzipped),
  };
}

// ============================================================================
// Hydration Time Measurement
// ============================================================================

async function measureHydrationTime(): Promise<DocumentationMetrics["hydrationTime"]> {
  const measurements: number[] = [];

  // Warmup runs
  for (let i = 0; i < WARMUP_RUNS; i++) {
    document.body.innerHTML = `<div id="warmup-${i}"></div>`;
    const container = document.getElementById(`warmup-${i}`)!;
    const app = new Eleva("WarmupApp");
    app.component("warmup", {
      setup: ({ signal }: any) => ({ count: signal(0) }),
      template: (ctx: any) => `<div>${ctx.count.value}</div>`,
    });
    await app.mount(container, "warmup");
  }

  // Actual measurement runs
  for (let i = 0; i < BENCHMARK_RUNS; i++) {
    document.body.innerHTML = `<div id="hydrate-${i}"></div>`;
    const container = document.getElementById(`hydrate-${i}`)!;

    const time = await measureTime(async () => {
      const app = new Eleva("BenchApp");
      app.component("bench", {
        setup: ({ signal }: any) => ({
          count: signal(0),
          name: signal("World"),
          items: signal([1, 2, 3, 4, 5]),
        }),
        template: (ctx: any) => `
          <div class="container">
            <h1>Hello ${ctx.name.value}</h1>
            <p>Count: ${ctx.count.value}</p>
            <ul>${ctx.items.value.map((i: number) => `<li>${i}</li>`).join("")}</ul>
          </div>
        `,
      });
      await app.mount(container, "bench");
    });

    measurements.push(time);
  }

  const cleaned = removeOutliers(measurements);
  const med = median(cleaned);

  return {
    median: med,
    min: Math.min(...cleaned),
    max: Math.max(...cleaned),
    formatted: med < 1 ? "< 1" : formatMs(med),
  };
}

// ============================================================================
// DOM Update Measurement
// ============================================================================

async function measureDOMUpdate(): Promise<DocumentationMetrics["domUpdate"]> {
  document.body.innerHTML = `<div id="dom-update-app"></div>`;
  const container = document.getElementById("dom-update-app")!;

  const app = new Eleva("DOMApp");
  let countSignal: any;

  app.component("counter", {
    setup: ({ signal }: any) => {
      countSignal = signal(0);
      return { count: countSignal };
    },
    template: (ctx: any) => `<div id="count-display">${ctx.count.value}</div>`,
  });

  await app.mount(container, "counter");
  await new Promise((r) => setTimeout(r, 50)); // Let initial render settle

  const measurements: number[] = [];

  // Warmup
  for (let i = 0; i < WARMUP_RUNS; i++) {
    countSignal.value++;
    await new Promise((r) => setTimeout(r, 1));
  }

  // Measure single DOM updates
  for (let i = 0; i < BENCHMARK_RUNS; i++) {
    const start = performance.now();
    countSignal.value++;
    // Wait for DOM to update
    await new Promise((r) => requestAnimationFrame(r));
    const end = performance.now();
    measurements.push(end - start);
  }

  const cleaned = removeOutliers(measurements);
  const med = median(cleaned);

  return {
    median: med,
    min: Math.min(...cleaned),
    max: Math.max(...cleaned),
    formatted: med < 0.1 ? "< 0.1" : formatMs(med),
  };
}

// ============================================================================
// Memory Measurement
// ============================================================================

async function measureMemory(): Promise<DocumentationMetrics["memory"]> {
  const baseline = await settleAndSampleMemoryMB();

  // Measure framework-only overhead (no components)
  const app = new Eleva("MemoryApp");
  const afterInit = await settleAndSampleMemoryMB();

  // Measure with a minimal realistic component (typical usage)
  document.body.innerHTML = `<div id="memory-app"></div>`;
  const container = document.getElementById("memory-app")!;

  let countSignal: any;
  app.component("memory-test", {
    setup: ({ signal }: any) => {
      countSignal = signal(0);
      const name = signal("World");
      const items = signal([1, 2, 3, 4, 5]); // Minimal list
      return { count: countSignal, name, items };
    },
    template: (ctx: any) => `
      <div>
        <h1>Hello ${ctx.name.value}</h1>
        <p>Count: ${ctx.count.value}</p>
        <ul>${ctx.items.value.map((i: number) => `<li>${i}</li>`).join("")}</ul>
      </div>
    `,
  });

  await app.mount(container, "memory-test");
  const afterMount = await settleAndSampleMemoryMB();

  // Simulate typical usage pattern (not stress test)
  for (let i = 0; i < 10; i++) {
    countSignal.value++;
    await new Promise((r) => setTimeout(r, 5));
  }
  const peak = await settleAndSampleMemoryMB();

  // Calculate Eleva-specific memory usage
  // Use afterMount - baseline for realistic footprint (framework + one component)
  const frameworkOnly = afterInit - baseline;
  const withComponent = afterMount - baseline;
  const elevaMemory = Math.max(0, withComponent);

  return {
    baseline,
    afterInit,
    afterMount,
    peak,
    // For documentation, report the realistic footprint
    formatted: elevaMemory < 0.5 ? "< 0.5" : elevaMemory < 1 ? `< 1` : `${elevaMemory.toFixed(1)}`,
  };
}

// ============================================================================
// Report Generation
// ============================================================================

function generateReport(metrics: DocumentationMetrics): string {
  const bundleDetails = `
### Bundle Size Details

| Build | Size |
|-------|------|
| ESM (raw) | ${formatBytes(metrics.bundleSize.raw)} |
| UMD (minified) | ${formatBytes(metrics.bundleSize.minified)} |
| UMD (min+gzip) | **${formatBytes(metrics.bundleSize.gzipped)}** |
`;

  const hydrationDetails = `
### Hydration Time Details

| Metric | Value |
|--------|-------|
| Median | ${formatMs(metrics.hydrationTime.median)} |
| Min | ${formatMs(metrics.hydrationTime.min)} |
| Max | ${formatMs(metrics.hydrationTime.max)} |
| Runs | ${BENCHMARK_RUNS} (after ${WARMUP_RUNS} warmup) |
`;

  const domUpdateDetails = `
### DOM Update Details

| Metric | Value |
|--------|-------|
| Median | ${formatMs(metrics.domUpdate.median)} |
| Min | ${formatMs(metrics.domUpdate.min)} |
| Max | ${formatMs(metrics.domUpdate.max)} |
| Runs | ${BENCHMARK_RUNS} (single signal updates) |
`;

  const memoryDetails = `
### Memory Usage Details

| Stage | Memory (MB) |
|-------|-------------|
| Baseline | ${metrics.memory.baseline.toFixed(2)} |
| After Init | ${metrics.memory.afterInit.toFixed(2)} |
| After Mount | ${metrics.memory.afterMount.toFixed(2)} |
| Peak (with updates) | ${metrics.memory.peak.toFixed(2)} |
| **Eleva Footprint** | **${metrics.memory.formatted} MB** |
`;

  return `# Eleva.js Documentation Metrics

> **Version:** ${metrics.version} | **Generated:** ${new Date(metrics.timestamp).toLocaleString()} | **Platform:** ${metrics.platform} | **Runtime:** ${metrics.runtime}

## Summary Table (for Documentation)

Use these values in the Performance Benchmarks table:

| **Metric** | **Value** | **For Documentation** |
|------------|-----------|----------------------|
| Bundle Size (min+gzip) | ${formatBytes(metrics.bundleSize.gzipped)} | **~${Math.round(metrics.bundleSize.gzipped / 1024)} KB** |
| Hydration Time | ${formatMs(metrics.hydrationTime.median)} | **${metrics.hydrationTime.formatted}** |
| DOM Update | ${formatMs(metrics.domUpdate.median)} | **${metrics.domUpdate.formatted}** |
| Memory | ${metrics.memory.formatted} MB | **${metrics.memory.formatted}** |

## Documentation Table Format

\`\`\`markdown
| **Framework**                 | **Bundle Size (min+gzip)** | **Hydration Time** (ms) | **DOM Update** (ms) | **Memory** (MB) |
| ----------------------------- | -------------------------- | ----------------------- | ------------------- | --------------- |
| **Eleva** (Direct DOM)        | **~${Math.round(metrics.bundleSize.gzipped / 1024)} KB**                  | **${metrics.hydrationTime.formatted}**                 | **${metrics.domUpdate.formatted}**           | **${metrics.memory.formatted}**       |
\`\`\`

---

## Detailed Measurements
${bundleDetails}
${hydrationDetails}
${domUpdateDetails}
${memoryDetails}

---

## Methodology

### Bundle Size
- Measures the production UMD minified bundle compressed with gzip
- This represents the actual size users download when using a CDN

### Hydration Time
- Time from creating Eleva instance to component fully mounted and rendered
- Includes component registration, setup execution, and initial DOM render
- Measured with ${BENCHMARK_RUNS} runs after ${WARMUP_RUNS} warmup runs
- Outliers removed using IQR method, median reported

### DOM Update
- Time for a single reactive signal update to reflect in the DOM
- Uses requestAnimationFrame to ensure DOM has updated
- Measured with ${BENCHMARK_RUNS} consecutive single-value updates
- Outliers removed using IQR method, median reported

### Memory
- Measures heap memory usage at different stages
- Eleva footprint = After Mount memory - Baseline memory
- Tests minimal realistic component (3 signals, 5-item list)
- GC forced before each measurement for accuracy

---

*Generated by Eleva.js Documentation Metrics Benchmark*
`;
}

// ============================================================================
// Test Suite
// ============================================================================

describe("Documentation Metrics Benchmark", () => {
  let metrics: DocumentationMetrics;

  beforeAll(() => {
    // Ensure results directory exists
    if (!fs.existsSync(RESULTS_DIR)) {
      fs.mkdirSync(RESULTS_DIR, { recursive: true });
    }

    // Get version from package.json
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8")
    );

    metrics = {
      bundleSize: { raw: 0, minified: 0, gzipped: 0, formatted: "N/A" },
      hydrationTime: { median: 0, min: 0, max: 0, formatted: "N/A" },
      domUpdate: { median: 0, min: 0, max: 0, formatted: "N/A" },
      memory: { baseline: 0, afterInit: 0, afterMount: 0, peak: 0, formatted: "N/A" },
      timestamp: new Date().toISOString(),
      version: packageJson.version,
      runtime: `Bun ${Bun.version}`,
      platform: `${process.platform} ${process.arch}`,
    };
  });

  test("Bundle Size (min+gzip)", () => {
    console.log("\n📦 Measuring bundle size...");
    metrics.bundleSize = measureBundleSize();

    console.log(`   ESM (raw):     ${formatBytes(metrics.bundleSize.raw)}`);
    console.log(`   UMD (min):     ${formatBytes(metrics.bundleSize.minified)}`);
    console.log(`   UMD (gzip):    ${formatBytes(metrics.bundleSize.gzipped)}`);

    // Bundle should be under 10KB gzipped
    expect(metrics.bundleSize.gzipped).toBeLessThan(10 * 1024);
  });

  test("Hydration Time", async () => {
    console.log("\n⚡ Measuring hydration time...");
    metrics.hydrationTime = await measureHydrationTime();

    console.log(`   Median:        ${formatMs(metrics.hydrationTime.median)}`);
    console.log(`   Range:         ${formatMs(metrics.hydrationTime.min)} - ${formatMs(metrics.hydrationTime.max)}`);

    // Hydration should be under 10ms for a simple component
    expect(metrics.hydrationTime.median).toBeLessThan(10);
  });

  test("DOM Update Time", async () => {
    console.log("\n🔄 Measuring DOM update time...");
    metrics.domUpdate = await measureDOMUpdate();

    console.log(`   Median:        ${formatMs(metrics.domUpdate.median)}`);
    console.log(`   Range:         ${formatMs(metrics.domUpdate.min)} - ${formatMs(metrics.domUpdate.max)}`);

    // Single DOM update should be under 5ms
    expect(metrics.domUpdate.median).toBeLessThan(5);
  });

  test("Memory Usage", async () => {
    console.log("\n💾 Measuring memory usage...");
    metrics.memory = await measureMemory();

    console.log(`   Baseline:      ${metrics.memory.baseline.toFixed(2)} MB`);
    console.log(`   After Init:    ${metrics.memory.afterInit.toFixed(2)} MB`);
    console.log(`   After Mount:   ${metrics.memory.afterMount.toFixed(2)} MB`);
    console.log(`   Peak:          ${metrics.memory.peak.toFixed(2)} MB`);
    console.log(`   Eleva Total:   ${metrics.memory.formatted} MB`);

    // Memory overhead should be under 5MB
    const elevaMemory = metrics.memory.peak - metrics.memory.baseline;
    expect(elevaMemory).toBeLessThan(5);
  });

  afterAll(() => {
    // Save metrics as JSON
    fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));

    // Generate and save report
    const report = generateReport(metrics);
    fs.writeFileSync(REPORT_FILE, report);

    // Print summary
    console.log("\n" + "═".repeat(60));
    console.log("📊 DOCUMENTATION METRICS SUMMARY");
    console.log("═".repeat(60));
    console.log(`\n  Bundle Size (min+gzip): ${metrics.bundleSize.formatted}`);
    console.log(`  Hydration Time:         ${metrics.hydrationTime.formatted} ms`);
    console.log(`  DOM Update:             ${metrics.domUpdate.formatted} ms`);
    console.log(`  Memory:                 ${metrics.memory.formatted} MB`);
    console.log("\n" + "─".repeat(60));
    console.log(`\n  Results saved to:`);
    console.log(`    JSON:   ${METRICS_FILE}`);
    console.log(`    Report: ${REPORT_FILE}`);
    console.log("\n" + "═".repeat(60));

    // Print documentation table format
    console.log("\n📝 Copy this to documentation:\n");
    console.log(`| **Eleva** (Direct DOM) | **~${Math.round(metrics.bundleSize.gzipped / 1024)} KB** | **${metrics.hydrationTime.formatted}** | **${metrics.domUpdate.formatted}** | **${metrics.memory.formatted}** |`);
    console.log("");
  });
});
