import arg from "arg";
import inquirer from "inquirer";
import chalk from "chalk";
import path from "path";
import fs from "fs";
import ncp from "ncp";
import { promisify } from "util";
import execa from "execa";
import Listr from "listr";
import { projectInstall } from "pkg-install";

import JSON5 from "json5";
import axios from "axios";
import { DEFAULT_SERVER, DEFAULT_SERVER_DEV } from "../common";
import { getCurrentUser, getTokens, login, refreshCredentials } from "./auth";
import ora from "ora";

const access = promisify(fs.access);
const copy = promisify(ncp);

export type InitOptions = Partial<{
    // skipPrompts: boolean;
    git: boolean;
    dir_name: string;

    targetDirectory: string;
    templateDirectory: string;

    skipInstall: boolean;

    authToken?: string;
    firebaseProjectId?: string;

    v2: boolean;

    env: "prod" | "dev";
}>

export async function createFireCMSApp(args) {

    console.log(`
${chalk.green.bold(" ___ _          ___ __  __ ___")}
${chalk.green.bold("| __(_)_ _ ___ / __|  \\/  / __|")}
${chalk.green.bold("| _|| | '_/ -_) (__| |\\/| \\__ \\")}
${chalk.green.bold("|_| |_|_| \\___|\\___|_|  |_|___/")}

${chalk.red.bold("Welcome to the FireCMS CLI")} 🔥
`);
    let options = parseArgumentsIntoOptions(args);

    let currentUser = await getCurrentUser();
    if (!options.v2 && !currentUser) {
        console.log("You need to be logged in to create a project");
        await inquirer.prompt([
            {
                type: "confirm",
                name: "login",
                message: "Do you want to log in?",
                default: true,
            }
        ]).then(async answers => {
            if (answers.login) {
                return login(options.env);
            }
        });

        let currentUser = await getCurrentUser();
        if (!currentUser) {
            console.log("The login process was not completed. Exiting...");
            return;
        }
    } else {
        console.log("You are logged in as", currentUser["email"]);
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
            "--env": String
        },
        {
            argv: rawArgs.slice(2),
        }
    );
    const env = args["--env"] || "prod";
    if (env !== "prod" && env !== "dev") {
        console.log("Please specify a valid environment: dev or prod");
        console.log("create-firecms-app --env=prod");
        return;
    }

    return {
        // skipPrompts: args["--yes"] || false,
        git: args["--git"] || false,
        dir_name: args._[0],
        skipInstall: args["--skipInstall"] || false,
        v2: args["--v2"] || false,
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
    if (!options.v2) {
        questions.push({
            type: "confirm",
            name: "existing_firecms_project",
            message: "Do you already have a FireCMS project?",
            default: true,
        });

        const spinner = ora("Loading your projects").start();
        const projects = await getProjects(options.env)
            .then((res) => {
                spinner.succeed();
                return res;
            })
            .catch(() => spinner.fail("Error loading projects"));

        const fireCMSProjects = projects.filter(project => project["fireCMSProject"]);
        if (!fireCMSProjects.length) {
            console.log("No FireCMS projects found");
            process.exit(1);
        }
        // console.log({ projects });
        questions.push({
            type: "list",
            name: "firebaseProjectId",
            message: "Select your project",
            when: (answers) => Boolean(answers.existing_firecms_project),
            choices: projects.map(project => project.projectId)
        });
    }

    if (!options.dir_name) {
        questions.push({
            type: "input",
            name: "dir_name",
            message: "Please choose which folder to create the project in",
            when: (answers) => Boolean(answers.firebaseProjectId),
            default: defaultName,
        });
    }

    if (!options.git) {
        questions.push({
            type: "confirm",
            name: "git",
            message: "Initialize a git repository?",
            when: (answers) => Boolean(answers.firebaseProjectId),
            default: false,
        });
    }

    const answers = await inquirer.prompt(questions);

    if (!answers.existing_firecms_project) {
        console.log("Please create a FireCMS project first. Head to https://app.firecms.co to get started and then run this command again!");
        process.exit(1);
    }

    return {
        ...options,
        dir_name: options.dir_name || answers.dir_name,
        git: options.git || answers.git,
        firebaseProjectId: answers.firebaseProjectId,
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
        targetDirectory: targetDirectory,
    };

    const templateDir = path.resolve(
        __dirname,
        "../../templates/" + (options.v2 ? "template_v2" : "template_v3")
    );
    options.templateDirectory = templateDir;

    try {
        await access(templateDir, fs.constants.R_OK);
    } catch (err) {
        console.error("%s Invalid template name " + templateDir, chalk.red.bold("ERROR"));
        process.exit(1);
    }

    const tasks = new Listr([
        {
            title: "Copy project files",
            task: (ctx) => copyTemplateFiles(options, ctx.webappConfig),
        },
        {
            title: "Initialize git",
            task: () => initGit(options),
            enabled: () => options.git,
        },
        {
            title: "Install dependencies",
            task: () =>
                projectInstall({
                    cwd: options.targetDirectory,
                }),
            skip: () =>
                options.skipInstall
                    ? "Pass --skipInstall to skip automatically installing dependencies"
                    : undefined,
        },
    ]);

    await tasks.run();

    console.log("");
    console.log("%s Your project is ready!", chalk.green.bold("DONE"));
    console.log("");

    if (options.v2) {
        console.log("First update your firebase config in");
        console.log(chalk.bgYellow.black.bold("src/firebase-config.ts"));
        console.log("");
        console.log("Then run:");
        console.log(chalk.cyan.bold("cd " + options.dir_name));
        if (options.skipInstall)
            console.log(chalk.cyan.bold("yarn"));
        console.log(chalk.cyan.bold("yarn dev"));
        console.log("");
    } else {
        console.log("If you want to run your project locally, run:");
        console.log(chalk.bgYellow.black.bold("yarn dev"));
        console.log("");
        console.log("If you want to deploy your project, run:");
        console.log(chalk.bgYellow.black.bold("yarn deploy"));
        console.log("and see it running in https://app.firecms.co");
    }

    return true;
}

async function copyTemplateFiles(options: InitOptions, webappConfig?: object) {
    return copy(options.templateDirectory, options.targetDirectory, {
        clobber: false,
    }).then(_ => {
        if (options.v2 && webappConfig) {
            writeWebAppConfig(options, webappConfig);
        }
        if (!options.v2) {
            return replaceProjectIdInTemplateFiles(options, [
                "./src/App.tsx",
                "./package.json",
            ]);
        }
    });
}

async function replaceProjectIdInTemplateFiles(options: InitOptions, files: string[] = []) {
    const fs = require("fs");

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
        cwd: options.targetDirectory,
    });
    if (result.failed) {
        return Promise.reject(new Error("Failed to initialize git"));
    }
    return;
}

function writeWebAppConfig(options: InitOptions, webappConfig: object) {
    fs.writeFile(options.targetDirectory + "/src/firebase_config.ts",
        `export const firebaseConfig = ${JSON5.stringify(webappConfig, null, "\t")};`,
        function (err) {
            if (err) return console.log(err);
        });
}

async function getProjects(env: "prod" | "dev") {

    try {
        const tokens = await refreshCredentials(env, await getTokens());
        const server = env === "prod" ? DEFAULT_SERVER : DEFAULT_SERVER_DEV;
        const response = await axios.get(server + "/gcp_projects", {
            headers: {
                ["x-admin-authorization"]: `Bearer ${tokens["access_token"]}`
            },
        });

        return response.data.data;
    } catch (e) {
        console.error("Error getting projects", e.response?.data);
    }
}
