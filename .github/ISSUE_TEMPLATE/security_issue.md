---
name: 🔒 Security Issue
about: Report a security vulnerability in Eleva.js (use responsibly)
title: "[SECURITY] "
labels: security, needs-triage
assignees: ''

---

## ⚠️ Security Notice

**IMPORTANT:** If this is a critical security vulnerability that could affect users in production, please consider reporting it privately first by emailing [support@elevajs.com](mailto:support@elevajs.com) before creating a public issue.

For less critical security concerns or general security improvements, you can use this public template.

## 🔒 Security Issue Type

**What type of security issue is this?**
- [ ] Template injection vulnerability
- [ ] XSS (Cross-Site Scripting) potential
- [ ] Code injection vulnerability
- [ ] DOM manipulation security flaw
- [ ] Plugin security concern
- [ ] Build process security issue
- [ ] Dependency security vulnerability
- [ ] Information disclosure
- [ ] Security best practices improvement
- [ ] Other: ___________

## 🎯 Impact Assessment

**Severity Level:**
- [ ] Critical - Immediate threat to all users
- [ ] High - Significant risk with easy exploitation
- [ ] Medium - Moderate risk requiring specific conditions
- [ ] Low - Minor security concern or hardening opportunity

**Affected Components:**
- [ ] Core Eleva.js framework
- [ ] Template engine
- [ ] Signal system
- [ ] Event handling
- [ ] Plugin system
- [ ] TypeScript definitions
- [ ] Build tools/process
- [ ] Documentation examples
- [ ] Other: ___________

## 🔍 Vulnerability Details

**Description:**
Provide a clear description of the security issue:

**Attack Vector:**
How could this vulnerability be exploited?

**Prerequisites:**
What conditions are needed for exploitation?
- User input requirements
- Specific configuration needed
- Browser/environment dependencies

## 🧪 Proof of Concept

**Minimal reproduction:**

⚠️ **Please be responsible with proof-of-concept code. Do not include actual malicious payloads.**

```javascript
// Safe example demonstrating the vulnerability concept
const vulnerableApp = new Eleva("VulnerableApp");

vulnerableApp.component("VulnerableComponent", {
  setup: ({ signal }) => {
    const userInput = signal("<!-- Safe example of problematic input -->");
    return { userInput };
  },
  template: (ctx) => `
    <!-- Template that could be exploited -->
    <div>{{ userInput.value }}</div>
  `
});
```

**Steps to reproduce:**
1. Step 1
2. Step 2
3. Step 3

## 🛡️ Expected Security Behavior

**What should happen instead?**
Describe how the framework should securely handle the situation:

## 💡 Suggested Solutions

**Possible fixes or mitigations:**
- [ ] Input sanitization
- [ ] Output escaping
- [ ] Content Security Policy (CSP) improvements
- [ ] Template compilation security
- [ ] API validation
- [ ] Documentation improvements
- [ ] Other: ___________

**Implementation suggestions:**
If you have ideas for how to fix this, please describe them:

## 🌍 Environment Details

**Affected versions:**
- **Framework version(s):** [e.g., 1.0.0, all versions]
- **Browser(s):** [e.g., All browsers, Chrome 139+]
- **Module format:** [e.g., All formats, UMD only]

**Testing environment:**
- Operating system
- Browser versions tested
- Any specific configuration

## 📊 Risk Assessment

**Who is affected?**
- [ ] All Eleva.js users
- [ ] Users with specific configurations
- [ ] Users processing user-generated content
- [ ] Plugin developers
- [ ] Applications with specific features
- [ ] Other: ___________

**Real-world impact:**
- Could this be exploited in typical applications?
- What damage could an attacker cause?
- Are there any known instances of exploitation?

## 🔧 Temporary Workarounds

**Are there any workarounds users can implement while waiting for a fix?**

```javascript
// Example of a temporary workaround
const saferApp = new Eleva("SaferApp");

saferApp.component("SaferComponent", {
  setup: ({ signal }) => {
    // Workaround implementation
    const safeData = signal("safe content");
    return { safeData };
  },
  template: (ctx) => `<div>{{ safeData.value }}</div>`
});
```

## 📚 Security Standards

**Relevant security standards or best practices:**
- OWASP guidelines
- Web security standards
- Framework security patterns
- Industry best practices

## 🤝 Responsible Disclosure

**Timeline expectations:**
- When did you discover this issue?
- Have you shared this information with anyone else?
- Do you plan to publish details publicly?

**Credit preferences:**
If you'd like to be credited for the discovery, please specify how:

## 🔗 Related Security Issues

Link any related security discussions or issues here.

---

**Thank you for helping keep Eleva.js secure! 🙏** 