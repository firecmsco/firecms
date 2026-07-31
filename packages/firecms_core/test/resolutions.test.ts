import { describe, test } from "@jest/globals";
import { buildCollection, buildProperty, resolveCollection } from "../src/util";
import { PropertyBuilderProps } from "../src/types";
import * as util from "util";

const testCollection = buildCollection({
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
                                dataType: "number",
                                validation: {
                                    min: 0,
                                    max: 100
                                }
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

    test("resolveCollection merges user overrides including properties overrides into resolved collection and properties", () => {
        const myCollection = buildCollection({
            id: "my_collection",
            path: "my_collection",
            name: "My collection",
            properties: {
                callbackProp: buildProperty(({ values }) => ({
                    name: "Callback property",
                    dataType: "string"
                }))
            }
        });

        const mockUserConfigPersistence = {
            getCollectionConfig: () => ({
                properties: {
                    callbackProp: {
                        columnWidth: 250
                    }
                },
                defaultSize: "s"
            }),
            onCollectionModified: () => {}
        } as any;

        const resolved = resolveCollection({
            collection: myCollection,
            path: "my_collection",
            userConfigPersistence: mockUserConfigPersistence,
            authController: {} as any
        });

        expect(resolved.properties.callbackProp).toEqual({
            name: "Callback property",
            dataType: "string",
            columnWidth: 250,
            resolved: true,
            fromBuilder: true
        });

        expect(resolved.defaultSize).toBe("s");
    });
});

/**
 * Regression tests for https://github.com/firecmsco/firecms/issues/659
 *
 * `propertyKey` must be handed to every property builder that gets resolved,
 * for every array resolution path (`of` as a tuple, `of` as a single property
 * or builder, and `oneOf`). Builders rely on it to locate sibling values with
 * dot notation (e.g. `example.0.parent` from `example.0.child`).
 */
describe("resolutions - propertyKey passed to property builders", () => {

    /**
     * Records the props every builder invocation receives, so we can assert on
     * the exact `propertyKey`/`propertyValue` pairs and their order.
     */
    function recordingBuilder(calls: { propertyKey?: string, propertyValue?: any, index?: number }[],
                              result: any = {
                                  name: "Child",
                                  dataType: "string"
                              }) {
        // Destructuring `propertyKey` out of the typed `PropertyBuilderProps`
        // also asserts, at compile time, that it is part of the public contract.
        return buildProperty(({
                                 propertyKey,
                                 propertyValue,
                                 index
                             }: PropertyBuilderProps) => {
            calls.push({
                propertyKey,
                propertyValue,
                index
            });
            return result;
        });
    }

    function resolve(properties: any, values: any) {
        return resolveCollection({
            collection: buildCollection({
                id: "test_659",
                path: "test_659",
                name: "Test 659",
                properties
            }),
            path: "test_659",
            values,
            authController: {} as any
        });
    }

    test("a builder nested in the map of an array `of` always receives a defined propertyKey", () => {

        // This is the exact shape reported in #659: a builder inside a map,
        // inside an array, that needs to find its sibling `parent` value.
        const calls: { propertyKey?: string, propertyValue?: any }[] = [];

        const resolved = resolve({
            example: {
                name: "Example",
                dataType: "array",
                of: {
                    name: "Entry",
                    dataType: "map",
                    properties: {
                        parent: {
                            name: "Parent",
                            dataType: "string"
                        },
                        child: recordingBuilder(calls)
                    }
                }
            }
        }, {
            example: [
                { parent: "first" },
                { parent: "second" }
            ]
        });

        // The bug: the `of` template resolution used to invoke the builder with
        // `propertyKey: undefined`.
        expect(calls.map(c => c.propertyKey)).not.toContain(undefined);

        // Two per-index resolutions (one per array element), then the single
        // `of` template resolution.
        expect(calls.map(c => c.propertyKey)).toEqual([
            "example.0.child",
            "example.1.child",
            "example.child"
        ]);

        // A builder can therefore always derive its siblings' paths.
        const siblingPaths = calls.map(c => [...c.propertyKey!.split(".").slice(0, -1), "parent"].join("."));
        expect(siblingPaths).toEqual(["example.0.parent", "example.1.parent", "example.parent"]);

        // The resolved collection still exposes both the `of` template and the
        // per-index resolved properties.
        const exampleProperty = resolved.properties.example as any;
        expect(exampleProperty.of.properties.child.dataType).toEqual("string");
        expect(exampleProperty.resolvedProperties).toHaveLength(2);
        expect(exampleProperty.resolvedProperties[0].properties.child.dataType).toEqual("string");
    });

    test("a builder used directly as an array `of` receives a defined propertyKey", () => {

        const calls: { propertyKey?: string, propertyValue?: any, index?: number }[] = [];

        resolve({
            example: {
                name: "Example",
                dataType: "array",
                of: recordingBuilder(calls)
            }
        }, {
            example: ["first", "second"]
        });

        expect(calls.map(c => c.propertyKey)).not.toContain(undefined);
        expect(calls).toEqual([
            {
                propertyKey: "example.0",
                propertyValue: "first",
                index: 0
            },
            {
                propertyKey: "example.1",
                propertyValue: "second",
                index: 1
            },
            // The `of` template is not tied to any element, so it resolves
            // against the array property's own key. `propertyValue` is
            // consequently the whole array.
            {
                propertyKey: "example",
                propertyValue: ["first", "second"],
                index: undefined
            }
        ]);
    });

    test("the `of` template builder is still resolved when the array has no value", () => {

        const calls: { propertyKey?: string, propertyValue?: any }[] = [];

        resolve({
            example: {
                name: "Example",
                dataType: "array",
                of: recordingBuilder(calls)
            }
        }, {});

        // No elements, so only the `of` template resolution happens.
        expect(calls).toEqual([
            {
                propertyKey: "example",
                propertyValue: undefined,
                index: undefined
            }
        ]);
    });

    test("a tuple `of` passes index qualified property keys", () => {

        const calls: { propertyKey?: string, propertyValue?: any, index?: number }[] = [];

        resolve({
            example: {
                name: "Example",
                dataType: "array",
                of: [
                    {
                        name: "Plain",
                        dataType: "string"
                    },
                    recordingBuilder(calls)
                ]
            }
        }, {
            example: ["plain value", "builder value"]
        });

        expect(calls).toEqual([
            {
                propertyKey: "example.1",
                propertyValue: "builder value",
                index: 1
            }
        ]);
    });

    test("`oneOf` passes index qualified property keys per element and the array key for the templates", () => {

        const calls: { propertyKey?: string, propertyValue?: any }[] = [];

        resolve({
            example: {
                name: "Example",
                dataType: "array",
                oneOf: {
                    properties: {
                        alpha: recordingBuilder(calls),
                        beta: {
                            name: "Beta",
                            dataType: "number"
                        }
                    }
                }
            }
        }, {
            example: [
                {
                    type: "alpha",
                    value: "first"
                },
                {
                    type: "beta",
                    value: 2
                }
            ]
        });

        expect(calls.map(c => c.propertyKey)).toEqual([
            // Per-element resolution of the `alpha` branch.
            "example.0",
            // Template resolution of `oneOf.properties`, based on the array key.
            "example.alpha"
        ]);
    });

    test("resolving non builder properties is unaffected", () => {

        const resolved = resolve({
            example: {
                name: "Example",
                dataType: "array",
                of: {
                    name: "Entry",
                    dataType: "map",
                    properties: {
                        parent: {
                            name: "Parent",
                            dataType: "string"
                        }
                    }
                }
            }
        }, {
            example: [{ parent: "first" }]
        });

        const expectedOf = {
            name: "Entry",
            dataType: "map",
            resolved: true,
            fromBuilder: false,
            properties: {
                parent: {
                    name: "Parent",
                    dataType: "string",
                    resolved: true,
                    fromBuilder: false
                }
            }
        };

        expect(resolved.properties.example).toEqual({
            name: "Example",
            dataType: "array",
            resolved: true,
            fromBuilder: false,
            of: expectedOf,
            resolvedProperties: [expectedOf]
        });
    });

    test("a builder resolved as a plain (non array) property still receives its propertyKey", () => {

        const calls: { propertyKey?: string, propertyValue?: any }[] = [];

        resolve({
            plain: recordingBuilder(calls),
            nested: {
                name: "Nested",
                dataType: "map",
                properties: {
                    child: recordingBuilder(calls)
                }
            }
        }, {
            plain: "plain value",
            nested: { child: "nested value" }
        });

        expect(calls).toEqual([
            {
                propertyKey: "plain",
                propertyValue: "plain value",
                index: undefined
            },
            {
                propertyKey: "nested.child",
                propertyValue: "nested value",
                index: undefined
            }
        ]);
    });
});
