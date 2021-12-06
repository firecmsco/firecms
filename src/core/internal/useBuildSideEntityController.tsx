import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    EntityCollection,
    NavigationContext,
    SchemaRegistryController,
    SideEntityController,
    SideEntityPanelProps
} from "../../models";
import {
    getNavigationEntriesFromPathInternal,
    NavigationViewInternal
} from "../util/navigation_from_path";
import { useLocation, useNavigate } from "react-router-dom";
import { removeInitialAndTrailingSlashes } from "../util/navigation_utils";

const NEW_URL_HASH = "new";

export const useBuildSideEntityController = (navigationContext: NavigationContext, schemaRegistry: SchemaRegistryController): SideEntityController => {

    const location = useLocation();
    const navigate = useNavigate();
    const initialised = useRef<boolean>(false);
    const [sidePanels, setSidePanels] = useState<SideEntityPanelProps[]>([]);

    const collections = navigationContext.navigation?.collections;

    const baseLocation = location.state && location.state["base_location"] ? location.state["base_location"] : location;

    const updatePanels = useCallback((newPanels: SideEntityPanelProps[]) => {
        setSidePanels(newPanels);
        schemaRegistry.removeAllOverridesExcept(newPanels);
    }, []);

    useEffect(() => {
        if (schemaRegistry.initialised) {
            if (location?.state && location.state["panels"]) {
                const statePanel = location.state["panels"] as SideEntityPanelProps[];
                updatePanels(statePanel);
            } else {
                updatePanels([]);
            }
        }
    }, [location?.state, schemaRegistry.initialised]);

    // only on initialisation
    useEffect(() => {
        if (collections && !initialised.current) {
            if (navigationContext.isCollectionPath(location.pathname)) {
                const newFlag = location.hash === `#${NEW_URL_HASH}`;
                const entityOrCollectionPath = navigationContext.getEntityOrCollectionPath(location.pathname);
                const sidePanels = buildSidePanelsFromUrl(entityOrCollectionPath, collections, newFlag);
                updatePanels(sidePanels);
            }
            initialised.current = true;
        }
    }, [location, collections, sidePanels]);

    const close = useCallback(() => {

        if (sidePanels.length === 0)
            return;

        const lastSidePanel = sidePanels[sidePanels.length - 1];
        const locationPanels = location?.state && location.state["panels"];
        if (locationPanels && locationPanels.length > 0) {
            const updatedPanels = [...locationPanels.slice(0, -1)];
            // setSidePanels(updatedPanels);
            navigate(-1);
        } else {
            const newPath = navigationContext.buildCollectionPath(lastSidePanel.path);
            // setSidePanels([]);
            navigate(newPath, { replace: true });
        }

    }, [sidePanels, location]);

    const open = useCallback(({
                      path,
                      entityId,
                      selectedSubpath,
                      copy,
                      width,
                      ...schemaProps
                  }: SideEntityPanelProps ) => {

        if (copy && !entityId) {
            throw Error("If you want to copy an entity you need to provide an entityId");
        }

        if (schemaProps
            && (schemaProps.schema !== undefined
                || schemaProps.permissions !== undefined
                || schemaProps.subcollections !== undefined)) {
            const permissions = schemaProps.permissions;
            const schemaOrResolver = schemaProps.schema;
            const subcollections = schemaProps.subcollections;
            const overrideSchemaRegistry = schemaProps.overrideSchemaRegistry;
            schemaRegistry.setOverride(
                {
                    path,
                    entityId,
                    schemaConfig: {
                        permissions,
                        schema: schemaOrResolver,
                        subcollections
                    },
                    overrideSchemaRegistry
                }
            );
        }

        const cleanPath = removeInitialAndTrailingSlashes(path);
        const newPath = entityId
            ? navigationContext.buildCollectionPath(`${cleanPath}/${entityId}/${selectedSubpath ? selectedSubpath : ""}`)
            : navigationContext.buildCollectionPath(`${cleanPath}#${NEW_URL_HASH}`);

        const lastSidePanel = sidePanels.length > 0 ? sidePanels[sidePanels.length - 1] : undefined;

        // If the side dialog is open currently, we update it
        if (entityId
            && lastSidePanel
            && lastSidePanel.path == path
            && lastSidePanel?.entityId === entityId) {

            const updatedPanel: SideEntityPanelProps = {
                ...lastSidePanel,
                selectedSubpath
            };
            const updatedPanels = [...sidePanels.slice(0, -1), updatedPanel];
            updatePanels(updatedPanels);
            navigate(
                navigationContext.buildCollectionPath(`${cleanPath}/${entityId}/${selectedSubpath ? selectedSubpath : ""}`),
                {
                    replace: true,
                    state: {
                        base_location: baseLocation,
                        panels: updatedPanels
                    }
                }
            );

        } else {
            const newPanel: SideEntityPanelProps = {
                path,
                entityId,
                copy: copy !== undefined && copy,
                width,
                selectedSubpath
            };
            const updatedPanels = [...sidePanels, newPanel];
            updatePanels(updatedPanels);
            navigate(
                newPath,
                {
                    state: {
                        base_location: baseLocation,
                        panels: updatedPanels
                    }
                }
            );
        }
    }, [sidePanels, location]);

    return {
        sidePanels,
        close,
        open
    };
};

function buildSidePanelsFromUrl(path: string, collections: EntityCollection[], newFlag: boolean): SideEntityPanelProps[] {

    const navigationViewsForPath: NavigationViewInternal<any>[] = getNavigationEntriesFromPathInternal({
        path,
        collections
    });

    let sidePanels: SideEntityPanelProps[] = [];
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
                            path: navigationEntry.path,
                            entityId: navigationEntry.entityId,
                            copy: false
                        }
                    );
                }
            } else if (navigationEntry.type === "custom_view") {
                if (previousEntry.type === "entity") {
                    const lastSidePanel: SideEntityPanelProps = sidePanels[sidePanels.length - 1];
                    if (lastSidePanel)
                        lastSidePanel.selectedSubpath = navigationEntry.view.path;
                }
            } else if (navigationEntry.type === "collection") {
                if (previousEntry.type === "entity") {
                    const lastSidePanel: SideEntityPanelProps = sidePanels[sidePanels.length - 1];
                    if (lastSidePanel)
                        lastSidePanel.selectedSubpath = navigationEntry.collection.path;
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
