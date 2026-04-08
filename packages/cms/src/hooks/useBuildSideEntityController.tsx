import type { EntityCollection } from "../types/collections";
import type { CustomizationController, EntitySidePanelProps, SideDialogPanelProps, SideDialogsController, SideEntityController, CMSUrlController, NavigationStateController, Property } from "@rebasepro/types";import { useCallback, useEffect, useRef } from "react";
import { AuthController, CollectionRegistryController } from "@rebasepro/types";
import { useLocation } from "react-router-dom";
import {
    getNavigationEntriesFromPath,
    NavigationViewInternal,
    removeInitialAndTrailingSlashes,
    resolveDefaultSelectedView,
} from "@rebasepro/common";
import { resolvedSelectedEntityView } from "../util/resolutions";
import { ADDITIONAL_TAB_WIDTH, CONTAINER_FULL_WIDTH, FORM_CONTAINER_WIDTH } from "@rebasepro/core";
import { useCustomizationController, useLargeLayout } from "@rebasepro/core";
import { JSON_TAB_VALUE } from "../components/EntityEditView";

const NEW_URL_HASH = "new_side";
const SIDE_URL_HASH = "side";

export function getEntityViewWidth(props: EntitySidePanelProps<any>, small: boolean, customizationController: CustomizationController): string {
    if (small) return CONTAINER_FULL_WIDTH;

    const {
        selectedSecondaryForm
    } = resolvedSelectedEntityView(props.collection?.entityViews, customizationController, props.selectedTab);

    const shouldUseSmallLayout = !props.selectedTab || props.selectedTab === JSON_TAB_VALUE || props.selectedTab === "__history" || Boolean(selectedSecondaryForm);

    let resolvedWidth: string | undefined;
    if (props.width) {
        resolvedWidth = typeof props.width === "number" ? `${props.width}px` : props.width;
    } else if (props.collection?.sideDialogWidth) {
        resolvedWidth = typeof props.collection.sideDialogWidth === "number" ? `${props.collection.sideDialogWidth}px` : props.collection.sideDialogWidth;
    }

    if (!shouldUseSmallLayout) {
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
    if (collectionViewWidthCache[collection.slug]) {
        return collectionViewWidthCache[collection.slug];
    }

    let result = FORM_CONTAINER_WIDTH
    if (collection?.properties) {
        const values = Object.values(collection.properties).map((p: Property) => getNestedPropertiesDepth(p));
        const maxDepth = Math.max(...values);
        if (maxDepth < 3) {
            result = FORM_CONTAINER_WIDTH;
        } else {
            result = 768 + 32 * (maxDepth - 2) + "px";
        }
    }
    collectionViewWidthCache[collection.slug] = result;
    return result;
}

function getNestedPropertiesDepth(property: Property, accumulator: number = 0): number {
    if (property.type === "map" && property.properties) {
        const values = Object.values(property.properties).flatMap((childProperty) => getNestedPropertiesDepth(childProperty as Readonly<Property>, accumulator + 1));
        return Math.max(...values);
    } else if (property.type === "array" && property.oneOf) {
        return accumulator + 3;
    } else if (property.type === "array" && property.of) {
        if (Array.isArray(property.of)) {
            return Math.max(...property.of.map((p) => getNestedPropertiesDepth(p, accumulator + 1)));
        } else {
            return getNestedPropertiesDepth(property.of, accumulator + 1);
        }
    } else {
        return accumulator + 1;
    }
}

export const useBuildSideEntityController = (collectionRegistryController: CollectionRegistryController,
    cmsUrlController: CMSUrlController,
    navigationStateController: NavigationStateController,
    sideDialogsController: SideDialogsController,
    authController: AuthController
): SideEntityController => {

    const location = useLocation();
    const initialised = useRef<boolean>(false);
    const currentPanelKeysRef = useRef<string[]>([]);
    const customizationController = useCustomizationController();

    const smallLayout = !useLargeLayout();

    useEffect(() => {

        const newFlag = location.hash === `#${NEW_URL_HASH}`;
        const sideFlag = location.hash === `#${SIDE_URL_HASH}`;

        if (!navigationStateController.loading) {
            if ((newFlag || sideFlag) && cmsUrlController.isUrlCollectionPath(location.pathname)) {
                const entityOrCollectionPath = cmsUrlController.urlPathToDataPath(location.pathname);
                const panelsFromUrl = buildSidePanelsFromUrl(entityOrCollectionPath, collectionRegistryController.collections ?? [], newFlag);
                for (let i = 0; i < panelsFromUrl.length; i++) {
                    const props = panelsFromUrl[i];
                    if (i === 0)
                        sideDialogsController.replace(propsToSidePanel(props, cmsUrlController.buildUrlCollectionPath, cmsUrlController.resolveDatabasePathsFrom, smallLayout, customizationController, authController, location.search));
                    else
                        sideDialogsController.open(propsToSidePanel(props, cmsUrlController.buildUrlCollectionPath, cmsUrlController.resolveDatabasePathsFrom, smallLayout, customizationController, authController, location.search))
                }
            }
            initialised.current = true;
        }
    }, [navigationStateController.loading]);

    // sync panels if URL changes with #side
    // Use a ref for currentPanelKeys so this effect only fires on URL changes,
    // not on panel state changes. This prevents a race condition with React Router 7
    // where close() clears panels before the URL updates, causing the effect to
    // re-open the panel from the stale #side hash.
    currentPanelKeysRef.current = sideDialogsController.sidePanels.map(p => p.key);
    useEffect(() => {
        if (initialised.current) {
            const sideFlag = location.hash === `#${SIDE_URL_HASH}`;
            if (sideFlag) {
                const currentKeys = currentPanelKeysRef.current;
                const entityOrCollectionPath = cmsUrlController.urlPathToDataPath(location.pathname);
                const panelsFromUrl = buildSidePanelsFromUrl(entityOrCollectionPath, collectionRegistryController.collections ?? [], false);
                // if we have more panels than determined by the url, we ignore the url. We might have references open
                if (panelsFromUrl.length <= currentKeys.length) {
                    return;
                }
                const lastPanel = panelsFromUrl[panelsFromUrl.length - 1];
                const panelProps = propsToSidePanel(lastPanel, cmsUrlController.buildUrlCollectionPath, cmsUrlController.resolveDatabasePathsFrom, smallLayout, customizationController, authController, location.search);
                const lastCurrentPanel = currentKeys.length > 0 ? currentKeys[currentKeys.length - 1] : undefined;
                if (!lastCurrentPanel || lastCurrentPanel !== panelProps.key) {
                    sideDialogsController.replace(panelProps);
                }
            }
        }
    }, [location.pathname, location.hash]);

    // update side panels to match browser size
    useEffect(() => {
        const updatedSidePanels = sideDialogsController.sidePanels.map(sidePanelProps => {
            if (sidePanelProps.additional) {
                return propsToSidePanel(sidePanelProps.additional as EntitySidePanelProps, cmsUrlController.buildUrlCollectionPath, cmsUrlController.resolveDatabasePathsFrom, smallLayout, customizationController, authController, location.search);
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

        sideDialogsController.open(
            propsToSidePanel({
                selectedTab: defaultSelectedView,
                ...props
            },
                cmsUrlController.buildUrlCollectionPath,
                cmsUrlController.resolveDatabasePathsFrom,
                smallLayout,
                customizationController,
                authController,
                location.search
            ));

    }, [sideDialogsController, cmsUrlController.buildUrlCollectionPath, cmsUrlController.resolveDatabasePathsFrom, smallLayout, authController.user, location.search]);

    const replace = useCallback((props: EntitySidePanelProps<any>) => {

        if (props.copy && !props.entityId) {
            throw Error("If you want to copy an entity you need to provide an entityId");
        }

        sideDialogsController.replace(propsToSidePanel(props, cmsUrlController.buildUrlCollectionPath, cmsUrlController.resolveDatabasePathsFrom, smallLayout, customizationController, authController, location.search));

    }, [cmsUrlController.buildUrlCollectionPath, cmsUrlController.resolveDatabasePathsFrom, sideDialogsController, smallLayout, authController.user, location.search]);

    return {
        close,
        open,
        replace
    };
};

export function buildSidePanelsFromUrl(path: string, collections: EntityCollection[], newFlag: boolean): EntitySidePanelProps<any>[] {

    const navigationViewsForPath: NavigationViewInternal<any>[] = getNavigationEntriesFromPath({
        path,
        collections
    });

    let sidePanel: EntitySidePanelProps<any> | undefined = undefined;
    let lastCollectionPath = "";
    let lastCollectionId: string | undefined = undefined;
    for (let i = 0; i < navigationViewsForPath.length; i++) {
        const navigationEntry = navigationViewsForPath[i];

        if (navigationEntry.type === "collection") {
            lastCollectionPath = navigationEntry.slug;
            lastCollectionId = navigationEntry.collection.slug;
        }

        const previousEntry = navigationViewsForPath[i - 1];
        if (navigationEntry.type === "entity") {
            sidePanel = {
                path: navigationEntry.slug,
                entityId: navigationEntry.entityId,
                copy: false,
                width: navigationEntry.parentCollection?.sideDialogWidth
            };
        } else if (navigationEntry.type === "custom_view") {
            if (previousEntry?.type === "entity") {
                if (sidePanel)
                    sidePanel.selectedTab = navigationEntry.view.key;
            }
        } else if (navigationEntry.type === "collection") {
            if (previousEntry?.type === "entity") {
                if (sidePanel)
                    sidePanel.selectedTab = navigationEntry.collection.slug;
            }
        }

    }

    if (newFlag) {
        sidePanel = {
            path: lastCollectionPath,
            copy: false
        }
    }

    return sidePanel ? [sidePanel] : [];
}

const propsToSidePanel = (props: EntitySidePanelProps,
    buildUrlCollectionPath: (path: string) => string,
    resolveIdsFrom: (pathWithAliases: string) => string,
    smallLayout: boolean,
    customizationController: CustomizationController,
    authController: AuthController,
    locationSearch: string
): SideDialogPanelProps => {

    const collectionPath = removeInitialAndTrailingSlashes(props.path);

    // When updateUrl is explicitly false, don't generate URL paths — the dialog
    // opens as an overlay without affecting the browser URL / router.
    const shouldUpdateUrl = props.updateUrl !== false;

    const urlPath = shouldUpdateUrl
        ? (props.entityId
            ? buildUrlCollectionPath(`${collectionPath}/${props.entityId}${props.selectedTab ? "/" + props.selectedTab : ""}${locationSearch}#${SIDE_URL_HASH}`)
            : buildUrlCollectionPath(`${collectionPath}${locationSearch}#${NEW_URL_HASH}`))
        : undefined;

    const parentUrlPath = shouldUpdateUrl
        ? buildUrlCollectionPath(collectionPath)
        : undefined;

    const resolvedPanelProps: EntitySidePanelProps<any> = {
        ...props,
        formProps: props.formProps
    };

    const entityViewWidth = getEntityViewWidth(props, smallLayout, customizationController);
    return {
        key: `${props.path}/${props.entityId}`,
        component: undefined, // Lazy render in SideDialogs for better performance
        urlPath: urlPath,
        parentUrlPath: parentUrlPath,
        width: entityViewWidth,
        onClose: props.onClose,
        additional: resolvedPanelProps
    };
}
