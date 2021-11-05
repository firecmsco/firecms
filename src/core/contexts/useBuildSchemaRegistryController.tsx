import React, { useRef } from "react";
import {
    EntityCollection,
    NavigationContext,
    SchemaConfig,
    SchemaResolver
} from "../../models";
import {
    getCollectionViewFromPath,
    removeInitialAndTrailingSlashes
} from "../util/navigation_utils";
import { getSidePanelKey } from "./utils";


export function useBuildSchemaRegistryController(navigationContext: NavigationContext, schemaResolver: SchemaResolver | undefined) {

    const collections = navigationContext.navigation?.collections;
    const initialised = collections !== undefined;
    const viewsRef = useRef<Record<string, Partial<SchemaConfig & { overrideSchemaResolver?: boolean }>>>({});

    const getSchemaConfig = (path: string, entityId?: string): SchemaConfig => {

        const sidePanelKey = getSidePanelKey(path, entityId);

        let result: Partial<SchemaConfig> = {};
        const overriddenProps = viewsRef.current[sidePanelKey];
        const resolvedProps: SchemaConfig | undefined = schemaResolver && schemaResolver({
            entityId,
            path: removeInitialAndTrailingSlashes(path)
        });

        if (resolvedProps)
            result = resolvedProps;

        if (overriddenProps) {
            // override schema resolver default to true
            const shouldOverrideResolver = overriddenProps.overrideSchemaResolver === undefined || overriddenProps.overrideSchemaResolver;
            if (shouldOverrideResolver)
                result = {
                    ...overriddenProps,
                    permissions: result.permissions || overriddenProps.permissions,
                    schema: result.schema || overriddenProps.schema,
                    subcollections: result.subcollections || overriddenProps.subcollections,
                    callbacks: result.callbacks || overriddenProps.callbacks
                };
            else
                result = {
                    ...result,
                    permissions: overriddenProps.permissions ?? result.permissions,
                    schema: overriddenProps.schema ?? result.schema,
                    subcollections: overriddenProps.subcollections ?? result.subcollections,
                    callbacks: overriddenProps.callbacks ?? result.callbacks
                };

        }

        const entityCollection: EntityCollection | undefined = getCollectionViewFromPath(path, collections);
        if (entityCollection) {
            const schema = entityCollection.schema;
            const subcollections = entityCollection.subcollections;
            const callbacks = entityCollection.callbacks;
            const permissions = entityCollection.permissions;
            result = {
                ...result,
                schema: result.schema ?? schema,
                subcollections: result.subcollections ?? subcollections,
                callbacks: result.callbacks ?? callbacks,
                permissions: result.permissions ?? permissions
            };
        }

        if (!result.schema)
            throw Error(`Not able to resolve schema for ${sidePanelKey}`);

        return result as SchemaConfig;

    };

    const getCollectionConfig = (path: string, entityId?: string) => {
        return getCollectionViewFromPath(path, collections);
    };

    const setOverride = (
        entityPath: string,
        schemaConfig: Partial<SchemaConfig> | null,
        overrideSchemaResolver?: boolean
    ) => {
        if (!schemaConfig) {
            delete viewsRef.current[entityPath];
            return undefined;
        } else {
            viewsRef.current[entityPath] = {
                ...schemaConfig,
                overrideSchemaResolver
            };
            return entityPath;
        }
    };

    const removeAllOverridesExcept = (
        keys: string[]
    ) => {
        Object.keys(viewsRef.current).forEach((currentKey) => {
            if (!keys.includes(currentKey))
                delete viewsRef.current[currentKey];
        });
    };

    return {
        initialised,
        getSchemaConfig,
        getCollectionConfig,
        setOverride,
        removeAllOverridesExcept
    };
}


