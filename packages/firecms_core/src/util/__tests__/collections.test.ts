import { getLocalChangesBackup } from "../collections.js";
import { EntityCollection } from "../../types/index.js";

function collectionWith(localChangesBackup?: "manual_apply" | "auto_apply" | false): EntityCollection {
    return {
        id: "products",
        name: "Products",
        path: "products",
        properties: {},
        localChangesBackup
    } as EntityCollection;
}

describe("getLocalChangesBackup", () => {

    it("should default to manual_apply when not set", () => {
        expect(getLocalChangesBackup(collectionWith(undefined))).toEqual("manual_apply");
    });

    it("should return manual_apply when explicitly set", () => {
        expect(getLocalChangesBackup(collectionWith("manual_apply"))).toEqual("manual_apply");
    });

    it("should return auto_apply when explicitly set", () => {
        expect(getLocalChangesBackup(collectionWith("auto_apply"))).toEqual("auto_apply");
    });

    it("should return false when explicitly disabled, and not fall back to the default", () => {
        expect(getLocalChangesBackup(collectionWith(false))).toEqual(false);
    });

});
