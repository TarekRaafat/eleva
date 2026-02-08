export namespace AgentPlugin {
    let name: string;
    let version: string;
    let description: string;
    /**
     * Installs the Agent plugin into the Eleva instance.
     *
     * @public
     * @param {Eleva} eleva - The Eleva instance.
     * @param {AgentOptions} options - Plugin configuration options.
     * @returns {void}
     * @description
     * Creates an internal Agent instance and wraps `eleva.mount` and
     * `eleva._mountComponents` to inject `ctx.agent` into every component's
     * setup function. Hooks into `eleva.emitter` for cross-plugin audit log
     * capture. Exposes the agent instance and convenience methods on the
     * Eleva instance.
     *
     * @example
     * // Basic installation
     * app.use(AgentPlugin);
     *
     * // With options
     * app.use(AgentPlugin, {
     *   maxLogSize: 200,
     *   enableInspection: true,
     *   onError: (err, ctx) => console.error(ctx, err),
     *   actions: { ping: () => "pong" },
     *   permissions: { "my-agent": { actions: ["ping"] } },
     *   emitterEvents: ["store:", "router:"]
     * });
     */
    function install(eleva: Eleva, options?: AgentOptions): void;
    /**
     * Uninstalls the Agent plugin from the Eleva instance.
     *
     * @public
     * @param {Eleva} eleva - The Eleva instance.
     * @returns {void}
     * @description
     * Restores the original Eleva methods, emitter hooks, and removes all
     * plugin-specific functionality including the agent instance and
     * convenience methods.
     *
     * @example
     * AgentPlugin.uninstall(app);
     */
    function uninstall(eleva: Eleva): void;
}
export { AgentPlugin as Agent };
/**
 * Type imports from the Eleva core library.
 */
export type Eleva = import("eleva").Eleva;
/**
 * Type imports from the Eleva core library.
 */
export type ComponentDefinition = import("eleva").ComponentDefinition;
/**
 * Type imports from the Eleva core library.
 */
export type ComponentContext = import("eleva").ComponentContext;
/**
 * Type imports from the Eleva core library.
 */
export type SetupResult = import("eleva").SetupResult;
/**
 * Type imports from the Eleva core library.
 */
export type ComponentProps = import("eleva").ComponentProps;
/**
 * Type imports from the Eleva core library.
 */
export type ChildrenMap = import("eleva").ChildrenMap;
/**
 * Type imports from the Eleva core library.
 */
export type MountResult = import("eleva").MountResult;
/**
 * Audit log entry recorded for actions, commands, and emitter events.
 */
export type AgentLogEntry = {
    /**
     *           The category of the log entry.
     */
    type: "action" | "command" | "event";
    /**
     *           The action name, command type, or emitter event name.
     */
    action: string;
    /**
     *           The data associated with the entry.
     */
    payload: unknown;
    /**
     *           Unix timestamp of when the entry was recorded.
     */
    timestamp: number;
    /**
     *           The originating context (e.g., "global").
     */
    source: string;
    /**
     * The value returned by the handler (action entries only).
     * Absent on command/event entries and when the handler throws.
     */
    result?: unknown;
    /**
     * The error message if the handler threw (action/command entries).
     * Absent when the handler succeeds and on event entries.
     */
    error?: string | undefined;
    /**
     * Wall-clock execution time in milliseconds (action/command entries).
     * Absent on event entries.
     */
    durationMs?: number | undefined;
};
/**
 * Filter options for querying the audit log.
 */
export type AgentLogFilter = {
    /**
     * Filter by log entry type.
     */
    type?: "action" | "command" | "event" | undefined;
    /**
     * Filter entries after this timestamp.
     */
    since?: number | undefined;
    /**
     * Filter by action/event name.
     */
    action?: string | undefined;
    /**
     * Filter by outcome: "ok" = entries without error, "error" = entries with error.
     */
    status?: "error" | "ok" | undefined;
};
/**
 * Action schema describing the contract for a registered action.
 */
export type AgentActionSchema = {
    /**
     * Expected input payload shape (key -> type name).
     */
    input?: Record<string, string> | undefined;
    /**
     * Expected return type name.
     */
    output?: string | undefined;
    /**
     * Known error codes this action can produce.
     */
    errors?: string[] | undefined;
};
/**
 * Permission rules for capability-based access control.
 */
export type AgentPermissionRule = {
    /**
     * Allowed action names.
     */
    actions?: string[] | undefined;
    /**
     * Allowed command types.
     */
    commands?: string[] | undefined;
};
/**
 * Agent plugin configuration options.
 */
export type AgentOptions = {
    /**
     * Maximum number of audit log entries (default: 100).
     */
    maxLogSize?: number | undefined;
    /**
     * Enable component tree inspection (default: true).
     */
    enableInspection?: boolean | undefined;
    /**
     * Custom error handler function.
     */
    onError?: AgentErrorHandler | undefined;
    /**
     * Pre-registered action handlers.
     */
    actions?: Record<string, Function> | undefined;
    /**
     * Capability-based access control per scope.
     */
    permissions?: Record<string, AgentPermissionRule> | undefined;
    /**
     * Emitter event prefixes to capture in the audit log
     * (e.g., ["store:", "router:"]). Empty array disables capture.
     */
    emitterEvents?: string[] | undefined;
    /**
     * When true, scope is mandatory for execute/dispatch and calls
     * without a scope are denied. Default: false (scope is optional
     * and calls without it are unrestricted).
     */
    strictPermissions?: boolean | undefined;
    /**
     * When true, `execute()` validates the payload against the action's
     * schema before calling the handler. Missing required input fields
     * throw a schema violation error. Default: false.
     */
    validateSchemas?: boolean | undefined;
};
/**
 * Custom error handler for the agent plugin.
 */
export type AgentErrorHandler = (error: Error, context: AgentErrorContext) => void;
/**
 * Structured error context passed to the onError callback.
 */
export type AgentErrorContext = {
    /**
     *           The method that generated the error. Only "execute" and "dispatch" call onError.
     */
    method: "execute" | "dispatch";
    /**
     *           Machine-readable error code (e.g., "AGENT_PERMISSION_DENIED").
     */
    code: string;
    /**
     * The action name involved (if applicable).
     */
    action?: string | undefined;
    /**
     * The scope involved (if applicable).
     */
    scope?: string | undefined;
    /**
     * The command type involved (if applicable).
     */
    commandType?: string | undefined;
};
/**
 * Capability manifest describing all available agent features for a given scope.
 * Returned by `agent.describe(scope?)`.
 */
export type AgentCapabilityManifest = {
    /**
     *           All registered actions with their schemas and scope-based access.
     */
    actions: Array<{
        name: string;
        schema: AgentActionSchema | null;
        allowed: boolean;
    }>;
    /**
     *           All registered command types.
     */
    commands: string[];
    /**
     *           The resolved permission rules for the requested scope, or null if no scope.
     */
    permissions: {
        scope: string | null;
        actions: string[];
        commands: string[];
    } | null;
    /**
     *           Current agent configuration.
     */
    config: {
        strictPermissions: boolean;
        maxLogSize: number;
        inspectionEnabled: boolean;
        validateSchemas: boolean;
    };
};
/**
 * Command object dispatched through the command bus.
 */
export type AgentCommand = {
    /**
     *           The command type identifier.
     */
    type: string;
    /**
     * Optional target component or agent.
     */
    target?: string | undefined;
    /**
     * Optional data payload.
     */
    payload?: unknown;
};
/**
 * Snapshot of the current application state.
 */
export type AgentSnapshot = {
    /**
     *           When the snapshot was taken.
     */
    timestamp: number;
    /**
     *           Registered component information.
     */
    components: Array<{
        name: string;
        hasSetup: boolean;
        hasChildren: boolean;
    }>;
    /**
     *           Installed plugin names.
     */
    plugins: string[];
};
/**
 * Diff result comparing two snapshots.
 */
export type AgentDiffResult = {
    /**
     *           Component names present in snapshot B but not A.
     */
    added: string[];
    /**
     *           Component names present in snapshot A but not B.
     */
    removed: string[];
};
/**
 * Descriptor returned by describeAction for agent introspection.
 */
export type AgentActionDescriptor = {
    /**
     *           The action name.
     */
    name: string;
    /**
     *           The action's contract schema, or null if none was provided.
     */
    schema: AgentActionSchema | null;
};
/**
 * Result returned by `agent.inspect()` describing the component registry.
 */
export type AgentInspectResult = {
    /**
     *           Registered component information with setup, template, children, and style flags.
     */
    components: Array<{
        name: string;
        hasSetup: boolean;
        hasTemplate: boolean;
        hasChildren: boolean;
        hasStyle: boolean;
    }>;
};
/**
 * Extended error with a machine-readable `code` property.
 * All Agent plugin errors include `.code`; schema violations also include `.violations`.
 */
export type AgentErrorFields = {
    /**
     *           Machine-readable error code (e.g., "AGENT_PERMISSION_DENIED").
     */
    code: string;
    /**
     * Schema violation messages (present only on AGENT_SCHEMA_VIOLATION errors).
     */
    violations?: string[] | undefined;
};
/**
 * Extended error with a machine-readable `code` property.
 * All Agent plugin errors include `.code`; schema violations also include `.violations`.
 */
export interface AgentError extends Error {
    /** Machine-readable error code (e.g., "AGENT_PERMISSION_DENIED"). */
    code: string;
    /** Schema violation messages (present only on AGENT_SCHEMA_VIOLATION errors). */
    violations?: string[];
}
/**
 * The public API surface exposed as ctx.agent in components.
 */
export type AgentApi = {
    register: (name: string, handler: Function, schema?: AgentActionSchema) => void;
    unregister: (name: string) => void;
    execute: (name: string, payload?: unknown, scope?: string) => Promise<unknown>;
    executeBatch: (actions: Array<{
        action: string;
        payload?: unknown;
    }>, scope?: string) => Promise<unknown[]>;
    executeSequence: (actions: Array<{
        action: string;
        payload?: unknown;
    }>, scope?: string) => Promise<unknown>;
    hasAction: (name: string) => boolean;
    describeAction: (name: string) => AgentActionDescriptor | null;
    listActions: () => AgentActionDescriptor[];
    describe: (scope?: string) => AgentCapabilityManifest;
    dispatch: (command: AgentCommand, scope?: string) => Promise<void>;
    onCommand: (type: string, handler: Function) => () => void;
    getLog: (filter?: AgentLogFilter) => AgentLogEntry[];
    clearLog: () => void;
    actionCount: import("../modules/Signal.js").Signal<number>;
    lastActivity: import("../modules/Signal.js").Signal<AgentLogEntry | null>;
    inspect?: (() => AgentInspectResult) | undefined;
    snapshot?: (() => AgentSnapshot) | undefined;
    diff?: ((a: AgentSnapshot, b: AgentSnapshot) => AgentDiffResult) | undefined;
};
// ---------------------------------------------------------------------------
// Module augmentation (hand-maintained, appended by scripts/augment-agent-types.js)
// When the Agent plugin is installed, these properties are added at runtime.
// ---------------------------------------------------------------------------

declare module "eleva" {
  interface Eleva {
    /** Agent instance exposed after `app.use(AgentPlugin)`. Undefined before install / after uninstall. */
    agent?: import("./Agent.js").AgentApi;
    /** Convenience shortcut for `app.agent.execute()`. Undefined before install / after uninstall. */
    agentExecute?: (name: string, payload?: unknown, scope?: string) => Promise<unknown>;
    /** Convenience shortcut for `app.agent.dispatch()`. Undefined before install / after uninstall. */
    agentDispatch?: (command: import("./Agent.js").AgentCommand, scope?: string) => Promise<void>;
  }

  interface ComponentContext {
    /** Agent API injected by the Agent plugin into component setup. */
    agent?: import("./Agent.js").AgentApi;
  }
}
//# sourceMappingURL=Agent.d.ts.map
