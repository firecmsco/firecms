"use client";
import { useEffect } from "react";
import { usePortalContainer } from "./PortalContainerContext";

/**
 * Use this hook to create a `<style>` element and inject it into the DOM.
 * It checks if the style already exists, and if it does, it does not inject it again.
 * @param key
 * @param styles
 */
export function useInjectStyles(key: string, styles: string) {

    const portalContainer = usePortalContainer();

    useEffect(() => {
        if (typeof document === "undefined") return;

        const targetContainer: HTMLElement | null = portalContainer ?? document.head;

        // Try to find an existing style element within the target container first
        const existingStyle = (targetContainer as HTMLElement).querySelector?.(`#${key}`) as HTMLStyleElement | null;

        if (!existingStyle) {
            const style = document.createElement("style");
            style.id = key;
            style.innerHTML = styles;
            (targetContainer || document.head).appendChild(style);
        }
    }, []);

}
