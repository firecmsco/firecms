import chalk from "chalk";
import arg from "arg";
import { createRebaseApp } from "./commands/init";
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

    if (!command || parsedArgs["--help"]) {
        printHelp();
        return;
    }

    if (command === "init") {
        await createRebaseApp(args);
    } else {
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
  ${chalk.blue.bold("init")}      Create a new Rebase project

${chalk.green.bold("Options")}
  ${chalk.blue("--version, -v")}   Show version number
  ${chalk.blue("--help, -h")}      Show this help message

${chalk.gray("Documentation: https://rebase.pro/docs")}
`);
}
