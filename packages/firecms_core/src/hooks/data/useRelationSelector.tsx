import { useCallback, useEffect, useState } from "react";
import { useDataSource, useFireCMSContext } from "../../hooks";
import {
    Entity,
    EntityCollection,
    EntityReference,
    FilterValues,
    FireCMSContext,
    User
} from "@firecms/types";
import { RelationItem } from "@firecms/ui";

export interface UseRelationSelectorProps<M extends Record<string, any> = any> {
    /**
     * Full path where the relation data is located
     */
    path: string;
    /**
     * The collection that represents the relation entities
     */
    collection: EntityCollection<M>;
    /**
     * Force filter to be applied to the relation search
     */
    forceFilter?: FilterValues<string>;
    /**
     * Page size for pagination
     */
    pageSize?: number;
    /**
     * Function to extract the label from an entity
     */
    getLabelFromEntity?: (entity: Entity<M>) => string;
    /**
     * Function to extract the description from an entity
     */
    getDescriptionFromEntity?: (entity: Entity<M>) => string | undefined;
    /**
     * Property name to use as the primary display field
     */
    labelProperty?: keyof M;
    /**
     * Property name to use as the secondary display field
     */
    descriptionProperty?: keyof M;
}

export interface RelationSelectorController {
    onSearch: (searchString: string) => Promise<RelationItem[]>;
    onLoadMore: (lastItem: RelationItem) => Promise<RelationItem[]>;
    initialItems: RelationItem[];
    isLoading: boolean;
    error: Error | undefined;
    entityToRelationItem: (entity: Entity<any>) => RelationItem;
    relationItemToEntityReference: (item: RelationItem) => EntityReference;
}

const DEFAULT_PAGE_SIZE = 20;

/**
 * Hook to manage relation selection with data fetching from FireCMS data source
 */
export function useRelationSelector<M extends Record<string, any> = any, USER extends User = User>(
    {
        path,
        collection,
        forceFilter,
        pageSize = DEFAULT_PAGE_SIZE,
        getLabelFromEntity,
        getDescriptionFromEntity,
        labelProperty,
        descriptionProperty
    }: UseRelationSelectorProps<M>
): RelationSelectorController {

    const dataSource = useDataSource(collection);
    const context: FireCMSContext<USER> = useFireCMSContext();

    const [initialItems, setInitialItems] = useState<RelationItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | undefined>();
    const [lastFetchedEntities, setLastFetchedEntities] = useState<Entity<M>[]>([]);

    // Function to convert entity to RelationItem
    const entityToRelationItem = useCallback((entity: Entity<M>): RelationItem => {
        let label: string;
        let description: string | undefined;

        if (getLabelFromEntity) {
            label = getLabelFromEntity(entity);
        } else if (labelProperty && entity.values[labelProperty]) {
            label = String(entity.values[labelProperty]);
        } else {
            // Fallback: try common label properties
            const commonLabelProps = ["name", "title", "label", "displayName"];
            const foundProp = commonLabelProps.find(prop => entity.values[prop]);
            label = foundProp ? String(entity.values[foundProp]) : String(entity.id);
        }

        if (getDescriptionFromEntity) {
            description = getDescriptionFromEntity(entity);
        } else if (descriptionProperty && entity.values[descriptionProperty]) {
            description = String(entity.values[descriptionProperty]);
        }

        return {
            id: entity.id,
            label,
            description,
            data: entity
        };
    }, [getLabelFromEntity, getDescriptionFromEntity, labelProperty, descriptionProperty]);

    // Function to convert RelationItem back to EntityReference
    const relationItemToEntityReference = useCallback((item: RelationItem): EntityReference => {
        return new EntityReference(item.id, path);
    }, [path]);

    // Function to fetch entities and convert to RelationItems
    const fetchAndConvertEntities = useCallback(async (
        searchString?: string,
        startAfter?: Entity<M>,
        limit: number = pageSize
    ): Promise<RelationItem[]> => {
        try {
            setError(undefined);

            let entities: Entity<M>[];

            if (dataSource.listenCollection) {
                // For real-time data sources, we need to use a promise wrapper
                entities = await new Promise<Entity<M>[]>((resolve, reject) => {
                    const unsubscribe = dataSource.listenCollection!<M>({
                        path,
                        collection,
                        onUpdate: (fetchedEntities) => {
                            unsubscribe();
                            resolve(fetchedEntities);
                        },
                        onError: (fetchError) => {
                            unsubscribe();
                            reject(fetchError);
                        },
                        searchString,
                        filter: forceFilter,
                        limit,
                        startAfter,
                        orderBy: labelProperty as string,
                        order: "asc"
                    });
                });
            } else {
                entities = await dataSource.fetchCollection<M>({
                    path,
                    collection,
                    searchString,
                    filter: forceFilter,
                    limit,
                    startAfter,
                    orderBy: labelProperty as string,
                    order: "asc"
                });
            }

            // Apply onFetch callback if available
            if (collection.callbacks?.onFetch) {
                entities = await Promise.all(
                    entities.map((entity) =>
                        collection.callbacks!.onFetch!({
                            collection,
                            path,
                            entity,
                            context
                        })
                    )
                );
            }

            setLastFetchedEntities(entities);
            return entities.map(entityToRelationItem);

        } catch (err) {
            const fetchError = err as Error;
            setError(fetchError);
            console.error("Error fetching relation entities:", fetchError);
            throw fetchError;
        }
    }, [
        dataSource,
        path,
        collection,
        forceFilter,
        pageSize,
        labelProperty,
        entityToRelationItem,
        context
    ]);

    // Search function
    const onSearch = useCallback(async (searchString: string): Promise<RelationItem[]> => {
        setIsLoading(true);
        try {
            return await fetchAndConvertEntities(searchString, undefined, pageSize);
        } finally {
            setIsLoading(false);
        }
    }, [fetchAndConvertEntities, pageSize]);

    // Load more function
    const onLoadMore = useCallback(async (lastItem: RelationItem): Promise<RelationItem[]> => {
        setIsLoading(true);
        try {
            // Find the entity corresponding to the last item
            const lastEntity = lastFetchedEntities.find(entity => String(entity.id) === String(lastItem.id));
            return await fetchAndConvertEntities(undefined, lastEntity, pageSize);
        } finally {
            setIsLoading(false);
        }
    }, [fetchAndConvertEntities, pageSize, lastFetchedEntities]);

    // Load initial items
    useEffect(() => {
        let isMounted = true;

        const loadInitialItems = async () => {
            setIsLoading(true);
            try {
                const items = await fetchAndConvertEntities(undefined, undefined, pageSize);
                if (isMounted) {
                    setInitialItems(items);
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Error loading initial relation items:", err);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadInitialItems();

        return () => {
            isMounted = false;
        };
    }, [fetchAndConvertEntities, pageSize]);

    return {
        onSearch,
        onLoadMore,
        initialItems,
        isLoading,
        error,
        entityToRelationItem,
        relationItemToEntityReference
    };
}
