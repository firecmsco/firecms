import { EntitySchema } from "../models";
import React, { useContext } from "react";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import {
    getEntityCopyPath,
    getEntityPath,
    getRouterNewEntityPath
} from "../routes/navigation";
import * as H from "history";

const DEFAULT_SELECTED_ENTITY = {
    sideLocations: [],
    close: () => {
    },
    open: (props: {
        collectionPath: string,
        entityId?: string,
        copy?: boolean
    }) => {
    },
    replace: (props: {
        collectionPath: string,
        entityId: string,
        subcollection?: string
    }) => {
    }
};

export type SelectedEntity<S extends EntitySchema> = {
    close: () => void;
    sideLocations: H.Location[];
    open: (props: {
        collectionPath: string,
        entityId?: string,
        copy?: boolean
    }) => void;
    replace: (props: {
        collectionPath: string,
        entityId: string,
        subcollection?: string
    }) => void;
};

export const SelectedEntityContext = React.createContext<SelectedEntity<any>>(DEFAULT_SELECTED_ENTITY);
export const useSelectedEntityContext = () => useContext(SelectedEntityContext);

interface SelectedEntityProviderProps {
    children: React.ReactNode;
}

export const SelectedEntityProvider: React.FC<SelectedEntityProviderProps> = ({ children }) => {

    const location: any = useLocation();
    const history = useHistory();
    const { path, url } = useRouteMatch();

    const sideLocations = location.state && location.state["side_menu_locations"] ? location.state["side_menu_locations"] : [];
    const isOpen = !!(location.state && sideLocations.length);
    const mainLocation = isOpen && location.state ? location.state["main_location"] : location;

    const close = () => {
        history.go(-1);
    };

    const open = (props: {
        collectionPath: string,
        entityId?: string,
        copy?: boolean
    }) => {
        const { collectionPath, entityId, copy } = props;
        if (copy && !entityId) {
            throw  Error("When copying an entity you need an entityId");
        }
        const newPath = copy && entityId ? getEntityCopyPath(entityId, collectionPath) : (
            entityId ? getEntityPath(entityId, collectionPath) : getRouterNewEntityPath(collectionPath)
        );
        const thisLocation = {
            pathname: newPath
        };
        history.push(
            newPath,
            {
                main_location: mainLocation,
                main_path: path,
                main_url: url,
                side_menu_locations: [...sideLocations, thisLocation]
            }
        );
    };

    const replace = (props: {
        collectionPath: string,
        entityId: string,
        subcollection?: string
    }) => {
        const { collectionPath, entityId, subcollection } = props;
        const thisLocation = {
            pathname: getEntityPath(entityId, collectionPath),
            subcollection: subcollection
        };
        history.replace(
            getEntityPath(entityId, collectionPath, subcollection),
            {
                main_location: mainLocation,
                main_path: path,
                main_url: url,
                side_menu_locations: [...[...sideLocations].slice(0, -1), thisLocation]
            }
        );
    };

    return (
        <SelectedEntityContext.Provider
            value={{
                sideLocations,
                close,
                open,
                replace
            }}
        >
            {children}
        </SelectedEntityContext.Provider>
    );
};
