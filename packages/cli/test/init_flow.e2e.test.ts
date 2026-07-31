import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { execSync, spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

/**
 * End-to-end test for `firecms init`.
 *
 * This drives the real CLI as a subprocess rather than importing it: `commands/init.ts`
 * uses `import.meta.url`, so it cannot be required from a CommonJS test, and running the
 * published entrypoint is a truer test of the flow anyway — it exercises argv parsing,
 * the interactive prompts, template resolution and the file copy exactly as a user hits
 * them.
 *
 * The CLI is fully interactive even when every flag is supplied (`--projectId` only seeds
 * a prompt default), so the test feeds newlines to accept defaults until the process
 * exits. No network or login is required: logged out, the project picker falls back to
 * "Enter project id manually".
 */

const CLI_ROOT = path.resolve(__dirname, "..");
const BIN = path.join(CLI_ROOT, "bin", "firecms.js");
const BUILT = path.join(CLI_ROOT, "dist", "index.es.js");

let workDir: string;

/** Run `firecms <args>` in `cwd`, answering every prompt with a bare newline. */
function runInit(args: string[], cwd: string): Promise<{ code: number | null, output: string }> {
    return new Promise((resolve) => {
        const child = spawn(process.execPath, [BIN, ...args], {
            cwd,
            stdio: ["pipe", "pipe", "pipe"],
            env: { ...process.env, CI: "1" }
        });

        let output = "";
        child.stdout.on("data", d => output += d.toString());
        child.stderr.on("data", d => output += d.toString());

        // Accept defaults. Keep feeding until the process exits — the number of prompts
        // varies by template, so a fixed-size buffer would either run dry or race.
        const tick = setInterval(() => {
            if (!child.stdin.destroyed) child.stdin.write("\n");
        }, 150);

        child.on("close", (code) => {
            clearInterval(tick);
            child.stdin.end();
            resolve({ code, output });
        });
    });
}

beforeAll(() => {
    if (!fs.existsSync(BUILT)) {
        // The e2e needs the built CLI; build it once rather than skipping silently.
        execSync("npm run build", { cwd: CLI_ROOT, stdio: "ignore" });
    }
    workDir = fs.mkdtempSync(path.join(os.tmpdir(), "firecms-cli-e2e-"));
}, 600_000);

afterAll(() => {
    if (workDir) fs.rmSync(workDir, { recursive: true, force: true });
});

describe("firecms init", () => {

    it("scaffolds into the directory named on the command line", async () => {
        const cwd = fs.mkdtempSync(path.join(workDir, "named-"));

        const { output } = await runInit(["init", "--pro", "--projectId", "my-test-project", "my-app"], cwd);

        // Regression: the "init" subcommand used to leak into the positional args, so the
        // project was scaffolded into a folder literally called "init".
        expect(fs.existsSync(path.join(cwd, "my-app"))).toBe(true);
        expect(fs.existsSync(path.join(cwd, "init"))).toBe(false);
        expect(output).toContain("Copy project files");
    }, 300_000);

    it("produces a usable PRO project", async () => {
        const cwd = fs.mkdtempSync(path.join(workDir, "pro-"));

        await runInit(["init", "--pro", "--projectId", "my-test-project", "app"], cwd);
        const project = path.join(cwd, "app");

        for (const f of ["package.json", "index.html", "tsconfig.json", "firebase.json", "src"]) {
            expect(fs.existsSync(path.join(project, f))).toBe(true);
        }

        const pkg = JSON.parse(fs.readFileSync(path.join(project, "package.json"), "utf8"));
        expect(typeof pkg.name).toBe("string");
        expect(pkg.dependencies["@firecms/core"]).toBeDefined();
    }, 300_000);

    it("substitutes the Firebase project id into the template", async () => {
        const cwd = fs.mkdtempSync(path.join(workDir, "projid-"));

        await runInit(["init", "--pro", "--projectId", "substituted-id", "app"], cwd);
        const firebaserc = fs.readFileSync(path.join(cwd, "app", ".firebaserc"), "utf8");

        expect(firebaserc).toContain("substituted-id");
    }, 300_000);

    it("does not ship template build artifacts into the new project", async () => {
        const cwd = fs.mkdtempSync(path.join(workDir, "clean-"));

        await runInit(["init", "--pro", "--projectId", "my-test-project", "app"], cwd);
        const project = path.join(cwd, "app");

        // The template folders are used for local development too, so a stale
        // node_modules or lockfile there would otherwise be copied to every new project.
        for (const junk of ["node_modules", "pnpm-lock.yaml", "yarn.lock", "package-lock.json", "dist", "build"]) {
            expect(fs.existsSync(path.join(project, junk))).toBe(false);
        }
    }, 300_000);

    it("refuses to scaffold into a non-empty directory", async () => {
        const cwd = fs.mkdtempSync(path.join(workDir, "occupied-"));
        fs.mkdirSync(path.join(cwd, "app"));
        fs.writeFileSync(path.join(cwd, "app", "existing.txt"), "do not clobber me");

        const { output } = await runInit(["init", "--pro", "--projectId", "my-test-project", "app"], cwd);

        expect(output).toContain("Directory is not empty");
        // The pre-existing file must survive untouched.
        expect(fs.readFileSync(path.join(cwd, "app", "existing.txt"), "utf8")).toEqual("do not clobber me");
        expect(fs.existsSync(path.join(cwd, "app", "package.json"))).toBe(false);
    }, 300_000);

});
