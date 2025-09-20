import React from "react";
import { useDataSource, useRelationSelector } from "../hooks";
import { Entity, EntityRelation, FilterValues, Relation } from "@firecms/types";
import { getRelationFrom } from "@firecms/common";
import { RelationItem, RelationSelector } from "./RelationSelector";
import { EntityPreview, EntityPreviewData } from "./EntityPreview";

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
    size?: "small" | "medium",
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

    // Use the relation selector hook to handle ALL data fetching
    const {
        items,
        isLoading,
        error,
        search,
        loadMore,
        hasMore,
        entityToRelationItem,
        relationItemToEntityRelation
    } = useRelationSelector({
        path: collection.slug,
        collection,
        forceFilter,
        labelProperty: previewProperties?.[0] || "name"
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
            // If the item data is already an EntityRelation, use it
            if (item.data && item.data instanceof EntityRelation) {
                return item.data;
            }

            // If the item data is an Entity, convert it to EntityRelation
            if (item.data && item.data.id !== undefined) {
                return getRelationFrom(item.data);
            }

            // Create a new EntityRelation from the reference
            const entityRef = relationItemToEntityRelation(item);
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
    }, [relationItemToEntityRelation]);

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
        if (multiselect) return "Select multiple...";
        return "Select...";
    }, [disabled, multiselect]);

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
            renderItem={(item) => (
                <div className="flex flex-row items-center gap-2">
                    {item.data && <EntityPreviewData
                        includeImage={false}
                        entity={item.data}
                        includeId={false}/>}
                    {/*<div className="font-medium">{item.label}</div>*/}
                    {/*{item.description && (*/}
                    {/*    <div className="text-xs text-gray-500">{item.description}</div>*/}
                    {/*)}*/}
                    {/*{includeId && (*/}
                    {/*    <div className="text-xs text-gray-400">ID: {item.id}</div>*/}
                    {/*)}*/}
                </div>
            )}
            renderSelectedItem={(item) => (
                <div className="flex flex-row items-center gap-2">
                    <EntityPreviewData entity={item.data as Entity}
                                       includeEntityLink={false}
                                       includeId={false}/>
                </div>
            )}
        />
    );
}
