#!/usr/bin/env node
/**
 * Smoke-tests a published FireCMS version the way a user meets it:
 *
 *   1. download @firecms/cli@<version> from npm and scaffold every template with its real
 *      `firecms init`, logged out (cloud, which init only scaffolds logged in, through
 *      `createProject`);
 *   2. pin every @firecms package to <version> and install with npm, as users do. The
 *      templates ask for `^3.0.0`, which never matches a prerelease, so without the pin a
 *      canary would be tested against the last stable release;
 *   3. build, with a marker as the license key of PRO templates, and type-check;
 *   4. check the marker reached the browser bundle;
 *   5. check the project got a .gitignore (npm drops them from the published CLI).
 *
 * check.mjs tests the same templates against the local packages before release; this
 * catches what only the published artefacts can show: what npm put in the tarballs, and
 * how the released versions resolve together. Run by publish-canary.yml after each
 * canary publish.
 *
 * Usage: node scripts/templates/smoke-published.mjs --version 3.4.1-canary.abc1234
 *            [--only pro,next-pro] [--jobs 2] [--keep] [--wait-minutes 10]
 */
import fs from "node:fs";
import path from "node:path";
import {
    checkFireCMSStyles,
    cleanUpWorkDir,
    browserOpenAttempts,
    buildProject,
    createReporter,
    extractTarball,
    filesContaining,
    installPublished,
    localPackages,
    makeSandbox,
    makeWorkDir,
    parseArgs,
    pool,
    printSummary,
    run,
    scaffoldWithCreateProject,
    scaffoldWithInit,
    selectTemplates,
    typecheck
} from "./lib.mjs";

const opts = parseArgs(process.argv.slice(2), { booleans: ["keep"] });
const version = opts.version;
if (!version) {
    console.error("Usage: smoke-published.mjs --version <published version>");
    process.exit(2);
}
const templates = selectTemplates(opts.only);
const jobs = Number(opts.jobs ?? 2);
const waitMinutes = Number(opts["wait-minutes"] ?? 10);

/**
 * A publish that just finished can take a few minutes to be installable everywhere, so
 * wait until npm serves every package at `version` (those that exist there at all).
 */
async function waitForRegistry() {
    const names = ["@firecms/cli", "@firecms/core", "@firecms/ui", "@firecms/firebase", "@firecms/cloud"];
    const deadline = Date.now() + waitMinutes * 60_000;
    for (const name of names) {
        for (;;) {
            const { code, output } = await run("npm", ["view", `${name}@${version}`, "version"], { timeoutMs: 60_000 });
            if (code === 0 && output.trim().split("\n").pop() === version) break;
            if (Date.now() > deadline) throw new Error(`${name}@${version} is not on npm after ${waitMinutes} minutes:\n${output}`);
            console.log(`Waiting for ${name}@${version} on npm...`);
            await new Promise(r => setTimeout(r, 20_000));
        }
    }
}

const work = makeWorkDir("firecms-published-smoke-");
console.log(`Working in ${work}`);
await waitForRegistry();

// The published CLI, with its own dependencies from npm.
const downloads = path.join(work, "downloads");
fs.mkdirSync(downloads, { recursive: true });
const packed = await run("npm", ["pack", `@firecms/cli@${version}`, "--pack-destination", downloads]);
const cliTarball = path.join(downloads, `firecms-cli-${version}.tgz`);
if (packed.code !== 0 || !fs.existsSync(cliTarball)) throw new Error(`Could not download @firecms/cli@${version}\n${packed.output}`);
const cliDir = path.join(work, "cli"); // named `cli`: init.ts finds its templates by walking up to it
await extractTarball(cliTarball, cliDir);
const cliInstall = await run("npm", ["install", "--omit=dev", "--ignore-scripts", "--no-audit", "--no-fund"], { cwd: cliDir });
if (cliInstall.code !== 0) throw new Error(`Could not install the CLI's dependencies\n${cliInstall.output}`);
console.log(`Using @firecms/cli@${version}; pinning ${Object.keys(localPackages()).length} @firecms packages\n`);

const licenseMarker = `firecms-license-smoke-${Date.now().toString(36)}`;

const reports = await pool(templates, jobs, async (template) => {
    const root = path.join(work, template.name);
    fs.mkdirSync(root, { recursive: true });
    const reporter = createReporter(template, path.join(root, "logs"));
    const project = path.join(root, "app");
    const sandbox = makeSandbox(path.join(root, "sandbox"));

    await reporter.step("scaffold", async (logFile) => {
        const scaffold = template.requiresLogin ? scaffoldWithCreateProject : scaffoldWithInit;
        await scaffold({ cliDir, template, parentDir: root, dirName: "app", projectId: "published-smoke", sandbox, logFile });
        const opened = browserOpenAttempts(sandbox);
        if (opened.length) return { ok: false, detail: `tried to open a browser: ${opened.join(", ")}` };
        if (fs.existsSync(path.join(sandbox.home, ".firecms"))) return { ok: false, detail: "wrote credentials while logged out" };
        return fs.existsSync(path.join(project, "package.json")) ? { ok: true } : { ok: false, detail: "no project was created" };
    });

    await reporter.step("install", async (logFile) => {
        const { code } = await installPublished(project, version, { logFile });
        return { ok: code === 0 };
    });

    await reporter.step("build", async (logFile) => {
        const env = template.licenseEnv ? { [template.licenseEnv]: licenseMarker } : {};
        const { code } = await buildProject(project, "npm", env, { logFile });
        return { ok: code === 0 };
    });

    await reporter.step("styles", async () => checkFireCMSStyles(project, template), { independent: true });

    await reporter.step("typecheck", async (logFile) => {
        const { code } = await typecheck(project, { logFile });
        return { ok: code === 0 };
    }, { independent: true });

    if (template.licenseEnv) {
        await reporter.step("license-key", async () => {
            const hits = filesContaining(path.join(project, template.clientOutput), licenseMarker);
            return hits.length
                ? { ok: true, detail: `found in ${path.relative(project, hits[0])}` }
                : { ok: false, detail: `${template.licenseEnv} never reaches the browser bundle in ${template.clientOutput}/`, output: "" };
        }, { independent: true });
    }

    await reporter.step("gitignore", async () => fs.existsSync(path.join(project, ".gitignore"))
        ? { ok: true }
        : { ok: false, detail: "the scaffolded project has no .gitignore", output: "" }, { independent: true });

    return { template, reporter };
});

const ok = printSummary(`Published smoke test (${version})`, reports);
cleanUpWorkDir(work, { ok, keep: opts.keep });
process.exit(ok ? 0 : 1);
