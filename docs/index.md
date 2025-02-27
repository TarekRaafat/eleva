# Eleva Documentation

Welcome to the official documentation for **Eleva**, a minimalist, lightweight, pure vanilla JavaScript frontend runtime framework. This guide is designed to help you understand how Eleva works, how to integrate it into your projects, and how to extend its functionality through plugins.

---

## Table of Contents

- [Eleva Documentation](#eleva-documentation)
  - [Table of Contents](#table-of-contents)
  - [1. Introduction](#1-introduction)
  - [2. Design Philosophy](#2-design-philosophy)
  - [3. Getting Started](#3-getting-started)
    - [Installation](#installation)
    - [Quick Start Guide](#quick-start-guide)
  - [4. Core Concepts](#4-core-concepts)
    - [TemplateEngine](#templateengine)
    - [Template Interpolation](#template-interpolation)
    - [Setup Context vs. Event Context](#setup-context-vs-event-context)
      - [Setup Context](#setup-context)
      - [Event Context](#event-context)
    - [Signal](#signal)
    - [Emitter](#emitter)
    - [Renderer](#renderer)
      - [Diffing Algorithm \& Renderer Details](#diffing-algorithm--renderer-details)
    - [Eleva (Core)](#eleva-core)
    - [Lifecycle Hooks](#lifecycle-hooks)
    - [Component Registration \& Mounting](#component-registration--mounting)
    - [Children Components \& Passing Props](#children-components--passing-props)
    - [Style Injection \& Scoped CSS](#style-injection--scoped-css)
    - [Inter-Component Communication](#inter-component-communication)
  - [5. Plugin System](#5-plugin-system)
    - [Creating a Plugin](#creating-a-plugin)
    - [Plugin Architecture](#plugin-architecture)
  - [6. Debugging \& Developer Tools](#6-debugging--developer-tools)
  - [7. Best Practices \& Use Cases](#7-best-practices--use-cases)
    - [Best Practices](#best-practices)
    - [Use Cases](#use-cases)
  - [8. Examples and Tutorials](#8-examples-and-tutorials)
  - [9. FAQ](#9-faq)
  - [10. Version Guide](#10-version-guide)
    - [Migration Guidelines](#migration-guidelines)
  - [11. Contributing](#11-contributing)
  - [12. Changelog](#12-changelog)
  - [13. License](#13-license)

---

## 1. Introduction

Eleva is designed to offer a simple yet powerful way to build frontend applications using pure vanilla JavaScript. Born from a passion for native JavaScript, Eleva stays true to the language by avoiding unnecessary syntax or bloat. Its goal is to empower you to build modular and high-performance apps without the overhead of larger frameworks.

---

## 2. Design Philosophy

**Eleva is an unopinionated library.**

Unlike many frameworks that enforce a specific project structure or coding paradigm, Eleva provides a minimal core with a flexible plugin system. This means:

- **🔄 Flexibility:** You’re free to architect your application as you see fit, without being forced into a rigid structure.
- **🎯 Native JavaScript:** Eleva is built using pure vanilla JavaScript, so it integrates seamlessly with your existing code without introducing unfamiliar syntax.
- **⚙️ Configurability:** With a simple API and optional plugins, you can extend Eleva's functionality to suit your project's unique requirements.
- **🆓 Freedom:** You decide the best way to implement features, allowing for both simple and complex applications without unnecessary constraints.

This unopinionated approach makes Eleva versatile and ideal for developers who prefer to have full control over their application's design.

---

## 3. Getting Started

### Installation

You can install Eleva via npm:

```bash
npm install eleva
```

Or include it directly in your HTML via a CDN:

```html
<!-- unpkg -->
<script src="https://unpkg.com/eleva/dist/eleva.min.js"></script>
```

```html
<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/eleva.min.js"></script>
```

### Quick Start Guide

Below is a minimal example to help you get started. Notice that the `mount` method now expects a DOM element as the first argument (instead of a CSS selector string) and returns a Promise, ensuring consistent asynchronous handling:

```js
import Eleva from "eleva";

const app = new Eleva("MyApp");

// Register a component
app.component("HelloWorld", {
  // The setup method is now optional; if omitted, an empty object is used as state.
  setup({ signal }) {
    const count = signal(0);
    return { count };
  },
  template: (ctx) => `
    <div>
      <h1>Hello, Eleva! 👋</h1>
      <p>Count: ${ctx.count}</p>
      <button @click="() => count++">Increment</button>
    </div>
  `,
});

// Mount the component by providing a DOM element
app.mount(document.getElementById("app"), "HelloWorld").then((instance) => {
  console.log("Component mounted:", instance);
});
```

Ensure you have an HTML element with the id `app` where the component will be mounted.

---

## 4. Core Concepts

### TemplateEngine

The **TemplateEngine** is responsible for parsing templates and evaluating embedded expressions.

- **`parse(template, data)`**  
  Replaces `{{ expression }}` patterns with evaluated values from `data`.

- **`evaluate(expr, data)`**  
  Safely evaluates a JavaScript expression within the provided context.

_Example:_

```js
const template = "Hello, {{ name }}!";
const data = { name: "World" };
const output = TemplateEngine.parse(template, data);
console.log(output); // "Hello, World!"
```

### Template Interpolation

Eleva supports two methods for embedding dynamic data into your templates: native JavaScript template literals (`${...}`) and Eleva’s custom Handlebars-like syntax (`{{...}}`).

**Standard Template Literals (`${var}`):**

- **Immediate & Static:**  
  Evaluated immediately within the JavaScript template literal. The substitution occurs only once.

  _Example:_

  ```js
  const greeting = `Hello, ${name}!`; // Evaluates to "Hello, World!" if name is "World"
  ```

**Handlebars-like Interpolation (`{{var}}`):**

- **Dynamic & Reactive:**  
  Eleva processes the `{{...}}` syntax within component templates to enable reactive updates as data changes.

  _Example:_

  ```html
  <p>Hello, {{ name }}!</p>
  ```

**When to Use Each:**

- Use **`${var}`** for one-time, static content.
- Use **`{{var}}`** for dynamic, reactive data binding.

### Setup Context vs. Event Context

Understanding how data flows during component initialization and event handling is key:

#### Setup Context

- **When It’s Used:**  
  Passed to the component’s `setup` function during initialization.
- **What It Contains:**  
  Utilities (like the `signal` function), component props, and lifecycle hooks. The returned data forms the component’s reactive state.

_Example:_

```js
const MyComponent = {
  setup: ({ signal }) => {
    const counter = signal(0);
    return { counter };
  },
  template: (ctx) => `
    <div>
      <p>Counter: ${ctx.counter}</p>
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
      <p>Counter: ${ctx.counter}</p>
      <button @click="increment">Increment</button>
    </div>
  `,
};
```

### Signal

**Signals** provide fine-grained reactivity by updating only the affected DOM parts.

- **Constructor:** `new Signal(initialValue)` creates a reactive data holder.
- **Getter/Setter:** Access or update via `signal.value`.
- **Watch:** `signal.watch(callback)` registers a function to execute on changes.

_Example:_

```js
const count = new Signal(0);
count.watch((newValue) => console.log("Count updated:", newValue));
count.value = 1; // Logs: "Count updated: 1"
```

### Emitter

The **Emitter** enables inter-component communication using a publish-subscribe pattern.

- **`on(event, handler)`**: Registers an event handler.
- **`off(event, handler)`**: Removes an event handler.
- **`emit(event, ...args)`**: Emits an event with optional arguments.

_Example:_

```js
on("greet", (name) => console.log(`Hello, ${name}!`)); // Logs: "Hello, Alice!"
emit("greet", "Alice");
```

### Renderer

The **Renderer** efficiently updates the DOM through diffing and patching.

- **`patchDOM(container, newHtml)`**: Updates container content.
- **`diff(oldParent, newParent)`**: Applies updates by comparing DOM trees.
- **`updateAttributes(oldEl, newEl)`**: Synchronizes element attributes.

#### Diffing Algorithm & Renderer Details

Eleva’s renderer minimizes reflows by updating only the changed parts of the DOM.

### Eleva (Core)

The **Eleva** class orchestrates component registration, mounting, plugin integration, and lifecycle management.

- **`new Eleva(name, config)`**: Creates an instance.
- **`use(plugin, options)`**: Integrates a plugin.
- **`component(name, definition)`**: Registers a new component.
- **`mount(container, compName, props)`**: Mounts a component to the DOM.

  _Note:_ The `mount` method now accepts a DOM element (not a CSS selector string) and supports both a component name (string) or a direct component definition (object). It also returns a Promise, even for synchronous setups.  
  Additionally, the `setup` method is optional; if omitted, Eleva defaults to an empty state object.

### Lifecycle Hooks

Eleva provides hooks to execute code at specific stages of a component’s lifecycle:

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

Components are registered using `component()` and mounted with `mount()`. The new version allows for greater flexibility:

- **Flexible Registration:**  
  You can mount a globally registered component by name (string) or pass a component definition object directly.
- **Optional Setup Method:**  
  The `setup()` function is optional. If not provided, Eleva defaults to an empty object for component state.

- **Updated Mount Signature:**  
  The `mount` method now requires a DOM element as its container and returns a Promise.

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
      <p>Count: ${ctx.count}</p>
      <button @click="() => count++">Increment</button>
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
  template: () => `<div>Directly mounted component without setup</div>`,
};

const app = new Eleva("MyApp");
app.mount(document.getElementById("app"), DirectComponent).then((instance) => {
  console.log("Direct component mounted:", instance);
});
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
      padding: 1rem;
    }
  `,
  template: (ctx) => `<div class="my-component">Styled Component</div>`,
};
```

### Inter-Component Communication

Inter-component communication is facilitated by the built-in **Emitter**. Components can publish and subscribe to events, enabling decoupled interactions.

_Example:_

```js
const app = new Eleva("MyApp");

// Component A emits an event
app.component("ComponentA", {
  setup: ({ emit }) => {
    function sendMessage() {
      emit("customEvent", "Hello from A");
    }
    return { sendMessage };
  },
  template: (ctx) => `<button @click="sendMessage">Send Message</button>`,
});

// Component B listens for the event
app.component("ComponentB", {
  setup: ({ on }) => {
    on("customEvent", (msg) => console.log(msg));
    return {};
  },
  template: () => `<div>Component B</div>`,
});

app.mount(document.getElementById("app"), "ComponentA");
app.mount(document.getElementById("app"), "ComponentB");
```

---

## 5. Plugin System

Eleva is built to be easily extendable through plugins.

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

## 6. Debugging & Developer Tools

Debugging in Eleva can be streamlined by:

- **Console Logging:** Use `console.log` within lifecycle hooks and event handlers to trace execution.
- **Watchers:** Leverage signal watchers to monitor state changes.
- **Developer Tools:** Use browser dev tools to inspect the DOM and track network activity.

Additional recommendations:

- **Verbose Mode:** Enable verbose or debug mode in your Eleva configuration to log detailed information during development.
- **Error Handling:** Use try-catch blocks within `setup` functions or event handlers to manage errors gracefully.

---

## 7. Best Practices & Use Cases

### Best Practices

- **Keep It Modular:** Divide your application into small, reusable components.
- **Leverage Reactivity:** Use signals effectively to update only the parts of the DOM that change.
- **Clean Templates:** Use `{{...}}` for dynamic content and keep template logic simple.
- **Test Thoroughly:** Write tests for components and plugins to ensure stability.
- **Document Your Code:** Maintain clear documentation for both your application and custom plugins.

### Use Cases

- **Small to Medium Projects:** Ideal for lightweight apps and websites where performance matters.
- **Performance-Critical Applications:** Low bundle size and fast rendering are essential.
- **Rapid Prototyping:** Quickly build prototypes with Eleva's minimalistic API.
- **Highly Customizable Applications:** Benefit from Eleva's unopinionated architecture to create tailored solutions.

---

## 8. Examples and Tutorials

For practical examples and tutorials, refer to the following guides:

- [Basic Counter Example](../examples/counter.md)
- [Todo App Example](../examples/todo-app.md)
- [Creating a Custom Plugin](../examples/custom-plugin.md)

These guides provide step-by-step instructions and real-world usage scenarios.

---

## 9. FAQ

**Q: Is Eleva production-ready?**  
_A:_ Not yet—Eleva is currently in alpha. While it's a powerful tool, expect changes until a stable release is announced.

**Q: How do I report issues or request features?**  
_A:_ Please use the [GitHub Issues](https://github.com/TarekRaafat/eleva/issues) page.

**Q: Can I use Eleva with TypeScript?**  
_A:_ Absolutely! Eleva includes built-in TypeScript declarations to help keep your codebase strongly typed.

---

## 10. Version Guide

Eleva follows [Semantic Versioning (SemVer)](https://semver.org/):

- **Major Version (X.0.0):**  
  Breaking changes or major overhauls (e.g., `1.0.0` to `2.0.0`).

- **Minor Version (1.X.0):**  
  New features in a backward-compatible manner (e.g., `1.1.0`).

- **Patch Version (1.0.X):**  
  Bug fixes and minor improvements (e.g., `1.0.1`).

- **Pre-release Identifiers:**  
  Suffixes like `-alpha`, `-beta`, or `-rc` indicate unstable versions (e.g., `1.0.0-alpha`).

### Migration Guidelines

When upgrading:

- **Review Breaking Changes:** Consult the changelog for major updates.
- **Check Deprecated Features:** Ensure your code doesn’t rely on removed features.
- **Test Your Application:** Thoroughly test after upgrading to catch any issues early.

---

## 11. Contributing

Contributions are welcome! Whether you’re fixing bugs, adding features, or improving documentation, your input is invaluable. Please check out the [CONTRIBUTING](../CONTRIBUTING.md) file for detailed guidelines on how to get started.

---

## 12. Changelog

For a detailed log of all changes and updates, please refer to the [Changelog](../changelog.md).

---

## 13. License

Eleva is open-source and available under the [MIT License](../LICENSE).

---

Thank you for exploring Eleva! I hope this documentation helps you build amazing, high-performance frontend applications using pure vanilla JavaScript. For further information and community support, please visit the [GitHub Discussions](https://github.com/TarekRaafat/eleva/discussions) page.
