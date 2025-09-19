import { useCallback, useEffect, useState, useRef } from "react";
import { useDataSource } from "../../hooks";
import { Entity, EntityCollection, EntityRelation, FilterValues, User } from "@firecms/types";
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
    relationItemToEntityRelation: (item: RelationItem) => EntityRelation;
}

const DEFAULT_PAGE_SIZE = 20;

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
        labelProperty,
        descriptionProperty
    }: UseRelationSelectorProps<M>
): RelationSelectorController {

    const dataSource = useDataSource(collection);

    const [initialItems, setInitialItems] = useState<RelationItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | undefined>();

    const initialUnsubscribeRef = useRef<(() => void) | null>(null);

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
    const relationItemToEntityReference = useCallback((item: RelationItem): EntityRelation => {
        return new EntityRelation(item.id, path);
    }, [path]);

    // Search function - returns a Promise that resolves when data is received
    const onSearch = useCallback(async (searchString: string): Promise<RelationItem[]> => {
        return new Promise<RelationItem[]>((resolve, reject) => {
            setError(undefined);

            const unsubscribe = dataSource.listenCollection!<M>({
                path,
                collection,
                onUpdate: (entities) => {
                    const items = entities.map(entityToRelationItem);
                    // Clean up subscription immediately after getting results
                    unsubscribe();
                    resolve(items);
                },
                onError: (fetchError) => {
                    setError(fetchError);
                    unsubscribe();
                    reject(fetchError);
                },
                searchString,
                filter: forceFilter,
                limit: pageSize,
                orderBy: labelProperty as string,
                order: "asc"
            });
        });
    }, [dataSource, path, collection, forceFilter, pageSize, labelProperty, entityToRelationItem]);

    // Load more function - returns a Promise that resolves when more data is received
    const onLoadMore = useCallback(async (lastItem: RelationItem): Promise<RelationItem[]> => {
        return new Promise<RelationItem[]>((resolve, reject) => {
            setError(undefined);

            const lastEntity = lastItem.data as Entity<M>;

            const unsubscribe = dataSource.listenCollection!<M>({
                path,
                collection,
                onUpdate: (entities) => {
                    const items = entities.map(entityToRelationItem);
                    // Clean up subscription immediately after getting results
                    unsubscribe();
                    resolve(items);
                },
                onError: (fetchError) => {
                    setError(fetchError);
                    unsubscribe();
                    reject(fetchError);
                },
                filter: forceFilter,
                limit: pageSize,
                startAfter: lastEntity,
                orderBy: labelProperty as string,
                order: "asc"
            });
        });
    }, [dataSource, path, collection, forceFilter, pageSize, labelProperty, entityToRelationItem]);

    // Load initial items and maintain subscription for real-time updates
    useEffect(() => {
        setIsLoading(true);
        setError(undefined);

        // Clean up previous subscription
        if (initialUnsubscribeRef.current) {
            initialUnsubscribeRef.current();
        }

        const unsubscribe = dataSource.listenCollection!<M>({
            path,
            collection,
            onUpdate: (entities) => {
                const items = entities.map(entityToRelationItem);
                setInitialItems(items);
                setIsLoading(false);
            },
            onError: (fetchError) => {
                setError(fetchError);
                setIsLoading(false);
                console.error("Error loading initial relation items:", fetchError);
            },
            filter: forceFilter,
            limit: pageSize,
            orderBy: labelProperty as string,
            order: "asc"
        });

        initialUnsubscribeRef.current = unsubscribe;

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [dataSource, path, collection, forceFilter, pageSize, labelProperty, entityToRelationItem]);

    // Cleanup subscriptions on unmount
    useEffect(() => {
        return () => {
            if (initialUnsubscribeRef.current) {
                initialUnsubscribeRef.current();
            }
        };
    }, []);

    return {
        onSearch,
        onLoadMore,
        initialItems,
        isLoading,
        error,
        entityToRelationItem,
        relationItemToEntityRelation: relationItemToEntityReference
    };
}
