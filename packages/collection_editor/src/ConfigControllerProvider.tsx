import React, { PropsWithChildren, useCallback } from "react";
import equal from "react-fast-compare"

import { CollectionsConfigController } from "./types/config_controller";
import {
    Entity,
    Property,
    useCustomizationController,
    useNavigationController,
    User,
    useSnackbarController
} from "@firecms/core";
import { CollectionEditorDialog } from "./ui/collection_editor/CollectionEditorDialog";
import { useNavigate } from "react-router";
import { CollectionEditorController } from "./types/collection_editor_controller";
import { CollectionEditorPermissionsBuilder } from "./types/config_permissions";
import { CollectionInference } from "./types/collection_inference";
import { PropertyFormDialog } from "./ui/collection_editor/PropertyEditView";
import { PersistedCollection } from "./types/persisted_collection";
import { CollectionGenerationCallback } from "./api/generateCollectionApi";

export const ConfigControllerContext = React.createContext<CollectionsConfigController>({} as any);
export const CollectionEditorContext = React.createContext<CollectionEditorController>({} as any);

export interface ConfigControllerProviderProps {
    /**
     * Controller for managing the collections' config.
     */
    collectionConfigController: CollectionsConfigController;

    /**
     * Callback used to infer the schema from the data.
     */
    collectionInference?: CollectionInference;

    /**
     * Use this builder to define the permissions for the configuration per user.
     */
    configPermissions?: CollectionEditorPermissionsBuilder;

    /**
     * Groups that cannot be used to create new collections.
     */
    reservedGroups?: string[];

    extraView?: {
        View: React.ComponentType<{
            path: string
        }>,
        icon: React.ReactNode
    };

    pathSuggestions?: string[];

    getUser?: (uid: string) => User | null;

    getData?: (path: string, parentPaths: string[]) => Promise<object[]>;

    onAnalyticsEvent?: (event: string, params?: object) => void;

    /**
     * Callback function for generating/modifying collections.
     * The plugin is API-agnostic - the consumer provides the implementation.
     */
    generateCollection?: CollectionGenerationCallback;

}

export const ConfigControllerProvider = React.memo(
    function ConfigControllerProvider({
        children,
        collectionConfigController,
        configPermissions,
        reservedGroups,
        collectionInference,
        extraView,
        getUser,
        getData,
        onAnalyticsEvent,
        pathSuggestions,
        generateCollection
    }: PropsWithChildren<ConfigControllerProviderProps>) {

        const navigation = useNavigationController();
        const navigate = useNavigate();
        const snackbarController = useSnackbarController();
        const { propertyConfigs } = useCustomizationController();

        const [currentDialog, setCurrentDialog] = React.useState<{
            isNewCollection: boolean,
            parentCollection?: PersistedCollection,
            editedCollectionId?: string,
            fullPath?: string,
            parentCollectionIds: string[],
            initialValues?: {
                path?: string,
                group?: string,
                name?: string
            },
            copyFrom?: PersistedCollection,
            redirect: boolean,
            existingEntities?: Entity<any>[],
            pathSuggestions?: string[];
            initialView?: "general" | "display" | "properties";
            expandKanban?: boolean;
        }>();

        const [currentPropertyDialog, setCurrentPropertyDialog] = React.useState<{
            propertyKey?: string,
            property?: Property,
            namespace?: string,
            parentCollection?: PersistedCollection,
            currentPropertiesOrder?: string[],
            editedCollectionId: string,
            fullPath?: string,
            parentCollectionIds: string[],
            collectionEditable: boolean;
            existingEntities?: Entity<any>[];
            collection?: PersistedCollection;
        }>();

        const defaultConfigPermissions: CollectionEditorPermissionsBuilder = useCallback(() => ({
            createCollections: true,
            editCollections: true,
            deleteCollections: true
        }), []);

        const editCollection = ({
            id,
            fullPath,
            parentCollectionIds,
            parentCollection,
            existingEntities,
            initialView,
            expandKanban
        }: {
            id?: string,
            fullPath?: string,
            parentCollectionIds: string[],
            parentCollection?: PersistedCollection,
            existingEntities?: Entity<any>[],
            initialView?: "general" | "display" | "properties",
            expandKanban?: boolean
        }) => {
            console.debug("Edit collection", id, fullPath, parentCollectionIds, parentCollection);
            onAnalyticsEvent?.("edit_collection", {
                id,
                fullPath
            });
            setCurrentDialog({
                editedCollectionId: id,
                fullPath,
                parentCollectionIds,
                isNewCollection: false,
                parentCollection,
                redirect: false,
                existingEntities,
                pathSuggestions,
                initialView,
                expandKanban
            });
        };

        const editProperty = ({
            propertyKey,
            property,
            editedCollectionId,
            currentPropertiesOrder,
            parentCollectionIds,
            collection,
            existingEntities
        }: {
            propertyKey?: string,
            property?: Property,
            currentPropertiesOrder?: string[],
            editedCollectionId: string,
            parentCollectionIds: string[],
            collection: PersistedCollection,
            existingEntities?: Entity<any>[]
        }) => {
            console.debug("Edit property", propertyKey, property, editedCollectionId, currentPropertiesOrder, parentCollectionIds, collection);
            onAnalyticsEvent?.("edit_property", {
                propertyKey,
                editedCollectionId
            });
            // namespace is all the path until the last dot
            const namespace = propertyKey && propertyKey.includes(".")
                ? propertyKey.substring(0, propertyKey.lastIndexOf("."))
                : undefined;
            const propertyKeyWithoutNamespace = propertyKey && propertyKey.includes(".")
                ? propertyKey.substring(propertyKey.lastIndexOf(".") + 1)
                : propertyKey;
            setCurrentPropertyDialog({
                propertyKey: propertyKeyWithoutNamespace,
                property,
                namespace,
                currentPropertiesOrder,
                editedCollectionId,
                parentCollectionIds,
                collectionEditable: collection?.editable === undefined || collection?.editable === true,
                existingEntities,
                collection
            });
        };

        const createCollection = ({
            parentCollectionIds,
            parentCollection,
            initialValues,
            copyFrom,
            redirect,
            sourceClick
        }: {
            parentCollectionIds: string[],
            parentCollection?: PersistedCollection
            initialValues?: {
                group?: string,
                path?: string,
                name?: string
            },
            copyFrom?: PersistedCollection,
            redirect: boolean,
            sourceClick?: string
        }) => {
            console.debug("Create collection", {
                parentCollectionIds,
                parentCollection,
                initialValues,
                copyFrom,
                redirect,
                sourceClick
            });
            onAnalyticsEvent?.(copyFrom ? "duplicate_collection" : "create_collection", {
                parentCollectionIds,
                parentCollection,
                initialValues,
                redirect,
                sourceClick
            });
            setCurrentDialog({
                isNewCollection: true,
                parentCollectionIds,
                parentCollection,
                initialValues,
                copyFrom,
                redirect,
                pathSuggestions
            });
        };

        return (
            <ConfigControllerContext.Provider value={collectionConfigController}>
                <CollectionEditorContext.Provider
                    value={{
                        editCollection,
                        createCollection,
                        editProperty,
                        configPermissions: configPermissions ?? defaultConfigPermissions,
                        pathSuggestions
                    }}>

                    {children}

                    <CollectionEditorDialog
                        open={Boolean(currentDialog)}
                        configController={collectionConfigController}
                        isNewCollection={false}
                        collectionInference={collectionInference}
                        {...currentDialog}
                        getData={getData}
                        reservedGroups={reservedGroups}
                        extraView={extraView}
                        getUser={getUser}
                        generateCollection={generateCollection}
                        handleClose={(collection) => {
                            if (currentDialog?.redirect) {
                                if (collection && currentDialog?.isNewCollection && !currentDialog.parentCollectionIds.length) {
                                    const url = navigation.buildUrlCollectionPath(collection.id ?? collection.path);
                                    navigate(url);
                                }
                            }
                            setCurrentDialog(undefined);
                        }} />

                    {/* Used for editing properties*/}
                    <PropertyFormDialog
                        open={Boolean(currentPropertyDialog)}
                        includeIdAndName={true}
                        existingProperty={Boolean(currentPropertyDialog?.propertyKey)}
                        autoUpdateId={!currentPropertyDialog ? false : !currentPropertyDialog?.propertyKey}
                        autoOpenTypeSelect={!currentPropertyDialog ? false : !currentPropertyDialog?.propertyKey}
                        inArray={false}
                        collectionEditable={currentPropertyDialog?.collectionEditable ?? false}
                        getData={currentPropertyDialog?.existingEntities || (getData && currentPropertyDialog?.editedCollectionId)
                            ? async () => {
                                let data: object[] = [];
                                // First, use existing entities if available (already loaded in table)
                                if (currentPropertyDialog?.existingEntities) {
                                    data = currentPropertyDialog.existingEntities.map(e => e.values);
                                }
                                // If getData is available and we have a path, also fetch from database
                                if (getData && currentPropertyDialog?.editedCollectionId) {
                                    console.debug("Get data for property, path:", currentPropertyDialog?.editedCollectionId);
                                    const resolvedPath = navigation.resolveIdsFrom(currentPropertyDialog.editedCollectionId!);
                                    const fetchedData = await getData(resolvedPath, []);
                                    data.push(...fetchedData);
                                }
                                return data;
                            }
                            : undefined}
                        onPropertyChanged={({
                            id,
                            property
                        }) => {
                            if (!currentPropertyDialog) return;
                            if (!id) return;
                            const newProperty = !(currentPropertyDialog.propertyKey);
                            return collectionConfigController.saveProperty({
                                path: currentPropertyDialog?.editedCollectionId,
                                property,
                                propertyKey: id,
                                newPropertiesOrder: newProperty && currentPropertyDialog.currentPropertiesOrder ? [...currentPropertyDialog.currentPropertiesOrder, id] : undefined,
                                namespace: currentPropertyDialog.namespace,
                                parentCollectionIds: currentPropertyDialog.parentCollectionIds
                            })
                                .catch((e) => {
                                    console.error(e);
                                    snackbarController.open({
                                        type: "error",
                                        message: "Error persisting property: " + (e.message ?? "Details in the console")
                                    });
                                    return false;
                                });
                        }}
                        onPropertyChangedImmediate={false}
                        onDelete={() => {
                            if (!currentPropertyDialog?.propertyKey) return;
                            const newPropertiesOrder = currentPropertyDialog?.currentPropertiesOrder?.filter(p => p !== currentPropertyDialog?.propertyKey);
                            return collectionConfigController.deleteProperty({
                                path: currentPropertyDialog?.editedCollectionId,
                                propertyKey: currentPropertyDialog?.propertyKey,
                                namespace: currentPropertyDialog?.namespace,
                                newPropertiesOrder,
                                parentCollectionIds: currentPropertyDialog?.parentCollectionIds
                            })
                                .then(() => {
                                    setCurrentPropertyDialog(undefined);
                                }).catch((e) => {
                                    console.error(e);
                                    snackbarController.open({
                                        type: "error",
                                        message: "Error deleting property: " + (e.message ?? "Details in the console")
                                    });
                                    return false;
                                });
                        }}
                        onError={() => {
                        }}
                        onOkClicked={() => {
                            setCurrentPropertyDialog(undefined);
                        }}
                        onCancel={() => {
                            setCurrentPropertyDialog(undefined);
                        }}
                        initialErrors={{}}
                        forceShowErrors={false}
                        existingPropertyKeys={currentPropertyDialog?.collection?.properties ? Object.keys(currentPropertyDialog.collection.properties) : []}
                        allowDataInference={true}
                        propertyConfigs={propertyConfigs}
                        property={currentPropertyDialog?.property}
                        propertyKey={currentPropertyDialog?.propertyKey} />

                </CollectionEditorContext.Provider>

            </ConfigControllerContext.Provider>
        );
    }, equal);
