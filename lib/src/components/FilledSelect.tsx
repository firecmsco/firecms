import React from "react";

import * as Select from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";

import clsx from "clsx";

type FilledSelectParams = {
    value: string,
    className?: string,
    onValueChange: (updatedValue: string) => void,
    placeholder?: string,
    options: string[],
    renderOption: (option: string) => React.ReactNode,
};

export function FilledSelect({
                                 value,
                                 onValueChange,
                                 className,
                                 placeholder,
                                 options,
                                 renderOption
                             }: FilledSelectParams) {

    return (
        <Select.Root value={value} onValueChange={onValueChange}>
            <Select.Trigger>
                <div className={clsx(
                    "inline-flex select-none items-center justify-center rounded-md px-4 py-2 text-sm font-medium",
                    "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-900",
                    "hover:bg-gray-50",
                    "focus:outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-opacity-75",
                    className
                )}>
                    <Select.Value placeholder={placeholder}/>
                    <Select.Icon className="ml-2">
                        <ChevronDownIcon/>
                    </Select.Icon>
                </div>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content className={"z-[1300]"} position={"popper"} align={"center"}>
                    <Select.ScrollUpButton
                        className="flex items-center justify-center text-gray-700 dark:text-gray-300">
                        <ChevronUpIcon/>
                    </Select.ScrollUpButton>
                    <Select.Viewport className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg ">
                        <Select.Group>
                            {options.map((option) => (
                                <Select.Item
                                    key={option}
                                    value={option}
                                    className={clsx(
                                        "relative flex items-center px-8 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 font-medium focus:bg-gray-100 dark:focus:bg-gray-900",
                                        { "focus:outline-none select-none": option !== value },
                                    )}
                                >
                                    <Select.ItemText>{renderOption(option)}</Select.ItemText>
                                    <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                                        <CheckIcon/>
                                    </Select.ItemIndicator>
                                </Select.Item>
                            ))}
                        </Select.Group>
                    </Select.Viewport>
                    <Select.ScrollDownButton className="SelectScrollButton">
                        <ChevronDownIcon/>
                    </Select.ScrollDownButton>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}
