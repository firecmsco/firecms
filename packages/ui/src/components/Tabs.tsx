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
            "flex text-sm font-medium text-center text-gray-800 dark:text-gray-200",
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
                                          ? "text-gray-400 dark:text-gray-500"
                                          : cn("text-gray-700 dark:text-gray-300",
                                              "data-[state=active]:text-gray-900 data-[state=active]:dark:text-gray-100",
                                              "hover:text-gray-800 dark:hover:text-gray-200"),
                                      // disabled ? "text-gray-400 dark:text-gray-500" : "data-[state=active]:text-primary",
                                      // "data-[state=active]:bg-gray-50 data-[state=active]:dark:bg-gray-800",
                                      className)}>
        <div className={cn("uppercase inline-block p-2 px-4 m-2 rounded",
            "hover:bg-gray-100 dark:hover:bg-gray-800")}>
            {children}
        </div>
    </TabsPrimitive.Trigger>;
}
