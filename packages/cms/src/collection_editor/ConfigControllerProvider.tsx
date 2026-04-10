import { useUrlController } from "./_cms_internals";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Entity, EntityCollection, Property, TableMetadata, User } from "@rebasepro/types";
import { deepEqual as equal } from "fast-equals";

import { CollectionsConfigController } from "./types/config_controller";
import { useCustomizationController, useRebaseContext, useAuthController, useSnackbarController } from "@rebasepro/core";
import { useNavigate } from "react-router";
import { CollectionEditorController } from "./types/collection_editor_controller";
import { CollectionEditorPermissionsBuilder } from "./types/config_permissions";
import { CollectionInference } from "./types/collection_inference";
import { CollectionGenerationCallback } from "./api/generateCollectionApi";
import { CollectionEditorDialogsContext, CollectionEditorDialogsState } from "./CollectionEditorDialogsContext";

export const ConfigControllerContext = React.createContext<CollectionsConfigController>({} as CollectionsConfigController);
export const CollectionEditorContext = React.createContext<CollectionEditorController>({} as CollectionEditorController);

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
    }: ConfigControllerProviderProps & { children?: React.ReactNode }) {

        // Internal: fetch unmapped tables and table columns from the data source
        const { databaseAdmin } = useRebaseContext();
        const authController = useAuthController();
        const [unmappedTables, setUnmappedTables] = useState<string[]>([]);

        useEffect(() => {
            if (!databaseAdmin?.fetchUnmappedTables || authController.initialLoading || !authController.user) return;
            const existingPaths = (collectionConfigController.collections ?? []).map(c => c.dbPath ?? c.slug ?? "").filter(Boolean);
            databaseAdmin.fetchUnmappedTables(existingPaths)
                .then((tables: string[]) => setUnmappedTables(tables))
                .catch((e: unknown) => console.warn("Could not fetch unmapped tables:", e));
        }, [databaseAdmin, authController.initialLoading, authController.user, collectionConfigController.collections]);

        const onFetchTableMetadata = useCallback(async (tableName: string): Promise<TableMetadata | undefined> => {
            return databaseAdmin?.fetchTableMetadata?.(tableName);
        }, [databaseAdmin]);

        const urlController = useUrlController();
        const navigate = useNavigate();
        const snackbarController = useSnackbarController();
        const { propertyConfigs } = useCustomizationController();

        const [currentDialog, setCurrentDialog] = React.useState<{
            isNewCollection: boolean,
            parentCollection?: EntityCollection,
            editedCollectionId?: string,
            path?: string,
            parentCollectionIds: string[],
            initialValues?: {
                path?: string,
                group?: string,
                name?: string
            },
            copyFrom?: EntityCollection,
            redirect: boolean,
            existingEntities?: Entity[],
            pathSuggestions?: string[];
            initialView?: "general" | "display" | "properties";
            expandKanban?: boolean;
        }>();

        const [currentPropertyDialog, setCurrentPropertyDialog] = React.useState<{
            propertyKey?: string,
            property?: Property,
            namespace?: string,
            parentCollection?: EntityCollection,
            currentPropertiesOrder?: string[],
            editedCollectionId: string,
            path?: string,
            parentCollectionIds: string[],

            existingEntities?: Entity[];
            collection?: EntityCollection;
        }>();

        const defaultConfigPermissions: CollectionEditorPermissionsBuilder = useCallback(() => ({
            createCollections: true,
            editCollections: true,
            deleteCollections: true
        }), []);

        const editCollection = ({
            id,
            path,
            parentCollectionIds,
            parentCollection,
            existingEntities,
            initialView,
            expandKanban
        }: {
            id?: string,
            path?: string,
            parentCollectionIds: string[],
            parentCollection?: EntityCollection,
            existingEntities?: Entity[],
            initialView?: "general" | "display" | "properties",
            expandKanban?: boolean
        }) => {
            console.debug("Edit collection", id, path, parentCollectionIds, parentCollection);
            onAnalyticsEvent?.("edit_collection", {
                id,
                path
            });
            setCurrentDialog({
                editedCollectionId: id,
                path,
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
            collection: EntityCollection,
            existingEntities?: Entity[]
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
            parentCollection?: EntityCollection
            initialValues?: {
                group?: string,
                path?: string,
                name?: string
            },
            copyFrom?: EntityCollection,
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

        // Build the dialog props objects that will be consumed by
        // CollectionEditorDialogs (rendered inside RebaseShell where CMS
        // contexts are available).
        const collectionDialogProps = useMemo(() => {
            if (!currentDialog) return undefined;
            return {
                open: true,
                configController: collectionConfigController,
                collectionInference,
                ...currentDialog,
                getData,
                reservedGroups,
                extraView,
                getUser,
                generateCollection,
                onAnalyticsEvent,
                unmappedTables,
                onFetchTableMetadata,
                handleClose: (collection?: EntityCollection) => {
                    if (currentDialog?.redirect) {
                        if (collection && currentDialog?.isNewCollection && !currentDialog.parentCollectionIds.length) {
                            const url = urlController.buildUrlCollectionPath(collection.slug);
                            navigate(url);
                        }
                    }
                    setCurrentDialog(undefined);
                }
            };
        }, [
            currentDialog, collectionConfigController, collectionInference,
            getData, reservedGroups, extraView, getUser, generateCollection,
            onAnalyticsEvent, unmappedTables, onFetchTableMetadata,
            urlController, navigate
        ]);

        const propertyDialogProps = useMemo(() => {
            if (!currentPropertyDialog) return undefined;
            return {
                open: true,
                includeIdAndName: true,
                existingProperty: Boolean(currentPropertyDialog.propertyKey),
                autoUpdateId: !currentPropertyDialog.propertyKey,
                autoOpenTypeSelect: !currentPropertyDialog.propertyKey,
                inArray: false,
                getData: currentPropertyDialog.existingEntities || (getData && currentPropertyDialog.editedCollectionId)
                    ? async () => {
                        let data: object[] = [];
                        if (currentPropertyDialog.existingEntities) {
                            data = currentPropertyDialog.existingEntities.map(e => e.values);
                        }
                        if (getData && currentPropertyDialog.editedCollectionId) {
                            console.debug("Get data for property, path:", currentPropertyDialog.editedCollectionId);
                            const resolvedPath = urlController.resolveDatabasePathsFrom(currentPropertyDialog.editedCollectionId!);
                            const fetchedData = await getData(resolvedPath, []);
                            data.push(...fetchedData);
                        }
                        return data;
                    }
                    : undefined,
                onPropertyChanged: ({
                    id,
                    property
                }: { id?: string; property: Property }) => {
                    if (!currentPropertyDialog) return;
                    if (!id) return;
                    const newProperty = !(currentPropertyDialog.propertyKey);
                    return collectionConfigController.saveProperty({
                        path: currentPropertyDialog.editedCollectionId,
                        property,
                        propertyKey: id,
                        newPropertiesOrder: newProperty && currentPropertyDialog.currentPropertiesOrder ? [...currentPropertyDialog.currentPropertiesOrder, id] : undefined,
                        namespace: currentPropertyDialog.namespace,
                        parentCollectionIds: currentPropertyDialog.parentCollectionIds
                    })
                        .catch((e: any) => {
                            console.error(e);
                            snackbarController.open({
                                type: "error",
                                message: "Error persisting property: " + (e.message ?? "Details in the console")
                            });
                            return false;
                        });
                },
                onPropertyChangedImmediate: false,
                onDelete: () => {
                    if (!currentPropertyDialog.propertyKey) return;
                    const newPropertiesOrder = currentPropertyDialog.currentPropertiesOrder?.filter((p: string) => p !== currentPropertyDialog.propertyKey);
                    return collectionConfigController.deleteProperty({
                        path: currentPropertyDialog.editedCollectionId,
                        propertyKey: currentPropertyDialog.propertyKey,
                        namespace: currentPropertyDialog.namespace,
                        newPropertiesOrder,
                        parentCollectionIds: currentPropertyDialog.parentCollectionIds
                    })
                        .then(() => {
                            setCurrentPropertyDialog(undefined);
                        }).catch((e: any) => {
                            console.error(e);
                            snackbarController.open({
                                type: "error",
                                message: "Error deleting property: " + (e.message ?? "Details in the console")
                            });
                            return false;
                        });
                },
                onError: () => { },
                onOkClicked: () => {
                    setCurrentPropertyDialog(undefined);
                },
                onCancel: () => {
                    setCurrentPropertyDialog(undefined);
                },
                initialErrors: {},
                forceShowErrors: false,
                existingPropertyKeys: currentPropertyDialog.collection?.properties ? Object.keys(currentPropertyDialog.collection.properties) : [],
                allowDataInference: true,
                propertyConfigs,
                property: currentPropertyDialog.property,
                propertyKey: currentPropertyDialog.propertyKey
            };
        }, [currentPropertyDialog, getData, urlController, collectionConfigController, snackbarController, propertyConfigs]);

        const dialogsState: CollectionEditorDialogsState = useMemo(() => ({
            collectionDialogProps,
            propertyDialogProps
        }), [collectionDialogProps, propertyDialogProps]);

        return (
            <ConfigControllerContext.Provider value={collectionConfigController}>
                <CollectionEditorContext.Provider
                    value={{
                        editCollection,
                        createCollection,
                        editProperty,
                        configPermissions: configPermissions ?? defaultConfigPermissions,
                        pathSuggestions,
                        configController: collectionConfigController
                    }}>
                    <CollectionEditorDialogsContext.Provider value={dialogsState}>
                        {children}
                    </CollectionEditorDialogsContext.Provider>
                </CollectionEditorContext.Provider>
            </ConfigControllerContext.Provider>
        );
    }, equal);
