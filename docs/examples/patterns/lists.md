---
title: List Operations - Search, Filter, Sort & CRUD
description: Eleva.js list patterns with search, filter, sort, drag-and-drop, virtual scrolling, and CRUD operations. Key-based reconciliation for optimal performance.
---

# List Operations Examples

Learn how to search, filter, sort, and reorder lists in Eleva.

## Table of Contents

- [Choosing Keys for List Items](#choosing-keys-for-list-items)
- [Searchable & Filterable List](#searchable--filterable-list)
- [Drag-and-Drop Reorderable List](#drag-and-drop-reorderable-list)
- [Todo List with CRUD](#todo-list-with-crud)
- [Grouped List](#grouped-list)
- [Virtual Scrolling](#virtual-scrolling)

---

## Choosing Keys for List Items

When rendering lists, the `key` attribute helps Eleva's renderer efficiently update the DOM. Choosing the right key strategy is important for performance and correctness.

### Use `object.id` (stable unique identifier) when:

- Items can be **reordered, sorted, or filtered**
- Items can be **added or removed from the middle** of the list
- Items have a **natural unique identifier** (database ID, UUID, etc.)
- You need to **preserve component state** across re-renders

```javascript
// Good: items with stable IDs
${ctx.tasks.value.map(task => `
  <li key="${task.id}">${task.title}</li>
`).join('')}
```

### Use `index` when:

- The list is **static and never reorders**
- Items are **only appended** to the end (never inserted in middle)
- Items are **simple primitives** without unique identifiers
- The list is **derived/computed** and doesn't persist

```javascript
// Acceptable: static list of simple strings
${ctx.colors.map((color, index) => `
  <span key="${index}">${color}</span>
`).join('')}
```

### Why it matters

With index-based keys, if you insert an item at position 0, every item shifts and gets a new key. The renderer thinks all items changed, causing unnecessary DOM updates and potentially losing input focus or component state.

With stable IDs, the renderer correctly identifies which items moved, were added, or removed—performing minimal DOM operations.

**Rule of thumb:** If items have an `id`, always use it. Only fall back to `index` for truly static, append-only lists.

---

## Searchable & Filterable List

A product list with search, category filter, stock filter, and sorting.

```javascript
app.component("ProductList", {
  setup({ signal }) {
    const products = signal([
      { id: 1, name: "Laptop", category: "electronics", price: 999, inStock: true },
      { id: 2, name: "Headphones", category: "electronics", price: 199, inStock: true },
      { id: 3, name: "Coffee Mug", category: "home", price: 15, inStock: false },
      { id: 4, name: "Notebook", category: "office", price: 8, inStock: true },
      { id: 5, name: "Desk Lamp", category: "home", price: 45, inStock: true },
      { id: 6, name: "Keyboard", category: "electronics", price: 149, inStock: false }
    ]);

    const searchQuery = signal("");
    const categoryFilter = signal("all");
    const stockFilter = signal("all");
    const sortBy = signal("name");

    function getFilteredProducts() {
      let result = [...products.value];

      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(p => p.name.toLowerCase().includes(query));
      }

      // Category filter
      if (categoryFilter.value !== "all") {
        result = result.filter(p => p.category === categoryFilter.value);
      }

      // Stock filter
      if (stockFilter.value !== "all") {
        const inStock = stockFilter.value === "inStock";
        result = result.filter(p => p.inStock === inStock);
      }

      // Sorting
      result.sort((a, b) => {
        if (sortBy.value === "name") return a.name.localeCompare(b.name);
        if (sortBy.value === "price-asc") return a.price - b.price;
        if (sortBy.value === "price-desc") return b.price - a.price;
        return 0;
      });

      return result;
    }

    const categories = ["all", "electronics", "home", "office"];

    return {
      searchQuery, categoryFilter, stockFilter, sortBy,
      categories, getFilteredProducts
    };
  },
  template: (ctx) => {
    const filtered = ctx.getFilteredProducts();
    return `
      <div class="product-list">
        <div class="filters">
          <input
            type="text"
            placeholder="Search products..."
            value="${ctx.searchQuery.value}"
            @input="(e) => searchQuery.value = e.target.value"
          />

          <select @change="(e) => categoryFilter.value = e.target.value">
            ${ctx.categories.map(cat => `
              <option key="${cat}" value="${cat}" ${ctx.categoryFilter.value === cat ? "selected" : ""}>
                ${cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            `).join("")}
          </select>

          <select @change="(e) => stockFilter.value = e.target.value">
            <option value="all" ${ctx.stockFilter.value === "all" ? "selected" : ""}>All Items</option>
            <option value="inStock" ${ctx.stockFilter.value === "inStock" ? "selected" : ""}>In Stock</option>
            <option value="outOfStock" ${ctx.stockFilter.value === "outOfStock" ? "selected" : ""}>Out of Stock</option>
          </select>

          <select @change="(e) => sortBy.value = e.target.value">
            <option value="name" ${ctx.sortBy.value === "name" ? "selected" : ""}>Sort by Name</option>
            <option value="price-asc" ${ctx.sortBy.value === "price-asc" ? "selected" : ""}>Price: Low to High</option>
            <option value="price-desc" ${ctx.sortBy.value === "price-desc" ? "selected" : ""}>Price: High to Low</option>
          </select>
        </div>

        <p class="results-count">Showing ${filtered.length} products</p>

        <div class="products">
          ${filtered.length > 0 ? filtered.map(product => `
            <div key="${product.id}" class="product-card ${!product.inStock ? 'out-of-stock' : ''}">
              <h3>${product.name}</h3>
              <span class="category">${product.category}</span>
              <p class="price">$${product.price}</p>
              <span class="stock ${product.inStock ? 'in-stock' : 'no-stock'}">
                ${product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          `).join("") : `
            <p class="no-results">No products found matching your criteria.</p>
          `}
        </div>
      </div>
    `;
  },
  style: `
    .filters { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
    .filters input, .filters select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; }
    .filters input { flex: 1; min-width: 200px; }
    .results-count { color: #666; margin-bottom: 15px; }
    .products { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
    .product-card { border: 1px solid #eee; padding: 15px; border-radius: 8px; }
    .product-card.out-of-stock { opacity: 0.6; }
    .product-card h3 { margin: 0 0 10px 0; }
    .category { font-size: 12px; color: #666; background: #f0f0f0; padding: 2px 8px; border-radius: 10px; }
    .price { font-size: 1.25rem; font-weight: bold; color: #28a745; }
    .stock { font-size: 12px; }
    .in-stock { color: #28a745; }
    .no-stock { color: #dc3545; }
  `
});
```

**Key Concepts:**
- Use functions to compute filtered/sorted results
- Multiple filter criteria combined
- Sort options with different comparators
- Show results count and empty state

---

## Drag-and-Drop Reorderable List

A list that supports drag-and-drop reordering.

```javascript
app.component("SortableList", {
  setup({ signal }) {
    const items = signal([
      { id: 1, text: "First item" },
      { id: 2, text: "Second item" },
      { id: 3, text: "Third item" },
      { id: 4, text: "Fourth item" }
    ]);
    const draggedIndex = signal(null);

    function handleDragStart(index) {
      draggedIndex.value = index;
    }

    function handleDragOver(event) {
      event.preventDefault();
    }

    function handleDrop(targetIndex) {
      if (draggedIndex.value === null || draggedIndex.value === targetIndex) return;

      const newItems = [...items.value];
      const [removed] = newItems.splice(draggedIndex.value, 1);
      newItems.splice(targetIndex, 0, removed);
      items.value = newItems;
      draggedIndex.value = null;
    }

    function moveUp(index) {
      if (index === 0) return;
      const newItems = [...items.value];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      items.value = newItems;
    }

    function moveDown(index) {
      if (index === items.value.length - 1) return;
      const newItems = [...items.value];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      items.value = newItems;
    }

    return { items, handleDragStart, handleDragOver, handleDrop, moveUp, moveDown };
  },
  template: (ctx) => `
    <ul class="sortable-list">
      ${ctx.items.value.map((item, index) => `
        <li
          key="${item.id}"
          class="sortable-item"
          draggable="true"
          @dragstart="() => handleDragStart(${index})"
          @dragover="handleDragOver"
          @drop="() => handleDrop(${index})"
        >
          <span class="drag-handle">☰</span>
          <span class="item-text">${item.text}</span>
          <div class="item-actions">
            <button @click="() => moveUp(${index})" ${index === 0 ? "disabled" : ""}>↑</button>
            <button @click="() => moveDown(${index})" ${index === ctx.items.value.length - 1 ? "disabled" : ""}>↓</button>
          </div>
        </li>
      `).join("")}
    </ul>
  `,
  style: `
    .sortable-list { list-style: none; padding: 0; max-width: 400px; }
    .sortable-item {
      display: flex; align-items: center; gap: 10px;
      padding: 12px; border: 1px solid #ddd; margin-bottom: -1px;
      background: white; cursor: grab;
    }
    .sortable-item:active { cursor: grabbing; }
    .drag-handle { color: #999; }
    .item-text { flex: 1; }
    .item-actions button {
      padding: 4px 8px; border: 1px solid #ddd;
      background: white; cursor: pointer; border-radius: 4px;
    }
    .item-actions button:disabled { opacity: 0.5; cursor: not-allowed; }
  `
});
```

---

## Todo List with CRUD

Complete todo list with create, read, update, delete operations.

```javascript
app.component("TodoList", {
  setup({ signal }) {
    const todos = signal([
      { id: 1, text: "Learn Eleva", completed: true },
      { id: 2, text: "Build an app", completed: false },
      { id: 3, text: "Deploy to production", completed: false }
    ]);
    const newTodo = signal("");
    const editingId = signal(null);
    const editText = signal("");
    const filter = signal("all"); // all, active, completed

    function addTodo() {
      const text = newTodo.value.trim();
      if (!text) return;

      todos.value = [...todos.value, {
        id: Date.now(),
        text,
        completed: false
      }];
      newTodo.value = "";
    }

    function toggleTodo(id) {
      todos.value = todos.value.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
    }

    function deleteTodo(id) {
      todos.value = todos.value.filter(todo => todo.id !== id);
    }

    function startEdit(todo) {
      editingId.value = todo.id;
      editText.value = todo.text;
    }

    function saveEdit() {
      if (!editText.value.trim()) return;

      todos.value = todos.value.map(todo =>
        todo.id === editingId.value ? { ...todo, text: editText.value } : todo
      );
      editingId.value = null;
      editText.value = "";
    }

    function cancelEdit() {
      editingId.value = null;
      editText.value = "";
    }

    function getFilteredTodos() {
      if (filter.value === "active") return todos.value.filter(t => !t.completed);
      if (filter.value === "completed") return todos.value.filter(t => t.completed);
      return todos.value;
    }

    function clearCompleted() {
      todos.value = todos.value.filter(t => !t.completed);
    }

    const remaining = () => todos.value.filter(t => !t.completed).length;

    return {
      todos, newTodo, editingId, editText, filter,
      addTodo, toggleTodo, deleteTodo, startEdit, saveEdit, cancelEdit,
      getFilteredTodos, clearCompleted, remaining
    };
  },
  template: (ctx) => `
    <div class="todo-app">
      <h2>Todo List</h2>

      <form class="todo-form" @submit="(e) => { e.preventDefault(); addTodo(); }">
        <input
          type="text"
          placeholder="What needs to be done?"
          value="${ctx.newTodo.value}"
          @input="(e) => newTodo.value = e.target.value"
        />
        <button type="submit">Add</button>
      </form>

      <div class="filters">
        <button
          class="${ctx.filter.value === 'all' ? 'active' : ''}"
          @click="() => filter.value = 'all'"
        >All</button>
        <button
          class="${ctx.filter.value === 'active' ? 'active' : ''}"
          @click="() => filter.value = 'active'"
        >Active</button>
        <button
          class="${ctx.filter.value === 'completed' ? 'active' : ''}"
          @click="() => filter.value = 'completed'"
        >Completed</button>
      </div>

      <ul class="todo-list">
        ${ctx.getFilteredTodos().map(todo => `
          <li key="${todo.id}" class="${todo.completed ? 'completed' : ''}">
            ${ctx.editingId.value === todo.id ? `
              <input
                type="text"
                value="${ctx.editText.value}"
                @input="(e) => editText.value = e.target.value"
                @keyup="(e) => e.key === 'Enter' && saveEdit()"
              />
              <button @click="saveEdit">Save</button>
              <button @click="cancelEdit">Cancel</button>
            ` : `
              <input
                type="checkbox"
                ${todo.completed ? 'checked' : ''}
                @change="() => toggleTodo(${todo.id})"
              />
              <span @dblclick="() => startEdit(${JSON.stringify(todo).replace(/"/g, '&quot;')})">${todo.text}</span>
              <button class="delete" @click="() => deleteTodo(${todo.id})">×</button>
            `}
          </li>
        `).join("")}
      </ul>

      <div class="todo-footer">
        <span>${ctx.remaining()} items left</span>
        <button @click="clearCompleted">Clear completed</button>
      </div>
    </div>
  `,
  style: `
    .todo-app { max-width: 500px; margin: 0 auto; }
    .todo-form { display: flex; gap: 10px; margin-bottom: 20px; }
    .todo-form input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
    .filters { display: flex; gap: 5px; margin-bottom: 15px; }
    .filters button { padding: 5px 15px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px; }
    .filters button.active { background: #007bff; color: white; border-color: #007bff; }
    .todo-list { list-style: none; padding: 0; }
    .todo-list li { display: flex; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid #eee; }
    .todo-list li.completed span { text-decoration: line-through; color: #999; }
    .todo-list li span { flex: 1; cursor: pointer; }
    .todo-list li .delete { background: none; border: none; color: #dc3545; cursor: pointer; font-size: 18px; }
    .todo-footer { display: flex; justify-content: space-between; margin-top: 15px; color: #666; }
  `
});
```

---

## Grouped List

List with grouped items by category.

```javascript
app.component("GroupedList", {
  setup({ signal }) {
    const items = signal([
      { id: 1, name: "Apple", category: "Fruits" },
      { id: 2, name: "Banana", category: "Fruits" },
      { id: 3, name: "Carrot", category: "Vegetables" },
      { id: 4, name: "Broccoli", category: "Vegetables" },
      { id: 5, name: "Chicken", category: "Meat" },
      { id: 6, name: "Orange", category: "Fruits" },
      { id: 7, name: "Beef", category: "Meat" }
    ]);
    const expandedGroups = signal(new Set(["Fruits", "Vegetables", "Meat"]));

    function getGroupedItems() {
      const groups = {};
      items.value.forEach(item => {
        if (!groups[item.category]) {
          groups[item.category] = [];
        }
        groups[item.category].push(item);
      });
      return groups;
    }

    function toggleGroup(category) {
      const newExpanded = new Set(expandedGroups.value);
      if (newExpanded.has(category)) {
        newExpanded.delete(category);
      } else {
        newExpanded.add(category);
      }
      expandedGroups.value = newExpanded;
    }

    function isExpanded(category) {
      return expandedGroups.value.has(category);
    }

    return { getGroupedItems, toggleGroup, isExpanded };
  },
  template: (ctx) => {
    const groups = ctx.getGroupedItems();
    return `
      <div class="grouped-list">
        ${Object.entries(groups).map(([category, items]) => `
          <div key="${category}" class="group">
            <button
              class="group-header ${ctx.isExpanded(category) ? 'expanded' : ''}"
              @click="() => toggleGroup('${category}')"
            >
              <span>${ctx.isExpanded(category) ? '▼' : '▶'}</span>
              ${category} (${items.length})
            </button>
            ${ctx.isExpanded(category) ? `
              <ul class="group-items">
                ${items.map(item => `
                  <li key="${item.id}">${item.name}</li>
                `).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  },
  style: `
    .grouped-list { max-width: 300px; }
    .group { margin-bottom: 5px; }
    .group-header {
      width: 100%; padding: 10px 15px; background: #f8f9fa;
      border: 1px solid #ddd; cursor: pointer; text-align: left;
      font-weight: bold; display: flex; gap: 10px;
    }
    .group-header.expanded { background: #e9ecef; }
    .group-items { list-style: none; padding: 0; margin: 0; border: 1px solid #ddd; border-top: none; }
    .group-items li { padding: 8px 15px 8px 35px; border-bottom: 1px solid #eee; }
    .group-items li:last-child { border-bottom: none; }
  `
});
```

---

## Virtual Scrolling

For very large datasets (10,000+ rows), virtual scrolling renders only visible rows instead of all items. This dramatically improves both memory usage and update performance.

### Performance Comparison

| Metric | Standard Rendering | Virtual Scrolling | Improvement |
|--------|-------------------|-------------------|-------------|
| Memory (10K rows) | ~29 MB | ~5 MB | **5.5x less** |
| Create 10K rows | ~250ms | ~24ms | **10x faster** |
| Update every 10th | ~86ms | ~9ms | **9.5x faster** |
| DOM elements | 10,000 | ~17 | **588x fewer** |

### When to Use Virtual Scrolling

| Dataset Size | Recommended Approach |
|--------------|---------------------|
| < 1,000 rows | Standard rendering with keys |
| 1,000 - 10,000 rows | Standard rendering (Eleva handles efficiently) |
| 10,000+ rows | **Virtual scrolling** |

### Complete Virtual Scrolling Example

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

### Key Implementation Details

**1. Virtual Window Calculation:**

Only render rows visible in the viewport, plus a small buffer for smooth scrolling:

```javascript
const startIndex = Math.max(0, Math.floor(scroll / ROW_HEIGHT) - BUFFER);
const endIndex = Math.min(filteredUsers.length, startIndex + VISIBLE_COUNT);
const visibleUsers = filteredUsers.slice(startIndex, endIndex);
```

**2. Scroll Container Structure:**

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

**3. Parameterized Event Handlers:**

Use arrow functions when passing arguments to handlers:

```javascript
// Correct - arrow function defers execution
<a @click="() => selectUser(${user.id})">${user.name}</a>
<button @click="() => deleteUser(${user.id})">Delete</button>

// Wrong - executes immediately during render
<a @click="selectUser(${user.id})">...</a>
```

**4. Filtering with Virtual Scrolling:**

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

### Why Arrow Functions for Row Events?

| Syntax | What Happens | Result |
|--------|--------------|--------|
| `@click="handleClick"` | References function directly | Works (no params) |
| `@click="deleteUser(5)"` | **Executes immediately** during render | Broken |
| `@click="() => deleteUser(5)"` | Creates function, calls on click | Works |

The arrow function wraps the call, deferring execution until the actual click event occurs. Without it, the function runs during template rendering—not when clicked.

---

### Reusable Virtual List Component

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

**Usage:**

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

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | Array | `[]` | Data array (each item needs `id`) |
| `labelKey` | String | `"label"` | Property to display |
| `height` | Number | `300` | Viewport height in pixels |
| `rowHeight` | Number | `40` | Row height in pixels |

**Events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `item:click` | Item object | Emitted when row is clicked |

---

[← Back to Patterns](./index.md) | [Previous: Conditional Rendering](./conditional-rendering.md) | [Next: State Management →](./state.md)
