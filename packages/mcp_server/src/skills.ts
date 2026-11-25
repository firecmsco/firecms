import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { SkillCatalog } from "@modelcontextprotocol/server/ext/skills";
import { loadSkills } from "@modelcontextprotocol/server/ext/skills/node";

export type { SkillCatalog } from "@modelcontextprotocol/server/ext/skills";

/**
 * Where `@firecms/agent-skills` keeps its skills: `<package>/skills`, one folder per
 * skill with a `SKILL.md`. Resolved through the package's `package.json`, so it works
 * from the workspace symlink and from an installed package alike.
 */
export function agentSkillsDir(): string {
    const require = createRequire(import.meta.url);
    return join(dirname(require.resolve("@firecms/agent-skills/package.json")), "skills");
}

/**
 * The FireCMS agent skills as a catalog for the MCP skills extension
 * (`io.modelcontextprotocol/skills`), or `undefined` when they cannot be loaded: the
 * server then starts without the skills capability and every tool still works.
 *
 * Everything it reports goes to stderr: on the stdio server, stdout is the protocol.
 */
export async function loadFireCMSSkills(dir?: string): Promise<SkillCatalog | undefined> {
    try {
        return await loadSkills(dir ?? agentSkillsDir(), {
            // The skills ship inside the installed package: the same for every caller,
            // and fixed until the package is upgraded.
            cacheHint: { ttlMs: 300_000, cacheScope: "public" },
            onWarning: (warning) => process.stderr.write(`[firecms-mcp] skill ${warning.path}: ${warning.message}\n`),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        process.stderr.write(`[firecms-mcp] serving without agent skills: ${message}\n`);
        return undefined;
    }
}
