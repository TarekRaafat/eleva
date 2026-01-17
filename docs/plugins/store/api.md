---
title: Store API Reference
description: Complete API reference for Eleva Store plugin including methods, TypeScript support, troubleshooting, and migration guide.
---

# Store API Reference

Complete reference for the Eleva Store plugin.

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `store.state` | `Object` | Reactive state object with Signal properties |

---

## Methods

### dispatch(actionName, payload?)

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

### subscribe(callback)

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

### getState()

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

### replaceState(newState)

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

### registerModule(namespace, module)

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

### unregisterModule(namespace)

Removes a dynamically registered module.

```javascript
// Signature
store.unregisterModule(namespace: string): void

// Example
store.unregisterModule("wishlist");
// store.state.wishlist is now undefined
```

### createState(key, initialValue)

Creates a new state property at runtime.

```javascript
// Signature
store.createState(key: string, initialValue: any): Signal

// Example
const theme = store.createState("theme", "dark");
console.log(theme.value); // "dark"
console.log(store.state.theme.value); // "dark"
```

### createAction(name, actionFn)

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

### clearPersistedState()

Clears persisted state from storage.

```javascript
// Signature
store.clearPersistedState(): void

// Example
store.clearPersistedState();
// localStorage/sessionStorage entry is removed
```

---

## Eleva Instance Shortcuts

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

## Uninstalling the Plugin

The Store plugin provides an `uninstall()` method to completely remove it from an Eleva instance.

### Store.uninstall(app)

Removes the Store plugin and restores the original Eleva behavior.

```javascript
import Eleva from "eleva";
import { Store } from "eleva/plugins";

const app = new Eleva("MyApp");
app.use(Store, {
  state: { count: 0 },
  actions: { increment: (state) => state.count.value++ }
});

// Use the store...
app.store.dispatch("increment");

// Later, to completely remove the Store plugin:
Store.uninstall(app);

// After uninstall, these are removed:
// - app.store (undefined)
// - app.dispatch (undefined)
// - app.getState (undefined)
// - app.subscribe (undefined)
// - app.createAction (undefined)
// - Original mount() method is restored
```

### What `Store.uninstall()` Does

1. **Restores original methods:**
   - `app.mount` → restored to original
   - `app._mountComponents` → restored to original

2. **Removes added properties:**
   - `app.store`
   - `app.dispatch`
   - `app.getState`
   - `app.subscribe`
   - `app.createAction`

### When to Use

- Completely removing state management from your app
- Switching to a different state management solution
- Full app teardown/cleanup
- Testing scenarios requiring clean slate

### Uninstall Order (LIFO)

When using multiple plugins, uninstall in reverse order of installation:

```javascript
// Installation order
app.use(Attr);
app.use(Store, { state: {} });
app.use(Router, { routes: [] });

// Uninstall in reverse order (LIFO)
await Router.uninstall(app);  // Last installed, first uninstalled
Store.uninstall(app);
Attr.uninstall(app);
```

> **Note:** Store's `uninstall()` is synchronous (not async), unlike Router's which is async.

---

## TypeScript Support

The Store plugin includes TypeScript type definitions for full type safety.

### Basic Typed Store

```typescript
import Eleva from "eleva";
import { Store } from "eleva/plugins";

// Define your state shape
interface AppState {
  count: number;
  user: User | null;
  theme: "light" | "dark";
}

interface User {
  id: number;
  name: string;
  email: string;
}

// Define action payloads
interface ActionPayloads {
  increment: void;
  setCount: number;
  setUser: User | null;
  setTheme: "light" | "dark";
}

const app = new Eleva("TypedApp");

app.use(Store, {
  state: {
    count: 0,
    user: null,
    theme: "light"
  } as AppState,

  actions: {
    increment: (state) => {
      state.count.value++;
    },
    setCount: (state, value: number) => {
      state.count.value = value;
    },
    setUser: (state, user: User | null) => {
      state.user.value = user;
    },
    setTheme: (state, theme: "light" | "dark") => {
      state.theme.value = theme;
    }
  }
});

// Type-safe dispatch
app.store.dispatch("setCount", 10);
app.store.dispatch("setUser", { id: 1, name: "John", email: "john@example.com" });
```

### Typed Component Setup

```typescript
interface ComponentContext {
  store: {
    state: {
      count: Signal<number>;
      user: Signal<User | null>;
    };
    dispatch: (action: string, payload?: unknown) => Promise<unknown>;
  };
  signal: <T>(value: T) => Signal<T>;
}

app.component("TypedComponent", {
  setup({ store, signal }: ComponentContext) {
    const localValue = signal<string>("");

    const increment = () => store.dispatch("increment");
    const setUser = (user: User) => store.dispatch("setUser", user);

    return {
      count: store.state.count,
      user: store.state.user,
      localValue,
      increment,
      setUser
    };
  },
  template: (ctx) => `
    <div>
      <p>Count: ${ctx.count.value}</p>
      <p>User: ${ctx.user.value?.name || "Guest"}</p>
    </div>
  `
});
```

### Typed Namespaces

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface CartState {
  items: CartItem[];
  total: number;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

app.use(Store, {
  namespaces: {
    auth: {
      state: {
        user: null,
        token: null,
        isAuthenticated: false
      } as AuthState,
      actions: {
        login: (state, payload: { user: User; token: string }) => {
          state.auth.user.value = payload.user;
          state.auth.token.value = payload.token;
          state.auth.isAuthenticated.value = true;
        },
        logout: (state) => {
          state.auth.user.value = null;
          state.auth.token.value = null;
          state.auth.isAuthenticated.value = false;
        }
      }
    },
    cart: {
      state: {
        items: [],
        total: 0
      } as CartState,
      actions: {
        addItem: (state, item: CartItem) => {
          state.cart.items.value = [...state.cart.items.value, item];
          state.cart.total.value += item.price * item.quantity;
        }
      }
    }
  }
});
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

[← Back to Advanced](./advanced.md) | [Back to Store Overview](./index.md) | [Examples →](../../examples/index.md)
