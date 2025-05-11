import { describe, expect, test } from "@jest/globals";
import { unflattenObject } from "../src/utils/file_to_json";

describe("UnflattenObject function", () => {

    test("Flattens object keys correctly", () => {
        const input = {
            key1: "value1",
            "key2.key3": "value3",
            "array[0]": "valueA",
            "array[1]": "valueB",
            "key4.key5.key6": "value6"
        };

        const output = unflattenObject(input);

        expect(output).toEqual({
            key1: "value1",
            key2: {
                key3: "value3"
            },
            array: ["valueA", "valueB"],
            key4: {
                key5: {
                    key6: "value6"
                }
            }
        });
    });

    test("Multiple arrays test", () => {
        const input = {
            "images[0]": "dadaki/B000P0MDMS-576916726.jpg",
            "images[1]": "dadaki/B000P0MDMS-1415254616.jpg",
            "available_locales[0]": "fr",
            "available_locales[1]": "it"
        };

        const output = unflattenObject(input);

        expect(output).toEqual({
            images: [
                "dadaki/B000P0MDMS-576916726.jpg",
                "dadaki/B000P0MDMS-1415254616.jpg"
            ],
            available_locales: ["fr", "it"]
        });
    });

    test("Flattens complex object keys correctly", () => {
        const input = {
            keyA: "value1",
            "keyB.keyC.keyD": "value2",
            "keyE[0]": "value3",
            "keyE[1]": "value4",
            "keyF.keyG[0]": "value5",
            "keyF.keyG[1]": "value6",
            "keyH.keyI[0].keyJ": "value7",
            "keyH.keyI[1].keyJ": "value8"
        };

        const output = unflattenObject(input);

        expect(output).toEqual({
            keyA: "value1",
            keyB: {
                keyC: {
                    keyD: "value2"
                }
            },
            keyE: ["value3", "value4"],
            keyF: {
                keyG: ["value5", "value6"]
            },
            keyH: {
                keyI: [
                    { keyJ: "value7" },
                    { keyJ: "value8" }
                ]
            }
        });
    });

});
