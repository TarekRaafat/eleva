# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## v1.2.11-alpha 🚀 (09-05-2025)

### ➕ Added

- _N/A_ – No additions in this release.

### 🎛️ Changed

- **Renderer Optimization**
  - Simplified attribute handling logic for better performance
  - Enhanced attribute diffing efficiency

### 🔧 Fixed

- **Attribute Handling**
  - Fixed potential memory leak in attribute iteration by using direct attribute iteration
  - Resolved redundant attribute checks that could cause unnecessary DOM operations

---

## v1.2.10-alpha (09-05-2025)

### ➕ Added

- _N/A_ – No additions in this release.

### 🎛️ Changed

- **Async Component Mounting**
  - Enhanced async execution flow in component mounting process
  - Improved handling of async operations during component initialization
  - Ensured proper sequencing of async setup and mounting operations

### 🔧 Fixed

- **Async Setup Handling**
  - Fixed issues with async setup function execution
  - Fixed potential race conditions in component mounting process
  - Improved handling of setup function return values
  - Enhanced error propagation for async setup failures

---

## v1.2.9-alpha (07-05-2025)

### ➕ Added

- **Enhanced Component Mounting System**
  - Added dual mounting system supporting both explicit and template-referenced components
  - Improved component prop extraction and handling
  - Added support for dynamic component mounting and unmounting
  - Enhanced component lifecycle management

- **Documentation Improvements**
  - Added comprehensive examples for component mounting strategies
  - Enhanced documentation for children components and prop passing
  - Added best practices for component composition
  - Improved API documentation with practical examples

### 🎛️ Changed

- **Component Architecture**
  - Refactored component mounting system for better maintainability
  - Improved component instance management
  - Enhanced prop passing mechanism
  - Optimized component cleanup and unmounting

- **Signal System**
  - Optimized signal notification system
  - Improved performance of reactive updates
  - Enhanced memory management for watchers

### 🔧 Fixed

- **Component Mounting**
  - Fixed issues with component cleanup during unmounting
  - Improved handling of nested component updates
  - Fixed prop passing for complex data types
  - Enhanced error handling in component mounting process

---

## v1.2.8-alpha (04-05-2025)

### ➕ Added

- **Enhanced TypeScript Support**
  - Improved type definitions for better IDE integration and type safety
  - Added comprehensive JSDoc annotations with examples
  - Enhanced type inference for Signals and event handlers
  - Added new type definitions for plugins and mount results

- **Performance Improvements**
  - Optimized event handling with better cleanup and memory management
  - Improved DOM diffing performance for complex templates
  - Enhanced signal batching for better update efficiency
  - Reduced memory footprint in component lifecycle management

### 🎛️ Changed

- **TypeScript Configuration**
  - Updated tsconfig.json with improved module resolution
  - Enhanced type checking and declaration file generation
  - Added support for JSON module resolution
  - Improved isolated modules handling

- **Documentation**
  - Enhanced API documentation with practical examples
  - Improved type definitions clarity and organization
  - Added comprehensive examples for core features
  - Updated plugin system documentation

### 🔧 Fixed

- **Event System**
  - Fixed potential memory leaks in event handler cleanup
  - Improved event handler removal logic
  - Enhanced event bubbling and propagation
  - Fixed edge cases in event subscription management

- **Type Definitions**
  - Fixed incorrect type definitions in core modules
  - Improved type safety for component definitions
  - Enhanced error handling in type checking
  - Fixed declaration file generation issues

---

## v1.2.7-alpha (30-04-2025)

### ➕ Added

- **Plugin Signal Access**
  - Added global Signal class access for plugins through `this.signal`
  - Enabled plugins to create and manage their own reactive state
  - Maintained component isolation while providing plugin flexibility

### 🎛️ Changed

- **Signal Architecture**
  - Unified Signal class reference in Eleva instance
  - Improved consistency between global and component contexts
  - Enhanced maintainability with single source of truth for Signal class

### 🔧 Fixed

- _N/A_ – No bug fixes in this release.

---

## v1.2.6-alpha (29-04-2025)

### ➕ Added

- **Enhanced Performance Tests**
  - Added comprehensive tests for boolean attribute handling
  - Added performance benchmarks for mixed attribute updates
  - Improved test coverage for edge cases in attribute processing

### 🎛️ Changed

- **Renderer Optimization**
  - Improved attribute handling with better boolean property detection
  - Enhanced performance of DOM diffing operations
  - Optimized attribute updates with batched operations
  - Improved handling of special properties and ARIA attributes
- **Build Configuration**
  - Enhanced Rollup configuration with better tree-shaking
  - Improved minification settings for smaller bundle size
  - Added property mangling for better code optimization

### 🔧 Fixed

- **Attribute Handling**
  - Fixed boolean attribute handling to properly respect different value formats
  - Improved handling of empty string attributes
  - Fixed property descriptor checking for boolean attributes
- **Dependencies**
  - Updated various dependencies to their latest versions

---

## v1.2.5-alpha 🎉 (25-04-2025)

### ➕ Added

- **Performance Test Suite**
  - Added comprehensive performance test suite covering:
    - Reactive state update batching
    - Lifecycle hooks execution
    - Nested components rendering
    - Event handling
    - Complex template rendering
    - Directive execution
    - Component communication
    - Async operations
    - Large list rendering
  - Added performance metrics tracking and reporting
  - Implemented automated performance regression testing
- **Enhanced Error Handling Tests**
  - Added comprehensive test cases for invalid component definitions
  - Added test coverage for invalid template functions
  - Added validation tests for container elements
  - Added component name validation tests
  - Improved test coverage for edge cases and error scenarios

### 🎛️ Changed

- **Component Mounting Optimization**
  - Improved component mounting process by validating template function before destructuring
  - Enhanced error handling with early validation of required properties
  - Optimized memory usage by failing fast on invalid templates
  - Maintained backward compatibility while improving code organization
- **Lifecycle Hooks Optimization Improvement**
  - Improved performance of lifecycle hooks by caching existence checks
  - Reduced repeated property access during component lifecycle
  - Optimized hook execution path without increasing bundle size
  - Eliminated redundancy in hook management by deriving existence checks directly from `_lifecycleHooks` array
  - Improved maintainability by using a single source of truth for hook definitions
  - Maintained performance benefits while reducing code complexity
  - Enhanced type safety by using exact hook names throughout the codebase
- **Event Processing Optimization**
  - Optimized event listener attachment and cleanup
  - Improved event propagation performance
  - Enhanced event handler execution speed
- **Template Rendering Improvements**
  - Optimized complex template rendering performance
  - Improved template compilation speed
  - Enhanced handling of nested conditionals and loops
- **Component Communication Enhancements**
  - Optimized event emission and handling
  - Improved performance with multiple event listeners
  - Enhanced component communication efficiency

### 🔧 Fixed

- _N/A_ – No bug fixes in this release.

---

## v1.2.4-alpha (21-04-2025)

### ➕ Added

- _N/A_ – No additions in this release.

### 🎛️ Changed

- Updated the `eleva.js` framework logo

### 🔧 Fixed

- _N/A_ – No bug fixes in this release.

---

## v1.2.3-alpha (05-04-2025)

> **Note:** This is the latest alpha release of eleva.js. While the core functionality is stable, I'm seeking community feedback to ensure the best possible developer experience before the final v1.0.0 release.

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

_This is the alpha release of eleva.js. It introduces a robust, lightweight, and reactive framework for building modern web applications with fine-grained reactivity, scoped styles, and efficient DOM rendering._
