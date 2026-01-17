---
title: Attr Plugin API Reference
description: Complete API reference for Eleva Attr plugin including methods, troubleshooting, and best practices.
---

# Attr Plugin API Reference

> **Attr Plugin** | Complete API reference.

---

## API

### Attr

The main plugin object to install on your Eleva application.

```javascript
import { Attr } from "eleva/plugins";

app.use(Attr, options);
```

### Options

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

## Uninstalling the Plugin

The Attr plugin provides an `uninstall()` method to completely remove it from an Eleva instance.

### Attr.uninstall(app)

Removes the Attr plugin and restores the original renderer behavior.

```javascript
import Eleva from "eleva";
import { Attr } from "eleva/plugins";

const app = new Eleva("MyApp");
app.use(Attr, {
  enableAria: true,
  enableData: true,
  enableBoolean: true,
  enableDynamic: true
});

// Use the plugin...
app.mount(document.getElementById("app"), "MyComponent");

// Later, to completely remove the Attr plugin:
Attr.uninstall(app);

// After uninstall:
// - app.updateElementAttributes (undefined)
// - Original renderer._patchNode() is restored
// - Plugin removed from registry
```

### What `Attr.uninstall()` Does

1. **Restores original methods:**
   - `app.renderer._patchNode` → restored to original

2. **Removes added properties:**
   - `app.updateElementAttributes`

3. **Removes from plugin registry:**
   - `app.plugins.delete("attr")`

### When to Use

- Removing enhanced attribute handling from your app
- Switching to a different attribute management approach
- Full app teardown/cleanup
- Testing scenarios requiring clean slate

### Uninstall Order (LIFO)

When using multiple plugins, uninstall in reverse order of installation:

```javascript
// Installation order
app.use(Attr);
app.use(Store, { state: {} });
app.use(Router, { routes: [] });

// Uninstall in reverse order (LIFO)
await Router.uninstall(app);  // Last installed, first uninstalled
Store.uninstall(app);
Attr.uninstall(app);
```

> **Note:** Attr's `uninstall()` is synchronous (not async), unlike Router's which is async.

---

## Best Practices

### 1. Accessibility First

Always include appropriate ARIA attributes for interactive elements:

```javascript
// Good - Accessible button
`<button
  aria-label="Close navigation menu"
  aria-expanded="${ctx.isMenuOpen.value}"
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
  data-user-id="${ctx.user.id}"
  data-user-role="${ctx.user.role}"
  data-is-active="${ctx.user.isActive}"
>`

// Bad - Inconsistent, unclear naming
`<div
  data-id="${ctx.user.id}"
  data-r="${ctx.user.role}"
  data-a="${ctx.user.isActive}"
>`
```

### 4. Boolean Attribute Clarity

Be explicit about boolean attribute conditions:

```javascript
// Good - Clear condition
`<button disabled="${ctx.isLoading.value || !ctx.isValid.value}">
  Submit
</button>`

// Good - Computed property
const canSubmit = () => !isLoading.value && isValid.value;
`<button disabled="${!ctx.canSubmit()}">Submit</button>`

// Avoid - Complex inline logic
`<button disabled="${!(ctx.data.value && ctx.data.value.name && !ctx.errors.value.name)}">
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
`<button disabled="${ctx.isDisabled.value}">`
```

**Solution**: Always use template binding `${}` for dynamic boolean attributes.

#### ARIA Attributes Not Updating

**Problem**: ARIA attributes don't reflect state changes.

```javascript
// Check that you're using .value for signals
`aria-expanded="${ctx.isOpen}"`      // Wrong - missing .value
`aria-expanded="${ctx.isOpen.value}"` // Correct
```

**Solution**: Ensure you're accessing the `.value` property of signals.

#### Data Attributes with Special Characters

**Problem**: Data attribute values contain quotes or special characters.

```javascript
// Problem
`data-message="${ctx.message.value}"`  // message contains quotes

// Solution - Encode special characters
const safeMessage = () => encodeURIComponent(message.value);
`data-message="${ctx.safeMessage()}"`
```

#### Dynamic Property Not Binding

**Problem**: Input value doesn't update when signal changes.

```javascript
// Ensure two-way binding
`<input
  value="${ctx.inputValue.value}"
  @input="inputValue.value = $event.target.value"
/>`
```

**Solution**: Implement both value binding and input event handler for two-way data flow.

### Plugin Not Working

1. **Check installation order**:
   ```javascript
   const app = new Eleva("App");
   app.use(Attr);  // Must be before mount()
   app.component("MyComponent", { /* ... */ });
   app.mount(document.getElementById("app"), "MyComponent");
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

    // Watch for changes (receives new value only)
    value.watch((newVal) => {
      console.log(`Value changed to: ${newVal}`);
    });

    return { value };
  },
  template({ value }) {
    return `<div data-debug="${value.value}">${value.value}</div>`;
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

Eleva uses **render batching** via `queueMicrotask` to optimize performance. This means attribute updates happen asynchronously after signal changes.

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

### Plugin Statistics

- **Size**: ~2.4KB minified
- **Dependencies**: None (uses core Eleva only)
- **Browser Support**: All modern browsers
- **Configuration Options**: 4

For questions or issues, visit the [GitHub repository](https://github.com/TarekRaafat/eleva).

---

[← Back to Usage Patterns](./patterns.md) | [Back to Attr Overview](./index.md) | [Router Plugin →](../router/index.md)
