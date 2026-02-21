import { EntityCollection } from "@firecms/core";

/**
 * Valid dataType values for properties
 */
const VALID_DATA_TYPES = [
    "string",
    "number",
    "boolean",
    "date",
    "geopoint",
    "reference",
    "array",
    "map"
] as const;

type DataType = typeof VALID_DATA_TYPES[number];

/**
 * Validation error with path and message
 */
export interface CollectionValidationError {
    path: string;
    message: string;
}

/**
 * Result of collection JSON validation
 */
export interface CollectionValidationResult {
    valid: boolean;
    errors: CollectionValidationError[];
    collection?: EntityCollection;
}

/**
 * Validates a property object recursively
 */
function validateProperty(
    property: any,
    path: string,
    errors: CollectionValidationError[]
): void {
    if (typeof property !== "object" || property === null) {
        errors.push({
            path,
            message: "Property must be an object"
        });
        return;
    }

    // Check dataType
    if (!property.dataType) {
        errors.push({
            path: `${path}.dataType`,
            message: "Required field is missing"
        });
    } else if (!VALID_DATA_TYPES.includes(property.dataType)) {
        errors.push({
            path: `${path}.dataType`,
            message: `Invalid value "${property.dataType}", expected one of: ${VALID_DATA_TYPES.join(", ")}`
        });
    }

    // Validate name if present
    if (property.name !== undefined && typeof property.name !== "string") {
        errors.push({
            path: `${path}.name`,
            message: "Must be a string"
        });
    }

    // Validate array "of" property
    if (property.dataType === "array") {
        if (property.of) {
            if (Array.isArray(property.of)) {
                property.of.forEach((ofProp: any, index: number) => {
                    validateProperty(ofProp, `${path}.of[${index}]`, errors);
                });
            } else {
                validateProperty(property.of, `${path}.of`, errors);
            }
        }
        // oneOf validation
        if (property.oneOf) {
            if (typeof property.oneOf !== "object") {
                errors.push({
                    path: `${path}.oneOf`,
                    message: "Must be an object"
                });
            } else if (property.oneOf.properties) {
                validateProperties(property.oneOf.properties, `${path}.oneOf.properties`, errors);
            }
        }
    }

    // Validate map properties
    if (property.dataType === "map" && property.properties) {
        validateProperties(property.properties, `${path}.properties`, errors);
    }

    // Validate reference path
    if (property.dataType === "reference") {
        if (property.path !== undefined && typeof property.path !== "string") {
            errors.push({
                path: `${path}.path`,
                message: "Must be a string"
            });
        }
    }

    // Validate storage config for string
    if (property.dataType === "string" && property.storage) {
        if (typeof property.storage !== "object") {
            errors.push({
                path: `${path}.storage`,
                message: "Must be an object"
            });
        }
    }

    // Validate enumValues if present
    if (property.enumValues !== undefined) {
        if (!Array.isArray(property.enumValues) && typeof property.enumValues !== "object") {
            errors.push({
                path: `${path}.enumValues`,
                message: "Must be an array or object"
            });
        }
    }
}

/**
 * Validates a properties object (collection of property definitions)
 */
function validateProperties(
    properties: any,
    path: string,
    errors: CollectionValidationError[]
): void {
    if (typeof properties !== "object" || properties === null) {
        errors.push({
            path,
            message: "Must be an object"
        });
        return;
    }

    for (const [key, property] of Object.entries(properties)) {
        validateProperty(property, `${path}.${key}`, errors);
    }
}

/**
 * Validates optional collection fields
 */
function validateOptionalFields(
    collection: any,
    errors: CollectionValidationError[]
): void {
    // String fields
    const stringFields = [
        "singularName",
        "description",
        "group",
        "databaseId"
    ];
    for (const field of stringFields) {
        if (collection[field] !== undefined && typeof collection[field] !== "string") {
            errors.push({
                path: field,
                message: "Must be a string"
            });
        }
    }

    // Boolean fields
    const booleanFields = [
        "collectionGroup",

        "selectionEnabled",
        "inlineEditing",
        "hideFromNavigation",
        "hideIdFromForm",
        "hideIdFromCollection",
        "formAutoSave",
        "editable",
        "alwaysApplyDefaultValues",
        "includeJsonView",
        "history"
    ];
    for (const field of booleanFields) {
        if (collection[field] !== undefined && typeof collection[field] !== "boolean") {
            errors.push({
                path: field,
                message: "Must be a boolean"
            });
        }
    }

    // Icon can be string or object (React node)
    if (collection.icon !== undefined &&
        typeof collection.icon !== "string" &&
        typeof collection.icon !== "object") {
        errors.push({
            path: "icon",
            message: "Must be a string (icon key) or object"
        });
    }

    // propertiesOrder must be array of strings
    if (collection.propertiesOrder !== undefined) {
        if (!Array.isArray(collection.propertiesOrder)) {
            errors.push({
                path: "propertiesOrder",
                message: "Must be an array of strings"
            });
        } else if (!collection.propertiesOrder.every((item: any) => typeof item === "string")) {
            errors.push({
                path: "propertiesOrder",
                message: "All items must be strings"
            });
        }
    }

    // subcollections must be array
    if (collection.subcollections !== undefined) {
        if (!Array.isArray(collection.subcollections)) {
            errors.push({
                path: "subcollections",
                message: "Must be an array"
            });
        } else {
            collection.subcollections.forEach((sub: any, index: number) => {
                const subErrors: CollectionValidationError[] = [];
                validateCollectionObject(sub, subErrors);
                subErrors.forEach(err => {
                    errors.push({
                        path: `subcollections[${index}].${err.path}`,
                        message: err.message
                    });
                });
            });
        }
    }

    // defaultViewMode validation
    const validViewModes = ["table", "cards", "kanban"];
    if (collection.defaultViewMode !== undefined) {
        if (!validViewModes.includes(collection.defaultViewMode)) {
            errors.push({
                path: "defaultViewMode",
                message: `Invalid value, expected one of: ${validViewModes.join(", ")}`
            });
        }
    }

    // kanban config validation
    if (collection.kanban !== undefined) {
        if (typeof collection.kanban !== "object" || collection.kanban === null) {
            errors.push({
                path: "kanban",
                message: "Must be an object"
            });
        } else if (collection.kanban.columnProperty !== undefined &&
            typeof collection.kanban.columnProperty !== "string") {
            errors.push({
                path: "kanban.columnProperty",
                message: "Must be a string"
            });
        }
    }
}

/**
 * Validates a collection object
 */
function validateCollectionObject(
    collection: any,
    errors: CollectionValidationError[]
): void {
    // Required fields
    if (!collection.id) {
        errors.push({
            path: "id",
            message: "Required field is missing"
        });
    } else if (typeof collection.id !== "string") {
        errors.push({
            path: "id",
            message: "Must be a string"
        });
    }

    if (!collection.name) {
        errors.push({
            path: "name",
            message: "Required field is missing"
        });
    } else if (typeof collection.name !== "string") {
        errors.push({
            path: "name",
            message: "Must be a string"
        });
    }

    if (!collection.path) {
        errors.push({
            path: "path",
            message: "Required field is missing"
        });
    } else if (typeof collection.path !== "string") {
        errors.push({
            path: "path",
            message: "Must be a string"
        });
    }

    // Properties validation
    if (collection.properties !== undefined) {
        validateProperties(collection.properties, "properties", errors);
    }

    // Optional fields
    validateOptionalFields(collection, errors);
}

/**
 * Validates a JSON string representing a collection configuration.
 * Returns detailed validation errors if the JSON is invalid or doesn't match
 * the expected collection schema.
 */
export function validateCollectionJson(jsonString: string): CollectionValidationResult {
    const errors: CollectionValidationError[] = [];

    // Try to parse JSON
    let parsed: any;
    try {
        parsed = JSON.parse(jsonString);
    } catch (e: any) {
        // Try to extract line/column info from the error
        const match = e.message.match(/position (\d+)/);
        let message = "Invalid JSON syntax";
        if (match) {
            const position = parseInt(match[1], 10);
            const lines = jsonString.substring(0, position).split("\n");
            const line = lines.length;
            const column = lines[lines.length - 1].length + 1;
            message = `Invalid JSON syntax at line ${line}, column ${column}: ${e.message}`;
        } else {
            message = `Invalid JSON syntax: ${e.message}`;
        }
        return {
            valid: false,
            errors: [{
                path: "",
                message
            }]
        };
    }

    // Validate collection structure
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return {
            valid: false,
            errors: [{
                path: "",
                message: "Collection must be an object"
            }]
        };
    }

    validateCollectionObject(parsed, errors);

    return {
        valid: errors.length === 0,
        errors,
        collection: errors.length === 0 ? parsed as EntityCollection : undefined
    };
}
