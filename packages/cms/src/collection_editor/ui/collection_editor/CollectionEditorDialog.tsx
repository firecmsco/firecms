import { useUnsavedChangesDialog, UnsavedChangesDialog } from "@rebasepro/core";
import { useNavigationStateController, useCollectionRegistryController, useUrlController } from "../../_cms_internals";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { ConfirmationDialog, ErrorView, useAuthController, useCustomizationController, useSnackbarController } from "@rebasepro/core";
import { CircularProgressCenter } from "@rebasepro/ui";
import { Entity, EntityCollection, MapProperty, Properties, Property, PropertyConfig, User, getDataSourceCapabilities } from "@rebasepro/types";
import { getSubcollections, isPropertyBuilder, removeInitialAndTrailingSlashes } from "@rebasepro/common";
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
} from "@rebasepro/ui";
import { CollectionEditorSchema } from "./CollectionYupValidation";
import { GeneralSettingsForm } from "./GeneralSettingsForm";
import { DisplaySettingsForm } from "./DisplaySettingsForm";
import { CollectionPropertiesEditorForm } from "./CollectionPropertiesEditorForm";
import { CollectionRelationsTab } from "./CollectionRelationsTab";
import { CollectionsConfigController } from "../../types/config_controller";
import { CollectionEditorWelcomeView } from "./CollectionEditorWelcomeView";
import { CollectionInference } from "../../types/collection_inference";
import { getInferenceType, ImportSaveInProgress, useImportConfig } from "../../_cms_internals";
import { buildEntityPropertiesFromData } from "@rebasepro/schema_inference";
import { CollectionEditorImportMapping } from "./import/CollectionEditorImportMapping";
import { CollectionEditorImportDataPreview } from "./import/CollectionEditorImportDataPreview";
import { cleanPropertiesFromImport } from "./import/clean_import_data";
import { Formex, FormexController, useCreateFormex } from "@rebasepro/formex";
import { getFullIdPath } from "./util";
import { AICollectionGeneratorPopover } from "./AICollectionGeneratorPopover";
import { AIModifiedPathsProvider, useAIModifiedPaths } from "./AIModifiedPathsContext";
import { CollectionOperation, CollectionGenerationCallback } from "../../api/generateCollectionApi";
import { CollectionRLSTab } from "./CollectionRLSTab";
import { buildCollectionFromTableMetadata } from "../../pgColumnToProperty";
import { TableMetadata } from "@rebasepro/types";
import { mergeDeep, randomString, removeUndefined } from "@rebasepro/utils";

export interface CollectionEditorDialogProps {
    open: boolean;
    isNewCollection: boolean;
    initialValues?: {
        group?: string,
        slug?: string,
        name?: string,
    }
    /**
     * A collection to duplicate from. If provided, the new collection will be
     * pre-populated with the same properties (but with empty name, path, and id).
     */
    copyFrom?: EntityCollection;
    editedCollectionId?: string;
    path?: string; // full path of this particular collection, like `products/123/locales`
    parentCollectionIds?: string[]; // path ids of the parent collection, like [`products`]
    handleClose: (collection?: EntityCollection) => void;
    configController: CollectionsConfigController;
    reservedGroups?: string[];
    collectionInference?: CollectionInference;
    extraView?: {
        View: React.ComponentType<{
            path: string
        }>,
        icon: React.ReactNode | any
    };
    getUser?: (uid: string) => User | null;
    getData?: (path: string, parentPaths: string[]) => Promise<object[]>;
    parentCollection?: EntityCollection;
    existingEntities?: Entity<any>[];
    /**
     * Initial view to open when editing: "general", "display", or "properties".
     * For new collections, this is ignored.
     */
    initialView?: "general" | "display" | "properties";
    /**
     * If true, auto-expand the Kanban configuration section.
     */
    expandKanban?: boolean;
    /**
     * Callback function for generating/modifying collections.
     * The plugin is API-agnostic - the consumer provides the implementation.
     */
    generateCollection?: CollectionGenerationCallback;
    /**
     * Optional analytics callback
     */
    onAnalyticsEvent?: (event: string, params?: object) => void;
    /**
     * If true, it indicates that the editor is rendered inline (not in a dialog) and therefore updates headers and footers to adapt to the layout.
     */
    fullScreen?: boolean;
    /**
     * List of unmapped database tables available for import.
     */
    unmappedTables?: string[];
    /**
     * Callback to fetch column metadata for a table.
     */
    onFetchTableMetadata?: (tableName: string) => Promise<TableMetadata | undefined>;
}

export function CollectionEditorDialog(props: CollectionEditorDialogProps) {

    const open = props.open;

    const [formDirty, setFormDirty] = React.useState<boolean>(false);

    const { dialogProps, triggerDialog } = useUnsavedChangesDialog(
        open && formDirty,
        () => props.handleClose(undefined)
    );

    const handleCancel = () => {
        if (!formDirty) {
            props.handleClose(undefined);
        } else {
            triggerDialog();
        }
    };

    useEffect(() => {
        if (!open) {
            setFormDirty(false);
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
            <AIModifiedPathsProvider>
                {open && <CollectionEditor {...props}
                    handleCancel={handleCancel}
                    setFormDirty={setFormDirty} />}

                <UnsavedChangesDialog {...dialogProps} />
            </AIModifiedPathsProvider>
        </Dialog>
    );
}

type EditorView = "welcome"
    | "general"
    | "display"
    | "import_data_mapping"
    | "import_data_preview"
    | "import_data_saving"
    | "properties"
    | "loading"
    | "extra_view"
    | "relations"
    | "rls";

export function CollectionEditor(props: CollectionEditorDialogProps & {
    handleCancel: () => void,
    setFormDirty: (dirty: boolean) => void
}) {
    const { propertyConfigs } = useCustomizationController();
    const navigationState = useNavigationStateController();
    const collectionRegistry = useCollectionRegistryController();
    const authController = useAuthController();

    const {
        topLevelNavigation,
    } = navigationState;
    const {
        collections
    } = collectionRegistry;

    const initialValuesProp = props.initialValues;
    const copyFromProp = props.copyFrom;
    // Skip templates when duplicating (copyFrom is provided)
    const includeTemplates = !copyFromProp && !initialValuesProp?.slug && (props.parentCollectionIds ?? []).length === 0;
    const collectionsInThisLevel = (props.parentCollection ? getSubcollections(props.parentCollection) : collections) ?? [];
    const existingPaths = collectionsInThisLevel.map(col => col.dbPath.trim().toLowerCase());
    const existingIds = collectionsInThisLevel.map(col => col.slug?.trim().toLowerCase()).filter(Boolean) as string[];
    const [collection, setCollection] = React.useState<EntityCollection<any> | undefined>();
    const [initialLoadingCompleted, setInitialLoadingCompleted] = React.useState(false);

    useEffect(() => {
        try {
            if (collectionRegistry.initialised) {
                if (props.editedCollectionId) {
                    // We must use getRawCollection so the editor schema fields 
                    // aren't polluted with dynamically injected runtime `relations`.
                    // The path lookup relies on generating a fake child path to resolve through the registry
                    const dbPath = [...(props.parentCollectionIds ?? []), props.editedCollectionId]
                        .reduce((acc, segment, i) => i === 0 ? segment : `${acc}/fake_id/${segment}`, "");

                    setCollection(collectionRegistry.getRawCollection(dbPath) as EntityCollection<any>);
                } else {
                    setCollection(undefined);
                }
                setInitialLoadingCompleted(true);
            }
        } catch (e) {
            console.error(e);
        }
    }, [props.editedCollectionId, props.parentCollectionIds, collectionRegistry.initialised, collectionRegistry.getRawCollection]);

    const groups = topLevelNavigation?.groups ?? [];

    const initialCollection = collection
        ? {
            ...collection,
            slug: collection.slug ?? randomString(16)
        }
        : undefined;

    // Build initial values - handle copyFrom for duplication
    const initialValues: EntityCollection<any> = initialCollection
        ? applyPropertyConfigs(initialCollection, propertyConfigs)
        : copyFromProp
            ? (() => {
                // When duplicating, copy all properties but clear identifiers
                const { subcollections: _sub, ...rest } = copyFromProp as any;
                return {
                    ...rest,
                    name: "",
                    ownerId: authController.user?.uid ?? ""
                } as EntityCollection<any>;
            })()
            : {
                slug: initialValuesProp?.slug ?? randomString(16),
                dbPath: initialValuesProp?.slug ?? "",
                name: initialValuesProp?.name ?? "",
                group: initialValuesProp?.group ?? "",
                properties: {} as Properties,
                propertiesOrder: [],
                icon: coolIconKeys[Math.floor(Math.random() * coolIconKeys.length)],
                ownerId: authController.user?.uid ?? ""
            };

    if (!initialLoadingCompleted) {
        return <CircularProgressCenter />;
    }

    if (!props.isNewCollection && (!collectionRegistry.initialised || !initialLoadingCompleted)) {
        return <CircularProgressCenter />;
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
        propertyConfigs={propertyConfigs} />

}

function CollectionEditorInternal<M extends Record<string, any>>({
    isNewCollection,
    configController,
    editedCollectionId,
    parentCollectionIds,
    path,
    collectionInference,
    handleClose,
    reservedGroups,
    extraView,
    handleCancel,
    setFormDirty,
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
    existingEntities,
    initialView: initialViewProp,
    expandKanban,
    generateCollection,
    onAnalyticsEvent,
    fullScreen,
    unmappedTables,
    onFetchTableMetadata
}: CollectionEditorDialogProps & {
    handleCancel: () => void,
    setFormDirty: (dirty: boolean) => void,
    initialValues: EntityCollection<M>,
    existingPaths: string[],
    existingIds: string[],
    includeTemplates: boolean,
    collection: EntityCollection<M> | undefined,
    setCollection: (collection: EntityCollection<M>) => void,
    propertyConfigs: Record<string, PropertyConfig>,
    groups: string[],
}
) {

    const importConfig = useImportConfig();
    const urlController = useUrlController();
    const collectionRegistry = useCollectionRegistryController();
    const snackbarController = useSnackbarController();

    // Use this ref to store which properties have errors
    const propertyErrorsRef = useRef<Record<string, any>>({});

    const initialView = isNewCollection
        ? (includeTemplates ? "welcome" : "general")
        : (initialViewProp ?? "properties");
    const [currentView, setCurrentView] = useState<EditorView>(initialView); // this view can edit either the details view or the properties one

    const [error, setError] = React.useState<Error | undefined>();

    const saveCollection = (updatedCollection: EntityCollection<M>): Promise<boolean> => {
        const id = updatedCollection.slug;

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
        if (currentView === "general") {
            if (importConfig.inUse) {
                setCurrentView("import_data_saving");
            } else if (extraView) {
                setCurrentView("extra_view");
            } else {
                setCurrentView("properties");
            }
        } else if (currentView === "welcome") {
            setCurrentView("general");
        } else if (currentView === "import_data_mapping") {
            setCurrentView("import_data_preview");
        } else if (currentView === "import_data_preview") {
            setCurrentView("general");
        } else if (currentView === "extra_view") {
            setCurrentView("properties");
        } else {
            setCurrentView("general");
        }

    };

    const doCollectionInference = collectionInference ? (collection: EntityCollection<any>) => {
        if (!collectionInference) return undefined;
        return collectionInference?.(
            collection.dbPath,
            parentPaths ?? [],
            collection.databaseId
        );
    } : undefined;

    const inferCollectionFromData = async (newCollection: EntityCollection<M>) => {

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
                values.properties = inferredCollection.properties as Properties;
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
        } catch (e: unknown) {
            console.error(e);
            snackbarController.open({
                type: "error",
                message: "Error inferring collection: " + (e instanceof Error ? e.message : "Details in the console")
            });
            return newCollection;
        }
    };

    const onSubmit = async (newCollectionState: EntityCollection<M>, formexController: FormexController<EntityCollection<M>>) => {
        console.debug("Submitting collection", newCollectionState);
        try {

            if (!isNewCollection) {
                const success = await saveCollection(newCollectionState);
                if (success) {
                    aiModifiedPaths?.clearAllPaths();
                    formexController.resetForm({ values: newCollectionState });
                    handleClose(newCollectionState);
                }
                return;
            }

            if (currentView === "welcome") {
                setNextMode();
                formexController.resetForm({ values: newCollectionState });
            } else if (currentView === "general") {
                if (extraView || importConfig.inUse) {
                    formexController.resetForm({ values: newCollectionState });
                    setNextMode();
                } else if (isNewCollection) {
                    const values = await inferCollectionFromData(newCollectionState);
                    formexController.resetForm({
                        values: values ?? newCollectionState,
                        touched: {
                            path: true,
                            name: true
                        }
                    });
                    setNextMode();
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
                const success = await saveCollection(newCollectionState);
                if (success) {
                    formexController.resetForm({ values: initialValues });
                    setNextMode();
                    handleClose(newCollectionState);
                }
            } else {
                setNextMode();
                formexController.resetForm({ values: newCollectionState });
            }
        } catch (e: unknown) {
            snackbarController.open({
                type: "error",
                message: "Error persisting collection: " + (e instanceof Error ? e.message : "Details in the console")
            });
            console.error(e);
            formexController.resetForm({ values: newCollectionState });
        }
    };

    const validation = (col: EntityCollection) => {

        let errors: Record<string, string> = {};
        const schema = (currentView === "properties" || currentView === "relations" || currentView === "general") && CollectionEditorSchema;
        if (schema) {
            const result = schema.safeParse(col);
            if (!result.success) {
                result.error.issues.forEach((issue) => {
                    const path = issue.path.join(".");
                    if (path) {
                        errors[path] = issue.message;
                    }
                });
            }
        }
        if (currentView === "properties") {
            errors = { ...errors, ...propertyErrorsRef.current };
        }
        if (currentView === "general") {
            const pathError = validatePath(col.dbPath, isNewCollection, existingPaths, col.slug);
            if (pathError) {
                errors.slug = pathError;
            }
            const idError = validateId(col.slug, isNewCollection, existingPaths, existingIds);
            if (idError) {
                errors.id = idError;
            }
        }
        if (Object.keys(errors).length > 0) {
            console.error("Formex validation blocked save:", errors, "Current view:", currentView);
        }
        return errors;
    };

    const formController = useCreateFormex<EntityCollection<M>>({
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

    const usedPath = values.dbPath;
    const pathError = validatePath(usedPath, isNewCollection, existingPaths, values.slug);

    const parentPaths = !pathError && parentCollectionIds ? collectionRegistry.convertIdsToPaths(parentCollectionIds) : undefined;
    
    const updatedFullPath = parentPaths && parentPaths.length > 0
        ? [...parentPaths, usedPath].join("/fake_id/")
        : (path?.includes("/") ? path.split("/").slice(0, -1).join("/") + "/" + usedPath : usedPath);

    const resolvedPath = !pathError ? urlController.resolveDatabasePathsFrom(updatedFullPath) : undefined;
    const getDataWithPath = resolvedPath && getData ? async () => {
        const data = await getData!(resolvedPath, parentPaths ?? []);
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

    const validValues = Boolean(values.name) && Boolean(values.slug);

    const onImportMappingComplete = () => {
        const updatedProperties = { ...values.properties };
        if (importConfig.idColumn)
            delete updatedProperties[importConfig.idColumn];
        setFieldValue("properties", updatedProperties);
        // setFieldValue("propertiesOrder", Object.values(importConfig.headersMapping));
        setNextMode();
    };



    const [deleteRequested, setDeleteRequested] = useState(false);

    const deleteCollection = () => {
        if (!collection) return;
        configController?.deleteCollection({ id: collection.slug }).then(() => {
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
            setCurrentView("general");
        }
    };

    const aiModifiedPaths = useAIModifiedPaths();

    const handleAIGenerated = (generatedCollection: EntityCollection, operations?: CollectionOperation[]) => {
        formController.setValues(generatedCollection as EntityCollection<M>);
        if (operations && aiModifiedPaths) {
            aiModifiedPaths.addModifiedPaths(operations);
        }
    };

    return <div className="h-full w-full flex flex-col bg-white dark:bg-surface-950">
        <Formex value={formController}>

            <>
                {!isNewCollection && <div className={cls("px-4 py-2 w-full flex shrink-0 items-center justify-between gap-4 bg-white dark:bg-surface-950 border-b", defaultBorderMixin)}>
                    <div className="flex flex-1 items-center justify-end gap-4 min-w-0">
                        <Tabs value={currentView}
                            className="bg-transparent !w-fit max-w-full"
                            onValueChange={(v) => setCurrentView(v as EditorView)}>
                            <Tab value={"general"}>
                                General
                            </Tab>
                            <Tab value={"display"}>
                                Display
                            </Tab>
                            <Tab value={"properties"}>
                                Properties
                            </Tab>
                            {getDataSourceCapabilities(values.driver).supportsRLS && <Tab value={"rls"}>
                                RLS
                            </Tab>}
                            {getDataSourceCapabilities(values.driver).supportsRelations && <Tab value={"relations"}>
                                Relations
                            </Tab>}
                        </Tabs>
                    </div>
                    <div className="flex items-center gap-4">
                        {generateCollection && (
                            <AICollectionGeneratorPopover
                                existingCollection={values}
                                onGenerated={handleAIGenerated}
                                generateCollection={generateCollection}
                                onAnalyticsEvent={onAnalyticsEvent}
                            />
                        )}
                        {fullScreen && !isNewCollection && (
                            <div className="flex items-center gap-2">
                                <LoadingButton
                                    variant="filled"
                                    color="primary"
                                    type="submit"
                                    onClick={() => formController.handleSubmit()}
                                    disabled={!dirty || isSubmitting || configController?.readOnly}
                                    loading={isSubmitting}
                                >
                                    {configController?.readOnly ? "Update (Read-only)" : "Update"}
                                </LoadingButton>
                            </div>
                        )}
                    </div>
                </div>}

                <form noValidate
                    onSubmit={formController.handleSubmit}
                    className="flex-grow flex flex-col min-h-0 relative">

                    <div className="flex-grow flex flex-col min-h-0 overflow-y-auto no-scrollbar relative w-full h-full">

                        {currentView === "loading" &&
                            <CircularProgressCenter />}

                        {currentView === "extra_view" &&
                            usedPath &&
                            extraView?.View &&
                            <extraView.View path={usedPath} />}

                        {currentView === "welcome" &&
                            <CollectionEditorWelcomeView
                                path={usedPath}
                                onContinue={onWelcomeScreenContinue}
                                existingCollectionPaths={existingPaths}
                                parentCollection={parentCollection}
                                generateCollection={generateCollection}
                                onAnalyticsEvent={onAnalyticsEvent}
                                unmappedTables={unmappedTables}
                                onImportFromTable={onFetchTableMetadata ? async (tableName: string) => {
                                    try {
                                        const columns = await onFetchTableMetadata!(tableName);
                                        if (!columns) return;
                                        const collectionData = buildCollectionFromTableMetadata(tableName, columns);
                                        formController.setValues({
                                            ...formController.values,
                                            ...collectionData
                                        } as EntityCollection<M>);
                                        onWelcomeScreenContinue();
                                    } catch (e: unknown) {
                                        console.error("Error importing table:", e);
                                        snackbarController.open({
                                            type: "error",
                                            message: "Error importing table: " + (e instanceof Error ? e.message : "Unknown error")
                                        });
                                    }
                                } : undefined} />}

                        {currentView === "import_data_mapping" && importConfig &&
                            <CollectionEditorImportMapping importConfig={importConfig}
                                propertyConfigs={propertyConfigs} />}

                        {currentView === "import_data_preview" && importConfig &&
                            <CollectionEditorImportDataPreview importConfig={importConfig}
                                properties={values.properties as Properties}
                                propertiesOrder={values.propertiesOrder as string[]} />}

                        {currentView === "import_data_saving" && importConfig &&
                            <ImportSaveInProgress importConfig={importConfig}
                                collection={values}
                                path={usedPath}
                                onImportSuccess={async (importedCollection) => {
                                    snackbarController.open({
                                        type: "info",
                                        message: "Data imported successfully"
                                    });
                                    await saveCollection(values);
                                    handleClose(importedCollection);
                                }}
                            />}

                        {currentView === "general" &&
                            <GeneralSettingsForm
                                existingPaths={existingPaths}
                                existingIds={existingIds}
                                parentCollection={parentCollection}
                                isNewCollection={isNewCollection} />
                        }

                        {currentView === "display" &&
                            <DisplaySettingsForm expandKanban={expandKanban} />
                        }

                        {currentView === "relations" && getDataSourceCapabilities(values.driver).supportsRelations &&
                            <CollectionRelationsTab />
                        }

                        {currentView === "rls" && getDataSourceCapabilities(values.driver).supportsRLS &&
                            <CollectionRLSTab />
                        }

                        {currentView === "properties" &&
                            <CollectionPropertiesEditorForm
                                showErrors={submitCount > 0}
                                isNewCollection={isNewCollection}
                                reservedGroups={reservedGroups}
                                onPropertyError={(propertyKey, namespace, error) => {
                                    const current = removeUndefined({
                                        ...propertyErrorsRef.current,
                                        [getFullIdPath(propertyKey, namespace)]: removeUndefined(error, true)
                                    }, true) as Record<string, any>;
                                    propertyErrorsRef.current = current;
                                    formController.validate();
                                }}
                                getUser={getUser}
                                getData={getDataWithPath}
                                doCollectionInference={doCollectionInference}
                                propertyConfigs={propertyConfigs}

                                extraIcon={extraView?.icon &&
                                    <IconButton
                                        color={"primary"}
                                        onClick={() => setCurrentView("extra_view")}>
                                        {extraView.icon}
                                    </IconButton>} />
                        }

                    </div>
                    {(!fullScreen || isNewCollection || !!error) && (
                        <div className="shrink-0 w-full p-4 sm:px-6 sm:py-4 border-t border-surface-200 dark:border-surface-800 flex items-center justify-between gap-4 bg-white dark:bg-surface-900">
                            {error && <ErrorView error={error} />}

                            {isNewCollection && includeTemplates && currentView === "import_data_mapping" &&
                                <Button variant={"text"}
                                    type="button"
                                    onClick={() => {
                                        importConfig.setInUse(false);
                                        return setCurrentView("welcome");
                                    }}>
                                    Back
                                </Button>}

                            {isNewCollection && includeTemplates && currentView === "import_data_preview" &&
                                <Button variant={"text"}
                                    type="button"
                                    onClick={() => {
                                        setCurrentView("import_data_mapping");
                                    }}>
                                    Back
                                </Button>}

                            {isNewCollection && includeTemplates && currentView === "general" &&
                                <Button variant={"text"}
                                    type="button"
                                    onClick={() => setCurrentView("welcome")}>
                                    Back
                                </Button>}

                            {isNewCollection && currentView === "properties" && <Button variant={"text"}
                                type="button"
                                color={"neutral"}
                                onClick={() => setCurrentView("general")}>
                                <ArrowBackIcon />
                                Back
                            </Button>}

                            {(!fullScreen || isNewCollection) && (
                                <Button variant={"text"}
                                    color={"neutral"}
                                    onClick={() => {
                                        handleCancel();
                                    }}>
                                    Cancel
                                </Button>
                            )}

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

                            {isNewCollection && (currentView === "general" || currentView === "properties") &&
                                <LoadingButton
                                    variant={"filled"}
                                    color="primary"
                                    type="submit"
                                    loading={isSubmitting}
                                    disabled={isSubmitting || (currentView === "general" && !validValues)}
                                    startIcon={currentView === "properties"
                                        ? <CheckIcon />
                                        : undefined}
                                >
                                    {currentView === "general" && "Next"}
                                    {currentView === "properties" && "Create collection"}
                                </LoadingButton>}

                            {!isNewCollection && !fullScreen && <LoadingButton
                                variant="filled"
                                color="primary"
                                type="submit"
                                disabled={isSubmitting || configController?.readOnly}
                                loading={isSubmitting}
                            >
                                {configController?.readOnly ? "Update collection (Read-only)" : "Update collection"}
                            </LoadingButton>}

                        </div>
                    )}
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
                the stored config, and reset to the code state.</>} />

    </div>

}

function applyPropertyConfigs<M extends Record<string, any> = any>(collection: EntityCollection<M>, propertyConfigs: Record<string, PropertyConfig>): EntityCollection<M> {
    const {
        properties,
        ...rest
    } = collection;
    const propertiesResult: Properties = {};
    if (properties) {
        Object.keys(properties).forEach((key) => {
            const prop = properties[key];
            if (prop == null) return;
            propertiesResult[key] = applyPropertiesConfig(prop, propertyConfigs);
        });
    }

    return {
        ...rest,
        properties: propertiesResult
    };
}

function applyPropertiesConfig(property: Property, propertyConfigs: Record<string, PropertyConfig>) {
    let internalProperty = property;
    if (propertyConfigs && internalProperty && typeof internalProperty === "object" && internalProperty.propertyConfig) {
        const propertyConfig = propertyConfigs[internalProperty.propertyConfig];
        if (propertyConfig && isPropertyBuilder(propertyConfig.property as Property)) {
            internalProperty = propertyConfig.property as unknown as Property;
        } else {

            if (propertyConfig) {
                internalProperty = mergeDeep(propertyConfig.property as Property, internalProperty);
            }

            if (!isPropertyBuilder(internalProperty) && internalProperty.type === "map" && internalProperty.properties) {
                const properties: Record<string, Property> = {};
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
