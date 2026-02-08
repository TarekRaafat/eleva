---
title: Async Data Fetching
description: Fetch data in Eleva.js. API calls with loading/error states, pagination, infinite scroll, and debounced search. Clean async patterns without useEffect.
---

<link rel="canonical" href="https://elevajs.com/examples/patterns/async-data/">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://elevajs.com/examples/patterns/async-data/">
<meta property="og:title" content="Async Data Fetching - Eleva.js">
<meta property="og:description" content="Fetch data in Eleva.js. API calls with loading/error states, pagination, infinite scroll, and debounced search. Clean async patterns without useEffect.">
<meta property="og:image" content="https://elevajs.com/imgs/eleva.js%20Full%20Logo.png">
<meta property="og:site_name" content="Eleva.js">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://elevajs.com/examples/patterns/async-data/">
<meta name="twitter:title" content="Async Data Fetching - Eleva.js">
<meta name="twitter:description" content="Fetch data in Eleva.js. API calls with loading/error states, pagination, infinite scroll, and debounced search. Clean async patterns without useEffect.">
<meta name="twitter:image" content="https://elevajs.com/imgs/eleva.js%20Full%20Logo.png">

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
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://elevajs.com/" },
    { "@type": "ListItem", "position": 2, "name": "Examples", "item": "https://elevajs.com/examples/" },
    { "@type": "ListItem", "position": 3, "name": "Patterns", "item": "https://elevajs.com/examples/patterns/" },
    { "@type": "ListItem", "position": 4, "name": "Async Data", "item": "https://elevajs.com/examples/patterns/async-data/" }
  ]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Eleva.js Async Data Fetching Patterns",
  "description": "Patterns for fetching data from APIs including loading states, error handling, pagination, infinite scroll, and search with debounce. Production-ready async patterns.",
  "programmingLanguage": {
    "@type": "ComputerLanguage",
    "name": "JavaScript"
  },
  "runtimePlatform": "Browser (ES6+)",
  "codeSampleType": "code snippet",
  "author": {
    "@type": "Person",
    "name": "Tarek Raafat",
    "url": "https://github.com/TarekRaafat"
  },
  "isPartOf": {
    "@type": "SoftwareApplication",
    "name": "Eleva.js",
    "url": "https://elevajs.com"
  },
  "license": "https://opensource.org/licenses/MIT",
  "learningResourceType": "Tutorial",
  "teaches": ["API fetching", "Loading states", "Error handling", "Pagination", "Debounced search"]
}
</script>

# Async Data Fetching

> **Version:** 1.2.0 | API fetching, loading states, and pagination patterns.

---

## Documentation Pages

- **[Getting Started](./index.md)** (this page) - Basic fetch, pagination, search
- **[Caching & Optimization](./caching.md)** - Caching, parallel fetching, SWR pattern
- **[Resilience Patterns](./resilience.md)** - Cancellation, timeouts, retries

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

## Quick Reference

| Pattern | Use Case | Key Benefit |
|---------|----------|-------------|
| **Basic fetch** | Simple data loading | Easy to understand |
| **Loading/Error states** | All async operations | Better UX |
| **Pagination** | Large datasets | Load on demand |
| **Debounce** | Search, autocomplete | Reduce API calls |

---

## Next Steps

- **[Caching & Optimization](./caching.md)** - Cache responses, parallel fetching
- **[Resilience Patterns](./resilience.md)** - Handle timeouts, cancellation, retries

---

## Related Patterns

Async data works with these patterns:

| Pattern | Async Data Integration |
|---------|------------------------|
| [State Management](../state/index.md) | Loading/error signals, response caching |
| [Conditional Rendering](../conditional-rendering.md) | Loading spinners, error messages, empty states |
| [Lists](../lists/index.md) | Paginated data, infinite scroll, search results |
| [Forms](../forms.md) | Form submission, server validation, search inputs |
| [Storage](./caching.md) | Cache responses, offline-first patterns |

## See Also

- [Weather Dashboard App](../../apps/weather-dashboard.md) — Real-world async data example
- [Best Practices](../best-practices/performance.md) — API call optimization

---

[← Back to Patterns](../index.md) | [Caching & Optimization →](./caching.md)
