import { convertDataEntryValue, convertDataObjectValue, processValueMapping } from "../src/utils/data";

describe("processValueMapping", () => {
    it("should return the original value if valueMapping is undefined", () => {
        const value = "test";
        const result = processValueMapping(value);
        expect(result).toEqual(value);
    });

    it("should convert string to number when from and to are matched", () => {
        const value = "123";
        const valueMapping = { from: "string", to: "number" } as any;
        const result = processValueMapping(value, valueMapping);
        expect(result).toEqual(123);
    });

    it("should convert string \"true\" to boolean", () => {
        const value = "true";
        const valueMapping = { from: "string", to: "boolean" } as any;
        const result = processValueMapping(value, valueMapping);
        expect(result).toEqual(true);
    });

    it("should convert number 1 to boolean", () => {
        const value = 1;
        const valueMapping = { from: "number", to: "boolean" } as any;
        const result = processValueMapping(value, valueMapping);
        expect(result).toEqual(true);
    });

    it("should convert boolean to string", () => {
        const value = true;
        const valueMapping = { from: "boolean", to: "string" } as any;
        const result = processValueMapping(value, valueMapping);
        expect(result).toEqual("true");
    });

    it("should convert array of strings to array of numbers", () => {
        const value = ["1", "2", "3"];
        const valueMapping = { from: "array", to: "array", fromSubtype: "string", toSubtype: "number" } as any;
        const result = processValueMapping(value, valueMapping);
        expect(result).toEqual([1, 2, 3]);
    });

});

const properties = {
    key1: {
        dataType: "string",
        name: "Key 1"
    }
}
describe("convertDataEntryValue", () => {

    it("convertDataEntryValue returns correct value for scalar", () => {
        const result = convertDataEntryValue({
            fullKey: "key1",
            value: "test",
            headersMapping: {},
            properties,
            propertiesMapping: {}
        });

        expect(result).toBe("test");
    });

    it("convertDataObjectValue returns correct object", () => {
        const result = convertDataObjectValue({
            value: { prop1: "test" },
            headersMapping: {},
            properties,
            propertiesMapping: {}
        });

        expect(result).toEqual({ prop1: "test" });
    });

    it("convertDataObjectValue processes Date object", () => {
        const mockDate = new Date();
        const result = convertDataObjectValue({
            fullKey: "key1",
            value: mockDate,
            headersMapping: {},
            properties,
            propertiesMapping: { key1: { from: "date", to: "date" } }
        });

        // Note: this expects that your processValueMapping function is working correctly
        expect(result).toEqual(mockDate);
    });

    it("convertDataEntryValue handles array correctly", () => {
        const result = convertDataEntryValue({
            fullKey: "arrayKey",
            value: ["val1", "val2"],
            headersMapping: {},
            properties,
            propertiesMapping: {}
        });

        expect(result).toEqual(["val1", "val2"]);
    });

    it("convertDataEntryValue correctly processes nested arrays", () => {
        const result = convertDataEntryValue({
            fullKey: "arrayKey",
            value: [["nested1"], ["nested2"]],
            headersMapping: {},
            properties,
            propertiesMapping: {}
        });

        expect(result).toEqual([["nested1"], ["nested2"]]);
    });

    it("convertDataEntryValue correctly processes nested arrays of strings into references", () => {
        const result = convertDataEntryValue({
            fullKey: "arrayKey",
            value: ["products/one", "products/two"],
            headersMapping: {},
            properties,
            propertiesMapping: { arrayKey: { from: "array", to: "array", fromSubtype: "string", toSubtype: "reference" } }
        });

        console.log("result", result)

        expect(result[0].path).toEqual("products")
        expect(result[0].id).toEqual("one");
        expect(result[1].path).toEqual("products")
        expect(result[1].id).toEqual("two");
    });

});
