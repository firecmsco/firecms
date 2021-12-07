import React, { useEffect, useRef, useState } from "react";
import {
    AuthController,
    DataSource,
    EntityCollection,
    EntityCollectionResolver,
    EntitySchema,
    EntitySchemaResolver,
    EntitySchemaResolverProps,
    Locale,
    Navigation,
    NavigationBuilder,
    NavigationContext,
    PartialEntityCollection,
    PartialProperties,
    PartialSchema,
    SchemaOverrideHandler,
    StorageSource,
    User
} from "../../models";
import {
    getCollectionFromCollections,
    removeInitialAndTrailingSlashes
} from "../util/navigation_utils";
import {
    getStorageCollectionConfig,
    saveStorageCollectionConfig
} from "../util/storage";
import { getValueInPath, mergeDeep } from "../util/objects";
import { computeProperties } from "../utils";

export function useBuildNavigationContext<UserType>({
                                                        basePath,
                                                        baseCollectionPath,
                                                        authController,
                                                        navigationOrBuilder,
                                                        schemaOverrideHandler,
                                                        dateTimeFormat,
                                                        locale,
                                                        dataSource,
                                                        storageSource
                                          }: {
    basePath: string,
    baseCollectionPath: string,
    authController: AuthController<UserType>;
    navigationOrBuilder: Navigation | NavigationBuilder<UserType>  | EntityCollection[];
    schemaOverrideHandler: SchemaOverrideHandler | undefined;
    dateTimeFormat?: string;
    locale?: Locale;
    dataSource: DataSource;
    storageSource: StorageSource;
}): NavigationContext {

    const [navigation, setNavigation] = useState<Navigation | undefined>(undefined);
    const [navigationLoading, setNavigationLoading] = useState<boolean>(false);
    const [navigationLoadingError, setNavigationLoadingError] = useState<Error | undefined>(undefined);

    const schemaConfigRecord = useRef<Record<string, Partial<EntityCollectionResolver> & { overrideSchemaRegistry?: boolean }>>({});
    const cleanBasePath = removeInitialAndTrailingSlashes(basePath);
    const cleanBaseCollectionPath = removeInitialAndTrailingSlashes(baseCollectionPath);

    const homeUrl = cleanBasePath ? `/${cleanBasePath}` : "/";

    const fullCollectionPath = cleanBasePath ? `/${cleanBasePath}/${cleanBaseCollectionPath}` : `/${cleanBaseCollectionPath}`;

    const initialised = navigation?.collections !== undefined;

    useEffect(() => {
        if (!authController.canAccessMainView) {
            return;
        }
        setNavigationLoading(true);
        getNavigation({
            navigationOrCollections: navigationOrBuilder,
            user: authController.user,
            authController,
            dateTimeFormat,
            locale,
            dataSource,
            storageSource
        })
            .then((result: Navigation) => {
                setNavigation(result);
                setNavigationLoading(false);
            }).catch(setNavigationLoadingError);
    }, [authController.user, authController.canAccessMainView, navigationOrBuilder]);


    const getCollectionResolver = <M extends any>(path: string, entityId?: string): EntityCollectionResolver<M> => {

        const collection = getCollection<M>(path);
        // if (!collection) {
        //     throw Error(`No collection found for path ${path}`);
        // }
        const sidePanelKey = getSidePanelKey(path, entityId);

        let result: Partial<EntityCollectionResolver> = {};

        const overriddenProps = schemaConfigRecord.current[sidePanelKey];
        const resolvedProps: Partial<EntityCollectionResolver> | undefined = schemaOverrideHandler && schemaOverrideHandler({
            entityId,
            path: removeInitialAndTrailingSlashes(path)
        });

        if (resolvedProps)
            result = resolvedProps;

        if (overriddenProps) {
            // override schema resolver default to true
            const shouldOverrideRegistry = overriddenProps.overrideSchemaRegistry === undefined || overriddenProps.overrideSchemaRegistry;
            if (shouldOverrideRegistry)
                result = {
                    ...overriddenProps,
                    permissions: result.permissions || overriddenProps.permissions,
                    schemaResolver: result.schemaResolver || overriddenProps.schemaResolver,
                    subcollections: result.subcollections || overriddenProps.subcollections,
                    callbacks: result.callbacks || overriddenProps.callbacks
                };
            else
                result = {
                    ...result,
                    permissions: overriddenProps.permissions ?? result.permissions,
                    schemaResolver: overriddenProps.schemaResolver ?? result.schemaResolver,
                    subcollections: overriddenProps.subcollections ?? result.subcollections,
                    callbacks: overriddenProps.callbacks ?? result.callbacks
                };

        }

        const entityCollection: EntityCollection | undefined = getCollection(path);
        if (entityCollection) {
            const schema = entityCollection.schema;
            const subcollections = entityCollection.subcollections;
            const callbacks = entityCollection.callbacks;
            const permissions = entityCollection.permissions;
            result = {
                ...result,
                schemaResolver: result.schemaResolver ?? buildSchemaResolver({
                    schema,
                    path
                }),
                subcollections: result.subcollections ?? subcollections,
                callbacks: result.callbacks ?? callbacks,
                permissions: result.permissions ?? permissions
            };
        }

        if (!result.schemaResolver) {
            if (!result.schema)
                throw Error(`Not able to resolve schema for ${sidePanelKey}`);
            result.schemaResolver = buildSchemaResolver({
                schema: result.schema,
                path
            });
        }

        return { ...collection, ...(result as EntityCollectionResolver<M>) };

    };

    const setOverride = ({
                             path,
                             entityId,
                             schemaConfig,
                             overrideSchemaRegistry
                         }: {
                             path: string,
                             entityId?: string,
                             schemaConfig?: Partial<EntityCollectionResolver>
                             overrideSchemaRegistry?: boolean
                         }
    ) => {

        const key = getSidePanelKey(path, entityId);
        if (!schemaConfig) {
            delete schemaConfigRecord.current[key];
            return undefined;
        } else {

            schemaConfigRecord.current[key] = {
                ...schemaConfig,
                overrideSchemaRegistry
            };
            return key;
        }
    };

    const removeAllOverridesExcept = (entityRefs: {
        path: string, entityId?: string
    }[]) => {
        const keys = entityRefs.map(({
                                         path,
                                         entityId
                                     }) => getSidePanelKey(path, entityId));
        Object.keys(schemaConfigRecord.current).forEach((currentKey) => {
            if (!keys.includes(currentKey))
                delete schemaConfigRecord.current[currentKey];
        });
    };

    function buildSchemaResolver<M>({
                                        schema,
                                        path
                                    }: { schema: EntitySchema<M>, path: string }): EntitySchemaResolver {

        return ({
                    entityId,
                    values,
                }: EntitySchemaResolverProps) => {

            const collectionOverride = getCollectionOverride<M>(path);
            const schemaOverride = collectionOverride?.schema;
            const storedProperties: PartialProperties<M> | undefined = getValueInPath(schemaOverride, "properties");

            const properties = computeProperties({
                propertiesOrBuilder: schema.properties,
                path,
                entityId,
                values: values ?? schema.defaultValues
            });

            return {
                ...schema,
                properties: mergeDeep(properties, storedProperties)
            };
        };
    }

    async function getNavigation<UserType>({ navigationOrCollections, user, authController, dateTimeFormat, locale, dataSource, storageSource }:
                                     {
                                         navigationOrCollections: Navigation | NavigationBuilder<UserType>  | EntityCollection[],
                                         user: User | null,
                                         authController: AuthController<UserType>,
                                         dateTimeFormat?: string,
                                         locale?: Locale,
                                         dataSource: DataSource,
                                         storageSource: StorageSource
                                     }
    ): Promise<Navigation> {

        if (Array.isArray(navigationOrCollections)) {
            return {
                collections: navigationOrCollections
            };
        } else if (typeof navigationOrCollections === "function") {
            return navigationOrCollections({ user, authController, dateTimeFormat,locale, dataSource, storageSource });
        } else {
            return navigationOrCollections;
        }
    }

    function isUrlCollectionPath(path: string): boolean {
        return removeInitialAndTrailingSlashes(path + "/").startsWith(removeInitialAndTrailingSlashes(fullCollectionPath) + "/");
    }

    function urlPathToDataPath(path: string): string {
        if (path.startsWith(fullCollectionPath))
            return path.replace(fullCollectionPath, "");
        throw Error("Expected path starting with " + fullCollectionPath);
    }

    function buildUrlCollectionPath(path: string): string {
        return `${baseCollectionPath}/${removeInitialAndTrailingSlashes(path)}`;
    }

    function buildCMSUrlPath(path: string): string {
        return cleanBasePath ? `/${cleanBasePath}/${removeInitialAndTrailingSlashes(path)}` : `/${path}`;
    }


    const onCollectionModifiedForUser = <M extends any>(path: string, partialCollection: PartialEntityCollection<M>) => {
        saveStorageCollectionConfig(path, partialCollection);
    }

    /**
     * Find the corresponding view at any depth for a given path.
     * @param path
     */
    function getCollection<M>(path: string): EntityCollection<M> | undefined {

        const collections = navigation?.collections;
        if (!collections)
            return undefined;

        const collection = getCollectionFromCollections<M>(removeInitialAndTrailingSlashes(path), collections);

        const dynamicCollectionConfig = { ...getCollectionOverride(path) };
        delete dynamicCollectionConfig["schema"];

        return collection ? mergeDeep(collection, dynamicCollectionConfig) : undefined;
    }

    const getCollectionOverride = <M extends any>(path: string): PartialEntityCollection<M> | undefined => {
        return getStorageCollectionConfig<M>(path);
    }

    return {
        navigation,
        loading: navigationLoading,
        navigationLoadingError,
        homeUrl,
        basePath,
        baseCollectionPath,
        onCollectionModifiedForUser,
        initialised,
        getCollectionResolver,
        setOverride,
        removeAllOverridesExcept,
        isUrlCollectionPath,
        urlPathToDataPath,
        buildUrlCollectionPath,
        buildCMSUrlPath,
    };
}


export function getSidePanelKey(path: string, entityId?: string) {
    if (entityId)
        return `${removeInitialAndTrailingSlashes(path)}/${removeInitialAndTrailingSlashes(entityId)}`;
    else
        return removeInitialAndTrailingSlashes(path);
}
