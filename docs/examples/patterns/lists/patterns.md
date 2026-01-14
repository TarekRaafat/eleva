---
title: List Patterns - Drag-Drop, CRUD & Grouped
description: Eleva.js patterns for drag-and-drop reordering, CRUD operations, and grouped lists.
---

# List Patterns

> **Version:** 1.0.0 | Advanced list patterns including drag-drop, CRUD operations, and grouped lists.

---

## Drag-and-Drop Reorderable List

A list that supports drag-and-drop reordering with keyboard fallback buttons.

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

### Key Concepts

- **draggable="true"** - Enable native drag-and-drop
- **@dragstart** - Store the dragged item's index
- **@dragover** - Prevent default to allow drop
- **@drop** - Reorder array when dropped
- **Keyboard fallback** - Up/down buttons for accessibility

---

## Todo List with CRUD

Complete todo list with create, read, update, delete operations and filtering.

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

### CRUD Operations Summary

| Operation | Function | Signal Update |
|-----------|----------|---------------|
| **Create** | `addTodo()` | `[...todos.value, newItem]` |
| **Read** | `getFilteredTodos()` | Computed function |
| **Update** | `saveEdit()` | `.map()` to replace item |
| **Delete** | `deleteTodo()` | `.filter()` to remove item |

---

## Grouped List

List with expandable/collapsible groups by category.

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

### Key Concepts

- **Grouping** - Use `Object.entries()` to iterate over grouped object
- **Set for state** - Use `Set` for efficient toggle operations
- **Conditional rendering** - Only render items when group is expanded

---

## Next Steps

- **[Virtual Scrolling](./virtual-scrolling.md)** - Handle 10K+ rows efficiently

---

[← Search & Filter](./search-filter.md) | [Virtual Scrolling →](./virtual-scrolling.md)
