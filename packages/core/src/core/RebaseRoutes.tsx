import React from "react";
import { Routes, useLocation } from "react-router-dom";

/**
 * A drop-in replacement for react-router's `<Routes>` that preserves the
 * underlying view when a side dialog navigates the URL to a different path.
 *
 * When opening a side dialog from e.g. `/posts` to `authors/123#side`,
 * the `base_location` stored in router state is used so the route tree
 * keeps rendering the original `/posts` view underneath the dialog overlay.
 *
 * Use this instead of `<Routes>` in your app layout.
 */
export function RebaseRoutes({ children }: { children?: React.ReactNode }) {
    const location = useLocation();
    const state = location.state as any;
    const baseLocation = state?.base_location ?? location;

    return <Routes location={baseLocation}>{children}</Routes>;
}
