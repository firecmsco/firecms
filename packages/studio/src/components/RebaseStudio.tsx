import React, { useLayoutEffect, useMemo } from "react";
import { useRebaseRegistryDispatch } from "@rebasepro/core";
import type { RebaseStudioConfig, AppView } from "@rebasepro/types";

import { SQLEditor } from "./SQLEditor/SQLEditor";
import { JSEditor } from "./JSEditor/JSEditor";
import { RLSEditor } from "./RLSEditor/RLSEditor";
import { StorageView } from "./StorageView/StorageView";
import { CollectionsStudioView } from "../ui/collection_editor/CollectionsStudioView";

/**
 * Declarative component to configure the Studio in Rebase.
 * Renders nothing — purely registers config into the RebaseRegistry.
 */
export function RebaseStudio({ configController, tools, homePage }: RebaseStudioConfig) {
    const dispatch = useRebaseRegistryDispatch();
    
    const devViews: AppView[] = useMemo(() => {
        const views: AppView[] = [];
        const activeTools = tools ?? ["sql", "js", "rls", "schema", "storage"];
        
        if (activeTools.includes("sql")) {
            views.push({ slug: "sql", name: "SQL Console", group: "Database", icon: "terminal", description: "Execute SQL queries", view: <SQLEditor /> });
        }
        if (activeTools.includes("js")) {
            views.push({ slug: "js", name: "JS Console", group: "Database", icon: "code", description: "Execute JavaScript", view: <JSEditor /> });
        }
        if (activeTools.includes("rls")) {
            views.push({ slug: "rls", name: "RLS Policies", group: "Database", icon: "security", description: "Row Level Security", view: <RLSEditor /> });
        }
        if (activeTools.includes("schema")) {
            views.push({ slug: "schema", name: "Edit collections", group: "Schema", icon: "view_list", nestedRoutes: true, view: <CollectionsStudioView configController={configController} /> });
        }
        if (activeTools.includes("storage")) {
            views.push({ slug: "storage", name: "Storage", group: "Storage", icon: "cloud", description: "Manage storage files", view: <StorageView /> });
        }
        return views;
    }, [tools, configController]);

    useLayoutEffect(() => {
        dispatch.registerStudio({ configController, tools, homePage, devViews });
        return () => dispatch.unregisterStudio();
    }, [dispatch, configController, tools, homePage, devViews]);

    return null;
}
