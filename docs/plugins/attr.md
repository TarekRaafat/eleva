# Attr Plugin

> **Version:** 1.0.0-rc.13 | **Type:** Attribute Binding Plugin | **Bundle Size:** ~2.2KB minified | **Dependencies:** Eleva core

The Attr plugin provides intelligent attribute binding for Eleva components, automatically handling ARIA accessibility attributes, data attributes, boolean attributes, and dynamic property detection.

---

## TL;DR - Quick Reference

### 30-Second Setup

```javascript
import Eleva from "eleva";
import { Attr } from "eleva/plugins";

const app = new Eleva("App");
app.use(Attr);  // Enable attribute binding
```

### API Cheatsheet

| Feature | Syntax | Description |
|---------|--------|-------------|
| **ARIA Attributes** | `aria-label="{{ label }}"` | Accessibility attributes |
| **Data Attributes** | `data-id="{{ id }}"` | Custom data storage |
| **Boolean Attributes** | `disabled="{{ isDisabled }}"` | Presence-based attributes |
| **Dynamic Properties** | `value="{{ inputValue }}"` | DOM property binding |
| **Update Method** | `app.updateElementAttributes(old, new)` | Manual attribute sync |

> **Context Rule:** Inside `{{ }}`, access properties directly without `ctx.` prefix.
> Use `{{ isLoading.value }}` not `{{ ctx.isLoading.value }}`.

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enableAria` | `boolean` | `true` | Enable ARIA attribute handling |
| `enableData` | `boolean` | `true` | Enable data-* attribute handling |
| `enableBoolean` | `boolean` | `true` | Enable boolean attribute handling |
| `enableDynamic` | `boolean` | `true` | Enable dynamic property detection |

---

## Installation

### Via Package Manager

```bash
# npm
npm install eleva

# yarn
yarn add eleva

# pnpm
pnpm add eleva

# bun
bun add eleva
```

### Via CDN

```html
<!-- Core + All Plugins -->
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/eleva-plugins.umd.min.js"></script>

<!-- Attr Plugin Only -->
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/plugins/attr.umd.min.js"></script>
```

---

## Getting Started

### Basic Setup

```javascript
import Eleva from "eleva";
import { Attr } from "eleva/plugins";

// Create app instance
const app = new Eleva("MyApp");

// Install Attr plugin with default options
app.use(Attr);

// Or with custom configuration
app.use(Attr, {
  enableAria: true,      // Handle ARIA attributes
  enableData: true,      // Handle data-* attributes
  enableBoolean: true,   // Handle boolean attributes
  enableDynamic: true    // Handle dynamic properties
});
```

### First Component with Attributes

```javascript
app.component("AccessibleButton", {
  setup({ signal }) {
    const isLoading = signal(false);
    const buttonLabel = signal("Submit Form");

    const handleClick = () => {
      isLoading.value = true;
      // Simulate async operation
      setTimeout(() => {
        isLoading.value = false;
      }, 2000);
    };

    return { isLoading, buttonLabel, handleClick };
  },
  template: (ctx) => `
    <button
      aria-label="{{ buttonLabel.value }}"
      aria-busy="{{ isLoading.value }}"
      disabled="{{ isLoading.value }}"
      @click="handleClick"
    >
      {{ isLoading.value ? 'Loading...' : buttonLabel.value }}
    </button>
  `
});

app.mount(document.getElementById("app"), "AccessibleButton");
```

---

## Core Features

### 1. ARIA Attributes

ARIA (Accessible Rich Internet Applications) attributes enhance web accessibility for users with disabilities. The Attr plugin automatically handles all `aria-*` attributes.

#### Common ARIA Attributes

```javascript
const AccessibleComponent = {
  setup({ signal }) {
    const isExpanded = signal(false);
    const isSelected = signal(false);
    const currentValue = signal(50);
    const errorMessage = signal("");

    return { isExpanded, isSelected, currentValue, errorMessage };
  },
  template({ isExpanded, isSelected, currentValue, errorMessage }) {
    return `
      <div>
        <!-- Expandable Section -->
        <button
          aria-expanded="{{ isExpanded.value }}"
          aria-controls="content-panel"
          @click="isExpanded.value = !isExpanded.value"
        >
          Toggle Content
        </button>
        <div id="content-panel" aria-hidden="{{ !isExpanded.value }}">
          Panel content here...
        </div>

        <!-- Selectable Item -->
        <div
          role="option"
          aria-selected="{{ isSelected.value }}"
          @click="isSelected.value = !isSelected.value"
        >
          Selectable Item
        </div>

        <!-- Slider/Progress -->
        <div
          role="slider"
          aria-valuenow="{{ currentValue.value }}"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Volume"
        >
          Value: {{ currentValue.value }}%
        </div>

        <!-- Form Field with Error -->
        <input
          type="text"
          aria-invalid="{{ errorMessage.value ? 'true' : 'false' }}"
          aria-describedby="error-text"
        />
        <span id="error-text" role="alert">{{ errorMessage.value }}</span>
      </div>
    `;
  }
};
```

#### ARIA Attribute Reference

| Attribute | Purpose | Example Values |
|-----------|---------|----------------|
| `aria-label` | Accessible name | `"Submit form"` |
| `aria-labelledby` | Reference to label element | `"heading-id"` |
| `aria-describedby` | Reference to description | `"description-id"` |
| `aria-expanded` | Expansion state | `"true"`, `"false"` |
| `aria-hidden` | Hide from assistive tech | `"true"`, `"false"` |
| `aria-selected` | Selection state | `"true"`, `"false"` |
| `aria-checked` | Checkbox/radio state | `"true"`, `"false"`, `"mixed"` |
| `aria-disabled` | Disabled state | `"true"`, `"false"` |
| `aria-busy` | Loading state | `"true"`, `"false"` |
| `aria-live` | Live region updates | `"polite"`, `"assertive"`, `"off"` |
| `aria-valuenow` | Current value | `"50"` |
| `aria-valuemin` | Minimum value | `"0"` |
| `aria-valuemax` | Maximum value | `"100"` |
| `aria-invalid` | Validation state | `"true"`, `"false"`, `"grammar"`, `"spelling"` |

### 2. Data Attributes

Data attributes (`data-*`) provide a way to store custom data on HTML elements. The Attr plugin automatically synchronizes data attributes with your component state.

#### Basic Data Attributes

```javascript
const ProductCard = {
  setup({ signal }) {
    const product = signal({
      id: "prod-123",
      name: "Premium Widget",
      price: 29.99,
      category: "electronics",
      inStock: true
    });

    return { product };
  },
  template({ product }) {
    return `
      <article
        class="product-card"
        data-product-id="{{ product.value.id }}"
        data-category="{{ product.value.category }}"
        data-price="{{ product.value.price }}"
        data-in-stock="{{ product.value.inStock }}"
      >
        <h3>{{ product.value.name }}</h3>
        <p class="price">\${{ product.value.price }}</p>
        <span class="stock-status">
          {{ product.value.inStock ? 'In Stock' : 'Out of Stock' }}
        </span>
      </article>
    `;
  }
};
```

#### Accessing Data Attributes in JavaScript

```javascript
// Query by data attribute
const electronics = document.querySelectorAll('[data-category="electronics"]');

// Read data attribute value
const productCard = document.querySelector('.product-card');
const productId = productCard.dataset.productId;  // "prod-123"
const price = parseFloat(productCard.dataset.price);  // 29.99

// Use in event delegation
document.addEventListener('click', (e) => {
  const card = e.target.closest('[data-product-id]');
  if (card) {
    console.log('Clicked product:', card.dataset.productId);
  }
});
```

#### Dynamic Data Attributes

```javascript
const DynamicList = {
  setup({ signal }) {
    const items = signal([
      { id: 1, status: "active", priority: "high" },
      { id: 2, status: "pending", priority: "medium" },
      { id: 3, status: "completed", priority: "low" }
    ]);

    const updateStatus = (id, newStatus) => {
      items.value = items.value.map(item =>
        item.id === id ? { ...item, status: newStatus } : item
      );
    };

    return { items, updateStatus };
  },
  template({ items }) {
    return `
      <ul class="task-list">
        ${items.value.map(item => `
          <li
            key="${item.id}"
            data-id="${item.id}"
            data-status="${item.status}"
            data-priority="${item.priority}"
            class="task-item"
          >
            Task #${item.id} - ${item.status}
          </li>
        `).join('')}
      </ul>
    `;
  }
};
```

### 3. Boolean Attributes

Boolean attributes are special HTML attributes where the presence of the attribute (regardless of value) means `true`, and absence means `false`. The Attr plugin intelligently handles these attributes.

#### Standard Boolean Attributes

| Attribute | Element(s) | Description |
|-----------|------------|-------------|
| `disabled` | `button`, `input`, `select`, `textarea` | Disables the element |
| `checked` | `input[type="checkbox"]`, `input[type="radio"]` | Checked state |
| `selected` | `option` | Selected option |
| `readonly` | `input`, `textarea` | Read-only field |
| `required` | `input`, `select`, `textarea` | Required field |
| `hidden` | Any element | Hides element |
| `open` | `details`, `dialog` | Open state |
| `autofocus` | Form elements | Auto-focus on load |
| `multiple` | `input`, `select` | Allow multiple values |
| `novalidate` | `form` | Skip validation |

#### Boolean Attribute Examples

```javascript
const FormControls = {
  setup({ signal }) {
    const isSubmitting = signal(false);
    const agreeToTerms = signal(false);
    const selectedPlan = signal("basic");
    const showDetails = signal(false);
    const emailRequired = signal(true);

    return { isSubmitting, agreeToTerms, selectedPlan, showDetails, emailRequired };
  },
  template({ isSubmitting, agreeToTerms, selectedPlan, showDetails, emailRequired }) {
    return `
      <form>
        <!-- Disabled button during submission -->
        <button
          type="submit"
          disabled="{{ isSubmitting.value || !agreeToTerms.value }}"
        >
          {{ isSubmitting.value ? 'Submitting...' : 'Submit' }}
        </button>

        <!-- Checkbox with checked binding -->
        <label>
          <input
            type="checkbox"
            checked="{{ agreeToTerms.value }}"
            @change="agreeToTerms.value = $event.target.checked"
          />
          I agree to the terms
        </label>

        <!-- Select with selected option -->
        <select @change="selectedPlan.value = $event.target.value">
          <option value="basic" selected="{{ selectedPlan.value === 'basic' }}">
            Basic Plan
          </option>
          <option value="pro" selected="{{ selectedPlan.value === 'pro' }}">
            Pro Plan
          </option>
          <option value="enterprise" selected="{{ selectedPlan.value === 'enterprise' }}">
            Enterprise Plan
          </option>
        </select>

        <!-- Details element with open state -->
        <details open="{{ showDetails.value }}">
          <summary @click="showDetails.value = !showDetails.value">
            More Information
          </summary>
          <p>Additional details here...</p>
        </details>

        <!-- Required field -->
        <input
          type="email"
          placeholder="Email"
          required="{{ emailRequired.value }}"
        />
      </form>
    `;
  }
};
```

#### How Boolean Attributes Work

```javascript
// When signal value is truthy:
// disabled="{{ true }}" → <button disabled>
// disabled="{{ 1 }}" → <button disabled>
// disabled="{{ 'yes' }}" → <button disabled>

// When signal value is falsy:
// disabled="{{ false }}" → <button>
// disabled="{{ 0 }}" → <button>
// disabled="{{ '' }}" → <button>
// disabled="{{ null }}" → <button>
// disabled="{{ undefined }}" → <button>
```

### 4. Dynamic Properties

Some DOM elements have properties that don't correspond directly to attributes. The Attr plugin detects these and handles them appropriately.

#### Common Dynamic Properties

| Property | Element(s) | Description |
|----------|------------|-------------|
| `value` | `input`, `textarea`, `select` | Current value |
| `checked` | `input[type="checkbox/radio"]` | Checked state |
| `selected` | `option` | Selection state |
| `indeterminate` | `input[type="checkbox"]` | Indeterminate state |
| `innerHTML` | Any element | Inner HTML content |
| `textContent` | Any element | Text content |
| `className` | Any element | CSS classes |
| `src` | `img`, `video`, `audio`, `iframe` | Source URL |
| `href` | `a`, `link` | Link URL |

#### Dynamic Property Examples

```javascript
const DynamicInputs = {
  setup({ signal }) {
    const textValue = signal("Hello World");
    const numberValue = signal(42);
    const rangeValue = signal(50);
    const imageUrl = signal("https://example.com/image.jpg");

    return { textValue, numberValue, rangeValue, imageUrl };
  },
  template({ textValue, numberValue, rangeValue, imageUrl }) {
    return `
      <div class="form-controls">
        <!-- Text input with value binding -->
        <input
          type="text"
          value="{{ textValue.value }}"
          @input="textValue.value = $event.target.value"
        />
        <p>Text: {{ textValue.value }}</p>

        <!-- Number input with value binding -->
        <input
          type="number"
          value="{{ numberValue.value }}"
          @input="numberValue.value = parseInt($event.target.value)"
        />
        <p>Number: {{ numberValue.value }}</p>

        <!-- Range slider with value binding -->
        <input
          type="range"
          min="0"
          max="100"
          value="{{ rangeValue.value }}"
          @input="rangeValue.value = parseInt($event.target.value)"
        />
        <p>Range: {{ rangeValue.value }}%</p>

        <!-- Dynamic image source -->
        <img
          src="{{ imageUrl.value }}"
          alt="Dynamic image"
        />
      </div>
    `;
  }
};
```

#### Indeterminate Checkbox

```javascript
const SelectAllComponent = {
  setup({ signal }) {
    const items = signal([
      { id: 1, name: "Item 1", selected: false },
      { id: 2, name: "Item 2", selected: true },
      { id: 3, name: "Item 3", selected: false }
    ]);

    const allSelected = () => items.value.every(i => i.selected);
    const someSelected = () => items.value.some(i => i.selected) && !allSelected();

    const toggleAll = () => {
      const newState = !allSelected();
      items.value = items.value.map(i => ({ ...i, selected: newState }));
    };

    const toggleItem = (id) => {
      items.value = items.value.map(i =>
        i.id === id ? { ...i, selected: !i.selected } : i
      );
    };

    return { items, allSelected, someSelected, toggleAll, toggleItem };
  },
  template({ items, allSelected, someSelected }) {
    return `
      <div class="select-all-container">
        <label>
          <input
            type="checkbox"
            checked="{{ allSelected() }}"
            indeterminate="{{ someSelected() }}"
            @change="toggleAll"
          />
          Select All
        </label>

        <ul>
          ${items.value.map(item => `
            <li key="${item.id}">
              <label>
                <input
                  type="checkbox"
                  checked="${item.selected}"
                  @change="toggleItem(${item.id})"
                />
                ${item.name}
              </label>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }
};
```

---

## Configuration

### Plugin Options

```javascript
app.use(Attr, {
  enableAria: true,      // Enable ARIA attribute handling
  enableData: true,      // Enable data-* attribute handling
  enableBoolean: true,   // Enable boolean attribute handling
  enableDynamic: true    // Enable dynamic property detection
});
```

### Selective Feature Enabling

```javascript
// Only ARIA attributes (accessibility-focused)
app.use(Attr, {
  enableAria: true,
  enableData: false,
  enableBoolean: false,
  enableDynamic: false
});

// Only data attributes (data storage)
app.use(Attr, {
  enableAria: false,
  enableData: true,
  enableBoolean: false,
  enableDynamic: false
});

// Form handling (boolean + dynamic)
app.use(Attr, {
  enableAria: false,
  enableData: false,
  enableBoolean: true,
  enableDynamic: true
});
```

---

## API Reference

### Attr

The main plugin object to install on your Eleva application.

```javascript
import { Attr } from "eleva/plugins";

app.use(Attr, options);
```

#### Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enableAria` | `boolean` | `true` | When enabled, automatically handles ARIA attributes (`aria-*`) |
| `enableData` | `boolean` | `true` | When enabled, automatically handles data attributes (`data-*`) |
| `enableBoolean` | `boolean` | `true` | When enabled, intelligently handles boolean attributes based on truthy/falsy values |
| `enableDynamic` | `boolean` | `true` | When enabled, detects and binds dynamic DOM properties |

### app.updateElementAttributes(oldElement, newElement)

Manually synchronize attributes from one element to another. This method is exposed on the app instance when the Attr plugin is installed.

```javascript
/**
 * Update element attributes
 * @param {HTMLElement} oldElement - The source element
 * @param {HTMLElement} newElement - The target element to update
 * @returns {void}
 */
app.updateElementAttributes(oldElement, newElement);
```

#### Example Usage

```javascript
const MyComponent = {
  setup({ signal }) {
    const app = this;  // Reference to app instance

    const updateAttributes = () => {
      const oldEl = document.getElementById('source');
      const newEl = document.getElementById('target');
      app.updateElementAttributes(oldEl, newEl);
    };

    return { updateAttributes };
  },
  template() {
    return `
      <div id="source" data-value="123" aria-label="Source">Source</div>
      <div id="target">Target</div>
      <button @click="updateAttributes">Sync Attributes</button>
    `;
  }
};
```

---

## Usage Patterns

### Pattern 1: Accessible Form

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
          hidden="{{ !submitSuccess.value }}"
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
            value="{{ formData.value.name }}"
            @input="updateField('name', $event.target.value)"
            aria-labelledby="name-label"
            aria-describedby="name-error"
            aria-invalid="{{ errors.value.name ? 'true' : 'false' }}"
            aria-required="true"
            required="{{ true }}"
          />
          <span
            id="name-error"
            role="alert"
            class="error"
            hidden="{{ !errors.value.name }}"
          >
            {{ errors.value.name || '' }}
          </span>
        </div>

        <!-- Email Field -->
        <div class="form-group">
          <label id="email-label" for="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value="{{ formData.value.email }}"
            @input="updateField('email', $event.target.value)"
            aria-labelledby="email-label"
            aria-describedby="email-error"
            aria-invalid="{{ errors.value.email ? 'true' : 'false' }}"
            aria-required="true"
            required="{{ true }}"
          />
          <span
            id="email-error"
            role="alert"
            class="error"
            hidden="{{ !errors.value.email }}"
          >
            {{ errors.value.email || '' }}
          </span>
        </div>

        <!-- Message Field -->
        <div class="form-group">
          <label id="message-label" for="message">Message</label>
          <textarea
            id="message"
            name="message"
            value="{{ formData.value.message }}"
            @input="updateField('message', $event.target.value)"
            aria-labelledby="message-label"
            aria-describedby="message-error message-hint"
            aria-invalid="{{ errors.value.message ? 'true' : 'false' }}"
            aria-required="true"
            required="{{ true }}"
          ></textarea>
          <span id="message-hint" class="hint">
            Minimum 10 characters
          </span>
          <span
            id="message-error"
            role="alert"
            class="error"
            hidden="{{ !errors.value.message }}"
          >
            {{ errors.value.message || '' }}
          </span>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          disabled="{{ isSubmitting.value }}"
          aria-busy="{{ isSubmitting.value }}"
        >
          {{ isSubmitting.value ? 'Submitting...' : 'Send Message' }}
        </button>
      </form>
    `;
  }
};
```

### Pattern 2: Accordion Component

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
                @click="toggleSection('${section.id}')"
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

### Pattern 3: Tab Component

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
              @click="selectTab(${index})"
              @keydown="handleKeyDown($event, ${index})"
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

### Pattern 4: Data-Driven Table

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
                <button @click="toggleSort('${col.key}')">
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
                  @change="toggleRowSelection(${row.id})"
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

### Pattern 5: Modal Dialog

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
          hidden="{{ !isOpen.value }}"
          aria-hidden="{{ !isOpen.value }}"
          @click="closeModal"
        ></div>

        <!-- Modal Dialog -->
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          aria-hidden="{{ !isOpen.value }}"
          hidden="{{ !isOpen.value }}"
          class="modal"
          @keydown="handleKeyDown"
        >
          <header class="modal-header">
            <h2 id="modal-title">{{ modalTitle.value }}</h2>
            <button
              @click="closeModal"
              aria-label="Close modal"
              class="modal-close"
            >
              ×
            </button>
          </header>

          <div id="modal-description" class="modal-body">
            <p>{{ modalMessage.value }}</p>
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
              autofocus="{{ isOpen.value }}"
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

## Best Practices

### 1. Accessibility First

Always include appropriate ARIA attributes for interactive elements:

```javascript
// Good - Accessible button
`<button
  aria-label="Close navigation menu"
  aria-expanded="{{ isMenuOpen.value }}"
  @click="toggleMenu"
>
  <span aria-hidden="true">×</span>
</button>`

// Bad - No accessibility information
`<button @click="toggleMenu">×</button>`
```

### 2. Use Semantic HTML

Let HTML do the work before reaching for ARIA:

```javascript
// Good - Semantic HTML
`<nav aria-label="Main navigation">
  <ul>
    <li><a href="/home">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>`

// Avoid - ARIA overuse
`<div role="navigation" aria-label="Main navigation">
  <div role="list">
    <div role="listitem"><span role="link">Home</span></div>
  </div>
</div>`
```

### 3. Data Attribute Naming

Use consistent, descriptive data attribute names:

```javascript
// Good - Clear, consistent naming
`<div
  data-user-id="{{ user.id }}"
  data-user-role="{{ user.role }}"
  data-is-active="{{ user.isActive }}"
>`

// Bad - Inconsistent, unclear naming
`<div
  data-id="{{ user.id }}"
  data-r="{{ user.role }}"
  data-a="{{ user.isActive }}"
>`
```

### 4. Boolean Attribute Clarity

Be explicit about boolean attribute conditions:

```javascript
// Good - Clear condition
`<button disabled="{{ isLoading.value || !isValid.value }}">
  Submit
</button>`

// Good - Computed property
const canSubmit = () => !isLoading.value && isValid.value;
`<button disabled="{{ !canSubmit() }}">Submit</button>`

// Avoid - Complex inline logic
`<button disabled="{{ !(data.value && data.value.name && !errors.value.name) }}">
  Submit
</button>`
```

### 5. Performance Considerations

Minimize attribute updates for better performance:

```javascript
// Good - Batch related state
const formState = signal({
  isSubmitting: false,
  isValid: true,
  errorMessage: ""
});

// Avoid - Many separate signals for related state
const isSubmitting = signal(false);
const isValid = signal(true);
const errorMessage = signal("");
```

---

## Troubleshooting

### Common Issues

#### Boolean Attribute Not Toggling

**Problem**: Boolean attribute stays present regardless of value.

```javascript
// Wrong - String "false" is truthy
`<button disabled="false">`  // Still disabled!

// Correct - Use template binding
`<button disabled="{{ isDisabled.value }}">`
```

**Solution**: Always use template binding `{{ }}` for dynamic boolean attributes.

#### ARIA Attributes Not Updating

**Problem**: ARIA attributes don't reflect state changes.

```javascript
// Check that you're using .value for signals
`aria-expanded="{{ isOpen }}"`      // Wrong - missing .value
`aria-expanded="{{ isOpen.value }}"` // Correct
```

**Solution**: Ensure you're accessing the `.value` property of signals.

#### Data Attributes with Special Characters

**Problem**: Data attribute values contain quotes or special characters.

```javascript
// Problem
`data-message="{{ message.value }}"`  // message contains quotes

// Solution - Encode special characters
const safeMessage = () => encodeURIComponent(message.value);
`data-message="{{ safeMessage() }}"`
```

#### Dynamic Property Not Binding

**Problem**: Input value doesn't update when signal changes.

```javascript
// Ensure two-way binding
`<input
  value="{{ inputValue.value }}"
  @input="inputValue.value = $event.target.value"
/>`
```

**Solution**: Implement both value binding and input event handler for two-way data flow.

### Plugin Not Working

1. **Check installation order**:
   ```javascript
   const app = new Eleva("App", container);
   app.use(Attr);  // Must be before mount()
   app.component("my-component", MyComponent).mount();
   ```

2. **Verify plugin is imported**:
   ```javascript
   import { Attr } from "eleva/plugins";
   // or
   const { Attr } = window.ElevaPlugins;
   ```

3. **Check for conflicting plugins**:
   Some plugins may override attribute handling. Install Attr first.

### Debugging Tips

```javascript
// Log attribute updates
const DebugComponent = {
  setup({ signal }) {
    const value = signal("test");

    // Watch for changes
    value.watch((newVal, oldVal) => {
      console.log(`Value changed: ${oldVal} → ${newVal}`);
    });

    return { value };
  },
  template({ value }) {
    return `<div data-debug="{{ value.value }}">{{ value.value }}</div>`;
  }
};

// Inspect element attributes
const el = document.querySelector('[data-debug]');
console.log('Attributes:', el.attributes);
console.log('Dataset:', el.dataset);
console.log('ARIA:', el.getAttribute('aria-label'));
```

---

## Batching Tips & Gotchas

Eleva uses **render batching** via `queueMicrotask` to optimize performance. This means attribute updates happen asynchronously after signal changes. Here's what you need to know when using the Attr plugin:

### 1. Attribute Updates Are Batched

When signals change, attribute updates are batched with template re-renders:

```javascript
// Both changes result in ONE DOM update
isDisabled.value = true;
ariaLabel.value = "Loading...";
// Attributes update together in next microtask
```

### 2. DOM Attributes Don't Update Immediately

After changing a signal, attributes won't reflect the change immediately:

```javascript
isExpanded.value = true;
console.log(element.getAttribute('aria-expanded')); // Still "false"!

// Wait for batched update
isExpanded.value = true;
queueMicrotask(() => {
  console.log(element.getAttribute('aria-expanded')); // Now "true"
});
```

### 3. Tests May Need Delays

When testing attribute bindings, allow time for batched updates:

```javascript
test("button becomes disabled", async () => {
  isLoading.value = true;

  // Wait for batched update
  await new Promise(resolve => queueMicrotask(resolve));

  expect(button.disabled).toBe(true);
  expect(button.getAttribute('aria-busy')).toBe('true');
});
```

### 4. Boolean Attributes and Batching

Boolean attribute toggling follows the same batching rules:

```javascript
// These are batched together
disabled.value = true;
hidden.value = false;
checked.value = true;
// All three attributes update in one DOM operation
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Attr Plugin                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Signal Change                                                  │
│        │                                                         │
│        ▼                                                         │
│   ┌─────────────────────────────────────────────────────┐       │
│   │              Attribute Detection                      │       │
│   └─────────────────────────────────────────────────────┘       │
│        │                                                         │
│        ├─── aria-* ──► ARIA Handler ──► setAttribute()          │
│        │                                                         │
│        ├─── data-* ──► Data Handler ──► dataset[key]            │
│        │                                                         │
│        ├─── boolean ─► Boolean Handler ─► add/removeAttribute() │
│        │   (disabled, checked, etc.)                             │
│        │                                                         │
│        └─── dynamic ─► Property Handler ──► element[property]   │
│            (value, src, etc.)                                    │
│                                                                  │
│   ┌─────────────────────────────────────────────────────┐       │
│   │              DOM Updated                              │       │
│   └─────────────────────────────────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary

### Key Features

| Feature | Description |
|---------|-------------|
| **ARIA Handling** | Automatic accessibility attribute management |
| **Data Attributes** | Custom data storage on elements |
| **Boolean Attributes** | Intelligent truthy/falsy handling |
| **Dynamic Properties** | DOM property synchronization |
| **Zero Config** | Works out of the box with sensible defaults |
| **Selective Enable** | Configure which features to enable |
| **Manual API** | `updateElementAttributes()` for advanced use cases |

### When to Use

- **Building accessible applications** - Use ARIA features
- **Storing element metadata** - Use data attributes
- **Form handling** - Use boolean and dynamic properties
- **Component libraries** - Use all features for flexibility

### Plugin Statistics

- **Size**: ~2.2KB minified
- **Dependencies**: None (uses core Eleva only)
- **Browser Support**: All modern browsers
- **Configuration Options**: 4

---

[← Back to Plugins](./index.md) | [Back to Main Docs](../index.md) | [Next: Props Plugin →](./props.md)
