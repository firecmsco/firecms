import fs from "fs";
import path from "path";

/**
 * Checks a FireCMS Cloud build before it is uploaded, for the failures that only show up
 * once the app loads it: "Error loading remote config", with nothing in the deploy output.
 *
 * The one seen in practice: the template shares the Firebase SDK with `generate: false`, so
 * the build carries no copy of it and takes the host's at runtime. The federation plugin only
 * routes an import through the host when it names a shared package exactly. Anything else that
 * reaches one, such as `firebase/functions` (which re-exports `@firebase/functions`), compiles
 * into a static import of `./__federation_shared_@firebase/functions-<hash>.js`, a chunk that
 * `generate: false` never emits. The deployed bundle then 404s on it and nothing loads.
 */

export const REMOTE_ENTRY = "remoteEntry.js";

export type MissingImport = {
    /** Path relative to the build directory. */
    file: string;
    importedBy: string;
    /** Set when the file is the federation plugin's own chunk for a shared package. */
    sharedPackage?: string;
};

export type BuildCheck = {
    /** Why this build cannot load at all. Nothing should be uploaded. */
    error?: string;
    /** Something that looks wrong but might not be. */
    warning?: string;
};

export function checkBuild(buildDir: string): BuildCheck {
    if (!fs.existsSync(path.join(buildDir, REMOTE_ENTRY))) {
        // The app always loads <bundle>/remoteEntry.js, so a build without it never loads.
        return {
            error: `There is no ${REMOTE_ENTRY} in ${path.relative(process.cwd(), buildDir) || buildDir}, so FireCMS Cloud cannot load this build. ` +
                `Check that vite.config.ts uses the federation plugin with filename "${REMOTE_ENTRY}", as the FireCMS Cloud template does.`
        };
    }

    const missing = findMissingImports(buildDir);
    // Only the plugin's own chunks are certain: a file named like that is a real import. Any
    // other missing name could be a string that merely looks like one, so it only warns.
    const federation = missing.filter(m => path.posix.basename(m.file).startsWith("__federation_") || m.sharedPackage);
    const other = missing.filter(m => !federation.includes(m));

    return {
        error: federation.length ? describeMissingFederationChunks(federation) : undefined,
        warning: other.length
            ? "This build imports files that are not in it, so the parts of your code that use them may fail to load:\n" +
            other.map(formatMissing).join("\n")
            : undefined
    };
}

/**
 * Follows the imports from remoteEntry.js and lists every file they name that the build does
 * not contain. Chunks nothing reaches from the entry are skipped: the build also holds the
 * local dev app from index.html, which the app never loads.
 */
export function findMissingImports(buildDir: string): MissingImport[] {
    const missing: MissingImport[] = [];
    const seen = new Set<string>();
    const queue = [REMOTE_ENTRY];

    while (queue.length) {
        const file = queue.shift()!;
        if (seen.has(file)) continue;
        seen.add(file);

        const source = fs.readFileSync(path.join(buildDir, file), "utf-8");
        for (const ref of chunkReferences(source)) {
            const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), ref));
            // Only this directory is uploaded, so a file outside it is missing too.
            const exists = !target.startsWith("../") && fs.existsSync(path.join(buildDir, target));
            if (exists) {
                queue.push(target);
            } else if (!missing.some(m => m.file === target)) {
                missing.push({ file: target, importedBy: file, sharedPackage: sharedPackageOf(target) });
            }
        }
    }
    return missing;
}

/**
 * The relative .js files a chunk imports. Import syntax, plus any string naming one of the
 * federation plugin's chunks: the remote entry loads the exposed module through a helper,
 * `__federation_import("./__federation_expose_Config-<hash>.js")`, and a minified build renames
 * that helper, so the call itself cannot be matched.
 */
export function chunkReferences(source: string): string[] {
    const patterns = [
        /\bfrom\s*['"]((?:\.\.?\/)+[^'"\n]+?\.js)['"]/g,
        /\bimport\s*\(\s*['"]((?:\.\.?\/)+[^'"\n]+?\.js)['"]\s*\)/g,
        /\bimport\s*['"]((?:\.\.?\/)+[^'"\n]+?\.js)['"]/g,
        /['"]((?:\.\.?\/)+[^'"\n]*__federation_[^'"\n]*?\.js)['"]/g
    ];
    const refs = new Set<string>();
    for (const pattern of patterns) {
        for (const match of source.matchAll(pattern)) {
            refs.add(match[1]);
        }
    }
    return [...refs];
}

/** `__federation_shared_@firebase/functions-CxA6bbek.js` is the chunk for `@firebase/functions`. */
function sharedPackageOf(file: string): string | undefined {
    return /(?:^|\/)__federation_shared_(.+)-[\w-]{8}\.js$/.exec(file)?.[1];
}

function describeMissingFederationChunks(missing: MissingImport[]): string {
    const packages = [...new Set(missing.map(m => m.sharedPackage).filter((p): p is string => Boolean(p)))];
    if (!packages.length) {
        return "This build won't load in FireCMS Cloud: it imports files the build never produced:\n" +
            missing.map(formatMissing).join("\n") +
            "\nRun the build again, then deploy.";
    }

    const fixes = packages.map(pkg => pkg.startsWith("@firebase/")
        // Each @firebase/<name> is what the matching firebase/<name> entry point re-exports.
        ? `  import … from "${pkg.slice(1)}"  →  import … from "${pkg}"`
        : `  import … from "${pkg}" itself, not from a subpath of it or a package that re-exports it`);

    return `This build won't load in FireCMS Cloud. FireCMS provides ${packages.join(", ")} to your code, ` +
        "but only to imports that name the package exactly, and some of yours don't. " +
        "The build points at copies it never produced:\n" +
        missing.map(formatMissing).join("\n") +
        "\nChange those imports in your code:\n" +
        fixes.join("\n") +
        "\nThen build and deploy again.";
}

function formatMissing(missing: MissingImport): string {
    return `  ${missing.file} (imported by ${missing.importedBy})`;
}
