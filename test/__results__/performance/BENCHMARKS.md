# Eleva.js Performance Benchmarks

> **Current Version:** 1.0.0-rc.11 | **Generated:** 05/01/2026 at 08:19 PM (GMT +0) | **Platform:** darwin arm64 | **Runtime:** Bun 1.3.5

> **Note:** Initial baseline (1.2.5-alpha) used legacy methodology (single run, Jest/Node.js). Current tests use improved methodology (10 runs, warm-up, outlier removal).

## Overview

| Metric | Value |
|--------|-------|
| **Benchmarks Passed** | 8/8 (100%) |
| **Performance Health** | Excellent |
| **Versions Tracked** | 17 |
| **Initial Baseline** | 1.2.5-alpha (legacy) |

## Legend

| Symbol | Meaning |
|--------|---------|
| ↑ | Improved (faster than before) |
| ↓ | Degraded (slower than before) |
| → | Stable (within ±10%) |
| — | No comparison data |

## Summary

| Benchmark | Current (1.0.0-rc.11) | Previous (1.0.0-rc.10) | Initial (1.2.5-alpha) | Trend | Change |
|-----------|---------|----------|---------|-------|--------|
| Framework Instantiation | 8.71µs | 1.54µs | 40.00µs | ↓ | +465.1% |
| Component Registration (×10) | 3.50µs | 3.71µs | 550.00µs | → | -5.6% |
| Component Mount | 30.42µs | 45.48µs | 2.67ms | ↑ | -33.1% |
| Reactive Updates (×100) | 2.12µs | 4.04µs | 140.00µs | ↑ | -47.4% |
| Lifecycle Cycles (×10) | 214.40µs | 250.10µs | — | ↑ | -14.3% |
| Event Handling (×50) | 291.46µs | 126.50µs | 1.41ms | ↓ | +130.4% |
| Large List Update (500 items) | 16.67µs | 10.71µs | 290.00µs | ↓ | +55.6% |
| Complex Template (50×5) | 10.67µs | 9.92µs | 160.00µs | → | +7.6% |


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
| **Median** | 8.71µs |
| **Mean** | 8.67µs |
| **Std Dev** | 2.43µs |
| **Range** | 4.54µs – 11.96µs |
| **CV** | 28.1% |
| **Runs** | 9 |
| **Ops/Run** | 1 |
| **Budget** | < 10.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 1.54µs → 8.71µs (↓ +465.1%)
- vs Initial: 40.00µs → 8.71µs (↑ -78.2%)

### Component Registration (×10)

| Metric | Value |
|--------|-------|
| **Median** | 3.50µs |
| **Mean** | 5.49µs |
| **Std Dev** | 5.48µs |
| **Range** | 2.67µs – 20.63µs |
| **CV** | 99.7% |
| **Runs** | 9 |
| **Ops/Run** | 10 |
| **Budget** | < 20.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 3.71µs → 3.50µs (→ -5.6%)
- vs Initial: 550.00µs → 3.50µs (↑ -99.4%)

### Component Mount

| Metric | Value |
|--------|-------|
| **Median** | 30.42µs |
| **Mean** | 32.30µs |
| **Std Dev** | 3.84µs |
| **Range** | 28.04µs – 38.83µs |
| **CV** | 11.9% |
| **Runs** | 9 |
| **Ops/Run** | 1 |
| **Budget** | < 20.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 45.48µs → 30.42µs (↑ -33.1%)
- vs Initial: 2.67ms → 30.42µs (↑ -98.9%)

### Reactive Updates (×100)

| Metric | Value |
|--------|-------|
| **Median** | 2.12µs |
| **Mean** | 6.60µs |
| **Std Dev** | 6.20µs |
| **Range** | 1.42µs – 17.96µs |
| **CV** | 94.0% |
| **Runs** | 10 |
| **Ops/Run** | 100 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 4.04µs → 2.12µs (↑ -47.4%)
- vs Initial: 140.00µs → 2.12µs (↑ -98.5%)

### Lifecycle Cycles (×10)

| Metric | Value |
|--------|-------|
| **Median** | 214.40µs |
| **Mean** | 231.05µs |
| **Std Dev** | 29.73µs |
| **Range** | 199.62µs – 274.08µs |
| **CV** | 12.9% |
| **Runs** | 10 |
| **Ops/Run** | 10 |
| **Budget** | < 100.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 250.10µs → 214.40µs (↑ -14.3%)
- vs Initial: No initial data

### Event Handling (×50)

| Metric | Value |
|--------|-------|
| **Median** | 291.46µs |
| **Mean** | 293.56µs |
| **Std Dev** | 121.30µs |
| **Range** | 117.71µs – 568.08µs |
| **CV** | 41.3% |
| **Runs** | 9 |
| **Ops/Run** | 50 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 126.50µs → 291.46µs (↓ +130.4%)
- vs Initial: 1.41ms → 291.46µs (↑ -79.3%)

### Large List Update (500 items)

| Metric | Value |
|--------|-------|
| **Median** | 16.67µs |
| **Mean** | 19.53µs |
| **Std Dev** | 4.90µs |
| **Range** | 14.87µs – 28.08µs |
| **CV** | 25.1% |
| **Runs** | 10 |
| **Ops/Run** | 500 |
| **Budget** | < 100.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 10.71µs → 16.67µs (↓ +55.6%)
- vs Initial: 290.00µs → 16.67µs (↑ -94.3%)

### Complex Template (50×5)

| Metric | Value |
|--------|-------|
| **Median** | 10.67µs |
| **Mean** | 11.48µs |
| **Std Dev** | 1.66µs |
| **Range** | 9.42µs – 14.12µs |
| **CV** | 14.4% |
| **Runs** | 9 |
| **Ops/Run** | 250 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 9.92µs → 10.67µs (→ +7.6%)
- vs Initial: 160.00µs → 10.67µs (↑ -93.3%)



## Version History

| Version | Date | Avg. Median | Methodology |
|---------|------|-------------|-------------|
| 1.0.0-rc.11 | 1/5/2026 | 72.24µs | Standard |
| 1.0.0-rc.10 | 1/3/2026 | 56.50µs | Standard |
| 1.0.0-rc.1 | 6/18/2025 | 738.57µs | Legacy |
| 1.2.19-beta | 6/2/2025 | 735.71µs | Legacy |
| 1.2.18-beta | 6/1/2025 | 707.14µs | Legacy |
| 1.2.17-beta | 5/25/2025 | 720.00µs | Legacy |
| 1.2.16-beta | 5/24/2025 | 751.43µs | Legacy |
| 1.2.15-beta | 5/18/2025 | 1.40ms | Legacy |
| 1.2.14-beta | 5/16/2025 | 1.50ms | Legacy |
| 1.2.5-alpha *(initial)* | 4/25/2025 | 751.43µs | Legacy |


---

*Lower times are better. CV (Coefficient of Variation) < 50% indicates consistent measurements.*

*Report generated automatically by the Eleva.js benchmark suite.*
