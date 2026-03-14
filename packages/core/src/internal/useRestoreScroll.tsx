import React, { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const scrollsMap: Record<string, number> = {};

export function useRestoreScroll() {

    const location = useLocation();

    const containerRef = useRef<HTMLDivElement>(null);
    const [scroll, setScroll] = React.useState(0);
    const [direction, setDirection] = React.useState<"up" | "down">("down");

    // Use ref to track previous scroll for direction calculation
    // This avoids recreating handleScroll on every scroll
    const prevScrollRef = useRef(0);

    const handleScroll = useCallback(() => {
        if (!containerRef.current || !location.key) return;
        const scrollTop = containerRef.current.scrollTop;
        scrollsMap[location.key] = scrollTop;
        setScroll(scrollTop);
        setDirection(scrollTop > prevScrollRef.current ? "down" : "up");
        prevScrollRef.current = scrollTop;
    }, [location.key]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            if (container)
                container.removeEventListener("scroll", handleScroll);
        };
    }, [handleScroll]);

    // Defer scroll restoration to next tick to allow async content to render
    // This is necessary because DefaultHomePage content loads asynchronously
    useEffect(() => {
        const savedScroll = scrollsMap[location.key];
        if (!containerRef.current || !savedScroll) return;

        const timeoutId = setTimeout(() => {
            if (!containerRef.current) return;
            containerRef.current.scrollTo({
                top: savedScroll,
                behavior: "auto"
            });
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [location.key]);

    return {
        containerRef,
        scroll,
        direction
    };
}
