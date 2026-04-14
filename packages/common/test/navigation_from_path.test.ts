import { getNavigationEntriesFromPath } from "../src/util/navigation_from_path";
import { EntityCollection, FirebaseCollection, EntityCustomView } from "@rebasepro/types";

function makeCollection(overrides: Record<string, any> = {}): EntityCollection {
    const base = {
        name: "Products",
        slug: "products",
        table: "products",
        properties: {},
        ...overrides,
    };
    if ('subcollections' in base) {
        return { ...base, driver: "firestore" } as FirebaseCollection;
    }
    return base as EntityCollection;
}

describe("getNavigationEntriesFromPath", () => {

    it("resolves a single collection", () => {
        const collections = [makeCollection()];
        const result = getNavigationEntriesFromPath({
            path: "products",
            collections,
        });
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe("collection");
        expect((result[0] as any).collection.slug).toBe("products");
    });

    it("resolves collection + entity", () => {
        const collections = [makeCollection()];
        const result = getNavigationEntriesFromPath({
            path: "products/123",
            collections,
        });
        expect(result).toHaveLength(2);
        expect(result[0].type).toBe("collection");
        expect(result[1].type).toBe("entity");
        expect((result[1] as any).entityId).toBe("123");
    });

    it("resolves nested subcollection path", () => {
        const subCol = makeCollection({
            name: "Variants",
            slug: "variants",
            table: "variants",
        });
        const collections = [
            makeCollection({
                subcollections: () => [subCol],
            }),
        ];
        const result = getNavigationEntriesFromPath({
            path: "products/123/variants",
            collections,
        });
        expect(result).toHaveLength(3);
        expect(result[0].type).toBe("collection");
        expect(result[1].type).toBe("entity");
        expect(result[2].type).toBe("collection");
        expect((result[2] as any).collection.slug).toBe("variants");
    });

    it("resolves custom entity view", () => {
        const customView: EntityCustomView<any> = {
            key: "analytics",
            name: "Analytics",
            Builder: () => null,
        };
        const collections = [
            makeCollection({
                entityViews: [customView],
            }),
        ];
        const result = getNavigationEntriesFromPath({
            path: "products/123/analytics",
            collections,
        });
        expect(result).toHaveLength(3);
        expect(result[2].type).toBe("custom_view");
        expect((result[2] as any).view.key).toBe("analytics");
    });

    it("resolves string entity view reference", () => {
        const contextView: EntityCustomView<any> = {
            key: "preview",
            name: "Preview",
            Builder: () => null,
        };
        const collections = [
            makeCollection({
                entityViews: ["preview"],
            }),
        ];
        const result = getNavigationEntriesFromPath({
            path: "products/123/preview",
            collections,
            contextEntityViews: [contextView],
        });
        expect(result).toHaveLength(3);
        expect(result[2].type).toBe("custom_view");
    });

    it("returns empty array for empty collections", () => {
        const result = getNavigationEntriesFromPath({
            path: "unknown",
            collections: [],
        });
        expect(result).toEqual([]);
    });

    it("returns empty array when path does not match any collection", () => {
        const collections = [makeCollection()];
        const result = getNavigationEntriesFromPath({
            path: "nonexistent",
            collections,
        });
        expect(result).toEqual([]);
    });

    it("handles leading/trailing slashes", () => {
        const collections = [makeCollection()];
        const result = getNavigationEntriesFromPath({
            path: "/products/",
            collections,
        });
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe("collection");
    });
});
