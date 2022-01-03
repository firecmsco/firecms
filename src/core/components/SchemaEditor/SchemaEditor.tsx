import React from 'react';
import Tree, {
    moveItemOnTree,
    RenderItemParams,
    TreeDestinationPosition,
    TreeSourcePosition,
} from '../Tree';
import { TreeDraggableProvided } from "../Tree/components/TreeItem/TreeItem-types";

import deepEqual from "deep-equal";
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

import { EntitySchema, Property, PropertyOrBuilder } from "../../../models";
import { Form, Formik, useFormikContext } from 'formik';
import { propertiesToTree, treeToProperties } from './util';

export type SchemaEditorProps<M> = {
    schema: EntitySchema<M>;
    onSchemaModified: (schema: EntitySchema<M>) => void;
};


export function SchemaEditor<M>({
                                    schema,
                                    onSchemaModified
                                }: SchemaEditorProps<M>) {

    // console.log("SchemaEditor", schema);

    const tree = propertiesToTree(schema.properties);
    // const [tree, setTree] = useState(schemaToTree(schema));

    const renderItem = ({
                            item,
                            onExpand,
                            onCollapse,
                            provided,
                            snapshot,
                        }: RenderItemParams) => {
        const property = item.data.property as Property;
        return (
            <SchemaEntry
                name={item.id as string}
                propertyOrBuilder={property}
                provided={provided}
                isDragging={snapshot.isDragging}/>
        )
    };

    // const onExpand = (itemId: ItemId) => {
    //     setTree(mutateTree(tree, itemId, { isExpanded: true }))
    // };
    //
    // const onCollapse = (itemId: ItemId) => {
    //     setTree(mutateTree(tree, itemId, { isExpanded: false }))
    // };

    return (
        <Formik
            initialValues={{
                ...schema
            }}
            onSubmit={(newSchema: EntitySchema) => {
                console.log("submit", newSchema);
                // if (!deepEqual(schema, newSchema))
                    onSchemaModified(newSchema);
            }}
        >
            {({ values, setValues, setFieldValue, handleChange }) => {

                React.useEffect(() => {
                    setValues({
                        ...schema
                    });
                }, [schema]);

                const onDragEnd = (
                    source: TreeSourcePosition,
                    destination?: TreeDestinationPosition,
                ) => {

                    if (!destination) {
                        return;
                    }

                    const newTree = moveItemOnTree(tree, source, destination);
                    // setTree(newTree);
                    const [properties, propertiesOrder] = treeToProperties<M>(newTree);
                    console.log(newTree, properties);

                    setFieldValue("properties", properties);
                    setFieldValue("propertiesOrder", propertiesOrder);
                };

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
                                    <Tree
                                        tree={propertiesToTree(values.properties)}
                                        renderItem={renderItem}
                                        onDragEnd={onDragEnd}
                                        isDragEnabled
                                        isNestingEnabled
                                    />
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


export function SchemaEntry({
                                name,
                                propertyOrBuilder,
                                provided,
                                isDragging
                            }: {
    name: string,
    propertyOrBuilder: PropertyOrBuilder,
    provided: TreeDraggableProvided,
    isDragging: boolean
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

            {getIconForProperty(propertyOrBuilder)}

                <Box sx={{
                    px: 3,
                    maxWidth: "360px",
                    width: "100%",
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
        </Box>
    );

}


export const SubmitListener: React.FC = () => {
    const formik = useFormikContext()
    const [lastValues, setLastValues] = React.useState(formik.values);

    React.useEffect(() => {
        const valuesEqualLastValues = deepEqual(lastValues, formik.values)
        const valuesEqualInitialValues = deepEqual(formik.values, formik.initialValues)

        if (!valuesEqualLastValues) {
            setLastValues(formik.values)
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

    return null;
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

