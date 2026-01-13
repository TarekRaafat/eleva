---
title: Conditional Rendering - Show/Hide & Tabs
description: Eleva.js conditional rendering patterns. Build accordions, tabs, modals, skeleton loaders, and dynamic content with ternary operators and template strings.
---

# Conditional Rendering Examples

Learn how to conditionally show, hide, and switch between components and content in Eleva.

---

## Show/Hide Toggle

A simple accordion that shows/hides content on click.

```javascript
app.component("Accordion", {
  setup({ signal }) {
    const items = signal([
      { id: 1, title: "What is Eleva?", content: "Eleva is a minimalist JavaScript framework.", open: false },
      { id: 2, title: "How do signals work?", content: "Signals provide fine-grained reactivity.", open: false },
      { id: 3, title: "Can I use plugins?", content: "Yes! Eleva has a powerful plugin system.", open: false }
    ]);

    function toggle(id) {
      items.value = items.value.map(item =>
        item.id === id ? { ...item, open: !item.open } : item
      );
    }

    return { items, toggle };
  },
  template: (ctx) => `
    <div class="accordion">
      ${ctx.items.value.map(item => `
        <div key="${item.id}" class="accordion-item">
          <button
            class="accordion-header ${item.open ? 'active' : ''}"
            @click="() => toggle(${item.id})"
          >
            ${item.title}
            <span class="icon">${item.open ? '−' : '+'}</span>
          </button>
          ${item.open ? `
            <div class="accordion-content">
              <p>${item.content}</p>
            </div>
          ` : ''}
        </div>
      `).join("")}
    </div>
  `,
  style: `
    .accordion { max-width: 500px; margin: 0 auto; }
    .accordion-item { border: 1px solid #ddd; margin-bottom: -1px; }
    .accordion-header {
      width: 100%; padding: 15px; background: #f8f9fa;
      border: none; text-align: left; cursor: pointer;
      display: flex; justify-content: space-between; align-items: center;
      font-size: 1rem;
    }
    .accordion-header:hover { background: #e9ecef; }
    .accordion-header.active { background: #007bff; color: white; }
    .accordion-content { padding: 15px; background: white; }
    .icon { font-weight: bold; }
  `
});
```

**Key Concepts:**
- Toggle `open` state for each item
- Conditionally render content with `${item.open ? '...' : ''}`
- Apply dynamic classes based on state

---

## Conditional Component Rendering

Tab panel that switches between different content sections.

```javascript
app.component("TabPanel", {
  setup({ signal }) {
    const activeTab = signal("home");
    const tabs = [
      { id: "home", label: "Home" },
      { id: "profile", label: "Profile" },
      { id: "settings", label: "Settings" }
    ];

    return { activeTab, tabs };
  },
  template: (ctx) => `
    <div class="tab-panel">
      <div class="tab-headers">
        ${ctx.tabs.map(tab => `
          <button
            key="${tab.id}"
            class="tab-btn ${ctx.activeTab.value === tab.id ? 'active' : ''}"
            @click="() => activeTab.value = '${tab.id}'"
          >
            ${tab.label}
          </button>
        `).join("")}
      </div>

      <div class="tab-content">
        ${ctx.activeTab.value === "home" ? `
          <div class="tab-pane">
            <h3>Welcome Home</h3>
            <p>This is the home tab content.</p>
          </div>
        ` : ctx.activeTab.value === "profile" ? `
          <div class="tab-pane">
            <h3>Your Profile</h3>
            <p>View and edit your profile information.</p>
          </div>
        ` : ctx.activeTab.value === "settings" ? `
          <div class="tab-pane">
            <h3>Settings</h3>
            <p>Configure your application preferences.</p>
          </div>
        ` : ""}
      </div>
    </div>
  `,
  style: `
    .tab-panel { max-width: 500px; margin: 0 auto; }
    .tab-headers { display: flex; border-bottom: 2px solid #ddd; }
    .tab-btn {
      padding: 10px 20px; border: none; background: none;
      cursor: pointer; font-size: 1rem; color: #666;
      border-bottom: 2px solid transparent; margin-bottom: -2px;
    }
    .tab-btn:hover { color: #007bff; }
    .tab-btn.active { color: #007bff; border-bottom-color: #007bff; }
    .tab-content { padding: 20px 0; }
  `
});
```

---

## Modal Dialog

Show/hide a modal overlay.

```javascript
app.component("ModalExample", {
  setup({ signal }) {
    const isModalOpen = signal(false);
    const modalData = signal({ title: "", message: "" });

    function openModal(title, message) {
      modalData.value = { title, message };
      isModalOpen.value = true;
    }

    function closeModal() {
      isModalOpen.value = false;
    }

    function handleBackdropClick(event) {
      if (event.target.classList.contains('modal-backdrop')) {
        closeModal();
      }
    }

    return { isModalOpen, modalData, openModal, closeModal, handleBackdropClick };
  },
  template: (ctx) => `
    <div class="modal-example">
      <button @click="() => openModal('Welcome!', 'This is a modal dialog.')">
        Open Modal
      </button>

      <button @click="() => openModal('Confirm Action', 'Are you sure you want to proceed?')">
        Confirm Dialog
      </button>

      ${ctx.isModalOpen.value ? `
        <div class="modal-backdrop" @click="handleBackdropClick">
          <div class="modal">
            <div class="modal-header">
              <h3>${ctx.modalData.value.title}</h3>
              <button class="close-btn" @click="closeModal">&times;</button>
            </div>
            <div class="modal-body">
              <p>${ctx.modalData.value.message}</p>
            </div>
            <div class="modal-footer">
              <button @click="closeModal">Cancel</button>
              <button class="primary" @click="closeModal">OK</button>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `,
  style: `
    .modal-backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); display: flex;
      align-items: center; justify-content: center; z-index: 1000;
    }
    .modal {
      background: white; border-radius: 8px; max-width: 400px;
      width: 90%; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 15px 20px; border-bottom: 1px solid #eee;
    }
    .modal-header h3 { margin: 0; }
    .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; }
    .modal-body { padding: 20px; }
    .modal-footer { padding: 15px 20px; border-top: 1px solid #eee; text-align: right; }
    .modal-footer button { margin-left: 10px; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
    .modal-footer button.primary { background: #007bff; color: white; border: none; }
  `
});
```

---

## Loading Skeleton

Show placeholder content while data loads.

```javascript
app.component("SkeletonLoader", {
  setup({ signal }) {
    const loading = signal(true);
    const data = signal(null);

    async function loadData() {
      loading.value = true;
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      data.value = {
        title: "Article Title",
        author: "John Doe",
        date: "January 3, 2026",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      };
      loading.value = false;
    }

    return { loading, data, loadData, onMount: loadData };
  },
  template: (ctx) => `
    <div class="article">
      ${ctx.loading.value ? `
        <div class="skeleton">
          <div class="skeleton-title"></div>
          <div class="skeleton-meta"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      ` : `
        <article>
          <h2>${ctx.data.value.title}</h2>
          <div class="meta">
            <span>${ctx.data.value.author}</span> &bull;
            <span>${ctx.data.value.date}</span>
          </div>
          <p>${ctx.data.value.content}</p>
        </article>
      `}

      <button @click="loadData" ${ctx.loading.value ? 'disabled' : ''}>
        Reload
      </button>
    </div>
  `,
  style: `
    .skeleton-title, .skeleton-meta, .skeleton-line {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }
    .skeleton-title { height: 28px; width: 70%; margin-bottom: 15px; }
    .skeleton-meta { height: 16px; width: 40%; margin-bottom: 20px; }
    .skeleton-line { height: 14px; width: 100%; margin-bottom: 10px; }
    .skeleton-line.short { width: 60%; }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .meta { color: #666; margin-bottom: 15px; }
  `
});
```

---

## Conditional Styles

Apply styles based on state.

```javascript
app.component("StatusIndicator", {
  setup({ signal }) {
    const status = signal("idle"); // idle, loading, success, error

    function setStatus(newStatus) {
      status.value = newStatus;
    }

    function getStatusColor() {
      const colors = {
        idle: "#6c757d",
        loading: "#007bff",
        success: "#28a745",
        error: "#dc3545"
      };
      return colors[status.value] || colors.idle;
    }

    function getStatusText() {
      const texts = {
        idle: "Ready",
        loading: "Processing...",
        success: "Completed!",
        error: "Failed!"
      };
      return texts[status.value] || "Unknown";
    }

    return { status, setStatus, getStatusColor, getStatusText };
  },
  template: (ctx) => `
    <div class="status-indicator">
      <div
        class="status-badge status-${ctx.status.value}"
        style="background-color: ${ctx.getStatusColor()}"
      >
        ${ctx.status.value === 'loading' ? `
          <span class="spinner"></span>
        ` : ''}
        ${ctx.getStatusText()}
      </div>

      <div class="controls">
        <button @click="() => setStatus('idle')">Idle</button>
        <button @click="() => setStatus('loading')">Loading</button>
        <button @click="() => setStatus('success')">Success</button>
        <button @click="() => setStatus('error')">Error</button>
      </div>
    </div>
  `,
  style: `
    .status-badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 20px; border-radius: 20px; color: white;
      font-weight: bold; margin-bottom: 20px;
    }
    .spinner {
      width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .controls button { margin-right: 10px; }
  `
});
```

---

## Empty State

Show helpful content when there's no data.

```javascript
app.component("EmptyState", {
  setup({ signal }) {
    const items = signal([]);

    function addItem() {
      items.value = [...items.value, {
        id: Date.now(),
        name: `Item ${items.value.length + 1}`
      }];
    }

    function clearItems() {
      items.value = [];
    }

    return { items, addItem, clearItems };
  },
  template: (ctx) => `
    <div class="empty-state-demo">
      ${ctx.items.value.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>No items yet</h3>
          <p>Get started by adding your first item.</p>
          <button @click="addItem">Add Item</button>
        </div>
      ` : `
        <div class="items-list">
          <div class="header">
            <span>${ctx.items.value.length} items</span>
            <button @click="clearItems">Clear All</button>
          </div>
          <ul>
            ${ctx.items.value.map(item => `
              <li key="${item.id}">${item.name}</li>
            `).join('')}
          </ul>
          <button @click="addItem">Add More</button>
        </div>
      `}
    </div>
  `,
  style: `
    .empty-state {
      text-align: center; padding: 40px;
      border: 2px dashed #ddd; border-radius: 8px;
    }
    .empty-icon { font-size: 48px; margin-bottom: 15px; }
    .empty-state h3 { margin: 0 0 10px 0; }
    .empty-state p { color: #666; margin-bottom: 20px; }
  `
});
```

---

[← Back to Patterns](./index.md) | [Previous: Async Data](./async-data.md) | [Next: Lists →](./lists.md)
