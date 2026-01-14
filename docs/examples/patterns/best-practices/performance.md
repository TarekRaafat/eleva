---
title: Performance Optimization
description: Eleva.js performance best practices - preventing unnecessary re-renders, large list handling, and virtual scrolling for 10K+ rows.
---

# Performance Optimization

> **Version:** 1.0.0 | Techniques for optimizing render performance in Eleva applications.

---

## Preventing Unnecessary Re-renders

Eleva gives developers direct control over the DOM through its Signal-based reactivity and Renderer. Unlike frameworks that abstract DOM updates behind a virtual DOM, Eleva's architecture means **you control exactly when and how the DOM updates** by controlling signal changes.

### When Manual Optimization Is Needed

Eleva's automatic render batching (`queueMicrotask`) handles most cases efficiently—multiple signal updates in the same synchronous block trigger only one re-render. Manual optimization is needed when:

| Scenario | Problem | Solution |
|----------|---------|----------|
| High-frequency events (mousemove, scroll) | Too many signal updates | Throttle/debounce |
| Noisy data streams (WebSocket, sensors) | Minor changes trigger renders | Conditional updates |
| Complex component with mixed update rates | Entire template re-renders | Template partitioning or component isolation |
| Animation or real-time visualization | Need direct DOM manipulation | Direct DOM access |

---

### 1. Gating Signal Updates

Since Eleva re-renders when signals change, the most direct optimization is **preventing unnecessary signal updates**:

**Conditional Updates** - Only update when changes are meaningful:

```javascript
setup: ({ signal }) => {
  const data = signal(0);

  const updateIfSignificant = (value) => {
    // Only trigger re-render if change exceeds threshold
    if (Math.abs(value - data.value) > 10) {
      data.value = value;
    }
  };

  return { data, updateIfSignificant };
}
```

**Debounced Updates** - Delay updates until activity stops (ideal for input fields):

```javascript
setup: ({ signal }) => {
  const searchQuery = signal("");
  let debounceTimer = null;

  const updateDebounced = (value) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchQuery.value = value;  // Only updates after 300ms of no input
    }, 300);
  };

  return {
    searchQuery,
    updateDebounced,
    onUnmount: () => clearTimeout(debounceTimer)
  };
}
```

**Throttled Updates** - Limit update frequency (ideal for scroll/mousemove):

```javascript
setup: ({ signal }) => {
  const position = signal({ x: 0, y: 0 });
  let lastUpdate = 0;

  const updateThrottled = (newPos) => {
    const now = Date.now();
    if (now - lastUpdate >= 16) {  // Cap at ~60fps
      position.value = newPos;
      lastUpdate = now;
    }
  };

  return { position, updateThrottled };
}
```

---

### 2. Template Partitioning

For complex components where only part of the UI needs frequent updates, partition your template using conditional rendering to minimize DOM diffing work:

```javascript
app.component("StockDashboard", {
  setup: ({ signal }) => {
    const stocks = signal([]);           // Changes frequently
    const selectedStock = signal(null);  // Changes frequently
    const userSettings = signal({});     // Rarely changes
    const staticContent = {              // Never changes - not a signal
      title: "Stock Dashboard",
      footer: "Data delayed 15 minutes"
    };

    return { stocks, selectedStock, userSettings, staticContent };
  },

  template: (ctx) => `
    <div class="dashboard">
      <!-- Static section - no signals, never re-diffed meaningfully -->
      <header>${ctx.staticContent.title}</header>

      <!-- Dynamic section - minimal, focused updates -->
      <div class="stock-list">
        ${ctx.stocks.value.map(stock => `
          <div key="${stock.symbol}"
               class="${ctx.selectedStock.value === stock.symbol ? 'selected' : ''}"
               @click="() => selectedStock.value = '${stock.symbol}'">
            <span class="symbol">${stock.symbol}</span>
            <span class="price">${stock.price}</span>
          </div>
        `).join("")}
      </div>

      <footer>${ctx.staticContent.footer}</footer>
    </div>
  `
});
```

**Key technique:** Use plain objects (not signals) for truly static content. Eleva's renderer will still diff them, but they won't trigger re-renders on their own.

---

### 3. Component Isolation

Extract frequently-updating sections into child components. Each component has its own render cycle, so updates in a child don't re-render the parent:

```javascript
// Parent - renders only when its own signals change
app.component("Dashboard", {
  setup: ({ signal }) => ({
    userName: signal("John")  // Rarely changes
  }),
  template: (ctx) => `
    <div class="dashboard">
      <header>Welcome, ${ctx.userName.value}</header>
      <div id="live-ticker"></div>  <!-- Child handles its own updates -->
      <div id="chart"></div>        <!-- Another isolated child -->
      <footer>Static content here</footer>
    </div>
  `,
  children: {
    "#live-ticker": "LiveTicker",
    "#chart": "RealTimeChart"
  }
});

// Child - re-renders at 60fps without affecting parent
app.component("LiveTicker", {
  setup: ({ signal }) => {
    const prices = signal([]);
    let intervalId = null;

    return {
      prices,
      onMount: () => {
        intervalId = setInterval(() => {
          // High-frequency updates isolated to this component
          prices.value = fetchLatestPrices();
        }, 16);
      },
      onUnmount: () => clearInterval(intervalId)
    };
  },
  template: (ctx) => `
    <div class="ticker">
      ${ctx.prices.value.map(p => `<span key="${p.id}">${p.value}</span>`).join("")}
    </div>
  `
});
```

---

### 4. Direct DOM Access (Bypassing Reactivity)

For maximum performance in animation-heavy or real-time visualization sections, bypass Eleva's reactive system entirely and manipulate the DOM directly using the `container` reference in lifecycle hooks:

```javascript
app.component("RealTimeChart", {
  setup: ({ signal }) => {
    const data = signal([]);
    let canvas = null;
    let ctx = null;
    let animationId = null;

    // Direct DOM manipulation for performance-critical rendering
    const drawFrame = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw directly - no signals, no re-renders
      const points = data.value;
      ctx.beginPath();
      points.forEach((point, i) => {
        const x = (i / points.length) * canvas.width;
        const y = canvas.height - (point / 100) * canvas.height;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();

      animationId = requestAnimationFrame(drawFrame);
    };

    // Update data without triggering Eleva re-render
    const pushDataPoint = (value) => {
      const current = data.value;
      current.push(value);
      if (current.length > 100) current.shift();
      // Note: mutating in place intentionally to avoid re-render
      // The canvas drawFrame reads data.value directly
    };

    return {
      data,
      pushDataPoint,
      onMount: ({ container }) => {
        // Get direct DOM reference
        canvas = container.querySelector("canvas");
        ctx = canvas.getContext("2d");
        drawFrame();
      },
      onUnmount: () => {
        cancelAnimationFrame(animationId);
      }
    };
  },

  // Template renders once, canvas updates happen via direct DOM access
  template: () => `
    <div class="chart-container">
      <canvas width="800" height="400"></canvas>
    </div>
  `
});
```

**When to use direct DOM access:**
- Canvas-based visualizations
- WebGL rendering
- High-frequency animations (60+ fps)
- Real-time data streams where re-rendering is too expensive

---

### 5. Hybrid Approach

Combine reactive UI with direct DOM updates for the best of both worlds:

```javascript
app.component("PerformanceMonitor", {
  setup: ({ signal }) => {
    // Reactive state for UI controls (normal Eleva reactivity)
    const isRunning = signal(false);
    const displayMode = signal("chart");

    // Non-reactive state for high-frequency data
    let metricsBuffer = [];
    let chartElement = null;

    const updateChart = () => {
      if (!chartElement) return;
      // Direct DOM update - bypasses Eleva entirely
      chartElement.style.setProperty("--value", metricsBuffer[metricsBuffer.length - 1]);
    };

    const addMetric = (value) => {
      metricsBuffer.push(value);
      if (metricsBuffer.length > 1000) metricsBuffer.shift();
      updateChart();  // Direct DOM, no re-render
    };

    return {
      isRunning,
      displayMode,
      addMetric,
      toggleRunning: () => { isRunning.value = !isRunning.value; },
      onMount: ({ container }) => {
        chartElement = container.querySelector(".chart-bar");
      }
    };
  },

  template: (ctx) => `
    <div class="monitor">
      <!-- Reactive UI - re-renders when signals change -->
      <div class="controls">
        <button @click="toggleRunning">
          ${ctx.isRunning.value ? "Stop" : "Start"}
        </button>
        <select @change="(e) => displayMode.value = e.target.value">
          <option value="chart">Chart</option>
          <option value="table">Table</option>
        </select>
      </div>

      <!-- Performance-critical section - updated via direct DOM access -->
      <div class="chart-bar" style="--value: 0;"></div>
    </div>
  `,

  style: `
    .chart-bar {
      width: calc(var(--value) * 1%);
      height: 20px;
      background: linear-gradient(90deg, green, red);
      transition: width 16ms linear;
    }
  `
});
```

---

### Decision Guide

| Update Frequency | Approach | Example |
|------------------|----------|---------|
| User-triggered (clicks, form submits) | Normal signals | Form validation, toggles |
| Moderate (every few seconds) | Normal signals | API polling, notifications |
| High (multiple per second) | Throttle/debounce signals | Search input, scroll position |
| Very high (60+ fps) | Direct DOM access | Canvas, animations, real-time charts |
| Mixed in same component | Hybrid approach | Dashboard with controls + live data |

> **Key insight:** Eleva's direct DOM control means you choose the optimization strategy. Gate signal updates for reactive optimization, or bypass signals entirely for maximum performance.

---

## Large List Performance

For large lists (1,000+ items), Eleva's single-template approach with keyed reconciliation is the most efficient pattern:

```javascript
app.component("data-table", {
  setup: ({ signal }) => ({
    rows: signal([])
  }),
  template: (ctx) => `
    <table>
      <tbody>
        ${ctx.rows.value.map(row => `
          <tr key="${row.id}">
            <td>${row.id}</td>
            <td>${row.label}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `
});
```

**Why this works:**
- The `key` attribute enables efficient DOM diffing
- Only changed elements are updated in the DOM
- Minimal memory overhead (~1.37 KB/row for 10K rows)
- No component instance overhead per row

**Avoid component splitting for large lists:**

| Pattern | 10K Rows Memory | Recommendation |
|---------|-----------------|----------------|
| Single template with keys | ~28.9 MB | Recommended |
| Separate component per row | ~125 MB | Avoid for large lists |

Component splitting creates per-instance overhead (signals, context, lifecycle) that far exceeds any benefit for simple list items.

---

## Virtual Scrolling (10K+ Rows)

For very large datasets (10,000+ rows), virtual scrolling renders only visible rows.

**Verified Benchmark Results (10,000 rows):**

| Metric | Standard | Virtual Scrolling | Improvement |
|--------|----------|-------------------|-------------|
| Memory | ~29 MB | ~5 MB | **5.5x less** |
| Create 10K rows | ~250ms | ~21ms | **12x faster** |
| Update every 10th row | ~86ms | ~9ms | **9.5x faster** |
| DOM rows rendered | 10,000 | ~17 | **588x fewer** |

```javascript
// Configuration
const ROW_HEIGHT = 37;
const VIEWPORT_HEIGHT = 400;
const VISIBLE_COUNT = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT) + 6;

app.component("virtual-table", {
  setup: ({ signal }) => {
    const rows = signal([]);
    const scrollTop = signal(0);

    const handleScroll = (e) => {
      scrollTop.value = e.target.scrollTop;
    };

    return { rows, scrollTop, handleScroll };
  },

  template: (ctx) => {
    // Calculate visible slice
    const allRows = ctx.rows.value;
    const scroll = ctx.scrollTop.value;
    const startIndex = Math.max(0, Math.floor(scroll / ROW_HEIGHT) - 3);
    const endIndex = Math.min(allRows.length, startIndex + VISIBLE_COUNT);
    const items = allRows.slice(startIndex, endIndex);
    const offset = startIndex * ROW_HEIGHT;
    const totalHeight = allRows.length * ROW_HEIGHT;

    return `
      <div class="virtual-viewport"
           style="height: ${VIEWPORT_HEIGHT}px; overflow-y: auto;"
           @scroll="handleScroll">
        <div style="height: ${totalHeight}px; position: relative;">
          <table style="position: absolute; top: ${offset}px; width: 100%;">
            <tbody>
              ${items.map(row => `
                <tr key="${row.id}" style="height: ${ROW_HEIGHT}px;">
                  <td>${row.id}</td>
                  <td>${row.label}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
});
```

**When to use:**

| Dataset Size | Recommended Approach |
|--------------|---------------------|
| < 1,000 rows | Single template with keys |
| 1,000 - 10,000 rows | Single template with keys (Eleva handles this efficiently) |
| 10,000+ rows | Virtual scrolling |

> **Tip:** See the [Lists - Virtual Scrolling](../lists/virtual-scrolling.md) guide for a complete implementation with search, selection, and a reusable component.

---

[← Signals & Templates](./signals-templates.md) | [Back to Overview](./index.md)
