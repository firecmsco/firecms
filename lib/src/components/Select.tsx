import React, { useEffect } from "react";

import * as SelectPrimitive from "@radix-ui/react-select";

import clsx from "clsx";
import { fieldBackgroundDisabledMixin, fieldBackgroundHoverMixin, fieldBackgroundMixin, focusedMixin } from "../styles";
import { CheckIcon, ChevronDownIcon } from "../icons";

export type SelectProps = {
    open?: boolean,
    onOpenChange?: (open: boolean) => void,
    value?: string | string[],
    className?: string,
    inputClassName?: string,
    onValueChange?: (updatedValue: string | string[]) => void,
    placeholder?: React.ReactNode,
    renderValue: (option: string) => React.ReactNode,
    size?: "small" | "medium",
    label?: React.ReactNode,
    disabled?: boolean,
    error?: boolean,
    position?: "item-aligned" | "popper",
    endAdornment?: React.ReactNode,
    multiple?: boolean,
    inputRef?: React.RefObject<HTMLButtonElement>,
    padding?: boolean,
    includeFocusOutline?: boolean,
    children?: React.ReactNode
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
                           renderValue,
                           label,
                           size = "medium",
                           includeFocusOutline = true,
                           error,
                           disabled,
                           padding = true,
                           position = "popper",
                           endAdornment,
                           multiple,
                           children
                       }: SelectProps) {

    const [openInternal, setOpenInternal] = React.useState(open);
    useEffect(() => {
        setOpenInternal(open);
    }, [open]);

    const onValueChangeInternal = React.useCallback((newValue: string) => {
        if (multiple) {
            if (Array.isArray(value) && value.includes(newValue)) {
                onValueChange?.(value.filter(v => v !== newValue));
            } else {
                onValueChange?.([...(value ?? []), newValue]);
            }
        } else {
            onValueChange?.(newValue);
        }
    }, [multiple, value, onValueChange]);

    return (
        <SelectPrimitive.Root
            value={Array.isArray(value) ? undefined : value}
            open={openInternal}
            disabled={disabled}
            onValueChange={onValueChangeInternal}
            onOpenChange={(open) => {
                onOpenChange?.(open);
                setOpenInternal(open);
            }}>

            {label}

            <div
                className={clsx(
                    size === "small" ? "min-h-[42px]" : "min-h-[64px]",
                    "select-none rounded-md text-sm",
                    fieldBackgroundMixin,
                    disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
                    "relative flex items-center",
                    className)}>

                <SelectPrimitive.Trigger
                    ref={inputRef}
                    className={clsx(
                        "w-full h-full",
                        size === "small" ? "h-[42px]" : "h-[64px]",
                        padding ? "px-4 " : "",
                        "outline-none focus:outline-none",
                        "select-none rounded-md text-sm",
                        error ? "text-red-500 dark:text-red-600" : "focus:text-text-primary dark:focus:text-text-primary-dark",
                        "text-gray-700 dark:text-gray-100",
                        "relative flex items-center",
                        includeFocusOutline ? focusedMixin : "",
                        inputClassName
                    )}>

                    <SelectPrimitive.Value asChild>
                        <div className={clsx(
                            "flex-grow w-full max-w-full flex flex-row gap-2 items-center",
                            size === "small" ? "h-[42px]" : "h-[64px]"
                        )}>
                            {value && Array.isArray(value)
                                ? value.map((v) => (
                                    <div key={v} className={"flex items-center gap-1 max-w-full"}>
                                        {renderValue(v)}
                                    </div>))
                                : (value ? renderValue(value) : placeholder)}
                        </div>
                    </SelectPrimitive.Value>

                    <SelectPrimitive.Icon className={clsx(
                        "px-2 h-full flex items-center"
                    )}>
                        <ChevronDownIcon size={"small"}
                                         className={clsx("transition", open ? "rotate-180" : "")}/>
                    </SelectPrimitive.Icon>

                </SelectPrimitive.Trigger>

                {endAdornment && <div className={clsx("absolute h-full flex items-center",
                    size === "small" ? "right-10" : "right-14")}
                                      onClick={(e) => e.stopPropagation()}>
                    {endAdornment}
                </div>}

            </div>
            <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                    className={"z-50 relative border border-gray-200 dark:border-gray-800 shadow-lg bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg bg-opacity-80 dark:bg-opacity-90 backdrop-blur"}
                    position={position}
                    align={"center"}>
                    <SelectPrimitive.Viewport
                        className="">
                        <SelectPrimitive.Group>
                            {children}
                        </SelectPrimitive.Group>
                    </SelectPrimitive.Viewport>
                </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
    );
}

export type SelectItemProps = {
    value: string,
    selected?: boolean,
    children?: React.ReactNode,
    disabled?: boolean
};

export function SelectItem({
                               value,
                               selected,
                               children,
                               disabled
                           }: SelectItemProps) {
    return <SelectPrimitive.Item
        key={value}
        value={value}
        className={clsx(
            "relative relative flex items-center px-6 py-1 rounded-md text-sm text-gray-700 dark:text-gray-300",
            "border-2 border-transparent focus-visible:border-opacity-75 focus:outline-none focus-visible:border-solid focus-visible:border-solid focus-visible:border-primary",
            "data-[state=checked]:bg-gray-100 data-[state=checked]:dark:bg-gray-900 focus:bg-gray-100 dark:focus:bg-gray-950",
            "data-[state=checked]:focus:bg-gray-200 data-[state=checked]:dark:focus:bg-gray-950"
        )}
    >
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        <div
            className="absolute left-1 data-[state=checked]:block hidden">
            <CheckIcon size={16}/>
        </div>
    </SelectPrimitive.Item>;
}
