---
title: Store Core Concepts
description: Learn about state, actions, and namespaces in Eleva Store plugin.
---

# Store Core Concepts

This guide covers the fundamental concepts of the Store plugin: state, actions, and namespaces.

---

## State

State is the single source of truth for your application. All state properties are automatically wrapped in Eleva Signals, making them reactive.

### Defining State

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

### Accessing State in Components

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

### Reading and Writing State

**Important:** State properties are Signals. Always use `.value` to read or write:

```javascript
// Reading
const currentCount = store.state.count.value;

// Writing (prefer actions for mutations)
store.state.count.value = 10;
```

> **Best Practice:** Use actions for all state mutations to enable tracking and debugging.

### Watching Store State Changes

Store state properties are Signals, so you can use `.watch()` to react to changes. **Always clean up watchers in `onUnmount`** to prevent memory leaks:

```javascript
app.component("Notification", {
  setup({ store, signal }) {
    const message = signal("");
    let unwatchUser = null;

    return {
      message,

      onMount: () => {
        // Watch for user changes
        unwatchUser = store.state.user.watch((newUser) => {
          if (newUser) {
            message.value = `Welcome, ${newUser.name}!`;
          }
        });
      },

      onUnmount: () => {
        // Always clean up watchers!
        if (unwatchUser) {
          unwatchUser();
        }
      }
    };
  },
  template: (ctx) => `
    ${ctx.message.value ? `<div class="notification">${ctx.message.value}</div>` : ''}
  `
});
```

**Key Points:**
- `store.state.property.watch(callback)` returns an unsubscribe function
- Store the unsubscribe function and call it in `onUnmount`
- Useful for side effects like notifications, analytics, or syncing with external systems

---

## Actions

Actions are functions that mutate state. They provide a predictable way to change state and enable tracking/debugging.

### Defining Actions

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

### Dispatching Actions

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

### Immutable Updates for Arrays/Objects

> **Critical:** Store state uses signals internally, which detect changes via identity comparison (`===`). Array methods like `.push()`, `.pop()`, `.splice()` mutate the existing array without changing its reference, so **the UI won't update**.

Always create new references for proper reactivity:

```javascript
// Good - new array reference triggers update
state.todos.value = [...state.todos.value, newTodo];
state.todos.value = state.todos.value.filter(t => t.id !== id);
state.todos.value = state.todos.value.map(t => t.id === id ? {...t, done: true} : t);

// Bad - mutation doesn't trigger update (same reference!)
state.todos.value.push(newTodo);     // Won't re-render!
state.todos.value.splice(index, 1);  // Won't re-render!
state.todos.value[0].done = true;    // Won't re-render!
```

---

## Namespaces (Modules)

For larger applications, organize state into namespaced modules:

### Defining Namespaces

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

### Accessing Namespaced State and Actions

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

### 5. Use Computed Values for Derived State

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

## Next Steps

- [Configuration](./configuration.md) - Set up persistence and DevTools
- [Usage Patterns](./patterns.md) - Real-world examples
- [Advanced](./advanced.md) - Dynamic modules and async patterns

---

[← Back to Store](./index.md) | [Next: Configuration →](./configuration.md)
