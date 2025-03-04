# Basic Counter Example

In this tutorial, you'll build a simple counter application using Eleva. The counter will display a number that increments every time you click a button. This example demonstrates Eleva’s component-based architecture and signal-based reactivity.

## Setup

1. Create an `index.html` file:

   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <title>Eleva Counter Example</title>
     </head>
     <body>
       <div id="app"></div>
       <script src="https://cdn.jsdelivr.net/npm/eleva"></script>
       <script src="counter.js"></script>
     </body>
   </html>
   ```

2. Create a `counter.js` file with the following code:

   ```js
   // Create a new Eleva instance
   const app = new Eleva("CounterApp");

   // Define a 'Counter' component
   app.component("Counter", {
     setup({ signal }) {
       const count = signal(0);
       return { count };
     },
     template: (ctx) => `
       <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
         <h1>Counter Example</h1>
         <p style="font-size: 2em;">${ctx.count.value}</p>
         <button style="padding: 10px 20px; font-size: 1em;" @click="() => count.value++">Increment</button>
       </div>
     `,
   });

   // Mount the 'Counter' component to the #app element
   app.mount(document.querySelector("#app"), "Counter");
   ```

   Interactive Demo: [CodePen](https://codepen.io/tarekraafat/pen/dPyNmqm?editors=1010)

## Running the Example

Open `index.html` in your browser. You should see a counter with an "Increment" button. Each click will update the displayed number, demonstrating Eleva's reactive updates.
