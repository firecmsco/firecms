import { Transport, FindParams, FindResponse, buildQueryString } from "./transport";
import { RebaseWebSocketClient } from "./websocket";
import { Entity, FilterValues, WhereFilterOp, CollectionAccessor } from "@rebasepro/types";

import { FilterOperator, QueryBuilder } from "./query_builder";

function parseWhereFilter(where?: Record<string, string>): FilterValues<any> | undefined {
    if (!where) return undefined;
    const filters: any = {};
    for (const [key, value] of Object.entries(where)) {
        const dotIndex = value.indexOf(".");
        if (dotIndex > 0) {
            const opStr = value.substring(0, dotIndex);
            const valStr = value.substring(dotIndex + 1);
            let op: WhereFilterOp = "==";
            let val: any = valStr;
            
            switch (opStr) {
                case "eq": op = "=="; break;
                case "neq": op = "!="; break;
                case "gt": op = ">"; break;
                case "gte": op = ">="; break;
                case "lt": op = "<"; break;
                case "lte": op = "<="; break;
                case "in": 
                    op = "in";
                    val = valStr.startsWith("(") && valStr.endsWith(")") 
                        ? valStr.slice(1, -1).split(",").map(v => v.trim())
                        : valStr.split(",");
                    break;
                case "nin": 
                    op = "not-in";
                    val = valStr.startsWith("(") && valStr.endsWith(")") 
                        ? valStr.slice(1, -1).split(",").map(v => v.trim())
                        : valStr.split(",");
                    break;
                case "cs": op = "array-contains"; break;
                case "csa": 
                    op = "array-contains-any";
                    val = valStr.startsWith("(") && valStr.endsWith(")") 
                        ? valStr.slice(1, -1).split(",").map(v => v.trim())
                        : valStr.split(",");
                    break;
                default: op = "=="; val = value;
            }
            // Simple type inference for parsing from URL-like strings
            if (val === "true") val = true;
            else if (val === "false") val = false;
            else if (val === "null") val = null;
            else if (typeof val === "string" && /^[0-9]+(\.[0-9]+)?$/.test(val)) val = Number(val);
            
            filters[key] = [op, val];
        } else {
            filters[key] = ["==", value];
        }
    }
    return filters;
}

/**
 * Wrap a flat row (returned by the REST API as `{ id, ...fields }`) into
 * a proper `Entity<M>` structure expected by the core framework.
 */
function rowToEntity<M extends Record<string, any>>(row: Record<string, any>, slug: string): Entity<M> {
    const { id, ...values } = row;
    return {
        id: id,
        path: slug,
        values: values as M
    };
}

/**
 * CollectionClient extends `CollectionAccessor` from `@rebasepro/types` so that
 * `client.data` can be passed directly to the core Rebase component.
 *
 * Additionally it exposes fluent query builder methods like `.where()`, `.orderBy()`.
 */
export interface CollectionClient<M extends Record<string, any> = any> extends CollectionAccessor<M> {
    // Fluent Query Builder
    where(column: keyof M & string, operator: FilterOperator, value: any): QueryBuilder<M>;
    orderBy(column: keyof M & string, ascending?: "asc" | "desc"): QueryBuilder<M>;
    limit(count: number): QueryBuilder<M>;
    offset(count: number): QueryBuilder<M>;
    search(searchString: string): QueryBuilder<M>;
}

export function createCollectionClient<M extends Record<string, any> = any>(transport: Transport, slug: string, ws?: RebaseWebSocketClient): CollectionClient<M> {
    const basePath = `/${slug}`;

    return {
        async find(params?: FindParams) {
            const qs = buildQueryString(params);
            const raw = await transport.request<{ data: Record<string, any>[]; meta: any }>(basePath + qs, { method: "GET" });
            return {
                data: (raw.data || []).map((row: Record<string, any>) => rowToEntity<M>(row, slug)),
                meta: raw.meta
            };
        },

        async findById(id: string | number) {
            const raw = await transport.request<Record<string, any>>(`${basePath}/${encodeURIComponent(String(id))}`, { method: "GET" });
            if (!raw) return undefined;
            return rowToEntity<M>(raw, slug);
        },

        async create(data: Partial<M>, id?: string | number) {
            const body: any = { ...data };
            if (id !== undefined) {
                body.id = id;
            }
            const raw = await transport.request<Record<string, any>>(basePath, {
                method: "POST",
                body: JSON.stringify(body),
            });
            return rowToEntity<M>(raw, slug);
        },

        async update(id: string | number, data: Partial<M>) {
            const raw = await transport.request<Record<string, any>>(`${basePath}/${encodeURIComponent(String(id))}`, {
                method: "PUT",
                body: JSON.stringify(data),
            });
            return rowToEntity<M>(raw, slug);
        },

        async delete(id: string | number) {
            return transport.request<void>(`${basePath}/${encodeURIComponent(String(id))}`, {
                method: "DELETE",
            });
        },

        ...(ws && {
            listen(params: FindParams | undefined, onUpdate: (data: { data: Entity<M>[]; meta: any }) => void, onError?: (error: Error) => void) {
                return ws.listenCollection(
                    {
                        path: slug,
                        filter: parseWhereFilter(params?.where),
                        limit: params?.limit,
                        startAfter: params?.offset ? String(params.offset) : undefined,
                        orderBy: params?.orderBy?.split(":")[0],
                        order: params?.orderBy?.split(":")[1] as "asc" | "desc",
                        searchString: params?.searchString
                    },
                    (entities: Entity[]) => {
                        onUpdate({
                            data: entities as Entity<M>[],
                            meta: {
                                total: entities.length,
                                limit: params?.limit || 20,
                                offset: params?.offset || 0,
                                hasMore: false
                            }
                        });
                    },
                    onError
                );
            },

            listenById(id: string | number, onUpdate: (data: Entity<M> | undefined) => void, onError?: (error: Error) => void) {
                return ws.listenEntity(
                    { path: slug, entityId: String(id) },
                    (entity: Entity | null) => {
                        if (entity) {
                            onUpdate(entity as Entity<M>);
                        } else {
                            onUpdate(undefined);
                        }
                    },
                    onError
                );
            }
        }),

        // Fluent builder instantiation
        where(column: keyof M & string, operator: FilterOperator, value: any) {
            return new QueryBuilder<M>(this as any).where(column, operator, value);
        },
        orderBy(column: keyof M & string, ascending?: "asc" | "desc") {
            return new QueryBuilder<M>(this as any).orderBy(column, ascending);
        },
        limit(count: number) {
            return new QueryBuilder<M>(this as any).limit(count);
        },
        offset(count: number) {
            return new QueryBuilder<M>(this as any).offset(count);
        },
        search(searchString: string) {
            return new QueryBuilder<M>(this as any).search(searchString);
        }
    };
}
