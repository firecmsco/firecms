import { useCallback, useEffect, useState } from "react";
import { useBlocker } from "react-router-dom";
import { UnsavedChangesDialogProps } from "../components/UnsavedChangesDialog";

/**
 * A single, unified hook to prevent navigation when there are unsaved changes.
 * 
 * It automatically handles:
 * 1. Internal React Router navigation using `useBlocker`.
 * 2. External browser navigation (page refresh, tab close) using `beforeunload`.
 */
export function useUnsavedChangesDialog(
    when: boolean,
    onOk: () => void
): {
    dialogProps: UnsavedChangesDialogProps;
    triggerDialog: () => void;
} {
    const [manualDialogOpen, setManualDialogOpen] = useState(false);

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            when && currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        if (!when) return;
        
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = ""; 
        };
        
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [when]);

    const handleOk = useCallback(() => {
        onOk();
        if (blocker.state === "blocked") {
            blocker.proceed();
        }
        setManualDialogOpen(false);
    }, [blocker, onOk]);

    const handleCancel = useCallback(() => {
        if (blocker.state === "blocked") {
            blocker.reset();
        }
        setManualDialogOpen(false);
    }, [blocker]);

    return {
        dialogProps: {
            open: manualDialogOpen || blocker.state === "blocked",
            handleOk,
            handleCancel,
            body: "There are unsaved changes in this collection"
        },
        triggerDialog: () => setManualDialogOpen(true)
    };
}
