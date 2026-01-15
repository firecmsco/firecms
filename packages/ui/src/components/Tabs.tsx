import React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cls } from "../util";
import { defaultBorderMixin } from "../styles";

export type TabsProps = {
    value: string,
    children: React.ReactNode,
    innerClassName?: string,
    className?: string,
    onValueChange: (value: string) => void
};

export function Tabs({
                         value,
                         onValueChange,
                         className,
                         innerClassName,
                         children
                     }: TabsProps) {
    return <TabsPrimitive.Root value={value} onValueChange={onValueChange} className={className}>
        <TabsPrimitive.List className={cls(
            "border",
            defaultBorderMixin,
            "gap-2",
            "inline-flex h-10 items-center justify-center rounded-md bg-surface-50 p-1 text-surface-600 dark:bg-surface-900 dark:text-surface-400",
            innerClassName)
        }>
            {children}
        </TabsPrimitive.List>
    </TabsPrimitive.Root>
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
    return <TabsPrimitive.Trigger value={value}
                                  disabled={disabled}
                                  className={cls(
                                      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all",
                                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2",
                                      "disabled:pointer-events-none disabled:opacity-50",
                                      "data-[state=active]:bg-white data-[state=active]:text-surface-900 dark:data-[state=active]:bg-surface-950 dark:data-[state=active]:text-surface-50",
                                      // "data-[state=active]:border",
                                      // defaultBorderMixin,
                                      className,
                                      innerClassName)}>
        {children}
    </TabsPrimitive.Trigger>;
}
