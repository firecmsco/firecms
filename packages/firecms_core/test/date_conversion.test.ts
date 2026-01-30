/**
 * Test to reproduce the Date-to-string conversion bug.
 *
 * The bug occurs when saving an entity with a date field that has autoValue.
 * The date gets converted to an ISO string at some point, causing validation
 * to fail with: "updated_on must be a `object` type, but the final value was: `2026-01-26T12:40:43.083Z`"
 *
 * This test simulates the save flow to identify where the conversion happens.
 */
import { describe, expect, it } from "@jest/globals";
import { updateDateAutoValues, traverseValuesProperties } from "../src/util/entities";
import { mergeDeep, removeFunctions, removeUndefined } from "../src/util/objects";
import { ResolvedProperties, ResolvedDateProperty, EntityReference, GeoPoint } from "../src/types";
// Entity cache functions have internal JSON serialization that we need to test

// Helper to create a date property with autoValue
function createAutoDateProperty(autoValue: "on_create" | "on_update"): ResolvedDateProperty {
    return {
        dataType: "date",
        name: autoValue === "on_create" ? "Created On" : "Updated On",
        autoValue,
        readOnly: true,
        validation: { required: true }
    } as ResolvedDateProperty;
}

describe("Date-to-String Conversion Bug", () => {

    describe("updateDateAutoValues preserves Date objects", () => {
        it("should return Date objects, not ISO strings", () => {
            const inputValues = {
                title: "Test Document",
                created_on: null,
                updated_on: null,
            };

            const properties: ResolvedProperties = {
                title: { dataType: "string" as const },
                created_on: createAutoDateProperty("on_create"),
                updated_on: createAutoDateProperty("on_update"),
            };

            const timestampNow = new Date();

            const result = updateDateAutoValues({
                inputValues,
                properties,
                status: "new",
                timestampNowValue: timestampNow
            });

            // Dates should be Date objects, not strings
            expect(result.created_on).toBeInstanceOf(Date);
            expect(result.updated_on).toBeInstanceOf(Date);
            expect(typeof result.created_on).toBe("object");
            expect(typeof result.updated_on).toBe("object");

            // Verify they're not strings
            expect(typeof result.created_on).not.toBe("string");
            expect(typeof result.updated_on).not.toBe("string");
        });

        it("should preserve Date objects when updating existing entities", () => {
            const existingDate = new Date("2025-01-01T10:00:00Z");
            const inputValues = {
                title: "Existing Document",
                created_on: existingDate,
                updated_on: existingDate,
            };

            const properties: ResolvedProperties = {
                title: { dataType: "string" as const },
                created_on: createAutoDateProperty("on_create"),
                updated_on: createAutoDateProperty("on_update"),
            };

            const timestampNow = new Date();

            const result = updateDateAutoValues({
                inputValues,
                properties,
                status: "existing",
                timestampNowValue: timestampNow
            });

            // created_on should preserve original Date (on_create only sets on new)
            expect(result.created_on).toBeInstanceOf(Date);
            expect(result.created_on).toEqual(existingDate);

            // updated_on should be updated to new Date
            expect(result.updated_on).toBeInstanceOf(Date);
            expect(result.updated_on).toEqual(timestampNow);
        });
    });

    describe("mergeDeep preserves Date objects", () => {
        it("should not convert Date objects to strings", () => {
            const baseValues = {
                title: "Document",
                updated_on: new Date("2025-01-01T10:00:00Z"),
            };

            const updates = {
                title: "Updated Document",
            };

            const result = mergeDeep(baseValues, updates);

            expect(result.updated_on).toBeInstanceOf(Date);
            expect(typeof result.updated_on).not.toBe("string");
        });

        it("should preserve Date when source has a new Date", () => {
            const now = new Date();
            const baseValues = {
                updated_on: null,
            };

            const updates = {
                updated_on: now,
            };

            const result = mergeDeep(baseValues, updates);

            expect(result.updated_on).toBeInstanceOf(Date);
            expect(result.updated_on).toBe(now); // Should be the exact same object
        });
    });

    describe("removeFunctions preserves Date objects", () => {
        it("should not convert Date objects to strings", () => {
            const values = {
                title: "Document",
                updated_on: new Date("2025-01-01T10:00:00Z"),
                callback: () => console.log("test"),
            };

            const result = removeFunctions(values);

            expect(result.updated_on).toBeInstanceOf(Date);
            expect(typeof result.updated_on).not.toBe("string");
            expect(result.callback).toBeUndefined(); // Function should be removed
        });
    });

    describe("removeUndefined preserves Date objects", () => {
        it("should not convert Date objects to strings", () => {
            const values = {
                title: "Document",
                updated_on: new Date("2025-01-01T10:00:00Z"),
                empty: undefined,
            };

            const result = removeUndefined(values);

            expect(result.updated_on).toBeInstanceOf(Date);
            expect(typeof result.updated_on).not.toBe("string");
            expect(result.empty).toBeUndefined(); // empty key should be removed from result
            expect("empty" in result).toBe(false);
        });
    });

    describe("Full save flow simulation (without validation)", () => {
        it("should preserve Date objects through the complete save flow", () => {
            // Step 1: Initial form values (simulating what comes from the form)
            const formValues = {
                title: "My Document",
                created_on: null,
                updated_on: null,
            };

            const properties: ResolvedProperties = {
                title: { dataType: "string" as const, name: "Title" },
                created_on: createAutoDateProperty("on_create"),
                updated_on: createAutoDateProperty("on_update"),
            };

            // Step 2: Apply date auto values (simulates useBuildDataSource)
            const timestampNow = new Date();
            const valuesWithDates = updateDateAutoValues({
                inputValues: formValues,
                properties,
                status: "new",
                timestampNowValue: timestampNow
            });

            // Verify dates are Date objects at this point
            expect(valuesWithDates.created_on).toBeInstanceOf(Date);
            expect(valuesWithDates.updated_on).toBeInstanceOf(Date);

            // Step 3: Merge with any cached changes
            const cachedChanges = { title: "My Updated Document" };
            const mergedValues = mergeDeep(valuesWithDates, cachedChanges);

            // Verify dates are still Date objects after merge
            expect(mergedValues.created_on).toBeInstanceOf(Date);
            expect(mergedValues.updated_on).toBeInstanceOf(Date);

            // Step 4: Remove functions (cleanup for saving)
            const cleanedValues = removeFunctions(mergedValues);

            // Verify dates are still Date objects after cleanup
            expect(cleanedValues.created_on).toBeInstanceOf(Date);
            expect(cleanedValues.updated_on).toBeInstanceOf(Date);
        });

        it("should preserve Date objects when updating an existing entity", () => {
            const existingCreatedOn = new Date("2024-01-01T10:00:00Z");

            // Existing entity values (simulating what comes from the database)
            const existingValues = {
                title: "Existing Document",
                created_on: existingCreatedOn,
                updated_on: existingCreatedOn,
            };

            const properties: ResolvedProperties = {
                title: { dataType: "string" as const, name: "Title" },
                created_on: createAutoDateProperty("on_create"),
                updated_on: createAutoDateProperty("on_update"),
            };

            // Form values with an update
            const formValues = {
                ...existingValues,
                title: "Updated Title",
            };

            // Apply date auto values for existing entity
            const timestampNow = new Date();
            const valuesWithDates = updateDateAutoValues({
                inputValues: formValues,
                properties,
                status: "existing",
                timestampNowValue: timestampNow
            });

            // created_on should remain the original Date
            expect(valuesWithDates.created_on).toBeInstanceOf(Date);
            expect(valuesWithDates.created_on).toEqual(existingCreatedOn);

            // updated_on should be the new Date
            expect(valuesWithDates.updated_on).toBeInstanceOf(Date);
            expect(valuesWithDates.updated_on).toEqual(timestampNow);
        });
    });

    describe("Potential conversion points", () => {
        it("JSON.stringify converts Date to ISO string (demonstration)", () => {
            const values = {
                updated_on: new Date("2025-01-01T10:00:00Z"),
            };

            // This demonstrates the issue - JSON.stringify converts Date to ISO string
            const jsonString = JSON.stringify(values);
            const parsed = JSON.parse(jsonString);

            // After JSON round-trip, the date becomes a string
            expect(typeof parsed.updated_on).toBe("string");
            expect(parsed.updated_on).toBe("2025-01-01T10:00:00.000Z");
            expect(parsed.updated_on).not.toBeInstanceOf(Date);
        });

        it("Object spread should preserve Date objects", () => {
            const original = {
                updated_on: new Date("2025-01-01T10:00:00Z"),
            };

            const spread = { ...original };

            expect(spread.updated_on).toBeInstanceOf(Date);
            expect(spread.updated_on).toBe(original.updated_on);
        });

        it("Object.assign should preserve Date objects", () => {
            const original = {
                updated_on: new Date("2025-01-01T10:00:00Z"),
            };

            const assigned = Object.assign({}, original);

            expect(assigned.updated_on).toBeInstanceOf(Date);
            expect(assigned.updated_on).toBe(original.updated_on);
        });
    });
});
