import React from "react";
import { Outlet } from "react-router-dom";
import {
    useAdminModeController,
    useRebaseRegistry,
} from "@rebasepro/core";

import { Scaffold } from "./app/Scaffold";
import { AppBar } from "./app/AppBar";
import { Drawer } from "./app/Drawer";
import { SideDialogs } from "./SideDialogs";
import { AdminModeSyncer } from "./AdminModeSyncer";
import type { AppView } from "@rebasepro/types";

export interface RebaseLayoutProps {
    /** Title shown in the drawer. */
    title?: string;
    /** Custom AppBar to override the default. */
    appBar?: React.ReactNode;
    /** Custom Drawer to override the default. */
    drawer?: React.ReactNode;
    /** Whether to auto-open the drawer on load. */
    autoOpenDrawer?: boolean;
    /** Dev views passed to AdminModeSyncer (resolved from RebaseNavigation). */
    devViews?: AppView[];
}

/**
 * Layout layer — provides the Scaffold, AppBar, Drawer, and SideDialogs.
 *
 * Wraps the route outlet with the standard Rebase admin layout.
 * Override individual pieces (appBar, drawer) via props.
 *
 * **Independently usable**: Use this when you want the Rebase layout
 * without its default route definitions.
 *
 * @example
 * ```tsx
 * <RebaseLayout title="My Admin">
 *   <Route path="/" element={<MyHomePage />} />
 *   <Route path="/custom" element={<CustomView />} />
 * </RebaseLayout>
 * ```
 */
export function RebaseLayout(props: RebaseLayoutProps) {
    const {
        title = "Rebase",
        appBar,
        drawer,
        autoOpenDrawer = false,
        devViews = [],
    } = props;

    const adminModeController = useAdminModeController();

    const ActiveAppBar = appBar ?? <AppBar />;
    const ActiveDrawer = drawer ?? (
        <Drawer
            title={title}
            logoDestination={adminModeController.mode === "studio" ? "/s" : "/"}
        />
    );

    return (
        <Scaffold autoOpenDrawer={autoOpenDrawer}>
            <AdminModeSyncer devViews={devViews} />
            {ActiveAppBar}
            {ActiveDrawer}
            <Outlet />
            <SideDialogs />
        </Scaffold>
    );
}
