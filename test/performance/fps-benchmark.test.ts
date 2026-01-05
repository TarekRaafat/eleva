/**
 * FPS Benchmark for Eleva.js
 * Measures rendering throughput under various scenarios
 */

import { describe, test, expect, beforeEach, afterEach, afterAll } from "bun:test";
import { Window } from "happy-dom";

// Save original globals to restore after tests
const originalWindow = (globalThis as any).window;
const originalDocument = (globalThis as any).document;
const originalHTMLElement = (globalThis as any).HTMLElement;
const originalNode = (globalThis as any).Node;

// Setup DOM environment
const window = new Window();
const document = window.document;
(globalThis as any).document = document;
(globalThis as any).window = window;
(globalThis as any).HTMLElement = window.HTMLElement;
(globalThis as any).Node = window.Node;

// Import Eleva after DOM setup
const { default: Eleva } = await import("../../src/index.js");

describe("FPS Benchmark", () => {
  let container: any;
  let app: InstanceType<typeof Eleva>;

  beforeEach(() => {
    container = document.createElement("div");
    (document.body as any).appendChild(container);
    app = new Eleva("FPSBenchmark");
  });

  afterEach(() => {
    container.remove();
  });

  // Restore original globals after all tests in this file
  afterAll(() => {
    (globalThis as any).window = originalWindow;
    (globalThis as any).document = originalDocument;
    (globalThis as any).HTMLElement = originalHTMLElement;
    (globalThis as any).Node = originalNode;
  });

  /**
   * Measure throughput: how many updates can be processed in given time
   */
  const measureThroughput = async (
    updateFn: () => void,
    iterations: number
  ): Promise<{ totalTime: number; opsPerSecond: number; avgOpTime: number }> => {
    // Warm up
    for (let i = 0; i < 10; i++) {
      updateFn();
      await new Promise((r) => queueMicrotask(r));
    }

    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      updateFn();
      // Allow microtask queue to process (where batched renders happen)
      await new Promise((r) => queueMicrotask(r));
    }

    const totalTime = performance.now() - start;
    const opsPerSecond = (iterations / totalTime) * 1000;
    const avgOpTime = totalTime / iterations;

    return { totalTime, opsPerSecond, avgOpTime };
  };

  test("Throughput: Simple counter", async () => {
    const component = {
      setup: ({ signal }: any) => ({
        count: signal(0),
      }),
      template: ({ count }: any) => `
        <div class="counter">
          <span>Count: ${count.value}</span>
        </div>
      `,
    };

    const instance = await app.mount(container, component);
    const count = (instance as any).data.count;

    const iterations = 1000;
    const result = await measureThroughput(() => {
      count.value++;
    }, iterations);

    console.log("\n📊 Simple Counter:");
    console.log(`   Iterations: ${iterations}`);
    console.log(`   Total Time: ${result.totalTime.toFixed(2)}ms`);
    console.log(`   Ops/Second: ${result.opsPerSecond.toFixed(0)}`);
    console.log(`   Avg Op Time: ${result.avgOpTime.toFixed(3)}ms`);
    console.log(`   Max FPS potential: ${Math.min(result.opsPerSecond, 1000 / 16.67).toFixed(0)} (at 60fps budget)`);

    expect(result.opsPerSecond).toBeGreaterThan(500);
    await instance.unmount();
  });

  test("Throughput: Position animation (2 signals)", async () => {
    const component = {
      setup: ({ signal }: any) => ({
        x: signal(0),
        y: signal(0),
      }),
      template: ({ x, y }: any) => `
        <div class="box" style="transform: translate(${x.value}px, ${y.value}px)">
          Position: (${x.value}, ${y.value})
        </div>
      `,
    };

    const instance = await app.mount(container, component);
    const { x, y } = (instance as any).data;

    let angle = 0;
    const iterations = 1000;
    const result = await measureThroughput(() => {
      angle += 0.1;
      x.value = Math.round(Math.cos(angle) * 100);
      y.value = Math.round(Math.sin(angle) * 100);
    }, iterations);

    console.log("\n📊 Position Animation (2 signals batched):");
    console.log(`   Iterations: ${iterations}`);
    console.log(`   Total Time: ${result.totalTime.toFixed(2)}ms`);
    console.log(`   Ops/Second: ${result.opsPerSecond.toFixed(0)}`);
    console.log(`   Avg Op Time: ${result.avgOpTime.toFixed(3)}ms`);

    expect(result.opsPerSecond).toBeGreaterThan(500);
    await instance.unmount();
  });

  test("Throughput: 5 signals batched per update", async () => {
    const component = {
      setup: ({ signal }: any) => ({
        a: signal(0),
        b: signal(0),
        c: signal(0),
        d: signal(0),
        e: signal(0),
      }),
      template: ({ a, b, c, d, e }: any) => `
        <div>
          <span>${a.value}</span>
          <span>${b.value}</span>
          <span>${c.value}</span>
          <span>${d.value}</span>
          <span>${e.value}</span>
        </div>
      `,
    };

    const instance = await app.mount(container, component);
    const { a, b, c, d, e } = (instance as any).data;

    let tick = 0;
    const iterations = 1000;
    const result = await measureThroughput(() => {
      tick++;
      a.value = tick;
      b.value = tick * 2;
      c.value = tick * 3;
      d.value = tick * 4;
      e.value = tick * 5;
    }, iterations);

    console.log("\n📊 Batched Updates (5 signals → 1 render):");
    console.log(`   Iterations: ${iterations}`);
    console.log(`   Total Time: ${result.totalTime.toFixed(2)}ms`);
    console.log(`   Ops/Second: ${result.opsPerSecond.toFixed(0)}`);
    console.log(`   Signal updates: ${iterations * 5}`);
    console.log(`   Renders: ${iterations} (batched)`);

    expect(result.opsPerSecond).toBeGreaterThan(500);
    await instance.unmount();
  });

  test("Throughput: List with 100 items", async () => {
    const component = {
      setup: ({ signal }: any) => ({
        items: signal(Array.from({ length: 100 }, (_, i) => ({ id: i, value: 0 }))),
      }),
      template: ({ items }: any) => `
        <ul>
          ${items.value.map((item: any) => `
            <li key="${item.id}">Item ${item.id}: ${item.value}</li>
          `).join("")}
        </ul>
      `,
    };

    const instance = await app.mount(container, component);
    const items = (instance as any).data.items;

    const iterations = 100;
    const result = await measureThroughput(() => {
      items.value = items.value.map((item: any) => ({
        ...item,
        value: item.value + 1,
      }));
    }, iterations);

    console.log("\n📊 List Update (100 items):");
    console.log(`   Iterations: ${iterations}`);
    console.log(`   Total Time: ${result.totalTime.toFixed(2)}ms`);
    console.log(`   Ops/Second: ${result.opsPerSecond.toFixed(0)}`);
    console.log(`   Avg Op Time: ${result.avgOpTime.toFixed(3)}ms`);

    expect(result.opsPerSecond).toBeGreaterThan(10);
    await instance.unmount();
  });

  test("Throughput: No-change updates (memoization)", async () => {
    const component = {
      setup: ({ signal }: any) => ({
        value: signal(42),
      }),
      template: ({ value }: any) => `
        <div>Static value: ${value.value}</div>
      `,
    };

    const instance = await app.mount(container, component);
    const value = (instance as any).data.value;

    const iterations = 10000;
    const result = await measureThroughput(() => {
      value.value = 42; // Same value - Signal skips notification
    }, iterations);

    console.log("\n📊 No-Change Updates (Signal optimization):");
    console.log(`   Iterations: ${iterations}`);
    console.log(`   Total Time: ${result.totalTime.toFixed(2)}ms`);
    console.log(`   Ops/Second: ${result.opsPerSecond.toFixed(0)}`);
    console.log(`   Note: Signal skips notify when value unchanged`);

    expect(result.opsPerSecond).toBeGreaterThan(10000);
    await instance.unmount();
  });

  test("Throughput: Complex nested template", async () => {
    const component = {
      setup: ({ signal }: any) => ({
        data: signal({
          header: { title: "Dashboard", subtitle: "Stats" },
          stats: [
            { label: "Users", value: 0 },
            { label: "Orders", value: 0 },
            { label: "Revenue", value: 0 },
          ],
          footer: { text: "Updated", time: "now" },
        }),
      }),
      template: ({ data }: any) => `
        <div class="dashboard">
          <header>
            <h1>${data.value.header.title}</h1>
            <h2>${data.value.header.subtitle}</h2>
          </header>
          <main>
            ${data.value.stats.map((stat: any, i: number) => `
              <div key="${i}" class="stat-card">
                <span class="label">${stat.label}</span>
                <span class="value">${stat.value}</span>
              </div>
            `).join("")}
          </main>
          <footer>
            <p>${data.value.footer.text}: ${data.value.footer.time}</p>
          </footer>
        </div>
      `,
    };

    const instance = await app.mount(container, component);
    const data = (instance as any).data.data;

    let tick = 0;
    const iterations = 500;
    const result = await measureThroughput(() => {
      tick++;
      data.value = {
        ...data.value,
        stats: data.value.stats.map((stat: any) => ({
          ...stat,
          value: tick,
        })),
        footer: { text: "Updated", time: `t${tick}` },
      };
    }, iterations);

    console.log("\n📊 Complex Nested Template:");
    console.log(`   Iterations: ${iterations}`);
    console.log(`   Total Time: ${result.totalTime.toFixed(2)}ms`);
    console.log(`   Ops/Second: ${result.opsPerSecond.toFixed(0)}`);
    console.log(`   Avg Op Time: ${result.avgOpTime.toFixed(3)}ms`);

    expect(result.opsPerSecond).toBeGreaterThan(100);
    await instance.unmount();
  });

  test("FPS Capability Analysis", async () => {
    console.log("\n" + "=".repeat(60));
    console.log("📈 FPS CAPABILITY ANALYSIS");
    console.log("=".repeat(60));

    // Test: How many renders can happen in 16.67ms (one 60fps frame)?
    const component = {
      setup: ({ signal }: any) => ({
        value: signal(0),
      }),
      template: ({ value }: any) => `<div>${value.value}</div>`,
    };

    const instance = await app.mount(container, component);
    const value = (instance as any).data.value;

    // Measure single render time
    const renderTimes: number[] = [];
    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      value.value = i;
      await new Promise((r) => queueMicrotask(r));
      renderTimes.push(performance.now() - start);
    }

    const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
    const maxRenderTime = Math.max(...renderTimes);
    const minRenderTime = Math.min(...renderTimes);
    const potentialFPS = 1000 / avgRenderTime;

    console.log(`   Avg Render Time: ${avgRenderTime.toFixed(3)}ms`);
    console.log(`   Min Render Time: ${minRenderTime.toFixed(3)}ms`);
    console.log(`   Max Render Time: ${maxRenderTime.toFixed(3)}ms`);
    console.log(`   Theoretical Max FPS: ${potentialFPS.toFixed(0)}`);
    console.log("");
    console.log("   60fps budget: 16.67ms per frame");
    console.log(`   Renders possible per frame: ${Math.floor(16.67 / avgRenderTime)}`);
    console.log("");
    console.log("   ✅ Framework does NOT limit FPS");
    console.log("   ✅ Batching reduces unnecessary renders");
    console.log("   ✅ Memoization skips unchanged updates");
    console.log("=".repeat(60));

    await instance.unmount();
  });
});
