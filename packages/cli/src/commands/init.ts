import arg from "arg";
import inquirer from "inquirer";
import chalk from "chalk";
import path from "path";
import fs from "fs";

import { promisify } from "util";
import execa from "execa";
import Listr from "listr";
import axios from "axios";
import { DEFAULT_SERVER, DEFAULT_SERVER_DEV } from "../common";
import { getCurrentUser, getTokens, login, refreshCredentials } from "./auth";
import ora from "ora";

import ncp from "ncp";
import { fileURLToPath } from "url";

const access = promisify(fs.access);
const copy = promisify(ncp);

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

export type Template = "cloud" | "v2" | "next-pro" | "pro" | "community";
export type InitOptions = Partial<{
    // skipPrompts: boolean;
    git: boolean;
    dir_name: string;

    targetDirectory: string;
    templateDirectory: string;

    // skipInstall: boolean;

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
    const currentUser = await getCurrentUser(options.env, options.debug);
    const mustLogin = ["cloud"].includes(options.template) && !currentUser;

    async function promptLogin() {
        await inquirer.prompt([
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

    if (mustLogin) {
        console.log("You need to be logged in to create a project");
        await promptLogin();

        const currentUser = await getCurrentUser(options.env, options.debug);
        if (!currentUser) {
            console.log("The login process was not completed. Exiting...");
            return;
        }
    } else if (currentUser) {
        console.log("You are logged in as", currentUser["email"]);
    } else {
        console.log("You can login to FireCMS to automatically set up your project, or continue without logging in");
        await promptLogin();
    }

    options = await promptForMissingOptions(options);
    // console.log({ options });

    await createProject(options);
}

function parseArgumentsIntoOptions(rawArgs): InitOptions {
    const args = arg(
        {
            "--git": Boolean,
            "--yes": Boolean,
            "--skipInstall": Boolean,
            "--projectId": String,
            "--v2": Boolean,
            "--cloud": Boolean,
            "--pro": Boolean,
            "--next-pro": Boolean,
            "--community": Boolean,
            "--debug": Boolean,
            "--env": String
        },
        {
            argv: rawArgs.slice(2)
        }
    );
    const env = args["--env"] || "prod";
    if (env !== "prod" && env !== "dev") {
        console.log("Please specify a valid environment: dev or prod");
        console.log("create-firecms-app --env=prod");
        return;
    }

    let template: Template;
    if (args["--v2"]) {
        template = "v2";
    } else if (args["--cloud"]) {
        template = "cloud";
    } else if (args["--next-pro"]) {
        template = "next-pro";
    } else if (args["--pro"]) {
        template = "pro";
    } else if (args["--community"]) {
        template = "community";
    }

    return {
        git: args["--git"] || false,
        dir_name: args._[0],
        template,
        debug: args["--debug"] || false,
        firebaseProjectId: args["--projectId"],
        env
    };
}

async function promptForMissingOptions(options: InitOptions): Promise<InitOptions> {
    const defaultName = "my-cms";
    // if (options.skipPrompts) {
    //     return {
    //         ...options,
    //         dir_name: options.dir_name || defaultName,
    //     };
    // }

    const questions = [];

    let template = options.template;
    if (!template) {
        const answers = await inquirer.prompt([
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
                        name: "FireCMS PRO with Next.js frontend" + chalk.gray("(self-hosted version with frontend boilerplate CRUD app)"),
                        value: "next-pro"
                    },
                    {
                        name: "FireCMS Community " + chalk.gray("(MIT licensed version, free forever)"),
                        value: "community"
                    }
                ]
            }
        ]);
        template = answers.template;
        options.template = template;
    }

    if (template !== "v2") {

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
            default: options.firebaseProjectId
        });
    }

    questions.push({
        type: "input",
        name: "dir_name",
        message: "Please choose which folder to create the project in",
        default: options.dir_name ?? defaultName
    });

    if (!options.git) {
        questions.push({
            type: "confirm",
            name: "git",
            message: "Initialize a git repository?",
            when: (answers) => Boolean(answers.firebaseProjectId),
            default: false
        });
    }

    const answers = await inquirer.prompt(questions);

    return {
        ...options,
        dir_name: answers.dir_name ?? options.dir_name,
        git: options.git || answers.git,
        firebaseProjectId: answers.firebaseProjectIdManual || answers.firebaseProjectId
    };
}

export async function createProject(options: InitOptions) {

    const dir = "./" + options.dir_name;
    if (fs.existsSync(dir)) {
        if (fs.readdirSync(dir).length !== 0) {
            console.error("%s Directory is not empty", chalk.red.bold("ERROR"));
            process.exit(1);
        }
    } else {
        fs.mkdirSync(dir);
    }

    const targetDirectory = path.resolve(
        process.cwd(),
        dir
    );

    options = {
        ...options,
        targetDirectory: targetDirectory
    };

    let templateFolder: string;
    if (options.template === "v2") {
        templateFolder = "template_v2";
    } else if (options.template === "pro") {
        templateFolder = "template_pro";
    } else if (options.template === "next-pro") {
        templateFolder = "template_next_pro";
    } else if (options.template === "community") {
        templateFolder = "template";
    } else if (options.template === "cloud") {
        templateFolder = "template_cloud";
    } else {
        throw new Error("createProject: Invalid template");
    }

    const templateDir = path.resolve(
        targetDirPath,
        "./templates/" + templateFolder
    );
    options.templateDirectory = templateDir;

    try {
        await access(templateDir, fs.constants.R_OK);
    } catch (err) {
        console.error("%s Invalid template name " + templateDir, chalk.red.bold("ERROR"));
        process.exit(1);
    }

    const currentUser = await getCurrentUser(options.env, options.debug);
    const tasks = new Listr([
        {
            title: "Copy project files: " + options.targetDirectory,
            task: (ctx) => copyTemplateFiles(options)
        },
        {
            title: "Creating FireCMS webapp in project: " + options.firebaseProjectId,
            task: (ctx) => createWebApp(options),
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

    if (options.template === "v2") {
        console.log("First update your firebase config in");
        console.log(chalk.bgYellow.black.bold("src/firebase_config.ts"));
        console.log("");
        console.log("Then run:");
        console.log(chalk.cyan.bold("cd " + options.dir_name));
        console.log(chalk.cyan.bold("yarn") + " or " + chalk.cyan.bold("npm install"));
        console.log(chalk.cyan.bold("yarn dev") + " or " + chalk.cyan.bold("npm run dev"));
        console.log("");
    } else if (options.template === "pro" || options.template === "community") {
        console.log("Make sure you have a valid Firebase config in ");
        console.log(chalk.cyan.bold("src/firebase_config.ts"));
        if (options.template === "pro") {
            console.log("");
            console.log(`Also, make sure the user that is logging in has read/write access to the path ${chalk.cyan.bold("__FIRECMS")} in your database `);
        }
        console.log("");
        console.log("Run:");
        console.log(chalk.bgYellow.black.bold("cd " + options.dir_name));
        console.log(chalk.bgYellow.black.bold("yarn") + " or " + chalk.bgYellow.black.bold("npm install"));
        console.log(chalk.bgYellow.black.bold("yarn dev") + " or " + chalk.bgYellow.black.bold("npm run dev"));
        console.log("");
    } else if (options.template === "next-pro") {
        console.log("Make sure you have a valid Firebase config in ");
        console.log(chalk.cyan.bold("src/app/common/firebase_config.ts"));
        console.log("");
        console.log(`Also, make sure the user that is logging in has read/write access to the path ${chalk.cyan.bold("__FIRECMS")} in your database `);
        console.log("");
        console.log("Run:");
        console.log(chalk.bgYellow.black.bold("cd " + options.dir_name));
        console.log(chalk.bgYellow.black.bold("yarn") + " or " + chalk.bgYellow.black.bold("npm install"));
        console.log(chalk.bgYellow.black.bold("yarn dev") + " or " + chalk.bgYellow.black.bold("npm run dev"));
        console.log("");
    } else if (options.template === "cloud") {
        console.log("If you want to run your project locally, run:");
        console.log(chalk.bgYellow.black.bold("cd " + options.dir_name));
        console.log(chalk.bgYellow.black.bold("yarn") + " or " + chalk.bgYellow.black.bold("npm install"));
        console.log(chalk.bgYellow.black.bold("yarn dev") + " or " + chalk.bgYellow.black.bold("npm run dev"));
        console.log("");
        console.log("If you want to deploy your project, run:");
        console.log(chalk.bgYellow.black.bold("yarn deploy") + " or " + chalk.bgYellow.black.bold("npm run deploy"));
        console.log("and see it running in https://app.firecms.co");
        console.log("");
    } else {
        throw new Error("createProject: Invalid template");
    }

    console.log("Remember to:");
    console.log("  - Drop a ⭐  in our Github page: https://github.com/firecmsco/firecms");
    console.log("  - Join our Discord community: https://discord.gg/fxy7xsQm3m to get help and share your projects.");

    return true;
}

async function createWebApp(options: InitOptions) {
    const firebaseConfig = await createSelfHostedProjectWebappConfig(options.env, options.firebaseProjectId, options.debug);
    if (firebaseConfig)
        await copyWebAppConfig(options, firebaseConfig);

    if (!firebaseConfig) {
        console.warn("Could not set webapp config automatically. Please update your config manually in " + chalk.bold("src/firebase_config.ts"));
    }
}

async function copyTemplateFiles(options: InitOptions) {
    return copy(options.templateDirectory, options.targetDirectory, {
        clobber: false,
        dot: true
    }).then(async _ => {
        if (options.template === "pro" || options.template === "community") {
            return replaceProjectIdInTemplateFiles(options, [
                "./src/App.tsx",
                "./firebase.json",
                "./package.json",
                "./.firebaserc"
            ]);
        } else if (options.template === "cloud") {

            return replaceProjectIdInTemplateFiles(options, [
                "./src/App.tsx",
                "./package.json"
            ]);
        }
    });
}

async function copyWebAppConfig(options: InitOptions, firebaseConfig: object) {

    const internalTargetDirectory = options.template === "next-pro" ? "src/app/common/firebase_config.ts" : "src/firebase_config.ts"

    const fullFileName = path.resolve(options.targetDirectory, internalTargetDirectory);
    fs.writeFile(fullFileName, "export const firebaseConfig = " + JSON.stringify(firebaseConfig, null, 4), err => {
        if (err) {
            console.error("Failed to write file:", err);
        }
    });
}

async function replaceProjectIdInTemplateFiles(options: InitOptions, files: string[] = []) {
    for (const file of files) {
        const fullFileName = path.resolve(options.targetDirectory, file);
        await fs.readFile(fullFileName, "utf8", function (err, data) {
            if (err) {
                return console.log(err);
            }
            const result = data.replace(/\[REPLACE_WITH_PROJECT_ID]/g, options.firebaseProjectId);

            fs.writeFile(fullFileName, result, "utf8", function (err) {
                if (err) return console.log(err);
            });
        });
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
        console.error("Error getting projects", e.response?.data);
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
        console.error("Error getting projects", e.response?.data);
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
    return ["pro", "next-pro", "community"].includes(template);
}

