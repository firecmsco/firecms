import { describe, expect, test } from "@jest/globals";
import { unslugify } from "../src";

describe("unslugify", () => {
    test("should unslugify hyphenated string", () => {
        expect(unslugify("this-is-a-test")).toBe("This Is A Test");
    });

    test("should unslugify underscored string", () => {
        expect(unslugify("this_is_a_test")).toBe("This Is A Test");
    });

    test("should do nothing if string is already unslugified", () => {
        expect(unslugify("This Is A Test")).toBe("This Is A Test");
    });

    test("should handle multiple uppercase chars", () => {
        expect(unslugify("EUR")).toBe("EUR");
    });

    test("should handle non ascii chars", () => {
        expect(unslugify("¿Cuál es la expectativa que tienes de esta red de mujeres?")).toBe("¿Cuál es la expectativa que tienes de esta red de mujeres?");
    });

    test("should treat non-hyphen, non-underscore, non-camelCase strings as already unslugified", () => {
        expect(unslugify("thisisatest")).toBe("Thisisatest");
    });
});
