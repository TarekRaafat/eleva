# Known Limitations

This document outlines the current limitations and potential issues in eleva.js v1.2.5-alpha. I'm actively working on addressing these limitations and welcome community feedback to help prioritize improvements.

---

## Core Framework Limitations

These limitations are considered core framework concerns that I plan to address directly in the framework:

### 1. Component System

#### Complex Component Hierarchies
- Circular component dependencies are not properly handled
- Component inheritance patterns are not supported

> **Rationale:** These are fundamental architectural concerns that affect the core component system's reliability.

### 2. Performance

#### DOM Operations
- Complex CSS selectors in scoped styles may affect rendering performance

> **Rationale:** This is a core performance issue that directly impacts the framework's rendering engine.

#### Memory Management
- Memory usage may grow with long-running applications
- No automatic garbage collection for unused components

> **Rationale:** These are fundamental resource management issues that affect the framework's stability.

### Browser Support
- Mobile browser optimizations needed
- Touch event handling needs improvement

> **Rationale:** These are core browser support issues that affect the framework's usability.

---

## Future Improvements

I'm actively working on addressing these limitations. Here's my prioritized roadmap:

### Core Framework Improvements
1. **Performance Optimizations**
   - Optimize CSS selector performance
   - Improve memory management
   - Enhance component lifecycle handling

2. **Developer Experience**
   - Improve error messages
   - Enhance core debugging capabilities
   - Streamline component registration

---

## Contributing

I welcome contributions to help address these limitations. Please check the [Contributing Guidelines](../CONTRIBUTING.md) for more information on how to get involved.

---

## Reporting Issues

If you encounter any of these limitations or discover new ones, please:
1. Check if it's already reported in [GitHub Issues](https://github.com/TarekRaafat/eleva/issues)
2. If not, create a new issue with:
   - Clear description of the limitation
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/device information
   - Code example if applicable
   - Indication of whether it's a core or plugin concern

---

## Version History

For a detailed history of all versions, changes, and improvements, please refer to the [CHANGELOG](../CHANGELOG.md) file. This document focuses on current limitations and planned improvements rather than version-specific changes.

---

> **Note:** This document is actively maintained and will be updated as limitations are addressed or new ones are discovered. Last updated: April 25, 2025 