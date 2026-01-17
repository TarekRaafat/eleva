---
title: State Management
description: Eleva.js state management patterns - signals, reactive state, counters, and computed values. Master signal-based reactivity with practical examples.
---

# State Management Examples

> **Version:** 1.0.1 | Reactive state, computed values, and complex state patterns.

---

## Documentation Pages

- **[Getting Started](./index.md)** (this page) - Basic Counter, signals, event handling
- **[Project Structure](./project-structure.md)** - Multi-file organization, testing
- **[State Patterns](./patterns.md)** - Shopping cart, undo/redo, forms, wizards
- **[Batching & Performance](./batching.md)** - Render batching, 240fps+ animations

---

## Basic Counter

The classic counter example demonstrates Eleva's core concepts: initialization, signals, and event handling.

### Complete Single-File Example

```javascript
import Eleva from "eleva";

// 1. Initialize the application
const app = new Eleva("CounterApp");

// 2. Define a counter component
app.component("Counter", {
  setup({ signal }) {
    // Create reactive state
    const count = signal(0);
    const min = -10;
    const max = 10;

    // Increment with boundary check
    function increment() {
      if (count.value < max) {
        count.value++;
      }
    }

    // Decrement with boundary check
    function decrement() {
      if (count.value > min) {
        count.value--;
      }
    }

    // Reset to initial value
    function reset() {
      count.value = 0;
    }

    // Check if at boundaries
    function isAtMin() {
      return count.value <= min;
    }

    function isAtMax() {
      return count.value >= max;
    }

    return {
      count,
      increment,
      decrement,
      reset,
      isAtMin,
      isAtMax,
      min,
      max
    };
  },

  template: (ctx) => `
    <div class="counter">
      <h2>Counter: ${ctx.count.value}</h2>

      <div class="controls">
        <button
          @click="decrement"
          ${ctx.isAtMin() ? "disabled" : ""}
          title="Minimum: ${ctx.min}"
        >
          − Decrement
        </button>

        <button @click="reset">
          Reset
        </button>

        <button
          @click="increment"
          ${ctx.isAtMax() ? "disabled" : ""}
          title="Maximum: ${ctx.max}"
        >
          + Increment
        </button>
      </div>

      <p class="status">
        ${ctx.isAtMin() ? "At minimum!" :
          ctx.isAtMax() ? "At maximum!" :
          `Range: ${ctx.min} to ${ctx.max}`}
      </p>
    </div>
  `,

  style: `
    .counter { text-align: center; padding: 20px; }
    .counter h2 { font-size: 2rem; margin-bottom: 20px; }
    .controls { display: flex; gap: 10px; justify-content: center; }
    .controls button {
      padding: 10px 20px;
      font-size: 1rem;
      cursor: pointer;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
    }
    .controls button:hover:not(:disabled) { background: #f0f0f0; }
    .controls button:disabled { opacity: 0.5; cursor: not-allowed; }
    .status { color: #666; margin-top: 15px; }
  `
});

// 3. Mount to DOM
app.mount(document.getElementById("app"), "Counter");
```

### HTML File

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Counter App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./main.js"></script>
</body>
</html>
```

---

### With Error Handling

Add error boundaries and validation for production use:

```javascript
app.component("SafeCounter", {
  setup({ signal }) {
    const count = signal(0);
    const error = signal(null);

    function safeUpdate(operation) {
      try {
        error.value = null;
        operation();
      } catch (err) {
        error.value = `Operation failed: ${err.message}`;
        console.error("Counter error:", err);
      }
    }

    function increment() {
      safeUpdate(() => {
        if (typeof count.value !== "number") {
          throw new Error("Count is not a number");
        }
        if (count.value >= Number.MAX_SAFE_INTEGER) {
          throw new Error("Maximum safe integer reached");
        }
        count.value++;
      });
    }

    function decrement() {
      safeUpdate(() => {
        if (typeof count.value !== "number") {
          throw new Error("Count is not a number");
        }
        if (count.value <= Number.MIN_SAFE_INTEGER) {
          throw new Error("Minimum safe integer reached");
        }
        count.value--;
      });
    }

    function setCount(value) {
      safeUpdate(() => {
        const num = parseInt(value, 10);
        if (isNaN(num)) {
          throw new Error("Invalid number");
        }
        count.value = num;
      });
    }

    return { count, error, increment, decrement, setCount };
  },

  template: (ctx) => `
    <div class="counter">
      ${ctx.error.value ? `
        <div class="error-message">
          ${ctx.error.value}
          <button @click="() => error.value = null">Dismiss</button>
        </div>
      ` : ""}

      <h2>Count: ${ctx.count.value}</h2>

      <div class="controls">
        <button @click="decrement">−</button>
        <input
          type="number"
          value="${ctx.count.value}"
          @change="(e) => setCount(e.target.value)"
        />
        <button @click="increment">+</button>
      </div>
    </div>
  `,

  style: `
    .error-message {
      background: #fee;
      color: #c00;
      padding: 10px;
      margin-bottom: 15px;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  `
});
```

---

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Signals** | Reactive state with `.value` accessor |
| **Event Handlers** | Functions in `@click`, `@input`, etc. |
| **Computed Values** | Functions that read signals (e.g., `isAtMin()`) |
| **Immutable Updates** | Replace arrays/objects, don't mutate |

---

## Next Steps

- **[Project Structure](./project-structure.md)** - Multi-file organization
- **[State Patterns](./patterns.md)** - Shopping cart, undo/redo, wizards
- **[Batching & Performance](./batching.md)** - Render optimization

---

[← Back to Patterns](../index.md) | [Project Structure →](./project-structure.md)
