/**
 * CLI command: rebase db <action>
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

export async function dbCommand(subcommand: string | undefined, rawArgs: string[]): Promise<void> {
    if (!subcommand || subcommand === "--help") {
        printDbHelp();
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
            await execa(tsxBin, [pluginCli, "db", subcommand, ...rawArgs.slice(2)], {
                cwd: backendDir,
                stdio: "inherit",
                env,
            });
        } else {
            await execa("node", [pluginCli, "db", subcommand, ...rawArgs.slice(2)], {
                cwd: backendDir,
                stdio: "inherit",
                env,
            });
        }
    } catch (err: unknown) {
        // If the process exits with an error code, execa will throw, 
        // but inherit stdio means the user already saw the output.
        process.exit(1);
    }
}

function printDbHelp() {
    console.log(`
${chalk.bold("rebase db")} — Database management commands

${chalk.green.bold("Usage")}
  rebase db ${chalk.blue("<command>")} [options]

${chalk.green.bold("Commands")}
  ${chalk.gray("(Commands are provided by your active database driver plugin)")}
  ${chalk.blue.bold("push")}       Apply schema directly to database (development)
  ${chalk.blue.bold("pull")}       Introspect database → Schema
  ${chalk.blue.bold("generate")}   Generate migration files
  ${chalk.blue.bold("migrate")}    Run pending migrations
  ${chalk.blue.bold("studio")}     Open Studio viewer

${chalk.green.bold("Examples")}
  ${chalk.gray("# Quick development workflow")}
  rebase schema generate && rebase db push

  ${chalk.gray("# Production migration workflow")}
  rebase db generate
  rebase db migrate
`);
}
