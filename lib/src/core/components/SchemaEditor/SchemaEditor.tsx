import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import Tree, {
    moveItemOnTree,
    RenderItemParams,
    TreeData,
    TreeDestinationPosition,
    TreeSourcePosition
} from "../Tree";
import {
    TreeDraggableProvided
} from "../Tree/components/TreeItem/TreeItem-types";

import { Formik, FormikProps, getIn, useFormikContext } from "formik";
import hash from "object-hash";
import equal from "react-fast-compare";

import DragHandleIcon from "@mui/icons-material/DragHandle";
import {
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    IconButton,
    Paper,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import {
    getIconForProperty,
    getWidgetNameForProperty
} from "../../util/property_utils";

import { EntitySchema, Property, PropertyOrBuilder } from "../../../models";
import { propertiesToTree, treeToProperties } from "./util";
import {
    prepareSchemaForPersistence,
    sortProperties
} from "../../util/schemas";
import { getWidget } from "../../util/widgets";
import { PropertyForm } from "./PropertyEditView";
import { useSnackbarController } from "../../../hooks";
import {
    useConfigurationPersistence
} from "../../../hooks/useConfigurationPersistence";
import { ErrorView } from "../ErrorView";
import { CircularProgressCenter } from "../CircularProgressCenter";
import { useSchemaRegistry } from "../../../hooks/useSchemaRegistry";
import { toSnakeCase } from "../../util/strings";
import {
    getValueInPath,
    isEmptyObject,
    removeUndefined
} from "../../util/objects";
import { CustomDialogActions } from "../CustomDialogActions";
import { SchemaDetailsDialog } from "./SchemaDetailsView";

export type SchemaEditorProps<M> = {
    schemaId?: string;
    handleClose?: (updatedSchema?: EntitySchema<M>) => void;
    updateDirtyStatus?: (dirty: boolean) => void;
};

const YupSchema = Yup.object().shape({
    id: Yup.string().required("Required"),
    name: Yup.string().required("Required")
});

export function SchemaEditor<M>({
                                    schemaId,
                                    handleClose,
                                    updateDirtyStatus
                                }: SchemaEditorProps<M>) {

    const isNewSchema = !schemaId;
    const schemaRegistry = useSchemaRegistry();
    const configurationPersistence = useConfigurationPersistence();
    const snackbarContext = useSnackbarController();

    if (!configurationPersistence)
        throw Error("Can't use the schema editor without specifying a `ConfigurationPersistence`");

    const [schema, setSchema] = React.useState<EntitySchema | undefined>();
    const [error, setError] = React.useState<Error | undefined>();

    const onSaveAttemptWithError = useCallback(() =>
        snackbarContext.open({
            type: "error",
            message: "Fix the errors before saving the schema"
        }), [snackbarContext]);

    useEffect(() => {
        try {
            if (schemaRegistry.initialised) {
                if (schemaId) {
                    setSchema(schemaRegistry.findSchema(schemaId));
                } else {
                    setSchema(undefined);
                }
            }
        } catch (e) {
            console.error(e);
            setError(error);
        }
    }, [schema, schemaRegistry]);

    const saveSchema = useCallback((schema: EntitySchema<M>): Promise<boolean> => {
        const newSchema = prepareSchemaForPersistence(schema);
        return configurationPersistence.saveSchema(newSchema)
            .then(() => {
                setError(undefined);
                snackbarContext.open({
                    type: "success",
                    message: "Schema updated"
                });
                if (handleClose) {
                    handleClose(schema);
                }
                return true;
            })
            .catch((e) => {
                console.error(e);
                snackbarContext.open({
                    type: "error",
                    title: "Error persisting schema",
                    message: "Details in the console"
                });
                return false;
            });
    }, [configurationPersistence, handleClose, snackbarContext]);

    if (error) {
        return <ErrorView error={`Error fetching schema ${schemaId}`}/>;

    }
    if (!schemaRegistry.initialised || !(isNewSchema || schema)) {
        return <CircularProgressCenter/>;

    }

    return (
        <Formik
            initialValues={schema ?? {
                id: "",
                name: "",
                properties: {}
            } as EntitySchema}
            validationSchema={YupSchema}
            validate={() => console.log("validate")}
            onSubmit={(newSchema: EntitySchema, formikHelpers) => {
                return saveSchema(newSchema).then(() => {
                    formikHelpers.resetForm({ values: newSchema });
                    // setShowErrors(false);
                });
            }}
        >
            {(formikProps) => {
                return (
                    <SchemaEditorForm {...formikProps}
                                      updateDirtyStatus={updateDirtyStatus}
                                      isNewSchema={isNewSchema}
                                      onSaveAttemptWithError={onSaveAttemptWithError}
                                      onCancel={handleClose ? () => handleClose(undefined) : undefined}/>
                );
            }}

        </Formik>

    );
}

function idToPropertiesPath(id: string): string {
    return "properties." + id.replace(".", ".properties.");
}

function SchemaEditorForm<M>({
                                 values,
                                 errors,
                                 setFieldValue,
                                 setFieldError,
                                 setFieldTouched,
                                 touched,
                                 dirty,
                                 isSubmitting,
                                 isNewSchema,
                                 handleSubmit,
                                 updateDirtyStatus,
                                 onCancel,
                                 onSaveAttemptWithError
                             }: FormikProps<EntitySchema<M>> & {
    isNewSchema: boolean,
    updateDirtyStatus?: (dirty: boolean) => void;
    onSaveAttemptWithError?: () => void;
    onCancel?: () => void;
}) {

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("lg"));
    const asDialog = !largeLayout;

    const cleanedErrors = removeUndefined(errors);
    const hasError = !isEmptyObject(cleanedErrors);

    const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>();
    const selectedProperty = selectedPropertyId ? getValueInPath(values.properties, selectedPropertyId.replace(".", ".properties.")) : undefined;
    const [pendingMove, setPendingMove] = useState<[TreeSourcePosition, TreeDestinationPosition] | undefined>();

    const [newPropertyDialogOpen, setNewPropertyDialogOpen] = useState<boolean>(false);
    const [schemaDetailsDialogOpen, setSchemaDetailsDialogOpen] = useState<boolean>(false);

    const [showErrors, setShowErrors] = useState(false);

    useEffect(() => {
        if (updateDirtyStatus)
            updateDirtyStatus(dirty);
    }, [updateDirtyStatus, dirty]);

    useEffect(() => {
        const idTouched = getIn(touched, "id");
        if (!idTouched && isNewSchema && values.name) {
            setFieldValue("id", toSnakeCase(values.name))
        }
    }, [isNewSchema, touched, values.name]);

    const onPropertyClick = useCallback((property: PropertyOrBuilder, propertyId: string) => {
        setSelectedPropertyId(propertyId);
    }, []);

    const renderItem = useCallback(({
                                        item,
                                        onExpand,
                                        onCollapse,
                                        provided,
                                        snapshot
                                    }: RenderItemParams) => {
        const propertyOrBuilder = item.data.property as PropertyOrBuilder;
        const propertyKey = item.id as string;
        const propertyPath = idToPropertiesPath(propertyKey);
        const hasError = getIn(cleanedErrors, propertyPath);
        // console.log("renderItem", propertyKey, propertyPath, cleanedErrors, hasError);
        return (
            <SchemaEntry
                propertyKey={propertyKey}
                propertyOrBuilder={propertyOrBuilder}
                provided={provided}
                hasError={hasError}
                onClick={() => onPropertyClick(propertyOrBuilder, propertyKey)}
                selected={snapshot.isDragging || selectedPropertyId === item.id}/>
        )
    }, [selectedPropertyId, cleanedErrors]);

    const tree = useMemo(() => {
        const sortedProperties = sortProperties(values.properties, values.propertiesOrder);
        return propertiesToTree(sortedProperties);
    }, [values.properties, values.propertiesOrder]);

    const doPropertyMove = useCallback((source: TreeSourcePosition, destination: TreeDestinationPosition) => {
        const newTree = moveItemOnTree(tree, source, destination);
        const [properties, propertiesOrder] = treeToProperties<M>(newTree);
        setFieldValue("propertiesOrder", propertiesOrder, false);
        setFieldValue("properties", properties, false);
    }, [setFieldValue, tree]);

    const onPropertyCreated = useCallback((id: string, property: Property) => {
        setFieldValue("properties", {
            ...(values.properties ?? {}),
            [id]: property
        }, false);
        setFieldValue("propertiesOrder", [...(values.propertiesOrder ?? []), id], false);
        setNewPropertyDialogOpen(false);
    }, [values.properties, values.propertiesOrder]);

    const onPropertyChanged = useCallback((id, property) => {
        const propertyPath = id ? idToPropertiesPath(id) : undefined;
        if (propertyPath) {
            setFieldValue(propertyPath, property, false);
            setFieldTouched(propertyPath, true, false);
        }
    }, [setFieldTouched, setFieldValue]);

    const onError = useCallback((id: string, error: boolean) => {
        const propertyPath = id ? idToPropertiesPath(id) : undefined;
        if (propertyPath) {
            setFieldError(propertyPath, error ? "Property error" : undefined);
        }
    }, [setFieldError]);

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

        if (source.parentId !== destination.parentId) {
            setPendingMove([source, destination]);
        } else {
            doPropertyMove(source, destination);
        }

    };

    const closePropertyDialog = () => {
        setSelectedPropertyId(undefined);
    };

    const propertyEditForm = selectedPropertyId &&
        selectedProperty &&
        typeof selectedProperty === "object" &&
        <PropertyForm
            asDialog={asDialog}
            open={Boolean(selectedPropertyId)}
            key={`edit_view_${selectedPropertyId}`}
            propertyId={selectedPropertyId}
            property={selectedProperty}
            onPropertyChanged={onPropertyChanged}
            onError={onError}
            showErrors={showErrors}
            onOkClicked={asDialog
                ? closePropertyDialog
                : undefined
            }/>;

    const onSaveClicked = useCallback(() => {
        setShowErrors(hasError);
        if (hasError && onSaveAttemptWithError) {
            onSaveAttemptWithError();
        } else {
            return handleSubmit();
        }
    }, [hasError]);

    console.log("eee", hasError, cleanedErrors, dirty);
    return (
        <>
            <Box sx={{
                p: 3,
                [theme.breakpoints.down("md")]: {
                    p: 2
                },
                [theme.breakpoints.down("sm")]: {
                    p: 1
                }
            }}>
                <Container maxWidth={"lg"}>

                    <Box sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "end",
                        my: 1
                    }}>

                        <Box display={"flex"}
                             alignItems={"center"}
                             sx={{ py: 2 }}>

                            <Typography variant={"h4"}>
                                {values.name ? `${values.name} schema` : "Schema"}
                            </Typography>

                            <Box sx={{ ml: 1 }}>
                                <IconButton
                                    onClick={() => setSchemaDetailsDialogOpen(true)}
                                    size="large">
                                    <EditIcon/>
                                </IconButton>
                            </Box>
                        </Box>

                        <Button
                            color="primary"
                            variant={"outlined"}
                            size={"large"}
                            onClick={() => setNewPropertyDialogOpen(true)}
                            startIcon={<AddIcon/>}
                        >
                            Add property
                        </Button>
                    </Box>
                    <Box
                        sx={{ py: 2 }}>
                        <Grid container>
                            <Grid item xs={12}
                                  lg={5}>
                                <Tree
                                    key={`tree_${selectedPropertyId}_${hash(errors)}`}
                                    tree={tree}
                                    offsetPerLevel={40}
                                    renderItem={renderItem}
                                    onDragEnd={onDragEnd}
                                    isDragEnabled
                                    isNestingEnabled
                                />
                            </Grid>

                            {!asDialog && <Grid item xs={12}
                                                lg={7}
                                                sx={(theme) => ({
                                                    pl: 2
                                                })}>
                                <Box sx={(theme) => ({
                                    height: "100%",
                                    borderLeft: `1px solid ${theme.palette.divider}`,
                                    pl: 2
                                })}>
                                    <Paper variant={"outlined"} sx={theme => ({
                                        position: "sticky",
                                        top: theme.spacing(2),
                                        p: 2
                                    })}>
                                        {propertyEditForm}

                                        {!selectedProperty &&
                                            <Box>
                                                Select a
                                                property to
                                                edit it
                                            </Box>}
                                    </Paper>
                                </Box>
                            </Grid>}

                            {asDialog && propertyEditForm}

                        </Grid>
                    </Box>

                    {/*<SubmitListener/>*/}

                </Container>
            </Box>

            <CustomDialogActions>

                {isSubmitting && <CircularProgress size={16}
                                                   thickness={8}/>}

                <Button
                    color="primary"
                    disabled={isSubmitting}
                    onClick={onCancel}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isSubmitting || !dirty}
                    onClick={onSaveClicked}
                >
                    {isNewSchema ? "Create schema" : "Save schema"}
                </Button>
            </CustomDialogActions>

            <PendingMoveDialog open={Boolean(pendingMove)}
                               onAccept={() => {
                                   setPendingMove(undefined);
                                   if (pendingMove)
                                       doPropertyMove(pendingMove[0], pendingMove[1]);
                               }}
                               onCancel={() => setPendingMove(undefined)}/>

            <SchemaDetailsDialog open={schemaDetailsDialogOpen}
                                 isNewSchema={isNewSchema}
                                 handleOk={() => setSchemaDetailsDialogOpen(false)}/>

            <PropertyForm asDialog={true}
                          showErrors={showErrors}
                          open={newPropertyDialogOpen}
                          onCancel={() => setNewPropertyDialogOpen(false)}
                          onPropertyChanged={onPropertyCreated}/>

        </>
    );
}

function PendingMoveDialog({
                               open,
                               onAccept,
                               onCancel
                           }: { open: boolean, onAccept: () => void, onCancel: () => void }) {
    return <Dialog
        open={open}
        onClose={onCancel}
    >
        <DialogTitle>
            {"Are you sure?"}
        </DialogTitle>
        <DialogContent>
            <DialogContentText>
                You are moving one property from one context to
                another.
            </DialogContentText>
            <DialogContentText>
                This will <b>not transfer the data</b>, only modify
                the schema.
            </DialogContentText>
        </DialogContent>
        <CustomDialogActions>
            <Button
                onClick={onCancel}
                autoFocus>Cancel</Button>
            <Button
                variant="contained"
                onClick={onAccept}>
                Proceed
            </Button>
        </CustomDialogActions>
    </Dialog>;
}

export function SchemaEntry({
                                propertyKey,
                                propertyOrBuilder,
                                provided,
                                selected,
                                hasError,
                                onClick
                            }: {
    propertyKey: string;
    propertyOrBuilder: PropertyOrBuilder;
    provided: TreeDraggableProvided;
    selected: boolean;
    hasError: boolean;
    onClick: () => void;
}) {

    const widget = typeof propertyOrBuilder !== "function" ? getWidget(propertyOrBuilder) : undefined;
    return (
        <Box sx={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            pb: 1,
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
                width: "100%",
                display: "flex",
                flexDirection: "row"
            }}>
                <Paper variant={"outlined"}
                       sx={(theme) => ({
                           position: "relative",
                           flexGrow: 1,
                           p: 2,
                           border: hasError
                               ? `1px solid ${theme.palette.error.light}`
                               : (selected ? `1px solid ${theme.palette.primary.light}` : undefined)
                       })}
                       elevation={0}>

                    {typeof propertyOrBuilder === "object"
                        ? <PropertyPreview property={propertyOrBuilder}/>
                        : <PropertyBuilderPreview name={propertyKey}/>}

                    <IconButton {...provided.dragHandleProps}
                                size="small"
                                sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8
                                }}>
                        <DragHandleIcon fontSize={"small"}/>
                    </IconButton>
                </Paper>
            </Box>
        </Box>
    );

}

export function SubmitListener() {

    const formik = useFormikContext()
    const [lastValues, setLastValues] = React.useState(formik.values);

    React.useEffect(() => {
        const valuesEqualLastValues = equal(lastValues, formik.values)
        const valuesEqualInitialValues = equal(formik.values, formik.initialValues)

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
                             property
                         }: { property: Property }) {
    return (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>

            <Typography variant="subtitle1"
                        component="span"
                        sx={{ flexGrow: 1, pr: 2 }}>
                {property.title ? property.title : "\u00a0"}
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
                This property can only be edited in code
            </Typography>
        </Box>
    );
}

function isValidDrag(tree: TreeData, source: TreeSourcePosition, destination: TreeDestinationPosition) {
    const draggedPropertyId = tree.items[source.parentId].children[source.index];
    const draggedProperty = tree.items[draggedPropertyId].data.property;
    if (typeof draggedProperty === "function")
        return false;
    if (destination.index === undefined)
        return false;
    if (destination.parentId === tree.rootId)
        return true;
    const destinationPropertyId = tree.items[destination.parentId].id;
    const destinationProperty: Property = tree.items[destinationPropertyId].data.property;
    return typeof destinationProperty === "object" && destinationProperty.dataType === "map";
}
