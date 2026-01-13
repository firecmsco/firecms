import React from "react";
import equal from "react-fast-compare"

import {
    AdditionalFieldDelegate,
    CMSType,
    isPropertyBuilder,
    PropertiesOrBuilders,
    PropertyOrBuilder
} from "@firecms/core";
import {
    AutorenewIcon,
    defaultBorderMixin,
    DeleteIcon,
    IconButton,
    Menu,
    MenuItem,
    MoreVertIcon,
    Tooltip,
    VerticalAlignBottomIcon,
    VerticalAlignTopIcon
} from "@firecms/ui";
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
        properties: PropertiesOrBuilders<M>;
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
                                const property = properties[propertyKey] as PropertyOrBuilder;
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
                                        propertiesOrder={propertiesOrder}
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
    propertiesOrder,
    onPropertyClick,
    onPropertyMove,
    onPropertyRemove,
    inferredPropertyKeys,
    collectionEditable
}: {
    id: string;
    propertyKey: string;
    namespace?: string;
    propertyOrBuilder: PropertyOrBuilder;
    additionalField?: AdditionalFieldDelegate<any>;
    selectedPropertyKey?: string;
    errors: Record<string, any>;
    propertiesOrder: string[];
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
        if (property.dataType === "map" && property.properties) {
            subtree = <PropertyTree
                selectedPropertyKey={selectedPropertyKey}
                namespace={fullId}
                properties={property.properties}
                propertiesOrder={property.propertiesOrder}
                errors={errors}
                onPropertyClick={onPropertyClick}
                onPropertyMove={onPropertyMove}
                onPropertyRemove={onPropertyRemove}
                inferredPropertyKeys={inferredPropertyKeys}
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
            className="relative -ml-8 cursor-grab"
            {...attributes}
            {...listeners}
        >
            <div className="relative">
                {subtree && <div
                    className={"absolute border-l " + defaultBorderMixin}
                    style={{
                        left: "32px",
                        top: "64px",
                        bottom: "16px"
                    }} />}

                <div>
                    {!isPropertyBuilder(propertyOrBuilder) && !additionalField && editable
                        ? <PropertyFieldPreview
                            property={propertyOrBuilder}
                            onClick={onPropertyClick ? () => onPropertyClick(propertyKey, namespace) : undefined}
                            includeName={true}
                            selected={selected}
                            hasError={hasError} />
                        : <NonEditablePropertyPreview name={propertyKey}
                            property={propertyOrBuilder}
                            onClick={onPropertyClick ? () => onPropertyClick(propertyKey, namespace) : undefined}
                            selected={selected} />}
                </div>

                <div className="absolute top-3 right-3 flex flex-row items-center">
                    {isPropertyInferred && <>
                        <Tooltip title={"Inferred property"} asChild={true}>
                            <IconButton size="smallest" disabled>
                                <AutorenewIcon size="smallest" />
                            </IconButton>
                        </Tooltip>
                        {onPropertyRemove && <Tooltip title={"Remove inferred property"}
                            asChild={true}>
                            <IconButton size="smallest"
                                color="inherit"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPropertyRemove(propertyKey, namespace);
                                }}>
                                <DeleteIcon size={"smallest"} />
                            </IconButton>
                        </Tooltip>}
                    </>}

                    <Menu
                        trigger={
                            <IconButton
                                size="smallest"
                            >
                                <MoreVertIcon size={"smallest"} />
                            </IconButton>
                        }
                    >
                        <MenuItem
                            dense
                            onClick={() => {
                                const currentIndex = propertiesOrder.indexOf(propertyKey);
                                if (currentIndex > 0) {
                                    const newOrder = propertiesOrder.filter(k => k !== propertyKey);
                                    newOrder.unshift(propertyKey);
                                    onPropertyMove?.(newOrder, namespace);
                                }
                            }}
                        >
                            <VerticalAlignTopIcon size="smallest" />
                            Move to top
                        </MenuItem>
                        <MenuItem
                            dense
                            onClick={() => {
                                const currentIndex = propertiesOrder.indexOf(propertyKey);
                                if (currentIndex < propertiesOrder.length - 1) {
                                    const newOrder = propertiesOrder.filter(k => k !== propertyKey);
                                    newOrder.push(propertyKey);
                                    onPropertyMove?.(newOrder, namespace);
                                }
                            }}
                        >
                            <VerticalAlignBottomIcon size="smallest" />
                            Move to bottom
                        </MenuItem>
                        <MenuItem
                            dense
                            onClick={() => onPropertyRemove?.(propertyKey, namespace)}
                        >
                            <DeleteIcon size="smallest" />
                            Delete
                        </MenuItem>
                    </Menu>

                </div>

                {subtree && <div className={"ml-16"}>{subtree}</div>}
            </div>
        </div>
    );
}
