---
title: Migration Guides
description: Step-by-step migration guides from React, Vue, Alpine.js, and jQuery to Eleva.js. Concept mapping tables, code comparisons, and best practices for smooth transitions.
---

# Migration Guides

> **Version:** 1.0.0 | Comprehensive guides for migrating to Eleva from other frameworks

Welcome to the Eleva migration guides. These guides help you transition from popular frameworks to Eleva while leveraging your existing knowledge.

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

[← Back to Main Docs](../index.md) | [From React →](./from-react.md)
