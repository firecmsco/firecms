import { describe, expect, it } from "@jest/globals";
import { unslugify } from "../src/util";

/**
 * Note: this is NOT the same function as `unslugify` in @firecms/core, and the difference
 * is deliberate. The core version title-cases every word and preserves the case of the
 * rest of each word ("my-cool-app" -> "My Cool App"); this one produces a single
 * sentence-cased string ("my-cool-app" -> "My cool app"), which is what the project
 * scaffolding prompts want. The tests below pin that distinction so the two do not get
 * "helpfully" unified.
 */
describe("unslugify", () => {

    it("turns dashes and underscores into spaces", () => {
        expect(unslugify("my-cool-app")).toEqual("My cool app");
        expect(unslugify("my_cool_app")).toEqual("My cool app");
        expect(unslugify("mixed-separators_here")).toEqual("Mixed separators here");
    });

    it("capitalises only the first character", () => {
        expect(unslugify("hello")).toEqual("Hello");
        expect(unslugify("HELLO-WORLD")).toEqual("Hello world");
        expect(unslugify("iOS-app")).toEqual("Ios app");
    });

    it("handles a single word and an empty string", () => {
        expect(unslugify("app")).toEqual("App");
        expect(unslugify("")).toEqual("");
    });

});
