---
title: Signals, Templates & Communication
description: Eleva.js best practices for signal reactivity, template syntax, children composition, and component communication.
---

# Signals, Templates & Communication

> **Version:** 1.0.1 | Signal usage, template syntax, and component communication patterns.

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

| Type | Use When | Example |
|------|----------|---------|
| Function (ctx) | Component has state or props | `(ctx) => \`<p>${ctx.name.value}</p>\`` |
| String | Purely static content | `"<p>Hello World</p>"` |

```javascript
// Function - most common, recommended
template: (ctx) => `<div>${ctx.count.value}</div>`

// String - static only
template: "<header><h1>Site Title</h1></header>"
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

// Inline - for simple one-liners
template: (ctx) => `
  <button @click="count.value++">${ctx.count.value}</button>
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
