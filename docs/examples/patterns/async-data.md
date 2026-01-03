# Async Data Fetching Examples

Learn how to fetch data from APIs, handle loading states, and implement pagination in Eleva.

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
          <button @click="() => fetchUser(${id})">${id}</button>
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
          <article class="post">
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
            <li class="result-item">
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
          <button @click="() => fetchData(${id})">Post ${id}</button>
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
              ${ctx.users.value.map(u => `<li>${u.name}</li>`).join("")}
            </ul>
          </section>

          <section class="card">
            <h3>Recent Posts (${ctx.posts.value.length})</h3>
            <ul>
              ${ctx.posts.value.map(p => `<li>${p.title.substring(0, 30)}...</li>`).join("")}
            </ul>
          </section>

          <section class="card">
            <h3>Comments (${ctx.comments.value.length})</h3>
            <ul>
              ${ctx.comments.value.map(c => `<li>${c.name.substring(0, 25)}...</li>`).join("")}
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

[← Back to Patterns](./index.md) | [Previous: Forms](./forms.md) | [Next: Conditional Rendering →](./conditional-rendering.md)
