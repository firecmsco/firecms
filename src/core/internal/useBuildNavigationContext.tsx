import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    AuthController,
    DataSource,
    EntityCollection,
    EntityCollectionResolver,
    EntitySchema,
    EntitySchemaResolver,
    EntitySchemaResolverProps,
    Locale,
    LocalEntityCollection,
    LocalEntitySchema,
    Navigation,
    NavigationBuilder,
    NavigationContext,
    ResolvedNavigation,
    SchemaOverrideHandler,
    StorageSource,
    UserConfigurationPersistence
} from "../../models";
import {
    getCollectionByPath,
    removeInitialAndTrailingSlashes
} from "../util/navigation_utils";
import { getValueInPath, mergeDeep } from "../util/objects";
import { computeProperties, findSchema } from "../utils";
import { ConfigurationPersistence } from "../../models/config_persistence";

export function useBuildNavigationContext<UserType>({
                                                        basePath,
                                                        baseCollectionPath,
                                                        authController,
                                                        navigationOrBuilder,
                                                        schemas: baseSchemas = [],
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
    schemas?: EntitySchema[];
    navigationOrBuilder?: Navigation | NavigationBuilder<UserType>;
    schemaOverrideHandler: SchemaOverrideHandler | undefined;
    dateTimeFormat?: string;
    locale?: Locale;
    dataSource: DataSource;
    storageSource: StorageSource;
    configPersistence?: ConfigurationPersistence;
    userConfigPersistence?: UserConfigurationPersistence;
}): NavigationContext {

    const [navigation, setNavigation] = useState<ResolvedNavigation | undefined>(undefined);
    const [schemas, setSchemas] = useState<EntitySchema[]>(baseSchemas);
    const [navigationLoading, setNavigationLoading] = useState<boolean>(true);
    const [persistenceLoading, setPersistenceLoading] = useState<boolean>(true);
    const [navigationLoadingError, setNavigationLoadingError] = useState<Error | undefined>(undefined);

    const schemaConfigRecord = useRef<Record<string, Partial<EntityCollectionResolver> & { overrideSchemaRegistry?: boolean }>>({});
    const cleanBasePath = removeInitialAndTrailingSlashes(basePath);
    const cleanBaseCollectionPath = removeInitialAndTrailingSlashes(baseCollectionPath);

    const homeUrl = cleanBasePath ? `/${cleanBasePath}` : "/";

    const fullCollectionPath = cleanBasePath ? `/${cleanBasePath}/${cleanBaseCollectionPath}` : `/${cleanBaseCollectionPath}`;

    const initialised = navigation?.collections !== undefined;

    const [resolvedUserNavigation, setResolvedUserNavigation] = useState<ResolvedNavigation | undefined>();

    useEffect(() => {
        if (!authController.canAccessMainView) {
            return;
        }
        setNavigationLoading(true);
        resolveNavigation({
            navigationOrBuilder,
            authController,
            dateTimeFormat,
            locale,
            dataSource,
            storageSource
        }).then((res) => {
            setNavigationLoading(false);
            setResolvedUserNavigation(res);
        }).catch(e => {
            setNavigationLoading(false);
            setNavigationLoadingError(e);
        });
    }, [
        authController.user,
        authController.canAccessMainView,
        navigationOrBuilder
    ]);

    useEffect(() => {
        if (!configPersistence || (!configPersistence.collections && configPersistence.loading)) {
            return;
        }

        if (!navigation) {
            setPersistenceLoading(true);
        }

        getNavigation({
            navigation: resolvedUserNavigation,
            configPersistence
        }).then((result: ResolvedNavigation) => {
            setNavigation(result);
            setPersistenceLoading(false);
        }).catch(e => {
            setPersistenceLoading(false);
            setNavigationLoadingError(e);
        });
    }, [
        resolvedUserNavigation,
        configPersistence?.collections
    ]);

    useEffect(() => {
        if (!configPersistence?.schemas)
            return;

        const baseSchemasMerged = baseSchemas.map((baseSchema) => {
            const modifiedSchema = configPersistence.schemas?.find((schema) => schema.id === baseSchema.id);
            if (!modifiedSchema) {
                return baseSchema;
            } else {
                return mergeDeep(modifiedSchema, baseSchema);
            }
        });

        const mergedIds = baseSchemasMerged.map(s => s.id);
        setSchemas([
            ...configPersistence.schemas.filter((schema) => !mergedIds.includes(schema.id)),
            ...baseSchemasMerged,
        ]);
    }, [
        configPersistence?.schemas
    ]);

    const getUserSchemaOverride = useCallback(<M extends any>(path: string): LocalEntitySchema<M> | undefined => {
        if (!userConfigPersistence)
            return undefined
        return userConfigPersistence.getSchemaConfig<M>(path);
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

            const schemaOverride = getUserSchemaOverride<M>(path);
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
        }, [getUserSchemaOverride]);


    const getCollectionResolver = useCallback(<M extends { [Key: string]: any }>(
        path: string,
        entityId?: string,
        collection?: EntityCollection<M>
    ): EntityCollectionResolver<M> => {

        const collections = [
            ...(navigation?.collections ?? []),
            ...(navigation?.storedCollections ?? [])
        ];

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
            const schema = findSchema(resolvedCollection.schemaId, schemas);
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
            if (!result.schemaId)
                throw Error(`Not able to resolve schema for ${sidePanelKey}`);
            result.schemaResolver = buildSchemaResolver({
                schema: findSchema(result.schemaId, schemas),
                path
            });
        }

        return { ...resolvedCollection, ...(result as EntityCollectionResolver<M>) };

    }, [
        navigation,
        basePath,
        schemas,
        baseCollectionPath,
        schemaOverrideHandler,
        schemaConfigRecord.current,
        buildSchemaResolver
    ]);

    const isUrlCollectionPath = useCallback(
        (path: string): boolean => removeInitialAndTrailingSlashes(path + "/").startsWith(removeInitialAndTrailingSlashes(fullCollectionPath) + "/"),
        [fullCollectionPath]);

    const urlPathToDataPath = useCallback((path: string): string => {
        if (path.startsWith(fullCollectionPath))
            return path.replace(fullCollectionPath, "");
        throw Error("Expected path starting with " + fullCollectionPath);
    }, [fullCollectionPath]);

    const buildUrlEditCollectionPath = useCallback(({
                                                        path
                                                    }: { path?: string }): string => {
            if (path)
                return `${baseCollectionPath}/edit/${removeInitialAndTrailingSlashes(path)}`;
            else
                return `newcollection`;
        }, //
        [baseCollectionPath]);

    const buildUrlEditSchemaPath = useCallback(({
                                                    id
                                                }: { id?: string }): string => {
            if (id)
                return `s/edit/${removeInitialAndTrailingSlashes(id)}`;
            else
                return `newschema`;
        }, //
        [baseCollectionPath]);

    const buildUrlCollectionPath = useCallback((path: string): string => `${baseCollectionPath}/${removeInitialAndTrailingSlashes(path)}`,
        [baseCollectionPath]);

    const buildCMSUrlPath = useCallback((path: string): string => cleanBasePath ? `/${cleanBasePath}/${removeInitialAndTrailingSlashes(path)}` : `/${path}`,
        [cleanBasePath]);


    const getCollectionOverride = useCallback(<M extends any>(path: string): LocalEntityCollection<M> | undefined => {
        if (!userConfigPersistence)
            return undefined
        return userConfigPersistence.getCollectionConfig<M>(path);
    }, [userConfigPersistence]);

    return {
        navigation,
        loading: navigationLoading || persistenceLoading,
        navigationLoadingError,
        schemas,
        homeUrl,
        basePath,
        baseCollectionPath,
        initialised,
        getCollectionResolver,
        isUrlCollectionPath,
        urlPathToDataPath,
        buildUrlCollectionPath,
        buildUrlEditCollectionPath,
        buildUrlEditSchemaPath,
        buildCMSUrlPath,
    };
}


async function resolveNavigation<UserType = any>({
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
                                                     }): Promise<ResolvedNavigation | undefined> {
    if (typeof navigationOrBuilder === "function") {
        return navigationOrBuilder({
            user: authController.user,
            authController,
            dateTimeFormat,
            locale,
            dataSource,
            storageSource
        });
    } else {
        return navigationOrBuilder;
    }
}

const getNavigation = async <UserType extends any>({
                                                       navigation,
                                                       configPersistence
                                                   }:
                                                       {
                                                           navigation?: ResolvedNavigation,
                                                           configPersistence?: ConfigurationPersistence
                                                       }
): Promise<ResolvedNavigation> => {

    if (!navigation && !configPersistence) {
        throw Error("You need to specify a navigation configuration or a `ConfigurationPersistence`");
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