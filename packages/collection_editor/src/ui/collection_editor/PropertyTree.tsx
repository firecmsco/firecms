import React from "react";
import equal from "react-fast-compare"

import {
    AdditionalFieldDelegate,
    CMSType,
    ErrorBoundary,
    isPropertyBuilder,
    PropertiesOrBuilders,
    PropertyOrBuilder
} from "@firecms/core";
import { AutoAwesomeIcon, defaultBorderMixin, DragHandleIcon, IconButton, RemoveIcon, Tooltip } from "@firecms/ui";
import { NonEditablePropertyPreview, PropertyFieldPreview } from "./PropertyFieldPreview";
import { DragDropContext, Draggable, DraggableProvided, Droppable } from "@hello-pangea/dnd";
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

        const onDragEnd = (result: any) => {
            // dropped outside the list
            if (!result.destination) {
                return;
            }
            const startIndex = result.source.index;
            const endIndex = result.destination.index;

            const newPropertiesOrder = Array.from(propertiesOrder);
            const [removed] = newPropertiesOrder.splice(startIndex, 1);
            newPropertiesOrder.splice(endIndex, 0, removed);
            if (onPropertyMove)
                onPropertyMove(newPropertiesOrder, namespace);
        }

        return (
            <>

                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId={`droppable_${namespace}`}>
                        {(droppableProvided, droppableSnapshot) => (
                            <div
                                {...droppableProvided.droppableProps}
                                ref={droppableProvided.innerRef}
                                className={className}>
                                {propertiesOrder && propertiesOrder
                                    .map((propertyKey: string, index: number) => {
                                        const property = properties[propertyKey] as PropertyOrBuilder;
                                        const additionalField = additionalFields?.find(field => field.key === propertyKey);

                                        if (!property && !additionalField) {
                                            console.warn(`Property ${propertyKey} not found in properties or additionalFields`);
                                            return null;
                                        }
                                        return (
                                            <Draggable
                                                key={`array_field_${namespace}_${propertyKey}}`}
                                                draggableId={`array_field_${namespace}_${propertyKey}}`}
                                                index={index}>
                                                {(provided, snapshot) => {
                                                    return (
                                                        <ErrorBoundary>
                                                            <PropertyTreeEntry
                                                                propertyKey={propertyKey as string}
                                                                propertyOrBuilder={property}
                                                                additionalField={additionalField}
                                                                provided={provided}
                                                                errors={errors}
                                                                namespace={namespace}
                                                                inferredPropertyKeys={inferredPropertyKeys}
                                                                onPropertyMove={onPropertyMove}
                                                                onPropertyRemove={onPropertyRemove}
                                                                onPropertyClick={snapshot.isDragging ? undefined : onPropertyClick}
                                                                selectedPropertyKey={selectedPropertyKey}
                                                                collectionEditable={collectionEditable}
                                                            />
                                                        </ErrorBoundary>
                                                    );
                                                }}
                                            </Draggable>);
                                    }).filter(Boolean)}

                                {droppableProvided.placeholder}

                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

            </>
        );
    },
    (prevProps, nextProps) => {

        const isSelected = nextProps.selectedPropertyKey?.startsWith(nextProps.namespace ?? "");
        const wasSelected = prevProps.selectedPropertyKey?.startsWith(prevProps.namespace ?? "");
        if (isSelected || wasSelected)
            return false;

        return equal(prevProps.properties, nextProps.properties) &&
            prevProps.propertiesOrder === nextProps.propertiesOrder &&
            equal(prevProps.additionalFields, nextProps.additionalFields) &&
            equal(prevProps.errors, nextProps.errors) &&
            equal(prevProps.onPropertyClick, nextProps.onPropertyClick) &&
            // equal(prevProps.onPropertyMove, nextProps.onPropertyMove) &&
            // equal(prevProps.onPropertyRemove, nextProps.onPropertyRemove) &&
            prevProps.namespace === nextProps.namespace &&
            prevProps.collectionEditable === nextProps.collectionEditable;
    }
);

export function PropertyTreeEntry({
                                      propertyKey,
                                      namespace,
                                      propertyOrBuilder,
                                      additionalField,
                                      provided,
                                      selectedPropertyKey,
                                      errors,
                                      onPropertyClick,
                                      onPropertyMove,
                                      onPropertyRemove,
                                      inferredPropertyKeys,
                                      collectionEditable
                                  }: {
    propertyKey: string;
    namespace?: string;
    propertyOrBuilder: PropertyOrBuilder;
    additionalField?: AdditionalFieldDelegate<any>;
    selectedPropertyKey?: string;
    provided: DraggableProvided;
    errors: Record<string, any>;
    onPropertyClick?: (propertyKey: string, namespace?: string) => void;
    onPropertyMove?: (propertiesOrder: string[], namespace?: string) => void;
    onPropertyRemove?: (propertyKey: string, namespace?: string) => void;
    inferredPropertyKeys?: string[];
    collectionEditable: boolean;
}) {

    const isPropertyInferred = inferredPropertyKeys?.includes(namespace ? `${namespace}.${propertyKey}` : propertyKey);
    const fullId = getFullId(propertyKey, namespace);
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
                collectionEditable={collectionEditable}
            />
        }
    }

    // const hasError = fullId ? getIn(errors, idToPropertiesPath(fullId)) : false;
    const selected = selectedPropertyKey === fullId;
    const editable = propertyOrBuilder && ((collectionEditable && !isPropertyBuilder(propertyOrBuilder)) || editableProperty(propertyOrBuilder));

    return (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="relative -ml-8"
        >
            {subtree && <div
                className={"absolute border-l " + defaultBorderMixin}
                style={{
                    left: "32px",
                    top: "64px",
                    bottom: "16px"
                }}/>}

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

            <div className="absolute top-2 right-2 flex flex-row ">

                {isPropertyInferred && <Tooltip title={"Inferred property"}>
                    <AutoAwesomeIcon size="small" className={"p-2"}/>
                </Tooltip>}

                {onPropertyRemove && <Tooltip title={"Remove"}
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
                    >
                        <DragHandleIcon size={"small"}/>
                    </IconButton>
                </Tooltip>}
            </div>

            {subtree && <div className={"ml-16"}>{subtree}</div>}
        </div>
    );

}
