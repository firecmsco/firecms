import React, { PropsWithChildren, useCallback } from "react";
import { deepEqual as equal } from "fast-equals";

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

    getUser?: (uid: string) => User | null;

    getData?: (path: string, parentPaths: string[]) => Promise<object[]>;

    onAnalyticsEvent?: (event: string, params?: object) => void;

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
                                      }: PropsWithChildren<ConfigControllerProviderProps>) {

        const navigation = useNavigationController();
        const navigate = useNavigate();
        const snackbarController = useSnackbarController();
        const { propertyConfigs } = useCustomizationController();

        const [currentDialog, setCurrentDialog] = React.useState<{
            isNewCollection: boolean,
            parentCollection?: PersistedCollection,
            editedCollectionId?: string,
            path?: string,
            parentCollectionIds: string[],
            initialValues?: {
                path?: string,
                group?: string,
                name?: string
            },
            redirect: boolean,
            existingEntities?: Entity<any>[]
        }>();

        const [currentPropertyDialog, setCurrentPropertyDialog] = React.useState<{
            propertyKey?: string,
            property?: Property,
            namespace?: string,
            parentCollection?: PersistedCollection,
            currentPropertiesOrder?: string[],
            editedCollectionId: string,
            path?: string,
            parentCollectionIds: string[],
            collectionEditable: boolean;
            existingEntities?: Entity<any>[]
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
                                    existingEntities
                                }: {
            id?: string,
            path?: string,
            parentCollectionIds: string[],
            parentCollection?: PersistedCollection,
            existingEntities?: Entity<any>[]
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
                existingEntities
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
                collectionEditable: collection?.editable ?? false,
                existingEntities
            });
        };

        const createCollection = ({
                                      parentCollectionIds,
                                      parentCollection,
                                      initialValues,
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
            redirect: boolean,
            sourceClick?: string
        }) => {
            console.debug("Create collection", {
                parentCollectionIds,
                parentCollection,
                initialValues,
                redirect,
                sourceClick
            });
            onAnalyticsEvent?.("create_collection", {
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
                redirect
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
                        handleClose={(collection) => {
                            if (currentDialog?.redirect) {
                                if (collection && currentDialog?.isNewCollection && !currentDialog.parentCollectionIds.length) {
                                    const url = navigation.buildUrlCollectionPath(collection.slug);
                                    navigate(url);
                                }
                            }
                            setCurrentDialog(undefined);
                        }}/>

                    {/* Used for editing properties*/}
                    <PropertyFormDialog
                        open={Boolean(currentPropertyDialog)}
                        includeIdAndName={true}
                        existingProperty={Boolean(currentPropertyDialog?.propertyKey)}
                        autoUpdateId={!currentPropertyDialog ? false : !currentPropertyDialog?.propertyKey}
                        autoOpenTypeSelect={!currentPropertyDialog ? false : !currentPropertyDialog?.propertyKey}
                        inArray={false}
                        collectionEditable={currentPropertyDialog?.collectionEditable ?? false}
                        getData={getData && currentPropertyDialog?.editedCollectionId
                            ? () => {
                                console.debug("get data for property", currentPropertyDialog?.editedCollectionId);
                                const resolvedPath = navigation.resolveDatabasePathsFrom(currentPropertyDialog.editedCollectionId!)
                                return getData(resolvedPath, []);
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
                        existingPropertyKeys={[]}
                        allowDataInference={true}
                        propertyConfigs={propertyConfigs}
                        property={currentPropertyDialog?.property}
                        propertyKey={currentPropertyDialog?.propertyKey}/>

                </CollectionEditorContext.Provider>

            </ConfigControllerContext.Provider>
        );
    }, equal);
