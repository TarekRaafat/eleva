# Store Plugin

> **Version:** 1.0.0-rc.14 | **Type:** State Management Plugin | **Bundle Size:** ~6KB minified | **Dependencies:** Eleva core (Signal system)

The Store plugin provides centralized, reactive state management for Eleva applications. It enables sharing data across the entire application with automatic UI updates, action-based mutations, namespace organization, and built-in persistence.

---

## TL;DR - Quick Reference

### 30-Second Setup

```javascript
// file: app.js
import Eleva from "eleva";
import { Store } from "eleva/plugins";

const app = new Eleva("MyApp");

app.use(Store, {
  state: { count: 0 },
  actions: {
    increment: (state) => state.count.value++
  }
});

app.component("Counter", {
  setup({ store }) {
    return {
      count: store.state.count,
      increment: () => store.dispatch("increment")
    };
  },
  template: (ctx) => `
    <button @click="increment">Count: ${ctx.count.value}</button>
  `
});

app.mount(document.getElementById("app"), "Counter");
// Result: Button showing "Count: 0", increments on click
```

### API Cheatsheet

| Method | Description | Returns |
|--------|-------------|---------|
| `store.state` | Reactive state object | `Object<Signal>` |
| `store.dispatch(action, payload?)` | Execute an action | `Promise<any>` |
| `store.subscribe(callback)` | Listen to all mutations | `() => void` |
| `store.getState()` | Get non-reactive snapshot | `Object` |
| `store.replaceState(newState)` | Replace entire state | `void` |
| `store.registerModule(name, module)` | Add dynamic module | `void` |
| `store.unregisterModule(name)` | Remove module | `void` |
| `store.createState(key, value)` | Add state property | `Signal` |
| `store.createAction(name, fn)` | Add action | `void` |
| `store.clearPersistedState()` | Clear storage | `void` |

### State Access Patterns

| Pattern | Example |
|---------|---------|
| Read state | `store.state.count.value` |
| In template | `${ctx.count.value}` |
| Namespaced state | `store.state.auth.user.value` |
| Dispatch action | `store.dispatch("increment")` |
| Dispatch with payload | `store.dispatch("setUser", { name: "John" })` |
| Namespaced action | `store.dispatch("auth.login", credentials)` |

### Configuration Quick Reference

```javascript
app.use(Store, {
  state: { /* initial state */ },
  actions: { /* action functions */ },
  namespaces: { /* organized modules */ },
  persistence: {
    enabled: true,
    key: "app-store",
    storage: "localStorage",  // or "sessionStorage"
    include: ["theme"],       // only persist these
    exclude: ["tempData"]     // don't persist these
  },
  devTools: true,
  onError: (error, context) => console.error(error)
});
```

> **Template Context:** Use `${ctx.count.value}` in templates, but `@click="increment"` for events (no `ctx.`).

---

## Table of Contents

- [Store Plugin](#store-plugin)
  - [TL;DR - Quick Reference](#tldr---quick-reference)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Core Concepts](#core-concepts)
    - [State](#state)
    - [Actions](#actions)
    - [Namespaces (Modules)](#namespaces-modules)
  - [Configuration Options](#configuration-options)
  - [Store API Reference](#store-api-reference)
  - [Usage Patterns](#usage-patterns)
    - [Basic Counter](#basic-counter)
    - [Todo List](#todo-list)
    - [Authentication Flow](#authentication-flow)
    - [Shopping Cart](#shopping-cart)
  - [Persistence](#persistence)
  - [Dynamic Modules](#dynamic-modules)
  - [Subscriptions](#subscriptions)
  - [DevTools Integration](#devtools-integration)
  - [Data Flow](#data-flow)
  - [Best Practices](#best-practices)
  - [Troubleshooting](#troubleshooting)
  - [Batching Tips \& Gotchas](#batching-tips--gotchas)
  - [Migration Guide](#migration-guide)
  - [Summary](#summary)

---

## Installation

### Via npm

```bash
npm install eleva
```

```javascript
// ESM
import Eleva from "eleva";
import { Store } from "eleva/plugins";

// or individual import
import { Store } from "eleva/plugins/store";
```

### Via CDN

```html
<script src="https://cdn.jsdelivr.net/npm/eleva"></script>
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/plugins/store.umd.min.js"></script>

<script>
  const app = new Eleva("MyApp");
  app.use(ElevaStore.Store, { /* options */ });
</script>
```

### Basic Setup

```javascript
// file: main.js
import Eleva from "eleva";
import { Store } from "eleva/plugins";

const app = new Eleva("MyApp");

// Install with initial state and actions
app.use(Store, {
  state: {
    theme: "light",
    user: null,
    counter: 0
  },
  actions: {
    setTheme: (state, theme) => state.theme.value = theme,
    setUser: (state, user) => state.user.value = user,
    increment: (state) => state.counter.value++,
    decrement: (state) => state.counter.value--
  }
});
```

---

## Core Concepts

### State

State is the single source of truth for your application. All state properties are automatically wrapped in Eleva Signals, making them reactive.

```javascript
// file: store-setup.js
app.use(Store, {
  state: {
    // Primitives
    count: 0,
    name: "Guest",
    isLoggedIn: false,

    // Objects
    user: {
      id: null,
      name: "",
      email: ""
    },

    // Arrays
    todos: [],
    notifications: []
  }
});
```

**Accessing State in Components:**

```javascript
// file: my-component.js
app.component("MyComponent", {
  setup({ store }) {
    // Access state signals directly
    const count = store.state.count;        // Signal<number>
    const user = store.state.user;          // Signal<object>
    const todos = store.state.todos;        // Signal<array>

    return { count, user, todos };
  },
  template: (ctx) => `
    <div>
      <p>Count: ${ctx.count.value}</p>
      <p>User: ${ctx.user.value?.name || 'Guest'}</p>
      <p>Todos: ${ctx.todos.value.length}</p>
    </div>
  `
});
// Result: Displays count, user name, and todo count
// UI automatically updates when state changes
```

**Important:** State properties are Signals. Always use `.value` to read or write:

```javascript
// Reading
const currentCount = store.state.count.value;

// Writing (prefer actions for mutations)
store.state.count.value = 10;
```

### Actions

Actions are functions that mutate state. They provide a predictable way to change state and enable tracking/debugging.

```javascript
// file: store-actions.js
app.use(Store, {
  state: {
    count: 0,
    todos: []
  },
  actions: {
    // Simple action - no payload
    increment: (state) => {
      state.count.value++;
    },

    // Action with payload
    incrementBy: (state, amount) => {
      state.count.value += amount;
    },

    // Action with object payload
    addTodo: (state, { title, priority }) => {
      state.todos.value = [
        ...state.todos.value,
        { id: Date.now(), title, priority, done: false }
      ];
    },

    // Async action
    fetchUser: async (state, userId) => {
      const response = await fetch(`/api/users/${userId}`);
      const user = await response.json();
      state.user.value = user;
      return user; // Actions can return values
    }
  }
});
```

**Dispatching Actions:**

```javascript
// file: component-with-actions.js
app.component("TodoManager", {
  setup({ store }) {
    // Simple dispatch
    const increment = () => store.dispatch("increment");

    // Dispatch with payload
    const incrementBy = (n) => store.dispatch("incrementBy", n);

    // Dispatch with object payload
    const addTodo = (title) => store.dispatch("addTodo", {
      title,
      priority: "normal"
    });

    // Async dispatch
    const loadUser = async (id) => {
      const user = await store.dispatch("fetchUser", id);
      console.log("Loaded:", user);
    };

    return { increment, incrementBy, addTodo, loadUser };
  }
});
```

### Namespaces (Modules)

For larger applications, organize state into namespaced modules:

```javascript
// file: store-with-namespaces.js
app.use(Store, {
  // Root state
  state: {
    appName: "MyApp",
    theme: "light"
  },

  // Root actions
  actions: {
    setTheme: (state, theme) => state.theme.value = theme
  },

  // Namespaced modules
  namespaces: {
    // Auth module
    auth: {
      state: {
        user: null,
        token: null,
        isAuthenticated: false
      },
      actions: {
        login: (state, { user, token }) => {
          state.auth.user.value = user;
          state.auth.token.value = token;
          state.auth.isAuthenticated.value = true;
        },
        logout: (state) => {
          state.auth.user.value = null;
          state.auth.token.value = null;
          state.auth.isAuthenticated.value = false;
        }
      }
    },

    // Cart module
    cart: {
      state: {
        items: [],
        total: 0
      },
      actions: {
        addItem: (state, item) => {
          state.cart.items.value = [...state.cart.items.value, item];
          state.cart.total.value += item.price;
        },
        removeItem: (state, itemId) => {
          const item = state.cart.items.value.find(i => i.id === itemId);
          if (item) {
            state.cart.items.value = state.cart.items.value.filter(i => i.id !== itemId);
            state.cart.total.value -= item.price;
          }
        },
        clearCart: (state) => {
          state.cart.items.value = [];
          state.cart.total.value = 0;
        }
      }
    }
  }
});
```

**Accessing Namespaced State and Actions:**

```javascript
// file: namespaced-component.js
app.component("Header", {
  setup({ store }) {
    // Access namespaced state
    const user = store.state.auth.user;
    const isAuthenticated = store.state.auth.isAuthenticated;
    const cartItems = store.state.cart.items;
    const cartTotal = store.state.cart.total;

    // Dispatch namespaced actions (use dot notation)
    const login = (credentials) => store.dispatch("auth.login", credentials);
    const logout = () => store.dispatch("auth.logout");
    const addToCart = (item) => store.dispatch("cart.addItem", item);

    return { user, isAuthenticated, cartItems, cartTotal, login, logout, addToCart };
  },
  template: (ctx) => `
    <header>
      ${ctx.isAuthenticated.value
        ? `<span>Welcome, ${ctx.user.value.name}</span>
           <span>Cart: ${ctx.cartItems.value.length} items ($${ctx.cartTotal.value})</span>
           <button @click="logout">Logout</button>`
        : `<button @click="() => login({ user: { name: 'John' }, token: 'abc' })">Login</button>`
      }
    </header>
  `
});
// Result: Shows login button or user info + cart based on auth state
```

---

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `state` | `Object` | `{}` | Initial state properties |
| `actions` | `Object` | `{}` | Action functions for state mutations |
| `namespaces` | `Object` | `{}` | Namespaced modules with their own state/actions |
| `persistence` | `Object` | See below | Persistence configuration |
| `devTools` | `boolean` | `false` | Enable DevTools integration |
| `onError` | `Function` | `null` | Error handler callback |

### Persistence Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `false` | Enable state persistence |
| `key` | `string` | `"eleva-store"` | Storage key name |
| `storage` | `string` | `"localStorage"` | `"localStorage"` or `"sessionStorage"` |
| `include` | `string[]` | `null` | State paths to persist (whitelist) |
| `exclude` | `string[]` | `null` | State paths to exclude (blacklist) |

**Full Configuration Example:**

```javascript
// file: full-store-config.js
app.use(Store, {
  // Initial state
  state: {
    theme: "light",
    language: "en",
    notifications: []
  },

  // Actions
  actions: {
    setTheme: (state, theme) => state.theme.value = theme,
    setLanguage: (state, lang) => state.language.value = lang,
    addNotification: (state, notification) => {
      state.notifications.value = [...state.notifications.value, {
        id: Date.now(),
        ...notification
      }];
    },
    clearNotifications: (state) => state.notifications.value = []
  },

  // Namespaced modules
  namespaces: {
    auth: {
      state: { user: null, token: null },
      actions: {
        login: (state, payload) => { /* ... */ },
        logout: (state) => { /* ... */ }
      }
    }
  },

  // Persistence
  persistence: {
    enabled: true,
    key: "myapp-store",
    storage: "localStorage",
    include: ["theme", "language", "auth.token"]  // Only persist these
  },

  // DevTools
  devTools: process.env.NODE_ENV === "development",

  // Error handling
  onError: (error, context) => {
    console.error(`Store error [${context}]:`, error);
    // Send to error tracking service
  }
});
```

---

## Store API Reference

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `store.state` | `Object` | Reactive state object with Signal properties |

### Methods

#### `dispatch(actionName, payload?)`

Executes an action to mutate state.

```javascript
// Signature
store.dispatch(actionName: string, payload?: any): Promise<any>

// Examples
await store.dispatch("increment");
await store.dispatch("setUser", { name: "John", email: "john@example.com" });
await store.dispatch("auth.login", { username: "john", password: "secret" });
const user = await store.dispatch("fetchUser", 123);
```

#### `subscribe(callback)`

Subscribes to all state mutations. Returns an unsubscribe function.

```javascript
// Signature
store.subscribe(callback: (mutation, state) => void): () => void

// Example
const unsubscribe = store.subscribe((mutation, state) => {
  console.log("Action:", mutation.type);
  console.log("Payload:", mutation.payload);
  console.log("Timestamp:", mutation.timestamp);
  console.log("New state:", state);
});

// Later: stop listening
unsubscribe();
```

#### `getState()`

Returns a deep copy of current state values (non-reactive snapshot).

```javascript
// Signature
store.getState(): Object

// Example
const snapshot = store.getState();
console.log(snapshot);
// { count: 5, user: { name: "John" }, auth: { token: "abc" } }

// Useful for debugging, logging, or SSR hydration
localStorage.setItem("debug-state", JSON.stringify(store.getState()));
```

#### `replaceState(newState)`

Replaces the entire state. Useful for hydration or time-travel debugging.

```javascript
// Signature
store.replaceState(newState: Object): void

// Example
store.replaceState({
  count: 10,
  user: { name: "Jane", email: "jane@example.com" },
  theme: "dark"
});
```

#### `registerModule(namespace, module)`

Dynamically registers a new namespaced module.

```javascript
// Signature
store.registerModule(namespace: string, module: { state: Object, actions: Object }): void

// Example
store.registerModule("wishlist", {
  state: {
    items: []
  },
  actions: {
    addItem: (state, item) => {
      state.wishlist.items.value = [...state.wishlist.items.value, item];
    },
    removeItem: (state, itemId) => {
      state.wishlist.items.value = state.wishlist.items.value.filter(i => i.id !== itemId);
    }
  }
});

// Now accessible
store.state.wishlist.items.value;
store.dispatch("wishlist.addItem", { id: 1, name: "Product" });
```

#### `unregisterModule(namespace)`

Removes a dynamically registered module.

```javascript
// Signature
store.unregisterModule(namespace: string): void

// Example
store.unregisterModule("wishlist");
// store.state.wishlist is now undefined
```

#### `createState(key, initialValue)`

Creates a new state property at runtime.

```javascript
// Signature
store.createState(key: string, initialValue: any): Signal

// Example
const theme = store.createState("theme", "dark");
console.log(theme.value); // "dark"
console.log(store.state.theme.value); // "dark"
```

#### `createAction(name, actionFn)`

Creates a new action at runtime.

```javascript
// Signature
store.createAction(name: string, actionFn: (state, payload?) => void): void

// Example
store.createAction("toggleTheme", (state) => {
  state.theme.value = state.theme.value === "dark" ? "light" : "dark";
});

store.dispatch("toggleTheme");
```

#### `clearPersistedState()`

Clears persisted state from storage.

```javascript
// Signature
store.clearPersistedState(): void

// Example
store.clearPersistedState();
// localStorage/sessionStorage entry is removed
```

### Eleva Instance Shortcuts

The plugin also adds shortcuts to the Eleva instance:

```javascript
// These are equivalent:
app.store.dispatch("increment");
app.dispatch("increment");

app.store.getState();
app.getState();

app.store.subscribe(callback);
app.subscribe(callback);

app.store.createAction("foo", fn);
app.createAction("foo", fn);
```

---

## Usage Patterns

### Basic Counter

```javascript
// file: counter-example.js
import Eleva from "eleva";
import { Store } from "eleva/plugins";

const app = new Eleva("CounterApp");

app.use(Store, {
  state: { count: 0 },
  actions: {
    increment: (state) => state.count.value++,
    decrement: (state) => state.count.value--,
    reset: (state) => state.count.value = 0,
    setCount: (state, value) => state.count.value = value
  }
});

app.component("Counter", {
  setup({ store }) {
    return {
      count: store.state.count,
      increment: () => store.dispatch("increment"),
      decrement: () => store.dispatch("decrement"),
      reset: () => store.dispatch("reset")
    };
  },
  template: (ctx) => `
    <div class="counter">
      <h2>Count: ${ctx.count.value}</h2>
      <button @click="decrement">-</button>
      <button @click="reset">Reset</button>
      <button @click="increment">+</button>
    </div>
  `
});

app.mount(document.getElementById("app"), "Counter");
// Result: Interactive counter with increment, decrement, and reset
```

### Todo List

```javascript
// file: todo-example.js
import Eleva from "eleva";
import { Store } from "eleva/plugins";

const app = new Eleva("TodoApp");

app.use(Store, {
  state: {
    todos: [],
    filter: "all"  // "all" | "active" | "completed"
  },
  actions: {
    addTodo: (state, text) => {
      state.todos.value = [
        ...state.todos.value,
        { id: Date.now(), text, completed: false }
      ];
    },
    toggleTodo: (state, id) => {
      state.todos.value = state.todos.value.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
    },
    removeTodo: (state, id) => {
      state.todos.value = state.todos.value.filter(todo => todo.id !== id);
    },
    setFilter: (state, filter) => {
      state.filter.value = filter;
    },
    clearCompleted: (state) => {
      state.todos.value = state.todos.value.filter(todo => !todo.completed);
    }
  },
  persistence: {
    enabled: true,
    key: "todo-app",
    include: ["todos"]
  }
});

app.component("TodoApp", {
  setup({ store, signal }) {
    const newTodo = signal("");

    const filteredTodos = () => {
      const todos = store.state.todos.value;
      const filter = store.state.filter.value;

      switch (filter) {
        case "active": return todos.filter(t => !t.completed);
        case "completed": return todos.filter(t => t.completed);
        default: return todos;
      }
    };

    const addTodo = () => {
      if (newTodo.value.trim()) {
        store.dispatch("addTodo", newTodo.value.trim());
        newTodo.value = "";
      }
    };

    return {
      todos: store.state.todos,
      filter: store.state.filter,
      newTodo,
      filteredTodos,
      addTodo,
      toggleTodo: (id) => store.dispatch("toggleTodo", id),
      removeTodo: (id) => store.dispatch("removeTodo", id),
      setFilter: (f) => store.dispatch("setFilter", f),
      clearCompleted: () => store.dispatch("clearCompleted")
    };
  },
  template: (ctx) => `
    <div class="todo-app">
      <h1>Todos</h1>

      <div class="add-todo">
        <input
          type="text"
          value="${ctx.newTodo.value}"
          @input="(e) => newTodo.value = e.target.value"
          @keypress="(e) => e.key === 'Enter' && addTodo()"
          placeholder="What needs to be done?"
        />
        <button @click="addTodo">Add</button>
      </div>

      <ul class="todo-list">
        ${ctx.filteredTodos().map(todo => `
          <li key="${todo.id}" class="${todo.completed ? 'completed' : ''}">
            <input
              type="checkbox"
              ${todo.completed ? 'checked' : ''}
              @change="() => toggleTodo(${todo.id})"
            />
            <span>${todo.text}</span>
            <button @click="() => removeTodo(${todo.id})">x</button>
          </li>
        `).join("")}
      </ul>

      <div class="filters">
        <span>${ctx.todos.value.filter(t => !t.completed).length} items left</span>
        <button @click="() => setFilter('all')"
                class="${ctx.filter.value === 'all' ? 'active' : ''}">All</button>
        <button @click="() => setFilter('active')"
                class="${ctx.filter.value === 'active' ? 'active' : ''}">Active</button>
        <button @click="() => setFilter('completed')"
                class="${ctx.filter.value === 'completed' ? 'active' : ''}">Completed</button>
        <button @click="clearCompleted">Clear completed</button>
      </div>
    </div>
  `
});

app.mount(document.getElementById("app"), "TodoApp");
// Result: Full todo app with filtering, persistence, and CRUD operations
```

### Authentication Flow

```javascript
// file: auth-example.js
import Eleva from "eleva";
import { Store } from "eleva/plugins";

const app = new Eleva("AuthApp");

app.use(Store, {
  namespaces: {
    auth: {
      state: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      },
      actions: {
        loginStart: (state) => {
          state.auth.isLoading.value = true;
          state.auth.error.value = null;
        },
        loginSuccess: (state, { user, token }) => {
          state.auth.user.value = user;
          state.auth.token.value = token;
          state.auth.isAuthenticated.value = true;
          state.auth.isLoading.value = false;
        },
        loginFailure: (state, error) => {
          state.auth.error.value = error;
          state.auth.isLoading.value = false;
        },
        logout: (state) => {
          state.auth.user.value = null;
          state.auth.token.value = null;
          state.auth.isAuthenticated.value = false;
        }
      }
    }
  },
  persistence: {
    enabled: true,
    include: ["auth.token", "auth.user"]
  }
});

// Create a login action that orchestrates the flow
app.store.createAction("auth.login", async (state, credentials) => {
  await app.dispatch("auth.loginStart");

  try {
    // Simulate API call
    const response = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });

    if (!response.ok) throw new Error("Invalid credentials");

    const { user, token } = await response.json();
    await app.dispatch("auth.loginSuccess", { user, token });
    return { user, token };
  } catch (error) {
    await app.dispatch("auth.loginFailure", error.message);
    throw error;
  }
});

app.component("LoginForm", {
  setup({ store, signal }) {
    const username = signal("");
    const password = signal("");

    const handleLogin = async () => {
      try {
        await store.dispatch("auth.login", {
          username: username.value,
          password: password.value
        });
      } catch (error) {
        // Error already in store
      }
    };

    return {
      username,
      password,
      isLoading: store.state.auth.isLoading,
      error: store.state.auth.error,
      handleLogin
    };
  },
  template: (ctx) => `
    <form @submit="(e) => { e.preventDefault(); handleLogin(); }">
      ${ctx.error.value ? `<div class="error">${ctx.error.value}</div>` : ""}

      <input
        type="text"
        placeholder="Username"
        value="${ctx.username.value}"
        @input="(e) => username.value = e.target.value"
        ${ctx.isLoading.value ? 'disabled' : ''}
      />

      <input
        type="password"
        placeholder="Password"
        value="${ctx.password.value}"
        @input="(e) => password.value = e.target.value"
        ${ctx.isLoading.value ? 'disabled' : ''}
      />

      <button type="submit" ${ctx.isLoading.value ? 'disabled' : ''}>
        ${ctx.isLoading.value ? 'Logging in...' : 'Login'}
      </button>
    </form>
  `
});
// Result: Login form with loading state, error handling, and persistence
```

### Shopping Cart

```javascript
// file: cart-example.js
import Eleva from "eleva";
import { Store } from "eleva/plugins";

const app = new Eleva("ShopApp");

app.use(Store, {
  namespaces: {
    cart: {
      state: {
        items: [],
        isOpen: false
      },
      actions: {
        addItem: (state, product) => {
          const items = state.cart.items.value;
          const existing = items.find(i => i.id === product.id);

          if (existing) {
            state.cart.items.value = items.map(i =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            );
          } else {
            state.cart.items.value = [...items, { ...product, quantity: 1 }];
          }
        },
        removeItem: (state, productId) => {
          state.cart.items.value = state.cart.items.value.filter(i => i.id !== productId);
        },
        updateQuantity: (state, { productId, quantity }) => {
          if (quantity <= 0) {
            state.cart.items.value = state.cart.items.value.filter(i => i.id !== productId);
          } else {
            state.cart.items.value = state.cart.items.value.map(i =>
              i.id === productId ? { ...i, quantity } : i
            );
          }
        },
        toggleCart: (state) => {
          state.cart.isOpen.value = !state.cart.isOpen.value;
        },
        clearCart: (state) => {
          state.cart.items.value = [];
        }
      }
    }
  },
  persistence: {
    enabled: true,
    include: ["cart.items"]
  }
});

app.component("CartWidget", {
  setup({ store }) {
    const items = store.state.cart.items;
    const isOpen = store.state.cart.isOpen;

    const itemCount = () => items.value.reduce((sum, i) => sum + i.quantity, 0);
    const total = () => items.value.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    return {
      items,
      isOpen,
      itemCount,
      total,
      toggleCart: () => store.dispatch("cart.toggleCart"),
      updateQuantity: (productId, qty) => store.dispatch("cart.updateQuantity", { productId, quantity: qty }),
      removeItem: (productId) => store.dispatch("cart.removeItem", productId),
      clearCart: () => store.dispatch("cart.clearCart")
    };
  },
  template: (ctx) => `
    <div class="cart-widget">
      <button @click="toggleCart" class="cart-toggle">
        Cart (${ctx.itemCount()})
      </button>

      ${ctx.isOpen.value ? `
        <div class="cart-dropdown">
          <h3>Shopping Cart</h3>

          ${ctx.items.value.length === 0 ? `
            <p>Your cart is empty</p>
          ` : `
            <ul>
              ${ctx.items.value.map(item => `
                <li key="${item.id}">
                  <span>${item.name}</span>
                  <span>$${item.price}</span>
                  <input
                    type="number"
                    value="${item.quantity}"
                    min="0"
                    @change="(e) => updateQuantity(${item.id}, parseInt(e.target.value))"
                  />
                  <button @click="() => removeItem(${item.id})">Remove</button>
                </li>
              `).join("")}
            </ul>

            <div class="cart-total">
              <strong>Total: $${ctx.total().toFixed(2)}</strong>
            </div>

            <button @click="clearCart">Clear Cart</button>
            <button class="checkout">Checkout</button>
          `}
        </div>
      ` : ""}
    </div>
  `
});
// Result: Cart widget with item management, quantity updates, and persistence
```

---

## Persistence

The Store plugin can automatically persist state to browser storage.

### Basic Persistence

```javascript
app.use(Store, {
  state: { theme: "light", count: 0 },
  persistence: {
    enabled: true,
    key: "my-app-store",
    storage: "localStorage"  // or "sessionStorage"
  }
});
// All state is persisted to localStorage under "my-app-store"
```

### Selective Persistence with Include

```javascript
app.use(Store, {
  state: {
    theme: "light",      // Will be persisted
    user: null,          // Will NOT be persisted
    tempData: {}         // Will NOT be persisted
  },
  persistence: {
    enabled: true,
    key: "my-app-store",
    include: ["theme"]   // Only persist theme
  }
});
```

### Selective Persistence with Exclude

```javascript
app.use(Store, {
  state: {
    theme: "light",      // Will be persisted
    user: null,          // Will be persisted
    tempData: {}         // Will NOT be persisted
  },
  persistence: {
    enabled: true,
    key: "my-app-store",
    exclude: ["tempData"]  // Persist everything except tempData
  }
});
```

### Namespaced Persistence

```javascript
app.use(Store, {
  namespaces: {
    auth: {
      state: { user: null, token: null }
    },
    ui: {
      state: { theme: "light", sidebar: true }
    }
  },
  persistence: {
    enabled: true,
    include: ["auth.token", "ui.theme"]  // Use dot notation for namespaced state
  }
});
```

### Manual Persistence Control

```javascript
// Clear persisted state
app.store.clearPersistedState();

// Get current state snapshot (for manual persistence)
const snapshot = app.store.getState();
localStorage.setItem("backup", JSON.stringify(snapshot));

// Restore state
const backup = JSON.parse(localStorage.getItem("backup"));
app.store.replaceState(backup);
```

---

## Dynamic Modules

Register and unregister modules at runtime for code splitting and lazy loading.

### Registering a Module

```javascript
// file: dynamic-module-example.js

// Later in your app, maybe after a route change
store.registerModule("analytics", {
  state: {
    events: [],
    sessionId: null
  },
  actions: {
    trackEvent: (state, event) => {
      state.analytics.events.value = [
        ...state.analytics.events.value,
        { ...event, timestamp: Date.now() }
      ];
    },
    setSession: (state, sessionId) => {
      state.analytics.sessionId.value = sessionId;
    }
  }
});

// Module is now available
store.state.analytics.events.value;  // []
store.dispatch("analytics.trackEvent", { name: "page_view", page: "/home" });
```

### Unregistering a Module

```javascript
// When the module is no longer needed
store.unregisterModule("analytics");
// store.state.analytics is now undefined
```

### Practical Example: Lazy-loaded Feature

```javascript
// file: feature-loader.js

// Main app setup (minimal)
app.use(Store, {
  state: { theme: "light" }
});

// When user accesses admin section
async function loadAdminFeatures() {
  // Dynamically import admin module definition
  const { adminModule } = await import("./modules/admin.js");

  // Register it
  app.store.registerModule("admin", adminModule);

  // Now admin state/actions are available
  await app.store.dispatch("admin.loadDashboard");
}

// When user leaves admin section
function unloadAdminFeatures() {
  app.store.unregisterModule("admin");
}
```

---

## Subscriptions

Subscribe to state mutations for logging, analytics, or side effects.

### Basic Subscription

```javascript
const unsubscribe = app.store.subscribe((mutation, state) => {
  console.log("=== State Mutation ===");
  console.log("Action:", mutation.type);
  console.log("Payload:", mutation.payload);
  console.log("Time:", new Date(mutation.timestamp));
});

// Stop listening
unsubscribe();
```

### Analytics Integration

```javascript
// file: analytics-subscription.js
app.store.subscribe((mutation, state) => {
  // Track specific actions
  if (mutation.type.startsWith("cart.")) {
    analytics.track("Cart Action", {
      action: mutation.type,
      payload: mutation.payload,
      cartTotal: state.cart?.total?.value
    });
  }

  if (mutation.type === "auth.login") {
    analytics.identify(state.auth.user.value.id);
  }
});
```

### Logging Middleware

```javascript
// file: logging-middleware.js
if (process.env.NODE_ENV === "development") {
  app.store.subscribe((mutation, state) => {
    console.group(`Action: ${mutation.type}`);
    console.log("Payload:", mutation.payload);
    console.log("State after:", app.store.getState());
    console.groupEnd();
  });
}
```

### Synchronizing with External Services

```javascript
// file: sync-subscription.js

// Sync auth state with API
app.store.subscribe(async (mutation, state) => {
  if (mutation.type === "auth.loginSuccess") {
    // Set auth header for future requests
    api.setAuthToken(state.auth.token.value);
  }

  if (mutation.type === "auth.logout") {
    // Clear auth header
    api.clearAuthToken();
    // Notify server
    await api.post("/api/logout");
  }
});
```

---

## DevTools Integration

The Store plugin supports integration with browser DevTools for debugging.

### Enabling DevTools

```javascript
app.use(Store, {
  state: { /* ... */ },
  actions: { /* ... */ },
  devTools: true  // Enable in development
});

// Or conditionally
app.use(Store, {
  devTools: process.env.NODE_ENV === "development"
});
```

### DevTools Features

When enabled, the store:
1. Registers with `window.__ELEVA_DEVTOOLS__` if available
2. Notifies DevTools of all mutations
3. Keeps a history of the last 100 mutations

### Manual Debugging

```javascript
// Access mutation history
console.log(app.store.mutations);
// [
//   { type: "increment", payload: undefined, timestamp: 1234567890 },
//   { type: "setUser", payload: { name: "John" }, timestamp: 1234567891 },
//   ...
// ]

// Get current state snapshot
console.log(app.store.getState());

// Time-travel (restore previous state)
const previousState = { count: 5, user: null };
app.store.replaceState(previousState);
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     STORE DATA FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐     │
│  │  Component  │      │  Component  │      │  Component  │     │
│  │      A      │      │      B      │      │      C      │     │
│  └──────┬──────┘      └──────┬──────┘      └──────┬──────┘     │
│         │                    │                    │             │
│         │   store.dispatch("action", payload)     │             │
│         └──────────────────┬─────────────────────┘             │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      STORE                               │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │                    Actions                       │    │   │
│  │  │  increment: (state) => state.count.value++      │    │   │
│  │  │  setUser: (state, user) => state.user.value=user│    │   │
│  │  └────────────────────┬────────────────────────────┘    │   │
│  │                       │                                  │   │
│  │                       ▼                                  │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │                    State                         │    │   │
│  │  │  count: Signal(0)                               │    │   │
│  │  │  user: Signal(null)                             │    │   │
│  │  │  auth: { token: Signal(null), ... }             │    │   │
│  │  └────────────────────┬────────────────────────────┘    │   │
│  │                       │                                  │   │
│  │                       │  Signal notifies watchers        │   │
│  │                       ▼                                  │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │              Subscribers                         │    │   │
│  │  │  - Logging                                      │    │   │
│  │  │  - Analytics                                    │    │   │
│  │  │  - Persistence                                  │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│         ┌──────────────────┼──────────────────┐                │
│         │                  │                  │                │
│         ▼                  ▼                  ▼                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │  Component  │    │  Component  │    │  Component  │        │
│  │  A (update) │    │  B (update) │    │  C (update) │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Flow Description

1. **Component dispatches action** → `store.dispatch("action", payload)`
2. **Store executes action** → Action function mutates state signals
3. **State signals notify** → All watching components are notified
4. **Subscribers called** → Logging, analytics, persistence run
5. **Components re-render** → Only affected components update
6. **Persistence saves** → If enabled, state is saved to storage

---

## Best Practices

### 1. Keep State Flat When Possible

```javascript
// Good - flat structure
state: {
  userId: null,
  userName: "",
  userEmail: "",
  todos: []
}

// Avoid - deeply nested
state: {
  user: {
    profile: {
      details: {
        name: "",
        email: ""
      }
    }
  }
}
```

### 2. Use Actions for All Mutations

```javascript
// Good - use actions
store.dispatch("setUser", newUser);

// Avoid - direct mutation (harder to track/debug)
store.state.user.value = newUser;
```

### 3. Keep Actions Pure When Possible

```javascript
// Good - pure action
actions: {
  addTodo: (state, todo) => {
    state.todos.value = [...state.todos.value, todo];
  }
}

// For async operations, create wrapper actions
store.createAction("fetchAndAddTodo", async (state, todoId) => {
  const todo = await api.getTodo(todoId);
  await store.dispatch("addTodo", todo);
});
```

### 4. Use Namespaces for Large Apps

```javascript
// Good - organized by feature
namespaces: {
  auth: { state: {...}, actions: {...} },
  cart: { state: {...}, actions: {...} },
  products: { state: {...}, actions: {...} }
}
```

### 5. Be Selective with Persistence

```javascript
// Good - persist only what's needed
persistence: {
  include: ["auth.token", "cart.items", "ui.theme"]
}

// Avoid - persisting everything (may include sensitive/stale data)
persistence: { enabled: true }
```

### 6. Clean Up Subscriptions

```javascript
// In component setup
setup({ store }) {
  const unsubscribe = store.subscribe(/* ... */);

  return {
    onUnmount: () => {
      unsubscribe();  // Clean up!
    }
  };
}
```

### 7. Use Computed Values for Derived State

```javascript
setup({ store }) {
  // Good - compute in component
  const completedTodos = () =>
    store.state.todos.value.filter(t => t.completed);

  const totalPrice = () =>
    store.state.cart.items.value.reduce((sum, i) => sum + i.price, 0);

  return { completedTodos, totalPrice };
}
```

---

## Troubleshooting

### State Not Updating

**Problem:** Component doesn't re-render when state changes.

**Solutions:**

```javascript
// 1. Make sure you're using .value
// Wrong
template: (ctx) => `<p>${ctx.count}</p>`
// Right
template: (ctx) => `<p>${ctx.count.value}</p>`

// 2. Make sure you're returning state from setup
setup({ store }) {
  return {
    count: store.state.count  // Must return the signal
  };
}

// 3. For arrays/objects, create new references
// Wrong - mutating existing array
state.todos.value.push(newTodo);
// Right - creating new array
state.todos.value = [...state.todos.value, newTodo];
```

### Action Not Found

**Problem:** `Error: Action "actionName" not found`

**Solutions:**

```javascript
// 1. Check action name spelling
store.dispatch("increment");  // Must match exactly

// 2. For namespaced actions, use dot notation
store.dispatch("auth.login", payload);  // Not "authLogin"

// 3. Make sure action is defined
app.use(Store, {
  actions: {
    increment: (state) => state.count.value++  // Must exist
  }
});
```

### Persistence Not Working

**Problem:** State not being saved/loaded from storage.

**Solutions:**

```javascript
// 1. Check persistence is enabled
persistence: {
  enabled: true,  // Must be true
  key: "my-store"
}

// 2. Check include/exclude paths
persistence: {
  include: ["theme"]  // Only these are persisted
}

// 3. Check storage availability
if (typeof window !== "undefined" && window.localStorage) {
  // Storage is available
}

// 4. Check for storage quota errors
onError: (error, context) => {
  if (error.name === "QuotaExceededError") {
    console.warn("Storage quota exceeded");
  }
}
```

### Module Already Exists

**Problem:** `Module "name" already exists` warning.

**Solution:**

```javascript
// Check before registering
if (!store.state.myModule) {
  store.registerModule("myModule", { /* ... */ });
}

// Or unregister first
store.unregisterModule("myModule");
store.registerModule("myModule", { /* ... */ });
```

### Circular State Updates

**Problem:** Infinite loop of state updates.

**Solution:**

```javascript
// Avoid updating state in watchers that trigger re-renders
// Wrong
store.state.count.watch(() => {
  store.state.count.value++;  // Infinite loop!
});

// Right - use conditions
store.state.count.watch((value) => {
  if (value < 100) {
    // Safe conditional update
  }
});
```

---

## Batching Tips & Gotchas

Eleva uses **render batching** via `queueMicrotask` to optimize performance. This means DOM updates happen asynchronously after state changes. Here's what you need to know when using the Store plugin:

### 1. Multiple Dispatches Are Batched

When you dispatch multiple actions in sequence, DOM updates are batched into a single render:

```javascript
// These three dispatches result in ONE DOM update, not three
store.dispatch("increment");
store.dispatch("setUser", { name: "John" });
store.dispatch("setTheme", "dark");
// DOM updates after all three complete
```

**Benefit**: Better performance. No unnecessary intermediate renders.

### 2. DOM Updates Are Async

After dispatching an action, the DOM won't update immediately:

```javascript
store.dispatch("increment");
console.log(document.querySelector('.count').textContent); // Still shows OLD value!

// To read updated DOM, wait for the microtask:
store.dispatch("increment");
queueMicrotask(() => {
  console.log(document.querySelector('.count').textContent); // Now shows NEW value
});
```

### 3. Tests May Need Delays

When testing Store-based components, allow time for batched renders:

```javascript
// In tests, use await with a small delay or queueMicrotask
test("counter increments", async () => {
  store.dispatch("increment");

  // Wait for batched render
  await new Promise(resolve => queueMicrotask(resolve));

  expect(document.querySelector('.count').textContent).toBe("1");
});
```

### 4. Use Immutable Updates for Arrays/Objects

Always create new references for clearer state changes and proper reactivity:

```javascript
// Good - new array reference triggers update
state.todos.value = [...state.todos.value, newTodo];

// Bad - mutation may not trigger update
state.todos.value.push(newTodo); // Might not re-render!
```

### 5. Subscription Callbacks Are Synchronous

While DOM updates are batched, `store.subscribe()` callbacks fire immediately after each dispatch:

```javascript
store.subscribe((mutation, state) => {
  // This fires immediately after dispatch
  console.log("Action dispatched:", mutation.type);

  // But DOM hasn't updated yet!
  // Use queueMicrotask if you need to read the DOM
});
```

### 6. Async Actions and Batching

Each `await` in an async action creates a new batch boundary:

```javascript
actions: {
  loadData: async (state) => {
    state.loading.value = true;  // Batch 1

    const data = await fetchData();  // Batch boundary

    state.data.value = data;         // Batch 2
    state.loading.value = false;     // Batch 2 (same batch)
  }
}
```

---

## Migration Guide

### From Vuex

| Vuex | Eleva Store |
|------|-------------|
| `state: { count: 0 }` | `state: { count: 0 }` |
| `mutations` | `actions` (combined) |
| `actions` | `actions` (async supported) |
| `getters` | Computed in components |
| `modules` | `namespaces` |
| `this.$store.state.count` | `store.state.count.value` |
| `this.$store.commit('increment')` | `store.dispatch('increment')` |
| `this.$store.dispatch('fetchData')` | `store.dispatch('fetchData')` |
| `mapState`, `mapGetters` | Destructure in `setup()` |

### From Redux

| Redux | Eleva Store |
|-------|-------------|
| `createStore(reducer)` | `app.use(Store, { state, actions })` |
| Reducers (pure functions) | `actions` (mutate directly) |
| `store.getState()` | `store.getState()` or `store.state.*.value` |
| `store.dispatch({ type, payload })` | `store.dispatch("type", payload)` |
| `store.subscribe()` | `store.subscribe()` |
| `combineReducers` | `namespaces` |
| `connect()` HOC | Access in `setup({ store })` |
| Middleware | `subscribe()` + custom logic |
| Redux Thunk | Actions support async natively |

### From MobX

| MobX | Eleva Store |
|------|-------------|
| `observable({ count: 0 })` | `state: { count: 0 }` (auto-wrapped in Signals) |
| `action` decorator | Define in `actions` object |
| `computed` | Compute in components |
| `observer` HOC | Not needed (automatic) |
| `autorun` | `store.subscribe()` |
| `runInAction` | Just call `dispatch()` |

---

## Summary

### Store Statistics

| Metric | Value |
|--------|-------|
| **Bundle Size** | ~6KB minified |
| **API Methods** | 10 (dispatch, subscribe, getState, etc.) |
| **Storage Options** | 2 (localStorage, sessionStorage) |
| **State Access** | Direct via Signals |
| **Async Support** | Native (actions can be async) |

### Core API Quick Reference

| Method | Purpose |
|--------|---------|
| `store.state` | Access reactive state |
| `store.dispatch(action, payload)` | Execute action |
| `store.subscribe(callback)` | Listen to mutations |
| `store.getState()` | Get state snapshot |
| `store.replaceState(state)` | Replace all state |
| `store.registerModule(name, module)` | Add module |
| `store.unregisterModule(name)` | Remove module |
| `store.createState(key, value)` | Add state property |
| `store.createAction(name, fn)` | Add action |
| `store.clearPersistedState()` | Clear storage |

### Key Concepts

1. **State** - Reactive data wrapped in Signals
2. **Actions** - Functions that mutate state
3. **Namespaces** - Modular organization
4. **Persistence** - Automatic storage sync
5. **Subscriptions** - React to all mutations
6. **Dynamic Modules** - Runtime extensibility

For questions or issues, visit the [GitHub repository](https://github.com/TarekRaafat/eleva).

---

[← Back to Plugins](./index.md) | [Previous: Router Plugin](./router.md) | [Back to Main Docs](../index.md)
