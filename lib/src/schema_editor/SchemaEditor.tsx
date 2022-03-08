import React, { useCallback, useEffect, useRef, useState } from "react";

import {
    Form,
    Formik,
    FormikHelpers,
    getIn,
    setIn,
    useFormikContext
} from "formik";
import {
    Box,
    Button,
    Container,
    Dialog,
    Grid,
    Paper,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";

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
import { removeUndefined } from "../core/util/objects";
import { CustomDialogActions } from "../core/components/CustomDialogActions";
import { PropertyTree } from "./PropertyTree";
import { ErrorBoundary } from "../core/internal/ErrorBoundary";
import { LoadingButton } from "@mui/lab";
import { YupSchema } from "./SchemaYupValidation";
import { SchemaDetailsForm } from "./SchemaDetailsForm";

export type SchemaEditorProps<M> = {
    schemaId?: string;
    handleClose?: (updatedSchema?: EntitySchema<M>) => void;
};

export function SchemaEditor<M>({
                                    schemaId,
                                    handleClose,
                                }: SchemaEditorProps<M>) {

    const schemaRegistry = useSchemaRegistry();
    const configurationPersistence = useConfigurationPersistence();
    const snackbarController = useSnackbarController();

    // Use this ref to store which properties have errors
    const propertyErrorsRef = useRef({});

    if (!configurationPersistence)
        throw Error("Can't use the schema editor without specifying a `ConfigurationPersistence`");

    const [schema, setSchema] = React.useState<EntitySchema | undefined>();
    const [initialError, setInitialError] = React.useState<Error | undefined>();

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
            setInitialError(initialError);
        }
    }, [schema, schemaRegistry]);

    const saveSchema = useCallback((schema: EntitySchema<M>): Promise<boolean> => {
        const newSchema = prepareSchemaForPersistence(schema);
        return configurationPersistence.saveSchema(newSchema)
            .then(() => {
                setInitialError(undefined);
                snackbarController.open({
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
                snackbarController.open({
                    type: "error",
                    title: "Error persisting schema",
                    message: "Details in the console"
                });
                return false;
            });
    }, [configurationPersistence, handleClose, snackbarController]);

    if (initialError) {
        return <ErrorView error={`Error fetching schema ${schemaId}`}/>;
    }

    if (!schemaRegistry.initialised || !schema) {
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
            validate={() => propertyErrorsRef.current}
            onSubmit={(newSchema: EntitySchema, formikHelpers: FormikHelpers<EntitySchema>) => {
                console.log("onSubmit")
                saveSchema(newSchema).then(() => {
                    formikHelpers.resetForm({ values: newSchema });
                });
            }}
        >
            {({ isSubmitting, dirty, errors, submitCount }) => {

                const showErrors = submitCount > 0;

                const onCancel = handleClose ? () => handleClose(undefined) : undefined;
                return (
                    <Form noValidate
                          style={{
                              display: "flex",
                              height: "100%",
                              flexDirection: "column",
                              position: "relative",
                          }}>

                        <Box sx={{
                            flexGrow: 1,
                            overflow: "scroll",
                            p: 2
                        }}>
                            <SchemaEditorForm showErrors={showErrors}
                                              onPropertyError={(propertyPath, error) => {
                                                  propertyErrorsRef.current = setIn(propertyErrorsRef.current, propertyPath, error);
                                                  propertyErrorsRef.current = removeUndefined(propertyErrorsRef.current);
                                              }}/>
                            <Box height={64}/>
                        </Box>
                        <CustomDialogActions position={"absolute"}>
                            <Button
                                color="primary"
                                disabled={isSubmitting}
                                onClick={onCancel}
                            >
                                Cancel
                            </Button>

                            <LoadingButton
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={!dirty}
                                loading={isSubmitting}
                                loadingPosition="start"
                                startIcon={<SaveIcon/>}
                            >
                                Save schema
                            </LoadingButton>

                        </CustomDialogActions>
                    </Form>
                );
            }}

        </Formik>

    );
}

export function SchemaEditorForm<M>({
                                        showErrors,
                                        onPropertyError
                                    }: {
    showErrors: boolean;
    onPropertyError: (propertyKey: string, error: string | undefined) => void;
}) {

    const {
        values,
        setFieldValue,
        setFieldError,
        setFieldTouched,
        errors
    } = useFormikContext<EntitySchema>();

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("lg"));
    const asDialog = !largeLayout;

    const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>();
    const [selectedPropertyNamespace, setSelectedPropertyNamespace] = useState<string | undefined>();
    const selectedPropertyFullId = getFullId(selectedPropertyId, selectedPropertyNamespace)
    const selectedProperty = selectedPropertyFullId ? getIn(values.properties, selectedPropertyFullId.replaceAll(".", ".properties.")) : undefined;

    const [newPropertyDialogOpen, setNewPropertyDialogOpen] = useState<boolean>(false);
    const [schemaDetailsDialogOpen, setSchemaDetailsDialogOpen] = useState<boolean>(false);

    const deleteProperty = useCallback((propertyId?: string, namespace?: string) => {
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

    const onPropertyCreated = useCallback(({
                                               id,
                                               property
                                           }: { id?: string, property: Property }) => {
        if (!id) {
            throw Error("Need to include an ID when creating a new property")
        }
        setFieldValue("properties", {
            ...(values.properties ?? {}),
            [id]: property
        }, false);
        setFieldValue("propertiesOrder", [...(values.propertiesOrder ?? Object.keys(values.properties)), id], false);
        setNewPropertyDialogOpen(false);
    }, [values.properties, values.propertiesOrder]);

    const onPropertyChanged = useCallback(({ id, property, namespace }) => {
        const fullId = getFullId(id, namespace);
        const propertyPath = fullId ? idToPropertiesPath(fullId) : undefined;
        if (propertyPath) {
            setFieldValue(propertyPath, property, false);
            setFieldTouched(propertyPath, true, false);
        }
    }, [setFieldTouched, setFieldValue]);

    const onPropertyErrorInternal = useCallback((id: string, error: boolean) => {
        const propertyPath = id ? idToPropertiesPath(id) : undefined;
        if (propertyPath) {
            onPropertyError(propertyPath, error ? "Property error" : undefined);
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
            existing={true}
            propertyId={selectedPropertyId}
            propertyNamespace={selectedPropertyNamespace}
            property={selectedProperty}
            onPropertyChanged={onPropertyChanged}
            onDelete={deleteProperty}
            onError={onPropertyErrorInternal}
            forceShowErrors={showErrors}
            onOkClicked={asDialog
                ? closePropertyDialog
                : undefined
            }/>;

    const emptySchema = values?.propertiesOrder === undefined || values.propertiesOrder.length === 0;

    const addPropertyIcon = <Button
        color="primary"
        variant={"outlined"}
        size={"large"}
        onClick={() => setNewPropertyDialogOpen(true)}
        startIcon={<AddIcon/>}>
        Add property
    </Button>;

    const TitleComponent = <Box sx={{
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

        {!emptySchema && addPropertyIcon}
    </Box>;

    let body;
    if (emptySchema) {
        body = <Box display="flex"
                    flexDirection={"column"}
                    alignItems="center"
                    justifyContent="center"
                    width={"100%"}
                    sx={{ flexGrow: 1 }}
                    padding={2}>
            <Box m={2}>Now you can add your first property</Box>
            {addPropertyIcon}
        </Box>
    } else {
        body = <Box
            sx={{ py: 2 }}>
            <Grid container>
                <Grid item xs={12}
                      lg={5}>
                    <ErrorBoundary>
                        <PropertyTree
                            setSelectedPropertyId={setSelectedPropertyId}
                            selectedPropertyId={selectedPropertyId}
                            setSelectedPropertyNamespace={setSelectedPropertyNamespace}
                            selectedPropertyNamespace={selectedPropertyNamespace}
                            properties={values.properties}
                            propertiesOrder={values.propertiesOrder ?? Object.keys(values.properties) as (keyof M)[]}
                            onPropertyMove={doPropertyMove}
                            showErrors={showErrors}
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
                                <Box sx={{
                                    maxHeight: "80%",
                                    minHeight: "600px"
                                }}>
                                    Select a property to edit it
                                </Box>}
                        </Paper>
                    </Box>
                </Grid>}

                {asDialog && propertyEditForm}

            </Grid>
        </Box>

    }

    return (
        <>
            <Container fixed
                       maxWidth={"lg"}
                       sx={{
                           p: 3,
                           [theme.breakpoints.down("md")]: {
                               p: 2
                           },
                           [theme.breakpoints.down("sm")]: {
                               p: 1
                           }
                       }}>

                {TitleComponent}

                {body}

            </Container>

            <Dialog
                open={schemaDetailsDialogOpen}
                onClose={() => setSchemaDetailsDialogOpen(false)}
            >
                <SchemaDetailsForm isNewSchema={false}/>
                <CustomDialogActions>
                    <Button
                        variant="contained"
                        onClick={() => setSchemaDetailsDialogOpen(false)}> Ok </Button>
                </CustomDialogActions>
            </Dialog>

            <PropertyForm asDialog={true}
                          existing={false}
                          forceShowErrors={showErrors}
                          open={newPropertyDialogOpen}
                          onCancel={() => setNewPropertyDialogOpen(false)}
                          onPropertyChanged={onPropertyCreated}/>

        </>
    );
}
