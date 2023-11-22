import React from "react";
import { useLocation } from "@docusaurus/router";
import NavbarNavLink from "@theme-original/NavbarItem/NavbarNavLink";

export default function NavbarNavLinkWrapper(props) {
    const { pathname } = useLocation();
    if (pathname.startsWith("/docs/") && props.children === "Demo") {
        return null;
    }
    return (
        <>
            <NavbarNavLink {...props} />
        </>
    );
}
