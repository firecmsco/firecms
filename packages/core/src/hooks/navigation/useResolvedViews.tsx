import type { CMSView, CMSViewsBuilder, EffectiveRoleController, EntityCollection, RebasePlugin } from "@rebasepro/types";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { deepEqual as equal } from "fast-equals";

import { AuthController, RebaseData, User } from "@rebasepro/types";
import { UserManagementDelegate } from "@rebasepro/types";

import { resolveCMSViews } from "./useNavigationResolution";
import { NAVIGATION_ADMIN_GROUP_NAME } from "./utils";
import { UsersView, RolesView } from "../../components/admin";

export type UseResolvedViewsProps<USER extends User> = {
    authController: AuthController<USER>;
    views?: CMSView[] | CMSViewsBuilder;
    adminViews?: CMSView[] | CMSViewsBuilder;
    data: RebaseData;
    plugins?: RebasePlugin[];
    adminMode?: "content" | "studio" | "settings";
    effectiveRoleController?: EffectiveRoleController;
    userManagement?: UserManagementDelegate;
};

export type UseResolvedViewsResult = {
    views: CMSView[] | undefined;
    adminViews: CMSView[] | undefined;
    loading: boolean;
    error: Error | undefined;
    refresh: () => void;
};

/**
 * Hook that resolves view and admin view props (which may be async builders or arrays)
 * into concrete CMSView[]. Also injects Users/Roles admin views when userManagement
 * is provided.
 *
 * Uses refs for potentially-unstable dependencies (driver, authController,
 * plugins) to avoid re-triggering effects when their object identity changes.
 */
export function useResolvedViews<USER extends User>(
    props: UseResolvedViewsProps<USER>
): UseResolvedViewsResult {

    const {
        authController,
        views: viewsProp,
        adminViews: adminViewsProp,
        data,
        plugins,
        adminMode = "content",
        effectiveRoleController,
        userManagement
    } = props;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>(undefined);
    const [resolvedViews, setResolvedViews] = useState<CMSView[] | undefined>(undefined);
    const [resolvedAdminViews, setResolvedAdminViews] = useState<CMSView[] | undefined>(undefined);

    // Track the trigger count to allow force-refresh
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // Refs for change-detection (avoids state updates when views haven't changed)
    const viewsRef = useRef<CMSView[] | undefined>(undefined);
    const adminViewsRef = useRef<CMSView[] | undefined>(undefined);

    // Use refs for values that may be new objects each render but shouldn't
    // re-trigger the effect. The effect reads them at execution time.
    const dataRef = useRef(data);
    dataRef.current = data;
    const authControllerRef = useRef(authController);
    authControllerRef.current = authController;
    const pluginsRef = useRef(plugins);
    pluginsRef.current = plugins;

    // Build the resolved auth controller (with effective role override for studio mode)
    const resolvedAuthController = useMemo(() => {
        if (adminMode === "studio" && effectiveRoleController?.effectiveRole && authController.user) {
            return {
                ...authController,
                user: {
                    ...authController.user,
                    roles: [effectiveRoleController.effectiveRole]
                }
            };
        }
        return authController;
    }, [adminMode, effectiveRoleController?.effectiveRole, authController]);

    // Store resolvedAuthController in a ref for effect access without re-triggering
    const resolvedAuthControllerRef = useRef(resolvedAuthController);
    resolvedAuthControllerRef.current = resolvedAuthController;

    // Memoize JSX elements for injected admin views to ensure stable references.
    const usersViewElement = useMemo(() =>
        userManagement ? <UsersView userManagement={userManagement as unknown as UserManagementDelegate<User>} /> : null,
        [userManagement]
    );
    const rolesViewElement = useMemo(() =>
        userManagement?.roles ? <RolesView userManagement={userManagement as unknown as UserManagementDelegate<User>} /> : null,
        [userManagement]
    );

    const injectedAdminViews: CMSView[] = useMemo(() => {
        const views: CMSView[] = [];
        if (userManagement && usersViewElement) {
            views.push({
                slug: "users",
                name: "Users",
                group: NAVIGATION_ADMIN_GROUP_NAME,
                icon: "support_agent",
                view: usersViewElement
            });
            if (userManagement.roles && rolesViewElement) {
                views.push({
                    slug: "roles",
                    name: "Roles",
                    group: NAVIGATION_ADMIN_GROUP_NAME,
                    icon: "admin_panel_settings",
                    view: rolesViewElement
                });
            }
        }
        return views;
    }, [userManagement, usersViewElement, rolesViewElement]);

    // Store injectedAdminViews in a ref for effect access
    const injectedAdminViewsRef = useRef(injectedAdminViews);
    injectedAdminViewsRef.current = injectedAdminViews;

    const initialLoading = resolvedAuthController.initialLoading;
    const user = resolvedAuthController.user;

    useEffect(() => {
        if (initialLoading) return;

        let cancelled = false;

        (async () => {
            try {
                const [newViews, newAdminViewsProp] = await Promise.all([
                    resolveCMSViews(viewsProp, resolvedAuthControllerRef.current, dataRef.current, pluginsRef.current),
                    resolveCMSViews(adminViewsProp, resolvedAuthControllerRef.current, dataRef.current)
                ]);

                if (cancelled) return;

                const newAdminViews = [...newAdminViewsProp, ...injectedAdminViewsRef.current];

                // Only update state if views actually changed
                if (!equal(viewsRef.current, newViews)) {
                    viewsRef.current = newViews;
                    setResolvedViews(newViews);
                }

                if (!equal(adminViewsRef.current, newAdminViews)) {
                    adminViewsRef.current = newAdminViews;
                    setResolvedAdminViews(newAdminViews);
                }

                setError(undefined);
            } catch (e) {
                if (!cancelled) {
                    console.error("Error resolving views:", e);
                    setError(e as Error);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [
        viewsProp,
        adminViewsProp,
        refreshTrigger,
        adminMode,
        initialLoading,
        user
    ]);

    return {
        views: resolvedViews,
        adminViews: resolvedAdminViews,
        loading,
        error,
        refresh
    };
}
