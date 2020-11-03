import { EntitySchema } from "./models";
import React, { useContext } from "react";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { getEntityPath, getRouterNewEntityPath } from "./routes/navigation";

const DEFAULT_SELECTED_ENTITY = {
    isOpen: false,
    close: () => {
    },
    open: (props: {
        collectionPath: string,
        entityId: string
    }) => {
    },
    replace: (props: {
        collectionPath: string,
        entityId: string
    }) => {
    },
    openNew: (props: {
        collectionPath: string
    }) => {
    }
};

export type SelectedEntity<S extends EntitySchema> = {
    isOpen: boolean;
    close: () => void;
    open: (props: {
        collectionPath: string,
        entityId: string
    }) => void;
    replace: (props: {
        collectionPath: string,
        entityId: string
    }) => void;
    openNew: (props: {
        collectionPath: string,
    }) => void;
};

export const SelectedEntityContext = React.createContext<SelectedEntity<any>>(DEFAULT_SELECTED_ENTITY);
export const useSelectedEntityContext = () => useContext(SelectedEntityContext);

interface SelectedEntityProviderProps {
    children: React.ReactNode;
}

export const SelectedEntityProvider: React.FC<SelectedEntityProviderProps> = ({ children }) => {

    const location = useLocation();
    const history = useHistory();
    const { path, url } = useRouteMatch();

    const isOpen = !!(location.state && location.state["side_menu_locations"]);
    const sideMenuLocationsCount = location.state && location.state["side_menu_locations"] ? location.state["side_menu_locations"] : 0;
    const mainLocation = isOpen && location.state ? location.state["main_location"] : location;

    const close = () => {
        history.go(-sideMenuLocationsCount);
    };

    const open = (props: {
        collectionPath: string,
        entityId: string
    }) => {
        const { collectionPath, entityId } = props;
        history.push(
            getEntityPath(entityId, collectionPath),
            {
                main_location: mainLocation,
                main_path: path,
                main_url: url,
                side_menu_locations: sideMenuLocationsCount + 1
            }
        );
    };

    const replace = (props: {
        collectionPath: string,
        entityId: string
    }) => {
        const { collectionPath, entityId } = props;
        history.replace(
            getEntityPath(entityId, collectionPath),
            {
                main_location: mainLocation,
                main_path: path,
                main_url: url,
                side_menu_locations: sideMenuLocationsCount
            }
        );
    };

    const openNew = (props: {
        collectionPath: string,
    }) => {
        const { collectionPath } = props;
        history.push(
            getRouterNewEntityPath(collectionPath),
            {
                main_location: mainLocation,
                main_path: path,
                main_url: url,
                side_menu_locations: sideMenuLocationsCount + 1
            }
        );
    };

    return (
        <SelectedEntityContext.Provider
            value={{
                isOpen,
                close,
                open,
                replace,
                openNew
            }}
        >
            {children}
        </SelectedEntityContext.Provider>
    );
};
