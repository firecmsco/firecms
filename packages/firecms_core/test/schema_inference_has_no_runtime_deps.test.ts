import { describe, expect, it } from "@jest/globals";
import fs from "fs";
import path from "path";

/**
 * `@firecms/schema_inference` must stay free of runtime dependencies.
 *
 * It is the one package shared by every consumer that infers a collection: the web
 * client, the CLI, the MCP server, and the SaaS backend, which bundles it into a
 * Cloud Functions deploy. Its own source imports nothing outside itself and node's
 * `util`, so anything in `dependencies` is dead weight travelling into all of them.
 *
 * This is not hypothetical. `axios` and `vite-plugin-static-copy` were both declared
 * as runtime dependencies without ever being imported. `vite-plugin-static-copy`
 * pulls vite, which pulls rollup and esbuild, which pull platform-specific binaries —
 * so bumping the backend from a version that predated them to one that carried them
 * added over a thousand lines of lockfile and macOS-only binaries to a Linux deploy.
 * That is what blocked the backend from taking the newer package at all.
 *
 * If this package genuinely needs a runtime dependency one day, weigh it against
 * that and update this test deliberately.
 */
describe("@firecms/schema_inference packaging", () => {

    const packageJsonPath = path.resolve(__dirname, "..", "..", "schema_inference", "package.json");

    const readPackageJson = () => JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    it("finds the package it is meant to police", () => {
        expect(fs.existsSync(packageJsonPath)).toBe(true);
        expect(readPackageJson().name).toBe("@firecms/schema_inference");
    });

    it("declares no runtime dependencies", () => {
        const dependencies = readPackageJson().dependencies ?? {};
        expect(Object.keys(dependencies)).toEqual([]);
    });

    it("declares no optional or bundled dependencies either", () => {
        const pkg = readPackageJson();
        expect(Object.keys(pkg.optionalDependencies ?? {})).toEqual([]);
        expect(pkg.bundledDependencies ?? pkg.bundleDependencies ?? []).toEqual([]);
    });

    it("imports nothing outside itself, which is what makes that possible", () => {
        const srcDir = path.resolve(__dirname, "..", "..", "schema_inference", "src");

        const files: string[] = [];
        const walk = (dir: string) => {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const full = path.join(dir, entry.name);
                if (entry.isDirectory()) walk(full);
                else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) files.push(full);
            }
        };
        walk(srcDir);
        expect(files.length).toBeGreaterThan(0);

        // Node built-ins are fine; a bare specifier pointing at a package is not.
        const allowedBareImports = new Set(["util"]);
        const offenders: string[] = [];

        for (const file of files) {
            const source = fs.readFileSync(file, "utf-8");
            for (const match of source.matchAll(/from\s+"([^"]+)"/g)) {
                const specifier = match[1];
                const isRelative = specifier.startsWith(".") || specifier.startsWith("/");
                if (isRelative || allowedBareImports.has(specifier)) continue;
                offenders.push(`${path.relative(srcDir, file)} imports "${specifier}"`);
            }
        }

        expect(offenders).toEqual([]);
    });
});
