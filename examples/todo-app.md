# Todo App Example

In this tutorial, you'll build a Todo App using Eleva. This example demonstrates a more sophisticated application that uses Eleva’s component-based architecture and signal-based reactivity. You'll learn how to create, update, and remove todos—all while keeping your code lean and efficient.

> **Note:** This example uses the minified UMD build of Eleva. Make sure you've included Eleva correctly in your HTML file.

---

## Table of Contents

- [Todo App Example](#todo-app-example)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Setup](#setup)
  - [Code Explanation](#code-explanation)
    - [What the Code Does](#what-the-code-does)
  - [Running the Example](#running-the-example)
  - [Conclusion](#conclusion)

---

## Overview

This Todo App allows you to:

- **Add a new todo:** Type a task in the input field and press the Enter key or click the "Add Todo" button.
- **Toggle a todo:** Click on a todo's text to mark it as completed or uncompleted.
- **Remove a todo:** Click the "Remove" button next to a todo to delete it.

The application is built with Eleva, a lightweight frontend runtime framework inspired by pure vanilla JavaScript.

---

## Setup

1. **Create an HTML file (e.g., `index.html`):**

   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <title>Eleva Todo App Example</title>
       <style>
         /* Optional: Global styles can be added here */
       </style>
     </head>
     <body>
       <div id="app"></div>
       <!-- Load the minified UMD build of Eleva from CDN -->
       <script src="https://unpkg.com/eleva/dist/eleva.min.js"></script>
       <!-- Load your Todo App code -->
       <script src="todo-app.js"></script>
     </body>
   </html>
   ```

2. **Create a JavaScript file (e.g., `todo-app.js`):**
   Copy the code snippet below into your `todo-app.js` file.

---

## Code Explanation

Below is the complete code for the Todo App component with detailed documentation:

```js
const todoAppComponent = {
  /**
   * Component setup function: Initializes reactive signals and event handlers.
   *
   * @param {object} context - The component context with helper methods.
   * @returns {object} Data and functions for the template.
   */
  setup: ({ signal }) => {
    // Signal holding the list of todos (each todo: { id, text, completed }).
    const todos = signal([]);
    // Signal for the new todo input value.
    const newTodo = signal("");

    /**
     * Adds a new todo to the list.
     * This function checks if the input is non-empty and if the event is a keydown (Enter key)
     * or a click, then adds a new todo with a unique ID.
     *
     * @param {Event} event - The triggering event (keydown or click).
     */
    function addTodo(event) {
      const text = newTodo.value.trim();
      if ((text && event.key === "Enter") || (text && event.type === "click")) {
        todos.value = [
          ...todos.value,
          { id: Date.now(), text, completed: false },
        ];
        newTodo.value = "";
      }
    }

    /**
     * Toggles the completed state of a todo.
     *
     * @param {number} id - The ID of the todo.
     */
    function toggleTodo(id) {
      todos.value = todos.value.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
    }

    /**
     * Removes a todo from the list.
     *
     * @param {number} id - The ID of the todo.
     */
    function removeTodo(id) {
      todos.value = todos.value.filter((todo) => todo.id !== Number(id));
    }

    /**
     * Renders the list of todos as HTML.
     *
     * @returns {string} The HTML string for the todos.
     */
    function renderTodos() {
      if (todos.value.length === 0)
        return '<li class="empty">No todos yet!</li>';
      return todos.value
        .map((todo) => {
          return `<li class="todo-item ${
            todo.completed ? "completed" : ""
          }" key="${todo.id}">
              <span @click="() => toggleTodo(${todo.id})">${todo.text}</span>
              <button class="remove-btn" @click="() => removeTodo(${
                todo.id
              })">Remove</button>
            </li>`;
        })
        .join("");
    }

    return { todos, newTodo, addTodo, toggleTodo, removeTodo, renderTodos };
  },

  /**
   * Component template function: Returns the HTML structure.
   *
   * @param {object} ctx - The component context with reactive data.
   * @returns {string} The HTML template string.
   */
  template: () => {
    return `
      <div class="todo-app">
        <h1>To‑Do List</h1>
        <div class="input-section">
          <input type="text" placeholder="Enter a new to‑do" value="{{ newTodo.value }}" @input="(e) => newTodo.value = e.target.value" @keydown="addTodo" />
          <button @click="addTodo">Add Todo</button>
        </div>
        <ul class="todo-list">
          {{ renderTodos() }}
        </ul>
      </div>
    `;
  },

  /**
   * Component style function: Returns scoped CSS for the to‑do app.
   *
   * @param {object} ctx - The component context.
   * @returns {string} The CSS styles.
   */
  style: (ctx) => {
    return `
      .todo-app {
        max-width: 500px;
        margin: 2rem auto;
        padding: 1rem;
        background: #f9f9f9;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        font-family: Arial, sans-serif;
      }
      .todo-app h1 {
        text-align: center;
        color: #333;
        margin-bottom: 1rem;
      }
      .input-section {
        display: flex;
        justify-content: center;
        margin-bottom: 1rem;
      }
      .input-section input {
        flex: 1;
        padding: 0.5rem;
        font-size: 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      .input-section button {
        margin-left: 0.5rem;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        background: #28a745;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .input-section button:hover {
        background: #218838;
      }
      .todo-list {
        list-style: none;
        padding: 0;
      }
      .todo-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        border-bottom: 1px solid #ddd;
      }
      .todo-item.completed span {
        text-decoration: line-through;
        color: #888;
      }
      .todo-item span {
        flex: 1;
        cursor: pointer;
      }
      .remove-btn {
        background: #dc3545;
        color: #fff;
        border: none;
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        cursor: pointer;
      }
      .remove-btn:hover {
        background: #c82333;
      }
      .empty {
        text-align: center;
        color: #666;
        padding: 0.5rem;
      }
      /* Responsive Design */
      @media (max-width: 600px) {
        .todo-app {
          margin: 1rem;
          padding: 0.5rem;
        }
        .input-section input, .input-section button {
          font-size: 0.9rem;
        }
      }
    `;
  },
};

// Initialize Eleva and register the component.
const eleva = new Eleva("ToDoApp");
eleva.component("todo-app", todoAppComponent);
// Mount the to‑do app into the #app container.
eleva.mount("#app", "todo-app");
```

### What the Code Does

- **Setup Function:**
  Initializes two signals—`todos` (an array of todo objects) and `newTodo` (the current input value). It also defines helper functions:

  - `addTodo`: Adds a new todo when the Enter key is pressed or the button is clicked.
  - `toggleTodo`: Toggles a todo's completed status.
  - `removeTodo`: Removes a todo by filtering it out of the array.
  - `renderTodos`: Generates the HTML for the list of todos.

- **Template Function:**
  Returns the HTML structure for the Todo App. It uses Eleva's interpolation syntax (`{{ ... }}`) to embed reactive values and function calls.

- **Style Function:**
  Provides scoped CSS to style the Todo App with a clean, modern look and ensures responsiveness on smaller screens.

---

## Running the Example

1. **Place the Files:**
   Ensure that your `index.html` and `todo-app.js` files are in the same directory.

2. **Open in a Browser:**
   Open `index.html` in your favorite browser. You should see the Todo App rendered within the `#app` container.

3. **Interact:**
   - Type a new todo in the input field and press **Enter** or click **Add Todo**.
   - Click on a todo's text to toggle its completed state.
   - Click the **Remove** button to delete a todo.

Check the browser console if you encounter any issues.

---

## Conclusion

This Todo App example demonstrates how to use Eleva to build dynamic, interactive applications with minimal code. It leverages Eleva's component-based architecture, reactive signals, and template parsing to create a fully functional Todo App that remains extremely lightweight (~4 KB minified) while supporting robust features, including built-in TypeScript declarations.

Feel free to modify and extend this example as you explore more of what Eleva can do!

---

> **Tip:** As Eleva evolves, you can build upon this foundation to create more complex applications. Enjoy coding with Eleva!
