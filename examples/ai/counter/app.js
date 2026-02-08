// Golden AI Example: Reactive Counter
// Demonstrates: signal(), @click event handler, template interpolation with ctx.

const app = new Eleva("CounterApp");

app.component("Counter", {
  setup: ({ signal }) => {
    const count = signal(0);
    return {
      count,
      inc: () => count.value++,
      dec: () => count.value--,
      reset: () => (count.value = 0),
    };
  },
  template: (ctx) => `
    <div>
      <h1>Count: ${ctx.count.value}</h1>
      <button @click="dec">-</button>
      <button @click="reset">Reset</button>
      <button @click="inc">+</button>
    </div>
  `,
});

app.mount(document.getElementById("app"), "Counter");
