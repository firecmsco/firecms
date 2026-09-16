import arg from "arg";
import inquirer from "inquirer";
import chalk from "chalk";
import path from "path";
import fs from "fs";

import { promisify } from "util";
import { execa } from "execa";
import { Listr } from "listr2";
import axios from "axios";
import { DEFAULT_SERVER, DEFAULT_SERVER_DEV } from "../common";
import { getCurrentUser, getTokens, login, refreshCredentials } from "./auth";
import { authCommand, describeRequestError } from "../util/request_error";
import { isFirebaseProjectId, pinnedFireCMSVersion } from "../util/scaffold";
import ora from "ora";

import fsExtra from "fs-extra";
import { fileURLToPath } from "url";

const access = promisify(fs.access);

// Function to find a specific parent directory by name
function findSpecificParentDir(currentDir: string, targetDirName: string) {
    // Prevent infinite loop in case root is reached without finding target
    const rootDir = path.parse(currentDir).root;

    while (currentDir && currentDir !== rootDir) {
        // Check if the current directory is the target directory
        if (path.basename(currentDir) === targetDirName) {
            // Target directory found
            return currentDir;
        }

        // Move to the parent directory
        currentDir = path.dirname(currentDir);
    }

    // Target directory not found
    return null;
}

// For ES Modules, where __dirname is not defined directly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDirPath = findSpecificParentDir(__dirname, "cli");

export type Template = "cloud" | "next-pro" | "pro" | "community" | "astro";
export type InitOptions = Partial<{
    /** Set by `--yes`: take every answer from the flags and defaults. */
    skipPrompts: boolean;
    git: boolean;
    dir_name: string;

    targetDirectory: string;
    templateDirectory: string;

    authToken?: string;
    firebaseProjectId?: string;

    template: Template;

    env: "prod" | "dev";
    debug: boolean;
}>

export async function createFireCMSApp(rawArgs) {

    console.log(`
${chalk.green.bold(" ___ _          ___ __  __ ___")}
${chalk.green.bold("| __(_)_ _ ___ / __|  \\/  / __|")}
${chalk.green.bold("| _|| | '_/ -_) (__| |\\/| \\__ \\")}
${chalk.green.bold("|_| |_|_| \\___|\\___|_|  |_|___/")}

${chalk.red.bold("Welcome to the FireCMS CLI")} 🔥
`);

    let options = parseArgumentsIntoOptions(rawArgs);
    // The template is settled before the login gate below: asked from the list, "FireCMS
    // Cloud" used to walk straight past it and scaffold a cloud project logged out, which
    // `--cloud` refuses.
    options = await promptForTemplate(options);
    const currentUser = await getCurrentUser(options.env, options.debug);
    const mustLogin = ["cloud"].includes(options.template) && !currentUser;

    async function promptLogin() {
        await ask([
            {
                type: "confirm",
                name: "login",
                message: "Do you want to log in?",
                default: true
            }
        ]).then(async answers => {
            if (answers.login) {
                return login(options.env, options.debug);
            }
        });
    }

    // `--yes` never asks to log in. The prompt defaults to yes, so an unattended run that met
    // it would open a browser and wait on port 3000 for someone to sign in.
    if (mustLogin && options.skipPrompts) {
        console.log("%s %s", chalk.red.bold("ERROR"),
            `--yes with --cloud needs you to be logged in. Run ${chalk.bold(authCommand("login", options.env))} first.`);
        process.exit(1);
    } else if (mustLogin) {
        console.log("You need to be logged in to create a project");
        await promptLogin();

        const currentUser = await getCurrentUser(options.env, options.debug);
        if (!currentUser) {
            console.log("The login process was not completed. Exiting...");
            process.exit(1);
        }
    } else if (currentUser) {
        console.log("You are logged in as", currentUser["email"]);
    } else if (options.skipPrompts) {
        console.log(`Not logged in, so the Firebase config is left for you to fill in. Run ${chalk.bold(authCommand("login", options.env))} before init to have it done for you.`);
    } else {
        console.log("You can login to FireCMS to automatically set up your project, or continue without logging in");
        await promptLogin();
    }

    options = await promptForMissingOptions(options);
    // console.log({ options });

    await createProject(options);
}

const INIT_USAGE = `${chalk.green.bold("Usage")}
  firecms init [folder] [options]      (or: npx create-firecms-app [folder] [options])

${chalk.green.bold("Options")}
  --pro | --community | --next-pro | --astro | --cloud
                       The template. Asked for when not given.
  --projectId <id>     Your Firebase project ID, written into the project's config.
  --yes                Ask nothing. Needs a template flag; --cloud also needs
                       --projectId and a login (firecms login).
  --git                Initialize a git repository.
  --help               Show this help.`;

function parseArgumentsIntoOptions(rawArgs): InitOptions {
    let args;
    try {
        args = arg(
            {
                "--git": Boolean,
                "--yes": Boolean,
                "--skipInstall": Boolean,
                "--projectId": String,
                "--cloud": Boolean,
                "--pro": Boolean,
                "--next-pro": Boolean,
                "--community": Boolean,
                "--astro": Boolean,
                "--debug": Boolean,
                "--env": String,
                "--help": Boolean,
                "-h": "--help",
                "--version": Boolean,
                "-v": "--version"
            },
            {
                argv: rawArgs.slice(2)
            }
        );
    } catch (e: any) {
        // Without this an unknown flag (or `--projectId` with no value) surfaces as an
        // uncaught ARG_* error with a raw Node stack trace. `--v2` in particular used to be
        // valid, so anyone with it in a script deserves to be told what happened.
        if (typeof e?.code === "string" && e.code.startsWith("ARG_")) {
            console.log("%s %s", chalk.red.bold("ERROR"), e.message);
            if (rawArgs.includes("--v2")) {
                console.log("");
                console.log(`The ${chalk.cyan.bold("--v2")} template has been removed. FireCMS 2 is no longer maintained.`);
                console.log(`Use ${chalk.cyan.bold("--pro")}, ${chalk.cyan.bold("--community")}, ${chalk.cyan.bold("--cloud")}, ${chalk.cyan.bold("--next-pro")} or ${chalk.cyan.bold("--astro")} instead.`);
            }
            console.log("");
            console.log(INIT_USAGE);
            process.exit(1);
        }
        throw e;
    }
    if (args["--help"]) {
        console.log(INIT_USAGE);
        process.exit(0);
    }
    // `create-firecms-app --version` has no other way to ask.
    if (args["--version"]) {
        console.log(cliVersion() ?? "unknown");
        process.exit(0);
    }
    const env = args["--env"] || "prod";
    if (env !== "prod" && env !== "dev") {
        console.log("%s Please specify a valid environment: dev or prod", chalk.red.bold("ERROR"));
        console.log(INIT_USAGE);
        process.exit(1);
    }

    // One template, or none: they used to be resolved by priority, so `--pro --community`
    // silently scaffolded pro.
    const chosen: [string, Template][] = ([
        ["--cloud", "cloud"],
        ["--next-pro", "next-pro"],
        ["--pro", "pro"],
        ["--community", "community"],
        ["--astro", "astro"]
    ] as [string, Template][]).filter(([flag]) => args[flag]);
    if (chosen.length > 1) {
        console.log("%s Pick one template, not %s", chalk.red.bold("ERROR"), chosen.map(([flag]) => flag).join(" and "));
        console.log(INIT_USAGE);
        process.exit(1);
    }
    const template: Template | undefined = chosen[0]?.[1];

    if (args._.length > 1) {
        console.log("%s Ignoring extra arguments: %s", chalk.yellow.bold("WARNING"), args._.slice(1).join(" "));
    }

    const firebaseProjectId = args["--projectId"]?.trim();
    if (firebaseProjectId !== undefined && !isFirebaseProjectId(firebaseProjectId)) {
        // It is written into .firebaserc, firebase.json, the deploy script and the Firebase
        // config. Anything goes there unchecked: a quote made package.json invalid JSON.
        console.log("%s %s is not a Firebase project ID (lower case letters, digits and hyphens, 6 to 30 characters)",
            chalk.red.bold("ERROR"), JSON.stringify(args["--projectId"]));
        process.exit(1);
    }

    return {
        git: args["--git"] || false,
        dir_name: args._[0],
        template,
        debug: args["--debug"] || false,
        firebaseProjectId,
        skipPrompts: args["--yes"] || false,
        env
    };
}

/**
 * Ask the questions, or say why we cannot. Ctrl-C and a closed stdin both arrive here as
 * inquirer's ExitPromptError, which used to print a stack trace — and, unattended, to exit
 * 0 having created nothing, so a script read it as success.
 */
async function ask(questions: any): Promise<any> {
    try {
        return await inquirer.prompt(questions);
    } catch (e: any) {
        if (e?.name !== "ExitPromptError") throw e;
        console.log("");
        if (process.stdin.isTTY) {
            console.log("Cancelled. Nothing was created.");
            process.exit(130);
        }
        console.log("%s %s", chalk.red.bold("ERROR"),
            "This needs a terminal to ask questions in. Pass the answers as flags instead:");
        console.log(INIT_USAGE);
        process.exit(1);
    }
}

/** The template, from the flags or from the list. */
async function promptForTemplate(options: InitOptions): Promise<InitOptions> {
    if (options.template) return options;
    if (options.skipPrompts) {
        // Every answer has to come from the flags, so anything missing is an error rather
        // than something to guess at.
        console.log("%s %s", chalk.red.bold("ERROR"),
            "--yes needs the template as a flag: --cloud, --pro, --next-pro, --community or --astro");
        process.exit(1);
    }
    const answers = await ask([
        {
            type: "list",
            name: "template",
            message: "Choose a template",
            choices: [
                {
                    name: "FireCMS Cloud " + chalk.gray("(use this option if you access FireCMS from app.firecms.co)"),
                    value: "cloud"
                },
                {
                    name: "FireCMS PRO " + chalk.gray("(self-hosted version with full functionality)"),
                    value: "pro"
                },
                {
                    name: "FireCMS PRO with Next.js frontend " + chalk.gray("(self-hosted version with frontend boilerplate CRUD app)"),
                    value: "next-pro"
                },
                {
                    name: "FireCMS Community " + chalk.gray("(MIT licensed version, free forever)"),
                    value: "community"
                },
                {
                    name: "FireCMS with Astro " + chalk.gray("(self-hosted with Astro SSG/SSR and blog support)"),
                    value: "astro"
                }
            ]
        }
    ]);
    return {
        ...options,
        template: answers.template
    };
}

async function promptForMissingOptions(options: InitOptions): Promise<InitOptions> {
    const defaultName = "my-cms";

    if (options.skipPrompts) {
        // Every answer has to come from the flags, so anything still missing is
        // an error rather than something to guess at — silently scaffolding a
        // project against the wrong Firebase project is worse than stopping.
        if (!options.template) {
            console.log("%s %s", chalk.red.bold("ERROR"),
                "--yes needs the template as a flag: --cloud, --pro, --next-pro, --community or --astro");
            process.exit(1);
        }
        if (options.template === "cloud" && !options.firebaseProjectId) {
            console.log("%s %s", chalk.red.bold("ERROR"),
                "--yes with --cloud needs --projectId <your-firebase-project-id>");
            process.exit(1);
        }
        return {
            ...options,
            dir_name: options.dir_name || defaultName,
            git: options.git || false
        };
    }

    const questions = [];

    const template = options.template;
    const currentUser = await getCurrentUser(options.env, options.debug);
    let shouldAskForProjectManually = false;

    if (currentUser) {
        const spinner = ora("Loading your projects").start();

        let cloudProjects: any;
        let gcpProjects: any;

        if (template === "cloud") {
            cloudProjects = await getCloudProjects(options.env,
                options.debug,
                onErr => {
                    spinner.fail("Error loading projects");
                })
                .then((res) => {
                    if (!res) {
                        if (spinner.isSpinning)
                            spinner.fail("Error loading projects");
                        process.exit(1);
                    }
                    spinner.succeed();
                    return res;
                })
                .catch((e) => {
                    if (spinner.isSpinning)
                        spinner.fail("Error loading projects");
                });
            if (cloudProjects.length === 0) {
                console.log("Please create a FireCMS Cloud project first. Head to https://app.firecms.co to get started and then run this command again!");
            }
        } else {
            gcpProjects = await getGcpProjects(options.env,
                options.debug,
                onErr => {
                    spinner.fail("Error loading projects");
                })
                .then((res) => {
                    if (!res) {
                        if (spinner.isSpinning)
                            spinner.fail("Error loading projects");
                        process.exit(1);
                    }
                    spinner.succeed();
                    return res;
                })
                .catch((e) => {
                    if (spinner.isSpinning)
                        spinner.fail("Error loading projects");
                });
        }

        if (template === "cloud" && cloudProjects.length === 0) {
            shouldAskForProjectManually = true;
        } else {
            const choices = [
                {
                    name: chalk.gray("Enter project id manually"),
                    value: "!_-manual"
                },
                ...(cloudProjects ?? [])
                    .filter(project => project?.id)
                    .map(project => ({
                        name: project.id,
                        value: project.id
                    })),
                ...(gcpProjects ?? []).map(project => ({
                    name: project.projectId,
                    value: project.projectId
                }))
            ];
            questions.push({
                type: "list",
                name: "firebaseProjectId",
                message: "Select your project",
                choices: choices
            });
        }
    }
    questions.push({
        type: "input",
        name: "firebaseProjectIdManual",
        message: "Please enter your Firebase project ID",
        when: (answers) => shouldAskForProjectManually || !answers.firebaseProjectId || answers.firebaseProjectId === "!_-manual",
        default: options.firebaseProjectId,
        filter: (value: string) => value.trim(),
        // Empty is allowed: the project ID can be filled in later, and createProject says
        // in which files. Anything else has to be a project ID, since it is written into
        // .firebaserc, the deploy script and the Firebase config.
        validate: (value: string) => !value.trim() || isFirebaseProjectId(value.trim())
            ? true
            : `"${value.trim()}" is not a Firebase project ID (lower case letters, digits and hyphens, 6 to 30 characters)`
    });


    questions.push({
        type: "input",
        name: "dir_name",
        message: "Please choose which folder to create the project in",
        default: options.dir_name ?? defaultName,
        filter: (value: string) => value.trim(),
        // An empty answer used to scaffold into the current directory and then print "cd ".
        validate: (value: string) => value.trim() ? true : "Please give a folder name"
    });

    // Asked of everyone. It used to be gated on `answers.firebaseProjectId`, which only
    // the logged-in project list sets, so nobody logged out was ever asked.
    if (!options.git) {
        questions.push({
            type: "confirm",
            name: "git",
            message: "Initialize a git repository?",
            default: false
        });
    }

    const answers = await ask(questions);

    return {
        ...options,
        dir_name: answers.dir_name?.trim() || options.dir_name || defaultName,
        git: options.git || answers.git,
        firebaseProjectId: answers.firebaseProjectIdManual?.trim() || answers.firebaseProjectId
    };
}

export async function createProject(options: InitOptions) {

    // Resolved, not prefixed with "./": an absolute folder became ".//abs/path", and a
    // folder inside a missing parent failed with ENOENT, both as stack traces.
    const targetDirectory = path.resolve(process.cwd(), options.dir_name);
    if (fs.existsSync(targetDirectory)) {
        if (!fs.statSync(targetDirectory).isDirectory()) {
            console.error("%s %s is a file, not a folder", chalk.red.bold("ERROR"), options.dir_name);
            process.exit(1);
        }
        // `git init` first, or a look in Finder, is normal and leaves the folder usable.
        const existing = fs.readdirSync(targetDirectory).filter(entry => entry !== ".git" && entry !== ".DS_Store");
        if (existing.length !== 0) {
            console.error("%s Directory is not empty: %s", chalk.red.bold("ERROR"), targetDirectory);
            process.exit(1);
        }
    } else {
        fs.mkdirSync(targetDirectory, { recursive: true });
    }

    options = {
        ...options,
        targetDirectory: targetDirectory
    };

    let templateFolder: string;
    if (options.template === "pro") {
        templateFolder = "template_pro";
    } else if (options.template === "next-pro") {
        templateFolder = "template_next_pro";
    } else if (options.template === "community") {
        templateFolder = "template";
    } else if (options.template === "cloud") {
        templateFolder = "template_cloud";
    } else if (options.template === "astro") {
        templateFolder = "template_astro";
    } else {
        throw new Error("createProject: Invalid template");
    }

    const templateDir = path.resolve(
        targetDirPath,
        "./templates/" + templateFolder
    );
    options.templateDirectory = templateDir;
    if (options.debug) {
        console.log("Template directory:", templateDir);
    }

    try {
        await access(templateDir, fs.constants.R_OK);
    } catch (err) {
        console.error("%s Invalid template name " + templateDir, chalk.red.bold("ERROR"));
        process.exit(1);
    }

    const currentUser = await getCurrentUser(options.env, options.debug);
    // Said after the tasks, because anything printed while listr is drawing its spinners
    // is drawn over: the webapp step used to fail, log over itself, and still show a ✔.
    const afterwards: string[] = [];
    const tasks = new Listr([
        {
            title: "Copy project files: " + options.targetDirectory,
            task: (ctx) => copyTemplateFiles(options)
        },
        {
            title: "Creating FireCMS webapp in project: " + options.firebaseProjectId,
            task: async (ctx, task) => {
                const written = await createWebApp(options);
                if (!written) {
                    task.title = "Could not create the FireCMS webapp in " + options.firebaseProjectId;
                    afterwards.push(`Could not read your Firebase config from FireCMS, so ${chalk.cyan.bold(firebaseConfigPath(options.template))} was left as it is.`);
                    afterwards.push(`Fill it in from the Firebase console, or run ${chalk.bold(authCommand("login", options.env))} and scaffold again.`);
                }
            },
            enabled: () => currentUser && isSelfHostedTemplate(options.template)
        },
        {
            title: "Initialize git",
            task: () => initGit(options),
            enabled: () => options.git
        }
    ]);

    await tasks.run();

    console.log("");
    console.log("%s Your project is ready!", chalk.green.bold("DONE"));
    console.log("");

    if (afterwards.length > 0) {
        afterwards.forEach(line => console.log("⚠️ " + line));
        console.log("");
    }

    const needProjectId = options.firebaseProjectId ? [] : filesWithProjectIdPlaceholder(options);
    if (needProjectId.length > 0) {
        console.log(`No Firebase project ID was given. Replace ${chalk.cyan.bold(PROJECT_ID_PLACEHOLDER)} with it in:`);
        needProjectId.forEach(file => console.log("  " + chalk.cyan.bold(file)));
        console.log("");
    }

    const pm = packageManagerCommands();
    if (options.template === "pro" || options.template === "community") {
        console.log("Make sure you have a valid Firebase config in ");
        console.log(chalk.cyan.bold("src/firebase_config.ts"));
        if (options.template === "pro") {
            console.log("");
            console.log(`Also, make sure the user that is logging in has read/write access to the path ${chalk.cyan.bold("__FIRECMS")} in your database `);
        }
        console.log("");
        console.log("Run:");
        console.log(chalk.bgYellow.black.bold("cd " + shellQuote(options.dir_name)));
        console.log(chalk.bgYellow.black.bold(pm.install));
        console.log(chalk.bgYellow.black.bold(pm.run("dev")));
        console.log("");
    } else if (options.template === "next-pro") {
        console.log("Make sure you have a valid Firebase config in ");
        console.log(chalk.cyan.bold("src/app/common/firebase_config.ts"));
        console.log("");
        console.log(`Also, make sure the user that is logging in has read/write access to the path ${chalk.cyan.bold("__FIRECMS")} in your database `);
        console.log("");
        console.log("Run:");
        console.log(chalk.bgYellow.black.bold("cd " + shellQuote(options.dir_name)));
        console.log(chalk.bgYellow.black.bold(pm.install));
        console.log(chalk.bgYellow.black.bold(pm.run("dev")));
        console.log("");
    } else if (options.template === "cloud") {
        console.log("If you want to run your project locally, run:");
        console.log(chalk.bgYellow.black.bold("cd " + shellQuote(options.dir_name)));
        console.log(chalk.bgYellow.black.bold(pm.install));
        console.log(chalk.bgYellow.black.bold(pm.run("dev")));
        console.log("");
        console.log("If you want to deploy your project, run:");
        console.log(chalk.bgYellow.black.bold(pm.run("deploy")));
        console.log("and see it running in https://app.firecms.co");
        console.log("");
    } else if (options.template === "astro") {
        console.log("Make sure you have a valid Firebase config in ");
        console.log(chalk.cyan.bold("src/common/firebase_config.ts"));
        console.log("");
        console.log("Run:");
        console.log(chalk.bgYellow.black.bold("cd " + shellQuote(options.dir_name)));
        console.log(chalk.bgYellow.black.bold(pm.install));
        console.log(chalk.bgYellow.black.bold(pm.run("dev")));
        console.log("");
    } else {
        throw new Error("createProject: Invalid template");
    }

    console.log("Remember to:");
    console.log("  - Drop a ⭐  in our Github page: https://github.com/firecmsco/firecms");
    console.log("  - Join our Discord community: https://discord.gg/fxy7xsQm3m to get help and share your projects.");

    return true;
}

/** The Firebase config the template reads, per template. */
function firebaseConfigPath(template: Template): string {
    if (template === "next-pro") return "src/app/common/firebase_config.ts";
    if (template === "astro") return "src/common/firebase_config.ts";
    return "src/firebase_config.ts";
}

/** Whether a config was actually written. */
async function createWebApp(options: InitOptions): Promise<boolean> {
    const firebaseConfig = await createSelfHostedProjectWebappConfig(options.env, options.firebaseProjectId, options.debug);
    // An empty object is what a refused or expired session comes back with, and it used to
    // be written out as the config — `{}` is truthy — with no warning at all.
    if (!firebaseConfig || Object.keys(firebaseConfig).length === 0) {
        return false;
    }
    await copyWebAppConfig(options, firebaseConfig);
    return true;
}

const PROJECT_ID_PLACEHOLDER = "[REPLACE_WITH_PROJECT_ID]";

/** The files of each template that carry the Firebase project ID placeholder. */
const PROJECT_ID_FILES: Record<Template, string[]> = {
    "pro": ["./src/App.tsx", "./firebase.json", "./package.json", "./.firebaserc"],
    "community": ["./src/App.tsx", "./firebase.json", "./package.json", "./.firebaserc"],
    "astro": ["./src/common/firebase_config.ts", "./package.json", "./.firebaserc"],
    "cloud": ["./src/App.tsx", "./package.json"],
    "next-pro": ["./src/app/common/firebase_config.ts"]
};

async function copyTemplateFiles(options: InitOptions) {
    return fsExtra.copy(options.templateDirectory, options.targetDirectory, {
        overwrite: false,
    }).then(async _ => {
        await restoreGitignore(options.targetDirectory);
        const pinned = pinnedFireCMSVersion(cliVersion());
        if (pinned) {
            await pinFireCMSVersions(options.targetDirectory, pinned);
        }
        // Without a project ID the placeholder stays, and createProject says where: it
        // used to be replaced with the string "undefined" (`"default": "undefined"` in
        // .firebaserc, `--project undefined` in the deploy script).
        if (options.firebaseProjectId) {
            return replaceProjectIdInTemplateFiles(options, PROJECT_ID_FILES[options.template] ?? []);
        }
    });
}

/** The files, relative to the project, that still hold the project ID placeholder. */
function filesWithProjectIdPlaceholder(options: InitOptions): string[] {
    return (PROJECT_ID_FILES[options.template] ?? []).filter(file => {
        const fullFileName = path.resolve(options.targetDirectory, file);
        return fs.existsSync(fullFileName) && fs.readFileSync(fullFileName, "utf8").includes(PROJECT_ID_PLACEHOLDER);
    }).map(file => path.normalize(file));
}

/**
 * The package manager the user started us with, so the next steps we print are the commands
 * they can actually run. Every template was told to use npm, whatever ran the scaffolder.
 */
function packageManagerCommands(): { install: string, run: (script: string) => string } {
    const agent = process.env.npm_config_user_agent ?? "";
    if (agent.startsWith("pnpm")) return { install: "pnpm install", run: (s) => `pnpm ${s}` };
    if (agent.startsWith("yarn")) return { install: "yarn", run: (s) => `yarn ${s}` };
    if (agent.startsWith("bun")) return { install: "bun install", run: (s) => `bun run ${s}` };
    return { install: "npm install", run: (s) => `npm run ${s}` };
}

/** This CLI's own version, from the package it was installed as. */
export function cliVersion(): string | undefined {
    try {
        return JSON.parse(fs.readFileSync(path.resolve(targetDirPath, "package.json"), "utf8")).version;
    } catch {
        return undefined;
    }
}

/** Point every `@firecms/*` dependency of the new project at `version`. */
async function pinFireCMSVersions(targetDirectory: string, version: string) {
    const file = path.resolve(targetDirectory, "package.json");
    const pkg = JSON.parse(await fs.promises.readFile(file, "utf8"));
    for (const field of ["dependencies", "devDependencies"]) {
        for (const dep of Object.keys(pkg[field] ?? {})) {
            if (dep === "firecms" || dep.startsWith("@firecms/")) pkg[field][dep] = version;
        }
    }
    await fs.promises.writeFile(file, JSON.stringify(pkg, null, 2) + "\n", "utf8");
}

/** A folder name as it has to be typed in a shell. */
function shellQuote(value: string): string {
    return /^[\w./@:+-]+$/.test(value) ? value : `'${value.replace(/'/g, "'\\''")}'`;
}

// npm never packs `.gitignore` files, so a template published with one would
// scaffold projects without it. Each template ships it as `gitignore` instead,
// and it gets its real name here.
async function restoreGitignore(targetDirectory: string) {
    const shipped = path.resolve(targetDirectory, "gitignore");
    if (fs.existsSync(shipped)) {
        await fs.promises.rename(shipped, path.resolve(targetDirectory, ".gitignore"));
    }
}

async function copyWebAppConfig(options: InitOptions, firebaseConfig: object) {

    let internalTargetDirectory: string;
    if (options.template === "next-pro") {
        internalTargetDirectory = "src/app/common/firebase_config.ts";
    } else if (options.template === "astro") {
        internalTargetDirectory = "src/common/firebase_config.ts";
    } else {
        internalTargetDirectory = "src/firebase_config.ts";
    }

    const fullFileName = path.resolve(options.targetDirectory, internalTargetDirectory);
    // Keep the `Record<string, string>` annotation the templates ship with. Without it
    // TypeScript infers the literal type of whatever we write, so an empty config makes
    // `firebaseConfig.projectId` a compile error and the generated project fails `tsc`:
    //     src/App.tsx: error TS2339: Property 'projectId' does not exist on type '{}'
    // An empty config is a legitimate state — App.tsx checks for it and throws a helpful
    // message at runtime — so it must still type-check.
    const contents = "export const firebaseConfig: Record<string, string> = "
        + JSON.stringify(firebaseConfig, null, 4) + "\n";
    try {
        await fs.promises.writeFile(fullFileName, contents, "utf8");
    } catch (err) {
        console.error("Failed to write file:", err);
    }
}

async function replaceProjectIdInTemplateFiles(options: InitOptions, files: string[] = []) {
    // Note: this used to call the callback forms of fs.readFile/fs.writeFile inside an
    // `await`, which awaits nothing — the writes were fire-and-forget, so the CLI could
    // finish (and exit) before they landed and scaffold a project with the raw
    // [REPLACE_WITH_PROJECT_ID] placeholder still in it. Non-deterministically, which is
    // why it went unnoticed.
    for (const file of files) {
        const fullFileName = path.resolve(options.targetDirectory, file);
        try {
            const data = await fs.promises.readFile(fullFileName, "utf8");
            // A function, not the string: `$&` and friends in a project ID would otherwise
            // be expanded as replacement patterns.
            const result = data.replace(/\[REPLACE_WITH_PROJECT_ID]/g, () => options.firebaseProjectId);
            if (result !== data) {
                await fs.promises.writeFile(fullFileName, result, "utf8");
            }
        } catch (err) {
            console.log(err);
        }
    }
}

async function initGit(options: InitOptions) {
    const result = await execa("git", ["init"], {
        cwd: options.targetDirectory
    });
    if (result.failed) {
        return Promise.reject(new Error("Failed to initialize git"));
    }
    return;
}

async function getGcpProjects(env: "prod" | "dev", debug: boolean, onErr?: (e: any) => void) {

    try {
        const credentials = await getTokens(env, debug);
        const tokens = await refreshCredentials(env, credentials, onErr);
        if (!tokens) {
            return null;
        }
        const server = env === "prod" ? DEFAULT_SERVER : DEFAULT_SERVER_DEV;
        const response = await axios.get(server + "/gcp_projects", {
            headers: {
                ["x-admin-authorization"]: `Bearer ${tokens["access_token"]}`
            }
        });

        if (response.status >= 400) {
            console.log(response.data.data?.message);
            return null;
        }
        return response.data.data;
    } catch (e) {
        if (onErr) {
            onErr(e);
        }
        console.error("Error getting projects:", describeRequestError(e));
    }
}

async function getCloudProjects(env: "prod" | "dev", debug: boolean, onErr?: (e: any) => void) {

    try {
        const credentials = await getTokens(env, debug);
        const tokens = await refreshCredentials(env, credentials, onErr);
        if (!tokens) {
            return null;
        }
        const server = env === "prod" ? DEFAULT_SERVER : DEFAULT_SERVER_DEV;
        const response = await axios.get(server + "/projects", {
            headers: {
                ["x-admin-authorization"]: `Bearer ${tokens["access_token"]}`
            }
        });

        if (response.status >= 400) {
            console.log(response.data.data?.message);
            return null;
        }
        return response.data.data;
    } catch (e) {
        if (onErr) {
            onErr(e);
        }
        console.error("Error getting projects:", describeRequestError(e));
    }
}

async function createSelfHostedProjectWebappConfig(env, projectId, debug, onErr?: (e: any) => void) {
    try {
        const credentials = await getTokens(env, debug);
        const tokens = await refreshCredentials(env, credentials, onErr);
        if (!tokens) {
            return null;
        }
        const server = env === "prod" ? DEFAULT_SERVER : DEFAULT_SERVER_DEV;
        const token = tokens["access_token"];

        const response = await fetch(server + `/gcp_projects/${projectId}/create_webapp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-admin-authorization": `Bearer ${token}`
            }
        });

        const responseData = await response.json();
        return responseData.data;
    } catch (e) {
        console.error("Error creating webapp", e);
        if (onErr) {
            onErr(e);
        }
    }
}

function isSelfHostedTemplate(template: Template) {
    return ["pro", "next-pro", "community", "astro"].includes(template);
}

