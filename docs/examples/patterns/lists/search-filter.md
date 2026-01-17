---
title: Searchable & Filterable Lists
description: Eleva.js patterns for building searchable, filterable lists with sorting and multiple filter criteria.
---

# Searchable & Filterable Lists

> **List Patterns** | Search, category filters, and sorting.

---

## Product List with Search, Filter & Sort

A complete product list with search, category filter, stock filter, and sorting.

```javascript
app.component("ProductList", {
  setup({ signal }) {
    const products = signal([
      { id: 1, name: "Laptop", category: "electronics", price: 999, inStock: true },
      { id: 2, name: "Headphones", category: "electronics", price: 199, inStock: true },
      { id: 3, name: "Coffee Mug", category: "home", price: 15, inStock: false },
      { id: 4, name: "Notebook", category: "office", price: 8, inStock: true },
      { id: 5, name: "Desk Lamp", category: "home", price: 45, inStock: true },
      { id: 6, name: "Keyboard", category: "electronics", price: 149, inStock: false }
    ]);

    const searchQuery = signal("");
    const categoryFilter = signal("all");
    const stockFilter = signal("all");
    const sortBy = signal("name");

    function getFilteredProducts() {
      let result = [...products.value];

      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(p => p.name.toLowerCase().includes(query));
      }

      // Category filter
      if (categoryFilter.value !== "all") {
        result = result.filter(p => p.category === categoryFilter.value);
      }

      // Stock filter
      if (stockFilter.value !== "all") {
        const inStock = stockFilter.value === "inStock";
        result = result.filter(p => p.inStock === inStock);
      }

      // Sorting
      result.sort((a, b) => {
        if (sortBy.value === "name") return a.name.localeCompare(b.name);
        if (sortBy.value === "price-asc") return a.price - b.price;
        if (sortBy.value === "price-desc") return b.price - a.price;
        return 0;
      });

      return result;
    }

    const categories = ["all", "electronics", "home", "office"];

    return {
      searchQuery, categoryFilter, stockFilter, sortBy,
      categories, getFilteredProducts
    };
  },
  template: (ctx) => {
    const filtered = ctx.getFilteredProducts();
    return `
      <div class="product-list">
        <div class="filters">
          <input
            type="text"
            placeholder="Search products..."
            value="${ctx.searchQuery.value}"
            @input="(e) => searchQuery.value = e.target.value"
          />

          <select @change="(e) => categoryFilter.value = e.target.value">
            ${ctx.categories.map(cat => `
              <option key="${cat}" value="${cat}" ${ctx.categoryFilter.value === cat ? "selected" : ""}>
                ${cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            `).join("")}
          </select>

          <select @change="(e) => stockFilter.value = e.target.value">
            <option value="all" ${ctx.stockFilter.value === "all" ? "selected" : ""}>All Items</option>
            <option value="inStock" ${ctx.stockFilter.value === "inStock" ? "selected" : ""}>In Stock</option>
            <option value="outOfStock" ${ctx.stockFilter.value === "outOfStock" ? "selected" : ""}>Out of Stock</option>
          </select>

          <select @change="(e) => sortBy.value = e.target.value">
            <option value="name" ${ctx.sortBy.value === "name" ? "selected" : ""}>Sort by Name</option>
            <option value="price-asc" ${ctx.sortBy.value === "price-asc" ? "selected" : ""}>Price: Low to High</option>
            <option value="price-desc" ${ctx.sortBy.value === "price-desc" ? "selected" : ""}>Price: High to Low</option>
          </select>
        </div>

        <p class="results-count">Showing ${filtered.length} products</p>

        <div class="products">
          ${filtered.length > 0 ? filtered.map(product => `
            <div key="${product.id}" class="product-card ${!product.inStock ? 'out-of-stock' : ''}">
              <h3>${product.name}</h3>
              <span class="category">${product.category}</span>
              <p class="price">$${product.price}</p>
              <span class="stock ${product.inStock ? 'in-stock' : 'no-stock'}">
                ${product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          `).join("") : `
            <p class="no-results">No products found matching your criteria.</p>
          `}
        </div>
      </div>
    `;
  },
  style: `
    .filters { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
    .filters input, .filters select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; }
    .filters input { flex: 1; min-width: 200px; }
    .results-count { color: #666; margin-bottom: 15px; }
    .products { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
    .product-card { border: 1px solid #eee; padding: 15px; border-radius: 8px; }
    .product-card.out-of-stock { opacity: 0.6; }
    .product-card h3 { margin: 0 0 10px 0; }
    .category { font-size: 12px; color: #666; background: #f0f0f0; padding: 2px 8px; border-radius: 10px; }
    .price { font-size: 1.25rem; font-weight: bold; color: #28a745; }
    .stock { font-size: 12px; }
    .in-stock { color: #28a745; }
    .no-stock { color: #dc3545; }
  `
});
```

---

## Key Concepts

### 1. Use Functions for Computed Results

Instead of storing filtered results in a signal (which would need manual synchronization), use a function that computes results on demand:

```javascript
function getFilteredProducts() {
  let result = [...products.value];

  // Apply filters...

  return result;
}
```

This automatically recalculates when any dependency signal changes.

### 2. Multiple Filter Criteria

Chain filters together - each filter narrows down the results:

```javascript
// Search filter
if (searchQuery.value) {
  result = result.filter(p => p.name.toLowerCase().includes(query));
}

// Category filter
if (categoryFilter.value !== "all") {
  result = result.filter(p => p.category === categoryFilter.value);
}
```

### 3. Sort Options with Comparators

Use different comparators based on sort type:

```javascript
result.sort((a, b) => {
  if (sortBy.value === "name") return a.name.localeCompare(b.name);
  if (sortBy.value === "price-asc") return a.price - b.price;
  if (sortBy.value === "price-desc") return b.price - a.price;
  return 0;
});
```

### 4. Results Count and Empty State

Always show feedback to users:

```javascript
<p class="results-count">Showing ${filtered.length} products</p>

${filtered.length > 0 ? /* render list */ : `
  <p class="no-results">No products found matching your criteria.</p>
`}
```

---

## Debounced Search

For API-based search, debounce to avoid excessive requests:

```javascript
setup({ signal }) {
  const searchQuery = signal("");
  const results = signal([]);
  let debounceTimer = null;

  function handleSearch(query) {
    searchQuery.value = query;
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      if (query.length >= 2) {
        const response = await fetch(`/api/search?q=${query}`);
        results.value = await response.json();
      }
    }, 300);  // 300ms debounce
  }

  return {
    searchQuery,
    results,
    handleSearch,
    onUnmount: () => clearTimeout(debounceTimer)
  };
}
```

---

## Next Steps

- **[Patterns](./patterns.md)** - Drag-drop, CRUD, grouped lists
- **[Virtual Scrolling](./virtual-scrolling.md)** - Handle 10K+ rows

---

[← Basics](./index.md) | [Patterns →](./patterns.md)
