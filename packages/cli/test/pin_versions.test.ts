import { describe, expect, it } from "@jest/globals";
import { isFirebaseProjectId, pinnedFireCMSVersion } from "../src/util/scaffold";

/**
 * A prerelease CLI pins the project it scaffolds to its own version. The templates ask for
 * `^3.0.0`, so `npx @firecms/cli@canary init` used to hand out a project with the newest
 * stable packages, and a canary could not be tried end to end at all.
 */
describe("pinnedFireCMSVersion", () => {

    it.each([
        ["3.4.0-canary.1faa2a9", "3.4.0-canary.1faa2a9"],
        ["3.5.0-pre.2", "3.5.0-pre.2"],
        ["4.0.0-beta.1", "4.0.0-beta.1"]
    ])("pins a prerelease CLI (%s) to itself", (version, expected) => {
        expect(pinnedFireCMSVersion(version)).toEqual(expected);
    });

    it.each([["3.4.0"], ["3.4.1"], ["4.0.0"], [undefined]])(
        "leaves the template's range alone for %s", (version) => {
            expect(pinnedFireCMSVersion(version)).toBeUndefined();
        });

});

describe("isFirebaseProjectId", () => {

    it.each(["my-project", "demo-firecms-e2e", "abcdef", "a23456", "example.com:my-project"])(
        "accepts %j", (value) => {
            expect(isFirebaseProjectId(value)).toBe(true);
        });

    it.each([
        "",
        "short",
        "My-Project",
        "1project",
        "project-",
        "my project",
        "my_project",
        "x\"; echo hi",
        "demo-$&-x",
        "a".repeat(31),
        "bad domain:my-project"
    ])("refuses %j", (value) => {
        expect(isFirebaseProjectId(value)).toBe(false);
    });

});
