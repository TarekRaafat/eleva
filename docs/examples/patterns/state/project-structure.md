---
title: Project Structure
description: Eleva.js project structures for simple and advanced applications with pages, layouts, and routing.
---

<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-S4L689921Q"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", "G-S4L689921Q");
</script>

# Project Structure

> **State Patterns** | Organizing Eleva applications for maintainability and scalability.

Choose the right structure based on your application's complexity.

---

## Quick Comparison

| Feature | Simple | Advanced |
|---------|--------|----------|
| **Best for** | Small apps, widgets, prototypes | Multi-page apps, SPAs |
| **Routing** | No | Yes (Router plugin) |
| **Layouts** | No | Yes (shared layouts) |
| **State management** | Local signals | Store plugin |
| **File count** | 5-15 files | 15+ files |

---

## Simple Structure

Best for small applications, embedded widgets, or prototypes without routing.

```
my-eleva-app/
├── index.html
├── src/
│   ├── main.js                # App initialization
│   ├── app.js                 # Eleva instance
│   ├── components/
│   │   ├── Counter.js         # Component with inline style
│   │   ├── Header.js
│   │   └── index.js           # Component exports
│   ├── utils/
│   │   └── helpers.js
│   └── styles/
│       └── main.css           # Global styles only
└── package.json
```

### Simple Structure Implementation

#### index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Eleva App</title>
  <link rel="stylesheet" href="./src/styles/main.css">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./src/main.js"></script>
</body>
</html>
```

#### src/app.js - Shared Eleva instance

```javascript
import Eleva from "eleva";

export const app = new Eleva("MyApp");
```

#### src/components/Counter.js

```javascript
import { app } from "../app.js";

const Counter = {
  setup({ signal, props }) {
    const count = signal(props.initialValue || 0);
    const step = props.step || 1;

    return {
      count,
      step,
      increment: () => count.value += step,
      decrement: () => count.value -= step,
      reset: () => count.value = props.initialValue || 0
    };
  },

  template: (ctx) => `
    <div class="counter">
      <h3>${ctx.props.label || "Counter"}</h3>
      <p>Value: ${ctx.count.value}</p>
      <button @click="decrement">-${ctx.step}</button>
      <button @click="reset">Reset</button>
      <button @click="increment">+${ctx.step}</button>
    </div>
  `,

  // Component-specific styles (encapsulated)
  style: `
    .counter {
      padding: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      text-align: center;
    }
    .counter button {
      margin: 0 0.25rem;
      padding: 0.5rem 1rem;
    }
  `
};

app.component("Counter", Counter);
export default Counter;
```

#### src/components/Header.js

```javascript
import { app } from "../app.js";

const Header = {
  template: (ctx) => `
    <header class="header">
      <h1>${ctx.props.title || "My App"}</h1>
    </header>
  `,

  style: `
    .header {
      padding: 1rem 1.5rem;
      background: var(--header-bg, #f5f5f5);
      border-bottom: 1px solid var(--border-color, #e0e0e0);
    }
    .header h1 {
      margin: 0;
      font-size: 1.5rem;
    }
  `
};

app.component("Header", Header);
export default Header;
```

#### src/components/index.js - Component registry

```javascript
import "./Counter.js";
import "./Header.js";

export { default as Counter } from "./Counter.js";
export { default as Header } from "./Header.js";
```

#### src/main.js - Entry point

```javascript
import { app } from "./app.js";
import "./components/index.js";

app.component("App", {
  template: () => `
    <div class="app">
      <app-header :title="'Counter Demo'"></app-header>
      <main>
        <app-counter :label="'Main Counter'" :initialValue="0" :step="1"></app-counter>
        <app-counter :label="'By Fives'" :initialValue="0" :step="5"></app-counter>
      </main>
    </div>
  `,
  children: {
    "app-header": "Header",
    "app-counter": "Counter"
  }
});

app.mount(document.getElementById("app"), "App");
```

---

## Advanced Structure

Best for multi-page applications with routing, shared layouts, and global state.

```
my-eleva-app/
├── index.html
├── src/
│   ├── main.js                # App initialization
│   ├── app.js                 # Eleva instance + plugins
│   ├── router.js              # Route definitions
│   ├── store.js               # Global state
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Button.js
│   │   │   ├── Card.js
│   │   │   ├── Modal.js
│   │   │   └── index.js
│   │   ├── common/            # Shared app components
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   ├── Sidebar.js
│   │   │   └── index.js
│   │   └── index.js           # All component exports
│   ├── layouts/
│   │   ├── MainLayout.js      # Primary layout
│   │   ├── AuthLayout.js      # Auth pages layout
│   │   └── index.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── About.js
│   │   ├── users/
│   │   │   ├── UserList.js
│   │   │   ├── UserDetail.js
│   │   │   └── index.js
│   │   ├── auth/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── index.js
│   │   └── NotFound.js
│   ├── utils/
│   │   ├── api.js             # API utilities
│   │   ├── validators.js      # Form validation
│   │   └── helpers.js
│   └── styles/
│       ├── main.css           # Global styles, resets
│       └── variables.css      # CSS variables, theming
├── public/
│   └── assets/
│       └── images/
└── package.json
```

### Advanced Structure Implementation

#### src/app.js - Eleva instance with plugins

```javascript
import Eleva from "eleva";
import { Store } from "eleva/plugins";

export const app = new Eleva("MyApp");

// Install Store plugin
app.use(Store, {
  state: {
    user: null,
    theme: "light",
    notifications: []
  },
  actions: {
    setUser: (state, user) => state.user.value = user,
    setTheme: (state, theme) => state.theme.value = theme,
    addNotification: (state, msg) => {
      state.notifications.value = [...state.notifications.value, msg];
    },
    clearNotifications: (state) => state.notifications.value = []
  },
  persistence: {
    key: "app-state",
    include: ["user", "theme"]
  }
});
```

#### src/router.js - Route configuration

```javascript
import { app } from "./app.js";
import { Router } from "eleva/plugins";

// Import layouts
import { MainLayout, AuthLayout } from "./layouts/index.js";

// Import pages (lazy-loaded)
const Home = () => import("./pages/Home.js");
const About = () => import("./pages/About.js");
const UserList = () => import("./pages/users/UserList.js");
const UserDetail = () => import("./pages/users/UserDetail.js");
const Login = () => import("./pages/auth/Login.js");
const Register = () => import("./pages/auth/Register.js");
const NotFound = () => import("./pages/NotFound.js");

export const router = app.use(Router, {
  mode: "hash",
  mount: "#app",
  routes: [
    // Main layout routes
    { path: "/", component: Home, layout: MainLayout },
    { path: "/about", component: About, layout: MainLayout },
    { path: "/users", component: UserList, layout: MainLayout },
    { path: "/users/:id", component: UserDetail, layout: MainLayout },

    // Auth layout routes
    { path: "/auth/login", component: Login, layout: AuthLayout },
    { path: "/auth/register", component: Register, layout: AuthLayout },

    // 404 fallback
    { path: "*", component: NotFound }
  ],
  onBeforeEach: (to, from) => {
    const { store } = app;
    const isAuthenticated = store.state.user.value !== null;
    const authRoutes = ["/auth/login", "/auth/register"];
    const protectedRoutes = ["/users"];

    // Redirect authenticated users away from auth pages
    if (isAuthenticated && authRoutes.some((r) => to.path.startsWith(r))) {
      return "/";
    }

    // Redirect unauthenticated users to login
    if (!isAuthenticated && protectedRoutes.some((r) => to.path.startsWith(r))) {
      return "/auth/login";
    }

    return true;
  }
});
```

#### src/layouts/MainLayout.js

```javascript
import { app } from "../app.js";

const MainLayout = {
  setup({ signal }) {
    const sidebarOpen = signal(true);

    return {
      sidebarOpen,
      toggleSidebar: () => sidebarOpen.value = !sidebarOpen.value
    };
  },

  template: (ctx) => `
    <div class="layout layout--main ${ctx.sidebarOpen.value ? "sidebar-open" : ""}">
      <app-header :onMenuClick="toggleSidebar"></app-header>
      <div class="layout__body">
        <app-sidebar :open="sidebarOpen"></app-sidebar>
        <main id="view" class="layout__content"></main>
      </div>
      <app-footer></app-footer>
    </div>
  `,

  children: {
    "app-header": "Header",
    "app-sidebar": "Sidebar",
    "app-footer": "Footer"
  },

  style: `
    .layout--main {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .layout__body {
      display: flex;
      flex: 1;
    }
    .layout__content {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
    }
  `
};

app.component("MainLayout", MainLayout);
export default MainLayout;
```

#### src/layouts/AuthLayout.js

```javascript
import { app } from "../app.js";

const AuthLayout = {
  template: () => `
    <div class="layout layout--auth">
      <div class="auth-container">
        <div class="auth-logo">
          <img src="/assets/images/logo.svg" alt="Logo" />
        </div>
        <div class="auth-content">
          <div id="view"></div>
        </div>
      </div>
    </div>
  `,

  style: `
    .layout--auth {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .auth-container {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    .auth-logo {
      text-align: center;
      margin-bottom: 2rem;
    }
  `
};

app.component("AuthLayout", AuthLayout);
export default AuthLayout;
```

#### src/layouts/index.js

```javascript
import MainLayout from "./MainLayout.js";
import AuthLayout from "./AuthLayout.js";

export { MainLayout, AuthLayout };
```

#### src/components/common/Header.js

```javascript
import { app } from "../../app.js";

const Header = {
  setup({ props, store, router }) {

    return {
      user: store.state.user,
      theme: store.state.theme,
      onMenuClick: props.onMenuClick,
      toggleTheme: () => {
        app.dispatch("setTheme", store.state.theme.value === "light" ? "dark" : "light");
      },
      logout: () => {
        app.dispatch("setUser", null);
        router.navigate("/auth/login");
      }
    };
  },

  template: (ctx) => `
    <header class="header">
      <div class="header__left">
        <button class="header__menu-btn" @click="onMenuClick">
          ☰
        </button>
        <a href="#/" class="header__logo">MyApp</a>
      </div>

      <nav class="header__nav">
        <a href="#/">Home</a>
        <a href="#/about">About</a>
        ${ctx.user.value ? `<a href="#/users">Users</a>` : ""}
      </nav>

      <div class="header__right">
        <button @click="toggleTheme" class="header__theme-btn">
          ${ctx.theme.value === "light" ? "🌙" : "☀️"}
        </button>
        ${ctx.user.value
          ? `<span class="header__user">${ctx.user.value.name}</span>
             <button @click="logout" class="header__logout">Logout</button>`
          : `<a href="#/auth/login" class="header__login">Login</a>`
        }
      </div>
    </header>
  `,

  style: `
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      height: 60px;
      background: var(--header-bg, #fff);
      border-bottom: 1px solid var(--border-color, #e0e0e0);
    }
    .header__left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .header__nav {
      display: flex;
      gap: 1.5rem;
    }
    .header__nav a {
      text-decoration: none;
      color: var(--text-color, #333);
    }
    .header__right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
  `
};

app.component("Header", Header);
export default Header;
```

#### src/components/common/Sidebar.js

```javascript
import { app } from "../../app.js";

const Sidebar = {
  setup({ router, props }) {
    return {
      currentPath: router.current,
      isActive: (path) => router.current.value.path === path,
      open: props.open
    };
  },

  template: (ctx) => `
    <aside class="sidebar ${ctx.open.value ? "sidebar--open" : "sidebar--closed"}">
      <nav class="sidebar__nav">
        <a href="#/" class="${ctx.isActive("/") ? "active" : ""}">
          🏠 Dashboard
        </a>
        <a href="#/users" class="${ctx.isActive("/users") ? "active" : ""}">
          👥 Users
        </a>
        <a href="#/about" class="${ctx.isActive("/about") ? "active" : ""}">
          ℹ️ About
        </a>
      </nav>
    </aside>
  `,

  style: `
    .sidebar {
      background: var(--sidebar-bg, #f5f5f5);
      transition: width 0.3s ease;
      overflow: hidden;
    }
    .sidebar--open { width: 240px; }
    .sidebar--closed { width: 0; }
    .sidebar__nav {
      display: flex;
      flex-direction: column;
      padding: 1rem;
    }
    .sidebar__nav a {
      padding: 0.75rem 1rem;
      text-decoration: none;
      color: var(--text-color, #333);
      border-radius: 4px;
    }
    .sidebar__nav a:hover,
    .sidebar__nav a.active {
      background: var(--primary-light, #e3f2fd);
    }
  `
};

app.component("Sidebar", Sidebar);
export default Sidebar;
```

#### src/components/common/Footer.js

```javascript
import { app } from "../../app.js";

const Footer = {
  template: () => `
    <footer class="footer">
      <p>&copy; ${new Date().getFullYear()} MyApp. All rights reserved.</p>
    </footer>
  `,

  style: `
    .footer {
      padding: 1rem 1.5rem;
      text-align: center;
      background: var(--footer-bg, #f5f5f5);
      border-top: 1px solid var(--border-color, #e0e0e0);
    }
  `
};

app.component("Footer", Footer);
export default Footer;
```

#### src/components/common/index.js

```javascript
import Header from "./Header.js";
import Sidebar from "./Sidebar.js";
import Footer from "./Footer.js";

export { Header, Sidebar, Footer };
```

#### src/pages/Home.js

```javascript
import { app } from "../app.js";

const Home = {
  setup({ store }) {
    return { user: store.state.user };
  },

  template: (ctx) => `
    <div class="page page--home">
      <h1>Welcome${ctx.user.value ? `, ${ctx.user.value.name}` : ""}!</h1>
      <p>This is your dashboard.</p>

      <div class="stats-grid">
        <stat-card :title="'Users'" :value="'1,234'" :icon="'👥'"></stat-card>
        <stat-card :title="'Revenue'" :value="'$12,345'" :icon="'💰'"></stat-card>
        <stat-card :title="'Orders'" :value="'567'" :icon="'📦'"></stat-card>
      </div>
    </div>
  `,

  children: {
    "stat-card": "Card"
  }
};

app.component("Home", Home);
export default Home;
```

#### src/pages/users/UserList.js

```javascript
import { app } from "../../app.js";
import { fetchUsers } from "../../utils/api.js";

const UserList = {
  setup({ signal, onMount }) {
    const users = signal([]);
    const loading = signal(true);
    const error = signal(null);

    onMount(async () => {
      try {
        users.value = await fetchUsers();
      } catch (e) {
        error.value = e.message;
      } finally {
        loading.value = false;
      }
    });

    return { users, loading, error };
  },

  template: (ctx) => `
    <div class="page page--users">
      <h1>Users</h1>

      ${ctx.loading.value ? `<p>Loading users...</p>` : ""}

      ${ctx.error.value ? `<p class="error">${ctx.error.value}</p>` : ""}

      ${!ctx.loading.value && !ctx.error.value ? `
        <ul class="user-list">
          ${ctx.users.value.map(user => `
            <li key="${user.id}">
              <a href="#/users/${user.id}">${user.name}</a>
            </li>
          `).join("")}
        </ul>
      ` : ""}
    </div>
  `
};

app.component("UserList", UserList);
export default UserList;
```

#### src/pages/users/UserDetail.js

```javascript
import { app } from "../../app.js";
import { fetchUser } from "../../utils/api.js";

const UserDetail = {
  setup({ signal, onMount, router }) {
    const user = signal(null);
    const loading = signal(true);

    onMount(async () => {
      const id = router.params.id;
      user.value = await fetchUser(id);
      loading.value = false;
    });

    return { user, loading };
  },

  template: (ctx) => `
    <div class="page page--user-detail">
      ${ctx.loading.value ? `<p>Loading...</p>` : `
        <h1>${ctx.user.value?.name}</h1>
        <p>Email: ${ctx.user.value?.email}</p>
        <a href="#/users">← Back to Users</a>
      `}
    </div>
  `
};

app.component("UserDetail", UserDetail);
export default UserDetail;
```

#### src/pages/auth/Login.js

```javascript
import { app } from "../../app.js";

const Login = {
  setup({ signal, router }) {
    const email = signal("");
    const password = signal("");
    const error = signal("");
    const loading = signal(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      error.value = "";
      loading.value = true;

      try {
        // Simulate API call
        await new Promise(r => setTimeout(r, 1000));

        if (email.value && password.value) {
          app.dispatch("setUser", { name: email.value.split("@")[0], email: email.value });
          router.navigate("/");
        } else {
          error.value = "Please fill in all fields";
        }
      } finally {
        loading.value = false;
      }
    };

    return { email, password, error, loading, handleSubmit };
  },

  template: (ctx) => `
    <div class="auth-form">
      <h2>Login</h2>

      ${ctx.error.value ? `<p class="error">${ctx.error.value}</p>` : ""}

      <form @submit="handleSubmit">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            :value="email"
            @input="(e) => email.value = e.target.value"
            placeholder="you@example.com"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            :value="password"
            @input="(e) => password.value = e.target.value"
            placeholder="••••••••"
          />
        </div>

        <button type="submit" ${ctx.loading.value ? "disabled" : ""}>
          ${ctx.loading.value ? "Logging in..." : "Login"}
        </button>
      </form>

      <p class="auth-switch">
        Don't have an account? <a href="#/auth/register">Register</a>
      </p>
    </div>
  `
};

app.component("Login", Login);
export default Login;
```

#### src/main.js - Entry point

```javascript
import { app } from "./app.js";
import { router } from "./router.js";

// Import all components
import "./components/index.js";
import "./layouts/index.js";

// App is ready - router auto-starts by default
console.log("App initialized");
```

---

## File Organization Guidelines

### Simple Structure

| File Type | Location | Purpose |
|-----------|----------|---------|
| Eleva instance | `src/app.js` | Shared app instance |
| Components | `src/components/*.js` | UI components (with inline `style`) |
| Entry point | `src/main.js` | App initialization |
| Utilities | `src/utils/*.js` | Helper functions |
| Global styles | `src/styles/*.css` | CSS variables, resets, theming |

### Advanced Structure

| File Type | Location | Purpose |
|-----------|----------|---------|
| Eleva + plugins | `src/app.js` | App instance with Store |
| Routes | `src/router.js` | Route definitions |
| Layouts | `src/layouts/*.js` | Page layouts with a view container (default `#view`) |
| Pages | `src/pages/*.js` | Route components |
| UI components | `src/components/ui/*.js` | Reusable UI (Button, Card, Modal) |
| Common components | `src/components/common/*.js` | App-specific (Header, Footer) |
| Utilities | `src/utils/*.js` | API, validators, helpers |
| Global styles | `src/styles/*.css` | CSS variables, resets, theming |

> **Note:** Component-specific styles belong inside each component's `style` property for better encapsulation. The `styles/` folder is only for global styles like CSS variables, resets, and app-wide theming.

---

## When to Use Each Structure

### Choose Simple When:

- Building a small app or widget
- No routing needed
- Single page with interactive components
- Rapid prototyping
- Embedding in existing pages

### Choose Advanced When:

- Building a multi-page SPA
- Need URL-based navigation
- Require authentication flows
- Multiple layouts (admin, public, auth)
- Shared global state across pages
- Team collaboration on larger codebase

---

## Testing Components

```javascript
// src/components/Counter.test.js
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Eleva from "eleva";

describe("Counter Component", () => {
  let app;
  let container;

  beforeEach(() => {
    app = new Eleva("TestApp");
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("should increment count", async () => {
    app.component("Counter", {
      setup: ({ signal }) => {
        const count = signal(0);
        return { count, increment: () => count.value++ };
      },
      template: (ctx) => `
        <div>
          <span class="count">${ctx.count.value}</span>
          <button @click="increment">+</button>
        </div>
      `
    });

    await app.mount(container, "Counter");
    expect(container.querySelector(".count").textContent).toBe("0");

    container.querySelector("button").click();
    await new Promise(r => queueMicrotask(r));

    expect(container.querySelector(".count").textContent).toBe("1");
  });
});
```

---

[← Overview](./index.md) | [State Patterns →](./patterns.md)
