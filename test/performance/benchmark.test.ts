/**
 * @fileoverview Performance Benchmarks for Eleva.js (Production Build)
 *
 * This benchmark suite tests the production build (dist/eleva.js) and
 * tracks performance across versions to monitor framework progression.
 *
 * Features:
 * - Tests production build (what users actually use)
 * - Tracks historical performance across versions
 * - Compares: Current vs Previous vs Initial (baseline)
 * - Single consolidated report with trend indicators
 *
 * Methodology:
 * - Warm-up: 3 runs before measurement (excludes JIT compilation)
 * - Runs: 10 measured iterations per benchmark
 * - Outliers: Removed (>2 standard deviations)
 * - Primary metric: Median (robust to outliers)
 *
 * @author Tarek Raafat
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 */

import { describe, test, expect, beforeEach, afterAll } from "bun:test";
import {
  runBenchmark,
  runBenchmarkAsync,
  formatDuration,
  type BenchmarkMetrics,
} from "../helpers/performance.js";
import fs from "fs";
import path from "path";

import Eleva from "../../dist/eleva.js";

// ============================================================================
// Types
// ============================================================================

interface BenchmarkResult {
  name: string;
  median: number;
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  runs: number;
  cv: number;
  opsPerRun: number;
  budget: number;
  passed: boolean;
}

interface VersionBenchmarks {
  version: string;
  timestamp: string;
  runtime: string;
  platform: string;
  results: Record<string, BenchmarkResult>;
  methodology?: "legacy" | "standard";
}

interface BenchmarkHistory {
  initial: string | null;
  versions: Record<string, VersionBenchmarks>;
}

// ============================================================================
// Configuration
// ============================================================================

const RESULTS_DIR = path.join(process.cwd(), "test/__results__/performance");
const ARCHIVE_DIR = path.join(RESULTS_DIR, "archive");
const HISTORY_FILE = path.join(RESULTS_DIR, "benchmark-history.json");
const REPORT_FILE = path.join(RESULTS_DIR, "BENCHMARKS.md");

const CHANGE_THRESHOLD = 0.10; // 10% change is considered significant
const MAX_HISTORY_VERSIONS = 10; // Number of versions to show in history table (initial always included)

// ============================================================================
// History Management
// ============================================================================

function loadHistory(): BenchmarkHistory {
  if (fs.existsSync(HISTORY_FILE)) {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
  }
  return { initial: null, versions: {} };
}

function saveHistory(history: BenchmarkHistory): void {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

function archiveVersion(version: string, history: BenchmarkHistory): void {
  const versionData = history.versions[version];
  if (!versionData) return;

  // Ensure archive directory exists
  if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
  }

  const date = new Date(versionData.timestamp).toISOString().split("T")[0];
  const archiveFile = path.join(ARCHIVE_DIR, `benchmark-${version}-${date}.md`);

  // Skip if already archived
  if (fs.existsSync(archiveFile)) return;

  // Generate a mini-report for the archived version
  const results = versionData.results;
  const benchmarkRows = Object.values(results)
    .map((r) => `| ${r.name} | ${formatDuration(r.median)} | ${r.passed ? "✓" : "✗"} |`)
    .join("\n");

  const avgMedian =
    Object.values(results).reduce((sum, r) => sum + r.median, 0) /
    Object.keys(results).length;

  const report = `# Benchmark Results: v${version}

> **Archived:** ${new Date().toISOString()}
> **Original Run:** ${versionData.timestamp}
> **Runtime:** ${versionData.runtime}
> **Platform:** ${versionData.platform}
> **Methodology:** ${versionData.methodology === "legacy" ? "Legacy (single run)" : "Standard (10 runs, warm-up, outlier removal)"}

## Summary

| Metric | Value |
|--------|-------|
| **Average Median** | ${formatDuration(avgMedian)} |
| **Benchmarks** | ${Object.keys(results).length} |
| **Passed** | ${Object.values(results).filter((r) => r.passed).length}/${Object.keys(results).length} |

## Results

| Benchmark | Median | Status |
|-----------|--------|--------|
${benchmarkRows}

---
*Archived from Eleva.js benchmark suite.*
`;

  fs.writeFileSync(archiveFile, report);
}

/**
 * Compare two semantic versions.
 * Returns: negative if a < b, positive if a > b, 0 if equal
 */
function compareSemver(a: string, b: string): number {
  // Parse version: major.minor.patch-prerelease
  const parseVersion = (v: string) => {
    const [version, prerelease] = v.split("-");
    const [major, minor, patch] = version.split(".").map(Number);

    // Parse prerelease (e.g., "rc.10" -> { tag: "rc", num: 10 })
    let prereleaseTag = "";
    let prereleaseNum = 0;
    if (prerelease) {
      const match = prerelease.match(/^([a-zA-Z]+)\.?(\d+)?$/);
      if (match) {
        prereleaseTag = match[1];
        prereleaseNum = match[2] ? parseInt(match[2], 10) : 0;
      } else {
        prereleaseTag = prerelease;
      }
    }

    return { major, minor, patch, prereleaseTag, prereleaseNum, hasPrerelease: !!prerelease };
  };

  const va = parseVersion(a);
  const vb = parseVersion(b);

  // Compare major.minor.patch
  if (va.major !== vb.major) return va.major - vb.major;
  if (va.minor !== vb.minor) return va.minor - vb.minor;
  if (va.patch !== vb.patch) return va.patch - vb.patch;

  // If one has prerelease and the other doesn't, the one without is greater
  if (va.hasPrerelease && !vb.hasPrerelease) return -1;
  if (!va.hasPrerelease && vb.hasPrerelease) return 1;

  // Compare prerelease tags alphabetically (alpha < beta < rc)
  if (va.prereleaseTag !== vb.prereleaseTag) {
    return va.prereleaseTag.localeCompare(vb.prereleaseTag);
  }

  // Compare prerelease numbers
  return va.prereleaseNum - vb.prereleaseNum;
}

function getVersions(history: BenchmarkHistory): {
  current: string;
  previous: string | null;
  initial: string | null;
} {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8")
  );
  const current = packageJson.version;

  // Sort by timestamp (most recent first) to find the previous version
  const sortedVersions = Object.keys(history.versions)
    .filter((v) => v !== current)
    .sort((a, b) => {
      const timestampA = history.versions[a].timestamp;
      const timestampB = history.versions[b].timestamp;
      return timestampB.localeCompare(timestampA);
    });

  // Previous is the most recently tested version before current
  const previous = sortedVersions.length > 0 ? sortedVersions[0] : null;

  return {
    current,
    previous,
    initial: history.initial,
  };
}

// ============================================================================
// Report Generation
// ============================================================================

function formatDateTime(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const formattedHours = String(hours).padStart(2, "0");

  const timezoneOffset = -date.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
  const offsetSign = timezoneOffset >= 0 ? "+" : "-";

  return `${day}/${month}/${year} at ${formattedHours}:${minutes} ${ampm} (GMT ${offsetSign}${offsetHours})`;
}

function getTrend(
  current: number,
  previous: number | null
): { symbol: string; change: string; class: string } {
  if (previous === null) {
    return { symbol: "—", change: "baseline", class: "neutral" };
  }

  const changePercent = ((current - previous) / previous) * 100;
  const absChange = Math.abs(changePercent);

  if (absChange < CHANGE_THRESHOLD * 100) {
    return { symbol: "→", change: `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(1)}%`, class: "stable" };
  } else if (changePercent < 0) {
    // Lower is better for performance
    return { symbol: "↑", change: `${changePercent.toFixed(1)}%`, class: "improved" };
  } else {
    return { symbol: "↓", change: `+${changePercent.toFixed(1)}%`, class: "degraded" };
  }
}

function generateReport(history: BenchmarkHistory): string {
  const { current, previous, initial } = getVersions(history);
  const currentData = history.versions[current];

  if (!currentData) {
    return "# No benchmark data available\n";
  }

  const previousData = previous ? history.versions[previous] : null;
  const initialData = initial ? history.versions[initial] : null;

  const benchmarkNames = Object.keys(currentData.results);

  // Generate summary table
  let summaryTable = `| Benchmark | Current (${current}) | Previous${previous ? ` (${previous})` : ""} | Initial${initial ? ` (${initial})` : ""} | Trend | Change |
|-----------|---------|----------|---------|-------|--------|
`;

  for (const name of benchmarkNames) {
    const curr = currentData.results[name];
    const prev = previousData?.results[name];
    const init = initialData?.results[name];
    const trend = getTrend(curr.median, prev?.median ?? null);
    const vsInitial = init
      ? `${(((curr.median - init.median) / init.median) * 100).toFixed(1)}%`
      : "—";

    summaryTable += `| ${name} | ${formatDuration(curr.median)} | ${prev ? formatDuration(prev.median) : "—"} | ${init ? formatDuration(init.median) : "—"} | ${trend.symbol} | ${trend.change} |\n`;
  }

  // Generate detailed results
  let detailedResults = "";
  for (const name of benchmarkNames) {
    const curr = currentData.results[name];
    const prev = previousData?.results[name];
    const init = initialData?.results[name];
    const trendVsPrev = getTrend(curr.median, prev?.median ?? null);
    const trendVsInit = getTrend(curr.median, init?.median ?? null);

    detailedResults += `### ${name}

| Metric | Value |
|--------|-------|
| **Median** | ${formatDuration(curr.median)} |
| **Mean** | ${formatDuration(curr.mean)} |
| **Std Dev** | ${formatDuration(curr.stdDev)} |
| **Range** | ${formatDuration(curr.min)} – ${formatDuration(curr.max)} |
| **CV** | ${(curr.cv * 100).toFixed(1)}% |
| **Runs** | ${curr.runs} |
| **Ops/Run** | ${curr.opsPerRun} |
| **Budget** | < ${formatDuration(curr.budget)} |
| **Status** | ${curr.passed ? "✓ PASSED" : "✗ FAILED"} |

**Comparison:**
- vs Previous: ${prev ? `${formatDuration(prev.median)} → ${formatDuration(curr.median)} (${trendVsPrev.symbol} ${trendVsPrev.change})` : "No previous data"}
- vs Initial: ${init ? `${formatDuration(init.median)} → ${formatDuration(curr.median)} (${trendVsInit.symbol} ${trendVsInit.change})` : "No initial data"}

`;
  }

  // Generate version history (sorted by timestamp, most recent first)
  const sortedVersions = Object.keys(history.versions).sort((a, b) => {
    const timestampA = history.versions[a].timestamp;
    const timestampB = history.versions[b].timestamp;
    return timestampB.localeCompare(timestampA);
  });

  // Get versions to display (limited by MAX_HISTORY_VERSIONS, but always include initial)
  let versionsToShow = sortedVersions.slice(0, MAX_HISTORY_VERSIONS);

  // Ensure initial version is always included
  if (initial && !versionsToShow.includes(initial) && history.versions[initial]) {
    versionsToShow = [...versionsToShow.slice(0, MAX_HISTORY_VERSIONS - 1), initial];
  }

  let versionHistory = "";
  for (const version of versionsToShow) {
    const data = history.versions[version];
    const avgMedian =
      Object.values(data.results).reduce((sum, r) => sum + r.median, 0) /
      Object.keys(data.results).length;
    const methodology = data.methodology === "legacy" ? "Legacy" : "Standard";
    const isInitial = version === initial ? " *(initial)*" : "";
    versionHistory += `| ${version}${isInitial} | ${new Date(data.timestamp).toLocaleDateString()} | ${formatDuration(avgMedian)} | ${methodology} |\n`;
  }

  // Calculate overall health
  const passedCount = Object.values(currentData.results).filter(
    (r) => r.passed
  ).length;
  const totalCount = Object.keys(currentData.results).length;
  const healthPercent = (passedCount / totalCount) * 100;
  const healthStatus =
    healthPercent === 100
      ? "Excellent"
      : healthPercent >= 80
        ? "Good"
        : healthPercent >= 60
          ? "Fair"
          : "Needs Attention";

  const legacyNote = initialData?.methodology === "legacy"
    ? `\n> **Note:** Initial baseline (${initial}) used legacy methodology (single run, Jest/Node.js). Current tests use improved methodology (10 runs, warm-up, outlier removal).`
    : "";

  return `# Eleva.js Performance Benchmarks

> **Current Version:** ${current} | **Generated:** ${formatDateTime(new Date())} | **Platform:** ${currentData.platform} | **Runtime:** ${currentData.runtime}
${legacyNote}

## Overview

| Metric | Value |
|--------|-------|
| **Benchmarks Passed** | ${passedCount}/${totalCount} (${healthPercent.toFixed(0)}%) |
| **Performance Health** | ${healthStatus} |
| **Versions Tracked** | ${Object.keys(history.versions).length} |
| **Initial Baseline** | ${initial || "N/A"} (${initialData?.methodology === "legacy" ? "legacy" : "standard"}) |

## Legend

| Symbol | Meaning |
|--------|---------|
| ↑ | Improved (faster than before) |
| ↓ | Degraded (slower than before) |
| → | Stable (within ±${CHANGE_THRESHOLD * 100}%) |
| — | No comparison data |

## Summary

${summaryTable}

## Methodology

| Parameter | Value |
|-----------|-------|
| **Warm-up Runs** | 3 (excluded from results) |
| **Measured Runs** | 10 per benchmark |
| **Outlier Removal** | >2 standard deviations |
| **Primary Metric** | Median (robust to outliers) |
| **Test Target** | Production build (\`dist/eleva.js\`) |

## Detailed Results

${detailedResults}

## Version History

| Version | Date | Avg. Median | Methodology |
|---------|------|-------------|-------------|
${versionHistory}

---

*Lower times are better. CV (Coefficient of Variation) < 50% indicates consistent measurements.*

*Report generated automatically by the Eleva.js benchmark suite.*
`;
}

// ============================================================================
// Benchmark Collection
// ============================================================================

const benchmarkResults: Record<string, BenchmarkResult> = {};

function recordBenchmark(
  name: string,
  metrics: BenchmarkMetrics,
  opsPerRun: number,
  budget: number
): void {
  const passed = metrics.median < budget;

  benchmarkResults[name] = {
    name,
    median: metrics.median,
    mean: metrics.mean,
    stdDev: metrics.stdDev,
    min: metrics.min,
    max: metrics.max,
    runs: metrics.runs,
    cv: metrics.cv,
    opsPerRun,
    budget,
    passed,
  };

  // Log to console
  console.log(`\n${name}:`);
  console.log("─".repeat(40));
  console.log(`  Median: ${formatDuration(metrics.median)}`);
  console.log(`  CV:     ${(metrics.cv * 100).toFixed(1)}%`);
  console.log(`  Status: ${passed ? "✓ PASSED" : "✗ FAILED"}`);
}

// ============================================================================
// Test Suite
// ============================================================================

describe("Eleva.js Performance Benchmarks", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
  });

  test("Framework instantiation", () => {
    const metrics = runBenchmark(() => new Eleva("BenchApp"));
    recordBenchmark("Framework Instantiation", metrics, 1, 10);
    expect(metrics.median).toBeLessThan(10);
  });

  test("Component registration (×10)", () => {
    const metrics = runBenchmark(() => {
      const app = new Eleva("BenchApp");
      for (let i = 0; i < 10; i++) {
        app.component(`component-${i}`, {
          template: () => `<div>Component ${i}</div>`,
        });
      }
      return app;
    });
    recordBenchmark("Component Registration (×10)", metrics, 10, 20);
    expect(metrics.median).toBeLessThan(20);
  });

  test("Component mount", async () => {
    const metrics = await runBenchmarkAsync(async () => {
      document.body.innerHTML = `<div id="mount-app"></div>`;
      const container = document.getElementById("mount-app")!;
      const app = new Eleva("BenchApp");
      app.component("bench-component", {
        template: () => "<div>Benchmark</div>",
      });
      await app.mount(container, "bench-component");
    });
    recordBenchmark("Component Mount", metrics, 1, 20);
    expect(metrics.median).toBeLessThan(20);
  });

  test("Reactive state updates (×100)", async () => {
    document.body.innerHTML = `<div id="reactive-app"></div>`;
    const container = document.getElementById("reactive-app")!;
    const app = new Eleva("BenchApp");
    let counterSignal: any;

    app.component("counter", {
      setup({ signal }: any) {
        counterSignal = signal(0);
        return { count: counterSignal };
      },
      template: (ctx: any) => `<div>Count: ${ctx.count.value}</div>`,
    });

    await app.mount(container, "counter");
    await new Promise((r) => setTimeout(r, 10));

    const metrics = runBenchmark(() => {
      for (let i = 0; i < 100; i++) {
        counterSignal.value++;
      }
    });
    recordBenchmark("Reactive Updates (×100)", metrics, 100, 50);
    expect(metrics.median).toBeLessThan(50);
  });

  test("Lifecycle cycles (×10)", async () => {
    document.body.innerHTML = `<div id="lifecycle-app"></div>`;
    const container = document.getElementById("lifecycle-app")!;
    const app = new Eleva("BenchApp");

    app.component("lifecycle-bench", {
      setup: () => ({ onMount: () => {}, onUnmount: () => {} }),
      template: () => "<div>Lifecycle</div>",
    });

    const metrics = await runBenchmarkAsync(async () => {
      for (let i = 0; i < 10; i++) {
        const mounted = await app.mount(container, "lifecycle-bench");
        await mounted.unmount();
      }
    });
    recordBenchmark("Lifecycle Cycles (×10)", metrics, 10, 100);
    expect(metrics.median).toBeLessThan(100);
  });

  test("Event handling (×50)", async () => {
    document.body.innerHTML = `<div id="event-app"></div>`;
    const container = document.getElementById("event-app")!;
    const app = new Eleva("BenchApp");
    let clickCount = 0;

    app.component("event-bench", {
      setup() {
        return { handleClick: () => clickCount++ };
      },
      template: () =>
        `<div>${Array(50).fill('<button @click="handleClick">Click</button>').join("")}</div>`,
    });

    await app.mount(container, "event-bench");
    await new Promise((r) => setTimeout(r, 10));
    const buttons = document.querySelectorAll("button");

    const metrics = runBenchmark(() => {
      buttons.forEach((btn) => btn.click());
    });
    recordBenchmark("Event Handling (×50)", metrics, 50, 50);
    expect(metrics.median).toBeLessThan(50);
  });

  test("Large list update (500 items)", async () => {
    document.body.innerHTML = `<div id="list-app"></div>`;
    const container = document.getElementById("list-app")!;
    const app = new Eleva("BenchApp");
    let itemsSignal: any;

    app.component("list-bench", {
      setup({ signal }: any) {
        itemsSignal = signal(
          Array(500).fill(0).map((_, i) => ({ id: i, value: Math.random() }))
        );
        return { items: itemsSignal };
      },
      template: (ctx: any) =>
        `<ul>${ctx.items.value.map((item: any) => `<li>${item.id}: ${item.value.toFixed(2)}</li>`).join("")}</ul>`,
    });

    await app.mount(container, "list-bench");
    await new Promise((r) => setTimeout(r, 10));

    const metrics = runBenchmark(() => {
      itemsSignal.value = itemsSignal.value.map((item: any) => ({
        ...item,
        value: Math.random(),
      }));
    });
    recordBenchmark("Large List Update (500 items)", metrics, 500, 100);
    expect(metrics.median).toBeLessThan(100);
  });

  test("Complex template (50×5 nested)", async () => {
    document.body.innerHTML = `<div id="complex-app"></div>`;
    const container = document.getElementById("complex-app")!;
    const app = new Eleva("BenchApp");
    let dataSignal: any;

    app.component("complex-bench", {
      setup({ signal }: any) {
        dataSignal = signal({
          items: Array(50).fill(0).map((_, i) => ({
            id: i,
            name: `Item ${i}`,
            children: Array(5).fill(0).map((_, j) => ({ id: j, value: Math.random() })),
          })),
        });
        return { data: dataSignal };
      },
      template: (ctx: any) => `
        <div class="complex">
          ${ctx.data.value.items.map((item: any) => `
            <div class="item">
              <h3>${item.name}</h3>
              <ul>${item.children.map((c: any) => `<li>${c.id}: ${c.value.toFixed(2)}</li>`).join("")}</ul>
            </div>
          `).join("")}
        </div>
      `,
    });

    await app.mount(container, "complex-bench");
    await new Promise((r) => setTimeout(r, 10));

    const metrics = runBenchmark(() => {
      dataSignal.value = {
        items: dataSignal.value.items.map((item: any) => ({
          ...item,
          children: item.children.map((c: any) => ({ ...c, value: Math.random() })),
        })),
      };
    });
    recordBenchmark("Complex Template (50×5)", metrics, 250, 50);
    expect(metrics.median).toBeLessThan(50);
  });

  afterAll(() => {
    // Load existing history
    const history = loadHistory();

    // Get current version
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8")
    );
    const version = packageJson.version;

    // Check if this is a new version (not already in history)
    const isNewVersion = !history.versions[version];

    // Archive previous version if this is a new version
    if (isNewVersion) {
      const { previous } = getVersions(history);
      if (previous) {
        archiveVersion(previous, history);
        console.log(`\nArchived previous version: ${previous}`);
      }
    }

    // Save current results
    history.versions[version] = {
      version,
      timestamp: new Date().toISOString(),
      runtime: `Bun ${Bun.version}`,
      platform: `${process.platform} ${process.arch}`,
      results: benchmarkResults,
      methodology: "standard",
    };

    // Set initial version if not set
    if (!history.initial) {
      history.initial = version;
    }

    // Save history
    saveHistory(history);

    // Generate and save report
    const report = generateReport(history);
    fs.writeFileSync(REPORT_FILE, report);

    console.log("\n" + "═".repeat(50));
    console.log("Benchmark results saved to:");
    console.log(`  History: ${HISTORY_FILE}`);
    console.log(`  Report:  ${REPORT_FILE}`);
    if (isNewVersion) {
      console.log(`  Archive: ${ARCHIVE_DIR}/`);
    }
    console.log("═".repeat(50));
  });
});
