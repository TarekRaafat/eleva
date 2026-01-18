---
title: Local Storage - Persistence & Caching
description: Eleva.js localStorage patterns for data persistence, session storage, caching strategies, and auto-save functionality. Keep user data across browser sessions.
---

<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-S4L689921Q"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", "G-S4L689921Q");
</script>

# Local Storage Examples

> **UI Patterns** | Persistence, session storage, and caching.

---

## Persistent Notes App

A notes app that saves to localStorage automatically.

```javascript
app.component("NotesApp", {
  setup({ signal }) {
    // Load notes from localStorage on init
    const savedNotes = localStorage.getItem("eleva-notes");
    const notes = signal(savedNotes ? JSON.parse(savedNotes) : []);
    const currentNote = signal({ id: null, title: "", content: "" });
    const isEditing = signal(false);

    // Save to localStorage whenever notes change
    notes.watch((newNotes) => {
      localStorage.setItem("eleva-notes", JSON.stringify(newNotes));
    });

    function createNote() {
      currentNote.value = { id: null, title: "", content: "" };
      isEditing.value = true;
    }

    function editNote(note) {
      currentNote.value = { ...note };
      isEditing.value = true;
    }

    function saveNote() {
      const note = currentNote.value;

      if (!note.title.trim()) return;

      if (note.id) {
        // Update existing note
        notes.value = notes.value.map(n =>
          n.id === note.id ? { ...note, updatedAt: Date.now() } : n
        );
      } else {
        // Create new note
        notes.value = [...notes.value, {
          ...note,
          id: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now()
        }];
      }

      isEditing.value = false;
      currentNote.value = { id: null, title: "", content: "" };
    }

    function deleteNote(id) {
      if (confirm("Delete this note?")) {
        notes.value = notes.value.filter(n => n.id !== id);
      }
    }

    function cancelEdit() {
      isEditing.value = false;
      currentNote.value = { id: null, title: "", content: "" };
    }

    function formatDate(timestamp) {
      return new Date(timestamp).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
      });
    }

    return {
      notes, currentNote, isEditing,
      createNote, editNote, saveNote, deleteNote, cancelEdit, formatDate
    };
  },
  template: (ctx) => `
    <div class="notes-app">
      <header>
        <h1>My Notes</h1>
        <button @click="createNote">+ New Note</button>
      </header>

      ${ctx.isEditing.value ? `
        <div class="note-editor">
          <input
            type="text"
            placeholder="Note title..."
            value="${ctx.currentNote.value.title}"
            @input="(e) => currentNote.value = { ...currentNote.value, title: e.target.value }"
          />
          <textarea
            placeholder="Write your note..."
            @input="(e) => currentNote.value = { ...currentNote.value, content: e.target.value }"
          >${ctx.currentNote.value.content}</textarea>
          <div class="editor-actions">
            <button class="save-btn" @click="saveNote">Save</button>
            <button class="cancel-btn" @click="cancelEdit">Cancel</button>
          </div>
        </div>
      ` : `
        <div class="notes-list">
          ${ctx.notes.value.length === 0 ? `
            <p class="no-notes">No notes yet. Create your first note!</p>
          ` : ctx.notes.value.map(note => `
            <div key="${note.id}" class="note-card">
              <h3>${note.title}</h3>
              <p>${note.content.substring(0, 100)}${note.content.length > 100 ? "..." : ""}</p>
              <div class="note-meta">
                <span>Updated: ${ctx.formatDate(note.updatedAt)}</span>
              </div>
              <div class="note-actions">
                <button @click="() => editNote(${JSON.stringify(note).replace(/"/g, '&quot;')})">Edit</button>
                <button @click="() => deleteNote(${note.id})">Delete</button>
              </div>
            </div>
          `).join("")}
        </div>
      `}
    </div>
  `,
  style: `
    .notes-app { max-width: 600px; margin: 0 auto; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    header h1 { margin: 0; }
    header button { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .note-editor { background: #f8f9fa; padding: 20px; border-radius: 8px; }
    .note-editor input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px; font-size: 1.1rem; }
    .note-editor textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; min-height: 200px; resize: vertical; }
    .editor-actions { margin-top: 15px; display: flex; gap: 10px; }
    .save-btn { padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .cancel-btn { padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .no-notes { text-align: center; color: #666; padding: 40px; }
    .note-card { border: 1px solid #eee; padding: 20px; border-radius: 8px; margin-bottom: 15px; }
    .note-card h3 { margin: 0 0 10px 0; }
    .note-card p { color: #666; margin: 0 0 10px 0; }
    .note-meta { font-size: 12px; color: #999; margin-bottom: 10px; }
    .note-actions button { margin-right: 10px; padding: 5px 15px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; }
  `
});
```

**Key Concepts:**
- Load from localStorage on component init
- Use `signal.watch()` to auto-save on changes
- JSON serialize/deserialize for complex data
- Confirmation before destructive actions

---

## Theme Preference with localStorage

Persist user's theme preference across sessions.

```javascript
app.component("ThemeSwitcher", {
  setup({ signal }) {
    // Load theme from localStorage or default to system preference
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = signal(savedTheme || (systemPrefersDark ? "dark" : "light"));

    // Apply theme on change
    theme.watch((newTheme) => {
      localStorage.setItem("theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    });

    // Apply initial theme
    document.documentElement.setAttribute("data-theme", theme.value);

    function setTheme(newTheme) {
      theme.value = newTheme;
    }

    function toggleTheme() {
      theme.value = theme.value === "light" ? "dark" : "light";
    }

    return { theme, setTheme, toggleTheme };
  },
  template: (ctx) => `
    <div class="theme-switcher">
      <h3>Theme Settings</h3>

      <div class="theme-options">
        <button
          class="${ctx.theme.value === 'light' ? 'active' : ''}"
          @click="() => setTheme('light')"
        >
          ☀️ Light
        </button>
        <button
          class="${ctx.theme.value === 'dark' ? 'active' : ''}"
          @click="() => setTheme('dark')"
        >
          🌙 Dark
        </button>
      </div>

      <button class="toggle-btn" @click="toggleTheme">
        Toggle Theme
      </button>

      <p class="current-theme">Current: <strong>${ctx.theme.value}</strong></p>

      <div class="demo-content">
        <h4>Demo Content</h4>
        <p>This content will change based on the selected theme.</p>
      </div>
    </div>
  `,
  style: (ctx) => `
    .theme-switcher { max-width: 400px; margin: 0 auto; padding: 20px; }
    .theme-options { display: flex; gap: 10px; margin-bottom: 20px; }
    .theme-options button {
      flex: 1; padding: 15px; border: 2px solid #ddd;
      background: white; border-radius: 8px; cursor: pointer; font-size: 1rem;
    }
    .theme-options button.active { border-color: #007bff; background: #f0f7ff; }
    .toggle-btn { width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .current-theme { text-align: center; margin-top: 15px; }
    .demo-content { margin-top: 20px; padding: 20px; background: var(--bg-secondary, #f8f9fa); border-radius: 8px; }

    /* Theme variables - add to your global CSS */
    :root[data-theme="light"] {
      --bg-primary: #ffffff;
      --bg-secondary: #f8f9fa;
      --text-primary: #212529;
    }
    :root[data-theme="dark"] {
      --bg-primary: #1a1a1a;
      --bg-secondary: #2d2d2d;
      --text-primary: #ffffff;
    }
  `
});
```

---

## Recent Searches with localStorage

Store and display recent search queries.

```javascript
app.component("SearchWithHistory", {
  setup({ signal }) {
    const MAX_HISTORY = 10;
    const savedHistory = localStorage.getItem("search-history");
    const searchHistory = signal(savedHistory ? JSON.parse(savedHistory) : []);
    const query = signal("");
    const showHistory = signal(false);

    searchHistory.watch((history) => {
      localStorage.setItem("search-history", JSON.stringify(history));
    });

    function search(searchQuery = query.value) {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      // Add to history (remove duplicate if exists, add to front)
      const newHistory = [
        trimmed,
        ...searchHistory.value.filter(h => h !== trimmed)
      ].slice(0, MAX_HISTORY);

      searchHistory.value = newHistory;
      query.value = trimmed;
      showHistory.value = false;

      // Perform actual search
      console.log("Searching for:", trimmed);
    }

    function selectFromHistory(term) {
      query.value = term;
      search(term);
    }

    function removeFromHistory(term) {
      searchHistory.value = searchHistory.value.filter(h => h !== term);
    }

    function clearHistory() {
      searchHistory.value = [];
    }

    return {
      query, searchHistory, showHistory,
      search, selectFromHistory, removeFromHistory, clearHistory
    };
  },
  template: (ctx) => `
    <div class="search-with-history">
      <div class="search-box">
        <input
          type="text"
          placeholder="Search..."
          value="${ctx.query.value}"
          @input="(e) => query.value = e.target.value"
          @focus="() => showHistory.value = true"
          @keyup="(e) => e.key === 'Enter' && search()"
        />
        <button @click="() => search()">Search</button>
      </div>

      ${ctx.showHistory.value && ctx.searchHistory.value.length > 0 ? `
        <div class="history-dropdown">
          <div class="history-header">
            <span>Recent Searches</span>
            <button @click="clearHistory">Clear All</button>
          </div>
          <ul>
            ${ctx.searchHistory.value.map((term, index) => `
              <li key="${index}">
                <span @click="() => selectFromHistory('${term.replace(/'/g, "\\'")}')">${term}</span>
                <button @click="() => removeFromHistory('${term.replace(/'/g, "\\'")}')">×</button>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `,
  style: `
    .search-with-history { position: relative; max-width: 500px; margin: 0 auto; }
    .search-box { display: flex; gap: 10px; }
    .search-box input { flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; }
    .search-box button { padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .history-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-top: 5px; z-index: 10; }
    .history-header { display: flex; justify-content: space-between; padding: 10px 15px; border-bottom: 1px solid #eee; font-size: 12px; color: #666; }
    .history-header button { background: none; border: none; color: #007bff; cursor: pointer; }
    .history-dropdown ul { list-style: none; padding: 0; margin: 0; }
    .history-dropdown li { display: flex; justify-content: space-between; padding: 10px 15px; cursor: pointer; }
    .history-dropdown li:hover { background: #f8f9fa; }
    .history-dropdown li span { flex: 1; }
    .history-dropdown li button { background: none; border: none; color: #999; cursor: pointer; }
  `
});
```

---

## Session-Based Form Data

Preserve form data during a session (survives page refresh, cleared on browser close).

```javascript
app.component("SessionForm", {
  setup({ signal }) {
    // Use sessionStorage instead of localStorage
    const savedData = sessionStorage.getItem("draft-form");
    const formData = signal(savedData ? JSON.parse(savedData) : {
      title: "",
      description: "",
      category: "",
      tags: ""
    });
    const isDirty = signal(false);
    const lastSaved = signal(null);

    // Auto-save to sessionStorage
    formData.watch((data) => {
      sessionStorage.setItem("draft-form", JSON.stringify(data));
      isDirty.value = true;
      lastSaved.value = new Date().toLocaleTimeString();
    });

    function updateField(field, value) {
      formData.value = { ...formData.value, [field]: value };
    }

    function submit() {
      console.log("Submitting:", formData.value);
      // Clear session storage after successful submit
      sessionStorage.removeItem("draft-form");
      formData.value = { title: "", description: "", category: "", tags: "" };
      isDirty.value = false;
      alert("Form submitted successfully!");
    }

    function clearDraft() {
      if (confirm("Clear all draft data?")) {
        sessionStorage.removeItem("draft-form");
        formData.value = { title: "", description: "", category: "", tags: "" };
        isDirty.value = false;
      }
    }

    return { formData, isDirty, lastSaved, updateField, submit, clearDraft };
  },
  template: (ctx) => `
    <div class="session-form">
      <div class="form-header">
        <h3>Create Post</h3>
        ${ctx.isDirty.value ? `
          <span class="draft-indicator">
            Draft saved at ${ctx.lastSaved.value}
          </span>
        ` : ''}
      </div>

      <div class="form-group">
        <label>Title</label>
        <input
          type="text"
          value="${ctx.formData.value.title}"
          @input="(e) => updateField('title', e.target.value)"
        />
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea
          @input="(e) => updateField('description', e.target.value)"
        >${ctx.formData.value.description}</textarea>
      </div>

      <div class="form-group">
        <label>Category</label>
        <select @change="(e) => updateField('category', e.target.value)">
          <option value="">Select a category</option>
          ${['Technology', 'Design', 'Business', 'Other'].map(cat => `
            <option key="${cat}" value="${cat}" ${ctx.formData.value.category === cat ? 'selected' : ''}>
              ${cat}
            </option>
          `).join('')}
        </select>
      </div>

      <div class="form-group">
        <label>Tags (comma-separated)</label>
        <input
          type="text"
          value="${ctx.formData.value.tags}"
          @input="(e) => updateField('tags', e.target.value)"
        />
      </div>

      <div class="form-actions">
        <button @click="clearDraft" class="secondary">Clear Draft</button>
        <button @click="submit" class="primary">Submit</button>
      </div>

      <p class="hint">
        💡 Your draft is automatically saved. Refresh the page to test!
      </p>
    </div>
  `,
  style: `
    .session-form { max-width: 500px; margin: 0 auto; }
    .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .draft-indicator { font-size: 12px; color: #28a745; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
    .form-group input, .form-group textarea, .form-group select {
      width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;
    }
    .form-group textarea { min-height: 100px; resize: vertical; }
    .form-actions { display: flex; gap: 10px; margin-top: 20px; }
    .form-actions button { flex: 1; padding: 12px; border: none; border-radius: 4px; cursor: pointer; }
    .form-actions button.primary { background: #007bff; color: white; }
    .form-actions button.secondary { background: #6c757d; color: white; }
    .hint { margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 4px; font-size: 14px; }
  `
});
```

---

## Storage Quota Check

Check and display storage usage.

```javascript
app.component("StorageInfo", {
  setup({ signal }) {
    const storageInfo = signal({
      used: 0,
      total: 0,
      percentage: 0,
      items: []
    });

    function calculateUsage() {
      let totalSize = 0;
      const items = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        const size = new Blob([key + value]).size;
        totalSize += size;
        items.push({ key, size });
      }

      items.sort((a, b) => b.size - a.size);

      // localStorage typically has 5-10MB limit
      const estimatedTotal = 5 * 1024 * 1024; // 5MB

      storageInfo.value = {
        used: totalSize,
        total: estimatedTotal,
        percentage: (totalSize / estimatedTotal) * 100,
        items
      };
    }

    function formatBytes(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function removeItem(key) {
      if (confirm(`Remove "${key}" from localStorage?`)) {
        localStorage.removeItem(key);
        calculateUsage();
      }
    }

    function clearAll() {
      if (confirm("Clear all localStorage data?")) {
        localStorage.clear();
        calculateUsage();
      }
    }

    return {
      storageInfo, formatBytes, removeItem, clearAll,
      onMount: calculateUsage
    };
  },
  template: (ctx) => `
    <div class="storage-info">
      <h3>LocalStorage Usage</h3>

      <div class="usage-bar">
        <div class="usage-fill" style="width: ${Math.min(ctx.storageInfo.value.percentage, 100)}%"></div>
      </div>
      <p class="usage-text">
        ${ctx.formatBytes(ctx.storageInfo.value.used)} / ${ctx.formatBytes(ctx.storageInfo.value.total)}
        (${ctx.storageInfo.value.percentage.toFixed(2)}%)
      </p>

      <div class="items-list">
        <div class="items-header">
          <span>Stored Items (${ctx.storageInfo.value.items.length})</span>
          <button @click="clearAll">Clear All</button>
        </div>
        ${ctx.storageInfo.value.items.length === 0 ? `
          <p class="no-items">No items in localStorage</p>
        ` : `
          <ul>
            ${ctx.storageInfo.value.items.map(item => `
              <li key="${item.key}">
                <span class="key">${item.key}</span>
                <span class="size">${ctx.formatBytes(item.size)}</span>
                <button @click="() => removeItem('${item.key.replace(/'/g, "\\'")}')">×</button>
              </li>
            `).join('')}
          </ul>
        `}
      </div>
    </div>
  `,
  style: `
    .storage-info { max-width: 500px; margin: 0 auto; }
    .usage-bar { height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin-bottom: 10px; }
    .usage-fill { height: 100%; background: linear-gradient(90deg, #28a745, #ffc107, #dc3545); transition: width 0.3s; }
    .usage-text { text-align: center; color: #666; margin-bottom: 20px; }
    .items-header { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
    .items-header button { background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
    .items-list ul { list-style: none; padding: 0; margin: 0; }
    .items-list li { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee; }
    .items-list li .key { flex: 1; font-family: monospace; }
    .items-list li .size { color: #666; margin-right: 10px; }
    .items-list li button { background: none; border: none; color: #dc3545; cursor: pointer; font-size: 18px; }
    .no-items { text-align: center; color: #666; padding: 20px; }
  `
});
```

---

[← Back to Patterns](./index.md) | [Previous: State Management](./state/index.md) | [Next: Complete Apps →](../apps/index.md)
