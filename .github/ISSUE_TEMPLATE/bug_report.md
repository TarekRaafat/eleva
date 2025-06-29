---
name: 🐛 Bug Report
about: Create a detailed report to help us improve Eleva.js
title: "[BUG] "
labels: bug
assignees: ''

---

## 🐛 Bug Description

A clear and concise description of the bug.

## 🔄 Steps to Reproduce

Please provide detailed steps to reproduce the issue:

1. **Framework Version:** [e.g., 1.0.0]
2. **Environment:**
   - **Browser(s) and Version(s):** [e.g., Safari 18.4, Chrome 139, Firefox 140]
   - **Operating System(s):** [e.g., macOS 15.5, Windows 11, Ubuntu 22.04]
   - **Module Format:** [e.g., ESM, CJS, UMD]
   - **Build Tool:** [e.g., Webpack, Vite, Rollup, or direct browser usage]

3. **Minimal Reproducible Example:**
   
   Please provide a minimal code example that reproduces the issue:

```javascript
// Your component code here
const myComponent = {
  setup: ({ signal }) => {
    const message = signal("Hello World");
    return { message };
  },
  template: (ctx) => `<div>{{ message.value }}</div>`
};

// Create Eleva instance and mount
const app = new Eleva("MyApp");
app.component("myComponent", myComponent);
app.mount(document.getElementById("app"), "myComponent");

// Steps that trigger the bug:
// 1. 
// 2. 
// 3. 
```

**Or provide a link to a CodePen, JSFiddle, or GitHub repository with the reproduction case.**

## ✅ Expected Behavior

A clear description of what you expected to happen.

## ❌ Actual Behavior

A clear description of what actually happened instead.

## 📸 Screenshots or Screencasts

If applicable, add screenshots or a screen recording to help explain the problem.

## 🔍 Error Messages

If there are any console errors, warnings, or stack traces, please include them here:

```
Paste any error messages here
```

## 🧩 Related Components/Features

Which parts of Eleva.js are involved? (Check all that apply)

- [ ] Core component system
- [ ] Signal reactivity
- [ ] Template engine
- [ ] Event emitter
- [ ] Renderer/DOM diffing
- [ ] Lifecycle hooks
- [ ] Plugin system
- [ ] JSDoc comments
- [ ] TypeScript definitions
- [ ] Other: ___________

## 🔄 Regression Information

- [ ] This is a regression (it worked in a previous version)
- **Last working version:** [e.g., 1.0.0]
- **First broken version:** [e.g., 1.1.0]

## 🛠️ Additional Context

Add any other relevant context here, such as:
- Are you using any plugins or custom configurations?
- Any workarounds you've discovered?
- Performance impact (if applicable)?
- Does this affect specific browsers or all browsers?
- Bundle size or performance considerations?

## 🔗 Related Issues

Link any related issues or discussions here.
