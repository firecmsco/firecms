/**
 * Project discovery utilities for the Rebase CLI.
 *
 * These helpers locate the project root, backend directory, .env file,
 * and local binaries — used by all CLI command modules.
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import chalk from "chalk";

/**
 * Walk up from `startDir` to find the Rebase project root.
 *
 * The root is identified by a `package.json` that either:
 * - has `workspaces` containing "backend" or "frontend", OR
 * - has a sibling `backend/` directory
 */
export function findProjectRoot(startDir: string = process.cwd()): string | null {
    let dir = path.resolve(startDir);
    const root = path.parse(dir).root;

    while (dir !== root) {
        const pkgPath = path.join(dir, "package.json");

        if (fs.existsSync(pkgPath)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
                // Check for workspace-based project (monorepo root)
                if (pkg.workspaces && Array.isArray(pkg.workspaces)) {
                    const hasBackend = pkg.workspaces.some((w: string) =>
                        w === "backend" || w.includes("backend")
                    );
                    if (hasBackend) return dir;
                }
            } catch {
                // ignore parse errors
            }

            // Check for sibling backend directory
            if (fs.existsSync(path.join(dir, "backend")) && fs.existsSync(path.join(dir, "shared"))) {
                return dir;
            }
        }

        dir = path.dirname(dir);
    }

    return null;
}

/**
 * Locate the backend directory within the project root.
 */
export function findBackendDir(projectRoot: string): string | null {
    const backendDir = path.join(projectRoot, "backend");
    return fs.existsSync(backendDir) ? backendDir : null;
}

/**
 * Detect the active backend plugin (e.g. @rebasepro/postgresql-backend) from the backend's package.json.
 */
export function getActiveBackendPlugin(backendDir: string): string | null {
    const pkgPath = path.join(backendDir, "package.json");
    if (!fs.existsSync(pkgPath)) return null;

    try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        
        // Find the first dependency that matches @rebasepro/*-backend, but isn't just @rebasepro/backend
        for (const dep of Object.keys(deps)) {
            if (dep.startsWith("@rebasepro/") && dep.endsWith("-backend") && dep !== "@rebasepro/backend") {
                return dep;
            }
        }
    } catch {
        // Ignore parse errors
    }
    return null;
}

/**
 * Resolve the active plugin's CLI script.
 */
export function resolvePluginCliScript(backendDir: string, pluginName: string): string | null {
    const candidates = [
        path.join(backendDir, "node_modules", pluginName, "src", "cli.ts"),
        path.join(backendDir, "node_modules", pluginName, "dist", "cli.js"),
        // For monorepo dev mode:
        path.resolve(backendDir, "..", "..", "packages", pluginName.replace("@rebasepro/", ""), "src", "cli.ts"),
        path.resolve(backendDir, "..", "packages", pluginName.replace("@rebasepro/", ""), "src", "cli.ts"),
    ];

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) return candidate;
    }
    return null;
}

/**
 * Locate the frontend directory within the project root.
 */
export function findFrontendDir(projectRoot: string): string | null {
    const frontendDir = path.join(projectRoot, "frontend");
    return fs.existsSync(frontendDir) ? frontendDir : null;
}

/**
 * Find the .env file. Checks the project root first, then backend.
 */
export function findEnvFile(projectRoot: string): string | null {
    const candidates = [
        path.join(projectRoot, ".env"),
        path.join(projectRoot, "backend", ".env"),
    ];

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) return candidate;
    }

    return null;
}

/**
 * Resolve a binary from the project's node_modules/.bin.
 * Checks backend, root, parent monorepo root, then falls back to PATH.
 */
export function resolveLocalBin(projectRoot: string, binName: string): string | null {
    const candidates = [
        path.join(projectRoot, "backend", "node_modules", ".bin", binName),
        path.join(projectRoot, "node_modules", ".bin", binName),
    ];

    // Also check parent directories (for monorepo setups where app/ is nested)
    let parent = path.dirname(projectRoot);
    const rootDir = path.parse(parent).root;
    while (parent !== rootDir) {
        candidates.push(path.join(parent, "node_modules", ".bin", binName));
        parent = path.dirname(parent);
    }

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) return candidate;
    }

    // Fall back to globally installed binary via which
    try {
        const globalPath = execSync(`which ${binName}`, { encoding: "utf-8" }).trim();
        if (globalPath && fs.existsSync(globalPath)) return globalPath;
    } catch {
        // not found globally
    }

    return null;
}

/**
 * Resolve the tsx binary. Checks backend node_modules first, then root.
 */
export function resolveTsx(projectRoot: string): string | null {
    return resolveLocalBin(projectRoot, "tsx");
}

/**
 * Require the project root or exit with a helpful error.
 */
export function requireProjectRoot(): string {
    const root = findProjectRoot();
    if (!root) {
        console.error(chalk.red("✗ Could not find a Rebase project root."));
        console.error(chalk.gray("  Make sure you are inside a Rebase project directory"));
        console.error(chalk.gray("  (one with backend/, frontend/, and shared/ directories)."));
        process.exit(1);
    }
    return root;
}

/**
 * Require the backend directory or exit with a helpful error.
 */
export function requireBackendDir(projectRoot: string): string {
    const backendDir = findBackendDir(projectRoot);
    if (!backendDir) {
        console.error(chalk.red("✗ Could not find a backend/ directory."));
        console.error(chalk.gray(`  Expected at: ${path.join(projectRoot, "backend")}`));
        process.exit(1);
    }
    return backendDir;
}
