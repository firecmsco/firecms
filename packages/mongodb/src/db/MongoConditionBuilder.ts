/**
 * MongoDB Condition Builder
 *
 * Translates FireCMS filter conditions to MongoDB query operators.
 */

import { FilterValues, WhereFilterOp } from "@firecms/types";
import { Filter, Document } from "mongodb";

/**
 * Mapping from FireCMS filter operators to MongoDB query operators
 */
const FIRECMS_TO_MONGO_OP: Record<WhereFilterOp, string> = {
    "<": "$lt",
    "<=": "$lte",
    "==": "$eq",
    "!=": "$ne",
    ">=": "$gte",
    ">": "$gt",
    "array-contains": "$elemMatch",
    "array-contains-any": "$in",
    "in": "$in",
    "not-in": "$nin"
};

/**
 * MongoDB Condition Builder
 *
 * Provides static methods to translate FireCMS filter conditions
 * to MongoDB query filters.
 */
export class MongoConditionBuilder {
    /**
     * Build MongoDB filter conditions from FireCMS FilterValues
     *
     * @param filter - FireCMS filter values
     * @returns Array of MongoDB filter objects
     */
    static buildFilterConditions<M extends Record<string, any>>(
        filter: FilterValues<Extract<keyof M, string>>
    ): Filter<Document>[] {
        if (!filter) return [];

        const conditions: Filter<Document>[] = [];

        for (const [field, filterParam] of Object.entries(filter)) {
            if (!filterParam) continue;

            const [op, value] = filterParam as [WhereFilterOp, any];
            const mongoOp = FIRECMS_TO_MONGO_OP[op];

            if (!mongoOp) {
                console.warn(`Unsupported filter operator: ${op}`);
                continue;
            }

            // Handle array-contains specially
            if (op === "array-contains") {
                conditions.push({
                    [field]: { $elemMatch: { $eq: value } }
                });
            } else {
                conditions.push({
                    [field]: { [mongoOp]: value }
                });
            }
        }

        return conditions;
    }

    /**
     * Build search conditions for text search
     *
     * @param searchString - Text to search for
     * @param properties - Properties to search in
     * @returns Array of MongoDB filter objects for text search
     */
    static buildSearchConditions(
        searchString: string,
        properties: Record<string, any>
    ): Filter<Document>[] {
        if (!searchString) return [];

        // Build regex conditions for each searchable string property
        const orConditions: Filter<Document>[] = [];
        const searchRegex = new RegExp(searchString, "i");

        for (const [key, prop] of Object.entries(properties)) {
            // Only search in string-type properties
            if (prop?.dataType === "string" || typeof prop === "string") {
                orConditions.push({
                    [key]: { $regex: searchRegex }
                });
            }
        }

        // If no properties to search, use MongoDB text search
        if (orConditions.length === 0) {
            return [{ $text: { $search: searchString } }];
        }

        return orConditions;
    }

    /**
     * Combine multiple conditions with AND operator
     *
     * @param conditions - Array of filter conditions
     * @returns Combined filter or undefined if empty
     */
    static combineConditionsWithAnd(conditions: Filter<Document>[]): Filter<Document> | undefined {
        if (conditions.length === 0) return undefined;
        if (conditions.length === 1) return conditions[0];
        return { $and: conditions };
    }

    /**
     * Combine multiple conditions with OR operator
     *
     * @param conditions - Array of filter conditions
     * @returns Combined filter or undefined if empty
     */
    static combineConditionsWithOr(conditions: Filter<Document>[]): Filter<Document> | undefined {
        if (conditions.length === 0) return undefined;
        if (conditions.length === 1) return conditions[0];
        return { $or: conditions };
    }

    /**
     * Build a complete MongoDB query from FireCMS options
     *
     * @param options - FireCMS fetch options
     * @returns MongoDB filter object
     */
    static buildQuery<M extends Record<string, any>>(options: {
        filter?: FilterValues<Extract<keyof M, string>>;
        searchString?: string;
        properties?: Record<string, any>;
    }): Filter<Document> {
        const conditions: Filter<Document>[] = [];

        // Add filter conditions
        if (options.filter) {
            const filterConditions = this.buildFilterConditions<M>(options.filter);
            conditions.push(...filterConditions);
        }

        // Add search conditions
        if (options.searchString && options.properties) {
            const searchConditions = this.buildSearchConditions(
                options.searchString,
                options.properties
            );
            if (searchConditions.length > 0) {
                // Search conditions are OR'd together
                const searchFilter = this.combineConditionsWithOr(searchConditions);
                if (searchFilter) {
                    conditions.push(searchFilter);
                }
            }
        }

        return this.combineConditionsWithAnd(conditions) ?? {};
    }

    /**
     * Build MongoDB sort options from FireCMS options
     *
     * @param orderBy - Field to order by
     * @param order - Sort direction
     * @returns MongoDB sort object
     */
    static buildSort(
        orderBy?: string,
        order?: "asc" | "desc"
    ): Record<string, 1 | -1> | undefined {
        if (!orderBy) return undefined;
        return { [orderBy]: order === "desc" ? -1 : 1 };
    }
}
