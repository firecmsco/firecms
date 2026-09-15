import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { execSync, spawn } from "child_process";
import fs from "fs";
import net from "net";
import os from "os";
import path from "path";
import { pathToFileURL } from "url";

/**
 * End-to-end tests for `firecms init`, covering every template it can scaffold.
 *
 * These drive the real CLI as a subprocess rather than importing it: `commands/init.ts`
 * uses `import.meta.url`, so it cannot be required from a CommonJS test, and running the
 * published entrypoint is a truer test anyway — it exercises argv parsing, the prompts,
 * template resolution and the file copy exactly as a user meets them.
 *
 * The CLI stays interactive even when every flag is supplied (`--projectId` only seeds a
 * prompt default), so the harness answers prompts over stdin until the process exits. Not
 * every default is safe to accept, so each run is sandboxed:
 *
 * - `HOME` is a fresh temp directory. The CLI keeps its credentials in `~/.firecms`, so with
 *   the real HOME a logged-in developer's run would call the FireCMS API as them. Here every
 *   CLI run is logged out; only the type-check test seeds a session, a fake one.
 * - Logged out, the first prompt is "Do you want to log in?", and it defaults to yes, which
 *   starts a server on port 3000 and opens a browser. So the first answer is always "n".
 *   After that there is no project picker: the CLI asks for the project id directly, with
 *   `--projectId` as the default.
 * - A stub `open` comes first on PATH and only records its arguments, and the preload also
 *   records each launch before it happens. Every run asserts there were none, and every
 *   logged-out run that it came away without credentials.
 * - A preload blocks all network access, so "no network" is enforced rather than assumed.
 *
 * `--cloud` cannot be scaffolded through the CLI logged out: the CLI insists on a login and
 * exits when it is declined, which is tested as such. The cloud template itself is
 * scaffolded by calling `createProject` from the built bundle, the function the CLI hands
 * off to once its prompts are answered.
 */

const CLI_ROOT = path.resolve(__dirname, "..");
const BIN = path.join(CLI_ROOT, "bin", "firecms.js");
const BUILT = path.join(CLI_ROOT, "dist", "index.es.js");
const PROJECT_ID = "e2e-substituted-id";
const PLACEHOLDER = "[REPLACE_WITH_PROJECT_ID]";

/** Recursively list files under `root` whose contents include `needle`. */
function filesContaining(root: string, needle: string): string[] {
    const hits: string[] = [];
    const walk = (dir: string) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (entry.name === "node_modules" || entry.name === ".git") continue;
                walk(full);
            } else if (entry.isFile()) {
                let data: string;
                try { data = fs.readFileSync(full, "utf8"); } catch { continue; }
                if (data.includes(needle)) hits.push(full);
            }
        }
    };
    walk(root);
    return hits.sort();
}

type TemplateCase = {
    name: string;
    flag: string;
    dir: string;
    /** Files that must exist regardless of substitution. */
    expected: string[];
    /** Where `copyWebAppConfig` writes the web app config. Self-hosted templates only. */
    firebaseConfig?: string;
    /** The CLI will not scaffold this template logged out. */
    requiresLogin?: boolean;
};

/**
 * `copyTemplateFiles` substitutes the Firebase project id into a *different* file list per
 * template, so each one is asserted against its own list rather than a shared assumption.
 */
const TEMPLATES: TemplateCase[] = [
    {
        name: "pro",
        flag: "--pro",
        dir: "template_pro",
        expected: ["package.json", "index.html", "tsconfig.json", "src"],
        firebaseConfig: "src/firebase_config.ts"
    },
    {
        name: "community",
        flag: "--community",
        dir: "template",
        expected: ["package.json", "index.html", "tsconfig.json", "src"],
        firebaseConfig: "src/firebase_config.ts"
    },
    {
        name: "cloud",
        flag: "--cloud",
        dir: "template_cloud",
        expected: ["package.json", "src"],
        requiresLogin: true
    },
    {
        name: "next-pro",
        flag: "--next-pro",
        dir: "template_next_pro",
        expected: ["package.json", "src"],
        firebaseConfig: "src/app/common/firebase_config.ts"
    },
    {
        name: "astro",
        flag: "--astro",
        dir: "template_astro",
        expected: ["package.json", "src"],
        firebaseConfig: "src/common/firebase_config.ts"
    }
];

/** Artefacts that must never be copied out of a template into a user's new project. */
const MUST_NOT_LEAK = ["node_modules", "pnpm-lock.yaml", "yarn.lock", "package-lock.json", "dist", "build", ".astro"];

/** A run that has not exited by then is stuck, e.g. waiting for an OAuth callback. */
const RUN_TIMEOUT_MS = 60_000;

/**
 * Loaded into every child with `--import`. It blocks all network access, so a code path that
 * would call the FireCMS API (or Google's) fails loudly instead of quietly reaching
 * production. The one request it answers is `create_webapp`, with an empty config, and only
 * a run with a fake session gets far enough to make it.
 *
 * It also records every browser launch, synchronously, before handing it to the stub on
 * PATH. `open` spawns its launcher and moves on, so a CLI that crashes straight after (as
 * `login` used to on a busy port) exits before the stub has written a thing. Launching by
 * bare name sends the `xdg-open` bundled inside `open` on Linux to the stub as well.
 */
const PRELOAD = `
import childProcess from "node:child_process";
import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import net from "node:net";
import path from "node:path";

const spawn = childProcess.spawn;
childProcess.spawn = function (command, args, options) {
    const name = path.basename(String(command));
    if (name !== "open" && name !== "xdg-open") return spawn.apply(this, arguments);
    const argv = Array.isArray(args) ? args : [];
    fs.appendFileSync(process.env.FIRECMS_E2E_OPEN_LOG, "[spawn] " + [name, ...argv].join(" ") + "\\n");
    return spawn.call(this, name, args, options);
};
syncBuiltinESMExports();

const blocked = (what) => {
    throw new Error("firecms e2e sandbox: network access is blocked (" + what + ")");
};
net.Socket.prototype.connect = function () {
    blocked("socket connect");
};
globalThis.fetch = async (input) => {
    const url = String(input?.url ?? input);
    if (url.endsWith("/create_webapp")) {
        return new Response(JSON.stringify({ data: {} }), { headers: { "content-type": "application/json" } });
    }
    blocked("fetch " + url);
};
`;

/** Calls `createProject` from the built bundle with no prompts in front of it. */
const CREATE_PROJECT = `
const [bundle, template, dir_name, firebaseProjectId] = process.argv.slice(1);
const { createProject } = await import(bundle);
await createProject({ template, dir_name, firebaseProjectId, env: "prod", git: false });
`;

let workDir: string;
let preload: string;

type Sandbox = { home: string, openLog: string, env: NodeJS.ProcessEnv };
type RunResult = { code: number | null, output: string };

/**
 * A throwaway HOME, so the CLI never sees the developer's `~/.firecms` credentials, and a
 * PATH whose first entry is a stub `open` that records its arguments instead of opening a
 * browser. `session` seeds a fake, unexpired login instead; see the type-check test.
 */
function makeSandbox({ session = false } = {}): Sandbox {
    const root = fs.mkdtempSync(path.join(workDir, "sandbox-"));
    const home = path.join(root, "home");
    const bin = path.join(root, "bin");
    const openLog = path.join(root, "open-calls.log");
    fs.mkdirSync(home);
    fs.mkdirSync(bin);

    // The `open` package launches `open` on macOS and `xdg-open` on Linux; the preload makes
    // sure both come from here.
    for (const name of ["open", "xdg-open"]) {
        fs.writeFileSync(path.join(bin, name), `#!/bin/sh\nprintf '[stub] %s\\n' "$*" >> '${openLog}'\n`, { mode: 0o755 });
    }

    if (session) {
        // `getCurrentUser` only decodes the id token, and `refreshCredentials` hands back
        // unexpired credentials as they are, so none of this reaches the API.
        const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
        fs.mkdirSync(path.join(home, ".firecms"));
        fs.writeFileSync(path.join(home, ".firecms", "tokens.json"), JSON.stringify({
            id_token: [b64({ alg: "none" }), b64({ email: "e2e@example.invalid" }), ""].join("."),
            access_token: "e2e-fake-access-token",
            expiry_date: Date.now() + 60 * 60 * 1000
        }));
    }

    return {
        home,
        openLog,
        env: {
            ...process.env,
            CI: "1",
            HOME: home,
            PATH: bin + path.delimiter + process.env.PATH,
            FIRECMS_E2E_OPEN_LOG: openLog
        }
    };
}

/** Run `node <nodeArgs>` in `cwd` inside `sandbox`, answering prompts until it exits. */
function runNode(nodeArgs: string[], cwd: string, sandbox: Sandbox): Promise<RunResult> {
    return new Promise((resolve) => {
        const child = spawn(process.execPath, ["--import", pathToFileURL(preload).href, ...nodeArgs], {
            cwd,
            stdio: ["pipe", "pipe", "pipe"],
            env: sandbox.env
        });

        let output = "";
        child.stdout.on("data", d => output += d.toString());
        child.stderr.on("data", d => output += d.toString());

        // The child closing its stdin races with the next tick, so a broken pipe here is
        // expected and must not surface as a test failure.
        child.stdin.on("error", () => undefined);

        // Logged out, the first prompt is "Do you want to log in?" and a bare newline means
        // yes. Nothing reads stdin before that prompt, so this waits in the pipe for it.
        child.stdin.write("n\n");

        // Accept every other default. Keep feeding until the process exits — the number of
        // prompts varies by template, so a fixed-size buffer would either run dry or race.
        const tick = setInterval(() => {
            if (!child.stdin.writable) return;
            try {
                child.stdin.write("\n");
            } catch {
                // Child has gone away; the close handler below will resolve.
            }
        }, 150);

        const deadline = setTimeout(() => {
            output += `\n[harness] killed after ${RUN_TIMEOUT_MS} ms`;
            child.kill("SIGKILL");
        }, RUN_TIMEOUT_MS);

        child.on("close", (code) => {
            clearInterval(tick);
            clearTimeout(deadline);
            child.stdin.end();
            resolve({ code, output });
        });
    });
}

/** No run may open a browser, and a logged-out one must not come away with credentials. */
function expectNoSideEffects(sandbox: Sandbox, { loggedOut }: { loggedOut: boolean }) {
    const opened = fs.existsSync(sandbox.openLog)
        ? fs.readFileSync(sandbox.openLog, "utf8").split("\n").filter(Boolean)
        : [];
    expect({ opened }).toEqual({ opened: [] });
    if (loggedOut) {
        expect({ credentials: fs.existsSync(path.join(sandbox.home, ".firecms")) })
            .toEqual({ credentials: false });
    }
}

/** `text` without terminal escape codes. */
const plain = (text: string) => text.replace(/\u001b\[[0-9;?]*[A-Za-z]/g, "");

/**
 * Run `firecms <args>` in `cwd`, logged out: decline the login prompt, accept every other
 * default. `loginPrompt` is what the run must have done with "Do you want to log in?":
 * interactive runs meet it and decline it, while `--yes` and `firecms login` never show it.
 */
async function runCli(
    args: string[],
    cwd: string,
    { loginPrompt = "declined" }: { loginPrompt?: "declined" | "absent" } = {}
): Promise<RunResult> {
    const sandbox = makeSandbox();
    const result = await runNode([BIN, ...args], cwd, sandbox);
    expectNoSideEffects(sandbox, { loggedOut: true });
    if (loginPrompt === "declined") {
        expect(plain(result.output)).toContain("Do you want to log in? No");
    } else {
        expect(plain(result.output)).not.toContain("Do you want to log in?");
    }
    return result;
}

/** Scaffold `template` by calling `createProject` directly, past the CLI and its login gate. */
async function runCreateProject(template: string, dirName: string, cwd: string, { session = false } = {}): Promise<RunResult> {
    const sandbox = makeSandbox({ session });
    const result = await runNode(
        ["--input-type=module", "-e", CREATE_PROJECT, pathToFileURL(BUILT).href, template, dirName, PROJECT_ID],
        cwd,
        sandbox
    );
    expectNoSideEffects(sandbox, { loggedOut: !session });
    return result;
}

/** Scaffold template `t` into a fresh directory and return the project path. */
async function scaffold(t: TemplateCase, dirName = "app"): Promise<{ cwd: string, project: string, output: string }> {
    const cwd = fs.mkdtempSync(path.join(workDir, "run-"));
    // Logged out, the CLI will not scaffold cloud at all (see "firecms init — logged out"),
    // so cloud goes straight to the function the CLI would hand off to.
    const { output } = t.requiresLogin
        ? await runCreateProject(t.name, dirName, cwd)
        : await runCli(["init", t.flag, "--projectId", PROJECT_ID, dirName], cwd);
    return {
        cwd,
        project: path.join(cwd, dirName),
        output
    };
}

beforeAll(() => {
    if (!fs.existsSync(BUILT)) {
        // The e2e needs the built CLI; build it once rather than skipping silently.
        execSync("npm run build", { cwd: CLI_ROOT, stdio: "ignore" });
    }
    workDir = fs.mkdtempSync(path.join(os.tmpdir(), "firecms-cli-e2e-"));
    preload = path.join(workDir, "sandbox_preload.mjs");
    fs.writeFileSync(preload, PRELOAD);
}, 600_000);

afterAll(() => {
    if (workDir) fs.rmSync(workDir, { recursive: true, force: true });
});

describe("firecms init — every template", () => {

    it.each(TEMPLATES.map(t => [t.name, t] as const))(
        "%s: scaffolds a complete project",
        async (_name, t) => {
            const { project, output } = await scaffold(t);

            expect(output).toContain("Copy project files");
            expect(fs.existsSync(project)).toBe(true);

            for (const f of t.expected) {
                expect({ file: f, exists: fs.existsSync(path.join(project, f)) })
                    .toEqual({ file: f, exists: true });
            }

            // npm never packs `.gitignore` files, so each template ships its ignore file
            // as `gitignore` and init has to give it its real name.
            const gitignore = path.join(project, ".gitignore");
            expect(fs.existsSync(gitignore)).toBe(true);
            expect(fs.readFileSync(gitignore, "utf8"))
                .toEqual(fs.readFileSync(path.join(CLI_ROOT, "templates", t.dir, "gitignore"), "utf8"));
            expect(fs.existsSync(path.join(project, "gitignore"))).toBe(false);

            const pkg = JSON.parse(fs.readFileSync(path.join(project, "package.json"), "utf8"));
            expect(typeof pkg.name).toBe("string");
            expect(pkg.name.length).toBeGreaterThan(0);
        },
        300_000
    );

    it.each(TEMPLATES.map(t => [t.name, t] as const))(
        "%s: substitutes the project id and leaves no placeholder behind",
        async (_name, t) => {
            // Derive the expectation from the template itself rather than hardcoding a
            // file list, so this keeps working when a template gains or loses a
            // placeholder.
            const templateRoot = path.join(CLI_ROOT, "templates", t.dir);
            const withPlaceholder = filesContaining(templateRoot, PLACEHOLDER)
                .map(f => path.relative(templateRoot, f));

            const { project } = await scaffold(t);

            for (const f of withPlaceholder) {
                const contents = fs.readFileSync(path.join(project, f), "utf8");
                expect({ file: f, substituted: contents.includes(PROJECT_ID) })
                    .toEqual({ file: f, substituted: true });
            }

            // The real invariant: a generated project must never contain the raw
            // placeholder. Regression guard for the fire-and-forget writes that used to
            // let the CLI exit before substitution finished.
            expect(filesContaining(project, PLACEHOLDER).map(f => path.relative(project, f)))
                .toEqual([]);
        },
        300_000
    );

    it.each(TEMPLATES.map(t => [t.name, t] as const))(
        "%s: does not leak template build artefacts into the new project",
        async (_name, t) => {
            const { project } = await scaffold(t);

            // The template folders double as local dev projects, so a stale node_modules
            // or lockfile there would otherwise be copied into every new project.
            for (const junk of MUST_NOT_LEAK) {
                expect({ junk, present: fs.existsSync(path.join(project, junk)) })
                    .toEqual({ junk, present: false });
            }
        },
        300_000
    );

});

describe("firecms init — generated project type-checks", () => {

    it.each(TEMPLATES.filter(t => t.firebaseConfig).map(t => [t.name, t] as const))(
        "%s: the firebase config keeps its type annotation",
        async (_name, t) => {
            // Logged in, `copyWebAppConfig` rewrites this file with the config the server
            // returns, and used to drop the `Record<string, string>` annotation. TypeScript
            // then infers the literal type, so an empty config makes
            // `firebaseConfig.projectId` a compile error and `npm run build` fails with
            //   src/App.tsx: error TS2339: Property 'projectId' does not exist on type '{}'
            // An empty config is legitimate — App.tsx checks for it and throws a helpful
            // message at runtime — so it has to keep type-checking.
            //
            // The CLI only runs logged out here, and logged out nothing rewrites the file. So
            // this calls `createProject` with a fake session, and the sandbox answers the
            // `create_webapp` request with exactly that empty config.
            const cwd = fs.mkdtempSync(path.join(workDir, "run-"));
            await runCreateProject(t.name, "app", cwd, { session: true });

            expect(fs.readFileSync(path.join(cwd, "app", t.firebaseConfig!), "utf8"))
                .toEqual("export const firebaseConfig: Record<string, string> = {}\n");
        },
        300_000
    );

});

describe("firecms init — published package", () => {

    it("packs every template's ignore file and none of its local leftovers", () => {
        // The tests above scaffold from the template folders, so they cannot see what
        // `npm pack` leaves out: it drops `.gitignore` files, and it decides what else
        // to skip from the ignore files it finds (templates/.gitignore).
        const out = execSync("npm pack --dry-run --json", {
            cwd: CLI_ROOT,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"]
        });
        // Recent npm keys the result by package name; older versions return an array.
        const parsed = JSON.parse(out);
        const result = Array.isArray(parsed) ? parsed[0] : Object.values(parsed)[0];
        const files: string[] = (result as { files: { path: string }[] }).files.map(f => f.path);

        for (const t of TEMPLATES) {
            const shipped = `templates/${t.dir}/gitignore`;
            expect({ file: shipped, packed: files.includes(shipped) })
                .toEqual({ file: shipped, packed: true });
        }

        const leftovers = files.filter(f => f.startsWith("templates/") && f.split("/").some(segment =>
            MUST_NOT_LEAK.includes(segment) || segment === ".yarn" || segment.endsWith(".tsbuildinfo")));
        expect(leftovers).toEqual([]);
    }, 120_000);

});

describe("firecms init — argument handling", () => {

    it("scaffolds into the directory named on the command line", async () => {
        const { cwd, project } = await scaffold(TEMPLATES.find(t => t.name === "pro")!, "my-app");

        // Regression: the "init" subcommand used to leak into the positional args, so the
        // project was scaffolded into a folder literally called "init".
        expect(fs.existsSync(project)).toBe(true);
        expect(fs.existsSync(path.join(cwd, "init"))).toBe(false);
    }, 300_000);

    it("refuses to scaffold into a non-empty directory", async () => {
        const cwd = fs.mkdtempSync(path.join(workDir, "occupied-"));
        fs.mkdirSync(path.join(cwd, "app"));
        fs.writeFileSync(path.join(cwd, "app", "existing.txt"), "do not clobber me");

        const { output } = await runCli(["init", "--pro", "--projectId", PROJECT_ID, "app"], cwd);

        expect(output).toContain("Directory is not empty");
        expect(fs.readFileSync(path.join(cwd, "app", "existing.txt"), "utf8")).toEqual("do not clobber me");
        expect(fs.existsSync(path.join(cwd, "app", "package.json"))).toBe(false);
    }, 300_000);

    it("scaffolds into an absolute path, and into a folder whose parent does not exist yet", async () => {
        const cwd = fs.mkdtempSync(path.join(workDir, "paths-"));
        const absolute = path.join(cwd, "elsewhere", "abs-app");

        // Both used to crash with ENOENT: the folder was prefixed with "./", so an
        // absolute one became ".//abs/path", and it was created without its parents.
        const abs = await runCli(["init", "--pro", "--yes", "--projectId", PROJECT_ID, absolute], cwd, { loginPrompt: "absent" });
        const nested = await runCli(["init", "--pro", "--yes", "--projectId", PROJECT_ID, "a/b/app"], cwd, { loginPrompt: "absent" });

        expect([abs.code, nested.code]).toEqual([0, 0]);
        expect(fs.existsSync(path.join(absolute, "package.json"))).toBe(true);
        expect(fs.existsSync(path.join(cwd, "a", "b", "app", "package.json"))).toBe(true);
    }, 300_000);

    it("without a project id, keeps the placeholder and says which files need it", async () => {
        const cwd = fs.mkdtempSync(path.join(workDir, "no-project-id-"));

        const { code, output } = await runCli(["init", "--pro", "--yes", "app"], cwd, { loginPrompt: "absent" });

        // It used to write the string "undefined": `"default": "undefined"` in .firebaserc
        // and `--project undefined` in the deploy script.
        expect(code).toBe(0);
        const project = path.join(cwd, "app");
        expect(filesContaining(project, "undefined").map(f => path.relative(project, f)))
            .not.toEqual(expect.arrayContaining([".firebaserc", "firebase.json", "package.json"]));
        expect(fs.readFileSync(path.join(project, ".firebaserc"), "utf8")).toContain(PLACEHOLDER);
        expect(plain(output)).toContain("No Firebase project ID was given");
        expect(plain(output)).toContain(".firebaserc");
    }, 300_000);

    it("asks a logged-out user whether to initialize git", async () => {
        const cwd = fs.mkdtempSync(path.join(workDir, "git-prompt-"));

        // The question was gated on the logged-in project list, so it never appeared.
        const { output } = await runCli(["init", "--community", "--projectId", PROJECT_ID, "app"], cwd);

        expect(plain(output)).toContain("Initialize a git repository?");
    }, 300_000);

    it("rejects an unknown environment or a flag without its value, without a stack trace", async () => {
        const cwd = fs.mkdtempSync(path.join(workDir, "bad-args-"));

        const env = await runCli(["init", "--pro", "--yes", "--env", "staging", "app"], cwd, { loginPrompt: "absent" });
        const missing = await runCli(["init", "--pro", "--yes", "--projectId"], cwd, { loginPrompt: "absent" });

        expect([env.code, missing.code]).toEqual([1, 1]);
        expect(plain(env.output)).toContain("Please specify a valid environment");
        expect(plain(missing.output)).toContain("option requires argument: --projectId");
        for (const { output } of [env, missing]) {
            expect(output).not.toMatch(/^\s+at /m);
        }
        expect(fs.existsSync(path.join(cwd, "app"))).toBe(false);
    }, 300_000);

});

describe("firecms help and unknown commands", () => {

    it.each(["--help", "-h", "help", "init --help"])(
        "`firecms %s` prints the usage and exits 0",
        async (command) => {
            const cwd = fs.mkdtempSync(path.join(workDir, "help-"));
            const { code, output } = await runCli(command.split(" "), cwd, { loginPrompt: "absent" });

            expect(code).toBe(0);
            expect(plain(output)).toContain("Usage");
            expect(plain(output)).not.toContain("Unknown command");
        },
        120_000
    );

    it("an unknown command exits 1", async () => {
        const cwd = fs.mkdtempSync(path.join(workDir, "unknown-"));
        const { code, output } = await runCli(["bogus"], cwd, { loginPrompt: "absent" });

        expect(code).toBe(1);
        expect(plain(output)).toContain("Unknown command bogus");
    }, 120_000);

});

describe("firecms init — logged out", () => {

    it("cloud: asks to log in, and exits 1 without scaffolding when that is declined", async () => {
        const cwd = fs.mkdtempSync(path.join(workDir, "cloud-"));

        const { code, output } = await runCli(["init", "--cloud", "--projectId", PROJECT_ID, "app"], cwd);

        expect(output).toContain("You need to be logged in to create a project");
        expect(output).toContain("The login process was not completed");
        // It used to exit 0 here, so a script could not tell that nothing was created.
        expect(code).toBe(1);
        expect(fs.existsSync(path.join(cwd, "app"))).toBe(false);
    }, 300_000);

    it("--yes: scaffolds without asking to log in", async () => {
        const cwd = fs.mkdtempSync(path.join(workDir, "yes-"));

        // The login prompt defaults to yes, so an unattended `--yes` run that met it would
        // start a login: a server on port 3000, and a browser waiting for someone to sign in.
        const { code, output } = await runCli(
            ["init", "--pro", "--yes", "--projectId", PROJECT_ID, "app"],
            cwd,
            { loginPrompt: "absent" }
        );

        expect(output).toContain("Copy project files");
        expect(code).toBe(0);
        expect(fs.existsSync(path.join(cwd, "app", "package.json"))).toBe(true);
    }, 300_000);

    it("cloud with --yes: exits 1 and says to log in first, without asking", async () => {
        const cwd = fs.mkdtempSync(path.join(workDir, "cloud-yes-"));

        const { code, output } = await runCli(
            ["init", "--cloud", "--yes", "--projectId", PROJECT_ID, "app"],
            cwd,
            { loginPrompt: "absent" }
        );

        expect(plain(output)).toContain("Run firecms login first");
        expect(code).toBe(1);
        expect(fs.existsSync(path.join(cwd, "app"))).toBe(false);
    }, 300_000);

});

describe("firecms login", () => {

    it("reports a busy port 3000 instead of opening a browser", async () => {
        // The sign-in redirects back to a server on port 3000, so hold that port. If
        // something else already holds it, it is just as busy.
        const holder = net.createServer();
        await new Promise<void>((resolve, reject) => {
            holder.once("error", (err: NodeJS.ErrnoException) => err.code === "EADDRINUSE" ? resolve() : reject(err));
            holder.listen(3000, () => resolve());
        });

        try {
            const cwd = fs.mkdtempSync(path.join(workDir, "login-"));

            // Logged out, so this goes straight for the port. `runCli` asserts the stub
            // `open` was never called: the browser used to open before the port was known
            // to be free, and then the process crashed on EADDRINUSE.
            const { code, output } = await runCli(["login"], cwd, { loginPrompt: "absent" });

            expect(plain(output)).toContain("Port 3000 is already in use");
            expect(output).not.toContain("EADDRINUSE");
            expect(code).toBe(1);
        } finally {
            if (holder.listening) holder.close();
        }
    }, 300_000);

});
