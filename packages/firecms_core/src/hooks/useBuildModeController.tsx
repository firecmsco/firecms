import { useCallback, useEffect, useState } from "react";

import { ModeController } from "./index";

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

    const prefersDarkModeStorage: boolean | null = localStorage.getItem("prefers-dark-mode") != null ? localStorage.getItem("prefers-dark-mode") === "true" : null;
    const prefersDarkMode = prefersDarkModeStorage ?? prefersDarkModeQuery();
    const [mode, setMode] = useState<"light" | "dark" | "system">(prefersDarkMode ? "dark" : "light");

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
            localStorage.setItem("prefers-dark-mode", "false");
        } else if (mode === "dark") {
            setDocumentMode("dark");
            localStorage.setItem("prefers-dark-mode", "true");
        } else {
            setDocumentMode(prefersDarkModeQuery() ? "dark" : "light");
            localStorage.removeItem("prefers-dark-mode");
        }
        setMode(mode);
    }, [prefersDarkModeQuery]);

    return {
        mode,
        setMode: setModeInternal
    };
}
