import React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { focusedMixin } from "../styles";
import { cn } from "../util";

export type TabsProps = {
    value: string,
    children: React.ReactNode,
    className?: string,
    onValueChange: (value: string) => void
};

export function Tabs({
                         value,
                         onValueChange,
                         className,
                         children
                     }: TabsProps) {

    return <TabsPrimitive.Root value={value} onValueChange={onValueChange}>
        <TabsPrimitive.List className={cn(
            "flex text-sm font-medium text-center text-slate-800 dark:text-white max-w-full overflow-auto no-scrollbar",
            className)
        }>
            {children}
        </TabsPrimitive.List>
    </TabsPrimitive.Root>
}

export type TabProps = {
    value: string,
    className?: string,
    children: React.ReactNode,
    disabled?: boolean
};

export function Tab({
                        value,
                        className,
                        children,
                        disabled
                    }: TabProps) {
    return <TabsPrimitive.Trigger value={value}
                                  disabled={disabled}
                                  className={cn(focusedMixin,
                                      "border-b-2 border-transparent",
                                      "data-[state=active]:border-secondary",
                                      disabled
                                          ? "text-slate-400 dark:text-slate-500"
                                          : cn("text-slate-700 dark:text-gray-300",
                                              "data-[state=active]:text-slate-900 data-[state=active]:dark:text-white",
                                              "hover:text-slate-800 dark:hover:text-slate-200"),
                                      // disabled ? "text-slate-400 dark:text-slate-500" : "data-[state=active]:text-primary",
                                      // "data-[state=active]:bg-slate-50 data-[state=active]:dark:bg-slate-800",
                                      className)}>
        <div className={cn("uppercase inline-block p-2 px-4 m-2 rounded",
            "hover:bg-slate-100 dark:hover:bg-slate-800")}>
            {children}
        </div>
    </TabsPrimitive.Trigger>;
}
