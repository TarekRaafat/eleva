// Golden AI Example: Agent Actions
// Demonstrates: Agent plugin, action registration with schema, execute, error handling, audit log.

const app = new Eleva("AgentApp");

// Install Agent plugin with schema validation enabled
app.use(ElevaPlugins.Agent, {
  validateSchemas: true,
  enableInspection: true,
  maxLogSize: 50,
});

app.component("AgentDemo", {
  setup: ({ agent, signal }) => {
    const output = signal("Ready. Click a button to run an agent action.");

    // Register action with schema
    agent.register(
      "greet",
      (payload) => `Hello, ${payload.name}! You are ${payload.age} years old.`,
      {
        input: { name: "string", age: "number" },
        output: "string",
      }
    );

    // Register a second action
    agent.register("add", (payload) => payload.a + payload.b, {
      input: { a: "number", b: "number" },
      output: "number",
    });

    const runGreet = async () => {
      try {
        const result = await agent.execute("greet", {
          name: "World",
          age: 42,
        });
        output.value = `Result: ${result}`;
      } catch (err) {
        output.value = `Error [${err.code}]: ${err.message}`;
      }
    };

    const runAdd = async () => {
      try {
        const result = await agent.execute("add", { a: 10, b: 32 });
        output.value = `10 + 32 = ${result}`;
      } catch (err) {
        output.value = `Error [${err.code}]: ${err.message}`;
      }
    };

    const runBadPayload = async () => {
      try {
        await agent.execute("greet", { name: 123 }); // wrong type + missing field
      } catch (err) {
        output.value = `Caught [${err.code}]: ${err.violations.join(", ")}`;
      }
    };

    const showLog = () => {
      const log = agent.getLog({ type: "action" });
      output.value = JSON.stringify(log, null, 2);
    };

    const showActions = () => {
      const actions = agent.listActions();
      output.value = JSON.stringify(actions, null, 2);
    };

    return { output, runGreet, runAdd, runBadPayload, showLog, showActions };
  },
  template: (ctx) => `
    <div>
      <h1>Agent Actions Demo</h1>
      <div>
        <button @click="runGreet">Run Greet</button>
        <button @click="runAdd">Run Add</button>
        <button @click="runBadPayload">Bad Payload (Schema Error)</button>
        <button @click="showLog">Show Audit Log</button>
        <button @click="showActions">List Actions</button>
      </div>
      <pre style="background: #f5f5f5; padding: 12px; margin-top: 12px; white-space: pre-wrap;">${ctx.output.value}</pre>
    </div>
  `,
});

app.mount(document.getElementById("app"), "AgentDemo");
