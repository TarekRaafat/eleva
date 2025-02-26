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
      - [Passing Props](#passing-props)
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

Eleva is designed to offer a simple yet powerful way to build frontend applications using pure vanilla JavaScript. Born from my passion for native JavaScript, Eleva stays true to the language by avoiding unnecessary syntax or bloat. Its goal is to empower you to build modular and high-performance apps without the overhead of larger frameworks.

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

Here's a minimal example to help you get started:

```js
import Eleva from "eleva";

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

app.mount("#app", "HelloWorld");
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

In Eleva, there are two methods for embedding dynamic data into your templates: native JavaScript template literals using `${var}` and Eleva's custom Handlebars-like syntax using `{{var}}`.

**Standard Template Literals (`${var}`):**

- **Immediate & Static:**  
  When using `${...}` within a JavaScript template literal, the expression is evaluated immediately, and its current value is inserted into the string. This substitution is a one-time operation and does not update automatically if the value changes.

  _Example:_

  ```js
  const greeting = `Hello, ${name}!`; // Evaluates to "Hello, World!" if name is "World"
  ```

**Handlebars-like Interpolation (`{{var}}`):**

- **Dynamic & Reactive:**  
  Eleva's TemplateEngine processes the `{{...}}` syntax within component templates. It replaces these placeholders with corresponding values from the component’s data context (which may include reactive signals), ensuring the UI updates automatically when the underlying data changes.

  _Example:_

  ```html
  <p>Hello, {{ name }}!</p>
  ```

**When to Use Each:**

- Use **`${var}`** when you need static, one-time interpolation.
- Use **`{{var}}`** in your Eleva component templates to enable dynamic, reactive data binding.

This dual approach lets you benefit from the simplicity of native JavaScript where appropriate while harnessing Eleva's reactivity for dynamic interfaces.

### Setup Context vs. Event Context

In Eleva, it's important to understand how data flows during component initialization and when handling events. Two key contexts are used:

#### Setup Context

- **When It’s Used:**  
  The setup context is provided to your component’s `setup` function when the component is initialized. This is where you define your component’s initial state, create reactive signals, and set up helper functions.

- **What It Contains:**  
  It typically includes utilities (like the `signal` function), component properties, and lifecycle hooks. The data returned from the `setup` function forms the reactive state for your component.

- **Example:**
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
  The event context comes into play when an event handler is triggered—for example, when a user clicks a button or presses a key. The handler is executed with a context that includes both the reactive state (from setup) and the event object.

- **What It Contains:**  
  It contains the same reactive data as defined in the setup plus the event-specific data (such as `e.target`, `e.key`, etc.). This allows you to handle user interactions while still accessing your component’s state.

- **Example:**
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

**Summary:**

- **Setup Context:**  
  Provided during component initialization in the `setup` function. Used to define and return the reactive state and helper functions.

- **Event Context:**  
  Provided when an event is triggered. Includes both the reactive state (from setup) and the event object for handling user interactions.

### Signal

**Signals** enable fine-grained reactivity by allowing you to update only the parts of the DOM that change.

- **Constructor:** `new Signal(initialValue)` creates a reactive data holder.
- **Getter/Setter:** Use `signal.value` to access or update the value.
- **Watch:** `signal.watch(callback)` registers a function that runs when the signal's value changes.

_Example:_

```js
const count = new Signal(0);
count.watch((newValue) => console.log("Count updated:", newValue));
count.value = 1; // Logs: "Count updated: 1"
```

### Emitter

The **Emitter** implements a publish-subscribe pattern for inter-component communication.

- **`on(event, handler)`**: Registers an event handler.
- **`off(event, handler)`**: Removes an event handler.
- **`emit(event, ...args)`**: Emits an event with optional arguments.

_Example:_

```js
emit("greet", "Alice");
on("greet", (name) => console.log(`Hello, ${name}!`)); // Logs: "Hello, Alice!"
```

### Renderer

The **Renderer** manages DOM patching and diffing to ensure efficient updates.

- **`patchDOM(container, newHtml)`**: Updates the content of a container.
- **`diff(oldParent, newParent)`**: Compares and applies updates between two DOM trees.
- **`updateAttributes(oldEl, newEl)`**: Synchronizes attributes of two elements.

#### Diffing Algorithm & Renderer Details

Eleva’s renderer uses a diffing algorithm to compare the new virtual DOM with the current DOM. It then updates only the changed parts, which leads to highly efficient updates. This approach minimizes reflows and repaints in the browser, ensuring smooth performance even in complex applications.

### Eleva (Core)

The **Eleva** class orchestrates the entire framework—from component registration and mounting to plugin integration and lifecycle management.

- **`new Eleva(name, config)`**: Creates an Eleva instance.
- **`use(plugin, options)`**: Integrates a plugin.
- **`component(name, definition)`**: Registers a new component.
- **`mount(selectorOrElement, compName, props)`**: Mounts a component to the DOM.

### Lifecycle Hooks

Eleva provides lifecycle hooks that allow you to execute code at specific stages of a component's life. Common hooks include:

- **onBeforeMount:** Called before the component is mounted.
- **onMount:** Called after the component is mounted.
- **onBeforeUpdate:** Called before the component updates.
- **onUpdate:** Called after the component updates.
- **onUnmount:** Called before the component is unmounted.

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

Components in Eleva are registered using the `component` method and mounted using the `mount` method. Registration associates a unique name with a component definition, while mounting attaches the component to a specific DOM element.

_Example:_

```js
const app = new Eleva("MyApp");
app.component("HelloWorld", {
  /* component definition */
});
app.mount("#app", "HelloWorld");
```

### Children Components & Passing Props

In Eleva, you can build complex, modular user interfaces by nesting components. This allows you to compose smaller, reusable pieces (child components) within a larger parent component. Data can be passed from the parent to the child through **props**.

#### Passing Props

Props are attributes passed from a parent component to its child components. In Eleva, attributes prefixed with `eleva-prop-` are automatically recognized as props and are made available to the child component in the `props` object.

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

// Define the Parent Component
const ParentComponent = {
  setup: () => {
    return {};
  },
  template: () => `
    <div>
      <h1>Parent Component</h1>
      <!-- The attribute "eleva-prop-title" is passed as a prop "title" to the child component -->
      <child-comp eleva-prop-title="Hello from Parent"></child-comp>
    </div>
  `,
  // Specify child components using the "children" property
  children: {
    "child-comp": ChildComponent,
  },
};

// Register and mount components
const app = new Eleva("TestApp");
app.component("parent-comp", ParentComponent);
app.component("child-comp", ChildComponent);
app.mount("#app", "parent-comp");
```

**Explanation:**

- The parent component's template includes `<child-comp eleva-prop-title="Hello from Parent"></child-comp>`.
- The attribute `eleva-prop-title` is interpreted as a prop named `title` in the child component.
- In the child component, the `setup` function accesses this value via `context.props.title`.
- This mechanism enables you to pass data from the parent to the child, ensuring that your components remain modular and configurable.

### Style Injection & Scoped CSS

Eleva supports component-scoped styling via the `style` function defined in a component. The styles you return from this function are injected into the component’s container, ensuring they do not leak into the global scope.

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

Inter-component communication in Eleva is primarily handled through the built-in **Emitter**. Components can publish and subscribe to custom events, allowing for loosely coupled interactions between different parts of your application.

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

app.mount("#app", "ComponentA");
app.mount("#app", "ComponentB");
```

---

## 5. Plugin System

Eleva is built to be easily extendable through plugins. Official plugins, such as the Eleva Router Plugin, enhance Eleva’s capabilities without introducing extra complexity.

### Creating a Plugin

A plugin in Eleva is an object with an `install` method:

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

The plugin architecture in Eleva is designed for simplicity and modularity. Plugins can:

- Modify or extend the Eleva instance.
- Add new methods or properties.
- Enhance component behavior.

This architecture allows you to build and integrate plugins effortlessly, making Eleva highly customizable for any project.

---

## 6. Debugging & Developer Tools

Debugging in Eleva can be streamlined by:

- **Console Logging:** Use `console.log` in your lifecycle hooks, event handlers, or during state changes to trace execution.
- **Watchers:** Leverage signal watchers to monitor state changes.
- **Developer Tools:** Use your browser's developer tools to inspect the DOM and monitor network requests.

Additional recommendations:

- **Verbose Mode:** Consider adding a verbose or debug mode in your Eleva configuration to log more details during development.
- **Error Handling:** Implement try-catch blocks within your `setup` functions or event handlers to gracefully handle errors.

---

## 7. Best Practices & Use Cases

### Best Practices

- **Keep It Modular:** Break your application into small, reusable components.
- **Leverage Reactivity:** Use signals effectively to minimize DOM updates.
- **Write Clean Templates:** Use `{{...}}` for dynamic content and keep your template logic simple.
- **Test Thoroughly:** Write tests for your components and plugins to ensure reliability.
- **Document Your Code:** Maintain clear documentation for both your application and any custom plugins you develop.

### Use Cases

- **Small to Medium Projects:** Ideal for lightweight web apps and websites where performance is key.
- **Performance-Critical Applications:** When low bundle size and fast rendering are essential.
- **Rapid Prototyping:** Quickly build prototypes with a minimalistic, developer-friendly API.
- **Highly Customizable Applications:** Leverage the unopinionated nature of Eleva to build custom solutions without imposed restrictions.

---

## 8. Examples and Tutorials

For practical examples and tutorials, refer to the following guides:

- [Basic Counter Example](../examples/counter.md)
- [Todo App Example](../examples/todo-app.md)
- [Creating a Custom Plugin](../examples/custom-plugin.md)

These examples provide step-by-step instructions and real-world usage scenarios for Eleva.

---

## 9. FAQ

**Q: Is Eleva production-ready?**  
_A:_ Not yet—Eleva is currently in alpha. While it's a powerful tool, expect changes until a stable release is announced.

**Q: How do I report issues or request features?**  
_A:_ Please use the [GitHub Issues](https://github.com/TarekRaafat/eleva/issues) page for any bugs or feature requests.

**Q: Can I use Eleva with TypeScript?**  
_A:_ Absolutely! Eleva includes built-in TypeScript declarations to help keep your codebase strongly typed.

---

## 10. Version Guide

I follow [Semantic Versioning (SemVer)](https://semver.org/) for Eleva. Here's a quick rundown:

- **Major Version (X.0.0):**  
  Indicates breaking changes or a major overhaul. For example, moving from `1.0.0` to `2.0.0`.

- **Minor Version (1.X.0):**  
  Introduces new features in a backward-compatible manner, e.g., `1.1.0`.

- **Patch Version (1.0.X):**  
  Contains backward-compatible bug fixes and minor improvements, e.g., `1.0.1`.

- **Pre-release Identifiers:**  
  Suffixes like `-alpha`, `-beta`, or `-rc` denote that the version is not yet stable (e.g., `1.0.0-alpha`).

### Migration Guidelines

When upgrading between versions, pay attention to:

- **Breaking Changes:** Review the changelog for any major updates.
- **Deprecated Features:** Ensure that your code does not rely on features marked for deprecation.
- **Testing:** Thoroughly test your application after upgrading to catch any issues early.

---

## 11. Contributing

Contributions are welcome! Whether you're fixing bugs, adding features, or improving documentation, your input is invaluable. Please check out the [CONTRIBUTING](../CONTRIBUTING.md) file for detailed guidelines on how to get started.

---

## 12. Changelog

For a detailed log of all changes and updates, please refer to the [Changelog](../changelog.md). This document tracks all significant updates from each release.

---

## 13. License

Eleva is open-source and available under the [MIT License](../LICENSE).

---

Thank you for exploring Eleva! I hope this documentation helps you build amazing, high-performance frontend applications using pure vanilla JavaScript. For further information and community support, please visit the [GitHub Discussions](https://github.com/TarekRaafat/eleva/discussions) page.
