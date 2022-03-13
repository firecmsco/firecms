import React, { useCallback, useEffect, useRef, useState } from "react";

import {
    Form,
    Formik,
    FormikHelpers,
    getIn,
    setIn,
    useFormikContext
} from "formik";
import Measure, { ContentRect } from "react-measure";
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
    }, [schemaId, schemaRegistry]);

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

    const initialValues: EntitySchema = {
        id: "",
        name: "",
        properties: {},
        propertiesOrder: []
    };

    return (
        <Formik
            initialValues={schema ?? initialValues}
            validationSchema={YupSchema}
            validate={() => propertyErrorsRef.current}
            onSubmit={(newSchema: EntitySchema, formikHelpers: FormikHelpers<EntitySchema>) => {
                saveSchema(newSchema).then(() => {
                    formikHelpers.resetForm({ values: newSchema });
                });
            }}
        >
            {({ isSubmitting, dirty, errors, submitCount }) => {

                const showErrors = submitCount > 0;

                const onCancel = handleClose ? () => handleClose(undefined) : undefined;

                const onPropertyError = (propertyId: string, namespace?: string, error?: string) => {
                    propertyErrorsRef.current = setIn(propertyErrorsRef.current, idToPropertiesPath(getFullId(propertyId, namespace)), error);
                    propertyErrorsRef.current = removeUndefined(propertyErrorsRef.current);
                };

                return (

                    <Form noValidate
                          style={{
                              display: "flex",
                              flexDirection: "column",
                              position: "relative",
                              height: "100%"
                          }}>

                        <Box sx={{
                            height: "100%",
                            flexGrow: 1
                        }}>
                            <SchemaEditorForm showErrors={showErrors}
                                              onPropertyError={onPropertyError}/>
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
    onPropertyError: (propertyKey: string, namespace: string | undefined, error: string | undefined) => void;
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
    const asDialog = !largeLayout

    const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>();
    const [selectedPropertyNamespace, setSelectedPropertyNamespace] = useState<string | undefined>();
    const selectedPropertyFullId = selectedPropertyId ? getFullId(selectedPropertyId, selectedPropertyNamespace) : undefined;
    const selectedProperty = selectedPropertyFullId ? getIn(values.properties, selectedPropertyFullId.replaceAll(".", ".properties.")) : undefined;

    const [newPropertyDialogOpen, setNewPropertyDialogOpen] = useState<boolean>(false);
    const [schemaDetailsDialogOpen, setSchemaDetailsDialogOpen] = useState<boolean>(false);
    const [height, setHeight] = useState<number>();

    const onMeasure = useCallback((contentRect: ContentRect) => {
        if (contentRect?.bounds) {
            setHeight(contentRect?.bounds.height);
        }
    }, []);

    const deleteProperty = useCallback((propertyId?: string, namespace?: string) => {
        const fullId = propertyId ? getFullId(propertyId, namespace) : undefined;
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

    const onPropertyMove = useCallback((propertiesOrder, namespace) => {
        setFieldValue(namespaceToPropertiesOrderPath(namespace), propertiesOrder, false);
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

    const onPropertyErrorInternal = useCallback((id: string, namespace?: string, error?: boolean) => {
        const propertyPath = id ? getFullId(id, namespace) : undefined;
        if (propertyPath) {
            onPropertyError(id, namespace, error ? "Property error" : undefined);
            setFieldError(idToPropertiesPath(propertyPath), error ? "Property error" : undefined);
        }
    }, [setFieldError]);

    const closePropertyDialog = () => {
        setSelectedPropertyId(undefined);
    };

    const propertyEditForm = selectedPropertyFullId &&
        selectedProperty &&
        typeof selectedProperty === "object" &&
        <PropertyForm
            inArray={false}
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

    const addPropertyButton = <Button
        color="primary"
        variant={"outlined"}
        size={"large"}
        sx={{ width: "100%" }}
        onClick={() => setNewPropertyDialogOpen(true)}
        startIcon={<AddIcon/>}>
        Add new property
    </Button>;

    const body = (
        <Grid container>
            <Grid item
                  xs={12}
                  lg={5}
                  sx={(theme) => ({
                      p: 3,
                      [theme.breakpoints.down("md")]: {
                          p: 2
                      },
                      [theme.breakpoints.down("sm")]: {
                          p: 1
                      }
                  })}>

                <Box display={"flex"}
                     sx={{
                         display: "flex",
                         alignItems: "center",
                         my: 2
                     }}>

                    <Typography variant={"h4"} sx={{
                        flexGrow: 1
                    }}>
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


                <Box mb={2} mt={3}>
                    {addPropertyButton}
                </Box>

                <ErrorBoundary>
                    <PropertyTree
                        onPropertyClick={(propertyKey, namespace) => {
                            setSelectedPropertyId(propertyKey);
                            setSelectedPropertyNamespace(namespace);
                        }}
                        selectedPropertyKey={selectedPropertyId ? getFullId(selectedPropertyId, selectedPropertyNamespace) : undefined}
                        properties={values.properties}
                        propertiesOrder={(values.propertiesOrder ?? Object.keys(values.properties)) as string[]}
                        onPropertyMove={onPropertyMove}
                        errors={showErrors ? errors : {}}/>
                </ErrorBoundary>

                {!emptySchema && <Box my={2}>
                    {addPropertyButton}
                </Box>}
            </Grid>

            {!asDialog && <Grid item xs={12}
                                lg={7}
                                sx={(theme) => ({
                                    pl: 2
                                })}>
                <Box sx={(theme) => ({
                    height: "100%",
                    p: 2,
                    borderLeft: `1px solid ${theme.palette.divider}`,
                    // pl: 2
                })}>
                    <Paper variant={"outlined"}
                           sx={theme => ({
                               position: "sticky",
                               top: theme.spacing(2),
                               p: 2,
                               height: height ? `calc(${height}px - 88px)` : "100%",
                               overflow: "scroll",
                           })}>

                        {propertyEditForm}

                        {!selectedProperty &&
                            <Box sx={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                {emptySchema
                                    ? "Now you can add your first property"
                                    : "Select a property to edit it"}
                            </Box>}
                    </Paper>
                </Box>
            </Grid>}

            {asDialog && propertyEditForm}

        </Grid>);

    return (
        <Measure
            bounds
            onResize={onMeasure}
        >
            {({ measureRef }) => (
                <Box ref={measureRef}
                     sx={{
                         height: "100%",
                         overflow: "scroll"
                     }}>

                    <Container fixed
                               maxWidth={"lg"}>

                        {body}

                    </Container>

                    <Box height={52}/>

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

                    <PropertyForm
                        inArray={false}
                        asDialog={true}
                        existing={false}
                        forceShowErrors={showErrors}
                        open={newPropertyDialogOpen}
                        onCancel={() => setNewPropertyDialogOpen(false)}
                        onPropertyChanged={onPropertyCreated}/>

                </Box>

            )}
        </Measure>
    );
}
