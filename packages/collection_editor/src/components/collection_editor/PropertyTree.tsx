import {
    AdditionalFieldDelegate,
    AutoAwesomeIcon,
    CMSType,
    defaultBorderMixin,
    DragHandleIcon,
    ErrorBoundary,
    IconButton, isPropertyBuilder,
    PropertiesOrBuilders, PropertyOrBuilder,
    RemoveIcon,
    Tooltip
} from "@firecms/core";
import { NonEditablePropertyPreview, PropertyFieldPreview } from "./PropertyFieldPreview";
import { DragDropContext, Draggable, DraggableProvided, Droppable } from "@hello-pangea/dnd";
import { getFullId, idToPropertiesPath } from "./util";
import { getIn } from "formik";
import { editableProperty } from "../../utils/entities";
import { useCallback } from "react";

export function PropertyTree<M extends {
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
       inferredPropertyKeys
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
}) {

    const propertiesOrder = propertiesOrderProp ?? Object.keys(properties);

    const onDragEnd = useCallback((result: any) => {
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
    }, [namespace, onPropertyMove, propertiesOrder])

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
                                // .filter((propertyKey) => Boolean(properties[propertyKey]))
                                .map((propertyKey: string, index: number) => {
                                    const property = properties[propertyKey] as PropertyOrBuilder;
                                    const additionalField = additionalFields?.find(field => field.id === propertyKey);

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
}

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
                                      inferredPropertyKeys
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
}) {

    const isPropertyInferred = inferredPropertyKeys?.includes(namespace ? `${namespace}.${propertyKey}` : propertyKey);

    const fullId = getFullId(propertyKey, namespace);
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
                onPropertyRemove={onPropertyRemove}/>
        }
    }

    const hasError = fullId ? getIn(errors, idToPropertiesPath(fullId)) : false;
    const selected = selectedPropertyKey === fullId;
    const editable = propertyOrBuilder && editableProperty(propertyOrBuilder);

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

                {onPropertyRemove && <Tooltip title={"Remove"}>
                    <IconButton size="small"
                                color="inherit"
                                onClick={() => onPropertyRemove(propertyKey, namespace)}>
                        <RemoveIcon size={"small"}/>
                    </IconButton>
                </Tooltip>}

                {onPropertyMove && <Tooltip title={"Move"}>
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
