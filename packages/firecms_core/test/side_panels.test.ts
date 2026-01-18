import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { EntityCollection, EntitySidePanelProps } from "../src/types";
import { buildSidePanelsFromUrl } from "../src/internal/useBuildSideEntityController";

describe("buildSidePanelsFromUrl", () => {

    const mockCollections: EntityCollection[] = [
        {
            id: "products",
            name: "Products",
            path: "products",
            properties: {},
            entityViews: [{
                key: "custom_view",
                name: "Custom view",
            }],
            subcollections: [{
                id: "locales",
                name: "Locales",
                path: "locales",
                properties: {}
            }]
        },
        {
            id: "experiences",
            name: "Experiences",
            path: "users/J4WyZHd3DhgcWRdJaBodSkSAVuN2/experiences",
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
                fullIdPath: "products",
                entityId: "entityA",
                copy: false,
                width: undefined
            }
        ];
        const sidePanels = buildSidePanelsFromUrl("/products/entityA", mockCollections, false);
        expect(sidePanels).toEqual(expectedSidePanels);
    });

    test("should return side panels based on given path with subcollection", () => {
        const expectedSidePanels: EntitySidePanelProps<any>[] = [
            {
                path: "products",
                fullIdPath: "products",
                entityId: "entityA",
                copy: false,
                selectedTab: "locales",
                width: undefined
            }
        ];
        const sidePanels = buildSidePanelsFromUrl("/products/entityA/locales", mockCollections, false);
        expect(sidePanels).toEqual(expectedSidePanels);
    });

    test("should return side panels based on given path and newFlag", () => {
        const expectedSidePanels: EntitySidePanelProps<any>[] = [
            {
                path: "products",
                fullIdPath: "products",
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
                fullIdPath: "products",
                entityId: "entityA",
                copy: false,
                selectedTab: "custom_view",
                width: undefined
            }
        ];
        const sidePanels = buildSidePanelsFromUrl("/products/entityA/custom_view", mockCollections, false);
        expect(sidePanels).toEqual(expectedSidePanels);
    });

    test("should return side panels based on complex given path with custom view", () => {
        const expectedSidePanels: EntitySidePanelProps<any>[] = [
            {
                path: "users/J4WyZHd3DhgcWRdJaBodSkSAVuN2/experiences",
                fullIdPath: "experiences",
                entityId: "pUAGjOQALls5wTwKq0sF",
                copy: false,
                selectedTab: "editor",
                width: undefined
            }
        ];
        const sidePanels = buildSidePanelsFromUrl("users/J4WyZHd3DhgcWRdJaBodSkSAVuN2/experiences/pUAGjOQALls5wTwKq0sF/editor", mockCollections, false);
        expect(sidePanels).toEqual(expectedSidePanels);
    });

});
