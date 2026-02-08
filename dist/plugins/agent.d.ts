import * as eleva from 'eleva';

/**
 * @module eleva/signal
 * @fileoverview Reactive Signal primitive for fine-grained state management and change notification.
 */
/**
 * Callback function invoked when a signal's value changes.
 * @template T The type of value held by the signal.
 * @callback SignalWatcher
 * @param {T} value
 *        The new value of the signal.
 * @returns {void}
 */
/**
 * Function to unsubscribe a watcher from a signal.
 * @callback SignalUnsubscribe
 * @returns {boolean}
 *          True if the watcher was successfully removed, false if already removed.
 *          Safe to call multiple times (idempotent).
 */
/**
 * Interface describing the public API of a Signal.
 * @template T The type of value held by the signal.
 * @typedef {Object} SignalLike
 * @property {T} value
 *           The current value of the signal.
 * @property {function(SignalWatcher<T>): SignalUnsubscribe} watch
 *           Subscribe to value changes.
 */
/**
 * @class ⚡ Signal
 * @classdesc A reactive data holder that enables fine-grained reactivity in the Eleva framework.
 * Signals notify registered watchers synchronously when their value changes, enabling efficient
 * DOM updates through targeted patching rather than full re-renders.
 * Synchronous notification preserves stack traces and allows immediate value inspection.
 * Render batching is handled at the component level, not the signal level.
 * The class is generic, allowing type-safe handling of any value type T.
 *
 * @template T The type of value held by the signal.
 *
 * @example
 * // Basic usage
 * const count = new Signal(0);
 * count.watch((value) => console.log(`Count changed to: ${value}`));
 * count.value = 1; // Logs: "Count changed to: 1"
 *
 * @example
 * // With unsubscribe
 * const name = new Signal("John");
 * const unsubscribe = name.watch((value) => console.log(value));
 * name.value = "Jane"; // Logs: "Jane"
 * unsubscribe(); // Stop watching
 * name.value = "Bob"; // No log output
 *
 * @example
 * // With objects
 * const position = new Signal({ x: 0, y: 0 });
 * position.value = { x: 10, y: 20 }; // Triggers watchers
 *
 * @implements {SignalLike<T>}
 */
declare class Signal<T> implements SignalLike<T> {
    /**
     * Creates a new Signal instance with the specified initial value.
     *
     * @public
     * @constructor
     * @param {T} value - The initial value of the signal.
     *
     * @example
     * // Primitive types
     * const count = new Signal(0);        // Signal<number>
     * const name = new Signal("John");    // Signal<string>
     * const active = new Signal(true);    // Signal<boolean>
     *
     * @example
     * // Complex types
     * const items = new Signal([]);          // Signal holding an array
     * const user = new Signal(null);         // Signal holding nullable object
     */
    constructor(value: T);
    /**
     * Internal storage for the signal's current value.
     * @private
     * @type {T}
     */
    private _value;
    /**
     * Collection of callback functions to be notified when value changes.
     * @private
     * @type {Set<SignalWatcher<T>>}
     */
    private _watchers;
    /**
     * Sets a new value for the signal and synchronously notifies all registered watchers if the value has changed.
     * Synchronous notification preserves stack traces and ensures immediate value consistency.
     *
     * Uses strict equality (===) for comparison. For objects/arrays, watchers are only notified
     * if the reference changes, not if properties are mutated. To trigger updates with objects,
     * assign a new reference: `signal.value = { ...signal.value, updated: true }`.
     *
     * @public
     * @param {T} newVal - The new value to set.
     * @returns {void}
     */
    public set value(newVal: T);
    /**
     * Gets the current value of the signal.
     *
     * @public
     * @returns {T} The current value.
     */
    public get value(): T;
    /**
     * Registers a watcher function that will be called whenever the signal's value changes.
     * The watcher will receive the new value as its argument.
     *
     * @public
     * @param {SignalWatcher<T>} fn - The callback function to invoke on value change.
     * @returns {SignalUnsubscribe} A function to unsubscribe the watcher.
     *          Returns true if watcher was removed, false if it wasn't registered.
     *          Safe to call multiple times (idempotent after first call).
     *
     * @example
     * // Basic watching
     * const unsubscribe = signal.watch((value) => console.log(value));
     *
     * @example
     * // Stop watching
     * unsubscribe(); // Returns true if watcher was removed
     * unsubscribe(); // Returns false (already removed, safe to call again)
     *
     * @example
     * // Multiple watchers
     * const unsub1 = signal.watch((v) => console.log("Watcher 1:", v));
     * const unsub2 = signal.watch((v) => console.log("Watcher 2:", v));
     * signal.value = "test"; // Both watchers are called
     */
    public watch(fn: SignalWatcher<T>): SignalUnsubscribe;
    /**
     * Synchronously notifies all registered watchers of the value change.
     * This preserves stack traces for debugging and ensures immediate
     * value consistency. Render batching is handled at the component level.
     *
     * @note If a watcher throws, subsequent watchers are NOT called.
     * The error propagates to the caller (the setter).
     *
     * @private
     * @returns {void}
     */
    private _notify;
}
/**
 * Callback function invoked when a signal's value changes.
 */
type SignalWatcher<T> = (value: T) => void;
/**
 * Function to unsubscribe a watcher from a signal.
 */
type SignalUnsubscribe = () => boolean;
/**
 * Interface describing the public API of a Signal.
 */
type SignalLike<T> = {
    /**
     *           The current value of the signal.
     */
    value: T;
    /**
     *           Subscribe to value changes.
     */
    watch: (arg0: SignalWatcher<T>) => SignalUnsubscribe;
};

declare namespace AgentPlugin {
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

/**
 * Type imports from the Eleva core library.
 */
type Eleva = eleva.Eleva;
/**
 * Type imports from the Eleva core library.
 */
type ComponentDefinition = eleva.ComponentDefinition;
/**
 * Type imports from the Eleva core library.
 */
type ComponentContext = eleva.ComponentContext;
/**
 * Type imports from the Eleva core library.
 */
type SetupResult = eleva.SetupResult;
/**
 * Type imports from the Eleva core library.
 */
type ComponentProps = eleva.ComponentProps;
/**
 * Type imports from the Eleva core library.
 */
type ChildrenMap = eleva.ChildrenMap;
/**
 * Type imports from the Eleva core library.
 */
type MountResult = eleva.MountResult;
/**
 * Audit log entry recorded for actions, commands, and emitter events.
 */
type AgentLogEntry = {
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
type AgentLogFilter = {
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
type AgentActionSchema = {
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
type AgentPermissionRule = {
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
type AgentOptions = {
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
type AgentErrorHandler = (error: Error, context: AgentErrorContext) => void;
/**
 * Structured error context passed to the onError callback.
 */
type AgentErrorContext = {
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
type AgentCapabilityManifest = {
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
type AgentCommand = {
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
type AgentSnapshot = {
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
type AgentDiffResult = {
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
type AgentActionDescriptor = {
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
type AgentInspectResult = {
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
type AgentErrorFields = {
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
interface AgentError extends Error {
    /** Machine-readable error code (e.g., "AGENT_PERMISSION_DENIED"). */
    code: string;
    /** Schema violation messages (present only on AGENT_SCHEMA_VIOLATION errors). */
    violations?: string[];
}
/**
 * The public API surface exposed as ctx.agent in components.
 */
type AgentApi = {
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
    actionCount: Signal<number>;
    lastActivity: Signal<AgentLogEntry | null>;
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
    agent?: AgentApi;
    /** Convenience shortcut for `app.agent.execute()`. Undefined before install / after uninstall. */
    agentExecute?: (name: string, payload?: unknown, scope?: string) => Promise<unknown>;
    /** Convenience shortcut for `app.agent.dispatch()`. Undefined before install / after uninstall. */
    agentDispatch?: (command: AgentCommand, scope?: string) => Promise<void>;
  }

  interface ComponentContext {
    /** Agent API injected by the Agent plugin into component setup. */
    agent?: AgentApi;
  }
}

export { AgentPlugin as Agent, AgentPlugin };
export type { AgentActionDescriptor, AgentActionSchema, AgentApi, AgentCapabilityManifest, AgentCommand, AgentDiffResult, AgentError, AgentErrorContext, AgentErrorFields, AgentErrorHandler, AgentInspectResult, AgentLogEntry, AgentLogFilter, AgentOptions, AgentPermissionRule, AgentSnapshot, ChildrenMap, ComponentContext, ComponentDefinition, ComponentProps, Eleva, MountResult, SetupResult };
//# sourceMappingURL=agent.d.ts.map
