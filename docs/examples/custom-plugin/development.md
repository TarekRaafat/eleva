---
title: Plugin Development Guide
description: Step-by-step guide to creating Eleva.js plugins - project setup, development workflow, and comprehensive testing strategies.
---

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Develop and Test an Eleva.js Plugin",
  "description": "Step-by-step guide to setting up a plugin project, creating plugin functionality, building a demo application, and writing comprehensive tests.",
  "image": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png",
  "totalTime": "PT45M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  },
  "supply": [
    {
      "@type": "HowToSupply",
      "name": "Text editor or IDE"
    },
    {
      "@type": "HowToSupply",
      "name": "Terminal/command line"
    }
  ],
  "tool": [
    {
      "@type": "HowToTool",
      "name": "Node.js (v18 or higher)"
    },
    {
      "@type": "HowToTool",
      "name": "npm (v9 or higher)"
    },
    {
      "@type": "HowToTool",
      "name": "Vite (build tool)"
    },
    {
      "@type": "HowToTool",
      "name": "Vitest (testing framework)"
    }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "name": "Set up your project",
      "text": "Create a new directory, initialize npm, install Eleva as a peer dependency, and install dev dependencies (vite, vitest, @types/node).",
      "url": "https://elevajs.com/examples/custom-plugin/development.html#step-1-set-up-your-project"
    },
    {
      "@type": "HowToStep",
      "name": "Create your plugin",
      "text": "Create src/index.js with your plugin object containing name, version, and install method. Implement your plugin's functionality inside the install function.",
      "url": "https://elevajs.com/examples/custom-plugin/development.html#step-2-create-your-plugin"
    },
    {
      "@type": "HowToStep",
      "name": "Create a demo application",
      "text": "Set up demo/index.html and demo/main.js to test your plugin during development. Import your plugin and use it with a sample Eleva component.",
      "url": "https://elevajs.com/examples/custom-plugin/development.html#step-3-create-a-demo-application"
    },
    {
      "@type": "HowToStep",
      "name": "Configure development environment",
      "text": "Create vite.config.js with build configuration for ES and UMD formats. Update package.json with scripts for dev, build, and preview.",
      "url": "https://elevajs.com/examples/custom-plugin/development.html#step-4-configure-development-environment"
    },
    {
      "@type": "HowToStep",
      "name": "Write tests for your plugin",
      "text": "Create test/plugin.test.js with comprehensive tests covering basic functionality, edge cases, registration behavior, and component integration.",
      "url": "https://elevajs.com/examples/custom-plugin/development.html#testing-your-plugin"
    }
  ]
}
</script>

# Plugin Development Guide

> **Plugin Guide** | Creating, developing, and testing Eleva plugins.

---

## Creating Your First Plugin

Let's create a simple plugin that adds logging capabilities to Eleva.

### Step 1: Set Up Your Project

```bash
# Create a new directory for your plugin
mkdir eleva-simple-logger
cd eleva-simple-logger

# Initialize npm project
npm init -y

# Install Eleva as a peer dependency
npm install eleva --save-peer

# Install development dependencies
npm install --save-dev vite vitest @types/node
```

### Step 2: Create Your Plugin

Create `src/index.js`:

```js
const Logger = {
  name: "logger",
  version: "1.0.0",
  install(eleva, options) {
    const { level = 'info', prefix = '[Eleva]' } = options || {};

    // Add logging methods to Eleva instance
    eleva.log = {
      info: (msg) => console.log(`${prefix} [INFO] ${msg}`),
      warn: (msg) => console.warn(`${prefix} [WARN] ${msg}`),
      error: (msg) => console.error(`${prefix} [ERROR] ${msg}`),
      debug: (msg) => level === 'debug' && console.debug(`${prefix} [DEBUG] ${msg}`)
    };

    // Enhance component mounting with logging
    const originalMount = eleva.mount;
    eleva.mount = async function(container, compName, props) {
      eleva.log.info(`Mounting component: ${compName}`);
      const result = await originalMount.call(this, container, compName, props);
      eleva.log.info(`Component mounted: ${compName}`);
      return result;
    };

    // Log installation
    eleva.log.info('Logger plugin installed');
  }
};

export default Logger;
```

### Step 3: Create a Demo Application

Create `demo/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Logger Plugin Demo</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/demo/main.js"></script>
  </body>
</html>
```

Create `demo/main.js`:

```js
import Eleva from 'eleva';
import Logger from '../src/index.js';

const app = new Eleva('LoggerDemo');

// Use the plugin with custom options
app.use(Logger, {
  level: 'debug',
  prefix: '[MyApp]'
});

// Create a test component
app.component('TestComponent', {
  setup: ({ signal }) => {
    const count = signal(0);
    return { count };
  },
  template: (ctx) => `
    <div>
      <h1>Logger Plugin Demo</h1>
      <p>Count: ${ctx.count.value}</p>
      <button @click="() => count.value++">Increment</button>
    </div>
  `
});

// Mount the component
app.mount(document.querySelector('#app'), 'TestComponent');
```

### Step 4: Configure Development Environment

Create `vite.config.js`:

```js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'demo',
  build: {
    lib: {
      entry: resolve(__dirname, '../src/index.js'),
      formats: ['es', 'umd'],
      name: 'ElevaLogger'
    }
  }
});
```

Update `package.json`:

```json
{
  "name": "eleva-simple-logger",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/eleva-simple-logger.umd.js",
  "module": "dist/eleva-simple-logger.es.js",
  "files": [
    "dist"
  ],
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## Plugin Development Concepts

### Core Concepts

1. **Plugin Lifecycle**
   - Installation: When the plugin is added to Eleva
   - Runtime: During application execution
   - Cleanup: When the application is destroyed

2. **Extending Eleva**
   - Adding methods to the Eleva instance
   - Creating new components
   - Modifying existing behavior
   - Adding global services

3. **Component Integration**
   - Creating reusable components
   - Managing component state
   - Handling component lifecycle

### Advanced Features

**1. State Management**
```js
install(eleva) {
  eleva.store = {
    state: new Map(),
    set(key, value) {
      this.state.set(key, value);
      eleva.emitter.emit('store:update', { key, value });
    },
    get(key) {
      return this.state.get(key);
    }
  };
}
```

**2. Middleware System**
```js
install(eleva) {
  const middlewares = [];

  eleva.useMiddleware = (middleware) => {
    middlewares.push(middleware);
  };

  const originalMount = eleva.mount;
  eleva.mount = async function(...args) {
    for (const middleware of middlewares) {
      await middleware(...args);
    }
    return originalMount.apply(this, args);
  };
}
```

**3. Plugin Composition**
```js
const ComposedPlugin = {
  name: "composed",
  version: "1.0.0",
  install(eleva, options) {
    // Use other plugins
    eleva.use(Logger, options.logger);
    eleva.use(Store, options.store);
  }
};
```

---

## Testing Your Plugin

Comprehensive testing ensures your plugin works correctly in all scenarios.

### Basic Tests

Create `test/plugin.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Eleva from 'eleva';
import Logger from '../src/index.js';

describe('Logger Plugin', () => {
  let app;

  beforeEach(() => {
    app = new Eleva('TestApp');
    app.use(Logger, { level: 'debug' });
  });

  it('should add logging methods to Eleva', () => {
    expect(app.log).toBeDefined();
    expect(app.log.info).toBeDefined();
    expect(app.log.warn).toBeDefined();
    expect(app.log.error).toBeDefined();
  });

  it('should log component mounting', async () => {
    const consoleSpy = vi.spyOn(console, 'log');

    app.component('Test', {
      template: () => '<div>Test</div>'
    });

    await app.mount(document.createElement('div'), 'Test');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Mounting component: Test')
    );
  });
});
```

### Testing Edge Cases

```js
describe('Logger Plugin - Edge Cases', () => {
  it('should work without options', () => {
    const app = new Eleva('TestApp');

    // Should not throw
    expect(() => app.use(Logger)).not.toThrow();
    expect(app.log).toBeDefined();
  });

  it('should use default options when none provided', () => {
    const app = new Eleva('TestApp');
    app.use(Logger);

    const consoleSpy = vi.spyOn(console, 'log');
    app.log.info('test message');

    // Default prefix is '[Eleva]'
    expect(consoleSpy).toHaveBeenCalledWith('[Eleva] [INFO] test message');
  });

  it('should handle invalid options gracefully', () => {
    const app = new Eleva('TestApp');

    // Should not throw with invalid option types
    expect(() => app.use(Logger, { level: 123 })).not.toThrow();
  });

  it('should not break if used before any components', () => {
    const app = new Eleva('TestApp');
    app.use(Logger);

    // Should work even with no components registered
    expect(() => app.log.info('early log')).not.toThrow();
  });
});
```

### Testing Registration

```js
describe('Plugin Registration', () => {
  it('should throw if plugin has no install method', () => {
    const app = new Eleva('TestApp');
    const invalidPlugin = { name: 'invalid', version: '1.0.0' };

    expect(() => app.use(invalidPlugin)).toThrow();
  });

  it('should return the install result', () => {
    const app = new Eleva('TestApp');
    const pluginWithReturn = {
      name: 'returner',
      version: '1.0.0',
      install: (eleva) => ({ api: 'value' })
    };

    const result = app.use(pluginWithReturn);
    expect(result).toEqual({ api: 'value' });
  });

  it('should pass options to install', () => {
    const app = new Eleva('TestApp');
    const installSpy = vi.fn();
    const plugin = {
      name: 'spy',
      version: '1.0.0',
      install: installSpy
    };

    app.use(plugin, { custom: 'option' });

    expect(installSpy).toHaveBeenCalledWith(app, { custom: 'option' });
  });
});
```

### Testing with Components

```js
describe('Plugin Integration with Components', () => {
  it('should be accessible in component setup', async () => {
    const app = new Eleva('TestApp');
    app.use(Logger);

    let loggerAccessed = false;

    app.component('TestComp', {
      setup: () => {
        loggerAccessed = app.log !== undefined;
        return {};
      },
      template: () => '<div>Test</div>'
    });

    await app.mount(document.createElement('div'), 'TestComp');
    expect(loggerAccessed).toBe(true);
  });
});
```

---

## Project Structure

```
eleva-my-plugin/
├── src/
│   ├── index.js          # Main plugin file
│   └── index.d.ts        # TypeScript declarations
├── test/
│   └── plugin.test.js    # Test suite
├── demo/
│   ├── index.html        # Demo HTML
│   └── main.js           # Demo app
├── dist/                  # Built files
├── package.json
├── vite.config.js
└── README.md
```

---

[← Overview](./index.md) | [Best Practices →](./best-practices.md)
