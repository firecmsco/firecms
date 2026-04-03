import chalk from "chalk";
import arg from "arg";
import { createRebaseApp } from "./commands/init";
import { generateSdkCommand } from "./commands/generate_sdk";
import { schemaCommand } from "./commands/schema";
import { dbCommand } from "./commands/db";
import { devCommand } from "./commands/dev";
import { authCommand } from "./commands/auth";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getVersion(): string {
    try {
        // Try to read version from package.json
        const pkgPath = path.resolve(__dirname, "../package.json");
        if (fs.existsSync(pkgPath)) {
            return JSON.parse(fs.readFileSync(pkgPath, "utf-8")).version;
        }
    } catch {
        // ignore
    }
    return "unknown";
}

export async function entry(args: string[]) {
    const parsedArgs = arg(
        {
            "--version": Boolean,
            "--help": Boolean,
            "-v": "--version",
            "-h": "--help"
        },
        {
            argv: args.slice(2),
            permissive: true
        }
    );

    if (parsedArgs["--version"]) {
        console.log(getVersion());
        return;
    }

    const command = parsedArgs._[0];
    const subcommand = parsedArgs._[1];

    // Show global help only when no command given, or --help with no recognized command
    const namespacedCommands = ["schema", "db", "dev", "auth"];
    if (!command || (parsedArgs["--help"] && !namespacedCommands.includes(command))) {
        printHelp();
        return;
    }

    // For namespaced commands with --help, pass it through as subcommand
    const effectiveSubcommand = parsedArgs["--help"] ? "--help" : subcommand;

    switch (command) {
        case "init":
            await createRebaseApp(args);
            break;

        case "generate-sdk":
            // Legacy command — kept for backward compatibility
            const sdkArgs = arg(
                {
                    "--collections-dir": String,
                    "--output": String,
                    "-c": "--collections-dir",
                    "-o": "--output",
                },
                {
                    argv: args.slice(3),
                    permissive: true,
                }
            );
            await generateSdkCommand({
                collectionsDir: sdkArgs["--collections-dir"] || "./shared/collections",
                output: sdkArgs["--output"] || "./generated/sdk",
                cwd: process.cwd(),
            });
            break;

        case "schema":
            await schemaCommand(effectiveSubcommand, args);
            break;

        case "db":
            await dbCommand(effectiveSubcommand, args);
            break;

        case "dev":
            await devCommand(args);
            break;

        case "auth":
            await authCommand(effectiveSubcommand, args);
            break;

        default:
            console.log(chalk.red(`Unknown command: ${command}`));
            console.log("");
            printHelp();
    }
}

function printHelp() {
    console.log(`
${chalk.bold("Rebase CLI")} — Developer tools for Rebase projects

${chalk.green.bold("Usage")}
  rebase ${chalk.blue("<command>")} [options]

${chalk.green.bold("Commands")}
  ${chalk.blue.bold("init")}                    Create a new Rebase project
  ${chalk.blue.bold("dev")}                     Start the development server

${chalk.green.bold("Schema")}
  ${chalk.blue.bold("schema generate")}         Generate Drizzle schema from collections
  ${chalk.blue.bold("schema")} ${chalk.gray("--help")}           Show schema command help

${chalk.green.bold("Database")}
  ${chalk.blue.bold("db push")}                 Apply schema directly to database ${chalk.gray("(dev)")}
  ${chalk.blue.bold("db pull")}                 Introspect database → Drizzle schema
  ${chalk.blue.bold("db generate")}             Generate SQL migration files
  ${chalk.blue.bold("db migrate")}              Run pending migrations
  ${chalk.blue.bold("db studio")}               Open Drizzle Studio
  ${chalk.blue.bold("db")} ${chalk.gray("--help")}               Show database command help

${chalk.green.bold("SDK")}
  ${chalk.blue.bold("generate-sdk")}            Generate a typed JS SDK from collections

${chalk.green.bold("Auth")}
  ${chalk.blue.bold("auth reset-password")}     Reset a user's password
  ${chalk.blue.bold("auth")} ${chalk.gray("--help")}              Show auth command help

${chalk.green.bold("Options")}
  ${chalk.blue("--version, -v")}   Show version number
  ${chalk.blue("--help, -h")}      Show this help message

${chalk.gray("Documentation: https://rebase.pro/docs")}
`);
}
