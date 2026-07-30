import { DataSourceDelegate, DeleteEntityProps, Entity, FetchEntityProps, SaveEntityProps } from "@firecms/core";

/**
 * A tiny in-memory DataSourceDelegate standing in for a graph database.
 *
 * The point of this example is the entity IDs: nodes are addressed with IDs that contain
 * slashes ("node/42", "edge/7/rel"), which Firestore forbids but a graph backend uses
 * routinely. Everything else here is deliberately as dumb as possible.
 */

type Row = Record<string, any>;

const NODES: Record<string, Row> = {
    "node/42": {
        label: "Person: Ada Lovelace",
        kind: "person",
        degree: 4
    },
    "node/1337": {
        label: "Person: Alan Turing",
        kind: "person",
        degree: 7
    },
    "edge/7/rel": {
        label: "knows (42 -> 1337)",
        kind: "edge",
        degree: 2
    },
    "plain-id-no-slash": {
        label: "Ordinary ID, no slash",
        kind: "control",
        degree: 1
    },
    "weird%2Fnot-a-slash": {
        label: "ID containing the literal text %2F",
        kind: "control",
        degree: 0
    },
    "50% confidence": {
        label: "ID containing a percent sign and a space",
        kind: "control",
        degree: 0
    }
};

/** path -> { id -> values } */
const DB: Record<string, Record<string, Row>> = {
    nodes: { ...NODES }
};

function store(path: string): Record<string, Row> {
    if (!DB[path]) DB[path] = {};
    return DB[path];
}

function toEntity(path: string, id: string, values: Row): Entity<any> {
    return {
        id,
        path,
        values,
        databaseId: undefined
    } as Entity<any>;
}

export function buildGraphDelegate(): DataSourceDelegate {
    return {
        key: "in_memory_graph",
        initialised: true,

        async fetchCollection<M extends Record<string, any>>({ path }: any): Promise<Entity<M>[]> {
            const entries = store(path);
            return Object.entries(entries).map(([id, values]) => toEntity(path, id, values)) as Entity<M>[];
        },

        async fetchEntity<M extends Record<string, any>>({
            path,
            entityId
        }: FetchEntityProps<M>): Promise<Entity<M> | undefined> {
            const values = store(path)[entityId];
            // Logged so you can watch the RAW id arrive here — never the escaped form.
            console.log("[graph delegate] fetchEntity", { path, entityId, found: Boolean(values) });
            if (!values) return undefined;
            return toEntity(path, entityId, values) as Entity<M>;
        },

        async saveEntity<M extends Record<string, any>>({
            path,
            entityId,
            values
        }: SaveEntityProps<M>): Promise<Entity<M>> {
            const id = entityId ?? `node/${Math.floor(Math.random() * 10000)}`;
            console.log("[graph delegate] saveEntity", { path, entityId: id });
            store(path)[id] = { ...values } as Row;
            return toEntity(path, id, store(path)[id]) as Entity<M>;
        },

        async deleteEntity<M extends Record<string, any>>({ entity }: DeleteEntityProps<M>): Promise<void> {
            delete store(entity.path)[entity.id];
        },

        async checkUniqueField(): Promise<boolean> {
            return true;
        },

        generateEntityId(): string {
            return `node/${Math.floor(Math.random() * 10000)}`;
        },

        delegateToCMSModel: (data: any) => data,
        cmsToDelegateModel: (data: any) => data,
        currentTime: () => new Date()
    };
}
