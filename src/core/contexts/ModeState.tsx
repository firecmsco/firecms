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

    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const [mode, setMode] = useState<"light" | "dark">(prefersDarkMode ? "dark" : "light");

    useEffect(() => {
        setMode(prefersDarkMode ? "dark" : "light");
    }, [prefersDarkMode]);

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
