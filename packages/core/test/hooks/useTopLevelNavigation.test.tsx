/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { useTopLevelNavigation } from "../../src/hooks/navigation/useTopLevelNavigation";
import { CMSUrlController, CollectionRegistryController, EntityCollection, NavigationResult } from "@rebasepro/types";
import { CollectionRegistry } from "@rebasepro/common";
import { jest } from "@jest/globals";
import { deepEqual } from "fast-equals";

describe("useTopLevelNavigation", () => {

    const mockCmsUrlController: CMSUrlController = {
        buildUrlCollectionPath: (path: string) => `/c/${path}`,
        buildCMSUrlPath: (path: string) => `/${path}`,
        basePath: "/",
        baseCollectionPath: "/c",
    } as any;

    const mockCollectionRegistryController: CollectionRegistryController<any> & { collectionRegistryRef: React.MutableRefObject<CollectionRegistry> } = {
        collectionRegistryRef: { current: new CollectionRegistry() },
        getCollection: jest.fn(),
        getCollections: jest.fn(),
    } as any;

    const collections: EntityCollection[] = [
        { id: "test", name: "Test Collection", path: "test", slug: "test", group: "My Group" }
    ];

    it("should return undefined if collections and views are not resolved", () => {
        const { result } = renderHook(() => useTopLevelNavigation({
            collections: [],
            views: undefined,
            adminViews: undefined,
            cmsUrlController: mockCmsUrlController,
            collectionRegistryController: mockCollectionRegistryController
        }));

        expect(result.current.topLevelNavigation).toBeUndefined();
    });

    it("should compute navigation entries correctly", () => {
        const { result } = renderHook(() => useTopLevelNavigation({
            collections,
            views: [],
            adminViews: [],
            cmsUrlController: mockCmsUrlController,
            collectionRegistryController: mockCollectionRegistryController
        }));

        const nav = result.current.topLevelNavigation as NavigationResult;
        expect(nav).toBeDefined();
        expect(nav.navigationEntries).toHaveLength(1);
        expect(nav.navigationEntries[0].id).toBe("collection:test");
        expect(nav.navigationEntries[0].url).toBe("/c/test");
        expect(nav.groups).toContain("My Group");
    });

    it("should hide navigation entries with hideFromNavigation = true", () => {
        const { result } = renderHook(() => useTopLevelNavigation({
            collections: [
                ...collections,
                { id: "hidden", name: "Hidden", path: "hidden", slug: "hidden", hideFromNavigation: true }
            ],
            views: [],
            adminViews: [],
            cmsUrlController: mockCmsUrlController,
            collectionRegistryController: mockCollectionRegistryController
        }));

        const nav = result.current.topLevelNavigation as NavigationResult;
        expect(nav.navigationEntries).toHaveLength(1);
        expect(nav.navigationEntries.find(e => e.id === "collection:hidden")).toBeUndefined();
    });

    it("should preserve deep equality (stable reference) when inputs functionally match", () => {
        let currentCollections = [...collections];

        const { result, rerender } = renderHook(() => useTopLevelNavigation({
            collections: currentCollections,
            views: [],
            adminViews: [],
            cmsUrlController: mockCmsUrlController,
            collectionRegistryController: mockCollectionRegistryController,
            // Pass an unstable array reference which would normally break useMemo
            plugins: []
        }));

        const nav1 = result.current.topLevelNavigation;

        // Force a re-render with functionally identical but referentially different props
        currentCollections = [...collections];
        rerender();

        const nav2 = result.current.topLevelNavigation;

        // Strict object equality check
        expect(nav1).toBe(nav2);
    });

    it("should break deep equality when computed result actually changes", () => {
        let currentCollections = [...collections];

        const { result, rerender } = renderHook((props) => useTopLevelNavigation(props), {
            initialProps: {
                collections: currentCollections,
                views: [],
                adminViews: [],
                cmsUrlController: mockCmsUrlController,
                collectionRegistryController: mockCollectionRegistryController,
            }
        });

        const nav1 = result.current.topLevelNavigation;

        // Force a re-render with functionally different props
        rerender({
            collections: [...collections, { id: "new", name: "New", path: "new", slug: "new" }],
            views: [],
            adminViews: [],
            cmsUrlController: mockCmsUrlController,
            collectionRegistryController: mockCollectionRegistryController,
        });

        const nav2 = result.current.topLevelNavigation;

        expect(nav1).not.toBe(nav2);
        expect(nav2?.navigationEntries).toHaveLength(2);
    });

    it("should map views and adminViews into the navigation", () => {
        const { result } = renderHook(() => useTopLevelNavigation({
            collections: [],
            views: [{ name: "My View", slug: "my-view", view: null as any }],
            adminViews: [{ name: "Admin Setup", slug: "setup", view: null as any }],
            cmsUrlController: mockCmsUrlController,
            collectionRegistryController: mockCollectionRegistryController
        }));

        const nav = result.current.topLevelNavigation as NavigationResult;
        expect(nav.navigationEntries).toHaveLength(2);

        const viewEntry = nav.navigationEntries.find(e => e.type === "view");
        expect(viewEntry?.id).toBe("view:my-view");
        expect(viewEntry?.url).toBe("/my-view");

        const adminEntry = nav.navigationEntries.find(e => e.type === "admin");
        expect(adminEntry?.id).toBe("admin:setup");
        expect(adminEntry?.url).toBe("/setup");
        // Admin group should be sorted to the end automatically
        expect(adminEntry?.group).toBe("Admin");
    });
});
