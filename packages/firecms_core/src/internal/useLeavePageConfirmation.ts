import { useEffect } from "react";

/**
 * Asks the browser to confirm leaving the page (reload, tab close, a link that
 * loads another document) while `when` is true.
 *
 * Navigation inside the app is not intercepted: unsaved entity values are kept
 * in the dirty entity cache, so they survive it. Cancelling link clicks here
 * used to leave plain and new-tab links doing nothing, with no dialog shown.
 *
 * @param when - Whether leaving the page should be confirmed.
 */
export function useLeavePageConfirmation(when: boolean): void {
    useEffect(() => {
        if (!when) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [when]);
}
