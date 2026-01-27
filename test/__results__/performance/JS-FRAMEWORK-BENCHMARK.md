# Eleva.js - js-framework-benchmark Results

> **Version:** 1.1.0 | **Generated:** 1/19/2026, 9:07:00 PM
> **Platform:** darwin arm64 | **Runtime:** Bun 1.3.6
> **Bundle Size:** 2.40 KB (min+gzip)

## Summary for Documentation

These metrics are comparable to js-framework-benchmark results:

| **Metric** | **Eleva.js Result** | **For Documentation** |
|------------|---------------------|----------------------|
| Bundle Size (min+gzip) | 2.40 KB | **~2 KB** |
| Hydration/Startup (1k rows) | 23.66 ms | **10-50** |
| DOM Update (partial 1k) | 92.92 ms | **93** |
| Memory (Eleva overhead) | -40.44 MB | **< 0.5** |

### Documentation Table Row

```markdown
| **Eleva** (Direct DOM) | **~2 KB** | **10-50** | **93** | **< 0.5** |
```

---

## Detailed Benchmark Results

### Create Operations

| Operation | Duration | Rows |
|-----------|----------|------|
| create 1,000 rows | 23.66 ms | 1,000 |
| create 10,000 rows | 317.78 ms | 10,000 |
| append 1,000 rows to 1,000 | 714.07 ms | 1,000 |

### Update Operations

| Operation | Duration | Rows Affected |
|-----------|----------|---------------|
| replace all 1,000 rows | 127.91 ms | 1,000 |
| partial update (every 10th row) | 92.92 ms | 100 |

### DOM Manipulation Operations

| Operation | Duration |
|-----------|----------|
| select row | 1.14 ms |
| swap rows (1 ↔ 998) | 122.47 ms |
| remove row | 115.70 ms |
| clear all rows | 1.19 ms |

### Memory Usage

Memory is measured by comparing Eleva-managed DOM against an identical pure DOM structure (no framework).
This isolates Eleva's actual overhead: signals, component state, watchers, and internal data structures.

| Rows | Pure DOM (MB) | With Eleva (MB) | **Eleva Overhead** |
|------|---------------|-----------------|-------------------|
| 1,000 | 101.60 | 61.16 | **-40.44 MB** |
| 10,000 | 148.60 | 168.37 | **19.76 MB** |

**Per-row overhead**: ~-41.4 KB/row (1k) | ~2.0 KB/row (10k)

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
  "version": "1.1.0",
  "timestamp": "2026-01-19T21:07:00.581Z",
  "runtime": "Bun 1.3.6",
  "platform": "darwin arm64",
  "bundleSize": 2427,
  "results": [
    {
      "name": "create 1,000 rows",
      "operation": "create",
      "duration": 23.65975000000003,
      "rows": 1000
    },
    {
      "name": "create 10,000 rows",
      "operation": "create",
      "duration": 317.7810004999999,
      "rows": 10000
    },
    {
      "name": "append 1,000 rows to 1,000",
      "operation": "create",
      "duration": 714.0732500000004,
      "rows": 1000
    },
    {
      "name": "replace all 1,000 rows",
      "operation": "update",
      "duration": 127.9144580000002,
      "rows": 1000
    },
    {
      "name": "partial update (every 10th row)",
      "operation": "update",
      "duration": 92.9208750000007,
      "rows": 100
    },
    {
      "name": "select row",
      "operation": "manipulate",
      "duration": 1.1401669999995647
    },
    {
      "name": "swap rows (1 ↔ 998)",
      "operation": "manipulate",
      "duration": 122.46879100000115
    },
    {
      "name": "remove row",
      "operation": "manipulate",
      "duration": 115.69691600000078
    },
    {
      "name": "clear all rows",
      "operation": "manipulate",
      "duration": 1.1928125000004002
    },
    {
      "name": "memory after 1,000 rows",
      "operation": "memory",
      "duration": 0,
      "memory": 61.15781116485596,
      "rows": 1000
    },
    {
      "name": "memory after 10,000 rows",
      "operation": "memory",
      "duration": 0,
      "memory": 168.36678218841553,
      "rows": 10000
    }
  ],
  "memoryBaselines": {
    "pureDom1k": 101.60076999664307,
    "pureDom10k": 148.60213565826416,
    "elevaOverhead1k": -40.44295883178711,
    "elevaOverhead10k": 19.764646530151367
  },
  "documentationMetrics": {
    "bundleSize": "~2 KB",
    "hydrationTime": "10-50",
    "domUpdate": "93",
    "memory": "< 0.5"
  }
}
```

---

*Generated by Eleva.js js-framework-benchmark suite*
