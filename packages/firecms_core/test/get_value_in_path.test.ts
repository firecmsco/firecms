import { describe, expect, it } from "@jest/globals";
import { getValueInPath } from "../src";

describe("getValueInPath", () => {
    const obj = {
        name: "John Doe",
        address: {
            city: "New York",
            zip: "10001"
        },
        scores: [98, 99, 100],
        payments: [
            { month: "Jan", amount: 100 },
            { month: "Feb", amount: 200 },
        ]
    };

    it("should return the correct value for simple paths", () => {
        expect(getValueInPath(obj, "name")).toBe("John Doe");
    });

    it("should return the correct value for nested paths", () => {
        expect(getValueInPath(obj, "address.city")).toBe("New York");
    });

    it("should return the correct value for array index paths", () => {
        expect(getValueInPath(obj, "scores[1]")).toBe(99);
    });

    it("should return the correct value for nested paths with array index", () => {
        expect(getValueInPath(obj, "payments[0].month")).toBe("Jan");
    });

    it("should return undefined if the path does not exist", () => {
        expect(getValueInPath(obj, "undefined.slug")).toBeUndefined();
    });

    it("should return undefined if the object is undefined", () => {
        expect(getValueInPath(undefined, "name")).toBeUndefined();
    });
});
