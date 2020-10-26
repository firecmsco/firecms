import { Entity, EntityCollectionView, EntitySchema } from "./models";
import React, { useContext, useState } from "react";

const DEFAULT_SELECTED_ENTITY = {
    isOpen: false,
    tab: 0,
    entity: undefined,
    schema: undefined,
    subcollections: [],
    close: () => {
    },
    open: (props: {
        entity: Entity<any>;
        schema: EntitySchema;
        subcollections?: EntityCollectionView<any>[];
    }) => {
    }
};

export type SelectedEntity<S extends EntitySchema> = {
    isOpen: boolean;
    tab: number;
    entity?: Entity<S>;
    schema?: S;
    subcollections?: EntityCollectionView<any>[];
    close: () => void;
    open: (props: {
        entity: Entity<any>;
        schema: EntitySchema;
        subcollections?: EntityCollectionView<any>[];
    }) => void;
};

export const SelectedEntityContext = React.createContext<SelectedEntity<any>>(DEFAULT_SELECTED_ENTITY);
export const useSelectedEntityContext = () => useContext(SelectedEntityContext);

interface SelectedEntityProviderProps {
    children: React.ReactNode;
}

export const SelectedEntityProvider: React.FC<SelectedEntityProviderProps> = ({ children }) => {

    const [isOpen, setIsOpen] = useState(false);
    const [tab, setTab] = useState(0);
    const [entity, setEntity] = useState<Entity<any> | undefined>(undefined);
    const [schema, setSchema] = useState<EntitySchema | undefined>(undefined);
    const [subcollections, setSubcollections] = useState<EntityCollectionView<any>[] | undefined>(undefined);

    const close = () => {
        setIsOpen(false);
        setTab(0);
        setEntity(undefined);
        setSchema(undefined);
        setSubcollections(undefined);
    };

    const open = (props: {
        entity: Entity<any>;
        schema: EntitySchema,
        subcollections?: EntityCollectionView<any>[],
    }) => {
        const { entity, schema, subcollections } = props;
        setEntity(entity);
        setSchema(schema);
        setTab(0);
        setIsOpen(true);
        setSubcollections(subcollections);
    };

    return (
        <SelectedEntityContext.Provider
            value={{
                isOpen,
                tab,
                entity,
                schema,
                subcollections,
                close,
                open
            }}
        >
            {children}
        </SelectedEntityContext.Provider>
    );
};
