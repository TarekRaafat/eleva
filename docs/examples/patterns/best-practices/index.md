---
title: Best Practices Overview
description: Eleva.js best practices guide. Write efficient, maintainable components. Selector performance, setup organization, signal patterns, and code structure.
---

<link rel="canonical" href="https://elevajs.com/examples/patterns/best-practices/">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://elevajs.com/examples/patterns/best-practices/">
<meta property="og:title" content="Best Practices Overview - Eleva.js">
<meta property="og:description" content="Eleva.js best practices guide. Write efficient, maintainable components. Selector performance, setup organization, signal patterns, and code structure.">
<meta property="og:image" content="https://elevajs.com/imgs/eleva.js%20Full%20Logo.png">
<meta property="og:site_name" content="Eleva.js">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://elevajs.com/examples/patterns/best-practices/">
<meta name="twitter:title" content="Best Practices Overview - Eleva.js">
<meta name="twitter:description" content="Eleva.js best practices guide. Write efficient, maintainable components. Selector performance, setup organization, signal patterns, and code structure.">
<meta name="twitter:image" content="https://elevajs.com/imgs/eleva.js%20Full%20Logo.png">

<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-S4L689921Q"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", "G-S4L689921Q");
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://elevajs.com/" },
    { "@type": "ListItem", "position": 2, "name": "Examples", "item": "https://elevajs.com/examples/" },
    { "@type": "ListItem", "position": 3, "name": "Patterns", "item": "https://elevajs.com/examples/patterns/" },
    { "@type": "ListItem", "position": 4, "name": "Best Practices", "item": "https://elevajs.com/examples/patterns/best-practices/" }
  ]
}
</script>

# Best Practices

> **Version:** 1.1.1 | Comprehensive guide to writing efficient, maintainable Eleva components.

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

## Related Patterns

Apply these best practices in context:

| Pattern | Best Practices Applied |
|---------|------------------------|
| [State Management](../state/index.md) | Signal patterns, batching, immutable updates |
| [Lists](../lists/index.md) | Keyed reconciliation, selector performance |
| [Async Data](../async-data/index.md) | Lifecycle cleanup, loading state management |
| [Forms](../forms.md) | Event handlers, validation state |

---

[← Back to Patterns](../index.md) | [Selectors & Structure →](./selectors-structure.md)
