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
            "w-max",
            "flex text-sm font-medium text-center text-text-primary dark:text-text-primary-dark max-w-full overflow-auto no-scrollbar items-end",
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
                                          ? "text-text-disabled dark:text-text-disabled-dark"
                                          : cls("text-text-secondary dark:text-text-secondary-dark",
                                              "data-[state=active]:text-text-primary data-[state=active]:dark:text-text-primary-dark",
                                              "hover:text-text-primary dark:hover:text-text-primary-dark"),
                                      className)}>
        <div className={cls("line-clamp-1",
            "uppercase inline-block p-2 px-4 rounded",
            "hover:bg-slate-200/75 dark:hover:bg-slate-800",
            innerClassName)}>
            {children}
        </div>
    </TabsPrimitive.Trigger>;
}
