'use client';
import React from "react";
import Link from "next/link";
import { cls } from "@firecms/ui";
import { usePathname } from "next/navigation";

export type HeaderLinkProps = {
    href: string,
    children: React.ReactNode,
    className?: string
}

export function HeaderLink({ href, children, className }: HeaderLinkProps) {
    const pathname = usePathname();
    const isActive = pathname.startsWith(href);
    return (
        <Link href={href}
              className={cls("block uppercase py-2 text-sm font-semibold hover:text-secondary dark:text-surface-300",
                  isActive ? 'text-secondary' : 'text-surface-800',
                  className)}>
            {children}
        </Link>
    );
}
