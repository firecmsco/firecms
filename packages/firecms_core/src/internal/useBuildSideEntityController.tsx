import { useCallback, useEffect, useRef } from "react";
import {
    EntityCollection,
    EntitySidePanelProps,
    NavigationController,
    ResolvedProperty,
    SideDialogPanelProps,
    SideDialogsController,
    SideEntityController
} from "../types";
import { getNavigationEntriesFromPathInternal, NavigationViewInternal } from "../util/navigation_from_path";
import { useLocation } from "react-router-dom";
import { removeInitialAndTrailingSlashes, resolveCollection, resolveDefaultSelectedView } from "../util";
import { ADDITIONAL_TAB_WIDTH, CONTAINER_FULL_WIDTH, FORM_CONTAINER_WIDTH } from "./common";
import { useLargeLayout } from "../hooks";
import { EntitySidePanel } from "../core/EntitySidePanel";

const NEW_URL_HASH = "new";

export function getEntityViewWidth(props: EntitySidePanelProps<any>, small: boolean): string {
    if (small) return CONTAINER_FULL_WIDTH;
    const mainViewSelected = !props.selectedSubPath;
    let resolvedWidth: string | undefined;
    if (props.width) {
        resolvedWidth = typeof props.width === "number" ? `${props.width}px` : props.width;
    } else if (props.collection?.sideDialogWidth) {
        resolvedWidth = typeof props.collection.sideDialogWidth === "number" ? `${props.collection.sideDialogWidth}px` : props.collection.sideDialogWidth;
    }

    if (!mainViewSelected) {
        return `calc(${ADDITIONAL_TAB_WIDTH} + ${resolvedWidth ?? FORM_CONTAINER_WIDTH})`
    } else {
        if (resolvedWidth) {
            return resolvedWidth
        } else if (!props.collection) {
            return FORM_CONTAINER_WIDTH;
        } else {
            return calculateCollectionDesiredWidth(props.collection);
        }
    }
}

const collectionViewWidthCache: { [key: string]: string } = {};

function calculateCollectionDesiredWidth(collection: EntityCollection<any>): string {
    if (collectionViewWidthCache[collection.id]) {
        return collectionViewWidthCache[collection.id];
    }
    const resolvedCollection = resolveCollection({
        collection,
        path: "__ignored",
        ignoreMissingFields: true
    });

    let result = FORM_CONTAINER_WIDTH
    if (resolvedCollection?.properties) {
        const values = Object.values(resolvedCollection.properties).map((p: ResolvedProperty) => getNestedPropertiesDepth(p));
        const maxDepth = Math.max(...values);
        if (maxDepth < 3) {
            result = FORM_CONTAINER_WIDTH;
        } else {
            result = 768 + 32 * (maxDepth - 2) + "px";
        }
    }
    collectionViewWidthCache[collection.id] = result;
    return result;
}

function getNestedPropertiesDepth(property: ResolvedProperty, accumulator: number = 0): number {
    if (property.dataType === "map" && property.properties) {
        const values = Object.values(property.properties).flatMap((property) => getNestedPropertiesDepth(property, accumulator + 1));
        return Math.max(...values);
    } else if (property.dataType === "array" && property.oneOf) {
        return accumulator + 3;
    } else if (property.dataType === "array" && property.of) {
        if (Array.isArray(property.of)) {
            return Math.max(...property.of.map((p) => getNestedPropertiesDepth(p, accumulator + 1)));
        } else {
            return getNestedPropertiesDepth(property.of, accumulator + 1);
        }
    } else {
        return accumulator + 1;
    }
}

export const useBuildSideEntityController = (navigation: NavigationController,
                                             sideDialogsController: SideDialogsController): SideEntityController => {

    const location = useLocation();
    const initialised = useRef<boolean>(false);

    const smallLayout = !useLargeLayout();

    // only on initialisation, create panels from URL
    useEffect(() => {
        if (!navigation.loading && !initialised.current) {
            console.debug("Initialising side entity controller");
            if (navigation.isUrlCollectionPath(location.pathname)) {
                const newFlag = location.hash === `#${NEW_URL_HASH}`;
                const entityOrCollectionPath = navigation.urlPathToDataPath(location.pathname);
                const panelsFromUrl = buildSidePanelsFromUrl(entityOrCollectionPath, navigation.collections ?? [], newFlag);
                for (let i = 0; i < panelsFromUrl.length; i++) {
                    const props = panelsFromUrl[i];
                    setTimeout(() => {
                        if (i === 0)
                            sideDialogsController.replace(propsToSidePanel(props, navigation.buildUrlCollectionPath, navigation.resolveAliasesFrom, smallLayout));
                        else
                            sideDialogsController.open(propsToSidePanel(props, navigation.buildUrlCollectionPath, navigation.resolveAliasesFrom, smallLayout))
                    }, 1);
                }
            } else {
                // console.warn("Location path is not a collection path");
            }
            initialised.current = true;
        }
    }, [location, navigation.loading, navigation.isUrlCollectionPath, navigation.buildUrlCollectionPath, navigation.resolveAliasesFrom, sideDialogsController, smallLayout, navigation]);

    useEffect(() => {
        const updatedSidePanels = sideDialogsController.sidePanels.map(sidePanelProps => {
            if (sidePanelProps.additional) {
                return propsToSidePanel(sidePanelProps.additional, navigation.buildUrlCollectionPath, navigation.resolveAliasesFrom, smallLayout);
            }
            return sidePanelProps;
        });
        sideDialogsController.setSidePanels(updatedSidePanels);
    }, [smallLayout]);

    const close = useCallback(() => {
        sideDialogsController.close();
    }, [sideDialogsController]);

    const open = useCallback((props: EntitySidePanelProps<any>) => {

        if (props.copy && !props.entityId) {
            throw Error("If you want to copy an entity you need to provide an entityId");
        }

        const defaultSelectedView = resolveDefaultSelectedView(
            props.collection ? props.collection.defaultSelectedView : undefined,
            {
                status: props.copy ? "copy" : (props.entityId ? "existing" : "new"),
                entityId: props.entityId
            }
        );

        sideDialogsController.open(propsToSidePanel({
            selectedSubPath: defaultSelectedView,
            ...props,
        }, navigation.buildUrlCollectionPath, navigation.resolveAliasesFrom, smallLayout));

    }, [sideDialogsController, navigation.buildUrlCollectionPath, navigation.resolveAliasesFrom, smallLayout]);

    const replace = useCallback((props: EntitySidePanelProps<any>) => {

        if (props.copy && !props.entityId) {
            throw Error("If you want to copy an entity you need to provide an entityId");
        }

        sideDialogsController.replace(propsToSidePanel(props, navigation.buildUrlCollectionPath, navigation.resolveAliasesFrom, smallLayout));

    }, [navigation.buildUrlCollectionPath, navigation.resolveAliasesFrom, sideDialogsController, smallLayout]);

    return {
        close,
        open,
        replace
    };
};

export function buildSidePanelsFromUrl(path: string, collections: EntityCollection[], newFlag: boolean): EntitySidePanelProps<any>[] {

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
                        copy: false,
                        width: navigationEntry.parentCollection?.sideDialogWidth
                    }
                );
            } else if (navigationEntry.type === "custom_view") {
                if (previousEntry.type === "entity") {
                    const lastSidePanel: EntitySidePanelProps<any> = sidePanels[sidePanels.length - 1];
                    if (lastSidePanel)
                        lastSidePanel.selectedSubPath = navigationEntry.view.key;
                }
            } else if (navigationEntry.type === "collection") {
                if (previousEntry.type === "entity") {
                    const lastSidePanel: EntitySidePanelProps<any> = sidePanels[sidePanels.length - 1];
                    if (lastSidePanel)
                        lastSidePanel.selectedSubPath = navigationEntry.collection.id ?? navigationEntry.collection.path;
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

const propsToSidePanel = (props: EntitySidePanelProps,
                          buildUrlCollectionPath: (path: string) => string,
                          resolveAliasesFrom: (pathWithAliases: string) => string,
                          smallLayout: boolean): SideDialogPanelProps => {

        const collectionPath = removeInitialAndTrailingSlashes(props.path);

        const newPath = props.entityId
            ? buildUrlCollectionPath(`${collectionPath}/${props.entityId}/${props.selectedSubPath || ""}`)
            : buildUrlCollectionPath(`${collectionPath}#${NEW_URL_HASH}`);
        const resolvedPath = resolveAliasesFrom(props.path);

        const resolvedPanelProps: EntitySidePanelProps<any> = {
            ...props,
            path: resolvedPath,
        };

        const entityViewWidth = getEntityViewWidth(props, smallLayout);

        return {
            key: `${props.path}/${props.entityId}`,
            component: <EntitySidePanel {...resolvedPanelProps}/>,
            urlPath: newPath,
            parentUrlPath: buildUrlCollectionPath(collectionPath),
            width: entityViewWidth,
            onClose: props.onClose,
            additional: props
        };
    }
;
