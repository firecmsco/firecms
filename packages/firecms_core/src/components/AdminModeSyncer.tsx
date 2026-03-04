import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CMSView } from "@firecms/types";
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
 * actively shifts the internal FireCMS `adminModeController` context to match
 * the user's active window segment (e.g., Content vs Studio mode).
 * 
 * Placing this anywhere safely inside the FireCMS layout automatically triggers
 * UI mode synchronization.
 */
export function AdminModeSyncer({ devViews }: AdminModeSyncerProps) {
    const location = useLocation();
    const cmsUrlController = useCMSUrlController();
    const adminModeController = useAdminModeController();

    useEffect(() => {
        const path = location.pathname;
        const isContentRoute = path.startsWith(`${cmsUrlController.baseCollectionPath}/`) || path === cmsUrlController.baseCollectionPath;
        const isStudioRoute = devViews?.some(view => {
            const viewPath = cmsUrlController.buildCMSUrlPath(view.slug);
            return path.startsWith(`${viewPath}/`) || path === viewPath;
        });

        if (isStudioRoute && adminModeController.mode !== "studio") {
            adminModeController.setMode("studio");
        } else if (isContentRoute && adminModeController.mode !== "content") {
            adminModeController.setMode("content");
        }
    }, [location.pathname, cmsUrlController, devViews, adminModeController]);

    return null;
}
