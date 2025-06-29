---
name: 📚 Documentation Issue
about: Report problems with documentation or request documentation improvements
title: "[DOCS] "
labels: documentation
assignees: ''

---

## 📚 Documentation Issue

**Documentation Type:**
- [ ] API Reference
- [ ] Getting Started Guide
- [ ] Tutorial/Examples
- [ ] Plugin Documentation
- [ ] TypeScript Definitions
- [ ] README
- [ ] Migration Guide
- [ ] Best Practices
- [ ] Performance Guide
- [ ] Contributing Guidelines
- [ ] Other: ___________

## 🔍 Issue Category

**What type of documentation issue is this?**
- [ ] Missing documentation
- [ ] Incorrect/outdated information
- [ ] Unclear or confusing explanations
- [ ] Missing code examples
- [ ] Broken links or references
- [ ] Typos or grammar issues
- [ ] Formatting/presentation problems
- [ ] Missing TypeScript examples
- [ ] Incomplete API coverage
- [ ] Other: ___________

## 📍 Location

**Where is the documentation issue located?**

- **URL/File path:** [e.g., README.md, docs/index.md]
- **Section/heading:** [Specific section where the issue occurs]
- **Line numbers:** [If applicable for file-based docs]

## 🐛 Problem Description

**Current state:**
Describe what the documentation currently says or what's missing.

**What's wrong/missing:**
- Specific information that's incorrect
- Missing explanations or examples
- Confusing wording or structure

## ✅ Suggested Improvement

**What should be changed/added:**

Provide specific suggestions for how to improve the documentation:

```markdown
<!-- For content suggestions, provide the improved text -->
Suggested documentation content here...
```

**Code examples needed:**
If requesting code examples, specify what should be demonstrated:

```javascript
// Example of what kind of code sample would be helpful
const exampleApp = new Eleva("ExampleApp");

exampleApp.component("ExampleComponent", {
  setup: ({ signal }) => {
    const message = signal("Hello World");
    return { message };
  },
  template: (ctx) => `<div>{{ message.value }}</div>`
  // Show the specific feature/concept
});
```

## 🎯 Target Audience

**Who would benefit from this documentation improvement?**
- [ ] Complete beginners to Eleva.js
- [ ] Developers familiar with other frameworks
- [ ] Advanced users
- [ ] Plugin developers
- [ ] Contributors to Eleva.js
- [ ] TypeScript users
- [ ] All users

## 📚 Content Suggestions

**Structure improvements:**
- Should this be reorganized?
- Missing cross-references or navigation?
- Better categorization needed?

**Examples and tutorials:**
- What real-world examples would be helpful?
- Step-by-step tutorials needed?
- Interactive examples or demos?

**Technical depth:**
- More beginner-friendly explanations needed?
- More advanced/technical details needed?
- Better balance between concepts and implementation?

## 🌐 Related Documentation

**Cross-references:**
- Related documentation that should be linked
- Other sections that might need updates
- Dependencies on other docs

**Consistency:**
- Similar patterns used elsewhere in docs
- Terminology that should be standardized
- Formatting conventions to follow

## 📱 Format Considerations

**Where should this documentation appear?**
- [ ] Main website (elevajs.com)
- [ ] GitHub README
- [ ] JSDoc comments in source code
- [ ] TypeScript definition files
- [ ] Separate guide/tutorial
- [ ] API reference
- [ ] Examples directory
- [ ] Other: ___________

**Format preferences:**
- [ ] Written explanation
- [ ] Code examples
- [ ] Visual diagrams
- [ ] Interactive demos
- [ ] Video tutorials
- [ ] All of the above

## 🔧 Technical Requirements

**For API documentation:**
- [ ] Method signatures
- [ ] Parameter descriptions
- [ ] Return value details
- [ ] Usage examples
- [ ] TypeScript types
- [ ] Browser compatibility notes

**For guides/tutorials:**
- [ ] Prerequisites clearly stated
- [ ] Step-by-step instructions
- [ ] Expected outcomes described
- [ ] Troubleshooting section
- [ ] Next steps or related topics

## 🤝 Contribution Offer

**Can you help improve this documentation?**
- [ ] Yes, I can write the content
- [ ] Yes, I can provide examples
- [ ] Yes, I can review/test the content
- [ ] I'm reporting but can't contribute writing time

## 🔗 Related Issues

Link any related documentation issues, feature requests, or discussions here. 