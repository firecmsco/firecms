/**
 * CLI command: generate-sdk
 *
 * Reads collection definitions from a specified directory (default: ./shared/collections),
 * generates a typed JS SDK, and writes it to the output directory (default: ./generated/sdk).
 *
 * Uses jiti for dynamic TypeScript import of collection files.
 */

import fs from "fs";
import path from "path";
import chalk from "chalk";
import { EntityCollection } from "@rebasepro/types";
import { generateSDK, GeneratedFile } from "@rebasepro/sdk_generator";

interface GenerateSDKArgs {
    collectionsDir: string;
    output: string;
    cwd: string;
}

/**
 * Dynamically load collection definitions from a directory.
 *
 * Expects the directory to have an index.ts/index.js that exports a default
 * array of EntityCollection objects (matching the app/shared/collections pattern).
 */
async function loadCollections(collectionsDir: string): Promise<EntityCollection[]> {
    const absDir = path.resolve(collectionsDir);

    if (!fs.existsSync(absDir)) {
        throw new Error(`Collections directory not found: ${absDir}`);
    }

    // Try to import the index file using jiti (supports TypeScript natively)
    let jiti: (id: string, userOptions?: Record<string, unknown>) => (modulePath: string) => Record<string, unknown>;
    try {
        const jitiModule = await import("jiti");
        jiti = (jitiModule.default || jitiModule) as unknown as typeof jiti;
    } catch {
        throw new Error(
            "Could not load 'jiti'. Install it with: pnpm add -D jiti\n" +
            "jiti is required to dynamically import TypeScript collection definitions."
        );
    }

    const jitiInstance = jiti(absDir, {
        interopDefault: true,
        esmResolve: true,
    });

    // Look for index file
    const indexCandidates = ["index.ts", "index.js", "index.mjs"];
    let indexPath: string | null = null;

    for (const candidate of indexCandidates) {
        const p = path.join(absDir, candidate);
        if (fs.existsSync(p)) {
            indexPath = p;
            break;
        }
    }

    if (!indexPath) {
        // Fallback: load each .ts/.js file individually
        console.log(chalk.yellow("  No index file found, scanning individual collection files..."));
        const collections: EntityCollection[] = [];
        const files = fs.readdirSync(absDir).filter(f =>
            (f.endsWith(".ts") || f.endsWith(".js")) && !f.startsWith(".")
        );

        for (const file of files) {
            try {
                const mod = jitiInstance(path.join(absDir, file));
                const exported = mod.default || mod;
                if (exported && typeof exported === "object" && "slug" in exported) {
                    collections.push(exported as EntityCollection);
                } else if (Array.isArray(exported)) {
                    collections.push(...exported);
                }
            } catch (err) {
                console.warn(chalk.yellow(`  ⚠ Skipping ${file}: ${(err as Error).message}`));
            }
        }

        return collections;
    }

    // Import the index
    const mod = jitiInstance(indexPath);
    const exported = mod.default || mod;

    if (Array.isArray(exported)) {
        return exported as EntityCollection[];
    } else if (typeof exported === "object" && exported !== null) {
        // Could be a named export like { collections: [...] }
        if ("collections" in exported && Array.isArray(exported.collections)) {
            return exported.collections;
        }
        // Or individual named exports
        const collections: EntityCollection[] = [];
        for (const value of Object.values(exported)) {
            if (value && typeof value === "object" && "slug" in (value as EntityCollection)) {
                collections.push(value as EntityCollection);
            }
        }
        if (collections.length > 0) return collections;
    }

    throw new Error(
        `Could not extract collections from ${indexPath}.\n` +
        `Expected a default export of EntityCollection[] or an object with named collection exports.`
    );
}

/**
 * Write generated files to the output directory.
 */
function writeFiles(outputDir: string, files: GeneratedFile[]): void {
    const absOutput = path.resolve(outputDir);

    // Create output directory
    fs.mkdirSync(absOutput, { recursive: true });

    for (const file of files) {
        const filePath = path.join(absOutput, file.path);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, file.content, "utf-8");
    }
}

/**
 * Main entry point for the generate-sdk command.
 */
export async function generateSdkCommand(args: GenerateSDKArgs): Promise<void> {
    const { collectionsDir, output, cwd } = args;

    const resolvedCollectionsDir = path.isAbsolute(collectionsDir)
        ? collectionsDir
        : path.join(cwd, collectionsDir);

    const resolvedOutput = path.isAbsolute(output)
        ? output
        : path.join(cwd, output);

    console.log("");
    console.log(chalk.bold("  🔧 Rebase SDK Generator"));
    console.log("");
    console.log(`  ${chalk.gray("Collections:")} ${resolvedCollectionsDir}`);
    console.log(`  ${chalk.gray("Output:")}      ${resolvedOutput}`);
    console.log("");

    // 1. Load collections
    console.log(chalk.cyan("  → Loading collection definitions..."));
    const collections = await loadCollections(resolvedCollectionsDir);

    if (collections.length === 0) {
        console.log(chalk.red("  ✗ No collections found. Nothing to generate."));
        process.exit(1);
    }

    console.log(chalk.green(`  ✓ Found ${collections.length} collection(s): ${collections.map(c => c.slug).join(", ")}`));
    console.log("");

    // 2. Generate SDK files
    console.log(chalk.cyan("  → Generating SDK files..."));
    const files = generateSDK(collections);
    console.log(chalk.green(`  ✓ Generated ${files.length} file(s)`));

    // 3. Write to disk
    console.log(chalk.cyan(`  → Writing to ${resolvedOutput}...`));
    writeFiles(resolvedOutput, files);

    console.log("");
    console.log(chalk.green.bold("  ✓ SDK generated successfully!"));
    console.log("");
    console.log(chalk.gray("  Usage:"));
    console.log(chalk.gray(`    import { createRebaseClient } from '@rebasepro/client';`));
    console.log(chalk.gray(`    import type { Database } from './${path.relative(cwd, path.join(resolvedOutput, "database.types"))}';`));
    console.log("");
    console.log(chalk.gray("    const rebase = createRebaseClient<Database>({"));
    console.log(chalk.gray("        baseUrl: 'http://localhost:3001',"));
    console.log(chalk.gray("        // token: 'your-jwt-token',"));
    console.log(chalk.gray("    });"));
    console.log("");
    console.log(chalk.gray(`    const { data } = await rebase.collection('${collections[0]?.slug || "my_collection"}').find();`));
    console.log("");
}
