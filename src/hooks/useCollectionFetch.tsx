import { useEffect, useState } from "react";
import {
    Entity,
    EntitySchema,
    FilterValues,
    listenCollection
} from "../models";

type Order = "asc" | "desc" | undefined;

export interface CollectionFetchProps<S extends EntitySchema<Key>, Key extends string> {

    /**
     * Absolute collection path
     */
    collectionPath: string;

    /**
     * Schema of the entity displayed by this collection
     */
    schema: S;


    itemCount?: number;

    /**
     * List of entities that will be displayed on top, no matter the ordering.
     * This is used for reference fields selection
     */
    entitiesDisplayedFirst?: Entity<S, Key>[];

    filter?: FilterValues<S, Key>;

    sortByProperty?: string;

    currentSort?: Order;
}

export type CollectionFetchResult<S extends EntitySchema<Key>, Key extends string> = {
    data: Entity<S, Key>[]
    dataLoading: boolean,
    noMoreToLoad: boolean,
    dataLoadingError?: Error
}

export function useCollectionFetch<S extends EntitySchema<Key>, Key extends string>(
    {
        entitiesDisplayedFirst,
        collectionPath,
        schema,
        filter,
        sortByProperty,
        currentSort,
        itemCount
    }: CollectionFetchProps<S, Key>): CollectionFetchResult<S, Key> {

    const initialEntities = entitiesDisplayedFirst ? entitiesDisplayedFirst.filter(e => !!e.values) : [];
    const [data, setData] = useState<Entity<S, Key>[]>(initialEntities);

    const [dataLoading, setDataLoading] = useState<boolean>(false);
    const [dataLoadingError, setDataLoadingError] = useState<Error | undefined>();
    const [noMoreToLoad, setNoMoreToLoad] = useState<boolean>(false);

    const updateData = (entities: Entity<S, Key>[]) => {
        if (!initialEntities) {
            setData(entities);
        } else {
            const displayedFirstId = new Set(initialEntities.map((e) => e.id));
            setData([...initialEntities, ...entities.filter((e) => !displayedFirstId.has(e.id))]);
        }
    };

    useEffect(() => {

        setDataLoading(true);

        return listenCollection<S, Key>(
            collectionPath,
            schema,
            entities => {
                setDataLoading(false);
                setDataLoadingError(undefined);
                updateData(entities);
                setNoMoreToLoad(!itemCount || entities.length < itemCount);
            },
            (error) => {
                console.error("ERROR", error);
                setDataLoading(false);
                setDataLoadingError(error);
            },
            filter,
            itemCount,
            undefined,
            sortByProperty,
            currentSort);
    }, [collectionPath, schema, itemCount, currentSort, sortByProperty, filter]);

    return {
        data,
        dataLoading,
        dataLoadingError,
        noMoreToLoad
    };

}
