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
import { DEFAULT_SERVER } from "../common";

const access = promisify(fs.access);
const copy = promisify(ncp);

export type InitOptions = Partial<{
    skipPrompts: boolean;
    git: boolean;
    dir_name: string;

    targetDirectory: string;
    templateDirectory: string;

    skipInstall: boolean;

    authToken?: string;
    firebaseProjectId?: string;

    v2: boolean;
}>

export async function createFireCMSApp(args) {

    console.log(`
${chalk.green.bold(" ___ _          ___ __  __ ___")}
${chalk.green.bold("| __(_)_ _ ___ / __|  \\/  / __|")}
${chalk.green.bold("| _|| | '_/ -_) (__| |\\/| \\__ \\")}
${chalk.green.bold("|_| |_|_| \\___|\\___|_|  |_|___/")}

${chalk.green.bold("Welcome to the CMS CLI")} 🔥🔥🔥
`);
    console.log("");

    let options = parseArgumentsIntoOptions(args);

    options = await promptForMissingOptions(options);

    await createProject(options);
}

function parseArgumentsIntoOptions(rawArgs): InitOptions {
    const args = arg(
        {
            "--git": Boolean,
            "--yes": Boolean,
            "--skipInstall": Boolean,
            "--projectId": String,
            "--v2": Boolean
        },
        {
            argv: rawArgs.slice(2),
        }
    );
    return {
        skipPrompts: args["--yes"] || false,
        git: args["--git"] || false,
        dir_name: args._[0],
        skipInstall: args["--skipInstall"] || false,
        v2: args["--v2"] || false,
        firebaseProjectId: args["--projectId"],
    };
}

async function promptForMissingOptions(options: InitOptions): Promise<InitOptions> {
    const defaultName = "my-cms";
    if (options.skipPrompts) {
        return {
            ...options,
            dir_name: options.dir_name || defaultName,
        };
    }

    const questions = [];
    if (!options.dir_name) {
        questions.push({
            type: "input",
            name: "dir_name",
            message: "Please choose which folder to use",
            default: defaultName,
        });
    }

    if (!options.git) {
        questions.push({
            type: "confirm",
            name: "git",
            message: "Initialize a git repository?",
            default: false,
        });
    }

    if (!options.v2) {
        questions.push({
            type: "confirm",
            name: "existing_firecms_project",
            message: "Do you already have a FireCMS project?",
            default: false,
        });

        questions.push({
            type: "input",
            name: "project_id",
            message: "Enter the URL",
            when: (answers) => Boolean(answers.existing_firecms_project)
        });
    }

    const answers = await inquirer.prompt(questions);
    return {
        ...options,
        dir_name: options.dir_name || answers.dir_name,
        git: options.git || answers.git,
    };
}

async function copyTemplateFiles(options: InitOptions, webappConfig?: object) {
    return copy(options.templateDirectory, options.targetDirectory, {
        clobber: false,
    }).then(_ => {
        if (webappConfig) {
            writeWebAppConfig(options, webappConfig);
        }
    });
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
        "../templates/" + options.v2 ? "template_v2" : "template_v3"
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
    console.log("%s Project ready", chalk.green.bold("DONE"));
    console.log("");
    console.log("First update your firebase config in");
    console.log(chalk.bgYellow.black.bold("src/firebase-config.ts"));
    console.log("");
    console.log("Then run:");
    console.log(chalk.cyan.bold("cd " + options.dir_name));
    if (options.skipInstall)
        console.log(chalk.cyan.bold("yarn"));
    console.log(chalk.cyan.bold("yarn dev"));
    console.log("");
    return true;
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

async function getProjects() {
    const response = await axios.get(DEFAULT_SERVER + "/projects", {});

    return response.data.data;
}
