# eleva.js - Pure JavaScript, Pure Performance

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/tarekraafat/eleva?label=github)](https://github.com/TarekRaafat/eleva)
[![Version](https://img.shields.io/npm/v/eleva.svg?style=flat)](https://www.npmjs.com/package/eleva)
![100% Javascript](https://img.shields.io/github/languages/top/TarekRaafat/eleva?color=yellow)
![Zero Dependencies](https://img.shields.io/badge/dependencies-0-green.svg)
[![codecov](https://codecov.io/gh/TarekRaafat/eleva/branch/master/graph/badge.svg?token=LFA6KENM24)](https://codecov.io/gh/TarekRaafat/eleva)
[![Minified Size](https://badgen.net/bundlephobia/min/eleva@latest)](https://bundlephobia.com/package/eleva@latest)
[![Gzipped Size](https://badgen.net/bundlephobia/minzip/eleva@latest)](https://bundlephobia.com/package/eleva@latest)
[![](https://data.jsdelivr.com/v1/package/npm/eleva/badge?style=rounded)](https://www.jsdelivr.com/package/npm/eleva)
[![Supported by Canonical](https://img.shields.io/badge/Supported%20by-Canonical-E95420?logo=ubuntu&logoColor=white)](https://canonical.com)

<br>

<p align="center">
  <a href="https://github.com/TarekRaafat/eleva"><img src="./imgs/eleva.js Full Logo.png" alt="eleva.js Full Logo" width="50%"></a>
</p>

<p align="center">
  <a href="https://www.producthunt.com/posts/eleva?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-eleva" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=938663&theme=light&t=1741247713068" alt="eleva.js - A&#0032;minimalist&#0044;&#0032;pure&#0032;vanilla&#0032;javascript&#0032;frontend&#0032;framework&#0046; | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
</p>

<p align="center">
  <a href="https://chatgpt.com/g/g-684b2a1bf9548191a0b0e25f44eebefc-eleva-website-builder"><img src="./imgs/Eleva Website Builder Button.png" alt="eleva.js Full Logo" width="30%"></a>
</p>

<br>
<br>
<br>

Welcome to the official documentation for **eleva.js**, a minimalist, lightweight, pure vanilla JavaScript frontend runtime framework. Whether you're new to JavaScript or an experienced developer, this guide will help you understand Eleva's core concepts, architecture, and how to integrate and extend it in your projects.

> **RC Release Notice**: This documentation is for eleva.js v1.0.0-rc.9. The core functionality is stable and suitable for production use. While we're still gathering feedback before the final v1.0.0 release, the framework has reached a significant milestone in its development. Help us improve Eleva by sharing your feedback and experiences.

---

## Table of Contents

- [eleva.js - Pure JavaScript, Pure Performance](#elevajs---pure-javascript-pure-performance)
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
      - [Types of Children Component Mounting](#types-of-children-component-mounting)
      - [Supported Children Selector Types](#supported-children-selector-types)
    - [Style Injection \& Scoped CSS](#style-injection--scoped-css)
    - [Inter-Component Communication](#inter-component-communication)
    - [Component Context](#component-context)
    - [Mounting Process](#mounting-process)
  - [7. Architecture \& Data Flow](#7-architecture--data-flow)
    - [Key Components](#key-components)
    - [Data Flow Process](#data-flow-process)
    - [Visual Overview](#visual-overview)
    - [Benefits](#benefits)
  - [8. Plugin System](#8-plugin-system)
    - [Plugin Structure](#plugin-structure)
    - [Installing Plugins](#installing-plugins)
    - [Plugin Capabilities](#plugin-capabilities)
    - [Best Practices](#best-practices)
    - [Example Plugin](#example-plugin)
    - [Plugin Lifecycle](#plugin-lifecycle)
    - [TypeScript Support](#typescript-support)
    - [Built-in Plugins](#built-in-plugins)
      - [🎯 AttrPlugin](#-attrplugin)
      - [🚀 RouterPlugin](#-routerplugin)
      - [🎯 PropsPlugin](#-propsplugin)
      - [🏪 StorePlugin](#-storeplugin)
      - [Plugin Installation](#plugin-installation)
      - [Bundle Sizes](#bundle-sizes)
  - [9. Debugging \& Developer Tools](#9-debugging--developer-tools)
  - [10. Best Practices \& Use Cases](#10-best-practices--use-cases)
    - [Best Practices](#best-practices-1)
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
  - [19. Sponsors \& Partners](#19-sponsors--partners)

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
  Eleva's unopinionated nature allows you to choose your own architectural patterns and extend the framework with plugins as needed.

- **Performance:**  
  Designed to be lightweight and efficient, Eleva is ideal for performance-critical applications.

---

## 4. Performance Benchmarks

Preliminary benchmarks illustrate Eleva's efficiency compared to popular frameworks:

| **Framework**                 | **Bundle Size** (KB) | **Initial Load Time** (ms) | **DOM Update Speed** (s) | **Peak Memory Usage** (KB) | **Overall Performance Score** (lower is better) |
| ----------------------------- | -------------------- | -------------------------- | ------------------------ | -------------------------- | ----------------------------------------------- |
| **Eleva** (Direct DOM)        | **2**                | **0.05**                   | **0.002**                | **0.25**                   | **0.58 (Best)**                                 |
| **React** (Virtual DOM)       | 4.1                  | 5.34                       | 0.020                    | 0.25                       | 9.71                                            |
| **Vue** (Reactive State)      | 45                   | 4.72                       | 0.021                    | 3.10                       | 13.21                                           |
| **Angular** (Two-way Binding) | 62                   | 5.26                       | 0.021                    | 0.25                       | 16.88 (Slowest)                                 |

Detailed [Benchmark Metrics Report](https://github.com/TarekRaafat/eleva/blob/master/BENCHMARK.md)

> ⚠️ **Disclaimer:** Benchmarks are based on internal tests and may vary by project and environment.

---

## 5. Getting Started

### Installation

Install via npm:

```bash
npm install eleva
```

**Core Framework Only (Recommended):**
```javascript
import Eleva from 'eleva';  // ~6KB - Core framework only
const app = new Eleva("MyApp");
```

**With Individual Plugins (Optional):**
```javascript
import Eleva from 'eleva';
import { Attr } from 'eleva/plugins/attr';      // ~2.3KB
import { Router } from 'eleva/plugins/router';  // ~13KB

const app = new Eleva("MyApp");
app.use(Attr);    // Only if needed
app.use(Router);  // Only if needed
```

Or include it directly via CDN:

```html
<!-- Core framework only (Recommended) -->
<script src="https://cdn.jsdelivr.net/npm/eleva"></script>

<!-- With all plugins (Optional) -->
<script src="https://cdn.jsdelivr.net/npm/eleva/plugins"></script>
```

or

```html
<!-- unpkg -->
<script src="https://unpkg.com/eleva"></script>
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

- **`TemplateEngine.parse(template, data)`**: Replaces `{{ expression }}` with values from `data`.
- **`TemplateEngine.evaluate(expr, data)`**: Safely evaluates JavaScript expressions within the provided context.

_Example:_

```js
const template = "Hello, {{ name }}!";
const data = { name: "World" };
const output = TemplateEngine.parse(template, data);
console.log(output); // "Hello, World!"
```

**Key Features:**
- Static method-based API
- Expression evaluation in data context
- Whitespace-preserving interpolation
- Error handling for invalid expressions
- Support for complex object access

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

- **When It's Used:**
  Passed to the component's `setup` function during initialization.
- **What It Contains:**
  Utilities (like the `signal` function), component props, emitter, and lifecycle hooks. The returned data forms the component's reactive state.

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

- **When It's Used:**
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

- **`new Signal(initialValue)`**: Creates a Signal instance.
- **`.value`**: Getter/setter for the current value.
- **`.watch(callback)`**: Registers a function to execute on changes.

_Example:_

```js
const count = new Signal(0);

count.watch((newVal) => console.log("Count updated:", newVal));

count.value = 1; // Logs: "Count updated: 1"
```

**Key Features:**
- Microtask-based update batching
- Automatic watcher cleanup
- Type-safe value handling
- Efficient update propagation
- Memory leak prevention through unsubscribe

### Emitter (Event Handling)

The **Emitter** enables inter-component communication through events and using a publish–subscribe pattern.

- **`new Emitter()`**: Creates an Emitter instance.
- **`.on(event, handler)`**: Registers an event handler.
- **`.off(event, handler)`**: Removes an event handler.
- **`.emit(event, ...args)`**: Emits an event with optional arguments.

_Example:_

```js
const emitter = new Emitter();

emitter.on("greet", (name) => console.log(`Hello, ${name}!`)); // Logs: "Hello, Alice!"

emitter.emit("greet", "Alice");
```

**Key Features:**
- Synchronous event propagation
- Multiple handlers per event
- Automatic event cleanup
- Memory-efficient handler management
- Type-safe event data

### Renderer (DOM Diffing)

The **Renderer** efficiently updates the DOM through direct manipulation, avoiding the overhead of virtual DOM implementations. It uses a performant diffing algorithm to update only the necessary parts of the DOM tree.

- **`new Renderer()`**: Creates a Renderer instance.
- **`.patchDOM(container, newHtml)`**: Updates container content with the new HTML.

_Example:_

```js
const renderer = new Renderer();

const container = document.getElementById("app");
const newHtml = "<div>Updated content</div>";

renderer.patchDOM(container, newHtml); // Update a container with new HTML
```

**Key Features:**
- Direct DOM manipulation for optimal performance
- Efficient attribute updates
- Smart node comparison and replacement
- Support for key-based reconciliation
- Handles text nodes and element nodes appropriately

### Eleva (Core)

The **Eleva** class orchestrates component registration, mounting, plugin integration, lifecycle management, and events.

- **`new Eleva(name, config)`**: Creates an instance.
- **`use(plugin, options)`**: Integrates a plugin.
- **`component(name, definition)`**: Registers a new component.
- **`mount(container, compName, props)`**: Mounts a component to a DOM element (returns a Promise).

### Lifecycle Hooks

Eleva provides a set of optional lifecycle hooks that allow you to execute code at specific stages of a component's lifecycle. These hooks are available through the setup method's return object.

**Available Hooks:**
- `onBeforeMount`: Called before the component is mounted to the DOM
- `onMount`: Called after the component is mounted to the DOM
- `onBeforeUpdate`: Called before the component updates
- `onUpdate`: Called after the component updates
- `onUnmount`: Called before the component is unmounted from the DOM

Each hook receives a context object with the following properties:
- `container`: The component's container element
- `context`: The component's context object containing props, state, and utilities

All hooks are asynchronous and return Promises, allowing you to perform async operations.

_Example:_

```js
app.component("MyComponent", {
  setup() {
    // Define your lifecycle hooks
    const hooks = {
      beforeMount: async ({ container, context }) => {
        console.log("Component will mount");
        // Can perform async operations
        await someAsyncOperation();
      },
      mounted: async ({ container, context }) => {
        console.log("Component mounted");
        // Can perform async operations
        await initializeComponent();
      },
      beforeUpdate: async ({ container, context }) => {
        console.log("Component will update");
        // Can perform async operations
        await prepareForUpdate();
      },
      updated: async ({ container, context }) => {
        console.log("Component updated");
        // Can perform async operations
        await afterUpdate();
      },
      beforeUnmount: async ({ container, context }) => {
        console.log("Component will unmount");
        // Can perform async operations
        await cleanup();
      },
    };

    // Return both your component state and lifecycle hooks
    return {
      // Your component state
      count: 0,
      // Lifecycle hooks (all optional)
      onBeforeMount: hooks.beforeMount,
      onMount: hooks.mounted,
      onBeforeUpdate: hooks.beforeUpdate,
      onUpdate: hooks.updated,
      onUnmount: hooks.beforeUnmount,
    };
  },
  template(ctx) {
    return `<div>Count: ${ctx.count}</div>`;
  },
});
```

**Important Notes:**
1. Lifecycle hooks are optional and only need to be defined if you want to use them
2. Hooks must be returned from the setup method to be effective
3. Each hook receives a context object with the component's container and context
4. All hooks are asynchronous and return Promises
5. Hooks can perform async operations like data fetching, initialization, or cleanup

_Example (with Reactive State and Async Operations):_

```js
app.component("Counter", {
  setup({ signal }) {
    const count = signal(0);

    return {
      count,
      onMount: async ({ container, context }) => {
        console.log("Counter mounted with initial value:", count.value);
        // Can perform async operations
        await initializeCounter();
      },
      onUpdate: async ({ container, context }) => {
        console.log("Counter updated to:", count.value);
        // Can perform async operations
        await saveCounterState();
      },
      onUnmount: async ({ container, context }) => {
        // Cleanup async operations
        await cleanupCounter();
      },
    };
  },
  template(ctx) {
    return `
      <div>
        <p>Count: ${ctx.count.value}</p>
        <button @click="() => count.value++">Increment</button>
      </div>
    `;
  },
});
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

Eleva provides two powerful ways to mount child components in your application:

1. **Explicit Component Mounting**
   - Components are explicitly defined in the parent component's children configuration
   - Provides clear parent-child relationships
   - Allows for dynamic prop passing via attributes prefixed with `:`.

   _Example:_

   ```js
   // Child Component
   app.component("TodoItem", {
     setup: (context) => {
       const { title, completed, onToggle } = context.props;
       return { title, completed, onToggle };
     },
     template: (ctx) => `
       <div class="todo-item ${ctx.completed ? 'completed' : ''}">
         <input type="checkbox" 
                ${ctx.completed ? 'checked' : ''} 
                @click="onToggle" />
         <span>${ctx.title}</span>
       </div>
     `,
   });

   // Parent Component using explicit mounting
   app.component("TodoList", {
     setup: ({ signal }) => {
       const todos = signal([
         { id: 1, title: "Learn Eleva", completed: false },
         { id: 2, title: "Build an app", completed: false },
       ]);

       const toggleTodo = (id) => {
         todos.value = todos.value.map((todo) =>
           todo.id === id ? { ...todo, completed: !todo.completed } : todo
         );
       };

       return { todos, toggleTodo };
     },
     template: (ctx) => `
       <div class="todo-list">
         <h2>My Todo List</h2>
         ${ctx.todos.value.map((todo) => `
           <div class="todo-item" 
                :title="${todo.title}"
                :completed="${todo.completed}"
                @click="() => toggleTodo(todo.id)">
           </div>
         `).join("")}
       </div>
     `,
     children: {
       ".todo-item": "TodoItem", // Explicitly define child component
     },
   });
   ```

2. **Component Mounting**
   - Components are mounted explicitly using their registered names
   - Provides clear and controlled component relationships
   - Supports dynamic prop passing and automatic cleanup

   _Example:_

   ```js
   // Child Component
   app.component("UserCard", {
     setup: (context) => {
       const { user, onSelect } = context.props;
       return { user, onSelect };
     },
     template: (ctx) => `
       <div class="user-card" @click="onSelect">
         <img src="${ctx.user.avatar}" alt="${ctx.user.name}" />
         <h3>${ctx.user.name}</h3>
         <p>${ctx.user.role}</p>
       </div>
     `,
   });

   // Parent Component using explicit mounting
   app.component("UserList", {
     setup: ({ signal }) => {
       const users = signal([
         { id: 1, name: "John Doe", role: "Developer", avatar: "john.jpg" },
         { id: 2, name: "Jane Smith", role: "Designer", avatar: "jane.jpg" },
       ]);

       const selectUser = (user) => {
         console.log("Selected user:", user);
       };

       return { users, selectUser };
     },
     template: (ctx) => `
       <div class="user-list">
         <h2>Team Members</h2>
         ${ctx.users.value.map((user) => `
           <div id="user-card-container"></div>
         `).join("")}
       </div>
     `,
     children: {
       "#user-card-container": {
         setup: (context) => {
           const user = context.props.user;
           return { user };
         },
         template: (ctx) => `
           <UserCard 
             :user="${JSON.stringify(ctx.user)}"
             :onSelect="() => selectUser(${JSON.stringify(ctx.user)})"
           ></UserCard>
         `,
         children: {
          "UserCard": "UserCard",
         },
       },
     },
   });
   ```

#### Types of Children Component Mounting

Eleva supports four main approaches to mounting child components, each with its own use cases and benefits:

1. **Direct Component Mounting**
   ```js
   children: {
     "UserCard": "UserCard"  // Direct mounting without container
   }
   ```
   - **Use when:** You want to mount a component directly in the parent's template
   - **Benefits:**
     - Simplest and most performant approach
     - No additional DOM elements
     - Direct prop passing
   - **Example use case:** Simple component composition

2. **Container-Based Mounting**
   ```js
   children: {
     "#container": "UserCard"  // Mounting in a container element
   }
   ```
   - **Use when:** You need a container element for styling or layout
   - **Benefits:**
     - Better control over component positioning
     - Ability to add wrapper elements
     - Easier styling and layout management
   - **Example use case:** Complex layouts or when container styling is needed

3. **Dynamic Component Mounting**
   ```js
   children: {
     ".dynamic-container": {
       setup: (ctx) => ({ /* dynamic setup */ }),
       template: (ctx) => `<UserCard :props="${ctx.props}" />`,
       children: { "UserCard": "UserCard" }
     }
   }
   ```
   - **Use when:** You need dynamic component behavior or setup
   - **Benefits:**
     - Full control over component lifecycle
     - Ability to add custom logic
     - Dynamic prop computation
   - **Example use case:** Complex component interactions or dynamic data handling

4. **Variable-Based Component Mounting**
   ```js
   // Define component
   const UserCard = {
     setup: (ctx) => ({ /* setup logic */ }),
     template: (ctx) => `<div>User Card</div>`,
   };

   // Parent component using variable-based mounting
   app.component("UserList", {
     template: (ctx) => `
       <div class="user-list">
         <div class="user-card-container"></div>
       </div>
     `,
     children: {
       ".user-card-container": UserCard, // Mount component directly from variable
     },
   });
   ```
   - **Use when:**
     - You have component definitions stored in variables
     - Components are created dynamically
     - You want to reuse component definitions
   - **Benefits:**
     - No need to register components globally
     - More flexible component composition
     - Better code organization
   - **Example use case:**
     - Dynamic component creation
     - Component libraries
     - Reusable component patterns

**Best Practices for Component Mounting:**

1. **Choose the Right Approach:**
   - Use direct mounting for simple component relationships
   - Use container-based mounting when layout control is needed
   - Use dynamic mounting for complex component interactions

2. **Performance Considerations:**
   - Direct mounting is most performant
   - Container-based mounting adds minimal overhead
   - Dynamic mounting has the most flexibility but requires careful optimization

3. **Maintainability:**
   - Keep component hierarchies shallow when possible
   - Use meaningful container names
   - Document complex mounting patterns

#### Supported Children Selector Types

Eleva supports various selector types for defining child components in the `children` configuration:

1. **Component Name Selectors**

   ```html
    <UserCard></UserCard>
   ```

   ```js
   children: {
     "UserCard": "UserCard"  // Mounts UserCard component directly
   }
   ```
   - **Best for:** Direct component mounting without additional container elements
   - **Use when:** You want to mount a component directly without a wrapper element

2. **ID Selectors**

   ```html
    <div id="user-card-container"></div>
   ```

   ```js
   children: {
     "#user-card-container": "UserCard"  // Mounts in element with id="user-card-container"
   }
   ```
   - **Best for:** Unique, specific mounting points
   - **Use when:** You need to target a specific element in the template

3. **Class Selectors**

   ```html
    <div class="todo-item"></div>
   ```

   ```js
   children: {
     ".todo-item": "TodoItem"  // Mounts in elements with class="todo-item"
   }
   ```
   - **Best for:** Multiple instances of the same component
   - **Use when:** You have a list or grid of similar components

4. **Attribute Selectors**

   ```html
    <div data-component="user-card"></div>
   ```

   ```js
   children: {
     "[data-component='user-card']": "UserCard"  // Mounts in elements with data-component="user-card"
   }
   ```
   - **Best for:** Semantic component identification
   - **Use when:** You want to use custom attributes for component mounting

**Best Practices for Selector Types:**

1. **Prefer Component Name Selectors** when:
   - Mounting components directly without containers
   - Working with simple, direct component relationships
   - Performance is a priority (fewer DOM queries)

2. **Use ID Selectors** when:
   - You need to target specific, unique mounting points
   - Working with complex layouts
   - Components need to be mounted in specific locations

3. **Choose Class Selectors** when:
   - Working with lists or repeated components
   - Components share the same mounting pattern
   - You need to style or target multiple instances

4. **Consider Attribute Selectors** when:
   - You need semantic component identification
   - Working with custom component attributes
   - Building complex component hierarchies

**Performance Considerations:**
- Component name selectors are generally the most performant
- Class selectors are efficient for multiple instances
- ID selectors are fast but limited to single elements
- Attribute selectors can be slower for complex queries

**Key Benefits of Component Mounting:**
- **Explicit Control**: Clear parent-child relationships and component hierarchy
- **Dynamic Props**: Support for dynamic prop passing
- **Automatic Cleanup**: Components are automatically unmounted and cleaned up when their container is removed

### Style Injection & Scoped CSS

Eleva supports component-scoped styling through an optional `style` function defined in a component.
The styles are injected into the component's container to avoid global leakage.

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

### Component Context

The component context provides access to essential tools and data for component development:

- **`props`**: Component properties passed during mounting
- **`emitter`**: Event emitter instance for component event handling
- **`signal`**: Factory function to create reactive Signal instances
- **Lifecycle Hooks**:
  - `onBeforeMount`: Called before component mounting
  - `onMount`: Called after component mounting
  - `onBeforeUpdate`: Called before component update
  - `onUpdate`: Called after component update
  - `onUnmount`: Called during component unmounting

_Example:_

```js
app.component("MyComponent", {
  setup({ signal, emitter }) {
    const count = signal(0);
    return {
      count,
      onMount: async ({ container, context }) => {
        console.log("Component mounted!");
      },
      onUpdate: ({ container, context }) => {
        console.log("Component updated!");
      },
    };
  },
});
```

### Mounting Process

The `mount` method returns a Promise that resolves to a `MountResult` object containing:

- **`container`**: The mounted component's container element
- **`data`**: The component's reactive state and context
- **`unmount`**: Function to clean up and unmount the component

The container element receives a `_eleva_instance` property that references the mounted instance.

_Example:_

```js
const instance = await app.mount(document.getElementById("app"), "MyComponent");
// Later...
await instance.unmount();
```

---

## 7. Architecture & Data Flow

Eleva's design emphasizes clarity, modularity, and performance. This section explains how data flows through the framework and how its key components interact, providing more clarity on the underlying mechanics.

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

   - When a signal's value changes (e.g., through a user event), its watcher triggers a re-run of the template.
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

The Plugin System in Eleva provides a powerful way to extend the framework's functionality. Plugins can add new features, modify existing behavior, or integrate with external libraries.

### Plugin Structure

A plugin in Eleva is an object that must have two required properties:

```js
const MyPlugin = {
  name: "myPlugin", // Unique identifier for the plugin
  install(eleva, options) {
    // Plugin installation logic
  },
};
```

- `name`: A unique string identifier for the plugin
- `install`: A function that receives the Eleva instance and optional configuration

### Installing Plugins

Plugins are installed using the `use` method on an Eleva instance:

```js
const app = new Eleva("myApp");
app.use(MyPlugin, { /* optional configuration */ });
```

The `use` method:
- Calls the plugin's `install` function with the Eleva instance and provided options
- Stores the plugin in an internal registry
- Returns the Eleva instance for method chaining

### Plugin Capabilities

Plugins can:

1. **Extend the Eleva Instance**
   ```js
   install(eleva) {
     eleva.newMethod = () => { /* ... */ };
   }
   ```

2. **Add Component Features**
   ```js
   install(eleva) {
     eleva.component("enhanced-component", {
       template: (ctx) => `...`,
       setup: (ctx) => ({ /* ... */ })
     });
   }
   ```

3. **Modify Component Behavior**
   ```js
   install(eleva) {
     const originalMount = eleva.mount;
     eleva.mount = function(container, compName, props) {
       // Add pre-mount logic
       const result = originalMount.call(this, container, compName, props);
       // Add post-mount logic
       return result;
     };
   }
   ```

4. **Add Global State or Services**
   ```js
   install(eleva) {
     eleva.services = {
       api: new ApiService(),
       storage: new StorageService()
     };
   }
   ```

### Best Practices

1. **Naming Conventions**
   - Use unique, descriptive names for plugins
   - Follow the pattern: `eleva-{plugin-name}` for published plugins

2. **Error Handling**
   - Implement proper error handling in plugin methods
   - Provide meaningful error messages for debugging

3. **Documentation**
   - Document plugin options and methods
   - Include usage examples
   - Specify any dependencies or requirements

4. **Performance**
   - Keep plugin initialization lightweight
   - Use lazy loading for heavy features
   - Clean up resources when components unmount

### Example Plugin

Here's a complete example of a custom plugin:

```js
const LoggerPlugin = {
  name: "logger",
  install(eleva, options = {}) {
    const { level = "info" } = options;

    // Add logging methods to Eleva instance
    eleva.log = {
      info: (msg) => console.log(`[INFO] ${msg}`),
      warn: (msg) => console.warn(`[WARN] ${msg}`),
      error: (msg) => console.error(`[ERROR] ${msg}`),
    };

    // Enhance component mounting with logging
    const originalMount = eleva.mount;
    eleva.mount = async function(container, compName, props) {
      eleva.log.info(`Mounting component: ${compName}`);
      const result = await originalMount.call(this, container, compName, props);
      eleva.log.info(`Component mounted: ${compName}`);
      return result;
    };
  },
};

// Usage
const app = new Eleva("myApp");
app.use(LoggerPlugin, { level: "debug" });
```

### Plugin Lifecycle

1. **Installation**
   - Plugin is registered with the Eleva instance
   - `install` function is called with the instance and options
   - Plugin is stored in the internal registry

2. **Runtime**
   - Plugin methods are available throughout the application lifecycle
   - Can interact with components and the Eleva instance
   - Can respond to component lifecycle events

3. **Cleanup**
   - Plugins should clean up any resources they've created
   - Remove event listeners and subscriptions
   - Reset any modified behavior

### TypeScript Support

Eleva provides TypeScript declarations for plugin development:

```typescript
interface ElevaPlugin {
  name: string;
  install(eleva: Eleva, options?: Record<string, any>): void;
}
```

This ensures type safety when developing plugins in TypeScript.

### Built-in Plugins

Eleva comes with several powerful built-in plugins that extend the framework's capabilities:

#### 🎯 AttrPlugin

Advanced attribute handling for Eleva components with ARIA support, data attributes, boolean attributes, and dynamic property detection.

```javascript
import { Attr } from 'eleva/plugins';

const app = new Eleva("myApp");
app.use(Attr, {
    enableAria: true,      // Enable ARIA attribute handling
    enableData: true,      // Enable data attribute handling
    enableBoolean: true,   // Enable boolean attribute handling
    enableDynamic: true    // Enable dynamic property detection
});

// Use advanced attributes in components
app.component("myComponent", {
    template: (ctx) => `
        <button 
            aria-expanded="${ctx.isExpanded.value}"
            data-user-id="${ctx.userId.value}"
            disabled="${ctx.isLoading.value}"
            class="btn ${ctx.variant.value}"
        >
            ${ctx.text.value}
        </button>
    `
});
```

**Features:**
- 🎯 **ARIA Support**: Automatic ARIA attribute handling with proper property mapping
- 📊 **Data Attributes**: Seamless data attribute management
- ✅ **Boolean Attributes**: Intelligent boolean attribute processing
- 🔍 **Dynamic Properties**: Automatic property detection and mapping
- 🧹 **Attribute Cleanup**: Automatic removal of unused attributes

#### 🚀 RouterPlugin

Advanced client-side routing with reactive state, navigation guards, and component resolution.

```javascript
import { Router } from 'eleva/plugins';

const app = new Eleva("myApp");

// Define components
const HomePage = { template: () => `<h1>Home</h1>` };
const AboutPage = { template: () => `<h1>About</h1>` };
const UserPage = { 
    template: (ctx) => `<h1>User: ${ctx.router.params.id}</h1>` 
};

// Install router with advanced configuration
const router = app.use(Router, {
    mount: '#app',                    // Mount element selector
    mode: 'hash',                     // 'hash', 'history', or 'query'
    routes: [
        { 
            path: '/', 
            component: HomePage,
            meta: { title: 'Home' }
        },
        { 
            path: '/about', 
            component: AboutPage,
            beforeEnter: (to, from) => {
                // Navigation guard
                return true;
            }
        },
        { 
            path: '/users/:id', 
            component: UserPage,
            afterEnter: (to, from) => {
                // Lifecycle hook
                console.log('User page entered');
            }
        }
    ],
    onBeforeEach: (to, from) => {
        // Global navigation guard
        return true;
    }
});

// Access reactive router state
router.currentRoute.subscribe(route => {
    console.log('Route changed:', route);
});

// Programmatic navigation
router.navigate('/users/123', { replace: true });
```

**Features:**
- 🚀 **Multiple Routing Modes**: Hash, History API, and Query parameter routing
- 🛡️ **Navigation Guards**: Global and route-specific guards
- 🔄 **Reactive State**: Real-time route state updates
- 🧩 **Component Resolution**: Support for inline components and async imports
- 🎯 **Layout System**: Global and route-specific layouts
- 🔌 **Plugin System**: Router-level plugin extensibility
- 🛠️ **Error Handling**: Comprehensive error management

#### 🎯 PropsPlugin

Advanced props data handling for complex data structures with automatic type detection and reactivity.

```javascript
import { Props } from 'eleva/plugins';

const app = new Eleva("myApp");
app.use(Props, {
    enableAutoParsing: true,      // Enable automatic type detection and parsing
    enableReactivity: true,       // Enable reactive prop updates using Eleva's signal system
    onError: (error, value) => {
        console.error('Props parsing error:', error, value);
    }
});

// Use complex props in components
app.component("UserCard", {
    template: (ctx) => `
        <div class="user-info-container"
             :user='${JSON.stringify(ctx.user.value)}'
             :permissions='${JSON.stringify(ctx.permissions.value)}'
             :settings='${JSON.stringify(ctx.settings.value)}'>
        </div>
    `,
    children: {
        '.user-info-container': 'UserInfo'
    }
});

app.component("UserInfo", {
    setup({ props }) {
        return {
            user: props.user,        // Automatically parsed object
            permissions: props.permissions,  // Automatically parsed array
            settings: props.settings  // Automatically parsed object
        };
    },
    template: (ctx) => `
        <div class="user-info">
            <h3>${ctx.user.value.name}</h3>
            <p>Age: ${ctx.user.value.age}</p>
            <p>Active: ${ctx.user.value.active}</p>
            <ul>
                ${ctx.permissions.value.map(perm => `<li>${perm}</li>`).join('')}
            </ul>
        </div>
    `
});
```

**Features:**
- 🎯 **Automatic Type Detection**: Intelligently detects and parses strings, numbers, booleans, objects, arrays, dates, and more
- 📊 **Complex Data Structures**: Seamless handling of nested objects and arrays
- 🔄 **Reactive Props**: Automatic reactive updates when parent data changes using Eleva's signal system
- 🛠️ **Error Handling**: Comprehensive error handling with custom error callbacks
- 🧹 **Attribute Cleanup**: Automatic removal of prop attributes after extraction
- ⚡ **Performance Optimized**: Efficient parsing with minimal overhead

#### 🏪 StorePlugin

Reactive state management for sharing data across your entire Eleva.js application with centralized data store, persistence, and cross-component reactive updates.

```javascript
import { Store } from 'eleva/plugins';

const app = new Eleva("myApp");

// Install store with configuration
app.use(Store, {
    state: {
        theme: "light",
        counter: 0,
        user: {
            name: "John Doe",
            email: "john@example.com"
        }
    },
    actions: {
        increment: (state) => state.counter.value++,
        decrement: (state) => state.counter.value--,
        toggleTheme: (state) => {
            state.theme.value = state.theme.value === "light" ? "dark" : "light";
        },
        updateUser: (state, updates) => {
            state.user.value = { ...state.user.value, ...updates };
        }
    },
    // Optional: Namespaced modules
    namespaces: {
        auth: {
            state: { token: null, isLoggedIn: false },
            actions: {
                login: (state, token) => {
                    state.auth.token.value = token;
                    state.auth.isLoggedIn.value = true;
                },
                logout: (state) => {
                    state.auth.token.value = null;
                    state.auth.isLoggedIn.value = false;
                }
            }
        }
    },
    // Optional: State persistence
    persistence: {
        enabled: true,
        key: "myApp-store",
        storage: "localStorage",  // or "sessionStorage"
        include: ["theme", "user"] // Only persist specific keys
    }
});

// Use store in components
app.component("Counter", {
    setup({ store }) {
        return {
            count: store.state.counter,
            theme: store.state.theme,
            increment: () => store.dispatch("increment"),
            decrement: () => store.dispatch("decrement")
        };
    },
    template: (ctx) => `
        <div class="${ctx.theme.value}">
            <h3>Counter: ${ctx.count.value}</h3>
            <button @click="decrement">-</button>
            <button @click="increment">+</button>
        </div>
    `
});

// Create state and actions at runtime
app.component("TodoManager", {
    setup({ store }) {
        // Register new module dynamically
        store.registerModule("todos", {
            state: { items: [], filter: "all" },
            actions: {
                addTodo: (state, text) => {
                    state.todos.items.value.push({
                        id: Date.now(),
                        text,
                        completed: false
                    });
                },
                toggleTodo: (state, id) => {
                    const todo = state.todos.items.value.find(t => t.id === id);
                    if (todo) todo.completed = !todo.completed;
                }
            }
        });

        // Create individual state properties
        const notification = store.createState("notification", null);

        // Create individual actions
        store.createAction("showNotification", (state, message) => {
            state.notification.value = message;
            setTimeout(() => state.notification.value = null, 3000);
        });

        return {
            todos: store.state.todos.items,
            notification,
            addTodo: (text) => store.dispatch("todos.addTodo", text),
            notify: (msg) => store.dispatch("showNotification", msg)
        };
    }
});

// Subscribe to store changes
const unsubscribe = app.store.subscribe((mutation, state) => {
    console.log('Store updated:', mutation.type, state);
});

// Access store globally
console.log(app.store.getState()); // Get current state values
app.dispatch("increment");          // Dispatch actions globally
```

**Features:**
- 🔄 **Reactive State**: Uses Eleva's native signals for fine-grained reactivity
- 🎯 **Action-Based Mutations**: Structured state updates through actions
- 📦 **Namespaced Modules**: Organize state with modular architecture
- 💾 **Built-in Persistence**: LocalStorage/SessionStorage integration
- ⚡ **Component-Level Registration**: Register state and actions from components
- 🔗 **Cross-Component Updates**: Automatic UI updates across all components
- 🔧 **Runtime Extensibility**: Add state and actions dynamically
- 🎛️ **DevTools Integration**: Debug with browser developer tools

#### Plugin Installation

```javascript
// Import plugins
import { Attr, Router, Props, Store } from 'eleva/plugins';

// Install multiple plugins
const app = new Eleva("myApp");
app.use(Attr);
app.use(Router, routerOptions);
app.use(Props, propsOptions);
app.use(Store, storeOptions);

// Or install with options
app.use(Attr, {
    enableAria: true,
    enableData: true
});

app.use(Props, {
    enableAutoParsing: true,
    enableReactivity: true
});

app.use(Store, {
    state: { counter: 0, theme: "light" },
    actions: {
        increment: (state) => state.counter.value++
    },
    persistence: { enabled: true }
});
```

#### Bundle Sizes

- **Core framework only**: ~6KB (minified)
- **Core + Attr plugin**: ~8.3KB (minified)
- **Core + Router plugin**: ~19KB (minified)
- **Core + Props plugin**: ~8.5KB (minified)
- **Core + Store plugin**: ~9.5KB (minified)
- **Core + All plugins**: ~25KB (minified)

**Individual Plugin Sizes:**
- **Attr plugin only**: ~2.3KB (minified)
- **Router plugin only**: ~13KB (minified)
- **Props plugin only**: ~2.5KB (minified)
- **Store plugin only**: ~3.5KB (minified)

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
- [Router Plugin Example](https://github.com/TarekRaafat/eleva/blob/master/examples/router-plugin.html)
- [Attribute Handler Plugin Example](https://github.com/TarekRaafat/eleva/blob/master/examples/attribute-handler-plugin.html)

Interactive demos are also available on Eleva's [CodePen Collection](https://codepen.io/collection/dGGqWr) for you to experiment live.

---

## 12. FAQ

**Q: Is Eleva production-ready?**
_A:_ Eleva is currently in release candidate (RC). While it's stable and suitable for production use, we're still gathering feedback before the final v1.0.0 release.

**Q: How do I report issues or request features?**
_A:_ Please use the [GitHub Issues](https://github.com/TarekRaafat/eleva/issues) page.

**Q: Can I use Eleva with TypeScript?**
_A:_ Absolutely! Eleva includes built-in TypeScript declarations to help keep your codebase strongly typed.

**Q: Does Eleva include routing capabilities?**
_A:_ Yes! Eleva includes a powerful built-in RouterPlugin that provides advanced client-side routing with navigation guards, reactive state, and component resolution. You can import it from `eleva/plugins`.

**Q: What plugins are available with Eleva?**
_A:_ Eleva comes with four powerful built-in plugins: Attr for advanced attribute handling, Router for client-side routing, Props for advanced props data handling with automatic type detection and reactivity, and Store for reactive state management with persistence and namespacing. All plugins are designed to work seamlessly with the core framework.

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

- **Built-in Plugins:**
  - **Attr:** Advanced attribute handling with ARIA support
  - **Router:** Client-side routing with navigation guards and reactive state
  - **Props:** Advanced props data handling with automatic type detection and reactivity
  - **Store:** Reactive state management with persistence and namespacing

- **Eleva (Core):**  
  `new Eleva(name, config)`, `use(plugin, options)`, `component(name, definition)`, and `mount(container, compName, props)`

---

## 15. Contributing

Contributions are welcome! Whether you're fixing bugs, adding features, or improving documentation, your input is invaluable. Please checkout the [CONTRIBUTING](https://github.com/TarekRaafat/eleva/blob/master/CONTRIBUTING.md) file for detailed guidelines on how to get started.

---

## 16. Community & Support

Join our community for support, discussions, and collaboration:

- **GitHub Discussions:** For general questions or new ideas please start a discussion on [Eleva Discussions](https://github.com/TarekRaafat/eleva/discussions)
- **GitHub Issues:** Report bugs or request features on [GitHub Issues](https://github.com/TarekRaafat/eleva/issues)
- **Stack Overflow:** For technical questions and support, please post your question on Stack Overflow using any of these tags [eleva](https://stackoverflow.com/questions/tagged/eleva), [eleva.js](https://stackoverflow.com/questions/tagged/eleva.js)
- **Reddit:** Join our subreddit community at [r/elevajs](https://www.reddit.com/r/elevajs/) to share projects, ask questions, and connect with other developers
- **Discord:** Connect with us on [Discord](https://discord.gg/Dg7cMKpvyZ) to discuss eleva.js, ask questions, and contribute!
- **Telegram:** For general questions, new ideas please, or even support join us on our [Telegram](https://t.me/+TcMXcHsRX9tkMmI0) group for realtime feedback.

---

## 17. Changelog

For a detailed log of all changes and updates, please refer to the [Changelog](https://github.com/TarekRaafat/eleva/blob/master/CHANGELOG.md).

---

## 18. License

Eleva is open-source and available under the [MIT License](https://github.com/TarekRaafat/eleva/blob/master/LICENSE).

---

## 19. Sponsors & Partners

We gratefully acknowledge the organizations that help make Eleva.js possible.

<p>
  <a href="https://canonical.com" target="_blank" rel="noopener">
    <img src="https://raw.githubusercontent.com/SebastJava/Ubuntu-logo/649d55eca403302fb06281d9dd94798bb0568e8d/logo-v2025-plain-450x708.svg" alt="Canonical Logo" width="100"/>
  </a>
</p>

<p>
  <em>Initial development of Eleva has been supported by <a href="https://canonical.com">Canonical</a>, the publisher of Ubuntu.</em>
</p>

---

Thank you for exploring Eleva! I hope this documentation helps you build amazing, high-performance frontend applications using pure vanilla JavaScript. For further information, interactive demos, and community support, please visit the [GitHub Discussions](https://github.com/TarekRaafat/eleva/discussions) page.