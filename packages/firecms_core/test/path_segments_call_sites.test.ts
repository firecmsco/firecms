import { describe, expect, it } from "@jest/globals";
import fs from "fs";
import path from "path";

/**
 * Guard against a call site that *drops* `pathSegments`.
 *
 * `path_segments_no_fabrication.test.ts` covers the opposite failure — inventing segments.
 * This one covers the failure that actually kept reaching users: a props object that carries
 * a `path` but forgets to carry the segments describing it. Because every one of these
 * objects is destructured and rebuilt downstream, an omitted field is dropped in silence;
 * the delegate simply sees `pathSegments: undefined` and cannot tell it was a mistake.
 *
 * Three separate rounds of "the segments are missing in X" bug reports were all this same
 * omission at a new call site — `onEntityClick`, the side panel's `replace`, the board
 * view's counts and reorder saves. Reviewing for it by eye demonstrably does not work, so it
 * is asserted here instead: every call that carries a path must mention `pathSegments`,
 * even if only to pass `undefined` deliberately.
 *
 * This is a *syntactic* check. It cannot tell whether the value is correct — only that the
 * author considered it. Correctness is covered by path_segments_hooks.test.tsx.
 */

/**
 * Every shipped package, not just core: `pathSegments` was core-only for a while, and the
 * plugins that call the datasource directly (history, import, enhancement) were exactly the
 * places it silently stopped.
 */
const PACKAGES = path.resolve(__dirname, "../..");

const SCANNED = fs.readdirSync(PACKAGES, { withFileTypes: true })
    .filter(e => e.isDirectory() && fs.existsSync(path.join(PACKAGES, e.name, "src")))
    .map(e => path.join(PACKAGES, e.name, "src"));

/**
 * Calls whose props object pairs a `path` with the segments describing it.
 *
 * Matched with an optional generic argument — `dataSource.fetchCollection<M>({…})` is the
 * same call as `dataSource.fetchCollection({…})`, and a plain-substring marker misses it.
 */
const CALLS = [
    "navigateToEntity",
    "sideEntityController.open",
    "sideEntityController.replace",
    "saveEntityWithCallbacks",
    ".countEntities",
    ".fetchCollection",
    ".fetchEntity",
    ".listenCollection",
    ".listenEntity",
    ".saveEntity",
    ".deleteEntity",
];

/** `name` followed by an optional `<...>` generic, then `({`. */
function callPattern(name: string): RegExp {
    return new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*(?:<[^<>()]*>)?\\s*\\(\\s*\\{`, "g");
}

function sourceFiles(dir: string): string[] {
    const out: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) out.push(...sourceFiles(full));
        else if (/\.tsx?$/.test(entry.name)) out.push(full);
    }
    return out;
}

/** Return the balanced `{...}` literal starting at `openIdx`, or null if unbalanced. */
function literalAt(code: string, openIdx: number): string | null {
    let depth = 0;
    for (let i = openIdx; i < code.length; i++) {
        const c = code[i];
        if (c === "{") depth++;
        else if (c === "}") {
            depth--;
            if (depth === 0) return code.slice(openIdx, i + 1);
        }
    }
    return null;
}

/**
 * Resolve `...saveProps` by finding that variable's own object literal in the same file, so
 * a props object assembled a few lines above still counts as carrying the field.
 */
function mentionsPathSegments(literal: string, code: string): boolean {
    if (/\bpathSegments\b/.test(literal)) return true;
    for (const [, name] of literal.matchAll(/\.\.\.([A-Za-z_$][\w$]*)/g)) {
        const decl = new RegExp(`(?:const|let|var)\\s+${name}\\b[^=]*=\\s*\\{`).exec(code);
        if (!decl) continue;
        const spreadLiteral = literalAt(code, code.indexOf("{", decl.index + decl[0].length - 1));
        if (spreadLiteral && /\bpathSegments\b/.test(spreadLiteral)) return true;
    }
    return false;
}

describe("pathSegments is never dropped at a call site", () => {

    const files = SCANNED.flatMap(sourceFiles);

    it("finds source files to scan across every package", () => {
        expect(SCANNED.length).toBeGreaterThan(5);
        expect(files.length).toBeGreaterThan(100);
    });

    /** Every matched call in the tree, as `{ site, call, literal, code }`. */
    const sites = files.flatMap(file => {
        const code = fs.readFileSync(file, "utf8");
        const relative = path.relative(PACKAGES, file);
        return CALLS.flatMap(call =>
            [...code.matchAll(callPattern(call))].map(m => ({
                site: `${relative}:${code.slice(0, m.index).split("\n").length}`,
                call,
                literal: literalAt(code, m.index + m[0].length - 1),
                code
            })));
    });

    it("finds the call sites it is meant to police", () => {
        // A refactor that renames these calls must not silently disarm the guard.
        expect(sites.length).toBeGreaterThan(30);
    });

    it("every call carrying a path also carries its segments", () => {
        // There is deliberately no allowlist: a site that genuinely has no segments says so
        // at the call, as `pathSegments: undefined` with the reason next to it, where a
        // reviewer will actually see it.
        const offenders = sites
            .filter(({ literal, code }) => literal && !mentionsPathSegments(literal, code))
            .map(({ site, call }) => `${site} — ${call}`);

        expect(offenders).toEqual([]);
    });

});
