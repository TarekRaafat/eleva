# Eleva.js Test Suite

This directory contains comprehensive tests for the Eleva.js framework, ensuring reliability, stability, and performance of the core functionality and modules.

## 📁 Test Structure

The test suite is organized into logical categories to maintain clarity and facilitate targeted testing:

```
test/
├── source/              # Source test files
│   ├── unit/            # Unit tests for individual components
│   │   ├── core/        # Tests for core functionality
│   │   └── modules/     # Tests for individual modules
│   │       ├── Emitter.test.js
│   │       ├── Renderer.test.js
│   │       ├── Signal.test.js
│   │       └── TemplateEngine.test.js
│   ├── performance/     # Performance benchmarks
│   ├── setup/           # Test utilities and setup files
│   ├── coverage/        # Test coverage reports
│   └── reports/         # Test execution reports
└── build/               # Compiled test files
```

## 🚀 Running Tests

The test suite supports both source and build testing, with various options for different testing scenarios:

### Source Tests
```bash
# Run all source tests
npm run test:source

# Run source unit tests
npm run test:source:unit

# Run source performance tests
npm run test:source:performance

# Run source tests with coverage
npm run test:source:coverage

# Run source tests in watch mode
npm run test:source:watch

# Debug source tests
npm run test:source:debug
```

### Build Tests
```bash
# Run all build tests
npm run test:build

# Run build unit tests
npm run test:build:unit

# Run build performance tests
npm run test:build:performance

# Run build tests with coverage
npm run test:build:coverage

# Run build tests in watch mode
npm run test:build:watch

# Debug build tests
npm run test:build:debug
```

### Combined Testing
```bash
# Run all tests (both source and build)
npm test

# Run tests with coverage and upload to Codecov
npm run codecov
```

## 🔧 Test Configuration

The test suite uses two separate Jest configurations:

1. `jest.source.config.js` - For testing source files
2. `jest.build.config.js` - For testing compiled files

Key features of the test environment:
- Uses `jest-environment-jsdom` for DOM testing
- HTML reporters for better test visualization
- Watch mode with typeahead support
- Coverage reporting with Codecov integration
- Separate configurations for source and build testing

## 🧪 Test Environment

The test environment is configured with:

- **JSDOM**: For DOM manipulation testing
- **Babel**: For modern JavaScript features
- **TypeScript**: For type checking
- **ESLint**: For code quality
- **Prettier**: For code formatting

### Test Utilities

The test suite provides several utilities to help with testing:

```javascript
// Create a mock DOM environment
const { createDomEnvironment } = require('../setup/test-utils');
const { dom, cleanup } = createDomEnvironment();

// Create component fixtures
const { createComponentFixture } = require('../setup/component-fixtures');
const counterComponent = createComponentFixture({
  name: 'counter',
  initialState: { count: 0 },
  template: ctx => `<div>${ctx.count}</div>`
});

// Mock event handlers
const { mockEventHandler } = require('../setup/event-utils');
const handler = mockEventHandler();
element.addEventListener('click', handler);
```

## 📝 Writing Tests for Eleva.js

### Test File Structure

Each test file should follow this general structure:

```javascript
/**
 * @fileoverview Tests for the [Module] of the Eleva framework
 *
 * These tests verify [key functionality]...
 *
 * @author [Your Name]
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 * @requires module:eleva/[path/to/module]
 * @category Unit|Performance
 * @group [functional group]
 */

import { ModuleName } from "../../../../src/modules/ModuleName.js";

/**
 * Tests for [specific aspect of functionality]
 *
 * @group [functional group]
 */
describe("ModuleName", () => {
  // Setup code
  let instance;
  
  beforeEach(() => {
    // Initialize test environment
    instance = new ModuleName();
  });
  
  /**
   * Tests [specific behavior]
   *
   * Verifies:
   * - [Verification point 1]
   * - [Verification point 2]
   *
   * @group [sub-group]
   */
  test("specific behavior works correctly", () => {
    // Arrange
    const input = "test";
    
    // Act
    const result = instance.method(input);
    
    // Assert
    expect(result).toBe("expected output");
  });
});
```

### Test Categories

When writing tests, tag them appropriately with `@group` tags to facilitate filtering and organization:

```javascript
/**
 * @group core         // Core framework functionality
 * @group modules      // Module-specific tests
 * @group rendering    // Rendering and DOM manipulation
 * @group reactivity   // Reactive state management
 * @group performance  // Performance benchmarks
 * @group edge-cases   // Edge case handling
 * @group error-handling // Error conditions
 */
```

### Best Practices for Testing Eleva.js

#### 1. Test Isolation

Each test should be independent of other tests. This is achieved by:

- Using `beforeEach` to set up a fresh test environment
- Cleaning up DOM elements after tests
- Avoiding shared state between tests

```javascript
beforeEach(() => {
  document.body.innerHTML = `<div id="app"></div>`;
  appContainer = document.getElementById("app");
  app = new Eleva("TestApp");
});

afterEach(() => {
  document.body.innerHTML = '';
});
```

#### 2. Testing Reactivity

When testing reactive components, remember that updates are often asynchronous:

```javascript
test("signal value change triggers watcher", async () => {
  const signal = new Signal(0);
  const callback = jest.fn();
  
  signal.watch(callback);
  signal.value = 10;
  
  // Wait for the update to process
  await Promise.resolve();
  
  expect(callback).toHaveBeenCalledWith(10);
});
```

#### 3. Testing DOM Updates

When testing DOM updates, verify the actual DOM state rather than implementation details:

```javascript
test("component renders correctly", async () => {
  const component = {
    setup: ({ signal }) => ({ count: signal(0) }),
    template: (ctx) => `<div>${ctx.count.value}</div>`
  };
  
  app.component("counter", component);
  await app.mount(appContainer, "counter");
  
  expect(appContainer.innerHTML).toContain("<div>0</div>");
});
```

#### 4. Performance Testing

Performance tests should:

- Set clear benchmarks with reasonable thresholds
- Measure key operations that impact user experience
- Avoid timing variability from environmental factors

```javascript
test("template parser is fast for large templates", () => {
  const items = Array(1000).fill().map((_, i) => ({ id: i }));
  const template = items.map(i => `<div>{{ items[${i.id}].id }}</div>`).join("");
  
  const start = performance.now();
  TemplateEngine.parse(template, { items });
  const end = performance.now();
  
  expect(end - start).toBeLessThan(50); // Under 50ms
});
```

#### 5. Edge Cases

Test edge cases thoroughly, especially for:

- Empty or null inputs
- Boundary conditions
- Error states
- Circular references
- Extreme values

```javascript
describe("Signal edge cases", () => {
  test("handles undefined initial value", () => {
    const signal = new Signal();
    expect(signal.value).toBeUndefined();
  });

  test("handles circular references", () => {
    const obj = {};
    obj.self = obj;
    const signal = new Signal(obj);
    
    expect(() => signal.watch(() => {})).not.toThrow();
  });
});
```

## 📋 Test Coverage

The test suite aims to maintain high coverage of the codebase to ensure reliability and stability:

- **Statements**: Target > 95%
- **Branches**: Target > 90%
- **Functions**: Target > 95%
- **Lines**: Target > 95%

Coverage reports are generated in the `source/coverage` directory after running tests with the `--coverage` flag.

### Coverage Reporting

The project uses Codecov for coverage reporting:
- Coverage reports are automatically uploaded to Codecov
- Use `npm run codecov` to manually upload coverage reports
- Coverage thresholds are enforced in CI/CD

### Interpreting Coverage Reports

- Browse the HTML coverage report in `source/coverage/index.html`
- Look for uncovered branches and edge cases
- Prioritize testing critical paths and user-facing features
- Coverage reports are also available in the `reports` directory

## 🔍 Debugging Tests

When tests fail, you can use these debugging tools:

1. **Debug Mode**
   ```bash
   # Debug source tests
   npm run test:source:debug
   
   # Debug build tests
   npm run test:build:debug
   ```
   Debug mode runs tests in sequence with no caching for better debugging experience.

2. **Watch Mode with Typeahead**
   ```bash
   # Watch source tests
   npm run test:source:watch
   
   # Watch build tests
   npm run test:build:watch
   ```
   Watch mode provides interactive filtering and typeahead support.

3. **HTML Reports**
   - Check the `reports` directory for detailed HTML test reports
   - Reports include test results, coverage information, and failure details

4. **Common Debugging Steps**
   - Run the specific failing test in isolation
   - Use `console.log` or debugger statements to trace execution
   - Check for asynchronous operations that might need `await`
   - Examine the test environment setup
   - Look for side effects from other tests
   - Check if DOM elements are properly cleaned up between tests

## 🔄 Continuous Integration

The test suite is integrated with CI/CD pipelines:

- Tests run on every pull request
- Coverage reports are uploaded to Codecov
- Both source and build tests are executed
- Code quality checks are enforced
- Size limits are verified
- Performance benchmarks are tracked over time

## 🤝 Contributing Tests

When contributing new tests:

1. Follow the existing file structure and naming conventions
2. Include comprehensive JSDoc documentation
3. Test both normal operation and edge cases
4. Ensure tests are isolated and don't depend on other tests
5. Verify your tests pass consistently, not just occasionally
6. For performance tests, ensure thresholds are reasonable across environments
7. Use the provided test utilities and fixtures
8. Follow the established test categories and grouping

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing DOM Manipulation](https://jestjs.io/docs/tutorial-jquery)
- [Eleva.js Documentation](https://elevajs.com)
- [Performance Testing Best Practices](https://web.dev/metrics/)
- [Codecov Documentation](https://docs.codecov.io/docs)

---

By maintaining comprehensive tests, we ensure Eleva.js remains reliable, efficient, and robust across all use cases.