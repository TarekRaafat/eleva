---
title: Plugin Best Practices
description: Eleva.js plugin best practices - error handling, edge cases, TypeScript support, and publishing to npm.
---

<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-S4L689921Q"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", "G-S4L689921Q");
</script>

# Plugin Best Practices

> **Plugin Guide** | Best practices for robust, maintainable plugins.

---

## Error Handling

Robust error handling ensures plugins fail gracefully and provide meaningful feedback:

```js
const RobustPlugin = {
  name: "robust",
  version: "1.0.0",
  install(eleva, options = {}) {
    // Validate required options
    if (options.apiKey && typeof options.apiKey !== "string") {
      throw new Error("[RobustPlugin] apiKey must be a string");
    }

    // Validate Eleva instance has required features
    if (typeof eleva.mount !== "function") {
      throw new Error("[RobustPlugin] Invalid Eleva instance");
    }

    // Warn about deprecated options (don't throw)
    if (options.legacyMode !== undefined) {
      console.warn("[RobustPlugin] legacyMode is deprecated, use modernMode instead");
    }

    // Safe method wrapping with error boundaries
    const originalMount = eleva.mount.bind(eleva);
    eleva.mount = async function(...args) {
      try {
        return await originalMount(...args);
      } catch (error) {
        console.error("[RobustPlugin] Mount failed:", error);
        throw error;  // Re-throw to maintain expected behavior
      }
    };

    // Add methods with built-in error handling
    eleva.robust = {
      safeOperation: (data) => {
        try {
          if (!data) {
            console.warn("[RobustPlugin] safeOperation called with no data");
            return null;
          }
          return processData(data);
        } catch (error) {
          console.error("[RobustPlugin] safeOperation failed:", error);
          return null;  // Return safe default
        }
      }
    };
  }
};
```

### Error Handling Checklist

| Scenario | Action |
|----------|--------|
| Invalid required options | Throw descriptive error |
| Invalid optional options | Use defaults, optionally warn |
| Deprecated options | Warn but continue |
| Runtime errors in plugin methods | Catch, log, return safe default |
| Runtime errors in wrapped methods | Catch, log, re-throw |
| Missing Eleva features | Throw or gracefully degrade |

---

## Edge Cases

Handle these common edge cases in your plugin:

```js
const EdgeCasePlugin = {
  name: "edgeCase",
  version: "1.0.0",
  _installed: false,  // Track installation state

  install(eleva, options = {}) {
    // Prevent duplicate installation
    if (this._installed) {
      console.warn("[EdgeCasePlugin] Already installed, skipping");
      return eleva.edgeCase;  // Return existing instance
    }

    // Handle missing optional dependencies gracefully
    const hasStore = typeof eleva.store !== "undefined";
    if (!hasStore && options.useStore) {
      console.warn("[EdgeCasePlugin] Store plugin not found, some features disabled");
    }

    // Set defaults for all options
    const config = {
      enabled: options.enabled ?? true,
      maxItems: options.maxItems ?? 100,
      debug: options.debug ?? false,
      ...options
    };

    // Validate option ranges
    if (config.maxItems < 1 || config.maxItems > 10000) {
      console.warn("[EdgeCasePlugin] maxItems out of range (1-10000), using default");
      config.maxItems = 100;
    }

    eleva.edgeCase = {
      config,
      // Methods can check enabled state
      doSomething: () => {
        if (!config.enabled) return;
        // ... implementation
      }
    };

    this._installed = true;
    return eleva.edgeCase;
  },

  // Optional: uninstall support
  uninstall(eleva) {
    if (!this._installed) return;
    delete eleva.edgeCase;
    this._installed = false;
  }
};
```

---

## Naming and Organization

- Use the `eleva-` prefix for published plugins (e.g., `eleva-router`, `eleva-store`)
- Follow semantic versioning
- Maintain a clear project structure:

```
eleva-my-plugin/
├── src/
│   ├── index.js          # Main plugin export
│   ├── index.d.ts        # TypeScript declarations
│   └── utils.js          # Internal utilities
├── test/
│   └── plugin.test.js    # Test suite
├── demo/
│   ├── index.html
│   └── main.js
├── dist/                  # Built files
├── package.json
├── vite.config.js
└── README.md
```

---

## Performance

- **Lazy load heavy features** - Don't load everything at install time
- **Clean up resources properly** - Implement `uninstall` if needed
- **Use efficient data structures** - Map/Set over arrays for lookups

```js
install(eleva, options) {
  // Lazy load heavy features
  let heavyModule = null;

  eleva.myPlugin = {
    getHeavyFeature: async () => {
      if (!heavyModule) {
        heavyModule = await import('./heavy-feature.js');
      }
      return heavyModule;
    }
  };
}
```

---

## Cleanup Best Practices

Always implement `uninstall()` when your plugin:
- Wraps existing Eleva methods (like `mount`, `component`, etc.)
- Adds properties to the Eleva instance
- Creates event listeners or timers
- Allocates external resources

### Complete Cleanup Pattern

```js
const CleanablePlugin = {
  name: "cleanable",
  version: "1.0.0",

  install(eleva, options = {}) {
    // 1. Store originals with namespaced keys
    const originalMount = eleva.mount;
    eleva._cleanable_originalMount = originalMount;

    // 2. Wrap methods
    eleva.mount = async function(...args) {
      console.log("Enhanced mount");
      return originalMount.call(this, ...args);
    };

    // 3. Add properties
    eleva.cleanable = {
      config: options,
      doSomething: () => { /* ... */ }
    };

    // 4. Track installation
    this._installed = true;
  },

  uninstall(eleva) {
    // Guard against double uninstall
    if (!this._installed) return;

    // 1. Restore wrapped methods
    if (eleva._cleanable_originalMount) {
      eleva.mount = eleva._cleanable_originalMount;
      delete eleva._cleanable_originalMount;
    }

    // 2. Remove added properties
    delete eleva.cleanable;

    // 3. Remove from plugin registry
    if (eleva.plugins) {
      eleva.plugins.delete(this.name);
    }

    // 4. Reset installation state
    this._installed = false;
  }
};
```

### Cleanup Checklist

| Resource Type | Store For Cleanup | Cleanup Action |
|---------------|-------------------|----------------|
| Wrapped methods | `eleva._pluginName_originalMethod` | Restore original |
| Added properties | N/A | `delete eleva.property` |
| Event listeners | Store unsubscribe function | Call unsubscribe |
| Timers | Store timer ID | `clearTimeout/clearInterval` |
| Plugin registry | N/A | `eleva.plugins.delete(name)` (if you added metadata) |

### Uninstall Order (LIFO)

If multiple plugins wrap the same methods, uninstall in **reverse order**:

```js
// Install order
app.use(PluginA);  // First
app.use(PluginB);  // Second (wraps PluginA's wrapper)

// Uninstall in reverse
PluginB.uninstall(app);  // Remove outer wrapper first
PluginA.uninstall(app);  // Then inner wrapper
```

> **Note:** See the [Plugin System documentation](../../plugin-system.md#plugin-vs-component-cleanup) for how plugin cleanup differs from component cleanup.

---

## Security

- Validate user input
- Sanitize data before DOM insertion
- Avoid `eval()` and `innerHTML` with untrusted data

```js
eleva.myPlugin = {
  // Bad: vulnerable to XSS
  renderBad: (content) => {
    container.innerHTML = content;
  },

  // Good: sanitize or use textContent
  renderGood: (content) => {
    container.textContent = content;
  }
};
```

---

## TypeScript Support

Create `src/index.d.ts`:

```typescript
import Eleva from 'eleva';

// Plugin interface - every plugin must implement this
export interface ElevaPlugin<TOptions = Record<string, unknown>> {
  /** Unique plugin identifier */
  name: string;
  /** Semantic version string */
  version: string;
  /** Called when plugin is registered via app.use() */
  install(eleva: Eleva, options?: TOptions): void | unknown;
  /** Optional cleanup when plugin is removed */
  uninstall?(eleva: Eleva): void;
}

// Extend Eleva interface with plugin features
declare module 'eleva' {
  interface Eleva {
    log: {
      info(message: string): void;
      warn(message: string): void;
      error(message: string): void;
      debug(message: string): void;
    };
  }
}

// Plugin-specific options
export interface LoggerOptions {
  level?: 'info' | 'warn' | 'error' | 'debug';
  prefix?: string;
}

// Typed plugin export
declare const Logger: ElevaPlugin<LoggerOptions>;
export default Logger;
```

### Implementing a Typed Plugin

```typescript
import type { ElevaPlugin } from './index';

interface MyPluginOptions {
  debug?: boolean;
  maxItems?: number;
}

const MyPlugin: ElevaPlugin<MyPluginOptions> = {
  name: "myPlugin",
  version: "1.0.0",
  install(eleva, options = {}) {
    const { debug = false, maxItems = 100 } = options;
    // TypeScript will enforce correct option types
    eleva.myPlugin = { debug, maxItems };
  }
};

export default MyPlugin;
```

---

## Publishing Your Plugin

### 1. Prepare for Publishing

```bash
# Build your plugin
npm run build

# Test the build
npm run preview
```

### 2. Publish to npm

```bash
# Login to npm
npm login

# Publish your plugin
npm publish
```

### 3. Documentation

Create a README.md with:
- Installation instructions
- Usage examples
- API documentation
- Configuration options
- Contributing guidelines

### Example README Structure

```markdown
# eleva-my-plugin

A plugin for Eleva that does X.

## Installation

\`\`\`bash
npm install eleva-my-plugin
\`\`\`

## Usage

\`\`\`js
import Eleva from 'eleva';
import MyPlugin from 'eleva-my-plugin';

const app = new Eleva('MyApp');
app.use(MyPlugin, { option: 'value' });
\`\`\`

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `option` | `string` | `''` | Description |

## API

### `app.myPlugin.method()`

Description of method.

## License

MIT
```

---

## Quick Reference Checklist

| Category | Checklist Item |
|----------|----------------|
| **Structure** | Has `name`, `version`, and `install` |
| **Options** | Validates required options, defaults optional ones |
| **Errors** | Throws descriptive errors for critical failures |
| **Warnings** | Warns (doesn't throw) for non-critical issues |
| **Cleanup** | Implements `uninstall` if resources need cleanup |
| **TypeScript** | Includes `.d.ts` type declarations |
| **Testing** | Has tests for happy path and edge cases |
| **Docs** | README with installation, usage, and API |

---

## Next Steps

- Join the [Eleva community](https://github.com/TarekRaafat/eleva/discussions)
- Share your plugins
- Contribute to the ecosystem
- Check out the [official plugins](../../plugins/index.md) for inspiration

Remember: The best plugins are those that solve real problems while maintaining Eleva's philosophy of simplicity and performance.

---

[← Development Guide](./development.md) | [Back to Overview](./index.md)
