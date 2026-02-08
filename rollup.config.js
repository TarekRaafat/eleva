import { nodeResolve } from "@rollup/plugin-node-resolve";
import { swc, minify } from "rollup-plugin-swc3";
import { codecovRollupPlugin } from "@codecov/rollup-plugin";
import pkg from "./package.json" with { type: "json" };

// Import plugins to get their versions
import { AttrPlugin } from "./src/plugins/Attr.js";
import { RouterPlugin } from "./src/plugins/Router.js";
import { StorePlugin } from "./src/plugins/Store.js";
import { AgentPlugin } from "./src/plugins/Agent.js";

const name = "Eleva";

// Create specific banners for different outputs
const createBanner = (bundleName, version = pkg.version) =>
  `/*! ${bundleName} v${version} | ${pkg.license} License | ${pkg.homepage} */`;

const coreBanner = createBanner("Eleva");
const pluginsBanner = createBanner("Eleva Plugins");
const attrPluginBanner = createBanner("Eleva Attr Plugin", AttrPlugin.version);
const routerPluginBanner = createBanner(
  "Eleva Router Plugin",
  RouterPlugin.version
);
const storePluginBanner = createBanner(
  "Eleva Store Plugin",
  StorePlugin.version
);
const agentPluginBanner = createBanner(
  "Eleva Agent Plugin",
  AgentPlugin.version
);

// SWC minify configuration - optimized for smallest output
const swcMinifyConfig = {
  sourceMap: true,
  compress: {
    passes: 3,
    drop_console: true,
    drop_debugger: true,
    pure_funcs: ["console.log", "console.warn", "console.info"],
    unsafe_arrows: true,
    unsafe_methods: true,
    keep_fargs: false,
    toplevel: true,
    pure_getters: true,
    reduce_vars: true,
    collapse_vars: true,
    dead_code: true,
    inline: 3,
    evaluate: true,
    hoist_funs: true,
    sequences: true,
    conditionals: true,
  },
  mangle: {
    toplevel: true,
  },
  format: {
    comments: false,
  },
};

// SWC transform configuration
const swcConfig = {
  jsc: {
    parser: {
      syntax: "ecmascript",
    },
    target: "es2020",
    loose: true,
  },
  minify: false,
  sourceMaps: true,
};

const commonPlugins = [
  nodeResolve({
    browser: true,
  }),
  swc(swcConfig),
];

// Core framework configurations
const coreEsmConfig = {
  input: "src/index.js",
  output: [
    {
      sourcemap: true,
      banner: coreBanner,
      file: "./dist/eleva.js",
      format: "es",
    },
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
    annotations: true,
    unknownGlobalSideEffects: false,
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

const coreCjsConfig = {
  input: "src/index.cjs",
  output: [
    {
      name,
      sourcemap: true,
      banner: coreBanner,
      file: "./dist/eleva.cjs",
      format: "cjs",
      exports: "default",
    },
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
    annotations: true,
    unknownGlobalSideEffects: false,
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

const coreUmdConfig = {
  input: "src/index.cjs",
  output: [
    {
      name,
      sourcemap: true,
      banner: coreBanner,
      file: "./dist/eleva.umd.js",
      format: "umd",
      exports: "default",
    },
    {
      name,
      sourcemap: true,
      banner: coreBanner,
      file: "./dist/eleva.umd.min.js",
      format: "umd",
      exports: "default",
      plugins: [minify(swcMinifyConfig)],
    },
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
    annotations: true,
    unknownGlobalSideEffects: false,
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

// Plugin configuration (consolidated for backward compatibility)
const pluginConfig = {
  input: "src/plugins/index.js",
  output: [
    {
      name: "ElevaPlugins",
      sourcemap: true,
      banner: pluginsBanner,
      file: "./dist/eleva-plugins.cjs",
      format: "cjs",
      exports: "named",
    },
    {
      sourcemap: true,
      banner: pluginsBanner,
      file: "./dist/eleva-plugins.js",
      format: "es",
      exports: "named",
    },
    {
      name: "ElevaPlugins",
      sourcemap: true,
      banner: pluginsBanner,
      file: "./dist/eleva-plugins.umd.js",
      format: "umd",
    },
    {
      name: "ElevaPlugins",
      sourcemap: true,
      banner: pluginsBanner,
      file: "./dist/eleva-plugins.umd.min.js",
      format: "umd",
      plugins: [minify(swcMinifyConfig)],
    },
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
    annotations: true,
    unknownGlobalSideEffects: false,
  },
  plugins: [
    ...commonPlugins,
    codecovRollupPlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "ElevaPlugins",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
};

// Individual plugin configurations for ESM and CJS (named exports preserved)
const createIndividualPluginConfig = (pluginName, inputFile, banner) => ({
  input: inputFile,
  output: [
    {
      sourcemap: true,
      banner: banner,
      file: `./dist/plugins/${pluginName.toLowerCase()}.js`,
      format: "es",
    },
    {
      sourcemap: true,
      banner: banner,
      file: `./dist/plugins/${pluginName.toLowerCase()}.cjs`,
      format: "cjs",
      exports: "named",
    },
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
    annotations: true,
    unknownGlobalSideEffects: false,
  },
  plugins: [
    ...commonPlugins,
    codecovRollupPlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: `Eleva${pluginName}`,
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
});

// Individual plugin UMD configurations (default export → direct global)
const createIndividualPluginUmdConfig = (pluginName, umdInputFile, banner) => ({
  input: umdInputFile,
  output: [
    {
      name: `Eleva${pluginName}`,
      sourcemap: true,
      banner: banner,
      file: `./dist/plugins/${pluginName.toLowerCase()}.umd.js`,
      format: "umd",
      exports: "default",
    },
    {
      name: `Eleva${pluginName}`,
      sourcemap: true,
      banner: banner,
      file: `./dist/plugins/${pluginName.toLowerCase()}.umd.min.js`,
      format: "umd",
      exports: "default",
      plugins: [minify(swcMinifyConfig)],
    },
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
    annotations: true,
    unknownGlobalSideEffects: false,
  },
  plugins: [
    ...commonPlugins,
    codecovRollupPlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: `Eleva${pluginName}`,
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
});

// Individual plugin builds — ESM/CJS (named exports)
const attrPluginConfig = createIndividualPluginConfig(
  "Attr",
  "src/plugins/Attr.js",
  attrPluginBanner
);

const routerPluginConfig = createIndividualPluginConfig(
  "Router",
  "src/plugins/Router.js",
  routerPluginBanner
);

const storePluginConfig = createIndividualPluginConfig(
  "Store",
  "src/plugins/Store.js",
  storePluginBanner
);

const agentPluginConfig = createIndividualPluginConfig(
  "Agent",
  "src/plugins/Agent.js",
  agentPluginBanner
);

// Individual plugin builds — UMD (default export → direct global)
const attrPluginUmdConfig = createIndividualPluginUmdConfig(
  "Attr",
  "src/plugins/umd/attr.js",
  attrPluginBanner
);

const routerPluginUmdConfig = createIndividualPluginUmdConfig(
  "Router",
  "src/plugins/umd/router.js",
  routerPluginBanner
);

const storePluginUmdConfig = createIndividualPluginUmdConfig(
  "Store",
  "src/plugins/umd/store.js",
  storePluginBanner
);

const agentPluginUmdConfig = createIndividualPluginUmdConfig(
  "Agent",
  "src/plugins/umd/agent.js",
  agentPluginBanner
);

// Export all configurations
export default [
  coreEsmConfig,
  coreCjsConfig,
  coreUmdConfig,
  pluginConfig,
  attrPluginConfig,
  routerPluginConfig,
  storePluginConfig,
  agentPluginConfig,
  attrPluginUmdConfig,
  routerPluginUmdConfig,
  storePluginUmdConfig,
  agentPluginUmdConfig,
];
