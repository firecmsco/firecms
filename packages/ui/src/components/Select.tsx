"use client";
import React, { ChangeEvent, forwardRef, useCallback, useEffect, useState } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import {
    defaultBorderMixin,
    fieldBackgroundDisabledMixin,
    fieldBackgroundHoverMixin,
    fieldBackgroundInvisibleMixin,
    fieldBackgroundMixin,
    focusedDisabled
} from "../styles";
import { CheckIcon, ExpandMoreIcon } from "../icons";
import { cls } from "../util";
import { SelectInputLabel } from "./common/SelectInputLabel";

export type SelectProps = {
    open?: boolean,
    name?: string,
    id?: string,
    onOpenChange?: (open: boolean) => void,
    value?: string,
    className?: string,
    inputClassName?: string,
    onChange?: React.EventHandler<ChangeEvent<HTMLSelectElement>>,
    onValueChange?: (updatedValue: string) => void,
    placeholder?: React.ReactNode,
    renderValue?: (value: string) => React.ReactNode,
    size?: "small" | "medium",
    label?: React.ReactNode | string,
    disabled?: boolean,
    error?: boolean,
    position?: "item-aligned" | "popper",
    endAdornment?: React.ReactNode,
    inputRef?: React.RefObject<HTMLButtonElement>,
    padding?: boolean,
    invisible?: boolean,
    children?: React.ReactNode;
};

export const Select = forwardRef<HTMLDivElement, SelectProps>(({
                                                                   inputRef,
                                                                   open,
                                                                   name,
                                                                   id,
                                                                   onOpenChange,
                                                                   value,
                                                                   onChange,
                                                                   onValueChange,
                                                                   className,
                                                                   inputClassName,
                                                                   placeholder,
                                                                   renderValue,
                                                                   label,
                                                                   size = "medium",
                                                                   error,
                                                                   disabled,
                                                                   padding = true,
                                                                   position = "item-aligned",
                                                                   endAdornment,
                                                                   invisible,
                                                                   children,
                                                                   ...props
                                                               }, ref) => {

    const [openInternal, setOpenInternal] = useState(open ?? false);

    useEffect(() => {
        setOpenInternal(open ?? false);
    }, [open]);

    const onValueChangeInternal = useCallback((newValue: string) => {
        onValueChange?.(newValue);
        if (onChange) {
            const event = {
                target: {
                    name,
                    value: newValue
                }
            } as ChangeEvent<HTMLSelectElement>;
            onChange(event);
        }
    }, [onChange, value, onValueChange]);

    const hasValue = Array.isArray(value) ? value.length > 0 : (value != null && value !== "" && value !== undefined);

    return (
        <SelectPrimitive.Root
            name={name}
            value={value}
            open={openInternal}
            disabled={disabled}
            onValueChange={onValueChangeInternal}
            onOpenChange={(open) => {
                onOpenChange?.(open);
                setOpenInternal(open);
            }}
            {...props}>
            {typeof label === "string" ? <SelectInputLabel error={error}>{label}</SelectInputLabel> : label}
            <div className={cls(
                size === "small" ? "min-h-[42px]" : "min-h-[64px]",
                "select-none rounded-md text-sm",
                invisible ? fieldBackgroundInvisibleMixin : fieldBackgroundMixin,
                disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
                "relative flex items-center",
                className
            )}>
                <SelectPrimitive.Trigger
                    ref={inputRef}
                    id={id}
                    className={cls(
                        "w-full h-full",
                        size === "small" ? "h-[42px]" : "h-[64px]",
                        padding ? "px-4 " : "",
                        "outline-none focus:outline-none",
                        "select-none rounded-md text-sm",
                        error ? "text-red-500 dark:text-red-600" : "focus:text-text-primary dark:focus:text-text-primary-dark",
                        error ? "border border-red-500 dark:border-red-600" : "",
                        disabled ? "text-slate-600 dark:text-slate-400" : "text-slate-800 dark:text-white",
                        "relative flex flex-row items-center",
                        inputClassName
                    )}>

                    <div
                        ref={ref}
                        className={cls(
                            "flex-grow w-full max-w-full flex flex-row gap-2 items-center",
                            "overflow-visible",
                            size === "small" ? "h-[42px]" : "h-[64px]"
                        )}
                    >
                        <SelectPrimitive.Value
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            placeholder={placeholder}
                            className={"w-full"}>
                            {hasValue && value && renderValue ? renderValue(value) : placeholder}
                            {hasValue && !renderValue && value}
                        </SelectPrimitive.Value>
                    </div>

                    {endAdornment && (
                        <div
                            className={cls("h-full flex items-center")}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}>
                            {endAdornment}
                        </div>
                    )}
                    <SelectPrimitive.Icon asChild>
                        <ExpandMoreIcon size={"small"}
                                        className={cls("px-2 transition", open ? "rotate-180" : "")}/>
                    </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>

            </div>
            <SelectPrimitive.Portal>
                <SelectPrimitive.Content position={position}
                                         className={cls(focusedDisabled, "z-50 relative overflow-hidden border bg-white dark:bg-gray-900 p-2 rounded-lg", defaultBorderMixin)}>
                    <SelectPrimitive.Viewport className={"p-1"}
                                              style={{ maxHeight: "var(--radix-select-content-available-height)" }}>
                        {children}
                    </SelectPrimitive.Viewport>
                </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
    );
});

Select.displayName = "Select";

export type SelectItemProps = {
    value: string,
    children?: React.ReactNode,
    disabled?: boolean,
    className?: string,
};

export function SelectItem({
                               value,
                               children,
                               disabled,
                               className
                           }: SelectItemProps) {
    return <SelectPrimitive.Item
        key={value}
        value={value}
        disabled={disabled}
        className={cls(
            "w-full",
            "relative flex items-center p-2 rounded-md text-sm text-slate-700 dark:text-slate-300",
            "focus:z-10",
            "data-[state=checked]:bg-slate-100 data-[state=checked]:dark:bg-slate-800 focus:bg-slate-100 dark:focus:bg-gray-950",
            "data-[state=checked]:focus:bg-slate-200 data-[state=checked]:dark:focus:bg-gray-950",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
            "[&>*]:w-full",
            "overflow-visible",
            className
        )}>
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        <div
            className="absolute left-1 data-[state=checked]:block hidden">
            <CheckIcon size={16}/>
        </div>
    </SelectPrimitive.Item>;
}

export type SelectGroupProps = {
    label: React.ReactNode,
    children: React.ReactNode,
    className?: string
};

export function SelectGroup({
                                label,
                                children,
                                className
                            }: SelectGroupProps) {
    return <>
        <SelectPrimitive.Group
            className={cls(
                "text-xs text-slate-900 dark:text-white uppercase tracking-wider font-bold mt-6 first:mt-2",
                "px-2 py-2",
                className
            )}>
            {label}
        </SelectPrimitive.Group>

        {children}
    </>;
}
