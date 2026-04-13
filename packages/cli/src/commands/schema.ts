/**
 * CLI command: rebase schema <action>
 */
import chalk from "chalk";
import execa from "execa";
import {
    requireProjectRoot,
    requireBackendDir,
    getActiveBackendPlugin,
    resolvePluginCliScript,
    resolveTsx,
    findEnvFile
} from "../utils/project";

export async function schemaCommand(subcommand: string | undefined, rawArgs: string[]): Promise<void> {
    if (!subcommand || subcommand === "--help") {
        printSchemaHelp();
        return;
    }

    const projectRoot = requireProjectRoot();
    const backendDir = requireBackendDir(projectRoot);

    const activePlugin = getActiveBackendPlugin(backendDir);
    if (!activePlugin) {
        console.error(chalk.red("✗ Could not detect an active database plugin."));
        console.error(chalk.gray("  Make sure a package like @rebasepro/postgresql-backend is installed in backend/package.json."));
        process.exit(1);
    }

    const pluginCli = resolvePluginCliScript(backendDir, activePlugin);
    if (!pluginCli) {
        console.error(chalk.red(`✗ Could not find CLI entry point for ${activePlugin}.`));
        process.exit(1);
    }

    // Set up environment with DOTENV_CONFIG_PATH
    const envFile = findEnvFile(projectRoot);
    const env: Record<string, string> = { ...process.env as Record<string, string> };
    if (envFile) {
        env.DOTENV_CONFIG_PATH = envFile;
    }

    try {
        const isTs = pluginCli.endsWith(".ts");
        if (isTs) {
            const tsxBin = resolveTsx(projectRoot);
            if (!tsxBin) {
                console.error(chalk.red("✗ Could not find tsx binary."));
                process.exit(1);
            }
            await execa(tsxBin, [pluginCli, "schema", subcommand, ...rawArgs.slice(2)], {
                cwd: backendDir,
                stdio: "inherit",
                env,
            });
        } else {
            await execa("node", [pluginCli, "schema", subcommand, ...rawArgs.slice(2)], {
                cwd: backendDir,
                stdio: "inherit",
                env,
            });
        }
    } catch (err: unknown) {
        process.exit(1);
    }
}

function printSchemaHelp() {
    console.log(`
${chalk.bold("rebase schema")} — Schema management commands

${chalk.green.bold("Usage")}
  rebase schema ${chalk.blue("<command>")} [options]

${chalk.green.bold("Commands")}
  ${chalk.gray("(Commands are provided by your active database driver plugin)")}
  ${chalk.blue.bold("generate")}    Generate Schema from collection definitions

${chalk.green.bold("generate Options")}
  ${chalk.blue("--collections, -c")}  Path to collections directory
  ${chalk.blue("--output, -o")}       Output path for generated schema
  ${chalk.blue("--watch, -w")}        Watch for changes and regenerate automatically
`);
}
