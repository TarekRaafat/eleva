# eleva.js 🚀

Pure JavaScript, Pure Performance, Simply Elegant.

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
  <a href="https://tarekraafat.github.io/eleva/"><img src="./docs/imgs/eleva.js Full Logo.png" alt="eleva.js Full Logo" width="50%"></a>
</p>

<p align="center">
  <a href="https://canonical.com" target="_blank" rel="noopener">
    <img src="https://raw.githubusercontent.com/SebastJava/Ubuntu-logo/649d55eca403302fb06281d9dd94798bb0568e8d/logo-v2025-plain-450x708.svg" alt="Canonical Logo" width="80"/>
  </a>
</p>

<p align="center">
  <em>Eleva.js is proudly supported by Canonical - the company behind Ubuntu.</em>
</p>

<p align="center">
  <a href="https://www.producthunt.com/posts/eleva?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-eleva" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=938663&theme=light&t=1741247713068" alt="eleva.js - A&#0032;minimalist&#0044;&#0032;pure&#0032;vanilla&#0032;javascript&#0032;frontend&#0032;framework&#0046; | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
</p>

<br>
<br>
<br>

**A minimalist, lightweight, pure vanilla JavaScript frontend runtime framework.**  
_Built with love for native JavaScript and designed with a minimal core that can be extended through a powerful plugin system-because sometimes, less really is more!_ 😊

> **Stability Notice**: This is `v1.0.0-rc.7` - The core functionality is stable. Seeking community feedback before the final v1.0.0 release.

**Version:** `1.0.0-rc.7`



Welcome to Eleva! This is my humble, experimental playground for a fresh approach to frontend development. Eleva was born out of my genuine passion for pure vanilla JavaScript-no frameworks, no bloat, just the power of native code. I hope you'll have fun exploring, testing, and contributing to make Eleva even better. 🚀

---

## Table of Contents

- [eleva.js 🚀](#elevajs-)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Design Philosophy](#design-philosophy)
  - [Handcrafted \& Developer-Centric Design](#handcrafted--developer-centric-design)
  - [Features](#features)
  - [When to Use Eleva](#when-to-use-eleva)
  - [Version Strategy](#version-strategy)
  - [Version Guide](#version-guide)
  - [Performance](#performance)
  - [Performance Benchmarks](#performance-benchmarks)
  - [Eleva vs. Popular Frameworks](#eleva-vs-popular-frameworks)
  - [Installation](#installation)
  - [Usage](#usage)
    - [ES Module Example](#es-module-example)
    - [UMD Example](#umd-example)
  - [API Reference](#api-reference)
    - [TemplateEngine](#templateengine)
    - [Signal](#signal)
    - [Emitter](#emitter)
    - [Renderer](#renderer)
    - [Eleva (Core)](#eleva-core)
    - [Plugins](#plugins)
      - [Core Framework Only (Lightweight)](#core-framework-only-lightweight)
      - [AttrPlugin](#attrplugin)
      - [RouterPlugin](#routerplugin)
      - [StorePlugin](#storeplugin)
  - [Development](#development)
  - [Testing](#testing)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)

---

## Introduction

Eleva is a lightweight, no-nonsense runtime framework for frontend applications. Built with love for **pure vanilla JavaScript**, Eleva features a minimal core with essential functionality that can be extended through a powerful plugin system. This approach lets you create highly modular and scalable applications without the overhead of large frameworks. I built Eleva to prove that you don't need heavy frameworks or libraries to build amazing user interfaces-sometimes, the simplest approach is the most powerful.

**My Inspiration:**  
The idea behind Eleva comes from a deep appreciation for native JavaScript. I wanted to create a tool that stays true to the language without introducing new syntax or complexity, making it easy to integrate into your projects.

**Core Principles:**

- **🌱 Minimalism:** Only essential features in the core, keeping the framework lean and focused.
- **🔌 Extensibility:** Extend functionality by plugging in your own ideas, such as custom state management, routing, and more.
- **🚀 Performance:** Fast, efficient, and designed with modern browsers in mind.
- **🍦 Pure Vanilla:** No dependencies, no magic-just plain JavaScript.

---

## Design Philosophy

**Eleva is an unopinionated framework with a minimal core philosophy.**

Unlike monolithic frameworks that include everything out-of-the-box, Eleva intentionally provides only essential features in its core, relying on a powerful plugin system for extensibility. This architectural choice means:

- **🔄 Flexibility:** Architect your application your way-no rigid structure required.
- **🎯 Native JavaScript:** Built using pure vanilla JavaScript, Eleva integrates seamlessly with your existing code without unfamiliar syntax.
- **⚙️ Configurability:** Extend Eleva's functionality with a simple API and optional plugins.
- **🆓 Freedom:** Decide the best way to implement features without unnecessary constraints.

This unopinionated approach makes Eleva versatile and ideal for developers who want full control over their application's design.

---

## Handcrafted & Developer-Centric Design

Eleva is built with meticulous attention to detail and a deep passion for pure vanilla JavaScript. Every aspect of its design and architecture is handcrafted with the developer in mind. This makes Eleva not only innovative but also a solid foundation for your projects.

- **🎨 Craftsmanship:** Every line of code is written with care, keeping the framework lightweight, efficient, and easy to understand.
- **🛠️ Developer-Centric:** Its intuitive API and minimal core mean you spend less time wrestling with the framework and more time building your application.
- **🌟 Innovative & Fresh:** Stick to pure vanilla JavaScript and avoid unnecessary abstractions.
- **🏗️ Solid & Reliable:** Focused on performance and modularity, Eleva scales with your project's needs.

This unique, developer-first approach makes Eleva a standout choice for building high-performance frontend applications without compromising on simplicity or control.

---

## Features

- **🧩 Component-Based Architecture:** Create reusable UI components with a rich context API
- **⚡ Signal-Based Reactivity:** Fine-grained reactivity that updates only what's needed
- **🔔 Event Handling:** Built-in event emitter for robust inter-component communication
- **📝 Template Parsing:** Secure and dynamic interpolation with a custom TemplateEngine
- **🔄 DOM Diffing & Patching:** High-performance updates without a virtual DOM
- **🔄 Lifecycle Hooks:** Complete lifecycle management with before/after mount and update hooks
- **🧹 Automatic Cleanup:** Proper cleanup of resources, watchers, and child components on unmount
- **🔌 Plugin System:** Extensible architecture with a simple plugin API
- **🎯 Built-in Plugins:** AttrPlugin for advanced attributes, RouterPlugin for client-side routing, and StorePlugin for reactive state management
- **📦 UMD & ES Module Builds:** Supports modern build tools and browser environments
- **🤝 Friendly API:** A gentle learning curve for both beginners and seasoned developers
- **💎 Tiny Footprint & TypeScript Support:** Approximately ~6 KB minified with built-in TypeScript declarations

---

## When to Use Eleva

Eleva is ideal for developers seeking a lightweight, flexible, and high-performance solution for building frontend applications. Here are some scenarios where Eleva shines:

- **🚀 Small to Medium Projects:** Perfect for web apps or websites that don't require the overhead of a full-fledged framework.
- **⚡ Performance-Critical Applications:** Optimized reactivity and DOM diffing ensure smooth performance without bloat.
- **🔄 Unopinionated & Flexible:** Architect your application your way with a straightforward API and plugin system.
- **🎯 Developer-Friendly:** Stick to pure vanilla JavaScript with familiar syntax and built-in TypeScript support.
- **🧪 Rapid Prototyping:** Quickly prototype ideas with a minimal and extendable framework.
- **🔌 Extensible:** Easily add features like routing or state management through plugins.
- **🚀 Built-in Routing:** Advanced client-side routing with navigation guards and reactive state via RouterPlugin.
- **🎯 Advanced Attributes:** Sophisticated attribute handling with ARIA support via AttrPlugin.
- **🏪 Reactive State Management:** Centralized, reactive data store with persistence and namespacing via StorePlugin.
- **📦 Module Format Flexibility:** Choose from ESM, CommonJS, or UMD formats based on your project's needs.

---

## Version Strategy

I believe in clear versioning that reflects the maturity of the project:

- **Pre-release Versions (Alpha/Beta):** Early versions like `1.2.0-alpha` indicate the API is still evolving. Expect frequent updates and share your feedback!
- **Semantic Versioning:** Once stable, I'll follow semantic versioning strictly to clearly communicate any breaking changes.
- **Fresh Start:** This release (`1.2.0-alpha`) marks a significant update with enhanced inline documentation, improved JSDoc annotations, and a refined mounting context that now includes an `emitter` property.

---

## Version Guide

I follow [Semantic Versioning (SemVer)](https://semver.org/):

- **🔢 Major Version:** Breaking changes or major overhauls (e.g., from `1.0.0` to `2.0.0`).
- **🔢 Minor Version:** New features in a backward-compatible manner (e.g., from `1.1.0` to `1.2.0`).
- **🔢 Patch Version:** Backward-compatible bug fixes and minor improvements (e.g., `1.0.1`).
- **📌 Pre-release Identifiers:** Suffixes like `-alpha`, `-beta`, or `-rc` denote unstable releases (e.g., `1.2.0-alpha`).

---

## Performance

Eleva is crafted for performance:

- **Lightweight:** Approximately ~6 KB minified and ~2 KB gzipped.
- **Efficient Reactivity:** Signal-based updates ensure only necessary DOM parts are updated.
- **Optimized Diffing:** Renderer efficiently patches changes without the overhead of a virtual DOM.
- **No Bloat:** Pure vanilla JavaScript with zero dependencies keeps your project nimble.
- **Tree-Shakable:** ESM format allows bundlers to eliminate unused code.
- **Format-Specific Optimizations:** Each module format is optimized for its target environment.

---

## Performance Benchmarks

Preliminary benchmarks illustrate Eleva's efficiency compared to popular frameworks:

| **Framework**                 | **Bundle Size** (KB) | **Initial Load Time** (ms) | **DOM Update Speed** (s) | **Peak Memory Usage** (KB) | **Overall Performance Score** (lower is better) |
| ----------------------------- | -------------------- | -------------------------- | ------------------------ | -------------------------- | ----------------------------------------------- |
| **Eleva** (Direct DOM)        | **2**                | **0.05**                   | **0.002**                | **0.25**                   | **0.58 (Best)**                                 |
| **React** (Virtual DOM)       | 4.1                  | 5.34                       | 0.020                    | 0.25                       | 9.71                                            |
| **Vue** (Reactive State)      | 45                   | 4.72                       | 0.021                    | 3.10                       | 13.21                                           |
| **Angular** (Two-way Binding) | 62                   | 5.26                       | 0.021                    | 0.25                       | 16.88 (Slowest)                                 |

Detailed [Benchmark Metrics Report](BENCHMARK.md)

> ⚠️ **Disclaimer:** Benchmarks are based on internal tests and may vary by project and environment.

---

## Eleva vs. Popular Frameworks

Eleva offers a refreshing alternative to frameworks like React, Vue, and Angular:

- **Simplicity:** No virtual DOM, JSX, or complex state management-just plain JavaScript.
- **Modularity:** Easily extend via plugins to suit your project's needs.
- **Size:** A fraction of the size of mainstream frameworks.
- **Learning Curve:** Familiar syntax and a clear API make it accessible to all developers.

_Note:_ Eleva isn't trying to replace these giants but provides a lightweight option when you want simplicity and speed. 🌟

---

## Installation

Eleva is available on npm. Try it out and share your thoughts!

```bash
npm install eleva
```

Or include it directly via CDN:

```html
<!-- jsDelivr (Recommended) -->
<script src="https://cdn.jsdelivr.net/npm/eleva"></script>
```

or

```html
<!-- unpkg -->
<script src="https://unpkg.com/eleva"></script>
```

---

## Usage

### ES Module Example

```js
// Import Eleva (using ES modules)
import Eleva from "eleva";

// Create a new Eleva instance
const app = new Eleva("MyApp");

// Define a component
app.component("HelloWorld", {
  // The setup method is optional; if omitted, an empty state is used.
  setup({ signal }) {
    const count = signal(0);
    return { 
      count,
      onMount: ({ container, context }) => {
        console.log('Component mounted!');
      }
    };
  },
  template: ({ count }) => `
    <div>
      <h1>Hello, Eleva! 👋</h1>
      <p>Count: ${count.value}</p>
      <button @click="() => count.value++">Increment</button>
    </div>
  `
});

// Mount the component and handle the Promise
app.mount(document.getElementById("app"), "HelloWorld")
  .then(instance => {
    console.log("Component mounted:", instance);
    // Later...
    // instance.unmount();
  });
```

Interactive Demo: [CodePen](https://codepen.io/tarekraafat/pen/GgRrxdY?editors=1010)

### UMD Example

Include Eleva via a script tag and use the global variable:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Eleva Example</title>
  </head>
  <body>
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/eleva"></script>
    <script>
      const app = new Eleva("MyApp");
      app.component("HelloWorld", {
        setup({ signal }) {
          const count = signal(0);
          return { count };
        },
        template: ({ count }) => `
          <div>
            <h1>Hello, Eleva! 👋</h1>
            <p>Count: ${count.value}</p>
            <button @click="() => count.value++">Increment</button>
          </div>
        `,
      });
      app.mount(document.getElementById("app"), "HelloWorld");
    </script>
  </body>
</html>
```

Interactive Demo: [CodePen](https://codepen.io/tarekraafat/pen/jEOyzYN?editors=1010)

---

## API Reference

### TemplateEngine

- **`TemplateEngine.parse(template, data)`**
  Replaces `{{ expression }}` patterns in the template with evaluated values.
- **`TemplateEngine.evaluate(expr, data)`**
  Safely evaluates JavaScript expressions within a given context.

### Signal

- **`new Signal(initialValue)`**
  Creates a reactive data holder.
- **`.value` (getter/setter)**
  Get or update the current value and trigger watchers.
- **`.watch(callback)`**
  Registers a function to run when the value updates.

### Emitter

- **`new Emitter()`**
  Creates an Emitter instance.
- **`.on(event, handler)`**
  Listen to events.
- **`.off(event, handler)`**
  Remove event listeners.
- **`.emit(event, ...args)`**
  Trigger events with additional arguments.

### Renderer

- **`new Renderer()`**
  Creates a Renderer instance.
- **`.patchDOM(container, newHtml)`**:
  Updates container content with the new HTML.

### Eleva (Core)

- **`new Eleva(name, config)`**  
  Create an Eleva instance.
- **`.use(plugin, options)`**  
  Install plugins.
- **`.component(name, definition)`**  
  Register a component.
- **`.mount(container, compName, props)`**  
  Mount a component to the DOM.

### Plugins

Eleva's plugin system allows you to extend functionality as needed. Plugins are **separately bundled** from the core framework, ensuring optimal tree-shaking and minimal bundle sizes.

#### Core Framework Only (Lightweight)

```javascript
import Eleva from 'eleva';

const app = new Eleva("myApp");
// Core framework only - ~6KB minified
```

#### AttrPlugin

Advanced attribute handling for ARIA, data attributes, boolean properties, and dynamic property detection:

```javascript
import Eleva from 'eleva';
import { Attr } from 'eleva/plugins';

const app = new Eleva("myApp");
app.use(Attr, {
    enableAria: true,      // ARIA attribute handling
    enableData: true,       // Data attribute management
    enableBoolean: true,    // Boolean attribute processing
    enableDynamic: true     // Dynamic property detection
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

#### RouterPlugin

🚀 **Advanced client-side routing** with multiple modes, navigation guards, reactive state, and component resolution:

```javascript
import Eleva from 'eleva';
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

#### StorePlugin

🏪 **Reactive state management** with centralized data store, persistence, namespacing, and cross-component reactive updates:

```javascript
import Eleva from 'eleva';
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

**Bundle Sizes:**
- Core framework only: ~6KB (minified)
- Core + AttrPlugin: ~8.5KB (minified)
- Core + RouterPlugin: ~9KB (minified)
- Core + StorePlugin: ~9.5KB (minified)
- Core + All plugins: ~13KB (minified)

**Available Plugin Formats:**

**For Bundlers (Tree-Shaking Supported):**
- ESM: `import { Attr, Router, Store } from 'eleva/plugins'`
- CJS: `const { Attr, Router, Store } = require('eleva/plugins')`

**For CDN (Individual Plugins - Smaller Bundle Size):**
- UMD: `<script src="https://unpkg.com/eleva@latest/dist/eleva.umd.min.js"></script>`
- UMD: `<script src="https://unpkg.com/eleva@latest/dist/plugins/attr.umd.min.js"></script>`
- UMD: `<script src="https://unpkg.com/eleva@latest/dist/plugins/router.umd.min.js"></script>`
- UMD: `<script src="https://unpkg.com/eleva@latest/dist/plugins/store.umd.min.js"></script>`

**Individual Plugin Imports (Best for Tree-Shaking):**
- ESM: `import { Attr } from 'eleva/plugins/attr'`
- ESM: `import { Router } from 'eleva/plugins/router'`
- ESM: `import { Store } from 'eleva/plugins/store'`
- CJS: `const { Attr } = require('eleva/plugins/attr')`
- CJS: `const { Router } = require('eleva/plugins/router')`
- CJS: `const { Store } = require('eleva/plugins/store')`

For detailed API documentation, please check the [docs](docs/index.md) folder.

---

## Development

I welcome developers to dive in and experiment with Eleva! Here's how to get started locally:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/TarekRaafat/eleva.git
   cd eleva
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Run in Development Mode (Watch):**

   ```bash
   npm run dev
   ```

4. **Build for Production without TypeScript Declarations:**

   ```bash
   npm run build
   ```

5. **Generate and Bundle TypeScript Declarations:**

   ```bash
   npm run build:types
   npm run build:types:bundle
   ```

6. **Build for Production with TypeScript Declarations:**

   ```bash
   npm run build:all
   ```

---

## Testing

I use Jest for testing. Run the test suite with:

```bash
npm test
```

Contributions to tests are very welcome! 🧪

---

## Contributing

I'd love to have you onboard as a contributor! Whether you're adding new features, squashing bugs, or sharing ideas, your input is invaluable. Please check out [CONTRIBUTING](CONTRIBUTING.md) for guidelines on getting started.

---

## License

Eleva is open-source and available under the [MIT License](LICENSE).

---

## Contact

- **Author:** [Tarek Raafat](https://github.com/TarekRaafat)
- **Email:** [tarek.m.raafat@gmail.com](mailto:tarek.m.raafat@gmail.com)
- **Website:** [tarekraafat.com](https://www.tarekraafat.com)

---

**Note:** This is a beta release. I'm still polishing things up, so expect some bumps along the way. Your feedback and contributions will help shape Eleva into something truly amazing. Let's build something great together! 💪✨

---

[![NPM](https://nodei.co/npm/eleva.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/eleva/)

---

[Documentation](/docs/index.md) |
[Examples](/examples) |
[Changelog](/CHANGELOG.md) |
[GitHub Discussions](https://github.com/TarekRaafat/eleva/discussions)
