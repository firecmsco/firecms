import { useCallback, useEffect, useState } from "react";

import { ModeController } from "./index";
import { getLocalStorageItem, removeLocalStorageItem, setLocalStorageItem } from "../util/local_storage";

/**
 * Use this hook to build a color mode controller that determines
 * the theme of the CMS
 */
export function useBuildModeController(): ModeController {

    const prefersDarkModeQuery = useCallback((): boolean => {
        if (typeof window === "undefined")
            return false;
        const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
        return mediaQueryList.matches;
    }, []);

    const storedMode = getLocalStorageItem("prefers-dark-mode");
    const prefersDarkModeStorage: boolean | null = storedMode != null ? storedMode === "true" : null;
    const prefersDarkMode = prefersDarkModeStorage ?? prefersDarkModeQuery();
    const [mode, setMode] = useState<"light" | "dark">(prefersDarkMode ? "dark" : "light");

    useEffect(() => {
        setMode(prefersDarkMode ? "dark" : "light");
        setDocumentMode(prefersDarkMode ? "dark" : "light");
    }, [prefersDarkMode]);

    const setDocumentMode = (mode: "light" | "dark") => {
        document.body.style.setProperty("color-scheme", mode);
        document.documentElement.dataset.theme = mode;
    };

    const setModeInternal = useCallback((mode: "light" | "dark" | "system") => {
        if (mode === "light") {
            setDocumentMode("light");
            setLocalStorageItem("prefers-dark-mode", "false");
            setMode("light");
        } else if (mode === "dark") {
            setDocumentMode("dark");
            setLocalStorageItem("prefers-dark-mode", "true");
            setMode("dark");
        } else {
            const preferredMode = prefersDarkModeQuery() ? "dark" : "light";
            setDocumentMode(preferredMode);
            removeLocalStorageItem("prefers-dark-mode");
            setMode(preferredMode);
        }
    }, [prefersDarkModeQuery]);

    return {
        mode,
        setMode: setModeInternal
    };
}
