import Eleva from "../src/index.js";

describe("Eleva (Core)", () => {
  let app;
  let appContainer;
  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    appContainer = document.getElementById("app");
    app = new Eleva("TestApp");
  });

  test("registers and mounts a component", async () => {
    const component = {
      setup: ({ signal }) => ({ msg: signal("Hello") }),
      template: (ctx) => `<div>${ctx.msg.value}</div>`,
    };
    app.component("hello-comp", component);

    const instance = await app.mount(appContainer, "hello-comp");

    expect(instance).toBeTruthy();
    expect(appContainer.innerHTML).toContain("Hello");
  });

  test("lifecycle hooks are called appropriately", async () => {
    const onBeforeMountFn = jest.fn();
    const onMountFn = jest.fn();
    const onUnmountFn = jest.fn();

    const component = {
      setup: ({ signal }) => {
        return {
          msg: signal("Lifecycle"),
          onBeforeMount() {
            onBeforeMountFn();
          },
          onMount() {
            onMountFn();
          },
          onUnmount() {
            onUnmountFn();
          },
        };
      },
      template: (ctx) => `<div>${ctx.msg.value}</div>`,
    };
    app.component("lifecycle-comp", component);

    const instance = await app.mount(appContainer, "lifecycle-comp");

    expect(instance).toBeTruthy();
    expect(onBeforeMountFn).toHaveBeenCalled();
    expect(onMountFn).toHaveBeenCalled();
    expect(appContainer.innerHTML).toContain("Lifecycle");

    instance.unmount();

    expect(appContainer.innerHTML).not.toContain("Lifecycle");
    expect(onUnmountFn).toHaveBeenCalled();
  });

  test("cleans up event listeners on unmount", async () => {
    const clickHandler = jest.fn();

    const component = {
      setup: () => ({
        handleClick: clickHandler,
      }),
      template: () => `<button @click="handleClick">Click me</button>`,
    };

    app.component("cleanup-comp", component);
    const instance = await app.mount(appContainer, "cleanup-comp");

    const button = appContainer.querySelector("button");
    button.click();
    expect(clickHandler).toHaveBeenCalledTimes(1);

    // Unmount component
    instance.unmount();

    // Click should no longer trigger handler
    button.click();
    expect(clickHandler).toHaveBeenCalledTimes(1);
  });

  test("throws error if compName is invalid in mount", () => {
    expect(() => app.mount(appContainer, 123)).toThrow("Invalid component parameter.");
  });

  test("handles missing setup function in component definition", async () => {
    const component = {
      template: () => `<div>No Setup</div>`,
    };
    app.component("no-setup-comp", component);

    const instance = await app.mount(appContainer, "no-setup-comp");

    expect(instance).toBeTruthy();
    expect(appContainer.innerHTML).toContain("No Setup");
  });

  test("unmounts and remounts child components with updated props", async () => {
    const ChildComponent = {
      setup: ({ props }) => ({ title: props.title }),
      template: (ctx) => `<div>Child: ${ctx.title}</div>`,
    };
  
    const ParentComponent = {
      template: () => `
        <div>
          <child-comp eleva-prop-title="Initial Title"></child-comp>
        </div>
      `,
      children: {
        "child-comp": ChildComponent,
      },
    };
  
    app.component("parent-comp", ParentComponent);
    app.component("child-comp", ChildComponent);
  
    // Mount the parent component with the initial child
    const instance = await app.mount(appContainer, "parent-comp");
    expect(appContainer.innerHTML).toContain("Child: Initial Title");
  
    // Update the child component's props
    ParentComponent.template = () => `
      <div>
        <child-comp eleva-prop-title="Updated Title"></child-comp>
      </div>
    `;
    await app.mount(appContainer, "parent-comp");
  
    // Verify the child component is unmounted and remounted with updated props
    expect(appContainer.innerHTML).toContain("Child: Updated Title");
    expect(appContainer.innerHTML).not.toContain("Child: Initial Title");
  });

  test("mounts child components with props extracted from attributes", async () => {
    const ChildComponent = {
      setup: ({ props }) => ({ title: props.title }),
      template: (ctx) => `<div>${ctx.title}</div>`,
    };
    const ParentComponent = {
      template: () => `<div><child-comp eleva-prop-title="Hello"></child-comp></div>`,
      children: {
        "child-comp": ChildComponent,
      },
    };

    app.component("parent-comp", ParentComponent);
    app.component("child-comp", ChildComponent);

    const instance = await app.mount(appContainer, "parent-comp");

    expect(instance).toBeTruthy();
    expect(appContainer.innerHTML).toContain("Hello");
  });

  test("plugin integration extends Eleva instance", () => {
    const myPlugin = {
      install(eleva, options) {
        eleva.testPlugin = () => options.msg;
      },
    };
    app.use(myPlugin, { msg: "Plugin Works" });
    expect(app.testPlugin()).toBe("Plugin Works");
  });
});

describe("Eleva error handling", () => {
  test("should handle invalid state transitions", () => {
    const eleva = new Eleva();
    eleva.state = "invalid";
    expect(() => eleva.validateState()).toThrow();
  });

  test("should handle template errors", () => {
    const eleva = new Eleva();
    eleva.template = null;
    expect(() => eleva.render()).toThrow();
  });

  test("should handle navigation errors", () => {
    const eleva = new Eleva();
    eleva.floor = -1;
    expect(() => eleva.navigate()).toThrow();
  });

  test("should handle movement errors", () => {
    const eleva = new Eleva();
    eleva.moving = true;
    expect(() => eleva.move()).toThrow();
  });
});

describe("Children Components & Passing Props", () => {
  let app;
  let appContainer;
  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    appContainer = document.getElementById("app");
    app = new Eleva("TestApp");
  });

  test("child component receives props from parent", async () => {
    const ChildComponent = {
      setup: ({ props }) => ({ title: props.title }),
      template: (ctx) => `<div>Child: ${ctx.title}</div>`,
    };
    const ParentComponent = {
      setup: () => ({}),
      template: () => `
        <div>
          <h1>Parent Component</h1>
          <child-comp eleva-prop-title="Hello from Parent"></child-comp>
        </div>
      `,
      children: {
        "child-comp": ChildComponent,
      },
    };
    app.component("parent-comp", ParentComponent);
    app.component("child-comp", ChildComponent);

    const instance = await app.mount(appContainer, "parent-comp");

    expect(instance).toBeTruthy();
    expect(appContainer.innerHTML).toContain("Parent Component");
    expect(appContainer.innerHTML).toContain("Child: Hello from Parent");
  });
});
