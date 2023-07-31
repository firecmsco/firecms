import { useEffect, useState } from "react";

const breakpoints = {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
    "3xl": 1920
}
export const useLargeLayout = (breakpoint: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" = "lg"): boolean => {
    const [isLargeLayout, setIsLargeLayout] = useState<boolean>(false);

    useEffect(() => {
        const handleResize = () => {
            const matched = window.matchMedia(`(min-width: ${breakpoints[breakpoint] + 1}px)`).matches;
            setIsLargeLayout(matched);
        };

        // Set initial state
        handleResize();

        // Set up event listener for resize events
        window.addEventListener("resize", handleResize);

        // Clean up event listener when component unmounts
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return isLargeLayout;
};
