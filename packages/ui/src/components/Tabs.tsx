import React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cls } from "../util";

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
            "flex text-sm font-medium text-center text-surface-accent-800 dark:text-white max-w-full overflow-auto no-scrollbar items-end",
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
                                      "border-b-2 border-transparent",
                                      "data-[state=active]:border-secondary",
                                      disabled
                                          ? "text-surface-accent-400 dark:text-surface-accent-500"
                                          : cls("text-surface-accent-700 dark:text-surface-accent-300",
                                              "data-[state=active]:text-surface-accent-900 data-[state=active]:dark:text-white",
                                              "hover:text-surface-accent-800 dark:hover:text-surface-accent-200"),
                                      className)}>
        <div className={cls("uppercase inline-block p-2 px-4 m-2 rounded",
            "hover:bg-surface-accent-200 hover:bg-opacity-75 dark:hover:bg-surface-accent-800",
            innerClassName)}>
            {children}
        </div>
    </TabsPrimitive.Trigger>;
}
