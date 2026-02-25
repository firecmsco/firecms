import React, { createContext, useContext } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cls } from "../util";
import { defaultBorderMixin } from "../styles";

export type TabVariant = "standard" | "underline" | "invisible";

const TabsContext = createContext<{ variant: TabVariant }>({ variant: "standard" });

export type TabsProps = {
    value: string,
    children: React.ReactNode,
    innerClassName?: string,
    className?: string,
    variant?: TabVariant,
    onValueChange: (value: string) => void
};

export function Tabs({
    value,
    onValueChange,
    className,
    innerClassName,
    variant = "standard",
    children
}: TabsProps) {
    return (
        <TabsContext.Provider value={{ variant }}>
            <TabsPrimitive.Root value={value} onValueChange={onValueChange} className={className}>
                <TabsPrimitive.List className={cls(
                    variant === "standard" && "border " + defaultBorderMixin + " bg-surface-50 dark:bg-surface-900 rounded-md p-1",
                    variant === "underline" && "border-b " + defaultBorderMixin + " w-full",
                    variant === "invisible" && "",
                    "gap-2 inline-flex h-10 items-center justify-center text-surface-600 dark:text-surface-400",
                    innerClassName)
                }>
                    {children}
                </TabsPrimitive.List>
            </TabsPrimitive.Root>
        </TabsContext.Provider>
    );
}

export type TabProps = {
    value: string,
    className?: string,
    innerClassName?: string,
    children: React.ReactNode,
    disabled?: boolean
};

export function Tab({
    value,
    className,
    innerClassName,
    children,
    disabled
}: TabProps) {
    const { variant } = useContext(TabsContext);

    return (
        <TabsPrimitive.Trigger
            value={value}
            disabled={disabled}
            className={cls(
                "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-white transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",

                variant === "standard" && "rounded-sm px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-surface-900 dark:data-[state=active]:bg-surface-950 dark:data-[state=active]:text-surface-50",

                variant === "underline" && "flex-1 px-3 h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary hover:text-text-primary dark:hover:text-text-primary-dark transition-colors uppercase tracking-wider text-xs",

                variant === "invisible" && "rounded-sm px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-surface-900 dark:data-[state=active]:bg-surface-950 dark:data-[state=active]:text-surface-50",

                className,
                innerClassName
            )}
        >
            {children}
        </TabsPrimitive.Trigger>
    );
}
