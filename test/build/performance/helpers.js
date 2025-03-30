/**
 * Performance measurement utilities for build tests
 */

export const measurePerformance = (fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return {
    duration: end - start,
    result,
  };
};

export const measureMultipleRuns = (fn, runs = 5) => {
  const measurements = [];

  for (let i = 0; i < runs; i++) {
    const { duration } = measurePerformance(fn);
    measurements.push(duration);
  }

  const average = measurements.reduce((a, b) => a + b, 0) / runs;
  const variance =
    measurements.reduce((a, b) => a + Math.pow(b - average, 2), 0) / runs;
  const stdDev = Math.sqrt(variance);

  return {
    measurements,
    average,
    stdDev,
    min: Math.min(...measurements),
    max: Math.max(...measurements),
  };
};

export const formatDuration = (ms) => {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(2)}µs`;
  }
  return `${ms.toFixed(2)}ms`;
};

export const logPerformanceMetrics = (metrics) => {
  console.log("\nPerformance Metrics:");
  console.log("-------------------");
  console.log(`Average: ${formatDuration(metrics.average)}`);
  console.log(`Standard Deviation: ${formatDuration(metrics.stdDev)}`);
  console.log(`Min: ${formatDuration(metrics.min)}`);
  console.log(`Max: ${formatDuration(metrics.max)}`);
  console.log("\nIndividual Measurements:");
  metrics.measurements.forEach((duration, index) => {
    console.log(`Run ${index + 1}: ${formatDuration(duration)}`);
  });
};
