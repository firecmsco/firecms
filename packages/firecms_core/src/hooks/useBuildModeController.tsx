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
    const prefersDarkMode = prefersDarkModeStorage ?? prefersDarkModeQuery;
    const [mode, setMode] = useState<"light" | "dark">(prefersDarkMode ? "dark" : "light");

    useEffect(() => {
        setMode(prefersDarkMode ? "dark" : "light");
        setDocumentMode(prefersDarkMode ? "dark" : "light");
    }, [prefersDarkMode]);

    // color-scheme: dark;
    const setDarkMode = useCallback(() => {
        setMode("dark");
        setDocumentMode("dark");
    }, []);

    const setLightMode = useCallback(() => {
        setMode("light");
        setDocumentMode("light");
    }, []);

    const setDocumentMode = (mode: "light" | "dark") => {
        document.body.style.setProperty("color-scheme", mode);
        document.documentElement.dataset.theme = mode;
    };

    const toggleMode = useCallback(() => {

        const prefersDarkModeQueryResult = prefersDarkModeQuery();
        if (mode === "light") {
            if (!prefersDarkModeQueryResult)
                localStorage.setItem("prefers-dark-mode", "true");
            else
                localStorage.removeItem("prefers-dark-mode");
            setDarkMode();
        } else {
            if (prefersDarkModeQueryResult)
                localStorage.setItem("prefers-dark-mode", "false");
            else
                localStorage.removeItem("prefers-dark-mode");
            setLightMode();
        }
    }, [mode, prefersDarkModeQuery]);

    return {
        mode,
        setMode,
        toggleMode
    };
}
