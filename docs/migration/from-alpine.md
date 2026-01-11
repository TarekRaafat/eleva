# Migrating from Alpine.js

> **Version:** 1.0.0-rc.14 | A guide for Alpine.js developers transitioning to Eleva

This guide helps Alpine.js developers understand Eleva by mapping familiar Alpine concepts to their Eleva equivalents. Both frameworks share a similar philosophy—lightweight, no build step, progressive enhancement—but take different approaches: Alpine is HTML-first with directives, while Eleva is JS-first with template functions.

---

## TL;DR - Quick Reference

| Alpine.js | Eleva | Notes |
|-----------|-------|-------|
| `x-data="{ count: 0 }"` | `setup({ signal })` | Component state |
| `x-text="message"` | `${ctx.message.value}` | Text interpolation |
| `x-html="content"` | `${ctx.content.value}` | HTML content |
| `x-show="isVisible"` | `style="display: ${...}"` | Toggle visibility |
| `x-if="condition"` | `${cond ? '...' : ''}` | Conditional render |
| `x-for="item in items"` | `${items.map(...).join('')}` | List rendering |
| `x-on:click="handler"` | `@click="handler"` | Event handling |
| `x-model="value"` | `value` + `@input` | Two-way binding |
| `x-bind:class="..."` | `class="${...}"` | Attribute binding |
| `x-init="..."` | Code in `setup()` | Initialization |
| `$watch('prop', fn)` | `signal.watch(fn)` | Watch changes |
| `$store` | Store plugin | Global state |

---

## Philosophy Comparison

### Alpine: HTML-First (Declarative)
```html
<!-- Logic lives in HTML attributes -->
<div x-data="{ open: false }">
  <button @click="open = !open">Toggle</button>
  <div x-show="open">Content</div>
</div>
```

### Eleva: JS-First (Programmatic)
```javascript
// Logic lives in JavaScript, HTML is generated
const Toggle = {
  setup({ signal }) {
    const open = signal(false);
    return { open, toggle: () => open.value = !open.value };
  },
  template: (ctx) => `
    <div>
      <button @click="toggle">Toggle</button>
      ${ctx.open.value ? '<div>Content</div>' : ''}
    </div>
  `
};
```

**Neither approach is "better"—they serve different preferences:**
- Choose Alpine if you prefer sprinkling behavior onto existing HTML
- Choose Eleva if you prefer components as JavaScript objects with full IDE support

---

## Core Concepts

### State: x-data → setup + signal

**Alpine:**
```html
<div x-data="{ count: 0, name: 'John' }">
  <p x-text="count"></p>
  <p x-text="name"></p>
  <button @click="count++">Increment</button>
</div>
```

**Eleva:**
```javascript
const Counter = {
  setup({ signal }) {
    const count = signal(0);
    const name = signal('John');

    const increment = () => count.value++;

    return { count, name, increment };
  },
  template: (ctx) => `
    <div>
      <p>${ctx.count.value}</p>
      <p>${ctx.name.value}</p>
      <button @click="increment">Increment</button>
    </div>
  `
};
```

**Key differences:**
- Alpine: State declared inline in HTML
- Eleva: State created with `signal()` in `setup()`
- Eleva: Must return values to use in template
- Eleva: Access via `.value` property

---

### Text & HTML: x-text/x-html → Template Interpolation

**Alpine:**
```html
<div x-data="{ message: 'Hello', html: '<strong>Bold</strong>' }">
  <span x-text="message"></span>
  <span x-html="html"></span>
  <p x-text="`Count is ${count}`"></p>
</div>
```

**Eleva:**
```javascript
template: (ctx) => `
  <div>
    <span>${ctx.message.value}</span>
    <span>${ctx.html.value}</span>
    <p>Count is ${ctx.count.value}</p>
  </div>
`
```

**Key differences:**
- Alpine uses directives to inject content
- Eleva uses JavaScript template literals directly
- Both support dynamic expressions

---

### Visibility: x-show → Inline Style

**Alpine:**
```html
<div x-data="{ open: false }">
  <button @click="open = !open">Toggle</button>
  <div x-show="open">Visible when open</div>
  <div x-show="open" x-transition>With transition</div>
</div>
```

**Eleva:**
```javascript
const Toggle = {
  setup({ signal }) {
    const open = signal(false);
    return { open, toggle: () => open.value = !open.value };
  },
  template: (ctx) => `
    <div>
      <button @click="toggle">Toggle</button>
      <div style="${ctx.open.value ? '' : 'display: none;'}">
        Visible when open
      </div>
      <div
        style="${ctx.open.value ? '' : 'display: none;'}"
        class="${ctx.open.value ? 'fade-in' : 'fade-out'}"
      >
        With transition (use CSS classes)
      </div>
    </div>
  `
};
```

**Key differences:**
- Alpine's `x-show` handles display toggling automatically
- Eleva requires manual style manipulation
- For transitions, use CSS classes in Eleva

---

### Conditional Rendering: x-if → Ternary Expressions

**Alpine:**
```html
<div x-data="{ loggedIn: false, role: 'admin' }">
  <template x-if="loggedIn">
    <div>Welcome back!</div>
  </template>

  <template x-if="role === 'admin'">
    <div>Admin panel</div>
  </template>
  <template x-if="role === 'user'">
    <div>User dashboard</div>
  </template>
</div>
```

**Eleva:**
```javascript
const Dashboard = {
  setup({ signal }) {
    const loggedIn = signal(false);
    const role = signal('admin');
    return { loggedIn, role };
  },
  template: (ctx) => `
    <div>
      ${ctx.loggedIn.value ? `
        <div>Welcome back!</div>
      ` : ''}

      ${ctx.role.value === 'admin' ? `
        <div>Admin panel</div>
      ` : ctx.role.value === 'user' ? `
        <div>User dashboard</div>
      ` : ''}
    </div>
  `
};
```

**Key differences:**
- Alpine uses `<template x-if>` for conditional blocks
- Eleva uses JavaScript ternary operators
- Alpine's `x-if` removes/adds DOM elements; Eleva re-renders

---

### List Rendering: x-for → Array.map()

**Alpine:**
```html
<div x-data="{ items: [
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Banana' }
]}">
  <ul>
    <template x-for="item in items" :key="item.id">
      <li x-text="item.name"></li>
    </template>
  </ul>
</div>
```

**Eleva:**
```javascript
const ItemList = {
  setup({ signal }) {
    const items = signal([
      { id: 1, name: 'Apple' },
      { id: 2, name: 'Banana' }
    ]);
    return { items };
  },
  template: (ctx) => `
    <div>
      <ul>
        ${ctx.items.value.map(item => `
          <li key="${item.id}">${item.name}</li>
        `).join('')}
      </ul>
    </div>
  `
};
```

**Key differences:**
- Alpine uses `x-for` directive with `<template>` wrapper
- Eleva uses standard JavaScript `.map().join('')`
- Both support `:key` for efficient updates
- Eleva requires explicit `.join('')` to convert array to string

---

### Event Handling: x-on/@click → @event

**Alpine:**
```html
<div x-data="{ count: 0 }">
  <!-- Full syntax -->
  <button x-on:click="count++">+</button>

  <!-- Shorthand -->
  <button @click="count++">+</button>

  <!-- With modifiers -->
  <form @submit.prevent="handleSubmit">
  <button @click.stop="doSomething">Click</button>
  <input @keydown.enter="submit" />
  <div @click.outside="close">Dropdown</div>
</div>
```

**Eleva:**
```javascript
const Events = {
  setup({ signal }) {
    const count = signal(0);

    const handleSubmit = (e) => {
      e.preventDefault();
      // submit logic
    };

    const doSomething = (e) => {
      e.stopPropagation();
      // logic
    };

    const submit = () => { /* submit */ };

    return { count, handleSubmit, doSomething, submit };
  },
  template: (ctx) => `
    <div>
      <button @click="() => count.value++">+</button>
      <button @click="() => count.value++">+</button>

      <form @submit="handleSubmit">
      <button @click="doSomething">Click</button>
      <input @keydown="(e) => e.key === 'Enter' && submit()" />
      <!-- For click.outside, implement custom logic -->
    </div>
  `
};
```

**Key differences:**
- Same `@event` shorthand syntax
- Alpine has built-in modifiers (`.prevent`, `.stop`, `.outside`)
- Eleva requires handling modifiers in JavaScript
- Eleva event handlers are more explicit

---

### Two-Way Binding: x-model → value + @input

**Alpine:**
```html
<div x-data="{ text: '', checked: false, selected: 'a' }">
  <input type="text" x-model="text" />
  <input type="checkbox" x-model="checked" />
  <select x-model="selected">
    <option value="a">A</option>
    <option value="b">B</option>
  </select>

  <!-- With modifiers -->
  <input x-model.number="count" />
  <input x-model.debounce.500ms="search" />
</div>
```

**Eleva:**
```javascript
const Form = {
  setup({ signal }) {
    const text = signal('');
    const checked = signal(false);
    const selected = signal('a');
    const count = signal(0);
    const search = signal('');

    // Debounce helper
    let timeout;
    const debouncedSearch = (value) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => search.value = value, 500);
    };

    return { text, checked, selected, count, search, debouncedSearch };
  },
  template: (ctx) => `
    <div>
      <input
        type="text"
        value="${ctx.text.value}"
        @input="(e) => text.value = e.target.value"
      />
      <input
        type="checkbox"
        ${ctx.checked.value ? 'checked' : ''}
        @change="(e) => checked.value = e.target.checked"
      />
      <select @change="(e) => selected.value = e.target.value">
        <option value="a" ${ctx.selected.value === 'a' ? 'selected' : ''}>A</option>
        <option value="b" ${ctx.selected.value === 'b' ? 'selected' : ''}>B</option>
      </select>

      <input
        type="number"
        value="${ctx.count.value}"
        @input="(e) => count.value = Number(e.target.value)"
      />
      <input
        value="${ctx.search.value}"
        @input="(e) => debouncedSearch(e.target.value)"
      />
    </div>
  `
};
```

**Key differences:**
- Alpine's `x-model` handles two-way binding automatically
- Eleva requires explicit value + event handler
- Alpine has built-in modifiers; Eleva implements manually
- Eleva is more verbose but more explicit

---

### Attribute Binding: x-bind → Template Interpolation

**Alpine:**
```html
<div x-data="{ imageUrl: '/img.jpg', isActive: true }">
  <img x-bind:src="imageUrl" />
  <img :src="imageUrl" />

  <div :class="{ active: isActive, 'text-red': hasError }"></div>
  <div :class="isActive ? 'active' : 'inactive'"></div>

  <div :style="{ color: textColor, fontSize: size + 'px' }"></div>
</div>
```

**Eleva:**
```javascript
template: (ctx) => `
  <div>
    <img src="${ctx.imageUrl.value}" />
    <img src="${ctx.imageUrl.value}" />

    <div class="${ctx.isActive.value ? 'active' : ''} ${ctx.hasError.value ? 'text-red' : ''}"></div>
    <div class="${ctx.isActive.value ? 'active' : 'inactive'}"></div>

    <div style="color: ${ctx.textColor.value}; font-size: ${ctx.size.value}px;"></div>
  </div>
`
```

**Key differences:**
- Alpine uses `:attr` shorthand for `x-bind:attr`
- Eleva uses standard template literal interpolation
- Alpine accepts objects for class/style; Eleva uses strings

---

### Initialization: x-init → setup()

**Alpine:**
```html
<div
  x-data="{ users: [] }"
  x-init="users = await (await fetch('/api/users')).json()"
>
  <template x-for="user in users" :key="user.id">
    <div x-text="user.name"></div>
  </template>
</div>
```

**Eleva:**
```javascript
const UserList = {
  setup({ signal }) {
    const users = signal([]);

    // Runs on mount (like x-init)
    fetch('/api/users')
      .then(res => res.json())
      .then(data => users.value = data);

    return { users };
  },
  template: (ctx) => `
    <div>
      ${ctx.users.value.map(user => `
        <div key="${user.id}">${user.name}</div>
      `).join('')}
    </div>
  `
};
```

---

### Watching Changes: $watch → signal.watch()

**Alpine:**
```html
<div
  x-data="{ query: '', results: [] }"
  x-init="$watch('query', async (value) => {
    if (value.length > 2) {
      results = await search(value);
    }
  })"
>
  <input x-model="query" />
</div>
```

**Eleva:**
```javascript
const Search = {
  setup({ signal }) {
    const query = signal('');
    const results = signal([]);

    query.watch(async (value) => {
      if (value.length > 2) {
        results.value = await search(value);
      }
    });

    return { query, results };
  },
  template: (ctx) => `
    <div>
      <input
        value="${ctx.query.value}"
        @input="(e) => query.value = e.target.value"
      />
    </div>
  `
};
```

---

### Global State: Alpine.store → Eleva Store

**Alpine:**
```javascript
// Define store
Alpine.store('user', {
  name: 'John',
  loggedIn: false,

  login() {
    this.loggedIn = true;
  }
});
```

```html
<!-- Use in component -->
<div x-data>
  <span x-text="$store.user.name"></span>
  <button @click="$store.user.login()">Login</button>
</div>
```

**Eleva:**
```javascript
import Eleva from "eleva";
import { Store } from "eleva/plugins";

const app = new Eleva("App");

app.use(Store, {
  state: {
    user: {
      name: 'John',
      loggedIn: false
    }
  },
  actions: {
    login: (state) => {
      state.user.value = { ...state.user.value, loggedIn: true };
    }
  }
});

// In component
const UserStatus = {
  setup({ store }) {
    return {
      user: store.state.user,
      login: () => store.dispatch('login')
    };
  },
  template: (ctx) => `
    <div>
      <span>${ctx.user.value.name}</span>
      <button @click="login">Login</button>
    </div>
  `
};
```

---

### Magic Properties Comparison

| Alpine Magic | Eleva Equivalent |
|--------------|-----------------|
| `$el` | Access via `setup()` or DOM queries |
| `$refs` | Use `id` or `class` selectors |
| `$store` | `store` from `setup({ store })` |
| `$watch` | `signal.watch()` |
| `$dispatch` | Custom event emitter or props |
| `$nextTick` | `queueMicrotask()` |
| `$root` | Parent component reference |
| `$data` | `ctx` in template |
| `$id` | Generate IDs manually |

---

## Component Patterns

### Alpine Component

```html
<div x-data="dropdown">
  <button @click="toggle">Menu</button>
  <div x-show="open" @click.outside="close">
    <a href="#">Item 1</a>
    <a href="#">Item 2</a>
  </div>
</div>

<script>
document.addEventListener('alpine:init', () => {
  Alpine.data('dropdown', () => ({
    open: false,
    toggle() { this.open = !this.open; },
    close() { this.open = false; }
  }));
});
</script>
```

### Eleva Component

```javascript
app.component("Dropdown", {
  setup({ signal }) {
    const open = signal(false);

    const toggle = () => open.value = !open.value;
    const close = () => open.value = false;

    // Handle click outside
    const handleClickOutside = (e) => {
      if (open.value && !e.target.closest('.dropdown')) {
        close();
      }
    };

    document.addEventListener('click', handleClickOutside);

    return {
      open,
      toggle,
      close,
      onUnmount: () => document.removeEventListener('click', handleClickOutside)
    };
  },
  template: (ctx) => `
    <div class="dropdown">
      <button @click="toggle">Menu</button>
      ${ctx.open.value ? `
        <div class="dropdown-menu">
          <a href="#">Item 1</a>
          <a href="#">Item 2</a>
        </div>
      ` : ''}
    </div>
  `
});
```

---

## Complete Example: Todo App

### Alpine Version

```html
<div x-data="{
  todos: [],
  newTodo: '',
  addTodo() {
    if (!this.newTodo.trim()) return;
    this.todos.push({
      id: Date.now(),
      text: this.newTodo,
      done: false
    });
    this.newTodo = '';
  },
  removeTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
  }
}">
  <form @submit.prevent="addTodo">
    <input x-model="newTodo" placeholder="Add todo..." />
    <button type="submit">Add</button>
  </form>

  <ul>
    <template x-for="todo in todos" :key="todo.id">
      <li>
        <input type="checkbox" x-model="todo.done" />
        <span :class="{ 'line-through': todo.done }" x-text="todo.text"></span>
        <button @click="removeTodo(todo.id)">×</button>
      </li>
    </template>
  </ul>
</div>
```

### Eleva Version

```javascript
app.component("TodoApp", {
  setup({ signal }) {
    const todos = signal([]);
    const newTodo = signal('');

    const addTodo = () => {
      if (!newTodo.value.trim()) return;
      todos.value = [...todos.value, {
        id: Date.now(),
        text: newTodo.value,
        done: false
      }];
      newTodo.value = '';
    };

    const toggleTodo = (id) => {
      todos.value = todos.value.map(t =>
        t.id === id ? { ...t, done: !t.done } : t
      );
    };

    const removeTodo = (id) => {
      todos.value = todos.value.filter(t => t.id !== id);
    };

    return { todos, newTodo, addTodo, toggleTodo, removeTodo };
  },
  template: (ctx) => `
    <div>
      <form @submit="(e) => { e.preventDefault(); addTodo(); }">
        <input
          value="${ctx.newTodo.value}"
          @input="(e) => newTodo.value = e.target.value"
          placeholder="Add todo..."
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        ${ctx.todos.value.map(todo => `
          <li key="${todo.id}">
            <input
              type="checkbox"
              ${todo.done ? 'checked' : ''}
              @change="() => toggleTodo(${todo.id})"
            />
            <span class="${todo.done ? 'line-through' : ''}">${todo.text}</span>
            <button @click="() => removeTodo(${todo.id})">×</button>
          </li>
        `).join('')}
      </ul>
    </div>
  `
});

app.mount(document.getElementById("app"), "TodoApp");
```

---

## What You Gain with Eleva

### Full JavaScript Control
- IDE autocomplete and type checking
- Easier debugging with standard JS tools
- No magic string parsing

### Component Encapsulation
- Self-contained component objects
- Explicit dependency injection
- Clearer data flow

### Performance
- Batched DOM updates via microtasks
- Efficient diffing with keys
- No directive parsing at runtime

### Testability
- Components are plain JavaScript objects
- Easy to unit test setup functions
- No DOM required for logic testing

---

## What You Lose from Alpine

### HTML Simplicity
- Alpine works directly in HTML without JavaScript files
- Great for simple interactions on server-rendered pages

### Built-in Modifiers
- `.prevent`, `.stop`, `.outside`, `.debounce`, etc.
- Must implement manually in Eleva

### Progressive Enhancement
- Alpine can enhance existing HTML
- Eleva replaces content with rendered template

### Learning Curve
- Alpine is often easier for HTML-focused developers
- Eleva requires JavaScript comfort

---

## When to Choose Each

**Choose Alpine when:**
- Adding interactivity to server-rendered HTML
- Working with non-JavaScript developers
- Building simple widgets/enhancements
- You prefer declarative HTML

**Choose Eleva when:**
- Building full client-side applications
- You want component-based architecture
- You prefer JavaScript-first development
- You need fine-grained reactivity control

---

## Migration Checklist

- [ ] Replace `x-data` with component `setup()` and `signal()`
- [ ] Convert `x-text`/`x-html` to template interpolation
- [ ] Replace `x-show` with inline style toggling
- [ ] Convert `x-if` to ternary expressions
- [ ] Replace `x-for` with `.map().join('')`
- [ ] Update `x-model` to value + @input pattern
- [ ] Convert `x-bind` to direct attribute interpolation
- [ ] Move `x-init` logic into `setup()`
- [ ] Replace `$watch` with `signal.watch()`
- [ ] Replace `Alpine.store` with Eleva Store plugin
- [ ] Implement event modifiers manually
- [ ] Add `key` attributes to all list items

---

[← From Vue](./from-vue.md) | [Back to Migration Overview](./index.md) | [From jQuery →](./from-jquery.md)
