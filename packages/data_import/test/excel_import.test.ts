/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions": ["node", "node-addons"]}
 */
// jsdom for FileReader, File and the DOMParser the reader uses. Node export
// conditions because jsdom's default ("browser") hands exceljs' `uuid` its ES
// module build, which jest cannot load; read-excel-file/browser has a CommonJS
// build for `require` either way.
import { describe, expect, test } from "@jest/globals";
import ExcelJS from "exceljs";

import { convertFileToJson } from "../src/utils/file_to_json";

/**
 * Reading uploaded .xlsx workbooks through `read-excel-file`, loaded on demand.
 *
 * The workbooks are written by exceljs, a different library: a fixture built by
 * the reader under test would prove nothing. And they go through the real
 * dynamic import, whose interop (a namespace wrapping the function under
 * `default`) fails only at the moment a user picks a file; neither the type
 * check nor the build sees it.
 */
describe("importing an .xlsx workbook", () => {

    const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    async function workbookFile(rows: Array<Array<string | number | boolean | Date | null>>, name = "products.xlsx"): Promise<File> {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Sheet1");
        for (const row of rows) sheet.addRow(row);
        const buffer = await workbook.xlsx.writeBuffer();
        return new File([buffer as ArrayBuffer], name, { type: XLSX_TYPE });
    }

    test("reads the header row and the rows under it", async () => {
        const file = await workbookFile([
            ["name", "price"],
            ["Chair", 40],
            ["Table", 120]
        ]);

        const { data, propertiesOrder } = await convertFileToJson(file);

        expect(propertiesOrder).toEqual(["name", "price"]);
        expect(data).toEqual([
            { name: "Chair", price: 40 },
            { name: "Table", price: 120 }
        ]);
    });

    test("a second import reuses the loaded reader", async () => {
        const first = await convertFileToJson(await workbookFile([["a"], ["1"]]));
        const second = await convertFileToJson(await workbookFile([["a"], ["2"]]));

        expect(first.data).toEqual([{ a: 1 }]);
        expect(second.data).toEqual([{ a: 2 }]);
    });

    test("keeps numbers, booleans and dates as themselves", async () => {
        // The import maps values by type: a number arriving as "9.5" would make a
        // string column of every imported row.
        const releasedAt = new Date(Date.UTC(2024, 2, 1, 12, 30));
        const file = await workbookFile([
            ["name", "price", "available", "released_at"],
            ["Widget", 9.5, true, releasedAt]
        ]);

        const { data } = await convertFileToJson(file);
        const row = data[0] as Record<string, unknown>;

        expect(row.name).toEqual("Widget");
        expect(row.price).toBe(9.5);
        expect(row.available).toBe(true);
        expect(row.released_at).toBeInstanceOf(Date);
        expect((row.released_at as Date).getTime()).toEqual(releasedAt.getTime());
    });

    test("puts times back on the second the reader truncates them off", async () => {
        // read-excel-file floors the serial's milliseconds, so without the snap
        // 12:30:00 reads as 12:29:59.999 and would display as 12:29. Half a
        // second is genuinely sub-second and must stay where it is.
        const onTheMinute = new Date(Date.UTC(2024, 2, 1, 12, 30));
        const halfSecond = new Date(Date.UTC(2024, 2, 1, 12, 30, 0, 500));
        const file = await workbookFile([["at", "precise"], [onTheMinute, halfSecond]]);

        const { data } = await convertFileToJson(file);
        const row = data[0] as { at: Date, precise: Date };

        expect(row.at.toISOString()).toEqual("2024-03-01T12:30:00.000Z");
        expect(Math.abs(row.precise.getTime() - halfSecond.getTime())).toBeLessThanOrEqual(1);
    });

    test("still parses JSON held in a cell, and reassembles dotted headers", async () => {
        const file = await workbookFile([
            ["name", "tags", "address.city"],
            ["Chair", "[\"wood\",\"oak\"]", "Madrid"]
        ]);

        const { data, propertiesOrder } = await convertFileToJson(file);

        expect(propertiesOrder).toEqual(["name", "tags", "address.city"]);
        expect(data).toEqual([{ name: "Chair", tags: ["wood", "oak"], address: { city: "Madrid" } }]);
    });

    test("a blank header column does not shift the columns after it", async () => {
        // Compacting the header row with `filter(Boolean)` moved every later name
        // one column left, and each value landed in its neighbour's field.
        const file = await workbookFile([
            ["name", "", "price"],
            ["Widget", "spacer", 9.5]
        ]);

        const { data, propertiesOrder } = await convertFileToJson(file);

        expect(propertiesOrder).toEqual(["name", "price"]);
        expect(data).toEqual([{ name: "Widget", price: 9.5 }]);
    });

    test("skips empty rows, and leaves empty cells out of the row", async () => {
        const file = await workbookFile([
            ["name", "price"],
            ["Chair", null],
            [null, null],
            ["Table", 120]
        ]);

        const { data } = await convertFileToJson(file);

        expect(data).toEqual([{ name: "Chair" }, { name: "Table", price: 120 }]);
    });

    test("refuses a legacy .xls by name, with what to do instead", async () => {
        // An .xls is an OLE2 file (D0 CF 11 E0), not a zip, and the reader only
        // opens .xlsx. Without the check the user would see its unzipper's stack.
        const ole2 = new Uint8Array([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1, 0, 0, 0, 0]);
        const file = new File([ole2], "old-products.xls", { type: "application/vnd.ms-excel" });

        await expect(convertFileToJson(file)).rejects.toThrow(/'old-products\.xls' is not a readable \.xlsx workbook/);
        await expect(convertFileToJson(file)).rejects.toThrow(/save it as \.csv/);
    });

    test("refuses a CSV renamed to .xlsx by name", async () => {
        const file = new File(["name,price\nWidget,9.5"], "renamed.xlsx", { type: XLSX_TYPE });

        await expect(convertFileToJson(file)).rejects.toThrow(/'renamed\.xlsx' is not a readable \.xlsx workbook/);
    });

    test("refuses a workbook with no sheets", async () => {
        const buffer = await new ExcelJS.Workbook().xlsx.writeBuffer();
        const file = new File([buffer as ArrayBuffer], "empty.xlsx", { type: XLSX_TYPE });

        await expect(convertFileToJson(file)).rejects.toThrow(/no worksheets/i);
    });

    test("refuses a sheet whose first row has no headers", async () => {
        const file = await workbookFile([[null, null], ["Chair", 40]]);

        await expect(convertFileToJson(file)).rejects.toThrow(/no column headers/i);
    });
});
