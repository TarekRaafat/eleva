# Eleva.js 🚀

> **Version:** `1.0.0-rc.13` | **Size:** ~6KB min (~2.4KB gzip) | **Dependencies:** Zero | **TypeScript:** Yes

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
[![Supported by Canonical](https://img.shields.io/badge/Supported%20by-Canonical-E95420?logo=ubuntu&logoColor=white)](https://canonical.com)

<br>

<p align="center">
  <a href="https://tarekraafat.github.io/eleva/"><img src="./docs/imgs/eleva.js Full Logo.png" alt="Eleva.js - Lightweight JavaScript Framework Logo" width="50%"></a>
</p>

<p align="center">
  <a href="https://canonical.com" target="_blank" rel="noopener">
    <img src="https://raw.githubusercontent.com/SebastJava/Ubuntu-logo/649d55eca403302fb06281d9dd94798bb0568e8d/logo-v2025-plain-450x708.svg" alt="Canonical Logo" width="80"/>
  </a>
</p>

<p align="center">
  <em>Eleva is proudly supported by Canonical - the company behind Ubuntu.</em>
</p>

<p align="center">
  <a href="https://www.producthunt.com/posts/eleva?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-eleva" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=938663&theme=light&t=1741247713068" alt="eleva.js - A&#0032;minimalist&#0044;&#0032;pure&#0032;vanilla&#0032;javascript&#0032;frontend&#0032;framework&#0046; | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
</p>

<br>
<br>
<br>

**A minimalist, lightweight, pure vanilla JavaScript frontend runtime framework.**
_Designed for the best Developer Experience (DX) to help you build exceptional User Experiences (UX). Built with love for native JavaScript and a minimal core that can be extended through a powerful plugin system — because sometimes, less really is more!_ 😊

> **Stability Notice**: This is `v1.0.0-rc.13` - The core functionality is stable. Seeking community feedback before the final v1.0.0 release.

**Version:** `1.0.0-rc.13`



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

Eleva is ideal for developers building lightweight web applications, prototypes, micro-frontends, or anyone seeking a simpler alternative to React, Vue, or Angular.

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
      - [Props Plugin](#props-plugin)
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

> **Quick Rule:** `${}` needs `ctx.` — `{{ }}` and `@events` don't.

| Syntax | Use | `ctx.`? |
|--------|-----|:-------:|
| `${expr}` | Static value | ✓ |
| `{{ expr }}` | Reactive value | ✗ |
| `@click` | Event handler | ✗ |
| `:prop` | Pass to child | ✓ |

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
| **Tiny Bundle** | ~2.4KB gzipped means instant page loads for your users |

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
- **📝 Template Parsing:** Secure and dynamic interpolation with a custom TemplateEngine
- **🔄 DOM Diffing & Patching:** High-performance updates without a virtual DOM
- **🔄 Lifecycle Hooks:** Complete lifecycle management with before/after mount and update hooks
- **🧹 Automatic Cleanup:** Proper cleanup of resources, watchers, and child components on unmount
- **🔌 Plugin System:** Extensible architecture with a simple plugin API
- **🎯 Built-in Plugins:** Attr for advanced attributes, Props for complex data handling, Router for client-side routing, and Store for reactive state management
- **📦 UMD & ES Module Builds:** Supports modern build tools and browser environments
- **🤝 Friendly API:** A gentle learning curve for both beginners and seasoned developers
- **💎 Tiny Footprint & TypeScript Support:** Approximately ~6KB minified with built-in TypeScript declarations

---

## When to Use Eleva

Eleva is ideal for developers seeking a lightweight, flexible, and high-performance solution for building frontend applications. Here are some scenarios where Eleva shines:

- **🚀 Small to Medium Projects:** Perfect for web apps or websites that don't require the overhead of a full-fledged framework.
- **⚡ Performance-Critical Applications:** Optimized reactivity and DOM diffing ensure smooth performance without bloat.
- **🔄 Unopinionated & Flexible:** Architect your application your way with a straightforward API and plugin system.
- **🎯 Developer-Friendly:** Stick to pure vanilla JavaScript with familiar syntax and built-in TypeScript support.
- **🧪 Rapid Prototyping:** Quickly prototype ideas with a minimal and extendable framework.
- **🔌 Extensible:** Easily add features like routing or state management through plugins.
- **🚀 Built-in Routing:** Advanced client-side routing with navigation guards and reactive state via Router plugin.
- **🎯 Advanced Attributes:** Sophisticated attribute handling with ARIA support via Attr plugin.
- **🏪 Reactive State Management:** Centralized, reactive data store with persistence and namespacing via Store plugin.
- **📦 Module Format Flexibility:** Choose from ESM, CommonJS, or UMD formats based on your project's needs.

---

## Version Strategy

I believe in clear versioning that reflects the maturity of the project:

- **Pre-release Versions (RC):** Release candidate versions like `1.0.0-rc.13` indicate the API is stable but still gathering community feedback before the final release.
- **Semantic Versioning:** Once stable, I'll follow semantic versioning strictly to clearly communicate any breaking changes.

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

- **Lightweight:** Approximately ~6KB minified and ~2.4KB gzipped.
- **Efficient Reactivity:** Signal-based updates ensure only necessary DOM parts are updated.
- **Optimized Diffing:** Renderer efficiently patches changes without the overhead of a virtual DOM.
- **No Bloat:** Pure vanilla JavaScript with zero dependencies keeps your project nimble.
- **Tree-Shakable:** ESM format allows bundlers to eliminate unused code.
- **Format-Specific Optimizations:** Each module format is optimized for its target environment.

---

## Performance Benchmarks

Benchmarks using [js-framework-benchmark](https://krausest.github.io/js-framework-benchmark/) methodology (1,000 rows):

| **Framework**                 | **Bundle Size (min+gzip)** | **Create 1K Rows** (ms) | **Partial Update** (ms) | **Memory** (MB) |
| ----------------------------- | -------------------------- | ----------------------- | ----------------------- | --------------- |
| **Eleva 1.0** (Direct DOM)    | **~2.4KB**                 | **~30**                 | ~105*                   | ~15             |
| **React 19** (Virtual DOM)    | ~44KB                      | 40-70                   | 10-20                   | 2-5             |
| **Vue 3.5** (Reactive)        | ~45KB                      | 25-45                   | 5-15                    | 2-4             |
| **Angular 19** (Signals)      | ~90KB                      | 50-80                   | 15-25                   | 3-6             |

_*Eleva uses DOM diffing & patching, but templates generate HTML strings that require parsing. For large frequently-updating lists, use granular components or the `key` attribute for optimal diffing._

**Eleva's Strengths:**
- **Smallest bundle size** (~2.4KB vs 44-90 KB)
- **Competitive initial render** (~30ms for 1K rows)
- **Zero dependencies** and minimal runtime overhead
- **Direct DOM diffing** without virtual DOM overhead

**Performance Tips:**
- Use `key` attribute on list items for optimal diffing
- Split large lists into smaller components
- Eleva excels at initial renders and small-to-medium updates

> 💡 **Run benchmarks yourself:** `bun run test:benchmark`

> ⚠️ **Disclaimer:** Benchmarks vary by application complexity, browser, and hardware. Eleva results from internal test suite using Bun runtime. Other framework data from [js-framework-benchmark](https://krausest.github.io/js-framework-benchmark/).

---

## Eleva vs. Popular Frameworks

How does Eleva compare to popular JavaScript frameworks like React, Vue, Svelte, and Angular?

| Feature | Eleva 1.0 | React 19 | Vue 3.5 | Svelte 5 | Angular 19 |
|---------|-----------|----------|---------|----------|------------|
| **Bundle Size** | ~6KB | ~44KB | ~45KB | ~3KB* | ~90KB |
| **Dependencies** | 0 | 3+ | 0 | 0 | 10+ |
| **Virtual DOM** | No | Yes | Yes | No | No |
| **Reactivity** | Signals | useState/Hooks | Refs/Reactive | Compiler | Zone.js |
| **TypeScript** | Built-in | Optional | Optional | Built-in | Built-in |
| **Build Required** | No | Yes | Optional | Yes | Yes |
| **Learning Curve** | Low | Medium | Medium | Low | High |

_*Svelte 5 compiles away with a ~3KB signals runtime, so bundle is minimal but build step is required._

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

**Plugin Types:**

| Type | Source | Installation |
|------|--------|--------------|
| **Core Plugins** | Bundled with Eleva | `import { X } from "eleva/plugins"` |
| **External Plugins** | Community/Ecosystem | `npm install eleva-plugin-x` |

> **Core plugins** (Attr, Props, Router, Store) are official, tested, and documented. **External plugins** are community-created and installed separately. See [Plugin Documentation](docs/plugins/index.md) for details.

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

📚 **[Full Attr Documentation →](docs/plugins/attr.md)** - Comprehensive guide with ARIA attributes, data attributes, boolean handling, and dynamic properties.

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
router.currentRoute.subscribe(route => {
    console.log('Route changed:', route);
});

// Programmatic navigation
router.navigate('/users/123', { replace: true });
```

📚 **[Full Router Documentation →](docs/plugins/router.md)** - Comprehensive guide with 13 events, 7 reactive signals, navigation guards, scroll management, and more.

#### Props Plugin

🎯 **Advanced props handling** with automatic type detection, parsing, and reactivity for complex data structures:

```javascript
import Eleva from 'eleva';
import { Props } from 'eleva/plugins';

const app = new Eleva("myApp");
app.use(Props, {
    enableAutoParsing: true,    // Enable automatic type detection
    enableReactivity: true,     // Enable reactive prop updates
    onError: (error, value) => {
        console.error('Props parsing error:', error, value);
    }
});

// Use complex props in components
app.component("UserCard", {
    template: (ctx) => `
        <div class="user-container"
             :user='${JSON.stringify(ctx.user.value)}'
             :permissions='${JSON.stringify(ctx.permissions.value)}'>
        </div>
    `,
    children: {
        '.user-container': 'UserInfo'
    }
});

app.component("UserInfo", {
    setup({ props }) {
        return {
            user: props.user,              // Automatically parsed object
            permissions: props.permissions  // Automatically parsed array
        };
    },
    template: (ctx) => `
        <div class="user-info">
            <h3>${ctx.user.value.name}</h3>
            <p>Role: ${ctx.user.value.role}</p>
        </div>
    `
});
```

📚 **[Full Props Documentation →](docs/plugins/props.md)** - Comprehensive guide with type parsing, reactive props, signal linking, complex data structures, and error handling.

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

📚 **[Full Store Documentation →](docs/plugins/store.md)** - Comprehensive guide with 10 API methods, persistence options, namespaces, subscriptions, and migration guides.

**Bundle Sizes:**
- Core framework only: ~6KB (minified)
- Core + Attr: ~8KB (minified)
- Core + Props: ~10KB (minified)
- Core + Router: ~21KB (minified)
- Core + Store: ~12KB (minified)
- Core + All plugins: ~25KB (minified)

**Individual Plugin Sizes:**
- Attr: ~2.2KB (minified)
- Props: ~4.2KB (minified)
- Router: ~15KB (minified)
- Store: ~6KB (minified)

**Available Plugin Formats:**

**For Bundlers (Tree-Shaking Supported):**
- ESM: `import { Attr, Props, Router, Store } from 'eleva/plugins'`
- CJS: `const { Attr, Props, Router, Store } = require('eleva/plugins')`

**For CDN (Individual Plugins - Smaller Bundle Size):**
- UMD: `<script src="https://cdn.jsdelivr.net/npm/eleva@latest/dist/eleva.umd.min.js"></script>`
- UMD: `<script src="https://cdn.jsdelivr.net/npm/eleva@latest/dist/plugins/attr.umd.min.js"></script>`
- UMD: `<script src="https://cdn.jsdelivr.net/npm/eleva@latest/dist/plugins/props.umd.min.js"></script>`
- UMD: `<script src="https://cdn.jsdelivr.net/npm/eleva@latest/dist/plugins/router.umd.min.js"></script>`
- UMD: `<script src="https://cdn.jsdelivr.net/npm/eleva@latest/dist/plugins/store.umd.min.js"></script>`

**Individual Plugin Imports (Best for Tree-Shaking):**
- ESM: `import { Attr } from 'eleva/plugins/attr'`
- ESM: `import { Props } from 'eleva/plugins/props'`
- ESM: `import { Router } from 'eleva/plugins/router'`
- ESM: `import { Store } from 'eleva/plugins/store'`
- CJS: `const { Attr } = require('eleva/plugins/attr')`
- CJS: `const { Props } = require('eleva/plugins/props')`
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

**Note:** This is a release candidate (RC). The core functionality is stable and suitable for production use. Your feedback and contributions will help shape Eleva into something truly amazing. Let's build something great together! 💪✨

---

[![NPM](https://nodei.co/npm/eleva.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/eleva/)

---

[Documentation](/docs/index.md) |
[Examples](/examples) |
[Changelog](/CHANGELOG.md) |
[GitHub Discussions](https://github.com/TarekRaafat/eleva/discussions)
