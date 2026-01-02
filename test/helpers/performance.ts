/**
 * Performance measurement utilities for Eleva.js tests
 *
 * Design principles:
 * - Multiple runs for statistical validity
 * - Warm-up phase to exclude JIT compilation
 * - Outlier removal for reliable results
 * - Clear separation between test runs and operations
 */

export interface PerformanceResult<T> {
  duration: number;
  result: T;
}

export interface BenchmarkMetrics {
  /** Raw measurements in milliseconds */
  measurements: number[];
  /** Median duration (more robust than average) */
  median: number;
  /** Average duration */
  mean: number;
  /** Standard deviation */
  stdDev: number;
  /** Minimum duration */
  min: number;
  /** Maximum duration */
  max: number;
  /** Number of test runs */
  runs: number;
  /** Coefficient of variation (stdDev/mean) - lower is more consistent */
  cv: number;
}

export interface BenchmarkOptions {
  /** Number of test runs (default: 10) */
  runs?: number;
  /** Number of warm-up runs to exclude (default: 3) */
  warmupRuns?: number;
  /** Remove outliers beyond this many standard deviations (default: 2) */
  outlierThreshold?: number;
}

/**
 * Measures performance of a synchronous function
 */
export const measurePerformance = <T>(fn: () => T): PerformanceResult<T> => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return {
    duration: end - start,
    result,
  };
};

/**
 * Measures performance of an async function
 */
export const measurePerformanceAsync = async <T>(
  fn: () => Promise<T>
): Promise<PerformanceResult<T>> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return {
    duration: end - start,
    result,
  };
};

/**
 * Calculates median of an array
 */
const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

/**
 * Removes outliers beyond threshold standard deviations from mean
 */
const removeOutliers = (values: number[], threshold: number): number[] => {
  if (values.length < 4) return values; // Need enough data points

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return values.filter(
    (v) => Math.abs(v - mean) <= threshold * stdDev
  );
};

/**
 * Runs a benchmark with proper statistical methodology
 *
 * - Performs warm-up runs (excluded from results)
 * - Collects multiple measurements
 * - Removes outliers
 * - Returns comprehensive metrics
 */
export const runBenchmark = (
  fn: () => unknown,
  options: BenchmarkOptions = {}
): BenchmarkMetrics => {
  const {
    runs = 10,
    warmupRuns = 3,
    outlierThreshold = 2,
  } = options;

  // Warm-up phase (results discarded)
  for (let i = 0; i < warmupRuns; i++) {
    fn();
  }

  // Collect measurements
  const rawMeasurements: number[] = [];
  for (let i = 0; i < runs; i++) {
    const { duration } = measurePerformance(fn);
    rawMeasurements.push(duration);
  }

  // Remove outliers
  const measurements = removeOutliers(rawMeasurements, outlierThreshold);

  // Calculate statistics
  const mean = measurements.reduce((a, b) => a + b, 0) / measurements.length;
  const variance =
    measurements.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
    measurements.length;
  const stdDev = Math.sqrt(variance);
  const median = calculateMedian(measurements);
  const cv = mean > 0 ? stdDev / mean : 0;

  return {
    measurements,
    median,
    mean,
    stdDev,
    min: Math.min(...measurements),
    max: Math.max(...measurements),
    runs: measurements.length,
    cv,
  };
};

/**
 * Runs an async benchmark with proper statistical methodology
 */
export const runBenchmarkAsync = async (
  fn: () => Promise<unknown>,
  options: BenchmarkOptions = {}
): Promise<BenchmarkMetrics> => {
  const {
    runs = 10,
    warmupRuns = 3,
    outlierThreshold = 2,
  } = options;

  // Warm-up phase
  for (let i = 0; i < warmupRuns; i++) {
    await fn();
  }

  // Collect measurements
  const rawMeasurements: number[] = [];
  for (let i = 0; i < runs; i++) {
    const { duration } = await measurePerformanceAsync(fn);
    rawMeasurements.push(duration);
  }

  // Remove outliers
  const measurements = removeOutliers(rawMeasurements, outlierThreshold);

  // Calculate statistics
  const mean = measurements.reduce((a, b) => a + b, 0) / measurements.length;
  const variance =
    measurements.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
    measurements.length;
  const stdDev = Math.sqrt(variance);
  const median = calculateMedian(measurements);
  const cv = mean > 0 ? stdDev / mean : 0;

  return {
    measurements,
    median,
    mean,
    stdDev,
    min: Math.min(...measurements),
    max: Math.max(...measurements),
    runs: measurements.length,
    cv,
  };
};

/**
 * Formats duration for display
 */
export const formatDuration = (ms: number): string => {
  if (ms < 0.001) {
    return `${(ms * 1000000).toFixed(2)}ns`;
  }
  if (ms < 1) {
    return `${(ms * 1000).toFixed(2)}µs`;
  }
  if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
};

/**
 * Logs benchmark metrics to console
 */
export const logBenchmarkMetrics = (
  name: string,
  metrics: BenchmarkMetrics
): void => {
  console.log(`\n${name}:`);
  console.log("─".repeat(40));
  console.log(`  Median: ${formatDuration(metrics.median)}`);
  console.log(`  Mean:   ${formatDuration(metrics.mean)}`);
  console.log(`  StdDev: ${formatDuration(metrics.stdDev)}`);
  console.log(`  Range:  ${formatDuration(metrics.min)} - ${formatDuration(metrics.max)}`);
  console.log(`  CV:     ${(metrics.cv * 100).toFixed(1)}%`);
  console.log(`  Runs:   ${metrics.runs}`);
};

/**
 * Asserts that benchmark results are consistent (low CV)
 * CV < 0.5 (50%) is considered acceptable for micro-benchmarks
 */
export const assertConsistent = (
  metrics: BenchmarkMetrics,
  maxCV: number = 0.5
): boolean => {
  return metrics.cv <= maxCV;
};

// Legacy exports for backward compatibility
export const measureMultipleRuns = (
  fn: () => unknown,
  runs: number = 5
): BenchmarkMetrics => {
  return runBenchmark(fn, { runs, warmupRuns: 1 });
};

export const logPerformanceMetrics = (metrics: BenchmarkMetrics): void => {
  console.log("\nPerformance Metrics:");
  console.log("-------------------");
  console.log(`Median: ${formatDuration(metrics.median)}`);
  console.log(`Mean: ${formatDuration(metrics.mean)}`);
  console.log(`Standard Deviation: ${formatDuration(metrics.stdDev)}`);
  console.log(`Min: ${formatDuration(metrics.min)}`);
  console.log(`Max: ${formatDuration(metrics.max)}`);
};
