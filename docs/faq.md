---
title: Eleva.js FAQ & Troubleshooting
description: Frequently asked questions, testing guide, troubleshooting tips, and community resources for Eleva.js.
---

# FAQ & Troubleshooting

> **Version:** 1.0.0 | Answers to common questions, testing guide, and troubleshooting tips.

---

## Frequently Asked Questions

### General Questions

**Q: What is Eleva?**

Eleva is a minimalist, lightweight (6KB) pure vanilla JavaScript frontend framework. It provides React-like component-based architecture with signal-based reactivity, but without the complexity, dependencies, or mandatory build tools of larger frameworks.

**Q: Is Eleva production-ready?**

Yes! Eleva v1.0.0 is the first official stable release. The framework is production-ready with a stable API and comprehensive test coverage. We continue to welcome feedback and contributions.

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

Eleva comes with three built-in plugins:
- **Attr** - ARIA, data attributes, boolean attributes
- **Router** - Client-side routing with guards and reactive state
- **Store** - Reactive state management with persistence

**Q: Can I create custom plugins for Eleva?**

Yes! Eleva has a simple plugin API. Plugins are objects with an `install(eleva, options)` method. See the [Plugin System](./plugin-system.md) guide for details.

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
| **Total Tests** | 273 |
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
2. Ensure the child is properly mapped in `children`:
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

### Debugging Tips

```javascript
// Log signal changes
const count = signal(0);
count.watch((newVal, oldVal) => {
  console.log(`Count changed: ${oldVal} → ${newVal}`);
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
