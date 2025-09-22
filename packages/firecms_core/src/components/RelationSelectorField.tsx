import React from "react";
import { useDataSource, useRelationSelector } from "../hooks";
import { EntityRelation, FilterValues, Relation } from "@firecms/types";
import { getRelationFrom } from "@firecms/common";
import { RelationItem, RelationSelector } from "./RelationSelector";
import { EntityPreview } from "./EntityPreview";

interface RelationSelectorFieldProps {
    /**
     * Field name
     */
    name: string;
    /**
     * Whether the field is disabled
     */
    disabled?: boolean;
    /**
     * Current value - can be single EntityRelation or array for multiple selection
     */
    internalValue: EntityRelation | EntityRelation[] | undefined | null;
    /**
     * Callback when value changes
     */
    updateValue: (newValue: EntityRelation | EntityRelation[] | null) => void;

    /**
     * The relation configuration
     */
    relation: Relation;
    /**
     * Force filter to be applied to the relation search
     */
    forceFilter?: FilterValues<string>;
    /**
     * Collection size for display
     */
    size?: "small" | "medium",

}

/**
 * RelationSelector component that matches TableRelationField API
 */
export function RelationSelectorField({
                                          disabled = false,
                                          internalValue,
                                          updateValue,
                                          relation,
                                          forceFilter,
                                          size = "medium",
                                      }: RelationSelectorFieldProps) {

    const collection = relation.target();
    const dataSource = useDataSource(collection);

    const multiple = relation.cardinality === "many";

    // Use the relation selector hook to handle ALL data fetching
    const {
        items,
        isLoading,
        error,
        search,
        loadMore,
        hasMore,
        entityToRelationItem,
    } = useRelationSelector({
        path: collection.slug,
        collection,
        forceFilter,
    });

    // Convert EntityRelation(s) to RelationItem(s) for the component
    const convertToRelationItems = React.useCallback(async (relations: EntityRelation | EntityRelation[] | undefined | null): Promise<RelationItem | RelationItem[] | undefined> => {
        if (!relations) return undefined;

        const convertSingle = async (rel: EntityRelation): Promise<RelationItem> => {
            try {
                // Fetch the actual entity using the data source
                const entity = await dataSource.fetchEntity({
                    path: rel.path,
                    entityId: rel.id,
                    collection
                });

                if (entity) {
                    return entityToRelationItem(entity, rel);
                }
            } catch (error) {
                console.warn("Could not fetch entity for relation:", error);
            }

            // Fallback to basic relation info
            return {
                id: rel.id,
                label: String(rel.id),
                relation: rel
            };
        };

        if (Array.isArray(relations)) {
            const items = await Promise.all(relations.map(convertSingle));
            return items;
        } else {
            return await convertSingle(relations);
        }
    }, [entityToRelationItem, dataSource, collection]);

    // Convert RelationItem(s) back to EntityRelation(s)
    const convertToEntityRelations = React.useCallback((items: RelationItem | RelationItem[] | undefined): EntityRelation | EntityRelation[] | null => {
        if (!items) return null;

        const convertSingle = (item: RelationItem): EntityRelation => {
            // Use the stored relation if available
            if (item.relation) {
                return item.relation;
            }

            // Create a new EntityRelation from the item data if available
            if (item.data) {
                return getRelationFrom(item.data);
            }

            // Fallback to creating relation from basic info
            return new EntityRelation(item.id, collection.slug);
        };

        if (Array.isArray(items)) {
            return items.map(convertSingle);
        } else {
            return convertSingle(items);
        }
    }, [collection.slug]);

    // State for the converted relation items
    const [relationValue, setRelationValue] = React.useState<RelationItem | RelationItem[] | undefined>(undefined);

    // Update relation value when internalValue changes
    React.useEffect(() => {
        let isMounted = true;

        const updateRelationValue = async () => {
            const converted = await convertToRelationItems(internalValue);
            if (isMounted) {
                setRelationValue(converted);
            }
        };

        updateRelationValue();

        return () => {
            isMounted = false;
        };
    }, [internalValue, convertToRelationItems]);

    const handleValueChange = React.useCallback((newValue: RelationItem | RelationItem[] | undefined) => {
        const entityRelations = convertToEntityRelations(newValue);
        updateValue(entityRelations);
    }, [convertToEntityRelations, updateValue]);

    const placeholder = React.useMemo(() => {
        if (disabled) return "Disabled";
        if (multiple) return "Select multiple...";
        return "Select...";
    }, [disabled, multiple]);

    if (error) {
        return (
            <div className="text-red-500 text-sm p-2">
                Error loading relations: {error.message}
            </div>
        );
    }

    return (
        <RelationSelector
            placeholder={placeholder}
            multiple={multiple}
            disabled={disabled}
            size={size}
            value={relationValue}
            onValueChange={handleValueChange}
            items={items}
            isLoading={isLoading}
            hasMore={hasMore}
            onSearch={search}
            onLoadMore={loadMore}
            searchPlaceholder="Search..."
            noResultsText="No relations found"
            loadingText="Loading relations..."
        />
    );
}
