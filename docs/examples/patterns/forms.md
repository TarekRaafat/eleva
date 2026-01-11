# Form Handling Examples

Learn how to handle forms in Eleva, including input binding, validation, and submission.

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

[← Back to Patterns](./index.md) | [Next: Async Data →](./async-data.md)
