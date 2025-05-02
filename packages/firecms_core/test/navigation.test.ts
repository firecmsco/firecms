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
                    dataType: "string",
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
                    dataType: "number"
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
                    dataType: "string"
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


    it("Should handle correctly nested subcollections with a deep number of nesting", () => {
        const fourCollection = buildCollection({
            id: "four",
            path: "four_path",
            name: "Level Four",
            properties: {
                title: buildProperty({
                    dataType: "string",
                    name: "Title"
                })
            }
        });

        // Create a deeply nested collection structure
        const threeCollection = buildCollection({
            id: "three",
            path: "three",
            name: "Level Three",
            properties: {
                title: buildProperty({
                    dataType: "string",
                    name: "Title"
                })
            },
            subcollections: [fourCollection]
        });

        const twoCollection = buildCollection({
            id: "two",
            path: "two_path",
            name: "Level Two",
            properties: {
                title: buildProperty({
                    dataType: "string",
                    name: "Title"
                })
            },
            subcollections: [threeCollection]
        });

        const oneCollection = buildCollection({
            id: "one",
            path: "one",
            name: "Level One",
            properties: {
                title: buildProperty({
                    dataType: "string",
                    name: "Title"
                })
            },
            subcollections: [twoCollection]
        });

        const testCollections = [oneCollection];

        expect(resolveCollectionPathIds("one/KDz0nueQVSowWFXjuOCN/two", testCollections))
            .toEqual("one/KDz0nueQVSowWFXjuOCN/two_path");
        expect(resolveCollectionPathIds("one/KDz0nueQVSowWFXjuOCN/two/yQKoQjG4nsntOZVvwmrS/three", testCollections))
            .toEqual("one/KDz0nueQVSowWFXjuOCN/two_path/yQKoQjG4nsntOZVvwmrS/three");
        expect(resolveCollectionPathIds("one/KDz0nueQVSowWFXjuOCN/two/yQKoQjG4nsntOZVvwmrS/three/123/four", testCollections))
            .toEqual("one/KDz0nueQVSowWFXjuOCN/two_path/yQKoQjG4nsntOZVvwmrS/three/123/four_path");
        expect(resolveCollectionPathIds("one/KDz0nueQVSowWFXjuOCN/two/yQKoQjG4nsntOZVvwmrS/three/123/four/12345/five", testCollections))
            .toEqual("one/KDz0nueQVSowWFXjuOCN/two_path/yQKoQjG4nsntOZVvwmrS/three/123/four_path/12345/five");

    });

});
