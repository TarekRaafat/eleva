---
name: ❓ Question & Support
about: Ask a question about using Eleva.js or get support
title: "[QUESTION] "
labels: question, needs-triage
assignees: ''

---

## ❓ Question

**What are you trying to achieve?**

A clear description of what you want to accomplish with Eleva.js.

## 🔧 Current Approach

**What have you tried so far?**

Show your current code or approach:

```javascript
// Your current implementation
const component = {
  setup: ({ signal }) => {
    const data = signal("example");
    return { data };
  },
  template: (ctx) => `
    <!-- Your template -->
    <div>{{ data.value }}</div>
  `
};

const app = new Eleva("MyApp");
app.component("myComponent", component);
app.mount(document.getElementById("app"), "myComponent");
```

**What's not working or what are you unsure about?**

## 🎯 Specific Questions

**Please ask your specific questions:**

1. **Question 1:** [Your first question]
2. **Question 2:** [Your second question]
3. **Question 3:** [Additional questions]

## 🌍 Context

**Project context:**
- **Framework Version:** [e.g., 1.0.0]
- **Project type:** [e.g., SPA, website, component library]
- **Module format:** [e.g., ESM, CJS, UMD]
- **Build tools:** [e.g., Webpack, Vite, Rollup, or none]
- **Other frameworks/libraries used:** [e.g., None, or list any]

## 🔍 Topic Areas

**What topics does your question relate to?** (Check all that apply)

- [ ] Getting started with Eleva.js
- [ ] Component creation and lifecycle
- [ ] Signal reactivity and data flow
- [ ] Template syntax and templating
- [ ] Event handling and communication
- [ ] Performance optimization
- [ ] Plugin system and plugins
- [ ] TypeScript usage
- [ ] Build setup and integration
- [ ] Testing components
- [ ] Browser compatibility
- [ ] Migration from another framework
- [ ] Best practices and patterns
- [ ] Deployment and production
- [ ] Other: ___________

## 📚 Documentation Check

**Have you checked the documentation?**
- [ ] Yes, I've read the relevant documentation
- [ ] Yes, but the documentation wasn't clear enough
- [ ] Yes, but I couldn't find information about my specific case
- [ ] No, I'm not sure where to look

**Relevant documentation links you've consulted:**
- [Link 1]
- [Link 2]

## 🎨 Desired Outcome

**What would the ideal solution look like?**

Describe what you expect the working code or behavior to be:

```javascript
// What you think the solution might look like
const idealApp = new Eleva("IdealApp");

idealApp.component("idealComponent", {
  setup: ({ signal }) => {
    // What you think should work
    const data = signal("example");
    return { data };
  },
  template: (ctx) => `<div>{{ data.value }}</div>`
});
```

## 🌟 Use Case Details

**What are you building?**

Provide more context about your project or use case to help us give better advice:

- Project type and scope
- Target audience/users
- Performance requirements
- Browser support needs
- Any specific constraints or requirements

## 🔄 Urgency

**How urgent is this question?**
- [ ] Urgent - Blocking my project
- [ ] Medium - Important for my timeline
- [ ] Low - Just curious or planning ahead

## 🤔 Additional Context

**Anything else that might be relevant:**
- Previous experience with similar frameworks
- Specific challenges you're facing
- Any error messages or unexpected behaviors
- Environment-specific considerations

## 🙏 Contribution

**After getting help, would you be interested in:**
- [ ] Contributing documentation improvements
- [ ] Sharing your solution as an example
- [ ] Helping others with similar questions
- [ ] Writing a tutorial or guide

## 🔗 Related Discussions

Link any related questions, issues, or community discussions here. 