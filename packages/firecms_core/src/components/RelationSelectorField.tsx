import React from "react";
import { useRelationSelector, useDataSource } from "../hooks";
import { EntityRelation, Relation, FilterValues, CollectionSize } from "@firecms/types";
import { getRelationFrom } from "@firecms/common";
import { RelationItem, RelationSelector } from "./RelationSelector";

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
     * Whether to allow multiple selection
     */
    multiselect?: boolean;
    /**
     * Properties to show in preview
     */
    previewProperties?: string[];
    /**
     * Title for the selector
     */
    title?: string;
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
    size?: CollectionSize;
    /**
     * Whether to include entity ID in display
     */
    includeId?: boolean;
    /**
     * Whether to include entity link
     */
    includeEntityLink?: boolean;
}

/**
 * RelationSelector component that matches TableRelationField API
 */
export function RelationSelectorField({
    name,
    disabled = false,
    internalValue,
    updateValue,
    multiselect = false,
    previewProperties,
    title = "Select Relations",
    relation,
    forceFilter,
    size = "medium",
    includeId = false,
    includeEntityLink = false
}: RelationSelectorFieldProps) {

    const collection = relation.target();
    const dataSource = useDataSource(collection);

    // Use the relation selector hook to handle data fetching
    const {
        onSearch,
        onLoadMore,
        initialItems,
        isLoading,
        error,
        entityToRelationItem,
        relationItemToEntityReference
    } = useRelationSelector({
        path: collection.slug,
        collection,
        pageSize: 20,
        forceFilter,
        labelProperty: previewProperties?.[0] as any || "name"
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
                    return entityToRelationItem(entity);
                }
            } catch (error) {
                console.warn("Could not fetch entity for relation:", error);
            }

            // Fallback to basic relation info
            return {
                id: rel.id,
                label: String(rel.id),
                data: rel
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
            // If the item data is already an EntityRelation, use it
            if (item.data && item.data.isEntityRelation && item.data.isEntityRelation()) {
                return item.data;
            }

            // If the item data is an Entity, convert it to EntityRelation
            if (item.data && item.data.id !== undefined) {
                return getRelationFrom(item.data);
            }

            // Create a new EntityRelation from the reference
            const entityRef = relationItemToEntityReference(item);
            return getRelationFrom({
                id: entityRef.id,
                path: entityRef.path,
                values: {}
            });
        };

        if (Array.isArray(items)) {
            return items.map(convertSingle);
        } else {
            return convertSingle(items);
        }
    }, [relationItemToEntityReference]);

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
        if (multiselect) return "Select multiple relations...";
        return "Select a relation...";
    }, [disabled, multiselect]);

    const sizeMap = {
        "tiny": "smallest" as const,
        "small": "small" as const,
        "medium": "medium" as const,
        "large": "large" as const
    };

    if (error) {
        return (
            <div className="text-red-500 text-sm p-2">
                Error loading relations: {error.message}
            </div>
        );
    }

    return (
        <RelationSelector
            label={title}
            placeholder={placeholder}
            multiple={multiselect}
            disabled={disabled}
            size={sizeMap[size] || "medium"}
            value={relationValue}
            onValueChange={handleValueChange}
            onSearch={onSearch}
            onLoadMore={onLoadMore}
            initialItems={initialItems}
            searchPlaceholder="Search relations..."
            noResultsText="No relations found"
            loadingText="Loading relations..."
            renderItem={(item) => (
                <div>
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                        <div className="text-xs text-gray-500">{item.description}</div>
                    )}
                    {includeId && (
                        <div className="text-xs text-gray-400">ID: {item.id}</div>
                    )}
                </div>
            )}
            renderSelectedItem={(item) => (
                <span className="font-medium">
                    {includeId ? `${item.label} (${item.id})` : item.label}
                </span>
            )}
        />
    );
}

/**
 * Simplified version that works like the original TableRelationField
 */
export function SimpleRelationField({
    name,
    disabled = false,
    internalValue,
    updateValue,
    multiselect = false,
    title = "Select Relations",
    relation,
    forceFilter,
    size = "medium",
    ...props
}: RelationSelectorFieldProps) {
    const collection = relation.target();
    const dataSource = useDataSource(collection);

    const relationController = useRelationSelector({
        path: collection.slug,
        collection,
        forceFilter,
        labelProperty: "name"
    });

    // Convert current EntityRelation value to RelationItem format
    const relationValue = React.useMemo(async () => {
        if (!internalValue) return undefined;

        const convert = async (rel: EntityRelation): Promise<RelationItem> => {
            try {
                // Fetch the actual entity using the data source
                const entity = await dataSource.fetchEntity({
                    path: rel.path,
                    entityId: rel.id,
                    collection
                });

                if (entity) {
                    return relationController.entityToRelationItem(entity);
                }
            } catch (error) {
                console.warn("Could not fetch entity:", error);
            }

            return {
                id: rel.id,
                label: String(rel.id),
                data: rel
            };
        };

        if (Array.isArray(internalValue)) {
            return Promise.all(internalValue.map(convert));
        } else {
            return convert(internalValue);
        }
    }, [internalValue, relationController, dataSource, collection]);

    const handleChange = React.useCallback((newValue: RelationItem | RelationItem[] | undefined) => {
        if (!newValue) {
            updateValue(null);
            return;
        }

        const convert = (item: RelationItem): EntityRelation => {
            if (item.data && item.data.isEntityRelation && item.data.isEntityRelation()) {
                return item.data;
            }

            const entityRef = relationController.relationItemToEntityReference(item);
            return getRelationFrom({
                id: entityRef.id,
                path: entityRef.path,
                values: {}
            });
        };

        const result = Array.isArray(newValue) ? newValue.map(convert) : convert(newValue);
        updateValue(result);
    }, [relationController, updateValue]);

    const [resolvedValue, setResolvedValue] = React.useState<RelationItem | RelationItem[] | undefined>(undefined);

    React.useEffect(() => {
        let isMounted = true;

        const resolveValue = async () => {
            const resolved = await relationValue;
            if (isMounted) {
                setResolvedValue(resolved);
            }
        };

        resolveValue();

        return () => {
            isMounted = false;
        };
    }, [relationValue]);

    return (
        <RelationSelector
            label={title}
            placeholder={disabled ? "Disabled" : `Select ${multiselect ? "multiple " : ""}relations...`}
            multiple={multiselect}
            disabled={disabled}
            value={resolvedValue}
            onValueChange={handleChange}
            onSearch={relationController.onSearch}
            onLoadMore={relationController.onLoadMore}
            initialItems={relationController.initialItems}
        />
    );
}
