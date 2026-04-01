import { Transport, FindParams, FindResponse, buildQueryString } from "./transport";

export interface CollectionClient<Row, Insert, Update> {
    find(params?: FindParams): Promise<FindResponse<Row>>;
    findById(id: string | number): Promise<Row>;
    create(data: Insert): Promise<Row>;
    update(id: string | number, data: Update): Promise<Row>;
    delete(id: string | number): Promise<void>;
}

export function createCollectionClient<Row, Insert, Update>(transport: Transport, slug: string): CollectionClient<Row, Insert, Update> {
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
    };
}
