import * as TabsPrimitive from "@radix-ui/react-tabs";
import clsx from "clsx";
import { focusedMixin } from "../styles";

export type TabsProps = {
    value: string,
    tabs: React.ReactNode,
    children: React.ReactNode,
    className?: string,
    onValueChange: (value: string) => void
};

export function Tabs({
                         tabs,
                         value,
                         onValueChange,
                         className,
                         children
                     }: TabsProps) {
    return <TabsPrimitive.Root value={value} onValueChange={onValueChange}>
        <TabsPrimitive.List className={clsx(
            "flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400",
            className)
        }>
            {tabs}
        </TabsPrimitive.List>
        {children}
    </TabsPrimitive.Root>
}

<ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
    <li className="mr-2">
        <a href="#" aria-current="page"
           className="inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500">Profile</a>
    </li>
    <li className="mr-2">
        <a href="#"
           className="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300">Dashboard</a>
    </li>
    <li className="mr-2">
        <a href="#"
           className="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300">Settings</a>
    </li>
    <li className="mr-2">
        <a href="#"
           className="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300">Contacts</a>
    </li>
    <li>
        <a className="inline-block p-4 text-gray-400 rounded-t-lg cursor-not-allowed dark:text-gray-500">Disabled</a>
    </li>
</ul>

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
                                  className={clsx(focusedMixin,
                                      "uppercase inline-block p-4 rounded-t-lg",
                                      disabled ? "text-gray-400 dark:text-gray-500" : "data-[state=active]:text-primary",
                                      "data-[state=active]:bg-gray-50 data-[state=active]:dark:bg-gray-800",
                                      "hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300",
                                      className)}>
        {children}
    </TabsPrimitive.Trigger>;
}

export type TabPanelProps = {
    value: string,
    className?: string,
    children: React.ReactNode
};

export function TabPanel({
                             value,
                             children
                         }: TabPanelProps) {
    return <TabsPrimitive.Content className="p-4 bg-white shadow-lg" value={value}>
        {children}
    </TabsPrimitive.Content>
}
