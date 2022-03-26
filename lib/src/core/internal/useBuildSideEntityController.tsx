import { useCallback, useEffect, useRef } from "react";
import {
    EntityCollection,
    EntityPanelProps,
    NavigationContext,
    SideEntityController
} from "../../models";
import {
    getNavigationEntriesFromPathInternal,
    NavigationViewInternal
} from "../util/navigation_from_path";
import { useLocation } from "react-router-dom";
import { SideDialogPanelProps, SideDialogsController } from "../SideDialogs";
import { SideEntityDialog } from "../SideEntityDialog";
import { removeInitialAndTrailingSlashes } from "../util/navigation_utils";

const NEW_URL_HASH = "new";

export const useBuildSideEntityController = (navigationContext: NavigationContext, sideDialogsController: SideDialogsController): SideEntityController => {

    const location = useLocation();
    const initialised = useRef<boolean>(false);

    const collections = navigationContext.collections;

    // only on initialisation
    useEffect(() => {
        if (collections && !initialised.current) {
            if (navigationContext.isUrlCollectionPath(location.pathname)) {
                const newFlag = location.hash === `#${NEW_URL_HASH}`;
                const entityOrCollectionPath = navigationContext.urlPathToDataPath(location.pathname);
                buildSidePanelsFromUrl(entityOrCollectionPath, collections, newFlag)
                    .forEach((props) => sideDialogsController.replace(propsToSidePanel(props)));
            }
            initialised.current = true;
        }
    }, [location, collections, sideDialogsController]);

    const propsToSidePanel = useCallback((props: EntityPanelProps<any, any>): SideDialogPanelProps<EntityPanelProps> => {
        const collectionPath = removeInitialAndTrailingSlashes(props.path);
        const newPath = props.entityId
            ? navigationContext.buildUrlCollectionPath(`${collectionPath}/${props.entityId}/${props.selectedSubPath || ""}`)
            : navigationContext.buildUrlCollectionPath(`${collectionPath}#${NEW_URL_HASH}`);
        return ({
            key: `${props.path}/${props.entityId}`,
            Component: SideEntityDialog,
            props: props,
            urlPath: newPath,
            parentUrlPath: navigationContext.buildUrlCollectionPath(collectionPath)
        });
    }, [navigationContext]);

    const close = useCallback(() => {
        sideDialogsController.close();
    }, [sideDialogsController]);

    const open = useCallback((props: EntityPanelProps) => {

        if (props.copy && !props.entityId) {
            throw Error("If you want to copy an entity you need to provide an entityId");
        }

        sideDialogsController.open(propsToSidePanel(props));

    }, [sideDialogsController]);

    const replace = useCallback((props: EntityPanelProps) => {

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

function buildSidePanelsFromUrl(path: string, collections: EntityCollection[], newFlag: boolean): EntityPanelProps[] {

    const navigationViewsForPath: NavigationViewInternal<any>[] = getNavigationEntriesFromPathInternal({
        path,
        collections
    });

    const sidePanels: EntityPanelProps[] = [];
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
                    const lastSidePanel: EntityPanelProps = sidePanels[sidePanels.length - 1];
                    if (lastSidePanel)
                        lastSidePanel.selectedSubPath = navigationEntry.view.path;
                }
            } else if (navigationEntry.type === "collection") {
                if (previousEntry.type === "entity") {
                    const lastSidePanel: EntityPanelProps = sidePanels[sidePanels.length - 1];
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
