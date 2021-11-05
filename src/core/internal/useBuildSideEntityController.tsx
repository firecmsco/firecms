import {
    EntityCollection,
    NavigationContext,
    SchemaConfig,
    SchemaRegistryController,
    SideEntityController,
    SideEntityPanelProps
} from "../../models";
import {
    getNavigationEntriesFromPathInternal,
    NavigationViewInternal
} from "../util/navigation_from_path";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getSidePanelKey } from "../contexts/utils";
import { removeInitialAndTrailingSlashes } from "../util/navigation_utils";


const NEW_URL_HASH = "new";

type ExtendedPanelProps = SideEntityPanelProps & {
    /**
     * If a custom schema or config is provided, it gets mapped with a key in the registry
     */
    sidePanelKey?: string;
};


export const useBuildSideEntityController = (navigationContext: NavigationContext, schemaRegistryController: SchemaRegistryController): SideEntityController => {

    const location = useLocation();
    const navigate = useNavigate();
    const initialised = useRef<boolean>(false);
    const [sidePanels, setSidePanels] = useState<ExtendedPanelProps[]>([]);

    const collections = navigationContext.navigation?.collections;

    const baseLocation = location.state && location.state["base_location"] ? location.state["base_location"] : location;

    useEffect(() => {
        if (schemaRegistryController.initialised) {
            if (location?.state && location.state["panels"]) {
                const customSchemaKeys = (location.state["panels"] as ExtendedPanelProps[])
                    .map((e) => e.sidePanelKey)
                    .filter((k) => !!k) as string[];
                schemaRegistryController.removeAllOverridesExcept(customSchemaKeys);
                setSidePanels(location.state["panels"]);
            } else {
                schemaRegistryController.removeAllOverridesExcept([]);
                setSidePanels([]);
            }
        }
    }, [location?.state, schemaRegistryController.initialised]);

    // only on initialisation
    useEffect(() => {
        if (collections && !initialised.current) {
            if (navigationContext.isCollectionPath(location.pathname)) {
                const newFlag = location.hash === `#${NEW_URL_HASH}`;
                const entityOrCollectionPath = navigationContext.getEntityOrCollectionPath(location.pathname);
                const sidePanels = buildSidePanelsFromUrl(entityOrCollectionPath, collections, newFlag);
                setSidePanels(sidePanels);
            }
            initialised.current = true;
        }
    }, [location, collections, navigationContext]);

    const close = () => {

        if (sidePanels.length === 0)
            return;

        const lastSidePanel = sidePanels[sidePanels.length - 1];
        const locationPanels = location?.state && location.state["panels"];
        if (locationPanels && locationPanels.length > 0) {
            navigate(-1);
        } else {
            const newPath = navigationContext.buildCollectionPath(lastSidePanel.path);
            setSidePanels([]);
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
            schemaRegistryController.setOverride(
                sidePanelKey,
                { permissions, schema, subcollections },
                overrideSchemaResolver
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

            const updatedPanel: ExtendedPanelProps = {
                ...lastSidePanel,
                sidePanelKey,
                selectedSubpath
            };
            navigate(
                navigationContext.buildCollectionPath(`${cleanPath}/${entityId}/${selectedSubpath ? selectedSubpath : ""}`),
                {
                    replace: true,
                    state: {
                        base_location: baseLocation,
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
                        base_location: baseLocation,
                        panels: [...sidePanels, newPanel]
                    }
                }
            );
        }
    };

    return {
        sidePanels,
        close,
        open
    };
};

function buildSidePanelsFromUrl(path: string, collections: EntityCollection[], newFlag: boolean): ExtendedPanelProps[] {

    const navigationViewsForPath: NavigationViewInternal<any>[] = getNavigationEntriesFromPathInternal({
        path,
        collections
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
                            path: navigationEntry.path,
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
