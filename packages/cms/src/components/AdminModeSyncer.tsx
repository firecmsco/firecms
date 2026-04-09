import type { AppView } from "@rebasepro/types";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
;
import { useUrlController } from "../hooks";
import { useAdminModeController } from "@rebasepro/core";
export interface AdminModeSyncerProps {
    /**
     * Map of views designated as 'Studio' views.
     * Navigating to any of these views will automatically flag the admin mode as "studio".
     */
    devViews?: AppView[];
}

/**
 * A highly customizable utility component that observes react-router routes and
 * actively shifts the internal Rebase `adminModeController` context to match
 * the user's active window segment (e.g., Content vs Studio mode).
 * 
 * Placing this anywhere safely inside the Rebase layout automatically triggers
 * UI mode synchronization.
 */
export function AdminModeSyncer({ devViews }: AdminModeSyncerProps) {
    const location = useLocation();
    const urlController = useUrlController();
    const adminModeController = useAdminModeController();

    // Keep track of the current mode using a ref to avoid adding it to the dependency array
    const currentModeRef = React.useRef(adminModeController.mode);
    currentModeRef.current = adminModeController.mode;

    // Stable ref for setMode so it doesn't trigger the effect
    const setModeRef = React.useRef(adminModeController.setMode);
    setModeRef.current = adminModeController.setMode;

    useEffect(() => {
        const path = location.pathname;
        const isContentRoute = urlController.isUrlCollectionPath(path) || path === urlController.basePath;

        // Check both devViews slugs AND the studio home path (/s or basePath/s)
        const studioHomePath = urlController.basePath === "/" ? "/s" : `${urlController.basePath}/s`;
        const isStudioRoute = path === studioHomePath || path.startsWith(studioHomePath + "/") || devViews?.some(view => {
            const viewPath = urlController.buildAppUrlPath(view.slug);
            return path.startsWith(`${viewPath}/`) || path === viewPath;
        });

        if (isStudioRoute && currentModeRef.current !== "studio") {
            setModeRef.current("studio");
        } else if (isContentRoute && currentModeRef.current !== "content") {
            setModeRef.current("content");
        }
    }, [location.pathname, urlController, devViews]);

    return null;
}

