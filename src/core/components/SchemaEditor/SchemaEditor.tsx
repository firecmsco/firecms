import React, { useCallback, useMemo, useState } from "react";
import * as Yup from "yup";
import Tree, {
    moveItemOnTree,
    RenderItemParams,
    TreeData,
    TreeDestinationPosition,
    TreeSourcePosition
} from "../Tree";
import { TreeDraggableProvided } from "../Tree/components/TreeItem/TreeItem-types";

import { Form, Formik, useFormikContext } from "formik";

import deepEqual from "deep-equal";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import {
    Box,
    Button,
    CircularProgress,
    Container,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    OutlinedInput,
    Paper,
    Typography
} from "@mui/material";
import {
    getIconForProperty,
    getWidgetNameForProperty
} from "../../util/property_utils";

import { EntitySchema, Property, PropertyOrBuilder } from "../../../models";
import { propertiesToTree, treeToProperties } from "./util";
import { sortProperties } from "../../util/schemas";
import { getWidget } from "../../util/widgets";
import { PropertyEditView } from "./PropertyEditView";

export type SchemaEditorProps<M> = {
    initialSchema?: EntitySchema<M>;
    loading: boolean;
    onSave: (schema: EntitySchema<M>) => void;
};

const YupSchema = Yup.object().shape({
    id: Yup.string().required("Required"),
    name: Yup.string().required("Required")
});

export function SchemaEditor<M>({
                                    loading,
                                    initialSchema,
                                    onSave
                                }: SchemaEditorProps<M>) {

    const isNewSchema = !initialSchema;
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
            initialValues={initialSchema ?? {
                id: "",
                name: "",
                properties: {}
            } as EntitySchema}
            validationSchema={YupSchema}
            onSubmit={(newSchema: EntitySchema) => {
                console.log("submit", newSchema);
                return onSave(newSchema);
            }}
        >
            {({
                  values,
                  setFieldValue,
                  handleChange,
                  touched,
                  errors,
                  isSubmitting
              }) => {

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

                return (
                    <Form>
                        <Box sx={{ p: 2 }}>
                            <Container maxWidth={"md"}>

                                <Typography variant={"h4"}
                                            sx={{ py: 3 }}>
                                    {values.name ? `${values.name} schema` : "Schema"}
                                </Typography>

                                <Grid container spacing={2}>

                                    <Grid item xs={12}>
                                        <FormControl fullWidth
                                                     required
                                                     disabled={!isNewSchema}
                                                     error={touched.id && Boolean(errors.id)}>
                                            <InputLabel
                                                htmlFor="id">Id</InputLabel>
                                            <OutlinedInput
                                                id="id"
                                                value={values.id}
                                                onChange={handleChange}
                                                aria-describedby="id-helper-text"
                                                label="Id"
                                            />
                                            <FormHelperText
                                                id="id-helper-text">
                                                {touched.id && Boolean(errors.id) ? errors.id : "Id of this schema (e.g 'product')"}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControl fullWidth
                                                     required
                                                     error={touched.name && Boolean(errors.name)}>
                                            <InputLabel
                                                htmlFor="name">Name</InputLabel>
                                            <OutlinedInput
                                                id="name"
                                                value={values.name}
                                                onChange={handleChange}
                                                aria-describedby="name-helper-text"
                                                label="Name"
                                            />
                                            <FormHelperText
                                                id="name-helper-text">
                                                {touched.name && Boolean(errors.name) ? errors.name : "Singular name of this schema (e.g. Product)"}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography sx={{ my: 1 }}
                                                    variant={"subtitle2"}>
                                            Properties
                                        </Typography>
                                        <Paper elevation={0}
                                               variant={"outlined"}
                                               sx={{ p: 3 }}>
                                            <Grid container>
                                                <Grid item xs={12}
                                                      sm={5}>
                                                    <Tree
                                                        key={`tree_${selectedPropertyId}`}
                                                        tree={tree}
                                                        renderItem={renderItem}
                                                        onDragEnd={onDragEnd}
                                                        isDragEnabled
                                                        isNestingEnabled
                                                    />
                                                </Grid>
                                                <Grid item xs={12}
                                                      sm={7}
                                                      sx={(theme) => ({
                                                          borderLeft: `1px solid ${theme.palette.divider}`,
                                                          pl: 1
                                                      })}>
                                                    <Box sx={{
                                                        p: 2,
                                                        position: "sticky",
                                                        top: 3
                                                    }}>
                                                        {selectedProperty && selectedPropertyId &&
                                                        <PropertyEditView
                                                            propertyKey={selectedPropertyId}
                                                            property={selectedProperty}/>}
                                                        {!selectedProperty &&
                                                        <Box>
                                                            Select a
                                                            property to
                                                            edit it
                                                        </Box>}

                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    </Grid>
                                </Grid>

                                {/*<SubmitListener/>*/}

                            </Container>
                        </Box>

                        <Box sx={(theme) => ({
                            background: theme.palette.mode === "light" ? "rgba(255,255,255,0.6)" : "rgba(255, 255, 255, 0)",
                            backdropFilter: "blur(4px)",
                            borderTop: `1px solid ${theme.palette.divider}`,
                            py: 1,
                            px: 2,
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "end",
                            position: "sticky",
                            bottom: 0,
                            zIndex: 200,
                            textAlign: "right"
                        })}
                        >

                            {loading && <Box sx={{ px: 3 }}>
                                <CircularProgress size={16}
                                                  thickness={8}/>
                            </Box>}

                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={isSubmitting || loading}
                            >
                                {isNewSchema ? "Create" : "Save"}
                            </Button>

                        </Box>
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

    const widget = typeof propertyOrBuilder !== "function" ? getWidget(propertyOrBuilder) : undefined;
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
                background: widget?.color ?? "#666",
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
                pl: 3,
                pr: 1,
                // maxWidth: "360px",
                width: "100%",
                display: "flex",
                flexDirection: "row"
            }}>
                <Paper variant={"outlined"}
                       sx={(theme) => ({
                           position: "relative",
                           mr: 2,
                           flexGrow: 1,
                           p: 2,
                           border: selected ? `1px solid ${theme.palette.text.primary}` : undefined
                       })}
                       elevation={0}>

                    {typeof propertyOrBuilder === "object" &&
                    <PropertyPreview name={name}
                                     property={propertyOrBuilder}/>}

                    {typeof propertyOrBuilder !== "object" &&
                    <PropertyBuilderPreview name={name}/>}

                    <Box {...provided.dragHandleProps}
                         sx={{ position: "absolute", p: 2, top: 0, right: 0 }}>
                        <DragHandleIcon fontSize={"small"}/>
                    </Box>
                </Paper>
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
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>

            <Typography variant="subtitle1"
                        component="span"
                        sx={{ flexGrow: 1, pr: 2 }}>
                {property.title}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "row" }}>
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
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
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
