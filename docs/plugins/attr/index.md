---
title: Eleva.js Attr Plugin - Intelligent Attribute Binding
description: Eleva.js Attr plugin for ARIA accessibility, data attributes, boolean attributes, and dynamic property binding. 2.2KB, zero-config.
image: /imgs/eleva.js%20Full%20Logo.png
---

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
  "headline": "Eleva.js Attr Plugin - Intelligent Attribute Binding",
  "description": "Eleva.js Attr plugin for ARIA accessibility, data attributes, boolean attributes, and dynamic property binding. 2.2KB, zero-config.",
  "image": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png",
  "datePublished": "2026-01-01T00:00:00Z",
  "dateModified": "2026-01-17T00:00:00Z",
  "author": {
    "@type": "Person",
    "name": "Tarek Raafat",
    "email": "tarek.m.raaf@gmail.com",
    "url": "https://github.com/TarekRaafat"
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
    "@id": "https://elevajs.com/plugins/attr/"
  },
  "proficiencyLevel": "Intermediate",
  "articleSection": "Plugins",
  "keywords": ["eleva", "elevajs", "Eleva.js", "attr plugin", "attribute binding", "ARIA", "accessibility", "data attributes"]
}
</script>

# Attr Plugin

> **Version:** 1.1.1 | **Type:** Attribute Binding Plugin | **Bundle Size:** ~2.2KB minified | **Dependencies:** Eleva core

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
| **ARIA Attributes** | `aria-label="${ctx.label}"` | Accessibility attributes |
| **Data Attributes** | `data-id="${ctx.id}"` | Custom data storage |
| **Boolean Attributes** | `disabled="${ctx.isDisabled.value}"` | Presence-based attributes |
| **Dynamic Properties** | `value="${ctx.inputValue}"` | DOM property binding |
| **Update Method** | `app.updateElementAttributes(old, new)` | Manual attribute sync |

> **Context Rule:** Inside `${}`, access properties via `ctx.` prefix.
> Use `${ctx.isLoading.value}` in templates with `template: (ctx) => \`...\``.

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enableAria` | `boolean` | `true` | Enable ARIA attribute handling |
| `enableData` | `boolean` | `true` | Enable data-* attribute handling |
| `enableBoolean` | `boolean` | `true` | Enable boolean attribute handling |
| `enableDynamic` | `boolean` | `true` | Enable dynamic property detection |

---

## Documentation

| Section | Description |
|---------|-------------|
| [Features](./features.md) | ARIA, data, boolean, and dynamic attributes |
| [Usage Patterns](./patterns.md) | Forms, accordion, tabs, table, modal |
| [API Reference](./api.md) | Complete API, troubleshooting, best practices |

---

## Features

| Feature | Description |
|---------|-------------|
| **ARIA Handling** | Automatic accessibility attribute management |
| **Data Attributes** | Custom data storage on elements |
| **Boolean Attributes** | Intelligent truthy/falsy handling |
| **Dynamic Properties** | DOM property synchronization |
| **Zero Config** | Works out of the box with sensible defaults |
| **Selective Enable** | Configure which features to enable |
| **Manual API** | `updateElementAttributes()` for advanced use cases |

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
<!-- Option 1: Bundled plugins -->
<script src="https://cdn.jsdelivr.net/npm/eleva"></script>
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/eleva-plugins.umd.min.js"></script>
<script>
  const app = new Eleva("MyApp");
  app.use(ElevaPlugins.Attr);
</script>

<!-- Option 2: Individual plugin -->
<script src="https://cdn.jsdelivr.net/npm/eleva"></script>
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/plugins/attr.umd.min.js"></script>
<script>
  const app = new Eleva("MyApp");
  app.use(ElevaAttrPlugin);
</script>
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
      aria-label="${ctx.buttonLabel.value}"
      aria-busy="${ctx.isLoading.value}"
      disabled="${ctx.isLoading.value}"
      @click="handleClick"
    >
      ${ctx.isLoading.value ? 'Loading...' : ctx.buttonLabel.value}
    </button>
  `
});

app.mount(document.getElementById("app"), "AccessibleButton");
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

## When to Use

- **Building accessible applications** - Use ARIA features
- **Storing element metadata** - Use data attributes
- **Form handling** - Use boolean and dynamic properties
- **Component libraries** - Use all features for flexibility

---

## Next Steps

- [Features](./features.md) - Learn about ARIA, data, boolean, and dynamic attributes
- [Usage Patterns](./patterns.md) - Real-world examples
- [API Reference](./api.md) - Complete API and troubleshooting

---

[← Back to Plugins](../index.md) | [Next: Features →](./features.md)
