# Props Plugin

> **Version:** 1.0.0-rc.12 | **Type:** Props Handling Plugin | **Bundle Size:** ~4.2KB minified | **Dependencies:** Eleva core

The Props plugin supercharges Eleva's component system by enabling automatic type detection, parsing, and reactivity for component props. It allows you to pass complex data structures (objects, arrays, dates) directly via HTML attributes and ensures they stay in sync with parent state.

---

## TL;DR - Quick Reference

### 30-Second Setup

```javascript
import Eleva from "eleva";
import { Props } from "eleva/plugins";

const app = new Eleva("App");
app.use(Props);  // Enable advanced props handling
```

### API Cheatsheet

| Feature | Syntax | Description |
|---------|--------|-------------|
| **Object Props** | `:user='{"name": "John"}'` | Pass JSON objects |
| **Array Props** | `:items='[1, 2, 3]'` | Pass arrays |
| **Boolean Props** | `:active="true"` | Boolean values |
| **Number Props** | `:count="42"` | Numeric values |
| **Date Props** | `:date="2023-01-01T00:00:00Z"` | ISO date strings |
| **Parse Utility** | `app.props.parse(value)` | Manual parsing |
| **Type Detection** | `app.props.detectType(value)` | Get value type |

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enableAutoParsing` | `boolean` | `true` | Automatic type detection and parsing |
| `enableReactivity` | `boolean` | `true` | Wrap props in signals for reactivity |
| `onError` | `function` | `null` | Custom error handler for parsing failures |

### Supported Type Conversions

| Input | Output | Example |
|-------|--------|---------|
| `"true"` / `"false"` | `boolean` | `"true"` → `true` |
| `"1"` / `"0"` | `boolean` | `"1"` → `true` |
| `""` (empty) | `boolean` | `""` → `true` |
| `"42"` / `"3.14"` | `number` | `"42"` → `42` |
| `'{"key": "val"}'` | `object` | → `{key: "val"}` |
| `'[1, 2, 3]'` | `array` | → `[1, 2, 3]` |
| `"null"` | `null` | → `null` |
| `"undefined"` | `undefined` | → `undefined` |
| ISO date string | `Date` | → `Date` object |

> **Template Context:** Use `${ctx.user.value}` in templates, `:prop="${ctx.data}"` for child props (both need `ctx.`).

---

## Installation

### Via Package Manager

```bash
# npm
npm install eleva

# yarn
yarn add eleva

# pnpm
pnpm add eleva

# bun
bun add eleva
```

### Via CDN

```html
<!-- Core + All Plugins -->
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/eleva-plugins.umd.min.js"></script>

<!-- Props Plugin Only -->
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/plugins/props.umd.min.js"></script>
```

---

## Getting Started

### Basic Setup

```javascript
import Eleva from "eleva";
import { Props } from "eleva/plugins";

// Create app instance
const app = new Eleva("MyApp");

// Install Props plugin with default options
app.use(Props);

// Or with custom configuration
app.use(Props, {
  enableAutoParsing: true,   // Automatically parse prop values
  enableReactivity: true,    // Make props reactive with signals
  onError: (error, value) => {
    console.error("Props parsing error:", error, value);
  }
});
```

### First Component with Props

```javascript
// Parent Component
app.component("UserList", {
  setup({ signal }) {
    const users = signal([
      { id: 1, name: "Alice", role: "Admin" },
      { id: 2, name: "Bob", role: "User" }
    ]);

    return { users };
  },
  template: (ctx) => `
    <div class="user-list">
      <h2>Users</h2>
      ${ctx.users.value.map(user => `
        <div key="${user.id}" class="user-card-container"
             :user='${JSON.stringify(user)}'
             :editable="true">
        </div>
      `).join('')}
    </div>
  `,
  children: {
    ".user-card-container": "UserCard"
  }
});

// Child Component
app.component("UserCard", {
  setup({ props }) {
    // Props are automatically parsed and reactive
    return {
      user: props.user,       // Parsed object
      editable: props.editable // Parsed boolean
    };
  },
  template: (ctx) => `
    <div class="user-card">
      <h3>${ctx.user.value.name}</h3>
      <p>Role: ${ctx.user.value.role}</p>
      ${ctx.editable.value ? '<button>Edit</button>' : ''}
    </div>
  `
});

app.mount(document.getElementById("app"), "UserList");
```

---

## Core Features

### 1. Automatic Type Parsing

The Props plugin automatically detects and parses prop values from string attributes. No need to manually `JSON.parse` or convert types in your components.

#### Supported Conversions

```javascript
// Boolean values
`:active="true"`      // → true (boolean)
`:disabled="false"`   // → false (boolean)
`:checked="1"`        // → true (boolean)
`:enabled="0"`        // → false (boolean)
`:selected=""`        // → true (boolean, empty attribute)

// Numeric values
`:count="42"`         // → 42 (number)
`:price="19.99"`      // → 19.99 (number)
`:negative="-5"`      // → -5 (number)

// Object values (JSON)
`:user='{"name": "John", "age": 30}'`
// → { name: "John", age: 30 }

// Array values (JSON)
`:items='[1, 2, 3]'`
// → [1, 2, 3]

`:users='[{"id": 1}, {"id": 2}]'`
// → [{ id: 1 }, { id: 2 }]

// Null and undefined
`:value="null"`       // → null
`:value="undefined"`  // → undefined

// Date values (ISO format)
`:created="2023-01-15T10:30:00.000Z"`
// → Date object

// Regular strings
`:name="John Doe"`    // → "John Doe" (string)
```

#### Type Parsing Examples

```javascript
const FormComponent = {
  template({ signal }) {
    const formData = signal({
      name: "John",
      age: 30,
      active: true,
      tags: ["developer", "designer"],
      createdAt: new Date().toISOString()
    });

    return `
      <div class="form-container"
           :name="${formData.value.name}"
           :age="${formData.value.age}"
           :active="${formData.value.active}"
           :tags='${JSON.stringify(formData.value.tags)}'
           :created-at="${formData.value.createdAt}">
      </div>
    `;
  },
  children: {
    ".form-container": "FormDisplay"
  }
};

const FormDisplay = {
  setup({ props }) {
    // All props are automatically parsed to their correct types
    console.log(typeof props.name.value);      // "string"
    console.log(typeof props.age.value);       // "number"
    console.log(typeof props.active.value);    // "boolean"
    console.log(Array.isArray(props.tags.value)); // true
    console.log(props.createdAt.value instanceof Date); // true

    return {
      name: props.name,
      age: props.age,
      active: props.active,
      tags: props.tags,
      createdAt: props.createdAt
    };
  },
  template({ name, age, active, tags, createdAt }) {
    return `
      <div class="form-display">
        <p>Name: ${name.value}</p>
        <p>Age: ${age.value}</p>
        <p>Active: ${active.value ? 'Yes' : 'No'}</p>
        <p>Tags: ${tags.value.join(', ')}</p>
        <p>Created: ${createdAt.value.toLocaleDateString()}</p>
      </div>
    `;
  }
};
```

### 2. Reactive Props

When `enableReactivity` is enabled (default), all props are automatically wrapped in Eleva signals for reactive updates.

#### Signal Linking

The Props plugin intelligently links parent and child signals:

- **Same signal reference**: If the parent passes a signal, the child receives the **same signal instance**
- **Automatic updates**: Changes in parent signal automatically update child components
- **Two-way binding potential**: Child can modify shared signal, affecting parent

```javascript
// Parent Component with Signal
const Counter = {
  setup({ signal }) {
    const count = signal(0);

    const increment = () => {
      count.value++;
    };

    return { count, increment };
  },
  template({ count }) {
    return `
      <div class="counter">
        <h2>Parent Count: ${count.value}</h2>
        <button @click="increment">Increment</button>

        <!-- Pass count signal to child -->
        <div class="display" :count="${count.value}"></div>
      </div>
    `;
  },
  children: {
    ".display": "CountDisplay"
  }
};

// Child Component
const CountDisplay = {
  setup({ props }) {
    // props.count is the SAME signal as in parent
    // Changes are automatically synchronized
    props.count.watch((newValue, oldValue) => {
      console.log(`Count changed: ${oldValue} → ${newValue}`);
    });

    return { count: props.count };
  },
  template({ count }) {
    return `
      <div class="count-display">
        <span>Child sees: ${count.value}</span>
      </div>
    `;
  }
};
```

#### Reactive Data Flow

```javascript
const TodoApp = {
  setup({ signal }) {
    const todos = signal([
      { id: 1, text: "Learn Eleva", done: false },
      { id: 2, text: "Build app", done: false }
    ]);

    const toggleTodo = (id) => {
      todos.value = todos.value.map(todo =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      );
    };

    return { todos, toggleTodo };
  },
  template({ todos }) {
    return `
      <div class="todo-app">
        <h1>Todo App</h1>
        ${todos.value.map(todo => `
          <div key="${todo.id}" class="todo-item"
               :todo='${JSON.stringify(todo)}'
               :on-toggle="toggleTodo">
          </div>
        `).join('')}
      </div>
    `;
  },
  children: {
    ".todo-item": "TodoItem"
  }
};

const TodoItem = {
  setup({ props }) {
    return {
      todo: props.todo,
      onToggle: props.onToggle
    };
  },
  template({ todo, onToggle }) {
    return `
      <div class="todo ${todo.value.done ? 'completed' : ''}">
        <input
          type="checkbox"
          ${todo.value.done ? 'checked' : ''}
          @change="() => onToggle.value(${todo.value.id})"
        />
        <span>${todo.value.text}</span>
      </div>
    `;
  }
};
```

### 3. Complex Data Structures

The Props plugin handles nested objects, arrays of objects, and deeply nested data structures.

#### Nested Objects

```javascript
const UserProfile = {
  setup({ signal }) {
    const user = signal({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      address: {
        street: "123 Main St",
        city: "New York",
        country: "USA",
        coordinates: {
          lat: 40.7128,
          lng: -74.0060
        }
      },
      preferences: {
        theme: "dark",
        notifications: {
          email: true,
          push: false,
          sms: true
        }
      }
    });

    return { user };
  },
  template({ user }) {
    return `
      <div class="profile-container"
           :user='${JSON.stringify(user.value)}'>
      </div>
    `;
  },
  children: {
    ".profile-container": "ProfileDisplay"
  }
};

const ProfileDisplay = {
  setup({ props }) {
    const user = props.user;

    return { user };
  },
  template({ user }) {
    return `
      <div class="profile">
        <h2>${user.value.name}</h2>
        <p>Email: ${user.value.email}</p>
        <div class="address">
          <h3>Address</h3>
          <p>${user.value.address.street}</p>
          <p>${user.value.address.city}, ${user.value.address.country}</p>
          <p>Coordinates: ${user.value.address.coordinates.lat}, ${user.value.address.coordinates.lng}</p>
        </div>
        <div class="preferences">
          <h3>Notification Preferences</h3>
          <p>Email: ${user.value.preferences.notifications.email ? 'On' : 'Off'}</p>
          <p>Push: ${user.value.preferences.notifications.push ? 'On' : 'Off'}</p>
          <p>SMS: ${user.value.preferences.notifications.sms ? 'On' : 'Off'}</p>
        </div>
      </div>
    `;
  }
};
```

#### Arrays of Objects

```javascript
const ProductList = {
  setup({ signal }) {
    const products = signal([
      {
        id: 1,
        name: "Laptop",
        price: 999.99,
        specs: { ram: "16GB", storage: "512GB SSD" },
        tags: ["electronics", "computers"]
      },
      {
        id: 2,
        name: "Headphones",
        price: 199.99,
        specs: { type: "over-ear", wireless: true },
        tags: ["electronics", "audio"]
      }
    ]);

    return { products };
  },
  template({ products }) {
    return `
      <div class="product-list">
        ${products.value.map(product => `
          <div key="${product.id}" class="product-card"
               :product='${JSON.stringify(product)}'>
          </div>
        `).join('')}
      </div>
    `;
  },
  children: {
    ".product-card": "ProductCard"
  }
};

const ProductCard = {
  setup({ props }) {
    return { product: props.product };
  },
  template({ product }) {
    return `
      <div class="card">
        <h3>${product.value.name}</h3>
        <p class="price">$${product.value.price.toFixed(2)}</p>
        <div class="specs">
          ${Object.entries(product.value.specs).map(([key, val]) =>
            `<span key="${key}">${key}: ${val}</span>`
          ).join('')}
        </div>
        <div class="tags">
          ${product.value.tags.map(tag =>
            `<span key="${tag}" class="tag">${tag}</span>`
          ).join('')}
        </div>
      </div>
    `;
  }
};
```

### 4. Error Handling

The Props plugin provides comprehensive error handling for parsing failures.

#### Custom Error Handler

```javascript
app.use(Props, {
  onError: (error, rawValue) => {
    // Log to console
    console.error("Props parsing error:", {
      error: error.message,
      value: rawValue,
      timestamp: new Date().toISOString()
    });

    // Report to error tracking service
    // errorTracker.report(error, { context: "props-parsing", value: rawValue });

    // Show user notification
    // showNotification("Failed to parse component data");
  }
});
```

#### Graceful Degradation

When parsing fails, the original string value is returned to prevent application crashes:

```javascript
// If this fails to parse
`:data='{"invalid json'`

// The component receives the original string
// props.data.value === '{"invalid json'

// Your component can handle this gracefully
const SafeComponent = {
  setup({ props }) {
    const data = props.data;

    // Check if parsing was successful
    const isValid = typeof data.value === 'object' && data.value !== null;

    return { data, isValid };
  },
  template({ data, isValid }) {
    if (!isValid) {
      return `<div class="error">Invalid data format</div>`;
    }
    return `<div class="content">${JSON.stringify(data.value)}</div>`;
  }
};
```

### 5. Utility Methods

The Props plugin exposes utility methods on the `app.props` namespace.

#### app.props.parse(value)

Manually parse a value using the plugin's type detection logic:

```javascript
// Parse various value types
const num = app.props.parse("42");           // 42 (number)
const bool = app.props.parse("true");        // true (boolean)
const obj = app.props.parse('{"a": 1}');     // {a: 1} (object)
const arr = app.props.parse('[1, 2, 3]');    // [1, 2, 3] (array)
const date = app.props.parse("2023-01-01T00:00:00.000Z"); // Date object
const nil = app.props.parse("null");         // null
const str = app.props.parse("hello");        // "hello" (string)
```

#### app.props.detectType(value)

Detect the type of any value:

```javascript
app.props.detectType("hello");              // "string"
app.props.detectType(42);                   // "number"
app.props.detectType(true);                 // "boolean"
app.props.detectType([1, 2, 3]);            // "array"
app.props.detectType({ a: 1 });             // "object"
app.props.detectType(new Date());           // "date"
app.props.detectType(new Map());            // "map"
app.props.detectType(new Set());            // "set"
app.props.detectType(() => {});             // "function"
app.props.detectType(null);                 // "null"
app.props.detectType(undefined);            // "undefined"
```

---

## Configuration

### Plugin Options

```javascript
app.use(Props, {
  enableAutoParsing: true,   // Enable automatic type detection and parsing
  enableReactivity: true,    // Wrap props in signals for reactivity
  onError: null              // Custom error handler function
});
```

### Configuration Examples

#### Full Auto Mode (Default)

```javascript
// Everything automatic - parsing and reactivity
app.use(Props);
// or
app.use(Props, {
  enableAutoParsing: true,
  enableReactivity: true
});
```

#### Parsing Only (No Reactivity)

```javascript
// Parse props but don't wrap in signals
app.use(Props, {
  enableAutoParsing: true,
  enableReactivity: false
});

// In component, props are plain values (not signals)
const MyComponent = {
  setup({ props }) {
    console.log(props.count);  // 42 (plain number, not signal)
    return { count: props.count };
  },
  template({ count }) {
    return `<div>${count}</div>`;  // No .value needed
  }
};
```

#### Reactivity Only (No Parsing)

```javascript
// Wrap props in signals but don't auto-parse
app.use(Props, {
  enableAutoParsing: false,
  enableReactivity: true
});

// Props remain as strings but are reactive
const MyComponent = {
  setup({ props }) {
    // props.data.value is still a string
    const parsed = JSON.parse(props.data.value);
    return { data: parsed };
  }
};
```

#### With Error Handling

```javascript
app.use(Props, {
  enableAutoParsing: true,
  enableReactivity: true,
  onError: (error, value) => {
    console.warn(`Failed to parse: "${value}"`, error);

    // Optional: Send to monitoring service
    if (typeof Sentry !== 'undefined') {
      Sentry.captureException(error, {
        extra: { rawValue: value }
      });
    }
  }
});
```

---

## API Reference

### Props

The main plugin object to install on your Eleva application.

```javascript
import { Props } from "eleva/plugins";

app.use(Props, options);
```

#### Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enableAutoParsing` | `boolean` | `true` | When enabled, automatically detects and parses prop values to their appropriate types (numbers, booleans, objects, arrays, dates) |
| `enableReactivity` | `boolean` | `true` | When enabled, wraps all props in Eleva signals for reactive updates. Parent signals are linked to child components. |
| `onError` | `function` | `null` | Callback function called when parsing fails. Receives `(error, rawValue)` parameters. |

### app.props.parse(value)

Manually parse a value using the plugin's type detection logic.

```javascript
/**
 * Parse a value with automatic type detection
 * @param {any} value - The value to parse
 * @returns {any} The parsed value with appropriate type
 */
const result = app.props.parse(value);
```

#### Examples

```javascript
app.props.parse("42");              // → 42
app.props.parse("true");            // → true
app.props.parse('{"key": "val"}');  // → {key: "val"}
app.props.parse('[1, 2, 3]');       // → [1, 2, 3]
app.props.parse("2023-01-01T00:00:00.000Z"); // → Date
```

### app.props.detectType(value)

Detect the type of any value.

```javascript
/**
 * Detect the type of a value
 * @param {any} value - The value to detect type for
 * @returns {string} The detected type name
 */
const typeName = app.props.detectType(value);
```

#### Return Values

| Value Type | Returns |
|------------|---------|
| String | `"string"` |
| Number | `"number"` |
| Boolean | `"boolean"` |
| Array | `"array"` |
| Object | `"object"` |
| Date | `"date"` |
| Map | `"map"` |
| Set | `"set"` |
| Function | `"function"` |
| null | `"null"` |
| undefined | `"undefined"` |
| Other | `"unknown"` |

### Props.uninstall(eleva)

Removes the plugin and restores original Eleva behavior.

```javascript
/**
 * Uninstall the plugin
 * @param {Eleva} eleva - The Eleva instance
 */
Props.uninstall(app);
```

---

## Usage Patterns

### Pattern 1: Form Data Binding

```javascript
const FormContainer = {
  setup({ signal }) {
    const formData = signal({
      username: "",
      email: "",
      password: "",
      rememberMe: false,
      role: "user"
    });

    const errors = signal({});
    const isSubmitting = signal(false);

    const validate = () => {
      const newErrors = {};
      if (!formData.value.username) newErrors.username = "Required";
      if (!formData.value.email.includes("@")) newErrors.email = "Invalid email";
      if (formData.value.password.length < 8) newErrors.password = "Min 8 characters";
      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
      if (!validate()) return;
      isSubmitting.value = true;
      try {
        await submitForm(formData.value);
      } finally {
        isSubmitting.value = false;
      }
    };

    return { formData, errors, isSubmitting, handleSubmit };
  },
  template({ formData, errors, isSubmitting }) {
    return `
      <form class="registration-form"
            :form-data='${JSON.stringify(formData.value)}'
            :errors='${JSON.stringify(errors.value)}'
            :is-submitting="${isSubmitting.value}">
      </form>
    `;
  },
  children: {
    ".registration-form": "RegistrationForm"
  }
};

const RegistrationForm = {
  setup({ props }) {
    return {
      formData: props.formData,
      errors: props.errors,
      isSubmitting: props.isSubmitting
    };
  },
  template({ formData, errors, isSubmitting }) {
    return `
      <div class="form-fields">
        <div class="field">
          <label>Username</label>
          <input
            type="text"
            value="${formData.value.username}"
            @input="(e) => formData.value = {...formData.value, username: e.target.value}"
          />
          ${errors.value.username ? `<span class="error">${errors.value.username}</span>` : ''}
        </div>

        <div class="field">
          <label>Email</label>
          <input
            type="email"
            value="${formData.value.email}"
            @input="(e) => formData.value = {...formData.value, email: e.target.value}"
          />
          ${errors.value.email ? `<span class="error">${errors.value.email}</span>` : ''}
        </div>

        <div class="field">
          <label>Password</label>
          <input
            type="password"
            @input="(e) => formData.value = {...formData.value, password: e.target.value}"
          />
          ${errors.value.password ? `<span class="error">${errors.value.password}</span>` : ''}
        </div>

        <div class="field">
          <label>
            <input
              type="checkbox"
              ${formData.value.rememberMe ? 'checked' : ''}
              @change="(e) => formData.value = {...formData.value, rememberMe: e.target.checked}"
            />
            Remember me
          </label>
        </div>

        <button type="submit" ${isSubmitting.value ? 'disabled' : ''}>
          ${isSubmitting.value ? 'Submitting...' : 'Register'}
        </button>
      </div>
    `;
  }
};
```

### Pattern 2: Data Table with Sorting and Filtering

```javascript
const DataTableContainer = {
  setup({ signal }) {
    const data = signal([
      { id: 1, name: "Alice", email: "alice@example.com", role: "Admin", status: "active" },
      { id: 2, name: "Bob", email: "bob@example.com", role: "User", status: "inactive" },
      { id: 3, name: "Charlie", email: "charlie@example.com", role: "Editor", status: "active" }
    ]);

    const config = signal({
      sortBy: "name",
      sortOrder: "asc",
      filter: "",
      columns: ["name", "email", "role", "status"],
      pageSize: 10,
      currentPage: 1
    });

    const sortedData = () => {
      let filtered = data.value.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(config.value.filter.toLowerCase())
        )
      );

      return filtered.sort((a, b) => {
        const aVal = a[config.value.sortBy];
        const bVal = b[config.value.sortBy];
        const order = config.value.sortOrder === "asc" ? 1 : -1;
        return String(aVal).localeCompare(String(bVal)) * order;
      });
    };

    return { data, config, sortedData };
  },
  template({ data, config }) {
    return `
      <div class="data-table-wrapper"
           :data='${JSON.stringify(data.value)}'
           :config='${JSON.stringify(config.value)}'>
      </div>
    `;
  },
  children: {
    ".data-table-wrapper": "DataTable"
  }
};

const DataTable = {
  setup({ props }) {
    const data = props.data;
    const config = props.config;

    const toggleSort = (column) => {
      if (config.value.sortBy === column) {
        config.value = {
          ...config.value,
          sortOrder: config.value.sortOrder === "asc" ? "desc" : "asc"
        };
      } else {
        config.value = {
          ...config.value,
          sortBy: column,
          sortOrder: "asc"
        };
      }
    };

    const setFilter = (value) => {
      config.value = { ...config.value, filter: value };
    };

    return { data, config, toggleSort, setFilter };
  },
  template({ data, config }) {
    return `
      <div class="data-table">
        <div class="toolbar">
          <input
            type="text"
            placeholder="Search..."
            value="${config.value.filter}"
            @input="(e) => setFilter(e.target.value)"
          />
        </div>

        <table>
          <thead>
            <tr>
              ${config.value.columns.map(col => `
                <th key="${col}" @click="() => toggleSort('${col}')">
                  ${col.charAt(0).toUpperCase() + col.slice(1)}
                  ${config.value.sortBy === col
                    ? (config.value.sortOrder === 'asc' ? '▲' : '▼')
                    : ''}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.value.map(row => `
              <tr key="${row.id}">
                ${config.value.columns.map(col => `
                  <td key="${col}">${row[col]}</td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
};
```

### Pattern 3: Modal with Dynamic Content

```javascript
const ModalContainer = {
  setup({ signal }) {
    const isOpen = signal(false);
    const modalConfig = signal({
      title: "",
      content: "",
      type: "info",  // info, warning, error, success
      confirmText: "OK",
      cancelText: "Cancel",
      showCancel: true
    });

    const showModal = (config) => {
      modalConfig.value = { ...modalConfig.value, ...config };
      isOpen.value = true;
    };

    const closeModal = () => {
      isOpen.value = false;
    };

    const handleConfirm = () => {
      console.log("Confirmed!");
      closeModal();
    };

    return { isOpen, modalConfig, showModal, closeModal, handleConfirm };
  },
  template({ isOpen, modalConfig }) {
    return `
      <div>
        <button @click="() => showModal({ title: 'Confirm Action', content: 'Are you sure?', type: 'warning' })">
          Show Modal
        </button>

        <div class="modal-container"
             :is-open="${isOpen.value}"
             :config='${JSON.stringify(modalConfig.value)}'>
        </div>
      </div>
    `;
  },
  children: {
    ".modal-container": "Modal"
  }
};

const Modal = {
  setup({ props }) {
    return {
      isOpen: props.isOpen,
      config: props.config
    };
  },
  template({ isOpen, config }) {
    if (!isOpen.value) {
      return `<div class="modal hidden"></div>`;
    }

    const typeClasses = {
      info: "modal-info",
      warning: "modal-warning",
      error: "modal-error",
      success: "modal-success"
    };

    return `
      <div class="modal-overlay">
        <div class="modal ${typeClasses[config.value.type]}">
          <div class="modal-header">
            <h2>${config.value.title}</h2>
            <button class="close-btn" @click="closeModal">×</button>
          </div>
          <div class="modal-body">
            <p>${config.value.content}</p>
          </div>
          <div class="modal-footer">
            ${config.value.showCancel ? `
              <button class="btn-cancel" @click="closeModal">
                ${config.value.cancelText}
              </button>
            ` : ''}
            <button class="btn-confirm" @click="handleConfirm">
              ${config.value.confirmText}
            </button>
          </div>
        </div>
      </div>
    `;
  }
};
```

### Pattern 4: Shopping Cart

```javascript
const ShoppingCart = {
  setup({ signal }) {
    const cart = signal({
      items: [],
      discountCode: "",
      discountPercent: 0
    });

    const addItem = (product, quantity = 1) => {
      const items = [...cart.value.items];
      const existing = items.find(i => i.product.id === product.id);

      if (existing) {
        existing.quantity += quantity;
      } else {
        items.push({ product, quantity });
      }

      cart.value = { ...cart.value, items };
    };

    const removeItem = (productId) => {
      cart.value = {
        ...cart.value,
        items: cart.value.items.filter(i => i.product.id !== productId)
      };
    };

    const updateQuantity = (productId, quantity) => {
      cart.value = {
        ...cart.value,
        items: cart.value.items.map(i =>
          i.product.id === productId ? { ...i, quantity } : i
        )
      };
    };

    const applyDiscount = (code) => {
      const discounts = { SAVE10: 10, SAVE20: 20, SAVE50: 50 };
      cart.value = {
        ...cart.value,
        discountCode: code,
        discountPercent: discounts[code] || 0
      };
    };

    const getTotal = () => {
      const subtotal = cart.value.items.reduce(
        (sum, i) => sum + i.product.price * i.quantity, 0
      );
      return subtotal * (1 - cart.value.discountPercent / 100);
    };

    return { cart, addItem, removeItem, updateQuantity, applyDiscount, getTotal };
  },
  template({ cart }) {
    return `
      <div class="cart-summary"
           :cart='${JSON.stringify(cart.value)}'>
      </div>
    `;
  },
  children: {
    ".cart-summary": "CartSummary"
  }
};

const CartSummary = {
  setup({ props }) {
    const cart = props.cart;

    const subtotal = () => cart.value.items.reduce(
      (sum, i) => sum + i.product.price * i.quantity, 0
    );

    const discount = () => subtotal() * (cart.value.discountPercent / 100);

    const total = () => subtotal() - discount();

    return { cart, subtotal, discount, total };
  },
  template({ cart, subtotal, discount, total }) {
    return `
      <div class="cart">
        <h2>Shopping Cart</h2>

        ${cart.value.items.length === 0 ? `
          <p class="empty">Your cart is empty</p>
        ` : `
          <ul class="cart-items">
            ${cart.value.items.map(item => `
              <li key="${item.product.id}" class="cart-item">
                <span class="name">${item.product.name}</span>
                <span class="quantity">
                  <button @click="() => updateQuantity(${item.product.id}, ${item.quantity - 1})">-</button>
                  ${item.quantity}
                  <button @click="() => updateQuantity(${item.product.id}, ${item.quantity + 1})">+</button>
                </span>
                <span class="price">$${(item.product.price * item.quantity).toFixed(2)}</span>
                <button class="remove" @click="() => removeItem(${item.product.id})">×</button>
              </li>
            `).join('')}
          </ul>

          <div class="cart-totals">
            <div class="subtotal">
              <span>Subtotal:</span>
              <span>$${subtotal().toFixed(2)}</span>
            </div>
            ${cart.value.discountPercent > 0 ? `
              <div class="discount">
                <span>Discount (${cart.value.discountPercent}%):</span>
                <span>-$${discount().toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="total">
              <span>Total:</span>
              <span>$${total().toFixed(2)}</span>
            </div>
          </div>

          <div class="discount-code">
            <input type="text" placeholder="Discount code" />
            <button @click="(e) => applyDiscount(e.target.previousElementSibling.value)">
              Apply
            </button>
          </div>
        `}
      </div>
    `;
  }
};
```

### Pattern 5: Dynamic Component Loading

```javascript
const ComponentLoader = {
  setup({ signal }) {
    const componentConfig = signal({
      type: "default",
      props: {},
      loading: false,
      error: null
    });

    const loadComponent = async (type, props) => {
      componentConfig.value = {
        ...componentConfig.value,
        loading: true,
        error: null
      };

      try {
        // Simulate async component loading
        await new Promise(resolve => setTimeout(resolve, 500));

        componentConfig.value = {
          type,
          props,
          loading: false,
          error: null
        };
      } catch (error) {
        componentConfig.value = {
          ...componentConfig.value,
          loading: false,
          error: error.message
        };
      }
    };

    return { componentConfig, loadComponent };
  },
  template({ componentConfig }) {
    return `
      <div class="component-loader">
        <div class="controls">
          <button @click="() => loadComponent('userCard', { name: 'John', role: 'Admin' })">
            Load User Card
          </button>
          <button @click="() => loadComponent('statsPanel', { views: 1234, likes: 567 })">
            Load Stats Panel
          </button>
        </div>

        <div class="dynamic-content"
             :config='${JSON.stringify(componentConfig.value)}'>
        </div>
      </div>
    `;
  },
  children: {
    ".dynamic-content": "DynamicContent"
  }
};

const DynamicContent = {
  setup({ props }) {
    return { config: props.config };
  },
  template({ config }) {
    if (config.value.loading) {
      return `<div class="loading">Loading...</div>`;
    }

    if (config.value.error) {
      return `<div class="error">Error: ${config.value.error}</div>`;
    }

    switch (config.value.type) {
      case "userCard":
        return `
          <div class="user-card">
            <h3>${config.value.props.name}</h3>
            <p>Role: ${config.value.props.role}</p>
          </div>
        `;

      case "statsPanel":
        return `
          <div class="stats-panel">
            <div class="stat">
              <span class="value">${config.value.props.views}</span>
              <span class="label">Views</span>
            </div>
            <div class="stat">
              <span class="value">${config.value.props.likes}</span>
              <span class="label">Likes</span>
            </div>
          </div>
        `;

      default:
        return `<div class="placeholder">Select a component to load</div>`;
    }
  }
};
```

---

## Best Practices

### 1. Use JSON.stringify for Complex Props

Always use `JSON.stringify` when passing objects or arrays:

```javascript
// Good - Properly serialized
`:user='${JSON.stringify(user.value)}'`

// Bad - Will not parse correctly
`:user='${user.value}'`
```

### 2. Handle Parsing Errors Gracefully

Always provide an error handler in production:

```javascript
app.use(Props, {
  onError: (error, value) => {
    console.error("Props parsing failed:", { error, value });
    // Report to error tracking
    // Sentry.captureException(error);
  }
});
```

### 3. Validate Prop Types in Components

Validate props in your setup function:

```javascript
const MyComponent = {
  setup({ props }) {
    const user = props.user;

    // Validate prop type
    if (!user.value || typeof user.value !== 'object') {
      console.warn("Invalid user prop received");
      return { user: { value: { name: "Unknown" } } };
    }

    // Validate required fields
    if (!user.value.name) {
      console.warn("User prop missing 'name' field");
    }

    return { user };
  }
};
```

### 4. Use Meaningful Prop Names

Use descriptive, camelCase prop names:

```javascript
// Good - Clear, descriptive names
`:user-data='${JSON.stringify(data)}'`
`:is-loading="${loading}"`
`:on-submit="handleSubmit"`

// Bad - Ambiguous names
`:d='${JSON.stringify(data)}'`
`:l="${loading}"`
`:fn="handleSubmit"`
```

### 5. Avoid Deep Nesting

Keep prop structures relatively flat:

```javascript
// Good - Flat structure
`:user='${JSON.stringify(user)}'`
`:settings='${JSON.stringify(settings)}'`

// Avoid - Deeply nested
`:data='${JSON.stringify({ user: { settings: { preferences: { theme: {} } } } })}'`
```

### 6. Document Expected Prop Shapes

Add comments or use TypeScript/JSDoc to document expected props:

```javascript
/**
 * @typedef {Object} UserProps
 * @property {Object} user
 * @property {string} user.name
 * @property {number} user.age
 * @property {string[]} user.roles
 */

const UserCard = {
  /**
   * @param {Object} context
   * @param {UserProps} context.props
   */
  setup({ props }) {
    return { user: props.user };
  }
};
```

---

## Troubleshooting

### Common Issues

#### Props Not Parsing Correctly

**Problem**: Object or array props remain as strings.

```javascript
// Check: Are you using single quotes for the attribute?
`:data='${JSON.stringify(obj)}'`  // Correct
`:data="${JSON.stringify(obj)}"`  // Wrong - double quotes conflict
```

**Solution**: Use single quotes for attributes containing JSON:

```javascript
// Correct
`:config='{"key": "value"}'`

// Wrong - nested double quotes break parsing
`:config="{"key": "value"}"`
```

#### Reactive Props Not Updating

**Problem**: Child component doesn't update when parent signal changes.

```javascript
// Check: Is enableReactivity true?
app.use(Props, { enableReactivity: true });

// Check: Are you accessing .value on the signal?
template({ count }) {
  return `<div>${count.value}</div>`;  // Correct
  // return `<div>${count}</div>`;     // Wrong
}
```

#### Type Conversion Unexpected

**Problem**: Value converts to wrong type.

```javascript
// "0" converts to false (boolean), not 0 (number)
`:count="0"`  // → false

// Use explicit number if needed
`:count="${Number(0)}"`  // Still parsed as boolean

// Pass as object property instead
`:data='${JSON.stringify({ count: 0 })}'`
```

**Solution**: For numeric values that could be 0, pass as part of an object.

#### Circular Reference Error

**Problem**: JSON.stringify fails on circular references.

```javascript
// This will throw an error
const obj = { name: "test" };
obj.self = obj;  // Circular reference!
`:data='${JSON.stringify(obj)}'`  // Error!
```

**Solution**: Remove circular references or use a custom serializer:

```javascript
const safeStringify = (obj) => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return "[Circular]";
      seen.add(value);
    }
    return value;
  });
};

`:data='${safeStringify(complexObj)}'`
```

### Plugin Not Working

1. **Check installation order**:
   ```javascript
   const app = new Eleva("App", container);
   app.use(Props);  // Must be before component registration
   app.component("MyComponent", MyComponent);
   ```

2. **Verify plugin is imported**:
   ```javascript
   import { Props } from "eleva/plugins";
   // or
   const { Props } = window.ElevaPlugins;
   ```

3. **Check for conflicting plugins**:
   Install Props before other plugins that modify prop handling.

### Debugging Tips

```javascript
// Debug prop values
const DebugComponent = {
  setup({ props }) {
    // Log all props
    console.log("Received props:", props);

    // Log specific prop
    Object.entries(props).forEach(([key, value]) => {
      console.log(`Prop "${key}":`, {
        value: value.value,
        type: typeof value.value,
        isSignal: 'watch' in value
      });
    });

    return props;
  }
};

// Use the detect type utility
console.log("Detected type:", app.props.detectType(someValue));

// Manual parsing test
console.log("Parsed value:", app.props.parse('{"test": 123}'));
```

---

## Batching Tips & Gotchas

Eleva uses **render batching** via `queueMicrotask` to optimize performance. This means DOM updates happen asynchronously after prop changes. Here's what you need to know when using the Props plugin:

### 1. Child Component Updates Are Batched with Parent

When a parent signal changes, both parent and child component renders are batched together:

```javascript
// Parent component
setup({ signal }) {
  const user = signal({ name: "John" });

  const updateUser = () => {
    user.value = { name: "Jane" };
    // Both parent and child update in ONE render cycle
  };

  return { user, updateUser };
}
```

**Benefit**: No unnecessary intermediate renders between parent and child.

### 2. Prop Changes Don't Update DOM Immediately

After updating a signal that's passed as a prop, the DOM won't reflect the change immediately:

```javascript
// Parent
user.value = { name: "Jane" };
console.log(document.querySelector('.child-name').textContent); // Still "John"!

// Wait for the batched render
user.value = { name: "Jane" };
queueMicrotask(() => {
  console.log(document.querySelector('.child-name').textContent); // Now "Jane"
});
```

### 3. Tests May Need Delays

When testing components with props, allow time for batched renders:

```javascript
test("child receives updated props", async () => {
  parentSignal.value = { name: "Updated" };

  // Wait for batched render
  await new Promise(resolve => queueMicrotask(resolve));

  expect(document.querySelector('.child').textContent).toContain("Updated");
});
```

### 4. Multiple Prop Updates Are Batched

If you update multiple props in sequence, they're batched into a single render:

```javascript
// These updates result in ONE child re-render
user.value = { name: "Jane" };
role.value = "Admin";
permissions.value = ["read", "write"];
// Child updates once with all new props
```

### 5. Use Immutable Updates for Prop Objects

Create new references for clearer state changes and proper reactivity:

```javascript
// Good - new object reference triggers update
user.value = { ...user.value, name: "Jane" };

// Bad - mutation may not trigger child update
user.value.name = "Jane"; // Child might not re-render!
```

### 6. Signal Linking and Batching

When parent signals are linked to child components, both share the same batching cycle:

```javascript
// Child modifies the linked signal
props.user.value = { name: "Modified by child" };

// Parent's view updates in the same batch cycle
// No separate render for parent and child
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                       Props Plugin                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Parent Component                                               │
│        │                                                         │
│        ▼                                                         │
│   ┌─────────────────────────────────────────────────────┐       │
│   │ Template with Props                                  │       │
│   │ :user='${JSON.stringify(user.value)}'               │       │
│   └─────────────────────────────────────────────────────┘       │
│        │                                                         │
│        ▼                                                         │
│   ┌─────────────────────────────────────────────────────┐       │
│   │ extractProps(element)                                │       │
│   │ - Find :propName attributes                          │       │
│   │ - Remove from DOM                                    │       │
│   └─────────────────────────────────────────────────────┘       │
│        │                                                         │
│        ▼                                                         │
│   ┌─────────────────────────────────────────────────────┐       │
│   │ parsePropValue(value)                                │       │
│   │ - Detect type (string, number, object, etc.)        │       │
│   │ - Parse JSON if applicable                           │       │
│   │ - Convert to appropriate type                        │       │
│   └─────────────────────────────────────────────────────┘       │
│        │                                                         │
│        ▼                                                         │
│   ┌─────────────────────────────────────────────────────┐       │
│   │ createReactiveProps(props)                           │       │
│   │ - Check for existing signals                         │       │
│   │ - Wrap non-signals in new signals                    │       │
│   │ - Link parent signals to child                       │       │
│   └─────────────────────────────────────────────────────┘       │
│        │                                                         │
│        ▼                                                         │
│   Child Component setup({ props })                               │
│        │                                                         │
│        ▼                                                         │
│   props.user.value  // Parsed, reactive object                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Signal Linking Flow:
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   Parent: const count = signal(0)                                │
│              │                                                   │
│              ▼                                                   │
│   Template: :count="${count.value}"                              │
│              │                                                   │
│              ▼                                                   │
│   Props Plugin: Detects 'count' signal in parent context         │
│              │                                                   │
│              ▼                                                   │
│   Child: props.count === Parent's count (same reference!)        │
│              │                                                   │
│              ▼                                                   │
│   Child modifies props.count.value++                             │
│              │                                                   │
│              ▼                                                   │
│   Parent's count.value also updates! (Two-way binding)           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary

### Key Features

| Feature | Description |
|---------|-------------|
| **Auto Type Detection** | Automatically detects and parses strings, numbers, booleans, objects, arrays, dates |
| **Reactive Props** | Props wrapped in Eleva signals for reactive updates |
| **Signal Linking** | Parent signals linked to child components for two-way binding |
| **Complex Data** | Support for nested objects and arrays of objects |
| **Error Handling** | Custom error callbacks for parsing failures |
| **Utility Methods** | `app.props.parse()` and `app.props.detectType()` |
| **Graceful Degradation** | Falls back to original value on parse failure |
| **Zero Config** | Works out of the box with sensible defaults |

### When to Use

- **Parent-child data passing** - Pass complex data structures easily
- **Form data binding** - Bind form state to child components
- **Dynamic component content** - Pass configuration objects
- **List rendering** - Pass item data to list item components
- **Modal/dialog content** - Pass dynamic content and callbacks

### Plugin Statistics

- **Size**: ~4.2KB minified
- **Dependencies**: None (uses core Eleva only)
- **Browser Support**: All modern browsers
- **Configuration Options**: 3

### Comparison with Manual Parsing

| Manual Approach | With Props Plugin |
|-----------------|-------------------|
| `JSON.parse(attr)` in every component | Automatic parsing |
| Manual signal wrapping | Automatic reactivity |
| Error handling per component | Centralized error handler |
| No type detection | Smart type detection |
| Props as strings | Props as correct types |

---

[← Back to Plugins](./index.md) | [Previous: Attr Plugin](./attr.md) | [Next: Router Plugin →](./router.md)
