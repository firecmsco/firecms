import { useMediaQuery } from "@mui/material";
import React, { useState, useEffect } from "react";

import { ModeController } from "../hooks/useModeController";

export function useBuildModeController(): ModeController {

    const prefersDarkModeQuery = useMediaQuery("(prefers-color-scheme: dark)");
    const prefersDarkModeStorage: boolean | null = localStorage.getItem("prefers-dark-mode") != null ? localStorage.getItem("prefers-dark-mode") === "true" : null;
    const prefersDarkMode = prefersDarkModeStorage ?? prefersDarkModeQuery;
    const [mode, setMode] = useState<"light" | "dark">(prefersDarkMode ? "dark" : "light");

    useEffect(() => {
        setMode(prefersDarkMode ? "dark" : "light");
    }, [prefersDarkMode]);

    const toggleMode = () => {
        if (mode === "light") {
            if (!prefersDarkModeQuery)
                localStorage.setItem("prefers-dark-mode", "true");
            else
                localStorage.removeItem("prefers-dark-mode");
            setMode("dark");
        } else {
            if (prefersDarkModeQuery)
                localStorage.setItem("prefers-dark-mode", "false");
            else
                localStorage.removeItem("prefers-dark-mode");
            setMode("light");
        }
    };

    return {
        mode,
        setMode,
        toggleMode
    };
}
