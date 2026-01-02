/**
 * @fileoverview Tests for the Store Plugin
 * Tests the core functionality of reactive state management, actions, persistence, and cross-component updates
 */

import { describe, test, expect, beforeEach, afterEach, mock, spyOn } from "bun:test";
import { Eleva } from "../../../src/core/Eleva.js";
import { StorePlugin } from "../../../src/plugins/Store.js";
import { createFixture, cleanupFixtures, flushPromises, createComponentFixture } from "../../utils.js";

describe("StorePlugin", () => {
  let app: any;
  let container: HTMLElement;

  beforeEach(() => {
    app = new Eleva("testApp");
    container = createFixture("store-test");
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanupFixtures();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("Plugin Installation", () => {
    test("should install the plugin successfully", () => {
      expect(() => {
        app.use(StorePlugin);
      }).not.toThrow();
    });

    test("should expose store instance on eleva app", () => {
      app.use(StorePlugin);
      expect(app.store).toBeDefined();
      expect(typeof app.store.dispatch).toBe("function");
      expect(typeof app.store.getState).toBe("function");
      expect(typeof app.store.subscribe).toBe("function");
    });

    test("should expose global store methods", () => {
      app.use(StorePlugin);
      expect(typeof app.dispatch).toBe("function");
      expect(typeof app.getState).toBe("function");
      expect(typeof app.subscribe).toBe("function");
      expect(typeof app.createAction).toBe("function");
    });

    test("should uninstall the plugin successfully", () => {
      app.use(StorePlugin);
      expect(() => {
        StorePlugin.uninstall(app);
      }).not.toThrow();
      expect(app.store).toBeUndefined();
      expect(app.dispatch).toBeUndefined();
    });

    test("should install with initial state and actions", () => {
      const initialState = { counter: 0, user: { name: "John" } };
      const actions = {
        increment: (state: any) => state.counter.value++,
        setUser: (state: any, user: any) => (state.user.value = user),
      };

      app.use(StorePlugin, { state: initialState, actions });

      expect(app.store.state.counter.value).toBe(0);
      expect(app.store.state.user.value.name).toBe("John");
    });
  });

  describe("Core Store Functionality", () => {
    beforeEach(() => {
      app.use(StorePlugin, {
        state: {
          counter: 0,
          user: { name: "John", email: "john@example.com" },
          theme: "light",
        },
        actions: {
          increment: (state: any) => state.counter.value++,
          decrement: (state: any) => state.counter.value--,
          reset: (state: any) => (state.counter.value = 0),
          updateUser: (state: any, updates: any) => {
            state.user.value = { ...state.user.value, ...updates };
          },
          toggleTheme: (state: any) => {
            state.theme.value = state.theme.value === "light" ? "dark" : "light";
          },
        },
      });
    });

    test("should have reactive state signals", () => {
      expect(app.store.state.counter.value).toBe(0);
      expect(app.store.state.user.value.name).toBe("John");
      expect(app.store.state.theme.value).toBe("light");
    });

    test("should dispatch actions and update state", async () => {
      await app.store.dispatch("increment");
      expect(app.store.state.counter.value).toBe(1);

      await app.store.dispatch("increment");
      expect(app.store.state.counter.value).toBe(2);

      await app.store.dispatch("reset");
      expect(app.store.state.counter.value).toBe(0);
    });

    test("should dispatch actions with payload", async () => {
      const userUpdate = { name: "Jane", email: "jane@example.com" };
      await app.store.dispatch("updateUser", userUpdate);

      expect(app.store.state.user.value.name).toBe("Jane");
      expect(app.store.state.user.value.email).toBe("jane@example.com");
    });

    test("should throw error for non-existent actions", async () => {
      await expect(app.store.dispatch("nonExistentAction")).rejects.toThrow(
        'Action "nonExistentAction" not found'
      );
    });

    test("should get current state values", () => {
      const state = app.store.getState();
      expect(state.counter).toBe(0);
      expect(state.user.name).toBe("John");
      expect(state.theme).toBe("light");
    });

    test("should replace entire state", () => {
      const newState = {
        counter: 5,
        user: { name: "Alice", email: "alice@example.com" },
        theme: "dark",
      };

      app.store.replaceState(newState);

      expect(app.store.state.counter.value).toBe(5);
      expect(app.store.state.user.value.name).toBe("Alice");
      expect(app.store.state.theme.value).toBe("dark");
    });
  });

  describe("Store Subscriptions", () => {
    beforeEach(() => {
      app.use(StorePlugin, {
        state: { counter: 0 },
        actions: { increment: (state: any) => state.counter.value++ },
      });
    });

    test("should subscribe to store mutations", async () => {
      const mockCallback = mock(() => {});
      const unsubscribe = app.store.subscribe(mockCallback);

      await app.store.dispatch("increment");

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "increment",
          payload: undefined,
          timestamp: expect.any(Number),
        }),
        expect.any(Object)
      );

      unsubscribe();
    });

    test("should unsubscribe from store mutations", async () => {
      const mockCallback = mock(() => {});
      const unsubscribe = app.store.subscribe(mockCallback);

      await app.store.dispatch("increment");
      expect(mockCallback).toHaveBeenCalledTimes(1);

      unsubscribe();
      await app.store.dispatch("increment");
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test("should handle multiple subscribers", async () => {
      const mockCallback1 = mock(() => {});
      const mockCallback2 = mock(() => {});

      app.store.subscribe(mockCallback1);
      app.store.subscribe(mockCallback2);

      await app.store.dispatch("increment");

      expect(mockCallback1).toHaveBeenCalledTimes(1);
      expect(mockCallback2).toHaveBeenCalledTimes(1);
    });
  });

  describe("Runtime State and Action Creation", () => {
    beforeEach(() => {
      app.use(StorePlugin, {
        state: { counter: 0 },
        actions: { increment: (state: any) => state.counter.value++ },
      });
    });

    test("should create state at runtime", () => {
      const notification = app.store.createState("notification", null);

      expect(app.store.state.notification).toBeDefined();
      expect(app.store.state.notification.value).toBe(null);
      expect(notification).toBe(app.store.state.notification);
    });

    test("should not override existing state", () => {
      const existingState = app.store.createState("counter", 999);
      expect(app.store.state.counter.value).toBe(0);
      expect(existingState).toBe(app.store.state.counter);
    });

    test("should create actions at runtime", async () => {
      app.store.createAction("double", (state: any) => {
        state.counter.value *= 2;
      });

      app.store.state.counter.value = 5;
      await app.store.dispatch("double");
      expect(app.store.state.counter.value).toBe(10);
    });

    test("should override existing actions", async () => {
      app.store.createAction("increment", (state: any) => {
        state.counter.value += 10;
      });

      await app.store.dispatch("increment");
      expect(app.store.state.counter.value).toBe(10);
    });
  });

  describe("Namespaced Modules", () => {
    beforeEach(() => {
      app.use(StorePlugin, {
        state: { theme: "light" },
        namespaces: {
          auth: {
            state: {
              user: null,
              token: null,
              isLoggedIn: false,
            },
            actions: {
              login: (state: any, { user, token }: any) => {
                state.auth.user.value = user;
                state.auth.token.value = token;
                state.auth.isLoggedIn.value = true;
              },
              logout: (state: any) => {
                state.auth.user.value = null;
                state.auth.token.value = null;
                state.auth.isLoggedIn.value = false;
              },
            },
          },
          todos: {
            state: { items: [], filter: "all" },
            actions: {
              addTodo: (state: any, text: string) => {
                state.todos.items.value.push({
                  id: Date.now(),
                  text,
                  completed: false,
                });
              },
              toggleTodo: (state: any, id: number) => {
                const todo = state.todos.items.value.find(
                  (t: any) => t.id === id
                );
                if (todo) todo.completed = !todo.completed;
              },
            },
          },
        },
        actions: {
          toggleTheme: (state: any) => {
            state.theme.value = state.theme.value === "light" ? "dark" : "light";
          },
        },
      });
    });

    test("should create namespaced state", () => {
      expect(app.store.state.auth.user.value).toBe(null);
      expect(app.store.state.auth.isLoggedIn.value).toBe(false);
      expect(app.store.state.todos.items.value).toEqual([]);
      expect(app.store.state.todos.filter.value).toBe("all");
    });

    test("should dispatch namespaced actions", async () => {
      const loginData = {
        user: { name: "John", id: 1 },
        token: "abc123",
      };

      await app.store.dispatch("auth.login", loginData);

      expect(app.store.state.auth.user.value).toEqual(loginData.user);
      expect(app.store.state.auth.token.value).toBe("abc123");
      expect(app.store.state.auth.isLoggedIn.value).toBe(true);
    });

    test("should dispatch nested namespaced actions", async () => {
      await app.store.dispatch("todos.addTodo", "Learn Eleva");
      await app.store.dispatch("todos.addTodo", "Build an app");

      expect(app.store.state.todos.items.value).toHaveLength(2);
      expect(app.store.state.todos.items.value[0].text).toBe("Learn Eleva");
      expect(app.store.state.todos.items.value[1].text).toBe("Build an app");
    });

    test("should handle mixed global and namespaced actions", async () => {
      await app.store.dispatch("toggleTheme");
      expect(app.store.state.theme.value).toBe("dark");

      await app.store.dispatch("auth.login", {
        user: { name: "John" },
        token: "token123",
      });
      expect(app.store.state.auth.isLoggedIn.value).toBe(true);
    });
  });

  describe("Runtime Module Management", () => {
    beforeEach(() => {
      app.use(StorePlugin, {
        state: { theme: "light" },
      });
    });

    test("should register new module at runtime", () => {
      app.store.registerModule("cart", {
        state: { items: [], total: 0 },
        actions: {
          addItem: (state: any, item: any) => {
            state.cart.items.value.push(item);
            state.cart.total.value += item.price;
          },
          clearCart: (state: any) => {
            state.cart.items.value = [];
            state.cart.total.value = 0;
          },
        },
      });

      expect(app.store.state.cart.items.value).toEqual([]);
      expect(app.store.state.cart.total.value).toBe(0);
    });

    test("should dispatch actions in registered module", async () => {
      app.store.registerModule("cart", {
        state: { items: [], total: 0 },
        actions: {
          addItem: (state: any, item: any) => {
            state.cart.items.value.push(item);
            state.cart.total.value += item.price;
          },
        },
      });

      await app.store.dispatch("cart.addItem", { name: "Book", price: 20 });

      expect(app.store.state.cart.items.value).toHaveLength(1);
      expect(app.store.state.cart.total.value).toBe(20);
    });

    test("should warn when registering existing module", () => {
      const originalWarn = console.warn;
      const warnCalls: any[] = [];
      console.warn = (...args: any[]) => warnCalls.push(args);

      app.store.registerModule("test", {
        state: { data: "first" },
        actions: {},
      });

      app.store.registerModule("test", {
        state: { data: "second" },
        actions: {},
      });

      expect(warnCalls.some((call) => call[0] === '[StorePlugin] Module "test" already exists')).toBe(true);
      console.warn = originalWarn;
    });

    test("should unregister module", () => {
      app.store.registerModule("temp", {
        state: { data: "test" },
        actions: {},
      });

      expect(app.store.state.temp).toBeDefined();

      app.store.unregisterModule("temp");

      expect(app.store.state.temp).toBeUndefined();
    });

    test("should warn when unregistering non-existent module", () => {
      const originalWarn = console.warn;
      const warnCalls: any[] = [];
      console.warn = (...args: any[]) => warnCalls.push(args);

      app.store.unregisterModule("nonExistent");

      expect(warnCalls.some((call) => call[0] === '[StorePlugin] Module "nonExistent" does not exist')).toBe(true);
      console.warn = originalWarn;
    });
  });

  describe("State Persistence", () => {
    test("should persist state to localStorage", async () => {
      app.use(StorePlugin, {
        state: { counter: 5, user: { name: "John" } },
        persistence: {
          enabled: true,
          key: "test-store",
          storage: "localStorage",
        },
      });

      app.store.createAction("noop", () => {});
      await app.store.dispatch("noop");

      const saved = JSON.parse(localStorage.getItem("test-store")!);
      expect(saved.counter).toBe(5);
      expect(saved.user.name).toBe("John");
    });

    test("should persist state to sessionStorage", async () => {
      app.use(StorePlugin, {
        state: { theme: "dark" },
        persistence: {
          enabled: true,
          key: "session-store",
          storage: "sessionStorage",
        },
      });

      app.store.createAction("noop", () => {});
      await app.store.dispatch("noop");

      const saved = JSON.parse(sessionStorage.getItem("session-store")!);
      expect(saved.theme).toBe("dark");
    });

    test("should restore state from localStorage", () => {
      localStorage.setItem(
        "restore-test",
        JSON.stringify({
          counter: 10,
          user: { name: "Jane" },
        })
      );

      app.use(StorePlugin, {
        state: { counter: 0, user: { name: "Default" } },
        persistence: {
          enabled: true,
          key: "restore-test",
        },
      });

      expect(app.store.state.counter.value).toBe(10);
      expect(app.store.state.user.value.name).toBe("Jane");
    });

    test("should persist only included keys", async () => {
      app.use(StorePlugin, {
        state: {
          counter: 5,
          user: { name: "John" },
          temp: "should not persist",
        },
        persistence: {
          enabled: true,
          key: "selective-store",
          include: ["counter", "user"],
        },
      });

      app.store.createAction("noop", () => {});
      await app.store.dispatch("noop");

      const saved = JSON.parse(localStorage.getItem("selective-store")!);
      expect(saved.counter).toBe(5);
      expect(saved.user.name).toBe("John");
      expect(saved.temp).toBeUndefined();
    });

    test("should exclude specified keys from persistence", async () => {
      app.use(StorePlugin, {
        state: {
          counter: 5,
          user: { name: "John" },
          temp: "should not persist",
        },
        persistence: {
          enabled: true,
          key: "exclude-store",
          exclude: ["temp"],
        },
      });

      app.store.createAction("noop", () => {});
      await app.store.dispatch("noop");

      const saved = JSON.parse(localStorage.getItem("exclude-store")!);
      expect(saved.counter).toBe(5);
      expect(saved.user.name).toBe("John");
      expect(saved.temp).toBeUndefined();
    });

    test("should handle persistence errors gracefully", () => {
      const consoleSpy = spyOn(console, "warn").mockImplementation(() => {});

      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = mock(() => {
        throw new Error("Storage quota exceeded");
      });

      app.use(StorePlugin, {
        state: { counter: 5 },
        persistence: { enabled: true },
      });

      app.store.createAction("noop", () => {});
      expect(() => app.store.dispatch("noop")).not.toThrow();

      Storage.prototype.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });

    test("should clear persisted state", () => {
      localStorage.setItem("clear-test", JSON.stringify({ data: "test" }));

      app.use(StorePlugin, {
        state: { counter: 0 },
        persistence: {
          enabled: true,
          key: "clear-test",
        },
      });

      app.store.clearPersistedState();
      expect(localStorage.getItem("clear-test")).toBe(null);
    });
  });

  describe("Component Integration", () => {
    beforeEach(() => {
      app.use(StorePlugin, {
        state: {
          counter: 0,
          user: { name: "John" },
        },
        actions: {
          increment: (state: any) => state.counter.value++,
          updateUser: (state: any, updates: any) => {
            state.user.value = { ...state.user.value, ...updates };
          },
        },
      });
    });

    test("should inject store into component setup", async () => {
      let capturedStore: any;

      const testComponent = createComponentFixture({
        setup: ({ store }: any) => {
          capturedStore = store;
          return { count: store.state.counter };
        },
        template: (ctx: any) => `<div>Count: ${ctx.count.value}</div>`,
      });

      await app.mount(container, testComponent);

      expect(capturedStore).toBeDefined();
      expect(capturedStore.state).toBeDefined();
      expect(capturedStore.dispatch).toBeDefined();
      expect(typeof capturedStore.createState).toBe("function");
      expect(typeof capturedStore.createAction).toBe("function");
    });

    test("should allow components to create state", async () => {
      const testComponent = createComponentFixture({
        setup: ({ store }: any) => {
          const loading = store.createState("isLoading", false);
          return { loading };
        },
        template: (ctx: any) => `<div>Loading: ${ctx.loading.value}</div>`,
      });

      await app.mount(container, testComponent);

      expect(app.store.state.isLoading).toBeDefined();
      expect(app.store.state.isLoading.value).toBe(false);
    });

    test("should allow components to create actions", async () => {
      const testComponent = createComponentFixture({
        setup: ({ store }: any) => {
          store.createAction("setLoading", (state: any, loading: boolean) => {
            state.isLoading.value = loading;
          });

          const loading = store.createState("isLoading", false);
          return { loading };
        },
        template: (ctx: any) => `<div>Loading: ${ctx.loading.value}</div>`,
      });

      await app.mount(container, testComponent);

      await app.store.dispatch("setLoading", true);
      expect(app.store.state.isLoading.value).toBe(true);
    });

    test("should allow components to register modules", async () => {
      const testComponent = createComponentFixture({
        setup: ({ store }: any) => {
          store.registerModule("notifications", {
            state: { messages: [] },
            actions: {
              addMessage: (state: any, message: string) => {
                state.notifications.messages.value.push(message);
              },
            },
          });

          return { messages: store.state.notifications.messages };
        },
        template: (ctx: any) =>
          `<div>Messages: ${ctx.messages.value.length}</div>`,
      });

      await app.mount(container, testComponent);

      await app.store.dispatch("notifications.addMessage", "Hello");
      expect(app.store.state.notifications.messages.value).toEqual(["Hello"]);
    });
  });

  describe("Cross-Component Reactivity", () => {
    beforeEach(() => {
      app.use(StorePlugin, {
        state: { sharedCounter: 0 },
        actions: { increment: (state: any) => state.sharedCounter.value++ },
      });
    });

    test("should update multiple components when shared state changes", async () => {
      const component1 = createComponentFixture({
        setup: ({ store }: any) => ({ count: store.state.sharedCounter }),
        template: (ctx: any) =>
          `<div class="comp1">Count: ${ctx.count.value}</div>`,
      });

      const component2 = createComponentFixture({
        setup: ({ store }: any) => ({ count: store.state.sharedCounter }),
        template: (ctx: any) =>
          `<div class="comp2">Count: ${ctx.count.value}</div>`,
      });

      const container1 = createFixture("container1");
      const container2 = createFixture("container2");

      await app.mount(container1, component1);
      await app.mount(container2, component2);

      expect(container1.innerHTML).toContain("Count: 0");
      expect(container2.innerHTML).toContain("Count: 0");

      await app.store.dispatch("increment");
      await flushPromises();

      expect(container1.innerHTML).toContain("Count: 1");
      expect(container2.innerHTML).toContain("Count: 1");
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      app.use(StorePlugin, {
        state: { counter: 0 },
        actions: {
          increment: (state: any) => state.counter.value++,
          throwError: () => {
            throw new Error("Test error");
          },
        },
      });
    });

    test("should throw error for invalid action names", async () => {
      await expect(app.store.dispatch("invalid.action.name")).rejects.toThrow(
        'Action "invalid.action.name" not found'
      );
    });

    test("should handle action execution errors", async () => {
      await expect(app.store.dispatch("throwError")).rejects.toThrow(
        "Test error"
      );
    });

    test("should handle custom error callbacks", async () => {
      const mockErrorHandler = mock(() => {});

      app.use(StorePlugin, {
        state: { test: 0 },
        actions: {
          errorAction: () => {
            throw new Error("Custom error");
          },
        },
        onError: mockErrorHandler,
      });

      try {
        await app.store.dispatch("errorAction");
      } catch (error) {
        // Error should still be thrown
      }

      expect(mockErrorHandler).toHaveBeenCalledWith(
        expect.any(Error),
        "Action dispatch failed: errorAction"
      );
    });

    test("should handle subscriber callback errors gracefully", async () => {
      const mockErrorHandler = mock(() => {});

      // Re-install with error handler
      StorePlugin.uninstall(app);
      app.use(StorePlugin, {
        state: { counter: 0 },
        actions: { increment: (state: any) => state.counter.value++ },
        onError: mockErrorHandler,
      });

      app.store.subscribe(() => {
        throw new Error("Subscriber error");
      });

      // Should not throw even when subscriber throws
      await app.store.dispatch("increment");

      // Error handler should have been called
      expect(mockErrorHandler).toHaveBeenCalledWith(
        expect.any(Error),
        "Subscriber callback failed"
      );
    });

    test("should throw error for invalid subscribe callback", () => {
      expect(() => {
        app.store.subscribe("not a function" as any);
      }).toThrow("Subscribe callback must be a function");
    });
  });

  describe("Performance and Memory", () => {
    beforeEach(() => {
      app.use(StorePlugin, {
        state: { counter: 0 },
        actions: { increment: (state: any) => state.counter.value++ },
      });
    });

    test("should limit mutation history", async () => {
      for (let i = 0; i < 150; i++) {
        await app.store.dispatch("increment");
      }

      expect(app.store.mutations.length).toBeLessThanOrEqual(100);
    });

    test("should properly clean up subscriptions", () => {
      const mockCallback = mock(() => {});
      const unsubscribe = app.store.subscribe(mockCallback);

      expect(app.store.subscribers.has(mockCallback)).toBe(true);

      unsubscribe();

      expect(app.store.subscribers.has(mockCallback)).toBe(false);
    });
  });

  describe("DevTools Integration", () => {
    test("should register with devtools when enabled", () => {
      (globalThis as any).window = {
        __ELEVA_DEVTOOLS__: {
          registerStore: mock(() => {}),
          notifyMutation: mock(() => {}),
        },
      };

      app.use(StorePlugin, {
        state: { counter: 0 },
        devTools: true,
      });

      expect(
        (globalThis as any).window.__ELEVA_DEVTOOLS__.registerStore
      ).toHaveBeenCalledWith(app.store);

      delete (globalThis as any).window;
    });

    test("should notify devtools of mutations when enabled", async () => {
      (globalThis as any).window = {
        __ELEVA_DEVTOOLS__: {
          registerStore: mock(() => {}),
          notifyMutation: mock(() => {}),
        },
      };

      app.use(StorePlugin, {
        state: { counter: 0 },
        actions: { increment: (state: any) => state.counter.value++ },
        devTools: true,
      });

      await app.store.dispatch("increment");

      expect(
        (globalThis as any).window.__ELEVA_DEVTOOLS__.notifyMutation
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "increment",
          payload: undefined,
        }),
        expect.any(Object)
      );

      delete (globalThis as any).window;
    });
  });

  describe("Nested Persistence", () => {
    test("should persist nested state objects", async () => {
      app.use(StorePlugin, {
        state: {
          user: {
            profile: { name: "John", age: 30 },
            settings: { theme: "dark" },
          },
        },
        persistence: {
          enabled: true,
          key: "nested-store-test",
        },
      });

      app.store.createAction("updateProfile", (state: any, updates: any) => {
        state.user.value = {
          ...state.user.value,
          profile: { ...state.user.value.profile, ...updates },
        };
      });

      await app.store.dispatch("updateProfile", { name: "Jane" });

      const saved = JSON.parse(localStorage.getItem("nested-store-test")!);
      expect(saved).toBeDefined();
    });
  });

  describe("Child Component Store Injection", () => {
    beforeEach(() => {
      app.use(StorePlugin, {
        state: { counter: 0 },
        actions: { increment: (state: any) => state.counter.value++ },
      });
    });

    test("should inject store into child components", async () => {
      let childStore: any = null;

      app.component("ChildComponent", {
        setup({ store }: any) {
          childStore = store;
          return { count: store?.state?.counter || 0 };
        },
        template: () => "<div>Child</div>",
      });

      app.component("ParentComponent", {
        template: () => `<div class="child-slot"></div>`,
        children: {
          ".child-slot": "ChildComponent",
        },
      });

      await app.mount(container, "ParentComponent");

      expect(childStore).toBeDefined();
      expect(childStore.state).toBeDefined();
      expect(typeof childStore.dispatch).toBe("function");
      expect(typeof childStore.createState).toBe("function");
      expect(typeof childStore.createAction).toBe("function");
      expect(typeof childStore.registerModule).toBe("function");
    });

    test("should allow child components to dispatch actions", async () => {
      let childDispatch: any = null;

      app.component("ChildComponent", {
        setup({ store }: any) {
          childDispatch = store?.dispatch;
          return {};
        },
        template: () => "<div>Child</div>",
      });

      app.component("ParentComponent", {
        template: () => `<div class="child-slot"></div>`,
        children: {
          ".child-slot": "ChildComponent",
        },
      });

      await app.mount(container, "ParentComponent");

      expect(childDispatch).toBeDefined();
      expect(typeof childDispatch).toBe("function");

      if (childDispatch) {
        await childDispatch("increment");
        expect(app.store.state.counter.value).toBe(1);
      }
    });

    test("should handle child components without setup", async () => {
      app.component("SimpleChild", {
        template: () => "<div>Simple Child</div>",
      });

      app.component("ParentComponent", {
        template: () => `<div class="child-slot"></div>`,
        children: {
          ".child-slot": "SimpleChild",
        },
      });

      await expect(app.mount(container, "ParentComponent")).resolves.toBeDefined();
    });

    test("should handle string component references in children", async () => {
      app.component("NamedChild", {
        setup({ store }: any) {
          return { hasStore: !!store };
        },
        template: (ctx: any) => `<div>Has Store: ${ctx.hasStore}</div>`,
      });

      app.component("ParentWithStringRef", {
        template: () => `<div class="named-child"></div>`,
        children: {
          ".named-child": "NamedChild",
        },
      });

      await expect(app.mount(container, "ParentWithStringRef")).resolves.toBeDefined();
    });
  });

});
