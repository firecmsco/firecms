import { useState, useEffect } from "react";

export const useLargeLayout = (): boolean => {
    const [isLargeLayout, setIsLargeLayout] = useState<boolean>(false);

    useEffect(() => {
        const handleResize = () => {
            const matched = window.matchMedia("(min-width: 1025px)").matches;
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
