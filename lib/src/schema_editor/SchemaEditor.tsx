import React, { useCallback, useEffect, useState } from "react";
import * as Yup from "yup";

import { Formik, FormikProps, getIn } from "formik";
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
    Paper,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

import { EntitySchema, Property } from "../models";
import {
    getFullId,
    idToPropertiesPath,
    namespaceToPropertiesOrderPath
} from "./util";
import { prepareSchemaForPersistence } from "../core/util/schemas";
import { PropertyForm } from "./PropertyEditView";
import { useSnackbarController } from "../hooks";
import {
    useConfigurationPersistence
} from "../hooks/useConfigurationPersistence";
import { CircularProgressCenter, ErrorView } from "../core";
import { useSchemaRegistry } from "../hooks/useSchemaRegistry";
import { toSnakeCase } from "../core/util/strings";
import { isEmptyObject, removeUndefined } from "../core/util/objects";
import { CustomDialogActions } from "../core/components/CustomDialogActions";
import { SchemaDetailsDialog } from "./SchemaDetailsView";
import { PropertyTree } from "./PropertyTree";
import { ErrorBoundary } from "../core/internal/ErrorBoundary";
import DragDropWithNestingTree from "./rm_me/tree_test";

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
                properties: {},
                propertiesOrder: []
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
    const [selectedPropertyNamespace, setSelectedPropertyNamespace] = useState<string | undefined>();
    const selectedPropertyFullId = getFullId(selectedPropertyId, selectedPropertyNamespace)
    const selectedProperty = selectedPropertyFullId ? getIn(values.properties, selectedPropertyFullId.replaceAll(".", ".properties.")) : undefined;

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

    const deleteProperty = useCallback((propertyId: string, namespace?: string) => {
        const fullId = getFullId(propertyId, namespace);
        if (!fullId)
            throw Error("Schema editor miss config");

        setFieldValue(idToPropertiesPath(fullId), undefined, false);
        const propertiesOrderPath = namespaceToPropertiesOrderPath(namespace);
        const currentPropertiesOrder: string[] = getIn(values, propertiesOrderPath);
        setFieldValue(propertiesOrderPath, currentPropertiesOrder.filter((p) => p !== propertyId), false);
        setNewPropertyDialogOpen(false);

        setSelectedPropertyId(undefined);
        setSelectedPropertyNamespace(undefined);
    }, [setFieldValue, values]);

    const doPropertyMove = useCallback((properties, propertiesOrder) => {
        setFieldValue("propertiesOrder", propertiesOrder, false);
        setFieldValue("properties", properties, false);
    }, [setFieldValue]);

    const onPropertyCreated = useCallback((id: string, property: Property) => {
        setFieldValue("properties", {
            ...(values.properties ?? {}),
            [id]: property
        }, false);
        setFieldValue("propertiesOrder", [...(values.propertiesOrder ?? Object.keys(values.properties)), id], false);
        setNewPropertyDialogOpen(false);
    }, [values.properties, values.propertiesOrder]);

    const onPropertyChanged = useCallback((id, property, namespace) => {
        const fullId = getFullId(id, namespace);
        const propertyPath = fullId ? idToPropertiesPath(fullId) : undefined;
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

    const closePropertyDialog = () => {
        setSelectedPropertyId(undefined);
    };

    const propertyEditForm = selectedPropertyFullId &&
        selectedProperty &&
        typeof selectedProperty === "object" &&
        <PropertyForm
            asDialog={asDialog}
            open={Boolean(selectedPropertyId)}
            key={`edit_view_${selectedPropertyId}`}
            propertyId={selectedPropertyId}
            propertyNamespace={selectedPropertyNamespace}
            property={selectedProperty}
            onPropertyChanged={onPropertyChanged}
            onDelete={deleteProperty}
            onError={onError}
            forceShowErrors={showErrors}
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

    return (
        <Box sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column"
        }}>
            <Box sx={{
                flexGrow: 1,
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
                        alignItems: "center",
                        my: 2
                    }}>

                        <Box display={"flex"}
                             sx={{
                                 display: "flex",
                                 flexGrow: 1,
                                 alignItems: "center",
                                 mr: 1
                             }}>

                            <Typography variant={"h4"}>
                                {values.name ? `${values.name} schema` : "Schema"}
                            </Typography>

                            <Box sx={{ ml: 1 }}>
                                <Button
                                    onClick={() => setSchemaDetailsDialogOpen(true)}
                                    size="large">
                                    <EditIcon/>
                                </Button>
                            </Box>
                        </Box>

                        <Button
                            color="primary"
                            variant={"outlined"}
                            size={"large"}
                            onClick={() => setNewPropertyDialogOpen(true)}
                            startIcon={<AddIcon/>}>
                            Add property
                        </Button>
                    </Box>
                    <Box
                        sx={{ py: 2 }}>
                        <Grid container>
                            <Grid item xs={12}
                                  lg={5}>
                                <ErrorBoundary>
                                    {/*<DragDropWithNestingTree/>*/}
                                    <PropertyTree
                                        setSelectedPropertyId={setSelectedPropertyId}
                                        selectedPropertyId={selectedPropertyId}
                                        setSelectedPropertyNamespace={setSelectedPropertyNamespace}
                                        selectedPropertyNamespace={selectedPropertyNamespace}
                                        properties={values.properties}
                                        propertiesOrder={values.propertiesOrder ?? Object.keys(values.properties) as (keyof M)[]}
                                        onPropertyMove={doPropertyMove}
                                        errors={errors}/>
                                </ErrorBoundary>
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

            <SchemaDetailsDialog open={schemaDetailsDialogOpen}
                                 isNewSchema={isNewSchema}
                                 handleOk={() => setSchemaDetailsDialogOpen(false)}/>

            <PropertyForm asDialog={true}
                          forceShowErrors={showErrors}
                          open={newPropertyDialogOpen}
                          onCancel={() => setNewPropertyDialogOpen(false)}
                          onPropertyChanged={onPropertyCreated}/>

        </Box>
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

