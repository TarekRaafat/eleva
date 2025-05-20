import { babel } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { codecovRollupPlugin } from "@codecov/rollup-plugin";
import pkg from "./package.json" with { type: "json" };

const name = "Eleva";
const banner = `/*! ${name} v${pkg.version} | ${pkg.license} License | ${pkg.homepage} */`;

const commonOutputConfig = {
  name,
  sourcemap: true,
  banner,
};

const commonPlugins = [
  nodeResolve({
    browser: true,
  }),
  babel({
    babelHelpers: "bundled",
    exclude: "node_modules/**",
    presets: [
      [
        "@babel/preset-env",
        {
          targets: pkg.browserslist,
          bugfixes: true,
          loose: true,
          modules: false,
          useBuiltIns: false,
          corejs: false,
        },
      ],
    ],
  }),
];

// Rollup configuration for building the Eleva.js library
export default {
  input: "src/index.js",
  output: [
    {
      ...commonOutputConfig,
      file: "./dist/eleva.cjs.js",
      format: "cjs",
      exports: "default",
    },
    {
      ...commonOutputConfig,
      file: "./dist/eleva.esm.js",
      format: "es",
      exports: "default",
    },
    {
      ...commonOutputConfig,
      file: "./dist/eleva.umd.js",
      format: "umd",
    },
    {
      ...commonOutputConfig,
      file: "./dist/eleva.umd.min.js",
      format: "umd",
      plugins: [terser()],
    },
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
  },
  plugins: [
    ...commonPlugins,
    codecovRollupPlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: name,
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
};
