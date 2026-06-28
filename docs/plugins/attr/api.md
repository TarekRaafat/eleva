---
title: Attr Plugin API Reference
description: Eleva Attr API reference. Configuration options, updateElementAttributes method, uninstall guide, troubleshooting tips, and accessibility best practices.
---

<!-- REVU Analytics -->
<script async src="https://cdn.revu.ai/behavior"></script>
<script>
  window.revu = window.revu || new Proxy({q:[]}, {
    get: (t, m) => m in t ? t[m] : (...a) => t.q.push([m, ...a]),
  });
  revu.init({ apiKey: "revu_pk_prod_KFdyizGp4I0cWia36eNmWg" });
</script>

<link rel="canonical" href="https://elevajs.com/plugins/attr/api.html">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://elevajs.com/plugins/attr/api.html">
<meta property="og:title" content="Attr Plugin API Reference - Eleva.js">
<meta property="og:description" content="Eleva Attr API reference. Configuration options, updateElementAttributes method, uninstall guide, troubleshooting tips, and accessibility best practices.">
<meta property="og:image" content="https://elevajs.com/imgs/eleva.js%20Full%20Logo.png">
<meta property="og:site_name" content="Eleva.js">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://elevajs.com/plugins/attr/api.html">
<meta name="twitter:title" content="Attr Plugin API Reference - Eleva.js">
<meta name="twitter:description" content="Eleva Attr API reference. Configuration options, updateElementAttributes method, uninstall guide, troubleshooting tips, and accessibility best practices.">
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
  "headline": "Eleva.js Attr Plugin API Reference",
  "description": "Complete API reference for Eleva Attr plugin including methods, troubleshooting, and best practices.",
  "image": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png",
  "datePublished": "2026-01-01T00:00:00Z",
  "dateModified": "2026-02-08T00:00:00Z",
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
    "@id": "https://elevajs.com/plugins/attr/api.html"
  },
  "articleSection": "Plugins",
  "keywords": ["eleva attr", "API reference", "updateElementAttributes", "attribute binding", "configuration options"]
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
    { "@type": "ListItem", "position": 4, "name": "API Reference", "item": "https://elevajs.com/plugins/attr/api.html" }
  ]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Why isn't my boolean attribute toggling correctly?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Attr plugin only recognizes 'true', '' (empty string), or the attribute name itself (e.g., disabled='disabled') as truthy values. Values like '1' or 'yes' are NOT recognized as truthy. Use boolean signals that produce true/false strings."
      }
    },
    {
      "@type": "Question",
      "name": "Why aren't my ARIA attributes updating?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ensure you're accessing the .value property of signals. Use aria-expanded='${ctx.isOpen.value}' not aria-expanded='${ctx.isOpen}' (missing .value)."
      }
    },
    {
      "@type": "Question",
      "name": "How do I handle data attributes with special characters?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Encode special characters using encodeURIComponent(). Create a computed property like const safeMessage = () => encodeURIComponent(message.value) and use it in your template."
      }
    },
    {
      "@type": "Question",
      "name": "Why isn't my dynamic property binding to input value?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For two-way binding, implement both value binding and input event handler. Use value='${ctx.inputValue.value}' combined with @input='(e) => inputValue.value = e.target.value' for complete two-way data flow."
      }
    },
    {
      "@type": "Question",
      "name": "Why isn't the Attr plugin working?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Check: (1) Installation order - app.use(Attr) must be called before mount(). (2) Plugin is imported correctly from 'eleva/plugins'. (3) No conflicting plugins that override attribute handling - install Attr first."
      }
    }
  ]
}
</script>

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
 * @param {HTMLElement} oldElement - The element to update (modified in-place)
 * @param {HTMLElement} newElement - The reference element with desired attributes
 * @returns {void}
 */
app.updateElementAttributes(oldElement, newElement);
```

#### Example Usage

```javascript
// Store reference to app for use in components
const app = new Eleva("MyApp");
app.use(Attr);

// Option 1: Use outside of component setup
const syncElements = () => {
  const oldEl = document.getElementById('source');
  const newEl = document.getElementById('target');
  app.updateElementAttributes(oldEl, newEl);
};

// Option 2: Pass app reference via closure
app.component("MyComponent", {
  setup({ signal }) {
    const updateAttributes = () => {
      const oldEl = document.getElementById('source');
      const newEl = document.getElementById('target');
      // app is available via closure (defined in outer scope)
      app.updateElementAttributes(oldEl, newEl);
    };

    return { updateAttributes };
  },
  template: () => `
    <div id="source" data-value="123" aria-label="Source">Source</div>
    <div id="target">Target</div>
    <button @click="updateAttributes">Sync Attributes</button>
  `
});
```

> **Note:** The `setup` function receives `ctx` (context) as its argument, not `this`. To access the app instance inside setup, use a closure reference to `app` defined in the outer scope.

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

Be explicit about boolean attribute conditions and use actual boolean values:

```javascript
// Good - Boolean expression produces "true" or "false" string
`<button disabled="${ctx.isLoading.value || !ctx.isValid.value}">
  Submit
</button>`

// Good - Computed property returning boolean
const canSubmit = () => !isLoading.value && isValid.value;
`<button disabled="${!ctx.canSubmit()}">Submit</button>`

// Avoid - Complex inline logic
`<button disabled="${!(ctx.data.value && ctx.data.value.name && !ctx.errors.value.name)}">
  Submit
</button>`

// Important: Only these string values are recognized as truthy:
// - "true"
// - "" (empty string)
// - attribute name (e.g., disabled="disabled")
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

**Problem**: Boolean attribute doesn't behave as expected.

```javascript
// These work correctly with Attr plugin:
`<button disabled="${ctx.isDisabled.value}">`  // true/false signals work
`<button disabled="true">`   // attribute present
`<button disabled="false">`  // attribute removed
`<button disabled="">`       // attribute present (empty = true)

// These do NOT work as you might expect:
`<button disabled="1">`      // attribute REMOVED (not recognized as truthy)
`<button disabled="yes">`    // attribute REMOVED (not recognized as truthy)
```

**Solution**: The Attr plugin only recognizes `"true"`, `""` (empty), or matching attribute name (e.g., `disabled="disabled"`) as truthy values. Use boolean signals that produce `true`/`false` strings.

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
  @input="(e) => inputValue.value = e.target.value"
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

- **Size**: ~2.2KB minified
- **Dependencies**: None (uses core Eleva only)
- **Browser Support**: All modern browsers
- **Configuration Options**: 4

For questions or issues, visit the [GitHub repository](https://github.com/TarekRaafat/eleva).

---

## See Also

- [Attr Features](./features.md) — ARIA, data attributes, boolean handling
- [Attr Patterns](./patterns.md) — Accessible forms, tabs, accordions
- [Conditional Rendering](../../examples/patterns/conditional-rendering.md) — Dynamic UI states
- [Form Handling](../../examples/patterns/forms.md) — Accessible form patterns

---

[← Back to Usage Patterns](./patterns.md) | [Back to Attr Overview](./index.md) | [Router Plugin →](../router/index.md)
