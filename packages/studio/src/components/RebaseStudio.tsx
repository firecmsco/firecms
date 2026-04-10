import React, { useLayoutEffect, useMemo } from "react";
import { useRebaseRegistryDispatch } from "@rebasepro/core";
import type { RebaseStudioConfig, AppView } from "@rebasepro/types";

import { SQLEditor } from "./SQLEditor/SQLEditor";
import { JSEditor } from "./JSEditor/JSEditor";
import { RLSEditor } from "./RLSEditor/RLSEditor";
import { StorageView } from "./StorageView/StorageView";

/**
 * Declarative component to configure the Studio in Rebase.
 * Renders nothing — purely registers config into the RebaseRegistry.
 *
 * The "schema" tool (collection editor) is no longer built-in.
 * It now lives in `@rebasepro/cms` and can be injected via the
 * `additionalViews` prop.
 */
export function RebaseStudio({ configController, tools, homePage, additionalViews }: RebaseStudioConfig & { additionalViews?: AppView[] }) {
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
        // Append any additional views (e.g. schema editor from CMS)
        if (additionalViews) {
            views.push(...additionalViews);
        }
        return views;
    }, [tools, configController, additionalViews]);

    useLayoutEffect(() => {
        dispatch.registerStudio({ configController, tools, homePage, devViews });
        return () => dispatch.unregisterStudio();
    }, [dispatch, configController, tools, homePage, devViews]);

    return null;
}
