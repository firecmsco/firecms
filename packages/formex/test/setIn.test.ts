import { describe, expect, test } from "@jest/globals";
import { setIn } from "../src";

describe("setIn", () => {

    test("setIn preserved false values", () => {
        const objectWithFalseValues = {
            id: "abc",
            published: false,
            age: 33
        };

        const {
            id,
            ...rest
        } = objectWithFalseValues;

        const target = {
            name: "John Doe",
        }
        const res = setIn(target, "user", rest);
        expect(res).toEqual({
            name: "John Doe",
            user: {
                published: false,
                age: 33
            }
        });
    });

});
