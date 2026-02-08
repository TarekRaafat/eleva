---
title: Agent API Reference
description: Eleva Agent API reference. All methods (execute, dispatch, getLog, snapshot), TypeScript types, troubleshooting, and permission configuration guide.
---

<link rel="canonical" href="https://elevajs.com/plugins/agent/api.html">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://elevajs.com/plugins/agent/api.html">
<meta property="og:title" content="Agent API Reference - Eleva.js">
<meta property="og:description" content="Eleva Agent API reference. All methods (execute, dispatch, getLog, snapshot), TypeScript types, troubleshooting, and permission configuration guide.">
<meta property="og:image" content="https://elevajs.com/imgs/eleva.js%20Full%20Logo.png">
<meta property="og:site_name" content="Eleva.js">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://elevajs.com/plugins/agent/api.html">
<meta name="twitter:title" content="Agent API Reference - Eleva.js">
<meta name="twitter:description" content="Eleva Agent API reference. All methods (execute, dispatch, getLog, snapshot), TypeScript types, troubleshooting, and permission configuration guide.">
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
  "@type": "TechArticle",
  "headline": "Eleva.js Agent API Reference",
  "description": "Complete API reference for Eleva Agent plugin including methods, TypeScript support, troubleshooting, and permission configuration.",
  "image": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png",
  "datePublished": "2026-02-08T00:00:00Z",
  "dateModified": "2026-02-08T00:00:00Z",
  "author": {
    "@type": "Person",
    "name": "Tarek Raafat",
    "url": "https://github.com/TarekRaafat",
    "email": "tarek.m.raafat@gmail.com"
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
    "@id": "https://elevajs.com/plugins/agent/api.html"
  },
  "articleSection": "Plugins",
  "keywords": ["eleva agent", "API reference", "agent methods", "execute", "dispatch", "audit log", "TypeScript"]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://elevajs.com/" },
    { "@type": "ListItem", "position": 2, "name": "Plugins", "item": "https://elevajs.com/plugins/" },
    { "@type": "ListItem", "position": 3, "name": "Agent", "item": "https://elevajs.com/plugins/agent/" },
    { "@type": "ListItem", "position": 4, "name": "API Reference", "item": "https://elevajs.com/plugins/agent/api.html" }
  ]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Why do I get 'Action not found' error?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Check that: (1) The action was registered with agent.register() before calling execute(). (2) The action name is spelled correctly and matches exactly. (3) The action hasn't been removed with agent.unregister()."
      }
    },
    {
      "@type": "Question",
      "name": "Why do I get 'Permission denied' error?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Permission denied occurs when: (1) A scope is provided but not listed in the permissions config. (2) The scope exists but doesn't include the action/command name. (3) strictPermissions is true and no scope was provided. Add the action/command to the scope's allowed list in the permissions option."
      }
    },
    {
      "@type": "Question",
      "name": "How do I capture plugin events in the audit log?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pass emitter event prefixes in the emitterEvents option: app.use(Agent, { emitterEvents: ['router:', 'store:'] }). The Agent wraps eleva.emitter.emit to intercept matching events. Both the Router (router:*) and Store (store:dispatch, store:mutate, store:error, store:register, store:unregister) emit events via the shared emitter."
      }
    },
    {
      "@type": "Question",
      "name": "Why doesn't ctx.agent have inspect/snapshot/diff methods?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "These methods are only available when enableInspection is true (the default). If you explicitly set enableInspection: false, these methods are omitted from the ctx.agent API for security in production environments."
      }
    },
    {
      "@type": "Question",
      "name": "Can I install the Agent plugin alongside the Store plugin?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Agent and Store use namespaced internal properties (_agent_originalMount vs _originalMount) to avoid collisions. Both plugins can wrap eleva.mount independently. Install order does not matter for correctness, but uninstall in reverse order (LIFO) for clean teardown."
      }
    }
  ]
}
</script>

# Agent API Reference

> **Agent Plugin** | Complete API reference.

---

## Agent Access

The Agent plugin provides two access points with slightly different APIs:

**`ctx.agent` (in component setup):**
Available methods: `register`, `unregister`, `execute`, `executeBatch`, `executeSequence`, `hasAction`, `describeAction`, `listActions`, `describe`, `dispatch`, `onCommand`, `getLog`, `clearLog`, and optionally `inspect`, `snapshot`, `diff`

**`app.agent` (full Agent instance):**
All of the above (as internal methods), plus direct access to internal state for advanced use cases.

```javascript
// In component setup - use ctx.agent
app.component("MyComponent", {
  setup({ agent }) {
    // agent.register, agent.execute, etc. are available
  }
});

// Outside components - use app.agent or convenience methods
app.agentExecute("actionName", payload);
app.agentDispatch({ type: "COMMAND" });
```

---

## Action Registry Methods

### register(name, handler, schema?)

Registers a callable action with an optional typed schema.

> **Note:** If an action with the same name already exists, it is silently overwritten. The handler must be a function or an error is thrown.

```javascript
// Signature
agent.register(name: string, handler: Function, schema?: AgentActionSchema): void

// Simple action
agent.register("greet", (payload) => `Hello, ${payload.name}!`);

// Action with schema
agent.register("calculate", (payload) => payload.a + payload.b, {
  input: { a: "number", b: "number" },
  output: "number",
  errors: ["INVALID_INPUT"]
});

// Async action
agent.register("fetchUser", async (payload) => {
  const response = await fetch(`/api/users/${payload.id}`);
  return response.json();
}, {
  input: { id: "string" },
  output: "User"
});
```

### unregister(name)

Removes a registered action. Warns if the action does not exist.

```javascript
// Signature
agent.unregister(name: string): void

// Example
agent.unregister("greet");
// Console warning if not found: [AgentPlugin] Action "greet" not found for unregister
```

### execute(name, payload?, scope?)

Executes a registered action. Always returns a Promise regardless of whether the handler is sync or async.

> **Note:** Permission is checked before execution. If the action is not found or permission is denied, the error is passed to `onError` (if configured) and then thrown. Each error path fires `onError` exactly once.

```javascript
// Signature
agent.execute(name: string, payload?: unknown, scope?: string): Promise<unknown>

// Simple execution
const greeting = await agent.execute("greet", { name: "World" });

// With scope for permission check
const result = await agent.execute("calculate", { a: 2, b: 3 }, "ui-agent");

// Error handling
try {
  await agent.execute("nonExistent");
} catch (error) {
  console.error(error.message); // [AgentPlugin] Action "nonExistent" not found
}
```

### hasAction(name)

Checks if an action is registered.

```javascript
// Signature
agent.hasAction(name: string): boolean

// Example
if (agent.hasAction("greet")) {
  await agent.execute("greet", { name: "World" });
}
```

### describeAction(name)

Returns the descriptor for a registered action, including its schema. Returns `null` if the action is not found.

```javascript
// Signature
agent.describeAction(name: string): AgentActionDescriptor | null

// Example
const descriptor = agent.describeAction("calculate");
// { name: "calculate", schema: { input: { a: "number", b: "number" }, output: "number" } }

const missing = agent.describeAction("nonExistent");
// null
```

### listActions()

Returns an array of all registered action descriptors.

```javascript
// Signature
agent.listActions(): AgentActionDescriptor[]

// Example
const actions = agent.listActions();
// [
//   { name: "greet", schema: null },
//   { name: "calculate", schema: { input: { a: "number", b: "number" }, output: "number" } }
// ]
```

---

## Command Bus Methods

### dispatch(command, scope?)

Dispatches a structured command to all registered handlers for that command type. Handlers are called sequentially. Handler errors are caught and passed to `onError` without stopping subsequent handlers.

> **Note:** The command must have a string `type` property. Permission is checked before dispatch. The command is logged in the audit log.

```javascript
// Signature
agent.dispatch(command: AgentCommand, scope?: string): Promise<void>

// Basic dispatch
await agent.dispatch({ type: "UPDATE_UI", payload: { theme: "dark" } });

// With target and scope
await agent.dispatch(
  { type: "REFRESH", target: "Dashboard", payload: { force: true } },
  "ui-agent"
);
```

### onCommand(type, handler)

Registers a handler for a command type. Returns an unsubscribe function. Multiple handlers can be registered for the same command type.

```javascript
// Signature
agent.onCommand(type: string, handler: Function): () => void

// Register handler
const unsubscribe = agent.onCommand("UPDATE_UI", async (command) => {
  console.log("Target:", command.target);
  console.log("Payload:", command.payload);
});

// Later: stop handling
unsubscribe();
```

---

## Audit Log Methods

### getLog(filter?)

Returns audit log entries, optionally filtered by type, timestamp, or action name.

```javascript
// Signature
agent.getLog(filter?: AgentLogFilter): AgentLogEntry[]

// Get all entries
const allLogs = agent.getLog();

// Filter by type
const actionLogs = agent.getLog({ type: "action" });
const commandLogs = agent.getLog({ type: "command" });
const eventLogs = agent.getLog({ type: "event" });

// Filter by timestamp
const recentLogs = agent.getLog({ since: Date.now() - 60000 }); // Last minute

// Filter by action name
const greetLogs = agent.getLog({ action: "greet" });

// Combined filters
const recentActions = agent.getLog({
  type: "action",
  since: Date.now() - 60000
});
```

### clearLog()

Clears all audit log entries.

```javascript
// Signature
agent.clearLog(): void

// Example
agent.clearLog();
console.log(agent.getLog().length); // 0
```

---

## State Inspection Methods

> **Note:** When `enableInspection` is `false`, these methods are **omitted entirely** from the `ctx.agent` API in components — they will be `undefined`. If you call them directly on `app.agent` (the internal instance), they will log a warning and return empty results. The default is `enableInspection: true`.

### inspect()

Returns information about the component registry.

```javascript
// Signature
agent.inspect(): object

// Example
const info = agent.inspect();
// {
//   components: [
//     { name: "Counter", hasSetup: true, hasTemplate: true, hasChildren: false, hasStyle: false },
//     { name: "Dashboard", hasSetup: true, hasTemplate: true, hasChildren: true, hasStyle: true }
//   ]
// }
```

### snapshot()

Creates a serializable snapshot of the current application state, including registered components and publicly registered plugins.

> **Note:** The plugin list uses `eleva.plugins` (the public Map maintained by each plugin's install/uninstall) as the sole authoritative source. Plugins that don't register there won't appear in the snapshot.

```javascript
// Signature
agent.snapshot(): AgentSnapshot

// Example
const snap = agent.snapshot();
// {
//   timestamp: 1707321600000,
//   components: [
//     { name: "Counter", hasSetup: true, hasChildren: false },
//     { name: "Dashboard", hasSetup: true, hasChildren: true }
//   ],
//   plugins: ["attr", "agent"]
// }
```

### diff(snapshotA, snapshotB)

Compares two snapshots and returns which components were added or removed between them.

```javascript
// Signature
agent.diff(snapshotA: AgentSnapshot, snapshotB: AgentSnapshot): AgentDiffResult

// Example
const snap1 = agent.snapshot();

// ... register a new component ...
app.component("NewWidget", { template: () => `<div>New</div>` });

const snap2 = agent.snapshot();
const changes = agent.diff(snap1, snap2);
// { added: ["NewWidget"], removed: [] }
```

---

## Eleva Instance Shortcuts

The plugin also adds shortcuts to the Eleva instance:

```javascript
// These are equivalent:
app.agent.execute("action", payload, scope);
app.agentExecute("action", payload, scope);

app.agent.dispatch(command, scope);
app.agentDispatch(command, scope);
```

---

## Emitter Events

The Agent plugin emits events via `eleva.emitter` for cross-plugin observability. These events fire automatically during normal Agent operations and can be listened to by any component or plugin. All emitter events are **failure-isolated** — if a listener throws, the Agent operation completes normally.

| Event | Fired When | Payload |
|-------|-----------|---------|
| `agent:register` | After an action is registered | `{ name, hasSchema, timestamp }` |
| `agent:unregister` | After an action is unregistered | `{ name, timestamp }` |
| `agent:execute` | After a successful action execution | `{ name, payload, result, durationMs, timestamp }` |
| `agent:execute:error` | After a failed action execution | `{ name, payload, error, durationMs, timestamp }` |
| `agent:dispatch` | After a command is dispatched | `{ type, target, payload, errors?, durationMs, timestamp }` |

```javascript
// Listen for Agent events directly
app.emitter.on("agent:execute", (data) => {
  console.log(`Action "${data.name}" completed in ${data.durationMs}ms`);
});

// Capture in another Agent instance's audit log
app.use(Agent, {
  emitterEvents: ["agent:"]
});
```

---

## Reactive Signals

The Agent plugin exposes two reactive signals on `ctx.agent` for template-driven monitoring.

### agent.actionCount

A `Signal<number>` that updates whenever an action is registered or unregistered. Reflects the current number of registered actions.

```javascript
app.component("ActionMonitor", {
  setup({ agent }) {
    agent.register("ping", () => "pong");
    // agent.actionCount.value === 1

    return { count: agent.actionCount };
  },
  template: (ctx) => `<p>Registered actions: ${ctx.count.value}</p>`
});
```

### agent.lastActivity

A `Signal<AgentLogEntry|null>` that updates on every audit log addition (actions, commands, and captured emitter events). Returns the most recent log entry or `null` if no activity has occurred.

```javascript
app.component("ActivityFeed", {
  setup({ agent }) {
    return { last: agent.lastActivity };
  },
  template: (ctx) => `
    <div>
      ${ctx.last.value
        ? `<p>Last: ${ctx.last.value.action} (${ctx.last.value.type})</p>`
        : `<p>No activity yet</p>`}
    </div>
  `
});
```

---

## Component Lifecycle

### Auto-cleanup on Unmount

Actions registered via `ctx.agent.register()` and command handlers registered via `ctx.agent.onCommand()` inside a component's `setup()` are automatically cleaned up when the component unmounts. This prevents memory leaks and stale action references without requiring manual cleanup.

- Actions registered in `setup()` are automatically unregistered on unmount
- Command handler subscriptions are automatically unsubscribed on unmount
- Any existing `onUnmount` callbacks are preserved and called before cleanup
- Cleanup runs even if `onUnmount` throws (via `try/finally`)
- If multiple components register the same action name, unmounting one does not remove it for others (reference-counted)
- If a scoped registration overwrites a pre-existing global action, unmounting restores the original global handler (snapshot/restore)
- A scoped `ctx.agent.unregister()` can only remove actions owned by that component; attempts to unregister actions owned by other components (or globally) are a no-op with a `console.warn`

```javascript
app.component("Ephemeral", {
  setup({ agent, onUnmount }) {
    // These are auto-cleaned when the component unmounts
    agent.register("tempAction", () => "temporary");
    agent.onCommand("TEMP_CMD", (cmd) => { /* ... */ });

    // Your own cleanup still runs first
    onUnmount(() => console.log("Component unmounting"));

    return {};
  },
  template: () => `<div>Temporary component</div>`
});
```

---

## Uninstalling the Plugin

The Agent plugin provides an `uninstall()` method to completely remove it from an Eleva instance.

### Agent.uninstall(app)

Removes the Agent plugin and restores the original Eleva behavior.

```javascript
import Eleva from "eleva";
import { Agent } from "eleva/plugins";

const app = new Eleva("MyApp");
app.use(Agent, {
  actions: { ping: () => "pong" }
});

// Use the agent...
await app.agentExecute("ping");

// Later, to completely remove the Agent plugin:
Agent.uninstall(app);

// After uninstall, these are removed:
// - app.agent (undefined)
// - app.agentExecute (undefined)
// - app.agentDispatch (undefined)
// - Original mount() method is restored
```

### What `Agent.uninstall()` Does

1. **Restores original methods:**
   - `app.mount` — restored to original
   - `app._mountComponents` — restored to original

2. **Removes added properties:**
   - `app.agent`
   - `app.agentExecute`
   - `app.agentDispatch`

3. **Destroys the agent instance:**
   - Sets `_destroyed` flag (neutralizes orphaned emitter wrapper)
   - Clears all actions, schemas, command handlers, and log entries
   - Restores the original `emitter.emit` if still owned by this wrapper

4. **Removes from plugin registry:**
   - `app.plugins.delete("agent")`

### When to Use

- Completely removing agent capabilities from your app
- Switching to a different agent integration approach
- Full app teardown/cleanup
- Testing scenarios requiring clean slate

### Uninstall Order (LIFO)

When using multiple plugins, uninstall in reverse order of installation:

```javascript
// Installation order
app.use(Attr);
app.use(Store, { state: {} });
app.use(Agent, { actions: {} });

// Uninstall in reverse order (LIFO)
Agent.uninstall(app);
Store.uninstall(app);
Attr.uninstall(app);
```

> **Note:** Agent's `uninstall()` is synchronous (not async), unlike Router's which is async.

---

## TypeScript Support

The Agent plugin includes TypeScript type definitions for full type safety.

### Basic Typed Agent

```typescript
import Eleva from "eleva";
import { Agent } from "eleva/plugins";
import type {
  AgentOptions,
  AgentActionSchema,
  AgentCommand,
  AgentLogEntry,
  AgentLogFilter,
  AgentSnapshot,
  AgentDiffResult,
  AgentActionDescriptor,
  AgentApi
} from "eleva/plugins/agent";

const app = new Eleva("TypedApp");

// Type-safe options
const options: AgentOptions = {
  maxLogSize: 200,
  enableInspection: true,
  onError: (error: Error, context: AgentErrorContext) => {
    console.error(`[${context.method}] ${context.code}:`, error);
  },
  actions: {
    greet: (payload: { name: string }) => `Hello, ${payload.name}!`
  },
  permissions: {
    "ui-agent": { actions: ["greet"], commands: ["UPDATE_UI"] }
  },
  strictPermissions: false
};

app.use(Agent, options);
```

### Typed Action Schemas

```typescript
// Define action schema
const calculateSchema: AgentActionSchema = {
  input: { a: "number", b: "number" },
  output: "number",
  errors: ["INVALID_INPUT", "OVERFLOW"]
};

// Register with schema
agent.register("calculate", (payload) => payload.a + payload.b, calculateSchema);

// Introspect the schema
const descriptor: AgentActionDescriptor | null = agent.describeAction("calculate");
if (descriptor) {
  console.log(descriptor.name);    // "calculate"
  console.log(descriptor.schema);  // { input: { a: "number", b: "number" }, ... }
}
```

### Typed Component Setup

```typescript
interface MyComponentContext {
  agent: AgentApi;
  signal: <T>(value: T) => Signal<T>;
  emitter: {
    on: (event: string, handler: Function) => void;
    emit: (event: string, data?: unknown) => void;
  };
}

app.component("TypedComponent", {
  setup({ agent, signal }: MyComponentContext) {
    const result = signal<string>("");

    const handleGreet = async () => {
      const greeting = await agent.execute("greet", { name: "World" }) as string;
      result.value = greeting;
    };

    return { result, handleGreet };
  },
  template: (ctx) => `
    <div>
      <p>${ctx.result.value}</p>
      <button @click="handleGreet">Greet</button>
    </div>
  `
});
```

### Typed Commands

```typescript
// Define a typed command
const command: AgentCommand = {
  type: "UPDATE_UI",
  target: "Dashboard",
  payload: { theme: "dark", sidebar: false }
};

// Dispatch with type safety
await agent.dispatch(command, "ui-agent");
```

### Typed Log Queries

```typescript
// Type-safe filter
const filter: AgentLogFilter = {
  type: "action",
  since: Date.now() - 3600000
};

const entries: AgentLogEntry[] = agent.getLog(filter);
entries.forEach((entry) => {
  console.log(entry.type);       // "action" | "command" | "event"
  console.log(entry.action);     // string
  console.log(entry.payload);    // unknown
  console.log(entry.timestamp);  // number
  console.log(entry.source);     // string
});
```

### Typed Snapshots

```typescript
const snap1: AgentSnapshot = agent.snapshot();

// ... make changes ...

const snap2: AgentSnapshot = agent.snapshot();
const diff: AgentDiffResult = agent.diff(snap1, snap2);

console.log(diff.added);    // string[]
console.log(diff.removed);  // string[]
```

---

## Troubleshooting

### Action Not Found

**Problem:** `Error: [AgentPlugin] Action "actionName" not found`

**Solutions:**

```javascript
// 1. Make sure the action is registered
agent.register("myAction", (payload) => { /* ... */ });

// 2. Check action name spelling
agent.execute("myAction");  // Must match exactly

// 3. Verify the action hasn't been unregistered
if (agent.hasAction("myAction")) {
  await agent.execute("myAction");
}
```

### Permission Denied

**Problem:** `Error: [AgentPlugin] Permission denied: scope "x" cannot execute "y"`

**Solutions:**

```javascript
// 1. Add the action to the scope's allowed list
app.use(Agent, {
  permissions: {
    "my-scope": { actions: ["actionName"] }
  }
});

// 2. If using strictPermissions, always provide a scope
await agent.execute("actionName", payload, "my-scope");

// 3. Without strictPermissions, omit scope for unrestricted access
await agent.execute("actionName", payload);

// 4. Check configured permissions
console.log(app.agent._permissions);
```

### Audit Log Empty

**Problem:** No entries in the audit log.

**Solutions:**

```javascript
// 1. Actions and commands are logged automatically
await agent.execute("myAction", payload);  // Creates log entry
console.log(agent.getLog());  // Should have entries

// 2. For emitter events, configure emitterEvents
// Both Router (router:*) and Store (store:*) emit events via eleva.emitter
app.use(Agent, {
  emitterEvents: ["router:", "store:"]  // Must specify prefixes
});

// 3. Check filter criteria
const all = agent.getLog();              // All entries
const filtered = agent.getLog({ type: "action" });  // Only actions
```

### Inspection Methods Missing

**Problem:** `agent.inspect()`, `agent.snapshot()`, or `agent.diff()` are undefined on `ctx.agent`.

When `enableInspection` is `false`, these methods are **omitted entirely** from the `ctx.agent` API injected into components. They won't exist as properties, so calling them throws a TypeError.

> **Note:** On `app.agent` (the internal instance), these methods always exist but log a warning and return empty results when inspection is disabled.

**Solutions:**

```javascript
// These require enableInspection: true (the default)
app.use(Agent, {
  enableInspection: true  // Explicitly enable
});

// Guard before calling in case inspection is disabled
if (agent.inspect) {
  const info = agent.inspect();
}
```

### Double Install Warning

**Problem:** `[AgentPlugin] Already installed. Uninstall first to reconfigure.`

**Solution:**

```javascript
// Uninstall before reinstalling
Agent.uninstall(app);
app.use(Agent, newOptions);
```

### Command Not Received

**Problem:** Command handler is not being called.

**Solutions:**

```javascript
// 1. Register handler BEFORE dispatching
const unsub = agent.onCommand("MY_CMD", handler);
await agent.dispatch({ type: "MY_CMD" });  // Handler called

// 2. Check command type spelling
agent.onCommand("MY_CMD", handler);
await agent.dispatch({ type: "MY_CMD" });  // Must match exactly

// 3. Verify handler wasn't unsubscribed
const unsub = agent.onCommand("MY_CMD", handler);
unsub();  // This removes the handler
await agent.dispatch({ type: "MY_CMD" });  // Handler NOT called
```

---

## LLM Contract

A compact, machine-oriented reference for AI models generating Eleva Agent code. Every method, its exact signature, what it returns, when it throws, and what side effects it produces.

### Method Reference

| Method | Arguments | Returns | Throws | Side Effects |
|--------|-----------|---------|--------|--------------|
| `register` | `(name: string, handler: Function, schema?: AgentActionSchema)` | `void` | `AGENT_DESTROYED`, `AGENT_HANDLER_NOT_FUNCTION` | Overwrites existing action with same name silently |
| `unregister` | `(name: string)` | `void` | `AGENT_DESTROYED` | `console.warn` if action not found |
| `execute` | `(name: string, payload?: unknown, scope?: string)` | `Promise<unknown>` | `AGENT_DESTROYED`, `AGENT_PERMISSION_DENIED`, `AGENT_ACTION_NOT_FOUND`, `AGENT_SCHEMA_VIOLATION`, `AGENT_HANDLER_ERROR` (or custom handler code) | Permission check → schema validation (opt-in) → handler invocation → audit log with outcome |
| `executeBatch` | `(actions: Array<{action, payload?}>, scope?: string)` | `Promise<unknown[]>` | `AGENT_DESTROYED`, first error from any action | Executes all actions in parallel via `Promise.all` |
| `executeSequence` | `(actions: Array<{action, payload?}>, scope?: string)` | `Promise<unknown>` | `AGENT_DESTROYED`, first error in sequence | Executes actions sequentially, piping each result as next payload |
| `hasAction` | `(name: string)` | `boolean` | Never | None |
| `describeAction` | `(name: string)` | `AgentActionDescriptor \| null` | Never | None |
| `listActions` | `()` | `AgentActionDescriptor[]` | Never | None |
| `describe` | `(scope?: string)` | `AgentCapabilityManifest` | Never | None |
| `dispatch` | `(command: AgentCommand, scope?: string)` | `Promise<void>` | `AGENT_DESTROYED`, `AGENT_COMMAND_INVALID_TYPE`, `AGENT_PERMISSION_DENIED` | Permission check → all handlers called sequentially → audit log with outcome |
| `onCommand` | `(type: string, handler: Function)` | `() => void` (unsubscribe) | `AGENT_DESTROYED`, `AGENT_HANDLER_NOT_FUNCTION` | None |
| `getLog` | `(filter?: AgentLogFilter)` | `AgentLogEntry[]` | Never | None |
| `clearLog` | `()` | `void` | `AGENT_DESTROYED` | None |
| `inspect` | `()` | `object` | Never | `console.warn` if inspection disabled; returns `{ components: [] }` |
| `snapshot` | `()` | `AgentSnapshot` | Never | `console.warn` if inspection disabled; returns empty snapshot |
| `diff` | `(snapA: AgentSnapshot, snapB: AgentSnapshot)` | `AgentDiffResult` | Never | None |

> **Note on `ctx.agent` vs `app.agent`:** When `enableInspection: false`, the methods `inspect`, `snapshot`, and `diff` are **omitted entirely** from `ctx.agent` (they are `undefined`). On `app.agent`, they always exist but warn and return empty results.

### Type Definitions

```typescript
AgentActionSchema       = { input?: Record<string, string>, output?: string, errors?: string[] }
AgentActionDescriptor   = { name: string, schema: AgentActionSchema | null }
AgentCommand            = { type: string, target?: string, payload?: unknown }
AgentLogEntry           = { type: "action"|"command"|"event", action: string, payload: unknown, timestamp: number, source: string, result?: unknown, error?: string, durationMs?: number }
AgentLogFilter          = { type?: "action"|"command"|"event", since?: number, action?: string, status?: "ok"|"error" }
AgentSnapshot           = { timestamp: number, components: object[], plugins: string[] }
AgentDiffResult         = { added: string[], removed: string[] }
AgentPermissionRule     = { actions?: string[], commands?: string[] }
AgentErrorContext       = { method: string, code: string, action?: string, scope?: string, commandType?: string }
AgentCapabilityManifest = { actions: Array<{name: string, schema: AgentActionSchema|null, allowed: boolean}>, commands: string[], permissions: {scope: string, actions: string[], commands: string[]}|null, config: {strictPermissions: boolean, maxLogSize: number, inspectionEnabled: boolean, validateSchemas: boolean} }
AgentOptions            = { maxLogSize?: number, enableInspection?: boolean, onError?: (error: Error, context: AgentErrorContext) => void, actions?: Record<string, Function>, permissions?: Record<string, AgentPermissionRule>, emitterEvents?: string[], strictPermissions?: boolean, validateSchemas?: boolean }
```

### Execution Order

**`execute(name, payload, scope)`:** permission check → schema validation (if `validateSchemas: true`) → `await handler(payload)` → audit log entry with result/error/durationMs. If handler throws, `onError(error, { method, code, action })` is called once, then the error is re-thrown. Log entry is written **after** handler completes (success or failure).

**`dispatch(command, scope)`:** validate command.type is string → permission check → call all `onCommand` handlers sequentially → audit log entry with durationMs and any handler errors. If a handler throws, `onError(error, { method, code, commandType })` is called, but remaining handlers still execute. Log entry is written **after** all handlers complete.

> **Failure isolation:** Both `onError` callbacks and emitter event listeners are failure-isolated — if they throw, the Agent operation completes normally. This ensures that observability hooks never alter core control flow.

### Audit Log Entry `source` Field

| Entry Type | `source` value |
|------------|----------------|
| `"action"` | `scope` parameter, or `"global"` if no scope |
| `"command"` | `command.target`, else `scope`, else `"global"` |
| `"event"` | Always `"emitter"` |

---

## Error Catalog

Every error and warning the Agent plugin can produce, with exact strings and trigger conditions.

### Thrown Errors (9)

All thrown errors have a machine-readable `error.code` property for programmatic error handling.

| # | Code | Method | Exact Message | Trigger |
|---|------|--------|---------------|---------|
| 1 | `AGENT_DESTROYED` | `register()`, `unregister()`, `execute()`, `executeBatch()`, `executeSequence()`, `dispatch()`, `onCommand()`, `clearLog()` | `[AgentPlugin] Agent has been destroyed. Create a new instance via app.use(AgentPlugin).` | Any mutating method called on a destroyed agent instance (stale reference after uninstall) |
| 2 | `AGENT_HANDLER_NOT_FUNCTION` | `register()` | `[AgentPlugin] Action handler must be a function` | `handler` argument is not a function |
| 3 | `AGENT_PERMISSION_DENIED` | `execute()` | `[AgentPlugin] Permission denied: scope "${scope}" cannot execute "${name}"` | Scope provided but not allowed for this action |
| 4 | `AGENT_ACTION_NOT_FOUND` | `execute()` | `[AgentPlugin] Action "${name}" not found` | Action name not in registry |
| 5 | `AGENT_SCHEMA_VIOLATION` | `execute()` | `[AgentPlugin] Schema violation for "${name}": ${violations}` | Payload fails schema validation (when `validateSchemas: true`) |
| 6 | `AGENT_COMMAND_INVALID_TYPE` | `dispatch()` | `[AgentPlugin] Command must have a string 'type'` | Command is falsy or `command.type` is not a string |
| 7 | `AGENT_PERMISSION_DENIED` | `dispatch()` | `[AgentPlugin] Permission denied: scope "${scope}" cannot dispatch "${command.type}"` | Scope provided but not allowed for this command |
| 8 | `AGENT_HANDLER_NOT_FUNCTION` | `onCommand()` | `[AgentPlugin] Command handler must be a function` | `handler` argument is not a function |
| 9 | `AGENT_HANDLER_ERROR` | `execute()` (thrown), `dispatch()` (caught) | _(original handler error message)_ | Handler threw without a pre-existing `error.code`. In `execute()`, re-thrown. In `dispatch()`, caught — passed to `onError` and logged, but dispatch still resolves. |

> **`onError` coverage:** Not all errors are passed to `onError`. The `AGENT_DESTROYED` errors, `register()` (invalid handler), `dispatch()` (invalid command type), and `onCommand()` (invalid handler) throw directly **without** calling `onError`. Only `execute()` and `dispatch()` invoke `onError(error, context)` — specifically on permission-denied, action-not-found, schema-violation, and handler errors. `context` is a structured `AgentErrorContext` object with `{ method, code, action?, scope?, commandType? }`. Handler errors that don't already have a `code` receive `AGENT_HANDLER_ERROR`.

### Console Warnings (4)

| # | Method | Exact Message | Trigger |
|---|--------|---------------|---------|
| 1 | `install()` | `[AgentPlugin] Already installed. Uninstall first to reconfigure.` | `app.use(Agent, ...)` called when Agent is already installed |
| 2 | `unregister()` | `[AgentPlugin] Action "${name}" not found for unregister` | Unregistering a name that doesn't exist (global API) |
| 3 | `unregister()` (scoped) | `[AgentPlugin] Scoped unregister ignored: "${name}" is not owned by this component` | Scoped `ctx.agent.unregister()` called for an action not owned by the current component |
| 4 | `inspect()` / `snapshot()` | `[AgentPlugin] Inspection is disabled. Enable with { enableInspection: true }` | Calling these on `app.agent` when inspection is disabled |

---

## Known Semantics

Behavioral rules that affect correctness. Read these before generating Agent code.

### Permission Decision Logic

```
_checkPermission(scope, kind, name):
│
├── strictPermissions: true
│   ├── No rules configured OR no scope provided → DENY
│   └── Rules exist AND scope provided → check specifics ↓
│
├── strictPermissions: false (default)
│   ├── No rules configured → ALLOW (zero-config path)
│   ├── Rules exist, no scope provided → ALLOW (trusted call)
│   └── Rules exist AND scope provided → check specifics ↓
│
└── Check specifics:
    ├── scope not in permissions object → DENY
    ├── kind ("actions"/"commands") not in scope rule → DENY
    └── name in allowed list → ALLOW, otherwise → DENY
```

> **Implication:** In default mode, passing an unrecognized scope is **worse** than passing no scope. No scope = unrestricted; unknown scope = denied.

### Idempotent Install

Calling `app.use(Agent, options)` when the Agent is already installed does **not** reconfigure it. It warns via `console.warn` and returns immediately. To change options, call `Agent.uninstall(app)` first, then `app.use(Agent, newOptions)`.

### Action Overwrite Semantics

Calling `agent.register(name, handler)` with an already-registered name **silently overwrites** the previous handler and schema. No warning is emitted. The last `register()` call wins.

### Inspection Omission on `ctx.agent`

When `enableInspection: false`, the `inspect`, `snapshot`, and `diff` methods are **not present** on the `ctx.agent` object injected into components. They are `undefined`, not no-ops. Calling `ctx.agent.inspect()` will throw a `TypeError`.

### Snapshot Plugin Source

`agent.snapshot()` lists plugins from `eleva.plugins` (the public `Map` populated by each plugin's `install()`). Only plugins that register themselves in this Map appear. If a plugin does not call `eleva.plugins.set(name, metadata)`, it will be absent from snapshots.

### Audit Log Outcomes

Log entries are written **after** handler completion (success or failure) and include:
- `result` — the value returned by the handler (actions only, absent on error)
- `error` — the error message if the handler threw (absent on success)
- `durationMs` — wall-clock execution time in milliseconds

Failed executions appear in the log with an `error` field. Use `getLog({ status: "error" })` to filter failures.

### Audit Log Rotation

When the log exceeds `maxLogSize`, the **oldest** entry is evicted (FIFO via `Array.shift()`).

### Handler Receives Payload Only

Action handlers registered via `register(name, handler)` receive a single argument: the `payload` passed to `execute()`. There is no `ctx`, `name`, or `scope` argument injected into the handler.

```javascript
// Correct
agent.register("greet", (payload) => `Hello, ${payload.name}!`);

// Wrong — handler does NOT receive (ctx, name)
agent.register("greet", (ctx, name) => `Hello, ${name}!`);
```

---

## Summary

### Agent Statistics

| Metric | Value |
|--------|-------|
| **API Methods** | 16 (register, execute, executeBatch, executeSequence, describe, dispatch, getLog, snapshot, etc.) |
| **Log Entry Types** | 3 (action, command, event) |
| **Permission Modes** | 2 (default permissive, strict) |
| **State Inspection** | Optional (enabled by default) |
| **Async Support** | Native (actions and commands can be async) |

### Core API Quick Reference

| Method | Purpose |
|--------|---------|
| `agent.register(name, handler, schema?)` | Register an action |
| `agent.unregister(name)` | Remove an action |
| `agent.execute(name, payload?, scope?)` | Execute an action |
| `agent.executeBatch(actions, scope?)` | Execute multiple actions in parallel |
| `agent.executeSequence(actions, scope?)` | Execute actions sequentially (piped) |
| `agent.hasAction(name)` | Check if action exists |
| `agent.describeAction(name)` | Get action descriptor |
| `agent.listActions()` | List all actions |
| `agent.describe(scope?)` | Get full capability manifest |
| `agent.dispatch(command, scope?)` | Send a command |
| `agent.onCommand(type, handler)` | Handle commands |
| `agent.getLog(filter?)` | Query audit log |
| `agent.clearLog()` | Clear audit log |
| `agent.inspect()` | Inspect components |
| `agent.snapshot()` | Capture app state |
| `agent.diff(snapA, snapB)` | Compare snapshots |

### Key Concepts

1. **Actions** — Callable functions with typed schemas and permission checks
2. **Commands** — Structured messages dispatched to registered handlers
3. **Audit Log** — Automatic recording of all operations with rotation
4. **Permissions** — Capability-based access control per scope
5. **Inspection** — Component tree introspection and snapshot diffing
6. **Emitter Capture** — Cross-plugin event interception for the audit log
7. **Emitter Events** — Agent emits `agent:register`, `agent:unregister`, `agent:execute`, `agent:execute:error`, `agent:dispatch` for observability
8. **Reactive Signals** — `agent.actionCount` and `agent.lastActivity` for template-driven monitoring
9. **Auto-cleanup** — Component-scoped actions and command handlers are cleaned up on unmount

For questions or issues, visit the [GitHub repository](https://github.com/TarekRaafat/eleva).

---

## Machine-Readable Manifest

For AI systems that need structured tool definitions (OpenAI function-calling, Anthropic tool-use, etc.), a machine-readable JSON manifest is available:

**URL:** [`https://elevajs.com/agent-manifest.json`](/agent-manifest.json)

The manifest includes all 16 methods with parameters, return types, error codes, and side effects — plus complete type definitions, the error catalog, and the permission decision logic. AI integrations can consume this file directly to auto-generate tool definitions.

---

## See Also

- [Agent Patterns](./patterns.md) — Action registry, command bus, AI agent examples
- [Store Plugin](../store/) — Combine with Store for state-aware agents
- [Router Guards](../router/guards.md) — Use agent actions for route protection
- [Custom Plugin Guide](../../examples/custom-plugin/index.md) — Build your own plugins

---

[← Back to Usage Patterns](./patterns.md) | [Back to Agent Overview](./index.md) | [Plugins →](../index.md)
