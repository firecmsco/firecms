import { EntityCollection, Property } from "@rebasepro/types";

export function generateOpenApiSpec(collections: EntityCollection[], basePath: string = "/api"): Record<string, unknown> {
    const spec = {
        openapi: "3.0.0",
        info: {
            title: "Rebase Auto-Generated API",
            version: "1.0.0",
            description: "Automatically generated REST API from Rebase collections"
        },
        servers: [
            {
                url: basePath,
                description: "API Server"
            }
        ],
        paths: {} as Record<string, unknown>,
        components: {
            schemas: {} as Record<string, unknown>
        }
    };

    (collections || []).forEach(collection => {
        const schemaName = collection.singularName || collection.name;
        spec.components.schemas[schemaName] = {
            type: "object",
            properties: {
                id: { type: "string" },
                ...Object.entries(collection.properties).reduce((props, [key, property]) => {
                    if (property.type !== "relation") {
                        props[key] = convertPropertyToOpenApiType(property);
                    }
                    return props;
                }, {} as Record<string, unknown>)
            }
        };

        const collectionPath = `/${collection.slug}`;

        spec.paths[collectionPath] = {
            get: {
                summary: `List ${collection.name}`,
                parameters: [
                    { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
                    { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
                    { name: "where", in: "query", schema: { type: "string" } },
                    { name: "orderBy", in: "query", schema: { type: "string" } }
                ],
                responses: {
                    200: {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        data: {
                                            type: "array",
                                            items: { $ref: `#/components/schemas/${schemaName}` }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                summary: `Create ${schemaName}`,
                requestBody: {
                    content: {
                        "application/json": {
                            schema: { $ref: `#/components/schemas/${schemaName}` }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Created",
                        content: {
                            "application/json": {
                                schema: { $ref: `#/components/schemas/${schemaName}` }
                            }
                        }
                    }
                }
            }
        };

        spec.paths[`${collectionPath}/{id}`] = {
            get: {
                summary: `Get ${schemaName} by ID`,
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                responses: {
                    200: {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: { $ref: `#/components/schemas/${schemaName}` }
                            }
                        }
                    }
                }
            },
            put: {
                summary: `Update ${schemaName}`,
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: { $ref: `#/components/schemas/${schemaName}` }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Updated",
                        content: {
                            "application/json": {
                                schema: { $ref: `#/components/schemas/${schemaName}` }
                            }
                        }
                    }
                }
            },
            delete: {
                summary: `Delete ${schemaName}`,
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                responses: {
                    204: { description: "Deleted" }
                }
            }
        };
    });

    return spec;
}

function convertPropertyToOpenApiType(property: Property): Record<string, unknown> {
    switch (property.type) {
        case "string":
            return { type: "string" };
        case "number":
            return { type: "number" };
        case "boolean":
            return { type: "boolean" };
        case "date":
            return { type: "string", format: "date-time" };
        case "array":
            return { type: "array", items: { type: "string" } };
        default:
            return { type: "string" };
    }
}
