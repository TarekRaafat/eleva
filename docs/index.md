# Eleva.js - Pure JavaScript, Pure Performance

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/tarekraafat/eleva?label=github)](https://github.com/TarekRaafat/eleva)
[![Version](https://img.shields.io/npm/v/eleva.svg?style=flat)](https://www.npmjs.com/package/eleva)
![100% Javascript](https://img.shields.io/github/languages/top/TarekRaafat/eleva?color=yellow)
![Zero Dependencies](https://img.shields.io/badge/dependencies-0-green.svg)
[![Minified Size](https://badgen.net/bundlephobia/min/eleva@latest)](https://bundlephobia.com/package/eleva@latest)
[![Gzipped Size](https://badgen.net/bundlephobia/minzip/eleva@latest)](https://bundlephobia.com/package/eleva@latest)

<br>
<br>

<p align="center">
  <a href="https://tarekraafat.github.io/eleva/"><img src="./imgs/Eleva Logo.png" alt="Eleva Logo" width="50%"></a>
</p>

<p align="center">
  <a href="https://www.producthunt.com/posts/eleva?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-eleva" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=938663&theme=light&t=1741247713068" alt="Eleva - A&#0032;minimalist&#0044;&#0032;pure&#0032;vanilla&#0032;javascript&#0032;frontend&#0032;framework&#0046; | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
</p>

<br>
<br>

Welcome to the official documentation for **Eleva**, a minimalist, lightweight, pure vanilla JavaScript frontend runtime framework. Whether you’re new to JavaScript or an experienced developer, this guide will help you understand Eleva’s core concepts, architecture, and how to integrate and extend it in your projects.

---

## Table of Contents

- [Eleva.js - Pure JavaScript, Pure Performance](#elevajs---pure-javascript-pure-performance)
  - [Table of Contents](#table-of-contents)
  - [1. Introduction](#1-introduction)
  - [2. Design Philosophy](#2-design-philosophy)
  - [3. Core Principles](#3-core-principles)
  - [4. Performance Benchmarks](#4-performance-benchmarks)
  - [5. Getting Started](#5-getting-started)
    - [Installation](#installation)
    - [Quick Start Tutorial](#quick-start-tutorial)
  - [6. Core Concepts](#6-core-concepts)
    - [TemplateEngine](#templateengine)
    - [Template Interpolation](#template-interpolation)
    - [Setup Context vs. Event Context](#setup-context-vs-event-context)
      - [Setup Context](#setup-context)
      - [Event Context](#event-context)
    - [Signal (Reactivity)](#signal-reactivity)
    - [Emitter (Event Handling)](#emitter-event-handling)
    - [Renderer (DOM Diffing)](#renderer-dom-diffing)
    - [Eleva (Core)](#eleva-core)
    - [Lifecycle Hooks](#lifecycle-hooks)
    - [Component Registration \& Mounting](#component-registration--mounting)
    - [Children Components \& Passing Props](#children-components--passing-props)
    - [Style Injection \& Scoped CSS](#style-injection--scoped-css)
    - [Inter-Component Communication](#inter-component-communication)
  - [7. Architecture \& Data Flow](#7-architecture--data-flow)
    - [Key Components](#key-components)
    - [Data Flow Process](#data-flow-process)
    - [Visual Overview](#visual-overview)
    - [Benefits](#benefits)
  - [8. Plugin System](#8-plugin-system)
    - [Creating a Plugin](#creating-a-plugin)
    - [Plugin Architecture](#plugin-architecture)
  - [9. Debugging \& Developer Tools](#9-debugging--developer-tools)
  - [10. Best Practices \& Use Cases](#10-best-practices--use-cases)
    - [Best Practices](#best-practices)
    - [Use Cases](#use-cases)
  - [11. Examples and Tutorials](#11-examples-and-tutorials)
  - [12. FAQ](#12-faq)
  - [13. Troubleshooting \& Migration Guidelines](#13-troubleshooting--migration-guidelines)
    - [Troubleshooting](#troubleshooting)
    - [Migration Guidelines](#migration-guidelines)
  - [14. API Reference](#14-api-reference)
  - [15. Contributing](#15-contributing)
  - [16. Community \& Support](#16-community--support)
  - [17. Changelog](#17-changelog)
  - [18. License](#18-license)

---

## 1. Introduction

Eleva is designed to offer a simple yet powerful way to build frontend applications using pure vanilla JavaScript. Its goal is to empower developers who value simplicity, performance, and full control over their application to build modular and high-performance apps without the overhead of larger frameworks.

---

## 2. Design Philosophy

**Eleva is unopinionated.** Unlike many frameworks that enforce a specific project structure or coding paradigm, Eleva provides only the minimal core with a flexible plugin system, leaving architectural decisions in your hands. This means:

- **🔄 Flexibility:** Architect your application as you prefer.
- **🎯 Native JavaScript:** Enjoy seamless integration with your existing code.
- **⚙️ Configurability:** Extend functionality with a simple API and plugins.
- **🆓 Freedom:** Build both simple and complex applications without unnecessary constraints.

---

## 3. Core Principles

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
  Eleva’s unopinionated nature allows you to choose your own architectural patterns and extend the framework with plugins as needed.

- **Performance:**  
  Designed to be lightweight and efficient, Eleva is ideal for performance-critical applications.

---

## 4. Performance Benchmarks

Preliminary benchmarks illustrate Eleva’s efficiency compared to popular frameworks:

| **Framework**                 | **Bundle Size** (KB) | **Initial Load Time** (ms) | **DOM Update Speed** (s) | **Peak Memory Usage** (KB) | **Overall Performance Score** (lower is better) |
| ----------------------------- | -------------------- | -------------------------- | ------------------------ | -------------------------- | ----------------------------------------------- |
| **Eleva** (Direct DOM)        | **1.8**              | **10**                     | **0.018**                | **0.25**                   | **3.02 (Best)**                                 |
| **React** (Virtual DOM)       | 42                   | 40                         | 0.020                    | 0.25                       | 20.57                                           |
| **Vue** (Reactive State)      | 33                   | 35                         | 0.021                    | 3.10                       | 17.78                                           |
| **Angular** (Two-way Binding) | 80                   | 100                        | 0.021                    | 0.25                       | 45.07 (Slowest)                                 |

Detailed [Benchmark Metrics Report](https://github.com/TarekRaafat/eleva/blob/master/BENCHMARK.md)

> ⚠️ **Disclaimer:** Benchmarks are based on internal tests and may vary by project and environment.

---

## 5. Getting Started

### Installation

Install via npm:

```bash
npm install eleva
```

Or include via CDN:

```html
<!-- jsDelivr (Recommended) -->
<script src="https://cdn.jsdelivr.net/npm/eleva"></script>
```

or

```html
<!-- unpkg -->
<script src="https://unpkg.com/eleva/dist/eleva.min.js"></script>
```

### Quick Start Tutorial

Below is a step-by-step tutorial to help you get started. This example demonstrates component registration, state creation, and mounting using a DOM element (not a selector), with asynchronous handling.

```js
import Eleva from "eleva";

const app = new Eleva("MyApp");

// Define a simple component
app.component("HelloWorld", {
  // Optional setup: if omitted, Eleva defaults to an empty state
  setup({ signal }) {
    const count = signal(0);
    return { count };
  },
  template: (ctx) => `
    <div>
      <h1>Hello, Eleva! 👋</h1>
      <p>Count: ${ctx.count.value}</p>
      <button @click="() => count.value++">Increment</button>
    </div>
  `,
});

// Mount the component by providing a DOM element and handling the returned Promise
app
  .mount(document.getElementById("app"), "HelloWorld")
  .then((instance) => console.log("Component mounted:", instance));
```

For interactive demos, check out the [CodePen Example](https://codepen.io/tarekraafat/pen/GgRrxdY?editors=1010).

---

## 6. Core Concepts

### TemplateEngine

The **TemplateEngine** is responsible for parsing templates and evaluating embedded expressions.

- **`parse(template, data)`**: Replaces `{{ expression }}` with values from `data`.
- **`evaluate(expr, data)`**: Safely evaluates JavaScript expressions within the provided context.

_Example:_

```js
const template = "Hello, {{ name }}!";
const data = { name: "World" };
const output = TemplateEngine.parse(template, data);
console.log(output); // "Hello, World!"
```

### Template Interpolation

Eleva supports two methods for dynamic content:

1. **Native Template Literals (`${...}`):**  
   Evaluated once, providing static content.

_Example:_

```js
const greeting = `Hello, ${name}!`; // Evaluates to "Hello, World!" if name is "World"
```

2. **Handlebars-like Syntax (`{{...}}`):**  
   Enables dynamic, reactive updates.

```html
<p>Hello, {{ name }}!</p>
```

**When to Use Each:**

- Use **`${...}`** for one-time, static content.
- Use **`{{...}}`** for dynamic, reactive data binding.

### Setup Context vs. Event Context

Understanding how data flows during component initialization and event handling is key:

#### Setup Context

- **When It’s Used:**
  Passed to the component’s `setup` function during initialization.
- **What It Contains:**
  Utilities (like the `signal` function), component props, emitter, and lifecycle hooks. The returned data forms the component’s reactive state.

_Example:_

```js
const MyComponent = {
  setup: ({ signal }) => {
    const counter = signal(0);
    return { counter };
  },
  template: (ctx) => `
    <div>
      <p>Counter: ${ctx.counter.value}</p>
    </div>
  `,
};
```

#### Event Context

- **When It’s Used:**
  Provided when an event handler is triggered (e.g., a button click).
- **What It Contains:**
  The reactive state from `setup` along with event-specific data (like `event.target`).

_Example:_

```js
const MyComponent = {
  setup: ({ signal }) => {
    const counter = signal(0);
    function increment(event) {
      console.log("Event type:", event.type);
      counter.value++;
    }
    return { counter, increment };
  },
  template: (ctx) => `
    <div>
      <p>Counter: ${ctx.counter.value}</p>
      <button @click="increment">Increment</button>
    </div>
  `,
};
```

### Signal (Reactivity)

The **Signal** provides fine-grained reactivity by updating only the affected DOM parts.

- **Constructor:** `new Signal(initialValue)` creates a reactive data holder.
- **Getter/Setter:** Access or update via `signal.value`.
- **Watch:** `signal.watch(callback)` registers a function to execute on changes.

_Example:_

```js
const count = new Signal(0);
count.watch((newVal) => console.log("Count updated:", newVal));
count.value = 1; // Logs: "Count updated: 1"
```

### Emitter (Event Handling)

The **Emitter** enables inter-component communication through events and using a publish–subscribe pattern.

- **`on(event, handler)`**: Registers an event handler.
- **`off(event, handler)`**: Removes an event handler.
- **`emit(event, ...args)`**: Emits an event with optional arguments.

_Example:_

```js
on("greet", (name) => console.log(`Hello, ${name}!`)); // Logs: "Hello, Alice!"
emit("greet", "Alice");
```

### Renderer (DOM Diffing)

The **Renderer** efficiently updates the DOM through diffing and patching.

- **`patchDOM(container, newHtml)`**: Updates container content with the new HTML.
- **`diff(oldParent, newParent)`**: Applies updates by comparing DOM trees.
- **`updateAttributes(oldEl, newEl)`**: Synchronizes element attributes.

### Eleva (Core)

The **Eleva** class orchestrates component registration, mounting, plugin integration, lifecycle management, and events.

- **`new Eleva(name, config)`**: Creates an instance.
- **`use(plugin, options)`**: Integrates a plugin.
- **`component(name, definition)`**: Registers a new component.
- **`mount(container, compName, props)`**: Mounts a component to a DOM element (returns a Promise).

### Lifecycle Hooks

Execute code at various stages of a component’s lifecycle:

- **onBeforeMount:** Called before mounting.
- **onMount:** Called after mounting.
- **onBeforeUpdate:** Called before an update.
- **onUpdate:** Called after an update.
- **onUnmount:** Called before unmounting.

_Example:_

```js
const MyComponent = {
  setup: ({ signal, onMount, onUnmount }) => {
    const counter = signal(0);
    onMount(() => console.log("Component mounted"));
    onUnmount(() => console.log("Component unmounted"));
    return { counter };
  },
  template: (ctx) => `<div>Counter: ${ctx.counter}</div>`,
};
```

### Component Registration & Mounting

Register components globally or directly, then mount using a DOM element.

_Example (Global Registration):_

```js
const app = new Eleva("MyApp");
app.component("HelloWorld", {
  setup({ signal }) {
    const count = signal(0);
    return { count };
  },
  template: (ctx) => `
    <div>
      <h1>Hello, Eleva! 👋</h1>
      <p>Count: ${ctx.count.value}</p>
      <button @click="() => count.value++">Increment</button>
    </div>
  `,
});
app.mount(document.getElementById("app"), "HelloWorld").then((instance) => {
  console.log("Component mounted:", instance);
});
```

_Example (Direct Component Definition):_

```js
const DirectComponent = {
  template: () => `<div>No setup needed!</div>`,
};

const app = new Eleva("MyApp");
app
  .mount(document.getElementById("app"), DirectComponent)
  .then((instance) => console.log("Mounted Direct:", instance));
```

### Children Components & Passing Props

Eleva allows you to nest components. A parent can include child components in its template and pass data to them via props.
Attributes prefixed with `eleva-prop-` are automatically parsed as props.

_Example:_

```js
// Define the Child Component
const ChildComponent = {
  setup: (context) => {
    // Access props from the context
    const { title } = context.props;
    return { title };
  },
  template: (ctx) => `
    <div>
      <p>Child Component Title: ${ctx.title}</p>
    </div>
  `,
};

// Define the Parent Component with local child registration
const ParentComponent = {
  template: () => `
    <div>
      <h1>Parent Component</h1>
      <child-comp eleva-prop-title="Hello from Parent"></child-comp>
    </div>
  `,
  children: {
    "child-comp": ChildComponent,
  },
};

const app = new Eleva("TestApp");
app.component("parent-comp", ParentComponent);
app.mount(document.getElementById("app"), "parent-comp");
```

### Style Injection & Scoped CSS

Eleva supports component-scoped styling through an optional `style` function defined in a component.
The styles are injected into the component’s container to avoid global leakage.

_Example:_

```js
const MyComponent = {
  style: (ctx) => `
    .my-component {
      color: blue;
      padding: {{ctx.padding}}rem;
    }
  `,
  template: (ctx) => `<div class="my-component">Styled Component</div>`,
};
```

### Inter-Component Communication

Inter-component communication is facilitated by the built-in **Emitter**. Components can publish and subscribe to events, enabling decoupled interactions.

_Example:_

```js
// Component A emits an event
app.component("ComponentA", {
  setup: ({ emitter }) => {
    function sendMessage() {
      emitter.emit("customEvent", "Hello from A");
    }
    return { sendMessage };
  },
  template: () => `<button @click="sendMessage">Send Message</button>`,
});

// Component B listens for the event
app.component("ComponentB", {
  setup: ({ emitter }) => {
    emitter.on("customEvent", (msg) => console.log(msg));
    return {};
  },
  template: () => `<div>Component B</div>`,
});

app.mount(document.getElementById("app"), "ComponentA");
app.mount(document.getElementById("app"), "ComponentB");
```

---

## 7. Architecture & Data Flow

Eleva’s design emphasizes clarity, modularity, and performance. This section explains how data flows through the framework and how its key components interact, providing more clarity on the underlying mechanics.

### Key Components

1. **Component Definition:**  
   Components are plain JavaScript objects that describe a UI segment. They typically include:

   - A **`template`** function that returns HTML with interpolation placeholders.
   - An optional **`setup()`** function for initializing state (using reactive signals).
   - An optional **`style`** function for scoped CSS.
   - An optional **`children`** object for nested components.

2. **Signals (Reactivity):**
   Signals are reactive data holders that notify watchers when their values change, triggering re-renders of the affected UI.

3. **TemplateEngine (Rendering):**
   This module processes template strings by replacing placeholders (e.g., `{{ count }}`) with live data, enabling dynamic rendering.

4. **Renderer (DOM Diffing and Patching):**
   The Renderer compares the new virtual DOM with the current DOM and patches only the parts that have changed, ensuring high performance and efficient updates.

5. **Emitter (Event Handling):**
   The Emitter implements a publish–subscribe pattern to allow components to communicate by emitting and listening to custom events.

### Data Flow Process

1. **Initialization:**

   - **Registration:** Components are registered via `app.component()`.
   - **Mounting:** `app.mount()` creates a context (including props, lifecycle hooks, and an `emitter` property) and executes `setup()` (if present) to create a reactive state.

2. **Rendering:**

   - The **template** function is called with the combined context and reactive state.
   - The **TemplateEngine** parses the template, replacing expressions like `{{ count }}` with the current values.
   - The **Renderer** takes the resulting HTML and patches it into the DOM, ensuring only changes are applied.

3. **Reactivity:**

   - When a signal’s value changes (e.g., through a user event), its watcher triggers a re-run of the template.
   - The Renderer diffs the new HTML against the current DOM and applies only the necessary changes.

4. **Events:**
   - Eleva binds event listeners (e.g., `@click`) during rendering.
   - When an event occurs, the handler is executed with the current state and event details.
   - Components can also emit custom events via the Emitter for cross-component communication.

### Visual Overview

```
[Component Registration]
         │
         ▼
[Mounting & Context Creation]
         │
         ▼
[setup() Execution]
         │
         ▼
[Template Function Produces HTML]
         │
         ▼
[TemplateEngine Processes HTML]
         │
         ▼
[Renderer Patches the DOM] ◂────────┐
         │                          │
         ▼                          │
[User Interaction / Signal Change]  │
         │                          │
         ▼                          │ ↺
[Signal Watchers Trigger Re-render] │
         │                          │
         ▼                          │
[Renderer Diffs the DOM]   ─────────┘
```

### Benefits

- **Modularity:** Each component encapsulates its own logic and state, making it easy to reuse and maintain.
- **Efficiency:** Only the changed parts of the DOM are updated, ensures smooth performance even in complex applications.
- **Predictability:** One-way data flow (state → template → DOM) simplifies debugging.
- **Extensibility:** Clear separation of concerns facilitates custom logic and plugins.

---

## 8. Plugin System

### Creating a Plugin

A plugin is an object with an `install` method:

```js
const MyPlugin = {
  install(eleva, options) {
    // Extend Eleva functionality here
    eleva.myPluginFeature = function () {
      // Plugin logic
    };
  },
};

export default MyPlugin;
```

### Plugin Architecture

Plugins can:

- Modify or extend the Eleva instance.
- Add new methods or properties.
- Enhance component behavior.

This modular approach makes Eleva highly customizable.

---

## 9. Debugging & Developer Tools

- **Console Logging:** Use `console.log` in lifecycle hooks and event handlers.
- **Watchers:** Utilize signal watchers to monitor state changes.
- **Browser Dev Tools:** Inspect the DOM and network activity.
- **Verbose Mode:** Enable debug mode for detailed logs.
- **Error Handling:** Wrap code in try-catch blocks where necessary.

---

## 10. Best Practices & Use Cases

### Best Practices

- **Modularity:** Build your application using small, reusable components.
- **Reactivity:** Use signals to update only the necessary parts of your UI.
- **Simplicity:** Keep templates clean and logic minimal.
- **Testing:** Write tests for components and plugins.
- **Documentation:** Maintain clear documentation for your application and custom plugins.

### Use Cases

- **Small to Medium Projects:** Ideal for lightweight apps and websites where performance matters.
- **Performance-Critical Applications:** Low bundle size and fast rendering are essential.
- **Rapid Prototyping:** Quick experimentation and proof-of-concept projects.
- **Highly Customizable Solutions:** Benefit from Eleva's unopinionated architecture to tailor the framework using plugins and custom logic.

---

## 11. Examples and Tutorials

Explore these guides for real-world examples:

- [Basic Counter Example](https://github.com/TarekRaafat/eleva/blob/master/examples/counter.md)
- [Todo App Example](https://github.com/TarekRaafat/eleva/blob/master/examples/todo-app.md)
- [Creating a Custom Plugin](https://github.com/TarekRaafat/eleva/blob/master/examples/custom-plugin.md)

Interactive demos are also available on Eleva's [CodePen Collection](https://codepen.io/collection/dGGqWr) for you to experiment live.

---

## 12. FAQ

**Q: Is Eleva production-ready?**
_A:_ Not yet—Eleva is currently in alpha. While it's a powerful tool, expect changes until a stable release is announced.

**Q: How do I report issues or request features?**
_A:_ Please use the [GitHub Issues](https://github.com/TarekRaafat/eleva/issues) page.

**Q: Can I use Eleva with TypeScript?**
_A:_ Absolutely! Eleva includes built-in TypeScript declarations to help keep your codebase strongly typed.

---

## 13. Troubleshooting & Migration Guidelines

### Troubleshooting

- **Common Issues:**

  - Check your console for error messages.
  - Verify that the correct DOM element is passed to `mount()`.
  - Ensure that component names and definitions are correct.

### Migration Guidelines

- **Review Breaking Changes:** Always check the changelog when upgrading.
- **Update Deprecated Features:** Adjust your code to remove any deprecated API usage.
- **Thorough Testing:** Test your application after each upgrade to catch potential issues.

---

## 14. API Reference

Detailed API documentation with parameter descriptions, return values, and usage examples can be found in the [docs](https://github.com/TarekRaafat/eleva/blob/master/docs/index.md) folder.

- **TemplateEngine:**  
  `parse(template, data)` and `evaluate(expr, data)`

- **Signal:**  
  `new Signal(value)`, getter/setter for `signal.value`, and `signal.watch(fn)`

- **Emitter:**  
  Methods: `on(event, handler)`, `off(event, handler)`, and `emit(event, ...args)`

- **Renderer:**  
  Methods: `patchDOM(container, newHtml)`, `diff(oldParent, newParent)`, and `updateAttributes(oldEl, newEl)`

- **Eleva (Core):**  
  `new Eleva(name, config)`, `use(plugin, options)`, `component(name, definition)`, and `mount(container, compName, props)`

> **Note:** In v1.2.0-alpha, the mounting context now includes an `emitter` property (instead of separate `emit` and `on` functions). Use `context.emitter.on(...)` and `context.emitter.emit(...)` for event handling.

---

## 15. Contributing

Contributions are welcome! Whether you're fixing bugs, adding features, or improving documentation, your input is invaluable. Please checkout the [CONTRIBUTING](https://github.com/TarekRaafat/eleva/blob/master/CONTRIBUTING.md) file for detailed guidelines on how to get started.

---

## 16. Community & Support

Join our community for support, discussions, and collaboration:

- **GitHub Discussions:** For general questions or new ideas please start a discussion on [Eleva Discussions](https://github.com/TarekRaafat/eleva/discussions)
- **GitHub Issues:** Report bugs or request features on [GitHub Issues](https://github.com/TarekRaafat/eleva/issues)
- **Stack Overflow:** For technical questions and support, please post your question on Stack Overflow using any of these tags [eleva](https://stackoverflow.com/questions/tagged/eleva), [eleva.js](https://stackoverflow.com/questions/tagged/eleva.js)
- **Telegram:** For general questions, new ideas please, or even support join us on our [Telegram](https://t.me/+TcMXcHsRX9tkMmI0) group for realtime feedback.

---

## 17. Changelog

For a detailed log of all changes and updates, please refer to the [Changelog](https://github.com/TarekRaafat/eleva/blob/master/CHANGELOG.md).

> **Latest Update (v1.2.2-alpha):**
>
> - Documentation Updates

---

## 18. License

Eleva is open-source and available under the [MIT License](https://github.com/TarekRaafat/eleva/blob/master/LICENSE).

---

Thank you for exploring Eleva! I hope this documentation helps you build amazing, high-performance frontend applications using pure vanilla JavaScript. For further information, interactive demos, and community support, please visit the [GitHub Discussions](https://github.com/TarekRaafat/eleva/discussions) page.
