/**
 * Shared harness for checking the templates `firecms init` ships, the way a user's
 * machine sees them: scaffold from the packed CLI, install for real, then type-check,
 * lint and build.
 *
 * Used by check.mjs (against the local packages), smoke-published.mjs (against a
 * published version) and signed-in.mjs (browser tests against the Firebase emulators).
 * Plain Node with no dependencies of its own, so it runs before anything is installed,
 * and everything it installs goes into throwaway projects, never the monorepo lockfile.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

export const CLI_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const REPO_ROOT = path.resolve(CLI_ROOT, "..", "..");

/**
 * The pnpm templates are installed and built with, run through npx. Pinned so every
 * machine and CI run the same one, and a current major because that is what a new user
 * gets: pnpm 11 refuses URL-resolved dependencies of dependencies by default, which is
 * how the `xlsx` URL in @firecms/data_import was found. The monorepo's own pnpm (from
 * `packageManager`) is older and still accepts it.
 */
export const TEMPLATE_PNPM = "pnpm@11.1.0";

/**
 * The npm published versions are installed with, for the same reasons: npm 12 refuses
 * URL-resolved packages by default (`allow-remote=none`), and the npm bundled with Node
 * 22 in CI is older and does not.
 */
export const TEMPLATE_NPM = "npm@12.0.2";

const fetchedPackageManagers = new Map();

/**
 * `[command, args]` for running `args` with a template's package manager.
 *
 * A pinned one is fetched into npx's cache once, by a single `--version` call that
 * every caller waits on: three cold `npx --yes pnpm@…` calls started together race
 * while unpacking into the same cache folder, and the npm that ships with Node 22
 * (CI's) fails some with ENOTEMPTY. Three parallel installs lost one in three runs.
 */
async function packageManager(name, args) {
    const pinned = { pnpm: TEMPLATE_PNPM, npm: TEMPLATE_NPM }[name];
    if (!pinned) return [name, args];
    if (!fetchedPackageManagers.has(pinned)) {
        fetchedPackageManagers.set(pinned, run("npx", ["--yes", pinned, "--version"]).then(({ code, output }) => {
            if (code !== 0) throw new Error(`Could not fetch ${pinned} with npx:\n${tail(output)}`);
        }));
    }
    await fetchedPackageManagers.get(pinned);
    return ["npx", ["--yes", pinned, ...args]];
}

/**
 * Every template `firecms init` can scaffold. `clientOutput` is where the build puts
 * the code that reaches the browser; `licenseEnv` is the variable the template reads its
 * FireCMS PRO license key from, for templates that mount PRO plugins.
 */
export const TEMPLATES = [
    { name: "community", flag: "--community", dir: "template", clientOutput: "build" },
    { name: "pro", flag: "--pro", dir: "template_pro", clientOutput: "build", licenseEnv: "VITE_FIRECMS_API_KEY" },
    {
        name: "next-pro",
        flag: "--next-pro",
        dir: "template_next_pro",
        clientOutput: ".next/static",
        licenseEnv: "NEXT_PUBLIC_FIRECMS_API_KEY"
    },
    // The CLI will not scaffold cloud logged out, so it is created through `createProject`.
    { name: "cloud", flag: "--cloud", dir: "template_cloud", clientOutput: "dist", requiresLogin: true },
    { name: "astro", flag: "--astro", dir: "template_astro", clientOutput: "dist/client", licenseEnv: "PUBLIC_FIRECMS_API_KEY" }
];

export function selectTemplates(only) {
    if (!only) return TEMPLATES;
    const names = only.split(",").map(s => s.trim());
    const unknown = names.filter(n => !TEMPLATES.some(t => t.name === n));
    if (unknown.length) throw new Error(`Unknown template(s): ${unknown.join(", ")}. Known: ${TEMPLATES.map(t => t.name).join(", ")}`);
    return TEMPLATES.filter(t => names.includes(t.name));
}

/** Minimal `--flag value` / `--flag` parser. */
export function parseArgs(argv, { booleans = [] } = {}) {
    const out = {};
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (!a.startsWith("--")) throw new Error(`Unexpected argument: ${a}`);
        const key = a.slice(2);
        if (booleans.includes(key)) out[key] = true;
        else out[key] = argv[++i];
    }
    return out;
}

export function makeWorkDir(prefix) {
    return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

const liveChildren = new Set();

/** Kill a command started by `run` together with everything it started. */
function killTree(child, signal) {
    try {
        process.kill(-child.pid, signal);
    } catch {
        // Already gone, or never started.
    }
}

// A crash in the script must not leave its commands running either.
process.on("exit", () => {
    for (const child of liveChildren) killTree(child, "SIGKILL");
});

const interruptCleanups = [];

/**
 * Run `cleanup` if the script is interrupted (Ctrl-C, or CI cancelling the job), after
 * stopping every command still running. Without it a cancelled run left its installs,
 * builds and emulators running, and gigabytes in the temp folder.
 */
export function onInterrupt(cleanup) {
    interruptCleanups.push(cleanup);
    if (interruptCleanups.length > 1) return;
    for (const [signal, exitCode] of [["SIGINT", 130], ["SIGTERM", 143]]) {
        process.once(signal, () => {
            console.error(`\n${signal}: stopping ${liveChildren.size} running command(s) and cleaning up`);
            for (const child of liveChildren) killTree(child, "SIGKILL");
            for (const fn of interruptCleanups) {
                try {
                    fn();
                } catch (e) {
                    console.error(`Cleanup failed: ${e.message}`);
                }
            }
            process.exit(exitCode);
        });
    }
}

/**
 * Run a command, capturing its output (and appending it to `logFile`). Never rejects:
 * the caller decides what a non-zero exit means.
 */
export function run(cmd, args, { cwd, env = process.env, timeoutMs = 15 * 60_000, logFile, onChild } = {}) {
    return new Promise((resolve) => {
        if (logFile) fs.appendFileSync(logFile, `\n$ ${cmd} ${args.join(" ")}\n`);
        // Its own process group, so a timeout or an interrupt stops the whole tree
        // (npx → pnpm → node → esbuild): killing `npx` alone left the rest running.
        const child = spawn(cmd, args, { cwd, env, stdio: ["pipe", "pipe", "pipe"], detached: true });
        liveChildren.add(child);
        onChild?.(child);
        let output = "";
        const onData = (d) => {
            output += d;
            if (logFile) fs.appendFileSync(logFile, d);
        };
        child.stdout.on("data", onData);
        child.stderr.on("data", onData);
        child.stdin.on("error", () => undefined);
        const timer = setTimeout(() => {
            onData(`\n[harness] killed after ${timeoutMs} ms\n`);
            killTree(child, "SIGKILL");
        }, timeoutMs);
        child.on("error", (e) => onData(`\n[harness] ${e.message}\n`));
        child.on("close", (code) => {
            clearTimeout(timer);
            liveChildren.delete(child);
            resolve({ code, output });
        });
    });
}

/**
 * A throwaway HOME, so the CLI never sees the developer's `~/.firecms` credentials (and is
 * always logged out), and a PATH whose first entry is a stub `open`/`xdg-open` that only
 * records its arguments. Only for running the CLI: installs keep the real HOME, where the
 * package manager's cache lives.
 */
export function makeSandbox(root) {
    const home = path.join(root, "home");
    const bin = path.join(root, "bin");
    const openLog = path.join(root, "open-calls.log");
    fs.mkdirSync(home, { recursive: true });
    fs.mkdirSync(bin, { recursive: true });
    for (const name of ["open", "xdg-open"]) {
        fs.writeFileSync(path.join(bin, name), `#!/bin/sh\nprintf '%s\\n' "$*" >> '${openLog}'\n`, { mode: 0o755 });
    }
    return {
        home,
        openLog,
        env: { ...process.env, CI: "1", HOME: home, PATH: bin + path.delimiter + process.env.PATH }
    };
}

export function browserOpenAttempts(sandbox) {
    return fs.existsSync(sandbox.openLog)
        ? fs.readFileSync(sandbox.openLog, "utf8").split("\n").filter(Boolean)
        : [];
}

function readJson(file) {
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
    fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}

/** The file name `pnpm pack` / `npm pack` gives a package: `@firecms/core@3.4.0` → `firecms-core-3.4.0.tgz`. */
function tarballName(name, version) {
    return `${name.replace(/^@/, "").replace("/", "-")}-${version}.tgz`;
}

/** `pnpm pack`, which also rewrites `workspace:` ranges into real ones (`npm pack` would not). */
async function pnpmPack(pkgDir, dest) {
    const pkg = readJson(path.join(pkgDir, "package.json"));
    const { code, output } = await run("pnpm", ["pack", "--pack-destination", dest], { cwd: pkgDir });
    const tarball = path.join(dest, tarballName(pkg.name, pkg.version));
    if (code !== 0 || !fs.existsSync(tarball)) {
        throw new Error(`pnpm pack failed for ${pkg.name}\n${output}`);
    }
    return tarball;
}

export async function extractTarball(tarball, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const { code, output } = await run("tar", ["-xzf", tarball, "-C", dest, "--strip-components=1"]);
    if (code !== 0) throw new Error(`Could not extract ${tarball}\n${output}`);
}

/**
 * Pack the CLI as it would be published and extract it into `<workDir>/cli`. The directory
 * has to be called `cli`: init.ts finds its templates by walking up to one. The CLI's own
 * runtime dependencies come from the monorepo install.
 */
export async function packCli(workDir) {
    const tarballs = path.join(workDir, "tarballs");
    fs.mkdirSync(tarballs, { recursive: true });
    if (!fs.existsSync(path.join(CLI_ROOT, "dist", "index.es.js"))) {
        throw new Error("The CLI is not built. Run `pnpm --filter @firecms/cli run build` first.");
    }
    const tarball = await pnpmPack(CLI_ROOT, tarballs);
    const cliDir = path.join(workDir, "cli");
    await extractTarball(tarball, cliDir);
    fs.symlinkSync(path.join(CLI_ROOT, "node_modules"), path.join(cliDir, "node_modules"));
    return { cliDir, tarball };
}

/** name → directory of every publishable @firecms package in the monorepo. */
export function localPackages() {
    const result = {};
    for (const dir of fs.readdirSync(path.join(REPO_ROOT, "packages"))) {
        const file = path.join(REPO_ROOT, "packages", dir, "package.json");
        if (!fs.existsSync(file)) continue;
        const pkg = readJson(file);
        if (pkg.name?.startsWith("@firecms/") && !pkg.private) result[pkg.name] = path.dirname(file);
    }
    return result;
}

/**
 * Pack every local @firecms package the templates can reach (their dependencies, and
 * those packages' own @firecms dependencies and peers), so each template installs the
 * code in this checkout rather than what npm has. `cliTarball` is reused for @firecms/cli.
 */
export async function packLocalPackages(dest, { cliTarball } = {}) {
    fs.mkdirSync(dest, { recursive: true });
    const packages = localPackages();
    const wanted = new Set();
    const visit = (name) => {
        if (wanted.has(name) || !packages[name]) return;
        wanted.add(name);
        const pkg = readJson(path.join(packages[name], "package.json"));
        for (const field of ["dependencies", "peerDependencies"]) {
            for (const dep of Object.keys(pkg[field] ?? {})) visit(dep);
        }
    };
    for (const t of TEMPLATES) {
        const pkg = readJson(path.join(CLI_ROOT, "templates", t.dir, "package.json"));
        for (const field of ["dependencies", "devDependencies"]) {
            for (const dep of Object.keys(pkg[field] ?? {})) visit(dep);
        }
    }

    const unbuilt = [...wanted].filter(n => n !== "@firecms/cli" && !fs.existsSync(path.join(packages[n], "dist")));
    if (unbuilt.length) {
        throw new Error(`These packages are not built: ${unbuilt.join(", ")}. Run \`pnpm run build\` at the repo root first.`);
    }

    const tarballs = {};
    for (const name of [...wanted].sort()) {
        tarballs[name] = name === "@firecms/cli" && cliTarball ? cliTarball : await pnpmPack(packages[name], dest);
    }
    return tarballs;
}

/**
 * Scaffold `template` by calling `createProject` from the CLI's built bundle — the function
 * `firecms init` hands off to once its prompts are answered. Logged out (sandboxed HOME),
 * it makes no network request.
 */
export async function scaffoldWithCreateProject({ cliDir, template, parentDir, dirName, projectId, sandbox, logFile }) {
    const script = `
const [bundle, template, dir_name, firebaseProjectId] = process.argv.slice(1);
const { createProject } = await import(bundle);
await createProject({ template, dir_name, firebaseProjectId, env: "prod", git: false });
`;
    const bundle = pathToFileURL(path.join(cliDir, "dist", "index.es.js")).href;
    return run(process.execPath, ["--input-type=module", "-e", script, bundle, template.name, dirName, projectId], {
        cwd: parentDir,
        env: sandbox.env,
        timeoutMs: 120_000,
        logFile
    });
}

/**
 * Scaffold through the real `firecms init`, answering its prompts the way the e2e test
 * does: "n" to "Do you want to log in?" (it defaults to yes, which starts a server and
 * opens a browser), then the default for everything else.
 */
export function scaffoldWithInit({ cliDir, template, parentDir, dirName, projectId, sandbox, logFile }) {
    return new Promise((resolve) => {
        const args = [path.join(cliDir, "bin", "firecms.js"), "init", template.flag, "--projectId", projectId, dirName];
        if (logFile) fs.appendFileSync(logFile, `\n$ node ${args.join(" ")}\n`);
        const child = spawn(process.execPath, args, { cwd: parentDir, env: sandbox.env, stdio: ["pipe", "pipe", "pipe"], detached: true });
        liveChildren.add(child);
        let output = "";
        const onData = (d) => {
            output += d;
            if (logFile) fs.appendFileSync(logFile, d);
        };
        child.stdout.on("data", onData);
        child.stderr.on("data", onData);
        child.stdin.on("error", () => undefined);
        child.stdin.write("n\n");
        const tick = setInterval(() => {
            try {
                if (child.stdin.writable) child.stdin.write("\n");
            } catch {
                // gone; the close handler resolves
            }
        }, 150);
        const timer = setTimeout(() => {
            onData("\n[harness] killed after 120000 ms\n");
            killTree(child, "SIGKILL");
        }, 120_000);
        child.on("close", (code) => {
            clearInterval(tick);
            clearTimeout(timer);
            liveChildren.delete(child);
            resolve({ code, output });
        });
    });
}

/**
 * Point every @firecms package at a local tarball and install with pnpm. pnpm does not
 * hoist, so an import of a package the template does not declare fails here the way it
 * fails for a pnpm user (npm would hoist it and hide the problem).
 *
 * The settings go in pnpm-workspace.yaml: pnpm 11 ignores the `pnpm` field of
 * package.json, overrides included, and would quietly install the published packages.
 *
 * Nothing here relaxes pnpm's build-script approval any more. It used to pass
 * `strictDepBuilds: false`, which hid the fact that a scaffolded project could not be
 * installed — or even started — with pnpm 11 at all: the templates now ship the approvals,
 * and this check fails if one of them stops covering what the template needs.
 */
export async function installWithLocalPackages(project, tarballs, { logFile } = {}) {
    const overrides = Object.entries(tarballs)
        .map(([name, tarball]) => `  ${JSON.stringify(name)}: ${JSON.stringify(`file:${tarball}`)}\n`)
        .join("");
    // Appended: a template may ship a pnpm-workspace.yaml of its own (template_cloud does).
    const workspaceFile = path.join(project, "pnpm-workspace.yaml");
    const shipped = fs.existsSync(workspaceFile) ? fs.readFileSync(workspaceFile, "utf8").trimEnd() + "\n\n" : "";
    fs.writeFileSync(workspaceFile, `${shipped}overrides:\n${overrides}`);
    const [cmd, args] = await packageManager("pnpm", ["install", "--no-frozen-lockfile"]);
    return run(cmd, args, { cwd: project, env: { ...process.env, CI: "1" }, logFile });
}

/**
 * Pin every @firecms package to a published `version` and install with npm, as a user
 * would. Direct dependencies are pinned too: npm refuses an override that disagrees with
 * a direct dependency.
 */
export async function installPublished(project, version, { logFile } = {}) {
    const file = path.join(project, "package.json");
    const pkg = readJson(file);
    for (const field of ["dependencies", "devDependencies"]) {
        for (const dep of Object.keys(pkg[field] ?? {})) {
            if (dep.startsWith("@firecms/")) pkg[field][dep] = version;
        }
    }
    pkg.overrides = {
        ...pkg.overrides,
        ...Object.fromEntries(Object.keys(localPackages()).map(name => [name, version]))
    };
    writeJson(file, pkg);
    const [cmd, args] = await packageManager("npm", ["install", "--no-audit", "--no-fund"]);
    return run(cmd, args, { cwd: project, logFile });
}

export function typecheck(project, { logFile } = {}) {
    return run(process.execPath, [path.join(project, "node_modules", "typescript", "bin", "tsc"), "-p", "tsconfig.json", "--noEmit"], {
        cwd: project,
        logFile
    });
}

export async function buildProject(project, packageManagerName, env = {}, { logFile } = {}) {
    const [cmd, args] = await packageManager(packageManagerName, ["run", "build"]);
    return run(cmd, args, {
        cwd: project,
        env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", ...env },
        logFile
    });
}

/** Files under `dir` (recursively) with one of `extensions` whose contents include `needle`. */
export function filesContaining(dir, needle, extensions = [".js", ".mjs", ".html"]) {
    const hits = [];
    const walk = (d) => {
        if (!fs.existsSync(d)) return;
        for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
            const full = path.join(d, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (extensions.some(ext => entry.name.endsWith(ext)) && fs.readFileSync(full, "utf8").includes(needle)) hits.push(full);
        }
    };
    walk(dir);
    return hits;
}

/**
 * A Tailwind class only FireCMS's own components use (the width of `@firecms/ui`'s
 * switch), as it appears in built CSS. When a template's stylesheet does not scan
 * node_modules/@firecms, none of the CMS's classes are generated and it renders
 * half-unstyled: template_astro pointed its `@source` at a folder that did not exist.
 */
export const FIRECMS_UI_CSS_CLASS = ".w-\\[34px\\]";

/** The `styles` check: the built CSS contains the classes of FireCMS's components. */
export function checkFireCMSStyles(project, template) {
    const hits = filesContaining(path.join(project, template.clientOutput), FIRECMS_UI_CSS_CLASS, [".css"]);
    return hits.length
        ? { ok: true }
        : {
            ok: false,
            detail: `no CSS in ${template.clientOutput}/ has FireCMS's component classes`,
            output: `No built stylesheet contains ${FIRECMS_UI_CSS_CLASS}, a class of @firecms/ui's switch: the `
                + "template's Tailwind @source does not reach node_modules/@firecms, so the CMS renders unstyled."
        };
}

/**
 * Lint the project's sources for uses of anything marked `@deprecated` (such as the
 * `plugins` prop of <FireCMS>), with the monorepo's ESLint and typescript-eslint and the
 * project's own types. Returns `{ ok, findings, output }`.
 */
export async function lintDeprecated(project, { logFile } = {}) {
    const require = createRequire(path.join(REPO_ROOT, "package.json"));
    const eslintBin = path.join(path.dirname(require.resolve("eslint/package.json")), "bin", "eslint.js");
    const tseslint = pathToFileURL(require.resolve("typescript-eslint")).href;
    const config = path.join(project, "eslint.deprecated.config.mjs");
    fs.writeFileSync(config, `import tseslint from ${JSON.stringify(tseslint)};

export default [{
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
        parser: tseslint.parser,
        parserOptions: { projectService: true, tsconfigRootDir: ${JSON.stringify(project)} }
    },
    plugins: { "@typescript-eslint": tseslint.plugin },
    linterOptions: { reportUnusedDisableDirectives: "off" },
    rules: { "@typescript-eslint/no-deprecated": "error" }
}];
`);
    const { code, output } = await run(process.execPath, [eslintBin, "--config", config, "--format", "json", "--no-warn-ignored", "src"], {
        cwd: project,
        logFile
    });
    const jsonStart = output.indexOf("[");
    let results;
    try {
        results = JSON.parse(output.slice(jsonStart));
    } catch {
        return { ok: false, findings: [], output: `ESLint did not produce a report (exit ${code}):\n${output}` };
    }
    // ESLint reports real paths; the temp dir may sit behind a symlink (/var on macOS).
    const root = fs.realpathSync(project);
    const findings = results.flatMap(r => r.messages.map(m =>
        `${path.relative(root, r.filePath)}:${m.line}:${m.column}  ${m.message}`));
    return { ok: findings.length === 0, findings, output };
}

/** Last `n` lines of `text`, for failure reports. */
export function tail(text, n = 40) {
    return text.trim().split("\n").slice(-n).join("\n");
}

/**
 * Run `fn` for each item with at most `jobs` at a time, keeping result order.
 */
export async function pool(items, jobs, fn) {
    const results = new Array(items.length);
    let next = 0;
    await Promise.all(Array.from({ length: Math.min(jobs, items.length) }, async () => {
        while (next < items.length) {
            const i = next++;
            results[i] = await fn(items[i], i);
        }
    }));
    return results;
}

/**
 * Runs a template's checks as named steps, logging each to its own file.
 * `step(name, fn, { independent })`: `fn` returns `{ ok, detail?, output? }`. A failed
 * step skips every later one, unless it is `independent`: a check that nothing after it
 * depends on (a failed license check should not hide a failed type-check).
 */
export function createReporter(template, logDir) {
    fs.mkdirSync(logDir, { recursive: true });
    const steps = [];
    let failed = false;
    let blocked = false;
    return {
        steps,
        get failed() {
            return failed;
        },
        logFile(name) {
            return path.join(logDir, `${String(steps.length + 1).padStart(2, "0")}-${name}.log`);
        },
        async step(name, fn, { independent = false } = {}) {
            if (blocked) {
                steps.push({ name, status: "skipped" });
                return;
            }
            const started = Date.now();
            const logFile = this.logFile(name);
            let result;
            try {
                result = await fn(logFile);
            } catch (e) {
                result = { ok: false, detail: e.message, output: e.stack };
            }
            const seconds = ((Date.now() - started) / 1000).toFixed(0);
            steps.push({ name, status: result.ok ? "passed" : "failed", seconds, detail: result.detail, logFile });
            const mark = result.ok ? "✓" : "✗";
            console.log(`${mark} ${template.name.padEnd(9)} ${name.padEnd(12)} ${String(seconds).padStart(4)}s${result.detail ? "  " + result.detail : ""}`);
            if (!result.ok) {
                failed = true;
                if (!independent) blocked = true;
                const output = result.output ?? (fs.existsSync(logFile) ? fs.readFileSync(logFile, "utf8") : "");
                console.log(`\n--- ${template.name} / ${name} (full log: ${logFile}) ---\n${tail(output, 60)}\n---\n`);
            }
        }
    };
}

/**
 * End of a run: remove the work directory, or, when something failed, everything in it
 * but the logs and screenshots. One run holds several installed projects and their
 * builds, and failed runs kept whole filled a disk in an afternoon. `keep` keeps it all.
 */
export function cleanUpWorkDir(work, { ok, keep }) {
    if (keep) {
        console.log(`\nKept ${work}`);
        return;
    }
    // Retries: after an interrupt, the killed commands may still be letting go of files.
    const remove = (target) => fs.rmSync(target, { recursive: true, force: true, maxRetries: 5 });
    if (ok) {
        remove(work);
        return;
    }
    const keepFile = (name) => name.endsWith(".log") || name.endsWith(".png");
    const prune = (dir, depth) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory() && entry.name === "logs") continue;
            if (entry.isDirectory() && depth === 0) prune(full, 1);
            else if (!(entry.isFile() && keepFile(entry.name))) remove(full);
        }
    };
    prune(work, 0);
    console.log(`\nLogs kept in ${work} (run with --keep to keep the projects too)`);
}

export function printSummary(title, reports) {
    console.log(`\n${title}`);
    for (const { template, reporter } of reports) {
        const line = reporter.steps.map(s => `${s.status === "passed" ? "✓" : s.status === "failed" ? "✗" : "·"} ${s.name}`).join("  ");
        console.log(`  ${reporter.failed ? "FAIL" : "PASS"}  ${template.name.padEnd(9)}  ${line}`);
    }
    const failed = reports.filter(r => r.reporter.failed).map(r => r.template.name);
    console.log(failed.length ? `\n${failed.length} template(s) failed: ${failed.join(", ")}` : "\nAll templates passed.");
    return failed.length === 0;
}
