---
title: Attr Plugin Features
description: ARIA attributes, data attributes, boolean attributes, and dynamic properties in Eleva Attr plugin.
---

# Attr Plugin Features

> **Attr Plugin** | ARIA, data, boolean attributes, and dynamic properties.

---

## 1. ARIA Attributes

ARIA (Accessible Rich Internet Applications) attributes enhance web accessibility for users with disabilities. The Attr plugin automatically handles all `aria-*` attributes.

### Common ARIA Attributes

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
          aria-expanded="${isExpanded.value}"
          aria-controls="content-panel"
          @click="isExpanded.value = !isExpanded.value"
        >
          Toggle Content
        </button>
        <div id="content-panel" aria-hidden="${!isExpanded.value}">
          Panel content here...
        </div>

        <!-- Selectable Item -->
        <div
          role="option"
          aria-selected="${isSelected.value}"
          @click="isSelected.value = !isSelected.value"
        >
          Selectable Item
        </div>

        <!-- Slider/Progress -->
        <div
          role="slider"
          aria-valuenow="${currentValue.value}"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Volume"
        >
          Value: ${currentValue.value}%
        </div>

        <!-- Form Field with Error -->
        <input
          type="text"
          aria-invalid="${errorMessage.value ? 'true' : 'false'}"
          aria-describedby="error-text"
        />
        <span id="error-text" role="alert">${errorMessage.value}</span>
      </div>
    `;
  }
};
```

### ARIA Attribute Reference

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

---

## 2. Data Attributes

Data attributes (`data-*`) provide a way to store custom data on HTML elements. The Attr plugin automatically synchronizes data attributes with your component state.

### Basic Data Attributes

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
        data-product-id="${product.value.id}"
        data-category="${product.value.category}"
        data-price="${product.value.price}"
        data-in-stock="${product.value.inStock}"
      >
        <h3>${product.value.name}</h3>
        <p class="price">\$${product.value.price}</p>
        <span class="stock-status">
          ${product.value.inStock ? 'In Stock' : 'Out of Stock'}
        </span>
      </article>
    `;
  }
};
```

### Accessing Data Attributes in JavaScript

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

### Dynamic Data Attributes

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

---

## 3. Boolean Attributes

Boolean attributes are special HTML attributes where the presence of the attribute (regardless of value) means `true`, and absence means `false`. The Attr plugin intelligently handles these attributes.

### Standard Boolean Attributes

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

### Boolean Attribute Examples

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
          disabled="${isSubmitting.value || !agreeToTerms.value}"
        >
          ${isSubmitting.value ? 'Submitting...' : 'Submit'}
        </button>

        <!-- Checkbox with checked binding -->
        <label>
          <input
            type="checkbox"
            checked="${agreeToTerms.value}"
            @change="agreeToTerms.value = $event.target.checked"
          />
          I agree to the terms
        </label>

        <!-- Select with selected option -->
        <select @change="selectedPlan.value = $event.target.value">
          <option value="basic" selected="${selectedPlan.value === 'basic'}">
            Basic Plan
          </option>
          <option value="pro" selected="${selectedPlan.value === 'pro'}">
            Pro Plan
          </option>
          <option value="enterprise" selected="${selectedPlan.value === 'enterprise'}">
            Enterprise Plan
          </option>
        </select>

        <!-- Details element with open state -->
        <details open="${showDetails.value}">
          <summary @click="showDetails.value = !showDetails.value">
            More Information
          </summary>
          <p>Additional details here...</p>
        </details>

        <!-- Required field -->
        <input
          type="email"
          placeholder="Email"
          required="${emailRequired.value}"
        />
      </form>
    `;
  }
};
```

### How Boolean Attributes Work

```javascript
// When signal value is truthy:
// disabled="${true}" → <button disabled>
// disabled="${1}" → <button disabled>
// disabled="${'yes'}" → <button disabled>

// When signal value is falsy:
// disabled="${false}" → <button>
// disabled="${0}" → <button>
// disabled="${''}" → <button>
// disabled="${null}" → <button>
// disabled="${undefined}" → <button>
```

---

## 4. Dynamic Properties

Some DOM elements have properties that don't correspond directly to attributes. The Attr plugin detects these and handles them appropriately.

### Common Dynamic Properties

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

### Dynamic Property Examples

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
          value="${textValue.value}"
          @input="textValue.value = $event.target.value"
        />
        <p>Text: ${textValue.value}</p>

        <!-- Number input with value binding -->
        <input
          type="number"
          value="${numberValue.value}"
          @input="numberValue.value = parseInt($event.target.value)"
        />
        <p>Number: ${numberValue.value}</p>

        <!-- Range slider with value binding -->
        <input
          type="range"
          min="0"
          max="100"
          value="${rangeValue.value}"
          @input="rangeValue.value = parseInt($event.target.value)"
        />
        <p>Range: ${rangeValue.value}%</p>

        <!-- Dynamic image source -->
        <img
          src="${imageUrl.value}"
          alt="Dynamic image"
        />
      </div>
    `;
  }
};
```

### Indeterminate Checkbox

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
            checked="${allSelected()}"
            indeterminate="${someSelected()}"
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
                  @change="() => toggleItem(${item.id})"
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

## Next Steps

- [Usage Patterns](./patterns.md) - Real-world examples
- [API Reference](./api.md) - Complete API and troubleshooting

---

[← Back to Attr](./index.md) | [Next: Usage Patterns →](./patterns.md)
