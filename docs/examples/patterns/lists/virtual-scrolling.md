---
title: Virtual Scrolling for Large Lists
description: Eleva.js virtual scrolling pattern for rendering 10K+ rows efficiently with minimal memory and maximum performance.
---

# Virtual Scrolling

> **Version:** 1.0.1 | Render only visible rows for 10K+ row performance.

For very large datasets (10,000+ rows), virtual scrolling renders only visible rows instead of all items. This dramatically improves both memory usage and update performance.

---

## Performance Comparison

| Metric | Standard Rendering | Virtual Scrolling | Improvement |
|--------|-------------------|-------------------|-------------|
| Memory (10K rows) | ~29 MB | ~5 MB | **5.5x less** |
| Create 10K rows | ~250ms | ~24ms | **10x faster** |
| Update every 10th | ~86ms | ~9ms | **9.5x faster** |
| DOM elements | 10,000 | ~17 | **588x fewer** |

---

## When to Use Virtual Scrolling

| Dataset Size | Recommended Approach |
|--------------|---------------------|
| < 1,000 rows | Standard rendering with keys |
| 1,000 - 10,000 rows | Standard rendering (Eleva handles efficiently) |
| 10,000+ rows | **Virtual scrolling** |

---

## Complete Virtual Scrolling Example

A user directory that loads employees from an API with search and selection.

```javascript
// Virtual scrolling configuration
const ROW_HEIGHT = 45;
const VIEWPORT_HEIGHT = 400;
const BUFFER = 3;
const VISIBLE_COUNT = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT) + (BUFFER * 2);

app.component("UserDirectory", {
  setup({ signal, emitter }) {
    const users = signal([]);
    const selectedUser = signal(null);
    const searchQuery = signal("");
    const scrollTop = signal(0);
    const loading = signal(false);
    const error = signal(null);

    // Fetch users from API
    async function fetchUsers() {
      loading.value = true;
      error.value = null;
      try {
        const response = await fetch("/api/users");
        users.value = await response.json();
      } catch (err) {
        error.value = "Failed to load users";
      } finally {
        loading.value = false;
      }
    }

    // Filter users by search query
    function getFilteredUsers() {
      const query = searchQuery.value.toLowerCase();
      if (!query) return users.value;
      return users.value.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.department.toLowerCase().includes(query)
      );
    }

    // Handle scroll for virtual rendering
    function handleScroll(e) {
      scrollTop.value = e.target.scrollTop;
    }

    // Select user to view details
    function selectUser(id) {
      selectedUser.value = users.value.find(u => u.id === id);
      emitter.emit("user:selected", selectedUser.value);
    }

    // Delete user
    async function deleteUser(id) {
      if (!confirm("Delete this user?")) return;
      try {
        await fetch(`/api/users/${id}`, { method: "DELETE" });
        users.value = users.value.filter(u => u.id !== id);
        if (selectedUser.value?.id === id) {
          selectedUser.value = null;
        }
      } catch (err) {
        alert("Failed to delete user");
      }
    }

    return {
      users, selectedUser, searchQuery, scrollTop, loading, error,
      getFilteredUsers, handleScroll, selectUser, deleteUser,
      onMount: fetchUsers
    };
  },

  template: (ctx) => {
    const filteredUsers = ctx.getFilteredUsers();
    const scroll = ctx.scrollTop.value;

    // Calculate visible window
    const startIndex = Math.max(0, Math.floor(scroll / ROW_HEIGHT) - BUFFER);
    const endIndex = Math.min(filteredUsers.length, startIndex + VISIBLE_COUNT);
    const visibleUsers = filteredUsers.slice(startIndex, endIndex);
    const offsetY = startIndex * ROW_HEIGHT;
    const totalHeight = filteredUsers.length * ROW_HEIGHT;

    if (ctx.loading.value) {
      return `<div class="loading">Loading users...</div>`;
    }

    if (ctx.error.value) {
      return `<div class="error">${ctx.error.value}</div>`;
    }

    return `
      <div class="user-directory">
        <div class="toolbar">
          <input
            type="search"
            placeholder="Search users..."
            value="${ctx.searchQuery.value}"
            @input="(e) => searchQuery.value = e.target.value"
          />
          <span class="count">${filteredUsers.length} users</span>
        </div>

        <div class="table-viewport" style="height: ${VIEWPORT_HEIGHT}px;" @scroll="handleScroll">
          <div style="height: ${totalHeight}px; position: relative;">
            <table style="position: absolute; top: ${offsetY}px; width: 100%;">
              <tbody>
                ${visibleUsers.map(user => `
                  <tr key="${user.id}"
                      class="${ctx.selectedUser.value?.id === user.id ? 'selected' : ''}"
                      style="height: ${ROW_HEIGHT}px;">
                    <td class="col-name">
                      <a @click="() => selectUser(${user.id})">${user.name}</a>
                    </td>
                    <td class="col-email">${user.email}</td>
                    <td class="col-dept">${user.department}</td>
                    <td class="col-actions">
                      <button @click="() => deleteUser(${user.id})">Delete</button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

        ${ctx.selectedUser.value ? `
          <div class="user-details">
            <h3>${ctx.selectedUser.value.name}</h3>
            <p>${ctx.selectedUser.value.email}</p>
            <p>${ctx.selectedUser.value.department}</p>
          </div>
        ` : ""}
      </div>
    `;
  },

  style: `
    .user-directory { max-width: 800px; }
    .toolbar { display: flex; gap: 16px; align-items: center; margin-bottom: 16px; }
    .toolbar input { flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; }
    .count { color: #666; }
    .table-viewport { overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; }
    tr { border-bottom: 1px solid #eee; }
    tr.selected { background: #e3f2fd; }
    td { padding: 12px; }
    .col-name a { color: #1976d2; cursor: pointer; }
    .col-name a:hover { text-decoration: underline; }
    .col-email { color: #666; }
    .col-dept { color: #888; }
    .col-actions button { padding: 4px 8px; cursor: pointer; }
    .user-details { margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 4px; }
    .loading, .error { padding: 20px; text-align: center; }
    .error { color: #d32f2f; }
  `
});
```

---

## Key Implementation Details

### 1. Virtual Window Calculation

Only render rows visible in the viewport, plus a small buffer for smooth scrolling:

```javascript
const startIndex = Math.max(0, Math.floor(scroll / ROW_HEIGHT) - BUFFER);
const endIndex = Math.min(filteredUsers.length, startIndex + VISIBLE_COUNT);
const visibleUsers = filteredUsers.slice(startIndex, endIndex);
```

### 2. Scroll Container Structure

The outer container has fixed height with overflow scroll. The inner spacer maintains correct scrollbar size:

```html
<div class="table-viewport" style="height: ${VIEWPORT_HEIGHT}px;" @scroll="handleScroll">
  <div style="height: ${totalHeight}px; position: relative;">
    <table style="position: absolute; top: ${offsetY}px;">
      <!-- Only visible rows rendered here -->
    </table>
  </div>
</div>
```

### 3. Parameterized Event Handlers

Use arrow functions when passing arguments to handlers:

```javascript
// Correct - arrow function defers execution
<a @click="() => selectUser(${user.id})">${user.name}</a>
<button @click="() => deleteUser(${user.id})">Delete</button>

// Wrong - executes immediately during render
<a @click="selectUser(${user.id})">...</a>
```

### 4. Filtering with Virtual Scrolling

Apply filters before calculating the visible window:

```javascript
function getFilteredUsers() {
  const query = searchQuery.value.toLowerCase();
  if (!query) return users.value;
  return users.value.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  );
}

// In template - filter first, then slice
const filteredUsers = ctx.getFilteredUsers();
const visibleUsers = filteredUsers.slice(startIndex, endIndex);
```

---

## Why Arrow Functions for Row Events?

| Syntax | What Happens | Result |
|--------|--------------|--------|
| `@click="handleClick"` | References function directly | Works (no params) |
| `@click="deleteUser(5)"` | **Executes immediately** during render | Broken |
| `@click="() => deleteUser(5)"` | Creates function, calls on click | Works |

The arrow function wraps the call, deferring execution until the actual click event occurs. Without it, the function runs during template rendering—not when clicked.

---

## Reusable Virtual List Component

A drop-in virtual list component that accepts data via props.

```javascript
// VirtualList - Reusable component, drop into any project
app.component("VirtualList", {
  setup({ signal, props, emitter }) {
    const scrollTop = signal(0);

    // Configuration via props
    const rowHeight = props.rowHeight || 40;
    const height = props.height || 300;
    const buffer = 3;
    const visibleCount = Math.ceil(height / rowHeight) + (buffer * 2);

    function handleScroll(e) {
      scrollTop.value = e.target.scrollTop;
    }

    function handleItemClick(item) {
      emitter.emit("item:click", item);
    }

    return {
      scrollTop, rowHeight, height, buffer, visibleCount,
      handleScroll, handleItemClick
    };
  },

  template: (ctx) => {
    const items = ctx.props.items || [];
    const labelKey = ctx.props.labelKey || "label";
    const scroll = ctx.scrollTop.value;

    const startIndex = Math.max(0, Math.floor(scroll / ctx.rowHeight) - ctx.buffer);
    const endIndex = Math.min(items.length, startIndex + ctx.visibleCount);
    const visibleItems = items.slice(startIndex, endIndex);
    const offsetY = startIndex * ctx.rowHeight;
    const totalHeight = items.length * ctx.rowHeight;

    return `
      <div class="virtual-list" style="height: ${ctx.height}px;" @scroll="handleScroll">
        <div class="virtual-list-spacer" style="height: ${totalHeight}px;">
          <div class="virtual-list-content" style="top: ${offsetY}px;">
            ${visibleItems.map(item => `
              <div key="${item.id}"
                   class="virtual-list-item"
                   style="height: ${ctx.rowHeight}px;"
                   @click="() => handleItemClick(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                ${item[labelKey]}
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  },

  style: `
    .virtual-list { overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; }
    .virtual-list-spacer { position: relative; }
    .virtual-list-content { position: absolute; left: 0; right: 0; }
    .virtual-list-item { display: flex; align-items: center; padding: 0 16px; border-bottom: 1px solid #eee; cursor: pointer; }
    .virtual-list-item:hover { background: #f5f5f5; }
  `
});
```

### Usage

```javascript
app.component("MyPage", {
  setup({ signal, emitter }) {
    const users = signal([
      { id: 1, name: "Alice Johnson" },
      { id: 2, name: "Bob Smith" },
      // ... thousands of items
    ]);

    emitter.on("item:click", (user) => {
      console.log("Selected:", user);
    });

    return { users };
  },

  template: (ctx) => `
    <h2>Users (${ctx.users.value.length})</h2>
    <VirtualList
      :items="users.value"
      :labelKey="'name'"
      :height="400"
      :rowHeight="50"
    />
  `,

  children: {
    "VirtualList": "VirtualList"
  }
});
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | Array | `[]` | Data array (each item needs `id`) |
| `labelKey` | String | `"label"` | Property to display |
| `height` | Number | `300` | Viewport height in pixels |
| `rowHeight` | Number | `40` | Row height in pixels |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `item:click` | Item object | Emitted when row is clicked |

---

## Summary

| Concept | Implementation |
|---------|----------------|
| **Fixed row height** | Required for calculating positions |
| **Scroll tracking** | `@scroll` handler updates `scrollTop` signal |
| **Window calculation** | `startIndex`, `endIndex` based on scroll position |
| **Spacer element** | Inner div with `totalHeight` for scrollbar |
| **Absolute positioning** | Table/content positioned at `offsetY` |
| **Buffer rows** | Extra rows above/below for smooth scrolling |

---

[← Patterns](./patterns.md) | [Back to Patterns Index](../index.md)
