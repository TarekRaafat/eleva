// window.Eleva = require("../../../dist/eleva.min.js");
import Eleva from "../../../dist/eleva.min.js";
window.Eleva = Eleva;

// Add any global mocks or configurations specific to build tests
beforeAll(() => {
  // Setup code that runs before all tests
  if (!window.Eleva) {
    throw new Error("Eleva not loaded properly in test environment");
  }
});

afterAll(() => {
  // Cleanup code that runs after all tests
});
