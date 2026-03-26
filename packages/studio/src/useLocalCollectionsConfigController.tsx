import { CollectionsConfigController } from "./types/config_controller";
import { EntityCollection, Properties, getSubcollections } from "@rebasepro/core";
import { PersistedCollection } from "./types/persisted_collection";



import React, { useMemo } from "react";
export function useLocalCollectionsConfigController(
    apiUrl: string = "http://localhost:3001",
    baseCollections: EntityCollection[] = [],
    options?: {
        readOnly?: boolean;
        getAuthToken?: () => Promise<string | null>;
    }
): CollectionsConfigController {

    const parsedCollections = baseCollections;

    const request = async (endpoint: string, payload: any) => {
        console.log("dispatching dev server request", endpoint, payload);
        try {
            const token = options?.getAuthToken ? await options.getAuthToken() : null;
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/schema-editor${endpoint}`, {
                method: "POST",
                headers,
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

    return useMemo(() => ({
        loading: false,
        readOnly: options?.readOnly ?? false,
        readOnlyReason: "Local collection editing is only available in development mode.",
        collections: parsedCollections,
        getCollection: (id: string) => {
            const found = parsedCollections.find(c => (c as any).id === id || c.slug === id);
            if (found) return found;
            throw Error(`Collection ${id} not found in local mode`);
        },

        saveCollection: async ({ id, collectionData }: any) => {
            await request("/collection/save", { collectionId: id, collectionData });
        },
        updateCollection: async ({ id, collectionData }: any) => {
            await request("/collection/save", { collectionId: id, collectionData });
        },
        deleteCollection: async ({ id }: any) => {
            await request("/collection/delete", { collectionId: id });
        },

        saveProperty: async ({ path, propertyKey, property, newPropertiesOrder }: any) => {
            await request("/property/save", { collectionId: path, propertyKey, propertyConfig: property });
            if (newPropertiesOrder) {
                await request("/collection/save", { collectionId: path, collectionData: { propertiesOrder: newPropertiesOrder } });
            }
        },
        deleteProperty: async ({ path, propertyKey, newPropertiesOrder }: any) => {
            await request("/property/delete", { collectionId: path, propertyKey });
            if (newPropertiesOrder) {
                await request("/collection/save", { collectionId: path, collectionData: { propertiesOrder: newPropertiesOrder } });
            }
        },

        updatePropertiesOrder: async ({ collection, fullPath, newPropertiesOrder }: any) => {
            const collectionId = (collection as any).id || fullPath.split("/").pop();
            await request("/collection/save", { collectionId, collectionData: { propertiesOrder: newPropertiesOrder } });
        },
        updateKanbanColumnsOrder: async () => {
            // Kanban order mapping logic can be added later if needed natively.
        },

        navigationEntries: [],
        saveNavigationEntries: async () => { },
    }), [apiUrl, parsedCollections, options?.readOnly, options?.getAuthToken]);
}
