import React, { useEffect, useState } from "react";
import { appendGclidToUrl, getCurrentGclid } from "./utils/gclid";

interface AppLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    children: React.ReactNode;
}

export function AppLink({
                            href,
                            children,
                            ...props
                        }: AppLinkProps) {
    const [finalHref, setFinalHref] = useState(href);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const gclid = getCurrentGclid();
            setFinalHref(appendGclidToUrl(href, gclid));
        }
    }, [href]);

    return (
        <a {...props} href={finalHref}>
            {children}
        </a>
    );
}
