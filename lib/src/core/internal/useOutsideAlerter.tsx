import React, { RefObject, useEffect } from "react";

/**
 * Hook that alerts clicks outside of the passed ref
 */
export function useOutsideAlerter(ref: RefObject<HTMLElement>, onOutsideClick: () => void): void {
    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event: Event) {
            console.log("handleClickOutside", event.target);
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
    }, [ref, onOutsideClick]);
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
