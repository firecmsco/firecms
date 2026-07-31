import { describe, expect, test } from "@jest/globals";
import { buildCollection, getEntityImagePreviewPropertyKey, resolveCollection } from "../src/util";

describe("getEntityImagePreviewPropertyKey", () => {

    test("uses the explicitly configured imageProperty when it exists", () => {
        const collection = buildCollection({
            id: "products",
            path: "products",
            name: "Products",
            imageProperty: "coverPhoto",
            properties: {
                name: {
                    name: "Name",
                    dataType: "string"
                },
                thumbnail: {
                    name: "Thumbnail",
                    dataType: "string",
                    storage: {
                        storagePath: "images",
                        acceptedFiles: ["image/*"]
                    }
                },
                coverPhoto: {
                    name: "Cover photo",
                    dataType: "string",
                    storage: {
                        storagePath: "images",
                        acceptedFiles: ["image/*"]
                    }
                }
            }
        });

        const resolvedCollection = resolveCollection({
            collection,
            path: "products",
            authController: {} as any
        });

        // Even though "thumbnail" would be auto-detected first, the explicit
        // imageProperty configuration takes precedence.
        expect(getEntityImagePreviewPropertyKey(resolvedCollection)).toEqual("coverPhoto");
    });

    test("falls back to auto-detection when imageProperty is not set", () => {
        const collection = buildCollection({
            id: "products",
            path: "products",
            name: "Products",
            properties: {
                name: {
                    name: "Name",
                    dataType: "string"
                },
                thumbnail: {
                    name: "Thumbnail",
                    dataType: "string",
                    storage: {
                        storagePath: "images",
                        acceptedFiles: ["image/*"]
                    }
                }
            }
        });

        const resolvedCollection = resolveCollection({
            collection,
            path: "products",
            authController: {} as any
        });

        expect(getEntityImagePreviewPropertyKey(resolvedCollection)).toEqual("thumbnail");
    });

    test("falls back to auto-detection when imageProperty references a missing property", () => {
        const collection = buildCollection({
            id: "products",
            path: "products",
            name: "Products",
            imageProperty: "doesNotExist",
            properties: {
                name: {
                    name: "Name",
                    dataType: "string"
                },
                thumbnail: {
                    name: "Thumbnail",
                    dataType: "string",
                    storage: {
                        storagePath: "images",
                        acceptedFiles: ["image/*"]
                    }
                }
            }
        });

        const resolvedCollection = resolveCollection({
            collection,
            path: "products",
            authController: {} as any
        });

        expect(getEntityImagePreviewPropertyKey(resolvedCollection)).toEqual("thumbnail");
    });

    test("returns undefined when there is no image property at all", () => {
        const collection = buildCollection({
            id: "products",
            path: "products",
            name: "Products",
            properties: {
                name: {
                    name: "Name",
                    dataType: "string"
                }
            }
        });

        const resolvedCollection = resolveCollection({
            collection,
            path: "products",
            authController: {} as any
        });

        expect(getEntityImagePreviewPropertyKey(resolvedCollection)).toBeUndefined();
    });
});
