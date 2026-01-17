---
title: Resilience Patterns
description: Eleva.js async patterns for request cancellation, timeouts, retries, and error handling.
---

# Resilience Patterns

> **Version:** 1.0.1 | Handle network failures gracefully with cancellation, timeouts, and retry strategies.

---

## Request Cancellation

Cancel pending requests when component unmounts or when a new request supersedes the previous one. This prevents race conditions and memory leaks.

### AbortController Pattern

```javascript
app.component("CancellableSearch", {
  setup({ signal }) {
    const query = signal("");
    const results = signal([]);
    const loading = signal(false);
    const error = signal(null);

    // Store the current AbortController
    let abortController = null;

    async function search(searchQuery) {
      // Cancel any pending request
      if (abortController) {
        abortController.abort();
      }

      if (!searchQuery.trim()) {
        results.value = [];
        return;
      }

      // Create new AbortController for this request
      abortController = new AbortController();
      loading.value = true;
      error.value = null;

      try {
        const response = await fetch(
          `https://api.example.com/search?q=${encodeURIComponent(searchQuery)}`,
          { signal: abortController.signal }  // Pass abort signal to fetch
        );

        if (!response.ok) throw new Error("Search failed");
        results.value = await response.json();
      } catch (err) {
        // Don't treat abort as an error
        if (err.name === "AbortError") {
          console.log("Request cancelled");
          return;
        }
        error.value = err.message;
        results.value = [];
      } finally {
        loading.value = false;
      }
    }

    // Cleanup on unmount
    function cleanup() {
      if (abortController) {
        abortController.abort();
      }
    }

    return {
      query,
      results,
      loading,
      error,
      search,
      onUnmount: cleanup
    };
  },
  template: (ctx) => `
    <div>
      <input
        type="text"
        value="${ctx.query.value}"
        @input="(e) => { query.value = e.target.value; search(e.target.value); }"
        placeholder="Search..."
      />
      ${ctx.loading.value ? `<p>Searching...</p>` :
        ctx.error.value ? `<p class="error">${ctx.error.value}</p>` :
        `<ul>${ctx.results.value.map(r => `<li key="${r.id}">${r.name}</li>`).join("")}</ul>`
      }
    </div>
  `
});
```

### Cancellation on Component Unmount

Always cancel pending requests when a component unmounts:

```javascript
app.component("UserProfile", {
  setup({ signal, props }) {
    const user = signal(null);
    const loading = signal(true);
    let abortController = new AbortController();

    async function fetchUser() {
      try {
        const response = await fetch(`/api/users/${props.userId}`, {
          signal: abortController.signal
        });
        user.value = await response.json();
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch user:", err);
        }
      } finally {
        loading.value = false;
      }
    }

    return {
      user,
      loading,
      onMount: fetchUser,
      onUnmount: () => abortController.abort()  // Cancel on unmount
    };
  },
  template: (ctx) => `
    ${ctx.loading.value ? `<p>Loading...</p>` :
      ctx.user.value ? `<h1>${ctx.user.value.name}</h1>` :
      `<p>User not found</p>`
    }
  `
});
```

---

## Timeout Handling

Set timeouts for slow requests to improve user experience.

### Fetch with Timeout

```javascript
// Utility function: fetch with timeout
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw err;
  }
}

// Usage in component
app.component("TimedRequest", {
  setup({ signal }) {
    const data = signal(null);
    const loading = signal(false);
    const error = signal(null);

    async function loadData() {
      loading.value = true;
      error.value = null;

      try {
        const response = await fetchWithTimeout(
          "https://api.example.com/slow-endpoint",
          {},
          5000  // 5 second timeout
        );
        data.value = await response.json();
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    }

    return { data, loading, error, loadData, onMount: loadData };
  },
  template: (ctx) => `
    <div>
      ${ctx.loading.value ? `<p>Loading (timeout: 5s)...</p>` :
        ctx.error.value ? `
          <div class="error">
            <p>${ctx.error.value}</p>
            <button @click="loadData">Retry</button>
          </div>
        ` :
        `<pre>${JSON.stringify(ctx.data.value, null, 2)}</pre>`
      }
    </div>
  `
});
```

### Progressive Timeout with Retry

```javascript
app.component("RobustFetch", {
  setup({ signal }) {
    const data = signal(null);
    const loading = signal(false);
    const error = signal(null);
    const attempt = signal(0);

    async function fetchWithRetry(url, maxRetries = 3) {
      const timeouts = [5000, 10000, 15000];  // Increasing timeouts

      for (let i = 0; i < maxRetries; i++) {
        attempt.value = i + 1;

        try {
          const response = await fetchWithTimeout(url, {}, timeouts[i]);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return await response.json();
        } catch (err) {
          console.warn(`Attempt ${i + 1} failed:`, err.message);

          if (i === maxRetries - 1) throw err;

          // Wait before retry (exponential backoff)
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
        }
      }
    }

    async function loadData() {
      loading.value = true;
      error.value = null;

      try {
        data.value = await fetchWithRetry("https://api.example.com/data");
      } catch (err) {
        error.value = `Failed after ${attempt.value} attempts: ${err.message}`;
      } finally {
        loading.value = false;
      }
    }

    return { data, loading, error, attempt, loadData, onMount: loadData };
  },
  template: (ctx) => `
    <div>
      ${ctx.loading.value ? `
        <p>Loading... (attempt ${ctx.attempt.value}/3)</p>
      ` : ctx.error.value ? `
        <div class="error">
          <p>${ctx.error.value}</p>
          <button @click="loadData">Retry</button>
        </div>
      ` : `
        <div>Success!</div>
      `}
    </div>
  `
});
```

---

## Retry Strategies

### Exponential Backoff

Increase wait time between retries to avoid overwhelming the server:

```javascript
function createRetryFetcher(options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2
  } = options;

  return async function fetchWithRetry(url, fetchOptions = {}) {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
      } catch (err) {
        lastError = err;
        console.warn(`Attempt ${attempt + 1} failed:`, err.message);

        if (attempt < maxRetries - 1) {
          // Calculate delay with exponential backoff
          const delay = Math.min(
            initialDelay * Math.pow(backoffMultiplier, attempt),
            maxDelay
          );
          // Add jitter to prevent thundering herd
          const jitter = delay * 0.1 * Math.random();
          await new Promise(r => setTimeout(r, delay + jitter));
        }
      }
    }

    throw lastError;
  };
}

const retryFetch = createRetryFetcher({ maxRetries: 3 });
```

### Circuit Breaker Pattern

Stop making requests after multiple failures:

```javascript
function createCircuitBreaker(options = {}) {
  const {
    failureThreshold = 5,
    resetTimeout = 30000
  } = options;

  let failures = 0;
  let lastFailure = 0;
  let isOpen = false;

  return async function withCircuitBreaker(fetchFn) {
    // Check if circuit is open
    if (isOpen) {
      if (Date.now() - lastFailure > resetTimeout) {
        // Try to close circuit
        isOpen = false;
        failures = 0;
      } else {
        throw new Error("Circuit breaker is open - service unavailable");
      }
    }

    try {
      const result = await fetchFn();
      failures = 0;  // Reset on success
      return result;
    } catch (err) {
      failures++;
      lastFailure = Date.now();

      if (failures >= failureThreshold) {
        isOpen = true;
        console.warn("Circuit breaker opened due to repeated failures");
      }

      throw err;
    }
  };
}

const circuitBreaker = createCircuitBreaker();

// Usage
async function loadData() {
  try {
    return await circuitBreaker(() => fetch("/api/data").then(r => r.json()));
  } catch (err) {
    if (err.message.includes("Circuit breaker")) {
      // Show offline/maintenance message
    }
    throw err;
  }
}
```

---

## Error Boundary Pattern

Wrap async operations with consistent error handling:

```javascript
function createAsyncHandler() {
  return async function handleAsync(asyncFn, { onSuccess, onError, onFinally }) {
    try {
      const result = await asyncFn();
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      if (onError) onError(err);
      throw err;
    } finally {
      if (onFinally) onFinally();
    }
  };
}

// Usage in component
app.component("SafeDataLoader", {
  setup({ signal }) {
    const data = signal(null);
    const loading = signal(false);
    const error = signal(null);

    const handleAsync = createAsyncHandler();

    async function loadData() {
      await handleAsync(
        () => fetch("/api/data").then(r => r.json()),
        {
          onSuccess: (result) => {
            data.value = result;
            error.value = null;
          },
          onError: (err) => {
            error.value = err.message;
          },
          onFinally: () => {
            loading.value = false;
          }
        }
      );
    }

    return {
      data, loading, error, loadData,
      onMount: () => {
        loading.value = true;
        loadData();
      }
    };
  },
  template: (ctx) => `
    <div>
      ${ctx.loading.value ? `<p>Loading...</p>` :
        ctx.error.value ? `<p class="error">${ctx.error.value}</p>` :
        `<div>${JSON.stringify(ctx.data.value)}</div>`
      }
    </div>
  `
});
```

---

## Quick Reference

| Pattern | Use Case | Key Benefit |
|---------|----------|-------------|
| **Cancellation** | Search, navigation | Prevent race conditions |
| **Timeout** | Unreliable APIs | Fail fast |
| **Retry** | Transient failures | Automatic recovery |
| **Circuit Breaker** | Failing services | Prevent cascade failures |
| **Error Boundary** | All async ops | Consistent error handling |

---

## Best Practices Summary

1. **Always cancel requests on unmount** - Use `AbortController` in `onUnmount`
2. **Set reasonable timeouts** - Don't let users wait forever
3. **Use exponential backoff** - Be kind to servers during failures
4. **Show attempt progress** - Users appreciate knowing what's happening
5. **Handle AbortError specially** - It's not a real error

---

[← Caching & Optimization](./caching.md) | [Back to Overview](./index.md)
