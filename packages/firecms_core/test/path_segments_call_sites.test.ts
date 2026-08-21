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
 * `deleteEntityWithCallbacks` is in the list because making the field temporarily
 * non-optional surfaced it: it was the one wrapper this guard did not know about, and it
 * had been *accepting* `pathSegments` and silently ignoring them.
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
    "deleteEntityWithCallbacks",
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

/**
 * The path-resolution helpers that take segments as a trailing *positional* argument.
 *
 * These are policed differently from the props objects above. A path built from a
 * property's configuration genuinely has no entity chain behind it, and a path taken from
 * a URL keeps its ids escaped — for both, splitting inside is correct and segments would be
 * meaningless. So this is a budget rather than a ban: it pins how many call sites currently
 * pass nothing, so that adding one is a visible, deliberate change rather than a silent
 * regression back to guessing.
 */
const POSITIONAL: { call: string, regex?: string, withoutSegments: string[] }[] = [
    {
        // `resolveCollectionPathIds` under another name: the function whose guessing at
        // entity-id boundaries produced the reported warnings. Every caller in the data path
        // passes segments; the two that do not are the collection editor resolving paths
        // typed into its own configuration form, where there is no entity chain to describe.
        call: ".resolveIdsFrom",
        withoutSegments: [
            "collection_editor/src/ConfigControllerProvider.tsx",
            "collection_editor/src/ui/collection_editor/CollectionEditorDialog.tsx"
        ]
    },
    {
        // Seven reference fields resolving a `property.path` — a collection path from the
        // property's configuration, with no entity chain behind it — the reference dialog,
        // and two Firestore admin explorer views handed a raw Firestore path.
        // Matched on its receivers rather than a bare `.getCollection(`: unrelated APIs use
        // that name too (the MCP server has its own collections client), and a guard that
        // fires on them teaches people to edit the expectations rather than the code.
        call: "navigation.getCollection",
        regex: "navigation(?:Controller)?\\.getCollection\\s*\\(",
        withoutSegments: [
            "datatalk/src/components/QueryTableResults.tsx",
            "firebase_admin/src/DocumentPanel.tsx",
            "firebase_admin/src/DocumentTable.tsx",
            "firecms_core/src/components/EntityCollectionTable/fields/TableReferenceField.tsx",
            "firecms_core/src/components/ReferenceWidget.tsx",
            "firecms_core/src/components/SelectableTable/filters/ReferenceFilterField.tsx",
            "firecms_core/src/form/field_bindings/ArrayOfReferencesFieldBinding.tsx",
            "firecms_core/src/form/field_bindings/ReferenceAsStringFieldBinding.tsx",
            "firecms_core/src/form/field_bindings/ReferenceFieldBinding.tsx",
            "firecms_core/src/hooks/useReferenceDialog.tsx"
        ]
    },
    {
        // The collection editor's missing-reference widget, and `FireCMSRoute`, whose path
        // comes from the URL where ids are still escaped — splitting it there is correct.
        call: ".getParentCollectionIds",
        withoutSegments: [
            "collection_editor/src/ui/MissingReferenceWidget.tsx",
            "firecms_core/src/routes/FireCMSRoute.tsx"
        ]
    },
    // Every permission check now receives them.
    { call: "canEditEntity", withoutSegments: [] },
    { call: "canCreateEntity", withoutSegments: [] },
    { call: "canDeleteEntity", withoutSegments: [] },
];

/** Strip block and line comments so commented-out code does not count as a call site. */
function stripComments(src: string): string {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
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

    it.each(POSITIONAL)("$call is only called without segments where it has none", ({ call, regex, withoutSegments }) => {
        // The files whose argument list does not mention segments, named rather than counted,
        // so a new offender shows up in the diff instead of as an off-by-one.
        const pattern = regex
            ? new RegExp(regex, "g")
            : new RegExp(`${call.replace(/[.*+?^${}()|[\]\]\\]/g, "\\$&")}\\s*\\(`, "g");
        const found: string[] = [];

        for (const file of files) {
            const code = stripComments(fs.readFileSync(file, "utf8"));
            for (const m of code.matchAll(pattern)) {
                const open = m.index + m[0].length - 1;
                let depth = 0;
                let end = open;
                for (let i = open; i < code.length; i++) {
                    if (code[i] === "(") depth++;
                    else if (code[i] === ")") {
                        depth--;
                        if (depth === 0) { end = i; break; }
                    }
                }
                const args = code.slice(open, end + 1);
                // Case-insensitive substring: the argument is often a renamed local such
                // as `inputPathSegments` or `resolvedPathSegments`.
                if (!/segments/i.test(args)) found.push(path.relative(PACKAGES, file));
            }
        }

        expect([...new Set(found)].sort()).toEqual(withoutSegments);
    });

    /**
     * The components that carry the chain down to the datasource. `countEntities` is issued
     * by `EntitiesCount`, which is fed by `EntityCollectionView`, which for a subcollection
     * is rendered by `EntityEditView` — if any link in that JSX chain omits the prop, the
     * count call at the bottom silently loses its segments, which is what was reported.
     */
    it.each(["EntityCollectionView", "EntityEditView", "EntitiesCount", "EntityCollectionBoardView"])(
        "<%s> is always given pathSegments", (component) => {
            const open = new RegExp(`<${component}\\b`, "g");
            const offenders: string[] = [];

            for (const file of files) {
                const code = stripComments(fs.readFileSync(file, "utf8"));
                for (const m of code.matchAll(open)) {
                    // Read to the end of the opening tag, tolerating nested {...} expressions.
                    let depth = 0;
                    let end = m.index;
                    for (let i = m.index; i < code.length; i++) {
                        if (code[i] === "{") depth++;
                        else if (code[i] === "}") depth--;
                        else if (code[i] === ">" && depth === 0) { end = i; break; }
                    }
                    const tag = code.slice(m.index, end + 1);
                    if (!/pathSegments/.test(tag)) {
                        offenders.push(`${path.relative(PACKAGES, file)}:${code.slice(0, m.index).split("\n").length}`);
                    }
                }
            }

            expect(offenders).toEqual([]);
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
