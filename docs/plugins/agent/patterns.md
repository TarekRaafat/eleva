---
title: Agent Usage Patterns
description: Eleva Agent patterns with full code. Build AI tool registries, command-driven UIs, cross-component messaging, audit dashboards, and LLM-powered agents.
---

<!-- REVU Analytics -->
<script async src="https://cdn.revu.ai/behavior"></script>
<script>
  window.revu = window.revu || new Proxy({q:[]}, {
    get: (t, m) => m in t ? t[m] : (...a) => t.q.push([m, ...a]),
  });
  revu.init({ apiKey: "revu_pk_prod_KFdyizGp4I0cWia36eNmWg" });
</script>

<link rel="canonical" href="https://elevajs.com/plugins/agent/patterns.html">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://elevajs.com/plugins/agent/patterns.html">
<meta property="og:title" content="Agent Usage Patterns - Eleva.js">
<meta property="og:description" content="Eleva Agent patterns with full code. Build AI tool registries, command-driven UIs, cross-component messaging, audit dashboards, and LLM-powered agents.">
<meta property="og:image" content="https://elevajs.com/imgs/eleva.js%20Full%20Logo.png">
<meta property="og:site_name" content="Eleva.js">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://elevajs.com/plugins/agent/patterns.html">
<meta name="twitter:title" content="Agent Usage Patterns - Eleva.js">
<meta name="twitter:description" content="Eleva Agent patterns with full code. Build AI tool registries, command-driven UIs, cross-component messaging, audit dashboards, and LLM-powered agents.">
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
  "headline": "Eleva.js Agent Usage Patterns",
  "description": "Real-world examples of using Eleva Agent plugin for AI tool registries, command-driven UIs, cross-component messaging, and LLM-powered agents.",
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
    "@id": "https://elevajs.com/plugins/agent/patterns.html"
  },
  "articleSection": "Plugins",
  "keywords": ["eleva agent", "usage patterns", "AI tools", "command bus", "cross-component", "LLM agent", "audit log"]
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
    { "@type": "ListItem", "position": 4, "name": "Patterns", "item": "https://elevajs.com/plugins/agent/patterns.html" }
  ]
}
</script>

# Agent Usage Patterns

> **Agent Plugin** | Real-world examples for action registries, command buses, AI agents, and audit dashboards.

---

## Prerequisites

Before implementing these patterns, ensure you understand:

- [Agent Plugin Overview](./index.md) — Basic setup and configuration
- [Agent API Reference](./api.md) — Complete method documentation

---

## Quick Recipes

Minimal, copy-paste correct flows — the shortest path to each Agent feature.

### Register + Execute

```javascript
agent.register("greet", (payload) => `Hello, ${payload.name}!`, {
  input: { name: "string" }, output: "string"
});

const result = await agent.execute("greet", { name: "World" });
// result === "Hello, World!"
```

### Command Dispatch + Handler

```javascript
const unsub = agent.onCommand("REFRESH", (cmd) => {
  console.log("Refreshing:", cmd.payload); // { force: true }
});

await agent.dispatch({ type: "REFRESH", payload: { force: true } });
unsub(); // Stop listening
```

### Scoped Permission — Success and Failure

```javascript
app.use(Agent, {
  actions: { read: () => "data", write: (p) => p },
  permissions: { "viewer": { actions: ["read"], commands: [] } },
  strictPermissions: true
});

await agent.execute("read", null, "viewer");   // OK → "data"
await agent.execute("write", {}, "viewer");     // throws: Permission denied
await agent.execute("read", null);              // throws: scope required (strict mode)
```

### Audit Log Query

```javascript
await agent.execute("greet", { name: "World" });
await agent.dispatch({ type: "REFRESH" });

const allLogs    = agent.getLog();                    // All entries
const actionLogs = agent.getLog({ type: "action" });  // Only actions
const recent     = agent.getLog({ since: Date.now() - 60000 }); // Last minute
```

### Snapshot + Diff

```javascript
const snap1 = agent.snapshot();
app.component("NewWidget", { template: () => `<div>New</div>` });
const snap2 = agent.snapshot();

const changes = agent.diff(snap1, snap2);
// { added: ["NewWidget"], removed: [] }
```

### Batch Execute (Parallel)

```javascript
const [user, posts] = await agent.executeBatch([
  { action: "fetchUser", payload: { id: 1 } },
  { action: "fetchPosts", payload: { userId: 1 } }
]);
// Both run in parallel; results ordered same as input
```

### Sequential Execute (Piped)

```javascript
const email = await agent.executeSequence([
  { action: "fetchUser", payload: { id: 1 } },   // returns { id: 1, name: "Alice" }
  { action: "formatProfile" },                     // receives previous result as payload
  { action: "sendWelcomeEmail" }                   // receives formatted profile
]);
// Each step's result becomes the next step's payload
```

### Capability Discovery

```javascript
const manifest = agent.describe("ui-agent");
// {
//   actions: [
//     { name: "greet", schema: { input: { name: "string" } }, allowed: true },
//     { name: "admin", schema: null, allowed: false }
//   ],
//   commands: ["REFRESH"],
//   permissions: { scope: "ui-agent", actions: ["greet"], commands: ["REFRESH"] },
//   config: { strictPermissions: false, maxLogSize: 100, ... }
// }
```

### Filter Failed Actions from Audit Log

```javascript
const failures = agent.getLog({ type: "action", status: "error" });
failures.forEach(entry => {
  console.log(`${entry.action} failed: ${entry.error} (${entry.durationMs}ms)`);
});
```

### Error Code Handling

```javascript
try {
  await agent.execute("admin", {}, "viewer");
} catch (error) {
  switch (error.code) {
    case "AGENT_PERMISSION_DENIED":
      console.log("Try a different scope");
      break;
    case "AGENT_ACTION_NOT_FOUND":
      console.log("Action does not exist");
      break;
    case "AGENT_SCHEMA_VIOLATION":
      console.log("Fix payload:", error.violations);
      break;
  }
}
```

---

## Full Patterns

Complete, runnable examples showing each Agent feature in a real component context.

---

## Action Registry

A component that registers and exposes callable actions for external consumers (AI agents, other components, or automation scripts).

```javascript
// file: action-registry-example.js
import Eleva from "eleva";
import { Agent } from "eleva/plugins";

const app = new Eleva("ToolApp");

app.use(Agent, {
  actions: {
    // Pre-register common actions during install
    getTime: () => new Date().toISOString(),
    random: (payload) => Math.random() * (payload.max - payload.min) + payload.min
  }
});

app.component("Calculator", {
  setup({ agent, signal }) {
    const result = signal("");
    const history = signal([]);

    // Register domain-specific actions with schemas
    agent.register("add", (p) => p.a + p.b, {
      input: { a: "number", b: "number" },
      output: "number"
    });

    agent.register("multiply", (p) => p.a * p.b, {
      input: { a: "number", b: "number" },
      output: "number"
    });

    agent.register("divide", (p) => {
      if (p.b === 0) throw new Error("Division by zero");
      return p.a / p.b;
    }, {
      input: { a: "number", b: "number" },
      output: "number",
      errors: ["Division by zero"]
    });

    // Introspect available actions
    const showTools = () => {
      const tools = agent.listActions();
      console.log("Available tools:", tools.map(t => t.name));
    };

    // Execute and track results
    const calculate = async (action, a, b) => {
      try {
        const value = await agent.execute(action, { a, b });
        result.value = `${a} ${action} ${b} = ${value}`;
        history.value = [...history.value, result.value];
      } catch (error) {
        result.value = `Error: ${error.message}`;
      }
    };

    return { result, history, calculate, showTools };
  },
  template: (ctx) => `
    <div class="calculator">
      <h2>Agent Calculator</h2>
      <div class="controls">
        <button @click="() => calculate('add', 10, 5)">10 + 5</button>
        <button @click="() => calculate('multiply', 7, 3)">7 x 3</button>
        <button @click="() => calculate('divide', 20, 4)">20 / 4</button>
        <button @click="showTools">Show Tools</button>
      </div>
      <p class="result">${ctx.result.value}</p>
      <ul class="history">
        ${ctx.history.value.map(h => `<li>${h}</li>`).join("")}
      </ul>
    </div>
  `
});

app.mount(document.getElementById("app"), "Calculator");
// Result: Interactive calculator with audited action execution
```

---

## Command-Driven UI

Use the command bus for structured communication between components. Commands provide a decoupled messaging pattern where senders don't need to know about receivers.

```javascript
// file: command-ui-example.js
import Eleva from "eleva";
import { Agent } from "eleva/plugins";

const app = new Eleva("CommandApp");

app.use(Agent, {
  maxLogSize: 200
});

app.component("Toolbar", {
  setup({ agent }) {
    // Send commands without knowing who handles them
    const refreshAll = () => agent.dispatch({
      type: "REFRESH",
      payload: { force: true }
    });

    const toggleSidebar = () => agent.dispatch({
      type: "TOGGLE_SIDEBAR"
    });

    const showNotification = (message) => agent.dispatch({
      type: "NOTIFY",
      payload: { message, level: "info" }
    });

    return { refreshAll, toggleSidebar, showNotification };
  },
  template: (ctx) => `
    <div class="toolbar">
      <button @click="refreshAll">Refresh</button>
      <button @click="toggleSidebar">Toggle Sidebar</button>
      <button @click="() => showNotification('Data synced')">Notify</button>
    </div>
  `
});

app.component("Sidebar", {
  setup({ agent, signal }) {
    const isOpen = signal(true);

    // Handle toggle commands
    agent.onCommand("TOGGLE_SIDEBAR", () => {
      isOpen.value = !isOpen.value;
    });

    // Handle refresh commands
    agent.onCommand("REFRESH", async (cmd) => {
      console.log("Sidebar refreshing...", cmd.payload);
    });

    return { isOpen };
  },
  template: (ctx) => `
    <aside class="${ctx.isOpen.value ? 'sidebar open' : 'sidebar closed'}">
      <h3>Sidebar</h3>
      <p>Status: ${ctx.isOpen.value ? "Open" : "Closed"}</p>
    </aside>
  `
});

app.component("NotificationArea", {
  setup({ agent, signal }) {
    const notifications = signal([]);

    agent.onCommand("NOTIFY", (cmd) => {
      notifications.value = [
        ...notifications.value,
        { id: Date.now(), ...cmd.payload }
      ];
    });

    const dismiss = (id) => {
      notifications.value = notifications.value.filter(n => n.id !== id);
    };

    return { notifications, dismiss };
  },
  template: (ctx) => `
    <div class="notifications">
      ${ctx.notifications.value.map(n => `
        <div class="notification ${n.level}" key="${n.id}">
          <span>${n.message}</span>
          <button @click="() => dismiss(${n.id})">x</button>
        </div>
      `).join("")}
    </div>
  `
});
// Result: Toolbar sends commands; Sidebar and NotificationArea respond independently
```

---

## Cross-Component Messaging

Components communicate through registered actions, allowing any component to call actions registered by another. This provides a type-safe alternative to loose event coupling.

```javascript
// file: cross-component-example.js
import Eleva from "eleva";
import { Agent } from "eleva/plugins";

const app = new Eleva("MessagingApp");
app.use(Agent);

// Producer component - registers actions
app.component("DataService", {
  setup({ agent, signal }) {
    const users = signal([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" }
    ]);

    // Register data access actions
    agent.register("getUsers", () => [...users.value], {
      output: "User[]"
    });

    agent.register("getUserById", (payload) => {
      return users.value.find(u => u.id === payload.id) || null;
    }, {
      input: { id: "number" },
      output: "User | null"
    });

    agent.register("addUser", (payload) => {
      const newUser = { id: Date.now(), name: payload.name };
      users.value = [...users.value, newUser];
      return newUser;
    }, {
      input: { name: "string" },
      output: "User"
    });

    return { users };
  },
  template: (ctx) => `
    <div class="data-service">
      <h3>Data Service (${ctx.users.value.length} users)</h3>
    </div>
  `
});

// Consumer component - calls actions from DataService
app.component("UserList", {
  setup({ agent, signal }) {
    const userList = signal([]);
    const selectedUser = signal(null);

    const loadUsers = async () => {
      userList.value = await agent.execute("getUsers");
    };

    const selectUser = async (id) => {
      selectedUser.value = await agent.execute("getUserById", { id });
    };

    const addUser = async (name) => {
      await agent.execute("addUser", { name });
      await loadUsers();
    };

    return { userList, selectedUser, loadUsers, selectUser, addUser };
  },
  template: (ctx) => `
    <div class="user-list">
      <h3>User List</h3>
      <button @click="loadUsers">Load Users</button>
      <button @click="() => addUser('New User')">Add User</button>
      <ul>
        ${ctx.userList.value.map(u => `
          <li key="${u.id}" @click="() => selectUser(${u.id})">
            ${u.name}
          </li>
        `).join("")}
      </ul>
      ${ctx.selectedUser.value ?
        `<p>Selected: ${ctx.selectedUser.value.name}</p>` : ""}
    </div>
  `
});
// Result: UserList calls actions registered by DataService without direct coupling
```

---

## Audit Dashboard

Build a real-time audit log viewer that displays all agent activity, including actions, commands, and captured emitter events from both Router and Store plugins.

```javascript
// file: audit-dashboard-example.js
import Eleva from "eleva";
import { Agent, Store } from "eleva/plugins";

const app = new Eleva("AuditApp");

app.use(Store, {
  state: { count: 0 },
  actions: {
    increment: (state) => state.count.value++
  }
});

app.use(Agent, {
  maxLogSize: 500,
  emitterEvents: ["router:", "store:"],  // Capture Router + Store events natively
  actions: {
    ping: () => "pong"
  }
});

app.component("AuditDashboard", {
  setup({ agent, store, signal }) {
    const filter = signal("all");
    const logs = signal([]);

    const refreshLogs = () => {
      const f = filter.value === "all" ? undefined : { type: filter.value };
      logs.value = agent.getLog(f);
    };

    const setFilter = (type) => {
      filter.value = type;
      refreshLogs();
    };

    // Generate some activity
    const triggerAction = () => agent.execute("ping");
    const triggerCommand = () => agent.dispatch({ type: "TEST_CMD" });
    const triggerStoreAction = () => store.dispatch("increment");

    return {
      filter, logs, refreshLogs, setFilter,
      triggerAction, triggerCommand, triggerStoreAction
    };
  },
  template: (ctx) => `
    <div class="audit-dashboard">
      <h2>Audit Dashboard</h2>

      <div class="controls">
        <button @click="triggerAction">Trigger Action</button>
        <button @click="triggerCommand">Trigger Command</button>
        <button @click="triggerStoreAction">Trigger Store Action</button>
        <button @click="refreshLogs">Refresh Logs</button>
      </div>

      <div class="filters">
        <button @click="() => setFilter('all')"
                class="${ctx.filter.value === 'all' ? 'active' : ''}">All</button>
        <button @click="() => setFilter('action')"
                class="${ctx.filter.value === 'action' ? 'active' : ''}">Actions</button>
        <button @click="() => setFilter('command')"
                class="${ctx.filter.value === 'command' ? 'active' : ''}">Commands</button>
        <button @click="() => setFilter('event')"
                class="${ctx.filter.value === 'event' ? 'active' : ''}">Events</button>
      </div>

      <table class="log-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Action</th>
            <th>Source</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          ${ctx.logs.value.map(entry => `
            <tr class="log-${entry.type}">
              <td>${entry.type}</td>
              <td>${entry.action}</td>
              <td>${entry.source}</td>
              <td>${new Date(entry.timestamp).toLocaleTimeString()}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <p>${ctx.logs.value.length} entries</p>
    </div>
  `
});
// Result: Real-time audit dashboard showing actions, commands, and Store events (captured natively via emitter)
```

---

## LLM-Powered Agent

Integrate an LLM (Large Language Model) that discovers and calls registered actions through the Agent plugin. The agent introspects available tools via `listActions()` and `describeAction()`, then decides which to call.

```javascript
// file: llm-agent-example.js
import Eleva from "eleva";
import { Agent } from "eleva/plugins";

const app = new Eleva("LLMApp");

app.use(Agent, {
  maxLogSize: 500,
  onError: (err, ctx) => console.error(`[LLM Agent] ${ctx.method} ${ctx.code}:`, err),
  permissions: {
    "llm-agent": { actions: ["getWeather", "searchProducts", "sendEmail"] }
  }
});

app.component("LLMChat", {
  setup({ agent, signal }) {
    const messages = signal([]);
    const input = signal("");
    const isThinking = signal(false);

    // Register tools that the LLM can call
    agent.register("getWeather", async (payload) => {
      // Simulate API call
      return { temp: 72, condition: "sunny", city: payload.city };
    }, {
      input: { city: "string" },
      output: "WeatherData",
      errors: ["CITY_NOT_FOUND"]
    });

    agent.register("searchProducts", async (payload) => {
      // Simulate search
      return [
        { name: `${payload.query} Pro`, price: 99 },
        { name: `${payload.query} Lite`, price: 49 }
      ];
    }, {
      input: { query: "string" },
      output: "Product[]"
    });

    agent.register("sendEmail", async (payload) => {
      console.log(`Sending email to ${payload.to}: ${payload.subject}`);
      return { sent: true };
    }, {
      input: { to: "string", subject: "string", body: "string" },
      output: "EmailResult"
    });

    // Build tool descriptions for the LLM prompt
    const getToolDescriptions = () => {
      return agent.listActions().map(action => {
        const desc = agent.describeAction(action.name);
        return {
          name: action.name,
          schema: desc?.schema || null
        };
      });
    };

    // Simulate LLM decision-making
    const processUserMessage = async (userMessage) => {
      isThinking.value = true;
      messages.value = [...messages.value, { role: "user", content: userMessage }];

      try {
        // In production, send tools + message to your LLM API
        const tools = getToolDescriptions();

        // Simulate LLM choosing a tool based on keywords
        let response;
        if (userMessage.toLowerCase().includes("weather")) {
          const result = await agent.execute("getWeather", { city: "New York" }, "llm-agent");
          response = `The weather in ${result.city} is ${result.condition} at ${result.temp}F.`;
        } else if (userMessage.toLowerCase().includes("product")) {
          const results = await agent.execute("searchProducts", { query: "laptop" }, "llm-agent");
          response = `Found ${results.length} products: ${results.map(p => p.name).join(", ")}.`;
        } else {
          response = `I have ${tools.length} tools available. Try asking about weather or products.`;
        }

        messages.value = [...messages.value, { role: "assistant", content: response }];
      } catch (error) {
        messages.value = [...messages.value, { role: "error", content: error.message }];
      }

      isThinking.value = false;
    };

    const sendMessage = () => {
      if (input.value.trim()) {
        processUserMessage(input.value.trim());
        input.value = "";
      }
    };

    return { messages, input, isThinking, sendMessage };
  },
  template: (ctx) => `
    <div class="llm-chat">
      <h2>AI Assistant</h2>

      <div class="messages">
        ${ctx.messages.value.map(m => `
          <div class="message ${m.role}">
            <strong>${m.role}:</strong> ${m.content}
          </div>
        `).join("")}
        ${ctx.isThinking.value ? `<div class="thinking">Thinking...</div>` : ""}
      </div>

      <div class="input-area">
        <input
          type="text"
          value="${ctx.input.value}"
          @input="(e) => input.value = e.target.value"
          @keypress="(e) => e.key === 'Enter' && sendMessage()"
          placeholder="Ask about weather or products..."
          ${ctx.isThinking.value ? 'disabled' : ''}
        />
        <button @click="sendMessage" ${ctx.isThinking.value ? 'disabled' : ''}>
          Send
        </button>
      </div>
    </div>
  `
});

app.mount(document.getElementById("app"), "LLMChat");
// Result: Chat interface where an LLM discovers and calls registered tools
```

---

## Scoped Permissions

Demonstrate capability-based access control where different agents have different permission levels.

```javascript
// file: permissions-example.js
import Eleva from "eleva";
import { Agent } from "eleva/plugins";

const app = new Eleva("PermissionApp");

app.use(Agent, {
  strictPermissions: true,
  permissions: {
    "admin": {
      actions: ["readData", "writeData", "deleteData"],
      commands: ["SHUTDOWN", "RESTART", "NOTIFY"]
    },
    "editor": {
      actions: ["readData", "writeData"],
      commands: ["NOTIFY"]
    },
    "viewer": {
      actions: ["readData"],
      commands: ["NOTIFY"]
    }
  },
  actions: {
    readData: () => ({ users: 42, posts: 128 }),
    writeData: (payload) => ({ written: true, key: payload.key }),
    deleteData: (payload) => ({ deleted: true, key: payload.key })
  }
});

app.component("AdminPanel", {
  setup({ agent, signal }) {
    const result = signal("");
    const currentScope = signal("viewer");

    const tryAction = async (actionName, payload) => {
      try {
        const value = await agent.execute(actionName, payload, currentScope.value);
        result.value = `${actionName}: ${JSON.stringify(value)}`;
      } catch (error) {
        result.value = `DENIED: ${error.message}`;
      }
    };

    const tryCommand = async (type) => {
      try {
        await agent.dispatch({ type }, currentScope.value);
        result.value = `Command ${type}: dispatched`;
      } catch (error) {
        result.value = `DENIED: ${error.message}`;
      }
    };

    return { result, currentScope, tryAction, tryCommand };
  },
  template: (ctx) => `
    <div class="admin-panel">
      <h2>Permission Demo</h2>

      <div class="scope-selector">
        <label>Current Scope:</label>
        <button @click="() => currentScope.value = 'admin'"
                class="${ctx.currentScope.value === 'admin' ? 'active' : ''}">Admin</button>
        <button @click="() => currentScope.value = 'editor'"
                class="${ctx.currentScope.value === 'editor' ? 'active' : ''}">Editor</button>
        <button @click="() => currentScope.value = 'viewer'"
                class="${ctx.currentScope.value === 'viewer' ? 'active' : ''}">Viewer</button>
      </div>

      <div class="actions">
        <button @click="() => tryAction('readData')">Read Data</button>
        <button @click="() => tryAction('writeData', { key: 'test' })">Write Data</button>
        <button @click="() => tryAction('deleteData', { key: 'test' })">Delete Data</button>
      </div>

      <div class="commands">
        <button @click="() => tryCommand('NOTIFY')">Notify</button>
        <button @click="() => tryCommand('RESTART')">Restart</button>
        <button @click="() => tryCommand('SHUTDOWN')">Shutdown</button>
      </div>

      <p class="result">${ctx.result.value}</p>
    </div>
  `
});
// Result: Switch scope to see different permission levels in action
```

---

## State Inspection

Use snapshot and diff to monitor application changes over time. Useful for debugging, analytics, and version tracking.

```javascript
// file: inspection-example.js
import Eleva from "eleva";
import { Agent } from "eleva/plugins";

const app = new Eleva("InspectionApp");
app.use(Agent, { enableInspection: true });

app.component("Inspector", {
  setup({ agent, signal }) {
    const snapshots = signal([]);
    const diffResult = signal(null);
    const componentInfo = signal(null);

    const takeSnapshot = () => {
      const snap = agent.snapshot();
      snapshots.value = [...snapshots.value, snap];
    };

    const compareSnapshots = () => {
      const snaps = snapshots.value;
      if (snaps.length >= 2) {
        const a = snaps[snaps.length - 2];
        const b = snaps[snaps.length - 1];
        diffResult.value = agent.diff(a, b);
      }
    };

    const inspectComponents = () => {
      componentInfo.value = agent.inspect();
    };

    return { snapshots, diffResult, componentInfo, takeSnapshot, compareSnapshots, inspectComponents };
  },
  template: (ctx) => `
    <div class="inspector">
      <h2>App Inspector</h2>

      <div class="controls">
        <button @click="takeSnapshot">Take Snapshot</button>
        <button @click="compareSnapshots">Compare Last Two</button>
        <button @click="inspectComponents">Inspect Components</button>
      </div>

      <div class="snapshots">
        <h3>Snapshots (${ctx.snapshots.value.length})</h3>
        ${ctx.snapshots.value.map((snap, i) => `
          <div class="snapshot">
            <strong>#${i + 1}</strong> -
            ${snap.components.length} components,
            ${snap.plugins.length} plugins,
            ${new Date(snap.timestamp).toLocaleTimeString()}
          </div>
        `).join("")}
      </div>

      ${ctx.diffResult.value ? `
        <div class="diff">
          <h3>Diff Result</h3>
          <p>Added: ${ctx.diffResult.value.added.join(", ") || "none"}</p>
          <p>Removed: ${ctx.diffResult.value.removed.join(", ") || "none"}</p>
        </div>
      ` : ""}

      ${ctx.componentInfo.value ? `
        <div class="components">
          <h3>Registered Components</h3>
          ${ctx.componentInfo.value.components.map(c => `
            <div class="component-info">
              <strong>${c.name}</strong>
              ${c.hasSetup ? " [setup]" : ""}
              ${c.hasTemplate ? " [template]" : ""}
              ${c.hasChildren ? " [children]" : ""}
            </div>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `
});
// Result: Live application inspector with snapshot history and component diffing
```

---

## Error Handling

Handle errors gracefully with the custom error handler and per-action try/catch patterns.

```javascript
// file: error-handling-example.js
import Eleva from "eleva";
import { Agent } from "eleva/plugins";

const app = new Eleva("ErrorApp");

app.use(Agent, {
  onError: (error, context) => {
    // Central error handler - log to monitoring service
    // context is { method, code, action?, scope?, commandType? }
    console.error(`[Agent Error] ${context.method} ${context.code}:`, error.message);
    // Could send to error tracking service here
  },
  actions: {
    riskyOperation: async () => {
      // Simulate random failures
      if (Math.random() > 0.5) {
        throw new Error("NETWORK_ERROR");
      }
      return { success: true };
    }
  }
});

app.component("ResilientComponent", {
  setup({ agent, signal }) {
    const status = signal("idle");
    const retryCount = signal(0);

    const executeWithRetry = async (actionName, payload, maxRetries = 3) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          status.value = `Attempt ${attempt}/${maxRetries}...`;
          const result = await agent.execute(actionName, payload);
          status.value = `Success: ${JSON.stringify(result)}`;
          retryCount.value = attempt;
          return result;
        } catch (error) {
          retryCount.value = attempt;
          if (attempt === maxRetries) {
            status.value = `Failed after ${maxRetries} attempts: ${error.message}`;
            throw error;
          }
          // Wait before retry
          await new Promise(r => setTimeout(r, 1000 * attempt));
        }
      }
    };

    const runOperation = async () => {
      try {
        await executeWithRetry("riskyOperation");
      } catch (error) {
        // Final failure already handled in status
      }
    };

    return { status, retryCount, runOperation };
  },
  template: (ctx) => `
    <div class="resilient">
      <h2>Resilient Operation</h2>
      <button @click="runOperation">Run Risky Operation</button>
      <p>Status: ${ctx.status.value}</p>
      <p>Attempts: ${ctx.retryCount.value}</p>

      <h3>Audit Trail</h3>
      <pre>${JSON.stringify(ctx.agent?.getLog({ type: "action" }) || [], null, 2)}</pre>
    </div>
  `
});
// Result: Automatic retry with exponential backoff and centralized error reporting
```

---

## Agent + Store Integration

Combine the Agent and Store plugins for a complete application architecture where actions can read and mutate store state.

```javascript
// file: agent-store-example.js
import Eleva from "eleva";
import { Agent, Store } from "eleva/plugins";

const app = new Eleva("IntegratedApp");

// Install Store for state management
app.use(Store, {
  state: { theme: "light", notifications: [] },
  actions: {
    setTheme: (state, theme) => state.theme.value = theme,
    addNotification: (state, notification) => {
      state.notifications.value = [...state.notifications.value, notification];
    },
    clearNotifications: (state) => {
      state.notifications.value = [];
    }
  }
});

// Install Agent for action orchestration
app.use(Agent, {
  emitterEvents: ["store:"],  // Capture Store events natively
  actions: {
    // Agent actions that interact with the Store
    toggleTheme: async () => {
      const current = app.store.state.theme.value;
      const next = current === "light" ? "dark" : "light";
      await app.store.dispatch("setTheme", next);
      return next;
    },
    notify: async (payload) => {
      await app.store.dispatch("addNotification", {
        id: Date.now(),
        message: payload.message,
        level: payload.level || "info"
      });
    }
  }
});

app.component("IntegratedDashboard", {
  setup({ agent, store, signal }) {
    const toggleTheme = () => agent.execute("toggleTheme");
    const sendNotification = (msg) => agent.execute("notify", {
      message: msg, level: "info"
    });
    const clearAll = () => store.dispatch("clearNotifications");

    // View Store events in audit log (captured natively via emitter)
    const getActivity = () => agent.getLog({ type: "event" });

    return {
      theme: store.state.theme,
      notifications: store.state.notifications,
      toggleTheme, sendNotification, clearAll, getActivity
    };
  },
  template: (ctx) => `
    <div class="dashboard" data-theme="${ctx.theme.value}">
      <h2>Integrated Dashboard</h2>

      <div class="controls">
        <button @click="toggleTheme">
          Theme: ${ctx.theme.value}
        </button>
        <button @click="() => sendNotification('Hello from Agent!')">
          Send Notification
        </button>
        <button @click="clearAll">Clear All</button>
      </div>

      <div class="notifications">
        ${ctx.notifications.value.map(n => `
          <div class="notification ${n.level}" key="${n.id}">
            ${n.message}
          </div>
        `).join("")}
      </div>
    </div>
  `
});
// Result: Agent actions orchestrate Store mutations, captured in the audit log via native store:* events
```

---

## Reactive Agent Dashboard

Use `agent.actionCount` and `agent.lastActivity` signals directly in templates for a live monitoring dashboard that updates automatically without manual refresh.

```javascript
// file: reactive-dashboard-example.js
import Eleva from "eleva";
import { Agent } from "eleva/plugins";

const app = new Eleva("ReactiveApp");
app.use(Agent);

app.component("AgentDashboard", {
  setup({ agent, signal }) {
    agent.register("ping", () => "pong");
    agent.register("greet", (p) => `Hello, ${p.name}!`);

    const runPing = () => agent.execute("ping");
    const runGreet = () => agent.execute("greet", { name: "World" });

    return {
      actionCount: agent.actionCount,
      lastActivity: agent.lastActivity,
      runPing,
      runGreet
    };
  },
  template: (ctx) => `
    <div class="dashboard">
      <h2>Agent Monitor</h2>
      <p>Registered actions: ${ctx.actionCount.value}</p>
      <p>Last activity: ${ctx.lastActivity.value
        ? `${ctx.lastActivity.value.action} (${ctx.lastActivity.value.type})`
        : "none"}</p>
      <button @click="runPing">Ping</button>
      <button @click="runGreet">Greet</button>
    </div>
  `
});
// Result: Dashboard updates reactively as actions are registered, unregistered, or executed
```

---

## Emitter Event Listeners

Listen to Agent emitter events from any component or plugin to observe agent activity without coupling to the Agent API directly.

```javascript
// file: emitter-listener-example.js
import Eleva from "eleva";
import { Agent } from "eleva/plugins";

const app = new Eleva("EmitterApp");
app.use(Agent);

app.component("ActivityLogger", {
  setup({ agent, emitter, signal }) {
    const events = signal([]);

    // Listen for successful action executions
    emitter.on("agent:execute", (data) => {
      events.value = [...events.value, {
        action: data.name,
        duration: data.durationMs,
        time: new Date(data.timestamp).toLocaleTimeString()
      }];
    });

    // Listen for execution errors
    emitter.on("agent:execute:error", (data) => {
      events.value = [...events.value, {
        action: data.name,
        error: data.error,
        time: new Date(data.timestamp).toLocaleTimeString()
      }];
    });

    // Register and execute some actions
    agent.register("ping", () => "pong");
    const runPing = () => agent.execute("ping");

    return { events, runPing };
  },
  template: (ctx) => `
    <div>
      <button @click="runPing">Ping</button>
      <ul>
        ${ctx.events.value.map(e => `
          <li>${e.time} — ${e.action} ${e.error ? `(error: ${e.error})` : `(${e.duration}ms)`}</li>
        `).join("")}
      </ul>
    </div>
  `
});
// Result: Decoupled activity log driven by emitter events
```

---

## Auto-cleanup on Unmount

Actions and command handlers registered inside a component's `setup()` are automatically cleaned up when the component unmounts. This eliminates the need for manual unsubscribe calls in most cases.

```javascript
// file: auto-cleanup-example.js
app.component("TemporaryWidget", {
  setup({ agent }) {
    // These are automatically unregistered when the component unmounts
    agent.register("widgetAction", () => "widget result");
    agent.onCommand("WIDGET_CMD", (cmd) => {
      console.log("Widget received:", cmd.payload);
    });

    return {};
  },
  template: () => `<div>I clean up after myself</div>`
});
// Result: No manual cleanup needed — actions and handlers are removed on unmount
```

> **Note:** If you register actions outside of a component's `setup()` (e.g., via `app.agent.register()` or in plugin options), those actions are **not** auto-cleaned and must be removed manually with `agent.unregister()`.

---

## Anti-Patterns

Common mistakes that cause bugs. Each example shows the wrong way and the correct fix.

### Don't pass an unrecognized scope in default mode

```javascript
// WRONG — "unknown-scope" is not in permissions, so this DENIES even though strictPermissions is false
app.use(Agent, {
  permissions: { "admin": { actions: ["read"] } }
});
await agent.execute("read", null, "unknown-scope"); // throws: Permission denied

// CORRECT — omit scope for unrestricted access, or use a configured scope
await agent.execute("read", null);           // OK: no scope = unrestricted
await agent.execute("read", null, "admin");  // OK: scope matches config
```

### Don't use dispatch for request/response

```javascript
// WRONG — dispatch returns Promise<void>, not a result
const result = await agent.dispatch({ type: "GET_DATA" }); // result === undefined

// CORRECT — use execute for actions that return values
agent.register("getData", () => ({ users: 42 }));
const result = await agent.execute("getData"); // { users: 42 }
```

### Don't forget the onCommand unsubscribe function

```javascript
// WRONG — no way to clean up this handler, causes memory leaks (outside component setup)
agent.onCommand("REFRESH", (cmd) => { /* ... */ });

// CORRECT — capture and call unsubscribe in cleanup
const unsub = agent.onCommand("REFRESH", (cmd) => { /* ... */ });
// In onUnmount or when done:
unsub();
```

> **Note:** Inside a component's `setup()`, command handlers registered via `ctx.agent.onCommand()` are auto-cleaned on unmount, so manual unsubscribe is only required outside of component setup.

### Don't assume register warns on overwrite

```javascript
// WRONG — second register silently overwrites the first, no warning emitted
agent.register("calc", (p) => p.a + p.b);
agent.register("calc", (p) => p.a * p.b); // Silently replaces addition with multiplication

// CORRECT — check first if you need to guard against overwrites
if (!agent.hasAction("calc")) {
  agent.register("calc", (p) => p.a + p.b);
}
```

### Don't use strictPermissions without configuring permissions

```javascript
// WRONG — strict mode + no permissions = everything denied
app.use(Agent, {
  actions: { greet: (p) => `Hello ${p.name}` },
  strictPermissions: true
  // permissions: {}  ← empty, so ALL scopes and no-scope calls are denied
});
await agent.execute("greet", { name: "World" }); // throws: Permission denied

// CORRECT — always pair strictPermissions with permission rules
app.use(Agent, {
  actions: { greet: (p) => `Hello ${p.name}` },
  strictPermissions: true,
  permissions: { "default": { actions: ["greet"], commands: [] } }
});
await agent.execute("greet", { name: "World" }, "default"); // OK
```

### Don't call app.use(Agent) twice to reconfigure

```javascript
// WRONG — second install is ignored with a console.warn, options NOT applied
app.use(Agent, { maxLogSize: 100 });
app.use(Agent, { maxLogSize: 500 }); // Warns and no-ops, maxLogSize stays 100

// CORRECT — uninstall first, then reinstall
app.use(Agent, { maxLogSize: 100 });
Agent.uninstall(app);
app.use(Agent, { maxLogSize: 500 }); // Now uses 500
```

### Don't pass (ctx, name) as handler arguments

```javascript
// WRONG — handler receives ONLY payload, not (ctx, name)
agent.register("greet", (ctx, name) => `Hello, ${name}!`);
await agent.execute("greet", "World"); // ctx="World", name=undefined → "Hello, undefined!"

// CORRECT — handler receives a single payload argument
agent.register("greet", (payload) => `Hello, ${payload.name}!`);
await agent.execute("greet", { name: "World" }); // "Hello, World!"
```

---

## Next Steps

- [API Reference](./api.md) — Complete method reference and TypeScript types
- [Agent Overview](./index.md) — Configuration and feature summary

## See Also

- [Store Patterns](../store/patterns.md) — Counter, todo, auth, cart examples
- [Router Guards](../router/guards.md) — Use agent actions for route protection
- [Custom Plugin Guide](../../examples/custom-plugin/index.md) — Build your own plugins

---

[← Back to Agent Overview](./index.md) | [Next: API Reference →](./api.md)
