# Eleva.js Performance Benchmarks

> **Current Version:** 1.1.0 | **Generated:** 20/01/2026 at 01:41 PM (GMT +0) | **Platform:** darwin arm64 | **Runtime:** Bun 1.3.6

> **Note:** Initial baseline (1.2.5-alpha) used legacy methodology (single run, Jest/Node.js). Current tests use improved methodology (10 runs, warm-up, outlier removal).

## Overview

| Metric | Value |
|--------|-------|
| **Benchmarks Passed** | 8/8 (100%) |
| **Performance Health** | Excellent |
| **Versions Tracked** | 22 |
| **Initial Baseline** | 1.2.5-alpha (legacy) |

## Legend

| Symbol | Meaning |
|--------|---------|
| ↑ | Improved (faster than before) |
| ↓ | Degraded (slower than before) |
| → | Stable (within ±10%) |
| — | No comparison data |

## Summary

| Benchmark | Current (1.1.0) | Previous (1.0.0) | Initial (1.2.5-alpha) | Trend | Change |
|-----------|---------|----------|---------|-------|--------|
| Framework Instantiation | 1.37µs | 1.58µs | 40.00µs | ↑ | -13.2% |
| Component Registration (×10) | 3.46µs | 3.58µs | 550.00µs | → | -3.5% |
| Component Mount | 33.17µs | 31.33µs | 2.67ms | → | +5.8% |
| Reactive Updates (×100) | 3.25µs | 4.17µs | 140.00µs | ↑ | -22.0% |
| Lifecycle Cycles (×10) | 199.29µs | 224.17µs | — | ↑ | -11.1% |
| Event Handling (×50) | 157.06µs | 125.92µs | 1.41ms | ↓ | +24.7% |
| Large List Update (500 items) | 16.15µs | 13.87µs | 290.00µs | ↓ | +16.4% |
| Complex Template (50×5) | 10.08µs | 9.65µs | 160.00µs | → | +4.5% |


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
| **Mean** | 1.54µs |
| **Std Dev** | 513.63ns |
| **Range** | 1.04µs – 2.83µs |
| **CV** | 33.3% |
| **Runs** | 9 |
| **Ops/Run** | 1 |
| **Budget** | < 10.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 1.58µs → 1.37µs (↑ -13.2%)
- vs Initial: 40.00µs → 1.37µs (↑ -96.6%)

### Component Registration (×10)

| Metric | Value |
|--------|-------|
| **Median** | 3.46µs |
| **Mean** | 3.48µs |
| **Std Dev** | 463.91ns |
| **Range** | 2.83µs – 4.46µs |
| **CV** | 13.3% |
| **Runs** | 9 |
| **Ops/Run** | 10 |
| **Budget** | < 20.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 3.58µs → 3.46µs (→ -3.5%)
- vs Initial: 550.00µs → 3.46µs (↑ -99.4%)

### Component Mount

| Metric | Value |
|--------|-------|
| **Median** | 33.17µs |
| **Mean** | 31.63µs |
| **Std Dev** | 4.40µs |
| **Range** | 26.21µs – 40.17µs |
| **CV** | 13.9% |
| **Runs** | 9 |
| **Ops/Run** | 1 |
| **Budget** | < 20.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 31.33µs → 33.17µs (→ +5.8%)
- vs Initial: 2.67ms → 33.17µs (↑ -98.8%)

### Reactive Updates (×100)

| Metric | Value |
|--------|-------|
| **Median** | 3.25µs |
| **Mean** | 7.05µs |
| **Std Dev** | 5.87µs |
| **Range** | 2.75µs – 18.46µs |
| **CV** | 83.2% |
| **Runs** | 9 |
| **Ops/Run** | 100 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 4.17µs → 3.25µs (↑ -22.0%)
- vs Initial: 140.00µs → 3.25µs (↑ -97.7%)

### Lifecycle Cycles (×10)

| Metric | Value |
|--------|-------|
| **Median** | 199.29µs |
| **Mean** | 197.71µs |
| **Std Dev** | 6.82µs |
| **Range** | 188.33µs – 209.25µs |
| **CV** | 3.4% |
| **Runs** | 9 |
| **Ops/Run** | 10 |
| **Budget** | < 100.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 224.17µs → 199.29µs (↑ -11.1%)
- vs Initial: No initial data

### Event Handling (×50)

| Metric | Value |
|--------|-------|
| **Median** | 157.06µs |
| **Mean** | 214.92µs |
| **Std Dev** | 89.64µs |
| **Range** | 129.71µs – 362.42µs |
| **CV** | 41.7% |
| **Runs** | 10 |
| **Ops/Run** | 50 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 125.92µs → 157.06µs (↓ +24.7%)
- vs Initial: 1.41ms → 157.06µs (↑ -88.9%)

### Large List Update (500 items)

| Metric | Value |
|--------|-------|
| **Median** | 16.15µs |
| **Mean** | 16.21µs |
| **Std Dev** | 4.38µs |
| **Range** | 10.75µs – 24.04µs |
| **CV** | 27.0% |
| **Runs** | 10 |
| **Ops/Run** | 500 |
| **Budget** | < 100.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 13.87µs → 16.15µs (↓ +16.4%)
- vs Initial: 290.00µs → 16.15µs (↑ -94.4%)

### Complex Template (50×5)

| Metric | Value |
|--------|-------|
| **Median** | 10.08µs |
| **Mean** | 9.63µs |
| **Std Dev** | 1.38µs |
| **Range** | 7.25µs – 11.29µs |
| **CV** | 14.4% |
| **Runs** | 10 |
| **Ops/Run** | 250 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 9.65µs → 10.08µs (→ +4.5%)
- vs Initial: 160.00µs → 10.08µs (↑ -93.7%)



## Version History

| Version | Date | Avg. Median | Methodology |
|---------|------|-------------|-------------|
| 1.1.0 | 1/20/2026 | 52.98µs | Standard |
| 1.0.0 | 1/13/2026 | 51.78µs | Standard |
| 1.0.0-rc.14 | 1/12/2026 | 63.98µs | Standard |
| 1.0.0-rc.13 | 1/10/2026 | 54.72µs | Standard |
| 1.0.0-rc.12 | 1/8/2026 | 73.93µs | Standard |
| 1.0.0-rc.11 | 1/5/2026 | 72.24µs | Standard |
| 1.0.0-rc.10 | 1/3/2026 | 56.50µs | Standard |
| 1.0.0-rc.1 | 6/18/2025 | 738.57µs | Legacy |
| 1.2.19-beta | 6/2/2025 | 735.71µs | Legacy |
| 1.2.5-alpha *(initial)* | 4/25/2025 | 751.43µs | Legacy |


---

*Lower times are better. CV (Coefficient of Variation) < 50% indicates consistent measurements.*

*Report generated automatically by the Eleva.js benchmark suite.*
