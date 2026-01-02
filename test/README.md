# Eleva.js Test Suite

Comprehensive tests for the Eleva.js framework using **Bun's native test runner**.

## Directory Structure

```
test/
├── setup.ts              # Global test setup (DOM environment)
├── utils.ts              # Test utilities and fixtures
├── helpers/
│   └── performance.ts    # Performance measurement utilities
│
├── unit/                 # Unit tests (source code)
│   ├── core/
│   │   └── Eleva.test.ts
│   ├── modules/
│   │   ├── Emitter.test.ts
│   │   ├── Renderer.test.ts
│   │   ├── Signal.test.ts
│   │   └── TemplateEngine.test.ts
│   └── plugins/
│       ├── Attr.test.ts
│       ├── Props.test.ts
│       ├── Router.test.ts
│       └── Store.test.ts
│
├── integration/          # Integration tests (dist bundle)
│   └── bundle.test.ts
│
├── performance/          # Performance benchmarks
│   ├── Eleva.performance.test.ts
│   ├── Emitter.performance.test.ts
│   ├── Renderer.performance.test.ts
│   ├── Signal.performance.test.ts
│   ├── TemplateEngine.performance.test.ts
│   └── bundle-load.perf.test.ts
│
└── __results__/          # Generated test results
    └── performance/
```

## Running Tests

### All Tests
```bash
bun test                  # Run all tests
bun run test:all          # Same as above
```

### Unit Tests
```bash
bun run test:unit         # All unit tests
bun run test:core         # Core + modules only
bun run test:plugins      # Plugins only
```

### Integration Tests
```bash
bun run test:integration  # Test the production bundle
```

### Performance Tests
```bash
bun run test:performance  # Performance benchmarks
```

### With Coverage
```bash
bun run test:coverage     # Run with coverage report
```

### Watch Mode
```bash
bun run test:watch        # Re-run on file changes
```

## Test Configuration

Tests are configured in `bunfig.toml`:

```toml
[test]
preload = ["./test/setup.ts"]
timeout = 30000
coverage = true
coverageDir = "./test/coverage"
```

## Test Environment

- **DOM**: Uses `@happy-dom/global-registrator` for DOM simulation
- **Preload**: `test/setup.ts` registers the DOM environment globally
- **TypeScript**: All tests written in TypeScript

## Writing Tests

### Basic Test Pattern
```typescript
import { describe, test, expect, beforeEach, mock } from "bun:test";
import { Signal } from "../../../src/modules/Signal.js";

describe("Signal", () => {
  test("creates a signal with initial value", () => {
    const signal = new Signal(42);
    expect(signal.value).toBe(42);
  });

  test("triggers watchers on change", async () => {
    const signal = new Signal(0);
    const callback = mock(() => {});

    signal.watch(callback);
    signal.value = 5;

    await Promise.resolve();
    expect(callback).toHaveBeenCalledWith(5);
  });
});
```

### Component Test Pattern
```typescript
import { describe, test, expect, beforeEach } from "bun:test";
import { Eleva } from "../../../src/core/Eleva.js";

describe("Component", () => {
  let app: any;
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    container = document.getElementById("app")!;
    app = new Eleva("TestApp");
  });

  test("mounts and renders", async () => {
    app.component("my-component", {
      setup: ({ signal }) => ({ count: signal(0) }),
      template: (ctx) => `<div>${ctx.count.value}</div>`,
    });

    await app.mount(container, "my-component");
    expect(container.innerHTML).toContain("0");
  });
});
```

### Performance Test Pattern
```typescript
import { describe, test, expect } from "bun:test";

describe("Performance", () => {
  test("completes within budget", () => {
    const start = performance.now();

    // ... operation to benchmark ...

    const duration = performance.now() - start;
    console.log(`Duration: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(100); // 100ms budget
  });
});
```

## Test Utilities

### `test/utils.ts`
```typescript
// Create a DOM fixture
const fixture = createFixture("my-fixture", "<div>content</div>");

// Clean up fixtures
cleanupFixtures();

// Flush promises (for async updates)
await flushPromises();
```

### `test/helpers/performance.ts`
```typescript
// Measure single operation
const { duration, result } = measurePerformance(() => {
  return someOperation();
});

// Measure multiple runs
const metrics = measureMultipleRuns(() => operation(), 10);
console.log(metrics.average, metrics.stdDev);

// Measure memory usage
const { peakMemoryKB } = measureMemoryUsage(() => operation());
```

## Coverage

Coverage reports are generated in `test/coverage/`. View the HTML report:

```bash
bun run test:coverage
open test/coverage/index.html
```

## CI/CD

Tests run automatically on:
- Pull requests
- Pushes to main branch

Coverage is uploaded to Codecov:
```bash
bun run codecov
```
