# Migrating from React

> **Version:** 1.0.0-rc.14 | A comprehensive guide for React developers transitioning to Eleva

This guide helps React developers understand Eleva by mapping familiar React concepts to their Eleva equivalents.

---

## TL;DR - Quick Reference

| React | Eleva | Notes |
|-------|-------|-------|
| `useState(initial)` | `signal(initial)` | No array destructuring needed |
| `setState(newValue)` | `signal.value = newValue` | Direct assignment |
| `useEffect(() => {}, [dep])` | `signal.watch(fn)` | Automatic dependency |
| `useRef(initial)` | `signal(initial)` | Same API for refs |
| `useMemo(() => val, [deps])` | Regular function | Computed on access |
| `useCallback(fn, [deps])` | Regular function | No memoization needed |
| `<Component prop={val} />` | `:prop="${val}"` | Attribute syntax |
| `{condition && <El />}` | `${cond ? '<El />' : ''}` | Template literal |
| `onClick={() => fn()}` | `@click="fn"` | Event syntax |
| JSX | Template strings | No transpilation |

---

## Core Concepts

### State: useState → signal

**React:**
```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(c => c - 1)}>-</button>
    </div>
  );
}
```

**Eleva:**
```javascript
const Counter = {
  setup({ signal }) {
    const count = signal(0);

    return {
      count,
      increment: () => count.value++,
      decrement: () => count.value--
    };
  },
  template: (ctx) => `
    <div>
      <p>Count: ${ctx.count.value}</p>
      <button @click="increment">+</button>
      <button @click="decrement">-</button>
    </div>
  `
};
```

**Key differences:**
- No array destructuring `[value, setValue]`
- Direct `.value` assignment instead of setter function
- No re-render of entire component; only affected DOM updates

---

### Effects: useEffect → signal.watch

**React:**
```jsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchUser(userId)
      .then(data => setUser(data))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    document.title = user?.name || 'Loading...';
  }, [user]);

  if (loading) return <p>Loading...</p>;
  return <h1>{user.name}</h1>;
}
```

**Eleva:**
```javascript
const UserProfile = {
  setup({ signal, props }) {
    const user = signal(null);
    const loading = signal(true);

    // Fetch on userId change
    const fetchData = async (id) => {
      loading.value = true;
      user.value = await fetchUser(id);
      loading.value = false;
    };

    // Initial fetch
    fetchData(props.userId.value);

    // Watch for userId changes
    props.userId.watch((newId) => {
      fetchData(newId);
    });

    // Watch user for side effects
    user.watch((userData) => {
      document.title = userData?.name || 'Loading...';
    });

    return { user, loading };
  },
  template: (ctx) => `
    ${ctx.loading.value
      ? '<p>Loading...</p>'
      : `<h1>${ctx.user.value.name}</h1>`
    }
  `
};
```

**Key differences:**
- No dependency arrays to manage
- Each signal has its own `.watch()` method
- No cleanup function syntax (return unsubscribe if needed)
- Effects run on signal change, not component re-render

---

### Refs: useRef → signal

**React:**
```jsx
import { useRef, useEffect } from 'react';

function TextInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} type="text" />;
}
```

**Eleva:**
```javascript
const TextInput = {
  setup({ signal }) {
    // For DOM references, query after render
    const focusInput = () => {
      queueMicrotask(() => {
        document.querySelector('#my-input')?.focus();
      });
    };

    // Call on mount
    focusInput();

    return {};
  },
  template: () => `
    <input id="my-input" type="text" />
  `
};
```

**For mutable values:**
```javascript
// React
const renderCount = useRef(0);
renderCount.current++;

// Eleva - use signal for mutable values
const renderCount = signal(0);
renderCount.value++;
```

---

### Memoization: useMemo/useCallback

**React:**
```jsx
import { useMemo, useCallback } from 'react';

function ExpensiveList({ items, filter }) {
  const filteredItems = useMemo(() => {
    return items.filter(item => item.name.includes(filter));
  }, [items, filter]);

  const handleClick = useCallback((id) => {
    console.log('Clicked:', id);
  }, []);

  return (
    <ul>
      {filteredItems.map(item => (
        <li key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

**Eleva:**
```javascript
const ExpensiveList = {
  setup({ props }) {
    // Computed values - just use functions
    // They're called during template execution
    const filteredItems = () => {
      return props.items.value.filter(item =>
        item.name.includes(props.filter.value)
      );
    };

    // No useCallback needed - functions aren't recreated on render
    const handleClick = (id) => {
      console.log('Clicked:', id);
    };

    return { filteredItems, handleClick };
  },
  template: (ctx) => `
    <ul>
      ${ctx.filteredItems().map(item => `
        <li key="${item.id}" @click="() => handleClick(${item.id})">
          ${item.name}
        </li>
      `).join('')}
    </ul>
  `
};
```

**Key differences:**
- No `useMemo` needed; Eleva's batching handles optimization
- No `useCallback` needed; functions are stable
- No dependency arrays to maintain
- Template is only re-rendered when signals change

---

### Context: React Context → Eleva Store

**React:**
```jsx
// ThemeContext.js
const ThemeContext = createContext('light');

// App.js
function App() {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Header />
      <Main />
    </ThemeContext.Provider>
  );
}

// Header.js
function Header() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <header className={theme}>
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </header>
  );
}
```

**Eleva:**
```javascript
import Eleva from "eleva";
import { Store } from "eleva/plugins";

const app = new Eleva("App");

// Global store replaces Context
app.use(Store, {
  state: {
    theme: "light"
  },
  actions: {
    toggleTheme: (state) => {
      state.theme.value = state.theme.value === "light" ? "dark" : "light";
    }
  }
});

// Header component
app.component("Header", {
  setup({ store }) {
    return {
      theme: store.state.theme,
      toggleTheme: () => store.dispatch("toggleTheme")
    };
  },
  template: (ctx) => `
    <header class="${ctx.theme.value}">
      <button @click="toggleTheme">Toggle Theme</button>
    </header>
  `
});
```

**Key differences:**
- No Provider/Consumer pattern
- Store is globally available via `setup({ store })`
- Actions provide predictable state mutations
- No prop drilling needed

---

### Component Composition

**React:**
```jsx
// Parent
function TodoList() {
  const [todos, setTodos] = useState([]);

  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text, done: false }]);
  };

  return (
    <div>
      <TodoForm onAdd={addTodo} />
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
}

// Child
function TodoItem({ todo }) {
  return <li>{todo.text}</li>;
}
```

**Eleva:**
```javascript
// Parent
app.component("TodoList", {
  setup({ signal }) {
    const todos = signal([]);

    const addTodo = (text) => {
      todos.value = [...todos.value, { id: Date.now(), text, done: false }];
    };

    return { todos, addTodo };
  },
  template: (ctx) => `
    <div>
      <div class="todo-form" :on-add="addTodo"></div>
      ${ctx.todos.value.map(todo => `
        <div key="${todo.id}" class="todo-item" :todo="todo"></div>
      `).join('')}
    </div>
  `,
  children: {
    ".todo-form": "TodoForm",
    ".todo-item": "TodoItem"
  }
});

// Child
app.component("TodoItem", {
  setup({ props }) {
    return { todo: props.todo };
  },
  template: (ctx) => `
    <li>${ctx.todo.value.text}</li>
  `
});
```

**Key differences:**
- Children defined in `children` object, not JSX
- Props passed via `:prop` attributes
- JSON.stringify needed for object props

---

## React Router → Eleva Router

**React Router:**
```jsx
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/users">Users</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

function UserProfile() {
  const { id } = useParams();
  return <h1>User {id}</h1>;
}
```

**Eleva Router:**
```javascript
import Eleva from "eleva";
import { Router } from "eleva/plugins";

const app = new Eleva("App");

const router = app.use(Router, {
  mode: "history",  // or "hash" for no server config
  mount: "#app",
  routes: [
    { path: "/", component: Home },
    { path: "/users", component: Users },
    { path: "/users/:id", component: UserProfile }
  ]
});

const UserProfile = {
  setup({ router }) {
    const userId = router.currentParams.value.id;
    return { userId };
  },
  template: (ctx) => `
    <h1>User ${ctx.userId}</h1>
  `
};

// Navigation
router.navigate("/users/123");

// In templates
`<a href="#/users">Users</a>`  // hash mode
```

---

## Redux → Eleva Store

**Redux:**
```javascript
// store.js
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1 },
    decrement: (state) => { state.value -= 1 },
    incrementByAmount: (state, action) => { state.value += action.payload }
  }
});

// Component
function Counter() {
  const count = useSelector(state => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
    </div>
  );
}
```

**Eleva Store:**
```javascript
import Eleva from "eleva";
import { Store } from "eleva/plugins";

const app = new Eleva("App");

app.use(Store, {
  state: {
    count: 0
  },
  actions: {
    increment: (state) => state.count.value++,
    decrement: (state) => state.count.value--,
    incrementByAmount: (state, amount) => state.count.value += amount
  }
});

const Counter = {
  setup({ store }) {
    return {
      count: store.state.count,
      increment: () => store.dispatch("increment"),
      incrementByAmount: (n) => store.dispatch("incrementByAmount", n)
    };
  },
  template: (ctx) => `
    <div>
      <span>${ctx.count.value}</span>
      <button @click="increment">+</button>
      <button @click="() => incrementByAmount(5)">+5</button>
    </div>
  `
};
```

---

## Common Migration Patterns

### Conditional Rendering

```jsx
// React
{isLoading && <Spinner />}
{error ? <Error msg={error} /> : <Content data={data} />}
{items.length > 0 && <List items={items} />}
```

```javascript
// Eleva
`${ctx.isLoading.value ? '<div class="spinner"></div>' : ''}`
`${ctx.error.value
  ? `<div class="error">${ctx.error.value}</div>`
  : `<div class="content">${ctx.data.value}</div>`
}`
`${ctx.items.value.length > 0
  ? ctx.items.value.map(i => `<li key="${i.id}">${i.name}</li>`).join('')
  : ''
}`
```

### Form Handling

```jsx
// React
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ name, email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} />
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

```javascript
// Eleva
const Form = {
  setup({ signal }) {
    const name = signal('');
    const email = signal('');

    const handleSubmit = (e) => {
      e.preventDefault();
      console.log({ name: name.value, email: email.value });
    };

    return { name, email, handleSubmit };
  },
  template: (ctx) => `
    <form @submit="handleSubmit">
      <input
        value="${ctx.name.value}"
        @input="(e) => name.value = e.target.value"
      />
      <input
        value="${ctx.email.value}"
        @input="(e) => email.value = e.target.value"
      />
      <button type="submit">Submit</button>
    </form>
  `
};
```

### Lifecycle Events

```jsx
// React
useEffect(() => {
  console.log('Mounted');
  return () => console.log('Unmounted');
}, []);

useEffect(() => {
  console.log('Count changed:', count);
}, [count]);
```

```javascript
// Eleva
setup({ signal }) {
  const count = signal(0);

  // Mount equivalent - runs once during setup
  console.log('Mounted');

  // Watch for changes
  count.watch((newVal) => {
    console.log('Count changed:', newVal);
  });

  // Unmount - if using router or manual unmount
  return {
    count,
    onUnmount: () => console.log('Unmounted')
  };
}
```

---

## What You Gain

### No More Hooks Rules
- Call signals anywhere, not just top level
- No exhaustive-deps warnings
- No stale closure issues

### Simpler Mental Model
- Direct mutation: `signal.value = newValue`
- No "why did this re-render?" debugging
- No useCallback/useMemo optimization dance

### Smaller Bundle
- ~2.5KB vs React's ~40KB
- No virtual DOM overhead
- No reconciler complexity

### Better Performance
- 240+ FPS rendering capability
- Batched updates via microtasks
- Only affected DOM nodes update

---

## Migration Checklist

- [ ] Replace `useState` with `signal()`
- [ ] Replace `useEffect` with `signal.watch()`
- [ ] Remove `useMemo`/`useCallback` (usually not needed)
- [ ] Convert JSX to template strings
- [ ] Replace `onClick` with `@click`
- [ ] Replace React Router with Eleva Router
- [ ] Replace Redux/Context with Eleva Store
- [ ] Update tests for async DOM updates (use `queueMicrotask`)

---

[← Back to Migration Overview](./index.md) | [From Vue →](./from-vue.md)
