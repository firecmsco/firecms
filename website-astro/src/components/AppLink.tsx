import React, { useEffect, useState } from "react";
import { appendTrackingParamsToUrl, getCurrentTrackingParams } from "../utils/gclid";

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
            // Only append tracking params for app.firecms.co links
            if (href.includes("app.firecms.co")) {
                const trackingParams = getCurrentTrackingParams();
                setFinalHref(appendTrackingParamsToUrl(href, trackingParams));
            }
        }
    }, [href]);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Send Google Analytics event for app.firecms.co links
        if (href.includes("app.firecms.co") && typeof window !== "undefined" && typeof (window as any).gtag === "function") {
            (window as any).gtag('event', 'go_to_app', {
                event_category: 'navigation',
                event_label: finalHref,
                page_path: window.location.pathname,
                link_text: typeof children === 'string' ? children : '',
                link_url: finalHref
            });
        }

        // Call original onClick if provided
        if (props.onClick) {
            props.onClick(e);
        }
    };

    return (
        <a {...props} href={finalHref} onClick={handleClick}>
            {children}
        </a>
    );
}
