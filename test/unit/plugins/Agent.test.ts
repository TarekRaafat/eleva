/**
 * @fileoverview Tests for the Agent Plugin
 * Tests the core functionality of action registry, command bus, audit logging,
 * permissions, action schemas, emitter integration, and state inspection.
 */

import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  mock,
  spyOn,
} from "bun:test";
import { Eleva } from "../../../src/core/Eleva.js";
import { AgentPlugin } from "../../../src/plugins/Agent.js";
import { AttrPlugin } from "../../../src/plugins/Attr.js";
import { StorePlugin } from "../../../src/plugins/Store.js";
import {
  createFixture,
  cleanupFixtures,
  flushPromises,
  createComponentFixture,
} from "../../utils.js";

// =============================================================================
// Agent Plugin Tests
// =============================================================================

describe("AgentPlugin", () => {
  let app: any;
  let container: HTMLElement;

  beforeEach(() => {
    app = new Eleva("testApp");
    container = createFixture("agent-test");
  });

  afterEach(() => {
    cleanupFixtures();
  });

  // ===========================================================================
  // Plugin Installation and Setup
  // ===========================================================================

  describe("Plugin Installation", () => {
    test("should install the plugin successfully", () => {
      expect(() => {
        app.use(AgentPlugin);
      }).not.toThrow();
    });

    test("should expose agent instance on eleva app", () => {
      app.use(AgentPlugin);
      expect(app.agent).toBeDefined();
      expect(typeof app.agent.register).toBe("function");
      expect(typeof app.agent.execute).toBe("function");
      expect(typeof app.agent.dispatch).toBe("function");
    });

    test("should expose global convenience methods", () => {
      app.use(AgentPlugin);
      expect(typeof app.agentExecute).toBe("function");
      expect(typeof app.agentDispatch).toBe("function");
    });

    test("should uninstall the plugin successfully", () => {
      app.use(AgentPlugin);
      expect(() => {
        AgentPlugin.uninstall(app);
      }).not.toThrow();
      expect(app.agent).toBeUndefined();
      expect(app.agentExecute).toBeUndefined();
      expect(app.agentDispatch).toBeUndefined();
    });

    test("should install with pre-registered actions", () => {
      const actions = {
        greet: (payload: any) => `Hello, ${payload.name}!`,
        add: (payload: any) => payload.a + payload.b,
      };

      app.use(AgentPlugin, { actions });

      expect(app.agent.hasAction("greet")).toBe(true);
      expect(app.agent.hasAction("add")).toBe(true);
    });

    test("should install with empty options", () => {
      expect(() => {
        app.use(AgentPlugin, {});
      }).not.toThrow();
    });

    test("should install with no options", () => {
      expect(() => {
        app.use(AgentPlugin);
      }).not.toThrow();
    });

    test("should have correct plugin metadata", () => {
      app.use(AgentPlugin);
      expect(AgentPlugin.name).toBe("agent");
      expect(AgentPlugin.version).toBe("1.0.0");
      expect(typeof AgentPlugin.description).toBe("string");
      expect(AgentPlugin.description.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // Action Registry
  // ===========================================================================

  describe("Action Registry", () => {
    beforeEach(() => {
      app.use(AgentPlugin);
    });

    test("should register an action", () => {
      app.agent.register("testAction", () => "result");
      expect(app.agent.hasAction("testAction")).toBe(true);
    });

    test("should execute a registered action", async () => {
      app.agent.register("testAction", () => "result");
      const result = await app.agent.execute("testAction");
      expect(result).toBe("result");
    });

    test("should execute action with payload", async () => {
      app.agent.register("multiply", (payload: any) => payload.a * payload.b);
      const result = await app.agent.execute("multiply", { a: 3, b: 4 });
      expect(result).toBe(12);
    });

    test("should return action result from execute", async () => {
      app.agent.register("getUser", () => ({ name: "John", age: 30 }));
      const result = await app.agent.execute("getUser");
      expect(result).toEqual({ name: "John", age: 30 });
    });

    test("should handle async actions", async () => {
      app.agent.register("asyncAction", async (payload: any) => {
        return `async: ${payload.message}`;
      });
      const result = await app.agent.execute("asyncAction", {
        message: "hello",
      });
      expect(result).toBe("async: hello");
    });

    test("should throw error for non-existent action", async () => {
      await expect(app.agent.execute("nonExistent")).rejects.toThrow(
        '[AgentPlugin] Action "nonExistent" not found'
      );
    });

    test("should throw error for non-function handler", () => {
      expect(() => {
        app.agent.register("bad", "not a function");
      }).toThrow("[AgentPlugin] Action handler must be a function");
    });

    test("should unregister an action", () => {
      app.agent.register("toRemove", () => {});
      expect(app.agent.hasAction("toRemove")).toBe(true);
      app.agent.unregister("toRemove");
      expect(app.agent.hasAction("toRemove")).toBe(false);
    });

    test("should warn when unregistering non-existent action", () => {
      const warnSpy = spyOn(console, "warn").mockImplementation(() => {});
      app.agent.unregister("doesNotExist");
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    test("should check action existence with hasAction", () => {
      expect(app.agent.hasAction("missing")).toBe(false);
      app.agent.register("exists", () => {});
      expect(app.agent.hasAction("exists")).toBe(true);
    });

    test("should overwrite existing action with same name", async () => {
      app.agent.register("action", () => "v1");
      app.agent.register("action", () => "v2");
      const result = await app.agent.execute("action");
      expect(result).toBe("v2");
    });

    test("should execute actions via global convenience method", async () => {
      app.agent.register("ping", () => "pong");
      const result = await app.agentExecute("ping");
      expect(result).toBe("pong");
    });
  });

  // ===========================================================================
  // Action Schemas (Contracts)
  // ===========================================================================

  describe("Action Schemas", () => {
    beforeEach(() => {
      app.use(AgentPlugin);
    });

    test("should register action with schema", () => {
      app.agent.register("addItem", (p: any) => p, {
        input: { name: "string", qty: "number" },
        output: "object",
        errors: ["INVALID_INPUT"],
      });

      const desc = app.agent.describeAction("addItem");
      expect(desc).not.toBeNull();
      expect(desc.name).toBe("addItem");
      expect(desc.schema.input).toEqual({ name: "string", qty: "number" });
      expect(desc.schema.output).toBe("object");
      expect(desc.schema.errors).toEqual(["INVALID_INPUT"]);
    });

    test("should return null schema when none provided", () => {
      app.agent.register("simple", () => {});
      const desc = app.agent.describeAction("simple");
      expect(desc).not.toBeNull();
      expect(desc.schema).toBeNull();
    });

    test("should return null for non-existent action", () => {
      expect(app.agent.describeAction("missing")).toBeNull();
    });

    test("should list all actions with schemas", () => {
      app.agent.register("a", () => {}, { input: { x: "number" } });
      app.agent.register("b", () => {});

      const list = app.agent.listActions();
      expect(list.length).toBe(2);

      const actionA = list.find((a: any) => a.name === "a");
      const actionB = list.find((a: any) => a.name === "b");
      expect(actionA.schema).toEqual({ input: { x: "number" } });
      expect(actionB.schema).toBeNull();
    });

    test("should remove schema when action is unregistered", () => {
      app.agent.register("temp", () => {}, { output: "string" });
      expect(app.agent.describeAction("temp")).not.toBeNull();

      app.agent.unregister("temp");
      expect(app.agent.describeAction("temp")).toBeNull();
    });

    test("should list empty array when no actions registered", () => {
      expect(app.agent.listActions()).toEqual([]);
    });
  });

  // ===========================================================================
  // Permissions (Capability-Based Access Control)
  // ===========================================================================

  describe("Permissions", () => {
    test("should allow unrestricted access when no permissions configured", async () => {
      app.use(AgentPlugin);
      app.agent.register("anything", () => "ok");

      const result = await app.agent.execute("anything", null, "any-scope");
      expect(result).toBe("ok");
    });

    test("should allow access for permitted scope", async () => {
      app.use(AgentPlugin, {
        permissions: {
          "ui-agent": { actions: ["updateTheme"], commands: ["REFRESH"] },
        },
      });

      app.agent.register("updateTheme", () => "dark");
      const result = await app.agent.execute("updateTheme", null, "ui-agent");
      expect(result).toBe("dark");
    });

    test("should deny action execution for unpermitted scope", async () => {
      app.use(AgentPlugin, {
        permissions: {
          "ui-agent": { actions: ["updateTheme"] },
        },
      });

      app.agent.register("deleteAll", () => {});
      await expect(
        app.agent.execute("deleteAll", null, "ui-agent")
      ).rejects.toThrow("[AgentPlugin] Permission denied");
    });

    test("should deny command dispatch for unpermitted scope", async () => {
      app.use(AgentPlugin, {
        permissions: {
          "ui-agent": { commands: ["REFRESH"] },
        },
      });

      await expect(
        app.agent.dispatch({ type: "DELETE_ALL" }, "ui-agent")
      ).rejects.toThrow("[AgentPlugin] Permission denied");
    });

    test("should deny access for unknown scope", async () => {
      app.use(AgentPlugin, {
        permissions: {
          "ui-agent": { actions: ["updateTheme"] },
        },
      });

      app.agent.register("updateTheme", () => "ok");
      await expect(
        app.agent.execute("updateTheme", null, "unknown-agent")
      ).rejects.toThrow("[AgentPlugin] Permission denied");
    });

    test("should allow access without scope even when permissions exist", async () => {
      app.use(AgentPlugin, {
        permissions: {
          "ui-agent": { actions: ["updateTheme"] },
        },
      });

      app.agent.register("anything", () => "ok");
      // No scope = unrestricted
      const result = await app.agent.execute("anything");
      expect(result).toBe("ok");
    });

    test("should allow command dispatch for permitted scope", async () => {
      app.use(AgentPlugin, {
        permissions: {
          "data-agent": { commands: ["FETCH_DATA"] },
        },
      });

      let received = false;
      app.agent.onCommand("FETCH_DATA", () => {
        received = true;
      });

      await app.agent.dispatch({ type: "FETCH_DATA" }, "data-agent");
      expect(received).toBe(true);
    });

    test("should call error handler on permission denial", async () => {
      const errorHandler = mock(() => {});
      app.use(AgentPlugin, {
        onError: errorHandler,
        permissions: {
          limited: { actions: [] },
        },
      });

      app.agent.register("secret", () => {});
      await expect(
        app.agent.execute("secret", null, "limited")
      ).rejects.toThrow("[AgentPlugin] Permission denied");
      expect(errorHandler).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Command Bus
  // ===========================================================================

  describe("Command Bus", () => {
    beforeEach(() => {
      app.use(AgentPlugin);
    });

    test("should dispatch commands to registered handlers", async () => {
      const received: any[] = [];
      app.agent.onCommand("UPDATE_UI", (cmd: any) => {
        received.push(cmd);
      });

      await app.agent.dispatch({ type: "UPDATE_UI", payload: { text: "hi" } });
      expect(received.length).toBe(1);
      expect(received[0].type).toBe("UPDATE_UI");
      expect(received[0].payload).toEqual({ text: "hi" });
    });

    test("should handle commands with target and payload", async () => {
      let result: any = null;
      app.agent.onCommand("NAVIGATE", (cmd: any) => {
        result = { target: cmd.target, path: cmd.payload };
      });

      await app.agent.dispatch({
        type: "NAVIGATE",
        target: "Router",
        payload: "/home",
      });
      expect(result).toEqual({ target: "Router", path: "/home" });
    });

    test("should support multiple handlers for same command type", async () => {
      let count = 0;
      app.agent.onCommand("MULTI", () => count++);
      app.agent.onCommand("MULTI", () => count++);

      await app.agent.dispatch({ type: "MULTI" });
      expect(count).toBe(2);
    });

    test("should unsubscribe command handlers", async () => {
      let count = 0;
      const unsubscribe = app.agent.onCommand("TEMP", () => count++);

      await app.agent.dispatch({ type: "TEMP" });
      expect(count).toBe(1);

      unsubscribe();
      await app.agent.dispatch({ type: "TEMP" });
      expect(count).toBe(1);
    });

    test("should handle command dispatch with no handlers silently", async () => {
      await expect(
        app.agent.dispatch({ type: "NO_HANDLER" })
      ).resolves.toBeUndefined();
    });

    test("should throw for non-function command handler", () => {
      expect(() => {
        app.agent.onCommand("BAD", "not a function" as any);
      }).toThrow("[AgentPlugin] Command handler must be a function");
    });

    test("should throw for command without type", async () => {
      await expect(app.agent.dispatch({} as any)).rejects.toThrow(
        "[AgentPlugin] Command must have a string 'type'"
      );
    });

    test("should dispatch via global convenience method", async () => {
      let received = false;
      app.agent.onCommand("GLOBAL", () => {
        received = true;
      });

      await app.agentDispatch({ type: "GLOBAL" });
      expect(received).toBe(true);
    });
  });

  // ===========================================================================
  // Audit Log
  // ===========================================================================

  describe("Audit Log", () => {
    beforeEach(() => {
      app.use(AgentPlugin);
    });

    test("should log action executions", async () => {
      app.agent.register("loggedAction", () => "done");
      await app.agent.execute("loggedAction", { key: "value" });

      const log = app.agent.getLog();
      expect(log.length).toBe(1);
      expect(log[0].type).toBe("action");
      expect(log[0].action).toBe("loggedAction");
      expect(log[0].payload).toEqual({ key: "value" });
      expect(typeof log[0].timestamp).toBe("number");
    });

    test("should log command dispatches", async () => {
      await app.agent.dispatch({
        type: "LOG_CMD",
        payload: "data",
      });

      const log = app.agent.getLog();
      expect(log.length).toBe(1);
      expect(log[0].type).toBe("command");
      expect(log[0].action).toBe("LOG_CMD");
    });

    test("should limit log to maxLogSize (rotation)", () => {
      AgentPlugin.uninstall(app);
      app.use(AgentPlugin, { maxLogSize: 5 });

      for (let i = 0; i < 10; i++) {
        app.agent.register(`action${i}`, () => {});
      }

      // Execute 10 actions to generate 10 log entries
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(app.agent.execute(`action${i}`));
      }

      return Promise.all(promises).then(() => {
        const log = app.agent.getLog();
        expect(log.length).toBe(5);
      });
    });

    test("should filter log by type", async () => {
      app.agent.register("a", () => {});
      await app.agent.execute("a");
      await app.agent.dispatch({ type: "c" });

      const actions = app.agent.getLog({ type: "action" });
      expect(actions.length).toBe(1);
      expect(actions[0].action).toBe("a");

      const commands = app.agent.getLog({ type: "command" });
      expect(commands.length).toBe(1);
    });

    test("should filter log by since timestamp", async () => {
      app.agent.register("early", () => {});
      app.agent.register("late", () => {});
      await app.agent.execute("early");

      // Small delay to ensure different timestamps
      await new Promise((r) => setTimeout(r, 20));

      const midpoint = Date.now();
      await app.agent.execute("late");

      const recentLog = app.agent.getLog({ since: midpoint });
      expect(recentLog.length).toBe(1);
      expect(recentLog[0].action).toBe("late");
    });

    test("should filter log by action name", async () => {
      app.agent.register("a", () => {});
      app.agent.register("b", () => {});
      await app.agent.execute("a");
      await app.agent.execute("b");
      await app.agent.execute("a");

      const filtered = app.agent.getLog({ action: "a" });
      expect(filtered.length).toBe(2);
    });

    test("should clear log", async () => {
      app.agent.register("x", () => {});
      await app.agent.execute("x");
      await app.agent.execute("x");
      expect(app.agent.getLog().length).toBe(2);

      app.agent.clearLog();
      expect(app.agent.getLog().length).toBe(0);
    });

    test("should return a copy of the log (not reference)", async () => {
      app.agent.register("x", () => {});
      await app.agent.execute("x");
      const log1 = app.agent.getLog();
      const log2 = app.agent.getLog();
      expect(log1).not.toBe(log2);
      expect(log1).toEqual(log2);
    });

    test("should record scope in log source when provided", async () => {
      app.agent.register("scoped", () => {});
      await app.agent.execute("scoped", null, "my-agent");

      const log = app.agent.getLog();
      expect(log[0].source).toBe("my-agent");
    });
  });

  // ===========================================================================
  // Emitter Integration
  // ===========================================================================

  describe("Emitter Integration", () => {
    test("should capture emitter events matching prefixes in audit log", () => {
      app.use(AgentPlugin, { emitterEvents: ["test:"] });

      app.emitter.emit("test:something", { data: 1 });
      app.emitter.emit("other:event", { data: 2 });

      const log = app.agent.getLog();
      expect(log.length).toBe(1);
      expect(log[0].type).toBe("event");
      expect(log[0].action).toBe("test:something");
      expect(log[0].payload).toEqual({ data: 1 });
      expect(log[0].source).toBe("emitter");
    });

    test("should capture multiple emitter prefixes", () => {
      app.use(AgentPlugin, { emitterEvents: ["store:", "router:"] });

      app.emitter.emit("store:change", "state-data");
      app.emitter.emit("router:navigate", "/home");
      app.emitter.emit("user:login", "Alice");

      const log = app.agent.getLog();
      expect(log.length).toBe(2);
      expect(log[0].action).toBe("store:change");
      expect(log[1].action).toBe("router:navigate");
    });

    test("should not capture emitter events when no prefixes configured", () => {
      app.use(AgentPlugin);

      app.emitter.emit("some:event", "data");

      const log = app.agent.getLog();
      expect(log.length).toBe(0);
    });

    test("should still deliver events to normal emitter listeners", () => {
      app.use(AgentPlugin, { emitterEvents: ["test:"] });

      let received: any = null;
      app.emitter.on("test:event", (data: any) => {
        received = data;
      });

      app.emitter.emit("test:event", "hello");
      expect(received).toBe("hello");
    });

    test("should restore emitter on uninstall", () => {
      app.use(AgentPlugin, { emitterEvents: ["test:"] });

      const emitBefore = app.emitter.emit;
      AgentPlugin.uninstall(app);

      // After uninstall, emit should work without logging
      app.emitter.emit("test:event", "after-uninstall");
      // No agent to check, but the emit shouldn't throw
      expect(app.agent).toBeUndefined();
    });
  });

  // ===========================================================================
  // State Inspection
  // ===========================================================================

  describe("State Inspection", () => {
    beforeEach(() => {
      app.use(AgentPlugin);
    });

    test("should inspect component registry", () => {
      app.component("TestComp", {
        setup: () => ({}),
        template: () => "<div>Test</div>",
      });

      const result = app.agent.inspect();
      expect(result.components.length).toBe(1);
      expect(result.components[0].name).toBe("TestComp");
      expect(result.components[0].hasSetup).toBe(true);
      expect(result.components[0].hasTemplate).toBe(true);
    });

    test("should create serializable snapshot", () => {
      app.component("Comp1", { template: () => "<div>1</div>" });
      app.component("Comp2", {
        setup: () => ({}),
        template: () => "<div>2</div>",
      });

      const snap = app.agent.snapshot();
      expect(typeof snap.timestamp).toBe("number");
      expect(snap.components.length).toBe(2);
      expect(snap.plugins).toContain("agent");
    });

    test("should diff two snapshots", () => {
      const snapA = {
        timestamp: 1000,
        components: [
          { name: "Comp1", hasSetup: true, hasChildren: false },
          { name: "Comp2", hasSetup: true, hasChildren: false },
        ],
        plugins: ["agent"],
      };

      const snapB = {
        timestamp: 2000,
        components: [
          { name: "Comp2", hasSetup: true, hasChildren: false },
          { name: "Comp3", hasSetup: true, hasChildren: false },
        ],
        plugins: ["agent"],
      };

      const result = app.agent.diff(snapA, snapB);
      expect(result.added).toContain("Comp3");
      expect(result.removed).toContain("Comp1");
    });

    test("should not expose inspection methods when disabled", () => {
      AgentPlugin.uninstall(app);
      app.use(AgentPlugin, { enableInspection: false });

      // inspect/snapshot/diff should not be on ctx.agent API
      // but they ARE on the internal agent instance (guarded)
      // The ctx.agent API excludes them when disabled
      // Test via component integration
      let agentApi: any = null;
      app.component("NoInspect", {
        setup(ctx: any) {
          agentApi = ctx.agent;
          return {};
        },
        template: () => "<div>No Inspect</div>",
      });

      return app.mount(container, "NoInspect").then(async () => {
        await flushPromises();
        expect(agentApi.inspect).toBeUndefined();
        expect(agentApi.snapshot).toBeUndefined();
        expect(agentApi.diff).toBeUndefined();
        // Core methods should still work
        expect(typeof agentApi.register).toBe("function");
        expect(typeof agentApi.execute).toBe("function");
      });
    });

    test("should handle empty component registry", () => {
      const result = app.agent.inspect();
      expect(result.components).toEqual([]);
    });
  });

  // ===========================================================================
  // Component Integration
  // ===========================================================================

  describe("Component Integration", () => {
    beforeEach(() => {
      app.use(AgentPlugin);
    });

    test("should inject agent into component setup", async () => {
      let agentCtx: any = null;

      app.component("TestComp", {
        setup(ctx: any) {
          agentCtx = ctx.agent;
          return {};
        },
        template: () => "<div>Test</div>",
      });

      await app.mount(container, "TestComp");
      await flushPromises();

      expect(agentCtx).not.toBeNull();
      expect(typeof agentCtx.register).toBe("function");
      expect(typeof agentCtx.execute).toBe("function");
      expect(typeof agentCtx.dispatch).toBe("function");
      expect(typeof agentCtx.getLog).toBe("function");
      expect(typeof agentCtx.describeAction).toBe("function");
      expect(typeof agentCtx.listActions).toBe("function");
      // Inspection enabled by default
      expect(typeof agentCtx.inspect).toBe("function");
    });

    test("should allow components to register actions", async () => {
      app.component("ActionComp", {
        setup(ctx: any) {
          ctx.agent.register("compAction", (p: any) => p.x + 1);
          return {};
        },
        template: () => "<div>Action Component</div>",
      });

      await app.mount(container, "ActionComp");
      await flushPromises();

      const result = await app.agent.execute("compAction", { x: 5 });
      expect(result).toBe(6);
    });

    test("should allow components to use emitter for events", async () => {
      const events: any[] = [];

      app.component("EmitterComp", {
        setup(ctx: any) {
          // Use emitter directly, not agent
          ctx.emitter.on("comp:event", (data: any) => {
            events.push(data);
          });
          return {};
        },
        template: () => "<div>Emitter</div>",
      });

      await app.mount(container, "EmitterComp");
      await flushPromises();

      app.emitter.emit("comp:event", { msg: "hello" });
      expect(events.length).toBe(1);
    });

    test("should allow components to dispatch commands", async () => {
      const commands: any[] = [];

      app.agent.onCommand("FROM_COMP", (cmd: any) => {
        commands.push(cmd);
      });

      app.component("CommandComp", {
        async setup(ctx: any) {
          await ctx.agent.dispatch({
            type: "FROM_COMP",
            payload: "initialized",
          });
          return {};
        },
        template: () => "<div>Command</div>",
      });

      await app.mount(container, "CommandComp");
      await flushPromises();

      expect(commands.length).toBe(1);
      expect(commands[0].payload).toBe("initialized");
    });

    test("should inject agent into child components", async () => {
      let childAgent: any = null;

      app.component("Parent", {
        setup: () => ({}),
        template: () => '<div><div class="child"></div></div>',
        children: {
          ".child": {
            setup(ctx: any) {
              childAgent = ctx.agent;
              return {};
            },
            template: () => "<span>Child</span>",
          },
        },
      });

      await app.mount(container, "Parent");
      await flushPromises();

      expect(childAgent).not.toBeNull();
      expect(typeof childAgent.register).toBe("function");
      expect(typeof childAgent.execute).toBe("function");
    });
  });

  // ===========================================================================
  // Cross-Component Communication
  // ===========================================================================

  describe("Cross-Component Communication", () => {
    beforeEach(() => {
      app.use(AgentPlugin);
    });

    test("should allow one component to call another's registered action", async () => {
      app.component("Producer", {
        setup(ctx: any) {
          ctx.agent.register("getData", () => ({ data: [1, 2, 3] }));
          return {};
        },
        template: () => "<div>Producer</div>",
      });

      const producerContainer = createFixture("agent-test-producer");
      await app.mount(producerContainer, "Producer");
      await flushPromises();

      const result = await app.agent.execute("getData");
      expect(result).toEqual({ data: [1, 2, 3] });
    });

    test("should allow command-driven updates between components", async () => {
      const updates: string[] = [];

      app.component("Listener", {
        setup(ctx: any) {
          ctx.agent.onCommand("REFRESH", (cmd: any) => {
            updates.push(cmd.payload);
          });
          return {};
        },
        template: () => "<div>Listener</div>",
      });

      const listenerContainer = createFixture("agent-test-listener");
      await app.mount(listenerContainer, "Listener");
      await flushPromises();

      await app.agent.dispatch({ type: "REFRESH", payload: "new data" });
      expect(updates).toEqual(["new data"]);
    });

    test("should enable cross-plugin observation via emitter", async () => {
      const observedEvents: any[] = [];

      app.component("Watcher", {
        setup(ctx: any) {
          ctx.emitter.on("global:update", (data: any) => {
            observedEvents.push(data);
          });
          return {};
        },
        template: () => "<div>Watcher</div>",
      });

      const watcherContainer = createFixture("agent-test-watcher");
      await app.mount(watcherContainer, "Watcher");
      await flushPromises();

      app.emitter.emit("global:update", "broadcasted");
      expect(observedEvents).toEqual(["broadcasted"]);
    });
  });

  // ===========================================================================
  // Error Handling
  // ===========================================================================

  describe("Error Handling", () => {
    test("should call custom error handler on action execution error", async () => {
      const errorHandler = mock(() => {});
      app.use(AgentPlugin, { onError: errorHandler });

      app.agent.register("failAction", () => {
        throw new Error("Action failed");
      });

      await expect(app.agent.execute("failAction")).rejects.toThrow(
        "Action failed"
      );
      expect(errorHandler).toHaveBeenCalledTimes(1);
    });

    test("should call error handler for non-existent action", async () => {
      const errorHandler = mock(() => {});
      app.use(AgentPlugin, { onError: errorHandler });

      await expect(app.agent.execute("missing")).rejects.toThrow(
        '[AgentPlugin] Action "missing" not found'
      );
      expect(errorHandler).toHaveBeenCalledTimes(1);
    });

    test("should call onError exactly once for permission denied", async () => {
      const errorHandler = mock(() => {});
      app.use(AgentPlugin, {
        onError: errorHandler,
        permissions: { limited: { actions: [] } },
      });

      app.agent.register("secret", () => {});
      await expect(
        app.agent.execute("secret", null, "limited")
      ).rejects.toThrow("[AgentPlugin] Permission denied");
      expect(errorHandler).toHaveBeenCalledTimes(1);
    });

    test("should handle errors in command handlers gracefully", async () => {
      const errorHandler = mock(() => {});
      app.use(AgentPlugin, { onError: errorHandler });

      app.agent.onCommand("FAIL_CMD", () => {
        throw new Error("Handler broke");
      });

      await expect(
        app.agent.dispatch({ type: "FAIL_CMD" })
      ).resolves.toBeUndefined();
      expect(errorHandler).toHaveBeenCalled();
    });

    test("should handle execute with undefined payload", async () => {
      app.use(AgentPlugin);
      app.agent.register("noPayload", (payload: any) => payload);
      const result = await app.agent.execute("noPayload");
      expect(result).toBeUndefined();
    });
  });

  // ===========================================================================
  // Performance and Memory
  // ===========================================================================

  describe("Performance and Memory", () => {
    beforeEach(() => {
      app.use(AgentPlugin, { maxLogSize: 10 });
    });

    test("should limit audit log to maxLogSize entries", async () => {
      for (let i = 0; i < 20; i++) {
        app.agent.register(`a${i}`, () => {});
      }
      for (let i = 0; i < 20; i++) {
        await app.agent.execute(`a${i}`);
      }
      expect(app.agent.getLog().length).toBe(10);
    });

    test("should properly clean up command handler subscriptions", async () => {
      const unsubscribes: (() => void)[] = [];
      let callCount = 0;

      for (let i = 0; i < 10; i++) {
        unsubscribes.push(app.agent.onCommand("PERF_CMD", () => callCount++));
      }

      await app.agent.dispatch({ type: "PERF_CMD" });
      expect(callCount).toBe(10);

      unsubscribes.forEach((fn) => fn());

      callCount = 0;
      await app.agent.dispatch({ type: "PERF_CMD" });
      expect(callCount).toBe(0);
    });
  });

  // ===========================================================================
  // Multiple Plugin Coexistence
  // ===========================================================================

  describe("Multiple Plugin Coexistence", () => {
    test("should work alongside StorePlugin", async () => {
      app.use(StorePlugin, {
        state: { counter: 0 },
        actions: {
          increment: (state: any) => state.counter.value++,
        },
      });
      app.use(AgentPlugin);

      let storeCtx: any = null;
      let agentCtx: any = null;

      app.component("DualPlugin", {
        setup(ctx: any) {
          storeCtx = ctx.store;
          agentCtx = ctx.agent;
          return {};
        },
        template: () => "<div>Dual Plugin</div>",
      });

      await app.mount(container, "DualPlugin");
      await flushPromises();

      expect(storeCtx).not.toBeNull();
      expect(agentCtx).not.toBeNull();
      expect(typeof storeCtx.dispatch).toBe("function");
      expect(typeof agentCtx.execute).toBe("function");
    });

    test("should not interfere with Store's mount wrapping", async () => {
      app.use(StorePlugin, {
        state: { value: "hello" },
        actions: {},
      });
      app.use(AgentPlugin);

      let storeState: any = null;

      app.component("StoreCheck", {
        setup(ctx: any) {
          storeState = ctx.store?.state;
          return {};
        },
        template: () => "<div>Store Check</div>",
      });

      await app.mount(container, "StoreCheck");
      await flushPromises();

      expect(storeState).not.toBeNull();
      expect(storeState.value.value).toBe("hello");
    });

    test("should allow independent uninstall of Agent and Store", () => {
      app.use(StorePlugin);
      app.use(AgentPlugin);

      expect(app.agent).toBeDefined();
      expect(app.store).toBeDefined();

      AgentPlugin.uninstall(app);
      expect(app.agent).toBeUndefined();
      expect(app.store).toBeDefined();

      StorePlugin.uninstall(app);
      expect(app.store).toBeUndefined();
    });
  });

  // ===========================================================================
  // Plugin Metadata
  // ===========================================================================

  describe("Plugin Metadata", () => {
    test("should register plugin metadata on install", () => {
      app.use(AgentPlugin);
      expect(app.plugins).toBeDefined();
      expect(app.plugins.get("agent")).toBeDefined();
      expect(app.plugins.get("agent").name).toBe("agent");
      expect(app.plugins.get("agent").version).toBe("1.0.0");
    });

    test("should remove plugin metadata on uninstall", () => {
      app.use(AgentPlugin);
      expect(app.plugins.get("agent")).toBeDefined();

      AgentPlugin.uninstall(app);
      expect(app.plugins.get("agent")).toBeUndefined();
    });

    test("should store options in plugin metadata", () => {
      const opts = { maxLogSize: 50, enableInspection: false };
      app.use(AgentPlugin, opts);

      const meta = app.plugins.get("agent");
      expect(meta.options).toEqual(opts);
    });
  });

  // ===========================================================================
  // Idempotent Install
  // ===========================================================================

  describe("Idempotent Install", () => {
    test("should warn and no-op on double install", () => {
      const warnSpy = spyOn(console, "warn").mockImplementation(() => {});
      app.use(AgentPlugin);

      const firstAgent = app.agent;

      // Second install should warn and not replace agent
      app.use(AgentPlugin, { maxLogSize: 999 });
      expect(warnSpy).toHaveBeenCalledWith(
        "[AgentPlugin] Already installed. Uninstall first to reconfigure."
      );
      // Agent instance is unchanged
      expect(app.agent).toBe(firstAgent);
      warnSpy.mockRestore();
    });

    test("should allow reinstall after explicit uninstall", () => {
      app.use(AgentPlugin, { maxLogSize: 50 });
      const firstAgent = app.agent;

      AgentPlugin.uninstall(app);
      expect(app.agent).toBeUndefined();

      app.use(AgentPlugin, { maxLogSize: 200 });
      expect(app.agent).toBeDefined();
      expect(app.agent).not.toBe(firstAgent);
    });

    test("should not create stale wrapper chains on double install", async () => {
      app.use(AgentPlugin);

      // Suppress the warning
      const warnSpy = spyOn(console, "warn").mockImplementation(() => {});
      app.use(AgentPlugin);
      warnSpy.mockRestore();

      // Mount should still work correctly with single wrapping layer
      let agentCtx: any = null;
      app.component("IdempotentTest", {
        setup(ctx: any) {
          agentCtx = ctx.agent;
          return {};
        },
        template: () => "<div>Test</div>",
      });

      await app.mount(container, "IdempotentTest");
      await flushPromises();

      expect(agentCtx).not.toBeNull();
      expect(typeof agentCtx.register).toBe("function");
    });
  });

  // ===========================================================================
  // Strict Permissions
  // ===========================================================================

  describe("Strict Permissions", () => {
    test("should deny execute without scope when strictPermissions is true", async () => {
      app.use(AgentPlugin, {
        strictPermissions: true,
        permissions: {
          admin: { actions: ["anything"] },
        },
      });

      app.agent.register("anything", () => "ok");

      // No scope = denied in strict mode
      await expect(app.agent.execute("anything")).rejects.toThrow(
        "[AgentPlugin] Permission denied"
      );
    });

    test("should deny dispatch without scope when strictPermissions is true", async () => {
      app.use(AgentPlugin, {
        strictPermissions: true,
        permissions: {
          admin: { commands: ["DO_THING"] },
        },
      });

      await expect(app.agent.dispatch({ type: "DO_THING" })).rejects.toThrow(
        "[AgentPlugin] Permission denied"
      );
    });

    test("should deny all when strictPermissions is true but no rules configured", async () => {
      app.use(AgentPlugin, {
        strictPermissions: true,
        permissions: {},
      });

      app.agent.register("anything", () => "ok");

      // Even with scope, no rules = denied
      await expect(
        app.agent.execute("anything", null, "admin")
      ).rejects.toThrow("[AgentPlugin] Permission denied");
    });

    test("should allow permitted scope in strict mode", async () => {
      app.use(AgentPlugin, {
        strictPermissions: true,
        permissions: {
          "trusted-agent": { actions: ["getData"], commands: ["REFRESH"] },
        },
      });

      app.agent.register("getData", () => "data");
      const result = await app.agent.execute("getData", null, "trusted-agent");
      expect(result).toBe("data");
    });

    test("should allow command dispatch for permitted scope in strict mode", async () => {
      app.use(AgentPlugin, {
        strictPermissions: true,
        permissions: {
          "trusted-agent": { commands: ["REFRESH"] },
        },
      });

      let received = false;
      app.agent.onCommand("REFRESH", () => {
        received = true;
      });

      await app.agent.dispatch({ type: "REFRESH" }, "trusted-agent");
      expect(received).toBe(true);
    });

    test("should default to non-strict when strictPermissions is not set", async () => {
      app.use(AgentPlugin, {
        permissions: {
          "ui-agent": { actions: ["limited"] },
        },
      });

      app.agent.register("anything", () => "ok");
      // No scope = unrestricted in default mode
      const result = await app.agent.execute("anything");
      expect(result).toBe("ok");
    });
  });

  // ===========================================================================
  // Emitter Cleanup Robustness
  // ===========================================================================

  describe("Emitter Cleanup Robustness", () => {
    test("should not clobber other emit wrappers on cleanup", () => {
      app.use(AgentPlugin, { emitterEvents: ["test:"] });

      // Simulate another plugin wrapping emit AFTER Agent
      const agentEmit = app.emitter.emit;
      let otherPluginCalled = false;
      app.emitter.emit = (event: string, ...args: any[]) => {
        otherPluginCalled = true;
        return agentEmit(event, ...args);
      };

      // Agent uninstall should detect its wrapper is no longer current
      // and skip the restore to avoid clobbering the other plugin
      AgentPlugin.uninstall(app);

      // The other plugin's wrapper should still be in place
      app.emitter.emit("test:event", "data");
      expect(otherPluginCalled).toBe(true);
    });

    test("should not log into destroyed agent when wrapper is still chained", () => {
      app.use(AgentPlugin, { emitterEvents: ["test:"] });

      // Verify logging works before uninstall
      app.emitter.emit("test:before", "data");
      expect(app.agent.getLog().length).toBe(1);

      // Grab a reference to the internal agent before uninstall
      const destroyedAgent = app.agent;

      // Simulate another plugin wrapping emit on top of Agent's wrapper
      const agentEmit = app.emitter.emit;
      app.emitter.emit = (event: string, ...args: any[]) => {
        return agentEmit(event, ...args);
      };

      // Uninstall Agent — wrapper can't be restored (not current),
      // but _destroyed flag should prevent logging
      AgentPlugin.uninstall(app);

      // Emit through the chain — the detached wrappedEmit is still
      // in the chain but should be neutralized by _destroyed flag
      app.emitter.emit("test:after", "data");

      // The destroyed agent's log should still be empty (cleared by destroy)
      // and should NOT have grown from the post-uninstall emit
      expect(destroyedAgent._log.length).toBe(0);
    });

    test("should restore emit when it is still the agent wrapper", () => {
      app.use(AgentPlugin, { emitterEvents: ["test:"] });

      // emit is now wrapped — verify by checking it logs events
      app.emitter.emit("test:before", "data");
      expect(app.agent.getLog().length).toBe(1);

      AgentPlugin.uninstall(app);

      // After uninstall, emit should work but no longer be wrapped
      // (no agent to log to, and emit shouldn't throw)
      let received = false;
      // Re-init emitter listener to verify emit still works
      app.emitter.on("test:after", () => {
        received = true;
      });
      app.emitter.emit("test:after", "data");
      expect(received).toBe(true);
    });
  });

  // ===========================================================================
  // Snapshot Plugin List Accuracy
  // ===========================================================================

  describe("Snapshot Plugin List Accuracy", () => {
    test("should use eleva.plugins for accurate plugin list", () => {
      app.use(AgentPlugin);

      const snap = app.agent.snapshot();
      expect(snap.plugins).toContain("agent");
    });

    test("should only include plugins that register in public Map", () => {
      // StorePlugin does NOT register in eleva.plugins, only in core _plugins
      app.use(StorePlugin);
      app.use(AgentPlugin);

      const snap = app.agent.snapshot();
      // Agent registers in eleva.plugins → present
      expect(snap.plugins).toContain("agent");
      // Store does not register in eleva.plugins → absent
      // (This is intentional: snapshot uses the authoritative public Map only)
      expect(snap.plugins).not.toContain("store");
    });

    test("should accurately reflect uninstalled plugins", () => {
      // Install two plugins that both register in eleva.plugins
      app.use(AttrPlugin);
      app.use(AgentPlugin);

      const snap1 = app.agent.snapshot();
      expect(snap1.plugins).toContain("attr");
      expect(snap1.plugins).toContain("agent");

      // Uninstall Attr (removes from eleva.plugins)
      AttrPlugin.uninstall(app);

      // Attr should be gone from the snapshot — no stale entries
      const snap2 = app.agent.snapshot();
      expect(snap2.plugins).toContain("agent");
      expect(snap2.plugins).not.toContain("attr");
    });
  });

  // ===========================================================================
  // Feature #1: Audit Log Outcomes
  // ===========================================================================

  describe("Audit Log Outcomes", () => {
    test("should record result and durationMs on successful execute", async () => {
      app.use(AgentPlugin, {
        actions: { greet: (p: any) => `Hello, ${p.name}!` },
      });

      const result = await app.agent.execute("greet", { name: "World" });
      expect(result).toBe("Hello, World!");

      const log = app.agent.getLog();
      expect(log).toHaveLength(1);
      expect(log[0].result).toBe("Hello, World!");
      expect(log[0].error).toBeUndefined();
      expect(typeof log[0].durationMs).toBe("number");
      expect(log[0].durationMs).toBeGreaterThanOrEqual(0);
    });

    test("should record error and durationMs on failed execute", async () => {
      app.use(AgentPlugin, {
        actions: {
          fail: () => {
            throw new Error("boom");
          },
        },
      });

      try {
        await app.agent.execute("fail");
      } catch (e) {
        // expected
      }

      const log = app.agent.getLog();
      expect(log).toHaveLength(1);
      expect(log[0].error).toBe("boom");
      expect(log[0].result).toBeUndefined();
      expect(typeof log[0].durationMs).toBe("number");
    });

    test("should record durationMs on command dispatch", async () => {
      app.use(AgentPlugin);

      const unsub = app.agent.onCommand("TEST", () => {});
      await app.agent.dispatch({ type: "TEST", payload: { x: 1 } });
      unsub();

      const log = app.agent.getLog();
      expect(log).toHaveLength(1);
      expect(typeof log[0].durationMs).toBe("number");
      expect(log[0].durationMs).toBeGreaterThanOrEqual(0);
    });

    test("should record command handler errors in log", async () => {
      const errorHandler = mock(() => {});
      app.use(AgentPlugin, { onError: errorHandler });

      const unsub = app.agent.onCommand("FAIL", () => {
        throw new Error("handler boom");
      });
      await app.agent.dispatch({ type: "FAIL" });
      unsub();

      const log = app.agent.getLog();
      expect(log).toHaveLength(1);
      expect(log[0].error).toBe("handler boom");
    });

    test("should filter log by status 'ok'", async () => {
      app.use(AgentPlugin, {
        actions: {
          ok: () => "fine",
          fail: () => {
            throw new Error("nope");
          },
        },
      });

      await app.agent.execute("ok");
      try {
        await app.agent.execute("fail");
      } catch (e) {
        // expected
      }

      const okLogs = app.agent.getLog({ status: "ok" });
      expect(okLogs).toHaveLength(1);
      expect(okLogs[0].action).toBe("ok");
    });

    test("should filter log by status 'error'", async () => {
      app.use(AgentPlugin, {
        actions: {
          ok: () => "fine",
          fail: () => {
            throw new Error("nope");
          },
        },
      });

      await app.agent.execute("ok");
      try {
        await app.agent.execute("fail");
      } catch (e) {
        // expected
      }

      const errorLogs = app.agent.getLog({ status: "error" });
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].action).toBe("fail");
      expect(errorLogs[0].error).toBe("nope");
    });

    test("should record result for async actions", async () => {
      app.use(AgentPlugin, {
        actions: {
          asyncGreet: async (p: any) => {
            await new Promise((r) => setTimeout(r, 10));
            return `Async Hello, ${p.name}!`;
          },
        },
      });

      const result = await app.agent.execute("asyncGreet", { name: "World" });
      expect(result).toBe("Async Hello, World!");

      const log = app.agent.getLog();
      expect(log[0].result).toBe("Async Hello, World!");
      expect(log[0].durationMs).toBeGreaterThanOrEqual(5);
    });
  });

  // ===========================================================================
  // Feature #2: Schema Validation
  // ===========================================================================

  describe("Schema Validation", () => {
    test("should pass validation when payload matches schema", async () => {
      app.use(AgentPlugin, {
        validateSchemas: true,
        actions: {
          greet: (p: any) => `Hello, ${p.name}!`,
        },
      });
      app.agent.register("greet", (p: any) => `Hello, ${p.name}!`, {
        input: { name: "string" },
        output: "string",
      });

      const result = await app.agent.execute("greet", { name: "World" });
      expect(result).toBe("Hello, World!");
    });

    test("should throw schema violation for missing required field", async () => {
      app.use(AgentPlugin, { validateSchemas: true });
      app.agent.register("greet", (p: any) => `Hello, ${p.name}!`, {
        input: { name: "string" },
      });

      try {
        await app.agent.execute("greet", {});
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.code).toBe("AGENT_SCHEMA_VIOLATION");
        expect(error.message).toContain('missing required field "name"');
        expect(error.violations).toBeArray();
        expect(error.violations.length).toBeGreaterThan(0);
      }
    });

    test("should throw schema violation for wrong field type", async () => {
      app.use(AgentPlugin, { validateSchemas: true });
      app.agent.register("calc", (p: any) => p.a + p.b, {
        input: { a: "number", b: "number" },
      });

      try {
        await app.agent.execute("calc", { a: "not a number", b: 2 });
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.code).toBe("AGENT_SCHEMA_VIOLATION");
        expect(error.message).toContain(
          'field "a" expected number, got string'
        );
      }
    });

    test("should throw schema violation for null payload", async () => {
      app.use(AgentPlugin, { validateSchemas: true });
      app.agent.register("greet", (p: any) => `Hello!`, {
        input: { name: "string" },
      });

      try {
        await app.agent.execute("greet", null);
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.code).toBe("AGENT_SCHEMA_VIOLATION");
        expect(error.message).toContain("expected object payload, got null");
      }
    });

    test("should not validate when validateSchemas is false (default)", async () => {
      app.use(AgentPlugin);
      app.agent.register("greet", () => "hi", {
        input: { name: "string" },
      });

      // Missing required field but validation is off
      const result = await app.agent.execute("greet", {});
      expect(result).toBe("hi");
    });

    test("should skip validation for actions without schema", async () => {
      app.use(AgentPlugin, { validateSchemas: true });
      app.agent.register("noSchema", (p: any) => p);

      const result = await app.agent.execute("noSchema", { any: "data" });
      expect(result).toEqual({ any: "data" });
    });

    test("should skip validation for schemas without input", async () => {
      app.use(AgentPlugin, { validateSchemas: true });
      app.agent.register("outputOnly", () => 42, {
        output: "number",
      });

      const result = await app.agent.execute("outputOnly");
      expect(result).toBe(42);
    });

    test("should call onError with schema violation context", async () => {
      const errorHandler = mock(() => {});
      app.use(AgentPlugin, { validateSchemas: true, onError: errorHandler });
      app.agent.register("greet", (p: any) => `Hello!`, {
        input: { name: "string" },
      });

      try {
        await app.agent.execute("greet", {});
      } catch (e) {
        // expected
      }

      expect(errorHandler).toHaveBeenCalledTimes(1);
      const [error, context] = (errorHandler.mock.calls as any[])[0];
      expect(error.code).toBe("AGENT_SCHEMA_VIOLATION");
      expect(context.method).toBe("execute");
      expect(context.code).toBe("AGENT_SCHEMA_VIOLATION");
      expect(context.action).toBe("greet");
    });
  });

  // ===========================================================================
  // Feature #3: Structured Error Codes
  // ===========================================================================

  describe("Structured Error Codes", () => {
    test("should set AGENT_HANDLER_NOT_FUNCTION on register", () => {
      app.use(AgentPlugin);
      try {
        app.agent.register("bad", "not a function");
      } catch (error: any) {
        expect(error.code).toBe("AGENT_HANDLER_NOT_FUNCTION");
      }
    });

    test("should set AGENT_PERMISSION_DENIED on execute", async () => {
      app.use(AgentPlugin, {
        actions: { read: () => "ok" },
        permissions: { admin: { actions: ["read"] } },
      });

      try {
        await app.agent.execute("read", null, "viewer");
      } catch (error: any) {
        expect(error.code).toBe("AGENT_PERMISSION_DENIED");
      }
    });

    test("should set AGENT_ACTION_NOT_FOUND on execute", async () => {
      app.use(AgentPlugin);

      try {
        await app.agent.execute("nonexistent");
      } catch (error: any) {
        expect(error.code).toBe("AGENT_ACTION_NOT_FOUND");
      }
    });

    test("should set AGENT_COMMAND_INVALID_TYPE on dispatch", async () => {
      app.use(AgentPlugin);

      try {
        await app.agent.dispatch({});
      } catch (error: any) {
        expect(error.code).toBe("AGENT_COMMAND_INVALID_TYPE");
      }
    });

    test("should set AGENT_PERMISSION_DENIED on dispatch", async () => {
      app.use(AgentPlugin, {
        permissions: { admin: { commands: ["SHUTDOWN"] } },
      });

      try {
        await app.agent.dispatch({ type: "SHUTDOWN" }, "viewer");
      } catch (error: any) {
        expect(error.code).toBe("AGENT_PERMISSION_DENIED");
      }
    });

    test("should set AGENT_HANDLER_NOT_FUNCTION on onCommand", () => {
      app.use(AgentPlugin);

      try {
        app.agent.onCommand("TEST", "not a function");
      } catch (error: any) {
        expect(error.code).toBe("AGENT_HANDLER_NOT_FUNCTION");
      }
    });

    test("should set AGENT_HANDLER_ERROR on handler throw", async () => {
      app.use(AgentPlugin, {
        actions: {
          fail: () => {
            throw new Error("handler boom");
          },
        },
      });

      try {
        await app.agent.execute("fail");
      } catch (error: any) {
        expect(error.code).toBe("AGENT_HANDLER_ERROR");
      }
    });

    test("should pass structured context to onError", async () => {
      const errorHandler = mock(() => {});
      app.use(AgentPlugin, {
        actions: { read: () => "ok" },
        permissions: { admin: { actions: ["read"] } },
        onError: errorHandler,
      });

      try {
        await app.agent.execute("read", null, "viewer");
      } catch (e) {
        // expected
      }

      expect(errorHandler).toHaveBeenCalledTimes(1);
      const [error, context] = (errorHandler.mock.calls as any[])[0];
      expect(context).toEqual({
        method: "execute",
        code: "AGENT_PERMISSION_DENIED",
        action: "read",
        scope: "viewer",
      });
    });

    test("should pass structured context to onError for dispatch permission", async () => {
      const errorHandler = mock(() => {});
      app.use(AgentPlugin, {
        permissions: { admin: { commands: ["SHUTDOWN"] } },
        onError: errorHandler,
      });

      try {
        await app.agent.dispatch({ type: "SHUTDOWN" }, "viewer");
      } catch (e) {
        // expected
      }

      expect(errorHandler).toHaveBeenCalledTimes(1);
      const [error, context] = (errorHandler.mock.calls as any[])[0];
      expect(context.method).toBe("dispatch");
      expect(context.code).toBe("AGENT_PERMISSION_DENIED");
      expect(context.commandType).toBe("SHUTDOWN");
      expect(context.scope).toBe("viewer");
    });

    test("should not overwrite custom error codes from handlers", async () => {
      app.use(AgentPlugin, {
        actions: {
          custom: () => {
            const err: any = new Error("custom error");
            err.code = "MY_CUSTOM_CODE";
            throw err;
          },
        },
      });

      try {
        await app.agent.execute("custom");
      } catch (error: any) {
        expect(error.code).toBe("MY_CUSTOM_CODE");
      }
    });
  });

  // ===========================================================================
  // Feature #4: executeBatch() and executeSequence()
  // ===========================================================================

  describe("Composition Primitives", () => {
    describe("executeBatch", () => {
      test("should execute multiple actions in parallel", async () => {
        app.use(AgentPlugin, {
          actions: {
            double: (p: any) => p.n * 2,
            triple: (p: any) => p.n * 3,
            square: (p: any) => p.n * p.n,
          },
        });

        const results = await app.agent.executeBatch([
          { action: "double", payload: { n: 5 } },
          { action: "triple", payload: { n: 5 } },
          { action: "square", payload: { n: 5 } },
        ]);

        expect(results).toEqual([10, 15, 25]);
      });

      test("should reject batch if any action fails", async () => {
        app.use(AgentPlugin, {
          actions: {
            ok: () => "fine",
            fail: () => {
              throw new Error("batch fail");
            },
          },
        });

        try {
          await app.agent.executeBatch([{ action: "ok" }, { action: "fail" }]);
          expect(true).toBe(false);
        } catch (error: any) {
          expect(error.message).toBe("batch fail");
        }
      });

      test("should pass scope to all batch actions", async () => {
        app.use(AgentPlugin, {
          actions: { read: () => "data" },
          permissions: { viewer: { actions: ["read"] } },
        });

        const results = await app.agent.executeBatch(
          [{ action: "read" }],
          "viewer"
        );
        expect(results).toEqual(["data"]);
      });

      test("should reject batch if scope denies any action", async () => {
        app.use(AgentPlugin, {
          actions: {
            read: () => "data",
            write: () => "written",
          },
          permissions: { viewer: { actions: ["read"] } },
        });

        try {
          await app.agent.executeBatch(
            [{ action: "read" }, { action: "write" }],
            "viewer"
          );
          expect(true).toBe(false);
        } catch (error: any) {
          expect(error.code).toBe("AGENT_PERMISSION_DENIED");
        }
      });

      test("should handle empty batch", async () => {
        app.use(AgentPlugin);

        const results = await app.agent.executeBatch([]);
        expect(results).toEqual([]);
      });

      test("should create audit log entries for each batch action", async () => {
        app.use(AgentPlugin, {
          actions: {
            a: () => "resultA",
            b: () => "resultB",
          },
        });

        await app.agent.executeBatch([
          { action: "a", payload: { x: 1 } },
          { action: "b", payload: { x: 2 } },
        ]);

        const log = app.agent.getLog({ type: "action" });
        expect(log).toHaveLength(2);
        expect(log[0].result).toBe("resultA");
        expect(log[1].result).toBe("resultB");
      });
    });

    describe("executeSequence", () => {
      test("should pipe results from one action to the next", async () => {
        app.use(AgentPlugin, {
          actions: {
            fetchUser: (p: any) => ({ id: p.id, name: "Alice" }),
            formatName: (p: any) => `User: ${p.name}`,
          },
        });

        const result = await app.agent.executeSequence([
          { action: "fetchUser", payload: { id: 1 } },
          { action: "formatName" }, // receives { id: 1, name: "Alice" }
        ]);

        expect(result).toBe("User: Alice");
      });

      test("should stop sequence on first error", async () => {
        let calledThird = false;
        app.use(AgentPlugin, {
          actions: {
            first: () => "ok",
            second: () => {
              throw new Error("seq fail");
            },
            third: () => {
              calledThird = true;
              return "never";
            },
          },
        });

        try {
          await app.agent.executeSequence([
            { action: "first" },
            { action: "second" },
            { action: "third" },
          ]);
          expect(true).toBe(false);
        } catch (error: any) {
          expect(error.message).toBe("seq fail");
          expect(calledThird).toBe(false);
        }
      });

      test("should use first action's payload for first step", async () => {
        app.use(AgentPlugin, {
          actions: {
            identity: (p: any) => p,
          },
        });

        const result = await app.agent.executeSequence([
          { action: "identity", payload: { hello: "world" } },
        ]);

        expect(result).toEqual({ hello: "world" });
      });

      test("should pass scope to all sequence actions", async () => {
        app.use(AgentPlugin, {
          actions: {
            step1: () => "a",
            step2: (p: any) => p + "b",
          },
          permissions: { user: { actions: ["step1", "step2"] } },
        });

        const result = await app.agent.executeSequence(
          [{ action: "step1" }, { action: "step2" }],
          "user"
        );
        expect(result).toBe("ab");
      });

      test("should return undefined for empty sequence", async () => {
        app.use(AgentPlugin);

        const result = await app.agent.executeSequence([]);
        expect(result).toBeUndefined();
      });

      test("should create audit log entries for each sequence step", async () => {
        app.use(AgentPlugin, {
          actions: {
            step1: () => 10,
            step2: (p: any) => p * 2,
          },
        });

        await app.agent.executeSequence([
          { action: "step1", payload: null },
          { action: "step2" },
        ]);

        const log = app.agent.getLog({ type: "action" });
        expect(log).toHaveLength(2);
        expect(log[0].result).toBe(10);
        expect(log[1].result).toBe(20);
      });
    });
  });

  // ===========================================================================
  // Feature #5: Capability Manifest (describe)
  // ===========================================================================

  describe("Capability Manifest", () => {
    test("should return complete manifest without scope", () => {
      app.use(AgentPlugin, {
        actions: {
          greet: (p: any) => `Hello, ${p.name}!`,
          calc: (p: any) => p.a + p.b,
        },
      });
      app.agent.register("greet", (p: any) => `Hello, ${p.name}!`, {
        input: { name: "string" },
        output: "string",
      });
      app.agent.register("calc", (p: any) => p.a + p.b, {
        input: { a: "number", b: "number" },
        output: "number",
      });

      const unsub = app.agent.onCommand("REFRESH", () => {});

      const manifest = app.agent.describe();

      expect(manifest.actions).toHaveLength(2);
      expect(manifest.actions[0].name).toBe("greet");
      expect(manifest.actions[0].schema).toEqual({
        input: { name: "string" },
        output: "string",
      });
      expect(manifest.actions[0].allowed).toBe(true); // no scope = allowed
      expect(manifest.actions[1].name).toBe("calc");
      expect(manifest.actions[1].allowed).toBe(true);

      expect(manifest.commands).toEqual(["REFRESH"]);

      expect(manifest.permissions).toBeNull(); // no scope provided

      expect(manifest.config).toEqual({
        strictPermissions: false,
        maxLogSize: 100,
        inspectionEnabled: true,
        validateSchemas: false,
      });

      unsub();
    });

    test("should reflect scope permissions in manifest", () => {
      app.use(AgentPlugin, {
        actions: {
          read: () => "ok",
          write: () => "ok",
        },
        permissions: {
          viewer: { actions: ["read"], commands: ["REFRESH"] },
        },
      });
      app.agent.onCommand("REFRESH", () => {});

      const manifest = app.agent.describe("viewer");

      const readAction = manifest.actions.find((a: any) => a.name === "read");
      const writeAction = manifest.actions.find((a: any) => a.name === "write");
      expect(readAction.allowed).toBe(true);
      expect(writeAction.allowed).toBe(false);

      expect(manifest.permissions).toEqual({
        scope: "viewer",
        actions: ["read"],
        commands: ["REFRESH"],
      });
    });

    test("should return empty permissions for unknown scope", () => {
      app.use(AgentPlugin, {
        actions: { read: () => "ok" },
        permissions: { admin: { actions: ["read"] } },
      });

      const manifest = app.agent.describe("unknown");

      expect(manifest.permissions).toEqual({
        scope: "unknown",
        actions: [],
        commands: [],
      });

      // All actions denied for unknown scope
      expect(manifest.actions[0].allowed).toBe(false);
    });

    test("should reflect validateSchemas config", () => {
      app.use(AgentPlugin, { validateSchemas: true });

      const manifest = app.agent.describe();
      expect(manifest.config.validateSchemas).toBe(true);
    });

    test("should reflect strictPermissions config", () => {
      app.use(AgentPlugin, { strictPermissions: true });

      const manifest = app.agent.describe();
      expect(manifest.config.strictPermissions).toBe(true);
    });

    test("should list all command types", () => {
      app.use(AgentPlugin);

      const unsub1 = app.agent.onCommand("CMD_A", () => {});
      const unsub2 = app.agent.onCommand("CMD_B", () => {});

      const manifest = app.agent.describe();
      expect(manifest.commands).toContain("CMD_A");
      expect(manifest.commands).toContain("CMD_B");

      unsub1();
      unsub2();
    });

    test("should show empty manifest when no actions registered", () => {
      app.use(AgentPlugin);

      const manifest = app.agent.describe();
      expect(manifest.actions).toEqual([]);
      expect(manifest.commands).toEqual([]);
      expect(manifest.permissions).toBeNull();
    });

    test("should be accessible via ctx.agent in components", async () => {
      app.use(AgentPlugin, {
        actions: { greet: (p: any) => `Hello!` },
      });

      let capturedManifest: any = null;
      const fixture = createFixture("describe-component");

      app.component("DescribeTest", {
        setup: ({ agent }: any) => {
          capturedManifest = agent.describe();
          return {};
        },
        template: () => `<div>test</div>`,
      });

      await app.mount(fixture, "DescribeTest");

      expect(capturedManifest).not.toBeNull();
      expect(capturedManifest.actions).toHaveLength(1);
      expect(capturedManifest.actions[0].name).toBe("greet");
      expect(capturedManifest.config).toBeDefined();
    });
  });

  // ─── agent-manifest.json schema validation ───────────────────────────
  describe("agent-manifest.json contract validation", () => {
    let manifest: any;

    beforeEach(() => {
      const fs = require("fs");
      const path = require("path");
      const filePath = path.resolve(
        __dirname,
        "../../../docs/agent-manifest.json"
      );
      manifest = JSON.parse(fs.readFileSync(filePath, "utf8"));
    });

    test("should be valid JSON with all required top-level keys", () => {
      const requiredKeys = [
        "name",
        "version",
        "framework",
        "frameworkVersion",
        "description",
        "license",
        "homepage",
        "repository",
        "install",
        "configuration",
        "methods",
        "types",
        "errors",
        "permissions",
      ];
      for (const key of requiredKeys) {
        expect(manifest).toHaveProperty(key);
      }
    });

    test("should have correct repository URL", () => {
      expect(manifest.repository).toBe("https://github.com/TarekRaafat/eleva");
    });

    test("install should have esm, cjs, cdn, usage_esm, usage_cdn", () => {
      expect(manifest.install).toHaveProperty("esm");
      expect(manifest.install).toHaveProperty("cjs");
      expect(manifest.install).toHaveProperty("cdn");
      expect(manifest.install).toHaveProperty("usage_esm");
      expect(manifest.install).toHaveProperty("usage_cdn");
      expect(manifest.install.usage_cdn).toContain("ElevaAgent");
    });

    test("should have all 8 configuration options", () => {
      expect(manifest.configuration).toHaveLength(8);
      const names = manifest.configuration.map((c: any) => c.name);
      expect(names).toContain("maxLogSize");
      expect(names).toContain("enableInspection");
      expect(names).toContain("onError");
      expect(names).toContain("actions");
      expect(names).toContain("permissions");
      expect(names).toContain("emitterEvents");
      expect(names).toContain("strictPermissions");
      expect(names).toContain("validateSchemas");
      for (const config of manifest.configuration) {
        expect(config).toHaveProperty("name");
        expect(config).toHaveProperty("type");
        expect(config).toHaveProperty("description");
        expect(config).toHaveProperty("default");
      }
    });

    test("should have all 16 methods with consistent shape", () => {
      expect(manifest.methods).toHaveLength(16);
      const expectedNames = [
        "register",
        "unregister",
        "execute",
        "executeBatch",
        "executeSequence",
        "hasAction",
        "describeAction",
        "listActions",
        "describe",
        "dispatch",
        "onCommand",
        "getLog",
        "clearLog",
        "inspect",
        "snapshot",
        "diff",
      ];
      const actualNames = manifest.methods.map((m: any) => m.name);
      for (const name of expectedNames) {
        expect(actualNames).toContain(name);
      }
      for (const method of manifest.methods) {
        expect(method).toHaveProperty("name");
        expect(typeof method.name).toBe("string");
        expect(method).toHaveProperty("category");
        expect(typeof method.category).toBe("string");
        expect(method).toHaveProperty("description");
        expect(typeof method.description).toBe("string");
        expect(method).toHaveProperty("parameters");
        expect(Array.isArray(method.parameters)).toBe(true);
        expect(method).toHaveProperty("returns");
        expect(method.returns).toHaveProperty("type");
        expect(method).toHaveProperty("errors");
        expect(Array.isArray(method.errors)).toBe(true);
        expect(method).toHaveProperty("sideEffects");
        expect(Array.isArray(method.sideEffects)).toBe(true);
      }
    });

    test("method parameters should have consistent shape", () => {
      for (const method of manifest.methods) {
        for (const param of method.parameters) {
          expect(param).toHaveProperty("name");
          expect(typeof param.name).toBe("string");
          expect(param).toHaveProperty("type");
          expect(typeof param.type).toBe("string");
          expect(param).toHaveProperty("required");
          expect(typeof param.required).toBe("boolean");
          expect(param).toHaveProperty("description");
          expect(typeof param.description).toBe("string");
        }
      }
    });

    test("should have all 10 type definitions", () => {
      const expectedTypes = [
        "AgentActionSchema",
        "AgentLogEntry",
        "AgentLogFilter",
        "AgentCommand",
        "AgentPermissionRule",
        "AgentActionDescriptor",
        "AgentSnapshot",
        "AgentDiffResult",
        "AgentCapabilityManifest",
        "AgentErrorContext",
      ];
      for (const typeName of expectedTypes) {
        expect(manifest.types).toHaveProperty(typeName);
        expect(manifest.types[typeName]).toHaveProperty("description");
        expect(manifest.types[typeName]).toHaveProperty("properties");
      }
    });

    test("type properties should have consistent shape", () => {
      for (const [typeName, typeDef] of Object.entries(manifest.types) as any) {
        for (const [propName, propDef] of Object.entries(
          typeDef.properties
        ) as any) {
          expect(propDef).toHaveProperty("type");
          expect(typeof propDef.type).toBe("string");
          expect(propDef).toHaveProperty("required");
          expect(typeof propDef.required).toBe("boolean");
          expect(propDef).toHaveProperty("description");
          expect(typeof propDef.description).toBe("string");
        }
      }
    });

    test("errors[] should all have consistent shape with methods as arrays", () => {
      expect(manifest.errors.length).toBeGreaterThanOrEqual(8);
      for (const error of manifest.errors) {
        expect(error).toHaveProperty("code");
        expect(typeof error.code).toBe("string");
        expect(error).toHaveProperty("message");
        expect(typeof error.message).toBe("string");
        expect(error).toHaveProperty("methods");
        expect(Array.isArray(error.methods)).toBe(true);
        expect(error).toHaveProperty("condition");
        expect(typeof error.condition).toBe("string");
        expect(error).toHaveProperty("severity");
        expect(error.severity).toBe("error");
      }
    });

    test("should cover all 6 unique error codes", () => {
      const codes = new Set(manifest.errors.map((e: any) => e.code));
      expect(codes.has("AGENT_HANDLER_NOT_FUNCTION")).toBe(true);
      expect(codes.has("AGENT_PERMISSION_DENIED")).toBe(true);
      expect(codes.has("AGENT_ACTION_NOT_FOUND")).toBe(true);
      expect(codes.has("AGENT_COMMAND_INVALID_TYPE")).toBe(true);
      expect(codes.has("AGENT_SCHEMA_VIOLATION")).toBe(true);
      expect(codes.has("AGENT_HANDLER_ERROR")).toBe(true);
    });

    test("AGENT_HANDLER_ERROR should have behavior field with thrown semantics", () => {
      const handlerError = manifest.errors.find(
        (e: any) => e.code === "AGENT_HANDLER_ERROR"
      );
      expect(handlerError).toBeDefined();
      expect(handlerError.methods).toEqual(["execute", "dispatch"]);
      expect(handlerError).toHaveProperty("behavior");
      expect(handlerError.behavior.execute.thrown).toBe(true);
      expect(handlerError.behavior.dispatch.thrown).toBe(false);
    });

    test("dispatch should NOT list AGENT_HANDLER_ERROR in its errors", () => {
      const dispatch = manifest.methods.find((m: any) => m.name === "dispatch");
      expect(dispatch.errors).not.toContain("AGENT_HANDLER_ERROR");
      expect(dispatch.errors).toContain("AGENT_COMMAND_INVALID_TYPE");
      expect(dispatch.errors).toContain("AGENT_PERMISSION_DENIED");
    });

    test("AgentErrorContext.method type should be execute|dispatch only", () => {
      const methodType =
        manifest.types.AgentErrorContext.properties.method.type;
      expect(methodType).toBe('"execute" | "dispatch"');
    });

    test("permissions should have modes and decisionLogic", () => {
      expect(manifest.permissions).toHaveProperty("description");
      expect(manifest.permissions).toHaveProperty("modes");
      expect(manifest.permissions.modes).toHaveProperty("default");
      expect(manifest.permissions.modes).toHaveProperty("strict");
      expect(manifest.permissions).toHaveProperty("decisionLogic");
      expect(Array.isArray(manifest.permissions.decisionLogic)).toBe(true);
      expect(manifest.permissions.decisionLogic.length).toBeGreaterThanOrEqual(
        6
      );
    });
  });

  // ===========================================================================
  // Emitter Events
  // ===========================================================================

  describe("Emitter Events", () => {
    test("should emit agent:register after action registration", () => {
      app.use(AgentPlugin);
      const events: any[] = [];
      app.emitter.on("agent:register", (data: any) => events.push(data));

      app.agent.register("test", () => {});

      expect(events).toHaveLength(1);
      expect(events[0].name).toBe("test");
      expect(events[0].hasSchema).toBe(false);
      expect(typeof events[0].timestamp).toBe("number");
    });

    test("should emit agent:register with hasSchema true when schema provided", () => {
      app.use(AgentPlugin);
      const events: any[] = [];
      app.emitter.on("agent:register", (data: any) => events.push(data));

      app.agent.register("test", () => {}, { input: { x: "number" } });

      expect(events[0].hasSchema).toBe(true);
    });

    test("should emit agent:unregister after action removal", () => {
      app.use(AgentPlugin);
      const events: any[] = [];
      app.emitter.on("agent:unregister", (data: any) => events.push(data));

      app.agent.register("test", () => {});
      app.agent.unregister("test");

      expect(events).toHaveLength(1);
      expect(events[0].name).toBe("test");
      expect(typeof events[0].timestamp).toBe("number");
    });

    test("should emit agent:execute after successful execution", async () => {
      app.use(AgentPlugin);
      const events: any[] = [];
      app.emitter.on("agent:execute", (data: any) => events.push(data));

      app.agent.register("greet", (p: any) => `Hello, ${p.name}!`);
      await app.agent.execute("greet", { name: "World" });

      expect(events).toHaveLength(1);
      expect(events[0].name).toBe("greet");
      expect(events[0].result).toBe("Hello, World!");
      expect(typeof events[0].durationMs).toBe("number");
      expect(typeof events[0].timestamp).toBe("number");
    });

    test("should emit agent:execute:error after failed execution", async () => {
      app.use(AgentPlugin);
      const events: any[] = [];
      app.emitter.on("agent:execute:error", (data: any) => events.push(data));

      app.agent.register("fail", () => {
        throw new Error("boom");
      });
      try {
        await app.agent.execute("fail");
      } catch (e) {}

      expect(events).toHaveLength(1);
      expect(events[0].name).toBe("fail");
      expect(events[0].error).toBe("boom");
      expect(typeof events[0].durationMs).toBe("number");
    });

    test("should emit agent:dispatch after command dispatch", async () => {
      app.use(AgentPlugin);
      const events: any[] = [];
      app.emitter.on("agent:dispatch", (data: any) => events.push(data));

      await app.agent.dispatch({
        type: "TEST_CMD",
        target: "test-target",
        payload: "data",
      });

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe("TEST_CMD");
      expect(events[0].target).toBe("test-target");
      expect(events[0].payload).toBe("data");
      expect(events[0].errors).toBeUndefined();
      expect(typeof events[0].durationMs).toBe("number");
      expect(typeof events[0].timestamp).toBe("number");
    });

    test("agent:dispatch payload shape matches manifest", async () => {
      app.use(AgentPlugin);
      const events: any[] = [];
      app.emitter.on("agent:dispatch", (data: any) => events.push(data));

      // Dispatch with a failing handler to get errors in payload
      app.agent.onCommand("SHAPE_TEST", () => {
        throw new Error("handler-fail");
      });
      await app.agent.dispatch({
        type: "SHAPE_TEST",
        target: "widget",
        payload: { x: 1 },
      });

      expect(events).toHaveLength(1);
      const payload = events[0];
      // All documented fields must be present
      expect(payload).toHaveProperty("type");
      expect(payload).toHaveProperty("target");
      expect(payload).toHaveProperty("payload");
      expect(payload).toHaveProperty("durationMs");
      expect(payload).toHaveProperty("timestamp");
      // errors present because handler threw
      expect(payload).toHaveProperty("errors");
      expect(Array.isArray(payload.errors)).toBe(true);
      expect(payload.errors[0]).toBe("handler-fail");
    });

    test("should self-audit agent events when agent: prefix is configured", () => {
      app.use(AgentPlugin, { emitterEvents: ["agent:"] });
      app.agent.register("test", () => {});

      const log = app.agent.getLog({ type: "event" });
      expect(log.length).toBeGreaterThanOrEqual(1);
      expect(log[0].action).toBe("agent:register");
    });
  });

  // ===========================================================================
  // Reactive Signals
  // ===========================================================================

  describe("Reactive Signals", () => {
    test("should expose actionCount signal on ctx.agent", async () => {
      app.use(AgentPlugin);
      let agentApi: any = null;

      app.component("SignalTest", {
        setup(ctx: any) {
          agentApi = ctx.agent;
          return {};
        },
        template: () => "<div>Test</div>",
      });

      await app.mount(container, "SignalTest");
      await flushPromises();

      expect(agentApi.actionCount).toBeDefined();
      expect(agentApi.actionCount.value).toBe(0);
    });

    test("should expose lastActivity signal on ctx.agent", async () => {
      app.use(AgentPlugin);
      let agentApi: any = null;

      app.component("SignalTest2", {
        setup(ctx: any) {
          agentApi = ctx.agent;
          return {};
        },
        template: () => "<div>Test</div>",
      });

      await app.mount(container, "SignalTest2");
      await flushPromises();

      expect(agentApi.lastActivity).toBeDefined();
      expect(agentApi.lastActivity.value).toBeNull();
    });

    test("should update actionCount on register/unregister", () => {
      app.use(AgentPlugin);
      expect(app.agent._actionCountSignal.value).toBe(0);

      app.agent.register("a", () => {});
      expect(app.agent._actionCountSignal.value).toBe(1);

      app.agent.register("b", () => {});
      expect(app.agent._actionCountSignal.value).toBe(2);

      app.agent.unregister("a");
      expect(app.agent._actionCountSignal.value).toBe(1);
    });

    test("should update lastActivity on action execution", async () => {
      app.use(AgentPlugin);
      expect(app.agent._lastActivitySignal.value).toBeNull();

      app.agent.register("test", () => "ok");
      await app.agent.execute("test", { x: 1 });

      const last = app.agent._lastActivitySignal.value;
      expect(last).not.toBeNull();
      expect(last.type).toBe("action");
      expect(last.action).toBe("test");
    });

    test("should update lastActivity on command dispatch", async () => {
      app.use(AgentPlugin);
      await app.agent.dispatch({ type: "CMD" });

      const last = app.agent._lastActivitySignal.value;
      expect(last).not.toBeNull();
      expect(last.type).toBe("command");
      expect(last.action).toBe("CMD");
    });

    test("actionCount should reflect pre-registered actions", () => {
      app.use(AgentPlugin, { actions: { a: () => {}, b: () => {} } });
      expect(app.agent._actionCountSignal.value).toBe(2);
    });

    test("should allow watching signals for reactivity", () => {
      app.use(AgentPlugin);
      const counts: number[] = [];
      app.agent._actionCountSignal.watch((v: number) => counts.push(v));

      app.agent.register("x", () => {});
      app.agent.register("y", () => {});

      expect(counts).toEqual([1, 2]);
    });

    test("should reset signals on destroy", () => {
      app.use(AgentPlugin, { actions: { a: () => {} } });
      expect(app.agent._actionCountSignal.value).toBe(1);

      app.agent.destroy();
      expect(app.agent._actionCountSignal.value).toBe(0);
      expect(app.agent._lastActivitySignal.value).toBeNull();
    });
  });

  // ===========================================================================
  // Auto-cleanup on Unmount
  // ===========================================================================

  describe("Auto-cleanup on Unmount", () => {
    test("should auto-unregister actions on component unmount", async () => {
      app.use(AgentPlugin);

      app.component("AutoCleanup", {
        setup(ctx: any) {
          ctx.agent.register("compAction", () => "result");
          return {};
        },
        template: () => "<div>Test</div>",
      });

      const instance = await app.mount(container, "AutoCleanup");
      await flushPromises();
      expect(app.agent.hasAction("compAction")).toBe(true);

      await instance.unmount();
      expect(app.agent.hasAction("compAction")).toBe(false);
    });

    test("should auto-unsubscribe command handlers on unmount", async () => {
      app.use(AgentPlugin);
      let callCount = 0;

      app.component("CmdCleanup", {
        setup(ctx: any) {
          ctx.agent.onCommand("MY_CMD", () => {
            callCount++;
          });
          return {};
        },
        template: () => "<div>Test</div>",
      });

      const instance = await app.mount(container, "CmdCleanup");
      await flushPromises();

      await app.agent.dispatch({ type: "MY_CMD" });
      expect(callCount).toBe(1);

      await instance.unmount();

      await app.agent.dispatch({ type: "MY_CMD" });
      expect(callCount).toBe(1); // not incremented
    });

    test("should preserve component onUnmount callback", async () => {
      app.use(AgentPlugin);
      let unmountCalled = false;

      app.component("WithUnmount", {
        setup(ctx: any) {
          ctx.agent.register("tempAction", () => "temp");
          return {
            onUnmount: () => {
              unmountCalled = true;
            },
          };
        },
        template: () => "<div>Test</div>",
      });

      const instance = await app.mount(container, "WithUnmount");
      await flushPromises();

      await instance.unmount();
      expect(unmountCalled).toBe(true);
      expect(app.agent.hasAction("tempAction")).toBe(false);
    });

    test("should not warn when action already manually unregistered", async () => {
      app.use(AgentPlugin);

      app.component("ManualCleanup", {
        setup(ctx: any) {
          ctx.agent.register("manual", () => {});
          ctx.agent.unregister("manual"); // manually removed before unmount
          return {};
        },
        template: () => "<div>Test</div>",
      });

      const warnSpy = spyOn(console, "warn").mockImplementation(() => {});
      const instance = await app.mount(container, "ManualCleanup");
      await flushPromises();

      // Reset spy after mount phase
      warnSpy.mockClear();

      await instance.unmount();
      // Cleanup should check hasAction, so no warn about "manual"
      const warnCalls = warnSpy.mock.calls.filter(
        (call: any) =>
          typeof call[0] === "string" && call[0].includes('"manual"')
      );
      expect(warnCalls).toHaveLength(0);
      warnSpy.mockRestore();
    });

    test("should handle multiple components with independent cleanup", async () => {
      app.use(AgentPlugin);

      app.component("CompA", {
        setup(ctx: any) {
          ctx.agent.register("actionA", () => "A");
          return {};
        },
        template: () => "<div>A</div>",
      });

      app.component("CompB", {
        setup(ctx: any) {
          ctx.agent.register("actionB", () => "B");
          return {};
        },
        template: () => "<div>B</div>",
      });

      const containerA = createFixture("agent-test-compA");
      const containerB = createFixture("agent-test-compB");

      const instanceA = await app.mount(containerA, "CompA");
      const instanceB = await app.mount(containerB, "CompB");
      await flushPromises();

      expect(app.agent.hasAction("actionA")).toBe(true);
      expect(app.agent.hasAction("actionB")).toBe(true);

      await instanceA.unmount();
      expect(app.agent.hasAction("actionA")).toBe(false);
      expect(app.agent.hasAction("actionB")).toBe(true); // B still alive

      await instanceB.unmount();
      expect(app.agent.hasAction("actionB")).toBe(false);
    });

    test("should auto-cleanup in child components", async () => {
      app.use(AgentPlugin);

      app.component("ParentCleanup", {
        setup: () => ({}),
        template: () => '<div><div class="child-cleanup"></div></div>',
        children: {
          ".child-cleanup": {
            setup(ctx: any) {
              ctx.agent.register("childAction", () => "child");
              return {};
            },
            template: () => "<span>Child</span>",
          },
        },
      });

      const instance = await app.mount(container, "ParentCleanup");
      await flushPromises();
      expect(app.agent.hasAction("childAction")).toBe(true);

      await instance.unmount();
      expect(app.agent.hasAction("childAction")).toBe(false);
    });
  });

  // ===========================================================================
  // Scoped Cleanup — Name Collision (Fix 1)
  // ===========================================================================

  describe("Scoped Cleanup — Name Collision", () => {
    test("unmounting first component should NOT remove shared action", async () => {
      app.use(AgentPlugin);

      app.component("CompA", {
        setup(ctx: any) {
          ctx.agent.register("shared", () => "a");
          return {};
        },
        template: () => "<div>A</div>",
      });
      app.component("CompB", {
        setup(ctx: any) {
          ctx.agent.register("shared", () => "b");
          return {};
        },
        template: () => "<div>B</div>",
      });

      const containerA = createFixture("collision-a");
      const containerB = createFixture("collision-b");
      const instanceA = await app.mount(containerA, "CompA");
      await flushPromises();
      const instanceB = await app.mount(containerB, "CompB");
      await flushPromises();

      expect(app.agent.hasAction("shared")).toBe(true);

      await instanceA.unmount();
      // Action should still exist because CompB still holds a ref
      expect(app.agent.hasAction("shared")).toBe(true);
    });

    test("unmounting last component should remove shared action", async () => {
      app.use(AgentPlugin);

      app.component("CompC", {
        setup(ctx: any) {
          ctx.agent.register("shared2", () => "c");
          return {};
        },
        template: () => "<div>C</div>",
      });
      app.component("CompD", {
        setup(ctx: any) {
          ctx.agent.register("shared2", () => "d");
          return {};
        },
        template: () => "<div>D</div>",
      });

      const containerC = createFixture("collision-c");
      const containerD = createFixture("collision-d");
      const instanceC = await app.mount(containerC, "CompC");
      await flushPromises();
      const instanceD = await app.mount(containerD, "CompD");
      await flushPromises();

      await instanceC.unmount();
      expect(app.agent.hasAction("shared2")).toBe(true);

      await instanceD.unmount();
      expect(app.agent.hasAction("shared2")).toBe(false);
    });

    test("manual unregister should not break ref counting for other components", async () => {
      app.use(AgentPlugin);

      app.component("CompE", {
        setup(ctx: any) {
          ctx.agent.register("counted", () => "e");
          return {};
        },
        template: () => "<div>E</div>",
      });
      app.component("CompF", {
        setup(ctx: any) {
          ctx.agent.register("counted", () => "f");
          // Manually unregister within the same component
          ctx.agent.unregister("counted");
          // Re-register to simulate a replace
          ctx.agent.register("counted", () => "f2");
          return {};
        },
        template: () => "<div>F</div>",
      });

      const containerE = createFixture("collision-e");
      const containerF = createFixture("collision-f");
      const instanceE = await app.mount(containerE, "CompE");
      await flushPromises();
      const instanceF = await app.mount(containerF, "CompF");
      await flushPromises();

      await instanceE.unmount();
      // CompF still has the action registered
      expect(app.agent.hasAction("counted")).toBe(true);
    });

    test("re-registering same name in one component should count as one ref", async () => {
      app.use(AgentPlugin);

      app.component("CompG", {
        setup(ctx: any) {
          ctx.agent.register("reused", () => "v1");
          ctx.agent.register("reused", () => "v2"); // overwrite
          return {};
        },
        template: () => "<div>G</div>",
      });

      const containerG = createFixture("collision-g");
      const instanceG = await app.mount(containerG, "CompG");
      await flushPromises();
      expect(app.agent.hasAction("reused")).toBe(true);

      await instanceG.unmount();
      expect(app.agent.hasAction("reused")).toBe(false);
    });

    test("manual unregister by one component should NOT remove action still owned by another", async () => {
      app.use(AgentPlugin);

      let agentCtxA: any;
      app.component("OverlapA", {
        setup(ctx: any) {
          ctx.agent.register("overlap", () => "a");
          agentCtxA = ctx.agent;
          return {};
        },
        template: () => "<div>A</div>",
      });
      app.component("OverlapB", {
        setup(ctx: any) {
          ctx.agent.register("overlap", () => "b");
          return {};
        },
        template: () => "<div>B</div>",
      });

      const cA = createFixture("collision-oa");
      const cB = createFixture("collision-ob");
      await app.mount(cA, "OverlapA");
      await flushPromises();
      await app.mount(cB, "OverlapB");
      await flushPromises();

      expect(app.agent.hasAction("overlap")).toBe(true);

      // A manually unregisters while B is still mounted
      agentCtxA.unregister("overlap");

      // Action should still exist because B still owns a ref
      expect(app.agent.hasAction("overlap")).toBe(true);
    });

    test("unmounting scoped component should restore pre-existing global action", async () => {
      app.use(AgentPlugin);

      // Register a global action directly
      app.agent.register("global-action", () => "global-result");
      expect(app.agent.hasAction("global-action")).toBe(true);
      expect(await app.agent.execute("global-action")).toBe("global-result");

      // A scoped component overwrites the same action name
      app.component("ScopedOverwrite", {
        setup(ctx: any) {
          ctx.agent.register("global-action", () => "scoped-result");
          return {};
        },
        template: () => "<div>Scoped</div>",
      });

      const container = createFixture("collision-global");
      const instance = await app.mount(container, "ScopedOverwrite");
      await flushPromises();

      // While mounted, scoped handler wins
      expect(app.agent.hasAction("global-action")).toBe(true);
      expect(await app.agent.execute("global-action")).toBe("scoped-result");

      // After unmount, original global handler should be restored
      await instance.unmount();
      expect(app.agent.hasAction("global-action")).toBe(true);
      expect(await app.agent.execute("global-action")).toBe("global-result");
    });

    test("manual scoped unregister should restore pre-existing global action", async () => {
      app.use(AgentPlugin);

      app.agent.register("manual-global", () => "original");

      let agentCtx: any;
      app.component("ManualUnreg", {
        setup(ctx: any) {
          ctx.agent.register("manual-global", () => "overwritten");
          agentCtx = ctx.agent;
          return {};
        },
        template: () => "<div>M</div>",
      });

      const container = createFixture("collision-mg");
      await app.mount(container, "ManualUnreg");
      await flushPromises();

      expect(await app.agent.execute("manual-global")).toBe("overwritten");

      // Manual unregister from scoped API should restore global
      agentCtx.unregister("manual-global");
      expect(app.agent.hasAction("manual-global")).toBe(true);
      expect(await app.agent.execute("manual-global")).toBe("original");
    });

    test("global re-register during scoped ownership should not be clobbered on unmount", async () => {
      app.use(AgentPlugin);

      // Step 1: register global v1
      app.agent.register("evolving", () => "global-v1");

      // Step 2: scoped component overwrites with its own handler
      app.component("ScopedDuringGlobal", {
        setup(ctx: any) {
          ctx.agent.register("evolving", () => "scoped");
          return {};
        },
        template: () => "<div>S</div>",
      });

      const container = createFixture("collision-evolve");
      const instance = await app.mount(container, "ScopedDuringGlobal");
      await flushPromises();
      expect(await app.agent.execute("evolving")).toBe("scoped");

      // Step 3: global re-registers while scoped ownership is active
      app.agent.register("evolving", () => "global-v2");

      // Step 4: unmount should restore global-v2, NOT stale global-v1
      await instance.unmount();
      expect(app.agent.hasAction("evolving")).toBe(true);
      expect(await app.agent.execute("evolving")).toBe("global-v2");
    });

    test("scoped unregister cannot remove action owned by another component", async () => {
      app.use(AgentPlugin);

      let ctxA: any;
      let ctxB: any;
      app.component("CompA", {
        setup(ctx: any) {
          ctx.agent.register("shared-name", () => "from-A");
          ctxA = ctx.agent;
          return {};
        },
        template: () => "<div>A</div>",
      });
      app.component("CompB", {
        setup(ctx: any) {
          ctxB = ctx.agent;
          return {};
        },
        template: () => "<div>B</div>",
      });

      const containerA = createFixture("cross-comp-a");
      const containerB = createFixture("cross-comp-b");
      await app.mount(containerA, "CompA");
      await app.mount(containerB, "CompB");
      await flushPromises();

      // CompB tries to unregister CompA's action
      const warnSpy = spyOn(console, "warn").mockImplementation(() => {});
      ctxB.unregister("shared-name");
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("not owned by this component")
      );
      warnSpy.mockRestore();

      // Action must still be intact — CompA's handler untouched
      expect(app.agent.hasAction("shared-name")).toBe(true);
      expect(await app.agent.execute("shared-name")).toBe("from-A");
    });
  });

  // ===========================================================================
  // Non-Error Throw Normalization
  // ===========================================================================

  describe("Non-Error Throw Normalization", () => {
    test("execute() normalizes a thrown string to Error", async () => {
      app.use(AgentPlugin);
      app.agent.register("throws-string", () => {
        throw "something went wrong";
      });

      const events: any[] = [];
      app.emitter.on("agent:execute:error", (d: any) => events.push(d));

      await expect(app.agent.execute("throws-string")).rejects.toThrow(
        "something went wrong"
      );
      expect(events).toHaveLength(1);
      expect(events[0].error).toBe("something went wrong");

      const log = app.agent.getLog({ action: "throws-string" });
      expect(log[0].error).toBe("something went wrong");
    });

    test("execute() normalizes a thrown object to Error", async () => {
      app.use(AgentPlugin);
      app.agent.register("throws-object", () => {
        throw { detail: "bad" };
      });

      const events: any[] = [];
      app.emitter.on("agent:execute:error", (d: any) => events.push(d));

      await expect(app.agent.execute("throws-object")).rejects.toThrow();
      expect(events[0].error).toBe("[object Object]");
    });

    test("execute() normalizes a thrown undefined to Error", async () => {
      app.use(AgentPlugin);
      app.agent.register("throws-undef", () => {
        throw undefined;
      });

      await expect(app.agent.execute("throws-undef")).rejects.toThrow(
        "undefined"
      );
      const log = app.agent.getLog({ action: "throws-undef" });
      expect(log[0].error).toBe("undefined");
    });

    test("dispatch() normalizes a thrown string in handler", async () => {
      app.use(AgentPlugin);
      app.agent.onCommand("BAD_CMD", () => {
        throw "dispatch failure";
      });

      const events: any[] = [];
      app.emitter.on("agent:dispatch", (d: any) => events.push(d));

      await app.agent.dispatch({ type: "BAD_CMD" });
      expect(events).toHaveLength(1);
      expect(events[0].errors).toEqual(["dispatch failure"]);
    });

    test("dispatch() normalizes a thrown number in handler", async () => {
      app.use(AgentPlugin);
      app.agent.onCommand("NUM_CMD", () => {
        throw 42;
      });

      const errors: any[] = [];
      const onError = (err: any) => errors.push(err);
      app.use(AgentPlugin, { onError });

      await app.agent.dispatch({ type: "NUM_CMD" });
      const log = app.agent.getLog({ type: "command" });
      expect(log.some((e: any) => e.error && e.error.includes("42"))).toBe(
        true
      );
    });
  });

  // ===========================================================================
  // Emitter Event Failure Isolation (Fix 2)
  // ===========================================================================

  describe("Emitter Event Failure Isolation", () => {
    test("throwing listener on agent:register should not break register()", () => {
      app.use(AgentPlugin);
      app.emitter.on("agent:register", () => {
        throw new Error("bad listener");
      });

      // register should complete normally
      app.agent.register("safe", () => "ok");
      expect(app.agent.hasAction("safe")).toBe(true);
    });

    test("throwing listener on agent:execute should not break execute()", async () => {
      app.use(AgentPlugin);
      app.agent.register("calc", () => 42);
      app.emitter.on("agent:execute", () => {
        throw new Error("bad listener");
      });

      const result = await app.agent.execute("calc");
      expect(result).toBe(42);
    });

    test("throwing listener on agent:dispatch should not break dispatch()", async () => {
      app.use(AgentPlugin);
      let handled = false;
      app.agent.onCommand("TEST", () => {
        handled = true;
      });
      app.emitter.on("agent:dispatch", () => {
        throw new Error("bad listener");
      });

      await app.agent.dispatch({ type: "TEST" });
      expect(handled).toBe(true);
    });
  });

  // ===========================================================================
  // Auto-Cleanup After onUnmount Throws (Fix 3)
  // ===========================================================================

  describe("Auto-Cleanup After onUnmount Throws", () => {
    test("should still cleanup actions when onUnmount throws", async () => {
      app.use(AgentPlugin);

      app.component("ThrowingUnmount", {
        setup(ctx: any) {
          ctx.agent.register("leaky", () => "val");
          return {
            onUnmount: () => {
              throw new Error("unmount error");
            },
          };
        },
        template: () => "<div>Test</div>",
      });

      const instance = await app.mount(container, "ThrowingUnmount");
      await flushPromises();
      expect(app.agent.hasAction("leaky")).toBe(true);

      // unmount may throw, but cleanup should still run
      try {
        await instance.unmount();
      } catch (_) {
        // expected
      }

      expect(app.agent.hasAction("leaky")).toBe(false);
    });

    test("should still cleanup command handlers when onUnmount throws", async () => {
      app.use(AgentPlugin);
      let callCount = 0;

      app.component("ThrowingUnmount2", {
        setup(ctx: any) {
          ctx.agent.onCommand("LEAK_CMD", () => {
            callCount++;
          });
          return {
            onUnmount: () => {
              throw new Error("unmount error");
            },
          };
        },
        template: () => "<div>Test</div>",
      });

      const instance = await app.mount(container, "ThrowingUnmount2");
      await flushPromises();
      await app.agent.dispatch({ type: "LEAK_CMD" });
      expect(callCount).toBe(1);

      try {
        await instance.unmount();
      } catch (_) {
        // expected
      }

      await app.agent.dispatch({ type: "LEAK_CMD" });
      expect(callCount).toBe(1); // handler was cleaned up
    });
  });

  // ===========================================================================
  // onError Callback Failure Isolation (Fix 4)
  // ===========================================================================

  describe("onError Callback Failure Isolation", () => {
    test("throwing onError should not prevent AGENT_PERMISSION_DENIED", async () => {
      app.use(AgentPlugin, {
        permissions: { admin: { actions: ["secret"], commands: [] } },
        strictPermissions: true,
        onError: () => {
          throw new Error("onError blew up");
        },
      });
      app.agent.register("secret", () => "x");

      let caughtCode: string | undefined;
      try {
        await app.agent.execute("secret", null, "nobody");
      } catch (e: any) {
        caughtCode = e.code;
      }
      expect(caughtCode).toBe("AGENT_PERMISSION_DENIED");
    });

    test("throwing onError should not prevent AGENT_HANDLER_ERROR", async () => {
      app.use(AgentPlugin, {
        onError: () => {
          throw new Error("onError blew up");
        },
      });
      app.agent.register("fail", () => {
        throw new Error("handler boom");
      });

      let caughtCode: string | undefined;
      try {
        await app.agent.execute("fail");
      } catch (e: any) {
        caughtCode = e.code;
      }
      expect(caughtCode).toBe("AGENT_HANDLER_ERROR");
    });

    test("throwing onError during dispatch handler error should not break dispatch", async () => {
      app.use(AgentPlugin, {
        onError: () => {
          throw new Error("onError blew up");
        },
      });
      app.agent.onCommand("CRASH", () => {
        throw new Error("handler crash");
      });

      // dispatch should still resolve (not reject)
      await app.agent.dispatch({ type: "CRASH" });
      // If we get here, dispatch completed successfully
      expect(true).toBe(true);
    });
  });

  // ===========================================================================
  // Structured Error Codes — Fail Guards (audit fix P2-T5)
  // ===========================================================================

  describe("Structured Error Codes — with fail guards", () => {
    test("register() with non-function throws AGENT_HANDLER_NOT_FUNCTION", () => {
      app.use(AgentPlugin);
      expect(() => {
        app.agent.register("bad", "not a function");
      }).toThrow();
      try {
        app.agent.register("bad2", 123);
      } catch (error: any) {
        expect(error.code).toBe("AGENT_HANDLER_NOT_FUNCTION");
        return;
      }
      expect(true).toBe(false); // fail guard — must not reach here
    });

    test("execute() with wrong scope throws AGENT_PERMISSION_DENIED", async () => {
      app.use(AgentPlugin, {
        actions: { read: () => "ok" },
        permissions: { admin: { actions: ["read"] } },
      });
      try {
        await app.agent.execute("read", null, "viewer");
      } catch (error: any) {
        expect(error.code).toBe("AGENT_PERMISSION_DENIED");
        return;
      }
      expect(true).toBe(false); // fail guard
    });

    test("execute() with missing action throws AGENT_ACTION_NOT_FOUND", async () => {
      app.use(AgentPlugin);
      try {
        await app.agent.execute("nonexistent");
      } catch (error: any) {
        expect(error.code).toBe("AGENT_ACTION_NOT_FOUND");
        return;
      }
      expect(true).toBe(false); // fail guard
    });

    test("dispatch() with no type throws AGENT_COMMAND_INVALID_TYPE", async () => {
      app.use(AgentPlugin);
      try {
        await app.agent.dispatch({});
      } catch (error: any) {
        expect(error.code).toBe("AGENT_COMMAND_INVALID_TYPE");
        return;
      }
      expect(true).toBe(false); // fail guard
    });

    test("dispatch() with wrong scope throws AGENT_PERMISSION_DENIED", async () => {
      app.use(AgentPlugin, {
        permissions: { admin: { commands: ["SHUTDOWN"] } },
      });
      try {
        await app.agent.dispatch({ type: "SHUTDOWN" }, "viewer");
      } catch (error: any) {
        expect(error.code).toBe("AGENT_PERMISSION_DENIED");
        return;
      }
      expect(true).toBe(false); // fail guard
    });

    test("onCommand() with non-function throws AGENT_HANDLER_NOT_FUNCTION", () => {
      app.use(AgentPlugin);
      try {
        app.agent.onCommand("TEST", "not a function");
      } catch (error: any) {
        expect(error.code).toBe("AGENT_HANDLER_NOT_FUNCTION");
        return;
      }
      expect(true).toBe(false); // fail guard
    });

    test("execute() handler throw gets AGENT_HANDLER_ERROR", async () => {
      app.use(AgentPlugin, {
        actions: {
          fail: () => {
            throw new Error("handler boom");
          },
        },
      });
      try {
        await app.agent.execute("fail");
      } catch (error: any) {
        expect(error.code).toBe("AGENT_HANDLER_ERROR");
        return;
      }
      expect(true).toBe(false); // fail guard
    });
  });

  // ===========================================================================
  // Destroyed Agent Behavior (audit fix P1-3)
  // ===========================================================================

  describe("Destroyed Agent Behavior", () => {
    test("register() on destroyed agent throws AGENT_DESTROYED", () => {
      app.use(AgentPlugin);
      app.agent.destroy();

      try {
        app.agent.register("newAction", () => "works");
      } catch (error: any) {
        expect(error.code).toBe("AGENT_DESTROYED");
        expect(error.message).toContain("Agent has been destroyed");
        return;
      }
      expect(true).toBe(false); // fail guard
    });

    test("unregister() on destroyed agent throws AGENT_DESTROYED", () => {
      app.use(AgentPlugin, { actions: { greet: () => "hi" } });
      app.agent.destroy();

      try {
        app.agent.unregister("greet");
      } catch (error: any) {
        expect(error.code).toBe("AGENT_DESTROYED");
        return;
      }
      expect(true).toBe(false); // fail guard
    });

    test("execute() on destroyed agent throws AGENT_DESTROYED", async () => {
      app.use(AgentPlugin, { actions: { greet: () => "hi" } });
      expect(app.agent.hasAction("greet")).toBe(true);

      app.agent.destroy();

      try {
        await app.agent.execute("greet");
      } catch (error: any) {
        expect(error.code).toBe("AGENT_DESTROYED");
        return;
      }
      expect(true).toBe(false); // fail guard
    });

    test("dispatch() on destroyed agent throws AGENT_DESTROYED", async () => {
      app.use(AgentPlugin);
      app.agent.onCommand("TEST", () => {});
      app.agent.destroy();

      try {
        await app.agent.dispatch({ type: "TEST" });
      } catch (error: any) {
        expect(error.code).toBe("AGENT_DESTROYED");
        return;
      }
      expect(true).toBe(false); // fail guard
    });

    test("onCommand() on destroyed agent throws AGENT_DESTROYED", () => {
      app.use(AgentPlugin);
      app.agent.destroy();

      try {
        app.agent.onCommand("TEST", () => {});
      } catch (error: any) {
        expect(error.code).toBe("AGENT_DESTROYED");
        return;
      }
      expect(true).toBe(false); // fail guard
    });

    test("clearLog() on destroyed agent throws AGENT_DESTROYED", () => {
      app.use(AgentPlugin);
      app.agent.destroy();

      try {
        app.agent.clearLog();
      } catch (error: any) {
        expect(error.code).toBe("AGENT_DESTROYED");
        return;
      }
      expect(true).toBe(false); // fail guard
    });

    test("executeBatch([]) on destroyed agent throws AGENT_DESTROYED", async () => {
      app.use(AgentPlugin);
      app.agent.destroy();

      try {
        await app.agent.executeBatch([]);
      } catch (error: any) {
        expect(error.code).toBe("AGENT_DESTROYED");
        return;
      }
      expect(true).toBe(false); // fail guard
    });

    test("executeSequence([]) on destroyed agent throws AGENT_DESTROYED", async () => {
      app.use(AgentPlugin);
      app.agent.destroy();

      try {
        await app.agent.executeSequence([]);
      } catch (error: any) {
        expect(error.code).toBe("AGENT_DESTROYED");
        return;
      }
      expect(true).toBe(false); // fail guard
    });

    test("read-only methods return safe defaults after destroy", () => {
      app.use(AgentPlugin, { actions: { x: () => 1 } });
      // Register a component so inspect/snapshot would have data to leak
      app.component("LeakTest", {
        setup() {
          return {};
        },
        template: () => "<div>leak</div>",
      });
      app.agent.destroy();

      // hasAction returns false (maps cleared)
      expect(app.agent.hasAction("x")).toBe(false);
      // describeAction returns null
      expect(app.agent.describeAction("x")).toBeNull();
      // listActions returns empty
      expect(app.agent.listActions()).toEqual([]);
      // getLog returns empty
      expect(app.agent.getLog()).toEqual([]);
      // describe returns empty manifest
      const manifest = app.agent.describe();
      expect(manifest.actions).toEqual([]);
      expect(manifest.commands).toEqual([]);
      // inspect returns empty (does not leak live eleva._components)
      const inspectResult = app.agent.inspect();
      expect(inspectResult.components).toEqual([]);
      // snapshot returns empty (does not leak live eleva state)
      const snap = app.agent.snapshot();
      expect(snap.components).toEqual([]);
      expect(snap.plugins).toEqual([]);
    });

    test("signals are reset after destroy", () => {
      app.use(AgentPlugin, { actions: { x: () => 1 } });
      expect(app.agent._actionCountSignal.value).toBe(1);
      app.agent.destroy();
      expect(app.agent._actionCountSignal.value).toBe(0);
      expect(app.agent._lastActivitySignal.value).toBeNull();
    });
  });

  // ===========================================================================
  // describe() with strictPermissions (audit fix P1-4)
  // ===========================================================================

  describe("describe() with strict permissions", () => {
    test("strict mode + no scope shows all actions as allowed: false", () => {
      app.use(AgentPlugin, {
        strictPermissions: true,
        permissions: { admin: { actions: ["greet"] } },
      });
      app.agent.register("greet", () => "hi");
      app.agent.register("other", () => "bye");

      const manifest = app.agent.describe(); // no scope
      expect(manifest.actions).toHaveLength(2);
      for (const action of manifest.actions) {
        expect(action.allowed).toBe(false);
      }
      expect(manifest.permissions).toBeNull();
    });

    test("strict mode + valid scope shows correct allowed flags", () => {
      app.use(AgentPlugin, {
        strictPermissions: true,
        permissions: { admin: { actions: ["greet"] } },
      });
      app.agent.register("greet", () => "hi");
      app.agent.register("other", () => "bye");

      const manifest = app.agent.describe("admin");
      const greet = manifest.actions.find((a: any) => a.name === "greet");
      const other = manifest.actions.find((a: any) => a.name === "other");
      expect(greet!.allowed).toBe(true);
      expect(other!.allowed).toBe(false);
    });

    test("strict mode + unknown scope shows all actions as allowed: false", () => {
      app.use(AgentPlugin, {
        strictPermissions: true,
        permissions: { admin: { actions: ["greet"] } },
      });
      app.agent.register("greet", () => "hi");

      const manifest = app.agent.describe("unknown");
      expect(manifest.actions[0].allowed).toBe(false);
    });
  });

  // ===========================================================================
  // Schema Validation Edge Cases (audit fix P2-T1)
  // ===========================================================================

  describe("Schema Validation Edge Cases", () => {
    test("undefined payload triggers schema violation", async () => {
      app.use(AgentPlugin, { validateSchemas: true });
      app.agent.register("act", (p: any) => p, {
        input: { name: "string" },
      });
      try {
        await app.agent.execute("act"); // payload is undefined
      } catch (error: any) {
        expect(error.code).toBe("AGENT_SCHEMA_VIOLATION");
        return;
      }
      expect(true).toBe(false); // fail guard
    });

    test("number payload triggers schema violation", async () => {
      app.use(AgentPlugin, { validateSchemas: true });
      app.agent.register("act", (p: any) => p, {
        input: { name: "string" },
      });
      try {
        await app.agent.execute("act", 42);
      } catch (error: any) {
        expect(error.code).toBe("AGENT_SCHEMA_VIOLATION");
        expect(error.violations).toBeDefined();
        return;
      }
      expect(true).toBe(false); // fail guard
    });

    test("string payload triggers schema violation", async () => {
      app.use(AgentPlugin, { validateSchemas: true });
      app.agent.register("act", (p: any) => p, {
        input: { name: "string" },
      });
      try {
        await app.agent.execute("act", "hello");
      } catch (error: any) {
        expect(error.code).toBe("AGENT_SCHEMA_VIOLATION");
        return;
      }
      expect(true).toBe(false); // fail guard
    });

    test("extra fields in payload do NOT cause violations", async () => {
      app.use(AgentPlugin, { validateSchemas: true });
      app.agent.register("act", (p: any) => p, {
        input: { name: "string" },
      });
      const result = await app.agent.execute("act", {
        name: "ok",
        extra: 123,
      });
      expect(result).toEqual({ name: "ok", extra: 123 });
    });
  });

  // ===========================================================================
  // AGENT_COMMAND_INVALID_TYPE does not call onError (audit fix P2-T2)
  // ===========================================================================

  describe("AGENT_COMMAND_INVALID_TYPE onError asymmetry", () => {
    test("dispatch({}) throws without calling onError", async () => {
      const errors: any[] = [];
      app.use(AgentPlugin, {
        onError: (err: any) => errors.push(err),
      });
      try {
        await app.agent.dispatch({});
      } catch (error: any) {
        expect(error.code).toBe("AGENT_COMMAND_INVALID_TYPE");
        expect(errors).toHaveLength(0); // onError NOT called
        return;
      }
      expect(true).toBe(false); // fail guard
    });

    test("dispatch(null) throws AGENT_COMMAND_INVALID_TYPE", async () => {
      app.use(AgentPlugin);
      try {
        await app.agent.dispatch(null);
      } catch (error: any) {
        expect(error.code).toBe("AGENT_COMMAND_INVALID_TYPE");
        return;
      }
      expect(true).toBe(false); // fail guard
    });

    test("dispatch(undefined) throws AGENT_COMMAND_INVALID_TYPE", async () => {
      app.use(AgentPlugin);
      try {
        await app.agent.dispatch(undefined);
      } catch (error: any) {
        expect(error.code).toBe("AGENT_COMMAND_INVALID_TYPE");
        return;
      }
      expect(true).toBe(false); // fail guard
    });
  });

  // ===========================================================================
  // Combined Log Filter (audit fix P2-T3)
  // ===========================================================================

  describe("Combined Log Filter", () => {
    test("getLog() with all filter fields combined", async () => {
      app.use(AgentPlugin, {
        actions: {
          a: () => "ok",
          b: () => {
            throw new Error("fail");
          },
        },
      });

      await app.agent.execute("a");
      const midTime = Date.now();
      await new Promise((r) => setTimeout(r, 20));
      try {
        await app.agent.execute("b");
      } catch (_) {}
      await app.agent.execute("a");

      // Combined filter: type=action, since=midTime (after first exec),
      // action="a", status="ok"
      const afterMid = Date.now() - 10; // safe midpoint
      const filtered = app.agent.getLog({
        type: "action",
        since: midTime,
        action: "a",
        status: "ok",
      });

      // Should only return the second "a" execution (after midTime, action "a", no error)
      expect(filtered.length).toBeGreaterThanOrEqual(1);
      for (const entry of filtered) {
        expect(entry.type).toBe("action");
        expect(entry.action).toBe("a");
        expect(entry.timestamp).toBeGreaterThanOrEqual(midTime);
        expect(entry.error).toBeUndefined();
      }
    });
  });

  // ===========================================================================
  // Double Uninstall (audit fix P2-T4)
  // ===========================================================================

  describe("Double Uninstall", () => {
    test("calling uninstall twice should not throw", () => {
      app.use(AgentPlugin);
      expect(app.agent).toBeDefined();

      AgentPlugin.uninstall(app);
      expect(app.agent).toBeUndefined();

      // Second uninstall should be safe (no-op)
      expect(() => AgentPlugin.uninstall(app)).not.toThrow();
      expect(app.agent).toBeUndefined();
    });

    test("mount works after double uninstall", async () => {
      app.use(AgentPlugin);
      AgentPlugin.uninstall(app);
      AgentPlugin.uninstall(app);

      // Mount should still work using original method
      app.component("PostUninstall", {
        setup() {
          return {};
        },
        template: () => "<div>works</div>",
      });
      const instance = await app.mount(container, "PostUninstall");
      expect(instance).toBeDefined();
    });
  });

  // ===========================================================================
  // Additional Edge Cases (audit fix P3)
  // ===========================================================================

  describe("Additional Edge Cases", () => {
    test("scoped unregister for a non-owned action warns and is a no-op", async () => {
      app.use(AgentPlugin);
      app.agent.register("globalOnly", () => "g");

      let agentCtx: any;
      app.component("ScopedNoOwn", {
        setup(ctx: any) {
          agentCtx = ctx.agent;
          return {};
        },
        template: () => "<div>S</div>",
      });

      const container = createFixture("scoped-no-own");
      await app.mount(container, "ScopedNoOwn");
      await flushPromises();

      // Scoped context tries to unregister an action it does not own
      const warnSpy = spyOn(console, "warn").mockImplementation(() => {});
      agentCtx.unregister("globalOnly");
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("not owned by this component")
      );
      warnSpy.mockRestore();

      // Action must still exist globally — isolation preserved
      expect(app.agent.hasAction("globalOnly")).toBe(true);
      expect(await app.agent.execute("globalOnly")).toBe("g");
    });

    test("diff() with snapshots missing components property", () => {
      app.use(AgentPlugin);
      const a = { timestamp: 1, plugins: [] } as any;
      const b = { timestamp: 2, plugins: [] } as any;
      const result = app.agent.diff(a, b);
      expect(result.added).toEqual([]);
      expect(result.removed).toEqual([]);
    });

    test("onCommand unsubscribe called twice is safe", () => {
      app.use(AgentPlugin);
      const unsub = app.agent.onCommand("TEST", () => {});
      unsub();
      expect(() => unsub()).not.toThrow();
    });

    test("dispatch with no handlers registered resolves gracefully", async () => {
      app.use(AgentPlugin);
      await app.agent.dispatch({ type: "NO_HANDLERS" });
      const log = app.agent.getLog({ type: "command", action: "NO_HANDLERS" });
      expect(log).toHaveLength(1);
      expect(log[0].error).toBeUndefined();
    });

    test("emitter hook captures multi-arg emit as array payload", () => {
      app.use(AgentPlugin, { emitterEvents: ["test:"] });
      app.emitter.emit("test:multi", "arg1", "arg2", "arg3");
      const log = app.agent.getLog({ type: "event", action: "test:multi" });
      expect(log).toHaveLength(1);
      expect(log[0].payload).toEqual(["arg1", "arg2", "arg3"]);
    });

    test("emitter hook captures single-arg emit as direct payload", () => {
      app.use(AgentPlugin, { emitterEvents: ["test:"] });
      app.emitter.emit("test:single", { data: 42 });
      const log = app.agent.getLog({ type: "event", action: "test:single" });
      expect(log).toHaveLength(1);
      expect(log[0].payload).toEqual({ data: 42 });
    });
  });
});
