import { useCallback, useEffect, useRef } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import {
    EntityCollection,
    EntitySidePanelProps,
    NavigationContext,
    SideDialogPanelProps,
    SideDialogsController,
    SideEntityController
} from "../../types";
import {
    getNavigationEntriesFromPathInternal,
    NavigationViewInternal
} from "../util/navigation_from_path";
import { useLocation } from "react-router-dom";
import { EntitySidePanel } from "../EntitySidePanel";
import { removeInitialAndTrailingSlashes } from "../util";
import {
    ADDITIONAL_TAB_WIDTH,
    CONTAINER_FULL_WIDTH,
    FORM_CONTAINER_WIDTH
} from "./common";

const NEW_URL_HASH = "new";

export function getEntityViewWidth(props: EntitySidePanelProps<any>, small: boolean): string {
    if (small) return CONTAINER_FULL_WIDTH;
    const mainViewSelected = !props.selectedSubPath;
    const resolvedWidth: string | undefined = typeof props.width === "number" ? `${props.width}px` : props.width;
    return !mainViewSelected ? `calc(${ADDITIONAL_TAB_WIDTH} + ${resolvedWidth ?? FORM_CONTAINER_WIDTH})` : resolvedWidth ?? FORM_CONTAINER_WIDTH
}

export const useBuildSideEntityController = (navigation: NavigationContext,
                                             sideDialogsController: SideDialogsController): SideEntityController => {

    const location = useLocation();
    const initialised = useRef<boolean>(false);

    const theme = useTheme();
    const smallLayout: boolean = useMediaQuery(theme.breakpoints.down("sm"));

    // only on initialisation, create panels from URL
    useEffect(() => {
        if (!navigation.loading && !initialised.current) {
            if (navigation.isUrlCollectionPath(location.pathname)) {
                const newFlag = location.hash === `#${NEW_URL_HASH}`;
                const entityOrCollectionPath = navigation.urlPathToDataPath(location.pathname);
                const panelsFromUrl = buildSidePanelsFromUrl(entityOrCollectionPath, navigation.collections, newFlag);
                sideDialogsController.replace(panelsFromUrl.map((props) => propsToSidePanel(props, navigation, smallLayout)));
            }
            initialised.current = true;
        }
    }, [location, navigation, sideDialogsController, smallLayout]);

    const close = useCallback(() => {
        sideDialogsController.close();
    }, [sideDialogsController]);

    const open = useCallback((props: EntitySidePanelProps<any>) => {

        if (props.copy && !props.entityId) {
            throw Error("If you want to copy an entity you need to provide an entityId");
        }
        const firstAdditionalView = props.collection ? props.collection.defaultSelectedView : undefined;
        sideDialogsController.open(propsToSidePanel({ selectedSubPath: firstAdditionalView, ...props }, navigation, smallLayout));

    }, [sideDialogsController, navigation, smallLayout]);

    const replace = useCallback((props: EntitySidePanelProps<any>) => {

        if (props.copy && !props.entityId) {
            throw Error("If you want to copy an entity you need to provide an entityId");
        }

        sideDialogsController.replace(propsToSidePanel(props, navigation, smallLayout));

    }, [navigation, sideDialogsController, smallLayout]);

    return {
        close,
        open,
        replace
    };
};

function buildSidePanelsFromUrl(path: string, collections: EntityCollection[], newFlag: boolean): EntitySidePanelProps<any>[] {

    const navigationViewsForPath: NavigationViewInternal<any>[] = getNavigationEntriesFromPathInternal({
        path,
        collections
    });

    const sidePanels: EntitySidePanelProps<any>[] = [];
    let lastCollectionPath = "";
    for (let i = 0; i < navigationViewsForPath.length; i++) {
        const navigationEntry = navigationViewsForPath[i];

        if (navigationEntry.type === "collection") {
            lastCollectionPath = navigationEntry.path;
        }

        if (i > 0) { // the first collection is handled by the main navigation
            const previousEntry = navigationViewsForPath[i - 1];
            if (navigationEntry.type === "entity") {
                sidePanels.push({
                        path: navigationEntry.path,
                        entityId: navigationEntry.entityId,
                        copy: false
                    }
                );
            } else if (navigationEntry.type === "custom_view") {
                if (previousEntry.type === "entity") {
                    const lastSidePanel: EntitySidePanelProps<any> = sidePanels[sidePanels.length - 1];
                    if (lastSidePanel)
                        lastSidePanel.selectedSubPath = navigationEntry.view.path;
                }
            } else if (navigationEntry.type === "collection") {
                if (previousEntry.type === "entity") {
                    const lastSidePanel: EntitySidePanelProps<any> = sidePanels[sidePanels.length - 1];
                    if (lastSidePanel)
                        lastSidePanel.selectedSubPath = navigationEntry.collection.alias ?? navigationEntry.collection.path;
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

const propsToSidePanel = (props: EntitySidePanelProps<any>, navigation: NavigationContext, smallLayout: boolean): SideDialogPanelProps => {

    const collectionPath = removeInitialAndTrailingSlashes(props.path);
    const newPath = props.entityId
        ? navigation.buildUrlCollectionPath(`${collectionPath}/${props.entityId}/${props.selectedSubPath || ""}`)
        : navigation.buildUrlCollectionPath(`${collectionPath}#${NEW_URL_HASH}`);

    return ({
        key: `${props.path}/${props.entityId}`,
        component: <EntitySidePanel {...props}/>,
        urlPath: newPath,
        parentUrlPath: navigation.buildUrlCollectionPath(collectionPath),
        width: getEntityViewWidth(props, smallLayout),
        onClose: props.onClose
    });
};
