import arg from 'arg';
import { createProject } from "./main";
import inquirer from "inquirer";
import chalk from "chalk";
import path from "path";

export type CLIOptions = Partial<{
    skipPrompts: boolean;
    git: boolean;
    dir_name: string;

    targetDirectory: string;
    templateDirectory: string;

    skipInstall: boolean;

    authToken?: string;
    firebaseProject?: string;

}>

function parseArgumentsIntoOptions(rawArgs): CLIOptions {
    const args = arg(
        {
            '--git': Boolean,
            '--yes': Boolean,
            '--skipInstall': Boolean,
        },
        {
            argv: rawArgs.slice(2),
        }
    );
    return {
        skipPrompts: args['--yes'] || false,
        git: args['--git'] || false,
        dir_name: args._[0],
        skipInstall: args['--skipInstall'] || false,
    };
}

async function promptForMissingOptions(options: CLIOptions): Promise<CLIOptions> {
    const defaultName = 'my-cms';
    if (options.skipPrompts) {
        return {
            ...options,
            dir_name: options.dir_name || defaultName,
        };
    }

    const questions = [];
    if (!options.dir_name) {
        questions.push({
            type: 'input',
            name: 'dir_name',
            message: 'Please choose which folder to use',
            default: defaultName,
        });
    }

    if (!options.git) {
        questions.push({
            type: 'confirm',
            name: 'git',
            message: 'Initialize a git repository?',
            default: false,
        });
    }

    const answers = await inquirer.prompt(questions);
    return {
        ...options,
        dir_name: options.dir_name || answers.dir_name,
        git: options.git || answers.git,
    };
}

export async function createFireCMSApp(args) {

    console.log(`
${chalk.green.bold(" ___ _          ___ __  __ ___")}
${chalk.green.bold("| __(_)_ _ ___ / __|  \\/  / __|")}
${chalk.green.bold("| _|| | '_/ -_) (__| |\\/| \\__ \\")}
${chalk.green.bold("|_| |_|_| \\___|\\___|_|  |_|___/")}

${chalk.green.bold("Welcome to the CMS CLI")}
🔥🔥🔥
`);
    console.log('');

    let options = parseArgumentsIntoOptions(args);

    options = await promptForMissingOptions(options);

    await createProject(options);
}
// function debugPaths() {
//     // @ts-ignore
//     const currentFileUrl = import.meta["url"];
//     console.log("currentFileUrl", currentFileUrl)
//     console.log("__dirname", __dirname);
//     console.log("process.cwd()", process.cwd());
//
//     const templateDir = path.resolve(
//         new URL(currentFileUrl).pathname,
//         '../../template'
//     );
//
//     console.log("templateDir", templateDir);
//
//     const templateDir2 = path.resolve(
//         __dirname,
//         '../template'
//     );
//     console.log("templateDir2", templateDir2);
// }
