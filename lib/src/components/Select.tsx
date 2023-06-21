import React from "react";

import * as SelectPrimitive from "@radix-ui/react-select";

import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";

import clsx from "clsx";
import { focusedMixin } from "../styles";

export type SelectProps = {
    value: string,
    className?: string,
    onValueChange: (updatedValue: string) => void,
    placeholder?: string,
    options: string[],
    renderOption: (option: string) => React.ReactNode,
    size?: "small" | "medium",
    label?: React.ReactNode,
    disabled?: boolean,
    position?: "item-aligned" | "popper",
    endAdornment?: React.ReactNode
};

export function Select({
                           value,
                           onValueChange,
                           className,
                           placeholder,
                           options,
                           renderOption,
                           label,
                           size = "medium",
                           disabled,
                           position = "popper",
                           endAdornment
                       }: SelectProps) {

    return (
        <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
            <div className={"relative"}>
                <SelectPrimitive.Trigger className={clsx(
                    "relative flex items-center",
                    size === "small" ? "h-[42px]" : "h-[64px]",
                    label ? "pt-2 pb-2" : "py-2",
                    "focus:text-text-primary dark:focus:text-text-primary-dark",
                    "select-none rounded-md px-4 py-2 text-sm font-medium",
                    "text-gray-700 dark:text-gray-100",
                    "bg-opacity-70 hover:bg-opacity-90 bg-gray-100 dark:bg-gray-800 dark:bg-opacity-60 dark:hover:bg-opacity-90",
                    focusedMixin,
                    className
                )}>
                    {label && <div className={"absolute top-[4px] left-0 w-full"}>
                        {label}
                    </div>}
                    <div className={clsx("flex-grow w-full",
                        label ? "mt-5" : "")}>
                        <SelectPrimitive.Value placeholder={placeholder}/>
                    </div>
                    <SelectPrimitive.Icon className={clsx(
                        "px-2 h-full flex items-center"
                    )}>
                        <ChevronDownIcon/>
                    </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>

                {endAdornment && <div className={"absolute top-0 right-4 h-full flex items-center"}
                                      onClick={(e) => e.stopPropagation()}>
                    {endAdornment}
                </div>}

            </div>
            <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                    className={"z-20 relative border border-gray-200 dark:border-gray-800 shadow-lg bg-white dark:bg-gray-900 p-2 rounded-lg shadow-lg bg-opacity-80 dark:bg-opacity-80 backdrop-blur"}
                    position={position}
                    align={"center"}>
                    <SelectPrimitive.Viewport
                        className="">
                        <SelectPrimitive.Group>
                            {options.map((option) => (
                                <SelectPrimitive.Item
                                    key={option}
                                    value={option}
                                    className={clsx(
                                        "relative relative flex items-center px-8 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 font-medium",
                                        "border-2 border-transparent focus-visible:border-opacity-75 focus:outline-none focus-visible:border-solid focus-visible:border-solid focus-visible:border-primary",
                                        option === value ? "bg-gray-100 dark:bg-gray-900" : "focus:bg-gray-100 dark:focus:bg-gray-900"
                                    )}
                                >
                                    <SelectPrimitive.ItemText>{renderOption(option)}</SelectPrimitive.ItemText>
                                    <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
                                        <CheckIcon/>
                                    </SelectPrimitive.ItemIndicator>
                                </SelectPrimitive.Item>
                            ))}
                        </SelectPrimitive.Group>
                    </SelectPrimitive.Viewport>
                </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
    );
}
