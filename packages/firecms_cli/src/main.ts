import chalk from 'chalk';
import fs from "fs";
import ncp from "ncp";
import path from 'path';
import { promisify } from 'util';
import execa from 'execa';
import Listr from 'listr';
import { projectInstall } from 'pkg-install';
import { CLIOptions } from "./cli";

import JSON5 from "json5";

const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(options: CLIOptions, webappConfig?: object) {
    return copy(options.templateDirectory, options.targetDirectory, {
        clobber: false,
    }).then(_ => {
        if (webappConfig) {
            writeWebAppConfig(options, webappConfig);
        }
    });
}

export async function createProject(options: CLIOptions) {

    const dir = './' + options.dir_name;
    if (fs.existsSync(dir)) {
        if (fs.readdirSync(dir).length !== 0) {
            console.error('%s Directory is not empty', chalk.red.bold('ERROR'));
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
        '../template'
    );
    options.templateDirectory = templateDir;

    try {
        await access(templateDir, fs.constants.R_OK);
    } catch (err) {
        console.error('%s Invalid template name ' + templateDir, chalk.red.bold('ERROR'));
        process.exit(1);
    }

    const tasks = new Listr([
        {
            title: 'Copy project files',
            task: (ctx) => copyTemplateFiles(options, ctx.webappConfig),
        },
        {
            title: 'Initialize git',
            task: () => initGit(options),
            enabled: () => options.git,
        },
        {
            title: 'Install dependencies',
            task: () =>
                projectInstall({
                    cwd: options.targetDirectory,
                }),
            skip: () =>
                options.skipInstall
                    ? 'Pass --skipInstall to skip automatically installing dependencies'
                    : undefined,
        },
    ]);

    await tasks.run();

    console.log('');
    console.log('%s Project ready', chalk.green.bold('DONE'));
    console.log('');
    console.log('First update your firebase config in');
    console.log(chalk.bgYellow.black.bold('src/firebase-config.ts'));
    console.log('');
    console.log('Then run:');
    console.log(chalk.cyan.bold('cd ' + options.dir_name));
    if (options.skipInstall)
        console.log(chalk.cyan.bold('yarn'));
    console.log(chalk.cyan.bold('yarn dev'));
    console.log('');
    return true;
}

async function initGit(options: CLIOptions) {
    const result = await execa('git', ['init'], {
        cwd: options.targetDirectory,
    });
    if (result.failed) {
        return Promise.reject(new Error('Failed to initialize git'));
    }
    return;
}


function writeWebAppConfig(options: CLIOptions, webappConfig: object) {
    fs.writeFile(options.targetDirectory + '/src/firebase_config.ts',
        `export const firebaseConfig = ${JSON5.stringify(webappConfig, null, '\t')};`,
        function (err) {
            if (err) return console.log(err);
        });
}
