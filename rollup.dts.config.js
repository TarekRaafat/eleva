import dts from "rollup-plugin-dts";

export default [
  // Core types - ESM (.d.ts) and CJS (.d.cts)
  {
    input: "types/index.d.ts",
    output: [
      {
        file: "dist/eleva.d.ts",
        format: "es",
        sourcemap: true,
      },
      {
        file: "dist/eleva.d.cts",
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: [dts()],
  },
  // Plugin types - ESM (.d.ts) and CJS (.d.cts)
  {
    input: "types/plugins/index.d.ts",
    output: [
      {
        file: "dist/eleva-plugins.d.ts",
        format: "es",
        sourcemap: true,
      },
      {
        file: "dist/eleva-plugins.d.cts",
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: [dts()],
  },
  // Individual plugin types - Attr
  {
    input: "types/plugins/Attr.d.ts",
    output: [
      {
        file: "dist/plugins/attr.d.ts",
        format: "es",
        sourcemap: true,
      },
      {
        file: "dist/plugins/attr.d.cts",
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: [dts()],
  },
  // Individual plugin types - Router
  {
    input: "types/plugins/Router.d.ts",
    output: [
      {
        file: "dist/plugins/router.d.ts",
        format: "es",
        sourcemap: true,
      },
      {
        file: "dist/plugins/router.d.cts",
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: [dts()],
  },
  // Individual plugin types - Store
  {
    input: "types/plugins/Store.d.ts",
    output: [
      {
        file: "dist/plugins/store.d.ts",
        format: "es",
        sourcemap: true,
      },
      {
        file: "dist/plugins/store.d.cts",
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: [dts()],
  },
];
