import React, { useRef } from "react";
import {
    EntityCollection,
    EntityCollectionResolver,
    EntitySchema,
    EntitySchemaResolver,
    EntitySchemaResolverProps,
    NavigationContext,
    PartialEntityCollection,
    PartialProperties,
    SchemaConfig,
    SchemaConfigOverride,
    SchemaOverrideHandler,
    SchemaRegistryController
} from "../../models";
import { removeInitialAndTrailingSlashes } from "../util/navigation_utils";
import { computeProperties } from "../utils";
import { getValueInPath, mergeDeep } from "../util/objects";


export function useBuildSchemaRegistryController(
    navigationContext: NavigationContext,
    schemaOverrideHandler: SchemaOverrideHandler | undefined
): SchemaRegistryController {

    const initialised = navigationContext.navigation?.collections !== undefined;
    
    const schemaConfigRecord = useRef<Record<string, Partial<SchemaConfig> & { overrideSchemaRegistry?: boolean }>>({});

    const getSchemaConfig = <M extends any>(path: string, entityId?: string): SchemaConfig<M> => {

        const sidePanelKey = getSidePanelKey(path, entityId);

        let result: Partial<SchemaConfig> = {};

        const overriddenProps = schemaConfigRecord.current[sidePanelKey];
        const resolvedProps: SchemaConfigOverride | undefined = schemaOverrideHandler && schemaOverrideHandler({
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

        const entityCollection: EntityCollection | undefined = navigationContext.getCollection(path);
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

        if (!result.schemaResolver)
            throw Error(`Not able to resolve schema for ${sidePanelKey}`);

        return result as SchemaConfig;

    };

    const getCollectionResolver = <M extends any>(path: string): EntityCollectionResolver<M> => {
        const collection = navigationContext.getCollection<M>(path);

        if (!collection) {
            throw Error(`No collection found for path ${path}`);
        }

        const schemaConfig = getSchemaConfig<M>(path);
        if (!schemaConfig) {
            throw Error(`No schema config found for path ${path}`);
        }

        return { ...collection, ...schemaConfig };
    };

    const setOverride = ({
                             path,
                             entityId,
                             schemaConfig,
                             overrideSchemaRegistry
                         }: {
                             path: string,
                             entityId?: string,
                             schemaConfig?: SchemaConfigOverride
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

    const onCollectionModifiedForUser = <M extends any>(path: string, partialCollection: PartialEntityCollection<M>) => {
        navigationContext.onCollectionModifiedForUser(path, partialCollection);
    }

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

            const schemaOverride = navigationContext.getSchemaOverride(path);
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

    return {
        initialised,
        getSchemaConfig,
        getCollectionResolver,
        setOverride,
        removeAllOverridesExcept,
        onCollectionModifiedForUser
    };
}


export function getSidePanelKey(path: string, entityId?: string) {
    if (entityId)
        return `${removeInitialAndTrailingSlashes(path)}/${removeInitialAndTrailingSlashes(entityId)}`;
    else
        return removeInitialAndTrailingSlashes(path);
}
