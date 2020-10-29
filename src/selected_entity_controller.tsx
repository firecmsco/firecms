import { Entity, EntityCollectionView, EntitySchema } from "./models";
import React, { useContext } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { getEntityPathFrom } from "./routes/navigation";

const DEFAULT_SELECTED_ENTITY = {
    isOpen: false,
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

    const location = useLocation();
    const history = useHistory();

    const isOpen = !!(location.state && location.state["side_menu_locations"]);
    const sideMenuLocationsCount = location.state && location.state["side_menu_locations"] ? location.state["side_menu_locations"] : 0;
    const main_location = isOpen && location.state ? location.state["main_location"] : location;

    const close = () => {
        history.go(-sideMenuLocationsCount);
    };

    const open = (props: {
        entity: Entity<any>;
        schema: EntitySchema,
        subcollections?: EntityCollectionView<any>[],
    }) => {
        const { entity } = props;
        history.push(
            getEntityPathFrom(entity.reference.path),
            {
                main_location: main_location,
                side_menu_locations: sideMenuLocationsCount + 1
            }
        );
    };

    return (
        <SelectedEntityContext.Provider
            value={{
                isOpen,
                close,
                open
            }}
        >
            {children}
        </SelectedEntityContext.Provider>
    );
};
