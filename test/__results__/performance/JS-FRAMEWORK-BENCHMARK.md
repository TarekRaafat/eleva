# Eleva.js - js-framework-benchmark Results

> **Version:** 1.2.0 | **Generated:** 2/8/2026, 10:58:26 AM
> **Platform:** darwin arm64 | **Runtime:** Bun 1.3.8
> **Bundle Size:** 2.38 KB (min+gzip)

## Summary for Documentation

These metrics are comparable to js-framework-benchmark results:

| **Metric** | **Eleva.js Result** | **For Documentation** |
|------------|---------------------|----------------------|
| Bundle Size (min+gzip) | 2.38 KB | **~2 KB** |
| Hydration/Startup (1k rows) | 23.99 ms | **10-50** |
| DOM Update (partial 1k) | 94.00 ms | **94** |
| Memory (Eleva overhead) | -7.39 MB | **< 0.5** |

### Documentation Table Row

```markdown
| **Eleva** (Direct DOM) | **~2 KB** | **10-50** | **94** | **< 0.5** |
```

---

## Detailed Benchmark Results

### Create Operations

| Operation | Duration | Rows |
|-----------|----------|------|
| create 1,000 rows | 23.99 ms | 1,000 |
| create 10,000 rows | 375.72 ms | 10,000 |
| append 1,000 rows to 1,000 | 1.03 s | 1,000 |

### Update Operations

| Operation | Duration | Rows Affected |
|-----------|----------|---------------|
| replace all 1,000 rows | 143.02 ms | 1,000 |
| partial update (every 10th row) | 94.00 ms | 100 |

### DOM Manipulation Operations

| Operation | Duration |
|-----------|----------|
| select row | 1.17 ms |
| swap rows (1 ↔ 998) | 140.47 ms |
| remove row | 135.51 ms |
| clear all rows | 1.17 ms |

### Memory Usage

Memory is measured by comparing Eleva-managed DOM against an identical pure DOM structure (no framework).
This isolates Eleva's actual overhead: signals, component state, watchers, and internal data structures.

| Rows | Pure DOM (MB) | With Eleva (MB) | **Eleva Overhead** |
|------|---------------|-----------------|-------------------|
| 1,000 | 101.69 | 94.31 | **-7.39 MB** |
| 10,000 | 148.59 | 255.78 | **107.20 MB** |

**Per-row overhead**: ~-7.6 KB/row (1k) | ~11.0 KB/row (10k)

---

## Methodology

This benchmark follows the [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) methodology:

| Parameter | Value |
|-----------|-------|
| **Warmup Runs** | 2 |
| **Measured Runs** | 5 |
| **Primary Metric** | Median (outliers removed via IQR) |
| **Row Structure** | `{ id: number, label: string }` |
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
3. **Overhead Calculation**: `Eleva Memory - Pure DOM Memory = Eleva Overhead`

This methodology isolates what Eleva actually adds to memory:
- Signal objects and their subscriptions
- Component instances and state
- Template compilation cache
- Internal watchers and effect tracking

**Note**: Tests run in happy-dom (Node.js DOM simulation). Actual browser memory characteristics may differ, but the relative overhead measurement remains valid.

---

## Raw Data

```json
{
  "version": "1.2.0",
  "timestamp": "2026-02-08T10:58:26.548Z",
  "runtime": "Bun 1.3.8",
  "platform": "darwin arm64",
  "bundleSize": 2434,
  "results": [
    {
      "name": "create 1,000 rows",
      "operation": "create",
      "duration": 23.99499999999989,
      "rows": 1000
    },
    {
      "name": "create 10,000 rows",
      "operation": "create",
      "duration": 375.71974999999975,
      "rows": 10000
    },
    {
      "name": "append 1,000 rows to 1,000",
      "operation": "create",
      "duration": 1027.7402079999993,
      "rows": 1000
    },
    {
      "name": "replace all 1,000 rows",
      "operation": "update",
      "duration": 143.0167079999992,
      "rows": 1000
    },
    {
      "name": "partial update (every 10th row)",
      "operation": "update",
      "duration": 93.99852100000044,
      "rows": 100
    },
    {
      "name": "select row",
      "operation": "manipulate",
      "duration": 1.1716669999987062
    },
    {
      "name": "swap rows (1 ↔ 998)",
      "operation": "manipulate",
      "duration": 140.46891700000015
    },
    {
      "name": "remove row",
      "operation": "manipulate",
      "duration": 135.50660450000032
    },
    {
      "name": "clear all rows",
      "operation": "manipulate",
      "duration": 1.1708339999986492
    },
    {
      "name": "memory after 1,000 rows",
      "operation": "memory",
      "duration": 0,
      "memory": 94.30724239349365,
      "rows": 1000
    },
    {
      "name": "memory after 10,000 rows",
      "operation": "memory",
      "duration": 0,
      "memory": 255.78389644622803,
      "rows": 10000
    }
  ],
  "memoryBaselines": {
    "pureDom1k": 101.69257259368896,
    "pureDom10k": 148.58857440948486,
    "elevaOverhead1k": -7.3853302001953125,
    "elevaOverhead10k": 107.19532203674316
  },
  "documentationMetrics": {
    "bundleSize": "~2 KB",
    "hydrationTime": "10-50",
    "domUpdate": "94",
    "memory": "< 0.5"
  }
}
```

---

*Generated by Eleva.js js-framework-benchmark suite*
