# State Management Examples

Learn how to manage computed values, derived state, and complex state patterns in Eleva.

---

## Shopping Cart with Computed Totals

A shopping cart demonstrating computed values (subtotal, discount, tax, total).

```javascript
app.component("ShoppingCart", {
  setup({ signal }) {
    const items = signal([
      { id: 1, name: "T-Shirt", price: 25, quantity: 2 },
      { id: 2, name: "Jeans", price: 50, quantity: 1 },
      { id: 3, name: "Sneakers", price: 80, quantity: 1 }
    ]);
    const discount = signal(0);
    const taxRate = 0.08; // 8% tax

    // Computed values as functions
    function getSubtotal() {
      return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    function getDiscountAmount() {
      return getSubtotal() * (discount.value / 100);
    }

    function getTax() {
      return (getSubtotal() - getDiscountAmount()) * taxRate;
    }

    function getTotal() {
      return getSubtotal() - getDiscountAmount() + getTax();
    }

    function getItemCount() {
      return items.value.reduce((sum, item) => sum + item.quantity, 0);
    }

    function updateQuantity(id, delta) {
      items.value = items.value.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    }

    function removeItem(id) {
      items.value = items.value.filter(item => item.id !== id);
    }

    function applyDiscount(code) {
      // Simple discount codes
      const discounts = { "SAVE10": 10, "SAVE20": 20, "HALF": 50 };
      discount.value = discounts[code.toUpperCase()] || 0;
    }

    return {
      items, discount,
      getSubtotal, getDiscountAmount, getTax, getTotal, getItemCount,
      updateQuantity, removeItem, applyDiscount
    };
  },
  template: (ctx) => `
    <div class="shopping-cart">
      <h2>Shopping Cart (${ctx.getItemCount()} items)</h2>

      ${ctx.items.value.length === 0 ? `
        <p class="empty-cart">Your cart is empty</p>
      ` : `
        <div class="cart-items">
          ${ctx.items.value.map(item => `
            <div key="${item.id}" class="cart-item">
              <div class="item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} each</p>
              </div>
              <div class="quantity-controls">
                <button @click="() => updateQuantity(${item.id}, -1)">−</button>
                <span>${item.quantity}</span>
                <button @click="() => updateQuantity(${item.id}, 1)">+</button>
              </div>
              <div class="item-total">
                $${(item.price * item.quantity).toFixed(2)}
              </div>
              <button class="remove-btn" @click="() => removeItem(${item.id})">×</button>
            </div>
          `).join("")}
        </div>

        <div class="discount-section">
          <input
            type="text"
            placeholder="Discount code"
            @keyup="(e) => e.key === 'Enter' && applyDiscount(e.target.value)"
          />
          <button @click="(e) => applyDiscount(e.target.previousElementSibling.value)">
            Apply
          </button>
          ${ctx.discount.value > 0 ? `<span class="discount-applied">${ctx.discount.value}% off applied!</span>` : ""}
        </div>

        <div class="cart-summary">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>$${ctx.getSubtotal().toFixed(2)}</span>
          </div>
          ${ctx.discount.value > 0 ? `
            <div class="summary-row discount">
              <span>Discount (${ctx.discount.value}%):</span>
              <span>-$${ctx.getDiscountAmount().toFixed(2)}</span>
            </div>
          ` : ""}
          <div class="summary-row">
            <span>Tax (8%):</span>
            <span>$${ctx.getTax().toFixed(2)}</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <span>$${ctx.getTotal().toFixed(2)}</span>
          </div>
        </div>

        <button class="checkout-btn">Proceed to Checkout</button>
      `}
    </div>
  `,
  style: `
    .shopping-cart { max-width: 500px; margin: 0 auto; }
    .cart-item { display: flex; align-items: center; gap: 15px; padding: 15px 0; border-bottom: 1px solid #eee; }
    .item-info { flex: 1; }
    .item-info h4 { margin: 0 0 5px 0; }
    .item-info p { margin: 0; color: #666; font-size: 14px; }
    .quantity-controls { display: flex; align-items: center; gap: 10px; }
    .quantity-controls button { width: 30px; height: 30px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px; }
    .item-total { font-weight: bold; min-width: 80px; text-align: right; }
    .remove-btn { background: none; border: none; color: #dc3545; font-size: 20px; cursor: pointer; }
    .discount-section { display: flex; gap: 10px; margin: 20px 0; align-items: center; }
    .discount-section input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    .discount-applied { color: #28a745; font-size: 14px; }
    .cart-summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .summary-row.discount { color: #28a745; }
    .summary-row.total { font-size: 1.25rem; font-weight: bold; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px; }
    .checkout-btn { width: 100%; padding: 15px; background: #007bff; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; }
  `
});
```

**Key Concepts:**
- Compute derived values as functions
- Multiple computed values depending on each other
- Immutable state updates with spread operator
- Format currency values consistently

---

## Counter with History (Undo/Redo)

State management with undo/redo functionality.

```javascript
app.component("CounterWithHistory", {
  setup({ signal }) {
    const count = signal(0);
    const history = signal([0]);
    const historyIndex = signal(0);

    function increment() {
      const newCount = count.value + 1;
      pushHistory(newCount);
    }

    function decrement() {
      const newCount = count.value - 1;
      pushHistory(newCount);
    }

    function pushHistory(newValue) {
      // Remove any future history if we're not at the end
      const newHistory = history.value.slice(0, historyIndex.value + 1);
      newHistory.push(newValue);

      history.value = newHistory;
      historyIndex.value = newHistory.length - 1;
      count.value = newValue;
    }

    function undo() {
      if (historyIndex.value > 0) {
        historyIndex.value--;
        count.value = history.value[historyIndex.value];
      }
    }

    function redo() {
      if (historyIndex.value < history.value.length - 1) {
        historyIndex.value++;
        count.value = history.value[historyIndex.value];
      }
    }

    function reset() {
      count.value = 0;
      history.value = [0];
      historyIndex.value = 0;
    }

    const canUndo = () => historyIndex.value > 0;
    const canRedo = () => historyIndex.value < history.value.length - 1;

    return { count, history, historyIndex, increment, decrement, undo, redo, reset, canUndo, canRedo };
  },
  template: (ctx) => `
    <div class="counter-history">
      <div class="count-display">${ctx.count.value}</div>

      <div class="controls">
        <button @click="decrement">−</button>
        <button @click="increment">+</button>
      </div>

      <div class="history-controls">
        <button @click="undo" ${!ctx.canUndo() ? 'disabled' : ''}>← Undo</button>
        <button @click="redo" ${!ctx.canRedo() ? 'disabled' : ''}>Redo →</button>
        <button @click="reset">Reset</button>
      </div>

      <div class="history-timeline">
        <p>History: ${ctx.history.value.map((val, i) => `
          <span key="${i}" class="${i === ctx.historyIndex.value ? 'current' : ''}">${val}</span>
        `).join(' → ')}</p>
      </div>
    </div>
  `,
  style: `
    .counter-history { text-align: center; max-width: 400px; margin: 0 auto; }
    .count-display { font-size: 4rem; font-weight: bold; margin: 20px 0; }
    .controls button { font-size: 2rem; width: 60px; height: 60px; margin: 0 10px; cursor: pointer; }
    .history-controls { margin-top: 20px; }
    .history-controls button { margin: 0 5px; padding: 8px 16px; }
    .history-controls button:disabled { opacity: 0.5; cursor: not-allowed; }
    .history-timeline { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; }
    .history-timeline span { padding: 2px 8px; border-radius: 4px; }
    .history-timeline span.current { background: #007bff; color: white; }
  `
});
```

---

## Form State Machine

Managing complex form state with explicit states.

```javascript
app.component("FormStateMachine", {
  setup({ signal }) {
    // States: idle, editing, validating, submitting, success, error
    const state = signal("idle");
    const formData = signal({ email: "", password: "" });
    const errors = signal({});

    function transition(newState) {
      console.log(`State: ${state.value} → ${newState}`);
      state.value = newState;
    }

    function startEditing() {
      if (state.value === "idle" || state.value === "success" || state.value === "error") {
        transition("editing");
      }
    }

    function updateField(field, value) {
      formData.value = { ...formData.value, [field]: value };
      if (state.value !== "editing") {
        transition("editing");
      }
    }

    async function submit() {
      // Validate
      transition("validating");
      const newErrors = {};

      if (!formData.value.email.includes("@")) {
        newErrors.email = "Invalid email";
      }
      if (formData.value.password.length < 6) {
        newErrors.password = "Password too short";
      }

      if (Object.keys(newErrors).length > 0) {
        errors.value = newErrors;
        transition("error");
        return;
      }

      errors.value = {};
      transition("submitting");

      try {
        // Simulate API call
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.3) resolve();
            else reject(new Error("Server error"));
          }, 1500);
        });
        transition("success");
      } catch (err) {
        errors.value = { submit: err.message };
        transition("error");
      }
    }

    function reset() {
      formData.value = { email: "", password: "" };
      errors.value = {};
      transition("idle");
    }

    const isDisabled = () => state.value === "validating" || state.value === "submitting";

    return { state, formData, errors, updateField, submit, reset, isDisabled };
  },
  template: (ctx) => `
    <div class="state-machine-form">
      <div class="state-indicator">
        Current State: <strong>${ctx.state.value}</strong>
      </div>

      ${ctx.state.value === "success" ? `
        <div class="success-message">
          <h3>Success!</h3>
          <p>Form submitted successfully.</p>
          <button @click="reset">Submit Another</button>
        </div>
      ` : `
        <form @submit="(e) => { e.preventDefault(); submit(); }">
          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              value="${ctx.formData.value.email}"
              @input="(e) => updateField('email', e.target.value)"
              ${ctx.isDisabled() ? 'disabled' : ''}
            />
            ${ctx.errors.value.email ? `<span class="error">${ctx.errors.value.email}</span>` : ''}
          </div>

          <div class="form-group">
            <label>Password</label>
            <input
              type="password"
              value="${ctx.formData.value.password}"
              @input="(e) => updateField('password', e.target.value)"
              ${ctx.isDisabled() ? 'disabled' : ''}
            />
            ${ctx.errors.value.password ? `<span class="error">${ctx.errors.value.password}</span>` : ''}
          </div>

          ${ctx.errors.value.submit ? `
            <div class="error-message">${ctx.errors.value.submit}</div>
          ` : ''}

          <button type="submit" ${ctx.isDisabled() ? 'disabled' : ''}>
            ${ctx.state.value === "submitting" ? "Submitting..." : "Submit"}
          </button>
        </form>
      `}

      <div class="state-diagram">
        <p>States: idle → editing → validating → submitting → success/error</p>
      </div>
    </div>
  `,
  style: `
    .state-machine-form { max-width: 400px; margin: 0 auto; }
    .state-indicator { padding: 10px; background: #e9ecef; border-radius: 4px; margin-bottom: 20px; text-align: center; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 5px; }
    .form-group input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
    .error { color: #dc3545; font-size: 14px; }
    .error-message { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
    .success-message { text-align: center; padding: 30px; background: #d4edda; border-radius: 8px; }
    button { width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { background: #6c757d; }
    .state-diagram { margin-top: 20px; padding: 10px; background: #f8f9fa; border-radius: 4px; font-size: 12px; color: #666; }
  `
});
```

---

## Multi-Step Wizard

State management for a multi-step form wizard.

```javascript
app.component("FormWizard", {
  setup({ signal }) {
    const currentStep = signal(1);
    const totalSteps = 3;
    const formData = signal({
      // Step 1
      firstName: "",
      lastName: "",
      // Step 2
      email: "",
      phone: "",
      // Step 3
      plan: "basic",
      terms: false
    });

    function updateField(field, value) {
      formData.value = { ...formData.value, [field]: value };
    }

    function nextStep() {
      if (currentStep.value < totalSteps) {
        currentStep.value++;
      }
    }

    function prevStep() {
      if (currentStep.value > 1) {
        currentStep.value--;
      }
    }

    function goToStep(step) {
      if (step >= 1 && step <= totalSteps) {
        currentStep.value = step;
      }
    }

    function submit() {
      console.log("Submitted:", formData.value);
      alert("Form submitted! Check console for data.");
    }

    const progress = () => ((currentStep.value - 1) / (totalSteps - 1)) * 100;

    return { currentStep, totalSteps, formData, updateField, nextStep, prevStep, goToStep, submit, progress };
  },
  template: (ctx) => `
    <div class="form-wizard">
      <div class="progress-bar">
        <div class="progress" style="width: ${ctx.progress()}%"></div>
      </div>

      <div class="steps-indicator">
        ${[1, 2, 3].map(step => `
          <div
            key="${step}"
            class="step ${step === ctx.currentStep.value ? 'active' : ''} ${step < ctx.currentStep.value ? 'completed' : ''}"
            @click="() => goToStep(${step})"
          >
            ${step}
          </div>
        `).join('')}
      </div>

      <div class="step-content">
        ${ctx.currentStep.value === 1 ? `
          <h3>Personal Information</h3>
          <div class="form-group">
            <label>First Name</label>
            <input
              type="text"
              value="${ctx.formData.value.firstName}"
              @input="(e) => updateField('firstName', e.target.value)"
            />
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value="${ctx.formData.value.lastName}"
              @input="(e) => updateField('lastName', e.target.value)"
            />
          </div>
        ` : ctx.currentStep.value === 2 ? `
          <h3>Contact Details</h3>
          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              value="${ctx.formData.value.email}"
              @input="(e) => updateField('email', e.target.value)"
            />
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value="${ctx.formData.value.phone}"
              @input="(e) => updateField('phone', e.target.value)"
            />
          </div>
        ` : `
          <h3>Choose Your Plan</h3>
          <div class="plan-options">
            ${['basic', 'pro', 'enterprise'].map(plan => `
              <label key="${plan}" class="plan-option ${ctx.formData.value.plan === plan ? 'selected' : ''}">
                <input
                  type="radio"
                  name="plan"
                  value="${plan}"
                  ${ctx.formData.value.plan === plan ? 'checked' : ''}
                  @change="() => updateField('plan', '${plan}')"
                />
                ${plan.charAt(0).toUpperCase() + plan.slice(1)}
              </label>
            `).join('')}
          </div>
          <label class="terms">
            <input
              type="checkbox"
              ${ctx.formData.value.terms ? 'checked' : ''}
              @change="(e) => updateField('terms', e.target.checked)"
            />
            I agree to the terms and conditions
          </label>
        `}
      </div>

      <div class="wizard-actions">
        <button
          @click="prevStep"
          ${ctx.currentStep.value === 1 ? 'disabled' : ''}
        >
          Previous
        </button>
        ${ctx.currentStep.value < ctx.totalSteps ? `
          <button class="primary" @click="nextStep">Next</button>
        ` : `
          <button class="primary" @click="submit" ${!ctx.formData.value.terms ? 'disabled' : ''}>
            Submit
          </button>
        `}
      </div>
    </div>
  `,
  style: `
    .form-wizard { max-width: 500px; margin: 0 auto; }
    .progress-bar { height: 4px; background: #e9ecef; border-radius: 2px; margin-bottom: 30px; }
    .progress { height: 100%; background: #007bff; border-radius: 2px; transition: width 0.3s; }
    .steps-indicator { display: flex; justify-content: center; gap: 20px; margin-bottom: 30px; }
    .step { width: 40px; height: 40px; border-radius: 50%; background: #e9ecef; display: flex; align-items: center; justify-content: center; cursor: pointer; font-weight: bold; }
    .step.active { background: #007bff; color: white; }
    .step.completed { background: #28a745; color: white; }
    .step-content { min-height: 200px; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 5px; }
    .form-group input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
    .plan-options { display: flex; gap: 10px; margin-bottom: 20px; }
    .plan-option { flex: 1; padding: 20px; border: 2px solid #ddd; border-radius: 8px; text-align: center; cursor: pointer; }
    .plan-option.selected { border-color: #007bff; background: #f0f7ff; }
    .plan-option input { display: none; }
    .terms { display: flex; align-items: center; gap: 10px; }
    .wizard-actions { display: flex; justify-content: space-between; margin-top: 30px; }
    .wizard-actions button { padding: 10px 30px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; }
    .wizard-actions button.primary { background: #007bff; color: white; border-color: #007bff; }
    .wizard-actions button:disabled { opacity: 0.5; cursor: not-allowed; }
  `
});
```

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

Creating new references ensures proper DOM diffing and clearer state changes:

```javascript
// ❌ Wrong: Mutating array then reassigning
items.value.push(newItem);
items.value = items.value; // Confusing - mutation already happened

// ✅ Correct: Create new array
items.value = [...items.value, newItem];

// ❌ Wrong: Mutating object then reassigning
user.value.name = "Alice";
user.value = user.value; // Confusing - mutation already happened

// ✅ Correct: Create new object
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
| **60 fps** | 16.67ms | ~1,700 renders possible |
| **120 fps** | 8.33ms | ~833 renders possible |
| **240 fps** | 4.17ms | ~417 renders possible |

### Benchmark Results

| Scenario | Ops/Second | Avg Render Time |
|----------|-----------|-----------------|
| Simple counter | 24,428 | 0.041ms |
| Position animation | 50,928 | 0.020ms |
| 5 signals batched | 31,403 | 0.032ms |
| 100-item list | 1,453 | 0.688ms |
| Complex template | 6,369 | 0.157ms |

With an average render time of **0.010ms**, Eleva can theoretically achieve **100,000+ fps** for simple updates. Even the heaviest workload (100-item list) fits comfortably within a 240fps frame budget.

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

[← Back to Patterns](./index.md) | [Previous: Lists](./lists.md) | [Next: Local Storage →](./storage.md)
