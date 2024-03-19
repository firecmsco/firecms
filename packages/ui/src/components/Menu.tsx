import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { focusedMixin, paperMixin } from "../styles";
import { cn } from "../util";

export type MenuProps = {
    children: React.ReactNode;
    trigger: React.ReactNode;

    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?(open: boolean): void;

    portalContainer?: HTMLElement | null;
}

export function Menu({
                         children,
                         trigger,
                         open,
                         defaultOpen,
                         onOpenChange,
                         portalContainer
                     }: MenuProps) {
    return (
        <DropdownMenu.Root
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}>
            <DropdownMenu.Trigger asChild>
                {trigger}
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal container={portalContainer}>
                <DropdownMenu.Content className={cn(paperMixin, "shadow py-2 z-30")}>
                    {children}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}

export type MenuItemProps = {
    children: React.ReactNode;
    dense?: boolean;
    onClick?: (event: React.MouseEvent) => void;
}

export function MenuItem({
                             children,
                             dense,
                             onClick
                         }: MenuItemProps) {
    return (
        <DropdownMenu.Item
            className={cn(focusedMixin,
                onClick && "cursor-pointer",
                "rounded-md px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center gap-4")}
            onClick={onClick}>
            {children}
        </DropdownMenu.Item>
    );
}
