import { CollectionsConfigController } from "./types/config_controller";
import { EntityCollection, Properties, getSubcollections } from "@firecms/core";
import { makePropertiesEditable } from "@firecms/common";
import { PersistedCollection } from "./types/persisted_collection";

export function useLocalCollectionsConfigController(
    apiUrl: string = "http://localhost:3001/api",
    baseCollections: EntityCollection[] = []
): CollectionsConfigController {

    const markAsEditable = (c: PersistedCollection, visited = new Set<PersistedCollection>()) => {
        if (visited.has(c)) return c;
        visited.add(c);

        c.editable = true;
        if (c.properties) {
            makePropertiesEditable(c.properties as Properties);
        }
        getSubcollections(c).forEach(sub => markAsEditable(sub as PersistedCollection, visited));
        return c;
    };

    const parsedCollections = baseCollections.map(c => markAsEditable({ ...c }));

    const request = async (endpoint: string, payload: any) => {
        const response = await fetch(`${apiUrl}/schema-editor${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || err.error || "Error communicating with local dev server");
        }
    };

    return {
        loading: false,
        collections: parsedCollections,
        getCollection: (id) => {
            const found = parsedCollections.find(c => (c as any).id === id || c.slug === id);
            if (found) return found;
            throw Error(`Collection ${id} not found in local mode`);
        },

        saveCollection: async ({ id, collectionData }) => {
            await request("/collection/save", { collectionId: id, collectionData });
        },
        updateCollection: async ({ id, collectionData }) => {
            await request("/collection/save", { collectionId: id, collectionData });
        },
        deleteCollection: async ({ id }) => {
            await request("/collection/delete", { collectionId: id });
        },

        saveProperty: async ({ path, propertyKey, property, newPropertiesOrder }) => {
            await request("/property/save", { collectionId: path, propertyKey, propertyConfig: property });
            if (newPropertiesOrder) {
                await request("/collection/save", { collectionId: path, collectionData: { propertiesOrder: newPropertiesOrder } });
            }
        },
        deleteProperty: async ({ path, propertyKey, newPropertiesOrder }) => {
            await request("/property/delete", { collectionId: path, propertyKey });
            if (newPropertiesOrder) {
                await request("/collection/save", { collectionId: path, collectionData: { propertiesOrder: newPropertiesOrder } });
            }
        },

        updatePropertiesOrder: async ({ collection, fullPath, newPropertiesOrder }) => {
            const collectionId = (collection as any).id || fullPath.split("/").pop();
            await request("/collection/save", { collectionId, collectionData: { propertiesOrder: newPropertiesOrder } });
        },
        updateKanbanColumnsOrder: async () => {
            // Kanban order mapping logic can be added later if needed natively.
        },

        navigationEntries: [],
        saveNavigationEntries: async () => { },
    };
}
