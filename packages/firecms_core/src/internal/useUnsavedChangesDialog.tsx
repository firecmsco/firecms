import React, { useCallback, useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@firecms/ui";

/**
 * Type representing a pending navigation action.
 */
type PendingNavigation =
    | {
    type: "popstate";
    delta: number;
}
    | {
    type: "link";
    href: string;
}
    | null;

/**
 * Custom hook to handle navigation blocking when there are unsaved changes.
 *
 * @param when - Indicates whether to block navigation.
 * @param onSuccess - Callback invoked when navigation is confirmed.
 * @returns An object containing the state of navigation blocking and handlers.
 */
export function useNavigationUnsavedChangesDialog(
    when: boolean,
    onSuccess: () => void
): {
    navigationWasBlocked: boolean;
    handleCancel: () => void;
    handleOk: () => void;
} {
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [pendingNavigation, setPendingNavigation] = useState<PendingNavigation>(null);

    /**
     * Handler to cancel the navigation attempt.
     */
    const handleCancel = useCallback(() => {
        setIsDialogOpen(false);
        setPendingNavigation(null);
    }, []);

    /**
     * Handler to confirm and proceed with the navigation.
     */
    const handleOk = useCallback(() => {
        setIsDialogOpen(false);
        if (pendingNavigation) {
            onSuccess();
            if (pendingNavigation.type === "popstate") {
                window.history.go(pendingNavigation.delta);
            } else if (pendingNavigation.type === "link") {
                window.location.href = pendingNavigation.href;
            }
            setPendingNavigation(null);
        }
    }, [onSuccess, pendingNavigation]);

    /**
     * Event handler for beforeunload to handle page refresh or tab close.
     */
    const handleBeforeUnload = useCallback(
        (e: BeforeUnloadEvent) => {
            if (when) {
                e.preventDefault();
                e.returnValue = "";
            }
        },
        [when]
    );

    /**
     * Event handler for popstate to handle back and forward browser buttons.
     */
    const handlePopState = useCallback(
        (e: PopStateEvent) => {
            if (when) {
                e.preventDefault();
                // Assuming backward navigation; adjust delta as needed
                setPendingNavigation({
                    type: "popstate",
                    delta: -1
                });
                setIsDialogOpen(true);
            }
        },
        [when]
    );

    /**
     * Event handler to intercept link clicks within the application.
     */
    const handleLinkClick = useCallback(
        (e: MouseEvent) => {
            if (!when) return;

            const target = e.target as HTMLElement;
            const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
            if (anchor && anchor.host === window.location.host) {
                e.preventDefault();
                const href = anchor.getAttribute("href");
                if (href) {
                    setPendingNavigation({
                        type: "link",
                        href
                    });
                    setIsDialogOpen(true);
                }
            }
        },
        [when]
    );

    /**
     * Effect hook to add and clean up event listeners based on the `when` condition.
     */
    useEffect(() => {
        if (when) {
            window.addEventListener("beforeunload", handleBeforeUnload);
            window.addEventListener("popstate", handlePopState);
            document.addEventListener("click", handleLinkClick);
        } else {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("popstate", handlePopState);
            document.removeEventListener("click", handleLinkClick);
        }

        // Cleanup on unmount or when `when` changes
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("popstate", handlePopState);
            document.removeEventListener("click", handleLinkClick);
        };
    }, [when, handleBeforeUnload, handlePopState, handleLinkClick]);

    return {
        navigationWasBlocked: isDialogOpen,
        handleCancel,
        handleOk,
    };
}
