# Task Manager

A complete task manager with filtering, sorting, priorities, due dates, and localStorage persistence.

## Features

- Add, edit, and delete tasks
- Set priority levels (low, medium, high)
- Add due dates
- Mark tasks as complete
- Search tasks
- Filter by status (all, active, completed)
- Sort by date, priority, or due date
- Automatic localStorage persistence
- Responsive design

---

## Complete Code

```javascript
import Eleva from "eleva";

const app = new Eleva("TaskManager");

// Task Item Component
app.component("TaskItem", {
  setup({ props }) {
    const { task, onToggle, onDelete, onEdit } = props;
    return { task, onToggle, onDelete, onEdit };
  },
  template: (ctx) => `
    <div class="task-item ${ctx.task.completed ? 'completed' : ''} priority-${ctx.task.priority}">
      <input
        type="checkbox"
        ${ctx.task.completed ? 'checked' : ''}
        @change="onToggle"
      />
      <div class="task-content">
        <span class="task-title">${ctx.task.title}</span>
        ${ctx.task.dueDate ? `<span class="due-date">Due: ${ctx.task.dueDate}</span>` : ''}
        <span class="priority-badge">${ctx.task.priority}</span>
      </div>
      <div class="task-actions">
        <button class="edit-btn" @click="onEdit">✎</button>
        <button class="delete-btn" @click="onDelete">×</button>
      </div>
    </div>
  `
});

// Main Task Manager Component
app.component("TaskManager", {
  setup({ signal }) {
    // Load from localStorage
    const savedTasks = localStorage.getItem("tasks");
    const tasks = signal(savedTasks ? JSON.parse(savedTasks) : []);

    const filter = signal("all"); // all, active, completed
    const sortBy = signal("created"); // created, priority, dueDate
    const searchQuery = signal("");
    const showForm = signal(false);
    const editingTask = signal(null);

    // Form state
    const newTask = signal({
      title: "",
      priority: "medium",
      dueDate: ""
    });

    // Auto-save to localStorage
    tasks.watch((t) => localStorage.setItem("tasks", JSON.stringify(t)));

    // Computed: filtered and sorted tasks
    function getFilteredTasks() {
      let result = [...tasks.value];

      // Search
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(t => t.title.toLowerCase().includes(q));
      }

      // Filter
      if (filter.value === "active") result = result.filter(t => !t.completed);
      if (filter.value === "completed") result = result.filter(t => t.completed);

      // Sort
      result.sort((a, b) => {
        if (sortBy.value === "priority") {
          const order = { high: 0, medium: 1, low: 2 };
          return order[a.priority] - order[b.priority];
        }
        if (sortBy.value === "dueDate") {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      return result;
    }

    // Stats
    function getStats() {
      const total = tasks.value.length;
      const completed = tasks.value.filter(t => t.completed).length;
      const active = total - completed;
      return { total, completed, active };
    }

    // Actions
    function addTask() {
      if (!newTask.value.title.trim()) return;

      const task = {
        id: Date.now(),
        title: newTask.value.title,
        priority: newTask.value.priority,
        dueDate: newTask.value.dueDate,
        completed: false,
        createdAt: new Date().toISOString()
      };

      tasks.value = [...tasks.value, task];
      newTask.value = { title: "", priority: "medium", dueDate: "" };
      showForm.value = false;
    }

    function updateTask() {
      if (!editingTask.value || !newTask.value.title.trim()) return;

      tasks.value = tasks.value.map(t =>
        t.id === editingTask.value.id
          ? { ...t, ...newTask.value }
          : t
      );

      editingTask.value = null;
      newTask.value = { title: "", priority: "medium", dueDate: "" };
      showForm.value = false;
    }

    function startEdit(task) {
      editingTask.value = task;
      newTask.value = {
        title: task.title,
        priority: task.priority,
        dueDate: task.dueDate || ""
      };
      showForm.value = true;
    }

    function toggleTask(id) {
      tasks.value = tasks.value.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
    }

    function deleteTask(id) {
      tasks.value = tasks.value.filter(t => t.id !== id);
    }

    function clearCompleted() {
      tasks.value = tasks.value.filter(t => !t.completed);
    }

    function cancelForm() {
      showForm.value = false;
      editingTask.value = null;
      newTask.value = { title: "", priority: "medium", dueDate: "" };
    }

    return {
      tasks, filter, sortBy, searchQuery, showForm, newTask, editingTask,
      getFilteredTasks, getStats,
      addTask, updateTask, startEdit, toggleTask, deleteTask, clearCompleted, cancelForm
    };
  },
  template: (ctx) => {
    const stats = ctx.getStats();
    const filtered = ctx.getFilteredTasks();

    return `
      <div class="task-manager">
        <header class="tm-header">
          <h1>Task Manager</h1>
          <div class="stats">
            <span>${stats.active} active</span>
            <span>${stats.completed} completed</span>
          </div>
        </header>

        <div class="controls">
          <input
            type="text"
            class="search-input"
            placeholder="Search tasks..."
            value="${ctx.searchQuery.value}"
            @input="(e) => searchQuery.value = e.target.value"
          />

          <div class="filter-sort">
            <select @change="(e) => filter.value = e.target.value">
              <option value="all" ${ctx.filter.value === "all" ? "selected" : ""}>All</option>
              <option value="active" ${ctx.filter.value === "active" ? "selected" : ""}>Active</option>
              <option value="completed" ${ctx.filter.value === "completed" ? "selected" : ""}>Completed</option>
            </select>

            <select @change="(e) => sortBy.value = e.target.value">
              <option value="created" ${ctx.sortBy.value === "created" ? "selected" : ""}>Newest First</option>
              <option value="priority" ${ctx.sortBy.value === "priority" ? "selected" : ""}>Priority</option>
              <option value="dueDate" ${ctx.sortBy.value === "dueDate" ? "selected" : ""}>Due Date</option>
            </select>
          </div>

          <button class="add-btn" @click="() => showForm.value = true">+ Add Task</button>
        </div>

        ${ctx.showForm.value ? `
          <div class="task-form">
            <h3>${ctx.editingTask.value ? 'Edit Task' : 'New Task'}</h3>
            <input
              type="text"
              placeholder="Task title..."
              value="${ctx.newTask.value.title}"
              @input="(e) => newTask.value = { ...newTask.value, title: e.target.value }"
            />
            <div class="form-row">
              <select @change="(e) => newTask.value = { ...newTask.value, priority: e.target.value }">
                <option value="low" ${ctx.newTask.value.priority === "low" ? "selected" : ""}>Low</option>
                <option value="medium" ${ctx.newTask.value.priority === "medium" ? "selected" : ""}>Medium</option>
                <option value="high" ${ctx.newTask.value.priority === "high" ? "selected" : ""}>High</option>
              </select>
              <input
                type="date"
                value="${ctx.newTask.value.dueDate}"
                @change="(e) => newTask.value = { ...newTask.value, dueDate: e.target.value }"
              />
            </div>
            <div class="form-actions">
              <button @click="${ctx.editingTask.value ? 'updateTask' : 'addTask'}">
                ${ctx.editingTask.value ? 'Update' : 'Add'}
              </button>
              <button class="cancel" @click="cancelForm">Cancel</button>
            </div>
          </div>
        ` : ''}

        <div class="task-list">
          ${filtered.length === 0 ? `
            <p class="no-tasks">
              ${ctx.searchQuery.value ? 'No tasks match your search' : 'No tasks yet. Add one!'}
            </p>
          ` : filtered.map(task => `
            <div class="task-item-container"
                 :task='${JSON.stringify(task)}'
                 :onToggle="() => toggleTask(${task.id})"
                 :onDelete="() => deleteTask(${task.id})"
                 :onEdit="() => startEdit(${JSON.stringify(task).replace(/"/g, '&quot;')})">
            </div>
          `).join("")}
        </div>

        ${stats.completed > 0 ? `
          <button class="clear-completed" @click="clearCompleted">
            Clear completed (${stats.completed})
          </button>
        ` : ''}
      </div>
    `;
  },
  style: `
    .task-manager { max-width: 600px; margin: 0 auto; padding: 20px; }
    .tm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .tm-header h1 { margin: 0; }
    .stats span { margin-left: 15px; color: #666; }
    .controls { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-input { flex: 1; min-width: 200px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; }
    .filter-sort { display: flex; gap: 8px; }
    .filter-sort select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    .add-btn { padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .task-form { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .task-form h3 { margin: 0 0 15px 0; }
    .task-form input[type="text"] { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px; }
    .form-row { display: flex; gap: 10px; margin-bottom: 15px; }
    .form-row select, .form-row input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    .form-actions { display: flex; gap: 10px; }
    .form-actions button { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
    .form-actions button:first-child { background: #28a745; color: white; }
    .form-actions button.cancel { background: #6c757d; color: white; }
    .task-item { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #eee; border-radius: 4px; margin-bottom: 8px; }
    .task-item.completed .task-title { text-decoration: line-through; color: #999; }
    .task-item.priority-high { border-left: 4px solid #dc3545; }
    .task-item.priority-medium { border-left: 4px solid #ffc107; }
    .task-item.priority-low { border-left: 4px solid #28a745; }
    .task-content { flex: 1; }
    .task-title { display: block; font-weight: 500; }
    .due-date { font-size: 12px; color: #666; }
    .priority-badge { font-size: 11px; padding: 2px 6px; border-radius: 3px; background: #eee; margin-left: 8px; }
    .task-actions button { padding: 4px 8px; border: none; background: transparent; cursor: pointer; font-size: 16px; }
    .delete-btn:hover { color: #dc3545; }
    .edit-btn:hover { color: #007bff; }
    .no-tasks { text-align: center; color: #999; padding: 40px; }
    .clear-completed { width: 100%; padding: 10px; background: none; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; color: #666; }
    .clear-completed:hover { background: #f8f9fa; }
  `,
  children: {
    ".task-item-container": "TaskItem"
  }
});

// Mount the application
app.mount(document.getElementById("app"), "TaskManager");
```

---

## Features Demonstrated

- **Component composition** - TaskItem + TaskManager
- **Signal-based reactivity** - All state managed with signals
- **LocalStorage persistence** - Tasks saved automatically
- **Search, filter, and sort** - Dynamic list manipulation
- **CRUD operations** - Create, read, update, delete
- **Form handling** - Input binding and validation
- **Conditional rendering** - Show/hide based on state
- **Scoped styling** - Component-specific CSS

---

[← Back to Apps](./index.md) | [Next: Weather Dashboard →](./weather-dashboard.md)
