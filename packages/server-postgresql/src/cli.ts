import arg from "arg";
import chalk from "chalk";
import execa from "execa";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveLocalBin(binName: string): string | null {
    let cwd = process.cwd();
    // Try to find node_modules/.bin upwards
    while (cwd !== "/") {
        const candidate = path.join(cwd, "node_modules", ".bin", binName);
        if (fs.existsSync(candidate)) return candidate;
        cwd = path.dirname(cwd);
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

export async function runPluginCommand(args: string[]) {
    const domain = args[0]; // "db" or "schema"
    const subcommand = args[1];

    if (domain === "db") {
        await dbCommand(subcommand, args);
    } else if (domain === "schema") {
        await schemaCommand(subcommand, args);
    } else {
        console.error(chalk.red(`Unknown domain command: ${domain}`));
        process.exit(1);
    }
}

async function dbCommand(subcommand: string, rawArgs: string[]): Promise<void> {
    const VALID_ACTIONS = ["push", "pull", "generate", "migrate", "studio"];
    if (!subcommand || !VALID_ACTIONS.includes(subcommand)) {
        console.error(chalk.red(`Unknown db command. Valid: ${VALID_ACTIONS.join(", ")}`));
        process.exit(1);
    }

    if (subcommand === "generate") {
        console.log("");
        console.log(chalk.bold("  📦 Rebase DB Generate"));
        console.log(chalk.gray("  Step 1/2: Generating Drizzle schema from collections..."));
        console.log("");
        await schemaCommand("generate", rawArgs);
        console.log("");
        console.log(chalk.gray("  Step 2/2: Generating SQL migration files..."));
        console.log("");
        await runDrizzleKit("generate", rawArgs);
        console.log("");
        console.log(`  You can now run ${chalk.bold.green("rebase db migrate")} to apply the migrations to your database.`);
        console.log("");
    } else {
        await runDrizzleKit(subcommand, rawArgs);
    }
}

async function runDrizzleKit(action: string, _rawArgs: string[]): Promise<void> {
    const drizzleKitBin = resolveLocalBin("drizzle-kit");
    if (!drizzleKitBin) {
        console.error(chalk.red("✗ Could not find drizzle-kit binary."));
        console.error(chalk.gray("  Install it with: pnpm add -D drizzle-kit"));
        process.exit(1);
    }

    try {
        await execa(drizzleKitBin, [action], {
            cwd: process.cwd(),
            stdio: "inherit",
            env: { ...process.env as Record<string, string> },
        });
    } catch (err: unknown) {
        console.error(chalk.red(`✗ Failed to run drizzle-kit ${action}: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
    }
}

async function schemaCommand(subcommand: string, rawArgs: string[]): Promise<void> {
    if (subcommand === "generate") {
        const argsList = arg(
            {
                "--collections": String,
                "--output": String,
                "--watch": Boolean,
                "-c": "--collections",
                "-o": "--output",
                "-w": "--watch",
            },
            {
                argv: rawArgs.slice(2), // db generate ... or schema generate ...
                permissive: true,
            }
        );

        // Here we just invoke the local generate-drizzle-schema.ts since we are inside the postgresql-backend
        // If installed in node_modules, __dirname is node_modules/@rebasepro/server-postgresql/dist or src.
        const generatorScript = path.join(__dirname, "generate-drizzle-schema.ts");
        if (!fs.existsSync(generatorScript)) {
            // fallback for dev mode
            if (fs.existsSync(path.join(__dirname, "generate-drizzle-schema.ts"))) {
                 // it's true
            } else {
                 console.error(chalk.red(`✗ Could not find generate-drizzle-schema.ts near ${__dirname}`));
                 process.exit(1);
            }
        }
        
        const tsxBin = resolveLocalBin("tsx");
        if (!tsxBin) {
            console.error(chalk.red("✗ Could not find tsx binary."));
            process.exit(1);
        }

        const collectionsPath = argsList["--collections"] || path.join("..", "shared", "collections");
        const outputPath = argsList["--output"] || path.join("src", "schema.generated.ts");
        const watch = argsList["--watch"] || false;

        console.log("");
        console.log(chalk.bold("  🔧 Rebase Schema Generator"));
        console.log("");
        
        const cmdParts = [
            tsxBin,
            generatorScript,
            `--collections=${collectionsPath}`,
            `--output=${outputPath}`,
        ];
        if (watch) {
            cmdParts.push("--watch");
        }

        try {
            await execa(cmdParts[0], cmdParts.slice(1), {
                cwd: process.cwd(),
                stdio: "inherit",
                env: { ...process.env as Record<string, string> },
            });
        } catch (err: unknown) {
            console.error(chalk.red(`✗ Failed to run schema generator: ${err instanceof Error ? err.message : String(err)}`));
            process.exit(1);
        }
    } else {
        console.error(chalk.red(`Unknown schema command.`));
        process.exit(1);
    }
}

// Entry point when called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    // Drop node and script path
    runPluginCommand(process.argv.slice(2)).catch(() => process.exit(1));
}
