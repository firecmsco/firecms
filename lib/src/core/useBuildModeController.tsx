import { useMediaQuery } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";

import { ModeController } from "../hooks/useModeController";

/**
 * Use this hook to build a color mode controller that determines
 * the theme of the CMS
 */
export function useBuildModeController(): ModeController {

    const prefersDarkModeQuery = useMediaQuery("(prefers-color-scheme: dark)");
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
    }, [prefersDarkModeQuery]);

    const setLightMode = useCallback(() => {
        setMode("light");
        setDocumentMode("light");
    }, []);

    const setDocumentMode = useCallback((mode: "light" | "dark") => {
        document.body.style.setProperty("color-scheme", mode);
    }, [document]);

    const toggleMode = useCallback(() => {

        if (mode === "light") {
            if (!prefersDarkModeQuery)
                localStorage.setItem("prefers-dark-mode", "true");
            else
                localStorage.removeItem("prefers-dark-mode");
            setDarkMode();
        } else {
            if (prefersDarkModeQuery)
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
