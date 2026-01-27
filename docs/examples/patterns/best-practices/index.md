---
title: Best Practices Overview
description: Eleva.js best practices for writing efficient, maintainable components with proper selectors, structure, and guidelines.
---

<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-S4L689921Q"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", "G-S4L689921Q");
</script>

# Best Practices

> **Version:** 1.1.0 | Comprehensive guide to writing efficient, maintainable Eleva components.

---

## Overview

This guide covers best practices organized by topic:

| Guide | Topics Covered |
|-------|----------------|
| **[Selectors & Structure](./selectors-structure.md)** | Selector performance, component property order |
| **[Setup & Lifecycle](./setup-lifecycle.md)** | Setup patterns, lifecycle hooks, cleanup |
| **[Signals & Templates](./signals-templates.md)** | Signal usage, template syntax, children, communication |
| **[Performance](./performance.md)** | Render optimization, large lists, virtual scrolling |

---

## Quick Reference: Do's and Don'ts

### Do's

- **Keep components focused** - One responsibility per component
- **Use meaningful names** - `UserProfileCard` not `Card1`
- **Clean up in onUnmount** - Prevent memory leaks
- **Use signals for UI state** - Enables reactivity
- **Keep selectors simple** - Prefer IDs and classes
- **Use keys in lists** - Enable efficient DOM diffing

### Don'ts

- **Don't mutate arrays/objects in place** - Replace for reactivity
- **Don't forget `.value`** - Always access signal values correctly
- **Don't over-nest components** - Keep hierarchy shallow
- **Don't use generic selectors** - Be specific, avoid bare `div`, `span`
- **Don't skip cleanup** - Always unsubscribe and clear timers
- **Don't call handlers directly in templates** - Use arrow functions for params

---

## Performance Tips Summary

1. **Batch signal updates** - Multiple updates in one function
2. **Use memoization** - Cache expensive computations
3. **Lazy load components** - Load on demand when possible
4. **Keep templates simple** - Complex logic in setup, not template
5. **Minimize DOM queries** - Use efficient selectors
6. **Use keyed reconciliation for lists** - Add `key` attribute

---

## Quick Syntax Reference

### Template Context Rules

> **Quick Rule:** `${}` needs `ctx.` — `@events` and `:props` don't.

```javascript
template: (ctx) => `
  <!-- ${} interpolation needs ctx. -->
  <p>${ctx.count.value}</p>

  <!-- @events don't need ctx. -->
  <button @click="handleClick">Click</button>

  <!-- :props don't need ctx. -->
  <child :data="items.value"></child>
`
```

### Signal Updates

```javascript
// Primitives - direct assignment
count.value++;

// Objects - replace entire object
user.value = { ...user.value, name: "Jane" };

// Arrays - replace with new array
items.value = [...items.value, newItem];  // Add
items.value = items.value.filter(i => i.id !== id);  // Remove
```

### Event Handlers with Parameters

```javascript
// Without params - reference directly
<button @click="handleClick">Click</button>

// With params - use arrow function
<button @click="() => removeItem(${item.id})">Remove</button>
```

---

## Next Steps

- **[Selectors & Structure](./selectors-structure.md)** - Selector performance and component order
- **[Setup & Lifecycle](./setup-lifecycle.md)** - Setup patterns and lifecycle hooks
- **[Signals & Templates](./signals-templates.md)** - Reactivity and template syntax
- **[Performance](./performance.md)** - Optimization techniques

---

[← Back to Patterns](../index.md) | [Selectors & Structure →](./selectors-structure.md)
