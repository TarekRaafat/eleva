# Eleva.js Performance Benchmarks

> **Current Version:** 1.0.0 | **Generated:** 13/01/2026 at 06:10 AM (GMT +0) | **Platform:** darwin arm64 | **Runtime:** Bun 1.3.5

> **Note:** Initial baseline (1.2.5-alpha) used legacy methodology (single run, Jest/Node.js). Current tests use improved methodology (10 runs, warm-up, outlier removal).

## Overview

| Metric | Value |
|--------|-------|
| **Benchmarks Passed** | 8/8 (100%) |
| **Performance Health** | Excellent |
| **Versions Tracked** | 21 |
| **Initial Baseline** | 1.2.5-alpha (legacy) |

## Legend

| Symbol | Meaning |
|--------|---------|
| ↑ | Improved (faster than before) |
| ↓ | Degraded (slower than before) |
| → | Stable (within ±10%) |
| — | No comparison data |

## Summary

| Benchmark | Current (1.0.0) | Previous (1.0.0-rc.14) | Initial (1.2.5-alpha) | Trend | Change |
|-----------|---------|----------|---------|-------|--------|
| Framework Instantiation | 1.58µs | 1.37µs | 40.00µs | ↓ | +15.2% |
| Component Registration (×10) | 3.58µs | 3.33µs | 550.00µs | → | +7.5% |
| Component Mount | 31.33µs | 34.58µs | 2.67ms | → | -9.4% |
| Reactive Updates (×100) | 4.17µs | 6.62µs | 140.00µs | ↑ | -37.1% |
| Lifecycle Cycles (×10) | 224.17µs | 284.21µs | — | ↑ | -21.1% |
| Event Handling (×50) | 125.92µs | 154.42µs | 1.41ms | ↑ | -18.5% |
| Large List Update (500 items) | 13.87µs | 16.96µs | 290.00µs | ↑ | -18.2% |
| Complex Template (50×5) | 9.65µs | 10.33µs | 160.00µs | → | -6.7% |


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
| **Median** | 1.58µs |
| **Mean** | 1.83µs |
| **Std Dev** | 705.36ns |
| **Range** | 1.21µs – 3.54µs |
| **CV** | 38.6% |
| **Runs** | 9 |
| **Ops/Run** | 1 |
| **Budget** | < 10.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 1.37µs → 1.58µs (↓ +15.2%)
- vs Initial: 40.00µs → 1.58µs (↑ -96.0%)

### Component Registration (×10)

| Metric | Value |
|--------|-------|
| **Median** | 3.58µs |
| **Mean** | 3.83µs |
| **Std Dev** | 775.00ns |
| **Range** | 3.04µs – 5.50µs |
| **CV** | 20.2% |
| **Runs** | 9 |
| **Ops/Run** | 10 |
| **Budget** | < 20.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 3.33µs → 3.58µs (→ +7.5%)
- vs Initial: 550.00µs → 3.58µs (↑ -99.3%)

### Component Mount

| Metric | Value |
|--------|-------|
| **Median** | 31.33µs |
| **Mean** | 32.02µs |
| **Std Dev** | 2.98µs |
| **Range** | 26.46µs – 35.67µs |
| **CV** | 9.3% |
| **Runs** | 9 |
| **Ops/Run** | 1 |
| **Budget** | < 20.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 34.58µs → 31.33µs (→ -9.4%)
- vs Initial: 2.67ms → 31.33µs (↑ -98.8%)

### Reactive Updates (×100)

| Metric | Value |
|--------|-------|
| **Median** | 4.17µs |
| **Mean** | 8.28µs |
| **Std Dev** | 5.87µs |
| **Range** | 3.46µs – 19.87µs |
| **CV** | 70.9% |
| **Runs** | 10 |
| **Ops/Run** | 100 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 6.62µs → 4.17µs (↑ -37.1%)
- vs Initial: 140.00µs → 4.17µs (↑ -97.0%)

### Lifecycle Cycles (×10)

| Metric | Value |
|--------|-------|
| **Median** | 224.17µs |
| **Mean** | 230.25µs |
| **Std Dev** | 17.83µs |
| **Range** | 211.71µs – 265.71µs |
| **CV** | 7.7% |
| **Runs** | 10 |
| **Ops/Run** | 10 |
| **Budget** | < 100.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 284.21µs → 224.17µs (↑ -21.1%)
- vs Initial: No initial data

### Event Handling (×50)

| Metric | Value |
|--------|-------|
| **Median** | 125.92µs |
| **Mean** | 173.14µs |
| **Std Dev** | 73.11µs |
| **Range** | 99.67µs – 311.04µs |
| **CV** | 42.2% |
| **Runs** | 9 |
| **Ops/Run** | 50 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 154.42µs → 125.92µs (↑ -18.5%)
- vs Initial: 1.41ms → 125.92µs (↑ -91.1%)

### Large List Update (500 items)

| Metric | Value |
|--------|-------|
| **Median** | 13.87µs |
| **Mean** | 14.65µs |
| **Std Dev** | 4.18µs |
| **Range** | 10.46µs – 22.17µs |
| **CV** | 28.5% |
| **Runs** | 10 |
| **Ops/Run** | 500 |
| **Budget** | < 100.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 16.96µs → 13.87µs (↑ -18.2%)
- vs Initial: 290.00µs → 13.87µs (↑ -95.2%)

### Complex Template (50×5)

| Metric | Value |
|--------|-------|
| **Median** | 9.65µs |
| **Mean** | 10.13µs |
| **Std Dev** | 1.68µs |
| **Range** | 7.83µs – 12.67µs |
| **CV** | 16.5% |
| **Runs** | 10 |
| **Ops/Run** | 250 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 10.33µs → 9.65µs (→ -6.7%)
- vs Initial: 160.00µs → 9.65µs (↑ -94.0%)



## Version History

| Version | Date | Avg. Median | Methodology |
|---------|------|-------------|-------------|
| 1.0.0 | 1/13/2026 | 51.78µs | Standard |
| 1.0.0-rc.14 | 1/12/2026 | 63.98µs | Standard |
| 1.0.0-rc.13 | 1/10/2026 | 54.72µs | Standard |
| 1.0.0-rc.12 | 1/8/2026 | 73.93µs | Standard |
| 1.0.0-rc.11 | 1/5/2026 | 72.24µs | Standard |
| 1.0.0-rc.10 | 1/3/2026 | 56.50µs | Standard |
| 1.0.0-rc.1 | 6/18/2025 | 738.57µs | Legacy |
| 1.2.19-beta | 6/2/2025 | 735.71µs | Legacy |
| 1.2.18-beta | 6/1/2025 | 707.14µs | Legacy |
| 1.2.5-alpha *(initial)* | 4/25/2025 | 751.43µs | Legacy |


---

*Lower times are better. CV (Coefficient of Variation) < 50% indicates consistent measurements.*

*Report generated automatically by the Eleva.js benchmark suite.*
