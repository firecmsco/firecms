import { EntityCollection, Properties, Property } from "@rebasepro/types";
import { isPropertyBuilder } from "@rebasepro/common";

/**
 * Schema context passed to the DataTalk API for understanding collection structures.
 */
export type SchemaContext = Array<{
    collection: string;
    databaseId?: string;
    properties: Record<string, SchemaProperty>;
}>;

/**
 * Simplified property schema for the DataTalk API.
 */
export interface SchemaProperty {
    dataType: "string" | "number" | "boolean" | "array" | "map" | "timestamp" | "reference" | "geopoint";
    enumValues?: string[];
    of?: SchemaProperty;
    properties?: Record<string, SchemaProperty>;
    description?: string;
    path?: string;
}

/**
 * Build a SchemaContext from an array of EntityCollections.
 * This converts Rebase collection definitions to the simplified schema format
 * expected by the DataTalk API.
 *
 * @param collections - Array of Rebase EntityCollection objects
 * @returns SchemaContext for the DataTalk API
 */
export function buildSchemaContext(collections: EntityCollection[]): SchemaContext {
    return collections
        .filter(collection => collection.properties)
        .map(collection => ({
            collection: collection.slug,
            databaseId: collection.databaseId,
            properties: buildSchemaProperties(collection.properties as Properties)
        }));
}

/**
 * Convert Rebase Properties to SchemaProperty records.
 */
function buildSchemaProperties(properties: Properties): Record<string, SchemaProperty> {
    const result: Record<string, SchemaProperty> = {};

    for (const [key, property] of Object.entries(properties)) {
        if (isPropertyBuilder(property)) continue; // Skip property builders
        const schemaProperty = buildSchemaProperty(property as Property);
        if (schemaProperty) {
            result[key] = schemaProperty;
        }
    }

    return result;
}

/**
 * Convert a single Rebase Property to a SchemaProperty.
 */
function buildSchemaProperty(property: Property): SchemaProperty | null {
    if (!property || !property.type) return null;

    const base: Partial<SchemaProperty> = {};

    // Add description if present
    if (property.description) {
        base.description = property.description;
    }

    switch (property.type) {
        case "string": {
            const schemaProperty: SchemaProperty = {
                ...base,
                dataType: "string"
            };
            // Handle enum values
            if ("enum" in property && property.enum) {
                schemaProperty.enumValues = extractEnumValues(property.enum);
            }
            return schemaProperty;
        }

        case "number": {
            const schemaProperty: SchemaProperty = {
                ...base,
                dataType: "number"
            };
            // Handle enum values for numbers too
            if ("enum" in property && property.enum) {
                schemaProperty.enumValues = extractEnumValues(property.enum);
            }
            return schemaProperty;
        }

        case "boolean":
            return {
                ...base,
                dataType: "boolean"
            };

        case "date":
            return {
                ...base,
                dataType: "timestamp"
            };

        case "geopoint":
            return {
                ...base,
                dataType: "geopoint"
            };

        case "reference": {
            const schemaProperty: SchemaProperty = {
                ...base,
                dataType: "reference"
            };
            if ("path" in property && property.path) {
                schemaProperty.path = property.path;
            }
            return schemaProperty;
        }

        case "array": {
            const schemaProperty: SchemaProperty = {
                ...base,
                dataType: "array"
            };
            if ("of" in property && property.of && !Array.isArray(property.of) && !isPropertyBuilder(property.of)) {
                const ofProperty = buildSchemaProperty(property.of);
                if (ofProperty) {
                    schemaProperty.of = ofProperty;
                }
            }
            return schemaProperty;
        }

        case "map": {
            const schemaProperty: SchemaProperty = {
                ...base,
                dataType: "map"
            };
            if ("properties" in property && property.properties) {
                schemaProperty.properties = buildSchemaProperties(property.properties as Properties);
            }
            return schemaProperty;
        }

        default:
            return null;
    }
}

/**
 * Extract enum values as string array from various Rebase enum formats.
 */
function extractEnumValues(enumValues: any): string[] {
    if (Array.isArray(enumValues)) {
        return enumValues.map(v => String(typeof v === "object" ? v.id : v));
    }
    if (typeof enumValues === "object") {
        return Object.keys(enumValues).map(String);
    }
    return [];
}
