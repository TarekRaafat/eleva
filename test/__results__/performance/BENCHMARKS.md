# Eleva.js Performance Benchmarks

> **Current Version:** 1.0.0-rc.13 | **Generated:** 09/01/2026 at 06:03 PM (GMT +0) | **Platform:** darwin arm64 | **Runtime:** Bun 1.3.5

> **Note:** Initial baseline (1.2.5-alpha) used legacy methodology (single run, Jest/Node.js). Current tests use improved methodology (10 runs, warm-up, outlier removal).

## Overview

| Metric | Value |
|--------|-------|
| **Benchmarks Passed** | 8/8 (100%) |
| **Performance Health** | Excellent |
| **Versions Tracked** | 19 |
| **Initial Baseline** | 1.2.5-alpha (legacy) |

## Legend

| Symbol | Meaning |
|--------|---------|
| ↑ | Improved (faster than before) |
| ↓ | Degraded (slower than before) |
| → | Stable (within ±10%) |
| — | No comparison data |

## Summary

| Benchmark | Current (1.0.0-rc.13) | Previous (1.0.0-rc.12) | Initial (1.2.5-alpha) | Trend | Change |
|-----------|---------|----------|---------|-------|--------|
| Framework Instantiation | 4.21µs | 1.52µs | 40.00µs | ↓ | +176.7% |
| Component Registration (×10) | 4.67µs | 4.75µs | 550.00µs | → | -1.7% |
| Component Mount | 31.58µs | 39.13µs | 2.67ms | ↑ | -19.3% |
| Reactive Updates (×100) | 5.92µs | 18.98µs | 140.00µs | ↑ | -68.8% |
| Lifecycle Cycles (×10) | 234.63µs | 182.25µs | — | ↓ | +28.7% |
| Event Handling (×50) | 129.50µs | 273.83µs | 1.41ms | ↑ | -52.7% |
| Large List Update (500 items) | 16.73µs | 14.17µs | 290.00µs | ↓ | +18.1% |
| Complex Template (50×5) | 12.29µs | 13.00µs | 160.00µs | → | -5.4% |


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
| **Median** | 4.21µs |
| **Mean** | 5.37µs |
| **Std Dev** | 4.16µs |
| **Range** | 2.17µs – 15.75µs |
| **CV** | 77.4% |
| **Runs** | 9 |
| **Ops/Run** | 1 |
| **Budget** | < 10.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 1.52µs → 4.21µs (↓ +176.7%)
- vs Initial: 40.00µs → 4.21µs (↑ -89.5%)

### Component Registration (×10)

| Metric | Value |
|--------|-------|
| **Median** | 4.67µs |
| **Mean** | 4.88µs |
| **Std Dev** | 986.23ns |
| **Range** | 3.54µs – 6.46µs |
| **CV** | 20.2% |
| **Runs** | 10 |
| **Ops/Run** | 10 |
| **Budget** | < 20.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 4.75µs → 4.67µs (→ -1.7%)
- vs Initial: 550.00µs → 4.67µs (↑ -99.2%)

### Component Mount

| Metric | Value |
|--------|-------|
| **Median** | 31.58µs |
| **Mean** | 31.14µs |
| **Std Dev** | 3.66µs |
| **Range** | 26.67µs – 39.42µs |
| **CV** | 11.7% |
| **Runs** | 9 |
| **Ops/Run** | 1 |
| **Budget** | < 20.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 39.13µs → 31.58µs (↑ -19.3%)
- vs Initial: 2.67ms → 31.58µs (↑ -98.8%)

### Reactive Updates (×100)

| Metric | Value |
|--------|-------|
| **Median** | 5.92µs |
| **Mean** | 8.79µs |
| **Std Dev** | 4.62µs |
| **Range** | 4.75µs – 18.33µs |
| **CV** | 52.5% |
| **Runs** | 9 |
| **Ops/Run** | 100 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 18.98µs → 5.92µs (↑ -68.8%)
- vs Initial: 140.00µs → 5.92µs (↑ -95.8%)

### Lifecycle Cycles (×10)

| Metric | Value |
|--------|-------|
| **Median** | 234.63µs |
| **Mean** | 237.55µs |
| **Std Dev** | 19.10µs |
| **Range** | 218.88µs – 270.92µs |
| **CV** | 8.0% |
| **Runs** | 9 |
| **Ops/Run** | 10 |
| **Budget** | < 100.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 182.25µs → 234.63µs (↓ +28.7%)
- vs Initial: No initial data

### Event Handling (×50)

| Metric | Value |
|--------|-------|
| **Median** | 129.50µs |
| **Mean** | 191.67µs |
| **Std Dev** | 87.50µs |
| **Range** | 108.50µs – 330.25µs |
| **CV** | 45.6% |
| **Runs** | 9 |
| **Ops/Run** | 50 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 273.83µs → 129.50µs (↑ -52.7%)
- vs Initial: 1.41ms → 129.50µs (↑ -90.8%)

### Large List Update (500 items)

| Metric | Value |
|--------|-------|
| **Median** | 16.73µs |
| **Mean** | 17.79µs |
| **Std Dev** | 2.69µs |
| **Range** | 15.08µs – 22.63µs |
| **CV** | 15.1% |
| **Runs** | 10 |
| **Ops/Run** | 500 |
| **Budget** | < 100.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 14.17µs → 16.73µs (↓ +18.1%)
- vs Initial: 290.00µs → 16.73µs (↑ -94.2%)

### Complex Template (50×5)

| Metric | Value |
|--------|-------|
| **Median** | 12.29µs |
| **Mean** | 12.92µs |
| **Std Dev** | 2.15µs |
| **Range** | 10.21µs – 16.17µs |
| **CV** | 16.6% |
| **Runs** | 9 |
| **Ops/Run** | 250 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 13.00µs → 12.29µs (→ -5.4%)
- vs Initial: 160.00µs → 12.29µs (↑ -92.3%)



## Version History

| Version | Date | Avg. Median | Methodology |
|---------|------|-------------|-------------|
| 1.0.0-rc.13 | 1/9/2026 | 54.94µs | Standard |
| 1.0.0-rc.12 | 1/9/2026 | 68.45µs | Standard |
| 1.0.0-rc.11 | 1/5/2026 | 72.24µs | Standard |
| 1.0.0-rc.10 | 1/3/2026 | 56.50µs | Standard |
| 1.0.0-rc.1 | 6/18/2025 | 738.57µs | Legacy |
| 1.2.19-beta | 6/2/2025 | 735.71µs | Legacy |
| 1.2.18-beta | 6/1/2025 | 707.14µs | Legacy |
| 1.2.17-beta | 5/25/2025 | 720.00µs | Legacy |
| 1.2.16-beta | 5/24/2025 | 751.43µs | Legacy |
| 1.2.5-alpha *(initial)* | 4/25/2025 | 751.43µs | Legacy |


---

*Lower times are better. CV (Coefficient of Variation) < 50% indicates consistent measurements.*

*Report generated automatically by the Eleva.js benchmark suite.*
