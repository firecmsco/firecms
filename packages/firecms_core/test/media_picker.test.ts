import { describe, expect, it } from "@jest/globals";
import { isMediaCompatible, mergeMediaSelection } from "../src/util/media_picker.js";

describe("media picker", () => {
    it("accepts any compatible existing image regardless of the upload size limit", () => {
        expect(isMediaCompatible({ mimeType: "image/png", size: 20 }, ["image/*"], 20)).toBe(true);
        expect(isMediaCompatible({ mimeType: "application/pdf", size: 20 }, ["image/*"], 20)).toBe(false);
        expect(isMediaCompatible({ mimeType: "image/png", size: 21 }, ["image/*"], 20)).toBe(true);
    });

    it("preserves existing array values and removes duplicate selections", () => {
        expect(mergeMediaSelection(["a", "b"], ["b", "c"], true)).toEqual(["a", "b", "c"]);
        expect(mergeMediaSelection(["a"], ["a", "a"], true)).toEqual(["a"]);
        expect(mergeMediaSelection(null, ["a"], true)).toEqual(["a"]);
        expect(mergeMediaSelection(["a"], [], true)).toEqual(["a"]);
    });

    it("replaces a single value without changing the shared file", () => {
        expect(mergeMediaSelection("shared", ["replacement"], false)).toBe("replacement");
        expect(mergeMediaSelection("shared", [], false)).toBeNull();
    });

    it("handles unrestricted and exact file types", () => {
        expect(isMediaCompatible({ mimeType: "application/pdf", size: 100 }, undefined)).toBe(true);
        expect(isMediaCompatible({ mimeType: "IMAGE/PNG", size: 100 }, ["image/png"])).toBe(true);
        expect(isMediaCompatible({ mimeType: "image/jpeg", size: 100 }, ["image/png"])).toBe(false);
    });
});
