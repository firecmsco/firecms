import { it } from "@jest/globals";
import { buildCollection, resolveCollection } from "../src";

import util from "util";

export const testCollection = buildCollection({
    id: "test_entity",
    path: "test_entity",
    customId: false,
    name: "Test entities",
    properties: {
        mainSaturation: {
            name: "Main saturation",
            description: "Saturation applied to all colors when there is no saturation on color applied",
            dataType: "array",
            of: {
                dataType: "map",
                properties: {
                    type: {
                        name: "Type",
                        dataType: "string",
                        enumValues: {
                            oneNum: "Saturation without range",
                            fromTo: "Saturation available range",
                        }
                    },
                    value: ({ propertyValue, values, index }) => {
                        if (!index) {
                            return null;
                        }
                        const parentValue = values.mainSaturation?.[index]?.type;
                        console.log("callback propertyValue", propertyValue);
                        console.log("callback parentValue", parentValue);
                        if (parentValue === "oneNum") {
                            return ({
                                name: "Saturation",
                                dataType: "number",
                                validation: { min: 0, max: 100 }
                            })
                        } else if (parentValue === "fromTo") {
                            return ({
                                    name: "Saturation available range",
                                    dataType: "map",
                                    properties: {
                                        from: {
                                            name: "From",
                                            dataType: "number",
                                            validation: {
                                                min: 0,
                                                max: 100
                                            }
                                        },
                                        to: {
                                            name: "To",
                                            dataType: "number",
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
                                dataType: "string",
                                name: "Type",
                                disabled: { hidden: true }
                            };
                        }
                    }
                }
            },
        },
    }
});

it("Test path access in object", () => {

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
        values
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
