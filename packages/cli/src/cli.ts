import chalk from "chalk";
import { deploy } from "./commands/deploy";
import { getCurrentUser, login, logout } from "./commands/auth";
import arg from "arg";
import { createFireCMSApp } from "./commands/init";
import { migrateRowy } from "./commands/migrate_rowy";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const HELP_COMMANDS = ["help", "--help", "-h"];

export async function entry(args) {

    if (args.length < 2) {
        await printHelp();
        return;
    }

    const command = args[2];

    if (command === "init") {
        // Drop the "init" subcommand before handing over. `createFireCMSApp` is also the
        // entrypoint of `create-firecms-app`, which calls it with a bare `process.argv`,
        // so `parseArgumentsIntoOptions` does `rawArgs.slice(2)` and reads the target
        // directory from `args._[0]`. Passing the subcommand through made that "init",
        // so `firecms init my-app` scaffolded into a folder called "init".
        await createFireCMSApp([...args.slice(0, 2), ...args.slice(3)]);
    } else if (command === "login") {
        await loginArgs(args);
    } else if (command === "logout") {
        await logoutArgs(args);
    } else if (command === "deploy") {
        await deployArgs(args);
    } else if (command === "migrate") {
        await migrateArgs(args);
    } else if (command === "version" || command === "-v" || command === "--version") {
        printVersion();
    } else if (!command || HELP_COMMANDS.includes(command)) {
        await printHelp();
    } else {
        console.log("%s Unknown command %s", chalk.red.bold("ERROR"), command);
        await printHelp();
        process.exitCode = 1;
    }
}

/**
 * Parse a command's flags. An unknown flag, or a flag missing its value, is a usage
 * error to print, not a stack trace.
 */
function parseCommandArgs<T extends arg.Spec>(spec: T, rawArgs: string[], usage: string, firstFlag = 3): arg.Result<T> {
    try {
        return arg(spec, { argv: rawArgs.slice(firstFlag) });
    } catch (e: any) {
        if (typeof e?.code === "string" && e.code.startsWith("ARG_")) {
            console.log("%s %s", chalk.red.bold("ERROR"), e.message);
            console.log(usage);
            process.exit(1);
        }
        throw e;
    }
}

function invalidEnv(usage: string) {
    console.log("%s Please specify a valid environment: dev or prod", chalk.red.bold("ERROR"));
    console.log(usage);
    process.exitCode = 1;
}

function printVersion() {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const packageJsonPath = path.resolve(__dirname, "../package.json");
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        console.log(packageJson.version);
    } catch (e) {
        console.error("Error reading version", e);
    }
}

async function loginArgs(rawArgs) {
    const usage = "Usage: firecms login [--env=prod|dev]";
    const args = parseCommandArgs({
        "--env": String,
        "--debug": Boolean
    }, rawArgs, usage);
    const env = args["--env"] || "prod";
    const debug = args["--debug"] || false;
    if (env !== "prod" && env !== "dev") {
        invalidEnv(usage);
        return;
    }
    await login(env, debug);
    // `login` explains its own failures; the exit code is what tells a script about them.
    if (!await getCurrentUser(env, debug)) process.exitCode = 1;
}

async function logoutArgs(rawArgs) {
    const usage = "Usage: firecms logout [--env=prod|dev]";
    const args = parseCommandArgs({
        "--env": String,
        "--debug": Boolean
    }, rawArgs, usage);
    const env = args["--env"] || "prod";
    const debug = args["--debug"] || false;
    if (env !== "prod" && env !== "dev") {
        invalidEnv(usage);
        return;
    }
    await logout(env, debug);
}

async function deployArgs(rawArgs) {
    const usage = "Usage: firecms deploy --project=your-project-id [--env=prod|dev]";
    const args = parseCommandArgs({
        "--project": String,
        "--env": String,
        "--debug": Boolean
    }, rawArgs, usage);
    const project = args["--project"];

    if (!project) {
        console.log("%s Please specify a project", chalk.red.bold("ERROR"));
        console.log(usage);
        process.exitCode = 1;
        return;
    }
    const env = args["--env"] || "prod";
    const debug = args["--debug"] || false;
    if (env !== "prod" && env !== "dev") {
        invalidEnv(usage);
        return;
    }

    const currentUser = await getCurrentUser(env, debug);
    if (!currentUser && process.stdin.isTTY) {
        // Only where someone can actually sign in. Unattended, this started a login that
        // waited for a browser nobody would open, printing nothing; `deploy` below says
        // what is wrong and exits 1 instead.
        console.log("You need to be logged in to deploy.");
        await login(env, debug);
    }

    await deploy(project, env, debug);
}

const MIGRATE_ROWY_USAGE = `${chalk.green.bold("Usage")}
  firecms migrate rowy --project <id> [options]

Reads your Rowy tables from Firestore (_rowy_) and writes FireCMS collections and a
migration report. It only reads Rowy's configuration: no documents, and nothing is written
to your project. It uses your gcloud sign-in (gcloud auth login).

${chalk.green.bold("Options")}
  --project <id>       Firebase project that Rowy uses.
  --input <file>       Read the configuration from a JSON file instead of Firestore.
  --target <target>    cloud or self-hosted. Sets the import in the generated files.
                       Default: self-hosted.
  --out <folder>       Where to write. Default: ./rowy-migration
  --tables <ids>       Only these Rowy table ids, comma separated.
  --force              Write into a folder that already has files.
  --help               Show this help.`;

async function migrateArgs(rawArgs: string[]) {
    const source = rawArgs[3];
    if (source !== "rowy" || HELP_COMMANDS.includes(rawArgs[4])) {
        if (source && source !== "rowy" && !HELP_COMMANDS.includes(source)) {
            console.log("%s firecms migrate only supports rowy for now", chalk.red.bold("ERROR"));
            process.exitCode = 1;
        }
        console.log(MIGRATE_ROWY_USAGE);
        return;
    }

    const args = parseCommandArgs({
        "--project": String,
        "--input": String,
        "--target": String,
        "--out": String,
        "--tables": String,
        "--force": Boolean,
        "--help": Boolean
    }, rawArgs, MIGRATE_ROWY_USAGE, 4);

    if (args["--help"]) {
        console.log(MIGRATE_ROWY_USAGE);
        return;
    }

    const target = args["--target"] ?? "self-hosted";
    if (target !== "cloud" && target !== "self-hosted") {
        console.log("%s --target must be cloud or self-hosted", chalk.red.bold("ERROR"));
        console.log(MIGRATE_ROWY_USAGE);
        process.exitCode = 1;
        return;
    }
    if (!args["--project"] && !args["--input"]) {
        console.log("%s Pass --project with your Firebase project ID, or --input with a JSON file", chalk.red.bold("ERROR"));
        console.log(MIGRATE_ROWY_USAGE);
        process.exitCode = 1;
        return;
    }

    try {
        await migrateRowy({
            projectId: args["--project"],
            inputFile: args["--input"],
            target,
            outDir: args["--out"] ?? "rowy-migration",
            tables: args["--tables"]?.split(",").map(id => id.trim()).filter(Boolean),
            force: args["--force"] ?? false
        });
    } catch (e: any) {
        console.log("%s %s", chalk.red.bold("ERROR"), e?.message ?? e);
        process.exitCode = 1;
    }
}

async function printHelp(env: "prod" | "dev" = "prod", debug: boolean = false) {

    console.log(`
${chalk.red.bold("Welcome to the FireCMS CLI 🔥🔥🔥")}

${chalk.green.bold("Usage")}
firecms ${chalk.blue.bold("<command>")} [options]

${chalk.green.bold("Commands")}
${chalk.blue.bold("login")} - Login to FireCMS
${chalk.blue.bold("logout")} - Sign out
${chalk.blue.bold("init")} - Create a new CMS project (${chalk.bold("firecms init --help")} for its options)
${chalk.blue.bold("deploy")} - Deploy an existing CMS project
${chalk.blue.bold("migrate rowy")} - Turn Rowy tables into FireCMS collections (${chalk.bold("firecms migrate rowy --help")})
${chalk.blue.bold("version")} - Show version info
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
