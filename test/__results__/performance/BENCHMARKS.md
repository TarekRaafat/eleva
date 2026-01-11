# Eleva.js Performance Benchmarks

> **Current Version:** 1.0.0-rc.14 | **Generated:** 11/01/2026 at 10:13 AM (GMT +0) | **Platform:** darwin arm64 | **Runtime:** Bun 1.3.5

> **Note:** Initial baseline (1.2.5-alpha) used legacy methodology (single run, Jest/Node.js). Current tests use improved methodology (10 runs, warm-up, outlier removal).

## Overview

| Metric | Value |
|--------|-------|
| **Benchmarks Passed** | 8/8 (100%) |
| **Performance Health** | Excellent |
| **Versions Tracked** | 20 |
| **Initial Baseline** | 1.2.5-alpha (legacy) |

## Legend

| Symbol | Meaning |
|--------|---------|
| ↑ | Improved (faster than before) |
| ↓ | Degraded (slower than before) |
| → | Stable (within ±10%) |
| — | No comparison data |

## Summary

| Benchmark | Current (1.0.0-rc.14) | Previous (1.0.0-rc.13) | Initial (1.2.5-alpha) | Trend | Change |
|-----------|---------|----------|---------|-------|--------|
| Framework Instantiation | 2.96µs | 4.60µs | 40.00µs | ↑ | -35.8% |
| Component Registration (×10) | 4.62µs | 3.92µs | 550.00µs | ↓ | +18.1% |
| Component Mount | 31.15µs | 33.54µs | 2.67ms | → | -7.1% |
| Reactive Updates (×100) | 5.65µs | 5.19µs | 140.00µs | → | +8.8% |
| Lifecycle Cycles (×10) | 222.83µs | 221.50µs | — | → | +0.6% |
| Event Handling (×50) | 134.50µs | 133.25µs | 1.41ms | → | +0.9% |
| Large List Update (500 items) | 19.69µs | 19.71µs | 290.00µs | → | -0.1% |
| Complex Template (50×5) | 16.17µs | 16.08µs | 160.00µs | → | +0.5% |


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
| **Median** | 2.96µs |
| **Mean** | 2.59µs |
| **Std Dev** | 881.36ns |
| **Range** | 1.29µs – 3.67µs |
| **CV** | 34.0% |
| **Runs** | 9 |
| **Ops/Run** | 1 |
| **Budget** | < 10.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 4.60µs → 2.96µs (↑ -35.8%)
- vs Initial: 40.00µs → 2.96µs (↑ -92.6%)

### Component Registration (×10)

| Metric | Value |
|--------|-------|
| **Median** | 4.62µs |
| **Mean** | 7.16µs |
| **Std Dev** | 5.99µs |
| **Range** | 2.83µs – 22.62µs |
| **CV** | 83.7% |
| **Runs** | 9 |
| **Ops/Run** | 10 |
| **Budget** | < 20.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 3.92µs → 4.62µs (↓ +18.1%)
- vs Initial: 550.00µs → 4.62µs (↑ -99.2%)

### Component Mount

| Metric | Value |
|--------|-------|
| **Median** | 31.15µs |
| **Mean** | 33.22µs |
| **Std Dev** | 4.67µs |
| **Range** | 28.71µs – 42.54µs |
| **CV** | 14.1% |
| **Runs** | 10 |
| **Ops/Run** | 1 |
| **Budget** | < 20.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 33.54µs → 31.15µs (→ -7.1%)
- vs Initial: 2.67ms → 31.15µs (↑ -98.8%)

### Reactive Updates (×100)

| Metric | Value |
|--------|-------|
| **Median** | 5.65µs |
| **Mean** | 9.81µs |
| **Std Dev** | 6.61µs |
| **Range** | 3.96µs – 22.92µs |
| **CV** | 67.3% |
| **Runs** | 10 |
| **Ops/Run** | 100 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 5.19µs → 5.65µs (→ +8.8%)
- vs Initial: 140.00µs → 5.65µs (↑ -96.0%)

### Lifecycle Cycles (×10)

| Metric | Value |
|--------|-------|
| **Median** | 222.83µs |
| **Mean** | 225.55µs |
| **Std Dev** | 23.50µs |
| **Range** | 192.96µs – 278.92µs |
| **CV** | 10.4% |
| **Runs** | 9 |
| **Ops/Run** | 10 |
| **Budget** | < 100.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 221.50µs → 222.83µs (→ +0.6%)
- vs Initial: No initial data

### Event Handling (×50)

| Metric | Value |
|--------|-------|
| **Median** | 134.50µs |
| **Mean** | 191.95µs |
| **Std Dev** | 92.46µs |
| **Range** | 113.25µs – 414.46µs |
| **CV** | 48.2% |
| **Runs** | 9 |
| **Ops/Run** | 50 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 133.25µs → 134.50µs (→ +0.9%)
- vs Initial: 1.41ms → 134.50µs (↑ -90.5%)

### Large List Update (500 items)

| Metric | Value |
|--------|-------|
| **Median** | 19.69µs |
| **Mean** | 21.73µs |
| **Std Dev** | 4.69µs |
| **Range** | 16.58µs – 30.92µs |
| **CV** | 21.6% |
| **Runs** | 10 |
| **Ops/Run** | 500 |
| **Budget** | < 100.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 19.71µs → 19.69µs (→ -0.1%)
- vs Initial: 290.00µs → 19.69µs (↑ -93.2%)

### Complex Template (50×5)

| Metric | Value |
|--------|-------|
| **Median** | 16.17µs |
| **Mean** | 16.66µs |
| **Std Dev** | 2.25µs |
| **Range** | 14.29µs – 20.83µs |
| **CV** | 13.5% |
| **Runs** | 10 |
| **Ops/Run** | 250 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 16.08µs → 16.17µs (→ +0.5%)
- vs Initial: 160.00µs → 16.17µs (↑ -89.9%)



## Version History

| Version | Date | Avg. Median | Methodology |
|---------|------|-------------|-------------|
| 1.0.0-rc.14 | 1/11/2026 | 54.70µs | Standard |
| 1.0.0-rc.13 | 1/10/2026 | 54.72µs | Standard |
| 1.0.0-rc.12 | 1/8/2026 | 73.93µs | Standard |
| 1.0.0-rc.11 | 1/5/2026 | 72.24µs | Standard |
| 1.0.0-rc.10 | 1/3/2026 | 56.50µs | Standard |
| 1.0.0-rc.1 | 6/18/2025 | 738.57µs | Legacy |
| 1.2.19-beta | 6/2/2025 | 735.71µs | Legacy |
| 1.2.18-beta | 6/1/2025 | 707.14µs | Legacy |
| 1.2.17-beta | 5/25/2025 | 720.00µs | Legacy |
| 1.2.5-alpha *(initial)* | 4/25/2025 | 751.43µs | Legacy |


---

*Lower times are better. CV (Coefficient of Variation) < 50% indicates consistent measurements.*

*Report generated automatically by the Eleva.js benchmark suite.*
