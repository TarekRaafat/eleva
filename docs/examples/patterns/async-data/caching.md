---
title: Caching & Optimization
description: Eleva.js async patterns for caching, parallel fetching, request deduplication, and SWR pattern.
---

# Caching & Optimization

> **Async Data** | Caching, parallel requests, and smart revalidation.

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

## SWR Pattern (Stale-While-Revalidate)

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

## Quick Reference

| Pattern | Use Case | Key Benefit |
|---------|----------|-------------|
| **Caching** | Frequently accessed data | Faster subsequent loads |
| **Parallel fetch** | Dashboard, multiple resources | Faster page load |
| **Deduplication** | Shared resources | Reduce redundant requests |
| **SWR** | Real-time dashboards | Instant UI, fresh data |

---

[← Overview](./index.md) | [Resilience Patterns →](./resilience.md)
