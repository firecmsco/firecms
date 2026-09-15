import FormData from "form-data";
import * as os from "os";
import * as path from "path";
import fs from "fs";
import axios from "axios";
import { exec } from "child_process";
import archiver from "archiver";
import { getCurrentUser, getTokens, refreshCredentials } from "./auth";
import { DEFAULT_SERVER, DEFAULT_SERVER_DEV } from "../common";
import ora from "ora";
import chalk from "chalk";
import { createWriteStream } from "fs";
import { authCommand, describeRequestError, isLoginRejected } from "../util/request_error";

export async function deploy(projectId: string, env: "prod" | "dev", debug: boolean) {
    const currentUser = await getCurrentUser(env, debug);
    if (!currentUser) {
        console.log("⚠️ You are not logged in");
        console.log(`Run ${chalk.red.bold(authCommand("login", env))} to log in`);
        process.exitCode = 1;
        return;
    }
    console.log("Starting deploy");
    let zipFilePath: string;
    try {
        zipFilePath = await createZipFromBuild();
    } catch (e) {
        console.log("%s %s", chalk.red.bold("ERROR"), (e as Error).message);
        process.exitCode = 1;
        return;
    }

    let sourceZipPath: string | null = null;
    try {
        sourceZipPath = await createSourceZip();
        if (sourceZipPath) {
            console.log("📦 Source code packaged for revision history");
        }
    } catch (e) {
        console.warn("⚠️ Could not package source code (non-fatal):", (e as Error).message);
    }

    await uploadZip(projectId, zipFilePath, sourceZipPath, env, debug);
}

export const BUILD_DIR = "./dist/assets";

export async function createZipFromBuild(): Promise<string> {
    // `archive.directory` on a missing folder adds nothing and raises nothing, so a deploy
    // run before the build uploaded an empty zip — over whatever was already deployed.
    const buildDir = path.resolve(BUILD_DIR);
    if (!fs.existsSync(buildDir) || fs.readdirSync(buildDir).length === 0) {
        throw new Error(`Nothing to deploy: ${BUILD_DIR} is missing or empty. Run \`npm run build\` first.`);
    }
    return new Promise((resolve, reject) => {
        const tmpdir = os.tmpdir();
        const destFile = path.join(tmpdir, `firecms_build.zip`);
        const output = fs.createWriteStream(destFile);
        const archive = archiver("zip", { zlib: { level: 6 } });

        output.on("close", () => resolve(destFile));
        archive.on("error", (err) => reject(err));
        archive.pipe(output);

        archive.directory("./dist/assets", false);
        archive.finalize();
    })
}

/**
 * Directories and files to exclude from the source zip.
 */
const SOURCE_ZIP_EXCLUDES = new Set([
    "node_modules",
    "dist",
    ".git",
    ".idea",
    ".vscode",
    ".next",
    ".turbo",
    "build",
    "coverage",
    ".env",
    ".env.local",
]);

/**
 * Creates a zip of the entire project root (cwd), excluding
 * build artifacts, node_modules, and other non-source files.
 * Returns the path to the zip, or null if nothing to zip.
 */
export async function createSourceZip(): Promise<string | null> {
    const projectRoot = process.cwd();
    const destFile = path.join(os.tmpdir(), "firecms_source.zip");

    return new Promise<string>((resolve, reject) => {
        const output = createWriteStream(destFile);
        const archive = archiver("zip", { zlib: { level: 6 } });

        output.on("close", () => resolve(destFile));
        archive.on("error", (err: Error) => reject(err));
        archive.pipe(output);

        // Walk the project directory and add files
        addDirectoryToArchive(archive, projectRoot, "");

        archive.finalize();
    });
}

function addDirectoryToArchive(archive: any, basePath: string, relativePath: string) {
    const fullPath = relativePath ? path.join(basePath, relativePath) : basePath;
    const entries = fs.readdirSync(fullPath, { withFileTypes: true });

    for (const entry of entries) {
        if (SOURCE_ZIP_EXCLUDES.has(entry.name)) continue;
        // Skip hidden files/dirs (dotfiles) except specific ones we might want
        if (entry.name.startsWith(".") && !["src", "public"].includes(entry.name)) continue;

        const entryRelative = relativePath ? path.join(relativePath, entry.name) : entry.name;

        if (entry.isDirectory()) {
            addDirectoryToArchive(archive, basePath, entryRelative);
        } else if (entry.isFile()) {
            archive.file(path.join(basePath, entryRelative), { name: entryRelative });
        }
    }
}

export async function uploadZip(projectId: string, zipFilePath: string, sourceZipPath: string | null, env: "prod" | "dev", debug: boolean) {

    if (env === "dev") {
        console.log("!!! Uploading to dev server");
    }

    // refreshCredentials returns null once it has failed, logged the user out and said why.
    // Both checks run before the spinner starts, so their output is not drawn over and an
    // early return does not leave it spinning.
    const tokens = await refreshCredentials(env, await getTokens(env, debug));
    if (!tokens) {
        console.error(`\n${chalk.red.bold("Deploy failed:")} your saved login could not be refreshed. Run ${chalk.red.bold(authCommand("login", env))}, then deploy again.`);
        process.exitCode = 1;
        return;
    }

    // Check if the file exists
    if (!fs.existsSync(zipFilePath)) {
        console.error(`File ${zipFilePath} does not exist`);
        process.exitCode = 1;
        return;
    }

    const spinner = ora("Uploading build of project " + projectId).start();

    const form = new FormData();
    form.append("zip", fs.createReadStream(zipFilePath), "file.zip");

    // Append source zip if available
    if (sourceZipPath && fs.existsSync(sourceZipPath)) {
        form.append("source_zip", fs.createReadStream(sourceZipPath), "source.zip");
    }

    try {
        const server = env === "prod" ? DEFAULT_SERVER : DEFAULT_SERVER_DEV;
        const response = await axios.post(`${server}/projects/${projectId}/upload_config`, form, {
            headers: {
                ...form.getHeaders(),
                ["x-admin-authorization"]: `Bearer ${tokens["access_token"]}`
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        if (response.status === 200) {
            spinner.succeed();
            console.log("🔥 Successfully uploaded new build");
            const baseUrl = env === "prod" ? "https://app.firecms.co/" : "https://staging.app.firecms.co/";
            console.log("\nCheck it out at", baseUrl + `p/${projectId}`);
        } else {
            console.error("There was an error uploading the build");
            console.error(response.data);
            spinner.fail();
            process.exitCode = 1;
        }

        // console.log(response.data);
    } catch (err) {
        spinner.fail();
        console.error(`${chalk.red.bold("There was an error uploading the build:")} ${describeRequestError(err)}`);
        if (isLoginRejected(err)) {
            // The rejected tokens are still saved, and `firecms login` refuses to run while
            // they are, so logging out has to come first.
            console.error(`Your saved login was rejected. Run ${chalk.red.bold(authCommand("logout", env))}, then ${chalk.red.bold(authCommand("login", env))}, and deploy again.`);
        }
        process.exitCode = 1;
    }
}

