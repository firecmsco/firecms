import type { CMSView, EntityCollection, NavigationResult, RebasePlugin, NavigationStateController, CMSUrlController, NavigationGroupMapping } from "@rebasepro/types";
import { useCallback } from "react";

import { AuthController,  RebaseData, CollectionRegistryController, User } from "@rebasepro/types";
import type { EntityCollectionsBuilder, CMSViewsBuilder, EffectiveRoleController } from "@rebasepro/types";
import { CollectionRegistry } from "@rebasepro/common";

import { UserManagementDelegate } from "@rebasepro/types";

import { useResolvedCollections } from "./useResolvedCollections";
import { useResolvedViews } from "./useResolvedViews";
import { useTopLevelNavigation } from "./useTopLevelNavigation";

export type BuildNavigationStateProps<EC extends EntityCollection, USER extends User> = {
    authController: AuthController<USER>;
    collections?: EC[] | EntityCollectionsBuilder<EC>;
    views?: CMSView[] | CMSViewsBuilder;
    adminViews?: CMSView[] | CMSViewsBuilder;
    data: RebaseData;
    plugins?: RebasePlugin[];
    navigationGroupMappings?: NavigationGroupMapping[];
    disabled?: boolean;
    viewsOrder?: string[];
    collectionRegistryController: CollectionRegistryController<EC> & { collectionRegistryRef: React.MutableRefObject<CollectionRegistry> };
    cmsUrlController: CMSUrlController;
    adminMode?: "content" | "studio" | "settings";
    effectiveRoleController?: EffectiveRoleController;
    userManagement?: UserManagementDelegate;
};

/**
 * Main hook that resolves collections, views, and admin views into a
 * NavigationStateController. This is a thin composition of three focused hooks:
 *
 * - useResolvedCollections: resolves collection props and registers with CollectionRegistry
 * - useResolvedViews: resolves view/admin view props and injects Users/Roles views
 * - useTopLevelNavigation: computes the NavigationResult from resolved data
 *
 * The NavigationStateController type is preserved as a public API.
 */
export function useBuildNavigationStateController<EC extends EntityCollection, USER extends User>(
    props: BuildNavigationStateProps<EC, USER>
): NavigationStateController {

    const {
        authController,
        collections: collectionsProp,
        views: viewsProp,
        adminViews: adminViewsProp,
        viewsOrder,
        plugins,
        data,
        disabled,
        navigationGroupMappings,
        collectionRegistryController,
        cmsUrlController,
        adminMode = "content",
        effectiveRoleController,
        userManagement
    } = props;

    // Step 1: Resolve collections
    const {
        collections,
        loading: collectionsLoading,
        error: collectionsError,
        refresh: refreshCollections
    } = useResolvedCollections({
        authController,
        collections: collectionsProp,
        data,
        plugins,
        disabled,
        collectionRegistryController
    });

    // Step 2: Resolve views and admin views
    const {
        views,
        adminViews,
        loading: viewsLoading,
        error: viewsError,
        refresh: refreshViews
    } = useResolvedViews({
        authController,
        views: viewsProp,
        adminViews: adminViewsProp,
        data,
        plugins,
        adminMode,
        effectiveRoleController,
        userManagement
    });

    // Step 3: Compute top-level navigation (pure derived state)
    const { topLevelNavigation } = useTopLevelNavigation({
        collections,
        views,
        adminViews,
        plugins,
        navigationGroupMappings,
        viewsOrder,
        cmsUrlController,
        adminMode,
        collectionRegistryController
    });

    // Expose a combined refresh function
    const refreshNavigation = useCallback(() => {
        refreshCollections();
        refreshViews();
    }, [refreshCollections, refreshViews]);

    return {
        views,
        adminViews,
        topLevelNavigation,
        loading: collectionsLoading || viewsLoading,
        navigationLoadingError: collectionsError ?? viewsError,
        refreshNavigation,
        plugins
    };
}
