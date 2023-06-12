import { EntityCollection, EntitySidePanelProps } from "../types";
import { buildSidePanelsFromUrl } from "../core/internal/useBuildSideEntityController";

describe('buildSidePanelsFromUrl', () => {

    const mockCollections: EntityCollection[] = [
        {
            name: "Products",
            path: "/products",
            alias: "collectionA",
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
            name: "Blog",
            path: "/blog",
            properties: {}
        }
    ];

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return side panels based on given path', () => {
        const expectedSidePanels: EntitySidePanelProps<any>[] = [
            {
                path: "/products/entityA",
                entityId: "entityA",
                copy: false,
                selectedSubPath: "/blog"
            }
        ];
        const sidePanels = buildSidePanelsFromUrl("/products/entityA/blog", mockCollections, false);
        expect(sidePanels).toEqual(expectedSidePanels);
    });

    test('should return side panels based on given path and newFlag', () => {
        const expectedSidePanels: EntitySidePanelProps<any>[] = [
            {
                path: "/products/entityA",
                entityId: "entityA",
                copy: false,
                selectedSubPath: "/blog"
            },
            {
                path: "/blog",
                copy: false,
            }
        ];
        const sidePanels = buildSidePanelsFromUrl("/products/entityA/blog", mockCollections, true);
        expect(sidePanels).toEqual(expectedSidePanels);
    });

    test('should return side panels based on given path with custom view', () => {
        const expectedSidePanels: EntitySidePanelProps<any>[] = [
            {
                path: "/products",
                entityId: "entityA",
                copy: false,
                selectedSubPath: "/custom_view"
            }
        ];
        const sidePanels = buildSidePanelsFromUrl("/products/entityA/custom_view", mockCollections, false);
        expect(sidePanels).toEqual(expectedSidePanels);
    });

    test('should return side panels based on given path with custom view and newFlag', () => {
        const expectedSidePanels: EntitySidePanelProps<any>[] = [
            {
                path: "/products",
                entityId: "entityA",
                copy: false,
                selectedSubPath: "/custom_view"
            },
            {
                path: "/products",
                copy: false,
            }
        ];
        const sidePanels = buildSidePanelsFromUrl("/products/entityA/custom_view", mockCollections, true);
        expect(sidePanels).toEqual(expectedSidePanels);
    });

    test('should return empty side panels when provided path is empty', () => {
        const sidePanels = buildSidePanelsFromUrl("", mockCollections, false);
        expect(sidePanels).toEqual([]);
    });

    test('should handle case when first collection is handled by main navigation', () => {
        const expectedSidePanels: EntitySidePanelProps<any>[] = [
            {
                path: "/products/entityA",
                entityId: "entityA",
                copy: false,
                selectedSubPath: "/products"
            }
        ];
        const sidePanels = buildSidePanelsFromUrl("/products/entityA/products/entityB", mockCollections, false);
        expect(sidePanels).toEqual(expectedSidePanels);
    });

});
