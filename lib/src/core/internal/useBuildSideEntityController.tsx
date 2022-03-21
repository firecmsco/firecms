import { useCallback, useEffect, useRef, useState } from "react";
import {
    EntityCollection,
    NavigationContext,
    SideEntityController,
    SideEntityPanelProps
} from "../../models";
import {
    getNavigationEntriesFromPathInternal,
    NavigationViewInternal
} from "../util/navigation_from_path";
import { useLocation, useNavigate } from "react-router-dom";
import { removeInitialAndTrailingSlashes } from "../util/navigation_utils";
import { getSidePanelKey } from "./useBuildNavigationContext";

const NEW_URL_HASH = "new";

export const useBuildSideEntityController = (navigationContext: NavigationContext): SideEntityController => {

    const location = useLocation();
    const navigate = useNavigate();
    const initialised = useRef<boolean>(false);
    const [sidePanels, setSidePanels] = useState<SideEntityPanelProps[]>([]);

    const collections = navigationContext.navigation?.collections;

    const state = location.state as any;
    const baseLocation = state && state.base_location ? state.base_location : location;

    // only on initialisation
    useEffect(() => {
        if (collections && !initialised.current) {
            if (navigationContext.isUrlCollectionPath(location.pathname)) {
                const newFlag = location.hash === `#${NEW_URL_HASH}`;
                const entityOrCollectionPath = navigationContext.urlPathToDataPath(location.pathname);
                setSidePanels(buildSidePanelsFromUrl(entityOrCollectionPath, collections, newFlag));
            }
            initialised.current = true;
        }
    }, [location, collections, sidePanels]);

    const close = useCallback(() => {

        if (sidePanels.length === 0)
            return;

        const lastSidePanel = sidePanels[sidePanels.length - 1];
        const locationPanels = location?.state && state.panels;
        if (locationPanels && locationPanels.length > 0) {
            const updatedPanels = [...sidePanels.slice(0, -1)];
            setSidePanels(updatedPanels);
            if (lastSidePanel.updateUrl)
                navigate(-1);
        } else {
            const newPath = navigationContext.buildUrlCollectionPath(lastSidePanel.path);
            setSidePanels([]);
            if (lastSidePanel.updateUrl)
                navigate(newPath, { replace: true });
        }

    }, [sidePanels, location]);

    const open = useCallback(({
                      path,
                      entityId,
                      selectedSubpath,
                      copy,
                      width,
                      ...otherProps
                  }: SideEntityPanelProps) => {

        if (copy && !entityId) {
            throw Error("If you want to copy an entity you need to provide an entityId");
        }

        const updateUrl = otherProps.updateUrl === undefined ? false : otherProps.updateUrl;

        const cleanPath = removeInitialAndTrailingSlashes(path);
        const newPath = entityId
            ? navigationContext.buildUrlCollectionPath(`${cleanPath}/${entityId}/${selectedSubpath || ""}`)
            : navigationContext.buildUrlCollectionPath(`${cleanPath}#${NEW_URL_HASH}`);

        const lastSidePanel = sidePanels.length > 0 ? sidePanels[sidePanels.length - 1] : undefined;

        // If the side dialog is open currently, we update it
        if (entityId &&
            lastSidePanel &&
            lastSidePanel.path === path &&
            lastSidePanel?.entityId === entityId) {

            const updatedPanel: SideEntityPanelProps = {
                ...lastSidePanel,
                selectedSubpath
            };
            const updatedPanels = [...sidePanels.slice(0, -1), updatedPanel];
            setSidePanels(updatedPanels);
            const panelKeys = updatedPanels.map((panel) => getSidePanelKey(panel.path, panel.entityId));
            if (updateUrl) {
                navigate(
                    navigationContext.buildUrlCollectionPath(`${cleanPath}/${entityId}/${selectedSubpath || ""}`),
                    {
                        replace: true,
                        state: {
                            base_location: baseLocation,
                            panels: panelKeys
                        }
                    }
                );
            }

        } else {
            const newPanel: SideEntityPanelProps = {
                path,
                entityId,
                copy: copy !== undefined && copy,
                width,
                selectedSubpath,
                ...otherProps
            };
            const updatedPanels = [...sidePanels, newPanel];
            setSidePanels(updatedPanels);
            const panelKeys = updatedPanels.map((panel) => getSidePanelKey(panel.path, panel.entityId));
            if (updateUrl) {
                navigate(
                    newPath,
                    {
                        state: {
                            base_location: baseLocation,
                            panels: panelKeys
                        }
                    }
                );
            }
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

    const sidePanels: SideEntityPanelProps[] = [];
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
