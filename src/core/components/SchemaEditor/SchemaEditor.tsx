import React, { useCallback, useMemo, useState } from 'react';
import * as Yup from "yup";
import Tree, {
    moveItemOnTree,
    RenderItemParams,
    TreeData,
    TreeDestinationPosition,
    TreeSourcePosition
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
    getColorForProperty,
    getIconForProperty,
    getWidgetNameForProperty
} from "../../util/property_icons";

import { EntitySchema, Property, PropertyOrBuilder } from "../../../models";
import { Form, Formik, useFormikContext } from 'formik';
import { propertiesToTree, treeToProperties } from './util';
import { sortProperties } from "../../util/schemas";

export type SchemaEditorProps<M> = {
    isNewSchema: boolean;
    schema?: EntitySchema<M>;
    onSchemaModified: (schema: EntitySchema<M>) => void;
};

const YupSchema = Yup.object().shape({
    id: Yup.string().required("Required"),
    name: Yup.string().required("Required")
});

export function SchemaEditor<M>({
                                    isNewSchema,
                                    schema,
                                    onSchemaModified
                                }: SchemaEditorProps<M>) {

    const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>();
    const [selectedProperty, setSelectedProperty] = useState<Property | undefined>();

    const onPropertyClick = useCallback((property: Property, propertyId: string) => {
        setSelectedPropertyId(propertyId);
        setSelectedProperty(property)
    }, []);

    const renderItem = ({
                            item,
                            onExpand,
                            onCollapse,
                            provided,
                            snapshot
                        }: RenderItemParams) => {
        const property = item.data.property as Property;
        return (
            <SchemaEntry
                name={item.id as string}
                propertyOrBuilder={property}
                provided={provided}
                onClick={() => onPropertyClick(property, item.id as string)}
                selected={snapshot.isDragging || selectedPropertyId === item.id}/>
        )
    };

    return (
        <Formik
            initialValues={schema ?? {
                id: "",
                name: "",
                properties: {}
            } as EntitySchema}
            validationSchema={YupSchema}
            onSubmit={(newSchema: EntitySchema) => {
                console.log("submit", newSchema);
                onSchemaModified(newSchema);
            }}
        >
            {({ values, setValues, setFieldValue, handleChange }) => {

                // eslint-disable-next-line react-hooks/rules-of-hooks
                React.useEffect(() => {
                    if (schema)
                        setValues({
                            ...schema
                        });
                }, [schema]);

                // eslint-disable-next-line react-hooks/rules-of-hooks
                const tree = useMemo(() => {
                    const sortedProperties = sortProperties(values.properties, values.propertiesOrder);
                    return propertiesToTree(sortedProperties);
                }, [values.properties, values.propertiesOrder]);

                const onDragEnd = (
                    source: TreeSourcePosition,
                    destination?: TreeDestinationPosition
                ) => {

                    if (!destination) {
                        return;
                    }

                    if (!isValidDrag(tree, source, destination)) {
                        return;
                    }

                    const newTree = moveItemOnTree(tree, source, destination);
                    const [properties, propertiesOrder] = treeToProperties<M>(newTree);

                    setFieldValue("propertiesOrder", propertiesOrder);
                    setFieldValue("properties", properties);
                };

                const formControlSX = {
                    '& .MuiInputLabel-root': {
                        mt: 1 / 2,
                        ml: 1 / 2
                    },
                    '& .MuiInputLabel-shrink': {
                        mt: -1 / 4
                    }
                };

                return (
                    <Form>

                        <Typography variant={"h4"} sx={{ py: 3 }}>
                            {values.name ? `${values.name} schema` : "Schema"}
                        </Typography>

                        <Grid container spacing={2}>

                            <Grid item xs={12}>
                                <FormControl fullWidth
                                             disabled={!isNewSchema}
                                             variant="filled"
                                             sx={formControlSX}>
                                    <InputLabel
                                        htmlFor="id">Id</InputLabel>
                                    <FilledInput
                                        id="id"
                                        aria-describedby="id-helper"
                                        onChange={handleChange}
                                        value={values.id}
                                        sx={{ minHeight: "64px" }}
                                    />
                                    <FormHelperText
                                        id="id-helper">
                                        Id of this schema (e.g "product")
                                    </FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
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
                            </Grid>

                            <Grid item xs={12}>
                                <Typography sx={{ mt: 2 }}
                                            variant={"subtitle2"}>
                                    Properties
                                </Typography>
                                <Paper elevation={0}
                                       variant={"outlined"}
                                       sx={{ p: 3 }}>
                                    <Grid container>
                                        <Grid item xs={12} sm={6}>
                                            <Tree
                                                key={`tree_${selectedPropertyId}`}
                                                tree={tree}
                                                renderItem={renderItem}
                                                onDragEnd={onDragEnd}
                                                isDragEnabled
                                                isNestingEnabled
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Paper variant={"outlined"}
                                                   sx={(theme) => ({
                                                       p: 3,
                                                       position: "sticky",
                                                       top: theme.spacing(3)
                                                   })}
                                                   elevation={0}>
                                                {selectedProperty && <Box>
                                                    {selectedProperty.title}
                                                </Box>}
                                                {!selectedProperty && <Box>
                                                    Select a property to
                                                    edit it
                                                </Box>}
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                        </Grid>

                        {!isNewSchema && <SubmitListener/>}

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
                                selected,
                                onClick
                            }: {
    name: string;
    propertyOrBuilder: PropertyOrBuilder;
    provided: TreeDraggableProvided;
    selected: boolean;
    onClick: () => void;
}) {

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            py: 1,
            cursor: "pointer"
        }}
             onClick={onClick}
             ref={provided.innerRef}
             {...provided.draggableProps}
             style={{
                 ...provided.draggableProps.style
             }}>

            <Box sx={{
                background: getColorForProperty(propertyOrBuilder),
                height: "32px",
                mt: 0.5,
                padding: 0.5,
                borderRadius: "50%",
                boxShadow: "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
                color: "white"
            }}>
                {getIconForProperty(propertyOrBuilder, "inherit", "medium")}
            </Box>
            <Box sx={{
                px: 3,
                // maxWidth: "360px",
                width: "100%",
                display: "flex",
                flexDirection: "row"
            }}>
                <Paper variant={"outlined"}
                       sx={{
                           mr: 2,
                           flexGrow: 1,
                           border: selected ? "1px solid #999" : undefined
                       }}
                       elevation={0}>
                    <Box sx={{
                        borderRadius: "2px",
                        border: selected ? "1px solid #999" : "1px solid transparent",
                        p: 2
                    }}>
                        {typeof propertyOrBuilder === "object" &&
                        <PropertyPreview name={name}
                                         property={propertyOrBuilder}/>}
                        {typeof propertyOrBuilder !== "object" &&
                        <PropertyBuilderPreview name={name}/>}
                    </Box>
                </Paper>
                <div {...provided.dragHandleProps}>
                    <DragHandleIcon fontSize={"small"}/>
                </div>
            </Box>
        </Box>
    );

}


export function SubmitListener() {

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

function PropertyPreview({
                             name,
                             property
                         }: { name: string, property: Property }) {
    return (
        <Box sx={{ width: '100%', display: "flex", flexDirection: "column" }}>

            <Typography variant="subtitle1"
                        component="span"
                        sx={{ flexGrow: 1, pr: 2 }}>
                {property.title}
            </Typography>
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

function PropertyBuilderPreview({
                                    name
                                }: { name: string }) {
    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="body2"
                        component="span"
                        color="text.disabled">
                {name}
            </Typography>
            <Typography sx={{ flexGrow: 1, pr: 2 }}
                        variant="body2"
                        component="span"
                        color="text.secondary">
                This property is defined using a builder, in code
            </Typography>
        </Box>
    );
}

function isValidDrag(tree: TreeData, source: TreeSourcePosition, destination: TreeDestinationPosition) {
    const draggedPropertyId = tree.items[source.parentId].children[source.index];
    const draggedProperty = tree.items[draggedPropertyId].data.property;
    if (destination.index === undefined)
        return false;
    if (destination.parentId === tree.rootId)
        return true;
    const destinationPropertyId = tree.items[destination.parentId].id;
    const destinationProperty: Property = tree.items[destinationPropertyId].data.property;
    return typeof destinationProperty === "object" && destinationProperty.dataType === "map";
}
