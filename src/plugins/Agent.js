"use strict";

/**
 * @module eleva/plugins/agent
 * @fileoverview Agent plugin for AI/agent integration with action registry,
 * command bus, audit logging, and state inspection. Uses the shared
 * `eleva.emitter` for event observation instead of a parallel system.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// -----------------------------------------------------------------------------
// External Type Imports
// -----------------------------------------------------------------------------

/**
 * Type imports from the Eleva core library.
 * @typedef {import('eleva').Eleva} Eleva
 * @typedef {import('eleva').ComponentDefinition} ComponentDefinition
 * @typedef {import('eleva').ComponentContext} ComponentContext
 * @typedef {import('eleva').SetupResult} SetupResult
 * @typedef {import('eleva').ComponentProps} ComponentProps
 * @typedef {import('eleva').ChildrenMap} ChildrenMap
 * @typedef {import('eleva').MountResult} MountResult
 */

// -----------------------------------------------------------------------------
// Agent Type Definitions
// -----------------------------------------------------------------------------

/**
 * Audit log entry recorded for actions, commands, and emitter events.
 * @typedef {Object} AgentLogEntry
 * @property {"action" | "command" | "event"} type
 *           The category of the log entry.
 * @property {string} action
 *           The action name, command type, or emitter event name.
 * @property {unknown} payload
 *           The data associated with the entry.
 * @property {number} timestamp
 *           Unix timestamp of when the entry was recorded.
 * @property {string} source
 *           The originating context (e.g., "global").
 * @property {unknown} [result]
 *           The value returned by the handler (action entries only).
 *           Absent on command/event entries and when the handler throws.
 * @property {string} [error]
 *           The error message if the handler threw (action/command entries).
 *           Absent when the handler succeeds and on event entries.
 * @property {number} [durationMs]
 *           Wall-clock execution time in milliseconds (action/command entries).
 *           Absent on event entries.
 */

/**
 * Filter options for querying the audit log.
 * @typedef {Object} AgentLogFilter
 * @property {"action" | "command" | "event"} [type]
 *           Filter by log entry type.
 * @property {number} [since]
 *           Filter entries after this timestamp.
 * @property {string} [action]
 *           Filter by action/event name.
 * @property {"ok" | "error"} [status]
 *           Filter by outcome: "ok" = entries without error, "error" = entries with error.
 */

/**
 * Action schema describing the contract for a registered action.
 * @typedef {Object} AgentActionSchema
 * @property {Record<string, string>} [input]
 *           Expected input payload shape (key -> type name).
 * @property {string} [output]
 *           Expected return type name.
 * @property {string[]} [errors]
 *           Known error codes this action can produce.
 */

/**
 * Permission rules for capability-based access control.
 * @typedef {Object} AgentPermissionRule
 * @property {string[]} [actions]
 *           Allowed action names.
 * @property {string[]} [commands]
 *           Allowed command types.
 */

/**
 * Agent plugin configuration options.
 * @typedef {Object} AgentOptions
 * @property {number} [maxLogSize]
 *           Maximum number of audit log entries (default: 100).
 * @property {boolean} [enableInspection]
 *           Enable component tree inspection (default: true).
 * @property {AgentErrorHandler} [onError]
 *           Custom error handler function.
 * @property {Record<string, Function>} [actions]
 *           Pre-registered action handlers.
 * @property {Record<string, AgentPermissionRule>} [permissions]
 *           Capability-based access control per scope.
 * @property {string[]} [emitterEvents]
 *           Emitter event prefixes to capture in the audit log
 *           (e.g., ["store:", "router:"]). Empty array disables capture.
 * @property {boolean} [strictPermissions]
 *           When true, scope is mandatory for execute/dispatch and calls
 *           without a scope are denied. Default: false (scope is optional
 *           and calls without it are unrestricted).
 * @property {boolean} [validateSchemas]
 *           When true, `execute()` validates the payload against the action's
 *           schema before calling the handler. Missing required input fields
 *           throw a schema violation error. Default: false.
 */

/**
 * Custom error handler for the agent plugin.
 * @callback AgentErrorHandler
 * @param {Error} error - The error that occurred (includes `error.code`).
 * @param {AgentErrorContext} context - Structured context about the error.
 * @returns {void}
 */

/**
 * Structured error context passed to the onError callback.
 * @typedef {Object} AgentErrorContext
 * @property {"execute"|"dispatch"} method
 *           The method that generated the error. Only "execute" and "dispatch" call onError.
 * @property {string} code
 *           Machine-readable error code (e.g., "AGENT_PERMISSION_DENIED").
 * @property {string} [action]
 *           The action name involved (if applicable).
 * @property {string} [scope]
 *           The scope involved (if applicable).
 * @property {string} [commandType]
 *           The command type involved (if applicable).
 */

/**
 * Capability manifest describing all available agent features for a given scope.
 * Returned by `agent.describe(scope?)`.
 * @typedef {Object} AgentCapabilityManifest
 * @property {Array<{name: string, schema: AgentActionSchema | null, allowed: boolean}>} actions
 *           All registered actions with their schemas and scope-based access.
 * @property {string[]} commands
 *           All registered command types.
 * @property {{ scope: string | null, actions: string[], commands: string[] } | null} permissions
 *           The resolved permission rules for the requested scope, or null if no scope.
 * @property {{ strictPermissions: boolean, maxLogSize: number, inspectionEnabled: boolean, validateSchemas: boolean }} config
 *           Current agent configuration.
 */

/**
 * Command object dispatched through the command bus.
 * @typedef {Object} AgentCommand
 * @property {string} type
 *           The command type identifier.
 * @property {string} [target]
 *           Optional target component or agent.
 * @property {unknown} [payload]
 *           Optional data payload.
 */

/**
 * Snapshot of the current application state.
 * @typedef {Object} AgentSnapshot
 * @property {number} timestamp
 *           When the snapshot was taken.
 * @property {Array<{name: string, hasSetup: boolean, hasChildren: boolean}>} components
 *           Registered component information.
 * @property {string[]} plugins
 *           Installed plugin names.
 */

/**
 * Diff result comparing two snapshots.
 * @typedef {Object} AgentDiffResult
 * @property {string[]} added
 *           Component names present in snapshot B but not A.
 * @property {string[]} removed
 *           Component names present in snapshot A but not B.
 */

/**
 * Descriptor returned by describeAction for agent introspection.
 * @typedef {Object} AgentActionDescriptor
 * @property {string} name
 *           The action name.
 * @property {AgentActionSchema | null} schema
 *           The action's contract schema, or null if none was provided.
 */

/**
 * Result returned by `agent.inspect()` describing the component registry.
 * @typedef {Object} AgentInspectResult
 * @property {Array<{name: string, hasSetup: boolean, hasTemplate: boolean, hasChildren: boolean, hasStyle: boolean}>} components
 *           Registered component information with setup, template, children, and style flags.
 */

/**
 * Extended error with a machine-readable `code` property.
 * All Agent plugin errors include `.code`; schema violations also include `.violations`.
 * @typedef {Object} AgentErrorFields
 * @property {string} code
 *           Machine-readable error code (e.g., "AGENT_PERMISSION_DENIED").
 * @property {string[]} [violations]
 *           Schema violation messages (present only on AGENT_SCHEMA_VIOLATION errors).
 */

/**
 * The public API surface exposed as ctx.agent in components.
 * @typedef {Object} AgentApi
 * @property {(name: string, handler: Function, schema?: AgentActionSchema) => void} register
 * @property {(name: string) => void} unregister
 * @property {(name: string, payload?: unknown, scope?: string) => Promise<unknown>} execute
 * @property {(actions: Array<{action: string, payload?: unknown}>, scope?: string) => Promise<unknown[]>} executeBatch
 * @property {(actions: Array<{action: string, payload?: unknown}>, scope?: string) => Promise<unknown>} executeSequence
 * @property {(name: string) => boolean} hasAction
 * @property {(name: string) => AgentActionDescriptor | null} describeAction
 * @property {() => AgentActionDescriptor[]} listActions
 * @property {(scope?: string) => AgentCapabilityManifest} describe
 * @property {(command: AgentCommand, scope?: string) => Promise<void>} dispatch
 * @property {(type: string, handler: Function) => () => void} onCommand
 * @property {(filter?: AgentLogFilter) => AgentLogEntry[]} getLog
 * @property {() => void} clearLog
 * @property {import("../modules/Signal.js").Signal<number>} actionCount
 * @property {import("../modules/Signal.js").Signal<AgentLogEntry | null>} lastActivity
 * @property {() => AgentInspectResult} [inspect]
 * @property {() => AgentSnapshot} [snapshot]
 * @property {(a: AgentSnapshot, b: AgentSnapshot) => AgentDiffResult} [diff]
 */

// ============================================================================
// PLUGIN IMPLEMENTATION
// ============================================================================

/**
 * @class 🤖 AgentPlugin
 * @classdesc Agent integration plugin for Eleva.js providing AI/agent
 * capabilities through a focused API.
 *
 * Core Features:
 * - **Action Registry** — Register and execute callable actions with schemas
 * - **Command Bus** — Structured agent-to-component communication
 * - **Audit Log** — Automatic recording of actions, commands, and emitter events
 * - **Permissions** — Capability-based access control per scope
 * - **State Inspection** — Component tree inspection and snapshots (opt-in)
 *
 * Event observation is handled by the shared `eleva.emitter` (available as
 * `ctx.emitter` in every component). The audit log can optionally capture
 * emitter events via the `emitterEvents` option.
 *
 * @example
 * // Install the plugin
 * const app = new Eleva("myApp");
 * app.use(AgentPlugin, {
 *   maxLogSize: 200,
 *   actions: {
 *     greet: (payload) => `Hello, ${payload.name}!`
 *   },
 *   permissions: {
 *     "ui-agent": { actions: ["greet"], commands: ["UPDATE_UI"] }
 *   }
 * });
 *
 * @example
 * // Use in components — observe events via ctx.emitter, not ctx.agent
 * app.component("MyComponent", {
 *   setup({ agent, emitter }) {
 *     agent.register("doSomething", (payload) => payload.value * 2, {
 *       input: { value: "number" },
 *       output: "number"
 *     });
 *
 *     emitter.on("store:change", (mutation) => {
 *       console.log("Store changed:", mutation);
 *     });
 *
 *     return {};
 *   },
 *   template: () => `<div>Agent-powered component</div>`
 * });
 */
export const AgentPlugin = {
  /**
   * Unique identifier for the plugin.
   * @type {string}
   */
  name: "agent",

  /**
   * Plugin version following semantic versioning.
   * @type {string}
   */
  version: "1.0.0",

  /**
   * Plugin description.
   * @type {string}
   */
  description:
    "Agent integration plugin providing action registry, command bus, audit logging, permissions, and state inspection for AI/agent workflows.",

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
  install(eleva, options = {}) {
    // Idempotency guard — prevent stale wrapper chains on double-install
    if (eleva._agent_originalMount) {
      console.warn(
        "[AgentPlugin] Already installed. Uninstall first to reconfigure."
      );
      return;
    }

    const {
      maxLogSize = 100,
      enableInspection = true,
      onError = null,
      actions: preRegisteredActions = {},
      permissions = {},
      emitterEvents = [],
      strictPermissions = false,
      validateSchemas = false,
    } = options;

    // ==================================================================
    // Shared Scoped-API State
    // ==================================================================

    /**
     * Reference counts for actions registered via scoped APIs.
     * Prevents one component's cleanup from removing an action
     * that another component also registered.
     * @type {Map<string, number>}
     */
    const _scopedActionRefCounts = new Map();

    /**
     * Snapshots of pre-existing global action handlers that were overwritten
     * by scoped registrations. Used to restore on cleanup when ref count
     * reaches zero.
     * @type {Map<string, { handler: Function, schema: * }>}
     */
    const _globalActionSnapshots = new Map();

    /**
     * Flag to suppress snapshot updates during scoped register calls.
     * Scoped register() calls baseApi.register() which hits the Agent
     * class register() — this flag prevents that inner call from
     * updating the snapshot with the scoped handler.
     * @type {boolean}
     */
    let _inScopedRegister = false;

    // ==================================================================
    // Internal Agent Class
    // ==================================================================

    /**
     * Internal Agent class managing all agent operations.
     * Defined inside install for closure access to `eleva`.
     *
     * @private
     */
    class Agent {
      constructor() {
        /** @type {Map<string, Function>} */
        this._actions = new Map();

        /** @type {Map<string, AgentActionSchema | null>} */
        this._schemas = new Map();

        /** @type {Map<string, Set<Function>>} */
        this._commandHandlers = new Map();

        /** @type {AgentLogEntry[]} */
        this._log = [];

        /** @type {number} */
        this._maxLogSize = maxLogSize;

        /** @type {boolean} */
        this._enableInspection = enableInspection;

        /** @type {AgentErrorHandler|null} */
        this._onError = onError;

        /** @type {Record<string, AgentPermissionRule>} */
        this._permissions = permissions;

        /** @type {boolean} */
        this._strictPermissions = strictPermissions;

        /** @type {boolean} */
        this._validateSchemas = validateSchemas;

        /** @type {boolean} */
        this._destroyed = false;

        /** @type {(() => void)[]} */
        this._emitterCleanups = [];

        /** @type {import("../../modules/Signal.js").Signal<number>} */
        this._actionCountSignal = new eleva.signal(0);

        /** @type {import("../../modules/Signal.js").Signal<AgentLogEntry|null>} */
        this._lastActivitySignal = new eleva.signal(null);

        // Pre-register actions from options
        this._registerInitialActions(preRegisteredActions);

        // Hook into emitter for audit log capture
        this._hookEmitter(emitterEvents);
      }

      // ----------------------------------------------------------------
      // Initialization
      // ----------------------------------------------------------------

      /**
       * Registers actions provided in the plugin options.
       *
       * @private
       * @param {Record<string, Function>} actions - Map of action names to handlers.
       * @returns {void}
       */
      _registerInitialActions(actions) {
        Object.entries(actions).forEach(([name, handler]) => {
          this.register(name, handler);
        });
      }

      /**
       * Hooks into eleva.emitter to capture events in the audit log.
       *
       * @private
       * @param {string[]} prefixes - Event prefixes to capture.
       * @returns {void}
       */
      _hookEmitter(prefixes) {
        if (!prefixes.length || !eleva.emitter) {
          return;
        }

        // For each prefix, subscribe to any event that starts with it.
        // Since Emitter doesn't support wildcards, we wrap emitter.emit
        // to intercept matching events.
        const originalEmit = eleva.emitter.emit.bind(eleva.emitter);

        const wrappedEmit = (event, ...args) => {
          // Skip logging if agent has been destroyed (prevents side
          // effects and memory growth when another wrapper still
          // chains into this closure after Agent was uninstalled).
          if (!this._destroyed) {
            const shouldCapture = prefixes.some((p) => event.startsWith(p));
            if (shouldCapture) {
              this._addLogEntry({
                type: "event",
                action: event,
                payload: args.length === 1 ? args[0] : args,
                timestamp: Date.now(),
                source: "emitter",
              });
            }
          }
          // Always call the original emit
          return originalEmit(event, ...args);
        };

        eleva.emitter.emit = wrappedEmit;

        // Store cleanup — only restore if emit is still our wrapper,
        // to avoid clobbering another plugin's instrumentation.
        this._emitterCleanups.push(() => {
          if (eleva.emitter.emit === wrappedEmit) {
            eleva.emitter.emit = originalEmit;
          }
        });
      }

      // ----------------------------------------------------------------
      // Permissions
      // ----------------------------------------------------------------

      /**
       * Checks if a scope has permission to execute an action or command.
       *
       * Default behaviour (strictPermissions = false):
       * - No permissions configured → everything allowed (zero-config path)
       * - No scope provided → unrestricted (trusted/internal call)
       * - Scope provided → checked against rules
       *
       * Strict behaviour (strictPermissions = true):
       * - No permissions configured → everything denied
       * - No scope provided → denied (scope is mandatory)
       * - Scope provided → checked against rules
       *
       * @private
       * @param {string} scope - The scope/role to check.
       * @param {"actions" | "commands"} kind - The permission kind.
       * @param {string} name - The action or command name.
       * @returns {boolean} True if allowed.
       */
      _checkPermission(scope, kind, name) {
        const hasRules = Object.keys(this._permissions).length > 0;

        if (this._strictPermissions) {
          // Strict mode: scope is mandatory, rules are mandatory
          if (!hasRules || !scope) {
            return false;
          }
        } else {
          // Default mode: no rules = allow all, no scope = unrestricted
          if (!hasRules) {
            return true;
          }
          if (!scope) {
            return true;
          }
        }

        const rule = this._permissions[scope];
        if (!rule) {
          return false;
        }
        const allowed = rule[kind];
        if (!allowed) {
          return false;
        }
        return allowed.includes(name);
      }

      // ----------------------------------------------------------------
      // Destroyed Guard
      // ----------------------------------------------------------------

      /**
       * Throws AGENT_DESTROYED if the agent has been destroyed.
       * Called at the top of every mutating public method to prevent
       * stale references from modifying state after teardown.
       *
       * @private
       * @returns {void}
       * @throws {Error} If the agent instance has been destroyed.
       */
      _assertAlive() {
        if (this._destroyed) {
          const error = new Error(
            "[AgentPlugin] Agent has been destroyed. Create a new instance via app.use(AgentPlugin)."
          );
          error.code = "AGENT_DESTROYED";
          throw error;
        }
      }

      // ----------------------------------------------------------------
      // Action Registry
      // ----------------------------------------------------------------

      /**
       * Registers a callable action with an optional schema.
       *
       * @param {string} name - Unique action name.
       * @param {Function} handler - The action handler function.
       * @param {AgentActionSchema} [schema] - Optional action contract.
       * @returns {void}
       * @throws {Error} If handler is not a function or agent is destroyed.
       */
      register(name, handler, schema) {
        this._assertAlive();
        if (typeof handler !== "function") {
          const error = new Error(
            "[AgentPlugin] Action handler must be a function"
          );
          error.code = "AGENT_HANDLER_NOT_FUNCTION";
          throw error;
        }
        // If a direct (non-scoped) global register overwrites a name with
        // active scoped ownership, update the snapshot so cleanup restores
        // the latest global handler instead of a stale one.
        if (
          !_inScopedRegister &&
          _scopedActionRefCounts.has(name) &&
          _globalActionSnapshots.has(name)
        ) {
          _globalActionSnapshots.set(name, { handler, schema: schema || null });
        }
        this._actions.set(name, handler);
        this._schemas.set(name, schema || null);
        this._actionCountSignal.value = this._actions.size;
        if (eleva.emitter) {
          try {
            eleva.emitter.emit("agent:register", {
              name,
              hasSchema: !!schema,
              timestamp: Date.now(),
            });
          } catch (_) {
            /* listener error must not break agent flow */
          }
        }
      }

      /**
       * Removes a registered action.
       *
       * @param {string} name - The action name to remove.
       * @returns {void}
       */
      unregister(name) {
        this._assertAlive();
        if (!this._actions.has(name)) {
          console.warn(
            `[AgentPlugin] Action "${name}" not found for unregister`
          );
          return;
        }
        this._actions.delete(name);
        this._schemas.delete(name);
        this._actionCountSignal.value = this._actions.size;
        if (eleva.emitter) {
          try {
            eleva.emitter.emit("agent:unregister", {
              name,
              timestamp: Date.now(),
            });
          } catch (_) {
            /* listener error must not break agent flow */
          }
        }
      }

      /**
       * Executes a registered action with optional scope-based permission check.
       *
       * Execution order: permission check → schema validation (if enabled) →
       * handler invocation → audit log entry with outcome.
       *
       * @async
       * @param {string} name - The action name to execute.
       * @param {unknown} [payload] - Optional payload to pass to the handler.
       * @param {string} [scope] - Optional scope for permission check.
       * @returns {Promise<unknown>} The result of the action handler.
       * @throws {Error} If the action is not found, permission denied, schema violation, or handler throws.
       */
      async execute(name, payload, scope) {
        this._assertAlive();
        if (!this._checkPermission(scope, "actions", name)) {
          const error = new Error(
            `[AgentPlugin] Permission denied: scope "${scope}" cannot execute "${name}"`
          );
          error.code = "AGENT_PERMISSION_DENIED";
          if (this._onError) {
            try {
              this._onError(error, {
                method: "execute",
                code: "AGENT_PERMISSION_DENIED",
                action: name,
                scope,
              });
            } catch (_) {
              /* onError must not alter agent flow */
            }
          }
          throw error;
        }

        const handler = this._actions.get(name);

        if (!handler) {
          const error = new Error(`[AgentPlugin] Action "${name}" not found`);
          error.code = "AGENT_ACTION_NOT_FOUND";
          if (this._onError) {
            try {
              this._onError(error, {
                method: "execute",
                code: "AGENT_ACTION_NOT_FOUND",
                action: name,
              });
            } catch (_) {
              /* onError must not alter agent flow */
            }
          }
          throw error;
        }

        // Schema validation (opt-in)
        if (this._validateSchemas) {
          const schema = this._schemas.get(name);
          if (schema && schema.input) {
            const violations = this._validatePayload(payload, schema.input);
            if (violations.length > 0) {
              const error = new Error(
                `[AgentPlugin] Schema violation for "${name}": ${violations.join("; ")}`
              );
              error.code = "AGENT_SCHEMA_VIOLATION";
              error.violations = violations;
              if (this._onError) {
                try {
                  this._onError(error, {
                    method: "execute",
                    code: "AGENT_SCHEMA_VIOLATION",
                    action: name,
                  });
                } catch (_) {
                  /* onError must not alter agent flow */
                }
              }
              throw error;
            }
          }
        }

        const startTime = Date.now();
        try {
          const result = await handler(payload);
          const durationMs = Date.now() - startTime;
          this._addLogEntry({
            type: "action",
            action: name,
            payload,
            timestamp: startTime,
            source: scope || "global",
            result,
            durationMs,
          });
          if (eleva.emitter) {
            try {
              eleva.emitter.emit("agent:execute", {
                name,
                payload,
                result,
                durationMs,
                timestamp: startTime,
              });
            } catch (_) {
              /* listener error must not break agent flow */
            }
          }
          return result;
        } catch (rawError) {
          const error =
            rawError instanceof Error ? rawError : new Error(String(rawError));
          const durationMs = Date.now() - startTime;
          this._addLogEntry({
            type: "action",
            action: name,
            payload,
            timestamp: startTime,
            source: scope || "global",
            error: error.message,
            durationMs,
          });
          if (eleva.emitter) {
            try {
              eleva.emitter.emit("agent:execute:error", {
                name,
                payload,
                error: error.message,
                durationMs,
                timestamp: startTime,
              });
            } catch (_) {
              /* listener error must not break agent flow */
            }
          }
          if (!error.code) {
            error.code = "AGENT_HANDLER_ERROR";
          }
          if (this._onError) {
            try {
              this._onError(error, {
                method: "execute",
                code: error.code,
                action: name,
              });
            } catch (_) {
              /* onError must not alter agent flow */
            }
          }
          throw error;
        }
      }

      /**
       * Checks if an action is registered.
       *
       * @param {string} name - The action name to check.
       * @returns {boolean} True if the action exists.
       */
      hasAction(name) {
        return this._actions.has(name);
      }

      /**
       * Returns the descriptor for a registered action.
       *
       * @param {string} name - The action name.
       * @returns {AgentActionDescriptor | null} The descriptor, or null if not found.
       */
      describeAction(name) {
        if (!this._actions.has(name)) {
          return null;
        }
        return {
          name,
          schema: this._schemas.get(name) || null,
        };
      }

      /**
       * Lists all registered actions with their schemas.
       *
       * @returns {AgentActionDescriptor[]} Array of action descriptors.
       */
      listActions() {
        const result = [];
        this._actions.forEach((_, name) => {
          result.push({
            name,
            schema: this._schemas.get(name) || null,
          });
        });
        return result;
      }

      // ----------------------------------------------------------------
      // Command Bus
      // ----------------------------------------------------------------

      /**
       * Dispatches a structured command to registered handlers
       * with optional scope-based permission check.
       *
       * @async
       * @param {AgentCommand} command - The command to dispatch.
       * @param {string} [scope] - Optional scope for permission check.
       * @returns {Promise<void>}
       */
      async dispatch(command, scope) {
        this._assertAlive();
        if (!command || typeof command.type !== "string") {
          const error = new Error(
            "[AgentPlugin] Command must have a string 'type'"
          );
          error.code = "AGENT_COMMAND_INVALID_TYPE";
          throw error;
        }

        if (!this._checkPermission(scope, "commands", command.type)) {
          const error = new Error(
            `[AgentPlugin] Permission denied: scope "${scope}" cannot dispatch "${command.type}"`
          );
          error.code = "AGENT_PERMISSION_DENIED";
          if (this._onError) {
            try {
              this._onError(error, {
                method: "dispatch",
                code: "AGENT_PERMISSION_DENIED",
                commandType: command.type,
                scope,
              });
            } catch (_) {
              /* onError must not alter agent flow */
            }
          }
          throw error;
        }

        const startTime = Date.now();
        const errors = [];

        const handlers = this._commandHandlers.get(command.type);
        if (handlers) {
          for (const handler of handlers) {
            try {
              await handler(command);
            } catch (rawHandlerError) {
              const handlerError =
                rawHandlerError instanceof Error
                  ? rawHandlerError
                  : new Error(String(rawHandlerError));
              errors.push(handlerError.message);
              if (!handlerError.code) {
                handlerError.code = "AGENT_HANDLER_ERROR";
              }
              if (this._onError) {
                try {
                  this._onError(handlerError, {
                    method: "dispatch",
                    code: handlerError.code,
                    commandType: command.type,
                  });
                } catch (_) {
                  /* onError must not alter agent flow */
                }
              }
            }
          }
        }

        const durationMs = Date.now() - startTime;
        const logEntry = {
          type: "command",
          action: command.type,
          payload: command.payload,
          timestamp: startTime,
          source: command.target || scope || "global",
          durationMs,
        };
        if (errors.length > 0) {
          logEntry.error = errors.join("; ");
        }
        this._addLogEntry(logEntry);
        if (eleva.emitter) {
          try {
            eleva.emitter.emit("agent:dispatch", {
              type: command.type,
              target: command.target,
              payload: command.payload,
              errors: errors.length > 0 ? errors : undefined,
              durationMs,
              timestamp: startTime,
            });
          } catch (_) {
            /* listener error must not break agent flow */
          }
        }
      }

      /**
       * Registers a handler for a command type.
       *
       * @param {string} type - The command type to handle.
       * @param {Function} handler - The handler function.
       * @returns {() => void} Unsubscribe function.
       * @throws {Error} If handler is not a function.
       */
      onCommand(type, handler) {
        this._assertAlive();
        if (typeof handler !== "function") {
          const error = new Error(
            "[AgentPlugin] Command handler must be a function"
          );
          error.code = "AGENT_HANDLER_NOT_FUNCTION";
          throw error;
        }

        if (!this._commandHandlers.has(type)) {
          this._commandHandlers.set(type, new Set());
        }
        this._commandHandlers.get(type).add(handler);

        return () => {
          const handlers = this._commandHandlers.get(type);
          if (handlers) {
            handlers.delete(handler);
            if (handlers.size === 0) {
              this._commandHandlers.delete(type);
            }
          }
        };
      }

      // ----------------------------------------------------------------
      // Audit Log
      // ----------------------------------------------------------------

      /**
       * Adds an entry to the audit log with rotation.
       *
       * @private
       * @param {AgentLogEntry} entry - The log entry to add.
       * @returns {void}
       */
      _addLogEntry(entry) {
        this._log.push(entry);
        if (this._log.length > this._maxLogSize) {
          this._log.shift();
        }
        this._lastActivitySignal.value = entry;
      }

      /**
       * Returns audit log entries, optionally filtered.
       *
       * @param {AgentLogFilter} [filter] - Optional filter criteria.
       * @returns {AgentLogEntry[]} Matching log entries.
       */
      getLog(filter) {
        if (!filter) {
          return [...this._log];
        }

        return this._log.filter((entry) => {
          if (filter.type && entry.type !== filter.type) {
            return false;
          }
          if (filter.since && entry.timestamp < filter.since) {
            return false;
          }
          if (filter.action && entry.action !== filter.action) {
            return false;
          }
          if (filter.status) {
            const hasError = "error" in entry && entry.error != null;
            if (filter.status === "ok" && hasError) return false;
            if (filter.status === "error" && !hasError) return false;
          }
          return true;
        });
      }

      /**
       * Clears all audit log entries.
       *
       * @returns {void}
       */
      clearLog() {
        this._assertAlive();
        this._log = [];
      }

      // ----------------------------------------------------------------
      // State Inspection
      // ----------------------------------------------------------------

      /**
       * Inspects the component registry.
       *
       * @returns {AgentInspectResult} Component tree information.
       */
      inspect() {
        if (this._destroyed) {
          return { components: [] };
        }
        if (!this._enableInspection) {
          console.warn(
            "[AgentPlugin] Inspection is disabled. Enable with { enableInspection: true }"
          );
          return { components: [] };
        }

        const components = [];
        if (eleva._components) {
          eleva._components.forEach((def, name) => {
            components.push({
              name,
              hasSetup: typeof def.setup === "function",
              hasTemplate:
                typeof def.template === "function" ||
                typeof def.template === "string",
              hasChildren:
                !!def.children && Object.keys(def.children).length > 0,
              hasStyle: !!def.style,
            });
          });
        }

        return { components };
      }

      /**
       * Creates a serializable snapshot of the application state.
       *
       * Note: The plugin list uses `eleva.plugins` (the public Map maintained
       * by each plugin's install/uninstall) as the sole authoritative source.
       * Plugins that don't register there won't appear in the snapshot.
       *
       * @returns {AgentSnapshot} The snapshot object.
       */
      snapshot() {
        if (this._destroyed) {
          return { timestamp: Date.now(), components: [], plugins: [] };
        }
        if (!this._enableInspection) {
          console.warn(
            "[AgentPlugin] Inspection is disabled. Enable with { enableInspection: true }"
          );
          return { timestamp: Date.now(), components: [], plugins: [] };
        }

        const components = [];
        if (eleva._components) {
          eleva._components.forEach((def, name) => {
            components.push({
              name,
              hasSetup: typeof def.setup === "function",
              hasChildren:
                !!def.children && Object.keys(def.children).length > 0,
            });
          });
        }

        // Use eleva.plugins (public Map, maintained by install/uninstall)
        // as the sole authoritative source. This map is kept in sync by
        // plugins that register there (Attr, Router, Agent) and accurately
        // reflects the current install state. We avoid merging with
        // eleva._plugins (core internal Map) because it is add-only and
        // never pruned on uninstall, which would report stale entries.
        // Plugins that don't register in eleva.plugins (e.g., StorePlugin)
        // won't appear here — they can adopt the pattern independently.
        const plugins = [];
        if (eleva.plugins) {
          eleva.plugins.forEach((_, name) => plugins.push(name));
        }

        return {
          timestamp: Date.now(),
          components,
          plugins,
        };
      }

      /**
       * Compares two snapshots and returns what changed.
       *
       * @param {AgentSnapshot} snapshotA - The first snapshot.
       * @param {AgentSnapshot} snapshotB - The second snapshot.
       * @returns {AgentDiffResult} The diff result.
       */
      diff(snapshotA, snapshotB) {
        const namesA = new Set((snapshotA.components || []).map((c) => c.name));
        const namesB = new Set((snapshotB.components || []).map((c) => c.name));

        const added = [];
        const removed = [];

        namesB.forEach((name) => {
          if (!namesA.has(name)) {
            added.push(name);
          }
        });

        namesA.forEach((name) => {
          if (!namesB.has(name)) {
            removed.push(name);
          }
        });

        return { added, removed };
      }

      // ----------------------------------------------------------------
      // Schema Validation
      // ----------------------------------------------------------------

      /**
       * Validates a payload against a schema's input definition.
       *
       * @private
       * @param {unknown} payload - The payload to validate.
       * @param {Record<string, string>} inputSchema - Expected input shape.
       * @returns {string[]} Array of violation messages (empty if valid).
       */
      _validatePayload(payload, inputSchema) {
        const violations = [];

        if (payload == null || typeof payload !== "object") {
          violations.push(
            `expected object payload, got ${payload === null ? "null" : typeof payload}`
          );
          return violations;
        }

        for (const [field, expectedType] of Object.entries(inputSchema)) {
          if (!(field in payload)) {
            violations.push(`missing required field "${field}"`);
          } else {
            const actualType = typeof payload[field];
            if (actualType !== expectedType) {
              violations.push(
                `field "${field}" expected ${expectedType}, got ${actualType}`
              );
            }
          }
        }

        return violations;
      }

      // ----------------------------------------------------------------
      // Composition Primitives
      // ----------------------------------------------------------------

      /**
       * Executes multiple actions in parallel.
       * All actions are started concurrently. If any action fails,
       * the entire batch rejects with the first error.
       *
       * @async
       * @param {Array<{action: string, payload?: unknown}>} actions - Actions to execute.
       * @param {string} [scope] - Optional scope for permission check.
       * @returns {Promise<unknown[]>} Array of results in the same order as input.
       * @throws {Error} If any action fails (first error).
       */
      async executeBatch(actions, scope) {
        this._assertAlive();
        return Promise.all(
          actions.map((item) => this.execute(item.action, item.payload, scope))
        );
      }

      /**
       * Executes actions sequentially, piping results.
       * The result of each action becomes the payload of the next.
       * The first action uses the payload from its entry; subsequent actions
       * receive the previous action's result as their payload.
       *
       * @async
       * @param {Array<{action: string, payload?: unknown}>} actions - Actions to execute in order.
       * @param {string} [scope] - Optional scope for permission check.
       * @returns {Promise<unknown>} The result of the last action in the sequence.
       * @throws {Error} If any action in the sequence fails (stops immediately).
       */
      async executeSequence(actions, scope) {
        this._assertAlive();
        let result;
        for (let i = 0; i < actions.length; i++) {
          const item = actions[i];
          const payload = i === 0 ? item.payload : result;
          result = await this.execute(item.action, payload, scope);
        }
        return result;
      }

      // ----------------------------------------------------------------
      // Capability Discovery
      // ----------------------------------------------------------------

      /**
       * Returns a complete capability manifest describing all available
       * agent features for a given scope.
       *
       * @param {string} [scope] - Optional scope to check permissions against.
       * @returns {AgentCapabilityManifest} The capability manifest.
       */
      describe(scope) {
        // Actions with per-action allowed flag
        const actions = [];
        this._actions.forEach((_, name) => {
          actions.push({
            name,
            schema: this._schemas.get(name) || null,
            allowed: this._checkPermission(scope, "actions", name),
          });
        });

        // All registered command types
        const commands = [...this._commandHandlers.keys()];

        // Resolved permissions for the requested scope
        let resolvedPermissions = null;
        if (scope) {
          const rule = this._permissions[scope];
          resolvedPermissions = {
            scope,
            actions: rule && rule.actions ? [...rule.actions] : [],
            commands: rule && rule.commands ? [...rule.commands] : [],
          };
        }

        return {
          actions,
          commands,
          permissions: resolvedPermissions,
          config: {
            strictPermissions: this._strictPermissions,
            maxLogSize: this._maxLogSize,
            inspectionEnabled: this._enableInspection,
            validateSchemas: this._validateSchemas,
          },
        };
      }

      // ----------------------------------------------------------------
      // Cleanup
      // ----------------------------------------------------------------

      /**
       * Destroys the agent, clearing all internal state and
       * restoring emitter hooks.
       *
       * @returns {void}
       */
      destroy() {
        this._destroyed = true;
        this._actions.clear();
        this._schemas.clear();
        this._commandHandlers.clear();
        this._log = [];
        this._emitterCleanups.forEach((fn) => fn());
        this._emitterCleanups = [];
        this._actionCountSignal.value = 0;
        this._lastActivitySignal.value = null;
        _scopedActionRefCounts.clear();
        _globalActionSnapshots.clear();
      }
    }

    // ==================================================================
    // Instantiation
    // ==================================================================

    const agent = new Agent();

    // ==================================================================
    // Mount Wrapping (Context Injection)
    // ==================================================================

    /**
     * Creates the ctx.agent API object for injection into components.
     * Inspection methods are only included when enableInspection is true.
     *
     * @private
     * @returns {AgentApi} The agent API surface.
     */
    const createAgentApi = () => {
      /** @type {AgentApi} */
      const api = {
        // Action Registry
        register: agent.register.bind(agent),
        unregister: agent.unregister.bind(agent),
        execute: agent.execute.bind(agent),
        executeBatch: agent.executeBatch.bind(agent),
        executeSequence: agent.executeSequence.bind(agent),
        hasAction: agent.hasAction.bind(agent),
        describeAction: agent.describeAction.bind(agent),
        listActions: agent.listActions.bind(agent),
        describe: agent.describe.bind(agent),

        // Command Bus
        dispatch: agent.dispatch.bind(agent),
        onCommand: agent.onCommand.bind(agent),

        // Audit Log
        getLog: agent.getLog.bind(agent),
        clearLog: agent.clearLog.bind(agent),

        // Reactive Signals
        actionCount: agent._actionCountSignal,
        lastActivity: agent._lastActivitySignal,
      };

      // Only expose inspection methods when enabled
      if (enableInspection) {
        api.inspect = agent.inspect.bind(agent);
        api.snapshot = agent.snapshot.bind(agent);
        api.diff = agent.diff.bind(agent);
      }

      return api;
    };

    /**
     * Creates a component-scoped agent API that tracks registrations
     * for automatic cleanup on component unmount.
     *
     * @private
     * @returns {{ api: AgentApi, cleanup: () => void }}
     */
    const createScopedAgentApi = () => {
      const baseApi = createAgentApi();
      /** @type {Set<string>} */
      const registeredActions = new Set();
      /** @type {Array<() => void>} */
      const commandUnsubscribes = [];

      const scopedApi = {
        ...baseApi,
        register(name, handler, schema) {
          if (!registeredActions.has(name)) {
            // Snapshot pre-existing global handler before first scoped overwrite
            if (!_scopedActionRefCounts.has(name) && agent.hasAction(name)) {
              _globalActionSnapshots.set(name, {
                handler: agent._actions.get(name),
                schema: agent._schemas.get(name),
              });
            }
            registeredActions.add(name);
            _scopedActionRefCounts.set(
              name,
              (_scopedActionRefCounts.get(name) || 0) + 1
            );
          }
          _inScopedRegister = true;
          try {
            baseApi.register(name, handler, schema);
          } finally {
            _inScopedRegister = false;
          }
        },
        unregister(name) {
          if (registeredActions.has(name)) {
            registeredActions.delete(name);
            const count = (_scopedActionRefCounts.get(name) || 1) - 1;
            if (count <= 0) {
              _scopedActionRefCounts.delete(name);
              const snapshot = _globalActionSnapshots.get(name);
              if (snapshot) {
                _globalActionSnapshots.delete(name);
                baseApi.register(name, snapshot.handler, snapshot.schema);
              } else {
                baseApi.unregister(name);
              }
            } else {
              _scopedActionRefCounts.set(name, count);
            }
          } else {
            console.warn(
              `[AgentPlugin] Scoped unregister ignored: "${name}" is not owned by this component`
            );
          }
        },
        onCommand(type, handler) {
          const unsub = baseApi.onCommand(type, handler);
          commandUnsubscribes.push(unsub);
          return unsub;
        },
      };

      const cleanup = () => {
        for (const name of registeredActions) {
          const count = (_scopedActionRefCounts.get(name) || 1) - 1;
          if (count <= 0) {
            _scopedActionRefCounts.delete(name);
            const snapshot = _globalActionSnapshots.get(name);
            if (snapshot) {
              _globalActionSnapshots.delete(name);
              agent.register(name, snapshot.handler, snapshot.schema);
            } else if (agent.hasAction(name)) {
              agent.unregister(name);
            }
          } else {
            _scopedActionRefCounts.set(name, count);
          }
        }
        registeredActions.clear();
        for (const unsub of commandUnsubscribes) {
          unsub();
        }
        commandUnsubscribes.length = 0;
      };

      return { api: scopedApi, cleanup };
    };

    // Store the original mount method
    const originalMount = eleva.mount;

    /**
     * Overridden mount method that injects agent context into components.
     *
     * @param {HTMLElement} container - The DOM element to mount to.
     * @param {string | ComponentDefinition} compName - Component name or definition.
     * @param {ComponentProps} [props={}] - Optional component properties.
     * @returns {Promise<MountResult>} The mount result.
     */
    eleva.mount = async (container, compName, props = {}) => {
      const componentDef =
        typeof compName === "string"
          ? eleva._components.get(compName) || compName
          : compName;

      if (!componentDef || typeof componentDef !== "object") {
        return await originalMount.call(eleva, container, compName, props);
      }

      const wrappedComponent = {
        ...componentDef,
        async setup(ctx) {
          const { api, cleanup } = createScopedAgentApi();
          /** @type {AgentApi} */
          ctx.agent = api;

          const originalSetup = componentDef.setup;
          const result = originalSetup ? await originalSetup(ctx) : {};

          const originalOnUnmount = result.onUnmount;
          result.onUnmount = async (info) => {
            try {
              if (originalOnUnmount) {
                await originalOnUnmount(info);
              }
            } finally {
              cleanup();
            }
          };

          return result;
        },
      };

      return await originalMount.call(
        eleva,
        container,
        wrappedComponent,
        props
      );
    };

    // Override _mountComponents for child component injection
    const originalMountComponents = eleva._mountComponents;

    /**
     * Overridden _mountComponents that injects agent context into child components.
     *
     * @param {HTMLElement} container - The parent container element.
     * @param {ChildrenMap} children - Map of selectors to component definitions.
     * @param {MountResult[]} childInstances - Array to store mounted instances.
     * @param {ComponentContext & SetupResult} context - Parent component context.
     * @returns {Promise<void>}
     */
    eleva._mountComponents = async (
      container,
      children,
      childInstances,
      context
    ) => {
      const wrappedChildren = {};

      for (const [selector, childComponent] of Object.entries(children)) {
        const componentDef =
          typeof childComponent === "string"
            ? eleva._components.get(childComponent) || childComponent
            : childComponent;

        if (componentDef && typeof componentDef === "object") {
          wrappedChildren[selector] = {
            ...componentDef,
            async setup(ctx) {
              const { api, cleanup } = createScopedAgentApi();
              /** @type {AgentApi} */
              ctx.agent = api;

              const originalSetup = componentDef.setup;
              const result = originalSetup ? await originalSetup(ctx) : {};

              const originalOnUnmount = result.onUnmount;
              result.onUnmount = async (info) => {
                try {
                  if (originalOnUnmount) {
                    await originalOnUnmount(info);
                  }
                } finally {
                  cleanup();
                }
              };

              return result;
            },
          };
        } else {
          wrappedChildren[selector] = childComponent;
        }
      }

      return await originalMountComponents.call(
        eleva,
        container,
        wrappedChildren,
        childInstances,
        context
      );
    };

    // ==================================================================
    // Expose on Eleva Instance
    // ==================================================================

    /** @type {Agent} */
    eleva.agent = agent;

    /** @type {(name: string, payload?: unknown, scope?: string) => Promise<unknown>} */
    eleva.agentExecute = (name, payload, scope) => {
      return agent.execute(name, payload, scope);
    };

    /** @type {(command: AgentCommand, scope?: string) => Promise<void>} */
    eleva.agentDispatch = (command, scope) => {
      return agent.dispatch(command, scope);
    };

    // Store original methods for cleanup (namespaced to avoid collision)
    eleva._agent_originalMount = originalMount;
    eleva._agent_originalMountComponents = originalMountComponents;

    // Register plugin metadata
    if (!eleva.plugins) {
      eleva.plugins = new Map();
    }
    eleva.plugins.set(this.name, {
      name: this.name,
      version: this.version,
      description: this.description,
      options,
    });
  },

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
  uninstall(eleva) {
    // Restore original mount method
    if (eleva._agent_originalMount) {
      eleva.mount = eleva._agent_originalMount;
      delete eleva._agent_originalMount;
    }

    // Restore original _mountComponents method
    if (eleva._agent_originalMountComponents) {
      eleva._mountComponents = eleva._agent_originalMountComponents;
      delete eleva._agent_originalMountComponents;
    }

    // Destroy and remove agent instance
    if (eleva.agent) {
      if (typeof eleva.agent.destroy === "function") {
        eleva.agent.destroy();
      }
      delete eleva.agent;
    }

    // Remove convenience methods
    if (eleva.agentExecute) {
      delete eleva.agentExecute;
    }
    if (eleva.agentDispatch) {
      delete eleva.agentDispatch;
    }

    // Remove plugin metadata
    if (eleva.plugins) {
      eleva.plugins.delete("agent");
    }
  },
};

// Short name export for convenience
export { AgentPlugin as Agent };
