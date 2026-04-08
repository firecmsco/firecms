import React from "react";

interface AppLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    children: React.ReactNode;
}

export function AppLink({
    href,
    children,
    ...props
}: AppLinkProps) {
    return (
        <a {...props} href={href}>
            {children}
        </a>
    );
}
