import { describe, expect, test } from "@jest/globals";
import { isIsoDateText, parseBooleanText, parseDateText, parseNumberText } from "../src/utils/text_values";
import { getInferenceType } from "../src/utils/get_import_inference_type";

describe("parseNumberText", () => {

    test.each([
        ["1234", 1234],
        ["-12.5", -12.5],
        [" 42 ", 42],
        [".5", 0.5],
        ["1e3", 1000],
        ["1,234", 1234],
        ["1,234,567", 1234567],
        ["-1,234.5", -1234.5],
        ["1.234,5", 1234.5],
        ["1.234.567", 1234567],
        ["12,5", 12.5],
        ["0,75", 0.75],
        ["1 234", 1234],
        ["1 234,56 €", 1234.56],
        ["$5.00", 5],
        ["-$5", -5],
        ["€ 9,99", 9.99],
        ["1'234.5", 1234.5],
        ["50%", 0.5],
        ["(100)", -100],
        ["(50%)", -0.5]
    ])("reads %j as %j", (text, expected) => {
        expect(parseNumberText(text)).toBeCloseTo(expected, 10);
    });

    test.each(["", "   ", "abc", "-", "12,34,5", "1.2.3", "Infinity", "0x10", "1,2,3.4,5", "N/A"])(
        "returns null for %j rather than NaN", (text) => {
            expect(parseNumberText(text)).toBeNull();
        });
});

describe("parseBooleanText", () => {

    test.each([
        ["true", true], ["TRUE", true], [" True ", true], ["yes", true], ["1", true],
        ["false", false], ["FALSE", false], ["No", false], ["0", false]
    ])("reads %j as %j", (text, expected) => {
        expect(parseBooleanText(text)).toBe(expected);
    });

    test.each(["", "maybe", "truthy", "2"])("returns null for %j", (text) => {
        expect(parseBooleanText(text)).toBeNull();
    });
});

describe("parseDateText", () => {

    test("the zone really is west of UTC", () => {
        // Set by test/time_zone_setup.js: under UTC the next test proves nothing.
        expect(new Date(2024, 0, 15).getTimezoneOffset()).toBeGreaterThan(0);
    });

    test("an ISO date is that day in the viewer's zone, not UTC midnight", () => {
        // new Date("2024-01-15") is UTC midnight: Jan 14 19:00 in New York.
        expect(parseDateText("2024-01-15")).toEqual(new Date(2024, 0, 15));
    });

    test.each([
        ["2024-01-15 10:30", new Date(2024, 0, 15, 10, 30)],
        ["2024-01-15T10:30:15", new Date(2024, 0, 15, 10, 30, 15)],
        ["2024-01-15T10:30:15.25", new Date(2024, 0, 15, 10, 30, 15, 250)],
        ["0099-06-01", (() => { const d = new Date(2000, 5, 1); d.setFullYear(99); return d; })()]
    ])("reads %j as local wall-clock time", (text, expected) => {
        expect(parseDateText(text)).toEqual(expected);
    });

    test.each([
        ["2024-01-15T10:30:00.000Z", Date.UTC(2024, 0, 15, 10, 30)],
        ["2024-01-15T10:30:00+02:00", Date.UTC(2024, 0, 15, 8, 30)],
        ["2024-01-15 10:30+0200", Date.UTC(2024, 0, 15, 8, 30)]
    ])("reads %j, which has a zone, as that instant", (text, expected) => {
        expect(parseDateText(text)?.getTime()).toEqual(expected);
    });

    test("reads other formats the way the browser does", () => {
        expect(parseDateText("01/15/2024")).toEqual(new Date(2024, 0, 15));
    });

    test.each(["", "not a date", "2024-02-31", "2024-13-01", "2024-01-15 25:00"])(
        "returns null for %j rather than an Invalid Date", (text) => {
            expect(parseDateText(text)).toBeNull();
        });
});

describe("date columns in CSV", () => {

    test.each([
        ["2024-01-15", true],
        ["2024-01-15 10:30", true],
        ["2024-01-15T10:30:00.000Z", true],
        ["2024-02-31", false],
        ["01/15/2024", false],
        ["20240115", false],
        ["Chair", false]
    ])("isIsoDateText(%j) is %j", (text, expected) => {
        expect(isIsoDateText(text)).toBe(expected);
    });

    test("an ISO date column is proposed as a date property", () => {
        expect(getInferenceType("2024-01-15")).toEqual("date");
        expect(getInferenceType("Chair")).toEqual("string");
    });
});
