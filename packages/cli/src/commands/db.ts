/**
 * CLI command: rebase db <action>
 *
 * Subcommands:
 *   push     — Apply schema directly to database (development)
 *   pull     — Introspect database → Drizzle schema
 *   generate — Generate SQL migration files (runs schema generate first)
 *   migrate  — Run pending migrations
 *   studio   — Open Drizzle Studio
 */
import arg from "arg";
import chalk from "chalk";
import execa from "execa";
import path from "path";
import {
    requireProjectRoot,
    requireBackendDir,
    resolveLocalBin,
    findEnvFile,
} from "../utils/project";
import { schemaCommand } from "./schema";

type DbAction = "push" | "pull" | "generate" | "migrate" | "studio";

const VALID_ACTIONS: DbAction[] = ["push", "pull", "generate", "migrate", "studio"];

export async function dbCommand(subcommand: string | undefined, rawArgs: string[]): Promise<void> {
    if (!subcommand || subcommand === "--help") {
        printDbHelp();
        return;
    }

    if (!VALID_ACTIONS.includes(subcommand as DbAction)) {
        console.error(chalk.red(`Unknown db command: ${subcommand}`));
        console.log("");
        printDbHelp();
        process.exit(1);
    }

    const action = subcommand as DbAction;

    if (action === "generate") {
        await dbGenerate(rawArgs);
    } else {
        await runDrizzleKit(action, rawArgs);
    }
}

/**
 * `rebase db generate` — runs schema generation first, then drizzle-kit generate.
 */
async function dbGenerate(rawArgs: string[]): Promise<void> {
    console.log("");
    console.log(chalk.bold("  📦 Rebase DB Generate"));
    console.log(chalk.gray("  Step 1/2: Generating Drizzle schema from collections..."));
    console.log("");

    // Run schema generate first
    await schemaCommand("generate", rawArgs);

    console.log("");
    console.log(chalk.gray("  Step 2/2: Generating SQL migration files..."));
    console.log("");

    // Then run drizzle-kit generate
    await runDrizzleKit("generate", rawArgs);

    console.log("");
    console.log(
        `  You can now run ${chalk.bold.green("rebase db migrate")} to apply the migrations to your database.`
    );
    console.log("");
}

/**
 * Run a drizzle-kit command with the correct CWD and environment.
 */
async function runDrizzleKit(action: string, _rawArgs: string[]): Promise<void> {
    const projectRoot = requireProjectRoot();
    const backendDir = requireBackendDir(projectRoot);

    // Resolve drizzle-kit binary
    const drizzleKitBin = resolveLocalBin(projectRoot, "drizzle-kit");
    if (!drizzleKitBin) {
        console.error(chalk.red("✗ Could not find drizzle-kit binary."));
        console.error(chalk.gray("  Install it with: pnpm add -D drizzle-kit"));
        process.exit(1);
    }

    // Set up environment with DOTENV_CONFIG_PATH
    const envFile = findEnvFile(projectRoot);
    const env: Record<string, string> = { ...process.env as Record<string, string> };
    if (envFile) {
        env.DOTENV_CONFIG_PATH = envFile;
    }

    // Shell out to drizzle-kit
    try {
        await execa(drizzleKitBin, [action], {
            cwd: backendDir,
            stdio: "inherit",
            env,
        });
    } catch (err: any) {
        console.error(chalk.red(`✗ Failed to run drizzle-kit ${action}: ${err.message}`));
        process.exit(1);
    }
}

function printDbHelp() {
    console.log(`
${chalk.bold("rebase db")} — Database management commands

${chalk.green.bold("Usage")}
  rebase db ${chalk.blue("<command>")} [options]

${chalk.green.bold("Commands")}
  ${chalk.blue.bold("push")}       Apply schema directly to database (development)
  ${chalk.blue.bold("pull")}       Introspect database → Drizzle schema
  ${chalk.blue.bold("generate")}   Generate SQL migration files (runs schema generate first)
  ${chalk.blue.bold("migrate")}    Run pending migrations
  ${chalk.blue.bold("studio")}     Open Drizzle Studio

${chalk.green.bold("Examples")}
  ${chalk.gray("# Quick development workflow")}
  rebase schema generate && rebase db push

  ${chalk.gray("# Production migration workflow")}
  rebase db generate
  rebase db migrate
`);
}
