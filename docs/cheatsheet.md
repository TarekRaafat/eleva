---
title: Eleva.js Cheat Sheet
description: Quick reference for Eleva.js syntax - signals, templates, lifecycle hooks, events, props, and common patterns. Print-friendly.
---

# Eleva.js Cheat Sheet

> **Quick Reference** | Version 1.0.0 | [Full Docs](./index.md)

---

## Setup

```javascript
import Eleva from "eleva";
const app = new Eleva("MyApp");

app.component("Name", { setup, template, style, children });
app.mount(document.getElementById("app"), "Name", { props });
```

---

## Signals (Reactive State)

```javascript
setup: ({ signal }) => {
  const count = signal(0);           // Create signal
  count.value;                       // Read value
  count.value = 5;                   // Set value (triggers re-render)
  count.value++;                     // Update value

  // Objects/Arrays - REPLACE, don't mutate!
  const items = signal([1, 2, 3]);
  items.value = [...items.value, 4]; // ✓ Correct
  items.value.push(4);               // ✗ Won't trigger re-render

  return { count, items };
}
```

| Operation | Wrong (mutate) | Right (replace) |
|-----------|----------------|-----------------|
| Add item | `arr.push(x)` | `arr.value = [...arr.value, x]` |
| Remove item | `arr.splice(i,1)` | `arr.value = arr.value.filter(...)` |
| Update item | `arr[i] = x` | `arr.value = arr.value.map(...)` |
| Update object | `obj.key = x` | `obj.value = {...obj.value, key: x}` |

---

## Template Syntax

```javascript
template: (ctx) => `
  <!-- Interpolation: use ctx. -->
  <p>${ctx.count.value}</p>
  <p>${ctx.items.value.length} items</p>

  <!-- Events: NO ctx, use function name -->
  <button @click="increment">+</button>
  <button @click="() => setCount(5)">Set 5</button>
  <input @input="(e) => setName(e.target.value)" />

  <!-- Child Props: NO ctx -->
  <child :data="items.value" :label="name.value"></child>

  <!-- Conditionals -->
  ${ctx.show.value ? `<div>Visible</div>` : ''}
  ${ctx.error.value && `<span class="error">${ctx.error.value}</span>`}

  <!-- Lists (always use key) -->
  ${ctx.items.value.map(item => `
    <li key="${item.id}">${item.name}</li>
  `).join('')}
`
```

### Quick Rule
| Context | Use `ctx.`? | Example |
|---------|-------------|---------|
| `${}` interpolation | Yes | `${ctx.count.value}` |
| `@event` handlers | No | `@click="increment"` |
| `:prop` binding | No | `:data="items.value"` |

---

## Events

```javascript
// Simple handler
<button @click="handleClick">Click</button>

// With argument
<button @click="() => remove(item.id)">Delete</button>

// With event object
<input @input="(e) => setQuery(e.target.value)" />
<form @submit="(e) => { e.preventDefault(); save(); }">

// Common events
@click    @dblclick   @mouseenter   @mouseleave
@input    @change     @focus        @blur
@keydown  @keyup      @keypress
@submit   @reset
```

---

## Lifecycle Hooks

```javascript
setup: ({ signal }) => {
  const data = signal(null);
  let cleanup = null;

  return {
    data,
    onBeforeMount: () => { /* Before DOM insert */ },
    onMount: () => {
      // DOM ready - fetch data, add listeners
      fetchData().then(d => data.value = d);
      cleanup = subscribe();
    },
    onUpdate: () => { /* After re-render (don't set state here!) */ },
    onUnmount: () => {
      // Cleanup - remove listeners, cancel requests
      if (cleanup) cleanup();
    }
  };
}
```

| Hook | When | Use For |
|------|------|---------|
| `onBeforeMount` | Before DOM insert | Validate props |
| `onMount` | After DOM ready | Fetch data, add listeners, focus |
| `onUpdate` | After re-render | Sync external systems |
| `onUnmount` | Before removal | Cleanup listeners, timers |

---

## Component Structure

```javascript
app.component("MyComponent", {
  // 1. Setup (optional) - state & logic
  setup: ({ signal, props, emitter }) => {
    const count = signal(props.initial || 0);
    const increment = () => count.value++;

    return { count, increment, onMount: () => {} };
  },

  // 2. Template (required) - HTML structure
  template: (ctx) => `
    <div class="my-component">
      <span>${ctx.count.value}</span>
      <button @click="increment">+</button>
    </div>
  `,

  // 3. Style (optional) - scoped CSS
  style: `
    .my-component { padding: 1rem; }
    button { cursor: pointer; }
  `,

  // 4. Children (optional) - nested components
  children: {
    ".child-slot": "ChildComponent"
  }
});
```

---

## Props & Events (Parent-Child)

```javascript
// Parent
app.component("Parent", {
  setup: ({ signal }) => {
    const items = signal(["a", "b"]);
    const handleAdd = (item) => items.value = [...items.value, item];
    return { items, handleAdd };
  },
  template: (ctx) => `
    <child-list :items="items.value" :onAdd="handleAdd"></child-list>
  `,
  children: { "child-list": "ChildList" }
});

// Child - receives props
app.component("ChildList", {
  setup: ({ props }) => ({
    items: props.items,
    add: () => props.onAdd("new")
  }),
  template: (ctx) => `
    <ul>${ctx.items.map(i => `<li>${i}</li>`).join('')}</ul>
    <button @click="add">Add</button>
  `
});
```

---

## Emitter (Cross-Component)

```javascript
setup: ({ emitter }) => {
  // Emit event
  const save = () => emitter.emit("data:saved", { id: 1 });

  // Listen to event (remember to cleanup!)
  let unsub;
  return {
    save,
    onMount: () => {
      unsub = emitter.on("data:saved", (data) => console.log(data));
    },
    onUnmount: () => unsub && unsub()
  };
}
```

---

## Plugins

```javascript
import { Attr, Router, Store } from "eleva/plugins";

// Attr - accessibility & attributes
app.use(Attr);

// Store - global state
app.use(Store, {
  state: { user: null, count: 0 },
  actions: {
    setUser: (state, user) => state.user.value = user,
    increment: (state) => state.count.value++
  }
});

// Router - SPA navigation
app.use(Router, {
  mode: "hash",  // or "history"
  routes: [
    { path: "/", component: Home },
    { path: "/user/:id", component: User },
    { path: "*", component: NotFound }
  ]
});
```

### Using Plugins in Components

```javascript
setup: ({ store, router }) => ({
  // Store
  user: store.state.user,
  login: (u) => store.dispatch("setUser", u),

  // Router
  currentPath: router.currentRoute.value.path,
  goTo: (path) => router.navigate(path),
  params: router.currentRoute.value.params
})
```

---

## Common Patterns

### Fetch Data on Mount

```javascript
setup: ({ signal }) => {
  const data = signal(null);
  const loading = signal(true);
  const error = signal(null);

  return {
    data, loading, error,
    onMount: async () => {
      try {
        const res = await fetch("/api/data");
        data.value = await res.json();
      } catch (e) {
        error.value = e.message;
      } finally {
        loading.value = false;
      }
    }
  };
}
```

### Debounced Input

```javascript
setup: ({ signal }) => {
  const query = signal("");
  let timer;

  const search = (value) => {
    query.value = value;
    clearTimeout(timer);
    timer = setTimeout(() => fetchResults(value), 300);
  };

  return { query, search, onUnmount: () => clearTimeout(timer) };
}
```

### Toggle State

```javascript
setup: ({ signal }) => {
  const isOpen = signal(false);
  const toggle = () => isOpen.value = !isOpen.value;
  return { isOpen, toggle };
}
```

### Form Handling

```javascript
setup: ({ signal }) => {
  const form = signal({ name: "", email: "" });

  const updateField = (field, value) => {
    form.value = { ...form.value, [field]: value };
  };

  const submit = (e) => {
    e.preventDefault();
    console.log(form.value);
  };

  return { form, updateField, submit };
}
```

---

## Don'ts

```javascript
// ✗ Don't mutate arrays/objects
items.value.push(x);
user.value.name = "new";

// ✗ Don't update state in onUpdate (infinite loop)
onUpdate: () => { count.value++; }

// ✗ Don't forget cleanup
onMount: () => { window.addEventListener("scroll", fn); }
// Missing onUnmount cleanup!

// ✗ Don't use ctx. in events
<button @click="ctx.increment">  // Wrong
<button @click="increment">       // Right
```

---

## Quick Links

| Topic | Link |
|-------|------|
| Getting Started | [View](./getting-started.md) |
| Core Concepts | [View](./core-concepts.md) |
| Components | [View](./components.md) |
| Best Practices | [View](./best-practices.md) |
| Examples | [View](./examples/index.md) |
| Router Plugin | [View](./plugins/router/index.md) |
| Store Plugin | [View](./plugins/store/index.md) |
| Attr Plugin | [View](./plugins/attr/index.md) |

---

[← Back to Main Docs](./index.md)
