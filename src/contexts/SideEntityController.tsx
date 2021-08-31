import { EntityCollection, SchemaConfig } from "../models";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    getCMSPathFrom,
    getEntityOrCollectionPath,
    getEntityPath,
    getNavigationEntriesFromPathInternal,
    getRouterNewEntityPath,
    isCollectionPath,
    NavigationViewEntry
} from "../core/navigation";
import { SideEntityPanelProps } from "../models/side_panel";
import { useSchemasRegistry } from "./SchemaRegistry";
import { getSidePanelKey } from "./utils";

const DEFAULT_SIDE_ENTITY = {
    sidePanels: [],
    close: () => {
    },
    open: (props: SideEntityPanelProps & Partial<SchemaConfig>) => {
    }
};

export type { SideEntityPanelProps, SchemaConfig } ;

/**
 * Controller to open the side dialog displaying entity forms
 * @category Hooks and utilities
 */
export type SideEntityController<M extends { [Key: string]: any }> = {
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
     * navigation.
     * At least you need to pass the path of the entity you would like
     * to edit. You can set an entityId if you would like to edit and existing one
     * (or a new one with that id).
     * If you wish, you can also override the `SchemaSidePanelProps` and choose
     * to override the CMSApp level SchemaResolver.
     * @param props
     */
    open: (props: SideEntityPanelProps & Partial<SchemaConfig> & { overrideSchemaResolver?: boolean }) => void;
};


const SideEntityPanelsController = React.createContext<SideEntityController<any>>(DEFAULT_SIDE_ENTITY);

/**
 * Get a reference to the controller used to open side dialogs for entity
 * edition. You can open side panels using schemas specified in the general
 * navigation, overriding them using a `SchemaResolver` or explicitly
 * using the open method of this controller.
 *
 * Consider that in order to use this hook you need to have a parent
 * `CMSApp` or a `CMSAppProvider`
 *
 * @see SideEntityController
 * @category Hooks and utilities
 */
export const useSideEntityController = () => useContext(SideEntityPanelsController);

interface SideEntityProviderProps {
    children: React.ReactNode;
    collections?: EntityCollection[];
}

type ExtendedPanelProps = SideEntityPanelProps & {
    /**
     * If a custom schema or config is provided, it gets mapped with a key in the registry
     */
    sidePanelKey?: string;
};

export const SideEntityProvider: React.FC<SideEntityProviderProps> = ({
                                                                          children,
                                                                          collections
                                                                      }) => {

    const location = useLocation();

    const navigate = useNavigate();
    const initialised = useRef<boolean>(false);
    const [sidePanels, setSidePanels] = useState<ExtendedPanelProps[]>([]);

    const schemasRegistry = useSchemasRegistry();

    const basePathname = location.state && location.state["base_pathname"] ? location.state["base_pathname"] : location.pathname;

    useEffect(() => {
        if (schemasRegistry.initialised) {
            if (location?.state && location.state["panels"]) {
                const customSchemaKeys = (location.state["panels"] as ExtendedPanelProps[])
                    .map((e) => e.sidePanelKey)
                    .filter((k) => !!k) as string[];
                schemasRegistry.removeAllOverridesExcept(customSchemaKeys);
                setSidePanels(location.state["panels"]);
            } else {
                schemasRegistry.removeAllOverridesExcept([]);
                setSidePanels([]);
            }
        }
    }, [location?.state, schemasRegistry.initialised]);


    // only on initialisation
    useEffect(() => {
        if (collections && !initialised.current) {
            if (isCollectionPath(location.pathname)) {
                const newFlag = location.hash === "#new";
                const sidePanels = buildSidePanelsFromUrl(getEntityOrCollectionPath(location.pathname), collections, newFlag);
                setSidePanels(sidePanels);
            }
            initialised.current = true;
        }
    }, [location, collections]);

    const close = () => {

        if (sidePanels.length === 0)
            return;

        const lastSidePanel = sidePanels[sidePanels.length - 1];
        const locationPanels = location?.state && location.state["panels"];
        if (locationPanels && locationPanels.length > 0) {
            console.log("locationPanels.length > 0");
            navigate(-1);
        } else {
            console.log("locationPanels.length === 0");
            const newPath = getCMSPathFrom(lastSidePanel.path);
            navigate(newPath, { replace: true });
        }

    };

    const open = ({
                      path,
                      entityId,
                      selectedSubpath,
                      copy,
                      ...schemaProps
                  }: SideEntityPanelProps & Partial<SchemaConfig> & { overrideSchemaResolver?: boolean }) => {

        if (copy && !entityId) {
            throw Error("If you want to copy an entity you need to provide an entityId");
        }

        const sidePanelKey = getSidePanelKey(path, entityId);

        if (schemaProps
            && (schemaProps.schema !== undefined
                || schemaProps.permissions !== undefined
                || schemaProps.subcollections !== undefined)) {
            const permissions = schemaProps.permissions;
            const schema = schemaProps.schema;
            const subcollections = schemaProps.subcollections;
            const overrideSchemaResolver = schemaProps.overrideSchemaResolver;
            schemasRegistry.setOverride(
                sidePanelKey,
                { permissions, schema, subcollections },
                overrideSchemaResolver
            );
        }

        const newPath = entityId
            ? getEntityPath(entityId, path, selectedSubpath)
            : getRouterNewEntityPath(path);

        const lastSidePanel = sidePanels.length > 0 ? sidePanels[sidePanels.length - 1] : undefined;

        // If the side dialog is open currently, we update it
        if (entityId
            && lastSidePanel
            && lastSidePanel.path == path
            && lastSidePanel?.entityId === entityId) {

            const updatedPanel: ExtendedPanelProps = {
                ...lastSidePanel,
                sidePanelKey,
                selectedSubpath
            };
            navigate(
                getEntityPath(entityId, path, selectedSubpath),
                {
                    replace: true,
                    state: {
                        base_pathname: basePathname,
                        panels: [...sidePanels.slice(0, -1), updatedPanel]
                    }
                }
            );

        } else {
            const newPanel: ExtendedPanelProps = {
                path,
                entityId,
                copy: copy !== undefined && copy,
                sidePanelKey,
                selectedSubpath
            };
            navigate(
                newPath,
                {
                    state: {
                        base_pathname: basePathname,
                        panels: [...sidePanels, newPanel]
                    }
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

function buildSidePanelsFromUrl(path: string, allCollections: EntityCollection[], newFlag: boolean): ExtendedPanelProps[] {

    const navigationViewsForPath: NavigationViewEntry<any>[] = getNavigationEntriesFromPathInternal({
        path,
        allCollections
    });

    let sidePanels: ExtendedPanelProps[] = [];
    let lastCollectionPath = "";
    for (let i = 0; i < navigationViewsForPath.length; i++) {
        const navigationEntry = navigationViewsForPath[i];

        if (navigationEntry.type === "collection") {
            lastCollectionPath = navigationEntry.path;
        }

        if (i > 0) { // the first collection is handled by the main navigation
            const previousEntry = navigationViewsForPath[i - 1];
            if (navigationEntry.type === "entity") {
                if (previousEntry.type === "collection") {
                    sidePanels.push({
                            path: navigationEntry.relativePath,
                            entityId: navigationEntry.entityId,
                            copy: false
                        }
                    );
                }
            } else if (navigationEntry.type === "custom_view") {
                if (previousEntry.type === "entity") {
                    const lastSidePanel: ExtendedPanelProps = sidePanels[sidePanels.length - 1];
                    if (lastSidePanel)
                        lastSidePanel.selectedSubpath = navigationEntry.view.path;
                }
            } else if (navigationEntry.type === "collection") {
                if (previousEntry.type === "entity") {
                    const lastSidePanel: ExtendedPanelProps = sidePanels[sidePanels.length - 1];
                    if (lastSidePanel)
                        lastSidePanel.selectedSubpath = navigationEntry.collection.relativePath;
                }
            }
        }

    }

    if (newFlag) {
        sidePanels.push({
            path: lastCollectionPath,
            copy: false
        });
    }

    return sidePanels;
}
