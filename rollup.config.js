import { babel } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import { codecovRollupPlugin } from "@codecov/rollup-plugin";

const name = "Eleva";

// Rollup configuration for building the Eleva.js library
export default {
  input: "src/index.js",
  context: "window",
  output: [
    {
      file: "dist/eleva.umd.js",
      format: "umd",
      name: name,
      exports: "default",
      sourcemap: true,
    },
    {
      file: "dist/eleva.esm.js",
      format: "es",
      name: name,
      exports: "default",
      sourcemap: true,
    },
    {
      file: "dist/eleva.min.js",
      format: "umd",
      name: name,
      exports: "default",
      sourcemap: true,
      plugins: [
        terser({
          compress: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            warnings: false,
          },
          mangle: {
            properties: {
              regex: /^_/,
            },
          },
        }),
      ],
    },
  ],
  plugins: [
    nodeResolve({
      mainFields: ["module", "main"],
      preferBuiltins: false,
    }),
    commonjs({
      include: "node_modules/**",
    }),
    babel({
      babelHelpers: "bundled",
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
      exclude: "node_modules/**",
    }),
    codecovRollupPlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: name,
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
};
