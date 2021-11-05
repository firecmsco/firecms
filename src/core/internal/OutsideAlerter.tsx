import React, { useEffect } from "react";

interface OutsideAlerterProps {
    children: React.ReactNode,
    enabled: boolean,
    onOutsideClick: () => void;
}

/**
 * Component that alerts if you click outside of it
 */
export function OutsideAlerter({
                                   children,
                                   enabled,
                                   onOutsideClick
                               }: OutsideAlerterProps) {

    const ref = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event: any) {
            if (enabled && !(ref?.current?.contains(event.target))) {
                onOutsideClick();
            }
        }

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    });

    return <div
        style={{ height: "100%", width: "100%" }}
        ref={ref}>
        {children}
    </div>;
}
