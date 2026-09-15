#!/usr/bin/env node
/**
 * Signs in to each PRO template in a real browser and checks what only a signed-in CMS
 * shows. Everything runs locally against the Firebase emulators, on a `demo-` project
 * that needs no Firebase account or credentials:
 *
 *   1. scaffold and install the template as check.mjs does (local packages, pnpm 11);
 *   2. point its Firebase config at the demo project and build it so every Firebase app
 *      it creates talks to the Auth and Firestore emulators. That is done by aliasing
 *      `firebase/app` to a wrapper (see writeEmulatorWrapper), so the template code is the
 *      code users get;
 *   3. seed a user and a product, serve the production build, and sign in with email and
 *      password in headless Chromium, answering the FireCMS license check
 *      (`POST https://api.firecms.co/access_log`) as licensed;
 *   4. check that:
 *      - the license check carried the key the template was built with, and the PRO
 *        plugins it mounts;
 *      - no `plugins` deprecation warning and no console or page error;
 *      - the seeded product shows in the products collection (emulator data);
 *      - for templates with the collection editor: the home page allows drag-and-drop,
 *        a navigation-level plugin feature that only works when plugins go to
 *        useBuildNavigationController;
 *      - for templates with the import plugin: an .xlsx written by exceljs goes through
 *        the import dialog and its rows reach Firestore with their numbers as numbers.
 *        The spreadsheet reader is a lazy chunk of the production build, so this is the
 *        only place its loading is exercised as users meet it.
 *
 * Needs the packages built, Java 21 for the Firestore emulator, and network access for
 * installs (and, the first time, the emulator and Chromium downloads).
 *
 * Usage: node scripts/templates/signed-in.mjs [--only pro,next-pro,astro] [--keep] [--headed]
 *            [--cli-dir <extracted CLI package>]
 *
 * --cli-dir checks the templates of another CLI package, as in check.mjs.
 */
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { createRequire } from "node:module";
import {
    cleanUpWorkDir,
    TEMPLATE_PNPM,
    createReporter,
    installWithLocalPackages,
    makeSandbox,
    makeWorkDir,
    onInterrupt,
    packCli,
    packLocalPackages,
    parseArgs,
    printSummary,
    run,
    scaffoldWithCreateProject,
    selectTemplates
} from "./lib.mjs";

const PLAYWRIGHT = "playwright@1.62.1";
const FIREBASE_TOOLS = "firebase-tools@15.25.1";
// Writes the workbook the import step uploads. Not the library the import reads it
// with: a fixture made by the reader under test would prove nothing.
const EXCELJS = "exceljs@4.4.0";
const PROJECT_ID = "demo-firecms-e2e";
const USER = { email: "e2e@example.com", password: "e2e-password-123" };
const PRODUCT_NAME = "E2E emulator product";
const IMPORTED = [{ name: "Imported chair", price: 40 }, { name: "Imported table", price: 120.5 }];

/** How each template is pointed at the emulators, built and served. */
const SIGNED_IN = {
    pro: {
        firebaseConfig: "src/firebase_config.ts",
        appPath: "/",
        pluginKeys: ["collection_editor", "user_management", "data_enhancement", "import", "export"],
        dragAndDrop: true,
        prepare(project, wrapper) {
            fs.writeFileSync(path.join(project, "vite.e2e.config.ts"), `import { mergeConfig } from "vite";
import base from "./vite.config";

export default mergeConfig(base, {
    resolve: { alias: [{ find: /^firebase\\/app$/, replacement: ${JSON.stringify(wrapper)} }] }
});
`);
        },
        build: (project) => [process.execPath, [binOf(project, "vite"), "build", "--config", "vite.e2e.config.ts"]],
        serve: (project, port) => [process.execPath, [binOf(project, "vite"), "preview", "--config", "vite.e2e.config.ts",
            "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {}]
    },
    "next-pro": {
        firebaseConfig: "src/app/common/firebase_config.ts",
        appPath: "/cms",
        pluginKeys: ["user_management", "data_enhancement", "import", "export"],
        prepare(project, wrapper) {
            fs.renameSync(path.join(project, "next.config.ts"), path.join(project, "next.config.base.ts"));
            fs.writeFileSync(path.join(project, "next.config.ts"), `import type { NextConfig } from "next";
import base from "./next.config.base";

const config: NextConfig = {
    ...base,
    webpack(webpackConfig, context) {
        const resolved = typeof base.webpack === "function" ? base.webpack(webpackConfig, context) : webpackConfig;
        resolved.resolve.alias = { ...resolved.resolve.alias, "firebase/app$": ${JSON.stringify(wrapper)} };
        return resolved;
    }
};

export default config;
`);
        },
        // webpack: the alias is a webpack one. The website pages pre-render at build time
        // from Firestore too, so the emulators are already running and seeded by then.
        build: (project) => [process.execPath, [binOf(project, "next"), "build", "--webpack"]],
        serve: (project, port) => [process.execPath, [binOf(project, "next"), "start", "-H", "127.0.0.1", "-p", String(port)], {}]
    },
    astro: {
        firebaseConfig: "src/common/firebase_config.ts",
        appPath: "/cms",
        pluginKeys: ["user_management", "data_enhancement", "import", "export"],
        prepare(project, wrapper) {
            fs.writeFileSync(path.join(project, "astro.e2e.config.mjs"), `import base from "./astro.config.mjs";

export default {
    ...base,
    vite: {
        ...base.vite,
        resolve: {
            ...base.vite?.resolve,
            alias: { ...base.vite?.resolve?.alias, "firebase/app": ${JSON.stringify(wrapper)} }
        }
    }
};
`);
        },
        build: (project) => [process.execPath, [binOf(project, "astro"), "build", "--config", "astro.e2e.config.mjs"]],
        serve: (project, port) => [process.execPath, [path.join(project, "dist/server/entry.mjs")], { HOST: "127.0.0.1", PORT: String(port) }]
    }
};

/** The CLI script of an installed package, from its own `bin` (paths move between majors). */
function binOf(project, name) {
    const dir = path.join(project, "node_modules", name);
    const { bin } = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
    return path.join(dir, typeof bin === "string" ? bin : bin[name]);
}

/**
 * Replaces `firebase/app` in the test build: the real module, except that every app it
 * creates is connected to the emulators before anything else can use it. FireCMS deletes
 * and recreates its app when it initialises, so connecting in the template's own code
 * would not stick. The real module is imported by path, which the alias does not match.
 */
function writeEmulatorWrapper(project, ports) {
    const firebaseApp = path.join(fs.realpathSync(path.join(project, "node_modules", "firebase")), "app", "dist", "esm", "index.esm.js");
    if (!fs.existsSync(firebaseApp)) throw new Error(`firebase/app's ES build is not where expected: ${firebaseApp}`);
    const wrapper = path.join(project, "e2e-firebase-app.mjs");
    fs.writeFileSync(wrapper, `export * from ${JSON.stringify(firebaseApp)};
import { initializeApp as initializeRealApp } from ${JSON.stringify(firebaseApp)};
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

export function initializeApp(options, name) {
    const app = initializeRealApp(options, name);
    connectAuthEmulator(getAuth(app), "http://127.0.0.1:${ports.auth}", { disableWarnings: true });
    connectFirestoreEmulator(getFirestore(app), "127.0.0.1", ${ports.firestore});
    return app;
}
`);
    return wrapper;
}

function freePort() {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.on("error", reject);
        server.listen(0, "127.0.0.1", () => {
            const { port } = server.address();
            server.close(() => resolve(port));
        });
    });
}

async function waitForHttp(url, timeoutMs, isAlive = () => true) {
    const deadline = Date.now() + timeoutMs;
    let last;
    while (Date.now() < deadline) {
        if (!isAlive()) throw new Error(`the process serving ${url} exited`);
        try {
            const res = await fetch(url);
            if (res.status < 500) return;
            last = `HTTP ${res.status}`;
        } catch (e) {
            last = e.message;
        }
        await new Promise(r => setTimeout(r, 500));
    }
    throw new Error(`${url} did not come up in ${timeoutMs / 1000}s (${last})`);
}

/** Every emulator and preview server still up, for an interrupt to stop before cleaning up. */
const longRunning = new Set();

/** A long-running child in its own process group, so everything it spawns dies with it. */
function startProcess(cmd, args, { cwd, env, logFile }) {
    const child = spawn(cmd, args, { cwd, env, stdio: ["ignore", "pipe", "pipe"], detached: true });
    let exited = false;
    longRunning.add(child);
    child.on("exit", () => {
        exited = true;
        longRunning.delete(child);
    });
    const log = fs.openSync(logFile, "a");
    child.stdout.on("data", d => fs.writeSync(log, d));
    child.stderr.on("data", d => fs.writeSync(log, d));
    const stop = async () => {
        if (exited) return;
        try {
            process.kill(-child.pid, "SIGINT");
        } catch {
            return;
        }
        for (let i = 0; i < 40 && !exited; i++) await new Promise(r => setTimeout(r, 250));
        if (!exited) {
            try {
                process.kill(-child.pid, "SIGKILL");
            } catch {
                // already gone
            }
        }
    };
    process.on("exit", () => {
        if (!exited) {
            try {
                process.kill(-child.pid, "SIGKILL");
            } catch {
                // already gone
            }
        }
    });
    return { child, stop, isAlive: () => !exited };
}

/**
 * Java 21+ for the Firestore emulator (firebase-tools refuses anything older). On macOS
 * the newest installed 21+ wins even over a JAVA_HOME pointing at an older JDK; elsewhere
 * (CI sets it with setup-java) JAVA_HOME is used as it is.
 */
function javaEnv() {
    let javaHome = process.env.JAVA_HOME;
    if (process.platform === "darwin") {
        try {
            javaHome = execFileSync("/usr/libexec/java_home", ["-v", "21+"], { encoding: "utf8" }).trim();
        } catch {
            // no 21+ registered; keep JAVA_HOME and let firebase-tools say what it needs
        }
    }
    return javaHome ? { JAVA_HOME: javaHome, PATH: path.join(javaHome, "bin") + path.delimiter + process.env.PATH } : {};
}

async function installTools(toolsDir) {
    fs.mkdirSync(toolsDir, { recursive: true });
    const deps = Object.fromEntries([PLAYWRIGHT, FIREBASE_TOOLS, EXCELJS].map(spec => {
        const at = spec.lastIndexOf("@");
        return [spec.slice(0, at), spec.slice(at + 1)];
    }));
    fs.writeFileSync(path.join(toolsDir, "package.json"), JSON.stringify({ private: true, dependencies: deps }, null, 2));
    fs.writeFileSync(path.join(toolsDir, "pnpm-workspace.yaml"), "strictDepBuilds: false\n");
    const logFile = path.join(toolsDir, "install.log");
    const { code, output } = await run("npx", ["--yes", TEMPLATE_PNPM, "install"], { cwd: toolsDir, env: { ...process.env, CI: "1" }, logFile });
    if (code !== 0) throw new Error(`Could not install ${PLAYWRIGHT} and ${FIREBASE_TOOLS}\n${output}`);
    const require = createRequire(path.join(toolsDir, "package.json"));
    const playwright = require("playwright");
    if (!fs.existsSync(playwright.chromium.executablePath())) {
        console.log("Installing Chromium for Playwright...");
        const cli = path.join(path.dirname(require.resolve("playwright/package.json")), "cli.js");
        const install = await run(process.execPath, [cli, "install", "chromium"], { logFile });
        if (install.code !== 0) throw new Error(`Could not install Chromium\n${install.output}`);
    }
    return {
        playwright,
        ExcelJS: require("exceljs"),
        firebaseBin: path.join(path.dirname(require.resolve("firebase-tools/package.json")), "lib", "bin", "firebase.js")
    };
}

/** The .xlsx the import step uploads: a header row, then IMPORTED. */
async function writeImportWorkbook(ExcelJS, file) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Products");
    sheet.addRow(["name", "price"]);
    for (const row of IMPORTED) sheet.addRow([row.name, row.price]);
    await workbook.xlsx.writeFile(file);
    return file;
}

/** The products in the Firestore emulator, as `{ id, fields }` (REST field encoding). */
async function listProducts(ports) {
    const res = await fetch(`http://127.0.0.1:${ports.firestore}/v1/projects/${PROJECT_ID}/databases/(default)/documents/products?pageSize=100`, {
        headers: { authorization: "Bearer owner" }
    });
    if (!res.ok) throw new Error(`listing products: HTTP ${res.status} ${await res.text()}`);
    const { documents = [] } = await res.json();
    return documents.map(d => ({ id: d.name.split("/").pop(), fields: d.fields ?? {} }));
}

async function startEmulators(dir, firebaseBin, ports) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "firestore.rules"), `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
`);
    fs.writeFileSync(path.join(dir, "firebase.json"), JSON.stringify({
        firestore: { rules: "firestore.rules" },
        emulators: {
            auth: { host: "127.0.0.1", port: ports.auth },
            firestore: { host: "127.0.0.1", port: ports.firestore, websocketPort: ports.firestoreWs },
            hub: { host: "127.0.0.1", port: ports.hub },
            logging: { host: "127.0.0.1", port: ports.logging },
            ui: { enabled: false },
            singleProjectMode: true
        }
    }, null, 2));
    const logFile = path.join(dir, "emulators.log");
    const emulators = startProcess(process.execPath, [firebaseBin, "emulators:start", "--only", "auth,firestore", "--project", PROJECT_ID], {
        cwd: dir,
        env: { ...process.env, ...javaEnv() },
        logFile
    });
    try {
        await waitForHttp(`http://127.0.0.1:${ports.firestore}/`, 180_000, emulators.isAlive);
        await waitForHttp(`http://127.0.0.1:${ports.auth}/`, 60_000, emulators.isAlive);
    } catch (e) {
        await emulators.stop();
        throw new Error(`${e.message}\n--- emulators.log ---\n${fs.readFileSync(logFile, "utf8").split("\n").slice(-40).join("\n")}`);
    }
    return emulators;
}

/** Empty both emulators, then create the test user and one product. */
async function seed(ports) {
    const check = async (res, what) => {
        if (!res.ok) throw new Error(`${what}: HTTP ${res.status} ${await res.text()}`);
    };
    await check(await fetch(`http://127.0.0.1:${ports.firestore}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`, { method: "DELETE" }), "clearing Firestore");
    await check(await fetch(`http://127.0.0.1:${ports.auth}/emulator/v1/projects/${PROJECT_ID}/accounts`, { method: "DELETE" }), "clearing Auth");
    await check(await fetch(`http://127.0.0.1:${ports.auth}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...USER, returnSecureToken: true })
    }), "creating the test user");
    await check(await fetch(`http://127.0.0.1:${ports.firestore}/v1/projects/${PROJECT_ID}/databases/(default)/documents/products/e2e-product`, {
        method: "PATCH",
        headers: { "content-type": "application/json", authorization: "Bearer owner" },
        body: JSON.stringify({ fields: { name: { stringValue: PRODUCT_NAME }, price: { doubleValue: 42 } } })
    }), "seeding a product");
}

/**
 * Sign in and check the CMS. Returns `{ ok, detail, output }` for the reporter; `output`
 * lists what the page did, so a failure explains itself.
 */
async function checkInBrowser({ playwright, baseUrl, spec, licenseKey, headed, screenshot, ports, importFile }) {
    const browser = await playwright.chromium.launch({ headless: !headed });
    const context = await browser.newContext();
    const consoleMessages = [];
    const pageErrors = [];
    const licenseRequests = [];
    const otherFirecmsRequests = [];
    await context.route("https://api.firecms.co/**", async (route) => {
        const request = route.request();
        if (request.url().endsWith("/access_log")) {
            licenseRequests.push(request.postDataJSON());
            return route.fulfill({ json: { blocked: false, licenseState: "licensed" } });
        }
        otherFirecmsRequests.push(request.url());
        return route.fulfill({ status: 204, body: "" });
    });
    const page = await context.newPage();
    page.on("console", msg => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));
    page.on("pageerror", err => pageErrors.push(err.message));

    const problems = [];
    const verified = [];
    try {
        await page.goto(baseUrl + spec.appPath);
        await page.getByRole("button", { name: "Email/password" }).click({ timeout: 60_000 });
        await page.getByPlaceholder("Email").fill(USER.email);
        await page.getByRole("button", { name: "Login" }).click();
        await page.getByPlaceholder("Password").fill(USER.password);
        await page.getByRole("button", { name: "Login" }).click();

        // A fresh project has no roles. Where collections are gated by user
        // management (template_pro), a new user first does what the home page asks.
        // Visible only: the collapsed drawer holds a hidden "Products" label too.
        const products = page.getByText("Products", { exact: true }).filter({ visible: true }).first();
        const createRoles = page.getByRole("button", { name: "Create default roles and add current user as admin" });
        await products.or(createRoles).first().waitFor({ timeout: 60_000 });
        if (await createRoles.isVisible()) await createRoles.click();
        await products.waitFor({ timeout: 60_000 });

        for (let i = 0; i < 60 && licenseRequests.length === 0; i++) await page.waitForTimeout(250);
        const license = licenseRequests[0];
        if (!license) problems.push("no license check was sent after signing in");
        else {
            if (license.apiKey !== licenseKey) problems.push(`the license check carried apiKey=${JSON.stringify(license.apiKey)}, not the key the template was built with`);
            else verified.push("license key");
            const missing = spec.pluginKeys.filter(k => !(license.plugins ?? []).includes(k));
            if (missing.length) problems.push(`the license check did not list the plugins ${missing.join(", ")} (got ${JSON.stringify(license.plugins)})`);
            else verified.push(`${spec.pluginKeys.length} PRO plugins`);
        }

        if (spec.dragAndDrop) {
            const groups = page.locator("[aria-roledescription=\"sortable\"]:has([aria-roledescription=\"sortable\"])");
            await groups.first().waitFor({ timeout: 30_000 });
            const disabled = await groups.evaluateAll(els => els.map(el => el.getAttribute("aria-disabled")));
            if (!disabled.includes("false")) problems.push(`home page drag-and-drop is off (groups: aria-disabled=${disabled.join(",")}): navigation-level plugin features are not applied`);
            else verified.push("drag-and-drop");
        }

        await page.goto(`${baseUrl}${spec.appPath.replace(/\/$/, "")}/c/products`);
        await page.getByText(PRODUCT_NAME).first().waitFor({ timeout: 60_000 })
            .then(() => verified.push("emulator data"))
            .catch(() => problems.push(`the seeded product "${PRODUCT_NAME}" did not show in the products collection`));

        if (spec.pluginKeys.includes("import")) {
            // A real .xlsx through the import dialog of the production build: the
            // reader is a lazy chunk, and its interop can only fail here, at the
            // moment a user picks a file.
            await page.getByRole("button", { name: "upload", exact: true }).first().click({ timeout: 30_000 });
            // The dialog's own input: collection views can hold other file inputs (images).
            await page.getByRole("dialog").locator("input[type=\"file\"]").first().setInputFiles(importFile);
            await page.getByRole("button", { name: "Next", exact: true }).click({ timeout: 30_000 });
            await page.getByRole("button", { name: "Save data", exact: true }).click({ timeout: 30_000 });
            await page.getByText("Data imported successfully").first().waitFor({ timeout: 60_000 });
            const saved = await listProducts(ports);
            for (const expected of IMPORTED) {
                const doc = saved.find(d => d.fields.name?.stringValue === expected.name);
                const price = doc && (doc.fields.price?.integerValue ?? doc.fields.price?.doubleValue);
                if (!doc) problems.push(`the imported row "${expected.name}" is not in Firestore`);
                else if (price === undefined || Number(price) !== expected.price) {
                    problems.push(`"${expected.name}" was saved with price ${JSON.stringify(doc.fields.price)}, not the number ${expected.price}`);
                }
            }
            if (!problems.some(p => p.includes("Imported"))) verified.push("xlsx import");
        }
        await page.waitForTimeout(1000);
    } catch (e) {
        problems.push(e.message.split("\n")[0]);
    }

    const deprecations = consoleMessages.filter(m => m.includes("`plugins` prop is deprecated"));
    if (deprecations.length) problems.push(`the \`plugins\` deprecation warning was logged ${deprecations.length} time(s)`);
    const errors = [...consoleMessages.filter(m => m.startsWith("[error]")), ...pageErrors.map(e => `[pageerror] ${e}`)];
    if (errors.length) problems.push(`${errors.length} console/page error(s)`);

    if (problems.length) await page.screenshot({ path: screenshot, fullPage: true }).catch(() => undefined);
    await browser.close();

    const output = [
        `verified: ${verified.join(", ") || "nothing"}`,
        ...problems.map(p => `PROBLEM  ${p}`),
        ...(problems.length ? [`screenshot: ${screenshot}`] : []),
        `license checks: ${JSON.stringify(licenseRequests)}`,
        ...(otherFirecmsRequests.length ? [`other api.firecms.co requests: ${otherFirecmsRequests.join(", ")}`] : []),
        "--- console ---",
        ...consoleMessages,
        ...pageErrors.map(e => `[pageerror] ${e}`)
    ].join("\n");
    return { ok: problems.length === 0, detail: problems[0] ?? verified.join(" · "), output };
}

// ---------------------------------------------------------------------------

const opts = parseArgs(process.argv.slice(2), { booleans: ["keep", "headed"] });
const templates = selectTemplates(opts.only ?? Object.keys(SIGNED_IN).join(","))
    .filter(t => {
        if (SIGNED_IN[t.name]) return true;
        console.log(`Skipping ${t.name}: no signed-in test for it (only ${Object.keys(SIGNED_IN).join(", ")})`);
        return false;
    });
const work = makeWorkDir("firecms-signed-in-");
console.log(`Working in ${work}`);
onInterrupt(() => {
    // Before the files go: the emulators write into the work folder until they stop.
    for (const child of longRunning) {
        try {
            process.kill(-child.pid, "SIGKILL");
        } catch {
            // already gone
        }
    }
    cleanUpWorkDir(work, { ok: false, keep: opts.keep });
});

const reports = [];
let emulators;
let setupError;
try {
    // Setup inside the try as well: a missing Java 21 or a failed tool install must
    // still clean up the tools, tarballs and extracted CLI it has put down so far.
    const { playwright, ExcelJS, firebaseBin } = await installTools(path.join(work, "tools"));
    const importFile = await writeImportWorkbook(ExcelJS, path.join(work, "import.xlsx"));
    let cliDir;
    let cliTarball;
    if (opts["cli-dir"]) {
        cliDir = path.resolve(opts["cli-dir"]);
    } else {
        ({ cliDir, tarball: cliTarball } = await packCli(work));
    }
    const tarballs = await packLocalPackages(path.join(work, "tarballs"), { cliTarball });

    const ports = {
        auth: await freePort(),
        firestore: await freePort(),
        firestoreWs: await freePort(),
        hub: await freePort(),
        logging: await freePort()
    };
    emulators = await startEmulators(path.join(work, "emulators"), firebaseBin, ports);
    console.log(`Emulators up (auth ${ports.auth}, firestore ${ports.firestore})\n`);

    // One at a time: they share the emulators, and each run starts from a clean seed.
    for (const template of templates) {
        const spec = SIGNED_IN[template.name];
        const root = path.join(work, template.name);
        fs.mkdirSync(root, { recursive: true });
        const reporter = createReporter(template, path.join(root, "logs"));
        const project = path.join(root, "app");
        const licenseKey = `firecms-license-signed-in-${template.name}-${Date.now().toString(36)}`;
        let server;

        await reporter.step("scaffold", async (logFile) => {
            await scaffoldWithCreateProject({
                cliDir, template, parentDir: root, dirName: "app", projectId: PROJECT_ID,
                sandbox: makeSandbox(path.join(root, "sandbox")), logFile
            });
            return { ok: fs.existsSync(path.join(project, "package.json")) };
        });

        await reporter.step("install", async (logFile) => {
            const { code } = await installWithLocalPackages(project, tarballs, { logFile });
            return { ok: code === 0 };
        });

        await reporter.step("build", async (logFile) => {
            fs.writeFileSync(path.join(project, spec.firebaseConfig), `export const firebaseConfig: Record<string, string> = ${JSON.stringify({
                apiKey: "demo-api-key",
                authDomain: `${PROJECT_ID}.firebaseapp.com`,
                projectId: PROJECT_ID,
                storageBucket: `${PROJECT_ID}.appspot.com`,
                appId: "1:000000000000:web:0000000000000000"
            }, null, 4)};\n`);
            spec.prepare(project, writeEmulatorWrapper(project, ports));
            await seed(ports);
            const [cmd, args] = spec.build(project);
            const env = { ...process.env, NEXT_TELEMETRY_DISABLED: "1", [template.licenseEnv]: licenseKey };
            const { code } = await run(cmd, args, { cwd: project, env, logFile });
            return { ok: code === 0 };
        });

        await reporter.step("serve", async (logFile) => {
            const port = await freePort();
            const [cmd, args, extraEnv] = spec.serve(project, port);
            server = startProcess(cmd, args, { cwd: project, env: { ...process.env, ...extraEnv }, logFile });
            await waitForHttp(`http://127.0.0.1:${port}${spec.appPath}`, 60_000, server.isAlive);
            server.baseUrl = `http://127.0.0.1:${port}`;
            return { ok: true, detail: server.baseUrl };
        });

        await reporter.step("signed-in", async (logFile) => {
            await seed(ports);
            const result = await checkInBrowser({
                playwright,
                baseUrl: server.baseUrl,
                spec,
                licenseKey,
                headed: opts.headed,
                screenshot: path.join(root, "failure.png"),
                ports,
                importFile
            });
            // Kept either way: what a passing run checked is worth reading too.
            fs.writeFileSync(logFile, result.output + "\n");
            return result;
        });

        await server?.stop();
        reports.push({ template, reporter });
    }
} catch (e) {
    setupError = e;
    console.error(`\nThe signed-in check could not run: ${e?.stack ?? e}`);
} finally {
    await emulators?.stop();
}

const ok = !setupError && printSummary("Signed-in browser check (Firebase emulators)", reports);
cleanUpWorkDir(work, { ok, keep: opts.keep });
process.exit(ok ? 0 : 1);
