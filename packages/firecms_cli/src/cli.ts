import arg from "arg";
import chalk from "chalk";
import { build } from "./commands/deploy";
const fs = require('fs');


export function entry(args) {
    fs.readdir(process.cwd(), (err, files) => {
        if (err) {
            console.error(`An error occurred: ${err}`);
        } else {
            console.log(`Current directory files: \n${files.join('\n')}`);
        }
    });

    if (args.length !== 3) {
        printHelp();
        return;
    } else {
        if (args[2] === "init") {
            console.log("init");
        } else if (args[2] === "deploy") {
            build();
            console.log("deploy");
        } else {
            console.log("Unknown command", args[2])
            printHelp();
            return;
        }
    }
}

function printHelp() {
    console.log(`
${chalk.red.bold("Welcome to the FireCMS CLI 🔥🔥🔥")}

${chalk.green.bold("Usage")}
firecms <command> [options]

${chalk.green.bold("Commands")}
${chalk.blue.bold("init")} - Create a new CMS project
${chalk.blue.bold("deploy")} - Deploy an existing CMS project
    
`);
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
