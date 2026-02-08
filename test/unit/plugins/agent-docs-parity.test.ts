/**
 * @fileoverview Docs/Source Parity Test for Agent Plugin
 *
 * Verifies that the machine-readable documentation (agent-manifest.json)
 * stays in sync with the actual Agent plugin source code (Agent.js) and
 * type definitions (Agent.d.ts).
 *
 * This test catches documentation drift that would cause AI/LLM tools
 * to generate incorrect code.
 */

import { describe, test, expect } from "bun:test";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Load source artifacts
// ---------------------------------------------------------------------------

const ROOT = path.resolve(import.meta.dir, "../../..");

const agentSource = fs.readFileSync(
  path.join(ROOT, "src/plugins/Agent.js"),
  "utf8"
);

const manifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, "docs/agent-manifest.json"), "utf8")
);

const agentDts = fs.readFileSync(
  path.join(ROOT, "types/plugins/Agent.d.ts"),
  "utf8"
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract all unique error codes from Agent.js source via `error.code = "..."`.
 */
function extractErrorCodesFromSource(source: string): Set<string> {
  const codes = new Set<string>();
  const regex = /error\.code\s*=\s*"([A-Z_]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(source)) !== null) {
    codes.add(match[1]);
  }
  return codes;
}

/**
 * Extract all unique error codes from the manifest's errors array.
 */
function extractErrorCodesFromManifest(
  errors: Array<{ code: string }>
): Set<string> {
  return new Set(errors.map((e) => e.code));
}

/**
 * Extract all [AgentPlugin] error message patterns from source.
 * Returns the static prefix of each message (before any template literal interpolation).
 */
function extractErrorMessagesFromSource(source: string): string[] {
  const messages: string[] = [];
  // Match both regular strings and template literals
  const regex =
    /new Error\(\s*(?:`\[AgentPlugin\]\s*([^`]*)`|"\[AgentPlugin\]\s*([^"]*)")\s*\)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(source)) !== null) {
    const msg = match[1] || match[2];
    if (msg) {
      // Extract the static prefix (before ${...})
      const staticPart = msg.split("${")[0].trim();
      messages.push(staticPart);
    }
  }
  return messages;
}

/**
 * Extract public method names from the createAgentApi function in source.
 */
function extractPublicMethodsFromSource(source: string): Set<string> {
  const methods = new Set<string>();
  // Match `methodName: agent.methodName.bind(agent)` in createAgentApi
  const apiBlock = source.match(
    /const createAgentApi\s*=\s*\(\)\s*=>\s*\{[\s\S]*?return api;\s*\}/
  );
  if (apiBlock) {
    const regex = /(\w+):\s*agent\.\w+\.bind\(agent\)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(apiBlock[0])) !== null) {
      methods.add(match[1]);
    }
    // Also match conditional assignments: api.methodName = agent.methodName.bind(agent)
    const conditionalRegex = /api\.(\w+)\s*=\s*agent\.\w+\.bind\(agent\)/g;
    while ((match = conditionalRegex.exec(source)) !== null) {
      methods.add(match[1]);
    }
  }
  return methods;
}

/**
 * Extract method names from manifest.
 */
function extractMethodNamesFromManifest(
  methods: Array<{ name: string }>
): Set<string> {
  return new Set(methods.map((m) => m.name));
}

/**
 * Extract configuration option names from source's destructured options.
 */
function extractConfigOptionsFromSource(source: string): Set<string> {
  const options = new Set<string>();
  // Match the destructured options in install()
  const destructure = source.match(/const\s*\{[\s\S]*?\}\s*=\s*options;/);
  if (destructure) {
    const regex = /(\w+)\s*(?:=\s*[^,}]+|:\s*\w+\s*=\s*[^,}]+)?(?:,|\s*\})/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(destructure[0])) !== null) {
      const name = match[1];
      // Skip the renamed aliases (e.g., `actions: preRegisteredActions`)
      if (name !== "const" && name !== "options") {
        options.add(name);
      }
    }
  }
  return options;
}

// =============================================================================
// Tests
// =============================================================================

describe("Agent Docs/Source Parity", () => {
  // -------------------------------------------------------------------------
  // Error Code Parity
  // -------------------------------------------------------------------------

  describe("Error Code Parity", () => {
    const sourceCodes = extractErrorCodesFromSource(agentSource);
    const manifestCodes = extractErrorCodesFromManifest(manifest.errors);

    test("every error code in source exists in manifest", () => {
      const missingInManifest: string[] = [];
      for (const code of sourceCodes) {
        if (!manifestCodes.has(code)) {
          missingInManifest.push(code);
        }
      }
      expect(missingInManifest).toEqual([]);
    });

    test("every error code in manifest exists in source", () => {
      const missingInSource: string[] = [];
      for (const code of manifestCodes) {
        if (!sourceCodes.has(code)) {
          missingInSource.push(code);
        }
      }
      expect(missingInSource).toEqual([]);
    });

    test("source and manifest have same number of unique error codes", () => {
      expect(sourceCodes.size).toBe(manifestCodes.size);
    });

    test("all 6 expected error codes are present", () => {
      const expected = [
        "AGENT_HANDLER_NOT_FUNCTION",
        "AGENT_PERMISSION_DENIED",
        "AGENT_ACTION_NOT_FOUND",
        "AGENT_SCHEMA_VIOLATION",
        "AGENT_COMMAND_INVALID_TYPE",
        "AGENT_HANDLER_ERROR",
      ];
      for (const code of expected) {
        expect(sourceCodes.has(code)).toBe(true);
        expect(manifestCodes.has(code)).toBe(true);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Error Message Parity
  // -------------------------------------------------------------------------

  describe("Error Message Parity", () => {
    test("manifest error messages match source message patterns", () => {
      const sourceMessages = extractErrorMessagesFromSource(agentSource);
      const manifestMessages = manifest.errors.map(
        (e: { message: string }) => e.message
      );

      // Every source message static prefix should appear in some manifest message
      for (const srcMsg of sourceMessages) {
        const found = manifestMessages.some((mMsg: string) =>
          mMsg.startsWith("[AgentPlugin] " + srcMsg)
        );
        if (!found) {
          // Check if it's the handler error (which has dynamic message)
          const isHandlerError = srcMsg === "(original handler error message)";
          if (!isHandlerError) {
            expect(`Source message not found in manifest: "${srcMsg}"`).toBe(
              ""
            );
          }
        }
      }
    });

    test("each manifest error entry has all required fields", () => {
      for (const error of manifest.errors) {
        expect(error).toHaveProperty("code");
        expect(error).toHaveProperty("message");
        expect(error).toHaveProperty("methods");
        expect(error).toHaveProperty("condition");
        expect(error).toHaveProperty("severity");
        expect(Array.isArray(error.methods)).toBe(true);
        expect(error.methods.length).toBeGreaterThan(0);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Error Behavior Parity (execute vs dispatch)
  // -------------------------------------------------------------------------

  describe("AGENT_HANDLER_ERROR Behavior", () => {
    const handlerErrorEntry = manifest.errors.find(
      (e: { code: string; behavior?: object }) =>
        e.code === "AGENT_HANDLER_ERROR" && e.behavior
    );

    test("manifest documents AGENT_HANDLER_ERROR behavior", () => {
      expect(handlerErrorEntry).toBeDefined();
      expect(handlerErrorEntry.behavior).toBeDefined();
    });

    test("execute behavior is documented as thrown: true", () => {
      expect(handlerErrorEntry.behavior.execute).toBeDefined();
      expect(handlerErrorEntry.behavior.execute.thrown).toBe(true);
    });

    test("dispatch behavior is documented as thrown: false", () => {
      expect(handlerErrorEntry.behavior.dispatch).toBeDefined();
      expect(handlerErrorEntry.behavior.dispatch.thrown).toBe(false);
    });

    test("source confirms execute re-throws handler errors", () => {
      // In execute(): catch block ends with `throw error;`
      const executeBlock = agentSource.match(
        /async execute\(name, payload, scope\)\s*\{[\s\S]*?\n      \}/
      );
      expect(executeBlock).toBeTruthy();
      // The catch block should contain `throw error`
      expect(executeBlock![0]).toContain("throw error");
    });

    test("source confirms dispatch does NOT re-throw handler errors", () => {
      // In dispatch(): the for-of loop catches handler errors but doesn't re-throw
      const dispatchBlock = agentSource.match(
        /async dispatch\(command, scope\)\s*\{[\s\S]*?\n      \}/
      );
      expect(dispatchBlock).toBeTruthy();
      // The handler try/catch in dispatch should NOT have `throw rawHandlerError` or `throw handlerError`
      const handlerCatch = dispatchBlock![0].match(
        /catch\s*\(rawHandlerError\)\s*\{[\s\S]*?\}/
      );
      expect(handlerCatch).toBeTruthy();
      expect(handlerCatch![0]).not.toContain("throw rawHandlerError");
      expect(handlerCatch![0]).not.toContain("throw handlerError");
    });
  });

  // -------------------------------------------------------------------------
  // Method Parity
  // -------------------------------------------------------------------------

  describe("Method Parity", () => {
    const sourceMethods = extractPublicMethodsFromSource(agentSource);
    const manifestMethods = extractMethodNamesFromManifest(manifest.methods);

    test("every public method in source is documented in manifest", () => {
      const missingInManifest: string[] = [];
      for (const method of sourceMethods) {
        if (!manifestMethods.has(method)) {
          missingInManifest.push(method);
        }
      }
      expect(missingInManifest).toEqual([]);
    });

    test("every manifest method exists in source", () => {
      const missingInSource: string[] = [];
      for (const method of manifestMethods) {
        if (!sourceMethods.has(method)) {
          missingInSource.push(method);
        }
      }
      expect(missingInSource).toEqual([]);
    });

    test("method count matches", () => {
      expect(sourceMethods.size).toBe(manifestMethods.size);
    });
  });

  // -------------------------------------------------------------------------
  // Method Error Reference Parity
  // -------------------------------------------------------------------------

  describe("Method Error References", () => {
    test("manifest method error arrays reference only valid error codes", () => {
      const validCodes = extractErrorCodesFromManifest(manifest.errors);
      for (const method of manifest.methods) {
        if (method.errors && method.errors.length > 0) {
          for (const code of method.errors) {
            expect(validCodes.has(code)).toBe(true);
          }
        }
      }
    });

    test("error codes referencing methods match manifest method entries", () => {
      // For each error entry, verify the methods listed actually exist
      const methodNames = extractMethodNamesFromManifest(manifest.methods);
      for (const error of manifest.errors) {
        for (const method of error.methods) {
          expect(methodNames.has(method)).toBe(true);
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // Type Definition Parity
  // -------------------------------------------------------------------------

  describe("Type Definition Parity", () => {
    test("AgentErrorContext.method type matches manifest onError description", () => {
      // The .d.ts should have method: "execute" | "dispatch"
      expect(agentDts).toContain('method: "execute" | "dispatch"');
    });

    test("all manifest types have corresponding TypeScript definitions", () => {
      const manifestTypeNames = Object.keys(manifest.types);
      for (const typeName of manifestTypeNames) {
        // Each type should appear in the .d.ts file
        expect(agentDts).toContain(`type ${typeName}`);
      }
    });

    test("AgentApi type in .d.ts includes all manifest methods", () => {
      const manifestMethods = extractMethodNamesFromManifest(manifest.methods);
      for (const method of manifestMethods) {
        // Each method should appear in the AgentApi type
        const pattern = new RegExp(`${method}[?]?:\\s*\\(`);
        expect(pattern.test(agentDts)).toBe(true);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Configuration Parity
  // -------------------------------------------------------------------------

  describe("Configuration Parity", () => {
    test("manifest configuration count matches source options", () => {
      // Source destructures 8 options from the options object
      const sourceOptions = extractConfigOptionsFromSource(agentSource);
      // Remove renamed alias artifacts
      sourceOptions.delete("preRegisteredActions");
      // The source uses 'actions' as the option name (renamed to preRegisteredActions)
      // so we need to make sure 'actions' is counted
      expect(manifest.configuration.length).toBe(sourceOptions.size);
    });

    test("each manifest config option has name, type, default, description", () => {
      for (const config of manifest.configuration) {
        expect(config).toHaveProperty("name");
        expect(config).toHaveProperty("type");
        expect(config).toHaveProperty("default");
        expect(config).toHaveProperty("description");
      }
    });

    test("manifest config option names match source destructured options", () => {
      const manifestConfigNames = new Set(
        manifest.configuration.map((c: { name: string }) => c.name)
      );
      const expectedOptions = [
        "maxLogSize",
        "enableInspection",
        "onError",
        "actions",
        "permissions",
        "emitterEvents",
        "strictPermissions",
        "validateSchemas",
      ];
      for (const name of expectedOptions) {
        expect(manifestConfigNames.has(name)).toBe(true);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Manifest Structural Integrity
  // -------------------------------------------------------------------------

  describe("Manifest Structural Integrity", () => {
    test("manifest has all top-level sections", () => {
      expect(manifest).toHaveProperty("name");
      expect(manifest).toHaveProperty("version");
      expect(manifest).toHaveProperty("framework");
      expect(manifest).toHaveProperty("frameworkVersion");
      expect(manifest).toHaveProperty("contractVersion");
      expect(manifest).toHaveProperty("lastVerified");
      expect(manifest).toHaveProperty("install");
      expect(manifest).toHaveProperty("configuration");
      expect(manifest).toHaveProperty("methods");
      expect(manifest).toHaveProperty("types");
      expect(manifest).toHaveProperty("errors");
      expect(manifest).toHaveProperty("permissions");
      expect(manifest).toHaveProperty("events");
      expect(manifest).toHaveProperty("properties");
    });

    test("contractVersion is a valid semver string", () => {
      expect(manifest.contractVersion).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test("lastVerified is a valid ISO date string", () => {
      expect(manifest.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // Ensure it's a parseable date
      expect(isNaN(Date.parse(manifest.lastVerified))).toBe(false);
    });

    test("manifest version matches plugin source version", () => {
      // Agent.js exports version: "1.0.0"
      const versionMatch = agentSource.match(/version:\s*"([^"]+)"/);
      expect(versionMatch).toBeTruthy();
      expect(manifest.version).toBe(versionMatch![1]);
    });

    test("manifest framework version matches package.json", () => {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(ROOT, "package.json"), "utf8")
      );
      expect(manifest.frameworkVersion).toBe(pkg.version);
    });

    test("permission decision logic has 6 steps", () => {
      expect(manifest.permissions.decisionLogic).toHaveLength(6);
    });

    test("permission modes match source _checkPermission behavior", () => {
      // Source has strictPermissions mode check
      expect(agentSource).toContain("this._strictPermissions");
      expect(manifest.permissions.modes.default).toBeDefined();
      expect(manifest.permissions.modes.strict).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // Events Parity
  // -------------------------------------------------------------------------

  describe("Events Parity", () => {
    test("manifest has 5 events", () => {
      expect(manifest.events).toHaveLength(5);
    });

    test("all expected event names are documented", () => {
      const names = manifest.events.map((e: any) => e.name);
      expect(names).toContain("agent:register");
      expect(names).toContain("agent:unregister");
      expect(names).toContain("agent:execute");
      expect(names).toContain("agent:execute:error");
      expect(names).toContain("agent:dispatch");
    });

    test("each event has name, payload, and description", () => {
      for (const event of manifest.events) {
        expect(event).toHaveProperty("name");
        expect(event).toHaveProperty("payload");
        expect(event).toHaveProperty("description");
      }
    });

    test("source emits all documented events", () => {
      for (const event of manifest.events) {
        expect(agentSource).toContain(`"${event.name}"`);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Properties Parity
  // -------------------------------------------------------------------------

  describe("Properties Parity", () => {
    test("manifest has 2 properties", () => {
      expect(manifest.properties).toHaveLength(2);
    });

    test("properties include actionCount and lastActivity", () => {
      const names = manifest.properties.map((p: any) => p.name);
      expect(names).toContain("actionCount");
      expect(names).toContain("lastActivity");
    });

    test("each property has name, type, and description", () => {
      for (const prop of manifest.properties) {
        expect(prop).toHaveProperty("name");
        expect(prop).toHaveProperty("type");
        expect(prop).toHaveProperty("description");
      }
    });

    test("AgentApi type in .d.ts includes signal properties", () => {
      expect(agentDts).toContain("actionCount:");
      expect(agentDts).toContain("lastActivity:");
    });
  });
});
