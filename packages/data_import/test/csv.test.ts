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

    test("ends a line on a lone CR, as Excel for Mac's CSV writes them", () => {
        // Dropping the CR read the whole file as one header row: zero records.
        expect(parseCsvRows("a,b\r1,2\r3,4\r")).toEqual([["a", "b"], ["1", "2"], ["3", "4"]]);
    });

    test("a CR inside quotes is part of the cell", () => {
        expect(parseCsvRows("a\r\n\"x\ry\"\r\n")).toEqual([["a"], ["x\ry"]]);
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

    test("reads the header row below leading blank lines", () => {
        expect(detectCsvDelimiter("\n\nid;name\n1;Alice\n")).toEqual(";");
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

    test("leaves blank cells out of the row, quoted or not", () => {
        // As `""` a blank became 0, false, an Invalid Date or a reference to ""
        // once mapped, and replaced the collection's defaults. The export writes
        // every null as a bare blank; a spreadsheet may quote it.
        const { data } = parseCsvToObjects("\"id\",\"name\",\"price\"\r\n\"1\",\"A\",\r\n\"2\",,\"5\"\r\n\"3\",\"\",   \r\n");

        expect(data).toEqual([
            { id: "1", name: "A" },
            { id: "2", price: "5" },
            { id: "3" }
        ]);
    });

    test("trailing delimiters add no columns", () => {
        const { headers, data } = parseCsvToObjects("name,price,,\r\nA,1,,\r\nB,2,,\r\n");

        expect(headers).toEqual(["name", "price"]);
        expect(data).toEqual([{ name: "A", price: "1" }, { name: "B", price: "2" }]);
    });

    test("a repeated header gets a suffix instead of overwriting the first column", () => {
        const { headers, data } = parseCsvToObjects("name,name,price,name\nA,B,1,C\n");

        expect(headers).toEqual(["name", "name_1", "price", "name_2"]);
        expect(data).toEqual([{ name: "A", name_1: "B", price: "1", name_2: "C" }]);
    });

    test("reads the table below leading blank lines", () => {
        const { headers, data } = parseCsvToObjects("\r\n,,\r\nname,price\r\nA,1\r\n");

        expect(headers).toEqual(["name", "price"]);
        expect(data).toEqual([{ name: "A", price: "1" }]);
    });

    test("reads TRUE and FALSE in any case as booleans", () => {
        // Excel and Google Sheets write them in capitals; mapped into a boolean
        // property, "TRUE" compared unequal to "true" and imported as false.
        const { data } = parseCsvToObjects("a,b,c,d\nTRUE,FALSE,True,false\n");

        expect(data).toEqual([{ a: true, b: false, c: true, d: false }]);
    });

    test("leaves a header that reads TRUE as text", () => {
        expect(parseCsvToObjects("TRUE,x\n1,2\n").headers).toEqual(["TRUE", "x"]);
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

    test("rejects a CSV with a header row and nothing under it", async () => {
        const file = new File(["id,name\r\n,\r\n"], "orders.csv", { type: "text/csv" });

        await expect(convertFileToJson(file)).rejects.toThrow(/no rows under it/);
    });

    test("imports a Macintosh CSV (CR line ends) row by row", async () => {
        const file = new File(["a,b\r1,2\r3,4\r"], "mac.csv", { type: "text/csv" });

        const { data } = await convertFileToJson(file);

        expect(data).toEqual([{ a: 1, b: 2 }, { a: 3, b: 4 }]);
    });

    test("re-imports an export with nulls: the blank cells stay absent", async () => {
        const exported = "\"id\",\"name\",\"price\",\"owner\"\r\n\"1\",\"A\",,\r\n\"2\",,\"5\",\"users/u1\"\r\n";
        const file = new File([exported], "export.csv", { type: "text/csv" });

        const { data } = await convertFileToJson(file);

        expect(data).toEqual([{ id: 1, name: "A" }, { id: 2, price: 5, owner: "users/u1" }]);
    });

    test("a column named constructor is imported like any other", async () => {
        // Dropped by an over-broad prototype guard; only `__proto__` is refused.
        const file = new File(["driver,constructor,points\nHamilton,Mercedes,25\n"], "f1.csv", { type: "text/csv" });

        const { data } = await convertFileToJson(file);

        expect(data).toEqual([{ driver: "Hamilton", constructor: "Mercedes", points: 25 }]);
    });
});
