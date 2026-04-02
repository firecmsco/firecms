import {
    DataDriver,
    RebaseData,
    CollectionAccessor,
    FindParams,
    FindResponse,
    Entity,
    EntityValues,
    FilterValues,
    WhereFilterOp
} from "@rebasepro/types";

/**
 * Convert PostgREST-style filter object to the internal DataDriver FilterValues format.
 *
 * PostgREST: { status: "eq.published", age: "gte.18" }
 * Internal:  { status: ["==", "published"], age: [">=", 18] }
 */
function convertWhereToFilter(where?: Record<string, string>): FilterValues<string> | undefined {
    if (!where) return undefined;

    const operatorMap: Record<string, WhereFilterOp> = {
        "eq": "==",
        "neq": "!=",
        "gt": ">",
        "gte": ">=",
        "lt": "<",
        "lte": "<=",
        "in": "in",
        "nin": "not-in",
        "cs": "array-contains",
        "csa": "array-contains-any",
    };

    const filter: FilterValues<string> = {};

    for (const [field, rawValue] of Object.entries(where)) {
        const dotIndex = rawValue.indexOf(".");
        if (dotIndex === -1) continue;

        const op = rawValue.substring(0, dotIndex);
        let value: any = rawValue.substring(dotIndex + 1);

        // Parse list values like "(admin,editor)"
        if (value.startsWith("(") && value.endsWith(")")) {
            value = value.slice(1, -1).split(",").map((v: string) => v.trim());
        }

        // Try to parse numbers
        if (typeof value === "string" && !isNaN(Number(value)) && value.trim() !== "") {
            value = Number(value);
        }

        const mappedOp = operatorMap[op];
        if (mappedOp) {
            filter[field] = [mappedOp, value];
        }
    }

    return Object.keys(filter).length > 0 ? filter : undefined;
}

/**
 * Parse an orderBy string like "created_at:desc" into [field, direction].
 */
function parseOrderBy(orderBy?: string): [string, "asc" | "desc"] | undefined {
    if (!orderBy) return undefined;
    const parts = orderBy.split(":");
    const field = parts[0];
    const direction = (parts[1] as "asc" | "desc") || "asc";
    return [field, direction];
}

/**
 * Create a CollectionAccessor that delegates to a DataDriver for a given collection slug.
 */
function createDriverAccessor<M extends Record<string, any> = any>(
    driver: DataDriver,
    slug: string
): CollectionAccessor<M> {
    return {
        async find(params?: FindParams): Promise<FindResponse<M>> {
            const orderParsed = parseOrderBy(params?.orderBy);
            const entities = await driver.fetchCollection<M>({
                path: slug,
                limit: params?.limit,
                startAfter: params?.offset,
                filter: convertWhereToFilter(params?.where),
                orderBy: orderParsed?.[0],
                order: orderParsed?.[1],
                searchString: params?.searchString,
            });
            const limit = params?.limit ?? 20;
            const offset = params?.offset ?? 0;
            return {
                data: entities,
                meta: {
                    total: entities.length,
                    limit,
                    offset,
                    hasMore: entities.length >= limit
                }
            };
        },

        async findById(id: string | number): Promise<Entity<M> | undefined> {
            return driver.fetchEntity<M>({ path: slug, entityId: id });
        },

        async create(data: Partial<EntityValues<M>>, id?: string | number): Promise<Entity<M>> {
            return driver.saveEntity<M>({
                path: slug,
                values: data,
                entityId: id,
                status: "new"
            });
        },

        async update(id: string | number, data: Partial<EntityValues<M>>): Promise<Entity<M>> {
            return driver.saveEntity<M>({
                path: slug,
                values: data,
                entityId: id,
                status: "existing"
            });
        },

        async delete(id: string | number): Promise<void> {
            return driver.deleteEntity({
                entity: { id, path: slug, values: {} as Record<string, unknown> }
            });
        },

        count: driver.countEntities
            ? async (params?: FindParams): Promise<number> => {
                return driver.countEntities!({
                    path: slug,
                    filter: convertWhereToFilter(params?.where),
                });
            }
            : undefined,

        listen: driver.listenCollection
            ? (params: FindParams | undefined, onUpdate: (response: FindResponse<M>) => void, onError?: (error: Error) => void) => {
                const orderParsed = parseOrderBy(params?.orderBy);
                const limit = params?.limit ?? 20;
                const offset = params?.offset ?? 0;
                return driver.listenCollection!<M>({
                    path: slug,
                    limit: params?.limit,
                    startAfter: params?.offset,
                    filter: convertWhereToFilter(params?.where),
                    orderBy: orderParsed?.[0],
                    order: orderParsed?.[1],
                    searchString: params?.searchString,
                    onUpdate: (entities) => {
                        onUpdate({
                            data: entities,
                            meta: {
                                total: entities.length,
                                limit,
                                offset,
                                hasMore: entities.length >= limit
                            }
                        });
                    },
                    onError
                });
            } : undefined,

        listenById: driver.listenEntity
            ? (id: string | number, onUpdate: (entity: Entity<M> | undefined) => void, onError?: (error: Error) => void) => {
                return driver.listenEntity!<M>({
                    path: slug,
                    entityId: id,
                    onUpdate: (entity) => onUpdate(entity ?? undefined),
                    onError
                });
            } : undefined
    };
}

/**
 * Build a `RebaseData` object from a `DataDriver` using JavaScript Proxy.
 *
 * This is the key bridge: any property access like `data.products` returns
 * a `CollectionAccessor` backed by the underlying DataDriver, without
 * needing per-collection code generation.
 *
 * @example
 * const data = buildRebaseData(driver);
 * await data.products.create({ name: "Camera", price: 299 });
 * const { data: items } = await data.products.find({ where: { status: "eq.published" } });
 */
export function buildRebaseData(driver: DataDriver): RebaseData {
    const cache = new Map<string, CollectionAccessor>();

    function getAccessor(slug: string): CollectionAccessor {
        let accessor = cache.get(slug);
        if (!accessor) {
            accessor = createDriverAccessor(driver, slug);
            cache.set(slug, accessor);
        }
        return accessor;
    }

    const target = {
        collection: getAccessor
    } as RebaseData;

    return new Proxy(target, {
        get(_target, prop: string | symbol) {
            if (prop === "collection") return getAccessor;
            // Ignore Symbol properties (e.g. Symbol.toPrimitive, Symbol.iterator)
            if (typeof prop === "symbol") return undefined;
            // Ignore internal JS properties
            if (prop === "then" || prop === "toJSON" || prop === "$$typeof") return undefined;
            return getAccessor(prop);
        }
    });
}
