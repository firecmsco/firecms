import { useCallback, useEffect, useRef, useState } from "react";
import { useData } from "./useData";
import { Entity, EntityCollection, EntityRelation, FilterValues } from "@rebasepro/types";
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
 * Hook to manage relation selection with data fetching from Rebase data source
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

    const dataClient = useData();

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

    const fetchData = useCallback((searchString: string | undefined, loadMore: boolean = false) => {
        cleanupSubscription();
        setError(undefined);
        setIsLoading(true);

        // Convert forceFilter to PostgREST where clause
        const whereMap: Record<string, string> = {};
        if (forceFilter) {
            Object.entries(forceFilter).forEach(([key, value]) => {
                if (value && Array.isArray(value)) {
                    const [op, val] = value;
                    const postgrestOp = op === "==" ? "eq" : op === "!=" ? "neq" : op === ">" ? "gt" : op === ">=" ? "gte" : op === "<" ? "lt" : op === "<=" ? "lte" : op === "in" ? "in" : op === "not-in" ? "nin" : op === "array-contains" ? "cs" : op === "array-contains-any" ? "csa" : "eq";
                    
                    let stringVal: string;
                    if (Array.isArray(val)) {
                        stringVal = `(${val.join(",")})`;
                    } else {
                        stringVal = String(val);
                    }
                    whereMap[key] = `${postgrestOp}.${stringVal}`;
                }
            });
        }
        const whereParams = Object.keys(whereMap).length > 0 ? whereMap : undefined;

        const offset = loadMore ? items.length : 0;
        
        const onEntitiesUpdate = (res: { data: Entity<M>[], meta: { hasMore: boolean } }) => {
            const newItems = res.data.map((e) => entityToRelationItem(e));

            if (loadMore) {
                setItems(prev => {
                    const existingIds = new Set(prev.map(i => i.id));
                    const uniqueNewItems = newItems.filter(i => !existingIds.has(i.id));
                    return [...prev, ...uniqueNewItems];
                });
            } else {
                setItems(newItems);
            }

            setHasMore(res.meta.hasMore);
            setIsLoading(false);
        };

        const onErrorUpdate = (fetchError: Error) => {
            console.error("useRelationSelector: Error fetching data:", fetchError);
            setError(fetchError);
            setIsLoading(false);
        };

        const accessor = dataClient.collection(path);
        
        let unsubscribe: (() => void) | undefined;
        
        // Use find because pagination state (offset) is easier to track statically,
        // and relation selectors usually don't strictly need real-time listing if they're paginated
        // However, if we do want to use listen:
        if (accessor.listen && offset === 0 && !searchString) {
            unsubscribe = accessor.listen({
                where: whereParams,
                limit: pageSize,
                orderBy: undefined, // default asc
                searchString
            }, onEntitiesUpdate, onErrorUpdate);
        } else {
            accessor.find({
                where: whereParams,
                limit: pageSize,
                offset: offset,
                orderBy: undefined,
                searchString
            })
                .then(onEntitiesUpdate)
                .catch(onErrorUpdate);
            unsubscribe = () => {};
        }

        unsubscribeRef.current = unsubscribe || null;
    }, [dataClient, path, forceFilter, pageSize, entityToRelationItem, cleanupSubscription, items.length]);

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
