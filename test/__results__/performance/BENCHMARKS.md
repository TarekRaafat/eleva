# Eleva.js Performance Benchmarks

> **Current Version:** 1.0.0-rc.10 | **Generated:** 02/01/2026 at 09:49 PM (GMT +0) | **Platform:** darwin arm64 | **Runtime:** Bun 1.3.5

> **Note:** Initial baseline (1.2.5-alpha) used legacy methodology (single run, Jest/Node.js). Current tests use improved methodology (10 runs, warm-up, outlier removal).

## Overview

| Metric | Value |
|--------|-------|
| **Benchmarks Passed** | 8/8 (100%) |
| **Performance Health** | Excellent |
| **Versions Tracked** | 16 |
| **Initial Baseline** | 1.2.5-alpha (legacy) |

## Legend

| Symbol | Meaning |
|--------|---------|
| ↑ | Improved (faster than before) |
| ↓ | Degraded (slower than before) |
| → | Stable (within ±10%) |
| — | No comparison data |

## Summary

| Benchmark | Current (1.0.0-rc.10) | Previous (1.0.0-rc.1) | Initial (1.2.5-alpha) | Trend | Change |
|-----------|---------|----------|---------|-------|--------|
| Framework Instantiation | 4.79µs | 40.00µs | 40.00µs | ↑ | -88.0% |
| Component Registration (×10) | 9.12µs | 650.00µs | 550.00µs | ↑ | -98.6% |
| Component Mount | 119.29µs | 2.56ms | 2.67ms | ↑ | -95.3% |
| Reactive Updates (×100) | 3.21µs | 140.00µs | 140.00µs | ↑ | -97.7% |
| Lifecycle Cycles (×10) | 293.00µs | — | — | — | baseline |
| Event Handling (×50) | 208.56µs | 1.35ms | 1.41ms | ↑ | -84.6% |
| Large List Update (500 items) | 18.12µs | 270.00µs | 290.00µs | ↑ | -93.3% |
| Complex Template (50×5) | 9.88µs | 160.00µs | 160.00µs | ↑ | -93.8% |


## Methodology

| Parameter | Value |
|-----------|-------|
| **Warm-up Runs** | 3 (excluded from results) |
| **Measured Runs** | 10 per benchmark |
| **Outlier Removal** | >2 standard deviations |
| **Primary Metric** | Median (robust to outliers) |
| **Test Target** | Production build (`dist/eleva.esm.js`) |

## Detailed Results

### Framework Instantiation

| Metric | Value |
|--------|-------|
| **Median** | 4.79µs |
| **Mean** | 4.82µs |
| **Std Dev** | 207.74ns |
| **Range** | 4.58µs – 5.21µs |
| **CV** | 4.3% |
| **Runs** | 9 |
| **Ops/Run** | 1 |
| **Budget** | < 10.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 40.00µs → 4.79µs (↑ -88.0%)
- vs Initial: 40.00µs → 4.79µs (↑ -88.0%)

### Component Registration (×10)

| Metric | Value |
|--------|-------|
| **Median** | 9.12µs |
| **Mean** | 8.94µs |
| **Std Dev** | 1.14µs |
| **Range** | 7.08µs – 10.46µs |
| **CV** | 12.8% |
| **Runs** | 10 |
| **Ops/Run** | 10 |
| **Budget** | < 20.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 650.00µs → 9.12µs (↑ -98.6%)
- vs Initial: 550.00µs → 9.12µs (↑ -98.3%)

### Component Mount

| Metric | Value |
|--------|-------|
| **Median** | 119.29µs |
| **Mean** | 123.14µs |
| **Std Dev** | 20.16µs |
| **Range** | 94.75µs – 156.92µs |
| **CV** | 16.4% |
| **Runs** | 9 |
| **Ops/Run** | 1 |
| **Budget** | < 20.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 2.56ms → 119.29µs (↑ -95.3%)
- vs Initial: 2.67ms → 119.29µs (↑ -95.5%)

### Reactive Updates (×100)

| Metric | Value |
|--------|-------|
| **Median** | 3.21µs |
| **Mean** | 5.18µs |
| **Std Dev** | 3.65µs |
| **Range** | 3.04µs – 13.04µs |
| **CV** | 70.6% |
| **Runs** | 9 |
| **Ops/Run** | 100 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 140.00µs → 3.21µs (↑ -97.7%)
- vs Initial: 140.00µs → 3.21µs (↑ -97.7%)

### Lifecycle Cycles (×10)

| Metric | Value |
|--------|-------|
| **Median** | 293.00µs |
| **Mean** | 291.93µs |
| **Std Dev** | 18.69µs |
| **Range** | 254.67µs – 311.92µs |
| **CV** | 6.4% |
| **Runs** | 9 |
| **Ops/Run** | 10 |
| **Budget** | < 100.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: No previous data
- vs Initial: No initial data

### Event Handling (×50)

| Metric | Value |
|--------|-------|
| **Median** | 208.56µs |
| **Mean** | 200.80µs |
| **Std Dev** | 67.07µs |
| **Range** | 102.88µs – 295.71µs |
| **CV** | 33.4% |
| **Runs** | 10 |
| **Ops/Run** | 50 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 1.35ms → 208.56µs (↑ -84.6%)
- vs Initial: 1.41ms → 208.56µs (↑ -85.2%)

### Large List Update (500 items)

| Metric | Value |
|--------|-------|
| **Median** | 18.12µs |
| **Mean** | 17.84µs |
| **Std Dev** | 1.07µs |
| **Range** | 16.12µs – 19.92µs |
| **CV** | 6.0% |
| **Runs** | 9 |
| **Ops/Run** | 500 |
| **Budget** | < 100.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 270.00µs → 18.12µs (↑ -93.3%)
- vs Initial: 290.00µs → 18.12µs (↑ -93.8%)

### Complex Template (50×5)

| Metric | Value |
|--------|-------|
| **Median** | 9.88µs |
| **Mean** | 10.88µs |
| **Std Dev** | 1.93µs |
| **Range** | 9.04µs – 13.63µs |
| **CV** | 17.8% |
| **Runs** | 10 |
| **Ops/Run** | 250 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 160.00µs → 9.88µs (↑ -93.8%)
- vs Initial: 160.00µs → 9.88µs (↑ -93.8%)



## Version History

| Version | Date | Avg. Median | Methodology |
|---------|------|-------------|-------------|
| 1.0.0-rc.10 | 1/2/2026 | 83.25µs | Standard |
| 1.0.0-rc.1 | 6/18/2025 | 738.57µs | Legacy |
| 1.2.19-beta | 6/2/2025 | 735.71µs | Legacy |
| 1.2.18-beta | 6/1/2025 | 707.14µs | Legacy |
| 1.2.17-beta | 5/25/2025 | 720.00µs | Legacy |
| 1.2.16-beta | 5/24/2025 | 751.43µs | Legacy |
| 1.2.15-beta | 5/18/2025 | 1.40ms | Legacy |
| 1.2.14-beta | 5/16/2025 | 1.50ms | Legacy |
| 1.2.13-alpha | 5/11/2025 | 1.43ms | Legacy |
| 1.2.5-alpha *(initial)* | 4/25/2025 | 751.43µs | Legacy |


---

*Lower times are better. CV (Coefficient of Variation) < 50% indicates consistent measurements.*

*Report generated automatically by the Eleva.js benchmark suite.*
