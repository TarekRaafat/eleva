---
title: UI Patterns - Forms, Lists, Async & More
description: Reusable Eleva.js UI patterns. Forms, async data fetching, conditional rendering, lists, and state management. Copy-paste solutions for common challenges.
---

<!-- REVU Analytics -->
<script async src="https://cdn.revu.ai/behavior"></script>
<script>
  window.revu = window.revu || new Proxy({q:[]}, {
    get: (t, m) => m in t ? t[m] : (...a) => t.q.push([m, ...a]),
  });
  revu.init({ apiKey: "revu_pk_prod_KFdyizGp4I0cWia36eNmWg" });
</script>

<link rel="canonical" href="https://elevajs.com/examples/patterns/">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://elevajs.com/examples/patterns/">
<meta property="og:title" content="UI Patterns - Eleva.js">
<meta property="og:description" content="Reusable Eleva.js UI patterns. Forms, async data fetching, conditional rendering, lists, and state management. Copy-paste solutions for common challenges.">
<meta property="og:image" content="https://elevajs.com/imgs/eleva.js%20Full%20Logo.png">
<meta property="og:site_name" content="Eleva.js">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://elevajs.com/examples/patterns/">
<meta name="twitter:title" content="UI Patterns - Eleva.js">
<meta name="twitter:description" content="Reusable Eleva.js UI patterns. Forms, async data fetching, conditional rendering, lists, and state management. Copy-paste solutions for common challenges.">
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
    { "@type": "ListItem", "position": 3, "name": "Patterns", "item": "https://elevajs.com/examples/patterns/" }
  ]
}
</script>

# UI Patterns

> **Version:** 1.2.0 | Reusable code patterns for common UI scenarios.

---

## Available Patterns

| Pattern | Description | Link |
|---------|-------------|------|
| **Best Practices** | Selectors, components, lifecycle, performance | [View →](./best-practices/index.md) |
| **Forms** | Input binding, validation, submission | [View →](./forms.md) |
| **Async Data** | API fetching, loading states, pagination | [View →](./async-data/index.md) |
| **Conditional Rendering** | Show/hide, tabs, modals, skeletons | [View →](./conditional-rendering.md) |
| **Lists** | Search, filter, sort, drag-and-drop, CRUD | [View →](./lists/index.md) |
| **State Management** | Computed values, undo/redo, wizards | [View →](./state/index.md) |
| **Local Storage** | Persistence, session storage, caching | [View →](./storage.md) |

## Quick Links

### Best Practices
- [Selector Performance](./best-practices/selectors-structure.md)
- [Component Structure](./best-practices/selectors-structure.md#component-structure)
- [Lifecycle Hooks](./best-practices/setup-lifecycle.md)
- [Signal Reactivity](./best-practices/signals-templates.md)
- [Performance Optimization](./best-practices/performance.md)

### Forms
- [Basic Input Binding](./forms.md#basic-input-binding)
- [Form Validation](./forms.md#complete-form-with-validation)

### Async Data
- [API Fetching](./async-data/index.md#basic-api-fetch)
- [Paginated Lists](./async-data/index.md#paginated-list-with-loading-states)
- [Caching & Optimization](./async-data/caching.md)
- [Resilience Patterns](./async-data/resilience.md)

### Conditional Rendering
- [Accordion](./conditional-rendering.md#showhide-toggle)
- [Tab Panel](./conditional-rendering.md#conditional-component-rendering)

### Lists
- [Basic Lists](./lists/index.md)
- [Search & Filter](./lists/search-filter.md)
- [Drag & Drop](./lists/patterns.md#drag-and-drop-reorderable-list)
- [Virtual Scrolling](./lists/virtual-scrolling.md)

### State Management
- [Basic Counter](./state/index.md)
- [Shopping Cart](./state/patterns.md#shopping-cart-with-computed-totals)
- [Undo/Redo](./state/patterns.md#counter-with-history-undoredo)
- [Render Batching](./state/batching.md)

### Local Storage
- [Persistent Notes](./storage.md#persistent-notes-app)
- [Theme Preference](./storage.md#theme-preference-with-localstorage)

---

## Pattern Relationships

Understanding how patterns work together helps you build complete features:

### Foundation Layer
**[Best Practices](./best-practices/index.md)** provides the foundation for all patterns. Start here for selector performance, lifecycle management, and optimization techniques.

### Core Patterns
| Pattern | Builds On | Enables |
|---------|-----------|---------|
| **[State Management](./state/index.md)** | Best Practices | Forms, Lists, Async Data |
| **[Conditional Rendering](./conditional-rendering.md)** | State Management | Loading states, Tabs, Modals |

### Domain Patterns
| Pattern | Uses | Common Combinations |
|---------|------|---------------------|
| **[Forms](./forms.md)** | State, Conditional Rendering | + Storage (drafts), + Async (submit) |
| **[Lists](./lists/index.md)** | State, Conditional Rendering | + Async (data), + Forms (inline edit) |
| **[Async Data](./async-data/index.md)** | State, Conditional Rendering | + Lists (display), + Storage (cache) |
| **[Storage](./storage.md)** | State | + Forms (persist), + Async (cache) |

### Common Pattern Combinations

**Search Feature:** Forms (input) → Async Data (fetch) → Lists (display) → Conditional Rendering (loading/empty states)

**CRUD Operations:** Forms (create/edit) → Async Data (API calls) → Lists (display) → Storage (offline cache)

**Dashboard:** Async Data (fetch metrics) → State (aggregate) → Conditional Rendering (loading) → Lists (data tables)

---

[← Back to Examples](../index.md) | [Next: Best Practices →](./best-practices/index.md)
