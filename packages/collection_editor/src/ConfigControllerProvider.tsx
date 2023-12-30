import React, { PropsWithChildren, useCallback, useEffect } from "react";
import equal from "react-fast-compare"

import { CollectionsConfigController } from "./types/config_controller";
import { Property, useFireCMSContext, useNavigationController, User, useSnackbarController } from "@firecms/core";
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

    pathSuggestions?: (path?: string) => Promise<string[]>;

    getUser: (uid: string) => User | null

    getData?: (path: string) => Promise<object[]>;

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
                                          pathSuggestions,
                                          getUser,
                                          getData,
                                          onAnalyticsEvent
                                      }: PropsWithChildren<ConfigControllerProviderProps>) {

        const navigation = useNavigationController();
        const navigate = useNavigate();
        const snackbarController = useSnackbarController();
        const { propertyConfigs } = useFireCMSContext();

        const {
            collections
        } = navigation;
        const existingPaths = collections.map(col => col.path.trim().toLowerCase());

        const [rootPathSuggestions, setRootPathSuggestions] = React.useState<string[] | undefined>();
        useEffect(() => {
            if (pathSuggestions) {
                pathSuggestions().then((paths) => {
                    setRootPathSuggestions(paths.filter(p => !existingPaths.includes(p.trim().toLowerCase())));
                });
            }
        }, [pathSuggestions]);

        const [currentDialog, setCurrentDialog] = React.useState<{
            isNewCollection: boolean,
            parentCollection?: PersistedCollection,
            editedCollectionPath?: string,
            fullPath?: string,
            parentCollectionIds: string[],
            initialValues?: {
                path?: string,
                group?: string,
                name?: string
            },
            redirect: boolean
        }>();

        const [currentPropertyDialog, setCurrentPropertyDialog] = React.useState<{
            propertyKey?: string,
            property?: Property,
            namespace?: string,
            parentCollection?: PersistedCollection,
            currentPropertiesOrder?: string[],
            editedCollectionPath: string,
            fullPath?: string,
            parentCollectionIds: string[],
            collectionEditable: boolean;
        }>();

        const defaultConfigPermissions: CollectionEditorPermissionsBuilder = useCallback(() => ({
            createCollections: true,
            editCollections: true,
            deleteCollections: true
        }), []);

        const editCollection = useCallback(({
                                                path,
                                                fullPath,
                                                parentCollectionIds,
                                                parentCollection
                                            }: {
            path?: string,
            fullPath?: string,
            parentCollectionIds: string[],
            parentCollection?: PersistedCollection
        }) => {
            console.debug("edit collection", path, fullPath, parentCollectionIds, parentCollection);
            onAnalyticsEvent?.("edit_collection", { path, fullPath });
            setCurrentDialog({
                editedCollectionPath: path,
                fullPath,
                parentCollectionIds,
                isNewCollection: false,
                parentCollection,
                redirect: false
            });
        }, []);

        const editProperty = useCallback(({
                                              propertyKey,
                                              property,
                                              editedCollectionPath,
                                              currentPropertiesOrder,
                                              parentCollectionIds,
                                              collection
                                          }: {
            propertyKey?: string,
            property?: Property,
            currentPropertiesOrder?: string[],
            editedCollectionPath: string,
            parentCollectionIds: string[],
            collection: PersistedCollection,
        }) => {
            console.debug("edit property", propertyKey, property, editedCollectionPath, currentPropertiesOrder, parentCollectionIds, collection);
            onAnalyticsEvent?.("edit_property", { propertyKey, editedCollectionPath });
            // namespace is all the path until the last dot
            const namespace = propertyKey && propertyKey.includes(".")
                ? propertyKey.substring(0, propertyKey.lastIndexOf("."))
                : undefined;
            const propertyKeyWithoutNamespace = propertyKey && propertyKey.includes(".")
                ? propertyKey.substring(propertyKey.lastIndexOf(".") + 1)
                : propertyKey;
            console.log("edit property", propertyKeyWithoutNamespace, collection)
            setCurrentPropertyDialog({
                propertyKey: propertyKeyWithoutNamespace,
                property,
                namespace,
                currentPropertiesOrder,
                editedCollectionPath,
                parentCollectionIds,
                collectionEditable: collection?.editable ?? false
            });
        }, []);

        const createCollection = React.useCallback(({
                                                        parentCollectionIds,
                                                        parentCollection,
                                                        initialValues,
                                                        redirect
                                                    }: {
            parentCollectionIds: string[],
            parentCollection?: PersistedCollection
            initialValues?: {
                group?: string,
                path?: string,
                name?: string
            },
            redirect: boolean
        }) => {
            console.debug("create collection", parentCollectionIds, parentCollection, initialValues, redirect);
            onAnalyticsEvent?.("create_collection", { parentCollectionIds, parentCollection, initialValues, redirect });
            setCurrentDialog({
                isNewCollection: true,
                parentCollectionIds,
                parentCollection,
                initialValues,
                redirect
            });
        }, []);

        const getPathSuggestions = !pathSuggestions
            ? undefined
            : (path?: string) => {
                if (!path && rootPathSuggestions)
                    return Promise.resolve(rootPathSuggestions);
                else {
                    return pathSuggestions?.(path);
                }
            }

        return (
            <ConfigControllerContext.Provider value={collectionConfigController}>
                <CollectionEditorContext.Provider
                    value={{
                        editCollection,
                        createCollection,
                        editProperty,
                        configPermissions: configPermissions ?? defaultConfigPermissions,
                        rootPathSuggestions
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
                        pathSuggestions={getPathSuggestions}
                        getUser={getUser}
                        handleClose={(collection) => {
                            if (currentDialog?.redirect) {
                                if (collection && currentDialog?.isNewCollection && !currentDialog.parentCollectionIds.length) {
                                    const url = navigation.buildUrlCollectionPath(collection.id ?? collection.path);
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
                        getData={getData && currentPropertyDialog?.editedCollectionPath
                            ? () => {
                                const resolvedPath = navigation.resolveAliasesFrom(currentPropertyDialog.editedCollectionPath!)
                                return getData(resolvedPath);
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
                                path: currentPropertyDialog?.editedCollectionPath,
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
                                path: currentPropertyDialog?.editedCollectionPath,
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
