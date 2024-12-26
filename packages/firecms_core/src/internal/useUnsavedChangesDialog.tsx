import { useCallback, useEffect, useState } from "react";
import { useNavigationController } from "../hooks";

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
 * @param key
 * @param when - Indicates whether to block navigation.
 * @param onSuccess - Callback invoked when navigation is confirmed.
 * @param basePath
 *
 * @returns An object containing the state of navigation blocking and handlers.
 */
export function useNavigationUnsavedChangesDialog(
    key:string,
    when: boolean,
    onSuccess: () => void,
    basePath?: string // ignore changes of route between urls starting with
): {
    navigationWasBlocked: boolean;
    handleCancel: () => void;
    handleOk: () => void;
} {

    const [pendingNavigation, setPendingNavigation] = useState<PendingNavigation>(null);
    const navigation = useNavigationController();

    useEffect(() => {
        return navigation.blocker.updateBlockListener(key, when, basePath);
    }, [when, basePath])

    /**
     * Handler to cancel the navigation attempt.
     */
    const handleCancel = useCallback(() => {
        navigation.blocker?.reset?.();
        setPendingNavigation(null);
    }, [navigation.blocker]);

    /**
     * Handler to confirm and proceed with the navigation.
     */
    const handleOk = useCallback(() => {
        navigation.blocker?.proceed?.();
        if (pendingNavigation) {
            onSuccess();
            if (pendingNavigation.type === "popstate") {
                window.history.go(pendingNavigation.delta);
            } else if (pendingNavigation.type === "link") {
                window.location.href = pendingNavigation.href;
            }
            setPendingNavigation(null);
        }
    }, [onSuccess, pendingNavigation, navigation.blocker]);

    useEffect(() => {
        function beforeunload(e: any) {
            if (when) {
                e.preventDefault();
                e.returnValue = "You have unsaved changes in this document. Are you sure you want to leave this page?";
            }
        }

        if (typeof window !== "undefined")
            window.addEventListener("beforeunload", beforeunload);

        return () => {
            if (typeof window !== "undefined")
                window.removeEventListener("beforeunload", beforeunload);
        };

    }, [when]);

    return {
        navigationWasBlocked: navigation.blocker.isBlocked(key),
        handleCancel,
        handleOk
    };
}
