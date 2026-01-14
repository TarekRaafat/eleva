---
title: Async Data Fetching - API & Loading States
description: Eleva.js async patterns for API fetching, loading spinners, error handling, pagination, and caching. Best practices using signals with onMount lifecycle hook.
---

# Async Data Fetching Examples

Learn how to fetch data from APIs, handle loading states, and implement pagination in Eleva.

## Table of Contents

- [Basic API Fetch](#basic-api-fetch)
- [Paginated List with Loading States](#paginated-list-with-loading-states)
- [Search with Debounce](#search-with-debounce)
- [Data with Caching](#data-with-caching)
- [Parallel Data Fetching](#parallel-data-fetching)
- [Request Cancellation](#request-cancellation)
- [Timeout Handling](#timeout-handling)
- [Request Deduplication](#request-deduplication)
- [Advanced: SWR Pattern](#advanced-swr-pattern-stale-while-revalidate)

---

> **Best Practice:** All examples follow the recommended async pattern:
> - **Sync setup** - The `setup` function itself is synchronous
> - **Async functions inside setup** - Define async functions as regular functions
> - **Trigger via `onMount`** - Use the lifecycle hook to start data fetching
> - **Loading/error signals** - Always provide user feedback during async operations
>
> This pattern ensures components mount immediately with a loading state, providing better UX than blocking the entire mount with `async setup`.

---

## Basic API Fetch

Fetch user data from an API with loading and error states.

```javascript
app.component("UserProfile", {
  setup({ signal }) {
    const user = signal(null);
    const loading = signal(true);
    const error = signal(null);

    async function fetchUser(userId) {
      loading.value = true;
      error.value = null;

      try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        if (!response.ok) throw new Error("User not found");
        user.value = await response.json();
      } catch (err) {
        error.value = err.message;
        user.value = null;
      } finally {
        loading.value = false;
      }
    }

    return {
      user,
      loading,
      error,
      fetchUser,
      onMount: () => fetchUser(1)
    };
  },
  template: (ctx) => `
    <div class="user-profile">
      ${ctx.loading.value ? `
        <div class="loading">Loading user...</div>
      ` : ctx.error.value ? `
        <div class="error">Error: ${ctx.error.value}</div>
      ` : ctx.user.value ? `
        <div class="user-card">
          <h2>${ctx.user.value.name}</h2>
          <p><strong>Email:</strong> ${ctx.user.value.email}</p>
          <p><strong>Phone:</strong> ${ctx.user.value.phone}</p>
          <p><strong>Website:</strong> ${ctx.user.value.website}</p>
          <p><strong>Company:</strong> ${ctx.user.value.company.name}</p>
        </div>
      ` : ""}

      <div class="user-selector">
        <label>Load user: </label>
        ${[1, 2, 3, 4, 5].map(id => `
          <button key="${id}" @click="() => fetchUser(${id})">${id}</button>
        `).join("")}
      </div>
    </div>
  `
});
```

**Key Concepts:**
- Separate signals for data, loading, and error states
- Use `onMount` lifecycle hook to fetch initial data
- Reset error state before each fetch
- Use `finally` to ensure loading is set to false

---

## Paginated List with Loading States

Load data in pages with a "Load More" button.

```javascript
app.component("PostList", {
  setup({ signal }) {
    const posts = signal([]);
    const page = signal(1);
    const loading = signal(false);
    const hasMore = signal(true);
    const POSTS_PER_PAGE = 10;

    async function loadPosts(reset = false) {
      if (loading.value) return;

      loading.value = true;
      const currentPage = reset ? 1 : page.value;

      try {
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/posts?_page=${currentPage}&_limit=${POSTS_PER_PAGE}`
        );
        const newPosts = await response.json();

        if (reset) {
          posts.value = newPosts;
          page.value = 1;
        } else {
          posts.value = [...posts.value, ...newPosts];
        }

        hasMore.value = newPosts.length === POSTS_PER_PAGE;
        page.value = currentPage + 1;
      } catch (err) {
        console.error("Failed to load posts:", err);
      } finally {
        loading.value = false;
      }
    }

    return {
      posts,
      loading,
      hasMore,
      loadPosts,
      refresh: () => loadPosts(true),
      onMount: () => loadPosts(true)
    };
  },
  template: (ctx) => `
    <div class="post-list">
      <div class="header">
        <h2>Posts</h2>
        <button @click="refresh" ${ctx.loading.value ? "disabled" : ""}>
          Refresh
        </button>
      </div>

      <div class="posts">
        ${ctx.posts.value.map(post => `
          <article key="${post.id}" class="post">
            <h3>${post.title}</h3>
            <p>${post.body}</p>
          </article>
        `).join("")}
      </div>

      ${ctx.loading.value ? `
        <div class="loading">Loading...</div>
      ` : ctx.hasMore.value ? `
        <button class="load-more" @click="() => loadPosts(false)">
          Load More
        </button>
      ` : `
        <p class="end-message">No more posts to load</p>
      `}
    </div>
  `
});
```

**Key Concepts:**
- Track current page and whether more data exists
- Append new data to existing array for infinite scroll
- Prevent duplicate requests with loading check
- Support both "load more" and "refresh" actions

---

## Search with Debounce

Search API with debounced input to prevent excessive requests.

```javascript
app.component("UserSearch", {
  setup({ signal }) {
    const query = signal("");
    const results = signal([]);
    const loading = signal(false);
    let debounceTimer = null;

    async function search(searchQuery) {
      if (!searchQuery.trim()) {
        results.value = [];
        return;
      }

      loading.value = true;

      try {
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/users?q=${encodeURIComponent(searchQuery)}`
        );
        const users = await response.json();
        // Filter client-side for demo (real API would filter server-side)
        results.value = users.filter(user =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } catch (err) {
        console.error("Search failed:", err);
        results.value = [];
      } finally {
        loading.value = false;
      }
    }

    function handleInput(value) {
      query.value = value;

      // Debounce: wait 300ms after user stops typing
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        search(value);
      }, 300);
    }

    return { query, results, loading, handleInput };
  },
  template: (ctx) => `
    <div class="user-search">
      <input
        type="text"
        placeholder="Search users by name or email..."
        value="${ctx.query.value}"
        @input="(e) => handleInput(e.target.value)"
      />

      ${ctx.loading.value ? `
        <div class="loading">Searching...</div>
      ` : ctx.query.value && ctx.results.value.length === 0 ? `
        <p class="no-results">No users found</p>
      ` : `
        <ul class="results">
          ${ctx.results.value.map(user => `
            <li key="${user.id}" class="result-item">
              <strong>${user.name}</strong>
              <span>${user.email}</span>
            </li>
          `).join("")}
        </ul>
      `}
    </div>
  `
});
```

---

## Data with Caching

Cache API responses to avoid redundant requests.

```javascript
app.component("CachedData", {
  setup({ signal }) {
    const data = signal(null);
    const loading = signal(false);
    const cache = new Map();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    async function fetchData(id) {
      // Check cache first
      const cached = cache.get(id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        data.value = cached.data;
        return;
      }

      loading.value = true;

      try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
        const result = await response.json();

        // Store in cache
        cache.set(id, {
          data: result,
          timestamp: Date.now()
        });

        data.value = result;
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        loading.value = false;
      }
    }

    function clearCache() {
      cache.clear();
      data.value = null;
    }

    return { data, loading, fetchData, clearCache };
  },
  template: (ctx) => `
    <div class="cached-data">
      <div class="controls">
        ${[1, 2, 3, 4, 5].map(id => `
          <button key="${id}" @click="() => fetchData(${id})">Post ${id}</button>
        `).join("")}
        <button @click="clearCache" class="clear">Clear Cache</button>
      </div>

      ${ctx.loading.value ? `
        <div class="loading">Loading...</div>
      ` : ctx.data.value ? `
        <article>
          <h3>${ctx.data.value.title}</h3>
          <p>${ctx.data.value.body}</p>
        </article>
      ` : `
        <p>Select a post to load</p>
      `}
    </div>
  `
});
```

---

## Parallel Data Fetching

Fetch multiple resources simultaneously.

```javascript
app.component("Dashboard", {
  setup({ signal }) {
    const users = signal([]);
    const posts = signal([]);
    const comments = signal([]);
    const loading = signal(true);
    const error = signal(null);

    async function loadDashboard() {
      loading.value = true;
      error.value = null;

      try {
        // Fetch all data in parallel
        const [usersRes, postsRes, commentsRes] = await Promise.all([
          fetch("https://jsonplaceholder.typicode.com/users?_limit=5"),
          fetch("https://jsonplaceholder.typicode.com/posts?_limit=5"),
          fetch("https://jsonplaceholder.typicode.com/comments?_limit=5")
        ]);

        // Parse all responses
        const [usersData, postsData, commentsData] = await Promise.all([
          usersRes.json(),
          postsRes.json(),
          commentsRes.json()
        ]);

        users.value = usersData;
        posts.value = postsData;
        comments.value = commentsData;
      } catch (err) {
        error.value = "Failed to load dashboard data";
      } finally {
        loading.value = false;
      }
    }

    return {
      users, posts, comments, loading, error,
      loadDashboard,
      onMount: loadDashboard
    };
  },
  template: (ctx) => `
    <div class="dashboard">
      ${ctx.loading.value ? `
        <div class="loading">Loading dashboard...</div>
      ` : ctx.error.value ? `
        <div class="error">${ctx.error.value}</div>
      ` : `
        <div class="dashboard-grid">
          <section class="card">
            <h3>Users (${ctx.users.value.length})</h3>
            <ul>
              ${ctx.users.value.map(u => `<li key="${u.id}">${u.name}</li>`).join("")}
            </ul>
          </section>

          <section class="card">
            <h3>Recent Posts (${ctx.posts.value.length})</h3>
            <ul>
              ${ctx.posts.value.map(p => `<li key="${p.id}">${p.title.substring(0, 30)}...</li>`).join("")}
            </ul>
          </section>

          <section class="card">
            <h3>Comments (${ctx.comments.value.length})</h3>
            <ul>
              ${ctx.comments.value.map(c => `<li key="${c.id}">${c.name.substring(0, 25)}...</li>`).join("")}
            </ul>
          </section>
        </div>
      `}

      <button @click="loadDashboard" ${ctx.loading.value ? "disabled" : ""}>
        Refresh
      </button>
    </div>
  `
});
```

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

## Request Deduplication

Prevent duplicate concurrent requests for the same resource.

### Single-Flight Pattern

Ensure only one request is in flight for any given key:

```javascript
// Create a deduplication utility
function createDeduplicatedFetcher() {
  const inFlight = new Map();  // Track pending requests

  return async function dedupedFetch(url, options = {}) {
    // Check if request for this URL is already in flight
    if (inFlight.has(url)) {
      console.log("Reusing in-flight request for:", url);
      return inFlight.get(url);
    }

    // Create the promise and store it
    const promise = fetch(url, options)
      .then(response => response.json())
      .finally(() => {
        // Remove from in-flight map when done
        inFlight.delete(url);
      });

    inFlight.set(url, promise);
    return promise;
  };
}

// Usage
const dedupedFetch = createDeduplicatedFetcher();

app.component("DeduplicatedList", {
  setup({ signal }) {
    const items = signal([]);
    const loading = signal(false);

    async function loadItems() {
      loading.value = true;
      try {
        // Multiple calls to this will share the same request
        items.value = await dedupedFetch("/api/items");
      } finally {
        loading.value = false;
      }
    }

    return { items, loading, loadItems, onMount: loadItems };
  },
  template: (ctx) => `
    <div>
      <button @click="loadItems">Load Items</button>
      <button @click="loadItems">Load Again (deduped)</button>
      ${ctx.loading.value ? `<p>Loading...</p>` :
        `<ul>${ctx.items.value.map(i => `<li key="${i.id}">${i.name}</li>`).join("")}</ul>`
      }
    </div>
  `
});
```

### Cache with Deduplication

Combine caching with request deduplication:

```javascript
function createCachedFetcher(options = {}) {
  const {
    ttl = 5 * 60 * 1000,  // Cache TTL: 5 minutes
    maxSize = 100         // Max cache entries
  } = options;

  const cache = new Map();
  const inFlight = new Map();

  function cleanup() {
    const now = Date.now();
    for (const [key, entry] of cache) {
      if (now - entry.timestamp > ttl) {
        cache.delete(key);
      }
    }
    // Limit cache size (LRU-style: remove oldest)
    while (cache.size > maxSize) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
  }

  return async function cachedFetch(url, options = {}) {
    const cacheKey = `${options.method || "GET"}:${url}`;

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < ttl) {
      console.log("Cache hit:", url);
      return cached.data;
    }

    // Check in-flight
    if (inFlight.has(cacheKey)) {
      console.log("Reusing in-flight:", url);
      return inFlight.get(cacheKey);
    }

    // Make request
    const promise = fetch(url, options)
      .then(async response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        // Store in cache
        cache.set(cacheKey, { data, timestamp: Date.now() });
        cleanup();

        return data;
      })
      .finally(() => {
        inFlight.delete(cacheKey);
      });

    inFlight.set(cacheKey, promise);
    return promise;
  };
}

// Usage
const cachedFetch = createCachedFetcher({ ttl: 60000 });  // 1 minute cache

app.component("CachedDeduped", {
  setup({ signal }) {
    const user = signal(null);

    async function loadUser(id) {
      // First call: fetches from API
      // Second call within 1 min: returns cached
      // Concurrent calls: shares single request
      user.value = await cachedFetch(`/api/users/${id}`);
    }

    return { user, loadUser };
  },
  template: (ctx) => `
    <div>
      ${[1, 2, 3].map(id => `
        <button key="${id}" @click="() => loadUser(${id})">Load User ${id}</button>
      `).join("")}
      ${ctx.user.value ? `<p>${ctx.user.value.name}</p>` : ""}
    </div>
  `
});
```

---

## Advanced: SWR Pattern (Stale-While-Revalidate)

Return cached data immediately, then revalidate in the background:

```javascript
function createSWRFetcher(options = {}) {
  const { ttl = 60000, staleTime = 5000 } = options;
  const cache = new Map();

  return async function swr(url, onUpdate) {
    const cached = cache.get(url);
    const now = Date.now();

    // Return stale data immediately if available
    if (cached) {
      onUpdate(cached.data, { isStale: now - cached.timestamp > staleTime });

      // If data is fresh enough, don't revalidate
      if (now - cached.timestamp < staleTime) {
        return cached.data;
      }
    }

    // Fetch fresh data
    try {
      const response = await fetch(url);
      const data = await response.json();

      cache.set(url, { data, timestamp: now });
      onUpdate(data, { isStale: false });

      return data;
    } catch (err) {
      // On error, return stale data if available
      if (cached) return cached.data;
      throw err;
    }
  };
}

const swr = createSWRFetcher();

app.component("SWRComponent", {
  setup({ signal }) {
    const data = signal(null);
    const isStale = signal(false);
    const loading = signal(true);

    async function loadData() {
      await swr("/api/dashboard", (newData, meta) => {
        data.value = newData;
        isStale.value = meta.isStale;
        loading.value = false;
      });
    }

    return {
      data, isStale, loading,
      loadData,
      onMount: loadData
    };
  },
  template: (ctx) => `
    <div class="${ctx.isStale.value ? 'stale' : 'fresh'}">
      ${ctx.loading.value ? `<p>Loading...</p>` : `
        <p>Data: ${JSON.stringify(ctx.data.value)}</p>
        ${ctx.isStale.value ? `<p class="stale-indicator">Updating...</p>` : ""}
      `}
    </div>
  `,
  style: `
    .stale { opacity: 0.7; }
    .stale-indicator { color: orange; font-size: 12px; }
  `
});
```

---

## Summary: Async Patterns Quick Reference

| Pattern | Use Case | Key Benefit |
|---------|----------|-------------|
| **Basic fetch** | Simple data loading | Easy to understand |
| **Loading/Error states** | All async operations | Better UX |
| **Debounce** | Search, autocomplete | Reduce API calls |
| **Caching** | Frequently accessed data | Faster subsequent loads |
| **Parallel fetch** | Dashboard, multiple resources | Faster page load |
| **Cancellation** | Search, navigation | Prevent race conditions |
| **Timeout** | Unreliable APIs | Fail fast |
| **Deduplication** | Shared resources | Reduce redundant requests |
| **SWR** | Real-time dashboards | Instant UI, fresh data |

---

[← Back to Patterns](./index.md) | [Previous: Forms](./forms.md) | [Next: Conditional Rendering →](./conditional-rendering.md)
