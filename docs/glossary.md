---
title: Eleva.js Glossary
description: Definitions of key terms and concepts used in Eleva.js - signals, reactivity, components, lifecycle hooks, and more.
image: /imgs/eleva.js%20Full%20Logo.png
---

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Eleva.js Glossary",
  "description": "Definitions of key terms and concepts used in Eleva.js - signals, reactivity, components, lifecycle hooks, and more.",
  "image": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png",
  "datePublished": "2025-01-01",
  "dateModified": "2025-01-17",
  "author": {
    "@type": "Person",
    "name": "Tarek Raafat",
    "email": "tarek.m.raaf@gmail.com",
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
    "@id": "https://elevajs.com/glossary.html"
  },
  "proficiencyLevel": "Beginner",
  "articleSection": "Reference",
  "keywords": ["eleva", "elevajs", "Eleva.js", "glossary", "definitions", "signals", "reactivity", "components", "terminology"]
}
</script>

# Glossary

> **Quick Reference** | Definitions of key Eleva.js terms and concepts.

---

## A

### Action
A function defined in the [Store](#store) plugin that modifies state. Actions are the only way to change store state, ensuring predictable state management.

```javascript
actions: {
  increment: (state) => state.count.value++,
  setUser: (state, user) => state.user.value = user
}
```

### Attr Plugin
An official Eleva plugin (~2.4KB) that provides intelligent attribute binding for ARIA accessibility, data attributes, boolean attributes, and dynamic properties. [Learn more →](./plugins/attr/index.md)

---

## B

### Batching
Eleva's automatic optimization that groups multiple signal updates into a single re-render. When you update multiple signals synchronously, Eleva batches them together to avoid unnecessary renders.

```javascript
// These 3 updates result in only 1 render
x.value = 1;
y.value = 2;
z.value = 3;
```

### Boolean Attribute
HTML attributes that represent true/false values (e.g., `disabled`, `checked`, `readonly`). The [Attr plugin](#attr-plugin) handles these automatically.

---

## C

### Children
Nested components defined within a parent component. Specified using CSS selectors that map to component names.

```javascript
children: {
  ".sidebar": "SidebarComponent",
  "#header": "HeaderComponent"
}
```

### Component
A self-contained, reusable building block of an Eleva application. Components encapsulate their own state, template, styles, and child components.

```javascript
app.component("MyComponent", {
  setup,    // State and logic
  template, // HTML structure
  style,    // Scoped CSS
  children  // Nested components
});
```

### Computed Value
A derived value calculated from one or more signals. In Eleva, computed values are implemented as functions that read signal values.

```javascript
const items = signal([1, 2, 3]);
const getTotal = () => items.value.reduce((a, b) => a + b, 0);
```

### Context (ctx)
The object passed to the template function containing all values returned from [setup](#setup-function). Used to access signals, functions, and props in templates.

```javascript
template: (ctx) => `<p>${ctx.count.value}</p>`
```

---

## D

### Declarative
A programming style where you describe *what* you want rather than *how* to achieve it. Eleva's templates are declarative—you describe the UI structure, and Eleva handles the DOM updates.

### Diffing
The process of comparing the previous and current state of the UI to determine what changed. Eleva uses efficient string-based diffing rather than Virtual DOM diffing.

---

## E

### Emitter
A built-in event system for communication between components. Components can emit events and subscribe to events from other components.

```javascript
setup: ({ emitter }) => {
  emitter.emit("user:login", { id: 1 });           // Emit
  const unsub = emitter.on("user:login", handler); // Subscribe
}
```

### Event Binding
Attaching event handlers to DOM elements using the `@` syntax in templates. Eleva uses **native DOM events** — the `@` syntax is shorthand for `addEventListener`. Any event that works in vanilla JavaScript works in Eleva.

```javascript
// Direct reference - event passed automatically
<button @click="handleClick">Click me</button>

// Arrow function - needed when passing arguments
<button @click="() => remove(item.id)">Delete</button>

// Inline processing of event
<input @input="(e) => setValue(e.target.value)" />

// Any native DOM event works
<div @scroll="handleScroll">
<div @contextmenu="handleRightClick">
<video @timeupdate="handleTime">
```

> **Note:** `@click="remove(id)"` executes immediately during render. Use `@click="() => remove(id)"` for handlers with arguments.

---

## G

### Guard
A function in the [Router plugin](#router-plugin) that controls navigation. Guards can allow, redirect, or cancel navigation based on conditions like authentication.

```javascript
beforeEnter: (to, from) => {
  if (!isAuthenticated()) return "/login";
  return true;
}
```

---

## H

### Hash Mode
A routing mode that uses the URL hash (`#`) for navigation (e.g., `example.com/#/users`). Works without server configuration. See [Router plugin](#router-plugin).

### History Mode
A routing mode that uses the browser's History API for clean URLs (e.g., `example.com/users`). Requires server configuration for direct URL access.

### Hook
See [Lifecycle Hook](#lifecycle-hook).

### Hydration
The process of attaching JavaScript behavior to server-rendered HTML. Eleva supports progressive enhancement but is primarily designed for client-side rendering.

---

## I

### Immutability
The practice of creating new objects/arrays instead of modifying existing ones. Required for Eleva's signal reactivity to detect changes.

```javascript
// ✗ Mutable (won't trigger re-render)
items.value.push(newItem);

// ✓ Immutable (triggers re-render)
items.value = [...items.value, newItem];
```

### Interpolation
Embedding JavaScript expressions in templates using `${}` syntax within template literals.

```javascript
template: (ctx) => `<p>Count: ${ctx.count.value}</p>`
```

---

## K

### Key
A unique identifier used in list rendering to help Eleva track which items changed, were added, or removed. Always use stable, unique keys.

```javascript
${items.map(item => `<li key="${item.id}">${item.name}</li>`).join('')}
```

---

## L

### Lazy Loading
Loading components or routes only when needed, reducing initial bundle size. Supported by the [Router plugin](#router-plugin).

```javascript
{ path: "/dashboard", component: () => import("./Dashboard.js") }
```

### Lifecycle Hook
Functions called at specific points in a component's existence. Eleva provides four hooks:

| Hook | When Called |
|------|-------------|
| `onBeforeMount` | Before component is added to DOM |
| `onMount` | After component is added to DOM |
| `onUpdate` | After component re-renders |
| `onUnmount` | Before component is removed from DOM |

---

## M

### Mounting
The process of rendering a component and inserting it into the DOM.

```javascript
app.mount(document.getElementById("app"), "MyComponent", { props });
```

### Mutation
Directly modifying an object or array. Mutations don't trigger reactivity in Eleva—use [immutable](#immutability) updates instead.

---

## N

### Namespace
A way to organize related state in the [Store plugin](#store-plugin). Namespaces prevent naming collisions and improve code organization.

```javascript
app.use(Store, {
  namespaces: {
    user: { state: { name: "" }, actions: { setName } },
    cart: { state: { items: [] }, actions: { addItem } }
  }
});
```

---

## O

### onBeforeMount
A [lifecycle hook](#lifecycle-hook) called before the component is inserted into the DOM. Use for prop validation or setup that doesn't require DOM access.

### onMount
A [lifecycle hook](#lifecycle-hook) called after the component is inserted into the DOM. Use for data fetching, adding event listeners, or accessing DOM elements.

### onUnmount
A [lifecycle hook](#lifecycle-hook) called before the component is removed from the DOM. Use for cleanup: removing event listeners, canceling requests, clearing timers. Receives `{ container, context, cleanup }` where `cleanup` contains `{ watchers, listeners, children }` arrays for advanced scenarios.

```javascript
onUnmount: ({ container, context, cleanup }) => {
  console.log(`Cleaning up ${cleanup.watchers.length} watchers`);
  clearInterval(timerId);
  window.removeEventListener("resize", handler);
}
```

### onUpdate
A [lifecycle hook](#lifecycle-hook) called after the component re-renders due to state changes. Avoid setting state here to prevent infinite loops.

---

## P

### Plugin
An extension that adds functionality to Eleva. Plugins are installed using `app.use()`.

```javascript
import { Router, Store, Attr } from "eleva/plugins";
app.use(Router, { routes: [...] });
```

### Props
Data passed from a parent component to a child component. Props flow down the component tree.

```javascript
// Parent template
<child :name="user.value.name" :onSave="handleSave"></child>

// Child setup
setup: ({ props }) => ({
  userName: props.name,
  save: () => props.onSave()
})
```

### Prop Binding
Passing data to child components using the `:` syntax in templates. Note: Don't use `ctx.` in prop bindings.

```javascript
<child :items="items.value" :count="count.value"></child>
```

---

## R

### Reactivity
The automatic updating of the UI when underlying data changes. Eleva uses [signals](#signal) for fine-grained reactivity—only components that depend on changed data re-render.

### Renderer
Eleva's internal module responsible for updating the DOM when state changes. It uses efficient diffing to minimize DOM operations.

### Route
A mapping between a URL path and a component in the [Router plugin](#router-plugin).

```javascript
{ path: "/users/:id", component: UserProfile }
```

### Router Plugin
An official Eleva plugin (~15KB) for client-side navigation with support for hash/history modes, navigation guards, lazy loading, and layouts. [Learn more →](./plugins/router/index.md)

---

## S

### Scoped Styles
CSS styles that only apply to a specific component, preventing style conflicts. Defined in the component's `style` property.

```javascript
style: `
  .button { color: blue; }  /* Only affects this component */
`
```

### Setup Function
The function in a component that initializes state and logic. Receives `signal`, `props`, and `emitter` as parameters. Returns values accessible in the template.

```javascript
setup: ({ signal, props, emitter }) => {
  const count = signal(0);
  return { count, increment: () => count.value++ };
}
```

### Signal
A reactive container that holds a value. When a signal's value changes, any component using that signal automatically re-renders.

```javascript
const count = signal(0);  // Create
count.value;              // Read (returns 0)
count.value = 5;          // Write (triggers re-render)
```

### SPA (Single Page Application)
A web application that loads a single HTML page and dynamically updates content as the user interacts. Eleva with the Router plugin enables SPA development.

### Store Plugin
An official Eleva plugin (~6KB) for centralized state management with actions, namespaces, persistence, and subscriptions. [Learn more →](./plugins/store/index.md)

### Subscription
A way to listen for changes to store state or emitter events. Always unsubscribe in `onUnmount` to prevent memory leaks.

```javascript
const unsub = store.subscribe("count", (value) => console.log(value));
// Later: unsub();
```

---

## T

### Template
A function that returns an HTML string defining the component's structure. Uses template literals with interpolation.

```javascript
template: (ctx) => `
  <div class="card">
    <h1>${ctx.title.value}</h1>
    <button @click="increment">Count: ${ctx.count.value}</button>
  </div>
`
```

### Template Engine
Eleva's internal module that processes templates, handles event binding (`@`), prop binding (`:`), and interpolation (`${}`).

### Tree-shaking
A build optimization that removes unused code. Eleva and its plugins are tree-shakeable—import only what you use.

```javascript
import { Router } from "eleva/plugins";  // Only Router is bundled
```

---

## U

### Unmounting
The process of removing a component from the DOM and cleaning up its resources.

---

## V

### Virtual DOM
A programming concept where a virtual representation of the UI is kept in memory and synced with the real DOM. **Eleva does NOT use Virtual DOM**—it uses direct, efficient DOM updates based on signal changes.

### Vanilla JavaScript Compatibility
**💡 Vanilla JavaScript. Elevated.** Eleva takes plain vanilla JavaScript to the next level. Signals for reactivity. Components for structure. Your JS knowledge stays front and center, not hidden behind abstractions. Everything you know works exactly as expected:

- **DOM events:** All native events work (`@click`, `@scroll`, `@wheel`, etc.)
- **Array methods:** `.map()`, `.filter()`, `.find()`, `.reduce()`, etc.
- **String/Object methods:** All native methods work in templates
- **Web APIs:** `fetch`, `localStorage`, `URL`, Observers, etc.
- **Timers:** `setTimeout`, `setInterval`, `requestAnimationFrame`

**If it works in vanilla JavaScript, it works in Eleva.**

---

## W

### Watch / Watcher
A mechanism to observe signal changes. In Eleva, you can watch for changes using the signal's built-in reactivity or store subscriptions.

```javascript
// Store subscription (acts as a watcher)
store.subscribe("user", (user) => {
  console.log("User changed:", user);
});
```

---

## Related Pages

- [Cheat Sheet](./cheatsheet.md) - Quick syntax reference
- [Core Concepts](./core-concepts.md) - Detailed explanations
- [Best Practices](./best-practices.md) - Patterns and guidelines
- [FAQ](./faq.md) - Common questions

---

[← Cheat Sheet](./cheatsheet.md) | [Back to Main Docs](./index.md) | [Core Concepts →](./core-concepts.md)
