import { FieldArray } from "formik";
import { Box, Button, IconButton } from "@mui/material";
import React from "react";
import hash from "object-hash";

import ClearIcon from "@mui/icons-material/Clear";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";


interface ArrayContainerProps<T> {
    value: T[];
    name: string;
    buildEntry: (index: number, hashValue: any) => React.ReactNode;
    disabled: boolean;
    includeAddButton?: boolean;
}

/**
 * @category Form custom fields
 */
export function ArrayContainer<T>({
                                      name,
                                      value,
                                      disabled,
                                      buildEntry,
                                      includeAddButton
                                  }: ArrayContainerProps<T>) {

    const hasValue = value && Array.isArray(value) && value.length > 0;

    return <FieldArray
        name={name}
        validateOnChange={true}
        render={arrayHelpers => {

            const insertInEnd = () => {
                if (disabled) return;
                arrayHelpers.push(null);
            };

            const remove = (index: number) => {
                arrayHelpers.remove(index);
            };

            const onDragEnd = (result: any) => {
                // dropped outside the list
                if (!result.destination) {
                    return;
                }

                arrayHelpers.move(result.source.index, result.destination.index);
            }

            return (
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId={`droppable_${name}`}>
                        {(droppableProvided, droppableSnapshot) => (
                            <div
                                {...droppableProvided.droppableProps}
                                ref={droppableProvided.innerRef}>
                                {hasValue && value.map((v: any, index: number) => {
                                    const hashValue = hash(v);
                                    return (
                                        <Draggable
                                            key={`array_field_${name}_${hashValue}}`}
                                            draggableId={`array_field_${name}_${hashValue}}`}
                                            isDragDisabled={disabled}
                                            index={index}>
                                            {(provided, snapshot) => (

                                                <Box
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    style={
                                                        provided.draggableProps.style
                                                    }
                                                    sx={{
                                                        marginBottom: 1,
                                                        borderRadius: "4px",
                                                        opacity: 1
                                                    }}
                                                >
                                                    <Box key={`field_${index}`}
                                                         display="flex">
                                                        <Box flexGrow={1}
                                                             width={"100%"}
                                                             key={`field_${name}_entryValue`}>
                                                            {buildEntry(index, hashValue)}
                                                        </Box>
                                                        <Box width={"36px"}
                                                             display="flex"
                                                             flexDirection="column"
                                                             alignItems="center">
                                                            <div
                                                                {...provided.dragHandleProps}>
                                                                <DragHandleIcon
                                                                    fontSize={"small"}
                                                                    color={disabled ? "disabled" : "inherit"}
                                                                    sx={{ cursor: disabled ? "inherit" : "move" }}/>
                                                            </div>
                                                            {!disabled &&
                                                            <IconButton
                                                                size="small"
                                                                aria-label="remove"
                                                                onClick={() => remove(index)}>
                                                                <ClearIcon
                                                                    fontSize={"small"}/>
                                                            </IconButton>}
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            )}
                                        </Draggable>);
                                })}

                                {droppableProvided.placeholder}

                                {includeAddButton && !disabled && <Box p={1}
                                                                       justifyContent="center"
                                                                       textAlign={"left"}>
                                    <Button variant="outlined"
                                            color="primary"
                                            disabled={disabled}
                                            onClick={insertInEnd}>
                                        Add
                                    </Button>
                                </Box>}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            );
        }}
    />;
}


