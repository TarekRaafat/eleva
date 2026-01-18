---
title: Migrate from React
description: React to Eleva.js migration guide. Learn how useState maps to signals, useEffect to watchers, and JSX to template strings.
---

<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-S4L689921Q"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", "G-S4L689921Q");
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Migrate from React to Eleva.js",
  "description": "Learn how to migrate your React application to Eleva.js, converting hooks to signals, JSX to template strings, and Redux to Eleva Store.",
  "image": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png",
  "totalTime": "PT30M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  },
  "supply": [
    {
      "@type": "HowToSupply",
      "name": "Existing React application"
    },
    {
      "@type": "HowToSupply",
      "name": "Text editor or IDE"
    }
  ],
  "tool": [
    {
      "@type": "HowToTool",
      "name": "Eleva.js (~2.3KB gzipped)"
    }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "name": "Replace useState with signal",
      "text": "Convert React's useState hooks to Eleva signals. Change const [value, setValue] = useState(initial) to const value = signal(initial), and setValue(x) to value.value = x.",
      "url": "https://elevajs.com/migration/from-react.html#state-usestate--signal"
    },
    {
      "@type": "HowToStep",
      "name": "Replace useEffect with signal.watch",
      "text": "Convert useEffect hooks with dependencies to signal.watch() calls. Each signal has its own watch method for side effects, eliminating dependency arrays.",
      "url": "https://elevajs.com/migration/from-react.html#effects-useeffect--signalwatch"
    },
    {
      "@type": "HowToStep",
      "name": "Remove useMemo and useCallback",
      "text": "Replace useMemo with plain functions and remove useCallback entirely. Eleva's batching handles optimization automatically without memoization hooks.",
      "url": "https://elevajs.com/migration/from-react.html#memoization-usememousecallback"
    },
    {
      "@type": "HowToStep",
      "name": "Convert JSX to template strings",
      "text": "Replace JSX syntax with JavaScript template literals. Change onClick to @click, map conditions to ternary expressions, and use ${ctx.value.value} for interpolation.",
      "url": "https://elevajs.com/migration/from-react.html#common-migration-patterns"
    },
    {
      "@type": "HowToStep",
      "name": "Replace React Router with Eleva Router",
      "text": "Migrate from React Router to Eleva Router plugin. Configure routes array and use router.navigate() for programmatic navigation.",
      "url": "https://elevajs.com/migration/from-react.html#react-router--eleva-router"
    },
    {
      "@type": "HowToStep",
      "name": "Replace Redux/Context with Eleva Store",
      "text": "Convert Redux slices or Context providers to Eleva Store plugin. Define state and actions, then access via setup({ store }) in components.",
      "url": "https://elevajs.com/migration/from-react.html#redux--eleva-store"
    }
  ]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Migrate from React to Eleva.js",
  "description": "React to Eleva.js migration guide. Learn how useState maps to signals, useEffect to watchers, and JSX to template strings.",
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
    "@id": "https://elevajs.com/migration/from-react.html"
  },
  "proficiencyLevel": "Intermediate",
  "articleSection": "Migration",
  "keywords": ["eleva", "elevajs", "Eleva.js", "React migration", "useState", "signals", "JSX", "template strings"]
}
</script>

# Migrating from React

> **Migration Guide** | For React developers transitioning to Eleva.

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
| `<Component prop={val} />` | `:prop="val"` | Attribute syntax |
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

    // Fetch user data
    const fetchData = async (id) => {
      loading.value = true;
      user.value = await fetchUser(id);
      loading.value = false;
    };

    // Watch user for side effects (like updating document title)
    user.watch((userData) => {
      document.title = userData?.name || 'Loading...';
    });

    return {
      user,
      loading,
      // Fetch initial data after mount
      onMount: () => fetchData(props.userId)
    };
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
- Props can be Signals or plain values depending on what the parent passes
- This example assumes `props.userId` is a plain value (parent passed `:userId="id.value"`)
- Use `onMount` lifecycle hook to fetch data after component mounts
- Each signal has its own `.watch()` method for side effects
- No dependency arrays to manage
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
    // Note: props can be Signals or values depending on what parent passes
    // This example assumes parent passed values (e.g., :items="items.value")
    const filteredItems = () => {
      return props.items.filter(item =>
        item.name.includes(props.filter)
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
