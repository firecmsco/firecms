import React, { useContext, useRef } from "react";
import { EntityCollection, EntitySchema } from "../models";
import { SchemaSidePanelProps } from "./model";
import { getCollectionViewFromPath } from "../routes/navigation";

const DEFAULT_SCHEMA_OVERRIDE_CONTROLLER = {
    /**
     * Get
     */
    get: (collectionPath: string) => null,

    /**
     * Set
     */
    set: (
        collectionPath: string,
        sidePanelProps: SchemaSidePanelProps | null
    ) => {
    }
};

export type SchemasOverrideRegistryController<S extends EntitySchema> = {
    /**
     * Get props for path
     */
    get: (collectionPath: string) => SchemaSidePanelProps | null;

    /**
     * Set props for path
     */
    set: (
        collectionPath: string,
        sidePanelProps: SchemaSidePanelProps | null
    ) => void;
};

export const SchemaOverrideRegistryContext = React.createContext<SchemasOverrideRegistryController<any>>(DEFAULT_SCHEMA_OVERRIDE_CONTROLLER);
export const useSchemaOverrideRegistry = () => useContext(SchemaOverrideRegistryContext);

interface ViewRegistryProviderProps {
    children: React.ReactNode;
}

export const SchemaOverrideRegistryProvider: React.FC<ViewRegistryProviderProps> = ({
                                                                                        children
                                                                                    }) => {

    const viewsRef = useRef<Record<string, SchemaSidePanelProps>>({});

    const get = (collectionPath: string): SchemaSidePanelProps | null => {
        return viewsRef.current[collectionPath];
    };

    const set = (
        collectionPath: string,
        sidePanelProps: SchemaSidePanelProps | null
    ) => {
        if (!sidePanelProps) {
            delete viewsRef.current[collectionPath];
        } else {
            viewsRef.current[collectionPath] = sidePanelProps;
        }
    };

    return (
        <SchemaOverrideRegistryContext.Provider
            value={{
                get,
                set
            }}
        >
            {children}
        </SchemaOverrideRegistryContext.Provider>
    );
};
