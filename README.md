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
[![](https://data.jsdelivr.com/v1/package/npm/eleva/badge)](https://www.jsdelivr.com/package/npm/eleva)

<br>

<p align="center">
  <a href="https://tarekraafat.github.io/eleva/"><img src="./docs/imgs/eleva.js Full Logo.png" alt="eleva.js Full Logo" width="50%"></a>
</p>

<p align="center">
  <a href="https://www.producthunt.com/posts/eleva?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-eleva" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=938663&theme=light&t=1741247713068" alt="eleva.js - A&#0032;minimalist&#0044;&#0032;pure&#0032;vanilla&#0032;javascript&#0032;frontend&#0032;framework&#0046; | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
</p>

<br>
<br>
<br>

**A minimalist, lightweight, pure vanilla JavaScript frontend runtime framework.**  
_Built with love for native JavaScript—because sometimes, less really is more!_ 😊

> **Stability Notice**: This is `v1.2.10-alpha` - The core functionality is stable, but I'm seeking community feedback before the final v1.0.0 release.  
> While suitable for production use, please be aware of the [known limitations](docs/known-limitations.md).

**Version:** `1.2.10-alpha`



Welcome to Eleva! This is my humble, experimental playground for a fresh approach to frontend development. Eleva was born out of my genuine passion for pure vanilla JavaScript—no frameworks, no bloat, just the power of native code. I hope you'll have fun exploring, testing, and contributing to make Eleva even better. 🚀

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
  - [Development](#development)
  - [Testing](#testing)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)

---

## Introduction

Eleva is a lightweight, no-nonsense runtime framework for frontend applications. Built with love for **pure vanilla JavaScript**, Eleva lets you create highly modular and scalable applications without the overhead of large frameworks. I built Eleva to prove that you don't need heavy frameworks or libraries to build amazing user interfaces—sometimes, the simplest approach is the most powerful.

**My Inspiration:**  
The idea behind Eleva comes from a deep appreciation for native JavaScript. I wanted to create a tool that stays true to the language without introducing new syntax or complexity, making it easy to integrate into your projects.

**Core Principles:**

- **🌱 Minimalism:** Only the essentials, so you can build without clutter.
- **🔌 Extensibility:** Plug in your own ideas—custom state management, routing, and more.
- **🚀 Performance:** Fast, efficient, and designed with modern browsers in mind.
- **🍦 Pure Vanilla:** No dependencies, no magic—just plain JavaScript.

---

## Design Philosophy

**Eleva is an unopinionated framework.**

Unlike many frameworks that enforce a specific project structure or coding paradigm, Eleva provides a minimal core with a flexible plugin system. This means:

- **🔄 Flexibility:** Architect your application your way—no rigid structure required.
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

- **🧩 Component-Based Architecture:** Create reusable UI components effortlessly.
- **⚡ Signal-Based Reactivity:** Fine-grained reactivity that updates only what's needed.
- **🔔 Event Handling:** Built-in event emitter for robust inter-component communication.
- **📝 Template Parsing:** Secure and dynamic interpolation with a custom TemplateEngine.
- **🔄 DOM Diffing & Patching:** High-performance updates without a virtual DOM.
- **📦 UMD & ES Module Builds:** Supports modern build tools and browser environments.
- **🤝 Friendly API:** A gentle learning curve for both beginners and seasoned developers.
- **💎 Tiny Footprint & TypeScript Support:** Approximately ~6 KB minified with built-in TypeScript declarations, to keep your bundle lean and your codebase strongly typed.

---

## When to Use Eleva

Eleva is ideal for developers seeking a lightweight, flexible, and high-performance solution for building frontend applications. Here are some scenarios where Eleva shines:

- **🚀 Small to Medium Projects:** Perfect for web apps or websites that don't require the overhead of a full-fledged framework.
- **⚡ Performance-Critical Applications:** Optimized reactivity and DOM diffing ensure smooth performance without bloat.
- **🔄 Unopinionated & Flexible:** Architect your application your way with a straightforward API and plugin system.
- **🎯 Developer-Friendly:** Stick to pure vanilla JavaScript with familiar syntax and built-in TypeScript support.
- **🧪 Rapid Prototyping:** Quickly prototype ideas with a minimal and extendable framework.
- **🔌 Extensible:** Easily add features like routing or state management through plugins.

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

---

## Performance Benchmarks

Preliminary benchmarks illustrate Eleva's efficiency compared to popular frameworks:

| **Framework**                 | **Bundle Size** (KB) | **Initial Load Time** (ms) | **DOM Update Speed** (s) | **Peak Memory Usage** (KB) | **Overall Performance Score** (lower is better) |
| ----------------------------- | -------------------- | -------------------------- | ------------------------ | -------------------------- | ----------------------------------------------- |
| **Eleva** (Direct DOM)        | **2**              | **0.05**                     | **0.002**                | **0.25**                   | **0.58 (Best)**                                 |
| **React** (Virtual DOM)       | 4.1                   | 5.34                         | 0.020                    | 0.25                       | 9.71                                           |
| **Vue** (Reactive State)      | 45                   | 4.72                         | 0.021                    | 3.10                       | 13.21                                           |
| **Angular** (Two-way Binding) | 62                   | 5.26                        | 0.021                    | 0.25                       | 16.88 (Slowest)                                 |

Detailed [Benchmark Metrics Report](BENCHMARK.md)

> ⚠️ **Disclaimer:** Benchmarks are based on internal tests and may vary by project and environment.

---

## Eleva vs. Popular Frameworks

Eleva offers a refreshing alternative to frameworks like React, Vue, and Angular:

- **Simplicity:** No virtual DOM, JSX, or complex state management—just plain JavaScript.
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

// Mount the component to a DOM element (not a selector).
app.mount(document.getElementById("app"), "HelloWorld");
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

- **`new Signal(value)`**  
  Creates a reactive data holder.
- **`.value` (getter/setter)**  
  Get or update the current value and trigger watchers.
- **`.watch(fn)`**  
  Registers a function to run when the value updates.

### Emitter

- **`.on(event, handler)`**  
  Listen to events.
- **`.off(event, handler)`**  
  Remove event listeners.
- **`.emit(event, ...args)`**  
  Trigger events with additional arguments.

### Renderer

- **`patchDOM(container, newHtml)`**  
  Efficiently updates the DOM.
- **`diff(oldParent, newParent)`**  
  Compares and updates DOM trees.
- **`updateAttributes(oldEl, newEl)`**  
  Synchronizes element attributes.

### Eleva (Core)

- **`new Eleva(name, config)`**  
  Create an Eleva instance.
- **`.use(plugin, options)`**  
  Install plugins.
- **`.component(name, definition)`**  
  Register a component.
- **`.mount(container, compName, props)`**  
  Mount a component to the DOM.

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

**Note:** This is an alpha release. I'm still polishing things up, so expect some bumps along the way. Your feedback and contributions will help shape Eleva into something truly amazing. Let's build something great together! 💪✨

---

[![NPM](https://nodei.co/npm/eleva.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/eleva/)

---

[Documentation](/docs/index.md) |
[Examples](/examples) |
[Changelog](/CHANGELOG.md) |
[GitHub Discussions](https://github.com/TarekRaafat/eleva/discussions)
