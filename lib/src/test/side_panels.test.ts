import { EntityCollection, EntitySidePanelProps } from "../types";
import { buildSidePanelsFromUrl } from "../core/internal/useBuildSideEntityController";

describe('buildSidePanelsFromUrl', () => {

    const mockCollections: EntityCollection[] = [
        {
            name: "Products",
            path: "products",
            properties: {},
            views: [{
                path: "custom_view",
                name: "Custom view",
            }],
            subcollections: [{
                name: "Locales",
                path: "locales",
                properties: {}
            }]
        },
        {
            name: "Experiences",
            path: "users/J4WyZHd3DhgcWRdJaBodSkSAVuN2/experiences",
            views: [{
                path: "editor",
                name: "Editor",
            }],
            properties: {}
        }
    ];

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return side panels based on given path', () => {
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

    test('should return side panels based on given path', () => {
        const expectedSidePanels: EntitySidePanelProps<any>[] = [
            {
                path: "products",
                entityId: "entityA",
                copy: false,
                selectedSubPath: "locales"
            }
        ];
        const sidePanels = buildSidePanelsFromUrl("/products/entityA/locales", mockCollections, false);
        expect(sidePanels).toEqual(expectedSidePanels);
    });

    test('should return side panels based on given path and newFlag', () => {
        const expectedSidePanels: EntitySidePanelProps<any>[] = [
            {
                path: "products",
                copy: false,
            }
        ];
        const sidePanels = buildSidePanelsFromUrl("products", mockCollections, true);
        expect(sidePanels).toEqual(expectedSidePanels);
    });

    test('should return side panels based on given path with custom view', () => {
        const expectedSidePanels: EntitySidePanelProps<any>[] = [
            {
                path: "products",
                entityId: "entityA",
                copy: false,
                selectedSubPath: "custom_view"
            }
        ];
        const sidePanels = buildSidePanelsFromUrl("/products/entityA/custom_view", mockCollections, false);
        expect(sidePanels).toEqual(expectedSidePanels);
    });

    test('should return side panels based on complex given path with custom view', () => {
        const expectedSidePanels: EntitySidePanelProps<any>[] = [
            {
                path: "users/J4WyZHd3DhgcWRdJaBodSkSAVuN2/experiences",
                entityId: "pUAGjOQALls5wTwKq0sF",
                copy: false,
                selectedSubPath: "editor"
            }
        ];
        const sidePanels = buildSidePanelsFromUrl("users/J4WyZHd3DhgcWRdJaBodSkSAVuN2/experiences/pUAGjOQALls5wTwKq0sF/editor", mockCollections, false);
        expect(sidePanels).toEqual(expectedSidePanels);
    });


});
