// Golden AI Example: Todo App
// Demonstrates: signal arrays, list rendering with key, event handling, onUnmount cleanup.

const app = new Eleva("TodoApp");

app.component("TodoApp", {
  setup: ({ signal }) => {
    const todos = signal([]);
    const input = signal("");
    let nextId = 1;

    const addTodo = () => {
      const text = input.value.trim();
      if (!text) return;
      todos.value = [...todos.value, { id: nextId++, text, done: false }];
      input.value = "";
    };

    const toggle = (id) => {
      todos.value = todos.value.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      );
    };

    const remove = (id) => {
      todos.value = todos.value.filter((t) => t.id !== id);
    };

    return {
      todos,
      input,
      addTodo,
      toggle,
      remove,
      remaining: () => todos.value.filter((t) => !t.done).length,
    };
  },
  template: (ctx) => `
    <div>
      <h1>Todos (${ctx.remaining()} left)</h1>
      <form @submit="(e) => { e.preventDefault(); addTodo(); }">
        <input
          type="text"
          placeholder="What needs to be done?"
          value="${ctx.input.value}"
          @input="(e) => input.value = e.target.value" />
        <button type="submit">Add</button>
      </form>
      <ul>
        ${ctx.todos.value
          .map(
            (todo) => `
          <li key="${todo.id}" style="${todo.done ? "text-decoration: line-through; opacity: 0.5;" : ""}">
            <input type="checkbox" ${todo.done ? "checked" : ""} @change="() => toggle(${todo.id})" />
            <span>${todo.text}</span>
            <button @click="() => remove(${todo.id})">x</button>
          </li>
        `
          )
          .join("")}
      </ul>
    </div>
  `,
});

app.mount(document.getElementById("app"), "TodoApp");
