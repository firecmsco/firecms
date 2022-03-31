import { useCallback, useEffect, useRef } from "react";
import {
    EntityCollection,
    EntitySidePanelProps,
    NavigationContext,
    SideEntityController,
    SideDialogPanelProps,
    SideDialogsController
} from "../../models";
import {
    getNavigationEntriesFromPathInternal,
    NavigationViewInternal
} from "../util/navigation_from_path";
import { useLocation } from "react-router-dom";
import { EntitySidePanel } from "../EntitySidePanel";
import { removeInitialAndTrailingSlashes } from "../util/navigation_utils";
import { useMediaQuery, useTheme } from "@mui/material";
import { CONTAINER_FULL_WIDTH, CONTAINER_WIDTH, TAB_WIDTH } from "./common";

const NEW_URL_HASH = "new";

export function getEntityViewWidth(props: EntitySidePanelProps<any, any>, small: boolean): string {
    if (small) return CONTAINER_FULL_WIDTH;
    const mainViewSelected = !props.selectedSubPath;
    const resolvedWidth: string | undefined = typeof props.width === "number" ? `${props.width}px` : props.width;
    return !mainViewSelected ? `calc(${TAB_WIDTH} + ${resolvedWidth ?? CONTAINER_WIDTH})` : resolvedWidth ?? CONTAINER_WIDTH
}

export const useBuildSideEntityController = (navigationContext: NavigationContext, sideDialogsController: SideDialogsController): SideEntityController => {

    const location = useLocation();
    const initialised = useRef<boolean>(false);

    const theme = useTheme();
    const smallLayout: boolean = useMediaQuery(theme.breakpoints.down("sm"));

    const collections = navigationContext.collections;

    // only on initialisation
    useEffect(() => {
        if (collections && !initialised.current) {
            if (navigationContext.isUrlCollectionPath(location.pathname)) {
                const newFlag = location.hash === `#${NEW_URL_HASH}`;
                const entityOrCollectionPath = navigationContext.urlPathToDataPath(location.pathname);
                const panelsFromUrl = buildSidePanelsFromUrl(entityOrCollectionPath, collections, newFlag);
                sideDialogsController.replace(panelsFromUrl.map((props) => propsToSidePanel(props)));
            }
            initialised.current = true;
        }
    }, [location, collections, sideDialogsController]);

    const propsToSidePanel = useCallback((props: EntitySidePanelProps<any, any>): SideDialogPanelProps<EntitySidePanelProps> => {
        const collectionPath = removeInitialAndTrailingSlashes(props.path);
        const newPath = props.entityId
            ? navigationContext.buildUrlCollectionPath(`${collectionPath}/${props.entityId}/${props.selectedSubPath || ""}`)
            : navigationContext.buildUrlCollectionPath(`${collectionPath}#${NEW_URL_HASH}`);
        return ({
            key: `${props.path}/${props.entityId}`,
            Component: EntitySidePanel,
            props: props,
            urlPath: newPath,
            parentUrlPath: navigationContext.buildUrlCollectionPath(collectionPath),
            width: getEntityViewWidth(props, smallLayout)
        });
    }, [navigationContext]);

    const close = useCallback(() => {
        sideDialogsController.close();
    }, [sideDialogsController]);

    const open = useCallback((props: EntitySidePanelProps) => {

        if (props.copy && !props.entityId) {
            throw Error("If you want to copy an entity you need to provide an entityId");
        }

        sideDialogsController.open(propsToSidePanel(props));

    }, [sideDialogsController]);

    const replace = useCallback((props: EntitySidePanelProps) => {

        if (props.copy && !props.entityId) {
            throw Error("If you want to copy an entity you need to provide an entityId");
        }

        sideDialogsController.replace(propsToSidePanel(props));

    }, [sideDialogsController]);

    return {
        close,
        open,
        replace
    };
};

function buildSidePanelsFromUrl(path: string, collections: EntityCollection[], newFlag: boolean): EntitySidePanelProps[] {

    const navigationViewsForPath: NavigationViewInternal<any>[] = getNavigationEntriesFromPathInternal({
        path,
        collections
    });

    const sidePanels: EntitySidePanelProps[] = [];
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
                    const lastSidePanel: EntitySidePanelProps = sidePanels[sidePanels.length - 1];
                    if (lastSidePanel)
                        lastSidePanel.selectedSubPath = navigationEntry.view.path;
                }
            } else if (navigationEntry.type === "collection") {
                if (previousEntry.type === "entity") {
                    const lastSidePanel: EntitySidePanelProps = sidePanels[sidePanels.length - 1];
                    if (lastSidePanel)
                        lastSidePanel.selectedSubPath = navigationEntry.collection.path;
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
