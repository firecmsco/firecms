import { Box, IconButton } from "@mui/material";
import DragHandleIcon from "@mui/icons-material/DragHandle";

import {
    editableProperty,
    PropertiesOrBuilders,
    Property,
    PropertyOrBuilder
} from "@camberi/firecms";
import {
    PropertyBuilderPreview,
    PropertyFieldPreview
} from "./PropertyFieldPreview";
import {
    DragDropContext,
    Draggable,
    DraggableProvided,
    Droppable
} from "react-beautiful-dnd";
import { getFullId, idToPropertiesPath } from "./util";
import { getIn } from "formik";

export function PropertyTree<M>({
                                    namespace,
                                    selectedPropertyKey,
                                    onPropertyClick,
                                    properties,
                                    propertiesOrder: propertiesOrderProp,
                                    errors,
                                    onPropertyMove
                                }: {
    namespace?: string;
    selectedPropertyKey?: string;
    onPropertyClick?: (propertyKey: string, namespace?: string) => void;
    properties: PropertiesOrBuilders<M>;
    propertiesOrder?: string[];
    errors: Record<string, any>;
    onPropertyMove?: (propertiesOrder: string[], namespace?: string) => void;
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
                            ref={droppableProvided.innerRef}>
                            {propertiesOrder && propertiesOrder
                                .filter((propertyKey) => Boolean(properties[propertyKey]))
                                .map((propertyKey: string, index: number) => {
                                return (
                                    <Draggable
                                        key={`array_field_${namespace}_${propertyKey}}`}
                                        draggableId={`array_field_${namespace}_${propertyKey}}`}
                                        index={index}>
                                        {(provided, snapshot) => {
                                            const property = properties[propertyKey] as PropertyOrBuilder;
                                            return (
                                                <PropertyTreeEntry
                                                    propertyKey={propertyKey as string}
                                                    propertyOrBuilder={property}
                                                    provided={provided}
                                                    errors={errors}
                                                    namespace={namespace}
                                                    onPropertyMove={onPropertyMove}
                                                    onPropertyClick={snapshot.isDragging ? undefined : onPropertyClick}
                                                    selectedPropertyKey={selectedPropertyKey}
                                                />
                                            );
                                        }}
                                    </Draggable>);
                            })}

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
                                      provided,
                                      selectedPropertyKey,
                                      errors,
                                      onPropertyClick,
                                      onPropertyMove
                                  }: {
    propertyKey: string;
    namespace?: string;
    propertyOrBuilder: PropertyOrBuilder;
    selectedPropertyKey?: string;
    provided: DraggableProvided;
    errors: Record<string, any>;
    onPropertyClick?: (propertyKey: string, namespace?: string) => void;
    onPropertyMove?: (propertiesOrder: string[], namespace?: string) => void;
}) {

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
                onPropertyMove={onPropertyMove}/>
        }
    }

    const hasError = fullId ? getIn(errors, idToPropertiesPath(fullId)) : false;
    const selected = selectedPropertyKey === fullId;
    const editable = editableProperty(propertyOrBuilder);
    return (
        <Box
            ref={provided.innerRef}
            {...provided.draggableProps}
            sx={{
                position: "relative",
            }}
        >
            {typeof propertyOrBuilder !== "function"
                ? <PropertyFieldPreview
                    property={propertyOrBuilder as Property}
                    onClick={onPropertyClick ? () => onPropertyClick(propertyKey, namespace) : undefined}
                    includeName={true}
                    selected={selected}
                    hasError={hasError}/>
                : <PropertyBuilderPreview name={propertyKey}
                                          onClick={onPropertyClick ? () => onPropertyClick(propertyKey, namespace) : undefined}
                                          selected={selected}/>}

            {onPropertyMove && <IconButton {...provided.dragHandleProps}
                         size="small"
                         sx={{
                             position: "absolute",
                             top: 8,
                             right: 8
                         }}>
                <DragHandleIcon fontSize={"small"}/>
            </IconButton>}

            {subtree && <Box ml={3}>{subtree}</Box>}
        </Box>
    );

}
