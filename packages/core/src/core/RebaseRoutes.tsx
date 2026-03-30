import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useNavigationStateController } from "../hooks";
import { CustomCMSRoute } from "../routes/CustomCMSRoute";

/**
 * A drop-in replacement for react-router's `<Routes>` that preserves the
 * underlying view when a side dialog navigates the URL to a different path.
 *
 * When opening a side dialog from e.g. `/posts` to `authors/123#side`,
 * the `base_location` stored in router state is used so the route tree
 * keeps rendering the original `/posts` view underneath the dialog overlay.
 *
 * Additionally, registered views from `useNavigationStateController()` are
 * automatically routed — no need to manually map them to `<Route>` elements.
 * Views with `nestedRoutes: true` get a wildcard route (slug/*) as well.
 * Explicitly declared `children` routes take priority.
 */
export function RebaseRoutes({ children }: { children?: React.ReactNode }) {
    const location = useLocation();
    const state = location.state as any;
    const baseLocation = state?.base_location ?? location;

    const { views, adminViews } = useNavigationStateController();

    const allViews = [...(views ?? []), ...(adminViews ?? [])];

    return (
        <Routes location={baseLocation}>
            {children}
            {allViews.map(view => {
                const slugs = Array.isArray(view.slug) ? view.slug : [view.slug];
                return slugs.flatMap(slug => {
                    const routes = [
                        <Route key={slug} path={slug} element={<CustomCMSRoute cmsView={view} />} />
                    ];
                    if (view.nestedRoutes) {
                        routes.push(
                            <Route key={slug + "/*"} path={slug + "/*"} element={<CustomCMSRoute cmsView={view} />} />
                        );
                    }
                    return routes;
                });
            })}
        </Routes>
    );
}
