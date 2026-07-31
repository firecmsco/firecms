import { describe, expect, it } from "@jest/globals";
import { filterValueToText, parseFilterTextInput } from "./filter_text_input";

/**
 * Type `text` one character at a time, the way the filter field does, and keep track
 * of the filter value left after every keystroke.
 */
function typeCharByChar(text: string, dataType: "string" | "number" = "number") {
    let value: string | number | undefined;
    const valueAfterEachKeystroke: (string | number | undefined)[] = [];
    for (let i = 1; i <= text.length; i++) {
        const result = parseFilterTextInput(text.slice(0, i), dataType);
        if (result.updateValue)
            value = result.value;
        valueAfterEachKeystroke.push(value);
    }
    return {
        value,
        valueAfterEachKeystroke
    };
}

describe("parseFilterTextInput with numbers", () => {

    it("should parse complete numbers", () => {
        expect(parseFilterTextInput("0.01", "number")).toEqual({
            updateValue: true,
            value: 0.01
        });
        expect(parseFilterTextInput("1", "number")).toEqual({
            updateValue: true,
            value: 1
        });
        expect(parseFilterTextInput("1.5", "number")).toEqual({
            updateValue: true,
            value: 1.5
        });
        expect(parseFilterTextInput("-0.5", "number")).toEqual({
            updateValue: true,
            value: -0.5
        });
        expect(parseFilterTextInput(".5", "number")).toEqual({
            updateValue: true,
            value: 0.5
        });
        expect(parseFilterTextInput("1e5", "number")).toEqual({
            updateValue: true,
            value: 100000
        });
        expect(parseFilterTextInput("0.0100", "number")).toEqual({
            updateValue: true,
            value: 0.01
        });
    });

    it("should keep 0 as a valid filter value", () => {
        expect(parseFilterTextInput("0", "number")).toEqual({
            updateValue: true,
            value: 0
        });
        expect(parseFilterTextInput("0.0", "number")).toEqual({
            updateValue: true,
            value: 0
        });
        expect(parseFilterTextInput("00", "number")).toEqual({
            updateValue: true,
            value: 0
        });
        expect(parseFilterTextInput("-0", "number").updateValue).toBe(true);
    });

    it("should clear the filter for an empty input", () => {
        expect(parseFilterTextInput("", "number")).toEqual({
            updateValue: true,
            value: undefined
        });
        expect(parseFilterTextInput("   ", "number")).toEqual({
            updateValue: true,
            value: undefined
        });
    });

    it("should not touch the filter value for intermediate inputs", () => {
        // these are states the user goes through while typing, the text must be kept
        // in the input without the filter value being changed
        expect(parseFilterTextInput("0.", "number")).toEqual({ updateValue: false });
        expect(parseFilterTextInput(".", "number")).toEqual({ updateValue: false });
        expect(parseFilterTextInput("1.", "number")).toEqual({ updateValue: false });
        expect(parseFilterTextInput("-", "number")).toEqual({ updateValue: false });
        expect(parseFilterTextInput("-.", "number")).toEqual({ updateValue: false });
        expect(parseFilterTextInput("+", "number")).toEqual({ updateValue: false });
        expect(parseFilterTextInput("-0.", "number")).toEqual({ updateValue: false });
        expect(parseFilterTextInput("1e", "number")).toEqual({ updateValue: false });
        expect(parseFilterTextInput("1e-", "number")).toEqual({ updateValue: false });
    });

    it("should not touch the filter value for text that is not a number", () => {
        expect(parseFilterTextInput("abc", "number")).toEqual({ updateValue: false });
        expect(parseFilterTextInput("12abc", "number")).toEqual({ updateValue: false });
        expect(parseFilterTextInput("1.2.3", "number")).toEqual({ updateValue: false });
        expect(parseFilterTextInput("--1", "number")).toEqual({ updateValue: false });
        expect(parseFilterTextInput("0x10", "number")).toEqual({ updateValue: false });
        expect(parseFilterTextInput("Infinity", "number")).toEqual({ updateValue: false });
        expect(parseFilterTextInput("1e999", "number")).toEqual({ updateValue: false });
    });

    it("should allow typing 0.01 character by character", () => {
        const { value, valueAfterEachKeystroke } = typeCharByChar("0.01");
        expect(value).toBe(0.01);
        // "0" -> 0, "0." -> unchanged, "0.0" -> 0, "0.01" -> 0.01
        expect(valueAfterEachKeystroke).toEqual([0, 0, 0, 0.01]);
    });

    it("should allow typing other decimals character by character", () => {
        expect(typeCharByChar("0.001").value).toBe(0.001);
        expect(typeCharByChar("-0.5").value).toBe(-0.5);
        expect(typeCharByChar(".5").value).toBe(0.5);
        expect(typeCharByChar(".01").value).toBe(0.01);
        expect(typeCharByChar("1.05").value).toBe(1.05);
        expect(typeCharByChar("10.00001").value).toBe(10.00001);
        expect(typeCharByChar("-.5").value).toBe(-0.5);
    });

    it("should keep the previous value while typing a trailing decimal separator", () => {
        // typing "1." leaves the value at 1, the text "1." stays in the input
        expect(typeCharByChar("1.").value).toBe(1);
        expect(typeCharByChar("1.").valueAfterEachKeystroke).toEqual([1, 1]);
    });

    it("should not commit a value until a leading sign is followed by digits", () => {
        expect(typeCharByChar("-").value).toBeUndefined();
        expect(typeCharByChar("-1").valueAfterEachKeystroke).toEqual([undefined, -1]);
    });

    it("should clear the value when the input is emptied", () => {
        // deleting "0.01" one character at a time, from the end
        const texts = ["0.0", "0.", "0", ""];
        let value: string | number | undefined = 0.01;
        for (const text of texts) {
            const result = parseFilterTextInput(text, "number");
            if (result.updateValue)
                value = result.value;
        }
        expect(value).toBeUndefined();
    });
});

describe("parseFilterTextInput with strings", () => {

    it("should use the text as the value", () => {
        expect(parseFilterTextInput("abc", "string")).toEqual({
            updateValue: true,
            value: "abc"
        });
        expect(parseFilterTextInput("0.", "string")).toEqual({
            updateValue: true,
            value: "0."
        });
        expect(parseFilterTextInput("", "string")).toEqual({
            updateValue: true,
            value: ""
        });
        expect(parseFilterTextInput("  spaced  ", "string")).toEqual({
            updateValue: true,
            value: "  spaced  "
        });
    });
});

describe("filterValueToText", () => {

    it("should render values as text", () => {
        expect(filterValueToText(0)).toBe("0");
        expect(filterValueToText(0.01)).toBe("0.01");
        expect(filterValueToText(-0.5)).toBe("-0.5");
        expect(filterValueToText("abc")).toBe("abc");
        expect(filterValueToText("")).toBe("");
    });

    it("should render empty text for no value", () => {
        expect(filterValueToText(undefined)).toBe("");
        expect(filterValueToText(null)).toBe("");
    });
});
