# Migrating from jQuery

> **Version:** 1.0.0-rc.12 | A comprehensive guide for jQuery developers transitioning to Eleva

This guide helps jQuery developers understand Eleva by mapping familiar jQuery patterns to their Eleva equivalents. Eleva offers modern component architecture while maintaining the simplicity you love about jQuery.

---

## TL;DR - Quick Reference

| jQuery | Eleva | Notes |
|--------|-------|-------|
| `$('#id')` | Template strings | No DOM queries needed |
| `$('.class')` | Component children | Organized by component |
| `.on('click', fn)` | `@click="fn"` | Declarative events |
| `.html(content)` | Template re-render | Automatic updates |
| `.text(value)` | `${signal.value}` | Interpolation |
| `.addClass()` | Template literal | Dynamic classes |
| `.css()` | Template literal | Dynamic styles |
| `.show()/.hide()` | Conditional render | `${cond ? ... : ''}` |
| `.each()` | `.map().join('')` | List rendering |
| `$.ajax()` | `fetch()` + signals | Native fetch |
| Global `var` | `signal()` | Reactive state |

---

## Why Migrate?

### jQuery Challenges
- **Spaghetti code** - DOM manipulation scattered everywhere
- **No structure** - Hard to organize large applications
- **Manual updates** - Must remember to update all affected DOM
- **State chaos** - Global variables, hard to track changes
- **Testing difficulty** - DOM-dependent code is hard to test

### Eleva Benefits
- **Component structure** - Organized, reusable code
- **Automatic updates** - Change state, DOM updates automatically
- **Reactive state** - Signals track and propagate changes
- **No build step** - Still works with a simple `<script>` tag
- **Small size** - ~2.3KB vs jQuery's ~87KB

---

## Core Concepts

### DOM Selection → Component Templates

**jQuery:**
```javascript
// Select elements and manipulate
$('#title').text('Hello World');
$('.items').html('<li>Item 1</li><li>Item 2</li>');
$('#container').addClass('active');
```

**Eleva:**
```javascript
const MyComponent = {
  setup({ signal }) {
    const title = signal('Hello World');
    const items = signal(['Item 1', 'Item 2']);
    const isActive = signal(true);

    return { title, items, isActive };
  },
  template: (ctx) => `
    <div class="${ctx.isActive.value ? 'active' : ''}">
      <h1 id="title">${ctx.title.value}</h1>
      <ul class="items">
        ${ctx.items.value.map((item, index) => `<li key="${index}">${item}</li>`).join('')}
      </ul>
    </div>
  `
};
```

**Key insight:** Instead of finding and updating DOM elements, you declare what the DOM should look like based on state.

---

### Event Handling: .on() → @event

**jQuery:**
```javascript
// Event delegation
$(document).on('click', '.btn', function() {
  const id = $(this).data('id');
  handleClick(id);
});

// Direct binding
$('#submit-btn').on('click', function(e) {
  e.preventDefault();
  submitForm();
});

// Multiple events
$('#input').on('focus blur', function() {
  $(this).toggleClass('focused');
});
```

**Eleva:**
```javascript
const MyComponent = {
  setup({ signal }) {
    const isFocused = signal(false);

    const handleClick = (id) => {
      console.log('Clicked:', id);
    };

    const submitForm = (e) => {
      e.preventDefault();
      // Submit logic
    };

    return { isFocused, handleClick, submitForm };
  },
  template: (ctx) => `
    <div>
      <button class="btn" data-id="123" @click="() => handleClick(123)">
        Click Me
      </button>

      <form @submit="submitForm">
        <input
          class="${ctx.isFocused.value ? 'focused' : ''}"
          @focus="() => isFocused.value = true"
          @blur="() => isFocused.value = false"
        />
        <button id="submit-btn" type="submit">Submit</button>
      </form>
    </div>
  `
};
```

**Key insight:** Events are declared in the template with `@eventName`, not attached imperatively.

---

### State Management: Variables → Signals

**jQuery:**
```javascript
// Global state
var count = 0;
var user = null;
var items = [];

// Update state and DOM manually
function increment() {
  count++;
  $('#count').text(count);
  $('#double').text(count * 2);
  if (count > 10) {
    $('#warning').show();
  }
}

function setUser(newUser) {
  user = newUser;
  $('#username').text(user.name);
  $('#email').text(user.email);
  $('#avatar').attr('src', user.avatar);
}
```

**Eleva:**
```javascript
const MyComponent = {
  setup({ signal }) {
    const count = signal(0);
    const user = signal(null);
    const items = signal([]);

    const increment = () => {
      count.value++;
      // DOM updates automatically!
    };

    const setUser = (newUser) => {
      user.value = newUser;
      // All user-related DOM updates automatically!
    };

    return { count, user, items, increment, setUser };
  },
  template: (ctx) => `
    <div>
      <p id="count">${ctx.count.value}</p>
      <p id="double">${ctx.count.value * 2}</p>
      ${ctx.count.value > 10 ? '<p id="warning">Warning!</p>' : ''}

      ${ctx.user.value ? `
        <div class="user">
          <span id="username">${ctx.user.value.name}</span>
          <span id="email">${ctx.user.value.email}</span>
          <img id="avatar" src="${ctx.user.value.avatar}" />
        </div>
      ` : ''}
    </div>
  `
};
```

**Key insight:** Change the signal, and all DOM that depends on it updates automatically.

---

### AJAX: $.ajax() → fetch() + Signals

**jQuery:**
```javascript
var loading = false;
var data = null;
var error = null;

function loadData() {
  loading = true;
  $('#loading').show();
  $('#error').hide();

  $.ajax({
    url: '/api/data',
    method: 'GET',
    success: function(response) {
      data = response;
      $('#content').html(renderData(data));
    },
    error: function(xhr) {
      error = xhr.responseText;
      $('#error').text(error).show();
    },
    complete: function() {
      loading = false;
      $('#loading').hide();
    }
  });
}

function renderData(data) {
  return data.map(item => `<div key="${item.id}">${item.name}</div>`).join('');
}
```

**Eleva:**
```javascript
const DataLoader = {
  setup({ signal }) {
    const loading = signal(false);
    const data = signal(null);
    const error = signal(null);

    const loadData = async () => {
      loading.value = true;
      error.value = null;

      try {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('Failed to load');
        data.value = await response.json();
      } catch (e) {
        error.value = e.message;
      } finally {
        loading.value = false;
      }
    };

    // Load on component mount
    loadData();

    return { loading, data, error, loadData };
  },
  template: (ctx) => `
    <div>
      ${ctx.loading.value ? '<div id="loading">Loading...</div>' : ''}

      ${ctx.error.value ? `
        <div id="error">${ctx.error.value}</div>
      ` : ''}

      ${ctx.data.value ? `
        <div id="content">
          ${ctx.data.value.map(item => `
            <div key="${item.id}">${item.name}</div>
          `).join('')}
        </div>
      ` : ''}

      <button @click="loadData">Reload</button>
    </div>
  `
};
```

---

### Animations and Effects

**jQuery:**
```javascript
// Show/hide with animation
$('#panel').slideDown();
$('#panel').fadeOut();

// Toggle
$('#menu').slideToggle();

// Animate
$('#box').animate({
  left: '250px',
  opacity: 0.5
}, 500);
```

**Eleva:**
```javascript
// Use CSS transitions + signals
const AnimatedPanel = {
  setup({ signal }) {
    const isVisible = signal(false);

    const toggle = () => {
      isVisible.value = !isVisible.value;
    };

    return { isVisible, toggle };
  },
  template: (ctx) => `
    <style>
      .panel {
        transition: all 0.3s ease;
        overflow: hidden;
      }
      .panel.hidden {
        max-height: 0;
        opacity: 0;
      }
      .panel.visible {
        max-height: 500px;
        opacity: 1;
      }
    </style>

    <button @click="toggle">Toggle</button>
    <div class="panel ${ctx.isVisible.value ? 'visible' : 'hidden'}">
      Panel content here
    </div>
  `
};

// For complex animations, use CSS animations or Web Animations API
const AnimatedBox = {
  setup({ signal }) {
    const animate = () => {
      const box = document.getElementById('box');
      box.animate([
        { left: '0px', opacity: 1 },
        { left: '250px', opacity: 0.5 }
      ], {
        duration: 500,
        fill: 'forwards'
      });
    };

    return { animate };
  },
  template: () => `
    <div id="box" style="position: relative;">Box</div>
    <button @click="animate">Animate</button>
  `
};
```

---

### Plugins → Components

**jQuery Plugin:**
```javascript
// Define plugin
$.fn.tooltip = function(options) {
  return this.each(function() {
    var $el = $(this);
    var tip = $('<div class="tooltip">' + options.text + '</div>');

    $el.on('mouseenter', function() {
      tip.appendTo('body').fadeIn();
    });

    $el.on('mouseleave', function() {
      tip.fadeOut(function() { tip.remove(); });
    });
  });
};

// Use plugin
$('.has-tooltip').tooltip({ text: 'Hello!' });
```

**Eleva Component:**
```javascript
// Define component
app.component("Tooltip", {
  setup({ signal, props }) {
    const isVisible = signal(false);

    return {
      text: props.text,
      isVisible,
      show: () => isVisible.value = true,
      hide: () => isVisible.value = false
    };
  },
  template: (ctx) => `
    <div
      class="tooltip-wrapper"
      @mouseenter="show"
      @mouseleave="hide"
    >
      <slot></slot>
      ${ctx.isVisible.value ? `
        <div class="tooltip">${ctx.text.value}</div>
      ` : ''}
    </div>
  `
});

// Use component
app.component("MyPage", {
  template: () => `
    <span class="has-tooltip" :text="Hello!">Hover me</span>
  `,
  children: {
    ".has-tooltip": "Tooltip"
  }
});
```

---

## Common Patterns

### Form Handling

**jQuery:**
```javascript
$('#my-form').on('submit', function(e) {
  e.preventDefault();

  var name = $('#name').val();
  var email = $('#email').val();

  // Validation
  if (!name) {
    $('#name-error').text('Name required').show();
    return;
  }

  // Submit
  $.post('/api/submit', { name: name, email: email })
    .done(function() {
      $('#success').show();
      $('#my-form')[0].reset();
    })
    .fail(function() {
      $('#error').show();
    });
});
```

**Eleva:**
```javascript
const ContactForm = {
  setup({ signal }) {
    const name = signal('');
    const email = signal('');
    const errors = signal({});
    const success = signal(false);
    const submitting = signal(false);

    const validate = () => {
      const newErrors = {};
      if (!name.value) newErrors.name = 'Name required';
      if (!email.value) newErrors.email = 'Email required';
      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validate()) return;

      submitting.value = true;
      try {
        await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.value, email: email.value })
        });
        success.value = true;
        name.value = '';
        email.value = '';
      } catch (err) {
        errors.value = { submit: 'Failed to submit' };
      } finally {
        submitting.value = false;
      }
    };

    return { name, email, errors, success, submitting, handleSubmit };
  },
  template: (ctx) => `
    <form id="my-form" @submit="handleSubmit">
      ${ctx.success.value ? '<div id="success">Submitted!</div>' : ''}
      ${ctx.errors.value.submit ? `<div id="error">${ctx.errors.value.submit}</div>` : ''}

      <div>
        <input
          id="name"
          value="${ctx.name.value}"
          @input="(e) => name.value = e.target.value"
          placeholder="Name"
        />
        ${ctx.errors.value.name ? `
          <span id="name-error">${ctx.errors.value.name}</span>
        ` : ''}
      </div>

      <div>
        <input
          id="email"
          type="email"
          value="${ctx.email.value}"
          @input="(e) => email.value = e.target.value"
          placeholder="Email"
        />
        ${ctx.errors.value.email ? `
          <span id="email-error">${ctx.errors.value.email}</span>
        ` : ''}
      </div>

      <button type="submit" ${ctx.submitting.value ? 'disabled' : ''}>
        ${ctx.submitting.value ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  `
};
```

---

### Tabs Component

**jQuery:**
```javascript
$('.tab-btn').on('click', function() {
  var tabId = $(this).data('tab');

  // Update buttons
  $('.tab-btn').removeClass('active');
  $(this).addClass('active');

  // Update panels
  $('.tab-panel').hide();
  $('#' + tabId).show();
});
```

**Eleva:**
```javascript
const Tabs = {
  setup({ signal }) {
    const activeTab = signal('tab1');
    const tabs = signal([
      { id: 'tab1', label: 'First', content: 'First tab content' },
      { id: 'tab2', label: 'Second', content: 'Second tab content' },
      { id: 'tab3', label: 'Third', content: 'Third tab content' }
    ]);

    const selectTab = (id) => {
      activeTab.value = id;
    };

    return { activeTab, tabs, selectTab };
  },
  template: (ctx) => `
    <div class="tabs">
      <div class="tab-buttons">
        ${ctx.tabs.value.map(tab => `
          <button
            key="${tab.id}"
            class="tab-btn ${ctx.activeTab.value === tab.id ? 'active' : ''}"
            @click="() => selectTab('${tab.id}')"
          >
            ${tab.label}
          </button>
        `).join('')}
      </div>

      <div class="tab-panels">
        ${ctx.tabs.value.map(tab => `
          <div
            key="${tab.id}"
            id="${tab.id}"
            class="tab-panel"
            style="${ctx.activeTab.value === tab.id ? '' : 'display: none;'}"
          >
            ${tab.content}
          </div>
        `).join('')}
      </div>
    </div>
  `
};
```

---

### Modal Dialog

**jQuery:**
```javascript
// Open modal
$('.open-modal').on('click', function() {
  $('#modal').fadeIn();
  $('body').addClass('modal-open');
});

// Close modal
$('.close-modal, .modal-backdrop').on('click', function() {
  $('#modal').fadeOut();
  $('body').removeClass('modal-open');
});

// Close on escape
$(document).on('keydown', function(e) {
  if (e.key === 'Escape') {
    $('#modal').fadeOut();
    $('body').removeClass('modal-open');
  }
});
```

**Eleva:**
```javascript
const Modal = {
  setup({ signal }) {
    const isOpen = signal(false);

    const open = () => {
      isOpen.value = true;
      document.body.classList.add('modal-open');
    };

    const close = () => {
      isOpen.value = false;
      document.body.classList.remove('modal-open');
    };

    const handleKeydown = (e) => {
      if (e.key === 'Escape') close();
    };

    // Add global keydown listener
    document.addEventListener('keydown', handleKeydown);

    return { isOpen, open, close };
  },
  template: (ctx) => `
    <div>
      <button class="open-modal" @click="open">Open Modal</button>

      ${ctx.isOpen.value ? `
        <div class="modal-backdrop" @click="close"></div>
        <div id="modal" class="modal">
          <div class="modal-content">
            <button class="close-modal" @click="close">&times;</button>
            <h2>Modal Title</h2>
            <p>Modal content here...</p>
          </div>
        </div>
      ` : ''}
    </div>
  `
};
```

---

### Infinite Scroll

**jQuery:**
```javascript
var page = 1;
var loading = false;

$(window).on('scroll', function() {
  if (loading) return;

  var scrollHeight = $(document).height();
  var scrollPos = $(window).height() + $(window).scrollTop();

  if (scrollHeight - scrollPos < 200) {
    loading = true;
    $('#loading').show();

    $.get('/api/items?page=' + page, function(items) {
      items.forEach(function(item) {
        $('#items').append('<div class="item">' + item.name + '</div>');
      });
      page++;
      loading = false;
      $('#loading').hide();
    });
  }
});
```

**Eleva:**
```javascript
const InfiniteList = {
  setup({ signal }) {
    const items = signal([]);
    const page = signal(1);
    const loading = signal(false);
    const hasMore = signal(true);

    const loadMore = async () => {
      if (loading.value || !hasMore.value) return;

      loading.value = true;
      try {
        const response = await fetch(`/api/items?page=${page.value}`);
        const newItems = await response.json();

        if (newItems.length === 0) {
          hasMore.value = false;
        } else {
          items.value = [...items.value, ...newItems];
          page.value++;
        }
      } finally {
        loading.value = false;
      }
    };

    // Initial load
    loadMore();

    // Scroll listener
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollPos = window.innerHeight + window.scrollY;

      if (scrollHeight - scrollPos < 200) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);

    return { items, loading, loadMore };
  },
  template: (ctx) => `
    <div id="items">
      ${ctx.items.value.map(item => `
        <div key="${item.id}" class="item">${item.name}</div>
      `).join('')}
    </div>
    ${ctx.loading.value ? '<div id="loading">Loading...</div>' : ''}
  `
};
```

---

## Migration Strategy

### Step 1: Start Small

Pick a single, self-contained feature to migrate:

```javascript
// Instead of this jQuery:
$('#counter-widget').html(`
  <button id="decrement">-</button>
  <span id="count">0</span>
  <button id="increment">+</button>
`);

var count = 0;
$('#increment').on('click', function() {
  count++;
  $('#count').text(count);
});
$('#decrement').on('click', function() {
  count--;
  $('#count').text(count);
});

// Create an Eleva component:
const CounterWidget = {
  setup({ signal }) {
    const count = signal(0);
    return {
      count,
      increment: () => count.value++,
      decrement: () => count.value--
    };
  },
  template: (ctx) => `
    <button @click="decrement">-</button>
    <span>${ctx.count.value}</span>
    <button @click="increment">+</button>
  `
};

// Mount it
const app = new Eleva("CounterWidget");
app.component("Counter", CounterWidget);
app.mount(document.getElementById("counter-widget"), "Counter");
```

### Step 2: Coexist

Eleva can run alongside jQuery:

```html
<!-- Existing jQuery app -->
<div id="jquery-app">
  <!-- Your existing code -->
</div>

<!-- New Eleva component -->
<div id="eleva-widget"></div>

<script src="jquery.min.js"></script>
<script src="your-jquery-code.js"></script>
<script type="module">
  import Eleva from "eleva";

  const app = new Eleva("NewFeature");
  app.component("Feature", { /* ... */ });
  app.mount(document.getElementById("eleva-widget"), "Feature");
</script>
```

### Step 3: Migrate Incrementally

1. **New features** → Build in Eleva
2. **Bug fixes** → Consider converting affected code
3. **Refactors** → Migrate during planned rewrites

---

## What You Gain

### Organization
- Components instead of scattered code
- Clear data flow
- Reusable pieces

### Automatic Updates
- Change state, DOM updates
- No manual synchronization
- No forgotten updates

### Modern Patterns
- Component-based architecture
- Reactive state management
- Declarative templates

### Smaller Footprint
- ~2.3KB vs jQuery's ~87KB
- No build step required
- Works with CDN

---

## Migration Checklist

- [ ] Identify self-contained features to migrate first
- [ ] Replace `$('#id')` patterns with template strings
- [ ] Convert event handlers from `.on()` to `@event`
- [ ] Replace global variables with signals
- [ ] Convert `$.ajax()` to `fetch()` + signals
- [ ] Extract repeated patterns into components
- [ ] Remove jQuery dependency when fully migrated

---

[← From Alpine.js](./from-alpine.md) | [Back to Migration Overview](./index.md)
