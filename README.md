# Eleva.js 🚀

> **Version:** `1.1.1` | **Size:** ~6KB min (~2.5KB gzip) | **Dependencies:** Zero | **TypeScript:** Yes
>
> *Also known as: elevajs, eleva*

**Best DX for Building the Best UX** — Pure JavaScript, Pure Performance, Simply Elegant.

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/tarekraafat/eleva?label=github)](https://github.com/TarekRaafat/eleva)
[![Version](https://img.shields.io/npm/v/eleva.svg?style=flat)](https://www.npmjs.com/package/eleva)
![100% Javascript](https://img.shields.io/github/languages/top/TarekRaafat/eleva?color=yellow)
![Zero Dependencies](https://img.shields.io/badge/dependencies-0-green.svg)
[![codecov](https://codecov.io/gh/TarekRaafat/eleva/branch/master/graph/badge.svg?token=LFA6KENM24)](https://codecov.io/gh/TarekRaafat/eleva)
[![Minified Size](https://badgen.net/bundlephobia/min/eleva@latest)](https://bundlephobia.com/package/eleva@latest)
[![Gzipped Size](https://badgen.net/bundlephobia/minzip/eleva@latest)](https://bundlephobia.com/package/eleva@latest)
[![](https://data.jsdelivr.com/v1/package/npm/eleva/badge?style=rounded)](https://www.jsdelivr.com/package/npm/eleva)

<br>

<p align="center">
  <a href="https://elevajs.com/"><img src="./docs/imgs/eleva.js Full Logo.png" alt="Eleva.js Logo - A minimalist, lightweight pure vanilla JavaScript frontend framework" width="50%"></a>
</p>

<p align="center">
  <a href="https://www.producthunt.com/posts/eleva?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-eleva" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=938663&theme=light&t=1741247713068" alt="eleva.js - A&#0032;minimalist&#0044;&#0032;pure&#0032;vanilla&#0032;javascript&#0032;frontend&#0032;framework&#0046; | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
</p>

<br>
<br>
<br>

**A minimalist, lightweight, pure vanilla JavaScript frontend runtime framework.**
_Designed for the best Developer Experience (DX) to help you build exceptional User Experiences (UX). Built with love for native JavaScript and a minimal core that can be extended through a powerful plugin system — because sometimes, less really is more!_ 😊

> **Stable Release**: This is `v1.1.1` - The latest stable release of Eleva.js!



Welcome to Eleva! This is my humble, experimental playground for a fresh approach to frontend development. Eleva was born out of my genuine passion for pure vanilla JavaScript-no frameworks, no bloat, just the power of native code. I hope you'll have fun exploring, testing, and contributing to make Eleva even better. 🚀

---

## What is Eleva.js?

**Eleva** is a minimalist, lightweight (6KB), pure vanilla JavaScript frontend framework crafted for **exceptional Developer Experience (DX)**. When developers enjoy building, users enjoy using — Eleva makes it effortless to create beautiful, responsive, and performant User Interfaces (UI) without the complexity, bundle size, or build tool requirements of traditional frameworks.

Unlike React, Vue, or Angular, Eleva:
- **Has zero dependencies** - No node_modules bloat
- **Requires no build step** - Works directly in browsers via CDN
- **Uses real DOM** - No virtual DOM overhead for simple apps
- **Provides signal-based reactivity** - Fine-grained updates like Solid.js
- **Includes TypeScript support** - Built-in type declarations
- **Is just JavaScript** - If it works in vanilla JS, it works in Eleva

Eleva is ideal for developers building performance-critical applications, data-intensive dashboards (10K+ rows), micro-frontends, or anyone seeking a simpler alternative to React, Vue, or Angular.

---

## Table of Contents

- [Eleva.js 🚀](#elevajs-)
  - [What is Eleva.js?](#what-is-elevajs)
  - [Table of Contents](#table-of-contents)
  - [Quick Reference](#quick-reference)
  - [Introduction](#introduction)
  - [Design Philosophy](#design-philosophy)
  - [Best-in-Class Developer Experience (DX)](#best-in-class-developer-experience-dx)
  - [Features](#features)
  - [When to Use Eleva](#when-to-use-eleva)
  - [Version Strategy](#version-strategy)
  - [Version Guide](#version-guide)
  - [Performance](#performance)
  - [Performance Benchmarks](#performance-benchmarks)
  - [Eleva vs. Popular Frameworks](#eleva-vs-popular-frameworks)
  - [Browser Support](#browser-support)
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
      - [Attr Plugin](#attr-plugin)
      - [Router Plugin](#router-plugin)
      - [Store Plugin](#store-plugin)
  - [Development](#development)
  - [Testing](#testing)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)

---

## Quick Reference

### Minimal Setup (30 seconds)

```javascript
import Eleva from "eleva";

const app = new Eleva("MyApp");

app.component("Counter", {
  setup: ({ signal }) => ({ count: signal(0) }),
  template: (ctx) => `<button @click="() => count.value++">${ctx.count.value}</button>`
});

app.mount(document.getElementById("app"), "Counter");
```

### API at a Glance

| Method | Purpose |
|--------|---------|
| `new Eleva(name)` | Create app |
| `app.component(name, def)` | Register component |
| `app.mount(el, name)` | Mount to DOM |
| `app.use(plugin)` | Add plugin |
| `signal(value)` | Reactive state |
| `emitter.on/emit` | Events |

### Template Syntax

> **Quick Rule:** `${}` needs `ctx.` — `@events` and `:props` don't.

| Syntax | Use | `ctx.`? |
|--------|-----|:-------:|
| `${expr}` | JS value interpolation | ✓ |
| `@click` | Event handler | ✗ |
| `:prop` | Pass to child | ✗ |

> **How it works:** Use `${ctx.value}` to interpolate values into your template. For `@events` and `:props`, expressions are evaluated against the component context directly — no `ctx.` prefix needed. This allows cleaner syntax like `:user="userData"` instead of `:user="${ctx.userData}"`.

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
- **🔍 Transparent:** No hidden layers or abstractions — if it works in vanilla JS, it works in Eleva.

---

## Design Philosophy

**Eleva is an unopinionated framework with a minimal core philosophy.**

Unlike monolithic frameworks that include everything out-of-the-box, Eleva intentionally provides only essential features in its core, relying on a powerful plugin system for extensibility. This architectural choice means:

- **🔄 Flexibility:** Architect your application your way-no rigid structure required.
- **🎯 Native JavaScript:** Built using pure vanilla JavaScript, Eleva integrates seamlessly with your existing code without unfamiliar syntax.
- **⚙️ Configurability:** Extend Eleva's functionality with a simple API and optional plugins.
- **🆓 Freedom:** Decide the best way to implement features without unnecessary constraints.
- **🔍 Transparent:** No magic, no hidden abstractions — what you write is what runs.

### Core Philosophy

> **💡 Vanilla JavaScript. Elevated.**

Eleva takes plain vanilla JavaScript to the next level. Signals for reactivity. Components for structure. Your JS knowledge stays front and center, not hidden behind abstractions. **If it works in vanilla JS, it works in Eleva.**

---

## Best-in-Class Developer Experience (DX)

Eleva is built on a simple principle: **great DX leads to great UX**. When developers have intuitive tools, they build better interfaces. Every aspect of Eleva's design prioritizes your productivity and enjoyment.

**Why Eleva's DX Stands Out:**

| DX Feature | How It Helps You Build Better UX |
|------------|----------------------------------|
| **Zero Config** | Start building immediately — no webpack, no bundlers, no setup |
| **Intuitive API** | Learn in minutes, master in hours — more time for polishing UI |
| **Pure JavaScript** | No JSX, no compilation — what you write is what runs |
| **Instant Feedback** | Signal-based reactivity shows changes immediately |
| **TypeScript Built-in** | Full autocomplete and type safety out of the box |
| **Tiny Bundle** | ~2.5KB gzipped means instant page loads for your users |

- **🎨 Craftsmanship:** Every line of code is written with care, keeping the framework lightweight, efficient, and easy to understand.
- **🛠️ Developer-First:** Intuitive API and minimal core mean you spend less time wrestling with the framework and more time perfecting your UI.
- **🌟 No Magic:** Pure vanilla JavaScript with no hidden abstractions — debug easily, ship confidently.
- **🏗️ Scales With You:** From prototype to production, Eleva grows with your project without added complexity.

> _"The best UX comes from developers who love their tools."_ — Eleva's DX philosophy

---

## Features

- **🧩 Component-Based Architecture:** Create reusable UI components with a rich context API
- **⚡ Signal-Based Reactivity:** Fine-grained reactivity that updates only what's needed
- **🔔 Event Handling:** Built-in event emitter for robust inter-component communication
- **📝 Template Parsing:** Dynamic interpolation with a custom TemplateEngine (trusted templates only)
- **🔄 DOM Diffing & Patching:** High-performance updates without a virtual DOM
- **🔄 Lifecycle Hooks:** Complete lifecycle management with before/after mount and update hooks
- **🧹 Automatic Cleanup:** Proper cleanup of resources, watchers, and child components on unmount
- **🔌 Plugin System:** Extensible architecture with a simple plugin API
- **🎯 Built-in Plugins:** Attr for advanced attributes, Router for client-side routing, and Store for reactive state management
- **📦 UMD & ES Module Builds:** Supports modern build tools and browser environments
- **🤝 Friendly API:** A gentle learning curve for both beginners and seasoned developers
- **💎 Tiny Footprint & TypeScript Support:** Approximately ~6 KB minified with built-in TypeScript declarations

---

## When to Use Eleva

Eleva is ideal for developers seeking a lightweight, flexible, and high-performance solution for building frontend applications. Here are some scenarios where Eleva shines:

- **⚡ Performance-Critical Applications:** 240fps-capable rendering handles everything from simple counters to 10K+ row dashboards (via virtual scrolling).
- **📦 Bundle-Sensitive Projects:** At ~6KB with zero dependencies, ideal for embedded widgets, micro-frontends, and mobile-first apps.
- **🔄 Unopinionated & Flexible:** Architect your application your way with a straightforward API and plugin system.
- **🎯 Developer-Friendly:** Stick to pure vanilla JavaScript with familiar syntax and built-in TypeScript support.
- **🧪 Rapid Prototyping:** Start building immediately—no build tooling required.
- **🔌 Extensible:** Easily add features like routing or state management through plugins.
- **🚀 Built-in Routing:** Advanced client-side routing with navigation guards and reactive state via Router plugin.
- **🎯 Advanced Attributes:** Sophisticated attribute handling with ARIA support via Attr plugin.
- **🏪 Reactive State Management:** Centralized, reactive data store with persistence and namespacing via Store plugin.
- **📦 Module Format Flexibility:** Choose from ESM, CommonJS, or UMD formats based on your project's needs.

---

## Version Strategy

I believe in clear versioning that reflects the maturity of the project:

- **Stable Versions:** Version `1.0.0` and above follow semantic versioning with full backward compatibility guarantees within major versions.
- **Semantic Versioning:** Eleva follows semantic versioning strictly to clearly communicate any breaking changes.

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

- **Lightweight:** Approximately ~6 KB minified and ~2.5 KB gzipped.
- **Efficient Reactivity:** Signal-based updates ensure only necessary DOM parts are updated.
- **Optimized Diffing:** Renderer efficiently patches changes without the overhead of a virtual DOM.
- **No Bloat:** Pure vanilla JavaScript with zero dependencies keeps your project nimble.
- **Tree-Shakable:** ESM format allows bundlers to eliminate unused code.
- **Format-Specific Optimizations:** Each module format is optimized for its target environment.

---

## Performance Benchmarks

Benchmarks using [js-framework-benchmark](https://krausest.github.io/js-framework-benchmark/) methodology (1,000 rows):

| **Framework**                 | **Bundle Size (min+gzip)** | **Create 1K Rows** (ms) | **Partial Update** (ms) | **Memory** (MB)* |
| ----------------------------- | -------------------------- | ----------------------- | ----------------------- | ---------------- |
| **Eleva** (Direct DOM)        | **~2.5 KB**                | **~25**                 | ~86                     | **~0.5** (Chrome) |
| **React 19** (Virtual DOM)    | ~44 KB                     | 40-70                   | 10-20                   | 2-5              |
| **Vue 3.5** (Reactive)        | ~35 KB                     | 25-45                   | 5-15                    | 2-4              |
| **Angular 19** (Signals)      | ~90 KB                     | 50-80                   | 15-25                   | 3-6              |

**Eleva's Strengths:**
- **Smallest bundle size** (~2.5 KB vs 35-90 KB)
- **Competitive initial render** (~25ms for 1K rows)
- **Zero dependencies** and minimal runtime overhead
- **Direct DOM diffing** without virtual DOM overhead

**Performance Tips:**
- Use `key` attribute on list items for optimal diffing
- Eleva excels at initial renders and memory efficiency
- For large lists (10K+ rows), use [virtual scrolling](https://elevajs.com/examples/patterns/lists/virtual-scrolling.html) for **5.5x less memory** and **10x faster creation**
- See [Large List Performance](https://elevajs.com/examples/patterns/best-practices/performance.html#large-list-performance) for detailed patterns and benchmarks

> 💡 **Run benchmarks yourself:** `bun run test:benchmark` | [Detailed benchmark results](https://github.com/TarekRaafat/eleva/blob/master/test/__results__/performance/BENCHMARKS.md)

---

## Eleva vs. Popular Frameworks

How does Eleva compare to popular JavaScript frameworks like React, Vue, Svelte, and Angular?

| Feature | Eleva 1 | React 19 | Vue 3.5 | Svelte 5 | Angular 19 |
|---------|-----------|----------|---------|----------|------------|
| **Bundle Size** | ~6KB | ~44KB | ~45KB | ~3KB* | ~90KB |
| **Dependencies** | 0 | 3+ | 0 | 0 | 10+ |
| **Virtual DOM** | No | Yes | Yes | No | No |
| **Reactivity** | Signals | useState/Hooks | Refs/Reactive | Compiler | Zone.js |
| **TypeScript** | Built-in | Optional | Optional | Built-in | Built-in |
| **Build Required** | No | Yes | Optional | Yes | Yes |
| **Learning Curve** | Low | Medium | Medium | Low | High |

_*Svelte compiles away, so runtime is minimal but build step is required._

Eleva offers a refreshing alternative to frameworks like React, Vue, and Angular:

- **Simplicity:** No virtual DOM, JSX, or complex state management-just plain JavaScript.
- **Modularity:** Easily extend via plugins to suit your project's needs.
- **Size:** A fraction of the size of mainstream frameworks.
- **Learning Curve:** Familiar syntax and a clear API make it accessible to all developers.

_Note:_ Eleva isn't trying to replace these giants but provides a lightweight option when you want simplicity and speed. 🌟

---

## Browser Support

Eleva targets **modern evergreen browsers** and requires no polyfills.

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 71+ |
| Firefox | 69+ |
| Safari | 12.1+ |
| Edge | 79+ (Chromium) |
| iOS Safari | 12.2+ |

**Not Supported:** Internet Explorer, Legacy Edge (< 79)

**Why?** Eleva uses modern JavaScript features (`queueMicrotask`, ES6 Classes, async/await) to maintain its tiny footprint. These browsers cover **96%+ of global web traffic**.

> 💡 For legacy browser support, use Babel with appropriate polyfills.

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
  template: (ctx) => `
    <div>
      <h1>Hello, Eleva! 👋</h1>
      <p>Count: ${ctx.count.value}</p>
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
        template: (ctx) => `
          <div>
            <h1>Hello, Eleva! 👋</h1>
            <p>Count: ${ctx.count.value}</p>
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

### Named Exports

Eleva exposes the core utilities as named exports for direct use and typing:

```javascript
import Eleva, { Signal, Emitter, Renderer, TemplateEngine } from "eleva";
```

### TemplateEngine

- **`TemplateEngine.evaluate(expr, data)`**
  Evaluates JavaScript expressions within a given context (not sandboxed). Used internally for `@events` and `:props` attribute processing.

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
  Remove event listeners (omit `handler` to remove all listeners for the event).
- **`.emit(event, ...args)`**
  Trigger events with additional arguments.

### Renderer

- **`new Renderer()`**
  Creates a Renderer instance.
- **`.patchDOM(container, newHtml)`**:
  Updates container content with the new HTML.

### Eleva (Core)

- **`new Eleva(name)`**  
  Create an Eleva instance.
- **`.use(plugin, options)`**  
  Install plugins.
- **`.component(name, definition)`**  
  Register a component.
- **`.mount(container, compName, props)`**  
  Mount a component to the DOM.

### Plugins

Eleva's plugin system allows you to extend functionality as needed. Plugins are **separately bundled** from the core framework, ensuring optimal tree-shaking and minimal bundle sizes.

**Plugin Types:**

| Type | Source | Installation |
|------|--------|--------------|
| **Core Plugins** | Bundled with Eleva | `import { X } from "eleva/plugins"` |
| **External Plugins** | Community/Ecosystem | `npm install eleva-plugin-x` |

> **Core plugins** (Attr, Router, Store) are official, tested, and documented. **External plugins** are community-created and installed separately. See [Plugin Documentation](https://elevajs.com/plugins/) for details.
> **TypeScript:** Use `import type { ... } from "eleva"` for core types and `import { Attr, Router, Store } from "eleva/plugins"` for plugin types — no deep imports needed.

#### Core Framework Only (Lightweight)

```javascript
import Eleva from 'eleva';

const app = new Eleva("myApp");
// Core framework only - ~6KB minified
```

#### Attr Plugin

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

📚 **[Full Attr Documentation →](https://elevajs.com/plugins/attr/)** - Comprehensive guide with ARIA attributes, data attributes, boolean handling, and dynamic properties.

#### Router Plugin

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
router.currentRoute.watch(route => {
    console.log('Route changed:', route);
});

// Programmatic navigation
router.navigate('/users/123', { replace: true });
```

📚 **[Full Router Documentation →](https://elevajs.com/plugins/router/)** - Comprehensive guide with 13 events, 7 reactive signals, navigation guards, scroll management, and more.

#### Store Plugin

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
                    state.todos.items.value = [...state.todos.items.value, {
                        id: Date.now(),
                        text,
                        completed: false
                    }];
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

📚 **[Full Store Documentation →](https://elevajs.com/plugins/store/)** - Comprehensive guide with 10 API methods, persistence options, namespaces, subscriptions, and migration guides.

**Bundle Sizes:**
- Core framework only: ~6KB (minified)
- Core + Attr: ~8KB (minified)
- Core + Router: ~21KB (minified)
- Core + Store: ~12KB (minified)
- Core + All plugins: ~29KB (minified)

**Individual Plugin Sizes:**
- Attr: ~2.2KB (minified)
- Router: ~15KB (minified)
- Store: ~6KB (minified)

**Available Plugin Formats:**

**For Bundlers (Tree-Shaking Supported):**
- ESM: `import { Attr, Router, Store } from 'eleva/plugins'`
- CJS: `const { Attr, Router, Store } = require('eleva/plugins')`

**For CDN (Individual Plugins - Smaller Bundle Size):**
- UMD: `<script src="https://cdn.jsdelivr.net/npm/eleva@latest/dist/eleva.umd.min.js"></script>`
- UMD: `<script src="https://cdn.jsdelivr.net/npm/eleva@latest/dist/plugins/attr.umd.min.js"></script>`
- UMD: `<script src="https://cdn.jsdelivr.net/npm/eleva@latest/dist/plugins/router.umd.min.js"></script>`
- UMD: `<script src="https://cdn.jsdelivr.net/npm/eleva@latest/dist/plugins/store.umd.min.js"></script>`

**Individual Plugin Imports (Smaller Bundle Size):**
- ESM: `import { Attr } from 'eleva/plugins/attr'`
- ESM: `import { Router } from 'eleva/plugins/router'`
- ESM: `import { Store } from 'eleva/plugins/store'`
- CJS: `const { Attr } = require('eleva/plugins/attr')`
- CJS: `const { Router } = require('eleva/plugins/router')`
- CJS: `const { Store } = require('eleva/plugins/store')`

For detailed API documentation, please check the [docs](https://elevajs.com) folder.

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

Eleva has a comprehensive test suite with **100% line coverage**:

| Metric | Value |
|--------|-------|
| **Total Tests** | 273 |
| **Line Coverage** | 100% |
| **Test Runner** | Bun |

Run the test suite:

```bash
bun test              # Run all tests
bun test:coverage     # Run with coverage report
bun test:benchmark    # Run performance benchmarks
```

Contributions to tests are very welcome! 🧪

---

## Contributing

I'd love to have you onboard as a contributor! Whether you're adding new features, squashing bugs, or sharing ideas, your input is invaluable. Please check out [CONTRIBUTING](https://github.com/TarekRaafat/eleva/blob/master/CONTRIBUTING.md) for guidelines on getting started.

---

## License

Eleva is open-source and available under the [MIT License](https://github.com/TarekRaafat/eleva/blob/master/LICENSE).

---

## Contact

- **Author:** [Tarek Raafat](https://github.com/TarekRaafat)
- **Email:** [tarek.m.raafat@gmail.com](mailto:tarek.m.raafat@gmail.com)
- **Website:** [tarekraafat.com](https://www.tarekraafat.com)

---

**Note:** This is the first official stable release of Eleva.js! The framework is production-ready with a stable API. Your feedback and contributions will help make Eleva even better. Let's build something great together! 💪✨

---

[![NPM](https://nodei.co/npm/eleva.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/eleva/)

---

[Documentation](https://elevajs.com) |
[Examples](https://elevajs.com/examples) |
[Changelog](https://github.com/TarekRaafat/eleva/blob/master/CHANGELOG.md) |
[GitHub Discussions](https://github.com/TarekRaafat/eleva/discussions)
