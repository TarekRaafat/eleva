/**
 * @fileoverview js-framework-benchmark Style Performance Test for Eleva.js
 *
 * This benchmark follows the methodology used by js-framework-benchmark
 * (https://github.com/krausest/js-framework-benchmark) to provide
 * comparable metrics against other JavaScript frameworks.
 *
 * Standard Operations Tested:
 * 1. Create 1,000 rows
 * 2. Replace all 1,000 rows
 * 3. Partial update (every 10th row out of 1,000)
 * 4. Select row (highlight one row)
 * 5. Swap rows (swap rows at index 1 and 998)
 * 6. Remove row (delete one row)
 * 7. Create 10,000 rows (stress test)
 * 8. Append 1,000 rows to existing 1,000
 * 9. Clear all rows
 *
 * Metrics Collected:
 * - Duration (ms) for each operation
 * - Memory usage (MB) after key operations
 * - Startup/hydration time
 *
 * @author Tarek Raafat
 * @see {@link https://github.com/krausest/js-framework-benchmark}
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 */

import { describe, test, expect, beforeAll, beforeEach, afterAll } from "bun:test";
import fs from "fs";
import path from "path";
import { gzipSync } from "zlib";

import Eleva from "../../dist/eleva.esm.js";

// ============================================================================
// Types
// ============================================================================

interface Row {
  id: number;
  label: string;
}

interface BenchmarkResult {
  name: string;
  operation: string;
  duration: number;
  memory?: number;
  rows?: number;
}

interface BenchmarkSummary {
  version: string;
  timestamp: string;
  runtime: string;
  platform: string;
  bundleSize: number;
  results: BenchmarkResult[];
  memoryBaselines: {
    pureDom1k: number;
    pureDom10k: number;
    elevaOverhead1k: number;
    elevaOverhead10k: number;
  };
  documentationMetrics: {
    bundleSize: string;
    hydrationTime: string;
    domUpdate: string;
    memory: string;
  };
}

// ============================================================================
// Configuration
// ============================================================================

const RESULTS_DIR = path.join(process.cwd(), "test/__results__/performance");
const REPORT_FILE = path.join(RESULTS_DIR, "JS-FRAMEWORK-BENCHMARK.md");
const JSON_FILE = path.join(RESULTS_DIR, "js-framework-benchmark.json");

const BENCHMARK_RUNS = 5; // Number of runs per operation
const WARMUP_RUNS = 2;

// Row counts matching js-framework-benchmark
const ROWS_1K = 1000;
const ROWS_10K = 10000;

// ============================================================================
// Data Generation (matching js-framework-benchmark)
// ============================================================================

const ADJECTIVES = [
  "pretty", "large", "big", "small", "tall", "short", "long", "handsome",
  "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful",
  "mushy", "odd", "unsightly", "adorable", "important", "inexpensive",
  "cheap", "expensive", "fancy"
];

const COLOURS = [
  "red", "yellow", "blue", "green", "pink", "brown", "purple", "brown",
  "white", "black", "orange"
];

const NOUNS = [
  "table", "chair", "house", "bbq", "desk", "car", "pony", "cookie",
  "sandwich", "burger", "pizza", "mouse", "keyboard"
];

let nextId = 1;

function random(max: number): number {
  return Math.round(Math.random() * 1000) % max;
}

function generateLabel(): string {
  return `${ADJECTIVES[random(ADJECTIVES.length)]} ${COLOURS[random(COLOURS.length)]} ${NOUNS[random(NOUNS.length)]}`;
}

function buildData(count: number): Row[] {
  const data: Row[] = [];
  for (let i = 0; i < count; i++) {
    data.push({
      id: nextId++,
      label: generateLabel(),
    });
  }
  return data;
}

function resetId(): void {
  nextId = 1;
}

// ============================================================================
// Utilities
// ============================================================================

function getMemoryMB(): number {
  if (typeof Bun !== "undefined" && Bun.gc) {
    Bun.gc(true);
  }
  return process.memoryUsage().heapUsed / (1024 * 1024);
}

function formatMs(ms: number): string {
  if (ms < 1) return `${ms.toFixed(3)} ms`;
  if (ms < 1000) return `${ms.toFixed(2)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function removeOutliers(arr: number[]): number[] {
  if (arr.length < 4) return arr;
  const sorted = [...arr].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  return arr.filter((v) => v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr);
}

async function measureOperation(
  name: string,
  operation: () => Promise<void> | void,
  runs: number = BENCHMARK_RUNS
): Promise<{ median: number; min: number; max: number; all: number[] }> {
  const measurements: number[] = [];

  // Warmup
  for (let i = 0; i < WARMUP_RUNS; i++) {
    await operation();
  }

  // Actual measurements
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    await operation();
    const end = performance.now();
    measurements.push(end - start);
  }

  const cleaned = removeOutliers(measurements);
  return {
    median: median(cleaned),
    min: Math.min(...cleaned),
    max: Math.max(...cleaned),
    all: cleaned,
  };
}

// ============================================================================
// Benchmark Results Collection
// ============================================================================

const benchmarkResults: BenchmarkResult[] = [];
let baselineMemory = 0;
let pureDomMemory1k = 0; // Memory for pure DOM without Eleva (1k rows)
let pureDomMemory10k = 0; // Memory for pure DOM without Eleva (10k rows)

function recordResult(
  name: string,
  operation: string,
  duration: number,
  memory?: number,
  rows?: number
): void {
  benchmarkResults.push({ name, operation, duration, memory, rows });
  console.log(`  ${name}: ${formatMs(duration)}${memory ? ` (${memory.toFixed(2)} MB)` : ""}`);
}

// ============================================================================
// Report Generation
// ============================================================================

function generateReport(summary: BenchmarkSummary, pureDom1k: number, pureDom10k: number): string {
  const results = summary.results;

  // Group results by operation type
  const createOps = results.filter((r) => r.operation === "create");
  const updateOps = results.filter((r) => r.operation === "update");
  const manipulateOps = results.filter((r) => r.operation === "manipulate");
  const memoryOps = results.filter((r) => r.operation === "memory");

  // Calculate key metrics for documentation
  const create1k = results.find((r) => r.name === "create 1,000 rows");
  const partialUpdate = results.find((r) => r.name === "partial update (every 10th row)");
  const memoryAfter1k = results.find((r) => r.name === "memory after 1,000 rows");
  const memoryAfter10k = results.find((r) => r.name === "memory after 10,000 rows");

  // Calculate actual Eleva overhead
  const elevaOverhead1k = memoryAfter1k && pureDom1k > 0
    ? memoryAfter1k.memory! - pureDom1k
    : 0;
  const elevaOverhead10k = memoryAfter10k && pureDom10k > 0
    ? memoryAfter10k.memory! - pureDom10k
    : 0;

  return `# Eleva.js - js-framework-benchmark Results

> **Version:** ${summary.version} | **Generated:** ${new Date(summary.timestamp).toLocaleString()}
> **Platform:** ${summary.platform} | **Runtime:** ${summary.runtime}
> **Bundle Size:** ${formatBytes(summary.bundleSize)} (min+gzip)

## Summary for Documentation

These metrics are comparable to js-framework-benchmark results:

| **Metric** | **Eleva.js Result** | **For Documentation** |
|------------|---------------------|----------------------|
| Bundle Size (min+gzip) | ${formatBytes(summary.bundleSize)} | **~${Math.round(summary.bundleSize / 1024)} KB** |
| Hydration/Startup (1k rows) | ${create1k ? formatMs(create1k.duration) : "N/A"} | **${summary.documentationMetrics.hydrationTime}** |
| DOM Update (partial 1k) | ${partialUpdate ? formatMs(partialUpdate.duration) : "N/A"} | **${summary.documentationMetrics.domUpdate}** |
| Memory (Eleva overhead) | ${elevaOverhead1k.toFixed(2)} MB | **${summary.documentationMetrics.memory}** |

### Documentation Table Row

\`\`\`markdown
| **Eleva** (Direct DOM) | **~${Math.round(summary.bundleSize / 1024)} KB** | **${summary.documentationMetrics.hydrationTime}** | **${summary.documentationMetrics.domUpdate}** | **${summary.documentationMetrics.memory}** |
\`\`\`

---

## Detailed Benchmark Results

### Create Operations

| Operation | Duration | Rows |
|-----------|----------|------|
${createOps.map((r) => `| ${r.name} | ${formatMs(r.duration)} | ${r.rows?.toLocaleString() || "-"} |`).join("\n")}

### Update Operations

| Operation | Duration | Rows Affected |
|-----------|----------|---------------|
${updateOps.map((r) => `| ${r.name} | ${formatMs(r.duration)} | ${r.rows?.toLocaleString() || "-"} |`).join("\n")}

### DOM Manipulation Operations

| Operation | Duration |
|-----------|----------|
${manipulateOps.map((r) => `| ${r.name} | ${formatMs(r.duration)} |`).join("\n")}

### Memory Usage

Memory is measured by comparing Eleva-managed DOM against an identical pure DOM structure (no framework).
This isolates Eleva's actual overhead: signals, component state, watchers, and internal data structures.

| Rows | Pure DOM (MB) | With Eleva (MB) | **Eleva Overhead** |
|------|---------------|-----------------|-------------------|
| 1,000 | ${pureDom1k.toFixed(2)} | ${memoryAfter1k?.memory?.toFixed(2) || "-"} | **${elevaOverhead1k.toFixed(2)} MB** |
| 10,000 | ${pureDom10k.toFixed(2)} | ${memoryAfter10k?.memory?.toFixed(2) || "-"} | **${elevaOverhead10k.toFixed(2)} MB** |

**Per-row overhead**: ~${((elevaOverhead1k / 1000) * 1024).toFixed(1)} KB/row (1k) | ~${((elevaOverhead10k / 10000) * 1024).toFixed(1)} KB/row (10k)

---

## Methodology

This benchmark follows the [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) methodology:

| Parameter | Value |
|-----------|-------|
| **Warmup Runs** | ${WARMUP_RUNS} |
| **Measured Runs** | ${BENCHMARK_RUNS} |
| **Primary Metric** | Median (outliers removed via IQR) |
| **Row Structure** | \`{ id: number, label: string }\` |
| **Label Generation** | Random adjective + colour + noun |

### Operations Tested

1. **Create rows** - Build DOM from scratch with N rows
2. **Replace all** - Replace entire dataset with new rows
3. **Partial update** - Update every 10th row's label
4. **Select row** - Add "selected" class to one row
5. **Swap rows** - Swap rows at index 1 and 998
6. **Remove row** - Delete single row from middle
7. **Append rows** - Add 1,000 rows to existing 1,000
8. **Clear rows** - Remove all rows from DOM

### Memory Measurement Methodology

Unlike arbitrary estimation, this benchmark measures Eleva's **actual memory overhead**:

1. **Pure DOM Baseline**: Create identical table structure using only native DOM APIs (no framework)
2. **Eleva Measurement**: Create same structure using Eleva's reactive system
3. **Overhead Calculation**: \`Eleva Memory - Pure DOM Memory = Eleva Overhead\`

This methodology isolates what Eleva actually adds to memory:
- Signal objects and their subscriptions
- Component instances and state
- Template compilation cache
- Internal watchers and effect tracking

**Note**: Tests run in happy-dom (Node.js DOM simulation). Actual browser memory characteristics may differ, but the relative overhead measurement remains valid.

---

## Raw Data

\`\`\`json
${JSON.stringify(summary, null, 2)}
\`\`\`

---

*Generated by Eleva.js js-framework-benchmark suite*
`;
}

// ============================================================================
// Test Suite
// ============================================================================

describe("js-framework-benchmark Style Performance Test", () => {
  let app: any;
  let container: HTMLElement;
  let rowsSignal: any;
  let selectedSignal: any;

  beforeAll(() => {
    // Ensure results directory exists
    if (!fs.existsSync(RESULTS_DIR)) {
      fs.mkdirSync(RESULTS_DIR, { recursive: true });
    }

    // Get baseline memory
    if (typeof Bun !== "undefined" && Bun.gc) {
      Bun.gc(true);
    }
    baselineMemory = getMemoryMB();
    console.log(`\nBaseline memory: ${baselineMemory.toFixed(2)} MB\n`);
  });

  beforeEach(() => {
    resetId();
    document.body.innerHTML = `<div id="app"></div>`;
    container = document.getElementById("app")!;
    app = new Eleva("BenchmarkApp");

    // Register the benchmark component (similar to js-framework-benchmark structure)
    app.component("benchmark-table", {
      setup: ({ signal }: any) => {
        rowsSignal = signal([]);
        selectedSignal = signal(null);

        return {
          rows: rowsSignal,
          selected: selectedSignal,
          // Operations
          run: () => {
            rowsSignal.value = buildData(ROWS_1K);
          },
          runLots: () => {
            rowsSignal.value = buildData(ROWS_10K);
          },
          add: () => {
            rowsSignal.value = [...rowsSignal.value, ...buildData(ROWS_1K)];
          },
          update: () => {
            const newRows = [...rowsSignal.value];
            for (let i = 0; i < newRows.length; i += 10) {
              newRows[i] = { ...newRows[i], label: newRows[i].label + " !!!" };
            }
            rowsSignal.value = newRows;
          },
          clear: () => {
            rowsSignal.value = [];
          },
          swapRows: () => {
            if (rowsSignal.value.length > 998) {
              const newRows = [...rowsSignal.value];
              const temp = newRows[1];
              newRows[1] = newRows[998];
              newRows[998] = temp;
              rowsSignal.value = newRows;
            }
          },
          select: (id: number) => {
            selectedSignal.value = id;
          },
          remove: (id: number) => {
            rowsSignal.value = rowsSignal.value.filter((r: Row) => r.id !== id);
          },
        };
      },
      template: (ctx: any) => `
        <table class="table table-hover table-striped test-data">
          <tbody>
            ${ctx.rows.value
              .map(
                (row: Row) => `
              <tr key="${row.id}" class="${ctx.selected.value === row.id ? "danger" : ""}" data-id="${row.id}">
                <td class="col-md-1">${row.id}</td>
                <td class="col-md-4">
                  <a class="lbl">${row.label}</a>
                </td>
                <td class="col-md-1">
                  <a class="remove">
                    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                  </a>
                </td>
                <td class="col-md-6"></td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `,
    });
  });

  describe("Create Operations", () => {
    test("create 1,000 rows", async () => {
      console.log("\n📊 Create Operations");

      const result = await measureOperation("create 1k", async () => {
        resetId();
        document.body.innerHTML = `<div id="bench"></div>`;
        const c = document.getElementById("bench")!;
        const a = new Eleva("Create1K");
        let sig: any;
        a.component("table", {
          setup: ({ signal }: any) => {
            sig = signal([]);
            return { rows: sig };
          },
          template: (ctx: any) =>
            `<table><tbody>${ctx.rows.value.map((r: Row) => `<tr key="${r.id}"><td>${r.id}</td><td>${r.label}</td></tr>`).join("")}</tbody></table>`,
        });
        await a.mount(c, "table");
        sig.value = buildData(ROWS_1K);
        await new Promise((r) => setTimeout(r, 0)); // Let DOM update
      });

      recordResult("create 1,000 rows", "create", result.median, undefined, ROWS_1K);
      expect(result.median).toBeLessThan(500); // Should complete in under 500ms
    });

    test("create 10,000 rows", async () => {
      const result = await measureOperation("create 10k", async () => {
        resetId();
        document.body.innerHTML = `<div id="bench"></div>`;
        const c = document.getElementById("bench")!;
        const a = new Eleva("Create10K");
        let sig: any;
        a.component("table", {
          setup: ({ signal }: any) => {
            sig = signal([]);
            return { rows: sig };
          },
          template: (ctx: any) =>
            `<table><tbody>${ctx.rows.value.map((r: Row) => `<tr key="${r.id}"><td>${r.id}</td><td>${r.label}</td></tr>`).join("")}</tbody></table>`,
        });
        await a.mount(c, "table");
        sig.value = buildData(ROWS_10K);
        await new Promise((r) => setTimeout(r, 0));
      });

      recordResult("create 10,000 rows", "create", result.median, undefined, ROWS_10K);
      expect(result.median).toBeLessThan(5000); // Should complete in under 5s
    });

    test("append 1,000 rows to 1,000", async () => {
      // Setup initial 1000 rows
      await app.mount(container, "benchmark-table");
      rowsSignal.value = buildData(ROWS_1K);
      await new Promise((r) => setTimeout(r, 50));

      // Use fewer runs for this expensive operation
      const result = await measureOperation("append 1k", async () => {
        rowsSignal.value = [...rowsSignal.value, ...buildData(ROWS_1K)];
        await new Promise((r) => setTimeout(r, 0));
      }, 3); // Only 3 runs instead of 5

      recordResult("append 1,000 rows to 1,000", "create", result.median, undefined, ROWS_1K);
      // Note: Eleva re-renders full list on updates (no virtual DOM diffing)
      expect(result.median).toBeLessThan(2000);
    }, 15000); // 15 second timeout
  });

  describe("Update Operations", () => {
    test("replace all 1,000 rows", async () => {
      console.log("\n🔄 Update Operations");

      await app.mount(container, "benchmark-table");
      rowsSignal.value = buildData(ROWS_1K);
      await new Promise((r) => setTimeout(r, 50));

      const result = await measureOperation("replace all", async () => {
        rowsSignal.value = buildData(ROWS_1K);
        await new Promise((r) => setTimeout(r, 0));
      });

      recordResult("replace all 1,000 rows", "update", result.median, undefined, ROWS_1K);
      expect(result.median).toBeLessThan(500);
    });

    test("partial update (every 10th row)", async () => {
      await app.mount(container, "benchmark-table");
      rowsSignal.value = buildData(ROWS_1K);
      await new Promise((r) => setTimeout(r, 50));

      const result = await measureOperation("partial update", async () => {
        const newRows = [...rowsSignal.value];
        for (let i = 0; i < newRows.length; i += 10) {
          newRows[i] = { ...newRows[i], label: newRows[i].label + " !!!" };
        }
        rowsSignal.value = newRows;
        await new Promise((r) => setTimeout(r, 0));
      });

      recordResult("partial update (every 10th row)", "update", result.median, undefined, 100);
      expect(result.median).toBeLessThan(200);
    });
  });

  describe("DOM Manipulation Operations", () => {
    test("select row", async () => {
      console.log("\n🎯 DOM Manipulation Operations");

      await app.mount(container, "benchmark-table");
      rowsSignal.value = buildData(ROWS_1K);
      await new Promise((r) => setTimeout(r, 50));

      const result = await measureOperation("select row", async () => {
        selectedSignal.value = rowsSignal.value[500].id;
        await new Promise((r) => setTimeout(r, 0));
      });

      recordResult("select row", "manipulate", result.median);
      expect(result.median).toBeLessThan(100);
    });

    test("swap rows", async () => {
      await app.mount(container, "benchmark-table");
      rowsSignal.value = buildData(ROWS_1K);
      await new Promise((r) => setTimeout(r, 50));

      const result = await measureOperation("swap rows", async () => {
        const newRows = [...rowsSignal.value];
        const temp = newRows[1];
        newRows[1] = newRows[998];
        newRows[998] = temp;
        rowsSignal.value = newRows;
        await new Promise((r) => setTimeout(r, 0));
      });

      recordResult("swap rows (1 ↔ 998)", "manipulate", result.median);
      expect(result.median).toBeLessThan(200);
    });

    test("remove row", async () => {
      await app.mount(container, "benchmark-table");
      rowsSignal.value = buildData(ROWS_1K);
      await new Promise((r) => setTimeout(r, 50));

      const result = await measureOperation("remove row", async () => {
        const idToRemove = rowsSignal.value[500].id;
        rowsSignal.value = rowsSignal.value.filter((r: Row) => r.id !== idToRemove);
        await new Promise((r) => setTimeout(r, 0));
      });

      recordResult("remove row", "manipulate", result.median);
      expect(result.median).toBeLessThan(200);
    });

    test("clear all rows", async () => {
      await app.mount(container, "benchmark-table");
      rowsSignal.value = buildData(ROWS_1K);
      await new Promise((r) => setTimeout(r, 50));

      const result = await measureOperation("clear rows", async () => {
        rowsSignal.value = [];
        await new Promise((r) => setTimeout(r, 0));
      });

      recordResult("clear all rows", "manipulate", result.median);
      expect(result.median).toBeLessThan(100);
    });
  });

  describe("Memory Usage", () => {
    test("pure DOM baseline (1,000 rows) - no framework", async () => {
      console.log("\n💾 Memory Measurements");
      console.log("  Measuring pure DOM baseline (no framework)...");

      // Create identical DOM structure WITHOUT Eleva to establish baseline
      resetId();
      document.body.innerHTML = `<div id="pure-dom-test"></div>`;
      const c = document.getElementById("pure-dom-test")!;
      const data = buildData(ROWS_1K);

      // Build DOM directly without any framework
      const table = document.createElement("table");
      table.className = "table table-hover table-striped test-data";
      const tbody = document.createElement("tbody");

      for (const row of data) {
        const tr = document.createElement("tr");
        tr.setAttribute("key", String(row.id));
        tr.setAttribute("data-id", String(row.id));

        const td1 = document.createElement("td");
        td1.className = "col-md-1";
        td1.textContent = String(row.id);

        const td2 = document.createElement("td");
        td2.className = "col-md-4";
        const a = document.createElement("a");
        a.className = "lbl";
        a.textContent = row.label;
        td2.appendChild(a);

        const td3 = document.createElement("td");
        td3.className = "col-md-1";
        const removeLink = document.createElement("a");
        removeLink.className = "remove";
        const span = document.createElement("span");
        span.className = "glyphicon glyphicon-remove";
        span.setAttribute("aria-hidden", "true");
        removeLink.appendChild(span);
        td3.appendChild(removeLink);

        const td4 = document.createElement("td");
        td4.className = "col-md-6";

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      c.appendChild(table);

      await new Promise((r) => setTimeout(r, 100));

      if (typeof Bun !== "undefined" && Bun.gc) {
        Bun.gc(true);
      }
      await new Promise((r) => setTimeout(r, 50));

      pureDomMemory1k = getMemoryMB();
      console.log(`  Pure DOM (1k rows): ${pureDomMemory1k.toFixed(2)} MB`);

      // Clean up
      document.body.innerHTML = "";

      expect(pureDomMemory1k).toBeGreaterThan(baselineMemory);
    });

    test("memory after 1,000 rows (with Eleva)", async () => {
      await app.mount(container, "benchmark-table");
      rowsSignal.value = buildData(ROWS_1K);
      await new Promise((r) => setTimeout(r, 100));

      if (typeof Bun !== "undefined" && Bun.gc) {
        Bun.gc(true);
      }
      await new Promise((r) => setTimeout(r, 50));

      const memory = getMemoryMB();
      const elevaOverhead = memory - pureDomMemory1k;

      console.log(`  Eleva + DOM (1k rows): ${memory.toFixed(2)} MB`);
      console.log(`  Eleva overhead: ${elevaOverhead.toFixed(2)} MB`);

      recordResult("memory after 1,000 rows", "memory", 0, memory, ROWS_1K);

      // Note: Overhead includes signal storage, template compilation, and reactive system
      // The threshold is set to ensure memory doesn't grow unboundedly
      expect(elevaOverhead).toBeLessThan(150);
    });

    test("pure DOM baseline (10,000 rows) - no framework", async () => {
      console.log("  Measuring pure DOM baseline 10k (no framework)...");

      resetId();
      document.body.innerHTML = `<div id="pure-dom-test-10k"></div>`;
      const c = document.getElementById("pure-dom-test-10k")!;
      const data = buildData(ROWS_10K);

      // Build DOM directly without any framework
      const table = document.createElement("table");
      const tbody = document.createElement("tbody");

      for (const row of data) {
        const tr = document.createElement("tr");
        tr.setAttribute("key", String(row.id));

        const td1 = document.createElement("td");
        td1.textContent = String(row.id);

        const td2 = document.createElement("td");
        td2.textContent = row.label;

        tr.appendChild(td1);
        tr.appendChild(td2);
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      c.appendChild(table);

      await new Promise((r) => setTimeout(r, 100));

      if (typeof Bun !== "undefined" && Bun.gc) {
        Bun.gc(true);
      }
      await new Promise((r) => setTimeout(r, 50));

      pureDomMemory10k = getMemoryMB();
      console.log(`  Pure DOM (10k rows): ${pureDomMemory10k.toFixed(2)} MB`);

      // Clean up
      document.body.innerHTML = "";

      expect(pureDomMemory10k).toBeGreaterThan(pureDomMemory1k);
    });

    test("memory after 10,000 rows (with Eleva)", async () => {
      resetId();
      document.body.innerHTML = `<div id="mem-test"></div>`;
      const c = document.getElementById("mem-test")!;
      const a = new Eleva("Memory10K");
      let sig: any;

      a.component("table", {
        setup: ({ signal }: any) => {
          sig = signal([]);
          return { rows: sig };
        },
        template: (ctx: any) =>
          `<table><tbody>${ctx.rows.value.map((r: Row) => `<tr key="${r.id}"><td>${r.id}</td><td>${r.label}</td></tr>`).join("")}</tbody></table>`,
      });

      await a.mount(c, "table");
      sig.value = buildData(ROWS_10K);
      await new Promise((r) => setTimeout(r, 100));

      if (typeof Bun !== "undefined" && Bun.gc) {
        Bun.gc(true);
      }
      await new Promise((r) => setTimeout(r, 50));

      const memory = getMemoryMB();
      const elevaOverhead = memory - pureDomMemory10k;

      console.log(`  Eleva + DOM (10k rows): ${memory.toFixed(2)} MB`);
      console.log(`  Eleva overhead: ${elevaOverhead.toFixed(2)} MB`);

      recordResult("memory after 10,000 rows", "memory", 0, memory, ROWS_10K);

      // Note: Overhead should scale roughly linearly with rows
      // The threshold is set to ensure memory doesn't grow unboundedly
      expect(elevaOverhead).toBeLessThan(500);
    });
  });

  afterAll(() => {
    // Get bundle size
    const umdMinPath = path.join(process.cwd(), "dist/eleva.umd.min.js");
    let bundleSize = 0;
    if (fs.existsSync(umdMinPath)) {
      const content = fs.readFileSync(umdMinPath);
      bundleSize = gzipSync(content).length;
    }

    // Get version
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8")
    );

    // Calculate documentation metrics
    const create1k = benchmarkResults.find((r) => r.name === "create 1,000 rows");
    const partialUpdate = benchmarkResults.find((r) => r.name === "partial update (every 10th row)");
    const memory1k = benchmarkResults.find((r) => r.name === "memory after 1,000 rows");

    // Format for documentation (comparable to other frameworks)
    const hydrationTime = create1k
      ? create1k.duration < 10
        ? "< 10"
        : create1k.duration < 50
          ? "10-50"
          : create1k.duration < 100
            ? "50-100"
            : `${Math.round(create1k.duration)}`
      : "N/A";

    const domUpdateTime = partialUpdate
      ? partialUpdate.duration < 5
        ? "< 5"
        : partialUpdate.duration < 10
          ? "5-10"
          : partialUpdate.duration < 20
            ? "10-20"
            : `${Math.round(partialUpdate.duration)}`
      : "N/A";

    // Calculate Eleva's actual memory overhead by comparing against pure DOM baseline
    // This measures what Eleva adds: signals, component state, watchers, etc.
    const elevaOverhead1k = memory1k && pureDomMemory1k > 0
      ? memory1k.memory! - pureDomMemory1k
      : 0;

    // Calculate 10k overhead
    const memory10k = benchmarkResults.find((r) => r.name === "memory after 10,000 rows");
    const elevaOverhead10k = memory10k && pureDomMemory10k > 0
      ? memory10k.memory! - pureDomMemory10k
      : 0;

    // Format memory for documentation (actual measured overhead)
    const memoryUsage = memory1k && pureDomMemory1k > 0
      ? elevaOverhead1k < 0.5
        ? "< 0.5"
        : elevaOverhead1k < 1
          ? "< 1"
          : elevaOverhead1k < 2
            ? "1-2"
            : elevaOverhead1k < 5
              ? "2-5"
              : `~${Math.round(elevaOverhead1k)}`
      : "N/A";

    const summary: BenchmarkSummary = {
      version: packageJson.version,
      timestamp: new Date().toISOString(),
      runtime: `Bun ${Bun.version}`,
      platform: `${process.platform} ${process.arch}`,
      bundleSize,
      results: benchmarkResults,
      memoryBaselines: {
        pureDom1k: pureDomMemory1k,
        pureDom10k: pureDomMemory10k,
        elevaOverhead1k,
        elevaOverhead10k,
      },
      documentationMetrics: {
        bundleSize: `~${Math.round(bundleSize / 1024)} KB`,
        hydrationTime,
        domUpdate: domUpdateTime,
        memory: memoryUsage,
      },
    };

    // Save JSON
    fs.writeFileSync(JSON_FILE, JSON.stringify(summary, null, 2));

    // Generate and save report
    const report = generateReport(summary, pureDomMemory1k, pureDomMemory10k);
    fs.writeFileSync(REPORT_FILE, report);

    // Print summary
    console.log("\n" + "═".repeat(70));
    console.log("📊 JS-FRAMEWORK-BENCHMARK STYLE RESULTS");
    console.log("═".repeat(70));

    console.log("\n📈 Key Metrics (comparable to other frameworks):\n");
    console.log(`  Bundle Size:     ${formatBytes(bundleSize)} (min+gzip)`);
    console.log(`  Create 1k rows:  ${create1k ? formatMs(create1k.duration) : "N/A"}`);
    console.log(`  Partial update:  ${partialUpdate ? formatMs(partialUpdate.duration) : "N/A"}`);
    console.log(`  Memory (1k):     ${elevaOverhead1k.toFixed(2)} MB (Eleva overhead vs pure DOM)`);
    console.log(`    Pure DOM:      ${pureDomMemory1k.toFixed(2)} MB`);
    console.log(`    With Eleva:    ${memory1k ? memory1k.memory!.toFixed(2) : "N/A"} MB`);

    console.log("\n" + "─".repeat(70));
    console.log("\n📝 For documentation table:\n");
    console.log(`| **Eleva** (Direct DOM) | **${summary.documentationMetrics.bundleSize}** | **${summary.documentationMetrics.hydrationTime}** | **${summary.documentationMetrics.domUpdate}** | **${summary.documentationMetrics.memory}** |`);

    console.log("\n" + "─".repeat(70));
    console.log(`\nResults saved to:`);
    console.log(`  Report: ${REPORT_FILE}`);
    console.log(`  JSON:   ${JSON_FILE}`);
    console.log("\n" + "═".repeat(70));
  });
});
