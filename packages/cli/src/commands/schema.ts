/**
 * CLI command: rebase schema <action>
 *
 * Subcommands:
 *   generate — Generate Drizzle schema from Rebase collection definitions
 */
import arg from "arg";
import chalk from "chalk";
import fs from "fs";
import { spawn } from "child_process";
import path from "path";
import {
    requireProjectRoot,
    requireBackendDir,
    resolveSchemaGeneratorScript,
    resolveTsx,
    findEnvFile
} from "../utils/project";

export async function schemaCommand(subcommand: string | undefined, rawArgs: string[]): Promise<void> {
    if (!subcommand || subcommand === "--help") {
        printSchemaHelp();
        return;
    }

    switch (subcommand) {
        case "generate":
            await schemaGenerate(rawArgs);
            break;
        default:
            console.error(chalk.red(`Unknown schema command: ${subcommand}`));
            console.log("");
            printSchemaHelp();
            process.exit(1);
    }
}

async function schemaGenerate(rawArgs: string[]): Promise<void> {
    const args = arg(
        {
            "--collections": String,
            "--output": String,
            "--watch": Boolean,
            "-c": "--collections",
            "-o": "--output",
            "-w": "--watch",
        },
        {
            argv: rawArgs.slice(4), // skip "node rebase schema generate"
            permissive: true,
        }
    );

    const projectRoot = requireProjectRoot();
    const backendDir = requireBackendDir(projectRoot);

    // Resolve the schema generator script
    const generatorScript = resolveSchemaGeneratorScript(projectRoot);
    if (!generatorScript) {
        console.error(chalk.red("✗ Could not find generate-drizzle-schema.ts"));
        console.error(chalk.gray("  Make sure @rebasepro/backend is installed."));
        process.exit(1);
    }

    // Resolve tsx
    const tsxBin = resolveTsx(projectRoot);
    if (!tsxBin) {
        console.error(chalk.red("✗ Could not find tsx binary."));
        console.error(chalk.gray("  Install it with: pnpm add -D tsx"));
        process.exit(1);
    }

    // Defaults
    const collectionsPath = args["--collections"] || path.join("..", "shared", "collections");
    const outputPath = args["--output"] || path.join("src", "schema.generated.ts");
    const watch = args["--watch"] || false;

    console.log("");
    console.log(chalk.bold("  🔧 Rebase Schema Generator"));
    console.log("");
    console.log(`  ${chalk.gray("Collections:")} ${path.resolve(backendDir, collectionsPath)}`);
    console.log(`  ${chalk.gray("Output:")}      ${path.resolve(backendDir, outputPath)}`);
    if (watch) {
        console.log(`  ${chalk.gray("Mode:")}        ${chalk.cyan("watching for changes")}`);
    }
    console.log("");

    // Build the command exactly as it would appear in package.json scripts
    // Resolve symlinks first — pnpm symlinks packages into node_modules,
    // but tsx resolves import.meta.url using the real path.
    const realGeneratorScript = fs.realpathSync(generatorScript);
    const relativeGeneratorPath = path.relative(backendDir, realGeneratorScript);

    const cmdParts = [
        tsxBin,
        relativeGeneratorPath,
        `--collections=${collectionsPath}`,
        `--output=${outputPath}`,
    ];
    if (watch) {
        cmdParts.push("--watch");
    }

    // Resolve env file for DOTENV_CONFIG_PATH
    const envFile = findEnvFile(projectRoot);
    const env: Record<string, string> = { ...process.env as Record<string, string> };
    if (envFile) {
        env.DOTENV_CONFIG_PATH = envFile;
    }

    // Shell out to tsx using shell mode to match package.json behavior
    const child = spawn(cmdParts.join(" "), {
        cwd: backendDir,
        stdio: "inherit",
        env,
        shell: true,
    });

    return new Promise((resolve, reject) => {
        child.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                process.exit(code ?? 1);
            }
        });
        child.on("error", (err) => {
            console.error(chalk.red(`✗ Failed to run schema generator: ${err.message}`));
            reject(err);
        });
    });
}

function printSchemaHelp() {
    console.log(`
${chalk.bold("rebase schema")} — Schema management commands

${chalk.green.bold("Usage")}
  rebase schema ${chalk.blue("<command>")} [options]

${chalk.green.bold("Commands")}
  ${chalk.blue.bold("generate")}    Generate Drizzle schema from collection definitions

${chalk.green.bold("generate Options")}
  ${chalk.blue("--collections, -c")}  Path to collections directory (default: ./shared/collections)
  ${chalk.blue("--output, -o")}       Output path for generated schema (default: ./backend/src/schema.generated.ts)
  ${chalk.blue("--watch, -w")}        Watch for changes and regenerate automatically
`);
}
