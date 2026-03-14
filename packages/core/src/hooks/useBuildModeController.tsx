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

    const [mode, setMode] = useState<"light" | "dark">(() => {
        const prefersDarkModeStorage = typeof window !== "undefined" && localStorage.getItem("prefers-dark-mode") != null 
            ? localStorage.getItem("prefers-dark-mode") === "true" 
            : null;
        const prefersDarkMode = prefersDarkModeStorage ?? prefersDarkModeQuery();
        return prefersDarkMode ? "dark" : "light";
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
            if (localStorage.getItem("prefers-dark-mode") == null) {
                setMode(e.matches ? "dark" : "light");
                setDocumentMode(e.matches ? "dark" : "light");
            }
        };
        
        // Initial setup
        setDocumentMode(mode);

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const setDocumentMode = (mode: "light" | "dark") => {
        if (mode === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    const setModeInternal = useCallback((mode: "light" | "dark" | "system") => {
        if (mode === "light") {
            setDocumentMode("light");
            localStorage.setItem("prefers-dark-mode", "false");
            setMode("light");
        } else if (mode === "dark") {
            setDocumentMode("dark");
            localStorage.setItem("prefers-dark-mode", "true");
            setMode("dark");
        } else {
            const preferredMode = prefersDarkModeQuery() ? "dark" : "light";
            setDocumentMode(preferredMode);
            localStorage.removeItem("prefers-dark-mode");
            setMode(preferredMode);
        }
    }, [prefersDarkModeQuery]);

    return {
        mode,
        setMode: setModeInternal
    };
}
