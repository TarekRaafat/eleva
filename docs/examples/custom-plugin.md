# Creating a Custom Plugin for Eleva

This comprehensive guide will walk you through creating, testing, and publishing plugins for Eleva. Whether you're building a simple utility or a complex feature set, this guide covers everything you need to know.

## Table of Contents
- [Creating a Custom Plugin for Eleva](#creating-a-custom-plugin-for-eleva)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Plugin Basics](#plugin-basics)
  - [Creating Your First Plugin](#creating-your-first-plugin)
    - [Step 1: Set Up Your Project](#step-1-set-up-your-project)
    - [Step 2: Create Your Plugin](#step-2-create-your-plugin)
    - [Step 3: Create a Demo Application](#step-3-create-a-demo-application)
    - [Step 4: Configure Development Environment](#step-4-configure-development-environment)
  - [Plugin Development](#plugin-development)
    - [Core Concepts](#core-concepts)
    - [Advanced Features](#advanced-features)
  - [Testing Your Plugin](#testing-your-plugin)
  - [Publishing Your Plugin](#publishing-your-plugin)
  - [Best Practices](#best-practices)
  - [TypeScript Support](#typescript-support)
  - [Next Steps](#next-steps)

## Prerequisites

Before you start, ensure you have:
- Node.js (v18 or higher)
- npm (v9 or higher)
- Basic understanding of JavaScript/TypeScript
- Familiarity with Eleva's core concepts

## Plugin Basics

An Eleva plugin is a JavaScript object that extends the framework's functionality. Every plugin must have:

1. A unique `name` property
2. An `install` method that receives the Eleva instance and options

```js
const MyPlugin = {
  name: 'myPlugin',
  install(eleva, options) {
    // Plugin implementation
  }
};
```

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
  name: 'logger',
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

## Plugin Development

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

1. **State Management**
```js
install(eleva) {
  eleva.store = {
    state: new Map(),
    set(key, value) {
      this.state.set(key, value);
      eleva.emit('store:update', { key, value });
    },
    get(key) {
      return this.state.get(key);
    }
  };
}
```

2. **Middleware System**
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

3. **Plugin Composition**
```js
const ComposedPlugin = {
  name: 'composed',
  install(eleva, options) {
    // Use other plugins
    eleva.use(Logger, options.logger);
    eleva.use(Store, options.store);
  }
};
```

## Testing Your Plugin

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

## Publishing Your Plugin

1. **Prepare for Publishing**
   ```bash
   # Build your plugin
   npm run build
   
   # Test the build
   npm run preview
   ```

2. **Publish to npm**
   ```bash
   # Login to npm
   npm login
   
   # Publish your plugin
   npm publish
   ```

3. **Documentation**
   Create a README.md with:
   - Installation instructions
   - Usage examples
   - API documentation
   - Configuration options
   - Contributing guidelines

## Best Practices

1. **Naming and Organization**
   - Use the `eleva-` prefix for published plugins
   - Follow semantic versioning
   - Maintain a clear project structure

2. **Error Handling**
   ```js
   install(eleva) {
     try {
       // Plugin implementation
     } catch (error) {
       console.error('Plugin installation failed:', error);
       throw error;
     }
   }
   ```

3. **Performance**
   - Lazy load heavy features
   - Clean up resources properly
   - Use efficient data structures

4. **Security**
   - Validate user input
   - Sanitize data
   - Follow security best practices

## TypeScript Support

Create `src/index.d.ts`:

```typescript
import Eleva from 'eleva';

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

export interface LoggerOptions {
  level?: 'info' | 'warn' | 'error' | 'debug';
  prefix?: string;
}

export default Logger;
```

## Next Steps

- Join the [Eleva community](https://github.com/TarekRaafat/eleva/discussions)
- Share your plugins
- Contribute to the ecosystem
- Check out the [official plugins](../plugins/index.md) for inspiration

Remember: The best plugins are those that solve real problems while maintaining Eleva's philosophy of simplicity and performance.

---

[← Back to Examples](./index.md) | [Previous: Simple Blog](./apps/blog.md)
