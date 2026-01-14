---
title: Attr Plugin Usage Patterns
description: Real-world examples of using Eleva Attr plugin for accessible forms, accordions, tabs, tables, and modals.
---

# Attr Plugin Usage Patterns

This guide shows practical examples of using the Attr plugin for building accessible, interactive components.

---

## Pattern 1: Accessible Form

A fully accessible contact form with validation and error handling.

```javascript
const AccessibleForm = {
  setup({ signal }) {
    const formData = signal({
      name: "",
      email: "",
      message: ""
    });

    const errors = signal({});
    const isSubmitting = signal(false);
    const submitSuccess = signal(false);

    const validate = () => {
      const newErrors = {};

      if (!formData.value.name.trim()) {
        newErrors.name = "Name is required";
      }

      if (!formData.value.email.includes("@")) {
        newErrors.email = "Valid email is required";
      }

      if (formData.value.message.length < 10) {
        newErrors.message = "Message must be at least 10 characters";
      }

      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validate()) return;

      isSubmitting.value = true;

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        submitSuccess.value = true;
      } catch (error) {
        errors.value = { submit: "Failed to submit form" };
      } finally {
        isSubmitting.value = false;
      }
    };

    const updateField = (field, value) => {
      formData.value = { ...formData.value, [field]: value };
    };

    return { formData, errors, isSubmitting, submitSuccess, handleSubmit, updateField };
  },
  template({ formData, errors, isSubmitting, submitSuccess }) {
    return `
      <form @submit="handleSubmit" aria-label="Contact Form">
        <!-- Success Message -->
        <div
          role="alert"
          aria-live="polite"
          hidden="${!submitSuccess.value}"
        >
          Form submitted successfully!
        </div>

        <!-- Name Field -->
        <div class="form-group">
          <label id="name-label" for="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value="${formData.value.name}"
            @input="updateField('name', $event.target.value)"
            aria-labelledby="name-label"
            aria-describedby="name-error"
            aria-invalid="${errors.value.name ? 'true' : 'false'}"
            aria-required="true"
            required="${true}"
          />
          <span
            id="name-error"
            role="alert"
            class="error"
            hidden="${!errors.value.name}"
          >
            ${errors.value.name || ''}
          </span>
        </div>

        <!-- Email Field -->
        <div class="form-group">
          <label id="email-label" for="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value="${formData.value.email}"
            @input="updateField('email', $event.target.value)"
            aria-labelledby="email-label"
            aria-describedby="email-error"
            aria-invalid="${errors.value.email ? 'true' : 'false'}"
            aria-required="true"
            required="${true}"
          />
          <span
            id="email-error"
            role="alert"
            class="error"
            hidden="${!errors.value.email}"
          >
            ${errors.value.email || ''}
          </span>
        </div>

        <!-- Message Field -->
        <div class="form-group">
          <label id="message-label" for="message">Message</label>
          <textarea
            id="message"
            name="message"
            value="${formData.value.message}"
            @input="updateField('message', $event.target.value)"
            aria-labelledby="message-label"
            aria-describedby="message-error message-hint"
            aria-invalid="${errors.value.message ? 'true' : 'false'}"
            aria-required="true"
            required="${true}"
          ></textarea>
          <span id="message-hint" class="hint">
            Minimum 10 characters
          </span>
          <span
            id="message-error"
            role="alert"
            class="error"
            hidden="${!errors.value.message}"
          >
            ${errors.value.message || ''}
          </span>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          disabled="${isSubmitting.value}"
          aria-busy="${isSubmitting.value}"
        >
          ${isSubmitting.value ? 'Submitting...' : 'Send Message'}
        </button>
      </form>
    `;
  }
};
```

---

## Pattern 2: Accordion Component

An accessible accordion with proper ARIA attributes.

```javascript
const Accordion = {
  setup({ signal }) {
    const sections = signal([
      { id: "section1", title: "What is Eleva?", content: "Eleva is a minimalist JavaScript framework...", open: true },
      { id: "section2", title: "How do I get started?", content: "Install via npm and import...", open: false },
      { id: "section3", title: "Is it production ready?", content: "Yes, Eleva is stable and tested...", open: false }
    ]);

    const toggleSection = (id) => {
      sections.value = sections.value.map(section => ({
        ...section,
        open: section.id === id ? !section.open : section.open
      }));
    };

    return { sections, toggleSection };
  },
  template({ sections }) {
    return `
      <div class="accordion" role="tablist" aria-label="FAQ Accordion">
        ${sections.value.map((section) => `
          <div key="${section.id}" class="accordion-item">
            <h3>
              <button
                type="button"
                class="accordion-trigger"
                id="trigger-${section.id}"
                aria-expanded="${section.open}"
                aria-controls="panel-${section.id}"
                @click="() => toggleSection('${section.id}')"
              >
                ${section.title}
                <span class="icon" aria-hidden="true">
                  ${section.open ? '−' : '+'}
                </span>
              </button>
            </h3>
            <div
              id="panel-${section.id}"
              role="region"
              aria-labelledby="trigger-${section.id}"
              aria-hidden="${!section.open}"
              hidden="${!section.open}"
              class="accordion-panel"
            >
              <p>${section.content}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
};
```

---

## Pattern 3: Tab Component

A keyboard-navigable tab component.

```javascript
const TabContainer = {
  setup({ signal }) {
    const activeTab = signal(0);
    const tabs = signal([
      { id: "tab-1", label: "Overview", content: "Overview content goes here..." },
      { id: "tab-2", label: "Features", content: "Features content goes here..." },
      { id: "tab-3", label: "Pricing", content: "Pricing content goes here..." }
    ]);

    const selectTab = (index) => {
      activeTab.value = index;
    };

    const handleKeyDown = (e, index) => {
      const tabCount = tabs.value.length;

      switch (e.key) {
        case 'ArrowLeft':
          activeTab.value = (index - 1 + tabCount) % tabCount;
          break;
        case 'ArrowRight':
          activeTab.value = (index + 1) % tabCount;
          break;
        case 'Home':
          activeTab.value = 0;
          break;
        case 'End':
          activeTab.value = tabCount - 1;
          break;
      }
    };

    return { activeTab, tabs, selectTab, handleKeyDown };
  },
  template({ activeTab, tabs }) {
    return `
      <div class="tab-container">
        <!-- Tab List -->
        <div role="tablist" aria-label="Content Tabs" class="tab-list">
          ${tabs.value.map((tab, index) => `
            <button
              key="${tab.id}"
              role="tab"
              id="${tab.id}"
              aria-selected="${activeTab.value === index}"
              aria-controls="panel-${tab.id}"
              tabindex="${activeTab.value === index ? 0 : -1}"
              class="tab-button ${activeTab.value === index ? 'active' : ''}"
              @click="() => selectTab(${index})"
              @keydown="(e) => handleKeyDown(e, ${index})"
            >
              ${tab.label}
            </button>
          `).join('')}
        </div>

        <!-- Tab Panels -->
        ${tabs.value.map((tab, index) => `
          <div
            key="${tab.id}"
            role="tabpanel"
            id="panel-${tab.id}"
            aria-labelledby="${tab.id}"
            hidden="${activeTab.value !== index}"
            tabindex="0"
            class="tab-panel"
          >
            ${tab.content}
          </div>
        `).join('')}
      </div>
    `;
  }
};
```

---

## Pattern 4: Data-Driven Table

A sortable, selectable data table with proper accessibility.

```javascript
const DataTable = {
  setup({ signal }) {
    const sortColumn = signal("name");
    const sortDirection = signal("asc");
    const selectedRows = signal(new Set());

    const data = signal([
      { id: 1, name: "Alice", email: "alice@example.com", role: "Admin" },
      { id: 2, name: "Bob", email: "bob@example.com", role: "User" },
      { id: 3, name: "Charlie", email: "charlie@example.com", role: "User" },
      { id: 4, name: "Diana", email: "diana@example.com", role: "Editor" }
    ]);

    const sortedData = () => {
      const sorted = [...data.value].sort((a, b) => {
        const aVal = a[sortColumn.value];
        const bVal = b[sortColumn.value];
        const direction = sortDirection.value === "asc" ? 1 : -1;
        return aVal.localeCompare(bVal) * direction;
      });
      return sorted;
    };

    const toggleSort = (column) => {
      if (sortColumn.value === column) {
        sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
      } else {
        sortColumn.value = column;
        sortDirection.value = "asc";
      }
    };

    const toggleRowSelection = (id) => {
      const newSelection = new Set(selectedRows.value);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      selectedRows.value = newSelection;
    };

    const isSelected = (id) => selectedRows.value.has(id);

    return { sortColumn, sortDirection, sortedData, toggleSort, toggleRowSelection, isSelected };
  },
  template({ sortColumn, sortDirection, sortedData, isSelected }) {
    const columns = [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" }
    ];

    return `
      <table class="data-table" role="grid" aria-label="User Data">
        <thead>
          <tr>
            <th scope="col">
              <span class="visually-hidden">Select</span>
            </th>
            ${columns.map(col => `
              <th
                key="${col.key}"
                scope="col"
                aria-sort="${sortColumn.value === col.key
                  ? (sortDirection.value === 'asc' ? 'ascending' : 'descending')
                  : 'none'}"
                data-column="${col.key}"
              >
                <button @click="() => toggleSort('${col.key}')">
                  ${col.label}
                  <span aria-hidden="true">
                    ${sortColumn.value === col.key
                      ? (sortDirection.value === 'asc' ? '▲' : '▼')
                      : '⇅'}
                  </span>
                </button>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${sortedData().map(row => `
            <tr
              key="${row.id}"
              data-row-id="${row.id}"
              aria-selected="${isSelected(row.id)}"
              class="${isSelected(row.id) ? 'selected' : ''}"
            >
              <td>
                <input
                  type="checkbox"
                  checked="${isSelected(row.id)}"
                  @change="() => toggleRowSelection(${row.id})"
                  aria-label="Select ${row.name}"
                />
              </td>
              <td data-label="Name">${row.name}</td>
              <td data-label="Email">${row.email}</td>
              <td data-label="Role">${row.role}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
};
```

---

## Pattern 5: Modal Dialog

An accessible modal dialog with focus management.

```javascript
const ModalDialog = {
  setup({ signal }) {
    const isOpen = signal(false);
    const modalTitle = signal("Confirm Action");
    const modalMessage = signal("Are you sure you want to proceed?");

    const openModal = () => {
      isOpen.value = true;
      // Focus trap would be implemented here
    };

    const closeModal = () => {
      isOpen.value = false;
    };

    const handleConfirm = () => {
      console.log("Confirmed!");
      closeModal();
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    return { isOpen, modalTitle, modalMessage, openModal, closeModal, handleConfirm, handleKeyDown };
  },
  template({ isOpen, modalTitle, modalMessage }) {
    return `
      <div>
        <!-- Trigger Button -->
        <button
          @click="openModal"
          aria-haspopup="dialog"
        >
          Open Modal
        </button>

        <!-- Modal Backdrop -->
        <div
          class="modal-backdrop"
          hidden="${!isOpen.value}"
          aria-hidden="${!isOpen.value}"
          @click="closeModal"
        ></div>

        <!-- Modal Dialog -->
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          aria-hidden="${!isOpen.value}"
          hidden="${!isOpen.value}"
          class="modal"
          @keydown="handleKeyDown"
        >
          <header class="modal-header">
            <h2 id="modal-title">${modalTitle.value}</h2>
            <button
              @click="closeModal"
              aria-label="Close modal"
              class="modal-close"
            >
              ×
            </button>
          </header>

          <div id="modal-description" class="modal-body">
            <p>${modalMessage.value}</p>
          </div>

          <footer class="modal-footer">
            <button
              @click="closeModal"
              class="btn-secondary"
            >
              Cancel
            </button>
            <button
              @click="handleConfirm"
              class="btn-primary"
              autofocus="${isOpen.value}"
            >
              Confirm
            </button>
          </footer>
        </div>
      </div>
    `;
  }
};
```

---

## Next Steps

- [API Reference](./api.md) - Complete API and troubleshooting

---

[← Back to Features](./features.md) | [Next: API Reference →](./api.md)
