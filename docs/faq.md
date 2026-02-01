---
title: Eleva.js FAQ & Troubleshooting
description: Frequently asked questions, testing guide, troubleshooting tips, and community resources for Eleva.js.
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
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Eleva.js?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Eleva is a minimalist, lightweight (6KB) pure vanilla JavaScript frontend framework. It provides React-like component-based architecture with signal-based reactivity, but without the complexity, dependencies, or mandatory build tools of larger frameworks."
      }
    },
    {
      "@type": "Question",
      "name": "What is Eleva's core philosophy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Vanilla JavaScript. Elevated. Eleva takes plain vanilla JavaScript to the next level with Signals for reactivity and Components for structure. Your JS knowledge stays front and center, not hidden behind abstractions. If it works in vanilla JavaScript, it works in Eleva."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between Eleva and React?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Eleva differs from React in several key ways: (1) Eleva is 6KB vs React's 42KB+ bundle size, (2) Eleva has zero dependencies while React has several, (3) Eleva uses signal-based reactivity instead of virtual DOM diffing, (4) Eleva requires no build step and works directly via CDN, (5) Eleva uses template strings instead of JSX."
      }
    },
    {
      "@type": "Question",
      "name": "Does Eleva require a build step?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Eleva can be used directly via CDN without any build tools, bundlers, or transpilers. Simply include the script tag and start coding. However, you can also use Eleva with bundlers like Vite, Webpack, or Rollup if you prefer."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use Eleva with TypeScript?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely! Eleva includes built-in TypeScript declarations (.d.ts files). No additional @types packages are needed."
      }
    },
    {
      "@type": "Question",
      "name": "Does Eleva use Virtual DOM?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Eleva uses real DOM manipulation with an efficient diffing algorithm. Instead of maintaining a virtual DOM tree in memory, Eleva directly patches the real DOM. This reduces memory overhead and delivers 240fps-capable performance."
      }
    },
    {
      "@type": "Question",
      "name": "Is Eleva a React alternative?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, Eleva can serve as a lightweight React alternative for projects that don't need React's full ecosystem. Eleva offers similar component-based architecture and reactivity patterns but with a much smaller footprint."
      }
    },
    {
      "@type": "Question",
      "name": "What plugins are available with Eleva?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Eleva comes with three powerful built-in plugins: Attr (ARIA, data attributes, boolean attributes), Router (client-side routing with guards and reactive state), and Store (reactive state management with persistence)."
      }
    },
    {
      "@type": "Question",
      "name": "Is Eleva suitable for large applications?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Eleva's performance scales well—it handles 10K+ rows efficiently via virtual scrolling, achieves 240fps rendering, and its Router/Store plugins support complex SPAs. The main consideration for large applications is ecosystem maturity compared to React, Vue, and Angular."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between Eleva and Vue?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Both Eleva and Vue are progressive frameworks, but Eleva is smaller (6KB vs 34KB), has zero dependencies, and requires no build tools. Vue offers a more comprehensive ecosystem with Vue Router, Vuex/Pinia, and extensive tooling. Eleva's plugins (Router, Store) provide similar functionality in a lighter package."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between Eleva and Svelte?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Svelte compiles components at build time, resulting in very small runtime code (~2KB), but requires a build step. Eleva (6KB) works without any build tools via CDN. Both avoid virtual DOM. Choose Eleva when avoiding build complexity; choose Svelte when you're already using a bundler."
      }
    },
    {
      "@type": "Question",
      "name": "Is Eleva production-ready?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Eleva v1.1.1 is the latest stable release. The framework is production-ready with a stable API and comprehensive test coverage (1300+ tests)."
      }
    },
    {
      "@type": "Question",
      "name": "How does Eleva's reactivity work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Eleva uses a signal-based reactivity system similar to Solid.js. Signals are reactive containers that hold values. When a signal's value changes, any component or watcher subscribed to that signal automatically updates. This provides fine-grained reactivity without the overhead of virtual DOM diffing."
      }
    },
    {
      "@type": "Question",
      "name": "Does Eleva include routing capabilities?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Eleva includes a powerful Router plugin that provides client-side routing with navigation guards, reactive state, lazy loading, and component resolution. Import it from eleva/plugins."
      }
    },
    {
      "@type": "Question",
      "name": "Can I create custom plugins for Eleva?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Eleva has a simple plugin API. Plugins are objects with an install(eleva, options) method that receives the Eleva instance and can extend it with new functionality."
      }
    },
    {
      "@type": "Question",
      "name": "Does the Router support nested routes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Nested route definitions (routes with a children property) are not supported. All routes must be defined as a flat array. To achieve similar functionality, use shared layouts with flat routes."
      }
    },
    {
      "@type": "Question",
      "name": "How do I migrate from React to Eleva?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Migration involves replacing useState with Eleva's signal(), converting JSX components to template string components, replacing useEffect with signal watchers or lifecycle hooks, and replacing React Router with Eleva's Router plugin. See the React Migration Guide for detailed examples."
      }
    },
    {
      "@type": "Question",
      "name": "How do I migrate from Vue to Eleva?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Migration involves converting SFCs to Eleva component objects, replacing Vue's reactive/ref with Eleva's signals, converting Vue Router to Eleva's Router plugin, and replacing Vuex/Pinia with Eleva's Store plugin. See the Vue Migration Guide for detailed examples."
      }
    },
    {
      "@type": "Question",
      "name": "How do I migrate from Alpine.js to Eleva?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Both share a similar philosophy—lightweight, no build step. Migration involves replacing x-data with setup() + signal(), converting x-show/x-if to ternary expressions, replacing x-for with .map().join(''), and converting x-model to value + @input pattern. See the Alpine.js Migration Guide for detailed examples."
      }
    },
    {
      "@type": "Question",
      "name": "Why is my component not rendering?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Check your console for error messages, verify the DOM element exists before mounting, and ensure the component is registered before mounting. Use: const container = document.getElementById('app'); if (!container) console.error('Container not found!'); app.mount(container, 'MyComponent');"
      }
    },
    {
      "@type": "Question",
      "name": "Why are my signal changes not updating the UI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Make sure you're using .value to read signals in templates (use ctx.count.value not ctx.count), verify the signal is returned from setup, and check that you're modifying .value not the signal itself (use count.value = 5 not count = 5)."
      }
    },
    {
      "@type": "Question",
      "name": "Why are my event handlers not working?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Don't use ctx. prefix in event handlers (use @click=\"handleClick\" not @click=\"ctx.handleClick\"), ensure the function is returned from setup, and for inline handlers with arguments, wrap in arrow functions: @click=\"() => count.value++\"."
      }
    },
    {
      "@type": "Question",
      "name": "Why does my event handler execute immediately on render?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "This happens when calling a function with arguments without wrapping in an arrow function. Use @click=\"() => remove(item.id)\" instead of @click=\"remove(item.id)\". Direct references work fine when no arguments are needed: @click=\"handleClick\"."
      }
    }
  ]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Eleva.js FAQ & Troubleshooting",
  "description": "Frequently asked questions, testing guide, troubleshooting tips, and community resources for Eleva.js.",
  "image": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png",
  "datePublished": "2026-01-01T00:00:00Z",
  "dateModified": "2026-01-28T00:00:00Z",
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
    "@id": "https://elevajs.com/faq.html"
  },
  "proficiencyLevel": "Beginner",
  "articleSection": "Documentation",
  "keywords": ["eleva", "elevajs", "Eleva.js", "FAQ", "troubleshooting", "testing", "common questions"]
}
</script>

# FAQ & Troubleshooting

> **Core Docs** | Common questions, testing guide, and troubleshooting tips.

---

## Frequently Asked Questions

### General Questions

**Q: What is Eleva?**

Eleva is a minimalist, lightweight (6KB) pure vanilla JavaScript frontend framework. It provides React-like component-based architecture with signal-based reactivity, but without the complexity, dependencies, or mandatory build tools of larger frameworks.

**Q: What's Eleva's core philosophy?**

**💡 Vanilla JavaScript. Elevated.**

Eleva takes plain vanilla JavaScript to the next level. Signals for reactivity. Components for structure. Your JS knowledge stays front and center, not hidden behind abstractions. **If it works in vanilla JavaScript, it works in Eleva.**

**Q: Is Eleva production-ready?**

Yes! Eleva v1.1.1 is the latest stable release. The framework is production-ready with a stable API and comprehensive test coverage. We continue to welcome feedback and contributions.

**Q: How do I report issues or request features?**

Please use the [GitHub Issues](https://github.com/TarekRaafat/eleva/issues) page.

---

### Comparison Questions

**Q: What is the difference between Eleva and React?**

Eleva differs from React in several key ways:
1. Eleva is 6KB vs React's 42KB+ bundle size
2. Eleva has zero dependencies while React has several
3. Eleva uses signal-based reactivity instead of virtual DOM diffing
4. Eleva requires no build step and works directly via CDN
5. Eleva uses template strings instead of JSX

Choose Eleva when bundle size and performance matter without build complexity; choose React when you need its extensive ecosystem and tooling.

**Q: What is the difference between Eleva and Vue?**

Both Eleva and Vue are progressive frameworks, but Eleva is smaller (6KB vs 34KB), has zero dependencies, and requires no build tools. Vue offers a more comprehensive ecosystem with Vue Router, Vuex/Pinia, and extensive tooling. Eleva's plugins (Router, Store) provide similar functionality in a lighter package.

**Q: What is the difference between Eleva and Svelte?**

Svelte compiles components at build time, resulting in very small runtime code (~2KB), but requires a build step. Eleva (6KB) works without any build tools via CDN. Both avoid virtual DOM. Choose Eleva when avoiding build complexity; choose Svelte when you're already using a bundler.

**Q: Is Eleva a React alternative?**

Yes, Eleva can serve as a lightweight React alternative for projects that don't need React's full ecosystem. Eleva offers similar component-based architecture and reactivity patterns but with a much smaller footprint.

---

### Technical Questions

**Q: How does Eleva's reactivity work?**

Eleva uses a signal-based reactivity system similar to Solid.js. Signals are reactive containers that hold values. When a signal's value changes, any component or watcher subscribed to that signal automatically updates.

**Q: Does Eleva use Virtual DOM?**

No. Eleva uses real DOM manipulation with an efficient diffing algorithm. Instead of maintaining a virtual DOM tree in memory, Eleva directly patches the real DOM. This reduces memory overhead and delivers 240fps-capable performance.

**Q: Can I use Eleva with TypeScript?**

Absolutely! Eleva includes built-in TypeScript declarations (`.d.ts` files). No additional `@types` packages are needed.

**Q: Does Eleva require a build step?**

No. Eleva can be used directly via CDN without any build tools, bundlers, or transpilers. However, you can also use Eleva with bundlers like Vite, Webpack, or Rollup if you prefer.

**Q: Is Eleva suitable for large applications?**

Eleva's performance scales well—it handles 10K+ rows efficiently (via virtual scrolling), achieves 240fps rendering, and its Router/Store plugins support complex SPAs. The main consideration for large applications is ecosystem maturity: React, Vue, and Angular offer more extensive tooling, testing libraries, and community resources.

---

### Plugin Questions

**Q: Does Eleva include routing capabilities?**

Yes! Eleva includes a powerful Router plugin that provides client-side routing with navigation guards, reactive state, and component resolution. Import it from `eleva/plugins`.

**Q: What plugins are available with Eleva?**

Eleva comes with three powerful built-in plugins:
- **Attr** - ARIA, data attributes, boolean attributes
- **Router** - Client-side routing with guards and reactive state
- **Store** - Reactive state management with persistence

**Q: Can I create custom plugins for Eleva?**

Yes! Eleva has a simple plugin API. Plugins are objects with an `install(eleva, options)` method. See the [Plugin System](./plugin-system.md) guide for details.

**Q: Does the Router support nested routes?**

No. Nested route definitions (routes with a `children` property) are not supported. All routes must be defined as a flat array.

To achieve similar functionality, use **shared layouts** with flat routes:
```javascript
const routes = [
  { path: "/dashboard", component: DashboardHome, layout: DashboardLayout },
  { path: "/dashboard/settings", component: Settings, layout: DashboardLayout },
  { path: "/dashboard/users/:id", component: UserDetail, layout: DashboardLayout }
];
```

See the [Router Configuration](./plugins/router/configuration.md#nested-routes) guide for more details.

---

### Migration Questions

**Q: How do I migrate from React to Eleva?**

Migration involves:
1. Replace `useState` with Eleva's `signal()`
2. Convert JSX components to template string components
3. Replace `useEffect` with signal watchers or lifecycle hooks
4. Replace React Router with Eleva's Router plugin

See the [React Migration Guide](./migration/from-react.md) for detailed examples.

**Q: How do I migrate from Vue to Eleva?**

Migration involves:
1. Convert SFCs to Eleva component objects
2. Replace Vue's reactive/ref with Eleva's signals
3. Convert Vue Router to Eleva's Router plugin
4. Replace Vuex/Pinia with Eleva's Store plugin

See the [Vue Migration Guide](./migration/from-vue.md) for detailed examples.

**Q: How do I migrate from Alpine.js to Eleva?**

Both share a similar philosophy—lightweight, no build step. Migration involves:
1. Replace `x-data` with `setup()` + `signal()`
2. Convert `x-show`/`x-if` to ternary expressions
3. Replace `x-for` with `.map().join('')`
4. Convert `x-model` to value + `@input` pattern

See the [Alpine.js Migration Guide](./migration/from-alpine.md) for detailed examples.

---

## Testing

Eleva has a comprehensive test suite ensuring reliability and stability.

### Test Coverage

| Metric | Value |
|--------|-------|
| **Total Tests** | 1,335 |
| **Line Coverage** | 100% |
| **Function Coverage** | 100% (core) |
| **Test Runner** | Bun |

### Running Tests

```bash
# Run all tests
bun test

# Run with coverage report
bun test:coverage

# Run unit tests only
bun test test/unit

# Run performance benchmarks
bun test:benchmark

# Run prepublish checks (lint + test + build)
bun run prepublishOnly
```

### Test Structure

```
test/
├── unit/                    # Unit tests
│   ├── core/               # Core Eleva tests
│   │   └── Eleva.test.ts
│   ├── modules/            # Module tests
│   │   ├── Emitter.test.ts
│   │   ├── Renderer.test.ts
│   │   ├── Signal.test.ts
│   │   └── TemplateEngine.test.ts
│   └── plugins/            # Plugin tests
│       ├── Attr.test.ts
│       ├── Router.test.ts
│       └── Store.test.ts
└── performance/            # Performance benchmarks
    ├── fps-benchmark.test.ts
    └── js-framework-benchmark.test.ts
```

### Writing Tests

Eleva uses [Bun's built-in test runner](https://bun.sh/docs/cli/test) with a Jest-compatible API:

```typescript
import { describe, test, expect, beforeEach } from "bun:test";
import Eleva from "../../src/index.js";

describe("MyComponent", () => {
  let app: Eleva;

  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    app = new Eleva("TestApp");
  });

  test("should mount correctly", async () => {
    const component = {
      setup: ({ signal }) => ({ count: signal(0) }),
      template: (ctx) => `<div>${ctx.count.value}</div>`
    };

    const instance = await app.mount(
      document.getElementById("app")!,
      component
    );

    expect(instance).toBeTruthy();
    expect(document.body.innerHTML).toContain("0");
  });
});
```

---

## Troubleshooting

### Common Issues

#### Component Not Rendering

**Problem**: Component doesn't appear in the DOM.

**Solutions**:
1. Check your console for error messages
2. Verify the DOM element exists before mounting:
   ```javascript
   const container = document.getElementById("app");
   if (!container) {
     console.error("Container not found!");
   }
   app.mount(container, "MyComponent");
   ```
3. Ensure the component is registered before mounting

#### Signal Changes Not Updating UI

**Problem**: Signal value changes but UI doesn't update.

**Solutions**:
1. Make sure you're using `.value` to read signals in templates:
   ```javascript
   // Wrong
   template: (ctx) => `<p>${ctx.count}</p>`

   // Correct
   template: (ctx) => `<p>${ctx.count.value}</p>`
   ```
2. Verify the signal is returned from setup
3. Check that you're modifying `.value`, not the signal itself:
   ```javascript
   // Wrong
   count = 5;

   // Correct
   count.value = 5;
   ```

#### Event Handlers Not Working

**Problem**: `@click` or other event handlers don't fire.

**Solutions**:
1. Don't use `ctx.` in event handlers:
   ```javascript
   // Wrong
   @click="ctx.handleClick"

   // Correct
   @click="handleClick"
   ```
2. Ensure the function is returned from setup
3. For inline handlers, use arrow functions:
   ```javascript
   @click="() => count.value++"
   ```

#### Event Handler Executes Immediately on Render

**Problem**: Function runs when page loads instead of on click.

**Cause**: Calling the function with arguments without wrapping in arrow function.

**Solution**: Always wrap handlers with arguments in arrow functions:
```javascript
// Wrong - executes immediately during render!
@click="remove(item.id)"
@click="setCount(5)"

// Correct - executes on click
@click="() => remove(item.id)"
@click="() => setCount(5)"
```

> **Note:** Direct references work fine when no arguments are needed: `@click="handleClick"`

#### Input Value Not Updating

**Problem**: Typing in an input doesn't update the signal.

**Solutions**:
1. Use standard HTML `value` attribute (not `.value` prefix):
   ```javascript
   // Wrong (Lit-specific syntax)
   <input .value="${ctx.name.value}" />

   // Correct
   <input value="${ctx.name.value}" />
   ```
2. Ensure you have an `@input` handler:
   ```javascript
   <input
     value="${ctx.name.value}"
     @input="(e) => name.value = e.target.value"
   />
   ```

#### Code Examples Display as Evaluated Values

**Problem**: Showing code like `${x.value}` in templates displays the actual value instead of the code.

**Cause**: Template engine evaluates all `${...}` expressions.

**Solution**: Use HTML entities to escape the `$` character:
```javascript
// Wrong - gets evaluated by template engine
<code>template: `Count: ${count.value}`</code>

// Correct - displays as literal code
<code>template: `Count: &#36;{count.value}`</code>
```

| Character | HTML Entity |
|-----------|-------------|
| `$` | `&#36;` |
| `<` | `&lt;` |
| `>` | `&gt;` |

#### Props Not Passing to Children

**Problem**: Child component doesn't receive props.

**Solutions**:
1. Don't use `ctx.` in `:prop` attributes:
   ```javascript
   // Wrong
   :user="ctx.userData.value"

   // Correct
   :user="userData.value"
   ```
2. `:prop` expressions are evaluated, so primitive IDs work directly:
   ```javascript
   :postId="${post.id}"
   ```
3. Ensure the child is properly mapped in `children`:
   ```javascript
   children: {
     ".child-selector": "ChildComponent"
   }
   ```
3. Check that the selector matches elements in your template

#### Memory Leaks

**Problem**: Application becomes slow over time.

**Solutions**:
1. Clean up in `onUnmount`:
   ```javascript
   setup: ({ signal }) => {
     let interval = null;

     return {
       onMount: () => {
         interval = setInterval(() => {}, 1000);
       },
       onUnmount: () => {
         clearInterval(interval);
       }
     };
   }
   ```
2. Unsubscribe from emitter events
3. Abort pending fetch requests

> **Note:** If a parent re-render removes a child component, Eleva schedules child `onUnmount` cleanup right after the DOM patch. Treat child cleanup as potentially async in those cases.

### Debugging Tips

```javascript
// Log signal changes (watcher receives new value only)
const count = signal(0);
count.watch((newVal) => {
  console.log(`Count changed to: ${newVal}`);
});

// Debug template rendering
template: (ctx) => {
  console.log("Rendering with context:", ctx);
  return `<div>${ctx.count.value}</div>`;
}

// Check mounted instance
const instance = await app.mount(container, "MyComponent");
console.log("Mounted instance:", instance);
```

---

## API Reference

### Core API

| Method | Description | Returns |
|--------|-------------|---------|
| `new Eleva(name)` | Create app instance | `Eleva` |
| `app.component(name, def)` | Register component | `Eleva` |
| `app.mount(el, name, props?)` | Mount to DOM | `Promise<MountResult>` |
| `app.use(plugin, options?)` | Install plugin | `Eleva` or plugin result |

### Signal API

| Method | Description |
|--------|-------------|
| `signal(value)` | Create reactive state |
| `signal.value` | Read/write current value |
| `signal.watch(fn)` | Subscribe to changes |

### Emitter API

| Method | Description |
|--------|-------------|
| `emitter.on(event, fn)` | Subscribe to event |
| `emitter.off(event, fn)` | Unsubscribe from event |
| `emitter.emit(event, data)` | Emit event |

For detailed API documentation, see the individual module guides:
- [Core Concepts](./core-concepts.md)
- [Components](./components.md)
- [Plugins](./plugins/index.md)

---

## Community & Support

Join our community for support, discussions, and collaboration:

| Channel | Purpose | Link |
|---------|---------|------|
| **GitHub Discussions** | General questions, ideas | [Discussions](https://github.com/TarekRaafat/eleva/discussions) |
| **GitHub Issues** | Bug reports, feature requests | [Issues](https://github.com/TarekRaafat/eleva/issues) |
| **Stack Overflow** | Technical questions | [eleva](https://stackoverflow.com/questions/tagged/eleva), [eleva.js](https://stackoverflow.com/questions/tagged/eleva.js) |
| **Reddit** | Community projects | [r/elevajs](https://www.reddit.com/r/elevajs/) |
| **Discord** | Real-time chat | [Join](https://discord.gg/Dg7cMKpvyZ) |
| **Telegram** | Support, feedback | [Join](https://t.me/+TcMXcHsRX9tkMmI0) |

---

## Contributing

Contributions are welcome! Whether you're fixing bugs, adding features, or improving documentation, your input is invaluable.

See the [CONTRIBUTING](https://github.com/TarekRaafat/eleva/blob/master/CONTRIBUTING.md) file for guidelines.

---

## Changelog

For a detailed log of all changes and updates, please refer to the [Changelog](https://github.com/TarekRaafat/eleva/blob/master/CHANGELOG.md).

---

## License

Eleva is open-source and available under the [MIT License](https://github.com/TarekRaafat/eleva/blob/master/LICENSE).

---

[← Best Practices](./best-practices.md) | [Back to Main Docs](./index.md) | [Examples →](./examples/index.md)
