jest.mock("@tiptap/extension-placeholder", () => ({
    configure: jest.fn(() => ({}))
}));
jest.mock("@tiptap/extension-horizontal-rule", () => ({
    configure: jest.fn(() => ({})),
    extend: jest.fn(() => ({ configure: jest.fn(() => ({})) }))
}));
jest.mock("@tiptap/extension-link", () => ({
    configure: jest.fn(() => ({})),
    extend: jest.fn(() => ({}))
}));

jest.mock("@tiptap/starter-kit", () => ({
    configure: jest.fn(() => ({}))
}));

jest.mock("@tiptap/extension-ordered-list", () => ({
    configure: jest.fn(() => ({}))
}));

jest.mock("@tiptap/extension-bullet-list", () => ({
    configure: jest.fn(() => ({}))
}));

jest.mock("@tiptap/extension-list-item", () => ({
    configure: jest.fn(() => ({}))
}));

jest.mock("@tiptap/extension-code-block", () => ({
    configure: jest.fn(() => ({}))
}));

jest.mock("@tiptap/extension-blockquote", () => ({
    configure: jest.fn(() => ({}))
}));

jest.mock("@tiptap/extension-code", () => ({
    configure: jest.fn(() => ({}))
}));

jest.mock("@tiptap/extension-document", () => ({
    extend: jest.fn(() => ({}))
}));

import { expect, it } from "@jest/globals";
import { siteConfig } from "./test_site_config";
import { EntityCollection } from "../src/types";
import { buildCollection, buildProperty, getCollectionByPathOrId, resolveCollectionPathIds } from "../src";
import { getNavigationEntriesFromPath } from "../src/util/navigation_from_path";

const collections = siteConfig.collections as EntityCollection[];

describe("Resolving paths test", () => {
    it("collection view matches ok", () => {

        const collectionViewFromPath = getCollectionByPathOrId("products", collections);
        expect(
            collectionViewFromPath && collectionViewFromPath.path
        ).toEqual("products");

        const collectionViewFromPath1 = getCollectionByPathOrId("products/pid/locales", collections);
        expect(
            collectionViewFromPath1 && collectionViewFromPath1.path
        ).toEqual("locales");

        const collectionViewFromPath2 = getCollectionByPathOrId("sites/es/products", collections);
        expect(
            collectionViewFromPath2 && collectionViewFromPath2.path
        ).toEqual("sites/es/products");

        const collectionViewFromPath3 = getCollectionByPathOrId("sites/es/products/pid/locales", collections);
        expect(
            collectionViewFromPath3 && collectionViewFromPath3.path
        ).toEqual("locales");

        expect(
            () => getCollectionByPathOrId("products/pid", collections)
        ).toThrow(
            "Collection paths must have an odd number of segments: products/pid"
        );

        expect(
            getCollectionByPathOrId("products", [])
        ).toEqual(undefined);

        const collectionViewFromPath10 = getCollectionByPathOrId("products/id/subcollection_inline", collections);
        expect(
            collectionViewFromPath10 && collectionViewFromPath10.path
        ).toEqual("products/id/subcollection_inline");

    });

    it("build entity collection array", () => {

        const navigationEntries = getNavigationEntriesFromPath({
            path: "products/pid",
            collections: collections
        });
        console.log(navigationEntries);
        // expect(
        //     navigationEntries.map((collection) => collection.relativePath)
        // ).toEqual(["products", "locales"]);
    });

    it("Custom view internal", () => {

        const navigationEntries = getNavigationEntriesFromPath({
            path: "products/pid/custom_view",
            collections: collections
        });
        console.log(navigationEntries);
        expect(navigationEntries.length).toEqual(3);
    });

    it("build entity collection array 2", () => {

        const navigationEntries = getNavigationEntriesFromPath({
            path: "products/pid/locales/yep",
            collections: collections
        });
        console.log(navigationEntries);
        expect(navigationEntries.length).toEqual(4);
    });

    it("Test aliases", () => {

        const resolvedPath = resolveCollectionPathIds("u", collections);
        expect(resolvedPath).toEqual("users");

        const resolvedPath2 = resolveCollectionPathIds("u/123/products", collections);
        expect(resolvedPath2).toEqual("users/123/products");

        const resolvedPath3 = resolveCollectionPathIds("u/123/p", collections);
        expect(resolvedPath3).toEqual("users/123/products");

        const resolvedPath4 = resolveCollectionPathIds("users/123/p", collections);
        expect(resolvedPath4).toEqual("users/123/products");

        const resolvedPath5 = resolveCollectionPathIds("products/id/subcollection_inline", collections);
        expect(resolvedPath5).toEqual("products/id/subcollection_inline");
    });

    it("should correctly resolve subcollection with different id and path", () => {
        // Simplified locale collection
        const jointLocaleCollection = buildCollection({
            id: "medico_v2_0_0_joint_locales",
            path: "locales",
            name: "Translations",
            properties: {
                name: buildProperty({
                    type: "string",
                    name: "Name"
                })
            }
        });

        // Simplified joint movements collection
        const jointMovementsCollection = buildCollection({
            id: "medico_v2_0_0_joint_movements",
            path: "movements",
            name: "Joint movements",
            properties: {
                reference_value_min: buildProperty({
                    name: "Reference value min",
                    type: "number"
                })
            },
            subcollections: [jointLocaleCollection]
        });

        // Simplified joints collection
        const jointsCollection = buildCollection({
            id: "medico_v2_0_0_joints",
            path: "medico/v2.0.0/joints",
            name: "Joint",
            properties: {
                latin_name: buildProperty({
                    name: "Latin name",
                    type: "string"
                })
            },
            subcollections: [jointMovementsCollection, jointLocaleCollection]
        });

        const collections = [jointsCollection];

        // Test path resolution for joint movements subcollection
        const result = resolveCollectionPathIds(
            "medico_v2_0_0_joints/cervical_spine/medico_v2_0_0_joint_movements",
            collections
        );

        expect(result).toEqual("medico/v2.0.0/joints/cervical_spine/movements");

        // Alternative test using path instead of ID for the parent collection
        const result2 = resolveCollectionPathIds(
            "medico/v2.0.0/joints/cervical_spine/medico_v2_0_0_joint_movements",
            collections
        );

        expect(result2).toEqual("medico/v2.0.0/joints/cervical_spine/movements");
    });

    it("should correctly resolve nested subcollection path with different id and path", () => {
        // Define the nested subcollection structure
        const subSubCollection = buildCollection({
            id: "sub", // ID used in the input path
            path: "sub_path", // Actual path segment
            name: "Sub Sub Collection",
            properties: {}
        });

        const localesCollection = buildCollection({
            id: "product_locales", // ID used in the input path
            path: "locales", // Actual path segment
            name: "Locales",
            properties: {},
            subcollections: [subSubCollection]
        });

        const productsCollection = buildCollection({
            id: "products",
            path: "products",
            name: "Products",
            properties: {},
            subcollections: [localesCollection]
        });

        const testCollections = [productsCollection];

        const inputPath = "products/B000P0MDMS/product_locales/vvPRXAzANSce8o24TbIC/sub";
        const expectedPath = "products/B000P0MDMS/locales/vvPRXAzANSce8o24TbIC/sub_path";

        const resolvedPath = resolveCollectionPathIds(inputPath, testCollections);

        expect(resolvedPath).toEqual(expectedPath);
    });

});
