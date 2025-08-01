import React, { useEffect, useState } from "react";

interface AppLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    children: React.ReactNode;
}

export function AppLink({ href, children, ...props }: AppLinkProps) {
    const [finalHref, setFinalHref] = useState(href);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const gclid = params.get("gclid");
            if (gclid) {
                try {
                    const url = new URL(href);
                    url.searchParams.append("gclid", gclid);
                    setFinalHref(url.toString());
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }, [href]);

    return (
        <a href={finalHref} {...props}>
            {children}
        </a>
    );
}
