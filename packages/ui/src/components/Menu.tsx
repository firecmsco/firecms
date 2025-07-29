"use client";
import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { focusedDisabled, paperMixin } from "../styles";
import { cls } from "../util";

export type MenuProps = {
    children: React.ReactNode;
    trigger: React.ReactNode;

    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?(open: boolean): void;

    portalContainer?: HTMLElement | null;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";

    sideOffset?: number;
    className?: string;
}

const Menu = React.forwardRef<
    React.ElementRef<typeof DropdownMenu.Trigger>,
    MenuProps
>(({
       children,
       trigger,
       open,
       defaultOpen,
       side,
       align,
       onOpenChange,
       portalContainer,
       sideOffset = 4,
                                    className
   }, ref) => (
    <DropdownMenu.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}>
        <DropdownMenu.Trigger
            ref={ref}
            asChild>
            {trigger}
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal container={portalContainer}>
            <DropdownMenu.Content
                side={side}
                sideOffset={sideOffset}
                align={align}
                className={cls(paperMixin, focusedDisabled, "shadow-2xs py-2 z-30", className)}>
                {children}
            </DropdownMenu.Content>
        </DropdownMenu.Portal>
    </DropdownMenu.Root>
))
Menu.displayName = "Menu"

export { Menu }

export type MenuItemProps = {
    children: React.ReactNode;
    dense?: boolean;
    onClick?: (event: React.MouseEvent) => void;
    className?: string;
};

export function MenuItem({
                             children,
                             dense = false, // Default value is false if not provided
                             onClick,
                             className
                         }: MenuItemProps) {
    // Dynamically adjusting the class based on the "dense" prop
    const classNames = cls(
        onClick && "cursor-pointer",
        "rounded-md text-sm font-medium text-surface-accent-700 dark:text-surface-accent-300 hover:bg-surface-accent-100 dark:hover:bg-surface-accent-900 flex items-center gap-4",
        dense ? "px-3 py-1.5" : "px-4 py-2",
        className
    );

    return (
        <DropdownMenu.Item
            className={classNames}
            onClick={onClick}>
            {children}
        </DropdownMenu.Item>
    );
}
