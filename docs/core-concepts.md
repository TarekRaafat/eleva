---
title: Eleva.js Core Concepts
description: Deep dive into Eleva's core modules - Signals, TemplateEngine, Emitters, Renderer, and Lifecycle Hooks. Learn reactivity and event handling.
image: /imgs/eleva.js%20Full%20Logo.png
---

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
  "headline": "Eleva.js Core Concepts",
  "description": "Deep dive into Eleva's core modules - Signals, TemplateEngine, Emitters, Renderer, and Lifecycle Hooks. Learn reactivity and event handling.",
  "image": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png",
  "datePublished": "2026-01-01T00:00:00Z",
  "dateModified": "2026-01-28T00:00:00Z",
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
    "@id": "https://elevajs.com/core-concepts.html"
  },
  "proficiencyLevel": "Intermediate",
  "articleSection": "Documentation",
  "keywords": ["eleva", "elevajs", "Eleva.js", "signals", "reactivity", "template engine", "emitter", "renderer", "lifecycle hooks"]
}
</script>

# Core Concepts

> **Core Docs** | Signals, templates, emitters, renderer, and lifecycle hooks.

---

## Overview

Eleva is built on five core modules that work together to create reactive, component-based applications:

| Module | Purpose | Key Methods |
|--------|---------|-------------|
| **Signal** | Reactive state | `.value`, `.watch()` |
| **Emitter** | Event handling | `.on()`, `.off()`, `.emit()` |
| **TemplateEngine** | Expression evaluation | `.evaluate()` |
| **Renderer** | DOM diffing | `.patchDOM()` |
| **Eleva** | App orchestration | `.component()`, `.mount()`, `.use()` |

### Core Philosophy

> **💡 Vanilla JavaScript. Elevated.**

Eleva takes plain vanilla JavaScript to the next level. Signals for reactivity. Components for structure. Your JS knowledge stays front and center, not hidden behind abstractions. **If it works in vanilla JS, it works in Eleva.**

---

## Signal (Reactivity)

The **Signal** provides fine-grained reactivity by updating only the affected DOM parts when values change.

### Creating Signals

```javascript
// In component setup
setup({ signal }) {
  const count = signal(0);           // Number
  const user = signal(null);         // Object
  const items = signal([]);          // Array
  const isLoading = signal(false);   // Boolean

  return { count, user, items, isLoading };
}
```

### Reading and Writing Values

```javascript
// Read value
console.log(count.value);  // 0

// Write value (triggers re-render)
count.value = 1;

// Update objects/arrays
user.value = { name: "Alice", age: 30 };
items.value = [...items.value, newItem];
```

### Watching for Changes

```javascript
const count = signal(0);

// Register a watcher (receives new value only)
const unwatch = count.watch((newVal) => {
  console.log(`Count changed to: ${newVal}`);
});

count.value = 1;  // Logs: "Count changed to: 1"

// Unsubscribe when done
unwatch();
```

### Automatic Render Batching

Eleva automatically batches multiple signal changes into a single render:

```javascript
// All 3 changes result in just 1 render
x.value = 10;
y.value = 20;
z.value = 30;
```

| Scenario | Without Batching | With Batching |
|----------|------------------|---------------|
| Drag events (60/sec x 3 signals) | 180 renders/sec | 60 renders/sec |
| Form reset (10 fields) | 10 renders | 1 render |
| API response (5 state updates) | 5 renders | 1 render |

**Key Features:**
- Signals returned from setup are auto-watched for re-rendering
- Microtask-based update batching (via `queueMicrotask`)
- Automatic watcher cleanup on unmount
- Type-safe value handling
- Efficient update propagation
- Memory leak prevention through unsubscribe

> **Timing Note:** Render updates are batched using `queueMicrotask()`. This means DOM updates happen after synchronous code completes but before the next event loop tick. If you need to read the updated DOM immediately after a state change, use `queueMicrotask(() => { /* DOM is updated here */ })`.

---

## TemplateEngine

The **TemplateEngine** evaluates expressions in `@events` and `:props` attributes against the component context.

> ⚠️ **Security Warning**
>
> TemplateEngine uses `new Function()` internally and is **NOT sandboxed**. Only use with developer-defined template strings. **Never** use with user-provided input or untrusted data, as this could enable code injection or XSS attacks.
>
> **Mitigation:** Always sanitize user-generated content before rendering. Use Content Security Policy (CSP) headers. Keep expressions simple (property access, method calls).

### How It Works

```javascript
// Internal usage for event handlers
const handler = TemplateEngine.evaluate("handleClick", context);
// handler is now the actual function reference

// Internal usage for props
const userData = TemplateEngine.evaluate("user.value", context);
// userData is the actual object value
```

**Key Features:**
- Static method-based API
- Expression evaluation in component context
- Function caching for performance
- Error handling for invalid expressions
- Support for complex object access and method calls

---

## Template Interpolation

Eleva uses JavaScript template literals for value interpolation, with special syntax for events and props.

### Understanding the Syntax

| Syntax | Evaluated By | Requires `ctx.`? | Example |
|--------|--------------|:----------------:|---------|
| `${...}` | JavaScript | Yes | `${ctx.count.value}` |
| `@event="..."` | TemplateEngine | No | `@click="increment"` |
| `:prop="..."` | TemplateEngine | No | `:user="userData.value"` |

> **Quick Rule:** `${}` needs `ctx.` — `@events` and `:props` don't.

### Value Interpolation with `${...}`

```javascript
const Counter = {
  setup: ({ signal }) => ({ count: signal(0) }),
  template: (ctx) => `<p>Count: ${ctx.count.value}</p>`
};
```

**Advantages:**
- Native JavaScript syntax—no learning curve
- Full IDE support (autocomplete, type checking)
- Access to all JavaScript features (methods, conditionals, etc.)

### Native JavaScript in Templates

Since templates are just JavaScript template literals, **any valid JavaScript expression works** inside `${}`:

```javascript
template: (ctx) => `
  <!-- Array methods -->
  ${ctx.items.value.map(item => `<li>${item.name}</li>`).join('')}
  ${ctx.items.value.filter(i => i.active).length} active items
  ${ctx.users.value.find(u => u.id === ctx.selectedId.value)?.name}

  <!-- String methods -->
  ${ctx.name.value.toUpperCase()}
  ${ctx.text.value.trim().slice(0, 100)}...
  ${ctx.email.value.split('@')[0]}

  <!-- Conditionals (ternary, &&, ||) -->
  ${ctx.isAdmin.value ? '<button>Delete</button>' : ''}
  ${ctx.error.value && `<span class="error">${ctx.error.value}</span>`}
  ${ctx.username.value || 'Guest'}

  <!-- Math & Numbers -->
  ${Math.round(ctx.price.value * 100) / 100}
  ${ctx.total.value.toFixed(2)}
  ${(ctx.score.value * 100).toLocaleString()}%

  <!-- Date formatting -->
  ${new Date(ctx.createdAt.value).toLocaleDateString()}
  ${new Date().getFullYear()}

  <!-- JSON -->
  <pre>${JSON.stringify(ctx.data.value, null, 2)}</pre>

  <!-- Optional chaining & nullish coalescing -->
  ${ctx.user.value?.profile?.avatar ?? '/default.png'}

  <!-- Object methods -->
  ${Object.keys(ctx.settings.value).length} settings
  ${Object.entries(ctx.meta.value).map(([k, v]) => `${k}: ${v}`).join(', ')}
`
```

### Native JavaScript in Setup

The `setup` function is plain JavaScript — use any native APIs:

```javascript
setup: ({ signal }) => {
  const data = signal(null);
  const loading = signal(true);

  // Fetch API
  const loadData = async () => {
    const res = await fetch('/api/data');
    data.value = await res.json();
  };

  // localStorage
  const theme = signal(localStorage.getItem('theme') || 'light');
  const saveTheme = (t) => {
    theme.value = t;
    localStorage.setItem('theme', t);
  };

  // setTimeout / setInterval
  let timer = null;
  const startTimer = () => {
    timer = setInterval(() => { /* ... */ }, 1000);
  };

  // URL / URLSearchParams
  const params = new URLSearchParams(window.location.search);
  const query = signal(params.get('q') || '');

  // Regular expressions
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Web APIs (IntersectionObserver, ResizeObserver, etc.)
  let observer = null;

  return {
    data, loading, theme, query,
    loadData, saveTheme, startTimer, isValidEmail,

    onMount: () => {
      loadData();
      observer = new IntersectionObserver(/* ... */);
    },

    onUnmount: () => {
      clearInterval(timer);
      observer?.disconnect();
    }
  };
}
```

### Native JavaScript Summary

| Category | Examples | Where |
|----------|----------|-------|
| **Array methods** | `.map()`, `.filter()`, `.find()`, `.some()`, `.reduce()` | Templates & Setup |
| **String methods** | `.trim()`, `.split()`, `.slice()`, `.toUpperCase()` | Templates & Setup |
| **Object methods** | `Object.keys()`, `Object.values()`, `Object.entries()` | Templates & Setup |
| **Math** | `Math.round()`, `Math.floor()`, `Math.random()` | Templates & Setup |
| **Date** | `new Date()`, `.toLocaleDateString()`, `.getTime()` | Templates & Setup |
| **JSON** | `JSON.stringify()`, `JSON.parse()` | Templates & Setup |
| **Fetch API** | `fetch()`, `Response`, `Request` | Setup |
| **Storage** | `localStorage`, `sessionStorage` | Setup |
| **Timers** | `setTimeout()`, `setInterval()`, `clearTimeout()` | Setup |
| **URL** | `URL`, `URLSearchParams`, `location` | Setup |
| **Observers** | `IntersectionObserver`, `ResizeObserver`, `MutationObserver` | Setup |
| **Other Web APIs** | `navigator`, `Clipboard`, `Geolocation`, `WebSocket` | Setup |

> **Key Principle:** Eleva doesn't replace JavaScript — it enhances it. Your existing JS knowledge applies directly.

### Event Handlers with `@event`

Event handlers are evaluated against your component context (no `ctx.` needed):

```javascript
const Counter = {
  setup: ({ signal }) => {
    const count = signal(0);
    const increment = () => count.value++;
    return { count, increment };
  },
  template: (ctx) => `
    <p>Count: ${ctx.count.value}</p>
    <button @click="increment">+</button>
  `
};
```

You can also use inline expressions:

```javascript
template: (ctx) => `
  <button @click="() => count.value++">+</button>
`
```

#### Handler Types

| Type | Syntax | When to Use |
|------|--------|-------------|
| Direct reference | `@click="handleClick"` | Handler receives event as first argument |
| With custom arguments | `@click="() => remove(item.id)"` | Handler needs specific arguments |
| Inline event processing | `@input="(e) => setValue(e.target.value)"` | Extract/transform event data inline |

> ⚠️ **Critical: Use Arrow Functions When Passing Arguments**
>
> When passing arguments to handlers, you **must** wrap the call in an arrow function. Otherwise, the function executes immediately during render instead of on click.

```javascript
// ❌ WRONG - Executes immediately during render, returns undefined
<button @click="setCount(5)">Set to 5</button>
<button @click="remove(item.id)">Delete</button>

// ✅ CORRECT - Creates a function that executes on click
<button @click="() => setCount(5)">Set to 5</button>
<button @click="() => remove(item.id)">Delete</button>
```

#### Accessing Event Objects

The DOM event is automatically passed as the first argument to your handler:

```javascript
// Both syntaxes work - event is passed automatically
<button @click="handleClick">Click</button>
<button @click="(e) => handleClick(e)">Click</button>

// In your handler, the event is the first parameter
function handleClick(event) {
  console.log("Event type:", event.type);
  console.log("Target:", event.target);
}
```

Use arrow functions when you need to process the event inline:

```javascript
// Extract value from input
<input @input="(e) => setQuery(e.target.value)" />

// Prevent default behavior
<form @submit="(e) => { e.preventDefault(); save(); }">

// Conditional logic with event
<input @keydown="(e) => e.key === 'Enter' && submit()" />
```

#### Native DOM Events

Eleva uses **native DOM events** — there's no custom event system. The `@` syntax is simply shorthand for `addEventListener`. This means:

- **Any valid DOM event works** — if it works in vanilla JavaScript, it works in Eleva
- **Event objects are native** — you get the actual DOM event, not a wrapper
- **No learning curve** — use your existing JavaScript knowledge

```javascript
// All native DOM events work with @ syntax
<div @scroll="handleScroll">          // scroll event
<div @wheel="handleWheel">            // wheel event
<div @contextmenu="handleRightClick"> // right-click
<div @dragstart="handleDrag">         // drag and drop
<video @timeupdate="handleTime">      // media events
<div @animationend="handleAnimEnd">   // CSS animation events
<div @transitionend="handleTransEnd"> // CSS transition events
```

#### Common Events

| Category | Events |
|----------|--------|
| Mouse | `@click` `@dblclick` `@mouseenter` `@mouseleave` `@mousemove` `@mousedown` `@mouseup` `@contextmenu` |
| Form | `@input` `@change` `@focus` `@blur` `@submit` `@reset` `@invalid` |
| Keyboard | `@keydown` `@keyup` `@keypress` |
| Touch | `@touchstart` `@touchend` `@touchmove` `@touchcancel` |
| Drag | `@dragstart` `@dragend` `@dragover` `@drop` `@dragenter` `@dragleave` |
| Scroll | `@scroll` `@wheel` |
| Media | `@play` `@pause` `@ended` `@timeupdate` `@volumechange` |
| Animation | `@animationstart` `@animationend` `@transitionend` |
| Clipboard | `@copy` `@cut` `@paste` |
| Window* | `@resize` `@load` `@error` |

> *Window events require attaching to `window` via `onMount`. See [Lifecycle Hooks](#lifecycle-hooks).

### Passing Props with `:prop`

Props are evaluated against your component context (no `ctx.` needed):

```javascript
const Parent = {
  setup: ({ signal }) => ({
    user: signal({ name: "John", age: 30 }),
    items: ["a", "b", "c"]
  }),
  template: (ctx) => `
    <child-comp
      :user="user.value"
      :items="items"
      :count="10 + 5">
    </child-comp>
  `,
  children: { "child-comp": "ChildComponent" }
};
```

**Key benefit:** No need for `JSON.stringify` — objects and arrays are passed directly!

> **Props are static by design.** Values are evaluated once at mount time. For reactive updates, pass the signal itself (`:user="user"`) instead of its value (`:user="user.value"`). See [Components Guide](./components.md#props-behavior-static-vs-reactive) for details.

### Context Reference Rules

| Syntax | Uses `ctx.`? | Example |
|--------|:------------:|---------|
| `${...}` | Yes | `${ctx.count.value}` |
| `@event="..."` | No | `@click="increment"` |
| `:prop="..."` | No | `:user="userData.value"` |

**Why the difference?** JavaScript template literals (`${}`) are evaluated where `ctx` is the function parameter. TemplateEngine evaluates `@event` and `:prop` expressions with your context already unwrapped.

### Common Mistakes

```javascript
// WRONG: Using ctx. in event handlers
template: (ctx) => `<button @click="ctx.handleClick">Click</button>`

// CORRECT: No ctx. in event handlers
template: (ctx) => `<button @click="handleClick">Click</button>`
```

```javascript
// WRONG: Using ctx. in props
template: (ctx) => `<child :user="ctx.userData.value"></child>`

// CORRECT: No ctx. in props
template: (ctx) => `<child :user="userData.value"></child>`
```

```javascript
// WRONG: Missing ctx. in template literals
template: (ctx) => `<p>Count: ${count.value}</p>`

// CORRECT: Use ctx. in template literals
template: (ctx) => `<p>Count: ${ctx.count.value}</p>`
```

```javascript
// WRONG: Using .value attribute prefix (Lit-specific syntax)
template: (ctx) => `<input .value="${ctx.name.value}" />`

// CORRECT: Use standard HTML attributes
template: (ctx) => `<input value="${ctx.name.value}" />`
```

### Displaying Code Examples in Templates

When displaying code that contains `${...}` syntax within your templates (e.g., in a code playground or documentation), JavaScript template literals will evaluate those expressions. Use HTML entities to escape:

```javascript
// WRONG: Inner ${...} gets evaluated by template engine
template: (ctx) => `
  <pre><code>
    const x = signal(0);
    template: \`Count: ${x.value}\`  // This gets evaluated!
  </code></pre>
`

// CORRECT: Use &#36; HTML entity to escape the $
template: (ctx) => `
  <pre><code>
    const x = signal(0);
    template: \`Count: &#36;{x.value}\`  // Displays as ${x.value}
  </code></pre>
`
```

| Character | HTML Entity | Use Case |
|-----------|-------------|----------|
| `$` | `&#36;` | Escape `${...}` in code examples |
| `<` | `&lt;` | Escape HTML tags in code |
| `>` | `&gt;` | Escape HTML tags in code |

---

## Setup Context vs. Event Context

Understanding how data flows during component initialization and event handling is key.

### Setup Context

**When It's Used:** Passed to the component's `setup` function during initialization.

**What It Contains:** Utilities (like the `signal` function), component props, emitter, and lifecycle hooks.

```javascript
const MyComponent = {
  setup: ({ signal, emitter, props }) => {
    const counter = signal(0);
    return { counter };
  },
  template: (ctx) => `
    <div>
      <p>Counter: ${ctx.counter.value}</p>
    </div>
  `,
};
```

**Available context properties:**

| Property | Type | Description |
|----------|------|-------------|
| `signal` | Function | Create reactive state: `signal(initialValue)` |
| `emitter` | Object | Event bus: `emit()`, `on()`, `off()` |
| `props` | Object | Props passed from parent component |

### Event Context

**When It's Used:** Provided when an event handler is triggered.

**What It Contains:** The reactive state from `setup` along with event-specific data.

```javascript
const MyComponent = {
  setup: ({ signal }) => {
    const counter = signal(0);
    function increment(event) {
      console.log("Event type:", event.type);
      counter.value++;
    }
    return { counter, increment };
  },
  template: (ctx) => `
    <div>
      <p>Counter: ${ctx.counter.value}</p>
      <button @click="increment">Increment</button>
    </div>
  `,
};
```

---

## Emitter (Event Handling)

The **Emitter** enables inter-component communication through events using a publish-subscribe pattern.

### Basic Usage

```javascript
const emitter = new Emitter();

// Subscribe to event
emitter.on("greet", (name) => console.log(`Hello, ${name}!`));

// Emit event
emitter.emit("greet", "Alice");  // Logs: "Hello, Alice!"

// Unsubscribe
emitter.off("greet", handler);
```

### In Components

```javascript
// Child emits events
setup({ emitter }) {
  function handleClick(item) {
    emitter.emit("item:selected", item);
    emitter.emit("cart:add", { id: item.id, qty: 1 });
  }
  return { handleClick };
}

// Parent listens for events
setup({ emitter }) {
  emitter.on("item:selected", (item) => {
    console.log("Selected:", item);
  });
  return {};
}
```

**Key Features:**
- Synchronous event propagation
- Multiple handlers per event
- Automatic event cleanup
- Memory-efficient handler management

> **Error Handling:** If a handler throws synchronously, the error propagates immediately and remaining handlers are NOT called. Async handlers (returning Promises) are fire-and-forget — rejections won't stop other handlers but will result in unhandled Promise rejections. Wrap async handlers in try/catch for proper error handling.

---

## Renderer (DOM Diffing)

The **Renderer** efficiently updates the DOM through direct manipulation, avoiding the overhead of virtual DOM implementations.

### How It Works

```javascript
const renderer = new Renderer();

const container = document.getElementById("app");
const newHtml = "<div>Updated content</div>";

renderer.patchDOM(container, newHtml);
```

**Key Features:**
- Direct DOM manipulation for optimal performance
- Efficient attribute updates
- Smart node comparison and replacement
- Support for key-based reconciliation
- Handles text nodes and element nodes appropriately

> **Algorithm Complexity:** The diff algorithm uses a two-pointer approach. With `key` attributes, it achieves O(n) for common operations (append, prepend, remove). Without keys or with complex reorderings, worst case is O(n²). Always use `key` on list items for optimal performance.

---

## Eleva (Core)

The **Eleva** class orchestrates component registration, mounting, plugin integration, lifecycle management, and events.

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `new Eleva(name)` | Creates an app instance | `Eleva` |
| `use(plugin, options)` | Integrates a plugin | `Eleva` or plugin result |
| `component(name, definition)` | Registers a component | `Eleva` |
| `mount(container, compName, props)` | Mounts to DOM | `Promise<MountResult>` |

```javascript
const app = new Eleva("MyApp");

// Register component
app.component("Counter", {
  setup: ({ signal }) => ({ count: signal(0) }),
  template: (ctx) => `<div>${ctx.count.value}</div>`
});

// Mount component
const instance = await app.mount(document.getElementById("app"), "Counter");

// Unmount when done
await instance.unmount();
```

### MountResult

The `mount()` method returns a Promise that resolves to a `MountResult` object:

| Property | Type | Description |
|----------|------|-------------|
| `container` | `HTMLElement` | The DOM element where the component is mounted |
| `data` | `Object` | The component's reactive state and setup return values |
| `unmount` | `() => Promise<void>` | Function to clean up and remove the component |

### Unmounting Components

Call `instance.unmount()` to remove a mounted component. This triggers:

1. The `onUnmount` lifecycle hook (with `cleanup` object)
2. Automatic cleanup of signal watchers
3. Automatic cleanup of template event listeners
4. Recursive unmounting of child components
5. Clearing the container's innerHTML

```javascript
const app = new Eleva("MyApp");

app.component("DataFetcher", {
  setup: ({ signal }) => {
    const data = signal(null);
    let abortController = null;

    return {
      data,
      onMount: async () => {
        abortController = new AbortController();
        const res = await fetch("/api/data", { signal: abortController.signal });
        data.value = await res.json();
      },
      onUnmount: () => {
        // Cancel any pending requests
        abortController?.abort();
      }
    };
  },
  template: (ctx) => `<div>${ctx.data.value ? JSON.stringify(ctx.data.value) : 'Loading...'}</div>`
});

// Mount
const instance = await app.mount(document.getElementById("app"), "DataFetcher");

// Later, unmount (triggers onUnmount, cleans up watchers/listeners)
await instance.unmount();
```

> **Tip:** See the [Components documentation](./components.md#unmounting-components) for more details on managing multiple mounted instances.

### Orphaned Child Cleanup

When a parent component re-renders and its DOM patching removes a child component's host element, Eleva automatically detects and unmounts the orphaned child. This prevents memory leaks from stale signal watchers, event listeners, and component state.

**How It Works:**
1. After `patchDOM()`, Eleva checks if each child's container is still in the parent DOM
2. Orphaned children are unmounted synchronously (awaited)
3. New children mount after cleanup completes
4. Predictable sequence: old cleanup → new mount

**Behavior:**

| Aspect | Behavior | Implication |
|--------|----------|-------------|
| **Timing** | Sync (awaited) | `onUnmount` completes before new children mount |
| **Order** | Sequential | Old child cleans up, then new child mounts |
| **Performance** | O(n) check per re-render | Minor overhead with many children |
| **Predictability** | Deterministic | No race conditions with shared resources |

**Example Scenario:**
```javascript
// Parent conditionally renders ChildA or ChildB
template: (ctx) => `
  <div class="slot">
    ${ctx.showA.value ? '<div class="child-a"></div>' : '<div class="child-b"></div>'}
  </div>
`,
children: {
  ".child-a": "ChildA",
  ".child-b": "ChildB"
}

// When showA changes from true to false:
// 1. DOM patches: .child-a removed, .child-b added
// 2. ChildA.onUnmount() runs (sync, awaited)
// 3. ChildB mounts
```

> **Note:** Cleanup is synchronous—`onUnmount` completes before new children mount. This predictable ordering eliminates race conditions with shared resources (WebSockets, focus, etc.).

---

## Lifecycle Hooks

Eleva provides lifecycle hooks that allow you to execute code at specific stages of a component's lifecycle. Hooks are **returned from setup**, not destructured from context.

### Available Hooks

| Hook | When Called | Common Use Cases |
|------|-------------|------------------|
| `onBeforeMount` | Before component renders to DOM | Normalize props, prepare data |
| `onMount` | After component renders to DOM | Fetch data, set up subscriptions, DOM access |
| `onBeforeUpdate` | Before component re-renders | Compare old/new state, logging, analytics |
| `onUpdate` | After component re-renders | DOM measurements, third-party library sync |
| `onUnmount` | Before component is destroyed | Cleanup subscriptions, timers, listeners |

> **Hook Parameters:** All hooks receive `{ container, context }`. Only `onUnmount` receives an additional `cleanup` object: `{ container, context, cleanup }` where `cleanup` contains `{ watchers, listeners, children }` arrays.

> **Note:** `onUnmount` is called when: (1) `unmount()` is called explicitly, (2) the parent component unmounts, or (3) a parent re-render removes the child's host element from the DOM. For parent-driven removals, `onUnmount` is awaited synchronously after the DOM patch, ensuring the old component fully cleans up before the new one mounts.

### Execution Order

```
 Component Created
         │
         ▼
┌─────────────────┐
│ onBeforeMount   │  ← Props available, initial data ready
└────────┬────────┘
         │
   (DOM renders)
         │
         ▼
┌─────────────────┐
│ onMount         │  ← DOM available, fetch data, set up listeners
└────────┬────────┘
         │
(User interacts, state changes)
         │
         ▼
┌─────────────────┐
│ onBeforeUpdate  │  ← Before re-render
└────────┬────────┘
         │
   (DOM updates)
         │
         ▼
┌─────────────────┐
│ onUpdate        │  ← After re-render
└────────┬────────┘
         │
(Component removed)
         │
         ▼
┌─────────────────┐
│ onUnmount       │  ← Cleanup everything
└─────────────────┘
```

### Hook Patterns

**Sync and Async Support:** All hooks support both synchronous and asynchronous functions. Async hooks are awaited by the framework.

```javascript
// Sync hooks
setup: ({ signal }) => ({
  count: signal(0),
  onMount: () => console.log("Mounted!"),
  onUnmount: () => console.log("Unmounting!")
})

// Async hooks (awaited by framework)
setup: ({ signal }) => ({
  data: signal(null),
  onMount: async ({ context }) => {
    const res = await fetch("/api/data");
    context.data.value = await res.json();
  }
})
```

### onMount: The Most Common Hook

Use `onMount` for initialization that requires the DOM or async operations:

```javascript
setup: ({ signal }) => {
  const users = signal([]);
  const loading = signal(true);
  const error = signal(null);

  return {
    users,
    loading,
    error,
    onMount: async () => {
      try {
        const response = await fetch("/api/users");
        users.value = await response.json();
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    }
  };
}
```

**Common onMount use cases:**
- Fetching initial data from APIs
- Setting up event listeners (window, document)
- Initializing third-party libraries
- Starting timers or intervals
- Focusing input elements

### onUnmount: Essential for Cleanup

**Always clean up** what you set up in `onMount`:

```javascript
setup: ({ signal }) => {
  const windowWidth = signal(window.innerWidth);
  let intervalId = null;
  let resizeHandler = null;

  return {
    windowWidth,
    onMount: () => {
      // Set up resize listener
      resizeHandler = () => { windowWidth.value = window.innerWidth; };
      window.addEventListener("resize", resizeHandler);

      // Set up interval
      intervalId = setInterval(() => {
        console.log("Tick");
      }, 1000);
    },
    onUnmount: () => {
      // Clean up everything!
      window.removeEventListener("resize", resizeHandler);
      clearInterval(intervalId);
    }
  };
}
```

**What to clean up in onUnmount:**

| Resource | Cleanup Method | Auto-cleaned? |
|----------|----------------|:-------------:|
| Template event listeners (`@click`, etc.) | - | ✓ Yes |
| Signal watchers | - | ✓ Yes |
| Child components | - | ✓ Yes |
| Window/document event listeners | `removeEventListener()` | No |
| Timers | `clearTimeout()`, `clearInterval()` | No |
| Emitter subscriptions | Call unsubscribe function | No |
| WebSocket | `socket.close()` | No |
| AbortController | `controller.abort()` | No |
| Third-party libraries | Library-specific destroy method | No |

**Hook Parameters:** The `onUnmount` hook receives `{ container, context, cleanup }` where `cleanup` is an object containing `{ watchers, listeners, children }` arrays. This is useful for advanced scenarios where you need to inspect or manipulate the cleanup process.

```javascript
onUnmount: ({ container, context, cleanup }) => {
  // cleanup.watchers - Array of active signal watchers
  // cleanup.listeners - Array of registered event listeners
  // cleanup.children - Array of mounted child components

  console.log(`Cleaning up ${cleanup.watchers.length} watchers`);

  // Manual cleanup still needed for external resources
  window.removeEventListener("resize", resizeHandler);
  clearInterval(intervalId);
}
```

### Async Operations with Cleanup

Handle async operations properly with cleanup:

```javascript
setup: ({ signal }) => {
  const data = signal(null);
  const loading = signal(true);
  let abortController = null;

  return {
    data,
    loading,
    onMount: async () => {
      abortController = new AbortController();

      try {
        const response = await fetch("/api/data", {
          signal: abortController.signal
        });
        data.value = await response.json();
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch failed:", err);
        }
      } finally {
        loading.value = false;
      }
    },
    onUnmount: () => {
      if (abortController) {
        abortController.abort();
      }
    }
  };
}
```

---

## Summary

| Concept | Purpose | Key Points |
|---------|---------|------------|
| **Signals** | Reactive state | Use `.value` to read/write; changes trigger re-renders |
| **Templates** | HTML generation | Use `${}` with `ctx.`; `@events` and `:props` without |
| **Emitter** | Event communication | Publish-subscribe pattern for cross-component messaging |
| **Renderer** | DOM updates | Efficient diffing without virtual DOM overhead |
| **Lifecycle** | Hook into component life | Returned from setup, support sync/async |

---

## Next Steps

- **[Components](./components.md)** - Registration, children, props, styles
- **[Architecture](./architecture.md)** - Data flow diagrams
- **[Best Practices](./best-practices.md)** - Patterns and guidelines
- **[Examples](./examples/index.md)** - Real-world patterns

---

[← Glossary](./glossary.md) | [Back to Main Docs](./index.md) | [Components →](./components.md)
