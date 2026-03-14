import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { EntityCollection, EntitySidePanelProps } from "../src/types";
import { buildSidePanelsFromUrl } from "../src/internal/useBuildSideEntityController";

describe("buildSidePanelsFromUrl", () => {

    const mockCollections: EntityCollection[] = [
        {
            slug: "products",
            name: "Products",
            dbPath: "products",
            properties: {},
            entityViews: [{
                key: "custom_view",
                name: "Custom view",
            }],
            subcollections: () => [{
                slug: "locales",
                name: "Locales",
                dbPath: "locales",
                properties: {}
            }]
        },
        {
            slug: "experiences",
            name: "Experiences",
            dbPath: "users/J4WyZHd3DhgcWRdJaBodSkSAVuN2/experiences",
            entityViews: [{
                key: "editor",
                name: "Editor",
            }],
            properties: {}
        }
    ];

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should return side panels based on given path", () => {
        const expectedSidePanels: EntitySidePanelProps<any>[] = [
            {
                path: "products",
                entityId: "entityA",
                copy: false
            }
        ];
        const sidePanels = buildSidePanelsFromUrl("/products/entityA", mockCollections, false);
        expect(sidePanels).toEqual(expectedSidePanels);
    });

    test("should return side panels based on given path", () => {
        const expectedSidePanels: EntitySidePanelProps<any>[] = [
            {
                path: "products",
                entityId: "entityA",
                copy: false,
                selectedTab: "locales"
            }
        ];
        const sidePanels = buildSidePanelsFromUrl("/products/entityA/locales", mockCollections, false);
        expect(sidePanels).toEqual(expectedSidePanels);
    });

    test("should return side panels based on given path and newFlag", () => {
        const expectedSidePanels: EntitySidePanelProps<any>[] = [
            {
                path: "products",
                copy: false,
            }
        ];
        const sidePanels = buildSidePanelsFromUrl("products", mockCollections, true);
        expect(sidePanels).toEqual(expectedSidePanels);
    });

    test("should return side panels based on given path with custom view", () => {
        const expectedSidePanels: EntitySidePanelProps<any>[] = [
            {
                path: "products",
                entityId: "entityA",
                copy: false,
                selectedTab: "custom_view"
            }
        ];
        const sidePanels = buildSidePanelsFromUrl("/products/entityA/custom_view", mockCollections, false);
        expect(sidePanels).toEqual(expectedSidePanels);
    });

    test("should return empty array for complex paths with embedded IDs in dbPath", () => {
        // Note: Collections with dbPath containing specific IDs (like user IDs) 
        // are not matched by the URL parser since the path segments don't match
        // the collection slug patterns
        const sidePanels = buildSidePanelsFromUrl("users/J4WyZHd3DhgcWRdJaBodSkSAVuN2/experiences/pUAGjOQALls5wTwKq0sF/editor", mockCollections, false);
        expect(sidePanels).toEqual([]);
    });

});
