/**
 * @jest-environment jsdom
 */
import {
    getGroup,
    computeNavigationGroups,
    areCollectionsEqual,
    areCollectionListsEqual,
    NAVIGATION_DEFAULT_GROUP_NAME,
    NAVIGATION_ADMIN_GROUP_NAME,
} from "../../src/hooks/navigation/utils";
import type { EntityCollection, AppView, RebasePlugin, NavigationGroupMapping } from "@rebasepro/types";

// ---------------------------------------------------------------------------
// getGroup
// ---------------------------------------------------------------------------
describe("getGroup", () => {
    it("returns the group name when set", () => {
        const collection = { group: "Products" } as EntityCollection;
        expect(getGroup(collection)).toBe("Products");
    });

    it("returns default group name for undefined group", () => {
        const collection = {} as EntityCollection;
        expect(getGroup(collection)).toBe(NAVIGATION_DEFAULT_GROUP_NAME);
    });

    it("returns default group name for empty string group", () => {
        const collection = { group: "" } as EntityCollection;
        expect(getGroup(collection)).toBe(NAVIGATION_DEFAULT_GROUP_NAME);
    });

    it("returns default group name for whitespace-only group", () => {
        const collection = { group: "   " } as EntityCollection;
        expect(getGroup(collection)).toBe(NAVIGATION_DEFAULT_GROUP_NAME);
    });

    it("trims whitespace from group name", () => {
        const collection = { group: " Content " } as EntityCollection;
        expect(getGroup(collection)).toBe("Content");
    });

    it("works with AppView", () => {
        const view = { group: "Settings" } as AppView;
        expect(getGroup(view)).toBe("Settings");
    });
});

// ---------------------------------------------------------------------------
// computeNavigationGroups
// ---------------------------------------------------------------------------
describe("computeNavigationGroups", () => {
    const collection1: EntityCollection = {
        id: "products",
        slug: "products",
        group: "Content",
        properties: {},
    } as unknown as EntityCollection;

    const collection2: EntityCollection = {
        id: "orders",
        slug: "orders",
        group: "Content",
        properties: {},
    } as unknown as EntityCollection;

    const collection3: EntityCollection = {
        id: "settings",
        slug: "settings",
        group: "Admin",
        properties: {},
    } as unknown as EntityCollection;

    it("creates groups from scratch when no existing mappings", () => {
        const result = computeNavigationGroups({
            collections: [collection1, collection2, collection3],
        });

        expect(result).toHaveLength(2);
        const contentGroup = result.find(g => g.name === "Content");
        expect(contentGroup?.entries).toContain("products");
        expect(contentGroup?.entries).toContain("orders");

        const adminGroup = result.find(g => g.name === "Admin");
        expect(adminGroup?.entries).toContain("settings");
    });

    it("preserves existing group mappings and adds unassigned entries", () => {
        const existingMappings: NavigationGroupMapping[] = [
            { name: "Content", entries: ["products"] }
        ];

        const result = computeNavigationGroups({
            navigationGroupMappings: existingMappings,
            collections: [collection1, collection2, collection3],
        });

        // products already in Content, orders should be added to Content too
        const contentGroup = result.find(g => g.name === "Content");
        expect(contentGroup?.entries).toContain("products");
        expect(contentGroup?.entries).toContain("orders");

        // settings should go to Admin group
        const adminGroup = result.find(g => g.name === "Admin");
        expect(adminGroup?.entries).toContain("settings");
    });

    it("handles views alongside collections", () => {
        const view: AppView = {
            name: "Dashboard",
            slug: "dashboard",
            group: "Main",
            view: null!,
        } as unknown as AppView;

        const result = computeNavigationGroups({
            collections: [collection1],
            views: [view],
        });

        const mainGroup = result.find(g => g.name === "Main");
        expect(mainGroup?.entries).toContain("dashboard");
    });

    it("handles empty inputs", () => {
        const result = computeNavigationGroups({});
        expect(result).toEqual([]);
    });

    it("deduplicates entries within groups", () => {
        const existingMappings: NavigationGroupMapping[] = [
            { name: "Content", entries: ["products", "products"] }
        ];

        const result = computeNavigationGroups({
            navigationGroupMappings: existingMappings,
            collections: [collection1],
        });

        const contentGroup = result.find(g => g.name === "Content");
        // Should be deduplicated
        expect(contentGroup?.entries.filter(e => e === "products")).toHaveLength(1);
    });

    it("merges plugin navigation entries", () => {
        const plugin: RebasePlugin = {
            hooks: {
                navigationEntries: [
                    {
                        name: "Tools",
                        entries: ["import", "export"]
                    }
                ]
            }
        } as unknown as RebasePlugin;

        const result = computeNavigationGroups({
            navigationGroupMappings: [],
            plugins: [plugin],
        });

        const toolsGroup = result.find(g => g.name === "Tools");
        expect(toolsGroup?.entries).toContain("import");
        expect(toolsGroup?.entries).toContain("export");
    });

    it("does not mutate the original input mappings", () => {
        const existingMappings: NavigationGroupMapping[] = [
            { name: "Content", entries: ["products"] }
        ];
        const originalEntries = [...existingMappings[0].entries];

        const result = computeNavigationGroups({
            navigationGroupMappings: existingMappings,
            collections: [collection1, collection2],
        });

        // The result should contain both entries
        const contentGroup = result.find(g => g.name === "Content");
        expect(contentGroup?.entries).toContain("products");
        expect(contentGroup?.entries).toContain("orders");

        // But the original input must not have been mutated
        expect(existingMappings[0].entries).toEqual(originalEntries);
    });
});

// ---------------------------------------------------------------------------
// areCollectionsEqual
// ---------------------------------------------------------------------------
describe("areCollectionsEqual", () => {
    const collA: EntityCollection = {
        id: "products",
        name: "Products",
        path: "products",
        slug: "products",
        properties: { title: { type: "string", name: "Title" } },
    } as unknown as EntityCollection;

    const collB: EntityCollection = {
        id: "products",
        name: "Products",
        path: "products",
        slug: "products",
        properties: { title: { type: "string", name: "Title" } },
    } as unknown as EntityCollection;

    it("considers identical collections equal", () => {
        expect(areCollectionsEqual(collA, collB)).toBe(true);
    });

    it("considers collections with different slugs unequal", () => {
        const different = { ...collA, slug: "different" } as unknown as EntityCollection;
        expect(areCollectionsEqual(collA, different)).toBe(false);
    });

    it("considers collections with different properties unequal", () => {
        const different = {
            ...collA,
            properties: { body: { type: "string", name: "Body" } },
        } as unknown as EntityCollection;
        expect(areCollectionsEqual(collA, different)).toBe(false);
    });

    it("ignores function properties during comparison", () => {
        const withFn = {
            ...collA,
            onSave: () => {},
        } as unknown as EntityCollection;
        expect(areCollectionsEqual(collA, withFn)).toBe(true);
    });

    it("handles circular subcollection references via visitedSlugs", () => {
        const circularA: EntityCollection = {
            id: "self",
            name: "Self",
            path: "self",
            slug: "self",
            properties: {},
        } as unknown as EntityCollection;

        const circularB: EntityCollection = {
            ...circularA,
        } as unknown as EntityCollection;

        // Simulating that we already visited this slug
        expect(areCollectionsEqual(circularA, circularB, ["self"])).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// areCollectionListsEqual
// ---------------------------------------------------------------------------
describe("areCollectionListsEqual", () => {
    const col1: EntityCollection = {
        id: "a",
        name: "A",
        path: "a",
        slug: "a",
        properties: {},
    } as unknown as EntityCollection;

    const col2: EntityCollection = {
        id: "b",
        name: "B",
        path: "b",
        slug: "b",
        properties: {},
    } as unknown as EntityCollection;

    it("returns true for identical lists", () => {
        expect(areCollectionListsEqual([col1, col2], [col1, col2])).toBe(true);
    });

    it("returns true regardless of order (sorts by slug)", () => {
        expect(areCollectionListsEqual([col2, col1], [col1, col2])).toBe(true);
    });

    it("returns false for different lengths", () => {
        expect(areCollectionListsEqual([col1], [col1, col2])).toBe(false);
    });

    it("returns false for different collections", () => {
        const col3 = { ...col1, slug: "c" } as unknown as EntityCollection;
        expect(areCollectionListsEqual([col1], [col3])).toBe(false);
    });

    it("returns true for empty lists", () => {
        expect(areCollectionListsEqual([], [])).toBe(true);
    });
});
