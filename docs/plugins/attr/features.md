---
title: Attr Plugin Features
description: Eleva Attr features explained. Auto-sync ARIA for screen readers, bind data-* attributes, toggle booleans like disabled/checked, and set DOM properties.
---

<link rel="canonical" href="https://elevajs.com/plugins/attr/features.html">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://elevajs.com/plugins/attr/features.html">
<meta property="og:title" content="Attr Plugin Features - Eleva.js">
<meta property="og:description" content="Eleva Attr features explained. Auto-sync ARIA for screen readers, bind data-* attributes, toggle booleans like disabled/checked, and set DOM properties.">
<meta property="og:image" content="https://elevajs.com/imgs/eleva.js%20Full%20Logo.png">
<meta property="og:site_name" content="Eleva.js">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://elevajs.com/plugins/attr/features.html">
<meta name="twitter:title" content="Attr Plugin Features - Eleva.js">
<meta name="twitter:description" content="Eleva Attr features explained. Auto-sync ARIA for screen readers, bind data-* attributes, toggle booleans like disabled/checked, and set DOM properties.">
<meta name="twitter:image" content="https://elevajs.com/imgs/eleva.js%20Full%20Logo.png">

<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-S4L689921Q"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", "G-S4L689921Q");
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Eleva.js Attr Plugin Features",
  "description": "ARIA attributes, data attributes, boolean attributes, and dynamic properties in Eleva Attr plugin.",
  "image": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png",
  "datePublished": "2026-01-01T00:00:00Z",
  "dateModified": "2026-02-03T00:00:00Z",
  "author": {
    "@type": "Person",
    "name": "Tarek Raafat",
    "url": "https://github.com/TarekRaafat",
    "email": "tarek.m.raafat@gmail.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Eleva.js",
    "url": "https://elevajs.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://elevajs.com/plugins/attr/features.html"
  },
  "articleSection": "Plugins",
  "keywords": ["eleva attr", "ARIA attributes", "data attributes", "boolean attributes", "accessibility", "a11y"]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://elevajs.com/" },
    { "@type": "ListItem", "position": 2, "name": "Plugins", "item": "https://elevajs.com/plugins/" },
    { "@type": "ListItem", "position": 3, "name": "Attr", "item": "https://elevajs.com/plugins/attr/" },
    { "@type": "ListItem", "position": 4, "name": "Features", "item": "https://elevajs.com/plugins/attr/features.html" }
  ]
}
</script>

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
          @click="() => isExpanded.value = !isExpanded.value"
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
          @click="() => isSelected.value = !isSelected.value"
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
            @change="(e) => agreeToTerms.value = e.target.checked"
          />
          I agree to the terms
        </label>

        <!-- Select with selected option -->
        <select @change="(e) => selectedPlan.value = e.target.value">
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
          <summary @click="() => showDetails.value = !showDetails.value">
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

The Attr plugin uses specific string matching for boolean attributes:

```javascript
// These values are treated as TRUE (attribute present):
// disabled="${true}"      → <button disabled>  (becomes "true" string)
// disabled=""             → <button disabled>  (empty string)
// disabled="disabled"     → <button disabled>  (value equals attribute name)
// disabled="true"         → <button disabled>  (literal "true" string)

// These values are treated as FALSE (attribute removed):
// disabled="${false}"     → <button>  (becomes "false" string)
// disabled="false"        → <button>  (literal "false" string)
// disabled="1"            → <button>  (not recognized as truthy)
// disabled="yes"          → <button>  (not recognized as truthy)
// disabled="0"            → <button>  (not recognized as truthy)
```

**Important:** The plugin only recognizes these as truthy:
- `"true"` (string)
- `""` (empty string)
- Value matching the attribute name (e.g., `disabled="disabled"`)

Any other string value (including `"1"`, `"yes"`, `"on"`) will be treated as falsy and the attribute will be removed.

---

## 4. Dynamic Properties

Some DOM elements have properties that don't correspond directly to attributes. The Attr plugin detects these and handles them appropriately.

### Common Dynamic Properties

The Attr plugin automatically detects properties that exist on the element's prototype chain and synchronizes them. Common examples include:

| Property | Element(s) | Description |
|----------|------------|-------------|
| `value` | `input`, `textarea`, `select` | Current value |
| `checked` | `input[type="checkbox/radio"]` | Checked state |
| `selected` | `option` | Selection state |
| `indeterminate` | `input[type="checkbox"]` | Indeterminate state |
| `src` | `img`, `video`, `audio`, `iframe` | Source URL |
| `href` | `a`, `link` | Link URL |

> **Note:** The plugin detects any property that exists on the element's prototype. Standard DOM properties like `innerHTML`, `textContent`, and `className` work through normal DOM mechanisms and don't require special handling from this plugin.

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
          @input="(e) => textValue.value = e.target.value"
        />
        <p>Text: ${textValue.value}</p>

        <!-- Number input with value binding -->
        <input
          type="number"
          value="${numberValue.value}"
          @input="(e) => numberValue.value = parseInt(e.target.value)"
        />
        <p>Number: ${numberValue.value}</p>

        <!-- Range slider with value binding -->
        <input
          type="range"
          min="0"
          max="100"
          value="${rangeValue.value}"
          @input="(e) => rangeValue.value = parseInt(e.target.value)"
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

## See Also

- [Form Handling](../../examples/patterns/forms.md) — Accessible form patterns
- [Conditional Rendering](../../examples/patterns/conditional-rendering.md) — Dynamic ARIA states
- [Best Practices](../../best-practices.md) — Accessibility best practices

---

[← Back to Attr](./index.md) | [Next: Usage Patterns →](./patterns.md)
