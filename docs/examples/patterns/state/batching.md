---
title: Batching & Performance
description: Eleva.js automatic render batching, performance optimization, and 240fps+ animation capabilities.
---

<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-S4L689921Q"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", "G-S4L689921Q");
</script>

# Batching & Performance

> **State Patterns** | Automatic render batching and high-performance capabilities.

---

## Automatic Render Batching

Eleva automatically batches multiple signal changes into a single render, optimizing performance without any code changes.

### How It Works

When multiple signals change synchronously, Eleva batches them into one render:

```javascript
// All 3 changes result in just 1 render
function handleDrag(e) {
  x.value = e.clientX;      // Batched
  y.value = e.clientY;      // Batched
  isDragging.value = true;  // Batched → Single render
}
```

### Benefits

| Scenario | Without Batching | With Batching |
|----------|------------------|---------------|
| Drag events (60/sec × 3 signals) | 180 renders/sec | 60 renders/sec |
| Form reset (10 fields) | 10 renders | 1 render |
| API response (5 state updates) | 5 renders | 1 render |

### Practical Examples

**Form Reset:**
```javascript
function resetForm() {
  // All fields reset in 1 render, not 10
  name.value = "";
  email.value = "";
  phone.value = "";
  address.value = "";
  // ... more fields
}
```

**API Response:**
```javascript
async function fetchData() {
  loading.value = true;
  error.value = null;
  // First render happens here (before await)

  const data = await api.get("/users");

  users.value = data.users;
  total.value = data.total;
  loading.value = false;
  // Second render (all 3 changes batched)
}
```

**Swap Values (Consistent UI):**
```javascript
function swap() {
  const temp = a.value;
  a.value = b.value;  // User never sees this intermediate state
  b.value = temp;     // Both changes render together
}
```

### Memoization

Eleva also skips DOM updates when the output HTML is unchanged:

```javascript
// Template output: "<div>Hello World</div>"
name.value = "World";  // Same value → No DOM update
name.value = "World";  // Same value → No DOM update
name.value = "Alice";  // Different value → DOM updates
```

This happens automatically—no configuration needed.

---

## Batching Tips & Gotchas

While render batching improves performance, there are some behaviors to be aware of:

### 1. DOM Updates Are Async

Renders happen on the next microtask, not immediately after signal changes:

```javascript
// ❌ Wrong: Reading DOM immediately
count.value = 5;
console.log(container.textContent); // Still shows old value!

// ✅ Correct: Wait for microtask
count.value = 5;
await new Promise(r => queueMicrotask(r));
console.log(container.textContent); // Shows "5"

// ✅ Or use setTimeout
count.value = 5;
setTimeout(() => {
  console.log(container.textContent); // Shows "5"
}, 0);
```

### 2. Tests May Need Delays

When testing signal changes, allow time for the batched render:

```javascript
// ❌ May fail
count.value = 10;
expect(container.innerHTML).toContain("10");

// ✅ Works
count.value = 10;
await new Promise(r => setTimeout(r, 0));
expect(container.innerHTML).toContain("10");
```

### 3. Use Immutable Updates for Arrays/Objects

> **Important:** Signals detect changes via identity comparison (`===`). Methods like `.push()`, `.pop()`, `.splice()`, and direct property assignment mutate the existing reference without changing it, so **Eleva won't detect the change** and won't re-render.

Creating new references ensures reactivity and proper DOM diffing:

```javascript
// ❌ Wrong: Mutation doesn't trigger reactivity (same reference!)
items.value.push(newItem);    // Mutates array, but reference unchanged
items.value = items.value;    // Still same reference - no update!

// ✅ Correct: Create new array (new reference triggers update)
items.value = [...items.value, newItem];

// ❌ Wrong: Mutation doesn't trigger reactivity
user.value.name = "Alice";    // Mutates object, but reference unchanged
user.value = user.value;      // Still same reference - no update!

// ✅ Correct: Create new object (new reference triggers update)
user.value = { ...user.value, name: "Alice" };
```

### 4. Multiple Signals in One Handler

Multiple signal changes in the same synchronous block are batched—this is a feature, not a bug:

```javascript
function handleSubmit() {
  loading.value = true;
  error.value = null;
  data.value = null;
  // All 3 changes = 1 render (good!)
}
```

### 5. Async Boundaries Create Separate Batches

Each `await` creates a new synchronous block:

```javascript
async function fetchData() {
  loading.value = true;  // Batch 1
  error.value = null;    // Batch 1 → 1 render

  const result = await api.get("/data");  // Async boundary

  data.value = result;     // Batch 2
  loading.value = false;   // Batch 2 → 1 render
}
// Total: 2 renders (not 4)
```

### 6. Plugin Considerations

When using plugins with batching:

| Plugin | Tip |
|--------|-----|
| **Store** | Multiple `store.set()` calls are batched |
| **Router** | DOM updates after `navigate()` are async |
| **Props** | Child component updates are batched with parent |

```javascript
// Router example
router.navigate("/new-page");
// DOM still shows old page here!

await new Promise(r => queueMicrotask(r));
// Now DOM shows new page
```

---

## 240fps+ Performance

Eleva is built for high-refresh-rate displays and smooth animations. The framework **never limits your frame rate**.

### FPS Capability

| FPS Target | Frame Budget | Eleva Capability |
|------------|--------------|------------------|
| **60 fps** | 16.67ms | ~1,500 renders possible |
| **120 fps** | 8.33ms | ~750 renders possible |
| **240 fps** | 4.17ms | ~380 renders possible |

### Benchmark Results

| Scenario | Ops/Second | Avg Render Time |
|----------|-----------|-----------------|
| Simple counter | 32,815 | 0.030ms |
| Position animation | 45,072 | 0.022ms |
| 5 signals batched | 34,290 | 0.029ms |
| 100-item list | 1,628 | 0.614ms |
| Complex template | 7,146 | 0.140ms |

With an average render time of **0.011ms**, Eleva can theoretically achieve **90,000+ fps** for simple updates. Even the heaviest workload (100-item list) fits comfortably within a 240fps frame budget.

### Animation Example

```javascript
app.component("SmoothAnimation", {
  setup({ signal }) {
    const x = signal(0);
    const y = signal(0);

    function animate() {
      const time = performance.now() / 1000;
      x.value = Math.sin(time) * 100 + 150;
      y.value = Math.cos(time) * 100 + 150;
      requestAnimationFrame(animate);
    }

    return { x, y, onMount: animate };
  },
  template: (ctx) => `
    <div class="animation-container">
      <div
        class="ball"
        style="transform: translate(${ctx.x.value}px, ${ctx.y.value}px)"
      ></div>
    </div>
  `
});
```

The batching with `queueMicrotask` runs **before** `requestAnimationFrame`, so no frames are skipped—batching only coalesces redundant work within the same synchronous block.

---

## Quick Reference

| Topic | Key Point |
|-------|-----------|
| **Batching** | Multiple sync signal changes = 1 render |
| **Memoization** | Same HTML output = no DOM update |
| **Async timing** | DOM updates on next microtask |
| **Immutability** | New references trigger reactivity |
| **Performance** | 240fps+ capable, ~0.01ms renders |

---

[← State Patterns](./patterns.md) | [Back to Overview](./index.md)
