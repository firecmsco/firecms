import { FindParams, Entity } from "@rebasepro/types";
import { FindResponse } from "./transport";
import { CollectionClient } from "./collection";

export type FilterOperator =
    | "eq" | "neq" | "gt" | "gte" | "lt" | "lte"
    | "in" | "nin" | "cs" | "csa"
    | "==" | "!=" | ">" | ">=" | "<" | "<="
    | "array-contains" | "array-contains-any"
    | "not-in";

/**
 * Maps standard operators to Rebase backend's string-based operators
 */
function mapOperator(op: FilterOperator): string {
    switch (op) {
        case "==": return "eq";
        case "!=": return "neq";
        case ">": return "gt";
        case ">=": return "gte";
        case "<": return "lt";
        case "<=": return "lte";
        case "array-contains": return "cs";
        case "array-contains-any": return "csa";
        case "not-in": return "nin";
        default: return op;
    }
}

export class QueryBuilder<M extends Record<string, any> = any> {
    private params: FindParams = { where: {} };

    constructor(private collection: CollectionClient<M>) {}

    /**
     * Add a filter condition to your query.
     * @example 
     * client.collection('users').where('age', '>=', 18).find()
     */
    where(column: keyof M & string, operator: FilterOperator, value: any): this {
        if (!this.params.where) {
            this.params.where = {};
        }

        const mappedOp = mapOperator(operator);
        let formattedValue = value;
        
        // Handle arrays for in, nin, cs, csa
        if (Array.isArray(value) && ["in", "nin", "cs", "csa"].includes(mappedOp)) {
            formattedValue = `(${value.join(",")})`;
        } else if (value === null) {
            formattedValue = "null";
        }

        this.params.where[column] = mappedOp === "eq" ? String(formattedValue) : `${mappedOp}.${formattedValue}`;
        return this;
    }

    /**
     * Order the results by a specific column.
     * @example 
     * client.collection('users').orderBy('createdAt', 'desc').find()
     */
    orderBy(column: keyof M & string, ascending: "asc" | "desc" = "asc"): this {
        this.params.orderBy = `${column}:${ascending}`;
        return this;
    }

    /**
     * Limit the number of results returned.
     */
    limit(count: number): this {
        this.params.limit = count;
        return this;
    }

    /**
     * Skip the first N results.
     */
    offset(count: number): this {
        this.params.offset = count;
        return this;
    }

    /**
     * Set a free-text search string if supported by the backend.
     */
    search(searchString: string): this {
        this.params.searchString = searchString;
        return this;
    }

    /**
     * Include related entities in the response.
     * Relations will be populated with full entity data instead of just IDs.
     *
     * @param relations - Relation names to include, or "*" for all.
     * @example
     * // Include specific relations
     * client.data.posts.include("tags", "author").find()
     *
     * // Include all relations
     * client.data.posts.include("*").find()
     */
    include(...relations: string[]): this {
        this.params.include = relations;
        return this;
    }

    /**
     * Execute the find query and return the results.
     */
    async find(): Promise<FindResponse<M>> {
        return this.collection.find(this.params) as Promise<FindResponse<M>>;
    }

    /**
     * Listen to realtime updates matching this query.
     */
    listen(onUpdate: (data: FindResponse<M>) => void, onError?: (error: Error) => void): () => void {
        if (!this.collection.listen) {
            throw new Error("Listen is only available when RebaseClient is configured with a websocketUrl.");
        }
        return this.collection.listen(this.params, onUpdate as unknown as (data: { data: Entity<M>[]; meta: any }) => void, onError);
    }
}
