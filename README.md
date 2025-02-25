# Eleva

**A minimalist, lightweight, pure vanilla JavaScript frontend runtime framework.**  
_Built with love for native JavaScript—because sometimes, less really is more!_ 😊

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/npm/v/eleva.svg?style=flat)](https://www.npmjs.com/package/eleva)
![100% Javascript](https://img.shields.io/github/languages/top/TarekRaafat/eleva?color=yellow)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-green.svg)
![npm bundle size](https://img.shields.io/bundlephobia/min/eleva)
![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/eleva)
[![](https://data.jsdelivr.com/v1/package/npm/eleva/badge)](https://www.jsdelivr.com/package/npm/eleva)


> **Stability Notice**: This is `v1.0.0-alpha` - APIs may change significantly until stable release.  
> Not recommended for production use yet. Follow the [versioning guide](#versioning) for updates.

**Version:** `1.0.0-alpha`

Welcome to Eleva! This is my humble, experimental playground for a fresh approach to frontend development. Eleva was born out of my genuine passion for pure vanilla JavaScript—no frameworks, no bloat, just the power of native code. I hope you'll have fun exploring, testing, and contributing to make Eleva even better. 🚀

---

## Table of Contents

- [Eleva](#eleva)
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

Eleva is a lightweight, no-nonsense runtime framework for frontend applications. Built with love for **pure vanilla JavaScript**, Eleva lets you create highly modular and scalable applications without the overhead of large frameworks. I built Eleva to prove that you don't need to rely on heavy libraries to build amazing user interfaces—sometimes, the simplest approach is the most powerful.

**My Inspiration:**  
The idea and concept behind Eleva came from my deep appreciation for native JavaScript. I wanted to create a tool that stays true to the language without introducing new syntax or complexity, making it easy for you to integrate into your projects without a steep learning curve.

**Core Principles:**

- **🌱 Minimalism:** Only the essentials, so you can build without the clutter.
- **🔌 Extensibility:** Plug in your own ideas—custom state management, routing, and more.
- **🚀 Performance:** Fast, efficient, and designed with modern browsers in mind.
- **🍦 Pure Vanilla:** No dependencies, no magic—just plain JavaScript.

---

## Design Philosophy

**Eleva is an unopinionated library.**

Unlike many frameworks that enforce a specific project structure or coding paradigm, Eleva provides a minimal core with a flexible plugin system. This means:

- **🔄 Flexibility:** You’re free to architect your application as you see fit, without being forced into a rigid structure.
- **🎯 Native JavaScript:** Eleva is built using pure vanilla JavaScript, so it integrates seamlessly with your existing code without introducing unfamiliar syntax.
- **⚙️ Configurability:** With a simple API and optional plugins, you can extend Eleva's functionality to suit your project's unique requirements.
- **🆓 Freedom:** You decide the best way to implement features, allowing for both simple and complex applications without unnecessary constraints.

This unopinionated approach makes Eleva versatile and ideal for developers who prefer to have full control over their application's design.

---

## Handcrafted & Developer-Centric Design

Eleva is built with a meticulous attention to detail and a deep passion for pure vanilla JavaScript. Every aspect of its design and architecture has been carefully handcrafted with the developer in mind. This approach makes Eleva not only a fresh and innovative choice but also a solid foundation for your projects.

- **🎨 Craftsmanship:**  
  Every line of code in Eleva is written with care, ensuring that the library remains lightweight, efficient, and easy to understand.

- **🛠️ Developer-Centric:**  
  Eleva is designed for you—the developer. Its intuitive API and minimalistic core mean you spend less time wrestling with the framework and more time building your application.

- **🌟 Innovative & Fresh:**  
  By sticking to pure vanilla JavaScript and avoiding unnecessary abstractions, Eleva offers a refreshing alternative to the complex and opinionated frameworks out there.

- **🏗️ Solid & Reliable:**  
  With a focus on performance and modularity, Eleva provides a robust yet flexible platform that scales with your project's needs.

This unique, developer-first approach makes Eleva a standout choice for building high-performance frontend applications without compromising on simplicity or control.

---

## Features

- **🧩 Component-Based Architecture:** Create reusable UI components effortlessly.
- **⚡ Signal-Based Reactivity:** Fine-grained reactivity that updates only what’s needed.
- **🔔 Event Handling:** Built-in event emitter for robust inter-component communication.
- **📝 Template Parsing:** Secure and dynamic interpolation with a custom TemplateEngine.
- **🔄 DOM Diffing & Patching:** High-performance updates without a virtual DOM.
- **📦 UMD & ES Module Builds:** Designed for the browser, with modern build tool support.
- **🤝 Friendly API:** A gentle learning curve for both beginners and seasoned developers.
- **💎 Tiny Footprint & TypeScript Support:** At a fraction of the size of many mainstream frameworks (~4 KB minified) and with built-in TypeScript declarations, Eleva keeps your bundle lean and your codebase strongly typed.

---

## When to Use Eleva

Eleva is designed for developers who want a lightweight, flexible, and high-performance solution for building frontend applications. Here are some scenarios where Eleva shines:

- **🚀 Small to Medium Projects:**  
  If you're building a web app or website that doesn't require the overhead of a full-fledged framework, Eleva’s minimal footprint (~4 KB minified) keeps your project fast and efficient.

- **⚡ Performance-Critical Applications:**  
  For projects where speed and low bundle size are paramount, Eleva's optimized reactivity and DOM diffing ensure your app runs smoothly without unnecessary bloat.

- **🔄 Unopinionated and Flexible Design:**  
  Eleva is unopinionated, meaning it doesn't force you into a rigid structure. You can architect your application your way while enjoying a straightforward API and a flexible plugin system.

- **🎯 Developer-Friendly & Native JavaScript:**  
  If you prefer working with pure vanilla JavaScript without the need to learn new syntax or complex abstractions, Eleva is built with you in mind. Plus, it comes with built-in TypeScript declarations for strong type support.

- **🧪 Rapid Prototyping & Experimentation:**  
  Eleva's simplicity and ease of integration make it a great choice for prototyping ideas quickly. Its modular architecture means you can start small and extend the functionality as your project evolves.

- **🔌 Extensibility through Plugins:**  
  With a robust plugin system, Eleva can be easily extended to include features like routing, state management, or custom behaviors, making it suitable for both simple and complex applications.

In short, if you're looking for a solid, developer-centric framework that provides high performance, simplicity, and the freedom to build your application your way, Eleva is an excellent choice.

---

## Version Strategy

I believe in clear versioning that reflects the maturity of the project:

- **Pre-release Versions (Alpha/Beta):** Early versions like `1.0.0-alpha` signal that the API is still evolving. Expect frequent updates, and please share your feedback!
- **Semantic Versioning:** Once the API stabilizes, I'll follow semantic versioning strictly so that any breaking changes are clearly communicated.
- **Fresh Start:** Since this is a complete overhaul and a fresh start, `1.0.0-alpha` represents my first major step forward.

---

## Version Guide

I follow [Semantic Versioning (SemVer)](https://semver.org/) to manage Eleva's releases. Here's a quick guide to help you understand the version numbers:

- **🔢 Major Version:**  
  A change in the first digit (e.g., from `1.0.0` to `2.0.0`) indicates breaking changes or a major overhaul of the framework.
- **🔢 Minor Version:**  
  A change in the second digit (e.g., from `1.0.0` to `1.1.0`) signifies the addition of new features in a backward-compatible manner.
- **🔢 Patch Version:**  
  A change in the third digit (e.g., from `1.0.0` to `1.0.1`) reflects backward-compatible bug fixes and minor improvements.
- **📌 Pre-release Identifiers:**  
  Suffixes like `-alpha`, `-beta`, or `-rc` indicate that the release is not yet stable. For example, `1.0.0-alpha` means this is an experimental version of the upcoming stable `1.0.0` release.

This guide is intended to help you understand what to expect with each release and how Eleva is evolving over time.

---

## Performance

Eleva is crafted with performance in mind:

- **Lightweight:** Designed to be ~4 KB minified so your app stays nimble.
- **Efficient Reactivity:** Signal-based updates ensure only the necessary parts of the DOM are re-rendered.
- **Optimized Diffing:** The Renderer efficiently patches changes without the overhead of a virtual DOM.
- **No Bloat:** Pure vanilla JavaScript means no unnecessary dependencies slowing you down.

---

## Performance Benchmarks

I've run some preliminary benchmarks to give you a rough idea of how Eleva stacks up against some popular frontend frameworks. These tests focus on bundle size, initial load time, and DOM update performance using a simple counter component scenario.

| Framework | Bundle Size (minified) | Initial Load Time | DOM Update Speed |
| --------- | ---------------------- | ----------------- | ---------------- |
| **Eleva** | ~4 KB                  | ~35 ms            | ~2 ms            |
| React     | ~110 KB                | ~100 ms           | ~4 ms            |
| Vue       | ~80 KB                 | ~80 ms            | ~3 ms            |
| Angular   | ~500 KB                | ~250 ms           | ~6 ms            |

> ⚠️ **Disclaimer:** These benchmarks are based on internal tests with a minimalistic counter component and may vary depending on project specifics and environments. They serve as a general indicator of Eleva’s lightweight and high-performance design.

---

## Eleva vs. Popular Frameworks

While frameworks like React, Vue, and Angular are powerful, Eleva offers a refreshing alternative:

- **Simplicity:** No virtual DOM, no JSX, and no complex state management—just plain JavaScript.
- **Modularity:** Easily extend Eleva with plugins to fit your project's needs.
- **Size:** At a fraction of the size of many mainstream frameworks, Eleva is perfect for projects where performance is key.
- **Learning Curve:** With a familiar syntax and a clear API, Eleva is ideal for developers of all levels.

**Important:** Eleva is not trying to replace these giants but rather offers a lightweight option when you want to keep things simple and fast without introducing new syntax or unnecessary complexity. 🌟

---

## Installation

Eleva is available on npm. Since it's in alpha, I'm excited to have you try it out and share your thoughts!

```bash
npm install eleva
```

Or include it directly in your HTML via CDN:

```html
<script src="https://unpkg.com/eleva/dist/eleva.min.js"></script>
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
  setup({ signal }) {
    const count = signal(0);
    return { count };
  },
  template: ({ count }) => `
    <div>
      <h1>Hello, Eleva! 👋</h1>
      <p>Count: ${count}</p>
      <button @click="() => count++">Increment</button>
    </div>
  `,
});

// Mount the component to a DOM element with the id 'app'
app.mount("#app", "HelloWorld");
```

### UMD Example

Include Eleva via a script tag, and it will be available as a global variable:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Eleva Example</title>
  </head>
  <body>
    <div id="app"></div>
    <script src="https://unpkg.com/eleva/dist/eleva.min.js"></script>
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
          <p>Count: ${count}</p>
          <button @click="() => count++">Increment</button>
        </div>
      `,
      });
      app.mount("#app", "HelloWorld");
    </script>
  </body>
</html>
```

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
  Efficiently update the DOM.
- **`diff(oldParent, newParent)`**  
  Compare and update DOM trees.
- **`updateAttributes(oldEl, newEl)`**  
  Sync element attributes.

### Eleva (Core)

- **`new Eleva(name, config)`**  
  Create an Eleva instance.
- **`.use(plugin, options)`**  
  Install plugins.
- **`.component(name, definition)`**  
  Register a component.
- **`.mount(selectorOrElement, compName, props)`**  
  Mount a component to the DOM.

For detailed API documentation, please check the [docs](docs/index.md) folder.

---

## Development

I welcome developers to dive in and play around with Eleva! Here's how you can get started locally:

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

4. **Build for Production:**

   ```bash
   npm run build
   ```

5. **Generate and Bundle TypeScript Declarations:**

   ```bash
   npm run build:types
   npm run build:types:bundle
   ```

---

## Testing

I use Jest for tests. Run the test suite with:

```bash
npm test
```

Your contributions to tests are very welcome! 🧪

---

## Contributing

I’d love to have you onboard as a contributor! Whether you’re adding new features, squashing bugs, or sharing ideas, your input is invaluable. Please check out [CONTRIBUTING](CONTRIBUTING.md) for details on how to get started.

---

## License

Eleva is open-source and available under the [MIT License](LICENSE).

---

## Contact

- **Author:** [Tarek Raafat](https://github.com/TarekRaafat)
- **Email:** [tarek.m.raafat@gmail.com](mailto:tarek.m.raafat@gmail.com)
- **Website:** [tarekraafat.com](https://www.tarekraafat.com)

---

**Note:** This is an alpha release. I'm still polishing things up, so expect some bumps along the way. Your feedback and contributions will help shape Eleva into something truly amazing. Let’s build something great together! 💪✨

---

[Documentation](/docs/index.md) |
[Examples](/examples) |
[Changelog](/changelog.md) |
[GitHub Discussions](https://github.com/TarekRaafat/eleva/discussions)
