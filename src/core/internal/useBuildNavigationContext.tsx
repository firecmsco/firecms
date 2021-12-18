import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    AuthController,
    DataSource,
    EntityCollection,
    EntityCollectionResolver,
    EntitySchema,
    EntitySchemaResolver,
    EntitySchemaResolverProps,
    LocalConfigurationPersistence,
    Locale,
    LocalEntityCollection,
    LocalEntitySchema,
    Navigation,
    NavigationBuilder,
    NavigationContext,
    ResolvedNavigation,
    SchemaOverrideHandler,
    StorageSource
} from "../../models";
import {
    getCollectionByPath,
    removeInitialAndTrailingSlashes
} from "../util/navigation_utils";
import { getValueInPath, mergeDeep } from "../util/objects";
import { computeProperties } from "../utils";
import { ConfigurationPersistence } from "../../models/config_persistence";

export function useBuildNavigationContext<UserType>({
                                                        basePath,
                                                        baseCollectionPath,
                                                        authController,
                                                        navigationOrBuilder,
                                                        schemaOverrideHandler,
                                                        dateTimeFormat,
                                                        locale,
                                                        dataSource,
                                                        storageSource,
                                                        configPersistence,
                                                        userConfigPersistence
                                                    }: {
    basePath: string,
    baseCollectionPath: string,
    authController: AuthController<UserType>;
    navigationOrBuilder?: Navigation | NavigationBuilder<UserType>;
    schemaOverrideHandler: SchemaOverrideHandler | undefined;
    dateTimeFormat?: string;
    locale?: Locale;
    dataSource: DataSource;
    storageSource: StorageSource;
    configPersistence?: ConfigurationPersistence;
    userConfigPersistence?: LocalConfigurationPersistence;
}): NavigationContext {

    const [navigation, setNavigation] = useState<ResolvedNavigation | undefined>(undefined);
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
            navigationOrBuilder,
            configPersistence,
            authController,
            dateTimeFormat,
            locale,
            dataSource,
            storageSource
        }).then((result: ResolvedNavigation) => {
            setNavigation(result);
            setNavigationLoading(false);
        }).catch(setNavigationLoadingError);
    }, [
        authController.user,
        authController.canAccessMainView,
        navigationOrBuilder,
        configPersistence?.collections
    ]);


    const getSchemaOverride = useCallback(<M extends any>(path: string): LocalEntitySchema<M> | undefined => {
        if (!userConfigPersistence)
            return undefined
        const collectionOverride = userConfigPersistence.getCollectionConfig<M>(path);
        return collectionOverride?.schema;
    }, [userConfigPersistence]);


    const buildSchemaResolver = useCallback(<M extends { [Key: string]: any } = any>
    ({
         schema,
         path
     }: { schema: EntitySchema<M>, path: string }): EntitySchemaResolver<M> =>
        ({
             entityId,
             values,
         }: EntitySchemaResolverProps<M>) => {

            const schemaOverride = getSchemaOverride<M>(path);
            const storedProperties = getValueInPath(schemaOverride, "properties");

            const properties = computeProperties({
                propertiesOrBuilder: schema.properties,
                path,
                entityId,
                values: values ?? schema.defaultValues
            });

            return {
                ...schema,
                properties: mergeDeep(properties, storedProperties),
                originalSchema: schema
            };
        }, [getSchemaOverride]);


    const getCollectionResolver = useCallback(<M extends { [Key: string]: any }>(path: string, entityId?: string, collection?: EntityCollection<M>): EntityCollectionResolver<M> => {

        const collections = navigation?.collections;

        const baseCollection = collection ?? (collections && getCollectionByPath<M>(removeInitialAndTrailingSlashes(path), collections));

        const collectionOverride = getCollectionOverride(path);

        const resolvedCollection = baseCollection ? mergeDeep(baseCollection, collectionOverride) : undefined;

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

        if (resolvedCollection) {
            const schema = resolvedCollection.schema;
            const subcollections = resolvedCollection.subcollections;
            const callbacks = resolvedCollection.callbacks;
            const permissions = resolvedCollection.permissions;
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

        return { ...resolvedCollection, ...(result as EntityCollectionResolver<M>) };

    }, [
        navigation,
        basePath,
        baseCollectionPath,
        schemaOverrideHandler,
        schemaConfigRecord.current,
        buildSchemaResolver
    ]);

    const setOverride = useCallback(({
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
    }, [schemaConfigRecord.current]);

    const removeAllOverridesExcept = useCallback((entityRefs: {
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
    }, [schemaConfigRecord.current]);

    const isUrlCollectionPath = useCallback(
        (path: string): boolean => removeInitialAndTrailingSlashes(path + "/").startsWith(removeInitialAndTrailingSlashes(fullCollectionPath) + "/"),
        [fullCollectionPath]);

    const urlPathToDataPath = useCallback((path: string): string => {
        if (path.startsWith(fullCollectionPath))
            return path.replace(fullCollectionPath, "");
        throw Error("Expected path starting with " + fullCollectionPath);
    }, [fullCollectionPath]);

    const buildUrlEditCollectionPath = useCallback(({
                                                        path,
                                                        group
                                                    }: { path?: string, group?: string }): string => {
            if (path)
                return `${baseCollectionPath}/edit/${removeInitialAndTrailingSlashes(path)}`;
            else
                return `new${group ? `?group=${group}` : ""}`;
        }, //
        [baseCollectionPath]);

    const buildUrlCollectionPath = useCallback((path: string): string => `${baseCollectionPath}/${removeInitialAndTrailingSlashes(path)}`,
        [baseCollectionPath]);

    const buildCMSUrlPath = useCallback((path: string): string => cleanBasePath ? `/${cleanBasePath}/${removeInitialAndTrailingSlashes(path)}` : `/${path}`,
        [cleanBasePath]);

    const onCollectionModifiedForUser = useCallback(<M extends any>(path: string, partialCollection: LocalEntityCollection<M>) => {
        if (userConfigPersistence) {
            const currentStoredConfig = userConfigPersistence.getCollectionConfig(path);
            userConfigPersistence.onCollectionModified(path, mergeDeep(currentStoredConfig, partialCollection));
        }
    }, [userConfigPersistence]);

    const getCollectionOverride = useCallback(<M extends any>(path: string): LocalEntityCollection<M> | undefined => {
        if (!userConfigPersistence)
            return undefined
        const dynamicCollectionConfig = { ...userConfigPersistence.getCollectionConfig<M>(path) };
        delete dynamicCollectionConfig["schema"];
        return dynamicCollectionConfig;
    }, [userConfigPersistence]);

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
        buildUrlEditCollectionPath,
        buildCMSUrlPath,
    };
}


const getNavigation = async <UserType extends any>({
                                                       navigationOrBuilder,
                                                       configPersistence,
                                                       authController,
                                                       dateTimeFormat,
                                                       locale,
                                                       dataSource,
                                                       storageSource
                                                   }:
                                                       {
                                                           navigationOrBuilder?: Navigation | NavigationBuilder<UserType>,
                                                           configPersistence?: ConfigurationPersistence,
                                                           authController: AuthController<UserType>,
                                                           dateTimeFormat?: string,
                                                           locale?: Locale,
                                                           dataSource: DataSource,
                                                           storageSource: StorageSource
                                                       }
): Promise<ResolvedNavigation> => {

    if (!navigationOrBuilder && !configPersistence) {
        throw Error("You need to specify a navigation configuration or a `ConfigurationPersistence`");
    }

    let navigation: ResolvedNavigation | undefined;
    if (typeof navigationOrBuilder === "function") {
        navigation = await navigationOrBuilder({
            user: authController.user,
            authController,
            dateTimeFormat,
            locale,
            dataSource,
            storageSource
        });
    } else {
        navigation = navigationOrBuilder;
    }

    const fetchedCollections = configPersistence?.collections;
    if (fetchedCollections) {
        if (navigation) {
            // navigation.collections = populatedCollections.filter((col) => !navigation?.collections.map(c => c.path).includes(col.path));
            navigation.storedCollections = fetchedCollections.filter((col) => !navigation?.collections?.map(c => c.path).includes(col.path));
        } else {
            navigation = { storedCollections: fetchedCollections };
        }
    }

    if (!navigation) {
        throw Error("You need to specify a navigation configuration or a `ConfigurationPersistence`");
    }

    return navigation;
};


export function getSidePanelKey(path: string, entityId?: string) {
    if (entityId)
        return `${removeInitialAndTrailingSlashes(path)}/${removeInitialAndTrailingSlashes(entityId)}`;
    else
        return removeInitialAndTrailingSlashes(path);
}