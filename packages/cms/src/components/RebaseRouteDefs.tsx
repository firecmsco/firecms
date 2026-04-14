import React, { useMemo } from "react";
import { Route } from "react-router-dom";
import {
    useRebaseRegistry,
    RebaseRoutes,
    UserSettingsView,
    UIReferenceView,
    NotFoundPage,
    useInternalUserManagementController,
} from "@rebasepro/core";

import { ContentHomePage } from "./HomePage/ContentHomePage";
import { UsersView } from "./admin/UsersView";
import { RolesView } from "./admin/RolesView";
import { RebaseRoute } from "../routes/RebaseRoute";
import { CustomViewRoute } from "../routes/CustomViewRoute";
import { useNavigationStateController } from "../hooks/navigation/contexts/NavigationStateContext";
import { CollectionEditorDialogs } from "./CollectionEditorDialogs";
import { useEffect } from "react";
import { useTranslation } from "@rebasepro/core";
import { useBreadcrumbsController } from "../index";

function SettingsView() {
    const { t } = useTranslation();
    const breadcrumbs = useBreadcrumbsController();
    useEffect(() => {
        breadcrumbs.set({
            breadcrumbs: [{ title: t("project_settings"), url: "/settings" }]
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return <UserSettingsView />;
}

export interface RebaseRouteDefsProps {
    /** User-provided custom routes to include. */
    children?: React.ReactNode;
    /**
     * Wrap function — receives the route tree and lets you wrap it in a layout.
     * If provided, the routes are rendered inside this wrapper.
     * If not provided, routes are rendered directly inside <RebaseRoutes>.
     */
    layout?: React.ReactElement;
}

/**
 * Route definitions for the CMS.
 *
 * Defines all standard routes: home, studio home, collection view,
 * settings, users, roles, debug, custom views, and a catch-all 404.
 *
 * **Independently usable**: Use this when you want Rebase routes
 * inside your own layout/navigation setup.
 *
 * @example
 * ```tsx
 * <RebaseNavigation>
 *   <RebaseRouteDefs layout={<MyCustomLayout />}>
 *     <Route path="/my-custom" element={<MyView />} />
 *   </RebaseRouteDefs>
 * </RebaseNavigation>
 * ```
 */
export function RebaseRouteDefs({ children, layout }: RebaseRouteDefsProps) {
    const registry = useRebaseRegistry();
    const userManagement = useInternalUserManagementController();
    const navigationStateController = useNavigationStateController();

    const cmsHomePage = registry.cmsConfig?.homePage ?? <ContentHomePage />;
    const studioHomePage = registry.studioConfig?.homePage;

    const combinedViews = useMemo(() => [
        ...(navigationStateController.views ?? []),
        ...(navigationStateController.adminViews ?? [])
    ], [navigationStateController.views, navigationStateController.adminViews]);

    const routeContents = (
        <>
            {/* Core CMS Routes */}
            <Route path={"/"} element={cmsHomePage} />
            {registry.studioConfig && (
                <Route path={"/s"} element={studioHomePage} />
            )}

            <Route path={"/c/*"} element={<RebaseRoute />} />
            <Route path={"/settings"} element={<SettingsView />} />
            {userManagement && <Route path={"/roles"} element={<RolesView userManagement={userManagement} />} />}
            {userManagement && <Route path={"/users"} element={<UsersView userManagement={userManagement} />} />}

            {/* Hidden debug route */}
            <Route path={"/debug/ui"} element={<UIReferenceView />} />

            {/* Custom Registered Views */}
            {combinedViews.map(view => {
                const slugs = Array.isArray(view.slug) ? view.slug : [view.slug];
                return slugs.flatMap(slug => {
                    const routes = [
                        <Route key={slug} path={slug} element={<CustomViewRoute view={view} />} />
                    ];
                    if (view.nestedRoutes) {
                        routes.push(
                            <Route key={slug + "/*"} path={slug + "/*"} element={<CustomViewRoute view={view} />} />
                        );
                    }
                    return routes;
                });
            })}

            {/* User Provided Custom Routes */}
            {children}

            <Route path={"*"} element={<NotFoundPage />} />
        </>
    );

    return (
        <>
            <RebaseRoutes>
                {layout
                    ? <Route element={layout}>{routeContents}</Route>
                    : <Route element={<>{routeContents}</>}>{routeContents}</Route>
                }
            </RebaseRoutes>
            <CollectionEditorDialogs />
        </>
    );
}
