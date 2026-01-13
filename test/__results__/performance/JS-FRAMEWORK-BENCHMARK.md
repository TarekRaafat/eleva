# Eleva.js - js-framework-benchmark Results

> **Version:** 1.0.0 | **Generated:** 1/13/2026, 6:10:29 AM
> **Platform:** darwin arm64 | **Runtime:** Bun 1.3.5
> **Bundle Size:** 2.33 KB (min+gzip)

## Summary for Documentation

These metrics are comparable to js-framework-benchmark results:

| **Metric** | **Eleva.js Result** | **For Documentation** |
|------------|---------------------|----------------------|
| Bundle Size (min+gzip) | 2.33 KB | **~2 KB** |
| Hydration/Startup (1k rows) | 24.48 ms | **10-50** |
| DOM Update (partial 1k) | 87.26 ms | **87** |
| Memory (Eleva overhead) | 18.97 MB | **~19** |

### Documentation Table Row

```markdown
| **Eleva** (Direct DOM) | **~2 KB** | **10-50** | **87** | **~19** |
```

---

## Detailed Benchmark Results

### Create Operations

| Operation | Duration | Rows |
|-----------|----------|------|
| create 1,000 rows | 24.48 ms | 1,000 |
| create 10,000 rows | 275.46 ms | 10,000 |
| append 1,000 rows to 1,000 | 614.44 ms | 1,000 |

### Update Operations

| Operation | Duration | Rows Affected |
|-----------|----------|---------------|
| replace all 1,000 rows | 128.19 ms | 1,000 |
| partial update (every 10th row) | 87.26 ms | 100 |

### DOM Manipulation Operations

| Operation | Duration |
|-----------|----------|
| select row | 1.15 ms |
| swap rows (1 ↔ 998) | 106.63 ms |
| remove row | 99.91 ms |
| clear all rows | 1.20 ms |

### Memory Usage

Memory is measured by comparing Eleva-managed DOM against an identical pure DOM structure (no framework).
This isolates Eleva's actual overhead: signals, component state, watchers, and internal data structures.

| Rows | Pure DOM (MB) | With Eleva (MB) | **Eleva Overhead** |
|------|---------------|-----------------|-------------------|
| 1,000 | 41.40 | 60.37 | **18.97 MB** |
| 10,000 | 147.83 | 167.06 | **19.23 MB** |

**Per-row overhead**: ~19.4 KB/row (1k) | ~2.0 KB/row (10k)

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
  "version": "1.0.0",
  "timestamp": "2026-01-13T06:10:29.142Z",
  "runtime": "Bun 1.3.5",
  "platform": "darwin arm64",
  "bundleSize": 2385,
  "results": [
    {
      "name": "create 1,000 rows",
      "operation": "create",
      "duration": 24.480999999999995,
      "rows": 1000
    },
    {
      "name": "create 10,000 rows",
      "operation": "create",
      "duration": 275.45908299999996,
      "rows": 10000
    },
    {
      "name": "append 1,000 rows to 1,000",
      "operation": "create",
      "duration": 614.4373329999999,
      "rows": 1000
    },
    {
      "name": "replace all 1,000 rows",
      "operation": "update",
      "duration": 128.1894169999996,
      "rows": 1000
    },
    {
      "name": "partial update (every 10th row)",
      "operation": "update",
      "duration": 87.25808400000005,
      "rows": 100
    },
    {
      "name": "select row",
      "operation": "manipulate",
      "duration": 1.154457999999977
    },
    {
      "name": "swap rows (1 ↔ 998)",
      "operation": "manipulate",
      "duration": 106.6313340000006
    },
    {
      "name": "remove row",
      "operation": "manipulate",
      "duration": 99.91381249999995
    },
    {
      "name": "clear all rows",
      "operation": "manipulate",
      "duration": 1.1958334999999352
    },
    {
      "name": "memory after 1,000 rows",
      "operation": "memory",
      "duration": 0,
      "memory": 60.36755561828613,
      "rows": 1000
    },
    {
      "name": "memory after 10,000 rows",
      "operation": "memory",
      "duration": 0,
      "memory": 167.05798053741455,
      "rows": 10000
    }
  ],
  "memoryBaselines": {
    "pureDom1k": 41.398436546325684,
    "pureDom10k": 147.8274850845337,
    "elevaOverhead1k": 18.96911907196045,
    "elevaOverhead10k": 19.23049545288086
  },
  "documentationMetrics": {
    "bundleSize": "~2 KB",
    "hydrationTime": "10-50",
    "domUpdate": "87",
    "memory": "~19"
  }
}
```

---

*Generated by Eleva.js js-framework-benchmark suite*
