---
title: Eleva.js Architecture & Data Flow
description: Understand Eleva's internal architecture, data flow patterns, and how components interact. Visual diagrams and detailed explanations.
image: /imgs/eleva.js%20Full%20Logo.png
---

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Eleva.js Architecture & Data Flow",
  "description": "Understand Eleva's internal architecture, data flow patterns, and how components interact. Visual diagrams and detailed explanations.",
  "image": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png",
  "datePublished": "2026-01-01T00:00:00Z",
  "dateModified": "2026-01-17T00:00:00Z",
  "author": {
    "@type": "Person",
    "name": "Tarek Raafat",
    "email": "tarek.m.raaf@gmail.com",
    "url": "https://github.com/TarekRaafat"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Eleva.js",
    "url": "https://elevajs.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://elevajs.com/architecture.html"
  },
  "proficiencyLevel": "Intermediate",
  "articleSection": "Documentation",
  "keywords": ["eleva", "elevajs", "Eleva.js", "architecture", "data flow", "component interaction", "signals", "renderer"]
}
</script>

# Architecture & Data Flow

> **Core Docs** | Data flow, component interaction, and internal architecture.

Eleva's design emphasizes clarity, modularity, and performance.

---

## Key Components

### 1. Component Definition

Components are plain JavaScript objects that describe a UI segment:

- **`template`** function - Returns HTML with interpolation placeholders
- **`setup()`** function - Initializes state using reactive signals (optional)
- **`style`** function - Scoped CSS (optional)
- **`children`** object - Nested components (optional)

### 2. Signals (Reactivity)

Signals are reactive data holders that notify watchers when their values change, triggering re-renders of the affected UI.

### 3. TemplateEngine (Evaluation)

Evaluates expressions in `@events` and `:props` attributes against the component context, enabling event binding and prop passing.

### 4. Renderer (DOM Diffing and Patching)

Compares the new HTML structure with the current DOM and patches only the parts that have changed, ensuring high performance without virtual DOM overhead.

### 5. Emitter (Event Handling)

Implements a publish-subscribe pattern to allow components to communicate by emitting and listening to custom events.

---

## Data Flow Process

### 1. Initialization

- **Registration:** Components are registered via `app.component()`
- **Mounting:** `app.mount()` creates a context (props, lifecycle hooks, emitter) and executes `setup()` to create reactive state

### 2. Rendering

- The **template** function is called with the combined context and reactive state
- JavaScript template literals (`${}`) interpolate values directly
- The **TemplateEngine** evaluates `@events` and `:props` expressions
- The **Renderer** patches the resulting HTML into the DOM

### 3. Reactivity

- When a signal's value changes, its watcher triggers a re-run of the template
- The Renderer diffs the new HTML against the current DOM
- Only necessary changes are applied

### 4. Events

- Event listeners (e.g., `@click`) are bound during rendering
- Handlers execute with the current state and event details
- Components can emit custom events via the Emitter

---

## Visual Overview

```
[Component Registration]
         │
         ▼
[Mounting & Context Creation]
         │
         ▼
[setup() Execution → Creates Signals]
         │
         ▼
[Template Function Produces HTML]
         │
         ▼
    onBeforeMount
         │
         ▼
[Renderer: Diff → Patch DOM]
         │
         ▼
[Process @events & :props]
         │
         ▼
[Inject Scoped Styles]
         │
         ▼
[Mount Child Components]
         │
         ▼
      onMount
         │
         ▼
┌────────────────────────────────────────────┐
│            ↺ REACTIVE CYCLE                │
├────────────────────────────────────────────┤
│                                            │
│  [Idle: Waiting for Signal Change] ◄───┐   │
│           │                            │   │
│           ▼                            │   │
│  [User Event / Signal Change / Emit]   │   │
│           │                            │   │
│           ▼                            │   │
│  [queueMicrotask Batches Updates]      │   │
│           │                            │   │
│           ▼                            │   │
│  [Template Re-evaluation]              │   │
│           │                            │   │
│           ▼                            │   │
│     onBeforeUpdate                     │   │
│           │                            │   │
│           ▼                            │   │
│  [Renderer: Diff → Patch DOM]          │   │
│           │                            │   │
│           ▼                            │   │
│  [Process @events & :props]            │   │
│           │                            │   │
│           ▼                            │   │
│       onUpdate ────────────────────────┘   │
│                                            │
└────────────────────────────────────────────┘
```

---

## Detailed Architecture Flow

For contributors or developers seeking a deeper understanding:

```
              [Component Registration]
                         │
                         ▼
              [Mounting & Context Creation]
              • props passed to context
              • emitter reference (shared instance)
              • signal factory function
                         │
                         ▼
              [setup() Execution]
              • Creates signals via factory
              • Returns state + lifecycle hooks
                         │
                         ▼
             [Template Function Produces HTML]
             • Template literals ${} evaluated
             • Returns HTML string
                         │
                         ▼
                  ─ onBeforeMount ─
                         │
                         ▼
            [Renderer: Diff → Patch]
            • Two-pointer diffing algorithm
            • Key-based reconciliation
            • Minimal DOM mutations
                         │
                         ▼
            [TemplateEngine Processes]
            • Evaluates @event expressions
            • Binds event listeners to DOM
            • Evaluates :prop expressions
                         │
                         ▼
               [Inject Scoped Styles]
                         │
                         ▼
              [Mount Child Components]
                         │
                         ▼
                    ─ onMount ─
                         │
                         ▼
┌────────────────────────────────────────────────────┐
│                 ↺ REACTIVE CYCLE                   │
├────────────────────────────────────────────────────┤
│                                                    │
│       [Idle: Waiting for Signal Change] ◄──────┐   │
│                        │                       │   │
│    ┌───────────────────┼───────────────────┐   │   │
│    ▼                   ▼                   ▼   │   │
│ [User Event]    [Signal.value = x]  [emitter]  │   │
│    │                   │                   │   │   │
│    └───────────────────┼───────────────────┘   │   │
│                        ▼                       │   │
│             [queueMicrotask Batching]          │   │
│             • Multiple changes collapsed       │   │
│             • Single render scheduled          │   │
│                        │                       │   │
│                        ▼                       │   │
│             [Template Re-evaluation]           │   │
│                        │                       │   │
│                        ▼                       │   │
│                ─ onBeforeUpdate ─              │   │
│                        │                       │   │
│                        ▼                       │   │
│              [Renderer: Diff → Patch]          │   │
│                        │                       │   │
│                        ▼                       │   │
│            [TemplateEngine Processes]          │   │
│            • Re-binds @events                  │   │
│            • Re-evaluates :props               │   │
│                        │                       │   │
│                        ▼                       │   │
│                   ─ onUpdate ──────────────────┘   │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     ELEVA DATA FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Component Registration]                                   │
│          │                                                  │
│          ▼                                                  │
│  [Mounting & Context Creation]                              │
│          │                                                  │
│          ▼                                                  │
│  [setup() Execution] ──► Returns { state, hooks }           │
│          │                                                  │
│          ▼                                                  │
│  [template() Produces HTML]                                 │
│          │                                                  │
│          ▼                                                  │
│  [onBeforeMount]                                            │
│          │                                                  │
│          ▼                                                  │
│  [Renderer.patchDOM()] ──► Diff & patch changes             │
│          │                                                  │
│          ▼                                                  │
│  [TemplateEngine] ──► Bind @events, eval :props             │
│          │                                                  │
│          ▼                                                  │
│      [onMount]                                              │
│          │                                                  │
│          ▼                                                  │
│  ┌─────────────────── ↺ REACTIVE CYCLE ───────────────────┐ │
│  │                                                        │ │
│  │  [Idle: Waiting] ◄─────────────────────────────────┐   │ │
│  │        │                                           │   │ │
│  │        ▼                                           │   │ │
│  │  [User Interaction] ──► Event Handler              │   │ │
│  │        │                                           │   │ │
│  │        ▼                                           │   │ │
│  │  [signal.value = newValue]                         │   │ │
│  │        │                                           │   │ │
│  │        ▼                                           │   │ │
│  │  [queueMicrotask batching]                         │   │ │
│  │        │                                           │   │ │
│  │        ▼                                           │   │ │
│  │  [template() Re-evaluation]                        │   │ │
│  │        │                                           │   │ │
│  │        ▼                                           │   │ │
│  │  [onBeforeUpdate]                                  │   │ │
│  │        │                                           │   │ │
│  │        ▼                                           │   │ │
│  │  [Renderer.patchDOM()]                             │   │ │
│  │        │                                           │   │ │
│  │        ▼                                           │   │ │
│  │  [TemplateEngine] ──► Re-bind @events              │   │ │
│  │        │                                           │   │ │
│  │        ▼                                           │   │ │
│  │  [onUpdate] ───────────────────────────────────────┘   │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Benefits

| Benefit | Description |
|---------|-------------|
| **Modularity** | Each component encapsulates its own logic and state |
| **Efficiency** | Only changed DOM parts are updated |
| **Predictability** | One-way data flow (state → template → DOM) |
| **Extensibility** | Clear separation of concerns enables plugins |

---

## Module Interaction

```
┌─────────────────────────────────────────────────────────────┐
│                      Eleva (Core)                           │
│                                                             │
│  ┌─────────┐    ┌────────────────┐    ┌──────────────────┐  │
│  │ Signal  │◄──►│ TemplateEngine │◄──►│     Renderer     │  │
│  └─────────┘    └────────────────┘    └──────────────────┘  │
│       │                │                      │             │
│       │                │                      │             │
│       ▼                ▼                      ▼             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Component                          │  │
│  │  • setup() creates signals                            │  │
│  │  • template() uses TemplateEngine for @events/:props  │  │
│  │  • Renderer patches DOM on signal changes             │  │
│  └───────────────────────────────────────────────────────┘  │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────┐                                                │
│  │ Emitter │ ◄── Inter-component communication              │
│  └─────────┘                                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Steps

- **[Plugin System](./plugin-system.md)** - Creating and using plugins
- **[Best Practices](./best-practices.md)** - Patterns and guidelines
- **[API Reference](./index.md#api-reference)** - Complete API documentation

---

[← Components](./components.md) | [Back to Main Docs](./index.md) | [Plugin System →](./plugin-system.md)
