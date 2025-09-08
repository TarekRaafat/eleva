import { babel } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { codecovRollupPlugin } from "@codecov/rollup-plugin";
import pkg from "./package.json" with { type: "json" };

// Import plugins to get their versions
import { AttrPlugin } from "./src/plugins/Attr.js";
import { RouterPlugin } from "./src/plugins/Router.js";
import { PropsPlugin } from "./src/plugins/Props.js";

const name = "Eleva";

// Create specific banners for different outputs
const createBanner = (bundleName, version = pkg.version) =>
  `/*! ${bundleName} v${version} | ${pkg.license} License | ${pkg.homepage} */`;

const coreBanner = createBanner("Eleva");
const pluginsBanner = createBanner("Eleva Plugins");
const attrPluginBanner = createBanner("Eleva Attr Plugin", AttrPlugin.version);
const routerPluginBanner = createBanner("Eleva Router Plugin", RouterPlugin.version);
const propsPluginBanner = createBanner("Eleva Props Plugin", PropsPlugin.version);



const terserConfig = {
  compress: {
    passes: 2,
    drop_console: true,
    drop_debugger: true,
    pure_funcs: ["console.log", "console.warn"],
    unsafe_arrows: true,
    unsafe_methods: true,
    unsafe_proto: true,
    keep_fargs: false,
    toplevel: true,
    pure_getters: true,
    reduce_vars: true,
    collapse_vars: true,
  },
  mangle: {
    toplevel: true,
  },
  format: {
    comments: /^!/,
  },
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
          spec: false,
          forceAllTransforms: false,
        },
      ],
    ],
  }),
];

// Core framework configuration
const coreConfig = {
  input: "src/index.js",
  output: [
    {
      name,
      sourcemap: true,
      banner: coreBanner,
      file: "./dist/eleva.cjs.js",
      format: "cjs",
      exports: "default",
    },
    {
      name,
      sourcemap: true,
      banner: coreBanner,
      file: "./dist/eleva.esm.js",
      format: "es",
      exports: "default",
    },
    {
      name,
      sourcemap: true,
      banner: coreBanner,
      file: "./dist/eleva.umd.js",
      format: "umd",
    },
    {
      name,
      sourcemap: true,
      banner: coreBanner,
      file: "./dist/eleva.umd.min.js",
      format: "umd",
      plugins: [terser(terserConfig)],
    },
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
    annotations: false,
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
      file: "./dist/eleva-plugins.cjs.js",
      format: "cjs",
      exports: "named",
    },
    {
      name: "ElevaPlugins",
      sourcemap: true,
      banner: pluginsBanner,
      file: "./dist/eleva-plugins.esm.js",
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
      plugins: [terser(terserConfig)],
    },
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
    annotations: false,
    unknownGlobalSideEffects: false,
    // Enable more aggressive tree-shaking for plugins
    pureExternalModules: true,
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

// Individual plugin configurations for CDN usage
const createIndividualPluginConfig = (pluginName, inputFile, banner) => ({
  input: inputFile,
  output: [
    {
      name: `Eleva${pluginName}Plugin`,
      sourcemap: true,
      banner: banner,
      file: `./dist/plugins/${pluginName.toLowerCase()}.umd.js`,
      format: "umd",
    },
    {
      name: `Eleva${pluginName}Plugin`,
      sourcemap: true,
      banner: banner,
      file: `./dist/plugins/${pluginName.toLowerCase()}.umd.min.js`,
      format: "umd",
      plugins: [terser(terserConfig)],
    },
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
    annotations: false,
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

// Individual plugin builds for CDN
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

const propsPluginConfig = createIndividualPluginConfig(
  "Props",
  "src/plugins/Props.js",
  propsPluginBanner
);

// Export all configurations
export default [
  coreConfig,
  pluginConfig,
  attrPluginConfig,
  routerPluginConfig,
  propsPluginConfig,
];
