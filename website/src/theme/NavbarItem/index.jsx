import React, { useEffect, useState } from "react";
import NavbarItem from "@theme-original/NavbarItem";
import { useLocation } from "@docusaurus/router";
import { getCurrentGclid } from "../../utils/gclid";

export default function NavbarItemWrapper(props) {
    const {
        customProps,
        ...restProps
    } = props;

    const location = useLocation();
    const linkUrl = restProps.href || restProps.to;
    const [finalLink, setFinalLink] = useState(linkUrl);

    useEffect(() => {
        if (linkUrl) {
            try {
                const url = new URL(linkUrl); // This will throw for relative paths
                const params = new URLSearchParams(location.search);
                params.forEach((value, key) => {
                    url.searchParams.append(key, value);
                });
                const storedGclid = getCurrentGclid();
                if (storedGclid && !url.searchParams.has("gclid")) {
                    url.searchParams.append("gclid", storedGclid);
                }
                setFinalLink(url.toString());
            } catch (e) {
                // Not a valid absolute URL, do nothing.
                setFinalLink(linkUrl);
            }
        } else {
            setFinalLink(linkUrl);
        }
    }, [linkUrl, location.search]);

    const handleClick = () => {
        if (typeof window.gtag === "function" && customProps?.eventName) {
            window.gtag("event", customProps.eventName, {
                event_category: "navbar",
                event_label: props.label || props.to || props.href,
                page_path: location.pathname,
            });
        }
    };

    const newProps = { ...restProps };
    if (restProps.href) {
        newProps.href = finalLink;
    } else if (restProps.to) {
        newProps.to = finalLink;
    }

    newProps.onClick = customProps?.eventName ? handleClick : props.onClick;

    return (
        <NavbarItem {...newProps} />
    );
}
