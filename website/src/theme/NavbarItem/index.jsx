import React from "react";
import NavbarItem from "@theme-original/NavbarItem";
import { useLocation } from "@docusaurus/router";

export default function NavbarItemWrapper(props) {
    const {
        customProps,
        ...restProps
    } = props;

    const location = useLocation();

    // This function will be called on every click.
    const handleClick = () => {
        if (typeof window.gtag === "function" && customProps?.eventName) {
            window.gtag("event", customProps.eventName, {
                event_category: "navbar",
                event_label: props.label || props.to || props.href,
                page_path: location.pathname,
            });
        }
    };

    return (
        <NavbarItem {...restProps}
                    onClick={customProps?.eventName ? handleClick : undefined}
        />
    );
}
