import { Transport, FindParams, FindResponse, buildQueryString } from "./transport";
import { RebaseWebSocketClient } from "./websocket";
import { Entity, FilterValues, WhereFilterOp } from "@rebasepro/types";

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

export interface CollectionClient<Row, Insert, Update> {
    find(params?: FindParams): Promise<FindResponse<Row>>;
    findById(id: string | number): Promise<Row | undefined>;
    create(data: Insert): Promise<Row>;
    update(id: string | number, data: Update): Promise<Row>;
    delete(id: string | number): Promise<void>;
    listen?(params: FindParams | undefined, onUpdate: (data: FindResponse<Row>) => void, onError?: (error: Error) => void): () => void;
    listenById?(id: string | number, onUpdate: (data: Row | undefined) => void, onError?: (error: Error) => void): () => void;
}

export function createCollectionClient<Row, Insert, Update>(transport: Transport, slug: string, ws?: RebaseWebSocketClient): CollectionClient<Row, Insert, Update> {
    const basePath = `/${slug}`;

    return {
        async find(params?: FindParams) {
            const qs = buildQueryString(params);
            return transport.request<FindResponse<Row>>(basePath + qs, { method: "GET" });
        },

        async findById(id: string | number) {
            return transport.request<Row>(`${basePath}/${encodeURIComponent(String(id))}`, { method: "GET" });
        },

        async create(data: Insert) {
            return transport.request<Row>(basePath, {
                method: "POST",
                body: JSON.stringify(data),
            });
        },

        async update(id: string | number, data: Update) {
            return transport.request<Row>(`${basePath}/${encodeURIComponent(String(id))}`, {
                method: "PUT",
                body: JSON.stringify(data),
            });
        },

        async delete(id: string | number) {
            return transport.request<void>(`${basePath}/${encodeURIComponent(String(id))}`, {
                method: "DELETE",
            });
        },

        ...(ws && {
            listen(params: FindParams | undefined, onUpdate: (data: FindResponse<Row>) => void, onError?: (error: Error) => void) {
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
                        const rows = entities.map(e => ({ id: e.id, ...e.values } as unknown as Row));
                        onUpdate({ data: rows, meta: { total: rows.length, limit: params?.limit || 20, offset: params?.offset || 0, hasMore: false } });
                    },
                    onError
                );
            },

            listenById(id: string | number, onUpdate: (data: Row | undefined) => void, onError?: (error: Error) => void) {
                return ws.listenEntity(
                    { path: slug, entityId: String(id) },
                    (entity: Entity | null) => {
                        if (entity) {
                            onUpdate({ id: entity.id, ...entity.values } as unknown as Row);
                        } else {
                            onUpdate(undefined);
                        }
                    },
                    onError
                );
            }
        })
    };
}
