import arg from "arg";
import inquirer from "inquirer";
import chalk from "chalk";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import execa from "execa";
import ncp from "ncp";
import { fileURLToPath } from "url";
import crypto from "crypto";

const access = promisify(fs.access);
const copy = promisify(ncp);

// Resolve template path relative to this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findParentDir(currentDir: string, targetName: string): string | null {
    const root = path.parse(currentDir).root;
    while (currentDir && currentDir !== root) {
        if (path.basename(currentDir) === targetName) {
            return currentDir;
        }
        currentDir = path.dirname(currentDir);
    }
    return null;
}

const cliRoot = findParentDir(__dirname, "cli");

export interface InitOptions {
    projectName: string;
    git: boolean;
    installDeps: boolean;
    targetDirectory: string;
    templateDirectory: string;
}

export async function createRebaseApp(rawArgs: string[]) {
    console.log(`
${chalk.bold("Rebase")} — Create a new project 🚀
`);

    const options = await promptForOptions(rawArgs);
    await createProject(options);
}

async function promptForOptions(rawArgs: string[]): Promise<InitOptions> {
    const args = arg(
        {
            "--git": Boolean,
            "--install": Boolean,
            "-g": "--git",
            "-i": "--install"
        },
        {
            argv: rawArgs.slice(3), // skip "node", "rebase", "init"
            permissive: true
        }
    );

    // The first positional arg after "init" is the project name
    const nameArg = args._[0];

    const questions: Record<string, unknown>[] = [];

    if (!nameArg) {
        questions.push({
            type: "input",
            name: "projectName",
            message: "Project name:",
            default: "my-rebase-app",
            validate: (input: string) => {
                if (!input.trim()) return "Project name is required";
                if (!/^[a-z0-9][a-z0-9._-]*$/.test(input)) {
                    return "Project name must start with a lowercase letter or number and contain only lowercase letters, numbers, hyphens, dots, or underscores";
                }
                return true;
            }
        });
    }

    if (!args["--git"]) {
        questions.push({
            type: "confirm",
            name: "git",
            message: "Initialize a git repository?",
            default: true
        });
    }

    if (!args["--install"]) {
        questions.push({
            type: "confirm",
            name: "installDeps",
            message: "Install dependencies with pnpm?",
            default: true
        });
    }

    const answers = await inquirer.prompt(questions as unknown as Parameters<typeof inquirer.prompt>[0]);

    const projectName = nameArg || answers.projectName;
    const targetDirectory = path.resolve(process.cwd(), projectName);
    const templateDirectory = path.resolve(cliRoot!, "templates", "template");

    return {
        projectName,
        git: args["--git"] || answers.git || false,
        installDeps: args["--install"] || answers.installDeps || false,
        targetDirectory,
        templateDirectory
    };
}

async function createProject(options: InitOptions) {
    // Check if directory already exists and is not empty
    if (fs.existsSync(options.targetDirectory)) {
        if (fs.readdirSync(options.targetDirectory).length !== 0) {
            console.error(`${chalk.red.bold("ERROR")} Directory "${options.projectName}" already exists and is not empty`);
            process.exit(1);
        }
    } else {
        fs.mkdirSync(options.targetDirectory, { recursive: true });
    }

    // Verify template exists
    try {
        await access(options.templateDirectory, fs.constants.R_OK);
    } catch {
        console.error(`${chalk.red.bold("ERROR")} Template not found at ${options.templateDirectory}`);
        process.exit(1);
    }

    // Copy template files
    console.log(chalk.gray("  Copying project files..."));
    try {
        await copy(options.templateDirectory, options.targetDirectory, {
            clobber: false,
            dot: true,
            filter: (source: string) => {
                const basename = path.basename(source);
                // Skip node_modules and .DS_Store
                return basename !== "node_modules" && basename !== ".DS_Store";
            }
        });
    } catch (err: unknown) {
        console.error(`${chalk.red.bold("ERROR")} Failed to copy template files: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(1);
    }

    // Replace placeholder project name in package.json files
    await replacePlaceholders(options);

    // Rename .env.template to .env if it exists and randomize secrets
    const envTemplatePath = path.join(options.targetDirectory, ".env.template");
    const envPath = path.join(options.targetDirectory, ".env");
    if (fs.existsSync(envTemplatePath) && !fs.existsSync(envPath)) {
        fs.renameSync(envTemplatePath, envPath);

        // Generate secure random strings
        const jwtSecret = crypto.randomBytes(32).toString("hex");
        const dbPassword = crypto.randomBytes(16).toString("hex");

        let envContent = fs.readFileSync(envPath, "utf-8");
        envContent = envContent.replace(
            "postgresql://rebase:password@localhost:5432/rebase",
            `postgresql://rebase:${dbPassword}@localhost:5432/rebase`
        );
        envContent = envContent.replace(
            "change-this-to-a-secure-random-string",
            jwtSecret
        );

        // Append POSTGRES_PASSWORD for docker-compose interpolation
        envContent += `\n# Docker Compose Database Password\nPOSTGRES_PASSWORD=${dbPassword}\n`;

        fs.writeFileSync(envPath, envContent, "utf-8");
    }

    // Initialize git
    if (options.git) {
        console.log(chalk.gray("  Initializing git repository..."));
        try {
            await execa("git", ["init"], { cwd: options.targetDirectory });
        } catch {
            console.warn(chalk.yellow("  Warning: Failed to initialize git repository"));
        }
    }

    if (options.installDeps) {
        console.log("");
        console.log(chalk.gray("  Installing dependencies with pnpm..."));
        console.log("");
        try {
            await execa("pnpm", ["install"], {
                cwd: options.targetDirectory,
                stdio: "inherit"
            });
        } catch {
            console.warn(chalk.yellow("  Warning: Failed to install dependencies. You may need to run `pnpm install` manually."));
        }
    }

    // Success message
    console.log("");
    console.log(`${chalk.green.bold("✓")} Project ${chalk.bold(options.projectName)} created successfully!`);
    console.log("");
    console.log(chalk.bold("Next steps:"));
    console.log("");
    console.log(`  ${chalk.cyan("cd")} ${options.projectName}`);
    if (!options.installDeps) {
        console.log(`  ${chalk.cyan("pnpm install")}`);
    }
    console.log("");
    console.log(chalk.gray("  # Set up your database connection in .env"));
    console.log(chalk.gray("  # Then run:"));
    console.log("");
    console.log(`  ${chalk.cyan("pnpm dev")}`);
    console.log("");
    console.log(chalk.gray("This starts both the backend (Express + PostgreSQL)")
        + chalk.gray(" and the frontend (Vite + React) concurrently."));
    console.log("");
    console.log(chalk.gray("Docs: https://rebase.pro/docs"));
    console.log(chalk.gray("GitHub: https://github.com/rebasepro/rebase"));
    console.log("");
}

async function replacePlaceholders(options: InitOptions) {
    const filesToProcess = [
        "package.json",
        "frontend/package.json",
        "backend/package.json",
        "shared/package.json",
        "frontend/index.html"
    ];

    for (const file of filesToProcess) {
        const fullPath = path.resolve(options.targetDirectory, file);
        if (!fs.existsSync(fullPath)) continue;

        let content = fs.readFileSync(fullPath, "utf-8");
        content = content.replace(/\{\{PROJECT_NAME\}\}/g, options.projectName);
        fs.writeFileSync(fullPath, content, "utf-8");
    }
}
