/**
 * Post-processes tsc-generated type files for Agent plugin support.
 *
 * tsc regenerates types/ from JSDoc on every build, stripping any
 * hand-maintained additions. This script handles two things that
 * JSDoc alone cannot express:
 *
 * 1. Converts `export type ComponentContext = {` to
 *    `export interface ComponentContext {` in types/core/Eleva.d.ts
 *    so the type can be augmented by plugins (JSDoc @typedef always
 *    emits type aliases, which cannot be augmented via declare module).
 *
 * 2. Adds an `AgentError` interface extending `Error` (JSDoc @typedef
 *    cannot express `interface X extends Error { ... }`).
 *
 * 3. Appends `declare module "eleva"` augmentation to Agent.d.ts
 *    (module augmentation is a TypeScript-only construct with no
 *    JSDoc equivalent).
 *
 * Everything else (AgentInspectResult, AgentApi, etc.) is generated
 * by tsc from JSDoc @typedef annotations in Agent.js.
 *
 * Run as part of `build:all` between `build:types` and `build:types:bundle`.
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Bun exposes import.meta.dir; Node 21+ has import.meta.dirname;
// fall back to fileURLToPath for older Node versions.
const __dir =
  import.meta.dir ||
  import.meta.dirname ||
  dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");

// ---------------------------------------------------------------------------
// Step 1: Convert ComponentContext from type alias to interface
// ---------------------------------------------------------------------------

const elevaTypesPath = join(root, "types/core/Eleva.d.ts");
let elevaTypes = readFileSync(elevaTypesPath, "utf8");

if (elevaTypes.includes("export type ComponentContext = {")) {
  // Convert type alias to interface and fix closing `};` → `}`
  elevaTypes = elevaTypes.replace(
    /export type ComponentContext = \{([\s\S]*?)\};/,
    "export interface ComponentContext {$1}"
  );
  writeFileSync(elevaTypesPath, elevaTypes, "utf8");
  console.log("✓ ComponentContext converted to interface");
} else if (elevaTypes.includes("export interface ComponentContext {")) {
  console.log("✓ ComponentContext already an interface");
} else {
  console.warn("⚠ ComponentContext declaration not found — skipped");
}

// ---------------------------------------------------------------------------
// Step 2: Add AgentError interface (JSDoc cannot express extends Error)
// ---------------------------------------------------------------------------

const agentTypesPath = join(root, "types/plugins/Agent.d.ts");
let agentTypes = readFileSync(agentTypesPath, "utf8");

const agentErrorType = `/**
 * Extended error with a machine-readable \`code\` property.
 * All Agent plugin errors include \`.code\`; schema violations also include \`.violations\`.
 */
export interface AgentError extends Error {
    /** Machine-readable error code (e.g., "AGENT_PERMISSION_DENIED"). */
    code: string;
    /** Schema violation messages (present only on AGENT_SCHEMA_VIOLATION errors). */
    violations?: string[];
}
`;

if (!agentTypes.includes("export interface AgentError extends Error")) {
  // Insert before the AgentApi type definition
  agentTypes = agentTypes.replace(
    /\/\*\*\n \* The public API surface exposed as ctx\.agent/,
    agentErrorType + "/**\n * The public API surface exposed as ctx.agent"
  );
  console.log("✓ AgentError interface added");
} else {
  console.log("✓ AgentError already present");
}

// ---------------------------------------------------------------------------
// Step 3: Append module augmentation (no JSDoc equivalent exists)
// ---------------------------------------------------------------------------

const augmentation = `
// ---------------------------------------------------------------------------
// Module augmentation (hand-maintained, appended by scripts/augment-agent-types.js)
// When the Agent plugin is installed, these properties are added at runtime.
// ---------------------------------------------------------------------------

declare module "eleva" {
  interface Eleva {
    /** Agent instance exposed after \`app.use(AgentPlugin)\`. Undefined before install / after uninstall. */
    agent?: import("./Agent.js").AgentApi;
    /** Convenience shortcut for \`app.agent.execute()\`. Undefined before install / after uninstall. */
    agentExecute?: (name: string, payload?: unknown, scope?: string) => Promise<unknown>;
    /** Convenience shortcut for \`app.agent.dispatch()\`. Undefined before install / after uninstall. */
    agentDispatch?: (command: import("./Agent.js").AgentCommand, scope?: string) => Promise<void>;
  }

  interface ComponentContext {
    /** Agent API injected by the Agent plugin into component setup. */
    agent?: import("./Agent.js").AgentApi;
  }
}
`;

// Avoid double-appending if already present
if (!agentTypes.includes('declare module "eleva"')) {
  // Remove trailing sourcemap comment, append augmentation, re-add sourcemap
  agentTypes = agentTypes.replace(
    /\n?\/\/# sourceMappingURL=Agent\.d\.ts\.map\s*$/,
    ""
  );
  agentTypes += augmentation;
  agentTypes += "//# sourceMappingURL=Agent.d.ts.map\n";
  console.log("✓ Agent module augmentation appended");
} else {
  console.log("✓ Agent module augmentation already present");
}

writeFileSync(agentTypesPath, agentTypes, "utf8");
