import React, { useEffect, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { ModeController } from "../../hooks";

const DEFAULT_MODE_STATE: ModeController = {
    mode: "light",
    setMode: (mode: "light" | "dark") => {
    },
    toggleMode: () => {
    }
};
export const ModeStateContext = React.createContext<ModeController>(DEFAULT_MODE_STATE);

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
