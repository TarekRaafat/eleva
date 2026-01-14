---
title: Project Structure
description: Eleva.js multi-file application structure, component organization, and testing patterns.
---

# Multi-File Application Structure

> **Version:** 1.0.0 | Organizing larger Eleva applications into separate files.

For larger applications, organize your code into separate files for maintainability.

---

## Recommended Project Structure

```
my-eleva-app/
├── index.html
├── src/
│   ├── main.js              # App initialization and mounting
│   ├── app.js               # Eleva instance (shared)
│   ├── components/
│   │   ├── Counter.js       # Counter component
│   │   ├── Header.js        # Header component
│   │   └── index.js         # Export all components
│   ├── utils/
│   │   └── helpers.js       # Utility functions
│   └── styles/
│       └── main.css         # Global styles
└── package.json
```

---

## Implementation

### src/app.js - Shared Eleva instance

```javascript
import Eleva from "eleva";

// Create and export the app instance
export const app = new Eleva("MyApp");
```

### src/components/Counter.js - Counter component

```javascript
import { app } from "../app.js";

// Define the component
const Counter = {
  setup({ signal, props }) {
    const count = signal(props.initialValue || 0);
    const step = props.step || 1;

    const increment = () => { count.value += step; };
    const decrement = () => { count.value -= step; };
    const reset = () => { count.value = props.initialValue || 0; };

    return { count, step, increment, decrement, reset };
  },

  template: (ctx) => `
    <div class="counter">
      <h3>${ctx.props.label || "Counter"}</h3>
      <p>Value: ${ctx.count.value}</p>
      <button @click="decrement">-${ctx.step}</button>
      <button @click="reset">Reset</button>
      <button @click="increment">+${ctx.step}</button>
    </div>
  `
};

// Register with the app
app.component("Counter", Counter);

// Export for testing or direct use
export default Counter;
```

### src/components/Header.js - Header component

```javascript
import { app } from "../app.js";

const Header = {
  template: (ctx) => `
    <header>
      <h1>${ctx.props.title || "My App"}</h1>
      <nav>
        <a href="#/">Home</a>
        <a href="#/about">About</a>
      </nav>
    </header>
  `
};

app.component("Header", Header);
export default Header;
```

### src/components/index.js - Export all components

```javascript
// Import components to register them with the app
import "./Counter.js";
import "./Header.js";

// Re-export for direct imports if needed
export { default as Counter } from "./Counter.js";
export { default as Header } from "./Header.js";
```

### src/main.js - Application entry point

```javascript
import { app } from "./app.js";

// Import all components (registers them with app)
import "./components/index.js";

// Define the root component
app.component("App", {
  template: () => `
    <div class="app">
      <Header :title="'Counter Demo'" />
      <main>
        <Counter :label="'Main Counter'" :initialValue="0" :step="1" />
        <Counter :label="'By Fives'" :initialValue="0" :step="5" />
      </main>
    </div>
  `,
  children: {
    "Header": "Header",
    "Counter": "Counter"
  }
});

// Mount the application
async function init() {
  try {
    await app.mount(document.getElementById("app"), "App");
    console.log("App mounted successfully");
  } catch (error) {
    console.error("Failed to mount app:", error);
    document.getElementById("app").innerHTML = `
      <div class="error">
        <h1>Application Error</h1>
        <p>Failed to load the application. Please refresh the page.</p>
        <pre>${error.message}</pre>
      </div>
    `;
  }
}

init();
```

---

## Testing Components

```javascript
// src/components/Counter.test.js
import { describe, it, expect, beforeEach } from "vitest";
import Eleva from "eleva";

describe("Counter Component", () => {
  let app;
  let container;

  beforeEach(() => {
    app = new Eleva("TestApp");
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("should increment count", async () => {
    app.component("Counter", {
      setup: ({ signal }) => {
        const count = signal(0);
        return {
          count,
          increment: () => count.value++
        };
      },
      template: (ctx) => `
        <div>
          <span class="count">${ctx.count.value}</span>
          <button @click="increment">+</button>
        </div>
      `
    });

    await app.mount(container, "Counter");

    expect(container.querySelector(".count").textContent).toBe("0");

    container.querySelector("button").click();
    await new Promise(r => queueMicrotask(r));

    expect(container.querySelector(".count").textContent).toBe("1");
  });
});
```

---

## File Organization Guidelines

| File Type | Location | Purpose |
|-----------|----------|---------|
| **Eleva instance** | `src/app.js` | Shared app instance |
| **Components** | `src/components/*.js` | Individual component files |
| **Component registry** | `src/components/index.js` | Import & re-export all |
| **Entry point** | `src/main.js` | App init & mounting |
| **Utilities** | `src/utils/*.js` | Shared helper functions |
| **Styles** | `src/styles/*.css` | Global styles |

---

## Benefits of This Structure

1. **Separation of concerns** - Each component in its own file
2. **Testability** - Components can be tested in isolation
3. **Reusability** - Components can be imported elsewhere
4. **Maintainability** - Easy to find and modify code
5. **Tree-shaking** - Unused components can be excluded

---

[← Overview](./index.md) | [State Patterns →](./patterns.md)
