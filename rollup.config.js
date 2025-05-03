import { babel } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import { codecovRollupPlugin } from "@codecov/rollup-plugin";
import pkg from "./package.json" with { type: "json" };

const name = "Eleva";
const banner = `/*! ${name} v${pkg.version} | ${pkg.license} License | ${pkg.homepage} */`;

// Rollup configuration for building the Eleva.js library
export default {
  input: "src/index.js",
  context: "window",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      sourcemap: true,
      exports: "default",
      banner,
    },
    {
      file: pkg.module,
      format: "es",
      sourcemap: true,
      exports: "default",
      banner,
    },
    {
      file: pkg.umd,
      format: "umd",
      name: name,
      sourcemap: true,
      exports: "default",
      banner,
    },
    {
      file: pkg.browser,
      format: "umd",
      name: name,
      sourcemap: true,
      plugins: [terser()],
      banner,
    },
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
      presets: [
        [
          "@babel/preset-env",
          {
            targets: "> 0.25%, not dead, not op_mini all, not ie 11",
            bugfixes: true,
            loose: true,
            modules: false,
          },
        ],
      ],
    }),
    codecovRollupPlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: name,
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
};
