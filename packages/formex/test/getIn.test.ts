import { describe, expect, test } from "@jest/globals";
import { getIn } from "../src";

describe("getIn", () => {

    test("retrieves value using dot notation", () => {
        const obj = {
            user: {
                name: "John Doe",
                age: 30,
                details: {
                    email: "john@example.com"
                }
            }
        };
        const key = "user.details.email";
        const result = getIn(obj, key);
        expect(result).toEqual("john@example.com");
    });

    test("retrieves value using array notation", () => {
        const obj = {
            users: ["John", "Jane", "Doe"]
        };
        const key = ["users", "1"]; // Accessing "Jane"
        const result = getIn(obj, key);
        expect(result).toEqual("Jane");
    });

    test("retrieves value using array notation", () => {
        const obj = {
            users: ["John", "Jane", "Doe"]
        };
        const key = "users.1"; // Accessing "Jane"
        const result = getIn(obj, key);
        expect(result).toEqual("Jane");
    });

    test("returns default value when path does not exist", () => {
        const obj = {
            user: {
                name: "John"
            }
        };
        const key = "user.age";
        const defaultValue = "N/A";
        const result = getIn(obj, key, defaultValue);
        expect(result).toEqual(defaultValue);
    });

    test("returns default value when path is only partially in object", () => {
        const obj = {
            user: {
                name: "John"
            }
        };
        const key = "user.profile.picture";
        const defaultValue = "no-picture.png";
        const result = getIn(obj, key, defaultValue);
        expect(result).toEqual(defaultValue);
    });

    test("handles empty path", () => {
        const obj = {
            key: "value"
        };
        const key = "";
        const result = getIn(obj, key, "default");
        expect(result).toEqual("default");
    });

    test("handles undefined object", () => {
        const obj = undefined;
        const key = "some.key";
        const defaultValue = "default";
        const result = getIn(obj, key, defaultValue);
        expect(result).toEqual(defaultValue);
    });

    test("array dot notation", () => {
        const obj = {
            mainSaturation: [
                {
                    type: "oneNum"
                }
            ]
        };
        const key = "mainSaturation.0";
        const result = getIn(obj, key);
        expect(result).toEqual({
                type: "oneNum"
            }
        );
    });
});
