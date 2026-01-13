# Browser Performance Testing

This folder contains browser-based performance tests for Eleva.js using real Chrome DevTools measurements.

## Quick Start

```bash
# From Eleva repo root
bun run serve
```

**Standard benchmark (renders all rows):**
http://localhost:3000/test/performance/browser/standalone.html

**Virtual scrolling benchmark (renders only visible rows):**
http://localhost:3000/test/performance/browser/standalone-virtual.html

## Measuring Memory

1. Open Chrome DevTools (F12)
2. Go to **Memory** tab
3. Click "Create 1,000 rows" button
4. Click **Take heap snapshot**
5. Look at "Retained Size" for accurate memory usage

## Measuring Performance

1. Open Chrome DevTools (F12)
2. Go to **Performance** tab
3. Click record, perform an operation, stop recording
4. Analyze the flame chart and timing

## Expected Results

```
Chrome Memory (1,000 rows):
- Baseline:    ~15.2 MB
- After:       ~15.7 MB
- Overhead:    ~0.5 MB  (~0.5 KB/row)

Chrome Memory (10,000 rows):
- Baseline:    ~15.2 MB
- After:       ~28.9 MB
- Overhead:    ~13.7 MB (~1.37 KB/row)

Chrome Memory (Append 1,000 rows to 10K):
- Before:      ~39.3 MB (10K rows)
- After:       ~40.7 MB (11K rows)
- Overhead:    ~1.4 MB  (~1.4 KB/row)

Chrome Memory (Update every 10th row):
- Before:      ~40.7 MB
- After:       ~40.7 MB
- Overhead:    ~0 MB  (no memory growth)

Chrome Memory (Clear):
- Before:      ~37.8 MB
- After:       ~37.8 MB
- Overhead:    ~0 MB  (memory properly released)

Chrome Memory (Swap Rows):
- Before:      ~37.8 MB
- After:       ~37.8 MB
- Overhead:    ~0 MB  (no memory growth)
```

## Operations

| Button | Operation |
|--------|-----------|
| Create 1,000 rows | Replace with 1000 new rows |
| Create 10,000 rows | Replace with 10000 new rows |
| Append 1,000 rows | Add 1000 rows to existing |
| Update every 10th row | Append " !!!" to every 10th label |
| Clear | Remove all rows |
| Swap Rows | Swap rows at index 1 and 998 |

## Virtual Scrolling Results

The virtual scrolling benchmark (`standalone-virtual.html`) renders only ~17 visible rows instead of all rows.

**Comparison (10,000 rows):**

| Metric | Standard | Virtual | Improvement |
|--------|----------|---------|-------------|
| Memory | ~29 MB | ~5 MB | **5.5x less** |
| Create 10K rows | ~250ms | ~21ms | **12x faster** |
| Update every 10th | ~86ms | ~9ms | **9.5x faster** |
| DOM rows rendered | 10,000 | ~17 | **588x fewer** |

Virtual scrolling is recommended for datasets with 10,000+ rows.
