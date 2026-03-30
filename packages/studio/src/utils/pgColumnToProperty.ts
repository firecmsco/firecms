import { EntityCollection, Property, StringProperty, NumberProperty, ArrayProperty, TableColumnInfo } from "@rebasepro/types";

// @ts-expect-error
export { TableColumnInfo };

/**
 * Maps a PostgreSQL column data type to a Rebase property type.
 */
function pgTypeToRebaseProperty(column: TableColumnInfo): Property | null {
    const {
        column_name,
        data_type,
        udt_name,
        is_nullable,
        column_default,
        enum_values
    } = column;

    const required = is_nullable === "NO";
    const prettifiedName = column_name
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase());

    // Detect if this column is a primary key (auto-generated id)
    const isAutoId = column_default != null && (
        column_default.includes("nextval") ||
        column_default.includes("gen_random_uuid") ||
        column_default.includes("uuid_generate") ||
        column_default.includes("identity")
    );

    // USER-DEFINED = PostgreSQL enums
    if (data_type === "USER-DEFINED" && enum_values && enum_values.length > 0) {
        return {
            type: "string",
            name: prettifiedName,
            enum: enum_values.map((v: string) => ({ id: v, label: v.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) })),
            validation: required ? { required: true } : undefined
        } as StringProperty;
    }

    const dt = data_type.toLowerCase();
    switch (dt) {
        case "character varying":
        case "varchar":
        case "text":
        case "char":
        case "character":
        case "citext": {
            let colType: "varchar" | "text" | "char" = "varchar";
            if (dt === "text" || dt === "citext") colType = "text";
            if (dt === "char" || dt === "character") colType = "char";
            const prop: StringProperty = {
                type: "string",
                name: prettifiedName,
                columnType: colType,
                validation: required ? { required: true } : undefined
            };
            if (isAutoId) {
                prop.isId = "manual";
            }
            return prop;
        }

        case "uuid": {
            const prop: StringProperty = {
                type: "string",
                name: prettifiedName,
                validation: required ? { required: true } : undefined
            };
            if (isAutoId) {
                prop.isId = "uuid";
            }
            return prop;
        }

        case "integer":
        case "bigint":
        case "smallint": {
            const colType = dt === "bigint" ? "bigint" : "integer";
            const prop: NumberProperty = {
                type: "number",
                name: prettifiedName,
                columnType: colType,
                validation: {
                    ...(required ? { required: true } : {}),
                    integer: true
                }
            };
            if (isAutoId) {
                prop.isId = "increment";
            }
            return prop;
        }

        case "serial":
        case "bigserial":
        case "smallserial": {
            const colType = dt === "bigserial" ? "bigserial" : "serial";
            return {
                type: "number",
                name: prettifiedName,
                columnType: colType,
                isId: "increment",
                validation: {
                    ...(required ? { required: true } : {}),
                    integer: true
                }
            } as NumberProperty;
        }

        case "numeric":
        case "decimal":
        case "real":
        case "double precision": {
            let colType: "numeric" | "real" | "double precision" = "numeric";
            if (dt === "real") colType = "real";
            if (dt === "double precision") colType = "double precision";
            return {
                type: "number",
                name: prettifiedName,
                columnType: colType,
                validation: required ? { required: true } : undefined
            };
        }

        case "boolean":
            return {
                type: "boolean",
                name: prettifiedName,
                validation: required ? { required: true } : undefined
            };

        case "timestamp with time zone":
        case "timestamp without time zone":
        case "timestamp":
        case "timestamptz":
        case "date":
        case "time with time zone":
        case "time without time zone":
        case "time": {
            let colType: "timestamp" | "date" | "time" = "timestamp";
            if (dt.startsWith("date")) colType = "date";
            if (dt.startsWith("time ") || dt === "time") colType = "time";
            return {
                type: "date",
                name: prettifiedName,
                columnType: colType,
                validation: required ? { required: true } : undefined
            };
        }

        case "jsonb":
        case "json":
            return {
                type: "map",
                name: prettifiedName,
                columnType: dt === "jsonb" ? "jsonb" : "json",
                keyValue: true,
                properties: {}
            };

        case "array":
        case "ARRAY":
            return {
                type: "array",
                name: prettifiedName,
                of: { type: "string" }
            } as ArrayProperty;

        default:
            // Fallback: treat unknown types as string
            return {
                type: "string",
                name: prettifiedName,
                validation: required ? { required: true } : undefined
            };
    }
}

/**
 * Builds a partial EntityCollection from PostgreSQL table column metadata.
 * This is used when creating a new collection from an existing database table.
 */
export function buildCollectionFromTableColumns(
    tableName: string,
    columns: TableColumnInfo[]
): Partial<EntityCollection> {
    const properties: Record<string, Property> = {};
    const propertiesOrder: string[] = [];

    for (const column of columns) {
        const property = pgTypeToRebaseProperty(column);
        if (property) {
            // Remove undefined keys so we don't output "validation: undefined"
            Object.keys(property).forEach(key => (property as unknown as Record<string, unknown>)[key] === undefined && delete (property as unknown as Record<string, unknown>)[key]);
            
            properties[column.column_name] = property;
            propertiesOrder.push(column.column_name);
        }
    }

    const prettifiedName = tableName
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase());

    return {
        name: prettifiedName,
        slug: tableName,
        dbPath: tableName,
        properties,
        propertiesOrder
    };
}
