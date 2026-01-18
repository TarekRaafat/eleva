---
title: Form Handling - Input Binding & Validation
description: Eleva.js form examples with two-way data binding, real-time validation, and form submission. Build accessible reactive forms.
---

<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-S4L689921Q"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", "G-S4L689921Q");
</script>

# Form Handling Examples

> **UI Patterns** | Input binding, validation, and form submission.

---

## Quick Start: Input and Button

A complete example showing an input field with a button that displays the current value when clicked.

### Complete Setup

```javascript
// main.js - Complete application setup
import Eleva from "eleva";

// 1. Create the application instance
const app = new Eleva("FormApp");

// 2. Define the component
app.component("InputDisplay", {
  setup({ signal }) {
    // Reactive state for the input value
    const inputValue = signal("");
    // Reactive state for the displayed message
    const displayedValue = signal("");

    // Handle input changes
    function handleInput(event) {
      inputValue.value = event.target.value;
    }

    // Handle button click - display current input value
    function showValue() {
      displayedValue.value = inputValue.value;
    }

    return { inputValue, displayedValue, handleInput, showValue };
  },
  template: (ctx) => `
    <div class="input-display">
      <input
        type="text"
        value="${ctx.inputValue.value}"
        @input="handleInput"
        placeholder="Enter some text..."
      />
      <button type="button" @click="showValue">Show Value</button>

      ${ctx.displayedValue.value ? `
        <p class="result">
          Current value: <strong>${ctx.displayedValue.value}</strong>
        </p>
      ` : ''}
    </div>
  `,
  style: `
    .input-display { display: flex; flex-direction: column; gap: 1rem; max-width: 300px; }
    .input-display input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
    .input-display button { padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .input-display button:hover { background: #0056b3; }
    .result { margin: 0; padding: 0.5rem; background: #f0f0f0; border-radius: 4px; }
  `
});

// 3. Mount to the DOM
app.mount(document.getElementById("app"), "InputDisplay");
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Input Display Example</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./main.js"></script>
</body>
</html>
```

**Key Concepts:**
- **Import Eleva**: `import Eleva from "eleva"` to access the framework
- **Create app instance**: `new Eleva("AppName")` initializes your application
- **Define component**: `app.component("Name", { setup, template })` registers a component
- **Mount**: `app.mount(element, "Name")` renders the component to the DOM
- **Signals**: `signal("")` creates reactive state that triggers re-renders
- **Event binding**: `@input` and `@click` bind event handlers

### With Props (Reusable Component)

```javascript
import Eleva from "eleva";

const app = new Eleva("FormApp");

app.component("InputDisplay", {
  setup({ signal, props }) {
    const inputValue = signal(props.initialValue || "");
    const displayedValue = signal("");

    function handleInput(event) {
      inputValue.value = event.target.value;
    }

    function showValue() {
      displayedValue.value = inputValue.value;
      // Call optional callback if provided
      if (props.onDisplay) {
        props.onDisplay(inputValue.value);
      }
    }

    return { inputValue, displayedValue, handleInput, showValue };
  },
  template: (ctx) => `
    <div class="input-display">
      <input
        type="text"
        value="${ctx.inputValue.value}"
        @input="handleInput"
        placeholder="${ctx.props.placeholder || 'Enter text...'}"
      />
      <button type="button" @click="showValue">
        ${ctx.props.buttonText || 'Show Value'}
      </button>

      ${ctx.displayedValue.value ? `
        <p class="result">Value: <strong>${ctx.displayedValue.value}</strong></p>
      ` : ''}
    </div>
  `
});

// Mount with props
app.mount(document.getElementById("app"), "InputDisplay", {
  initialValue: "Hello",
  placeholder: "Type here...",
  buttonText: "Display",
  onDisplay: (value) => console.log("Displayed:", value)
});
```

---

## Edge Cases and Error Handling

When working with input fields and button clicks, handle these common edge cases:

### Preventing Rapid Clicks (Debouncing)

```javascript
app.component("DebouncedInput", {
  setup({ signal }) {
    const inputValue = signal("");
    const displayedValue = signal("");
    const isProcessing = signal(false);

    function handleInput(event) {
      inputValue.value = event.target.value;
    }

    // Prevent rapid clicks with a simple flag
    function showValue() {
      if (isProcessing.value) return; // Ignore if already processing

      isProcessing.value = true;
      displayedValue.value = inputValue.value;

      // Re-enable after a short delay
      setTimeout(() => {
        isProcessing.value = false;
      }, 300);
    }

    return { inputValue, displayedValue, isProcessing, handleInput, showValue };
  },
  template: (ctx) => `
    <div class="input-display">
      <input
        type="text"
        value="${ctx.inputValue.value}"
        @input="handleInput"
        placeholder="Type something..."
      />
      <button
        type="button"
        @click="showValue"
        ${ctx.isProcessing.value ? 'disabled' : ''}
      >
        ${ctx.isProcessing.value ? 'Processing...' : 'Show Value'}
      </button>

      ${ctx.displayedValue.value ? `
        <p>Value: <strong>${ctx.displayedValue.value}</strong></p>
      ` : ''}
    </div>
  `
});
```

### Input Validation

```javascript
app.component("ValidatedInput", {
  setup({ signal }) {
    const inputValue = signal("");
    const displayedValue = signal("");
    const error = signal("");

    function handleInput(event) {
      inputValue.value = event.target.value;
      // Clear error when user types
      if (error.value) error.value = "";
    }

    function showValue() {
      // Validate before displaying
      const value = inputValue.value.trim();

      if (!value) {
        error.value = "Please enter a value";
        return;
      }

      if (value.length < 3) {
        error.value = "Value must be at least 3 characters";
        return;
      }

      if (value.length > 50) {
        error.value = "Value must be 50 characters or less";
        return;
      }

      error.value = "";
      displayedValue.value = value;
    }

    return { inputValue, displayedValue, error, handleInput, showValue };
  },
  template: (ctx) => `
    <div class="input-display">
      <input
        type="text"
        value="${ctx.inputValue.value}"
        @input="handleInput"
        placeholder="Enter 3-50 characters..."
        class="${ctx.error.value ? 'input-error' : ''}"
      />
      ${ctx.error.value ? `
        <span class="error">${ctx.error.value}</span>
      ` : ''}
      <button type="button" @click="showValue">Show Value</button>

      ${ctx.displayedValue.value ? `
        <p class="result">Value: <strong>${ctx.displayedValue.value}</strong></p>
      ` : ''}
    </div>
  `,
  style: `
    .input-error { border-color: #dc3545 !important; }
    .error { color: #dc3545; font-size: 0.875rem; }
  `
});
```

### Component Lifecycle (Cleanup)

```javascript
app.component("InputWithCleanup", {
  setup({ signal }) {
    const inputValue = signal("");
    const displayedValue = signal("");
    let debounceTimer = null;

    function handleInput(event) {
      inputValue.value = event.target.value;
    }

    function showValue() {
      // Clear any pending timer
      if (debounceTimer) clearTimeout(debounceTimer);

      // Debounce the display update
      debounceTimer = setTimeout(() => {
        displayedValue.value = inputValue.value;
      }, 200);
    }

    // Cleanup function called when component unmounts
    function onUnmount() {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
    }

    return { inputValue, displayedValue, handleInput, showValue, onUnmount };
  },
  template: (ctx) => `
    <div class="input-display">
      <input
        type="text"
        value="${ctx.inputValue.value}"
        @input="handleInput"
        placeholder="Type something..."
      />
      <button type="button" @click="showValue">Show Value</button>

      ${ctx.displayedValue.value ? `
        <p>Value: <strong>${ctx.displayedValue.value}</strong></p>
      ` : ''}
    </div>
  `
});
```

**Key Points:**
- **Debouncing**: Prevent multiple rapid clicks by using a processing flag or timer
- **Validation**: Check input before processing; show clear error messages
- **Lifecycle**: Use `onUnmount` to clean up timers, event listeners, or subscriptions
- **User feedback**: Disable buttons during processing; show loading states

---

## Basic Input Binding

A simple example showing two-way data binding with an input field.

```javascript
app.component("TextInput", {
  setup({ signal }) {
    const inputValue = signal("");

    function handleInput(event) {
      inputValue.value = event.target.value;
    }

    return { inputValue, handleInput };
  },
  template: (ctx) => `
    <div class="input-group">
      <input
        type="text"
        value="${ctx.inputValue.value}"
        @input="handleInput"
        placeholder="Type something..."
      />
      <p>You typed: <strong>${ctx.inputValue.value}</strong></p>
    </div>
  `
});
```

**Key Concepts:**
- Use `signal()` to create reactive state
- Bind input value with `value="${ctx.inputValue.value}"`
- Handle changes with `@input="handleInput"`
- Display reactive updates with `${ctx.inputValue.value}`

---

## Complete Form with Validation

A comprehensive contact form with field validation, error handling, and submission states.

```javascript
app.component("ContactForm", {
  setup({ signal }) {
    const form = signal({
      name: "",
      email: "",
      message: ""
    });
    const errors = signal({});
    const isSubmitting = signal(false);
    const submitSuccess = signal(false);

    function updateField(field, value) {
      form.value = { ...form.value, [field]: value };
      // Clear error when user starts typing
      if (errors.value[field]) {
        const newErrors = { ...errors.value };
        delete newErrors[field];
        errors.value = newErrors;
      }
    }

    function validate() {
      const newErrors = {};

      if (!form.value.name.trim()) {
        newErrors.name = "Name is required";
      }

      if (!form.value.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
        newErrors.email = "Please enter a valid email";
      }

      if (!form.value.message.trim()) {
        newErrors.message = "Message is required";
      } else if (form.value.message.length < 10) {
        newErrors.message = "Message must be at least 10 characters";
      }

      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(event) {
      event.preventDefault();

      if (!validate()) return;

      isSubmitting.value = true;

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        submitSuccess.value = true;
        form.value = { name: "", email: "", message: "" };

        // Reset success message after 3 seconds
        setTimeout(() => { submitSuccess.value = false; }, 3000);
      } catch (error) {
        errors.value = { submit: "Failed to send message. Please try again." };
      } finally {
        isSubmitting.value = false;
      }
    }

    return { form, errors, isSubmitting, submitSuccess, updateField, handleSubmit };
  },
  template: (ctx) => `
    <form class="contact-form" @submit="handleSubmit">
      ${ctx.submitSuccess.value ? `
        <div class="success-message">Message sent successfully!</div>
      ` : ""}

      ${ctx.errors.value.submit ? `
        <div class="error-message">${ctx.errors.value.submit}</div>
      ` : ""}

      <div class="form-group">
        <label for="name">Name</label>
        <input
          type="text"
          id="name"
          value="${ctx.form.value.name}"
          @input="(e) => updateField('name', e.target.value)"
          class="${ctx.errors.value.name ? 'input-error' : ''}"
        />
        ${ctx.errors.value.name ? `<span class="error">${ctx.errors.value.name}</span>` : ""}
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          value="${ctx.form.value.email}"
          @input="(e) => updateField('email', e.target.value)"
          class="${ctx.errors.value.email ? 'input-error' : ''}"
        />
        ${ctx.errors.value.email ? `<span class="error">${ctx.errors.value.email}</span>` : ""}
      </div>

      <div class="form-group">
        <label for="message">Message</label>
        <textarea
          id="message"
          @input="(e) => updateField('message', e.target.value)"
          class="${ctx.errors.value.message ? 'input-error' : ''}"
        >${ctx.form.value.message}</textarea>
        ${ctx.errors.value.message ? `<span class="error">${ctx.errors.value.message}</span>` : ""}
      </div>

      <button type="submit" ${ctx.isSubmitting.value ? "disabled" : ""}>
        ${ctx.isSubmitting.value ? "Sending..." : "Send Message"}
      </button>
    </form>
  `,
  style: `
    .contact-form { max-width: 400px; margin: 0 auto; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
    .form-group input, .form-group textarea {
      width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;
    }
    .form-group textarea { min-height: 100px; resize: vertical; }
    .input-error { border-color: #dc3545 !important; }
    .error { color: #dc3545; font-size: 0.875rem; margin-top: 0.25rem; display: block; }
    .success-message { background: #d4edda; color: #155724; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; }
    .error-message { background: #f8d7da; color: #721c24; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; }
    button {
      width: 100%; padding: 0.75rem; background: #007bff; color: white;
      border: none; border-radius: 4px; cursor: pointer; font-size: 1rem;
    }
    button:hover { background: #0056b3; }
    button:disabled { background: #6c757d; cursor: not-allowed; }
  `
});
```

**Key Concepts:**
- Store form data in a single signal object
- Separate signals for errors, loading, and success states
- Clear field errors on input
- Validate all fields before submission
- Handle async submission with loading state
- Show success/error feedback

---

## Checkbox and Radio Inputs

```javascript
app.component("PreferencesForm", {
  setup({ signal }) {
    const preferences = signal({
      newsletter: false,
      notifications: true,
      theme: "light"
    });

    function toggleCheckbox(field) {
      preferences.value = {
        ...preferences.value,
        [field]: !preferences.value[field]
      };
    }

    function setTheme(theme) {
      preferences.value = { ...preferences.value, theme };
    }

    return { preferences, toggleCheckbox, setTheme };
  },
  template: (ctx) => `
    <form class="preferences-form">
      <h3>Email Preferences</h3>

      <label class="checkbox-label">
        <input
          type="checkbox"
          ${ctx.preferences.value.newsletter ? 'checked' : ''}
          @change="() => toggleCheckbox('newsletter')"
        />
        Subscribe to newsletter
      </label>

      <label class="checkbox-label">
        <input
          type="checkbox"
          ${ctx.preferences.value.notifications ? 'checked' : ''}
          @change="() => toggleCheckbox('notifications')"
        />
        Enable notifications
      </label>

      <h3>Theme</h3>

      <label class="radio-label">
        <input
          type="radio"
          name="theme"
          value="light"
          ${ctx.preferences.value.theme === 'light' ? 'checked' : ''}
          @change="() => setTheme('light')"
        />
        Light
      </label>

      <label class="radio-label">
        <input
          type="radio"
          name="theme"
          value="dark"
          ${ctx.preferences.value.theme === 'dark' ? 'checked' : ''}
          @change="() => setTheme('dark')"
        />
        Dark
      </label>

      <label class="radio-label">
        <input
          type="radio"
          name="theme"
          value="system"
          ${ctx.preferences.value.theme === 'system' ? 'checked' : ''}
          @change="() => setTheme('system')"
        />
        System
      </label>

      <pre>Current: ${JSON.stringify(ctx.preferences.value, null, 2)}</pre>
    </form>
  `
});
```

---

## Select Dropdown

```javascript
app.component("CountrySelector", {
  setup({ signal }) {
    const selectedCountry = signal("");
    const countries = [
      { code: "us", name: "United States" },
      { code: "uk", name: "United Kingdom" },
      { code: "ca", name: "Canada" },
      { code: "au", name: "Australia" },
      { code: "de", name: "Germany" },
      { code: "fr", name: "France" }
    ];

    return { selectedCountry, countries };
  },
  template: (ctx) => `
    <div class="country-selector">
      <label for="country">Select your country:</label>
      <select
        id="country"
        @change="(e) => selectedCountry.value = e.target.value"
      >
        <option value="">-- Choose a country --</option>
        ${ctx.countries.map(country => `
          <option
            key="${country.code}"
            value="${country.code}"
            ${ctx.selectedCountry.value === country.code ? 'selected' : ''}
          >
            ${country.name}
          </option>
        `).join('')}
      </select>

      ${ctx.selectedCountry.value ? `
        <p>You selected: <strong>${ctx.countries.find(c => c.code === ctx.selectedCountry.value)?.name}</strong></p>
      ` : ''}
    </div>
  `
});
```

---

[← Back to Patterns](./index.md) | [Next: Async Data →](./async-data/index.md)
