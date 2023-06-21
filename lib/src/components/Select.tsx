import React from "react";

import * as SelectPrimitive from "@radix-ui/react-select";

import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";

import clsx from "clsx";
import { focusedMixin } from "../styles";

export type SelectProps = {
    open?: boolean,
    onOpenChange?: (open: boolean) => void,
    value?: string | string[],
    className?: string,
    inputClassName?: string,
    onValueChange: (updatedValue: string | string[]) => void,
    placeholder?: string,
    options: string[],
    renderOption: (option: string) => React.ReactNode,
    size?: "small" | "medium",
    label?: React.ReactNode,
    disabled?: boolean,
    position?: "item-aligned" | "popper",
    endAdornment?: React.ReactNode,
    multiple?: boolean,
    inputRef?: React.RefObject<HTMLButtonElement>,
    padding?: boolean,
    includeFocusOutline?: boolean
};

export function Select({
                           inputRef,
                           open,
                           onOpenChange,
                           value,
                           onValueChange,
                           className,
                           inputClassName,
                           placeholder,
                           options,
                           renderOption,
                           label,
                           size = "medium",
                           includeFocusOutline = true,
                           disabled,
                           padding = true,
                           position = "popper",
                           endAdornment,
                           multiple
                       }: SelectProps) {

    const onValueChangeInternal = React.useCallback((newValue: string) => {
        if (multiple) {
            if (Array.isArray(value) && value.includes(newValue)) {
                onValueChange(value.filter(v => v !== newValue));
            } else {
                onValueChange([...(value ?? []), newValue]);
            }
        } else {
            onValueChange(newValue);
        }
    }, [value, onValueChange]);

    return (
        <SelectPrimitive.Root
            value={Array.isArray(value) ? value[0] : value}
            onValueChange={onValueChangeInternal}
            open={open}
            onOpenChange={onOpenChange}>
            <div className={clsx(
                size === "small" ? "h-[42px]" : "h-[64px]",
                "select-none rounded-md text-sm",
                "bg-opacity-70 hover:bg-opacity-90 bg-gray-100 dark:bg-gray-800 dark:bg-opacity-60 dark:hover:bg-opacity-90",
                "relative flex items-center font-medium",
                className)}>

                {label && <div className={"absolute top-[4px] left-0 w-full"}>
                    {label}
                </div>}

                <SelectPrimitive.Trigger
                    ref={inputRef}
                    className={clsx(
                        "w-full h-full",
                        size === "small" ? "h-[42px]" : "h-[64px]",
                        padding ? "px-4 py-2 " : "",
                        "outline-none focus:outline-none",
                        "select-none rounded-md text-sm",
                        "focus:text-text-primary dark:focus:text-text-primary-dark",
                        "text-gray-700 dark:text-gray-100",
                        "relative flex items-center",
                        includeFocusOutline ? focusedMixin : "",
                        inputClassName,
                    )}>

                    <div className={clsx("flex-grow w-full",
                        label ? "mt-5" : "")}>
                        <SelectPrimitive.Value>
                            {value && Array.isArray(value)
                                ? value.map((v) => (
                                    <div key={v} className={"flex items-center gap-1"}>
                                        {renderOption(v)}
                                    </div>))
                                : (value ? renderOption(value) : placeholder)}
                        </SelectPrimitive.Value>
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
                            {options.map((option) => {
                                const selected = Array.isArray(value) ? value.includes(option) : option === value;
                                return (
                                    <SelectPrimitive.Item
                                        key={option}
                                        value={option}
                                        className={clsx(
                                            "relative relative flex items-center px-6 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 font-medium",
                                            "border-2 border-transparent focus-visible:border-opacity-75 focus:outline-none focus-visible:border-solid focus-visible:border-solid focus-visible:border-primary",
                                            selected ? "bg-gray-50 dark:bg-gray-900" : "focus:bg-gray-100 dark:focus:bg-gray-800"
                                        )}
                                    >
                                        <SelectPrimitive.ItemText>{renderOption(option)}</SelectPrimitive.ItemText>
                                        {selected && <div
                                            className="absolute left-2 inline-flex items-center">
                                            <CheckIcon/>
                                        </div>}
                                    </SelectPrimitive.Item>
                                );
                            })}
                        </SelectPrimitive.Group>
                    </SelectPrimitive.Viewport>
                </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
    );
}
