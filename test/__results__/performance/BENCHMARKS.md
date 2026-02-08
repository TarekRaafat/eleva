# Eleva.js Performance Benchmarks

> **Current Version:** 1.2.0 | **Generated:** 08/02/2026 at 11:11 AM (GMT +0) | **Platform:** darwin arm64 | **Runtime:** Bun 1.3.8

> **Note:** Initial baseline (1.2.5-alpha) used legacy methodology (single run, Jest/Node.js). Current tests use improved methodology (10 runs, warm-up, outlier removal).

## Overview

| Metric | Value |
|--------|-------|
| **Benchmarks Passed** | 8/8 (100%) |
| **Performance Health** | Excellent |
| **Versions Tracked** | 23 |
| **Initial Baseline** | 1.2.5-alpha (legacy) |

## Legend

| Symbol | Meaning |
|--------|---------|
| ↑ | Improved (faster than before) |
| ↓ | Degraded (slower than before) |
| → | Stable (within ±10%) |
| — | No comparison data |

## Summary

| Benchmark | Current (1.2.0) | Previous (1.1.0) | Initial (1.2.5-alpha) | Trend | Change |
|-----------|---------|----------|---------|-------|--------|
| Framework Instantiation | 1.37µs | 1.37µs | 40.00µs | → | +0.0% |
| Component Registration (×10) | 4.46µs | 3.46µs | 550.00µs | ↓ | +28.9% |
| Component Mount | 45.71µs | 33.17µs | 2.67ms | ↓ | +37.8% |
| Reactive Updates (×100) | 3.85µs | 3.25µs | 140.00µs | ↓ | +18.6% |
| Lifecycle Cycles (×10) | 249.42µs | 199.29µs | — | ↓ | +25.2% |
| Event Handling (×50) | 268.67µs | 157.06µs | 1.41ms | ↓ | +71.1% |
| Large List Update (500 items) | 17.98µs | 16.15µs | 290.00µs | ↓ | +11.4% |
| Complex Template (50×5) | 13.62µs | 10.08µs | 160.00µs | ↓ | +35.1% |


## Methodology

| Parameter | Value |
|-----------|-------|
| **Warm-up Runs** | 3 (excluded from results) |
| **Measured Runs** | 10 per benchmark |
| **Outlier Removal** | >2 standard deviations |
| **Primary Metric** | Median (robust to outliers) |
| **Test Target** | Production build (`dist/eleva.js`) |

## Detailed Results

### Framework Instantiation

| Metric | Value |
|--------|-------|
| **Median** | 1.37µs |
| **Mean** | 2.17µs |
| **Std Dev** | 1.37µs |
| **Range** | 1.00µs – 4.92µs |
| **CV** | 63.5% |
| **Runs** | 9 |
| **Ops/Run** | 1 |
| **Budget** | < 10.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 1.37µs → 1.37µs (→ +0.0%)
- vs Initial: 40.00µs → 1.37µs (↑ -96.6%)

### Component Registration (×10)

| Metric | Value |
|--------|-------|
| **Median** | 4.46µs |
| **Mean** | 4.80µs |
| **Std Dev** | 1.34µs |
| **Range** | 3.33µs – 7.88µs |
| **CV** | 27.9% |
| **Runs** | 9 |
| **Ops/Run** | 10 |
| **Budget** | < 20.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 3.46µs → 4.46µs (↓ +28.9%)
- vs Initial: 550.00µs → 4.46µs (↑ -99.2%)

### Component Mount

| Metric | Value |
|--------|-------|
| **Median** | 45.71µs |
| **Mean** | 56.30µs |
| **Std Dev** | 24.70µs |
| **Range** | 37.17µs – 121.92µs |
| **CV** | 43.9% |
| **Runs** | 9 |
| **Ops/Run** | 1 |
| **Budget** | < 20.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 33.17µs → 45.71µs (↓ +37.8%)
- vs Initial: 2.67ms → 45.71µs (↑ -98.3%)

### Reactive Updates (×100)

| Metric | Value |
|--------|-------|
| **Median** | 3.85µs |
| **Mean** | 8.33µs |
| **Std Dev** | 6.10µs |
| **Range** | 3.12µs – 17.79µs |
| **CV** | 73.3% |
| **Runs** | 10 |
| **Ops/Run** | 100 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 3.25µs → 3.85µs (↓ +18.6%)
- vs Initial: 140.00µs → 3.85µs (↑ -97.2%)

### Lifecycle Cycles (×10)

| Metric | Value |
|--------|-------|
| **Median** | 249.42µs |
| **Mean** | 260.35µs |
| **Std Dev** | 23.87µs |
| **Range** | 229.58µs – 302.38µs |
| **CV** | 9.2% |
| **Runs** | 10 |
| **Ops/Run** | 10 |
| **Budget** | < 100.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 199.29µs → 249.42µs (↓ +25.2%)
- vs Initial: No initial data

### Event Handling (×50)

| Metric | Value |
|--------|-------|
| **Median** | 268.67µs |
| **Mean** | 281.87µs |
| **Std Dev** | 96.78µs |
| **Range** | 178.00µs – 461.50µs |
| **CV** | 34.3% |
| **Runs** | 10 |
| **Ops/Run** | 50 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 157.06µs → 268.67µs (↓ +71.1%)
- vs Initial: 1.41ms → 268.67µs (↑ -80.9%)

### Large List Update (500 items)

| Metric | Value |
|--------|-------|
| **Median** | 17.98µs |
| **Mean** | 18.65µs |
| **Std Dev** | 3.32µs |
| **Range** | 15.08µs – 24.58µs |
| **CV** | 17.8% |
| **Runs** | 10 |
| **Ops/Run** | 500 |
| **Budget** | < 100.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 16.15µs → 17.98µs (↓ +11.4%)
- vs Initial: 290.00µs → 17.98µs (↑ -93.8%)

### Complex Template (50×5)

| Metric | Value |
|--------|-------|
| **Median** | 13.62µs |
| **Mean** | 13.56µs |
| **Std Dev** | 1.42µs |
| **Range** | 10.83µs – 15.63µs |
| **CV** | 10.5% |
| **Runs** | 9 |
| **Ops/Run** | 250 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 10.08µs → 13.62µs (↓ +35.1%)
- vs Initial: 160.00µs → 13.62µs (↑ -91.5%)



## Version History

| Version | Date | Avg. Median | Methodology |
|---------|------|-------------|-------------|
| 1.2.0 | 2/8/2026 | 75.64µs | Standard |
| 1.1.0 | 1/20/2026 | 52.98µs | Standard |
| 1.0.0 | 1/13/2026 | 51.78µs | Standard |
| 1.0.0-rc.14 | 1/12/2026 | 63.98µs | Standard |
| 1.0.0-rc.13 | 1/10/2026 | 54.72µs | Standard |
| 1.0.0-rc.12 | 1/8/2026 | 73.93µs | Standard |
| 1.0.0-rc.11 | 1/5/2026 | 72.24µs | Standard |
| 1.0.0-rc.10 | 1/3/2026 | 56.50µs | Standard |
| 1.0.0-rc.1 | 6/18/2025 | 738.57µs | Legacy |
| 1.2.5-alpha *(initial)* | 4/25/2025 | 751.43µs | Legacy |


---

*Lower times are better. CV (Coefficient of Variation) < 50% indicates consistent measurements.*

*Report generated automatically by the Eleva.js benchmark suite.*
