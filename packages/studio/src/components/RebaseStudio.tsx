import React, { useLayoutEffect, useMemo } from "react";
import { useRebaseRegistryDispatch } from "@rebasepro/core";
import type { RebaseStudioConfig, AppView } from "@rebasepro/types";

import { SQLEditor } from "./SQLEditor/SQLEditor";
import { JSEditor } from "./JSEditor/JSEditor";
import { RLSEditor } from "./RLSEditor/RLSEditor";
import { StorageView } from "./StorageView/StorageView";
import { StudioHomePage } from "./StudioHomePage";

/**
 * Declarative component to configure the Studio in Rebase.
 * Renders nothing — purely registers config into the RebaseRegistry.
 *
 * The "schema" tool (collection editor view) is now a built-in CMS feature.
 * When `<RebaseCMS collectionEditor={...}>` is used, the schema view is
 * automatically injected into Studio — no manual wiring needed.
 */
export function RebaseStudio({ tools, homePage = <StudioHomePage /> }: RebaseStudioConfig) {
    const dispatch = useRebaseRegistryDispatch();
    
    const devViews: AppView[] = useMemo(() => {
        const views: AppView[] = [];
        const activeTools = tools ?? ["sql", "js", "rls", "storage"];
        
        if (activeTools.includes("sql")) {
            views.push({ slug: "sql", name: "SQL Console", group: "Database", icon: "terminal", description: "Execute SQL queries", view: <SQLEditor /> });
        }
        if (activeTools.includes("js")) {
            views.push({ slug: "js", name: "JS Console", group: "Database", icon: "code", description: "Execute JavaScript", view: <JSEditor /> });
        }
        if (activeTools.includes("rls")) {
            views.push({ slug: "rls", name: "RLS Policies", group: "Database", icon: "security", description: "Row Level Security", view: <RLSEditor /> });
        }
        if (activeTools.includes("storage")) {
            views.push({ slug: "storage", name: "Storage", group: "Storage", icon: "cloud", description: "Manage storage files", view: <StorageView /> });
        }
        // Note: "schema" tool is auto-injected by RebaseShell when collectionEditor is enabled.
        // It is NOT registered here anymore.
        return views;
    }, [tools]);

    useLayoutEffect(() => {
        dispatch.registerStudio({ tools, homePage, devViews });
        return () => dispatch.unregisterStudio();
    }, [dispatch, tools, homePage, devViews]);

    return null;
}
