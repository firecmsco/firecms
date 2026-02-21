import { BaseProperty, EntityReference } from "@firecms/core";

interface SQLReferenceProperty extends BaseProperty<EntityReference> {
    type: "reference";

    /**
     * Name of the table this reference points to.
     * You can leave this prop undefined if the table is not yet known,
     * e.g. you are using a property builder and the table name depends on a different property.
     */
    tableName?: string;

    /**
     * Name of the column in the table that this reference points to.
     * Defaults to "id" if not specified.
     */
    columnName?: string;

    /**
     * Allow selection of rows that pass the given filter only.
     * e.g. `forceFilter: { name: [["LIKE", "%Smith%"]] }`
     */
    forceFilter?: SQLFilterValues;

    /**
     * Properties/columns that need to be rendered when displaying a preview of this reference.
     * If not specified, the first 3 columns are used. Only the first 3 specified values are considered.
     */
    previewProperties?: string[];

    /**
     * Should the reference include the ID of the entity (row). Defaults to `true`
     */
    includeId?: boolean;

    /**
     * Should the reference include a link to the entity (open the entity details). Defaults to `true`
     */
    includeEntityLink?: boolean;

    /**
     * Specify any intermediate tables/columns for many-to-many relationships.
     * This can be an array of objects specifying table and column mappings.
     */
    intermediateTables?: IntermediateTable[];

    /**
     * Name of the table that references this table.
     */
    referencedByTable?: string;

    /**
     * Name of the column in the referencing table that points to this table.
     */
    referencedByColumn?: string;
}

/**
 * Represents filter values in an SQL context.
 * Each key is a column and the value is an array of conditions.
 */
interface SQLFilterValues {
    [column: string]: [SQLComparisonOperator, any][];
}

/**
 * Comparison operators used in SQL, could be extended based on requirements.
 */
type SQLComparisonOperator = "=" | "!=" | ">" | ">=" | "<" | "<=" | "LIKE" | "IN";

// export type WhereFilterOp =
//     | "<"
//     | "<="
//     | "=="
//     | "!="
//     | ">="
//     | ">"
//     | "array-contains"
//     | "in"
//     | "not-in"
//     | "array-contains-any";

/**
 * Represents an intermediate table used for many-to-many relationships in SQL.
 */
interface IntermediateTable {
    intermediateTableName: string;
    sourceColumn: string;
    targetColumn: string;
}
