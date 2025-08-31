import React from "react";
import equal from "react-fast-compare"

import {
    AdditionalFieldDelegate,
    CMSType,
    isPropertyBuilder,
    Properties,
    Property
} from "@firecms/core";
import { AutorenewIcon, defaultBorderMixin, DragHandleIcon, IconButton, RemoveIcon, Tooltip } from "@firecms/ui";
import { NonEditablePropertyPreview, PropertyFieldPreview } from "./PropertyFieldPreview";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import { CSS } from "@dnd-kit/utilities";
import { getFullId, getFullIdPath } from "./util";
import { editableProperty } from "../../utils/entities";

export const PropertyTree = React.memo(
    function PropertyTree<M extends {
        [Key: string]: CMSType
    }>({
           namespace,
           selectedPropertyKey,
           onPropertyClick,
           properties,
           propertiesOrder: propertiesOrderProp,
           additionalFields,
           errors,
           onPropertyMove,
           onPropertyRemove,
           className,
           inferredPropertyKeys,
           collectionEditable
       }: {
        namespace?: string;
        selectedPropertyKey?: string;
        onPropertyClick?: (propertyKey: string, namespace?: string) => void;
        properties: Properties<M>;
        propertiesOrder?: string[];
        additionalFields?: AdditionalFieldDelegate<M>[];
        errors: Record<string, any>;
        onPropertyMove?: (propertiesOrder: string[], namespace?: string) => void;
        onPropertyRemove?: (propertyKey: string, namespace?: string) => void;
        className?: string;
        inferredPropertyKeys?: string[];
        collectionEditable: boolean;
    }) {

        const propertiesOrder = propertiesOrderProp ?? Object.keys(properties);

        const sensors = useSensors(
            useSensor(PointerSensor, {
                activationConstraint: {
                    distance: 5,
                }
            }),
            useSensor(KeyboardSensor, {
                coordinateGetter: sortableKeyboardCoordinates,
            })
        );

        const handleDragEnd = (event: DragEndEvent) => {
            const {
                active,
                over
            } = event;

            if (!over || active.id === over.id) {
                return;
            }

            const activeId = String(active.id);
            const overId = String(over.id);

            // Extract property keys from the full IDs
            const activeKey = activeId.includes(".") ? activeId.split(".").pop() : activeId;
            const overKey = overId.includes(".") ? overId.split(".").pop() : overId;

            if (!activeKey || !overKey) return;

            const oldIndex = propertiesOrder.indexOf(activeKey);
            const newIndex = propertiesOrder.indexOf(overKey);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newPropertiesOrder = [...propertiesOrder];
                const [removed] = newPropertiesOrder.splice(oldIndex, 1);
                newPropertiesOrder.splice(newIndex, 0, removed);

                if (onPropertyMove) {
                    onPropertyMove(newPropertiesOrder, namespace);
                }
            }
        };

        const items = propertiesOrder.map(key => getFullId(key, namespace));

        return (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
            >
                <SortableContext
                    items={items}
                    strategy={verticalListSortingStrategy}
                >
                    <div className={className}>

                        {propertiesOrder && propertiesOrder
                            .map((propertyKey: string, index: number) => {
                                const property = properties[propertyKey];
                                const additionalField = additionalFields?.find(field => field.key === propertyKey);

                                if (!property && !additionalField) {
                                    console.warn(`Property ${propertyKey} not found in properties or additionalFields`);
                                    return null;
                                }

                                const id = getFullId(propertyKey, namespace);

                                return (
                                    <PropertyTreeEntry
                                        key={id}
                                        id={id}
                                        propertyKey={propertyKey}
                                        propertyOrBuilder={property}
                                        additionalField={additionalField}
                                        errors={errors}
                                        namespace={namespace}
                                        inferredPropertyKeys={inferredPropertyKeys}
                                        onPropertyMove={onPropertyMove}
                                        onPropertyRemove={onPropertyRemove}
                                        onPropertyClick={onPropertyClick}
                                        selectedPropertyKey={selectedPropertyKey}
                                        collectionEditable={collectionEditable}
                                    />
                                );
                            }).filter(Boolean)}
                    </div>
                </SortableContext>
            </DndContext>
        );
    },
    equal
);

export function PropertyTreeEntry({
                                      id,
                                      propertyKey,
                                      namespace,
                                      propertyOrBuilder,
                                      additionalField,
                                      selectedPropertyKey,
                                      errors,
                                      onPropertyClick,
                                      onPropertyMove,
                                      onPropertyRemove,
                                      inferredPropertyKeys,
                                      collectionEditable
                                  }: {
    id: string;
    propertyKey: string;
    namespace?: string;
    propertyOrBuilder: Property;
    additionalField?: AdditionalFieldDelegate<any>;
    selectedPropertyKey?: string;
    errors: Record<string, any>;
    onPropertyClick?: (propertyKey: string, namespace?: string) => void;
    onPropertyMove?: (propertiesOrder: string[], namespace?: string) => void;
    onPropertyRemove?: (propertyKey: string, namespace?: string) => void;
    inferredPropertyKeys?: string[];
    collectionEditable: boolean;
}) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id
    });

    const style = {
        // Key change: use Translate instead of Transform to prevent stretching
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
        position: "relative" as const,
    };

    const isPropertyInferred = inferredPropertyKeys?.includes(namespace ? `${namespace}.${propertyKey}` : propertyKey);
    const fullId = id;
    const fullIdPath = getFullIdPath(propertyKey, namespace);
    const hasError = fullIdPath in errors;

    let subtree;
    if (typeof propertyOrBuilder === "object") {
        const property = propertyOrBuilder;
        if (property.type === "map" && property.properties) {
            subtree = <PropertyTree
                selectedPropertyKey={selectedPropertyKey}
                namespace={fullId}
                properties={property.properties}
                propertiesOrder={property.propertiesOrder}
                errors={errors}
                onPropertyClick={onPropertyClick}
                onPropertyMove={onPropertyMove}
                onPropertyRemove={onPropertyRemove}
                collectionEditable={collectionEditable}
            />
        }
    }

    const selected = selectedPropertyKey === fullId;
    const editable = propertyOrBuilder && ((collectionEditable && !isPropertyBuilder(propertyOrBuilder)) || editableProperty(propertyOrBuilder));

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative -ml-8"
        >
            <div className="relative">
                {subtree && <div
                    className={"absolute border-l " + defaultBorderMixin}
                    style={{
                        left: "32px",
                        top: "64px",
                        bottom: "16px"
                    }}/>}

                <div>
                    {!isPropertyBuilder(propertyOrBuilder) && !additionalField && editable
                        ? <PropertyFieldPreview
                            property={propertyOrBuilder}
                            onClick={onPropertyClick ? () => onPropertyClick(propertyKey, namespace) : undefined}
                            includeName={true}
                            selected={selected}
                            hasError={hasError}/>
                        : <NonEditablePropertyPreview name={propertyKey}
                                                      property={propertyOrBuilder}
                                                      onClick={onPropertyClick ? () => onPropertyClick(propertyKey, namespace) : undefined}
                                                      selected={selected}/>}
                </div>

                <div className="absolute top-2 right-2 flex flex-row">
                    {isPropertyInferred && <Tooltip title={"Inferred property"}>
                        <AutorenewIcon size="small" className={"p-2"}/>
                    </Tooltip>}

                    {onPropertyRemove && !isPropertyInferred && <Tooltip title={"Remove"}
                                                                         asChild={true}>
                        <IconButton size="small"
                                    color="inherit"
                                    onClick={() => onPropertyRemove(propertyKey, namespace)}>
                            <RemoveIcon size={"small"}/>
                        </IconButton>
                    </Tooltip>}

                    {onPropertyMove && <Tooltip title={"Move"}
                                                asChild={true}>
                        <IconButton
                            component={"span"}
                            size="small"
                            {...attributes}
                            {...listeners}
                        >
                            <DragHandleIcon size={"small"}/>
                        </IconButton>
                    </Tooltip>}

                </div>

                {subtree && <div className={"ml-16"}>{subtree}</div>}
            </div>
        </div>
    );
}
