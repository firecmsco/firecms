/**
 * @jest-environment jsdom
 */
import "./match_media_stub";
import { describe, expect, test } from "@jest/globals";
import { EntityReference } from "@firecms/core";

import { convertFileToJson } from "../src/utils/file_to_json";
import { convertDataToEntity } from "../src/utils/data";

/**
 * A CSV the way Excel and FireCMS's own export write it, taken through the reader
 * and then the mapping onto a collection's typed properties: the two halves each
 * look fine alone, and the damage was in how they met.
 */
describe("a CSV mapped onto typed properties", () => {

    const properties = {
        name: { dataType: "string" },
        price: { dataType: "number" },
        active: { dataType: "boolean" },
        released: { dataType: "date" },
        owner: { dataType: "reference", path: "users" },
        sizes: { dataType: "array", of: { dataType: "number" } }
    } as const;

    const authController = { user: null } as any;
    const navigation = { getCollectionById: () => undefined } as any;

    async function importCsv(csv: string, defaults: Record<string, unknown> = {}) {
        const { data } = await convertFileToJson(new File([csv], "products.csv", { type: "text/csv" }));
        const headersMapping = Object.fromEntries(Object.keys(properties).map(key => [key, key]));
        return data.map(row => convertDataToEntity(authController, navigation, row, undefined,
            headersMapping, properties as any, "products", defaults).values);
    }

    test("blank cells leave the collection's defaults in place", async () => {
        // As "" they became 0, false, an Invalid Date and a reference to "",
        // which fails the whole save.
        const [row] = await importCsv(
            "\"name\",\"price\",\"active\",\"released\",\"owner\"\r\n\"Chair\",,,,\r\n",
            { price: 10, active: true }
        );

        expect(row).toEqual({ name: "Chair", price: 10, active: true });
    });

    test("reads Excel's TRUE, formatted numbers and ISO dates", async () => {
        const [row] = await importCsv("name,price,active,released\r\nChair,\"1,234.50\",TRUE,2024-01-15\r\n");

        expect(row.price).toBe(1234.5);
        expect(row.active).toBe(true);
        expect(row.released).toEqual(new Date(2024, 0, 15));
    });

    test("a number that can't be read is left empty, never NaN", async () => {
        const [row] = await importCsv("name,price\r\nChair,N/A\r\n");

        expect(row.price).toBeNull();
    });

    test("maps each item of a comma-separated list", async () => {
        const [row] = await importCsv("name,sizes\r\nChair,\"38, 40,42\"\r\n");

        expect(row.sizes).toEqual([38, 40, 42]);
    });

    test("a reference path becomes a reference", async () => {
        const [row] = await importCsv("name,owner\r\nChair,users/u1\r\n");

        expect(row.owner).toBeInstanceOf(EntityReference);
        expect(row.owner).toMatchObject({ id: "u1", path: "users" });
    });
});
