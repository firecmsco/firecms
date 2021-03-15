import React, { useContext, useRef } from "react";
import { EntityCollection } from "../models";
import { getSidePanelKey, SchemaResolver, SchemaSidePanelProps } from "./model";
import {
    getCollectionViewFromPath,
    removeInitialAndTrailingSlashes
} from "../routes/navigation";

const DEFAULT_SCHEMA_CONTROLLER = {
    getSchema: (collectionPath: string, entityId?: string) => undefined,
    getCollectionConfig: (collectionPath: string, entityId?: string) => {
        throw Error("Reached wrong implementation");
    },
    removeAllOverridesExcept: (keys: string[]) => {
    },
    setOverride: (
        entityPath: string,
        sidePanelProps: Partial<SchemaSidePanelProps> | null
    ) => {
        throw Error("Reached wrong implementation");
    }
};

export type SchemasRegistryController = {
    /**
     * Get props for path
     */
    getSchema: (collectionPath: string, entityId?: string) => SchemaSidePanelProps | undefined;

    /**
     * Get props for path
     */
    getCollectionConfig: (collectionPath: string, entityId?: string) => EntityCollection | undefined;

    /**
     * Set props for path
     * @return used key
     */
    setOverride: (
        entityPath: string,
        sidePanelProps: Partial<SchemaSidePanelProps> | null,
        overrideSchemaResolver?: boolean
    ) => string | undefined;

    /**
     * Remove all keys not used
     * @param used keys
     */
    removeAllOverridesExcept: (
        keys: string[]
    ) => void;
};

export const SchemaRegistryContext = React.createContext<SchemasRegistryController>(DEFAULT_SCHEMA_CONTROLLER);
export const useSchemasRegistry = () => useContext(SchemaRegistryContext);

interface ViewRegistryProviderProps {
    children: React.ReactNode;
    collections: EntityCollection[];
    schemaResolver?: SchemaResolver;
}

export const SchemaRegistryProvider: React.FC<ViewRegistryProviderProps> = ({
                                                                                children,
                                                                                collections,
                                                                                schemaResolver
                                                                            }) => {

    const viewsRef = useRef<Record<string, Partial<SchemaSidePanelProps & { overrideSchemaResolver?: boolean }>>>({});

    const getSchema = (collectionPath: string, entityId?: string): SchemaSidePanelProps => {
        const sidePanelKey = getSidePanelKey(collectionPath, entityId);

        let result: Partial<SchemaSidePanelProps> = {};
        const overriddenProps = viewsRef.current[sidePanelKey];
        const resolvedProps: SchemaSidePanelProps | undefined = schemaResolver && schemaResolver({
            entityId,
            collectionPath: removeInitialAndTrailingSlashes(collectionPath)
        });

        if (resolvedProps)
            result = resolvedProps;

        if (overriddenProps) {
            // override schema resolver default to true
            const shouldOverrideResolver = overriddenProps.overrideSchemaResolver === undefined || overriddenProps.overrideSchemaResolver;
            if (shouldOverrideResolver)
                result = { ...result, ...overriddenProps };
            else
                result = { ...overriddenProps, ...result };

        }

        const entityCollection: EntityCollection | undefined = getCollectionViewFromPath(collectionPath, collections);
        if (entityCollection) {
            const schema = entityCollection.schema;
            const subcollections = entityCollection.subcollections;
            result = { ...{ schema, subcollections }, ...result };
        }

        if (!result.schema)
            throw Error(`Not able to resolve schema for ${sidePanelKey}`);

        return result as SchemaSidePanelProps;

    };

    const getCollectionConfig = (collectionPath: string, entityId?: string) => {
        return getCollectionViewFromPath(collectionPath, collections);
    };

    const setOverride = (
        entityPath: string,
        sidePanelProps: Partial<SchemaSidePanelProps> | null,
        overrideSchemaResolver?: boolean
    ) => {
        if (!sidePanelProps) {
            delete viewsRef.current[entityPath];
            return undefined;
        } else {
            viewsRef.current[entityPath] = { ...sidePanelProps, overrideSchemaResolver };
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

    return (
        <SchemaRegistryContext.Provider
            value={{
                getSchema,
                getCollectionConfig,
                setOverride,
                removeAllOverridesExcept
            }}
        >
            {children}
        </SchemaRegistryContext.Provider>
    );
};
