import * as React from 'react';
import {
    Timeline,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineItem,
    TimelineOppositeContent,
    TimelineSeparator
} from "@mui/lab";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { Box, Paper, Typography } from "@mui/material";
import {
    getIconForProperty,
    getWidgetNameForProperty
} from "../../util/property_icons";
import {
    DragDropContext,
    Draggable,
    DraggableProvided,
    Droppable
} from "react-beautiful-dnd";

import { Property } from "../../../models";
import { StoredEntitySchema } from "../../../models/config_persistence";

export type SchemaEditorProps<M> = {
    schema: StoredEntitySchema<any>;
    onSchemaModified: (schemaId: string, schema: StoredEntitySchema<M>) => void;
};

export function SchemaEditor<M>({
                                     schema,
                                     onSchemaModified
                                 }: SchemaEditorProps<M>) {

    const [propertiesEntries, setPropertiesEntries] = React.useState<[key: string, property: Property][]>(Object.entries(schema.properties));


    const onDragEnd = (result: any) => {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        const items = reorder(
            propertiesEntries,
            result.source.index,
            result.destination.index
        );

        setPropertiesEntries(items);

    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                    <Timeline
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        position="right">
                        {propertiesEntries.map(([key, property], index) => (
                            <Draggable key={key} draggableId={key}
                                       index={index}>
                                {(provided, snapshot) => (
                                    <SchemaEntry
                                        name={key}
                                        property={property}
                                        provided={provided}
                                        isDragging={snapshot.isDragging}/>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </Timeline>
                )}
            </Droppable>
        </DragDropContext>
    );
}

export function SchemaEntry({
                                name,
                                property,
                                provided, isDragging
                            }: { name: string, property: Property, provided: DraggableProvided, isDragging: boolean }) {

    return (
        <TimelineItem sx={{ width: "100%" }}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{
                          display: "flex",
                          flexDirection: "row",
                          ...provided.draggableProps.style
                      }}>
            <TimelineOppositeContent
                sx={{
                    m: '8 0',
                    py: 3,
                    px: 2,
                    maxWidth: '160px',
                    flexGrow: 1,
                    flexShrink: 1,
                    transition: "opacity 0.3s ease-in-out",
                    opacity: isDragging ? 0 : 1
                }}
                variant="body2"
                color="text.secondary"
            >
                <Typography variant="body2"
                            color="text.secondary">
                    {name}
                </Typography>
            </TimelineOppositeContent>

            <TimelineSeparator
                sx={{
                    pt: 1,
                    opacity: isDragging ? 0 : 1,
                    transition: "opacity 0.3s ease-in-out",
                }}>
                <TimelineDot color="secondary">
                    {getIconForProperty(property)}
                </TimelineDot>
                <TimelineConnector/>
            </TimelineSeparator>

            <TimelineContent sx={{ px: 3, flexGrow: 4 }}>
                <Box sx={{
                    maxWidth: "500px",
                    display: "flex",
                    flexDirection: "row"
                }}>
                    <Paper sx={{
                        p: 2,
                        mr: 2,
                        flexGrow: 1,
                        border: isDragging ? "2px solid #999" : undefined,
                    }}
                           elevation={0}>
                        <Box sx={{ width: '100%' }}>
                            <Typography variant="subtitle1" component="span">
                                {property.title}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: "row" }}>
                                <Typography sx={{ flexGrow: 1 }}
                                            variant="body2"
                                            color="text.secondary">
                                    {getWidgetNameForProperty(property)}
                                </Typography>
                                <Typography variant="body2"
                                            color="text.secondary">
                                    {property.dataType}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                    <div
                        {...provided.dragHandleProps}>
                        <DragHandleIcon fontSize={"small"}/>
                    </div>
                </Box>
            </TimelineContent>
        </TimelineItem>
    );

}
// a little function to help us with reordering the result



const reorder = <T extends any>(list: T[], startIndex: number, endIndex: number): T[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};
