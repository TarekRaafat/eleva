---
title: Selectors & Component Structure
description: Eleva.js best practices for selector performance and component property ordering.
---

<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-S4L689921Q"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", "G-S4L689921Q");
</script>

# Selectors & Component Structure

> **Best Practices** | Selector performance and component organization.

---

## Selector Performance

Choosing the right selector impacts performance, especially when mounting many components dynamically.

### Performance Ranking

| Selector Type | Performance | DOM Method Used | Best For |
|---------------|-------------|-----------------|----------|
| **ID** `#app` | Fastest | `getElementById()` | Root components, unique elements |
| **Custom Element Tag** `user-card` | Very Fast | Direct element matching | Child component mounting |
| **Class** `.container` | Fast | `getElementsByClassName()` | Lists, multiple instances |
| **Tag** `div` | Fast | `getElementsByTagName()` | Rare, not recommended |
| **Attribute** `[data-component]` | Moderate | `querySelectorAll()` | Dynamic/generated elements |
| **Complex** `div.app > .content` | Slowest | `querySelectorAll()` | Avoid if possible |

### Examples

```javascript
// Best - ID selector for root mounting (uses getElementById)
app.mount(document.getElementById("app"), "App");

// Good - Custom element tag for children (direct matching)
children: {
  "user-card": "UserCard"
}

// Good - Simple class for lists
children: {
  ".todo-item": "TodoItem"
}

// Acceptable - Data attribute (useful for explicit markers)
children: {
  "[data-widget='sidebar']": "Sidebar"
}

// Avoid - Complex nested selectors
children: {
  "div.wrapper > main.content .item": "Item"  // Slow, fragile
}

// Avoid - Tag-only selectors
children: {
  "div": "SomeComponent"  // Too generic, may match unintended elements
}
```

### Selector Guidelines

1. **Use IDs for root component mounting** - They're unique and fastest to query
2. **Use component names for direct child mounting** - Clearest intent, good performance
3. **Use classes for lists** - Efficient for multiple instances of the same component
4. **Keep selectors simple** - One ID, one class, or one component name; avoid nesting
5. **Avoid tag-only selectors** - Too generic, can cause unintended matches

The performance difference is negligible for a single mount, but becomes noticeable when dynamically creating many components. ID selectors are approximately 2-3x faster than complex CSS selectors.

---

## Component Structure

### Property Order

For consistency and readability, define component properties in this order:

```javascript
app.component("MyComponent", {
  // 1. Setup - Initialize state and functions
  setup({ signal, emitter, props }) {
    const state = signal(initialValue);
    return { state };
  },

  // 2. Template - Define the component's HTML structure
  template: (ctx) => `
    <div>${ctx.state.value}</div>
  `,

  // 3. Style - Component CSS (optional, not auto-scoped)
  style: `
    div { color: blue; }
  `,

  // 4. Children - Child component mappings (optional)
  children: {
    ".child-container": "ChildComponent"
  }
});
```

**Why this order?**
- `setup` initializes the data that `template` and `style` might reference
- `template` defines the structure that `style` will style
- `style` applies to the template's elements
- `children` maps to elements created in the template

---

## Next Steps

- **[Setup & Lifecycle](./setup-lifecycle.md)** - Setup patterns and lifecycle hooks
- **[Signals & Templates](./signals-templates.md)** - Reactivity and template syntax

---

[← Overview](./index.md) | [Setup & Lifecycle →](./setup-lifecycle.md)
