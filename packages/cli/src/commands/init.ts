import arg from "arg";
import inquirer from "inquirer";
import chalk from "chalk";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import execa from "execa";
import ncp from "ncp";
import { fileURLToPath } from "url";

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
            "-g": "--git"
        },
        {
            argv: rawArgs.slice(3), // skip "node", "rebase", "init"
            permissive: true
        }
    );

    // The first positional arg after "init" is the project name
    const nameArg = args._[0];

    const questions: any[] = [];

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

    const answers = await inquirer.prompt(questions);

    const projectName = nameArg || answers.projectName;
    const targetDirectory = path.resolve(process.cwd(), projectName);
    const templateDirectory = path.resolve(cliRoot!, "templates", "template");

    return {
        projectName,
        git: args["--git"] || answers.git || false,
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
    await copy(options.templateDirectory, options.targetDirectory, {
        clobber: false,
        dot: true,
        filter: (source: string) => {
            const basename = path.basename(source);
            // Skip node_modules and .DS_Store
            return basename !== "node_modules" && basename !== ".DS_Store";
        }
    });

    // Replace placeholder project name in package.json files
    await replacePlaceholders(options);

    // Rename .env.template to .env if it exists
    const envTemplatePath = path.join(options.targetDirectory, ".env.template");
    const envPath = path.join(options.targetDirectory, ".env");
    if (fs.existsSync(envTemplatePath) && !fs.existsSync(envPath)) {
        fs.renameSync(envTemplatePath, envPath);
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

    // Success message
    console.log("");
    console.log(`${chalk.green.bold("✓")} Project ${chalk.bold(options.projectName)} created successfully!`);
    console.log("");
    console.log(chalk.bold("Next steps:"));
    console.log("");
    console.log(`  ${chalk.cyan("cd")} ${options.projectName}`);
    console.log(`  ${chalk.cyan("pnpm install")}`);
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
    console.log(chalk.gray("GitHub: https://github.com/rebaseco/rebase"));
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
