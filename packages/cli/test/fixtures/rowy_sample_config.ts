import { RowyColumn, RowyConfig } from "../../src/commands/migrate_rowy/types";

/**
 * A Rowy project with one table per concern. Column shapes follow what Rowy writes to
 * `_rowy_/settings/schema/{tableId}` (rowyio/rowy, src/types/table.d.ts).
 */
function column(fieldName: string, type: string, extra: Partial<RowyColumn> = {}): RowyColumn {
    return { key: fieldName, fieldName, name: fieldName, type, ...extra };
}

function columns(...list: RowyColumn[]) {
    return Object.fromEntries(list.map((c, index) => [c.fieldName, { index, ...c }]));
}

export function sampleConfig(): RowyConfig {
    return {
        settings: {
            services: { hooks: "https://rowy-hooks-example.a.run.app" },
            tables: [
                {
                    id: "products",
                    collection: "products",
                    name: "Products",
                    section: "Shop",
                    roles: ["ADMIN", "EDITOR"],
                    modifiableBy: ["ADMIN"],
                    tableType: "primaryCollection"
                },
                {
                    id: "orders-group",
                    collection: "orders",
                    name: "All orders",
                    roles: ["ADMIN"],
                    tableType: "collectionGroup",
                    readOnly: true,
                    audit: false
                },
                {
                    id: "missing",
                    collection: "missing",
                    name: "No schema"
                }
            ]
        },
        schemas: {
            products: {
                idType: "custom",
                sorts: [{ key: "title", direction: "desc" }, { key: "price", direction: "asc" }],
                filters: [
                    { key: "status", operator: "==", value: "live" },
                    { key: "createdAt", operator: "date-after", value: "2024-01-01" }
                ],
                columns: columns(
                    column("title", "SIMPLE_TEXT", { config: { required: true, validationRegex: "^[A-Z]" } }),
                    column("summary", "LONG_TEXT", { hidden: true, width: 320.4 }),
                    column("body", "RICH_TEXT"),
                    column("notes", "MARKDOWN"),
                    column("contact", "EMAIL"),
                    column("phone", "PHONE_NUMBER"),
                    column("website", "URL"),
                    column("snippet", "CODE"),
                    column("status", "SINGLE_SELECT", { config: { options: ["live", "draft", "live"], defaultValue: { type: "static", value: "draft" } } }),
                    column("tags", "MULTI_SELECT", { config: { options: ["a", "b"], freeText: true } }),
                    column("inStock", "CHECK_BOX"),
                    column("price", "NUMBER", { editable: false }),
                    column("discount", "PERCENTAGE"),
                    column("stars", "RATING", { config: { max: 10 } }),
                    column("weight", "SLIDER", { config: { min: 1, max: 50, unit: "kg" } }),
                    column("brandColor", "COLOR"),
                    column("location", "GEO_POINT"),
                    column("releaseDate", "DATE"),
                    column("publishedAt", "DATE_TIME"),
                    column("availability", "DURATION"),
                    column("photos", "IMAGE"),
                    column("manuals", "FILE"),
                    column("supplier", "REFERENCE"),
                    column("related", "DOCUMENT_SELECT", { config: { index: "products", multiple: true } }),
                    column("variants", "SUB_TABLE"),
                    column("specs", "ARRAY_SUB_TABLE"),
                    column("metadata", "JSON"),
                    column("slug", "DERIVATIVE", {
                        config: {
                            renderFieldType: "SIMPLE_TEXT",
                            listenerFields: ["title"],
                            derivativeFn: "const derivative = async ({ row }) => row.title.toLowerCase();"
                        }
                    }),
                    column("margin", "FORMULA", { config: { formulaFn: "const formula = async ({ row }) => row.price * 0.2;" } }),
                    column("publish", "ACTION", { config: { runFn: "const action = async ({ row }) => ({ success: true });", isActionScript: true } }),
                    column("reindex", "ACTION", { config: { callableName: "reindexProduct", isActionScript: false } }),
                    column("stage", "STATUS", {
                        config: {
                            conditions: [
                                { type: "string", value: "a", label: "Alpha" },
                                { type: "string", value: "b", label: "Beta" },
                                { type: "null", value: null, label: "" }
                            ]
                        }
                    }),
                    column("owner", "USER"),
                    column("_createdBy.timestamp", "CREATED_AT", { name: "Created at" }),
                    column("_createdBy", "CREATED_BY", { name: "Created by" }),
                    column("_updatedBy", "UPDATED_BY", { name: "Updated by" }),
                    column("sku", "SIMPLE_TEXT", {
                        config: { defaultValue: { type: "dynamic", dynamicValueFn: "const dynamicValueFn = async () => 'SKU-1';" } }
                    }),
                    column("id", "ID"),
                    column("mystery", "SOMETHING_NEW")
                ),
                subTables: {
                    variants: {
                        columns: columns(
                            column("size", "SINGLE_SELECT", { config: { options: ["S", "M"] } }),
                            column("stock", "NUMBER")
                        )
                    },
                    specs: {
                        columns: columns(
                            column("label", "SIMPLE_TEXT"),
                            column("value", "SIMPLE_TEXT")
                        )
                    }
                },
                extensionObjects: [
                    {
                        name: "Search index",
                        type: "algoliaIndex",
                        active: true,
                        triggers: ["create", "update", "delete"],
                        conditions: "const condition = async () => true;",
                        extensionBody: "const extensionBody = async ({ row }) => ({ fieldsToSync: ['title'] });"
                    },
                    {
                        name: "Notify",
                        type: "slackMessage",
                        active: false,
                        triggers: ["create"],
                        // An obviously fake value, only to exercise the credential check
                        extensionBody: "const apiKey = \"not-a-real-key-0000\";\nconst extensionBody = async () => ({});"
                    }
                ],
                webhooks: [
                    {
                        name: "Typeform",
                        type: "typeform",
                        active: true,
                        endpoint: "abc123",
                        parser: "const parser = async ({ req }) => req.body;",
                        auth: { secret: "WEBHOOK-AUTH-MARKER", enabled: true }
                    }
                ]
            }
        },
        groupSchemas: {
            "orders-group": {
                idType: "decrement",
                columns: columns(
                    column("total", "NUMBER"),
                    column("placedAt", "DATE_TIME")
                )
            }
        }
    };
}
