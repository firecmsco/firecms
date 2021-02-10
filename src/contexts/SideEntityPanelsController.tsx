import { EntityCollection, EntitySchema } from "../models";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
    getCMSPathFrom,
    getCollectionViewsFromPath,
    getEntityOrCollectionPath,
    getEntityPath,
    getRouterNewEntityPath,
    isCollectionPath,
    NavigationEntry
} from "../routes/navigation";
import { SideEntityPanelProps, SchemaSidePanelProps } from "../side_dialog/model";
import { useSchemaOverrideRegistry } from "../side_dialog/SchemaOverrideRegistry";

const DEFAULT_SIDE_ENTITY = {
    sidePanels: [],
    close: () => {
    },
    open: (props: SideEntityPanelProps & Partial<SchemaSidePanelProps>) => {
    }
};

export type { SideEntityPanelProps, SchemaSidePanelProps } ;

export type SideEntityPanelsController<S extends EntitySchema> = {
    /**
     * Close the last panel
     */
    close: () => void;

    /**
     * List of side entity panels currently open
     */
    sidePanels: SideEntityPanelProps[];

    /**
     * Open a new entity sideDialog. By default, the schema and configuration
     * of the view is fetched from the collections you have specified in the
     * navigation
     * @param props
     */
    open: (props: SideEntityPanelProps & Partial<SchemaSidePanelProps>) => void;
};

const SideEntityPanelsController = React.createContext<SideEntityPanelsController<any>>(DEFAULT_SIDE_ENTITY);

/**
 * Get a reference to the controller used to open side dialogs for entity
 * edition.
 */
export const useSideEntityController = () => useContext(SideEntityPanelsController);

interface SideEntityProviderProps {
    children: React.ReactNode;
    navigation: EntityCollection[];
}

export const SideEntityProvider: React.FC<SideEntityProviderProps> = ({
                                                                          children,
                                                                          navigation
                                                                      }) => {

    const location: any = useLocation();
    const history = useHistory();
    const initialised = useRef<boolean>(false);
    const [sidePanels, setSidePanels] = useState<SideEntityPanelProps[]>([]);

    const schemaOverrideRegistry = useSchemaOverrideRegistry();

    const mainLocation = location.state && location.state["main_location"] ? location.state["main_location"] : location;

    useEffect(() => {
        return history.listen((location: any, action) => {
            if (location?.state && location.state["panels"]) {
                setSidePanels(location.state["panels"]);
            } else {
                setSidePanels([]);
            }
        });
    }, [history]);

    useEffect(() => {
        if (!initialised.current) {
            if (isCollectionPath(location.pathname)) {
                const newFlag = location.hash === "#new";
                const sidePanelsFromUrl = buildSidePanelsFromUrl(getEntityOrCollectionPath(location.pathname), navigation, newFlag);
                setSidePanels(sidePanelsFromUrl);
            }
            initialised.current = true;
        }
    }, [location]);

    const close = () => {

        if (sidePanels.length === 0)
            return;

        const lastSidePanel = sidePanels[sidePanels.length - 1];
        const locationPanels = location?.state && location.state["panels"];
        if (locationPanels && locationPanels.length > 0) {
            history.go(-1);
        } else {
            const newPath = getCMSPathFrom(lastSidePanel.collectionPath);
            history.replace(newPath);
        }

        schemaOverrideRegistry.set(lastSidePanel.collectionPath, null);
    };

    const open = ({
                      collectionPath,
                      entityId,
                      selectedSubcollection,
                      copy,
                      ...schemaProps
                  }: SideEntityPanelProps & Partial<SchemaSidePanelProps>) => {

        if (copy && !entityId) {
            throw Error("If you want to copy an entity you need to provide an entityId");
        }

        if (schemaProps && Object.keys(schemaProps).length > 0) {
            schemaOverrideRegistry.set(collectionPath, schemaProps as SchemaSidePanelProps);
        }

        const newPath = entityId
            ? getEntityPath(entityId, collectionPath, selectedSubcollection)
            : getRouterNewEntityPath(collectionPath);

        const lastSidePanel = sidePanels.length > 0 ? sidePanels[sidePanels.length - 1] : undefined;

        // If the side dialog is open currently, we update it
        if (entityId && lastSidePanel && lastSidePanel?.entityId === entityId) {
            const updatedPanel: SideEntityPanelProps = {
                ...lastSidePanel,
                selectedSubcollection
            };
            history.replace(
                getEntityPath(entityId, collectionPath, selectedSubcollection),
                {
                    main_location: mainLocation,
                    panels: [...sidePanels.slice(0, -1), updatedPanel]
                }
            );

        } else {
            const newPanel: SideEntityPanelProps = {
                collectionPath,
                entityId,
                copy: copy !== undefined && copy,
                selectedSubcollection
            };
            history.push(
                newPath,
                {
                    main_location: mainLocation,
                    panels: [...sidePanels, newPanel]
                }
            );
        }
    };

    return (
        <SideEntityPanelsController.Provider
            value={{
                sidePanels,
                close,
                open
            }}
        >
            {children}
        </SideEntityPanelsController.Provider>
    );
};

function buildSidePanelsFromUrl(path: string, allCollections: EntityCollection[], newFlag: boolean): SideEntityPanelProps[] {

    const navigationViewsForPath: NavigationEntry[] = getCollectionViewsFromPath(path, allCollections);

    let fullPath: string = "";
    let sidePanels: SideEntityPanelProps[] = [];
    for (let i = 0; i < navigationViewsForPath.length; i++) {
        const navigationEntry = navigationViewsForPath[i];

        if (navigationEntry.type === "collection") {
            fullPath += "/" + navigationEntry.collection.relativePath;
        }
        if (i > 0) { // the first collection is handled by the main navigation
            const previousEntry = navigationViewsForPath[i - 1];
            if (navigationEntry.type === "entity") {
                if (previousEntry.type === "collection") {
                    sidePanels.push({
                            collectionPath: fullPath,
                            entityId: navigationEntry.entityId,
                            copy: false
                        }
                    );
                }
            } else if (navigationEntry.type === "collection") {
                const lastSidePanel: SideEntityPanelProps = sidePanels[sidePanels.length - 1];
                if (lastSidePanel)
                    lastSidePanel.selectedSubcollection = navigationEntry.collection.relativePath;
            }
        }
        if (navigationEntry.type === "entity") {
            fullPath += "/" + navigationEntry.entityId;
        }

    }

    if (newFlag) {
        sidePanels.push({
            collectionPath: fullPath,
            copy: false
        });
    }

    return sidePanels;
}
