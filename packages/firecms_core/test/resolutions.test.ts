import { describe, test } from "@jest/globals";
import { buildCollection, buildProperty, resolveCollection } from "../src/util";
import * as util from "util";

const testCollection = buildCollection({
    slug: "test_entity",
    dbPath: "test_entity",
    customId: false,
    name: "Test entities",
    properties: {
        mainSaturation: {
            name: "Main saturation",
            description: "Saturation applied to all colors when there is no saturation on color applied",
            type: "array",
            of: {
                type: "map",
                properties: {
                    type: {
                        name: "Type",
                        type: "string",
                        enumValues: {
                            oneNum: "Saturation without range",
                            fromTo: "Saturation available range",
                        }
                    },
                    value: buildProperty(({
                                              values,
                                              index
                                          }) => {
                        if (!index) {
                            return null;
                        }
                        const parentValue = values.mainSaturation?.[index]?.type;
                        if (parentValue === "oneNum") {
                            return ({
                                name: "Saturation",
                                type: "number",
                                validation: {
                                    min: 0,
                                    max: 100
                                }
                            })
                        } else if (parentValue === "fromTo") {
                            return ({
                                    name: "Saturation available range",
                                    type: "map",
                                    properties: {
                                        from: {
                                            name: "From",
                                            type: "number",
                                            validation: {
                                                min: 0,
                                                max: 100
                                            }
                                        },
                                        to: {
                                            name: "To",
                                            type: "number",
                                            clearable: true,
                                            validation: {
                                                min: 0,
                                                max: 100
                                            }
                                        },
                                    }
                                }
                            )
                        } else {
                            return {
                                type: "string",
                                name: "Type",
                                disabled: { hidden: true }
                            };
                        }
                    })
                }
            },
        },
    }
});

describe("resolutions", () => {

    test("retrieves value using dot notation", () => {

        const values = {
            mainSaturation: [
                {
                    type: "oneNum",
                    value: 10
                },
                {
                    type: "fromTo",
                    value: {
                        from: 0,
                        to: 100
                    }
                }
            ]
        };

        const resolvedCollection = resolveCollection({
            collection: testCollection,
            path: "ignore",
            values,
            authController: {} as any
        });

        console.log("resolvedCollection", util.inspect(resolvedCollection, false, null, true));

        // expect(getValueInPath(obj, "email")).toEqual("jesus.riley@example.com");
        // expect(getValueInPath(obj, "picture.medium")).toEqual("https://randomuser.me/api/portraits/med/men/17.jpg");
        // expect(getValueInPath(obj, "location.timezone.offset")).toEqual("+4:00");
        // expect(getValueInPath(obj, "location.street.number")).toEqual(3570);
        // expect(getValueInPath(obj, "location.street.nope")).toEqual(undefined);
        // expect(getValueInPath(obj, "nope")).toEqual(undefined);
        // expect(getValueInPath(obj, "nope.nope")).toEqual(undefined);
        // expect(getValueInPath(obj, "nope.nope.nope.nope")).toEqual(undefined);

    });
});
