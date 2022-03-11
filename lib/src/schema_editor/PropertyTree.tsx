import React from "react";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { Box, IconButton } from "@mui/material";

import { PropertiesOrBuilder, PropertyOrBuilder } from "../models";
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
    properties: PropertiesOrBuilder<M>;
    propertiesOrder?: string[];
    errors: Record<string, any>;
    onPropertyMove: (propertiesOrder: string[], namespace?: string) => void;
}) {

    const propertiesOrder = propertiesOrderProp ?? Object.keys(properties);

    const onDragEnd = (result: any) => {
        // dropped outside the list
        if (!result.destination) {
            return;
        }
        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        const newPropertiesOrder: string[] = [...propertiesOrder];
        const temp = newPropertiesOrder[sourceIndex];
        newPropertiesOrder[sourceIndex] = newPropertiesOrder[destinationIndex];
        newPropertiesOrder[destinationIndex] = temp;
        onPropertyMove(newPropertiesOrder, namespace);
    }

    return (
        <>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId={`droppable_${name}`}>
                    {(droppableProvided, droppableSnapshot) => (
                        <div
                            {...droppableProvided.droppableProps}
                            ref={droppableProvided.innerRef}>
                            {propertiesOrder && propertiesOrder.map((propertyKey: string, index: number) => {
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

                            {/*{includeAddButton && <Box p={1}*/}
                            {/*                          justifyContent="center"*/}
                            {/*                          textAlign={"left"}>*/}
                            {/*    <Button variant="outlined"*/}
                            {/*            color="primary"*/}
                            {/*            disabled={disabled}*/}
                            {/*            startIcon={<AddIcon/>}*/}
                            {/*            onClick={insertInEnd}>*/}
                            {/*        Add*/}
                            {/*    </Button>*/}
                            {/*</Box>}*/}
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
    onPropertyMove: (propertiesOrder: string[], namespace?: string) => void;
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
    return (
        <Box
            ref={provided.innerRef}
            {...provided.draggableProps}
            sx={{
                position: "relative",
            }}
        >
            {typeof propertyOrBuilder === "object"
                ? <PropertyFieldPreview
                    property={propertyOrBuilder}
                    onClick={onPropertyClick ? () => onPropertyClick(propertyKey, namespace) : undefined}
                    includeTitle={true}
                    selected={selected}
                    hasError={hasError}/>
                : <PropertyBuilderPreview name={propertyKey}
                                          onClick={onPropertyClick ? () => onPropertyClick(propertyKey, namespace) : undefined}
                                          selected={selected}/>}

            <IconButton {...provided.dragHandleProps}
                        size="small"
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8
                        }}>
                <DragHandleIcon fontSize={"small"}/>
            </IconButton>

            {subtree && <Box ml={3}>{subtree}</Box>}
        </Box>
    );

}
