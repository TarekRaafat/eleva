---
name: ⚡ Performance Issue
about: Report a performance problem or degradation in Eleva.js
title: "[PERF] "
labels: performance, needs-triage
assignees: ''

---

## ⚡ Performance Issue Description

A clear and concise description of the performance problem you're experiencing.

## 📊 Performance Impact

**What type of performance issue are you experiencing?**

- [ ] Slow component rendering
- [ ] Memory leaks
- [ ] High CPU usage
- [ ] Slow reactivity/signal updates
- [ ] Large bundle size
- [ ] Slow DOM updates/diffing
- [ ] Plugin performance issues
- [ ] Other: ___________

**Severity:**
- [ ] Critical - Application unusable
- [ ] High - Significantly impacts user experience
- [ ] Medium - Noticeable but manageable
- [ ] Low - Minor performance concern

## 🔬 Reproducible Test Case

**Framework Version:** [e.g., 1.0.0]

**Environment:**
- **Browser(s) and Version(s):** [e.g., Chrome 139, Firefox 140]
- **Operating System:** [e.g., macOS 15.5, Windows 11]
- **Device/Hardware:** [e.g., MacBook Pro M1, Windows Desktop i7]
- **Module Format:** [e.g., ESM, CJS, UMD]

**Code Example:**

```javascript
// Minimal code that demonstrates the performance issue
const slowComponent = {
  setup: ({ signal }) => {
    const data = signal([]);
    return { data };
  },
  template: (ctx) => `
    <!-- Your template that causes performance issues -->
    <div>{{ data.value.length }} items</div>
  `
};

// Steps to reproduce the performance problem:
// 1. 
// 2. 
// 3. 
```

**Or provide a link to a performance test case (CodePen, JSFiddle, GitHub repo)**

## 📈 Performance Measurements

**Before/After metrics (if available):**

- **Rendering time:** [e.g., 150ms → 500ms]
- **Memory usage:** [e.g., 50MB → 200MB]
- **Bundle size impact:** [e.g., +20KB after change]
- **FPS/frame rate:** [e.g., 60fps → 30fps]

**Browser DevTools measurements:**
- Performance tab screenshots
- Memory snapshots
- Coverage reports (if relevant)

**Benchmarking results:**
```
Include any benchmark results, timing data, or profiling information
```

## 🔄 Expected Performance

What performance characteristics did you expect?

- **Expected rendering time:** [e.g., <100ms]
- **Expected memory usage:** [e.g., <100MB]
- **Expected behavior:** [Description]

## 🔍 Investigation Details

**Have you identified the cause?**
- [ ] Signal reactivity performance
- [ ] Template engine parsing
- [ ] DOM diffing/patching
- [ ] Event handling
- [ ] Component lifecycle
- [ ] Plugin-related
- [ ] Large dataset handling
- [ ] Not sure

**Performance profiling data:**
If you've done any profiling, please share:
- Browser DevTools performance recordings
- Memory heap snapshots  
- Custom benchmarking results

## 📱 Device/Browser Comparison

**Does this affect:**
- [ ] All browsers
- [ ] Specific browsers: ___________
- [ ] All devices
- [ ] Specific device types: ___________
- [ ] All module formats
- [ ] Specific module format: ___________

## 🛠️ Workarounds

Have you found any workarounds or optimizations that help?

## 🎯 Performance Expectations

**For context, what are your performance requirements?**
- Target render time: ___________
- Max memory usage: ___________
- Target device/browser support: ___________
- Bundle size constraints: ___________

## 🔗 Related Issues

Link any related performance issues or discussions here. 