import * as React from 'react';
import deepEqual from "deep-equal";
import {
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineSeparator
} from "@mui/lab";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import {
    Box,
    FilledInput,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    Paper,
    Typography
} from "@mui/material";
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

import {
    EntitySchema,
    PropertiesOrBuilder,
    Property,
    PropertyOrBuilder
} from "../../../models";
import { Form, Formik, useFormikContext } from 'formik';
import { getValueInPath } from "../../util/objects";

const PARENT_DROPPABLE_ID = "parent_cerc34D##DEW$AG";

export type SchemaEditorProps<M> = {
    schema: EntitySchema;
    onSchemaModified: (schema: EntitySchema<M>) => void;
};

function buildDraggable(name: any, index: number, property: PropertyOrBuilder, isLast: boolean, level: number) {

    let droppable: any = null;

    if (typeof property === "object" && property.dataType === "map" && property.properties) {
        droppable = <Droppable
            type={`property:${name}`}
            droppableId={name}>
            {(provided, snapshot) => {
                let properties = property.properties as PropertiesOrBuilder<any>;
                return (
                    <Box
                        sx={{ minHeight: 64 }}
                        {...provided.droppableProps}
                        ref={provided.innerRef}>
                        {Object.entries(properties).map(([childName, childProperty], index) => buildDraggable(
                            `${name}.${childName}`,
                            index,
                            childProperty,
                            index === Object.entries(properties).length - 1,
                            level + 1))}
                        {provided.placeholder}
                    </Box>
                );
            }}
        </Droppable>
    }

    return <Draggable key={name}
                      draggableId={name}
                      index={index}>
        {(provided, snapshot) => (
            <SchemaEntry
                name={name}
                propertyOrBuilder={property}
                provided={provided}
                isDragging={snapshot.isDragging}
                isLast={isLast}>
                {droppable}
            </SchemaEntry>
        )}
    </Draggable>;
}

export function SchemaEditor<M>({
                                    schema,
                                    onSchemaModified
                                }: SchemaEditorProps<M>) {


    console.log("SchemaEditor", schema);

    return (
        <Formik
            initialValues={{
                ...schema
            }}
            onSubmit={(newSchema: EntitySchema) => {
                console.log("submit", newSchema);
                onSchemaModified(newSchema);
            }}
        >
            {({ values, setValues, setFieldValue, handleChange }) => {

                React.useEffect(() => {
                    setValues({
                        ...schema
                    });
                }, [schema]);

                const onDragEnd = (result: any) => {
                    console.log(result);


                    // dropped outside the list
                    if (!result.destination) {
                        return;
                    }


                    const addItem = <T extends any>(list: T[], index: number, item: T): T[] => {
                        const result = Array.from(list);
                        result.splice(index, 0, item);
                        return result;
                    };

                    const remove = <T extends any>(list: T[], index: number): [T[], T] => {
                        const result = Array.from(list);
                        const [removed] = result.splice(index, 1);
                        return [result, removed];
                    };

                    const reorder = <T extends any>(list: T[], startIndex: number, endIndex: number): T[] => {
                        const result = Array.from(list);
                        const [removed] = result.splice(startIndex, 1);
                        result.splice(endIndex, 0, removed);
                        return result;
                    };

                    const sourceItems = Object.entries(result.source.droppableId === PARENT_DROPPABLE_ID ? values.properties : getValueInPath(values.properties, result.source.droppableId));
                    const [entriesPre, removed] = remove(sourceItems, result.source.index);

                    const destinationItems = Object.entries(result.destination.droppableId === PARENT_DROPPABLE_ID ? values.properties : getValueInPath(values.properties, result.destination.droppableId));
                    const entries = addItem(result.source.droppableId === result.destination.droppableId ? entriesPre : destinationItems, result.destination.index, removed);
                    // const entries = reorder(
                    //     Object.entries(values.properties),
                    //     result.source.index,
                    //     result.destination.index
                    // );

                    setFieldValue("properties", entries.map(([key, property]) => ({ [key]: property })).reduce((a, b) => ({ ...a, ...b }), {}))
                    setFieldValue("propertiesOrder", entries.map(([key]) => key as keyof M));

                }


                const formControlSX = {
                    '& .MuiInputLabel-root': {
                        mt: 1 / 2,
                        ml: 1 / 2,
                    },
                    '& .MuiInputLabel-shrink': {
                        mt: -1 / 4
                    },
                };

                return (
                    <Form>
                        <FormControl fullWidth
                                     variant="filled"
                                     sx={formControlSX}>
                            <InputLabel
                                htmlFor="name">Name</InputLabel>
                            <FilledInput
                                id="name"
                                aria-describedby="name-helper"
                                onChange={handleChange}
                                value={values.name}
                                sx={{ minHeight: "64px" }}
                            />
                            <FormHelperText
                                id="name-helper">
                                Plural name (e.g. Products)
                            </FormHelperText>
                        </FormControl>

                        <Typography>Properties</Typography>
                        <Paper elevation={0} variant={"outlined"} sx={{ p: 3 }}>
                            <Grid container>
                                <Grid item xs={12} sm={6}>
                                    <DragDropContext
                                        onDragEnd={onDragEnd}>
                                        <Droppable
                                            // type={"property:base"}
                                            droppableId={PARENT_DROPPABLE_ID}>
                                            {(provided, snapshot) => (
                                                <Box
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}>
                                                    {Object.entries(values.properties).map(([name, property], index) => buildDraggable(name,
                                                        index,
                                                        property,
                                                        index === Object.keys(values.properties).length - 1,
                                                        0))}
                                                    {provided.placeholder}
                                                </Box>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    Property edit view here
                                </Grid>
                            </Grid>
                        </Paper>

                        <SubmitListener/>
                    </Form>
                );
            }}
        </Formik>
    );
}

function PropertyEditView({
                              name,
                              property
                          }: { name: string, property: Property }) {
    return (
        <Box sx={{ width: '100%' }}>

            <Box sx={{
                display: 'flex',
                flexDirection: "row",
                alignItems: "baseline"
            }}>
                <Typography variant="subtitle1"
                            component="span"
                            sx={{ flexGrow: 1, pr: 2 }}>
                    {property.title}
                </Typography>
                <Typography variant="body2"
                            component="span"
                            color="text.disabled">
                    {name}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: "row" }}>
                <Typography sx={{ flexGrow: 1, pr: 2 }}
                            variant="body2"
                            component="span"
                            color="text.secondary">
                    {getWidgetNameForProperty(property)}
                </Typography>
                <Typography variant="body2"
                            component="span"
                            color="text.disabled">
                    {property.dataType}
                </Typography>
            </Box>
        </Box>
    );
}

export function SchemaEntry({
                                children,
                                name,
                                propertyOrBuilder,
                                provided,
                                isDragging,
                                isLast
                            }: {

    children?: React.ReactNode;
    name: string,
    propertyOrBuilder: PropertyOrBuilder,
    provided: DraggableProvided,
    isDragging: boolean,
    isLast: boolean
}) {

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "row",
            width: "100%"
        }}
             ref={provided.innerRef}
             {...provided.draggableProps}
             style={{
                 ...provided.draggableProps.style
             }}>

            <TimelineSeparator>
                <TimelineDot color="secondary">
                    {getIconForProperty(propertyOrBuilder)}
                </TimelineDot>
                <TimelineConnector
                    sx={{
                        pt: 1,
                        opacity: isDragging || isLast ? 0 : 1,
                        transition: "opacity 0.3s ease-in-out",
                    }}/>
            </TimelineSeparator>

            <TimelineContent sx={{ px: 3, flexGrow: 4 }}>
                <Box sx={{
                    maxWidth: "360px",
                    display: "flex",
                    flexDirection: "row"
                }}>
                    <Paper variant={"outlined"}
                           sx={{
                               p: 2,
                               mr: 2,
                               flexGrow: 1,
                               border: isDragging ? "2px solid #999" : undefined,
                           }}
                           elevation={0}>
                        {typeof propertyOrBuilder === "object" &&
                        <PropertyEditView name={name}
                                          property={propertyOrBuilder}/>}
                    </Paper>
                    <div                        {...provided.dragHandleProps}>
                        <DragHandleIcon fontSize={"small"}/>
                    </div>
                </Box>
                {children}
            </TimelineContent>
        </Box>
    );

}


export const SubmitListener: React.FC = () => {
    const formik = useFormikContext()
    const [lastValues, updateState] = React.useState(formik.values);

    React.useEffect(() => {
        const valuesEqualLastValues = deepEqual(lastValues, formik.values)
        const valuesEqualInitialValues = deepEqual(formik.values, formik.initialValues)

        if (!valuesEqualLastValues) {
            updateState(formik.values)
        }

        const doSubmit = () => {
            if (!valuesEqualLastValues && !valuesEqualInitialValues && formik.isValid) {
                formik.submitForm();
            }
        }

        const handler = setTimeout(doSubmit, 300);
        return () => {
            clearTimeout(handler);
        };
    }, [formik.values, formik.isValid])

    return null
}
