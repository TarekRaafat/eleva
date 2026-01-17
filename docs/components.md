---
title: Eleva.js Components Guide
description: Complete guide to Eleva components - registration, mounting, children, props, styles, and inter-component communication patterns.
image: /imgs/eleva.js%20Full%20Logo.png
---

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Eleva.js Components Guide",
  "description": "Complete guide to Eleva components - registration, mounting, children, props, styles, and inter-component communication patterns.",
  "image": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png",
  "datePublished": "2026-01-01T00:00:00Z",
  "dateModified": "2026-01-17T00:00:00Z",
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
    "@id": "https://elevajs.com/components.html"
  },
  "proficiencyLevel": "Intermediate",
  "articleSection": "Documentation",
  "keywords": ["eleva", "elevajs", "Eleva.js", "components", "mounting", "props", "children", "styles", "component communication"]
}
</script>

# Components Guide

> **Core Docs** | Component registration, mounting, children, props, and communication.

---

## Component Definition Structure

A component in Eleva is a plain JavaScript object with these properties:

```javascript
app.component("MyComponent", {
  // 1. Setup - Initialize state (optional)
  setup({ signal, emitter, props }) {
    const state = signal(initialValue);
    return { state, /* ...other exports */ };
  },

  // 2. Template - Define HTML structure (required)
  template: (ctx) => `
    <div>${ctx.state.value}</div>
  `,

  // 3. Style - Component-scoped CSS (optional)
  style: `
    div { color: blue; }
  `,

  // 4. Children - Child component mappings (optional)
  children: {
    ".child-container": "ChildComponent"
  }
});
```

**Why this order?**
- `setup` initializes the data that `template` and `style` might reference
- `template` defines the structure that `style` will style
- `style` applies to the template's elements
- `children` maps to elements created in the template

---

## Component Registration & Mounting

### Global Registration

Register components globally, then mount by name:

```javascript
const app = new Eleva("MyApp");

app.component("HelloWorld", {
  setup({ signal }) {
    const count = signal(0);
    return { count };
  },
  template: (ctx) => `
    <div>
      <h1>Hello, Eleva!</h1>
      <p>Count: ${ctx.count.value}</p>
      <button @click="() => count.value++">Increment</button>
    </div>
  `,
});

app.mount(document.getElementById("app"), "HelloWorld").then((instance) => {
  console.log("Component mounted:", instance);
});
```

### Direct Component Definition

Mount a component without registering it first:

```javascript
const DirectComponent = {
  template: () => `<div>No setup needed!</div>`,
};

const app = new Eleva("MyApp");
app
  .mount(document.getElementById("app"), DirectComponent)
  .then((instance) => console.log("Mounted Direct:", instance));
```

### Mounting with Props

Pass initial data when mounting:

```javascript
app.component("UserProfile", {
  setup({ props }) {
    return {
      name: props.name || "Guest",
      role: props.role || "User"
    };
  },
  template: (ctx) => `
    <div>
      <h2>${ctx.name}</h2>
      <p>Role: ${ctx.role}</p>
    </div>
  `
});

// Mount with props
app.mount(document.getElementById("app"), "UserProfile", {
  name: "Alice",
  role: "Admin"
});
```

### Unmounting Components

The `mount()` method returns a `MountResult` object that includes an `unmount()` function:

```javascript
const instance = await app.mount(document.getElementById("app"), "MyComponent");

// Later, when you need to remove the component...
await instance.unmount();
```

#### MountResult Object

The object returned by `mount()` contains:

| Property | Type | Description |
|----------|------|-------------|
| `container` | `HTMLElement` | The DOM element where the component is mounted |
| `data` | `Object` | The component's reactive state and context |
| `unmount` | `Function` | Async function to clean up and remove the component |

```javascript
const instance = await app.mount(container, "Counter", { initial: 5 });

console.log(instance.container);  // The mounted DOM element
console.log(instance.data);       // { count: Signal, increment: Function, ... }
await instance.unmount();         // Clean up and remove
```

#### What Happens During Unmount

When you call `instance.unmount()`, Eleva performs cleanup in this order:

1. **Calls `onUnmount` hook** - Your cleanup code runs first with access to the `cleanup` object
2. **Removes signal watchers** - All reactive subscriptions are cleaned up
3. **Removes event listeners** - Template event handlers (`@click`, etc.) are removed
4. **Unmounts child components** - All nested components are recursively unmounted
5. **Clears the container** - The container's innerHTML is emptied
6. **Removes instance reference** - The `_eleva_instance` property is deleted

```javascript
app.component("Timer", {
  setup: ({ signal }) => {
    const seconds = signal(0);
    let intervalId = null;

    return {
      seconds,
      onMount: () => {
        intervalId = setInterval(() => seconds.value++, 1000);
      },
      onUnmount: ({ cleanup }) => {
        // Your manual cleanup
        clearInterval(intervalId);

        // cleanup object shows what Eleva will auto-clean:
        console.log(`Watchers: ${cleanup.watchers.length}`);
        console.log(`Listeners: ${cleanup.listeners.length}`);
        console.log(`Children: ${cleanup.children.length}`);
      }
    };
  },
  template: (ctx) => `<p>Seconds: ${ctx.seconds.value}</p>`
});

const timer = await app.mount(document.getElementById("app"), "Timer");

// After 10 seconds, unmount the timer
setTimeout(() => timer.unmount(), 10000);
```

#### Managing Multiple Mounted Components

If you mount multiple components, track their instances for later cleanup:

```javascript
const app = new Eleva("MyApp");
const mountedInstances = [];

// Mount multiple components
mountedInstances.push(
  await app.mount(document.getElementById("header"), "Header")
);
mountedInstances.push(
  await app.mount(document.getElementById("sidebar"), "Sidebar")
);
mountedInstances.push(
  await app.mount(document.getElementById("main"), "MainContent")
);

// Unmount all components
async function unmountAll() {
  for (const instance of mountedInstances) {
    await instance.unmount();
  }
  mountedInstances.length = 0;  // Clear the array
}

// Call when needed (e.g., before page unload or app reset)
window.addEventListener("beforeunload", unmountAll);
```

#### Accessing Mounted Instance from Container

The container element stores a reference to its mounted instance:

```javascript
const container = document.getElementById("app");
await app.mount(container, "MyComponent");

// Later, access the instance from the container
const instance = container._eleva_instance;
if (instance) {
  await instance.unmount();
}
```

> **Note:** `_eleva_instance` is an internal property. While it works, prefer storing the `MountResult` returned by `mount()` for cleaner code.

---

## Children Components & Passing Props

Eleva provides multiple ways to mount child components.

### Explicit Component Mounting

Components are explicitly defined in the parent's children configuration:

```javascript
// Child Component
app.component("TodoItem", {
  setup: (context) => {
    const { title, completed, onToggle } = context.props;
    return { title, completed, onToggle };
  },
  template: (ctx) => `
    <div class="todo-item ${ctx.completed ? 'completed' : ''}">
      <input type="checkbox"
             ${ctx.completed ? 'checked' : ''}
             @click="onToggle" />
      <span>${ctx.title}</span>
    </div>
  `,
});

// Parent Component
app.component("TodoList", {
  setup: ({ signal }) => {
    const todos = signal([
      { id: 1, title: "Learn Eleva", completed: false },
      { id: 2, title: "Build an app", completed: false },
    ]);

    const toggleTodo = (id) => {
      todos.value = todos.value.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
    };

    return { todos, toggleTodo };
  },
  template: (ctx) => `
    <div class="todo-list">
      <h2>My Todo List</h2>
      ${ctx.todos.value.map((todo) => `
        <div key="${todo.id}" class="todo-item"
             :title="${todo.title}"
             :completed="${todo.completed}"
             @click="() => toggleTodo(todo.id)">
        </div>
      `).join("")}
    </div>
  `,
  children: {
    ".todo-item": "TodoItem",
  },
});
```

### Types of Children Mounting

| Type | Syntax | Use Case |
|------|--------|----------|
| **Direct** | `"UserCard": "UserCard"` | Simple component composition |
| **Container-Based** | `"#container": "UserCard"` | Layout control needed |
| **Dynamic** | `".container": { setup, template, children }` | Dynamic component behavior |
| **Variable-Based** | `".container": ComponentVar` | Component from variable |

#### 1. Direct Component Mounting

```javascript
children: {
  "UserCard": "UserCard"  // Direct mounting without container
}
```
- **Use when:** Simple component composition
- **Benefits:** Most performant, no additional DOM elements

#### 2. Container-Based Mounting

```javascript
children: {
  "#container": "UserCard"  // Mounting in a container element
}
```
- **Use when:** Need container for styling or layout
- **Benefits:** Better control over positioning

#### 3. Dynamic Component Mounting

```javascript
children: {
  ".dynamic-container": {
    setup: ({ signal }) => ({
      userData: signal({ name: "John", role: "admin" })
    }),
    template: (ctx) => `<UserCard :user="userData.value" :editable="true" />`,
    children: { "UserCard": "UserCard" }
  }
}
```
- **Use when:** Need dynamic component behavior or setup
- **Benefits:** Full control over lifecycle

#### 4. Variable-Based Mounting

```javascript
const UserCard = {
  setup: (ctx) => ({ /* setup logic */ }),
  template: (ctx) => `<div>User Card</div>`,
};

app.component("UserList", {
  template: (ctx) => `
    <div class="user-list">
      <div class="user-card-container"></div>
    </div>
  `,
  children: {
    ".user-card-container": UserCard,  // Mount from variable
  },
});
```
- **Use when:** Components stored in variables or created dynamically
- **Benefits:** No global registration needed

### Selector Patterns

| Selector Type | Example | Use Case |
|---------------|---------|----------|
| **Class** | `".item"` | Multiple elements, list items |
| **ID** | `"#sidebar"` | Single unique element |
| **Data attribute** | `"[data-component]"` | Explicit component markers |
| **Nested** | `".container .item"` | Scoped selection |

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
template: () => `
  <div data-component="sidebar"></div>
  <div data-component="content"></div>
`,
children: {
  "[data-component='sidebar']": "Sidebar",
  "[data-component='content']": "Content"
}
```

**Recommendation:** Use classes for lists, IDs for unique elements, and data attributes when you want explicit component markers.

---

## Passing Props to Children

Props flow from parent template to child via `:prop` attributes:

```javascript
app.component("ProductList", {
  setup: ({ signal }) => {
    const products = signal([
      { id: 1, name: "Widget", price: 29.99 },
      { id: 2, name: "Gadget", price: 49.99 }
    ]);

    function handleSelect(product) {
      console.log("Selected:", product);
    }

    return { products, handleSelect };
  },
  template: (ctx) => `
    <div class="products">
      ${ctx.products.value.map(product => `
        <div key="${product.id}" class="product-card"
          :product="product"
          :onSelect="() => handleSelect(product)">
        </div>
      `).join("")}
    </div>
  `,
  children: {
    ".product-card": "ProductCard"
  }
});

// Child receives props
app.component("ProductCard", {
  setup: ({ props }) => {
    const { product, onSelect } = props;
    return { product, onSelect };
  },
  template: (ctx) => `
    <div class="card" @click="onSelect">
      <h3>${ctx.product.name}</h3>
      <p>$${ctx.product.price}</p>
    </div>
  `
});
```

### Props Support Any JavaScript Type

Props are evaluated expressions, so you can pass any value:

| Type | Example |
|------|---------|
| **Primitives** | `:count="42"`, `:name="'John'"`, `:active="true"` |
| **Objects** | `:user="user.value"`, `:config="{ theme: 'dark' }"` |
| **Arrays** | `:items="items.value"`, `:options="[1, 2, 3]"` |
| **Functions** | `:onClick="handleClick"`, `:onSubmit="(data) => save(data)"` |
| **Signals** | `:userSignal="user"` (pass the Signal itself) |

What the child receives depends on what you pass:
- `:user="user.value"` → child receives the **evaluated value**
- `:user="user"` → child receives the **Signal itself**

---

## Style Injection & Scoped CSS

Eleva supports both static and dynamic styles:

### Static Styles

```javascript
app.component("Button", {
  template: () => `<button class="btn">Click me</button>`,
  style: `
    .btn {
      padding: 8px 16px;
      background: blue;
      color: white;
      border: none;
      border-radius: 4px;
    }
    .btn:hover {
      background: darkblue;
    }
  `
});
```

### Dynamic Styles

```javascript
app.component("ThemableButton", {
  setup: ({ signal }) => ({
    theme: signal("primary")
  }),
  template: (ctx) => `
    <button class="btn btn-${ctx.theme.value}">Click me</button>
  `,
  style: (ctx) => `
    .btn-primary {
      background: blue;
      color: white;
    }
    .btn-secondary {
      background: gray;
      color: white;
    }
  `
});
```

---

## Inter-Component Communication

Eleva provides multiple ways to share data between components.

### Props (Data Down)

Pass any JavaScript value from parent to child:

```javascript
// Parent - pass complex data directly (no JSON.stringify!)
template: (ctx) => `
  <div class="child"
    :user="user.value"
    :items="items"
    :onSelect="handleSelect">
  </div>
`

// Child - receives actual values
setup({ props }) {
  // props.user is already an object
  // props.items is already an array
  // props.onSelect is a callable function
  return { user: props.user, items: props.items, onSelect: props.onSelect };
}

// For reactive props in child, pass the signal itself (not .value)
// Parent: :counter="counter"
// Child: props.counter.watch(() => { /* react to changes */ })
```

**Use when:** Passing data from parent to child.

### Emitter (Events Up)

Child-to-parent communication, sibling communication, decoupled messaging:

```javascript
// Child component - emits events
setup({ emitter }) {
  function handleClick(item) {
    emitter.emit("item:selected", item);
    emitter.emit("cart:add", { id: item.id, qty: 1 });
  }
  return { handleClick };
}

// Parent or any component - listens for events
setup({ emitter }) {
  emitter.on("item:selected", (item) => {
    console.log("Selected:", item);
  });

  emitter.on("cart:add", ({ id, qty }) => {
    // Update cart state
  });

  return {};
}
```

**Use when:**
- Child needs to notify parent of actions
- Sibling components need to communicate
- Decoupled, event-driven architecture

### Store Plugin (Global State)

Shared state accessible by any component:

```javascript
import { Store } from "eleva/plugins";

// Initialize store
app.use(Store, {
  state: {
    user: null,
    theme: "light"
  },
  actions: {
    setUser: (state, user) => { state.user.value = user; },
    setTheme: (state, theme) => { state.theme.value = theme; }
  }
});

// Any component can access store
app.component("UserProfile", {
  setup({ store }) {
    const user = store.state.user;
    const theme = store.state.theme;

    function logout() {
      store.dispatch("logout");
    }

    return { user, theme, logout };
  },
  template: (ctx) => `
    <div class="profile">
      ${ctx.user.value
        ? `<p>Welcome, ${ctx.user.value.name}!</p>
           <button @click="logout">Logout</button>`
        : `<p>Please log in</p>`
      }
    </div>
  `
});
```

**Use when:**
- Multiple unrelated components need the same data
- User session, authentication state
- App-wide settings (theme, language)

### Decision Guide

| Scenario | Solution | Why |
|----------|----------|-----|
| Pass any value to child | Props | Direct value passing |
| Child notifies parent of action | Emitter | Events flow up |
| Siblings need to communicate | Emitter | Decoupled messaging |
| Many components need same data | Store | Central state management |
| Parent updates, child should react | Props (pass signal) | Pass signal reference |

### Anti-Patterns to Avoid

```javascript
// DON'T: Use JSON.stringify for props (not needed!)
:data='${JSON.stringify(object)}'  // Old approach
:data="object"                     // Just pass directly

// DON'T: Use Store for parent-child only communication
store.dispatch("setParentData", data);  // Overkill, use props

// DON'T: Mutate store state directly
store.state.user.value = newUser;  // Use actions instead
store.dispatch("setUser", newUser);  // Correct
```

---

## Nesting Depth Guidelines

| Depth | Recommendation |
|-------|----------------|
| 1-2 levels | Ideal, easy to understand |
| 3 levels | Acceptable, consider flattening |
| 4+ levels | Too deep, refactor |

```javascript
// Good: 2 levels deep
// App → UserList → UserCard

// Acceptable: 3 levels
// App → Dashboard → WidgetList → Widget

// Avoid: 4+ levels - hard to trace data flow
// App → Page → Section → List → Item → SubItem
// Consider: Flatten structure or use Store for shared state
```

---

## Multiple Children Mounting

Mount different components to different selectors:

```javascript
app.component("Layout", {
  template: () => `
    <div class="layout">
      <header id="header"></header>
      <nav id="nav"></nav>
      <main id="content"></main>
      <aside id="sidebar"></aside>
      <footer id="footer"></footer>
    </div>
  `,
  children: {
    "#header": "Header",
    "#nav": "Navigation",
    "#content": "MainContent",
    "#sidebar": "Sidebar",
    "#footer": "Footer"
  }
});
```

---

## Dynamic Children Based on State

Conditionally render different components:

```javascript
app.component("TabPanel", {
  setup: ({ signal }) => {
    const activeTab = signal("home");
    const setTab = (tab) => { activeTab.value = tab; };
    return { activeTab, setTab };
  },
  template: (ctx) => `
    <div class="tabs">
      <button @click="() => setTab('home')">Home</button>
      <button @click="() => setTab('profile')">Profile</button>
      <button @click="() => setTab('settings')">Settings</button>
    </div>
    <div class="tab-content" data-tab="${ctx.activeTab.value}"></div>
  `,
  children: {
    "[data-tab='home']": "HomeTab",
    "[data-tab='profile']": "ProfileTab",
    "[data-tab='settings']": "SettingsTab"
  }
});
```

---

## Summary

| Topic | Key Points |
|-------|------------|
| **Registration** | `app.component(name, definition)` or direct mount |
| **Mounting** | `app.mount(container, compName, props)` returns Promise |
| **Children** | Use `children` object with selector → component mappings |
| **Props** | Use `:prop` syntax; no JSON.stringify needed |
| **Styles** | Static string or dynamic function |
| **Communication** | Props (down), Emitter (up), Store (global) |

---

## Next Steps

- **[Architecture](./architecture.md)** - Data flow diagrams
- **[Plugin System](./plugin-system.md)** - Creating and using plugins
- **[Best Practices](./best-practices.md)** - Patterns and guidelines
- **[Examples](./examples/index.md)** - Real-world patterns

---

[← Core Concepts](./core-concepts.md) | [Back to Main Docs](./index.md) | [Architecture →](./architecture.md)
