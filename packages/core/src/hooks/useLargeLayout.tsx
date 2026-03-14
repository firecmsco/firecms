import { useEffect, useState } from "react";

type LayoutListener = (isLargeLayout: boolean) => void;

const breakpoints = {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
    "3xl": 1920
}

// Global state and listeners array
let isLargeLayoutGlobal = checkLargeLayout("lg"); // Default value
const listeners: LayoutListener[] = [];

// Utility to notify all listeners
const notifyListeners = () => {
    listeners.forEach(listener => listener(isLargeLayoutGlobal));
};

// Listen to resize events once, at a global level
if (typeof window !== "undefined")
    window.addEventListener("resize", () => {
        const newIsLargeLayout = checkLargeLayout("lg");
        if (newIsLargeLayout !== isLargeLayoutGlobal) {
            isLargeLayoutGlobal = newIsLargeLayout;
            notifyListeners();
        }
    });

export const useLargeLayout = () => {
    const [isLargeLayout, setIsLargeLayout] = useState(isLargeLayoutGlobal);

    useEffect(() => {
        // Listener function to update component state
        const listener: LayoutListener = (newIsLargeLayout) => {
            setIsLargeLayout(newIsLargeLayout);
        };

        // Register listener
        listeners.push(listener);

        // Initial state
        setIsLargeLayout(isLargeLayoutGlobal);

        // Clean up by removing the listener
        return () => {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, []);

    return isLargeLayout;
};

function checkLargeLayout(breakpoint: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" = "lg"): boolean {
    if (typeof window === "undefined")
        return false;
    return window.matchMedia(`(min-width: ${breakpoints[breakpoint] + 1}px)`).matches;
}
