import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FireCMSApiClient } from "../api-client.js";

/**
 * Property schema definition for collection properties.
 * Supports all FireCMS property types.
 */
const PropertySchema = z.object({
    dataType: z.enum([
        "string", "number", "boolean", "date", "map",
        "array", "geopoint", "reference",
    ]).describe("The data type of this property"),
    name: z.string().optional().describe("Display name for the property"),
    description: z.string().optional().describe("Description shown as a tooltip"),
    validation: z.record(z.any()).optional().describe("Validation rules (e.g., { required: true, min: 0, max: 100 })"),
    enumValues: z.array(z.object({
        id: z.string().describe("Enum value ID"),
        label: z.string().describe("Display label"),
        color: z.string().optional().describe("Color for the enum chip"),
    })).optional().describe("Enum values for string/number fields (renders as select/chips)"),
    multiline: z.boolean().optional().describe("For strings: render as textarea"),
    markdown: z.boolean().optional().describe("For strings: render as markdown editor"),
    url: z.union([z.boolean(), z.enum(["image", "video", "audio"])]).optional().describe("For strings: treat as URL, optionally specify media type"),
    email: z.boolean().optional().describe("For strings: validate as email"),
    storage: z.object({
        storagePath: z.string().describe("Firebase Storage path"),
        acceptedFiles: z.array(z.string()).optional().describe("Accepted MIME types"),
        maxSize: z.number().optional().describe("Max file size in bytes"),
    }).optional().describe("For strings: file upload configuration"),
    of: z.any().optional().describe("For arrays: the property definition of array items"),
    properties: z.record(z.any()).optional().describe("For maps: nested property definitions"),
    path: z.string().optional().describe("For references: target collection path"),
    previewProperties: z.array(z.string()).optional().describe("For references: properties to show in preview"),
    disabled: z.boolean().optional().describe("If true, field is read-only in the form"),
    columnWidth: z.number().optional().describe("Column width in pixels for table view"),
    hideFromCollection: z.boolean().optional().describe("If true, hide from the table view"),
}).passthrough();

/**
 * Register collection schema CRUD tools — manage the collection configurations
 * stored in FireCMS Cloud. Admin-only operations.
 */
export function registerCollectionSchemaTools(server: McpServer, api: FireCMSApiClient) {

    // ─── 1. List all collection schemas ────────────────────

    server.registerTool(
        "list_collection_schemas",
        {
            description: `List all persisted collection schemas for a FireCMS project. Returns the collection 
configurations (name, path, properties, etc.) that define how data is displayed and edited in the CMS.`,
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ projectId }) => {
            try {
                await api.assertAdmin(projectId);
                const schemas = await api.listCollectionSchemas(projectId);
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify(schemas, null, 2),
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.response?.data?.error ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 2. Get a single collection schema ─────────────────

    server.registerTool(
        "get_collection_schema",
        {
            description: `Get the full schema definition for a specific collection, including all properties, 
validation rules, display configuration, and subcollection definitions.`,
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                collectionId: z.string().describe("Collection ID (usually same as the Firestore path, e.g., 'products')"),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ projectId, collectionId }) => {
            try {
                await api.assertAdmin(projectId);
                const schema = await api.getCollectionSchema(projectId, collectionId);
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify(schema, null, 2),
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.response?.data?.error ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 3. Save (create/replace) a collection schema ──────

    server.registerTool(
        "save_collection_schema",
        {
            description: `Create or fully replace a collection schema. This defines how a Firestore collection 
is displayed and edited in FireCMS. Requires at minimum: id, path, and name. 

Example schema:
{
  "id": "products",
  "path": "products",
  "name": "Products",
  "singularName": "Product",
  "icon": "ShoppingCart",
  "description": "Product catalog",
  "group": "Shop",
  "properties": {
    "name": { "dataType": "string", "name": "Name", "validation": { "required": true } },
    "price": { "dataType": "number", "name": "Price", "validation": { "required": true, "min": 0 } },
    "status": { "dataType": "string", "name": "Status", "enumValues": [
      { "id": "draft", "label": "Draft" },
      { "id": "published", "label": "Published" }
    ]}
  },
  "propertiesOrder": ["name", "price", "status"]
}`,
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                collectionId: z.string().describe("Collection ID (e.g., 'products')"),
                schema: z.object({
                    path: z.string().describe("Firestore collection path"),
                    name: z.string().describe("Display name for the collection"),
                    singularName: z.string().optional().describe("Singular name (e.g., 'Product')"),
                    description: z.string().optional().describe("Collection description"),
                    icon: z.string().optional().describe("Material icon name (e.g., 'ShoppingCart')"),
                    group: z.string().optional().describe("Navigation group name"),
                    properties: z.record(PropertySchema).describe("Property definitions keyed by field name"),
                    propertiesOrder: z.array(z.string()).optional().describe("Display order of properties"),
                    defaultSize: z.enum(["xs", "s", "m", "l", "xl"]).optional().describe("Default row size in table"),
                    initialSort: z.tuple([z.string(), z.enum(["asc", "desc"])]).optional().describe("Default sort [field, direction]"),
                }).passthrough().describe("Complete collection schema definition"),
            },
        },
        async ({ projectId, collectionId, schema }) => {
            try {
                await api.assertAdmin(projectId);
                const fullSchema = { id: collectionId, ...schema };
                const result = await api.saveCollectionSchema(projectId, collectionId, fullSchema);
                return {
                    content: [{
                        type: "text" as const,
                        text: `Collection schema "${collectionId}" saved successfully.\n\n${JSON.stringify(result, null, 2)}`,
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.response?.data?.error ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 4. Update (partial) a collection schema ───────────

    server.registerTool(
        "update_collection_schema",
        {
            description: `Partially update an existing collection schema. Only the specified fields are modified 
(merged with the existing schema). Use this for changes like renaming, updating the group, 
changing display settings, or adding new properties.`,
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                collectionId: z.string().describe("Collection ID to update"),
                data: z.record(z.any()).describe("Fields to update (merged with existing schema)"),
            },
        },
        async ({ projectId, collectionId, data }) => {
            try {
                await api.assertAdmin(projectId);
                const result = await api.updateCollectionSchema(projectId, collectionId, data);
                return {
                    content: [{
                        type: "text" as const,
                        text: `Collection schema "${collectionId}" updated successfully.\n\n${JSON.stringify(result, null, 2)}`,
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.response?.data?.error ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 5. Delete a collection schema ─────────────────────

    server.registerTool(
        "delete_collection_schema",
        {
            description: `Delete a collection schema from FireCMS. This removes the collection configuration 
from the CMS — it does NOT delete the underlying Firestore data. The collection will simply 
no longer appear in the FireCMS UI.`,
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                collectionId: z.string().describe("Collection ID to delete"),
            },
            annotations: { destructiveHint: true },
        },
        async ({ projectId, collectionId }) => {
            try {
                await api.assertAdmin(projectId);
                await api.deleteCollectionSchema(projectId, collectionId);
                return {
                    content: [{
                        type: "text" as const,
                        text: `Collection schema "${collectionId}" deleted successfully. Note: the underlying Firestore data was not affected.`,
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.response?.data?.error ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 6. Save (add/update) a single property ────────────

    server.registerTool(
        "save_property",
        {
            description: `Add or update a single property in a collection schema. This is more granular than 
updating the entire schema — use it when you want to add a new field or modify an existing 
one without affecting other properties.

Example property:
{
  "dataType": "string",
  "name": "Description",
  "description": "Product description",
  "multiline": true,
  "validation": { "required": true, "max": 500 }
}`,
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                collectionId: z.string().describe("Collection ID"),
                propertyKey: z.string().describe("Property field key (e.g., 'description', 'price')"),
                property: PropertySchema.describe("Property definition"),
                namespace: z.string().optional().describe("Dot-separated namespace for nested properties in maps (e.g., 'address' for address.street)"),
            },
        },
        async ({ projectId, collectionId, propertyKey, property, namespace }) => {
            try {
                await api.assertAdmin(projectId);
                const result = await api.saveProperty(projectId, collectionId, propertyKey, property, namespace);
                return {
                    content: [{
                        type: "text" as const,
                        text: `Property "${propertyKey}" saved in collection "${collectionId}" successfully.\n\n${JSON.stringify(result, null, 2)}`,
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.response?.data?.error ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );

    // ─── 7. Delete a property ──────────────────────────────

    server.registerTool(
        "delete_property",
        {
            description: `Remove a property from a collection schema. This removes the field definition from 
the CMS configuration — it does NOT delete the field from existing Firestore documents.`,
            inputSchema: {
                projectId: z.string().describe("Firebase project ID"),
                collectionId: z.string().describe("Collection ID"),
                propertyKey: z.string().describe("Property key to remove"),
                namespace: z.string().optional().describe("Dot-separated namespace for nested properties"),
            },
            annotations: { destructiveHint: true },
        },
        async ({ projectId, collectionId, propertyKey, namespace }) => {
            try {
                await api.assertAdmin(projectId);
                await api.deleteProperty(projectId, collectionId, propertyKey, namespace);
                return {
                    content: [{
                        type: "text" as const,
                        text: `Property "${propertyKey}" removed from collection "${collectionId}". Note: existing Firestore data was not affected.`,
                    }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text" as const, text: `Error: ${error.response?.data?.error ?? error.message}` }],
                    isError: true,
                };
            }
        }
    );
}
