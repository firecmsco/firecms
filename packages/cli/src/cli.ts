import chalk from "chalk";
import { deploy } from "./commands/deploy";
import { getCurrentUser, login, logout } from "./commands/auth";
import arg from "arg";
import { createFireCMSApp } from "./commands/init";

export async function entry(args) {

    if (args.length < 2) {
        printHelp();
        return;
    }

    const command = args[2];

    if (command === "init") {
        await createFireCMSApp(args);
    } else if (command === "login") {
        await loginArgs(args);
    } else if (command === "logout") {
        await logoutArgs(args);
    } else if (command === "deploy") {
        await deployArgs(args);
    } else {
        if (command)
            console.log("Unknown command", command)
        printHelp();
        return;
    }
}

async function loginArgs(rawArgs) {
    const args = arg(
        {
            "--env": String,
            "--debug": Boolean
        },
        {
            argv: rawArgs.slice(2),
        }
    );
    const env = args["--env"] || "prod";
    const debug = args["--debug"] || false;
    if (env !== "prod" && env !== "dev") {
        console.log("Please specify a valid environment: dev or prod");
        console.log("firecms login --env=prod");
        return;
    }
    await login(env, debug);
}

async function logoutArgs(rawArgs) {
    const args = arg(
        {
            "--env": String,
            "--debug": Boolean
        },
        {
            argv: rawArgs.slice(2),
        }
    );
    const env = args["--env"] || "prod";
    const debug = args["--debug"] || false;
    if (env !== "prod" && env !== "dev") {
        console.log("Please specify a valid environment: dev or prod");
        console.log("firecms logout --env=prod");
        return;
    }
    await logout(env, debug);
}

async function deployArgs(rawArgs) {
    const args = arg(
        {
            "--project": String,
            "--env": String,
            "--debug": Boolean
        },
        {
            argv: rawArgs.slice(2),
        }
    );
    const project = args["--project"];

    if (!project) {
        console.log("Please specify a project:");
        console.log("firecms deploy --project=your-project-id");
        return;
    }
    const env = args["--env"] || "prod";
    const debug = args["--debug"] || false;
    if (env !== "prod" && env !== "dev") {
        console.log("Please specify a valid environment:");
        console.log("firecms deploy --project=your-project-id --env=dev");
        return;
    }

    const currentUser = await getCurrentUser(env, debug);
    if (!currentUser) {
        await login(env, debug);
    }

    await deploy(project, env, debug);
}

async function printHelp(env: "prod" | "dev" = "prod", debug: boolean = false) {

    console.log(`
${chalk.red.bold("Welcome to the FireCMS CLI 🔥🔥🔥")}

${chalk.green.bold("Usage")}
firecms ${chalk.blue.bold("<command>")} [options]

${chalk.green.bold("Commands")}
${chalk.blue.bold("login")} - Login to FireCMS
${chalk.blue.bold("logout")} - Sign out
${chalk.blue.bold("init")} - Create a new CMS project
${chalk.blue.bold("deploy")} - Deploy an existing CMS project
`);
    const currentCredentials = await getCurrentUser(env, debug);
    if (currentCredentials) {
        console.log(`${chalk.green.bold("Current user")}
${currentCredentials["email"]}
`);
    }

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
