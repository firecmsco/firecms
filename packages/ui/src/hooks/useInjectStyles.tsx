"use client";
import { useEffect } from "react";

/**
 * Use this hook to create a `<style>` element and inject it into the DOM.
 * It checks if the style already exists, and if it does, it does not inject it again.
 * @param key
 * @param styles
 */
export function useInjectStyles(key: string, styles: string) {

    useEffect(() => {
        const styleElement = document.getElementById(key);
        if (!styleElement) {
            const style = document.createElement("style");
            style.id = key;
            style.innerHTML = styles;
            document.head.appendChild(style);
        }
    }, []);

}
