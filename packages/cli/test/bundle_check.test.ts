import { afterEach, describe, expect, it } from "@jest/globals";
import fs from "fs";
import os from "os";
import path from "path";
import { checkBuild, chunkReferences, findMissingImports } from "../src/util/bundle_check";

/**
 * The fixtures are cut down from real `vite build` output of the FireCMS Cloud template:
 * remoteEntry.js loads the exposed config through `__federation_import(...)`, and an import of
 * `firebase/functions` comes out as a static import of a shared chunk that is never emitted.
 */
const REMOTE_ENTRY = `let moduleMap = {
  "./config": () => {
    dynamicLoadingCss(["style-HZNnVKR_.css"], false, "./config");
    return __federation_import("./__federation_expose_Config-C3oPbsyZ.js").then((module) => module);
  }
};`;

const EXPOSE_WITH_FIREBASE_SUBPATHS = `import { importShared } from "./__federation_fn_import-CTP3s1vu.js";
import { httpsCallable, getFunctions } from "./__federation_shared_@firebase/functions-CxA6bbek.js";
import { getApp } from "./__federation_shared_@firebase/app-CxlwCyQr.js";
const React$2 = await importShared("react");`;

const EXPOSE_WITH_SHARED_NAMES = `import { importShared } from "./__federation_fn_import-CTP3s1vu.js";
const { getApp } = await importShared("@firebase/app");
const { getFunctions, httpsCallable } = await importShared("@firebase/functions");
const Lazy = () => import("./LazyView-Dk2mN0aQ.js");`;

const dirs: string[] = [];

function build(files: Record<string, string>): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "firecms_bundle_check_"));
    dirs.push(dir);
    for (const [name, content] of Object.entries(files)) {
        fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
        fs.writeFileSync(path.join(dir, name), content);
    }
    return dir;
}

afterEach(() => {
    dirs.splice(0).forEach(dir => fs.rmSync(dir, { recursive: true, force: true }));
});

describe("checkBuild", () => {

    it("refuses a build that imports firebase/* subpaths, and says which imports to change", () => {
        const dir = build({
            "remoteEntry.js": REMOTE_ENTRY,
            "__federation_expose_Config-C3oPbsyZ.js": EXPOSE_WITH_FIREBASE_SUBPATHS,
            "__federation_fn_import-CTP3s1vu.js": "const moduleMap = {};"
        });

        const { error, warning } = checkBuild(dir);

        expect(warning).toBeUndefined();
        expect(error).toContain("This build won't load in FireCMS Cloud");
        expect(error).toContain("__federation_shared_@firebase/functions-CxA6bbek.js (imported by __federation_expose_Config-C3oPbsyZ.js)");
        expect(error).toContain("__federation_shared_@firebase/app-CxlwCyQr.js (imported by __federation_expose_Config-C3oPbsyZ.js)");
        expect(error).toContain(`import … from "firebase/functions"  →  import … from "@firebase/functions"`);
        expect(error).toContain(`import … from "firebase/app"  →  import … from "@firebase/app"`);
    });

    it("accepts a build that imports the shared packages by name", () => {
        const dir = build({
            "remoteEntry.js": REMOTE_ENTRY,
            "__federation_expose_Config-C3oPbsyZ.js": EXPOSE_WITH_SHARED_NAMES,
            "__federation_fn_import-CTP3s1vu.js": "const moduleMap = {};",
            "LazyView-Dk2mN0aQ.js": "export default 1;"
        });

        expect(checkBuild(dir)).toEqual({ error: undefined, warning: undefined });
    });

    it("accepts the shared chunks an older config emits, which import back up with ../", () => {
        const dir = build({
            "remoteEntry.js": REMOTE_ENTRY,
            "__federation_expose_Config-C3oPbsyZ.js": EXPOSE_WITH_FIREBASE_SUBPATHS,
            "__federation_fn_import-CTP3s1vu.js": "const moduleMap = {};",
            "__federation_shared_@firebase/functions-CxA6bbek.js": `import { a } from "../index.esm-CVm-53gD.js";`,
            "__federation_shared_@firebase/app-CxlwCyQr.js": `export * from "../index.esm-CVm-53gD.js";`,
            "index.esm-CVm-53gD.js": "export const a = 1;"
        });

        expect(checkBuild(dir)).toEqual({ error: undefined, warning: undefined });
    });

    it("ignores chunks the remote entry never reaches, like the local dev app from index.html", () => {
        const dir = build({
            "remoteEntry.js": REMOTE_ENTRY,
            "__federation_expose_Config-C3oPbsyZ.js": EXPOSE_WITH_SHARED_NAMES,
            "__federation_fn_import-CTP3s1vu.js": "const moduleMap = {};",
            "LazyView-Dk2mN0aQ.js": "export default 1;",
            "index-B6e4KIuW.js": `import { x } from "./__federation_shared_@firebase/app-P2l7WdtC.js";`
        });

        expect(findMissingImports(dir)).toEqual([]);
    });

    it("refuses a build with no remoteEntry.js", () => {
        const dir = build({ "index-B6e4KIuW.js": "export {};" });

        expect(checkBuild(dir).error).toContain("There is no remoteEntry.js in");
    });

    it("gives general advice for a shared package that is not part of Firebase", () => {
        const dir = build({
            "remoteEntry.js": REMOTE_ENTRY,
            "__federation_expose_Config-C3oPbsyZ.js": `import { Button } from "./__federation_shared_@firecms/ui-Ab12Cd34.js";`
        });

        expect(checkBuild(dir).error).toContain(`import … from "@firecms/ui" itself, not from a subpath of it or a package that re-exports it`);
    });

    it("only warns about a missing file the federation plugin did not name", () => {
        const dir = build({
            "remoteEntry.js": REMOTE_ENTRY,
            "__federation_expose_Config-C3oPbsyZ.js": EXPOSE_WITH_SHARED_NAMES,
            "__federation_fn_import-CTP3s1vu.js": "const moduleMap = {};"
        });

        const { error, warning } = checkBuild(dir);

        expect(error).toBeUndefined();
        expect(warning).toContain("LazyView-Dk2mN0aQ.js (imported by __federation_expose_Config-C3oPbsyZ.js)");
    });

    it("counts an import that leaves the build directory as missing, since only that directory is uploaded", () => {
        const dir = build({
            "remoteEntry.js": REMOTE_ENTRY,
            "__federation_expose_Config-C3oPbsyZ.js": `import { a } from "../outside-Ab12Cd34.js";`
        });

        expect(findMissingImports(dir)).toEqual([
            { file: "../outside-Ab12Cd34.js", importedBy: "__federation_expose_Config-C3oPbsyZ.js", sharedPackage: undefined }
        ]);
    });

});

describe("chunkReferences", () => {

    it("finds the exposed module behind a minified build's renamed loader", () => {
        const minified = `let g={"./config":()=>(w(["style-DscciqO0.css"],!1,"./config"),y("./__federation_expose_Config-CccemRZY.js").then(e=>e))};`;

        expect(chunkReferences(minified)).toEqual(["./__federation_expose_Config-CccemRZY.js"]);
    });

    it("ignores relative strings outside an import", () => {
        expect(chunkReferences(`const worker = "./worker.js"; console.log("see ./notes.js");`)).toEqual([]);
    });

    it("ignores bare package imports", () => {
        expect(chunkReferences(`import { satisfy } from "__federation_fn_satisfy"; import("react");`)).toEqual([]);
    });

});
