import { useMediaQuery } from "@mui/material";
import React, { useContext, useState } from "react";

const DEFAULT_MODE_STATE: ModeState = {
    mode: "light",
    setMode: (mode: "light" | "dark") => {
    },
    toggleMode: () => {
    }
};

/**
 * @category Hooks and utilities
 */
export interface ModeState {
    mode: "light" | "dark";
    setMode: (mode: "light" | "dark") => void;
    toggleMode: () => void;
}

export const ModeStateContext = React.createContext<ModeState>(DEFAULT_MODE_STATE);

/**
 * Hook to retrieve the current mode ("light" | "dark"), and `setMode`
 * or `toggle` functions to change it.
 *
 * Consider that in order to use this hook you need to have a parent
 * `CMSAppProvider`
 *
 * @see ModeState
 * @category Hooks and utilities
 */
export const useModeState = () => useContext(ModeStateContext);

interface ModeProviderProps {
    children: React.ReactNode;
}

export const ModeProvider: React.FC<ModeProviderProps> = ({ children }) => {

    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const [mode, setMode] = useState<"light" | "dark">(prefersDarkMode ? "dark" : "light");

    const toggleMode = () => {
        if (mode === "light") setMode("dark");
        else setMode("light");
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
