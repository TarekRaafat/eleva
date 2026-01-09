# Eleva.js Performance Benchmarks

> **Current Version:** 1.0.0-rc.12 | **Generated:** 09/01/2026 at 12:10 AM (GMT +0) | **Platform:** darwin arm64 | **Runtime:** Bun 1.3.5

> **Note:** Initial baseline (1.2.5-alpha) used legacy methodology (single run, Jest/Node.js). Current tests use improved methodology (10 runs, warm-up, outlier removal).

## Overview

| Metric | Value |
|--------|-------|
| **Benchmarks Passed** | 8/8 (100%) |
| **Performance Health** | Excellent |
| **Versions Tracked** | 18 |
| **Initial Baseline** | 1.2.5-alpha (legacy) |

## Legend

| Symbol | Meaning |
|--------|---------|
| ↑ | Improved (faster than before) |
| ↓ | Degraded (slower than before) |
| → | Stable (within ±10%) |
| — | No comparison data |

## Summary

| Benchmark | Current (1.0.0-rc.12) | Previous (1.0.0-rc.11) | Initial (1.2.5-alpha) | Trend | Change |
|-----------|---------|----------|---------|-------|--------|
| Framework Instantiation | 2.69µs | 8.71µs | 40.00µs | ↑ | -69.1% |
| Component Registration (×10) | 3.88µs | 3.50µs | 550.00µs | ↓ | +10.7% |
| Component Mount | 33.67µs | 30.42µs | 2.67ms | ↓ | +10.7% |
| Reactive Updates (×100) | 6.98µs | 2.12µs | 140.00µs | ↓ | +228.4% |
| Lifecycle Cycles (×10) | 212.08µs | 214.40µs | — | → | -1.1% |
| Event Handling (×50) | 142.88µs | 291.46µs | 1.41ms | ↑ | -51.0% |
| Large List Update (500 items) | 15.54µs | 16.67µs | 290.00µs | → | -6.8% |
| Complex Template (50×5) | 12.15µs | 10.67µs | 160.00µs | ↓ | +13.9% |


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
| **Median** | 2.69µs |
| **Mean** | 2.56µs |
| **Std Dev** | 971.49ns |
| **Range** | 1.04µs – 3.71µs |
| **CV** | 38.0% |
| **Runs** | 10 |
| **Ops/Run** | 1 |
| **Budget** | < 10.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 8.71µs → 2.69µs (↑ -69.1%)
- vs Initial: 40.00µs → 2.69µs (↑ -93.3%)

### Component Registration (×10)

| Metric | Value |
|--------|-------|
| **Median** | 3.88µs |
| **Mean** | 4.08µs |
| **Std Dev** | 1.08µs |
| **Range** | 3.00µs – 6.87µs |
| **CV** | 26.4% |
| **Runs** | 9 |
| **Ops/Run** | 10 |
| **Budget** | < 20.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 3.50µs → 3.88µs (↓ +10.7%)
- vs Initial: 550.00µs → 3.88µs (↑ -99.3%)

### Component Mount

| Metric | Value |
|--------|-------|
| **Median** | 33.67µs |
| **Mean** | 36.26µs |
| **Std Dev** | 8.62µs |
| **Range** | 25.92µs – 51.75µs |
| **CV** | 23.8% |
| **Runs** | 9 |
| **Ops/Run** | 1 |
| **Budget** | < 20.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 30.42µs → 33.67µs (↓ +10.7%)
- vs Initial: 2.67ms → 33.67µs (↑ -98.7%)

### Reactive Updates (×100)

| Metric | Value |
|--------|-------|
| **Median** | 6.98µs |
| **Mean** | 10.45µs |
| **Std Dev** | 5.93µs |
| **Range** | 5.62µs – 22.12µs |
| **CV** | 56.8% |
| **Runs** | 10 |
| **Ops/Run** | 100 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 2.12µs → 6.98µs (↓ +228.4%)
- vs Initial: 140.00µs → 6.98µs (↑ -95.0%)

### Lifecycle Cycles (×10)

| Metric | Value |
|--------|-------|
| **Median** | 212.08µs |
| **Mean** | 216.32µs |
| **Std Dev** | 11.22µs |
| **Range** | 205.25µs – 242.00µs |
| **CV** | 5.2% |
| **Runs** | 9 |
| **Ops/Run** | 10 |
| **Budget** | < 100.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 214.40µs → 212.08µs (→ -1.1%)
- vs Initial: No initial data

### Event Handling (×50)

| Metric | Value |
|--------|-------|
| **Median** | 142.88µs |
| **Mean** | 190.27µs |
| **Std Dev** | 85.91µs |
| **Range** | 107.79µs – 355.33µs |
| **CV** | 45.2% |
| **Runs** | 9 |
| **Ops/Run** | 50 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 291.46µs → 142.88µs (↑ -51.0%)
- vs Initial: 1.41ms → 142.88µs (↑ -89.9%)

### Large List Update (500 items)

| Metric | Value |
|--------|-------|
| **Median** | 15.54µs |
| **Mean** | 20.30µs |
| **Std Dev** | 6.83µs |
| **Range** | 14.46µs – 32.42µs |
| **CV** | 33.6% |
| **Runs** | 10 |
| **Ops/Run** | 500 |
| **Budget** | < 100.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 16.67µs → 15.54µs (→ -6.8%)
- vs Initial: 290.00µs → 15.54µs (↑ -94.6%)

### Complex Template (50×5)

| Metric | Value |
|--------|-------|
| **Median** | 12.15µs |
| **Mean** | 12.26µs |
| **Std Dev** | 1.51µs |
| **Range** | 10.42µs – 14.71µs |
| **CV** | 12.3% |
| **Runs** | 10 |
| **Ops/Run** | 250 |
| **Budget** | < 50.00ms |
| **Status** | ✓ PASSED |

**Comparison:**
- vs Previous: 10.67µs → 12.15µs (↓ +13.9%)
- vs Initial: 160.00µs → 12.15µs (↑ -92.4%)



## Version History

| Version | Date | Avg. Median | Methodology |
|---------|------|-------------|-------------|
| 1.0.0-rc.12 | 1/9/2026 | 53.73µs | Standard |
| 1.0.0-rc.11 | 1/5/2026 | 72.24µs | Standard |
| 1.0.0-rc.10 | 1/3/2026 | 56.50µs | Standard |
| 1.0.0-rc.1 | 6/18/2025 | 738.57µs | Legacy |
| 1.2.19-beta | 6/2/2025 | 735.71µs | Legacy |
| 1.2.18-beta | 6/1/2025 | 707.14µs | Legacy |
| 1.2.17-beta | 5/25/2025 | 720.00µs | Legacy |
| 1.2.16-beta | 5/24/2025 | 751.43µs | Legacy |
| 1.2.15-beta | 5/18/2025 | 1.40ms | Legacy |
| 1.2.5-alpha *(initial)* | 4/25/2025 | 751.43µs | Legacy |


---

*Lower times are better. CV (Coefficient of Variation) < 50% indicates consistent measurements.*

*Report generated automatically by the Eleva.js benchmark suite.*
