# Creating a Custom Plugin for Eleva

This tutorial guides you through creating a custom plugin for Eleva. Plugins allow you to extend the framework's functionality in a modular and straightforward way.

## Step 1: Create Your Plugin

Create a file called `myPlugin.js` with the following content:

```js
// myPlugin.js
const MyPlugin = {
  install(eleva, options) {
    // Extend Eleva with a new method
    eleva.sayHello = function () {
      console.log("Hello from MyPlugin!");
    };

    // You can also add properties or modify component behavior here
    console.log("MyPlugin has been installed!", options);
  },
};

export default MyPlugin;
```

## Step 2: Integrate Your Plugin with Eleva

In your main application file, import and use your plugin:

```js
// main.js (for an ES module example)
import Eleva from "eleva";
import MyPlugin from "./myPlugin.js";

const app = new Eleva("PluginApp");

// Use the custom plugin with optional configuration options
app.use(MyPlugin, { greeting: "Hi there!" });

// Define a component that uses the plugin's functionality
app.component("HelloWorld", {
  template: () => `
    <div style="font-family: sans-serif; text-align: center;">
      <h1>Hello, Eleva with MyPlugin!</h1>
      <button @click="() => app.sayHello()">Click Me</button>
    </div>
  `,
});

// Mount the component to the DOM
app.mount(document.querySelector("#app"), "HelloWorld");
```

If you're using a UMD build, adjust the script tags accordingly and ensure your plugin file is loaded before your main script.

## Step 3: Run Your Application

1. Create an `index.html` file:

   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <title>Custom Plugin Example</title>
     </head>
     <body>
       <div id="app"></div>
       <script src="https://unpkg.com/eleva/dist/eleva.min.js"></script>
       <script src="myPlugin.js"></script>
       <script src="main.js"></script>
     </body>
   </html>
   ```

2. Open `index.html` in your browser.  
   Click the "Click Me" button in the rendered component, and check the browser console. You should see "Hello from MyPlugin!" printed, indicating your custom plugin is working correctly.

Congratulations! You've successfully created and integrated a custom plugin with Eleva. This modular approach makes it simple and rewarding to extend Eleva’s functionality.
