import type { DataSource, Entity, EntityCollection } from "@firecms/core";

/**
 * Read the selected entities again for an export, in the order the table shows them.
 *
 * The selection keeps each entity as it was when it was ticked, so an edit made since
 * would be missing: they are fetched again, as the full export fetches the collection.
 * Entities the table has not loaded come after the rest, in the order they were selected,
 * and entities deleted since the selection are left out.
 */
export async function fetchSelectedEntities<M extends Record<string, any>>({
    dataSource,
    selectedEntities,
    tableData,
    collection,
    path,
    pathSegments
}: {
    dataSource: Pick<DataSource, "fetchEntity">;
    selectedEntities: Entity<M>[];
    tableData?: Entity<M>[];
    collection: EntityCollection<M>;
    path: string;
    pathSegments?: string[];
}): Promise<Entity<M>[]> {
    const tableIndex = new Map((tableData ?? []).map((entity, index) => [entityKey(entity), index]));
    const indexOf = (entity: Entity<M>) => tableIndex.get(entityKey(entity)) ?? Number.MAX_SAFE_INTEGER;
    const ordered = [...selectedEntities].sort((a, b) => indexOf(a) - indexOf(b));

    const fetched = await Promise.all(ordered.map((entity) => dataSource.fetchEntity<M>({
        path: entity.path,
        // the segments describe `path`; an entity from another path (a collection group) goes by its own
        pathSegments: entity.path === path ? pathSegments : undefined,
        entityId: entity.id,
        collection
    })));
    return fetched.filter((entity): entity is Entity<M> => entity !== undefined);
}

function entityKey(entity: Entity<any>) {
    return `${entity.path}/${entity.id}`;
}
