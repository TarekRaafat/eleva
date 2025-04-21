# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## v1.2.4-alpha 🎉 (21-04-2025)

### ➕ Added

- _N/A_ – No additions in this release.

### 🎛️ Changed

- Updated the `eleva.js` framework logo

### 🔧 Fixed

- _N/A_ – No bug fixes in this release.

---

## v1.2.3-alpha (05-04-2025)

> **Note:** This is the latest alpha release of Eleva. While the core functionality is stable, I'm seeking community feedback to ensure the best possible developer experience before the final v1.0.0 release.

### Known Limitations
- Some edge cases in complex component hierarchies may need optimization
- Plugin system API might evolve based on community feedback
- Performance benchmarks are being gathered for various use cases

### Breaking Changes
- None in this alpha release. I aim to maintain API stability going forward.

### ➕ Added

- **Improved Event Handling**
  - Added automatic cleanup of event listeners during component unmount

### 🎛️ Changed

- _N/A_ – No changes in this release.

### 🔧 Fixed

- **Event Memory Management**
  - Fixed potential memory leaks by ensuring all event listeners are properly removed
- **DOM Diffing Engine**
  - Fixed issues with DOM diffing in the `Renderer` class to ensure accurate updates for text nodes, attributes, and child elements.
  - Improved handling of keyed elements to avoid unnecessary replacements.
  - Enhanced attribute handling for special properties, ARIA attributes, and data attributes.
  - Optimized DOM operations by implementing batched updates for better performance.
  - Added robust error handling for invalid DOM operations and type checking.
- **Template System**
  - Improved type validation and error handling in expression evaluation
- **Signal System**
  - Fixed potential issues with synchronous updates by batching notifications into microtasks.

### 📝 Documentation
- Added comprehensive JSDoc annotations for all classes and methods
- Enhanced inline documentation with implementation details
- Added practical examples in documentation

### 🔍 Testing
- Added new test suites:
  - Core functionality unit tests
  - Performance benchmarking suite

---

## v1.2.2-alpha (04-03-2025)

### ➕ Added

- _N/A_ – No additions in this release.

### 🎛️ Changed

- _N/A_ – No changes in this release.

### 🔧 Fixed

- **README, DOCS, and Examples:**
  - Fixed the `jsDelivr` CDN URLs.

---

## v1.2.1-alpha (04-03-2025)

### ➕ Added

- _N/A_ – No additions in this release.

### 🎛️ Changed

- _N/A_ – No changes in this release.

### 🔧 Fixed

- **Package.json File:**
  - Fixed the `types` path.

---

## v1.2.0-alpha (01-03-2025)

### ➕ Added

- **Enhanced Inline Documentation and JSDoc Comments**
  - Added detailed JSDoc annotations for private members (e.g., in `Signal` and `Emitter` classes) to clarify internal behavior.
  - Updated the `ComponentDefinition` typedef with more descriptive explanations for each property.
  - Improved inline comments in the `Eleva` core class, providing detailed documentation for properties, parameters, and internal methods.

### 🎛️ Changed

- **Context Object Update in Mounting Process**
  - The component mounting context now includes the entire `emitter` instance instead of exposing separate `emit` and `on` functions. This change simplifies event handling in component setup.
- **Minor Code Refactoring & Documentation Enhancements**
  - Formatting and comment improvements across the codebase for better readability and maintainability.

### 🔧 Fixed

- _N/A_ – No bug fixes in this release.

> **Note:** These changes are internal improvements and documentation enhancements.

---

## v1.1.0-alpha (27-02-2025)

### ➕ Added

- **Local Child Components Registration**
  - Allow child components to be defined locally within a parent's `children` map rather than requiring global registration via `app.component("name", { ... })`.
  - Updated the `_mountChildren` method to directly mount child components using local definitions.
- **Optional Setup Method Support**
  - Enhanced the `mount` method to allow components to be registered without a `setup()` method by defaulting to an empty object if none is provided.
- **Flexible Mounting API**
  - Modified the `mount` method to accept either a global component name (a string) or a direct component definition (an object), thereby improving component registration flexibility.
  - Added robust error handling for invalid component parameters.
- **Enhanced Documentation & Typing**
  - Added comprehensive JSDoc annotations and updated inline documentation for all classes and methods.
  - Introduced a new `@typedef` for `ComponentDefinition` to improve type safety and developer guidance.

### 🎛️ Changed

- **TemplateEngine**
  - Modified the `evaluate` method to use `Object.values(data)` instead of mapping over keys, streamlining the extraction of data values for expression evaluation.
- **Eleva Core**
  - Updated the `mount` method signature:
    - Now expects a DOM element container directly instead of a CSS selector string.
    - Altered the mounting process to always return a Promise (wrapping synchronous setups with `Promise.resolve`), ensuring consistent asynchronous handling.
    - Renamed internal parameters for clarity (e.g., using `styleFn` in the `_injectStyles` method).
- **Component Registration & Mounting Logic**
  - Revised internal logic to determine the component definition based on the type of the provided parameter (string vs. object).
- **Overall Code Quality**
  - Refined code style by consistently using ES6+ syntax.
  - Improved error messages and inline comments to facilitate better understanding and maintainability.

### 🔧 Fixed

- _N/A_ – No bug fixes in this release.

---

## v1.0.0-alpha (26-02-2025)

### ➕ Added

- **Initial Release of Eleva**
  - A minimalist, lightweight, pure vanilla JavaScript frontend runtime framework.
- **TemplateEngine**
  - Secure template parsing with dynamic expression evaluation using `{{ ... }}` syntax.
- **Signal**
  - Fine-grained reactivity for efficient DOM updates.
- **Emitter**
  - Built-in event emitter for inter-component communication.
- **Renderer**
  - Efficient DOM diffing and patching without using a virtual DOM.
- **Core Eleva API**
  - Component registration, mounting, and plugin integration.
  - Lifecycle hooks for managing component initialization, updates, and unmounting.
- **Children Components & Passing Props**
  - Support for nesting components and passing properties from parent to child.
- **Scoped CSS & Style Injection**
  - Component-specific styling that does not leak globally.
- **Plugin System**
  - A flexible plugin architecture that allows easy extension of Eleva's functionality.
- **Built-in TypeScript Declarations**
  - Provides strong typing support for developers using TypeScript.
- **Comprehensive Documentation**
  - Detailed guides covering installation, core concepts, examples, best practices, and more.

### 🎛️ Changed

- **Project Setup**
  - Introduced a modular architecture and configuration that prioritizes developer-centric design and performance.

### 🔧 Fixed

- _N/A_ – This is the initial alpha release.

---

_This is the first official production-ready release of Eleva.js. It introduces a robust, lightweight, and reactive framework for building modern web applications with fine-grained reactivity, scoped styles, and efficient DOM rendering._
