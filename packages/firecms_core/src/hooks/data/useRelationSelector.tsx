import { useCallback, useEffect, useRef, useState } from "react";
import { useDataSource } from "../../hooks";
import { Entity, EntityCollection, EntityRelation, FilterValues } from "@firecms/types";
import { RelationItem } from "../../components/RelationSelector";

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
     * Property name to use as the secondary display field
     */
    descriptionProperty?: keyof M;
}

export interface RelationSelectorController {
    items: RelationItem[];
    isLoading: boolean;
    error: Error | undefined;
    search: (searchString: string) => void;
    loadMore: () => void;
    hasMore: boolean;
    entityToRelationItem: (entity: Entity<any>, relation: EntityRelation) => RelationItem;
}

const DEFAULT_PAGE_SIZE = 10;

/**
 * Hook to manage relation selection with data fetching from FireCMS data source
 */
export function useRelationSelector<M extends Record<string, any> = any>(
    {
        path,
        collection,
        forceFilter,
        pageSize = DEFAULT_PAGE_SIZE,
        getLabelFromEntity,
        getDescriptionFromEntity,
        descriptionProperty
    }: UseRelationSelectorProps<M>
): RelationSelectorController {

    const dataSource = useDataSource(collection);

    const [items, setItems] = useState<RelationItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | undefined>();
    const [hasMore, setHasMore] = useState(true);
    const [currentSearch, setCurrentSearch] = useState<string>("");
    const [lastEntity, setLastEntity] = useState<Entity<M> | undefined>(undefined);

    const unsubscribeRef = useRef<(() => void) | null>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Function to convert entity to RelationItem
    const entityToRelationItem = useCallback((entity: Entity<M>, relation?: EntityRelation): RelationItem => {
        let label: string;
        let description: string | undefined;

        if (getLabelFromEntity) {
            label = getLabelFromEntity(entity);
        } else {
            // Fallback: try common label properties
            const commonLabelProps = ["name", "title", "label", "displayName"];
            let foundProp: string | undefined;

            if (entity.values) {
                foundProp = commonLabelProps.find(prop => entity.values[prop] != null && entity.values[prop] !== "");
            }

            if (foundProp && entity.values[foundProp]) {
                label = String(entity.values[foundProp]);
            } else {
                // Ultimate fallback: use entity ID
                label = String(entity.id);
            }
        }

        if (getDescriptionFromEntity) {
            description = getDescriptionFromEntity(entity);
        } else if (descriptionProperty && entity.values && entity.values[descriptionProperty]) {
            description = String(entity.values[descriptionProperty]);
        }

        return {
            id: entity.id,
            label,
            description,
            data: entity,
            relation: relation ? relation : new EntityRelation(entity.id, path)
        };
    }, [getLabelFromEntity, getDescriptionFromEntity, descriptionProperty]);

    // Clean up any existing subscription
    const cleanupSubscription = useCallback(() => {
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }
    }, []);

    // Perform data fetch
    const fetchData = useCallback((searchString: string | undefined, loadMore: boolean = false) => {
        cleanupSubscription();
        setError(undefined);
        setIsLoading(true);

        const unsubscribe = dataSource.listenCollection!<M>({
            path,
            collection,
            onUpdate: (entities) => {
                const newItems = entities.map((e) => entityToRelationItem(e));

                if (loadMore) {
                    setItems(prev => [...prev, ...newItems]);
                } else {
                    setItems(newItems);
                }

                // Set hasMore based on whether we got a full page of results
                setHasMore(entities.length === pageSize);
                setLastEntity(entities[entities.length - 1]);
                setIsLoading(false);
            },
            onError: (fetchError) => {
                console.error("useRelationSelector: Error fetching data:", fetchError);
                setError(fetchError);
                setIsLoading(false);
            },
            searchString,
            filter: forceFilter,
            limit: pageSize,
            startAfter: loadMore ? lastEntity : undefined,
            order: "asc"
        });

        unsubscribeRef.current = unsubscribe;
    }, [dataSource, path, collection, forceFilter, pageSize, entityToRelationItem, cleanupSubscription, lastEntity]);

    // Search function with debouncing
    const search = useCallback((searchString: string) => {
        setCurrentSearch(searchString);

        // Clear existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Debounce search
        searchTimeoutRef.current = setTimeout(() => {
            setLastEntity(undefined);
            fetchData(searchString, false);
        }, searchString.trim() ? 300 : 0);
    }, [fetchData]);

    // Load more function
    const loadMore = useCallback(() => {
        if (!isLoading && hasMore && items.length > 0) {
            fetchData(currentSearch, true);
        }
    }, [isLoading, hasMore, items.length, fetchData, currentSearch]);

    // Load initial data
    useEffect(() => {
        fetchData(undefined, false);

        return () => {
            cleanupSubscription();
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [path, collection.slug, forceFilter]);

    return {
        items,
        isLoading,
        error,
        search,
        loadMore,
        hasMore,
        entityToRelationItem,
    };
}
