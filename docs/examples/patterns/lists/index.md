---
title: List Operations - Basics, Events & Keys
description: Eleva.js list fundamentals - rendering dynamic lists, event binding, and key-based reconciliation for optimal performance.
---

<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-S4L689921Q"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", "G-S4L689921Q");
</script>

# List Operations - Basics

> **Version:** 1.1.1 | Learn how to render dynamic lists, bind events, and choose keys for optimal performance.

---

## Overview

This guide covers the fundamentals of list rendering in Eleva:

| Topic | Description |
|-------|-------------|
| **[Basic Dynamic List](#basic-dynamic-list)** | Complete working example with add/remove |
| **[Event Binding](#event-binding-for-lists)** | Click handlers and @event syntax |
| **[Choosing Keys](#choosing-keys-for-list-items)** | When to use IDs vs indexes |

**Advanced Topics:**
- **[Search & Filter](./search-filter.md)** - Searchable, filterable lists
- **[Patterns](./patterns.md)** - Drag-drop, CRUD, grouped lists
- **[Virtual Scrolling](./virtual-scrolling.md)** - 10K+ row performance

---

## Basic Dynamic List

This section covers the fundamentals of rendering a dynamic, clickable list in Eleva—from setup to mounting.

### Complete Example

Here's a complete, working example of a clickable list with add and remove functionality:

```javascript
import Eleva from "eleva";

// 1. Create the Eleva application instance
const app = new Eleva("MyApp");

// 2. Define the list component
app.component("TaskList", {
  setup({ signal }) {
    // Reactive state: array of items
    const tasks = signal([
      { id: 1, title: "Learn Eleva", done: false },
      { id: 2, title: "Build a project", done: false },
      { id: 3, title: "Deploy to production", done: true }
    ]);

    // Click handler: toggle task completion
    function toggleTask(id) {
      tasks.value = tasks.value.map(task =>
        task.id === id ? { ...task, done: !task.done } : task
      );
    }

    // Click handler: remove a task
    function removeTask(id) {
      tasks.value = tasks.value.filter(task => task.id !== id);
    }

    // Click handler: add a new task
    function addTask() {
      const title = prompt("Enter task title:");
      if (!title?.trim()) return;

      tasks.value = [...tasks.value, {
        id: Date.now(),  // Simple unique ID
        title: title.trim(),
        done: false
      }];
    }

    // Return state and handlers for use in template
    return { tasks, toggleTask, removeTask, addTask };
  },

  template: (ctx) => `
    <div class="task-list">
      <h2>My Tasks</h2>

      <!-- Add button -->
      <button class="add-btn" @click="addTask">+ Add Task</button>

      <!-- Handle empty list -->
      ${ctx.tasks.value.length === 0 ? `
        <p class="empty-message">No tasks yet. Click "Add Task" to create one.</p>
      ` : `
        <ul>
          ${ctx.tasks.value.map(task => `
            <li key="${task.id}" class="${task.done ? 'done' : ''}">
              <span @click="() => toggleTask(${task.id})">${task.title}</span>
              <button @click="() => removeTask(${task.id})">×</button>
            </li>
          `).join("")}
        </ul>
      `}

      <!-- Show count -->
      <p class="count">${ctx.tasks.value.filter(t => !t.done).length} tasks remaining</p>
    </div>
  `,

  style: `
    .task-list { max-width: 400px; font-family: system-ui; }
    .add-btn { margin-bottom: 16px; padding: 8px 16px; cursor: pointer; }
    .empty-message { color: #666; font-style: italic; }
    ul { list-style: none; padding: 0; }
    li { display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #eee; }
    li.done span { text-decoration: line-through; color: #999; }
    li span { cursor: pointer; flex: 1; }
    li button { background: none; border: none; color: #dc3545; font-size: 18px; cursor: pointer; }
    .count { color: #666; margin-top: 16px; }
  `
});

// 3. Mount the component to the DOM
app.mount(document.getElementById("app"), "TaskList");
```

**HTML:**

```html
<!DOCTYPE html>
<html>
<head>
  <title>Task List</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./main.js"></script>
</body>
</html>
```

### Key Concepts Explained

#### 1. Reactive Array State

Use `signal()` to create reactive state. The component re-renders when the signal's value changes:

```javascript
const tasks = signal([...]);  // Create reactive array

// To update, replace the array (don't mutate in place)
tasks.value = [...tasks.value, newTask];  // Add item
tasks.value = tasks.value.filter(t => t.id !== id);  // Remove item
tasks.value = tasks.value.map(t => t.id === id ? {...t, done: true} : t);  // Update item
```

#### 2. Event Handlers with @click

Eleva uses `@event` syntax to bind event handlers. There are two patterns:

| Pattern | Syntax | When to Use |
|---------|--------|-------------|
| Direct reference | `@click="addTask"` | Handler needs no arguments |
| Arrow function | `@click="() => removeTask(${id})"` | Handler needs arguments |

```javascript
// No arguments - reference the function directly
<button @click="addTask">Add</button>

// With arguments - wrap in arrow function
<button @click="() => removeTask(${task.id})">Remove</button>
<span @click="() => toggleTask(${task.id})">Toggle</span>
```

**Why arrow functions?** Without them, `removeTask(${task.id})` executes immediately during render, not on click.

#### 3. Key Attribute for List Items

Always add a `key` attribute with a unique, stable identifier:

```javascript
${tasks.map(task => `
  <li key="${task.id}">...</li>  <!-- Use task.id, not array index -->
`).join("")}
```

Keys help Eleva's renderer efficiently update only changed items instead of re-rendering the entire list.

#### 4. Handling Empty Lists

Always handle the empty state for better UX:

```javascript
${ctx.tasks.value.length === 0 ? `
  <p>No items found.</p>
` : `
  <ul>
    ${ctx.tasks.value.map(item => `...`).join("")}
  </ul>
`}
```

#### 5. Mounting to the DOM

Connect your component to an HTML element using `app.mount()`:

```javascript
// Mount to an element with id="app"
app.mount(document.getElementById("app"), "TaskList");

// Mount to any CSS selector
app.mount(document.querySelector(".container"), "TaskList");

// Mount with initial props
app.mount(document.getElementById("app"), "TaskList", { initialTasks: [...] });
```

### Common Patterns

#### Clickable List Item with Details

```javascript
setup({ signal }) {
  const items = signal([...]);
  const selectedId = signal(null);

  function selectItem(id) {
    selectedId.value = selectedId.value === id ? null : id;  // Toggle selection
  }

  return { items, selectedId, selectItem };
},

template: (ctx) => `
  <ul>
    ${ctx.items.value.map(item => `
      <li key="${item.id}"
          class="${ctx.selectedId.value === item.id ? 'selected' : ''}"
          @click="() => selectItem(${item.id})">
        <strong>${item.name}</strong>
        ${ctx.selectedId.value === item.id ? `
          <div class="details">
            <p>${item.description}</p>
            <p>Price: $${item.price}</p>
          </div>
        ` : ''}
      </li>
    `).join("")}
  </ul>
`
```

#### List with Inline Editing

```javascript
setup({ signal }) {
  const items = signal([...]);
  const editingId = signal(null);
  const editValue = signal("");

  function startEdit(item) {
    editingId.value = item.id;
    editValue.value = item.name;
  }

  function saveEdit(id) {
    if (!editValue.value.trim()) return;
    items.value = items.value.map(item =>
      item.id === id ? { ...item, name: editValue.value } : item
    );
    editingId.value = null;
  }

  return { items, editingId, editValue, startEdit, saveEdit };
},

template: (ctx) => `
  <ul>
    ${ctx.items.value.map(item => `
      <li key="${item.id}">
        ${ctx.editingId.value === item.id ? `
          <input
            type="text"
            value="${ctx.editValue.value}"
            @input="(e) => editValue.value = e.target.value"
            @keyup="(e) => e.key === 'Enter' && saveEdit(${item.id})"
          />
          <button @click="() => saveEdit(${item.id})">Save</button>
        ` : `
          <span @dblclick="() => startEdit(${JSON.stringify(item).replace(/"/g, '&quot;')})">${item.name}</span>
        `}
      </li>
    `).join("")}
  </ul>
`
```

#### Error Handling for Async Lists

```javascript
setup({ signal }) {
  const items = signal([]);
  const loading = signal(true);
  const error = signal(null);

  async function fetchItems() {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch("/api/items");
      if (!response.ok) throw new Error("Failed to fetch");
      items.value = await response.json();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  return {
    items, loading, error, fetchItems,
    onMount: fetchItems
  };
},

template: (ctx) => `
  <div>
    ${ctx.loading.value ? `
      <p>Loading...</p>
    ` : ctx.error.value ? `
      <p class="error">${ctx.error.value}</p>
      <button @click="fetchItems">Retry</button>
    ` : ctx.items.value.length === 0 ? `
      <p>No items found.</p>
    ` : `
      <ul>
        ${ctx.items.value.map(item => `
          <li key="${item.id}">${item.name}</li>
        `).join("")}
      </ul>
    `}
  </div>
`
```

---

## Event Binding for Lists

This section explains how to add click handlers and other events to list items in Eleva.

### The @click Syntax

Eleva uses `@event` syntax to bind event handlers in templates. For lists, you'll use `@click` to make items interactive:

```javascript
// Basic @click usage
<button @click="handleClick">Click Me</button>
```

### Two Patterns for Click Handlers

| Pattern | Syntax | When to Use | Example |
|---------|--------|-------------|---------|
| **Direct reference** | `@click="functionName"` | Handler needs **no arguments** | `@click="addItem"` |
| **Arrow function** | `@click="() => fn(arg)"` | Handler needs **arguments** | `@click="() => removeItem(${id})"` |

### Complete Example with Explanations

```javascript
import Eleva from "eleva";

const app = new Eleva("ClickDemo");

app.component("ClickableList", {
  setup({ signal }) {
    const items = signal([
      { id: 1, name: "Item One" },
      { id: 2, name: "Item Two" },
      { id: 3, name: "Item Three" }
    ]);
    const selectedId = signal(null);
    const message = signal("");

    // Handler WITHOUT parameters - reference directly
    function clearSelection() {
      selectedId.value = null;
      message.value = "Selection cleared";
    }

    // Handler WITH parameters - use arrow function in template
    function selectItem(id) {
      selectedId.value = id;
      const item = items.value.find(i => i.id === id);
      message.value = `Selected: ${item.name}`;
    }

    // Handler WITH parameters - use arrow function in template
    function removeItem(id) {
      items.value = items.value.filter(item => item.id !== id);
      if (selectedId.value === id) {
        selectedId.value = null;
      }
      message.value = `Removed item ${id}`;
    }

    return { items, selectedId, message, clearSelection, selectItem, removeItem };
  },

  template: (ctx) => `
    <div class="clickable-list">
      <!-- Direct reference: handler needs no arguments -->
      <button @click="clearSelection">Clear Selection</button>

      ${ctx.items.value.length === 0 ? `
        <p>No items. List is empty.</p>
      ` : `
        <ul>
          ${ctx.items.value.map(item => `
            <li key="${item.id}" class="${ctx.selectedId.value === item.id ? 'selected' : ''}">

              <!-- Arrow function: handler needs the item's id -->
              <span @click="() => selectItem(${item.id})">${item.name}</span>

              <!-- Arrow function: handler needs the item's id -->
              <button @click="() => removeItem(${item.id})">Remove</button>

            </li>
          `).join("")}
        </ul>
      `}

      ${ctx.message.value ? `<p class="message">${ctx.message.value}</p>` : ""}
    </div>
  `,

  style: `
    .clickable-list ul { list-style: none; padding: 0; }
    .clickable-list li { display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #eee; }
    .clickable-list li.selected { background: #e3f2fd; }
    .clickable-list li span { cursor: pointer; flex: 1; }
    .clickable-list li span:hover { text-decoration: underline; }
    .clickable-list button { margin-left: 8px; cursor: pointer; }
    .message { color: #666; font-style: italic; }
  `
});

// Mount component to DOM
app.mount(document.getElementById("app"), "ClickableList");
```

### Why Arrow Functions for Parameterized Handlers?

Without arrow functions, the function **executes immediately** during template rendering:

```javascript
// WRONG - Executes immediately when template renders (not on click!)
<button @click="removeItem(${item.id})">Remove</button>

// CORRECT - Creates a function that executes when clicked
<button @click="() => removeItem(${item.id})">Remove</button>
```

### Other Event Types for Lists

| Event | Syntax | Use Case |
|-------|--------|----------|
| **Click** | `@click="handler"` | Select, toggle, or trigger action |
| **Double-click** | `@dblclick="handler"` | Edit mode, expand details |
| **Mouse enter/leave** | `@mouseenter`, `@mouseleave` | Hover effects, tooltips |
| **Keyboard** | `@keyup="handler"` | Keyboard navigation, shortcuts |

```javascript
// Double-click to edit
<span @dblclick="() => startEdit(${item.id})">${item.name}</span>

// Keyboard handler (e.g., Enter to save)
<input @keyup="(e) => e.key === 'Enter' && saveItem(${item.id})" />

// Hover to show actions
<li @mouseenter="() => showActions(${item.id})"
    @mouseleave="hideActions">
  ${item.name}
</li>
```

### Mounting to the DOM

Connect your component to an HTML element:

```javascript
// Method 1: Mount by registered component name
app.mount(document.getElementById("app"), "ClickableList");

// Method 2: Mount with props
app.mount(document.getElementById("app"), "ClickableList", {
  initialItems: [{ id: 1, name: "Preset item" }]
});

// Method 3: Mount with inline component definition (no prior registration)
app.mount(document.getElementById("app"), {
  setup({ signal }) {
    const items = signal([]);
    return { items };
  },
  template: (ctx) => `<ul>${ctx.items.value.map(i => `<li>${i}</li>`).join("")}</ul>`
});
```

```html
<!-- Your HTML file -->
<!DOCTYPE html>
<html>
<head>
  <title>Clickable List</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./main.js"></script>
</body>
</html>
```

---

## Choosing Keys for List Items

When rendering lists, the `key` attribute helps Eleva's renderer efficiently update the DOM. Choosing the right key strategy is important for performance and correctness.

### Use `object.id` (stable unique identifier) when:

- Items can be **reordered, sorted, or filtered**
- Items can be **added or removed from the middle** of the list
- Items have a **natural unique identifier** (database ID, UUID, etc.)
- You need to **preserve component state** across re-renders

```javascript
// Good: items with stable IDs
${ctx.tasks.value.map(task => `
  <li key="${task.id}">${task.title}</li>
`).join('')}
```

### Use `index` when:

- The list is **static and never reorders**
- Items are **only appended** to the end (never inserted in middle)
- Items are **simple primitives** without unique identifiers
- The list is **derived/computed** and doesn't persist

```javascript
// Acceptable: static list of simple strings
${ctx.colors.map((color, index) => `
  <span key="${index}">${color}</span>
`).join('')}
```

### Why it matters

With index-based keys, if you insert an item at position 0, every item shifts and gets a new key. The renderer thinks all items changed, causing unnecessary DOM updates and potentially losing input focus or component state.

With stable IDs, the renderer correctly identifies which items moved, were added, or removed—performing minimal DOM operations.

**Rule of thumb:** If items have an `id`, always use it. Only fall back to `index` for truly static, append-only lists.

---

## Next Steps

- **[Search & Filter](./search-filter.md)** - Build searchable, filterable lists
- **[Patterns](./patterns.md)** - Drag-drop, CRUD, grouped lists
- **[Virtual Scrolling](./virtual-scrolling.md)** - Handle 10K+ rows efficiently

---

[← Back to Patterns](../index.md) | [Search & Filter →](./search-filter.md)
