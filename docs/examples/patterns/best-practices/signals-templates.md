---
title: Signals, Templates & Communication
description: Eleva.js best practices for signal reactivity, template syntax, children composition, and component communication.
---

<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-S4L689921Q"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", "G-S4L689921Q");
</script>

# Signals, Templates & Communication

> **Best Practices** | Signal usage, template syntax, and component communication.

---

## Signal Reactivity

### When to Use Signals

| Data Type | Use Signal? | Why |
|-----------|-------------|-----|
| UI state (counts, toggles, form values) | Yes | Triggers re-render on change |
| Data from API | Yes | UI updates when data loads |
| Derived/computed values | No | Use functions instead |
| Constants | No | Never changes |
| Internal helpers (caches, refs) | No | Not displayed in UI |

```javascript
setup: ({ signal }) => {
  // Use signals for reactive UI state
  const count = signal(0);
  const items = signal([]);

  // Don't use signals for constants
  const API_URL = "/api/users";  // Regular variable

  // Don't use signals for computed values
  const getItemCount = () => items.value.length;  // Function

  return { count, items, getItemCount };
}
```

### Accessing Signal Values

Always use `.value` to read or write:

```javascript
// Correct: Access with .value
template: (ctx) => `
  <p>Count: ${ctx.count.value}</p>
  <p>Items: ${ctx.items.value.length}</p>
`

// Wrong: Forgetting .value
template: (ctx) => `
  <p>Count: ${ctx.count}</p>        <!-- Shows [object Signal] -->
`
```

### Updating Signals

```javascript
setup: ({ signal }) => {
  const count = signal(0);
  const user = signal({ name: "John", age: 25 });
  const items = signal(["a", "b", "c"]);

  // Primitives - direct assignment
  function increment() {
    count.value++;
  }

  // Objects - replace entire object for reactivity
  function updateUser(name) {
    user.value = { ...user.value, name };
  }

  // Arrays - replace with new array
  function addItem(item) {
    items.value = [...items.value, item];
  }

  function removeItem(index) {
    items.value = items.value.filter((_, i) => i !== index);
  }

  return { count, user, items, increment, updateUser, addItem, removeItem };
}
```

### Signal Anti-Patterns

> **Why Mutations Don't Work:** Signals use identity comparison (`===`). When you call `.push()` or modify a property, the reference stays the same, so Eleva sees no change. You must assign a **new** array/object to trigger reactivity.

```javascript
// DON'T: Mutate arrays/objects in place (same reference = no update!)
items.value.push(newItem);      // Won't trigger update!
items.value.splice(0, 1);       // Won't trigger update!
items.value[0] = "new";         // Won't trigger update!
user.value.name = "Jane";       // Won't trigger update!

// DO: Replace with new reference (new reference = triggers update!)
items.value = [...items.value, newItem];           // Add item
items.value = items.value.slice(1);                // Remove first
items.value = items.value.filter((_, i) => i !== 0); // Remove by index
items.value = items.value.map((v, i) => i === 0 ? "new" : v); // Update item
user.value = { ...user.value, name: "Jane" };      // Update property

// DON'T: Forget .value in template
`${ctx.count}`  // Wrong - shows [object Signal]

// DO: Always use .value
`${ctx.count.value}`  // Correct - shows the actual value
```

---

## Templates

### Template as Function vs String

| Type | Use When | `${...}` Access |
|------|----------|-----------------|
| Function | Need reactive `ctx` values | `ctx` (signals, props) - evaluated each render |
| Template literal | Static or outer scope values | Outer scope variables - evaluated once at definition |
| Normal string | No interpolation | N/A |

> **Tip:** Use a function template when you need `${ctx...}` to access signals, props, or computed values that update on re-render.
> **Tip:** Use a string template (with or without `${...}`) when you don't need `ctx`; `@event` and `:prop` bindings still work.

```javascript
// Function - access ctx (signals, props) - re-evaluated on each render
template: (ctx) => `<div>Count: ${ctx.count.value}</div>`

// Template literal with ${...} - access outer scope - evaluated ONCE at definition
const version = "1.0.0";
template: `<footer>Version ${version}</footer>`

// Template literal - multi-line HTML, @event and :prop still work
template: `
  <div class="card">
    <button @click="increment">Add</button>
    <child-component :items="items" />
  </div>
`

// Normal string - single-line HTML
template: "<button @click=\"increment\">Add</button>"
```

### Style as Function vs String

The same rules apply to `style` as to `template`:

| Type | Use When | `${...}` Access |
|------|----------|-----------------|
| Function | Need reactive `ctx` values | `ctx` (signals, props) - evaluated each render |
| Template literal | Static or outer scope values | Outer scope variables - evaluated once at definition |
| Normal string | No interpolation | N/A |

> **Note:** Unlike `template`, `style` functions must be synchronous (not async).

```javascript
// Function - access ctx for dynamic styles - re-evaluated on each render
style: (ctx) => `.card { background: ${ctx.theme.value === 'dark' ? '#333' : '#fff'}; }`

// Template literal with ${...} - access outer scope - evaluated ONCE at definition
const primaryColor = "#007bff";
style: `.btn { background: ${primaryColor}; }`

// Template literal - multi-line CSS
style: `
  .card { padding: 1rem; }
  .btn { cursor: pointer; }
`

// Normal string - simple CSS
style: ".card { padding: 1rem; }"
```

### Event Handlers

```javascript
// Named functions - preferred for complex logic
setup: ({ signal }) => {
  const count = signal(0);
  function handleClick() {
    console.log("Clicked!");
    count.value++;
  }
  return { count, handleClick };
},
template: (ctx) => `
  <button @click="handleClick">${ctx.count.value}</button>
`

// Inline - for simple one-liners (must be arrow function)
template: (ctx) => `
  <button @click="() => count.value++">${ctx.count.value}</button>
`
```

### Parameterized Event Handlers

When passing arguments to event handlers, wrap the call in an arrow function:

```javascript
setup: ({ signal }) => {
  const items = signal([{ id: 1, name: "Item 1" }, { id: 2, name: "Item 2" }]);

  const selectItem = (id) => {
    console.log("Selected:", id);
  };

  const removeItem = (id) => {
    items.value = items.value.filter(item => item.id !== id);
  };

  return { items, selectItem, removeItem };
},
template: (ctx) => `
  <ul>
    ${ctx.items.value.map(item => `
      <li key="${item.id}">
        <span @click="() => selectItem(${item.id})">${item.name}</span>
        <button @click="() => removeItem(${item.id})">×</button>
      </li>
    `).join("")}
  </ul>
`
```

**Why arrow functions?**

| Syntax | Behavior | Result |
|--------|----------|--------|
| `@click="handleClick"` | References function directly | Works |
| `@click="removeItem(5)"` | Executes immediately during render | Broken |
| `@click="() => removeItem(5)"` | Creates function that calls on click | Works |

The arrow function defers execution until the actual click event occurs.

### Template Anti-Patterns

```javascript
// DON'T: Use ctx. in event handlers or props
`<button @click="ctx.handleClick">`  // Wrong
`:user="ctx.user"`                   // Wrong

// DO: Reference values directly (no ctx. prefix)
`<button @click="handleClick">`     // Correct
`:user="user"`                      // Correct

// DON'T: Missing ctx. in template literals (${})
`<p>${count.value}</p>`  // Wrong - count is undefined

// DO: Include ctx. in template literal interpolation
`<p>${ctx.count.value}</p>`  // Correct

// RULE: ${} needs ctx., @events and :props don't
```

---

## Children & Composition

### When to Use Children

| Scenario | Use Children? |
|----------|---------------|
| Component has sub-components | Yes |
| Building layouts with slots | Yes |
| List items need their own component | Yes |
| Simple, self-contained component | No |

### Selector Patterns for Children

| Selector Type | Example | Use Case |
|---------------|---------|----------|
| **Class** | `".item"` | Multiple elements, list items |
| **ID** | `"#sidebar"` | Single unique element |
| **Data attribute** | `"[data-component]"` | Explicit component markers |
| **Component name** | `"UserCard"` | Direct component mounting |

```javascript
// Class selector - for lists/multiple instances
children: {
  ".user-card": "UserCard",
  ".comment": "Comment"
}

// ID selector - for unique elements
children: {
  "#header": "Header",
  "#footer": "Footer"
}

// Data attribute - explicit and clear
children: {
  "[data-component='sidebar']": "Sidebar"
}
```

### Passing Props to Children

```html
<div class="user-card" :user="user" :editable="true"></div>
```

```javascript
children: {
  ".user-card": "UserCard"  // UserCard receives { user, editable }
}
```

### Children Anti-Patterns

```javascript
// DON'T: Overly generic selectors
children: {
  "div": "SomeComponent"  // Too broad
}

// DON'T: Deep nesting without reason
children: {
  ".level1": {
    ".level2": {
      ".level3": "DeepComponent"  // Hard to maintain
    }
  }
}

// DO: Use specific selectors
children: {
  ".product-card": "ProductCard",
  "#featured-product": "FeaturedProduct"
}
```

---

## Communication Patterns

### Props (Parent to Child)

```javascript
// Parent
template: (ctx) => `
  <div class="child" :message="Hello" :count="count.value"></div>
`,
children: { ".child": "Child" }

// Child
setup: ({ props }) => {
  console.log(props.message);  // "Hello"
  return { message: props.message };
}
```

### Emitter (Child to Parent / Siblings)

```javascript
// Child - emit event
setup: ({ emitter }) => {
  function handleClick() {
    emitter.emit("item:selected", { id: 123 });
  }
  return { handleClick };
}

// Parent - listen for event
setup: ({ emitter }) => {
  emitter.on("item:selected", (data) => {
    console.log("Selected:", data.id);
  });
  return {};
}
```

### Communication Decision Guide

| Scenario | Solution |
|----------|----------|
| Parent to child | Props |
| Child to parent | Emitter |
| Sibling communication | Emitter or Store |
| Global state | Store |
| Multiple components share state | Store |

---

## Next Steps

- **[Performance](./performance.md)** - Optimization techniques for render-heavy apps

---

[← Setup & Lifecycle](./setup-lifecycle.md) | [Performance →](./performance.md)
