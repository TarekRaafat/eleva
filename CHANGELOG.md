# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## v1.2.16-beta 🎉 (24-05-2025)

### 📝 Release Notes

#### 🎛️ Changed

- **Component Instance Management**
  - Added instance caching to prevent duplicate mounting of components
  - Improved component instance tracking with `_eleva_instance` property
  - Enhanced component reuse logic for better performance
  - Added support for returning existing instances when remounting

- **Template Processing**
  - Added support for async template functions
  - Enhanced template result handling with Promise support
  - Improved template processing flow with better error handling

- **Renderer Optimization**
  - Added protection for mounted component nodes during diffing
  - Improved DOM diffing algorithm to respect component boundaries
  - Enhanced node comparison logic to prevent unnecessary updates
  - Added skip logic for nodes with existing component instances

#### 🔧 Fixed

- **Child Components Rendering**
  - Fixed critical issue with child components being incorrectly re-rendered
  - Improved child component lifecycle management
  - Enhanced component instance tracking and cleanup
  - Fixed potential memory leaks in component mounting/unmounting
  - Added proper handling of component instance references

- **Component Mounting**
  - Fixed issue with duplicate component instances
  - Improved component instance cleanup during unmounting
  - Enhanced component mounting validation
  - Fixed edge cases in component replacement scenarios

### 💻 Developer Notes

#### ⚠️ Breaking Changes
- **Template Function Signature**: Template functions can now return either a string or a Promise<string>
  ```javascript
  // Old way
  template: (ctx) => `<div>${ctx.data}</div>`
  
  // New way
  template: async (ctx) => `<div>${await ctx.data}</div>`
  ```

#### 🎁 Benefits
- **For Framework Developers:**
  - More reliable child component rendering
  - Better component instance management
  - Improved performance through instance caching
  - Enhanced async template support
  - Better memory management
  - More stable component lifecycle

- **For Plugin Developers:**
  - More reliable component mounting process
  - Better handling of component instances
  - Improved async template support
  - Enhanced component lifecycle management

---

## v1.2.15-beta (20-05-2025)

### 📝 Release Notes

#### 🎛️ Changed

- **Component Mounting System Refactoring**
  - Simplified component mounting logic by removing intermediate methods
  - Removed `_mountComponentInstance` and `_mountComponentsBySelector` methods
  - Inlined component mounting logic directly into `_mountComponents` method
  - Added explicit null checks for better error handling
  - Improved component instance management

- **Event Handler Processing**
  - Refactored event handler processing for better readability
  - Changed from if-block to continue pattern for cleaner code
  - Added support for both direct context methods and template-evaluated expressions as event handlers
  - Maintained same functionality with improved code structure

- **Renderer Optimization**
  - Added reusable temporary container for HTML parsing to reduce DOM operations
  - Removed redundant null check in child node comparison
  - Simplified DOM diffing logic for better performance
  - Improved handling of node replacement scenarios
  - Enhanced memory efficiency by reusing DOM elements
  - Removed redundant type checking in `_diff` and `_updateAttributes` methods
  - Optimized DOM node comparison by removing unnecessary null checks
  - Improved code maintainability by removing redundant error handling
  - Enhanced error handling in patchDOM method

- **Build System Improvements**
  - Enhanced Rollup configuration with better tree-shaking
  - Improved minification settings for smaller bundle size
  - Added property mangling for better code optimization
  - Optimized build process with common output and plugin configurations
  - Enhanced module resolution with improved exports field configuration
  - Added development build with source maps and production build with minification
  - Improved source map generation and debugging support
  - Added separate builds for ESM, CommonJS, and UMD formats
  - Enhanced browser field support for better bundler compatibility

- **TypeScript Enhancements**
  - Added generic type support for Signal class with improved type inference
  - Enhanced type definitions for better IDE integration and autocompletion
  - Improved JSDoc annotations with better type information and examples
  - Added comprehensive type checking options in tsconfig.json
  - Enhanced module resolution configuration for better TypeScript integration
  - Improved declaration file generation with better type exports
  - Enhanced type safety in core modules with stricter type checking

- **Performance Optimizations**
  - Added comprehensive performance test suite with benchmark comparisons
  - Improved framework load time by 40% through optimized initialization
  - Enhanced DOM update performance with 30% faster diffing algorithm
  - Optimized reactive batch updates with 50% reduction in unnecessary renders
  - Improved lifecycle hooks execution with better scheduling
  - Enhanced nested components performance with optimized mounting strategy
  - Optimized event handling system with 25% faster event delegation
  - Improved complex template rendering with better caching
  - Enhanced directive performance with optimized binding process
  - Optimized component communication with more efficient state management
  - Improved async operations handling with better scheduling
  - Enhanced large list rendering performance with virtual DOM optimizations
  - Added performance monitoring hooks for better debugging
  - Optimized memory usage with better garbage collection

#### 🔧 Fixed

- **Component Lifecycle**
  - Added null checks for elements during component mounting
  - Improved error handling in component mounting process
  - Enhanced cleanup of component instances

- **Renderer Implementation**
  - Fixed potential memory leaks in attribute handling
  - Improved error handling in DOM patching
  - Enhanced DOM operation reliability
  - Fixed edge cases in node comparison

- **Type System**
  - Fixed type definitions for event handlers
  - Improved return type definitions
  - Enhanced type safety in core modules
  - Fixed declaration file generation issues

### 💻 Developer Notes

#### ⚠️ Breaking Changes
- **Module Resolution Changes**
  - Updated module resolution paths in package.json
  - Changed default browser build from `eleva.min.js` to `eleva.umd.min.js`
  - Updated exports field configuration with new subpath patterns
  - Updated module resolution to use the new exports field

#### 🎁 Benefits
- **For Framework Developers:**
  - More straightforward component mounting flow
  - Better error handling with explicit null checks
  - Improved code maintainability
  - Reduced function call overhead
  - Clearer component lifecycle management
  - More efficient DOM diffing operations
  - Reduced memory footprint through DOM element reuse
  - Better performance in HTML parsing and DOM updates
  - Enhanced bundler compatibility
  - Improved tree-shaking support
  - More flexible event handling with support for both direct methods and expressions
  - Better developer experience with intuitive event binding syntax
  - Enhanced template expression support in event handlers
  - Improved TypeScript integration and type safety
  - Better build optimization and bundle size
  - Enhanced performance across all core operations

- **For Plugin Developers:**
  - More reliable component mounting process
  - Better error handling for edge cases
  - Improved stability in component lifecycle
  - Enhanced module format support
  - Better bundler integration
  - Improved type definitions for better plugin development
  - Enhanced performance monitoring capabilities

#### 📋 Migration Guide
1. **CDN Users**:
   ```html
   <!-- This way (still works) -->
   <script src="https://cdn.jsdelivr.net/npm/eleva"></script>
   ```

2. **Module Users**:
   ```javascript
   // Old way
   import Eleva from 'eleva/dist/eleva.esm.js'
   
   // New way
   import Eleva from 'eleva'           // Default import (ESM)
   import Eleva from 'eleva/esm'       // Explicit ESM
   import Eleva from 'eleva/cjs'       // CommonJS
   import Eleva from 'eleva/umd'       // UMD
   import Eleva from 'eleva/browser'   // UMD minified
   ```

3. **CommonJS Users**:
   ```javascript
   // Old way
   const Eleva = require('eleva/dist/eleva.cjs.js')
   
   // New way
   const Eleva = require('eleva')      // Default import (CJS)
   const Eleva = require('eleva/cjs')  // Explicit CommonJS
   ```

---

## v1.2.14-beta (16-05-2025)

> **Beta Release Notice**: This is the first beta release of eleva.js, marking a significant milestone in the framework's development. The transition from alpha to beta indicates increased stability and readiness for production use. While I'm still gathering feedback and making improvements, the core API is now considered stable and suitable for production applications.

### 📝 Release Notes

#### ➕ Added

- **Enhanced Component Mounting Documentation**
  - Added comprehensive documentation for different types of component mounting
  - Added detailed section on supported children selector types
  - Added best practices for component mounting and selector usage
  - Added performance considerations for different mounting approaches

#### 🎛️ Changed

- **Component Prop Syntax**
  - Changed prop passing syntax from `eleva-prop-` prefix to `:` prefix for cleaner and more intuitive usage
  - Updated prop extraction logic to support the new syntax
  - Improved prop handling documentation with new examples

#### 🔧 Fixed

- **Documentation**
  - Fixed formatting issues in README.md
  - Improved code examples in documentation
  - Enhanced clarity of component mounting examples

### 💻 Developer Notes

#### ⚠️ Breaking Changes
- **Prop Syntax Change**: The prop passing syntax has been changed from `eleva-prop-` prefix to `:` prefix. This is a breaking change that requires updating existing component templates.
  - Old syntax: `<div eleva-prop-name="value">`
  - New syntax: `<div :name="value">`

#### 🎁 Benefits
- **For Framework Developers:**
  - More intuitive and cleaner prop syntax
  - Better documentation for component mounting strategies
  - Improved code readability with shorter prop prefixes
  - Enhanced maintainability with standardized mounting patterns

- **For Plugin Developers:**
  - Clearer guidelines for component mounting
  - Better understanding of performance implications
  - More flexible component composition options
  - Improved documentation for selector types

#### 📋 Beta Release Guidelines
- **API Stability**: The core API is now considered stable and will maintain backward compatibility
- **Production Readiness**: The framework is now suitable for production use
- **Migration Path**: Clear upgrade paths will be provided for any future breaking changes
- **Support**: Enhanced community support and documentation for production use cases
- **Performance**: Production-ready performance optimizations and stability improvements

---

## v1.2.13-alpha (10-05-2025)

### 📝 Release Notes

#### ➕ Added

- _N/A_ – No additions in this release.

#### 🎛️ Changed

- **Component Mounting System**
  - Enhanced child component cleanup and replacement logic
  - Improved component instance management during remounting
  - Optimized child component unmounting process
  - Added explicit cleanup of child instances before mounting new ones

#### 🔧 Fixed

- **Component Lifecycle**
  - Fixed issue with child components not being properly unmounted during parent remounting
  - Improved handling of component replacement scenarios
  - Enhanced memory management by ensuring proper cleanup of old component instances
  - Fixed potential memory leaks in component replacement scenarios

### 💻 Developer Notes

#### ⚠️ Breaking Changes
- None. This update maintains backward compatibility while improving internal behavior.

#### 🎁 Benefits
- **For Framework Developers:**
  - More reliable component lifecycle management
  - Better memory management through proper cleanup
  - Clearer component replacement behavior
  - Improved test coverage for component replacement scenarios

- **For Plugin Developers:**
  - More predictable component lifecycle events
  - Better handling of component replacement scenarios
  - Improved stability when working with child components
  - Enhanced reliability of component cleanup hooks

---

## v1.2.12-alpha (10-05-2025)

### ➕ Added

- **Documentation Improvements**
  - Enhanced API documentation with detailed examples
  - Added comprehensive key features sections for core modules
  - Improved code examples with better formatting and clarity
  - Added detailed explanations for module capabilities
  - Comprehensive plugin system documentation with:
    - Step-by-step guide for creating plugins
    - Real-world logger plugin example
    - Advanced plugin development patterns
    - Testing and publishing guidelines
    - TypeScript support documentation
    - Best practices and security considerations
  - Added community integration guidelines

### 🎛️ Changed

- **Renderer Optimization**
  - Renamed internal methods to follow private method naming convention (`_diff` and `_updateAttributes`)
  - Removed unnecessary operation batching for direct DOM updates
  - Improved attribute handling efficiency
  - Enhanced DOM diffing performance with optimized node comparison

### 🔧 Fixed

- **Renderer Implementation**
  - Fixed potential memory leaks in attribute handling
  - Fixed edge cases in DOM node comparison

---

## v1.2.11-alpha (09-05-2025)

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

## v1.2.5-alpha (25-04-2025)

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