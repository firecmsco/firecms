import { CollectionsConfigController } from "./types/config_controller";
import { EntityCollection, Properties, getSubcollections } from "@firecms/core";
import { PersistedCollection } from "./types/persisted_collection";



export function useLocalCollectionsConfigController(
    apiUrl: string = "http://localhost:3001",
    baseCollections: EntityCollection[] = [],
    options?: {
        readOnly?: boolean;
    }
): CollectionsConfigController {

    const parsedCollections = baseCollections;

    const request = async (endpoint: string, payload: any) => {
        console.log("dispatching dev server request", endpoint, payload);
        try {
            const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/schema-editor${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            console.log("dev server response", endpoint, response.status);
            if (!response.ok) {
                const text = await response.text();
                let err: any = {};
                try {
                    err = JSON.parse(text);
                } catch (e) { }

                if (Object.keys(err).length === 0) {
                    err = { message: text };
                }
                console.error("dev server error payload:", err);
                throw new Error(err.error?.message || err.error || err.message || "Error communicating with local dev server");
            }
        } catch (e) {
            console.error("fetch request failed", e);
            throw e;
        }
    };

    return {
        loading: false,
        readOnly: options?.readOnly ?? false,
        readOnlyReason: "Local collection editing is only available in development mode.",
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
