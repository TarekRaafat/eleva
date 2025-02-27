# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v1.1.0-alpha] ✨ - 27-02-2025

### ➕ Added

- **Local Child Components Registration**
  - Allow child components to be defined locally within a parent’s `children` map rather than requiring global registration via `app.component("name", { ... })`.
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

## [v1.0.0-alpha] - 26-02-2025

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

_This is a pre-release version of Eleva. Future releases will document further improvements, bug fixes, and new features as the framework evolves._
