---
title: Getting Started with Eleva.js
description: Learn how to install and create your first Eleva.js application. Step-by-step tutorial covering installation, components, signals, and basic patterns.
---

# Getting Started

> **New to Eleva?** This guide will walk you through installation, creating your first component, and understanding the fundamentals.

---

## Introduction

Eleva is designed to offer a simple yet powerful way to build frontend applications using pure vanilla JavaScript. Its goal is to empower developers who value simplicity, performance, and full control over their application to build modular and high-performance apps without the overhead of larger frameworks.

---

## Design Philosophy

**Eleva is unopinionated.** Unlike many frameworks that enforce a specific project structure or coding paradigm, Eleva provides only the minimal core with a flexible plugin system, leaving architectural decisions in your hands. This means:

- **Flexibility:** Architect your application as you prefer.
- **Native JavaScript:** Enjoy seamless integration with your existing code.
- **Configurability:** Extend functionality with a simple API and plugins.
- **Freedom:** Build both simple and complex applications without unnecessary constraints.

---

## Core Principles

At the heart of Eleva are a few fundamental principles that guide its design and usage:

- **Minimalism:**
  Eleva includes only the essential features needed for building functional, high-performance applications without added complexity.

- **Reactivity:**
  With its signal-based reactivity, Eleva updates only the parts of the UI that change, ensuring smooth and efficient DOM updates.

- **Simplicity:**
  Built using pure vanilla JavaScript, Eleva offers a shallow learning curve and seamless integration with existing projects.

- **Modularity:**
  Each component is self-contained, making your application scalable and maintainable.

- **Flexibility:**
  Eleva's unopinionated nature allows you to choose your own architectural patterns and extend the framework with plugins as needed.

- **Performance:**
  Designed to be lightweight and efficient, Eleva is ideal for performance-critical applications.

---

## Installation

### Via Package Manager

```bash
# npm
npm install eleva

# yarn
yarn add eleva

# pnpm
pnpm add eleva

# bun
bun add eleva
```

### Import Patterns

**Core Framework Only (Recommended):**
```javascript
import Eleva from 'eleva';  // ~6KB - Core framework only
const app = new Eleva("MyApp");
```

**With Individual Plugins (Optional):**
```javascript
import Eleva from 'eleva';
import { Attr } from 'eleva/plugins/attr';      // ~2.4KB
import { Router } from 'eleva/plugins/router';  // ~15KB
import { Store } from 'eleva/plugins/store';    // ~6KB

const app = new Eleva("MyApp");
app.use(Attr);    // Only if needed
app.use(Router);  // Only if needed
app.use(Store);   // Only if needed
```

### Via CDN

```html
<!-- Core framework only (Recommended) -->
<script src="https://cdn.jsdelivr.net/npm/eleva"></script>

<!-- With all plugins (Optional) -->
<script src="https://cdn.jsdelivr.net/npm/eleva/plugins"></script>

<!-- Or individual plugins -->
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/plugins/attr.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/plugins/router.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/plugins/store.umd.min.js"></script>
```

---

## Your First Component: Dynamic Greeting

Let's create a simple component that displays a dynamic greeting message. This is the simplest possible Eleva component with reactive state.

**Step 1: Create the HTML file**

```html
<!DOCTYPE html>
<html>
<head>
  <title>My First Eleva App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./main.js"></script>
</body>
</html>
```

**Step 2: Create the JavaScript file (main.js)**

```javascript
import Eleva from "eleva";

// 1. Create the application instance
const app = new Eleva("GreetingApp");

// 2. Define a component with dynamic state
app.component("Greeting", {
  setup({ signal }) {
    // Create reactive state for the name
    const name = signal("World");

    // Function to update the greeting
    function updateName(newName) {
      name.value = newName;
    }

    // Return state and functions for use in the template
    return { name, updateName };
  },

  template: (ctx) => `
    <div class="greeting">
      <h1>Hello, ${ctx.name.value}!</h1>
      <input
        type="text"
        value="${ctx.name.value}"
        placeholder="Enter your name"
        @input="(e) => updateName(e.target.value)"
      />
      <p>Type in the input to change the greeting message.</p>
    </div>
  `,

  style: `
    .greeting { font-family: system-ui; padding: 20px; }
    .greeting h1 { color: #333; }
    .greeting input { padding: 8px; font-size: 16px; }
  `
});

// 3. Mount the component to the DOM
app.mount(document.getElementById("app"), "Greeting");
```

**What's happening:**

| Step | Code | Purpose |
|------|------|---------|
| 1 | `new Eleva("GreetingApp")` | Create an app instance with a name |
| 2 | `signal("World")` | Create reactive state that triggers re-renders when changed |
| 3 | `name.value = newName` | Update the signal value (triggers re-render) |
| 4 | `${ctx.name.value}` | Display the current signal value in the template |
| 5 | `@input="(e) => ..."` | Bind an event handler to the input |
| 6 | `app.mount(...)` | Render the component into the DOM element |

---

## Simpler Examples

### Static Greeting

If you don't need reactivity, the simplest component is just a template:

```javascript
import Eleva from "eleva";

const app = new Eleva("MyApp");

// Minimal component - just a template
app.component("SimpleGreeting", {
  template: () => `<h1>Hello, Eleva!</h1>`
});

app.mount(document.getElementById("app"), "SimpleGreeting");
```

### Dynamic Greeting with Props

Pass the name as a prop when mounting:

```javascript
app.component("GreetingWithProps", {
  setup({ props }) {
    // Access the name from props (passed during mount)
    return { name: props.name || "Guest" };
  },
  template: (ctx) => `<h1>Hello, ${ctx.name}!</h1>`
});

// Mount with initial props
app.mount(document.getElementById("app"), "GreetingWithProps", { name: "Alice" });
```

---

## Quick Start Tutorial

Below is a step-by-step tutorial with a more complete example. This demonstrates component registration, state creation, event handling, and mounting.

```javascript
import Eleva from "eleva";

const app = new Eleva("MyApp");

// Define a component with state and interactivity
app.component("HelloWorld", {
  setup({ signal }) {
    const count = signal(0);
    return { count };
  },
  template: (ctx) => `
    <div>
      <h1>Hello, Eleva!</h1>
      <p>Count: ${ctx.count.value}</p>
      <button @click="() => count.value++">Increment</button>
    </div>
  `,
});

// Mount the component to a DOM element
app.mount(document.getElementById("app"), "HelloWorld");
```

**Mounting Options:**

```javascript
// Mount using DOM element directly
app.mount(document.getElementById("app"), "HelloWorld");

// Mount with async handling
app.mount(document.getElementById("app"), "HelloWorld")
  .then((instance) => console.log("Mounted:", instance));
```

For interactive demos, check out the [CodePen Example](https://codepen.io/tarekraafat/pen/GgRrxdY?editors=1010).

---

## Performance Benchmarks

### 240fps+ Ready - The Framework Is Never the Bottleneck

Eleva is built for high-performance applications. With an average render time of **0.011ms**, Eleva can theoretically achieve **90,000+ fps** for simple updates:

| FPS Target | Frame Budget | Eleva Capability | Status |
|------------|--------------|------------------|:------:|
| **60 fps** | 16.67ms | ~1,500 renders possible | Yes |
| **120 fps** | 8.33ms | ~750 renders possible | Yes |
| **240 fps** | 4.17ms | ~380 renders possible | Yes |

**FPS Throughput Benchmarks:**

| Scenario | Ops/Second | Avg Render Time | 240fps Ready? |
|----------|-----------|-----------------|:-------------:|
| Simple counter | 32,815 | 0.030ms | Yes |
| Position animation (2 signals) | 45,072 | 0.022ms | Yes |
| 5 signals batched | 34,290 | 0.029ms | Yes |
| 100-item list | 1,628 | 0.614ms | Yes |
| Complex nested template | 7,146 | 0.140ms | Yes |

Even the **heaviest scenario** (100-item list at 0.614ms) comfortably fits within a 240fps frame budget of 4.17ms.

### js-framework-benchmark Comparison

Benchmarks using [js-framework-benchmark](https://krausest.github.io/js-framework-benchmark/) methodology (1,000 rows):

| **Framework** | **Bundle Size (min+gzip)** | **Create 1K Rows** (ms) | **Partial Update** (ms) | **Memory** (MB) |
| ------------- | -------------------------- | ----------------------- | ----------------------- | --------------- |
| **Eleva 1.0** | **~2.3KB** | **~25** | ~86 | **~0.5** |
| **React 19** | ~44KB | 40-70 | 10-20 | 2-5 |
| **Vue 3.5** | ~45KB | 25-45 | 5-15 | 2-4 |
| **Angular 19** | ~90KB | 50-80 | 15-25 | 3-6 |

**Performance Tips:**
- Use `key` attribute on list items for optimal diffing
- Eleva excels at initial renders and memory efficiency
- For large lists, use keyed reconciliation in a single template
- For 10K+ rows, use [virtual scrolling](./examples/patterns/best-practices/performance.md#virtual-scrolling-10k-rows)

---

## Browser Support

Eleva targets **modern evergreen browsers** and requires no polyfills for supported environments.

### Supported Browsers

| Browser | Minimum Version | Release Date |
|---------|-----------------|--------------|
| **Chrome** | 71+ | Dec 2018 |
| **Firefox** | 69+ | Sep 2019 |
| **Safari** | 12.1+ | Mar 2019 |
| **Edge** | 79+ (Chromium) | Jan 2020 |
| **Opera** | 58+ | Jan 2019 |
| **iOS Safari** | 12.2+ | Mar 2019 |
| **Chrome Android** | 71+ | Dec 2018 |

### Key JavaScript Features Used

| Feature | Purpose in Eleva |
|---------|------------------|
| `queueMicrotask()` | Batched rendering scheduler |
| `Map` / `Set` | Internal state management |
| ES6 Classes | Component architecture |
| Template Literals | Template system |
| Async/Await | Lifecycle hooks |
| Optional Chaining (`?.`) | Safe property access |
| Spread Operator | Props and context merging |

> **Note:** As of 2024, the supported browsers cover approximately **96%+ of global web traffic** according to [caniuse.com](https://caniuse.com/mdn-api_queuemicrotask).

---

## Next Steps

Now that you have Eleva installed and have created your first component, explore these topics:

- **[Core Concepts](./core-concepts.md)** - Signals, templates, lifecycle hooks
- **[Components](./components.md)** - Registration, children, props, styles
- **[Architecture](./architecture.md)** - Data flow and visual diagrams
- **[Examples](./examples/index.md)** - Patterns and complete applications
- **[Plugins](./plugins/index.md)** - Router, Store, and Attr plugins

---

[← Home](./index.md) | [Core Concepts →](./core-concepts.md)
