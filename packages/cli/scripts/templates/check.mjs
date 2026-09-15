#!/usr/bin/env node
/**
 * Checks every template `firecms init` ships against the packages in this checkout:
 *
 *   1. scaffold it from the CLI as it would be published (`pnpm pack`), logged out;
 *   2. install it with pnpm, with every @firecms package replaced by a local tarball.
 *      pnpm does not hoist, so an import the template does not declare fails here the
 *      way it fails for a pnpm user;
 *   3. build it (`pnpm run build`), with a marker as the license key of PRO templates;
 *   4. check the built CSS has FireCMS's component classes (the stylesheet scans
 *      node_modules/@firecms), and type-check it (`tsc --noEmit`). After the build, as
 *      a user would: frameworks generate type declarations on the first build
 *      (Next.js writes next-env.d.ts, which declares `*.svg` imports);
 *   5. lint it for uses of anything marked @deprecated, such as the `plugins` prop of
 *      <FireCMS>, which leaves navigation-level plugin features unapplied;
 *   6. check the license marker reached the browser bundle, i.e. the template really
 *      passes the key it documents to <FireCMS>.
 *
 * Installs use pnpm 11 (see TEMPLATE_PNPM in lib.mjs): it does not hoist, and it refuses
 * URL-resolved dependencies of dependencies, so both kinds of breakage show up here.
 *
 * Needs the packages built (`pnpm run build` at the repo root) and network access for
 * the templates' third-party dependencies. next-pro's build also reads the public demo
 * Firestore project, to pre-render its website pages.
 *
 * Usage: node scripts/templates/check.mjs [--only pro,next-pro] [--jobs 2] [--keep]
 *            [--cli-dir <extracted CLI package>]
 *
 * --cli-dir checks the templates of another CLI package (a directory named `cli`, with
 * its `dist`, `templates` and `node_modules`) instead of packing this one.
 */
import fs from "node:fs";
import path from "node:path";
import {
    checkFireCMSStyles,
    cleanUpWorkDir,
    browserOpenAttempts,
    buildProject,
    createReporter,
    filesContaining,
    installWithLocalPackages,
    lintDeprecated,
    makeSandbox,
    makeWorkDir,
    onInterrupt,
    packCli,
    packLocalPackages,
    parseArgs,
    pool,
    printSummary,
    scaffoldWithCreateProject,
    selectTemplates,
    typecheck
} from "./lib.mjs";

const opts = parseArgs(process.argv.slice(2), { booleans: ["keep"] });
const templates = selectTemplates(opts.only);
const jobs = Number(opts.jobs ?? 2);
const work = makeWorkDir("firecms-template-check-");
console.log(`Working in ${work}`);
onInterrupt(() => cleanUpWorkDir(work, { ok: false, keep: opts.keep }));

let cliDir;
let cliTarball;
if (opts["cli-dir"]) {
    cliDir = path.resolve(opts["cli-dir"]);
} else {
    ({ cliDir, tarball: cliTarball } = await packCli(work));
}
const tarballs = await packLocalPackages(path.join(work, "tarballs"), { cliTarball });
console.log(`Packed ${Object.keys(tarballs).length} local packages\n`);

const licenseMarker = `firecms-license-check-${Date.now().toString(36)}`;

const reports = await pool(templates, jobs, async (template) => {
    const root = path.join(work, template.name);
    fs.mkdirSync(root, { recursive: true });
    const reporter = createReporter(template, path.join(root, "logs"));
    const project = path.join(root, "app");
    const sandbox = makeSandbox(path.join(root, "sandbox"));

    await reporter.step("scaffold", async (logFile) => {
        const { code } = await scaffoldWithCreateProject({
            cliDir, template, parentDir: root, dirName: "app", projectId: "template-check", sandbox, logFile
        });
        const opened = browserOpenAttempts(sandbox);
        if (opened.length) return { ok: false, detail: `tried to open a browser: ${opened.join(", ")}` };
        if (code !== 0 || !fs.existsSync(path.join(project, "package.json"))) return { ok: false, detail: "no project was created" };
        if (!fs.existsSync(path.join(project, ".gitignore"))) return { ok: false, detail: "the project has no .gitignore", output: "" };
        return { ok: true };
    });

    await reporter.step("install", async (logFile) => {
        const { code } = await installWithLocalPackages(project, tarballs, { logFile });
        return { ok: code === 0 };
    });

    await reporter.step("build", async (logFile) => {
        const env = template.licenseEnv ? { [template.licenseEnv]: licenseMarker } : {};
        const { code } = await buildProject(project, "pnpm", env, { logFile });
        return { ok: code === 0 };
    });

    await reporter.step("styles", async () => checkFireCMSStyles(project, template), { independent: true });

    await reporter.step("typecheck", async (logFile) => {
        const { code } = await typecheck(project, { logFile });
        return { ok: code === 0 };
    }, { independent: true });

    await reporter.step("deprecated", async (logFile) => {
        const { ok, findings, output } = await lintDeprecated(project, { logFile });
        return {
            ok,
            detail: findings.length ? `${findings.length} use(s) of deprecated APIs` : undefined,
            output: findings.length ? findings.join("\n") : output
        };
    }, { independent: true });

    if (template.licenseEnv) {
        await reporter.step("license-key", async () => {
            const hits = filesContaining(path.join(project, template.clientOutput), licenseMarker);
            return hits.length
                ? { ok: true, detail: `found in ${path.relative(project, hits[0])}` }
                : {
                    ok: false,
                    detail: `${template.licenseEnv} never reaches the browser bundle in ${template.clientOutput}/`,
                    output: `Built with ${template.licenseEnv}=${licenseMarker}; no file in ${template.clientOutput}/ contains it, `
                        + "so the template does not pass its license key to <FireCMS>."
                };
        }, { independent: true });
    }

    return { template, reporter };
});

const ok = printSummary("Template check (local packages)", reports);
cleanUpWorkDir(work, { ok, keep: opts.keep });
process.exit(ok ? 0 : 1);
