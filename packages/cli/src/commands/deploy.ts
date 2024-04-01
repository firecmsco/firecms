import FormData from "form-data";
import * as os from "os";
import * as path from "path";
import fs from "fs";
import axios from "axios";
import { exec } from "child_process";
import zipFolder from "zip-folder";
import { getCurrentUser, getTokens, refreshCredentials } from "./auth";
import { DEFAULT_SERVER, DEFAULT_SERVER_DEV } from "../common";
import ora from "ora";
import chalk from "chalk";

export async function deploy(projectId: string, env: "prod" | "dev", debug: boolean) {
    const currentUser = await getCurrentUser(env, debug);
    if (!currentUser) {
        console.log("⚠️ You are not logged in");
        console.log(`Run ${chalk.red.bold("firecms login")} to log in`);
        return;
    }
    console.log("Starting deploy");
    const zipFilePath = await createZipFromBuild();
    await uploadZip(projectId, zipFilePath, env, debug);
}

export function build() {

    exec("yarn build", (err, stdout, stderr) => {
        if (err) {
            // Node couldn't execute the command
            return console.error(`exec error: ${err}`);
        }
        // The output of the command is passed in stdout and stderr
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
}

export async function createZipFromBuild(): Promise<string> {
    return new Promise((resolve, reject) => {
        const tmpdir = os.tmpdir();
        const destFile = path.join(tmpdir, `firecms_build.zip`);
        // const destFile = path.join(tmpdir, `${crypto.randomUUID()}.zip`);
        zipFolder("./dist/assets", destFile, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(destFile);
            }
        });
    })
}

export async function uploadZip(projectId: string, zipFilePath: string, env: "prod" | "dev", debug: boolean) {

    if (env === "dev") {
        console.log("!!! Uploading to dev server");
    }
    const spinner = ora("Uploading build of project " + projectId).start();

    const tokens = await refreshCredentials(env, await getTokens(env, debug));

    const form = new FormData();

    // Check if the file exists
    if (!fs.existsSync(zipFilePath)) {
        console.error(`File ${zipFilePath} does not exist`);
        return;
    }

    form.append("zip", fs.createReadStream(zipFilePath), "file.zip");

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
        }

        // console.log(response.data);
    } catch (err) {
        console.error("There was an error uploading the build");
        console.error(err.response.data);
        spinner.fail();
    }
}
