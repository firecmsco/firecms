import React, { RefObject, useEffect } from "react";

/**
 * Hook that alerts clicks outside the passed ref
 */
export function useOutsideAlerter(ref: RefObject<HTMLElement>, onOutsideClick: () => void, active = true): void {
    useEffect(() => {
        if (!active)
            return;

        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event: Event) {
            if (isInPresentationLayer(event.target as Node)) {
                return;
            }

            if (ref.current && !ref.current.contains(event.target as Node)) {
                onOutsideClick();
            }
        }

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, active, onOutsideClick]);
}

/**
 * Check if any parent of the node is a presentation node
 * @param node
 */
function isInPresentationLayer(node: Node | null) {
    if (node instanceof HTMLElement) {
        if (node.getAttribute("role") === "presentation")
            return true;
        return isInPresentationLayer(node.parentNode);
    }
    return false;
}
