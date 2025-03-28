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
      plugins: [terser()],
    },
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    babel({
      babelHelpers: "bundled",
      presets: [
        [
          "@babel/preset-env",
          {
            targets: "> 0.25%, not dead",
            bugfixes: true,
            loose: true,
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
