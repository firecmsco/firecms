import * as React from "react";
import { useEffect, useRef, useState } from "react";
import {
    CircularProgressCenter,
    ConfirmationDialog,
    Entity,
    EntityCollection,
    ErrorView,
    isPropertyBuilder,
    MapProperty,
    mergeDeep,
    NavigationResult,
    Properties,
    PropertiesOrBuilders,
    Property,
    PropertyConfig,
    PropertyOrBuilder,
    randomString,
    removeInitialAndTrailingSlashes,
    removeUndefined,
    useAuthController,
    useCustomizationController,
    useNavigationController,
    User,
    useSnackbarController
} from "@firecms/core";
import {
    ArrowBackIcon,
    Button,
    CheckIcon,
    cls,
    coolIconKeys,
    defaultBorderMixin,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    LoadingButton,
    Tab,
    Tabs,
    Typography
} from "@firecms/ui";
import { YupSchema } from "./CollectionYupValidation";
import { CollectionDetailsForm } from "./CollectionDetailsForm";
import { CollectionPropertiesEditorForm } from "./CollectionPropertiesEditorForm";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";
import { SubcollectionsEditTab } from "./SubcollectionsEditTab";
import { CollectionsConfigController } from "../../types/config_controller";
import { CollectionEditorWelcomeView } from "./CollectionEditorWelcomeView";
import { CollectionInference } from "../../types/collection_inference";
import { getInferenceType, ImportSaveInProgress, useImportConfig } from "@firecms/data_import";
import { buildEntityPropertiesFromData } from "@firecms/schema_inference";
import { CollectionEditorImportMapping } from "./import/CollectionEditorImportMapping";
import { CollectionEditorImportDataPreview } from "./import/CollectionEditorImportDataPreview";
import { cleanPropertiesFromImport } from "./import/clean_import_data";
import { PersistedCollection } from "../../types/persisted_collection";
import { Formex, FormexController, useCreateFormex } from "@firecms/formex";
import { getFullIdPath } from "./util";
import { EntityActionsEditTab } from "./EntityActionsEditTab";

export interface CollectionEditorDialogProps {
    open: boolean;
    isNewCollection: boolean;
    initialValues?: {
        group?: string,
        path?: string,
        name?: string,
    }
    editedCollectionId?: string;
    fullPath?: string; // full path of this particular collection, like `products/123/locales`
    parentCollectionIds?: string[]; // path ids of the parent collection, like [`products`]
    handleClose: (collection?: EntityCollection) => void;
    configController: CollectionsConfigController;
    reservedGroups?: string[];
    collectionInference?: CollectionInference;
    extraView?: {
        View: React.ComponentType<{
            path: string
        }>,
        icon: React.ReactNode
    };
    pathSuggestions?: string[];
    getUser?: (uid: string) => User | null;
    getData?: (path: string, parentPaths: string[]) => Promise<object[]>;
    parentCollection?: PersistedCollection;
    existingEntities?: Entity<any>[];
}

export function CollectionEditorDialog(props: CollectionEditorDialogProps) {

    const open = props.open;

    const [formDirty, setFormDirty] = React.useState<boolean>(false);
    const [unsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = React.useState<boolean>(false);

    const handleCancel = () => {
        if (!formDirty) {
            props.handleClose(undefined);
        } else {
            setUnsavedChangesDialogOpen(true);
        }
    };

    useEffect(() => {
        if (!open) {
            setFormDirty(false);
            setUnsavedChangesDialogOpen(false);
        }
    }, [open]);

    return (
        <Dialog
            open={open}
            fullWidth={true}
            fullHeight={true}
            scrollable={false}
            maxWidth={"7xl"}
            onOpenChange={(open) => !open ? handleCancel() : undefined}
        >
            <DialogTitle hidden>Collection editor</DialogTitle>
            {open && <CollectionEditor {...props}
                                       handleCancel={handleCancel}
                                       setFormDirty={setFormDirty}/>}

            <UnsavedChangesDialog
                open={unsavedChangesDialogOpen}
                handleOk={() => props.handleClose(undefined)}
                handleCancel={() => setUnsavedChangesDialogOpen(false)}
                body={"There are unsaved changes in this collection"}/>

        </Dialog>
    );
}

type EditorView = "welcome"
    | "details"
    | "import_data_mapping"
    | "import_data_preview"
    | "import_data_saving"
    | "properties"
    | "loading"
    | "extra_view"
    | "subcollections"
    | "custom_actions";

export function CollectionEditor(props: CollectionEditorDialogProps & {
    handleCancel: () => void,
    setFormDirty: (dirty: boolean) => void
}) {
    const { propertyConfigs } = useCustomizationController();
    const navigation = useNavigationController();
    const authController = useAuthController();

    const {
        topLevelNavigation,
        collections
    } = navigation;

    const initialValuesProp = props.initialValues;
    const includeTemplates = !initialValuesProp?.path && (props.parentCollectionIds ?? []).length === 0;
    const collectionsInThisLevel = (props.parentCollection ? props.parentCollection.subcollections : collections) ?? [];
    const existingPaths = collectionsInThisLevel.map(col => col.path.trim().toLowerCase());
    const existingIds = collectionsInThisLevel.map(col => col.id?.trim().toLowerCase()).filter(Boolean) as string[];
    const [collection, setCollection] = React.useState<PersistedCollection<any> | undefined>();
    const [initialLoadingCompleted, setInitialLoadingCompleted] = React.useState(false);

    useEffect(() => {
        try {
            if (navigation.initialised) {
                if (props.editedCollectionId) {
                    setCollection(navigation.getCollectionFromPaths([...(props.parentCollectionIds ?? []), props.editedCollectionId]));
                } else {
                    setCollection(undefined);
                }
                setInitialLoadingCompleted(true);
            }
        } catch (e) {
            console.error(e);
        }
    }, [props.editedCollectionId, props.parentCollectionIds, navigation.initialised, navigation.getCollectionFromPaths]);

    if (!topLevelNavigation) {
        throw Error("Internal: Navigation not ready in collection editor");
    }

    const {
        groups
    }: NavigationResult = topLevelNavigation;

    const initialCollection = collection
        ? {
            ...collection,
            id: collection.id ?? collection.path ?? randomString(16)
        }
        : undefined;

    const initialValues: PersistedCollection<any> = initialCollection
        ? applyPropertyConfigs(initialCollection, propertyConfigs)
        : {
            id: initialValuesProp?.path ?? randomString(16),
            path: initialValuesProp?.path ?? "",
            name: initialValuesProp?.name ?? "",
            group: initialValuesProp?.group ?? "",
            properties: {} as PropertiesOrBuilders,
            propertiesOrder: [],
            icon: coolIconKeys[Math.floor(Math.random() * coolIconKeys.length)],
            ownerId: authController.user?.uid ?? ""
        };

    if (!initialLoadingCompleted) {
        return <CircularProgressCenter/>;
    }

    if (!props.isNewCollection && (!navigation.initialised || !initialLoadingCompleted)) {
        return <CircularProgressCenter/>;
    }

    return <CollectionEditorInternal
        {...props}
        initialValues={initialValues}
        existingPaths={existingPaths}
        existingIds={existingIds}
        includeTemplates={includeTemplates}
        collection={collection}
        setCollection={setCollection}
        groups={groups}
        propertyConfigs={propertyConfigs}/>

}

function CollectionEditorInternal<M extends Record<string, any>>({
                                                                     isNewCollection,
                                                                     configController,
                                                                     editedCollectionId,
                                                                     parentCollectionIds,
                                                                     fullPath,
                                                                     collectionInference,
                                                                     handleClose,
                                                                     reservedGroups,
                                                                     extraView,
                                                                     handleCancel,
                                                                     setFormDirty,
                                                                     pathSuggestions,
                                                                     getUser,
                                                                     parentCollection,
                                                                     getData,
                                                                     existingPaths,
                                                                     existingIds,
                                                                     includeTemplates,
                                                                     collection,
                                                                     setCollection,
                                                                     initialValues,
                                                                     propertyConfigs,
                                                                     groups,
                                                                     existingEntities
                                                                 }: CollectionEditorDialogProps & {
                                                                     handleCancel: () => void,
                                                                     setFormDirty: (dirty: boolean) => void,
                                                                     initialValues: PersistedCollection<M>,
                                                                     existingPaths: string[],
                                                                     existingIds: string[],
                                                                     includeTemplates: boolean,
                                                                     collection: PersistedCollection<M> | undefined,
                                                                     setCollection: (collection: PersistedCollection<M>) => void,
                                                                     propertyConfigs: Record<string, PropertyConfig<any>>,
                                                                     groups: string[],
                                                                 }
) {

    const importConfig = useImportConfig();
    const navigation = useNavigationController();
    const snackbarController = useSnackbarController();

    // Use this ref to store which properties have errors
    const propertyErrorsRef = useRef({});

    const initialView = isNewCollection ? (includeTemplates ? "welcome" : "details") : "properties";
    const [currentView, setCurrentView] = useState<EditorView>(initialView); // this view can edit either the details view or the properties one

    const [error, setError] = React.useState<Error | undefined>();

    const saveCollection = (updatedCollection: PersistedCollection<M>): Promise<boolean> => {
        const id = updatedCollection.id || updatedCollection.path;

        return configController.saveCollection({
            id,
            collectionData: updatedCollection,
            previousId: editedCollectionId,
            parentCollectionIds
        })
            .then(() => {
                setError(undefined);
                return true;
            })
            .catch((e) => {
                setError(e);
                console.error(e);
                snackbarController.open({
                    type: "error",
                    message: "Error persisting collection: " + (e.message ?? "Details in the console")
                });
                return false;
            });
    };

    const setNextMode = () => {
        if (currentView === "details") {
            if (importConfig.inUse) {
                setCurrentView("import_data_saving");
            } else if (extraView) {
                setCurrentView("extra_view");
            } else {
                setCurrentView("properties");
            }
        } else if (currentView === "welcome") {
            setCurrentView("details");
        } else if (currentView === "import_data_mapping") {
            setCurrentView("import_data_preview");
        } else if (currentView === "import_data_preview") {
            setCurrentView("details");
        } else if (currentView === "extra_view") {
            setCurrentView("properties");
        } else {
            setCurrentView("details");
        }

    };

    const doCollectionInference = collectionInference ? (collection: PersistedCollection<any>) => {
        if (!collectionInference) return undefined;
        return collectionInference?.(collection.path, collection.collectionGroup ?? false, parentPaths ?? [], collection.databaseId);
    } : undefined;

    const inferCollectionFromData = async (newCollection: PersistedCollection<M>) => {

        try {
            if (!doCollectionInference) {
                setCollection(newCollection);
                return Promise.resolve(newCollection);
            }

            setCurrentView("loading");

            const inferredCollection = await doCollectionInference?.(newCollection);

            if (!inferredCollection) {
                setCollection(newCollection);
                return Promise.resolve(newCollection);
            }
            const values = {
                ...(newCollection ?? {})
            };

            if (Object.keys(inferredCollection.properties ?? {}).length > 0) {
                values.properties = inferredCollection.properties as PropertiesOrBuilders<M>;
                values.propertiesOrder = inferredCollection.propertiesOrder as Extract<keyof M, string>[];
            }

            if (!values.propertiesOrder) {
                values.propertiesOrder = Object.keys(values.properties) as Extract<keyof M, string>[];
                return values;
            }

            setCollection(values);
            console.debug("Inferred collection", {
                newCollection: newCollection ?? {},
                values
            });
            return values;
        } catch (e: any) {
            console.error(e);
            snackbarController.open({
                type: "error",
                message: "Error inferring collection: " + (e.message ?? "Details in the console")
            });
            return newCollection;
        }
    };

    const onSubmit = (newCollectionState: PersistedCollection<M>, formexController: FormexController<PersistedCollection<M>>) => {
        console.debug("Submitting collection", newCollectionState);
        try {

            if (!isNewCollection) {
                saveCollection(newCollectionState).then(() => {
                    formexController.resetForm();
                    handleClose(newCollectionState);
                });
                return;
            }

            if (currentView === "welcome") {
                setNextMode();
                formexController.resetForm({ values: newCollectionState });
            } else if (currentView === "details") {
                if (extraView || importConfig.inUse) {
                    formexController.resetForm({ values: newCollectionState });
                    setNextMode();
                } else if (isNewCollection) {
                    inferCollectionFromData(newCollectionState)
                        .then((values) => {
                            formexController.resetForm({
                                values: values ?? newCollectionState,
                                touched: {
                                    path: true,
                                    name: true
                                }
                            });
                        }).finally(() => {
                        setNextMode();
                    });
                } else {
                    formexController.resetForm({ values: newCollectionState });
                    setNextMode();
                }
            } else if (currentView === "extra_view") {
                setNextMode();
                formexController.resetForm({ values: newCollectionState });
            } else if (currentView === "import_data_mapping") {
                setNextMode();
            } else if (currentView === "import_data_preview") {
                setNextMode();
            } else if (currentView === "properties") {
                saveCollection(newCollectionState).then(() => {
                    formexController.resetForm({ values: initialValues });
                    setNextMode();
                    handleClose(newCollectionState);
                });
            } else {
                setNextMode();
                formexController.resetForm({ values: newCollectionState });
            }
        } catch (e: any) {
            snackbarController.open({
                type: "error",
                message: "Error persisting collection: " + (e.message ?? "Details in the console")
            });
            console.error(e);
            formexController.resetForm({ values: newCollectionState });
        }
    };

    const validation = (col: PersistedCollection) => {

        let errors: Record<string, any> = {};
        const schema = (currentView === "properties" || currentView === "subcollections" || currentView === "details") && YupSchema;
        if (schema) {
            try {
                schema.validateSync(col, { abortEarly: false });
            } catch (e: any) {
                e.inner.forEach((err: any) => {
                    errors[err.path] = err.message;
                });
            }
        }
        if (currentView === "properties") {
            errors = { ...errors, ...propertyErrorsRef.current };
        }
        if (currentView === "details") {
            const pathError = validatePath(col.path, isNewCollection, existingPaths, col.id);
            if (pathError) {
                errors.path = pathError;
            }
            const idError = validateId(col.id, isNewCollection, existingPaths, existingIds);
            if (idError) {
                errors.id = idError;
            }
        }
        return errors;
    };

    const formController = useCreateFormex<PersistedCollection<M>>({
        initialValues,
        onSubmit,
        validation,
        debugId: "COLLECTION_EDITOR"
    });

    const {
        values,
        setFieldValue,
        isSubmitting,
        dirty,
        submitCount
    } = formController;

    // TODO: getting data is only working in root collections with this code
    const path = values.path;
    const updatedFullPath = fullPath?.includes("/") ? fullPath?.split("/").slice(0, -1).join("/") + "/" + path : path; // TODO: this path is wrong
    const pathError = validatePath(path, isNewCollection, existingPaths, values.id);

    const parentPaths = !pathError && parentCollectionIds ? navigation.convertIdsToPaths(parentCollectionIds) : undefined;
    const resolvedPath = !pathError ? navigation.resolveIdsFrom(updatedFullPath) : undefined;
    const getDataWithPath = resolvedPath && getData ? async () => {
        const data = await getData(resolvedPath, parentPaths ?? []);
        if (existingEntities) {
            const existingData = existingEntities.map(e => e.values);
            data.push(...existingData);
        }
        return data;
    } : undefined;

    useEffect(() => {
        setFormDirty(dirty);
    }, [dirty]);

    function onImportDataSet(data: object[], propertiesOrder?: string[]) {
        importConfig.setInUse(true);
        buildEntityPropertiesFromData(data, getInferenceType)
            .then((properties: Properties) => {
                const res = cleanPropertiesFromImport(properties);

                importConfig.setIdColumn(res.idColumn);
                importConfig.setImportData(data);
                importConfig.setHeadersMapping(res.headersMapping);
                const filteredHeadingsOrder = ((propertiesOrder ?? [])
                    .filter((key) => res.headersMapping[key]) as string[]) ?? Object.keys(res.properties);
                importConfig.setHeadingsOrder(filteredHeadingsOrder);
                importConfig.setOriginProperties(res.properties);

                const mappedHeadings = (propertiesOrder ?? []).map((key) => res.headersMapping[key]).filter(Boolean) as string[] ?? Object.keys(res.properties);
                setFieldValue("properties", res.properties);
                setFieldValue("propertiesOrder", mappedHeadings);
            });
    }

    const validValues = Boolean(values.name) && Boolean(values.id);

    const onImportMappingComplete = () => {
        const updatedProperties = { ...values.properties };
        if (importConfig.idColumn)
            delete updatedProperties[importConfig.idColumn];
        setFieldValue("properties", updatedProperties);
        // setFieldValue("propertiesOrder", Object.values(importConfig.headersMapping));
        setNextMode();
    };

    const editable = collection?.editable === undefined || collection?.editable === true;
    // @ts-ignore
    const isMergedCollection = collection?.merged ?? false;
    const collectionEditable = editable || isNewCollection;

    const [deleteRequested, setDeleteRequested] = useState(false);

    const deleteCollection = () => {
        if (!collection) return;
        configController?.deleteCollection({ id: collection.id }).then(() => {
            setDeleteRequested(false);
            handleCancel();
            snackbarController.open({
                message: "Collection deleted",
                type: "success"
            });
        });
    };

    const onWelcomeScreenContinue = (importData?: object[], propertiesOrder?: string[]) => {
        if (importData) {
            onImportDataSet(importData, propertiesOrder);
            setCurrentView("import_data_mapping");
        } else {
            setCurrentView("details");
        }
    };

    return <DialogContent fullHeight={true}>
        <Formex value={formController}>

            <>
                {!isNewCollection && <Tabs value={currentView}
                                           innerClassName={cls(defaultBorderMixin, "px-4 h-14 w-full justify-end bg-surface-50 dark:bg-surface-950 border-b")}
                                           onValueChange={(v) => setCurrentView(v as EditorView)}>
                    <Tab value={"details"}>
                        Details
                    </Tab>
                    <Tab value={"properties"}>
                        Properties
                    </Tab>
                    <Tab value={"subcollections"}>
                        Additional views
                    </Tab>
                    <Tab value={"custom_actions"}>
                        Custom actions
                    </Tab>
                </Tabs>}

                <form noValidate
                      onSubmit={formController.handleSubmit}
                      className={cls(
                          isNewCollection ? "h-full" : "h-[calc(100%-48px)]",
                          "flex-grow flex flex-col relative")}>

                    {currentView === "loading" &&
                        <CircularProgressCenter/>}

                    {currentView === "extra_view" &&
                        path &&
                        extraView?.View &&
                        <extraView.View path={path}/>}

                    {currentView === "welcome" &&
                        <CollectionEditorWelcomeView
                            path={path}
                            onContinue={onWelcomeScreenContinue}
                            existingCollectionPaths={existingPaths}
                            parentCollection={parentCollection}
                            pathSuggestions={pathSuggestions}/>}

                    {currentView === "import_data_mapping" && importConfig &&
                        <CollectionEditorImportMapping importConfig={importConfig}
                                                       collectionEditable={collectionEditable}
                                                       propertyConfigs={propertyConfigs}/>}

                    {currentView === "import_data_preview" && importConfig &&
                        <CollectionEditorImportDataPreview importConfig={importConfig}
                                                           properties={values.properties as Properties}
                                                           propertiesOrder={values.propertiesOrder as string[]}/>}

                    {currentView === "import_data_saving" && importConfig &&
                        <ImportSaveInProgress importConfig={importConfig}
                                              collection={values}
                                              path={path}
                                              onImportSuccess={async (importedCollection) => {
                                                  snackbarController.open({
                                                      type: "info",
                                                      message: "Data imported successfully"
                                                  });
                                                  await saveCollection(values);
                                                  handleClose(importedCollection);
                                              }}
                        />}

                    {currentView === "details" &&
                        <CollectionDetailsForm
                            existingPaths={existingPaths}
                            existingIds={existingIds}
                            groups={groups}
                            parentCollectionIds={parentCollectionIds}
                            parentCollection={parentCollection}
                            isNewCollection={isNewCollection}>
                            {!isNewCollection && isMergedCollection && <div className={"flex flex-col gap-4 mt-8"}>
                                <Typography variant={"body2"} color={"secondary"}>This collection is defined in code.
                                    The changes done in this editor will override the properties defined in code.
                                    You can delete the overridden values to revert to the state defined in code.
                                </Typography>
                                <Button color={"neutral"}
                                        onClick={() => {
                                            setDeleteRequested(true);
                                        }}>Reset to code</Button>
                            </div>}
                        </CollectionDetailsForm>}

                    {currentView === "custom_actions" && collection &&
                        <EntityActionsEditTab collection={collection}/>}

                    {currentView === "subcollections" && collection &&
                        <SubcollectionsEditTab
                            parentCollection={parentCollection}
                            configController={configController}
                            getUser={getUser}
                            collectionInference={collectionInference}
                            parentCollectionIds={parentCollectionIds}
                            collection={collection}/>}

                    {currentView === "properties" &&
                        <CollectionPropertiesEditorForm
                            showErrors={submitCount > 0}
                            isNewCollection={isNewCollection}
                            reservedGroups={reservedGroups}
                            onPropertyError={(propertyKey, namespace, error) => {
                                const current = removeUndefined({
                                    ...propertyErrorsRef.current,
                                    [getFullIdPath(propertyKey, namespace)]: removeUndefined(error, true)
                                }, true);
                                propertyErrorsRef.current = current;
                                formController.validate();
                            }}
                            getUser={getUser}
                            getData={getDataWithPath}
                            doCollectionInference={doCollectionInference}
                            propertyConfigs={propertyConfigs}
                            collectionEditable={collectionEditable}
                            extraIcon={extraView?.icon &&
                                <IconButton
                                    color={"primary"}
                                    onClick={() => setCurrentView("extra_view")}>
                                    {extraView.icon}
                                </IconButton>}/>
                    }

                    <DialogActions
                        position={"absolute"}>
                        {error && <ErrorView error={error}/>}

                        {isNewCollection && includeTemplates && currentView === "import_data_mapping" &&
                            <Button variant={"text"}
                                    type="button"
                                    color={"primary"}
                                    onClick={() => {
                                        importConfig.setInUse(false);
                                        return setCurrentView("welcome");
                                    }}>
                                <ArrowBackIcon/>
                                Back
                            </Button>}

                        {isNewCollection && includeTemplates && currentView === "import_data_preview" &&
                            <Button variant={"text"}
                                    type="button"
                                    color={"primary"}
                                    onClick={() => {
                                        setCurrentView("import_data_mapping");
                                    }}>
                                <ArrowBackIcon/>
                                Back
                            </Button>}

                        {isNewCollection && includeTemplates && currentView === "details" &&
                            <Button variant={"text"}
                                    color={"neutral"}
                                    type="button"
                                    onClick={() => setCurrentView("welcome")}>
                                <ArrowBackIcon/>
                                Back
                            </Button>}

                        {isNewCollection && currentView === "properties" && <Button variant={"text"}
                                                                                    type="button"
                                                                                    color={"neutral"}
                                                                                    onClick={() => setCurrentView("details")}>
                            <ArrowBackIcon/>
                            Back
                        </Button>}

                        <Button variant={"text"}
                                color={"neutral"}
                                onClick={() => {
                                    handleCancel();
                                }}>
                            Cancel
                        </Button>

                        {currentView === "welcome" &&
                            <Button variant={"text"} onClick={() => onWelcomeScreenContinue()}>
                                Continue from scratch
                            </Button>}

                        {isNewCollection && currentView === "import_data_mapping" &&
                            <Button
                                variant={"filled"}
                                color="primary"
                                onClick={onImportMappingComplete}
                            >
                                Next
                            </Button>}

                        {isNewCollection && currentView === "import_data_preview" &&
                            <Button
                                variant={"filled"}
                                color="primary"
                                onClick={() => {
                                    setNextMode();
                                }}
                            >
                                Next
                            </Button>}

                        {isNewCollection && (currentView === "details" || currentView === "properties") &&
                            <LoadingButton
                                variant={"filled"}
                                color="primary"
                                type="submit"
                                loading={isSubmitting}
                                disabled={isSubmitting || (currentView === "details" && !validValues)}
                                startIcon={currentView === "properties"
                                    ? <CheckIcon/>
                                    : undefined}
                            >
                                {currentView === "details" && "Next"}
                                {currentView === "properties" && "Create collection"}
                            </LoadingButton>}

                        {!isNewCollection && <LoadingButton
                            variant="filled"
                            color="primary"
                            type="submit"
                            loading={isSubmitting}
                        >
                            Update collection
                        </LoadingButton>}

                    </DialogActions>
                </form>
            </>

        </Formex>

        <ConfirmationDialog
            open={deleteRequested}
            onAccept={deleteCollection}
            onCancel={() => setDeleteRequested(false)}
            title={<>Delete the stored config?</>}
            body={<> This will <b>not
                delete any data</b>, only
                the stored config, and reset to the code state.</>}/>

    </DialogContent>

}

function applyPropertyConfigs<M extends Record<string, any> = any>(collection: PersistedCollection<M>, propertyConfigs: Record<string, PropertyConfig<any>>): PersistedCollection<M> {
    const {
        properties,
        ...rest
    } = collection;
    const propertiesResult: PropertiesOrBuilders<any> = {};
    if (properties) {
        Object.keys(properties).forEach((key) => {
            propertiesResult[key] = applyPropertiesConfig(properties[key] as PropertyOrBuilder, propertyConfigs);
        });
    }

    return {
        ...rest,
        properties: propertiesResult
    };
}

function applyPropertiesConfig(property: PropertyOrBuilder, propertyConfigs: Record<string, PropertyConfig<any>>) {
    let internalProperty = property;
    if (propertyConfigs && typeof internalProperty === "object" && internalProperty.propertyConfig) {
        const propertyConfig = propertyConfigs[internalProperty.propertyConfig];
        if (propertyConfig && isPropertyBuilder(propertyConfig.property)) {
            internalProperty = propertyConfig.property;
        } else {

            if (propertyConfig) {
                internalProperty = mergeDeep(propertyConfig.property, internalProperty);
            }

            if (!isPropertyBuilder(internalProperty) && internalProperty.dataType === "map" && internalProperty.properties) {
                const properties: Record<string, PropertyOrBuilder> = {};
                Object.keys(internalProperty.properties).forEach((key) => {
                    properties[key] = applyPropertiesConfig(((internalProperty as MapProperty).properties as Properties)[key] as Property, propertyConfigs);
                });
                internalProperty = {
                    ...internalProperty,
                    properties
                };
            }

        }
    }
    return internalProperty;

}

const validatePath = (value: string, isNewCollection: boolean, existingPaths: string[], idValue?: string) => {
    let error;
    if (!value) {
        error = "You must specify a path in the database for this collection";
    }
    // if (isNewCollection && existingIds?.includes(value.trim().toLowerCase()))
    //     error = "There is already a collection which uses this path as an id";
    if (isNewCollection && existingPaths?.includes(value.trim().toLowerCase()) && !idValue)
        error = "There is already a collection with the specified path. If you want to have multiple collections referring to the same database path, make sure the have different ids";

    const subpaths = removeInitialAndTrailingSlashes(value).split("/");
    if (subpaths.length % 2 === 0) {
        error = `Collection paths must have an odd number of segments: ${value}`;
    }
    return error;
};

const validateId = (value: string, isNewCollection: boolean, existingPaths: string[], existingIds: string[]) => {
    if (!value) return undefined;
    let error;
    if (isNewCollection && existingPaths?.includes(value.trim().toLowerCase()))
        error = "There is already a collection that uses this value as a path";
    if (isNewCollection && existingIds?.includes(value.trim().toLowerCase()))
        error = "There is already a collection which uses this id";
    // if (error) {
    //     setAdvancedPanelExpanded(true);
    // }
    return error;
};
