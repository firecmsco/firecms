import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { execSync, spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

/**
 * End-to-end tests for `firecms init`, covering every template it can scaffold.
 *
 * These drive the real CLI as a subprocess rather than importing it: `commands/init.ts`
 * uses `import.meta.url`, so it cannot be required from a CommonJS test, and running the
 * published entrypoint is a truer test anyway — it exercises argv parsing, the prompts,
 * template resolution and the file copy exactly as a user meets them.
 *
 * The CLI stays interactive even when every flag is supplied (`--projectId` only seeds a
 * prompt default), so the harness feeds newlines to accept defaults until the process
 * exits. No network or login is needed: logged out, the project picker falls back to
 * "Enter project id manually".
 *
 * `v2` is intentionally excluded — it scaffolds a legacy FireCMS 2 project.
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

/**
 * `copyTemplateFiles` substitutes the Firebase project id into a *different* file list per
 * template, so each one is asserted against its own list rather than a shared assumption.
 */
const TEMPLATES: Array<{
    name: string;
    flag: string;
    dir: string;
    /** Files that must exist regardless of substitution. */
    expected: string[];
}> = [
    {
        name: "pro",
        flag: "--pro",
        dir: "template_pro",
        expected: ["package.json", "index.html", "tsconfig.json", "src"]
    },
    {
        name: "community",
        flag: "--community",
        dir: "template",
        expected: ["package.json", "index.html", "tsconfig.json", "src"]
    },
    {
        name: "cloud",
        flag: "--cloud",
        dir: "template_cloud",
        expected: ["package.json", "src"]
    },
    {
        name: "next-pro",
        flag: "--next-pro",
        dir: "template_next_pro",
        expected: ["package.json", "src"]
    },
    {
        name: "astro",
        flag: "--astro",
        dir: "template_astro",
        expected: ["package.json", "src"]
    }
];

/** Artefacts that must never be copied out of a template into a user's new project. */
const MUST_NOT_LEAK = ["node_modules", "pnpm-lock.yaml", "yarn.lock", "package-lock.json", "dist", "build", ".astro"];

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

        // The child closing its stdin races with the next tick, so a broken pipe here is
        // expected and must not surface as a test failure.
        child.stdin.on("error", () => undefined);

        // Accept defaults. Keep feeding until the process exits — the number of prompts
        // varies by template, so a fixed-size buffer would either run dry or race.
        const tick = setInterval(() => {
            if (!child.stdin.writable) return;
            try {
                child.stdin.write("\n");
            } catch {
                // Child has gone away; the close handler below will resolve.
            }
        }, 150);

        child.on("close", (code) => {
            clearInterval(tick);
            child.stdin.end();
            resolve({ code, output });
        });
    });
}

/** Scaffold `template` into a fresh directory and return the project path. */
async function scaffold(flag: string, dirName = "app"): Promise<{ cwd: string, project: string, output: string }> {
    const cwd = fs.mkdtempSync(path.join(workDir, "run-"));
    const { output } = await runInit(["init", flag, "--projectId", PROJECT_ID, dirName], cwd);
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
}, 600_000);

afterAll(() => {
    if (workDir) fs.rmSync(workDir, { recursive: true, force: true });
});

describe("firecms init — every template", () => {

    it.each(TEMPLATES.map(t => [t.name, t] as const))(
        "%s: scaffolds a complete project",
        async (_name, t) => {
            const { project, output } = await scaffold(t.flag);

            expect(output).toContain("Copy project files");
            expect(fs.existsSync(project)).toBe(true);

            for (const f of t.expected) {
                expect({ file: f, exists: fs.existsSync(path.join(project, f)) })
                    .toEqual({ file: f, exists: true });
            }

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

            const { project } = await scaffold(t.flag);

            for (const f of withPlaceholder) {
                // `copyWebAppConfig` rewrites the firebase config from the server when the
                // developer is logged in, so its contents are not deterministic here. The
                // placeholder check below still covers it.
                if (f.endsWith("firebase_config.ts")) continue;
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
            const { project } = await scaffold(t.flag);

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

describe("firecms init — argument handling", () => {

    it("scaffolds into the directory named on the command line", async () => {
        const { cwd, project } = await scaffold("--pro", "my-app");

        // Regression: the "init" subcommand used to leak into the positional args, so the
        // project was scaffolded into a folder literally called "init".
        expect(fs.existsSync(project)).toBe(true);
        expect(fs.existsSync(path.join(cwd, "init"))).toBe(false);
    }, 300_000);

    it("refuses to scaffold into a non-empty directory", async () => {
        const cwd = fs.mkdtempSync(path.join(workDir, "occupied-"));
        fs.mkdirSync(path.join(cwd, "app"));
        fs.writeFileSync(path.join(cwd, "app", "existing.txt"), "do not clobber me");

        const { output } = await runInit(["init", "--pro", "--projectId", PROJECT_ID, "app"], cwd);

        expect(output).toContain("Directory is not empty");
        expect(fs.readFileSync(path.join(cwd, "app", "existing.txt"), "utf8")).toEqual("do not clobber me");
        expect(fs.existsSync(path.join(cwd, "app", "package.json"))).toBe(false);
    }, 300_000);

});
