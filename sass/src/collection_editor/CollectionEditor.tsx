import React, { useCallback, useEffect, useRef, useState } from "react";

import {
    Form,
    Formik,
    FormikErrors,
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
    IconButton,
    Paper,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";

import {
    CircularProgressCenter,
    CustomDialogActions,
    EntityCollection,
    ErrorBoundary,
    ErrorView,
    isPropertyBuilder,
    Property,
    removeUndefined,
    useNavigationContext,
    useSnackbarController
} from "@camberi/firecms";
import {
    getFullId,
    idToPropertiesPath,
    namespaceToPropertiesOrderPath
} from "./util";
import { PropertyForm } from "./PropertyEditView";
import { PropertyTree } from "./PropertyTree";
import { LoadingButton } from "@mui/lab";
import { YupSchema } from "./SchemaYupValidation";
import { CollectionDetailsForm } from "./CollectionDetailsForm";
import { useCollectionsController } from "../useCollectionsController";

export type CollectionEditorProps<M> = {
    path: string;
    handleClose?: (updatedCollection?: EntityCollection<M>) => void;
    setDirty?: (dirty: boolean) => void;
};

export const CollectionEditor = React.memo(
    function CollectionEditor<M>({
                                     path,
                                     handleClose,
                                     setDirty
                                 }: CollectionEditorProps<M>) {

        const navigationContext = useNavigationContext();
        const collectionsController = useCollectionsController();
        const snackbarController = useSnackbarController();

        // Use this ref to store which properties have errors
        const propertyErrorsRef = useRef({});

        if (!collectionsController)
            throw Error("Can't use the collection editor without specifying a `CollectionsController`");

        const [collection, setCollection] = React.useState<EntityCollection | undefined>();
        const [initialLoadingCompleted, setInitialLoadingCompleted] = React.useState(false);
        const [initialError, setInitialError] = React.useState<Error | undefined>();

        useEffect(() => {
            try {
                if (navigationContext.initialised) {
                    if (path) {
                        setCollection(navigationContext.getCollection(path, undefined, false));
                    } else {
                        setCollection(undefined);
                    }
                    setInitialLoadingCompleted(true);
                }
            } catch (e) {
                console.error(e);
                setInitialError(initialError);
            }
        }, [path, navigationContext.initialised]);

        const saveCollection = useCallback((collection: EntityCollection<M>): Promise<boolean> => {
            return collectionsController.saveCollection(path, collection)
                .then(() => {
                    setInitialError(undefined);
                    snackbarController.open({
                        type: "success",
                        message: "Collection updated"
                    });
                    if (handleClose) {
                        handleClose(collection);
                    }
                    return true;
                })
                .catch((e) => {
                    console.error(e);
                    snackbarController.open({
                        type: "error",
                        title: "Error persisting collection",
                        message: e.message ?? "Details in the console"
                    });
                    return false;
                });
        }, [handleClose, path]);

        if (initialError) {
            return <ErrorView error={`Error fetching collection ${path}`}/>;
        }

        if (!navigationContext.initialised || !initialLoadingCompleted) {
            return <CircularProgressCenter/>;
        }

        const initialValues: EntityCollection = {
            path: "",
            name: "",
            properties: {},
            propertiesOrder: []
        };

        return (
            <Formik
                initialValues={collection ?? initialValues}
                validationSchema={YupSchema}
                validate={() => propertyErrorsRef.current}
                onSubmit={(newCollection: EntityCollection, formikHelpers: FormikHelpers<EntityCollection>) => {
                    return saveCollection(newCollection).then(() => {
                        // formikHelpers.resetForm({ values: newCollection });
                        return true;
                    });
                }}
            >
                {({ isSubmitting, dirty, errors, submitCount }) => {

                    const showErrors = submitCount > 0;

                    const onCancel = handleClose ? () => handleClose(undefined) : undefined;

                    const onPropertyError = (propertyKey: string, namespace?: string, error?: FormikErrors<any>) => {
                        propertyErrorsRef.current = setIn(propertyErrorsRef.current, idToPropertiesPath(getFullId(propertyKey, namespace)), error);
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
                            <CollectionEditorForm showErrors={showErrors}
                                                  onPropertyError={onPropertyError}
                                                  setDirty={setDirty}
                                                  propertyErrorsRef={propertyErrorsRef}
                                                  isNewCollection={false}
                            />
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
                                Save collection
                            </LoadingButton>

                        </CustomDialogActions>
                    </Form>
                );
                }}

            </Formik>

        );
    },
    function areEqual(prevProps: CollectionEditorProps<any>, nextProps: CollectionEditorProps<any>) {
        return prevProps.path === nextProps.path;
    }
)

type CollectionEditorFormProps = {
    showErrors: boolean;
    isNewCollection: boolean;
    propertyErrorsRef?: React.MutableRefObject<any>;
    onPropertyError: (propertyKey: string, namespace: string | undefined, error?: FormikErrors<any>) => void;
    setDirty?: (dirty: boolean) => void;
};

export // const CollectionEditorForm = React.memo(
function CollectionEditorForm({
                                  showErrors,
                                  isNewCollection,
                                  propertyErrorsRef,
                                  onPropertyError,
                                  setDirty
                              }: CollectionEditorFormProps) {

    const {
        values,
        setFieldValue,
        setFieldError,
        setFieldTouched,
        errors,
        dirty
    } = useFormikContext<EntityCollection>();

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("lg"));
    const asDialog = !largeLayout

    const [selectedPropertyKey, setSelectedPropertyKey] = useState<string | undefined>();
    const [selectedPropertyNamespace, setSelectedPropertyNamespace] = useState<string | undefined>();
    const selectedPropertyFullId = selectedPropertyKey ? getFullId(selectedPropertyKey, selectedPropertyNamespace) : undefined;
    const selectedProperty = selectedPropertyFullId ? getIn(values.properties, selectedPropertyFullId.replaceAll(".", ".properties.")) : undefined;

    const [newPropertyDialogOpen, setNewPropertyDialogOpen] = useState<boolean>(false);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState<boolean>(false);
    const [height, setHeight] = useState<number>();

    const onMeasure = useCallback((contentRect: ContentRect) => {
        if (contentRect?.bounds) {
            setHeight(contentRect?.bounds.height);
        }
    }, []);

    useEffect(() => {
        if (setDirty)
            setDirty(dirty);
    }, [dirty])

    const deleteProperty = useCallback((propertyKey?: string, namespace?: string) => {
        const fullId = propertyKey ? getFullId(propertyKey, namespace) : undefined;
        if (!fullId)
            throw Error("collection editor miss config");

            setFieldValue(idToPropertiesPath(fullId), undefined, false);
            const propertiesOrderPath = namespaceToPropertiesOrderPath(namespace);
            const currentPropertiesOrder: string[] = getIn(values, propertiesOrderPath);
            setFieldValue(propertiesOrderPath, currentPropertiesOrder.filter((p) => p !== propertyKey), false);
            setNewPropertyDialogOpen(false);

            setSelectedPropertyKey(undefined);
            setSelectedPropertyNamespace(undefined);
        }, [setFieldValue, values]);

    const onPropertyMove = useCallback((propertiesOrder: string[], namespace?: string) => {
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
        setSelectedPropertyKey(id);
        setSelectedPropertyNamespace(undefined);
    }, [values.properties, values.propertiesOrder]);

    const onPropertyChanged = useCallback(({ id, property, namespace }: { id?: string, property: Property, namespace?: string }) => {
        const fullId = id ? getFullId(id, namespace) : undefined;
        const propertyPath = fullId ? idToPropertiesPath(fullId) : undefined;
        if (propertyPath) {
            setFieldValue(propertyPath, property, false);
            setFieldTouched(propertyPath, true, false);
        }
    }, [setFieldTouched, setFieldValue]);

    const onPropertyErrorInternal = useCallback((id: string, namespace?: string, error?: FormikErrors<any>) => {
        const propertyPath = id ? getFullId(id, namespace) : undefined;
        if (propertyPath) {
            const hasError = error && Object.keys(error).length > 0;
            onPropertyError(id, namespace, hasError ? error : undefined);
            setFieldError(idToPropertiesPath(propertyPath), hasError ? "Field error" : undefined);
        }
    }, [onPropertyError, setFieldError]);

    const closePropertyDialog = () => {
        setSelectedPropertyKey(undefined);
    };

    const initialErrors = selectedPropertyKey && propertyErrorsRef?.current?.properties ? propertyErrorsRef.current.properties[selectedPropertyKey] : undefined;
    const propertyEditForm = selectedPropertyFullId &&
        selectedProperty &&
        !isPropertyBuilder(selectedProperty) &&
        <PropertyForm
            inArray={false}
            asDialog={asDialog}
            open={Boolean(selectedPropertyKey)}
            key={`edit_view_${selectedPropertyKey}`}
            existing={true}
            propertyKey={selectedPropertyKey}
            propertyNamespace={selectedPropertyNamespace}
            property={selectedProperty}
            onPropertyChanged={onPropertyChanged}
            onDelete={deleteProperty}
            onError={onPropertyErrorInternal}
            forceShowErrors={showErrors}
            initialErrors={initialErrors}
            onOkClicked={asDialog
                ? closePropertyDialog
                : undefined
            }/>;

    const emptyCollection = values?.propertiesOrder === undefined || values.propertiesOrder.length === 0;

    const usedPropertiesOrder = (values.propertiesOrder ?
        values.propertiesOrder.filter(propertyKey => values.properties[propertyKey as string])
        : Object.keys(values.properties)) as string[];

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

                    <Box sx={{
                        flexGrow: 1
                    }}>
                        {values.name && <Typography variant={"h4"}>
                            {values.name}
                        </Typography>
                        }

                        <Typography variant={"subtitle2"} sx={{
                            color: "text.secondary"
                        }}>
                            {"Collection".toUpperCase()}
                        </Typography>
                    </Box>

                    <Box sx={{ ml: 1 }}>
                        <IconButton
                            color={"primary"}
                            onClick={() => setDetailsDialogOpen(true)}>
                            <EditIcon/>
                        </IconButton>
                    </Box>
                    <Box sx={{ ml: 1 }}>
                        <Button
                            variant={"outlined"}
                            onClick={() => setNewPropertyDialogOpen(true)}>
                            <AddIcon/>
                        </Button>
                    </Box>
                </Box>

                <ErrorBoundary>
                    <PropertyTree
                        onPropertyClick={(propertyKey, namespace) => {
                            setSelectedPropertyKey(propertyKey);
                            setSelectedPropertyNamespace(namespace);
                        }}
                        selectedPropertyKey={selectedPropertyKey ? getFullId(selectedPropertyKey, selectedPropertyNamespace) : undefined}
                        properties={values.properties}
                        propertiesOrder={usedPropertiesOrder}
                        onPropertyMove={onPropertyMove}
                        errors={showErrors ? errors : {}}/>
                </ErrorBoundary>

                <Box mt={2}>
                    <Button
                        color="primary"
                        variant={"outlined"}
                        size={"large"}
                        sx={{ width: "100%" }}
                        onClick={() => setNewPropertyDialogOpen(true)}
                        // autoFocus={true}
                        startIcon={<AddIcon/>}>
                        Add new property
                    </Button>
                </Box>
            </Grid>

            {!asDialog && <Grid item xs={12}
                                lg={7}
                                sx={(theme) => ({
                                    pl: 2
                                })}>
                <Box sx={(theme) => ({
                    height: "100%",
                    p: 2,
                    borderLeft: `1px solid ${theme.palette.divider}`
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
                                {!emptyCollection
                                    ? "Now you can add your first field"
                                    : "Select a field to edit it"}
                            </Box>}

                        {selectedProperty && isPropertyBuilder(selectedProperty) &&
                            <Box sx={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                {"This field cannot be edited"}
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
                        open={detailsDialogOpen}
                        onClose={() => setDetailsDialogOpen(false)}
                    >
                        <CollectionDetailsForm isNewCollection={false}/>
                        <CustomDialogActions position={"absolute"}>
                            <Button
                                variant="contained"
                                onClick={() => setDetailsDialogOpen(false)}> Ok </Button>
                        </CustomDialogActions>
                    </Dialog>

                    <PropertyForm
                        inArray={false}
                        asDialog={true}
                        existing={false}
                        forceShowErrors={showErrors}
                        open={newPropertyDialogOpen}
                        onCancel={() => setNewPropertyDialogOpen(false)}
                        onPropertyChanged={onPropertyCreated}
                        existingPropertyKeys={values.propertiesOrder as string[]}/>

                </Box>

            )}
        </Measure>
    );
}

//     ,
//     equal
// )
