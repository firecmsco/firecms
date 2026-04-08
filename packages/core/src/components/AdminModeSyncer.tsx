import type { CMSView } from "@rebasepro/types";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
;
import { useAdminModeController, useCMSUrlController } from "../hooks";

export interface AdminModeSyncerProps {
    /**
     * Map of views designated as 'Studio' views.
     * Navigating to any of these views will automatically flag the admin mode as "studio".
     */
    devViews?: CMSView[];
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
    const cmsUrlController = useCMSUrlController();
    const adminModeController = useAdminModeController();

    // Keep track of the current mode using a ref to avoid adding it to the dependency array
    const currentModeRef = React.useRef(adminModeController.mode);
    currentModeRef.current = adminModeController.mode;

    useEffect(() => {
        const path = location.pathname;
        const isContentRoute = cmsUrlController.isUrlCollectionPath(path) || path === cmsUrlController.basePath;
        const isStudioRoute = path.startsWith("/s/") || path === "/s" || devViews?.some(view => {
            const viewPath = cmsUrlController.buildCMSUrlPath(view.slug);
            return path.startsWith(`${viewPath}/`) || path === viewPath;
        });

        if (isStudioRoute && currentModeRef.current !== "studio") {
            adminModeController.setMode("studio");
        } else if (isContentRoute && currentModeRef.current !== "content") {
            adminModeController.setMode("content");
        }
    }, [location.pathname, cmsUrlController, devViews, adminModeController]);

    return null;
}
