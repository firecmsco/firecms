import React, { useContext, useRef } from "react";
import { EntityCollection, EntitySchema } from "../models";
import { SchemaSidePanelProps } from "./model";
import { getCollectionViewFromPath } from "../routes/navigation";

const DEFAULT_SIDE_ENTITY = {
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

export type SchemasRegistryPanelsController<S extends EntitySchema> = {
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

export const SchemasRegistryContext = React.createContext<SchemasRegistryPanelsController<any>>(DEFAULT_SIDE_ENTITY);
export const useSchemasRegistryController = () => useContext(SchemasRegistryContext);

interface ViewRegistryProviderProps {
    children: React.ReactNode;
    navigation: EntityCollection[];
}

export const SchemaOverrideRegistryProvider: React.FC<ViewRegistryProviderProps> = ({
                                                                                        children,
                                                                                        navigation
                                                                                    }) => {

    const viewsRef = useRef<Record<string, SchemaSidePanelProps>>({});

    const get = (collectionPath: string): SchemaSidePanelProps | null => {
        let props: SchemaSidePanelProps | null = viewsRef.current[collectionPath];
        if (!props) {
            const entityCollection: EntityCollection = getCollectionViewFromPath(collectionPath, navigation);
            const editEnabled = entityCollection.editEnabled == undefined || entityCollection.editEnabled;
            const schema = entityCollection.schema;
            const subcollections = entityCollection.subcollections;
            props = {
                editEnabled, schema, subcollections
            };
        }
        return props;
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
        <SchemasRegistryContext.Provider
            value={{
                get,
                set
            }}
        >
            {children}
        </SchemasRegistryContext.Provider>
    );
};
