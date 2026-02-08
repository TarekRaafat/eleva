---
title: Eleva.js Migration Guides
description: Migrate to Eleva.js from React, Vue, Alpine.js, or jQuery. Side-by-side code comparisons, concept mapping, and incremental migration strategies.
image: /imgs/eleva.js%20Full%20Logo.png
---

<link rel="canonical" href="https://elevajs.com/migration/">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://elevajs.com/migration/">
<meta property="og:title" content="Migration Guides - Eleva.js">
<meta property="og:description" content="Migrate to Eleva.js from React, Vue, Alpine.js, or jQuery. Side-by-side code comparisons, concept mapping, and incremental migration strategies.">
<meta property="og:image" content="https://elevajs.com/imgs/eleva.js%20Full%20Logo.png">
<meta property="og:site_name" content="Eleva.js">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://elevajs.com/migration/">
<meta name="twitter:title" content="Migration Guides - Eleva.js">
<meta name="twitter:description" content="Migrate to Eleva.js from React, Vue, Alpine.js, or jQuery. Side-by-side code comparisons, concept mapping, and incremental migration strategies.">
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
  "@type": "TechArticle",
  "headline": "Eleva.js Migration Guides",
  "description": "Step-by-step migration guides from React, Vue, Alpine.js, and jQuery to Eleva.js. Concept mapping and code comparisons.",
  "image": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png",
  "datePublished": "2026-01-01T00:00:00Z",
  "dateModified": "2026-02-08T00:00:00Z",
  "author": {
    "@type": "Person",
    "name": "Tarek Raafat",
    "email": "tarek.m.raafat@gmail.com",
    "url": "https://github.com/TarekRaafat"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Eleva.js",
    "url": "https://elevajs.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://elevajs.com/migration/"
  },
  "proficiencyLevel": "Intermediate",
  "articleSection": "Migration",
  "keywords": ["eleva", "elevajs", "Eleva.js", "migration", "React", "Vue", "Alpine.js", "jQuery", "framework migration"]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://elevajs.com/" },
    { "@type": "ListItem", "position": 2, "name": "Migration", "item": "https://elevajs.com/migration/" }
  ]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Can I migrate to Eleva incrementally?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Eleva can coexist with your existing framework. You can mount Eleva components alongside existing code and migrate one component at a time, starting with leaf components that have no children."
      }
    },
    {
      "@type": "Question",
      "name": "What migration strategy should I use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Three approaches: (1) Incremental - Eleva coexists with existing code, migrate pieces over time. (2) Component-by-component - Start with leaf components, work up to parents. (3) Feature-by-feature - Build new features in Eleva, convert during refactors."
      }
    },
    {
      "@type": "Question",
      "name": "What do I gain by migrating to Eleva?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Simplicity (~2.5KB gzipped, no build step, no virtual DOM), Performance (240+ FPS rendering, batched DOM updates), Developer Experience (familiar patterns from React/Vue, TypeScript support, simple mental model), and Agent Experience (AX) — a built-in Agent plugin for AI/LLM integration with action registry, audit logging, and permissions."
      }
    },
    {
      "@type": "Question",
      "name": "How does Eleva's state management compare to other frameworks?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Eleva uses signals for reactive state. React's useState becomes signal(), Vue's ref/reactive becomes signal(), Alpine's x-data becomes setup() + signal(), and jQuery global variables become signals with automatic DOM updates."
      }
    }
  ]
}
</script>

# Migration Guides

> **Version:** 1.2.0 | Comprehensive guides for migrating to Eleva from other frameworks

Welcome to the Eleva migration guides. These guides help you transition from popular frameworks to Eleva while leveraging your existing knowledge. Along with exceptional Developer Experience (DX), Eleva is the only ~2.5KB framework with built-in Agent Experience (AX) — a first-class AI/LLM integration layer.

---

## Overview

Eleva is designed to be approachable for developers coming from any background. Its concepts map naturally to patterns you already know:

| Your Background | Eleva Equivalent |
|-----------------|------------------|
| React `useState` | `signal()` |
| React `useEffect` | `signal.watch()` |
| Vue `ref`/`reactive` | `signal()` |
| Vue SFC | Component objects |
| Alpine `x-data` | `setup()` + `signal()` |
| Alpine `x-model` | `value` + `@input` |
| Alpine `x-for` | `.map().join('')` |
| jQuery DOM manipulation | Template strings |
| jQuery events | `@event` syntax |

---

## Available Guides

### [From React](./from-react.md)

If you're coming from React, you'll find Eleva's signal-based reactivity familiar but simpler. No hooks rules, no virtual DOM reconciliation to worry about.

**Key transitions:**
- `useState` → `signal()`
- `useEffect` → `signal.watch()`
- JSX → Template strings
- React Router → Eleva Router plugin
- Redux/Context → Eleva Store plugin

### [From Vue](./from-vue.md)

Vue developers will feel at home with Eleva's component model and reactivity system. The main difference is Eleva's lighter footprint and simpler API.

**Key transitions:**
- `ref()`/`reactive()` → `signal()`
- SFC → Component objects
- Vue Router → Eleva Router plugin
- Vuex/Pinia → Eleva Store plugin
- `v-if`/`v-for` → JavaScript expressions

### [From Alpine.js](./from-alpine.md)

Both Alpine and Eleva share a similar philosophy—lightweight, no build step, progressive enhancement. The key difference is approach: Alpine is HTML-first with directives, Eleva is JS-first with template functions.

**Key transitions:**
- `x-data` → `setup()` + `signal()`
- `x-show`/`x-if` → Ternary expressions
- `x-for` → `.map().join('')`
- `x-model` → `value` + `@input`
- `$watch` → `signal.watch()`
- `Alpine.store` → Eleva Store plugin

### [From jQuery](./from-jquery.md)

Moving from jQuery to Eleva gives you modern component architecture while keeping the simplicity you love. No build step required.

**Key transitions:**
- `$('#id')` → Component templates
- `.on('click')` → `@click` syntax
- Global variables → Signals
- Manual DOM updates → Automatic reactivity
- Spaghetti code → Organized components

---

## Migration Strategy

### 1. Incremental Migration

You don't have to migrate everything at once. Eleva can coexist with your existing code:

```html
<!-- Your existing app -->
<div id="legacy-app">...</div>

<!-- New Eleva component -->
<div id="eleva-widget"></div>

<script type="module">
  import Eleva from "eleva";

  const app = new Eleva("Widget");
  app.component("NewFeature", { /* ... */ });
  app.mount(document.getElementById("eleva-widget"), "NewFeature");
</script>
```

### 2. Component-by-Component

Migrate one component at a time, starting with leaf components (those with no children):

1. **Identify** standalone components
2. **Convert** to Eleva component format
3. **Test** in isolation
4. **Integrate** with existing app
5. **Repeat** for parent components

### 3. Feature-by-Feature

Migrate entire features when they're self-contained:

1. **New features** → Build in Eleva from the start
2. **Refactors** → Convert during planned rewrites
3. **Bug fixes** → Consider converting affected components

---

## Common Patterns

### State Management

**Before (various frameworks):**
```javascript
// React
const [count, setCount] = useState(0);
setCount(count + 1);

// Vue
const count = ref(0);
count.value++;

// Alpine
<div x-data="{ count: 0 }">
  <button @click="count++">
</div>

// jQuery
let count = 0;
$('#count').text(++count);
```

**After (Eleva):**
```javascript
const count = signal(0);
count.value++;
// Template automatically updates
```

### Event Handling

**Before:**
```javascript
// React
<button onClick={() => setCount(c => c + 1)}>

// Vue
<button @click="count++">

// Alpine
<button @click="count++">

// jQuery
$('button').on('click', () => count++);
```

**After (Eleva):**
```javascript
template: (ctx) => `
  <button @click="increment">Click me</button>
`
```

### Conditional Rendering

**Before:**
```javascript
// React
{isVisible && <div>Content</div>}

// Vue
<div v-if="isVisible">Content</div>

// Alpine
<div x-if="isVisible">Content</div>

// jQuery
if (isVisible) $('#content').show();
```

**After (Eleva):**
```javascript
template: (ctx) => `
  ${ctx.isVisible.value ? '<div>Content</div>' : ''}
`
```

### List Rendering

**Before:**
```javascript
// React
{items.map(item => <li key={item.id}>{item.name}</li>)}

// Vue
<li v-for="item in items" :key="item.id">{{ item.name }}</li>

// Alpine
<template x-for="item in items" :key="item.id">
  <li x-text="item.name"></li>
</template>

// jQuery
items.forEach(item => $('ul').append(`<li>${item.name}</li>`));
```

**After (Eleva):**
```javascript
template: (ctx) => `
  <ul>
    ${ctx.items.value.map(item => `
      <li key="${item.id}">${item.name}</li>
    `).join('')}
  </ul>
`
```

---

## What You Gain

### Simplicity
- ~2.5KB gzipped core
- No build step required
- No virtual DOM overhead
- No hooks rules to remember

### Performance
- 240+ FPS capable rendering
- Batched DOM updates via microtasks
- Efficient DOM diffing and patching

### Developer Experience
- Familiar patterns from React/Vue
- TypeScript support via JSDoc
- Simple mental model
- Easy debugging (no magic)

---

## Need Help?

- **Documentation:** [Main Docs](../index.md)
- **Examples:** [Examples & Recipes](../examples/index.md)
- **GitHub:** [Report Issues](https://github.com/TarekRaafat/eleva/issues)

---

## All Migration Guides

- [From React](./from-react.md) — useState, hooks, JSX → signals, templates
- [From Vue](./from-vue.md) — ref/reactive, SFC → signals, component objects
- [From Alpine.js](./from-alpine.md) — x-data, directives → setup, templates
- [From jQuery](./from-jquery.md) — DOM manipulation → reactive components

---

[← Back to Main Docs](../index.md) | [From React →](./from-react.md)
