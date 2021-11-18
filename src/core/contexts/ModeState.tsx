import { useMediaQuery } from "@mui/material";
import React, { useEffect, useState } from "react";
import { ModeState } from "../../hooks";

const DEFAULT_MODE_STATE: ModeState = {
    mode: "light",
    setMode: (mode: "light" | "dark") => {
    },
    toggleMode: () => {
    }
};


export const ModeStateContext = React.createContext<ModeState>(DEFAULT_MODE_STATE);


interface ModeProviderProps {
    children: React.ReactNode;
}

export const ModeProvider: React.FC<ModeProviderProps> = ({ children }) => {

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

    return (
        <ModeStateContext.Provider
            value={{
                mode,
                setMode,
                toggleMode
            }}
        >
            {children}
        </ModeStateContext.Provider>
    );
};
