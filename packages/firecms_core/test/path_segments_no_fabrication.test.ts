import { describe, expect, it } from "@jest/globals";
import fs from "fs";
import path from "path";

/**
 * Guard against re-introducing a `pathSegments` fallback.
 *
 * A caller that forgets to thread segments must produce `undefined`, never a guess.
 * Deriving them with `path.split("/")` looks harmless and is wrong precisely in the case
 * the field exists for: with a parent entity id containing "/", the flattened path
 * "test/test/test/accommodation" splits into four segments when the truth is three
 * (["test", "test/test", "accommodation"]).
 *
 * A delegate receiving four plausible-looking segments has no way to know they are wrong.
 * `undefined` is honest; a wrong array is not. This test fails if any source file derives
 * pathSegments from a path.
 */

const SRC = path.resolve(__dirname, "../src");

function sourceFiles(dir: string): string[] {
    const out: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) out.push(...sourceFiles(full));
        else if (/\.tsx?$/.test(entry.name)) out.push(full);
    }
    return out;
}

/** Strip block and line comments so documentation examples do not trip the guard. */
function stripComments(src: string): string {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

describe("pathSegments is never fabricated", () => {

    const files = sourceFiles(SRC);

    it("finds source files to scan", () => {
        expect(files.length).toBeGreaterThan(100);
    });

    it("no source file derives pathSegments from a path", () => {
        // Matches `pathSegments ... ?? <anything>.split("/")` and
        // `pathSegments: <anything>.split("/")` on one line.
        const fallback = /pathSegments[^\n;]*(\?\?|:)[^\n;]*\.split\(\s*["'`]\/["'`]\s*\)/;

        const offenders = files
            .map(f => ({ file: path.relative(SRC, f), code: stripComments(fs.readFileSync(f, "utf8")) }))
            .filter(({ code }) => fallback.test(code))
            .map(({ file }) => file);

        expect(offenders).toEqual([]);
    });

    it("no source file assigns a path split to the datasource segments variable", () => {
        // Deliberately narrow: splitting a URL path into URL segments is correct (ids are
        // escaped there), and spreading a collection's own configured path is correct too.
        // Only the variables that end up as the datasource `pathSegments` are forbidden.
        const assign = /(?:const|let)\s+(pathSegments|resolvedPathSegments|currentPathSegments|newPathSegments)\s*=\s*[^\n;]*\.split\(\s*["'`]\/["'`]\s*\)/;

        const offenders = files
            .map(f => ({ file: path.relative(SRC, f), code: stripComments(fs.readFileSync(f, "utf8")) }))
            .filter(({ code }) => assign.test(code))
            .map(({ file }) => file);

        expect(offenders).toEqual([]);
    });

});
