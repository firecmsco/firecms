/**
 * Integration tests for EntityReference preservation through the save flow.
 *
 * These tests simulate real-world scenarios where EntityReference values
 * flow through various utility functions during entity save operations.
 */
import { describe, expect, it } from "@jest/globals";
import { EntityReference, GeoPoint } from "../src/types";
import { mergeDeep } from "../src/util/objects";
import { updateDateAutoValues } from "../src/util/entities";
import { mergeCallbacks } from "../src/util/callbacks";

// Real EntityReference class for testing
class TestEntityReference extends EntityReference {
    constructor(id: string, path: string) {
        super(id, path);
    }
}

// Real GeoPoint class for testing
class TestGeoPoint extends GeoPoint {
    constructor(latitude: number, longitude: number) {
        super(latitude, longitude);
    }
}

describe("EntityReference Preservation - Integration Tests", () => {

    describe("mergeDeep with EntityReference", () => {

        it("should preserve EntityReference when merging form values with cached local changes", () => {
            // This simulates EntityForm.tsx line 325:
            // mergeDeep(baseInitialValues, localChangesDataRaw as Partial<M>)

            const baseValues = {
                title: "Original Title",
                author: new TestEntityReference("author123", "users"),
                tags: ["tag1"],
            };

            const cachedChanges = {
                title: "Modified Title",
                author: new TestEntityReference("author456", "users"), // User selected different author
            };

            const result = mergeDeep(baseValues, cachedChanges);

            // EntityReference should be preserved from cache, not spread into plain object
            expect(result.author).toBe(cachedChanges.author);
            expect(result.author.isEntityReference()).toBe(true);
            expect(result.author.id).toBe("author456");
            expect(result.title).toBe("Modified Title");
            expect(result.tags).toEqual(["tag1"]); // Unchanged from base
        });

        it("should preserve GeoPoint when merging location data", () => {
            const baseValues = {
                name: "Office",
                location: new TestGeoPoint(40.7128, -74.0060),
            };

            const updates = {
                location: new TestGeoPoint(51.5074, -0.1278), // Updated location
            };

            const result = mergeDeep(baseValues, updates);

            expect(result.location).toBe(updates.location);
            expect(result.location instanceof GeoPoint).toBe(true);
            expect(result.location.latitude).toBe(51.5074);
        });

        it("should handle nested objects containing EntityReference", () => {
            const baseValues = {
                metadata: {
                    createdBy: new TestEntityReference("user1", "users"),
                    updatedBy: new TestEntityReference("user1", "users"),
                },
            };

            const updates = {
                metadata: {
                    updatedBy: new TestEntityReference("user2", "users"),
                },
            };

            const result = mergeDeep(baseValues, updates);

            // createdBy should be from base, updatedBy should be from updates
            expect(result.metadata.createdBy.id).toBe("user1");
            expect(result.metadata.updatedBy.id).toBe("user2");
            expect(result.metadata.updatedBy.isEntityReference()).toBe(true);
        });

        it("should replace array completely from source (preserving class instances inside)", () => {
            // mergeDeep replaces arrays from source, not element-wise merge
            const sourceRef = new TestEntityReference("author3", "users");
            const baseValues = {
                authors: [
                    new TestEntityReference("author1", "users"),
                    new TestEntityReference("author2", "users"),
                ],
            };

            const updates = {
                authors: [sourceRef],
            };

            const result = mergeDeep(baseValues, updates);

            // mergeDeep element-wise merges arrays, so we merge first elements
            // Since arrays have element-wise merge, first element should be source's ref
            expect(result.authors[0]).toBe(sourceRef);
            expect(result.authors[0].isEntityReference()).toBe(true);
            expect(result.authors[0].id).toBe("author3");
        });
    });

    describe("updateDateAutoValues with EntityReference", () => {

        it("should preserve EntityReference when updating date auto values", () => {
            // This simulates useBuildDataSource.ts line 227-234

            const inputValues = {
                title: "My Document",
                author: new TestEntityReference("author123", "users"),
                category: new TestEntityReference("cat1", "categories"),
                created_at: null,
                updated_at: null,
            };

            const properties = {
                title: { dataType: "string" as const },
                author: {
                    dataType: "reference" as const,
                    path: "users"
                },
                category: {
                    dataType: "reference" as const,
                    path: "categories"
                },
                created_at: {
                    dataType: "date" as const,
                    autoValue: "on_create" as const
                },
                updated_at: {
                    dataType: "date" as const,
                    autoValue: "on_update" as const
                },
            };

            const timestampNow = new Date();

            const result = updateDateAutoValues({
                inputValues,
                properties,
                status: "new",
                timestampNowValue: timestampNow,
                setDateToMidnight: (input) => input,
            });

            // References should be preserved
            expect(result.author.isEntityReference()).toBe(true);
            expect(result.author.id).toBe("author123");
            expect(result.category.isEntityReference()).toBe(true);
            expect(result.category.id).toBe("cat1");

            // Dates should be updated (use toEqual for Date comparison)
            expect(result.created_at).toEqual(timestampNow);
            expect(result.updated_at).toEqual(timestampNow);
        });

        it("should preserve GeoPoint when updating date auto values", () => {
            const inputValues = {
                name: "Store",
                location: new TestGeoPoint(40.7128, -74.0060),
                updated_at: null,
            };

            const properties = {
                name: { dataType: "string" as const },
                location: { dataType: "geopoint" as const },
                updated_at: {
                    dataType: "date" as const,
                    autoValue: "on_update" as const
                },
            };

            const timestampNow = new Date();

            const result = updateDateAutoValues({
                inputValues,
                properties,
                status: "existing",
                timestampNowValue: timestampNow,
                setDateToMidnight: (input) => input,
            });

            expect(result.location instanceof GeoPoint).toBe(true);
            expect(result.location.latitude).toBe(40.7128);
            expect(result.updated_at).toEqual(timestampNow);
        });
    });

    describe("mergeCallbacks onPreSave with EntityReference", () => {

        it("should preserve EntityReference through onPreSave callback chain", async () => {
            // This simulates plugin callbacks modifying values with references

            const baseCallbacks = {
                onPreSave: async (props: any) => {
                    // Base callback adds a reference
                    return {
                        ...props.values,
                        createdBy: new TestEntityReference("system", "users"),
                    };
                },
            };

            const pluginCallbacks = {
                onPreSave: async (props: any) => {
                    // Plugin callback modifies another field but shouldn't break references
                    return {
                        processedAt: new Date(),
                    };
                },
            };

            const mergedCallbacks = mergeCallbacks(baseCallbacks, pluginCallbacks);

            const inputValues = {
                title: "Test",
                author: new TestEntityReference("author1", "users"),
            };

            const result = await mergedCallbacks!.onPreSave!({
                values: inputValues,
                collection: {} as any,
                path: "test",
                entityId: "123",
                status: "new",
                context: {} as any,
                resolvedPath: "test",
            });

            // Original reference should be preserved
            expect(result.author.isEntityReference()).toBe(true);
            expect(result.author.id).toBe("author1");

            // Added reference should also be valid
            expect(result.createdBy.isEntityReference()).toBe(true);
            expect(result.createdBy.id).toBe("system");
        });
    });

    describe("Full Save Flow Simulation", () => {

        it("should preserve EntityReference through complete save flow", async () => {
            // Simulate the complete flow from form save to database

            // Step 1: Form values with references (no arrays for now to test core flow)
            const formValues = {
                title: "My Article",
                author: new TestEntityReference("author123", "users"),
                location: new TestGeoPoint(40.7128, -74.0060),
                created_at: null,
                updated_at: null,
            };

            // Step 2: Merge with cached local changes (simulates EntityForm)
            const cachedChanges = {
                title: "My Updated Article",
            };
            const mergedValues = mergeDeep(formValues, cachedChanges);

            // Step 3: Update auto dates (simulates useBuildDataSource)
            const properties = {
                title: { dataType: "string" as const },
                author: {
                    dataType: "reference" as const,
                    path: "users"
                },
                location: { dataType: "geopoint" as const },
                created_at: {
                    dataType: "date" as const,
                    autoValue: "on_create" as const
                },
                updated_at: {
                    dataType: "date" as const,
                    autoValue: "on_update" as const
                },
            };

            const timestampNow = new Date();
            const finalValues = updateDateAutoValues({
                inputValues: mergedValues,
                properties,
                status: "new",
                timestampNowValue: timestampNow,
                setDateToMidnight: (input) => input,
            });

            // All references should still be valid
            expect(finalValues.author.isEntityReference()).toBe(true);
            expect(finalValues.author.id).toBe("author123");

            expect(finalValues.location instanceof GeoPoint).toBe(true);
            expect(finalValues.location.latitude).toBe(40.7128);

            // Title should be updated
            expect(finalValues.title).toBe("My Updated Article");

            // Dates should be set
            expect(finalValues.created_at).toEqual(timestampNow);
            expect(finalValues.updated_at).toEqual(timestampNow);
        });

        it("should preserve EntityReference arrays through save flow", async () => {
            // Test reference arrays specifically
            const formValues = {
                title: "My Article",
                relatedPosts: [
                    new TestEntityReference("post1", "posts"),
                    new TestEntityReference("post2", "posts"),
                ],
            };

            // Just properties without date fields to isolate array handling
            const properties = {
                title: { dataType: "string" as const },
                relatedPosts: {
                    dataType: "array" as const,
                    of: {
                        dataType: "reference" as const,
                        path: "posts"
                    }
                },
            };

            const result = updateDateAutoValues({
                inputValues: formValues,
                properties,
                status: "new",
                timestampNowValue: new Date(),
                setDateToMidnight: (input) => input,
            });

            // Array references should be preserved
            expect(result.relatedPosts[0].isEntityReference()).toBe(true);
            expect(result.relatedPosts[0].id).toBe("post1");
            expect(result.relatedPosts[1].isEntityReference()).toBe(true);
            expect(result.relatedPosts[1].id).toBe("post2");
        });
    });
});
