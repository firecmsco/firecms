import { useCallback, useState } from "react";
import { AdminModeController } from "./index";

/**
 * Use this hook to build an admin mode controller that determines
 * whether the UI shows Developer or Editor tools.
 */
export function useBuildAdminModeController(): AdminModeController {

    const savedMode = typeof window !== "undefined" ? localStorage.getItem("rebase-admin-mode") as "content" | "studio" | "settings" | null : null;
    const [mode, setMode] = useState<"content" | "studio" | "settings">(savedMode ?? "content");

    const setModeInternal = useCallback((newMode: "content" | "studio" | "settings") => {
        if (typeof window !== "undefined") {
            localStorage.setItem("rebase-admin-mode", newMode);
        }
        setMode(newMode);
    }, []);

    return {
        mode,
        setMode: setModeInternal
    };
}
