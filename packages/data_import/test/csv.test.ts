/**
 * @jest-environment jsdom
 */
import { describe, expect, test } from "@jest/globals";
import { detectCsvDelimiter, parseCsvRows, parseCsvToObjects } from "../src/utils/csv";
import { convertFileToJson } from "../src/utils/file_to_json";

describe("parseCsvRows", () => {

    test("reads quoted cells containing the delimiter, quotes and newlines", () => {
        const csv = "id,note\r\n1,\"a, b\"\r\n2,\"say \"\"hi\"\"\"\r\n3,\"line\nbreak\"\r\n";

        expect(parseCsvRows(csv)).toEqual([
            ["id", "note"],
            ["1", "a, b"],
            ["2", "say \"hi\""],
            ["3", "line\nbreak"]
        ]);
    });

    test("keeps the last row of a file that does not end in a newline", () => {
        expect(parseCsvRows("a,b\n1,2")).toEqual([["a", "b"], ["1", "2"]]);
    });

    test("keeps an empty trailing cell", () => {
        expect(parseCsvRows("a,b\n1,\n")).toEqual([["a", "b"], ["1", ""]]);
    });
});

describe("detectCsvDelimiter", () => {

    test.each([
        [",", "id,name\n1,Alice\n"],
        [";", "id;name\n1;Alice\n"],
        ["\t", "id\tname\n1\tAlice\n"]
    ])("detects %j", (delimiter, csv) => {
        expect(detectCsvDelimiter(csv)).toEqual(delimiter);
    });

    test("a single-column file stays on the comma", () => {
        expect(detectCsvDelimiter("id\n1\n")).toEqual(",");
    });
});

describe("parseCsvToObjects", () => {

    test("keys each row by the header row", () => {
        expect(parseCsvToObjects("id,name\n1,Alice\n2,Bob\n").data).toEqual([
            { id: "1", name: "Alice" },
            { id: "2", name: "Bob" }
        ]);
    });

    test("strips a BOM from the first header", () => {
        const { headers } = parseCsvToObjects("﻿id,name\n1,Alice\n");
        expect(headers).toEqual(["id", "name"]);
    });

    test("a blank header keeps its column, so later columns keep their names", () => {
        const { headers, data } = parseCsvToObjects("id,,name\n1,spacer,Alice\n");

        expect(headers).toEqual(["id", "Column2", "name"]);
        expect(data).toEqual([{ id: "1", Column2: "spacer", name: "Alice" }]);
    });
});

describe("convertFileToJson with CSV", () => {

    test("reads a real CSV file, typing the cells that hold JSON", async () => {
        const file = new File(["id,name,active\r\n1,Alice,true\r\n2,Bob,false\r\n"], "orders.csv", { type: "text/csv" });

        const { data, propertiesOrder } = await convertFileToJson(file);

        expect(propertiesOrder).toEqual(["id", "name", "active"]);
        expect(data).toEqual([
            { id: 1, name: "Alice", active: true },
            { id: 2, name: "Bob", active: false }
        ]);
    });

    test("reads back what the CSV export writes", async () => {
        // data_export's entryToCSVRow: every cell quoted, quotes doubled, arrays
        // as JSON, CRLF line ends. The round trip must close.
        const exported = "\"name\",\"tags\",\"note\"\r\n"
            + "\"Chair\",\"[\"\"wood\"\",\"\"oak\"\"]\",\"a \"\"quoted\"\", multi\nline note\"\r\n";
        const file = new File([exported], "export.csv", { type: "text/csv" });

        const { data } = await convertFileToJson(file);

        expect(data).toEqual([{ name: "Chair", tags: ["wood", "oak"], note: "a \"quoted\", multi\nline note" }]);
    });

    test("reads a CSV whose MIME type the browser did not set", async () => {
        const file = new File(["id,name\n1,Alice\n"], "orders.csv", { type: "" });

        const { data } = await convertFileToJson(file);

        expect(data).toEqual([{ id: 1, name: "Alice" }]);
    });

    test("reads a semicolon-delimited CSV, as saved in comma-decimal locales", async () => {
        const file = new File(["id;name\n1;Alice\n"], "orders.csv", { type: "text/csv" });

        const { data } = await convertFileToJson(file);

        expect(data).toEqual([{ id: 1, name: "Alice" }]);
    });

    test("reassembles dotted headers into nested values", async () => {
        const file = new File(["id,address.street\n1,Main St\n"], "orders.csv", { type: "text/csv" });

        const { data } = await convertFileToJson(file);

        expect(data).toEqual([{ id: 1, address: { street: "Main St" } }]);
    });

    test("keeps accented and CJK text intact", async () => {
        const file = new File(["name\nCafé 東京\n"], "names.csv", { type: "text/csv" });

        const { data } = await convertFileToJson(file);

        expect(data).toEqual([{ name: "Café 東京" }]);
    });

    test("rejects an empty CSV instead of importing nothing in silence", async () => {
        const file = new File([""], "orders.csv", { type: "text/csv" });

        await expect(convertFileToJson(file)).rejects.toThrow(/empty/i);
    });
});
