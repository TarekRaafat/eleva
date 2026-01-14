---
title: Store Usage Patterns
description: Real-world examples of using Eleva Store plugin for counter, todo list, authentication, and shopping cart.
---

# Store Usage Patterns

This guide shows practical examples of using the Store plugin in real-world scenarios.

---

## Basic Counter

A simple counter demonstrating core Store concepts.

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

---

## Todo List

A complete todo application with filtering and persistence.

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

---

## Authentication Flow

A complete authentication implementation with loading and error states.

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

---

## Shopping Cart

A shopping cart with quantity management and totals.

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

## Component Error Handling

Handle errors gracefully when dispatching actions.

```javascript
app.component("UserList", {
  setup({ store, signal }) {
    const localError = signal(null);

    const loadUsers = async () => {
      try {
        await store.dispatch("fetchUsers");
      } catch (error) {
        // Handle at component level
        localError.value = "Failed to load users";
        console.error("Component caught:", error);
      }
    };

    return {
      users: store.state.users,
      error: store.state.error,
      localError,
      isLoading: store.state.isLoading,
      loadUsers,
      onMount: loadUsers
    };
  },
  template: (ctx) => `
    <div>
      ${ctx.isLoading.value ? `<p>Loading...</p>` :
        ctx.error.value ? `
          <div class="error">
            <p>${ctx.error.value}</p>
            <button @click="loadUsers">Retry</button>
          </div>
        ` : `
          <ul>
            ${ctx.users.value.map(u => `<li key="${u.id}">${u.name}</li>`).join("")}
          </ul>
        `
      }
    </div>
  `
});
```

---

## Next Steps

- [Advanced](./advanced.md) - Dynamic modules and async patterns
- [API Reference](./api.md) - Complete method reference

---

[← Back to Configuration](./configuration.md) | [Next: Advanced →](./advanced.md)
