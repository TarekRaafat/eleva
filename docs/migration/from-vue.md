---
title: Migrate from Vue
description: Vue 3 to Eleva.js migration guide. Learn how ref/reactive maps to signals, computed to functions, and v-directives to templates.
---

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Migrate from Vue to Eleva.js",
  "description": "Learn how to migrate your Vue 3 application to Eleva.js, converting ref/reactive to signals, directives to template expressions, and Pinia to Eleva Store.",
  "image": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png",
  "totalTime": "PT30M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  },
  "supply": [
    {
      "@type": "HowToSupply",
      "name": "Existing Vue 3 application"
    },
    {
      "@type": "HowToSupply",
      "name": "Text editor or IDE"
    }
  ],
  "tool": [
    {
      "@type": "HowToTool",
      "name": "Eleva.js (~2.3KB gzipped)"
    }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "name": "Replace ref and reactive with signal",
      "text": "Convert Vue's ref() and reactive() to Eleva's signal(). Use signal() for both primitives and objects, accessing values via .value property.",
      "url": "https://elevajs.com/migration/from-vue.html#reactivity-refreactive--signal"
    },
    {
      "@type": "HowToStep",
      "name": "Convert computed to plain functions",
      "text": "Replace Vue's computed() with regular JavaScript functions. Functions are called during template execution and Eleva's batching handles optimization.",
      "url": "https://elevajs.com/migration/from-vue.html#computed-properties"
    },
    {
      "@type": "HowToStep",
      "name": "Replace watch with signal.watch",
      "text": "Convert Vue's watch() and watchEffect() to signal.watch() calls. The watch method is called directly on the signal instance.",
      "url": "https://elevajs.com/migration/from-vue.html#watchers-watch--signalwatch"
    },
    {
      "@type": "HowToStep",
      "name": "Convert SFC to component objects",
      "text": "Transform Vue Single File Components into Eleva component objects with setup function and template string. Move styles to CSS files or inline.",
      "url": "https://elevajs.com/migration/from-vue.html#single-file-components--component-objects"
    },
    {
      "@type": "HowToStep",
      "name": "Replace directives with template expressions",
      "text": "Convert v-if to ternary expressions, v-for to .map().join(''), v-show to inline styles, and v-model to value + @input pattern.",
      "url": "https://elevajs.com/migration/from-vue.html#directives--template-expressions"
    },
    {
      "@type": "HowToStep",
      "name": "Replace Vue Router with Eleva Router",
      "text": "Migrate from Vue Router to Eleva Router plugin. Configure routes and use router.navigate() for programmatic navigation.",
      "url": "https://elevajs.com/migration/from-vue.html#vue-router--eleva-router"
    },
    {
      "@type": "HowToStep",
      "name": "Replace Vuex/Pinia with Eleva Store",
      "text": "Convert Pinia stores to Eleva Store plugin. Define state and actions, then access via setup({ store }) in components.",
      "url": "https://elevajs.com/migration/from-vue.html#vuexpinia--eleva-store"
    }
  ]
}
</script>

# Migrating from Vue

> **Migration Guide** | For Vue developers transitioning to Eleva.

This guide helps Vue developers understand Eleva by mapping familiar Vue concepts to their Eleva equivalents.

---

## TL;DR - Quick Reference

| Vue 3 | Eleva | Notes |
|-------|-------|-------|
| `ref(initial)` | `signal(initial)` | Nearly identical API |
| `reactive(obj)` | `signal(obj)` | Use signal for objects too |
| `computed(() => val)` | Function in setup | Called during render |
| `watch(source, fn)` | `signal.watch(fn)` | On signal directly |
| `onMounted(() => {})` | `onMount` hook | Returned from setup |
| `v-if="condition"` | `${cond ? '...' : ''}` | Ternary in template |
| `v-for="item in items"` | `${items.map(...).join('')}` | Array map |
| `v-model="value"` | `value` + `@input` | Two-way binding |
| `@click="handler"` | `@click="handler"` | Same syntax! |
| `:prop="value"` | `:prop="value"` | Same syntax! |
| `<slot />` | `children` property | Different approach |

---

## Core Concepts

### Reactivity: ref/reactive → signal

**Vue:**
```vue
<script setup>
import { ref, reactive } from 'vue';

const count = ref(0);
const user = reactive({
  name: 'John',
  email: 'john@example.com'
});

function increment() {
  count.value++;
}

function updateName(name) {
  user.name = name;
}
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>User: {{ user.name }}</p>
    <button @click="increment">+</button>
  </div>
</template>
```

**Eleva:**
```javascript
const Counter = {
  setup({ signal }) {
    const count = signal(0);
    const user = signal({
      name: 'John',
      email: 'john@example.com'
    });

    const increment = () => count.value++;

    const updateName = (name) => {
      user.value = { ...user.value, name };
    };

    return { count, user, increment, updateName };
  },
  template: (ctx) => `
    <div>
      <p>Count: ${ctx.count.value}</p>
      <p>User: ${ctx.user.value.name}</p>
      <button @click="increment">+</button>
    </div>
  `
};
```

**Key differences:**
- Use `signal()` for both primitives and objects
- For objects, create new reference on update (immutable pattern)
- No deep reactivity; update the whole signal value
- Access via `.value` in both setup and template

---

### Computed Properties

**Vue:**
```vue
<script setup>
import { ref, computed } from 'vue';

const items = ref([
  { name: 'Apple', price: 1.00 },
  { name: 'Banana', price: 0.50 }
]);

const total = computed(() => {
  return items.value.reduce((sum, item) => sum + item.price, 0);
});

const expensiveItems = computed(() => {
  return items.value.filter(item => item.price > 0.75);
});
</script>

<template>
  <p>Total: ${{ total }}</p>
  <ul>
    <li v-for="item in expensiveItems">{{ item.name }}</li>
  </ul>
</template>
```

**Eleva:**
```javascript
const ItemList = {
  setup({ signal }) {
    const items = signal([
      { name: 'Apple', price: 1.00 },
      { name: 'Banana', price: 0.50 }
    ]);

    // Computed values are just functions
    const total = () => {
      return items.value.reduce((sum, item) => sum + item.price, 0);
    };

    const expensiveItems = () => {
      return items.value.filter(item => item.price > 0.75);
    };

    return { items, total, expensiveItems };
  },
  template: (ctx) => `
    <p>Total: $${ctx.total()}</p>
    <ul>
      ${ctx.expensiveItems().map(item => `
        <li key="${item.name}">${item.name}</li>
      `).join('')}
    </ul>
  `
};
```

**Key differences:**
- No `computed()` wrapper needed
- Functions are called during template execution
- Results are computed fresh each render (Eleva's batching optimizes this)

---

### Watchers: watch → signal.watch

**Vue:**
```vue
<script setup>
import { ref, watch, watchEffect } from 'vue';

const searchQuery = ref('');
const results = ref([]);

// Watch specific source
watch(searchQuery, async (newQuery, oldQuery) => {
  if (newQuery.length > 2) {
    results.value = await search(newQuery);
  }
});

// Watch effect (auto-tracks dependencies)
watchEffect(() => {
  console.log('Query is:', searchQuery.value);
});
</script>
```

**Eleva:**
```javascript
const SearchComponent = {
  setup({ signal }) {
    const searchQuery = signal('');
    const results = signal([]);

    // Watch specific signal
    searchQuery.watch(async (newQuery) => {
      if (newQuery.length > 2) {
        results.value = await search(newQuery);
      }
    });

    // For watchEffect-like behavior, watch each signal
    searchQuery.watch((query) => {
      console.log('Query is:', query);
    });

    return { searchQuery, results };
  },
  template: (ctx) => `
    <input
      value="${ctx.searchQuery.value}"
      @input="(e) => searchQuery.value = e.target.value"
    />
    <ul>
      ${ctx.results.value.map(r => `<li key="${r.id}">${r.name}</li>`).join('')}
    </ul>
  `
};
```

**Key differences:**
- `watch()` is called on the signal itself
- Receives new value directly (not `newVal, oldVal`)
- No auto-dependency tracking like `watchEffect`

---

### Lifecycle Hooks

**Vue:**
```vue
<script setup>
import { onMounted, onUnmounted, onBeforeUpdate } from 'vue';

onMounted(() => {
  console.log('Component mounted');
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  console.log('Component unmounted');
  window.removeEventListener('resize', handleResize);
});

onBeforeUpdate(() => {
  console.log('About to update');
});
</script>
```

**Eleva:**
```javascript
const MyComponent = {
  setup({ signal }) {
    function handleResize() {
      console.log('Window resized');
    }

    return {
      // onMounted equivalent - runs after DOM mount
      onMount: ({ container, context }) => {
        console.log('Component mounted');
        window.addEventListener('resize', handleResize);
      },
      // onUnmounted equivalent - cleanup
      onUnmount: () => {
        console.log('Component unmounted');
        window.removeEventListener('resize', handleResize);
      },
      onBeforeUpdate: ({ container, context }) => {
        console.log('About to update');
      },
      onUpdate: ({ container, context }) => {
        console.log('Updated');
      }
    };
  },
  template: () => `<div>Content</div>`
};
```

**Key differences:**
- `setup()` runs during initialization (before DOM mount)
- `onMount` runs after component is mounted to DOM (like Vue's `onMounted`)
- Return lifecycle hooks (`onMount`, `onUnmount`, `onBeforeUpdate`, `onUpdate`) from setup
- All hooks receive `{ container, context }` with access to DOM and reactive state (onUnmount also receives `cleanup`)

---

### Props

**Vue:**
```vue
<!-- ParentComponent.vue -->
<template>
  <ChildComponent :user="currentUser" :is-admin="true" @update="handleUpdate" />
</template>

<!-- ChildComponent.vue -->
<script setup>
const props = defineProps({
  user: Object,
  isAdmin: Boolean
});

const emit = defineEmits(['update']);

function save() {
  emit('update', props.user);
}
</script>

<template>
  <div>
    <h1>{{ props.user.name }}</h1>
    <span v-if="props.isAdmin">Admin</span>
  </div>
</template>
```

**Eleva:**
```javascript
// Parent
app.component("ParentComponent", {
  setup({ signal }) {
    const currentUser = signal({ name: "John" });

    const handleUpdate = (user) => {
      console.log("Updated:", user);
    };

    return { currentUser, handleUpdate };
  },
  template: (ctx) => `
    <div
      class="child-container"
      :user="currentUser.value"
      :is-admin="true"
      :on-update="handleUpdate"
    ></div>
  `,
  children: {
    ".child-container": "ChildComponent"
  }
});

// Child
app.component("ChildComponent", {
  setup({ props }) {
    const save = () => {
      // Call parent's handler (parent passed values via .value, so props are plain)
      props.onUpdate(props.user);
    };

    return {
      user: props.user,
      isAdmin: props.isAdmin,
      save
    };
  },
  template: (ctx) => `
    <div>
      <h1>${ctx.user.name}</h1>
      ${ctx.isAdmin ? '<span>Admin</span>' : ''}
    </div>
  `
});
```

**Key differences:**
- Props passed via `:prop` attributes on container element
- Object props need `JSON.stringify()`
- Events passed as props (`:on-update="handler"`)
- Children defined in `children` object

---

### Directives → Template Expressions

**Vue:**
```vue
<template>
  <!-- v-if -->
  <div v-if="isVisible">Visible</div>
  <div v-else-if="isPartial">Partial</div>
  <div v-else>Hidden</div>

  <!-- v-for -->
  <ul>
    <li v-for="item in items" :key="item.id">{{ item.name }}</li>
  </ul>

  <!-- v-show -->
  <div v-show="isActive">Active content</div>

  <!-- v-model -->
  <input v-model="message" />

  <!-- v-bind -->
  <img :src="imageUrl" :alt="imageAlt" />

  <!-- v-on -->
  <button @click="handleClick" @mouseenter="handleHover">Click</button>
</template>
```

**Eleva:**
```javascript
template: (ctx) => `
  <!-- v-if equivalent -->
  ${ctx.isVisible.value
    ? '<div>Visible</div>'
    : ctx.isPartial.value
      ? '<div>Partial</div>'
      : '<div>Hidden</div>'
  }

  <!-- v-for equivalent -->
  <ul>
    ${ctx.items.value.map(item => `
      <li>${item.name}</li>
    `).join('')}
  </ul>

  <!-- v-show equivalent -->
  <div style="${ctx.isActive.value ? '' : 'display: none;'}">
    Active content
  </div>

  <!-- v-model equivalent -->
  <input
    value="${ctx.message.value}"
    @input="(e) => message.value = e.target.value"
  />

  <!-- v-bind equivalent -->
  <img src="${ctx.imageUrl.value}" alt="${ctx.imageAlt.value}" />

  <!-- v-on equivalent (same syntax!) -->
  <button @click="handleClick" @mouseenter="handleHover">Click</button>
`
```

---

### Slots → Children Pattern

**Vue:**
```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <header v-if="$slots.header">
      <slot name="header" />
    </header>
    <main>
      <slot />
    </main>
    <footer v-if="$slots.footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<!-- Usage -->
<Card>
  <template #header>
    <h1>Title</h1>
  </template>

  <p>Main content</p>

  <template #footer>
    <button>Action</button>
  </template>
</Card>
```

**Eleva:**
```javascript
// Eleva uses a different pattern - compose in parent
app.component("Card", {
  setup({ props }) {
    return {
      header: props.header,
      content: props.content,
      footer: props.footer
    };
  },
  template: (ctx) => `
    <div class="card">
      ${ctx.header?.value ? `<header>${ctx.header.value}</header>` : ''}
      <main>${ctx.content.value}</main>
      ${ctx.footer?.value ? `<footer>${ctx.footer.value}</footer>` : ''}
    </div>
  `
});

// Usage - pass content as props
app.component("Page", {
  template: () => `
    <div
      class="card-container"
      :header="<h1>Title</h1>"
      :content="<p>Main content</p>"
      :footer="<button>Action</button>"
    ></div>
  `,
  children: {
    ".card-container": "Card"
  }
});
```

**Alternative: Child components**
```javascript
app.component("CardWithChildren", {
  template: () => `
    <div class="card">
      <header class="card-header"></header>
      <main class="card-content"></main>
      <footer class="card-footer"></footer>
    </div>
  `,
  children: {
    ".card-header": "CardHeader",
    ".card-content": "CardContent",
    ".card-footer": "CardFooter"
  }
});
```

---

## Vue Router → Eleva Router

**Vue Router:**
```javascript
// router.js
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/users/:id', component: UserProfile },
    { path: '/:pathMatch(.*)*', component: NotFound }
  ]
});

router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return '/login';
  }
});

// In component
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

console.log(route.params.id);
router.push('/users/123');
```

**Eleva Router:**
```javascript
import Eleva from "eleva";
import { Router } from "eleva/plugins";

const app = new Eleva("App");

const router = app.use(Router, {
  mode: "history",  // or "hash"
  mount: "#app",
  routes: [
    { path: "/", component: Home },
    { path: "/users/:id", component: UserProfile },
    { path: "*", component: NotFound }
  ]
});

// Navigation guard
router.onBeforeEach((to, from) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return "/login";
  }
});

// In component
const UserProfile = {
  setup({ router }) {
    const userId = router.currentParams.value.id;

    // Navigate programmatically
    const goHome = () => router.navigate("/");

    return { userId, goHome };
  },
  template: (ctx) => `
    <h1>User ${ctx.userId}</h1>
    <button @click="goHome">Home</button>
  `
};
```

---

## Vuex/Pinia → Eleva Store

**Pinia:**
```javascript
// stores/counter.js
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    user: null
  }),
  getters: {
    doubleCount: (state) => state.count * 2
  },
  actions: {
    increment() {
      this.count++;
    },
    async fetchUser(id) {
      this.user = await api.getUser(id);
    }
  }
});

// In component
import { useCounterStore } from '@/stores/counter';

const store = useCounterStore();
store.increment();
console.log(store.doubleCount);
```

**Eleva Store:**
```javascript
import Eleva from "eleva";
import { Store } from "eleva/plugins";

const app = new Eleva("App");

app.use(Store, {
  state: {
    count: 0,
    user: null
  },
  actions: {
    increment: (state) => state.count.value++,
    fetchUser: async (state, id) => {
      state.user.value = await api.getUser(id);
    }
  }
});

// In component
const Counter = {
  setup({ store }) {
    // Computed equivalent
    const doubleCount = () => store.state.count.value * 2;

    return {
      count: store.state.count,
      doubleCount,
      increment: () => store.dispatch("increment"),
      fetchUser: (id) => store.dispatch("fetchUser", id)
    };
  },
  template: (ctx) => `
    <p>Count: ${ctx.count.value}</p>
    <p>Double: ${ctx.doubleCount()}</p>
    <button @click="increment">+</button>
  `
};
```

---

## Single File Components → Component Objects

**Vue SFC:**
```vue
<script setup>
import { ref } from 'vue';

const count = ref(0);
const increment = () => count.value++;
</script>

<template>
  <button @click="increment">Count: {{ count }}</button>
</template>

<style scoped>
button {
  background: blue;
  color: white;
}
</style>
```

**Eleva Component:**
```javascript
// counter.js
export const Counter = {
  setup({ signal }) {
    const count = signal(0);
    const increment = () => count.value++;

    return { count, increment };
  },
  template: (ctx) => `
    <button class="counter-btn" @click="increment">
      Count: ${ctx.count.value}
    </button>
  `,
  // Styles - add to your CSS file or use inline
  // <style> .counter-btn { background: blue; color: white; } </style>
};

// Or with inline styles
export const CounterStyled = {
  setup({ signal }) {
    const count = signal(0);
    return { count, increment: () => count.value++ };
  },
  template: (ctx) => `
    <button
      style="background: blue; color: white;"
      @click="increment"
    >
      Count: ${ctx.count.value}
    </button>
  `
};
```

---

## Common Migration Patterns

### Two-Way Binding (v-model)

```vue
<!-- Vue -->
<input v-model="message" />
<input v-model.number="count" />
<input v-model.trim="name" />
```

```javascript
// Eleva
template: (ctx) => `
  <input
    value="${ctx.message.value}"
    @input="(e) => message.value = e.target.value"
  />
  <input
    type="number"
    value="${ctx.count.value}"
    @input="(e) => count.value = Number(e.target.value)"
  />
  <input
    value="${ctx.name.value}"
    @input="(e) => name.value = e.target.value.trim()"
  />
`
```

### Class and Style Bindings

```vue
<!-- Vue -->
<div :class="{ active: isActive, 'text-danger': hasError }"></div>
<div :class="[activeClass, errorClass]"></div>
<div :style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
```

```javascript
// Eleva
template: (ctx) => `
  <div class="${ctx.isActive.value ? 'active' : ''} ${ctx.hasError.value ? 'text-danger' : ''}"></div>
  <div class="${ctx.activeClass.value} ${ctx.errorClass.value}"></div>
  <div style="color: ${ctx.activeColor.value}; font-size: ${ctx.fontSize.value}px;"></div>
`
```

### Event Modifiers

```vue
<!-- Vue -->
<form @submit.prevent="onSubmit"></form>
<button @click.stop="doThis"></button>
<input @keyup.enter="submit" />
```

```javascript
// Eleva - handle in the function
template: (ctx) => `
  <form @submit="(e) => { e.preventDefault(); onSubmit(); }"></form>
  <button @click="(e) => { e.stopPropagation(); doThis(); }"></button>
  <input @keyup="(e) => { if (e.key === 'Enter') submit(); }" />
`
```

---

## What You Gain

### Smaller Bundle
- ~2.5KB vs Vue's ~33KB
- No virtual DOM overhead
- No template compiler in production

### Simpler Mental Model
- No ref vs reactive distinction
- No computed vs methods confusion
- No Options API vs Composition API choice

### Familiar Syntax
- Same `@click` event syntax
- Similar `:prop` binding syntax
- Template strings feel like Vue templates

### Better Performance
- 240+ FPS rendering capability
- Batched updates via microtasks
- Direct DOM manipulation

---

## Migration Checklist

- [ ] Replace `ref()`/`reactive()` with `signal()`
- [ ] Convert `computed()` to plain functions
- [ ] Replace `watch()` with `signal.watch()`
- [ ] Convert SFC to component objects
- [ ] Replace directives with template expressions
- [ ] Replace Vue Router with Eleva Router
- [ ] Replace Vuex/Pinia with Eleva Store
- [ ] Update tests for async DOM updates (use `queueMicrotask`)

---

[← From React](./from-react.md) | [Back to Migration Overview](./index.md) | [From Alpine.js →](./from-alpine.md)
