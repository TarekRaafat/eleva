# List Operations Examples

Learn how to search, filter, sort, and reorder lists in Eleva.

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
              <option value="${cat}" ${ctx.categoryFilter.value === cat ? "selected" : ""}>
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
            <div class="product-card ${!product.inStock ? 'out-of-stock' : ''}">
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
          <li class="${todo.completed ? 'completed' : ''}">
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
          <div class="group">
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
                  <li>${item.name}</li>
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

## Virtual/Windowed List (Simple)

Basic windowed list for performance with large datasets.

```javascript
app.component("VirtualList", {
  setup({ signal }) {
    // Generate large dataset
    const allItems = Array.from({ length: 10000 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      description: `Description for item ${i + 1}`
    }));

    const scrollTop = signal(0);
    const containerHeight = 400;
    const itemHeight = 50;
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2;

    function getVisibleItems() {
      const startIndex = Math.floor(scrollTop.value / itemHeight);
      const endIndex = Math.min(startIndex + visibleCount, allItems.length);
      return {
        items: allItems.slice(startIndex, endIndex),
        startIndex,
        totalHeight: allItems.length * itemHeight,
        offsetY: startIndex * itemHeight
      };
    }

    function handleScroll(event) {
      scrollTop.value = event.target.scrollTop;
    }

    return { getVisibleItems, handleScroll, containerHeight, itemHeight };
  },
  template: (ctx) => {
    const { items, totalHeight, offsetY } = ctx.getVisibleItems();
    return `
      <div class="virtual-list-info">
        <p>Rendering ${items.length} of 10,000 items</p>
      </div>
      <div
        class="virtual-list-container"
        style="height: ${ctx.containerHeight}px;"
        @scroll="handleScroll"
      >
        <div class="virtual-list-spacer" style="height: ${totalHeight}px;">
          <div class="virtual-list-items" style="transform: translateY(${offsetY}px);">
            ${items.map(item => `
              <div class="virtual-list-item" style="height: ${ctx.itemHeight}px;">
                <strong>${item.name}</strong>
                <span>${item.description}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },
  style: `
    .virtual-list-info { margin-bottom: 10px; color: #666; }
    .virtual-list-container { overflow-y: auto; border: 1px solid #ddd; }
    .virtual-list-spacer { position: relative; }
    .virtual-list-items { position: absolute; left: 0; right: 0; }
    .virtual-list-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0 15px; border-bottom: 1px solid #eee; box-sizing: border-box;
    }
    .virtual-list-item strong { color: #333; }
    .virtual-list-item span { color: #666; font-size: 14px; }
  `
});
```

---

[← Back to Patterns](./index.md) | [Previous: Conditional Rendering](./conditional-rendering.md) | [Next: State Management →](./state.md)
