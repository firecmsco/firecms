"use client";
import React, { ChangeEvent, Children, forwardRef, useCallback, useEffect, useState } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import {
    defaultBorderMixin,
    fieldBackgroundDisabledMixin,
    fieldBackgroundHoverMixin,
    fieldBackgroundInvisibleMixin,
    fieldBackgroundMixin,
    focusedDisabled
} from "../styles";
import { CheckIcon, KeyboardArrowDownIcon } from "../icons";
import { cls } from "../util";
import { SelectInputLabel } from "./common/SelectInputLabel";

export type SelectValue = string | number | boolean;

export type SelectProps<T extends SelectValue = string> = {
    open?: boolean,
    name?: string,
    fullWidth?: boolean,
    id?: string,
    onOpenChange?: (open: boolean) => void,
    value?: T,
    className?: string,
    inputClassName?: string,
    onChange?: React.EventHandler<ChangeEvent<HTMLSelectElement>>,
    onValueChange?: (updatedValue: T) => void,
    placeholder?: React.ReactNode,
    renderValue?: (value: T) => React.ReactNode,
    size?: "smallest" | "small" | "medium" | "large",
    label?: React.ReactNode | string,
    disabled?: boolean,
    error?: boolean,
    position?: "item-aligned" | "popper",
    endAdornment?: React.ReactNode,
    inputRef?: React.RefObject<HTMLButtonElement>,
    padding?: boolean,
    invisible?: boolean,
    children?: React.ReactNode;
    dataType?: "string" | "number" | "boolean";
};

export const Select = forwardRef<HTMLDivElement, SelectProps>(({
                                                                   inputRef,
                                                                   open,
                                                                   name,
                                                                   fullWidth = false,
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
                                                                   size = "large",
                                                                   error,
                                                                   disabled,
                                                                   padding = true,
                                                                   position = "item-aligned",
                                                                   endAdornment,
                                                                   invisible,
                                                                   children,
                                                                   dataType = "string",
                                                                   ...props
                                                               }, ref) => {

    const [openInternal, setOpenInternal] = useState(open ?? false);

    useEffect(() => {
        setOpenInternal(open ?? false);
    }, [open]);

    const onValueChangeInternal = useCallback((newValue: string) => {

        let typedValue: SelectValue = newValue;
        if (dataType === "boolean") {
            if (newValue === "true") typedValue = true;
            else if (newValue === "false") typedValue = false;
        } else if (dataType === "number") {
            if (!isNaN(Number(newValue)) && newValue.trim() !== "") typedValue = Number(newValue);
        }

        onValueChange?.(typedValue as any);
        if (onChange) {
            const event = {
                target: {
                    name,
                    value: typedValue
                }
            } as unknown as ChangeEvent<HTMLSelectElement>;
            onChange(event);
        }
    }, [onChange, onValueChange, name]);

    const hasValue = Array.isArray(value) ? value.length > 0 : (value != null && value !== "" && value !== undefined);
    // Convert non-string values to strings for Radix UI
    const stringValue = value !== undefined ? String(value) : undefined;

    return (
        <SelectPrimitive.Root
            name={name}
            value={stringValue}
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
                "select-none rounded-md text-sm",
                invisible ? fieldBackgroundInvisibleMixin : fieldBackgroundMixin,
                disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
                "relative flex items-center",
                className,
                {
                    "min-h-[28px]": size === "smallest",
                    "min-h-[32px]": size === "small",
                    "min-h-[42px]": size === "medium",
                    "min-h-[64px]": size === "large",
                    "w-fit": !fullWidth,
                    "w-full": fullWidth
                }
            )}>
                <SelectPrimitive.Trigger
                    ref={inputRef}
                    id={id}
                    asChild
                >
                    <div className={cls(
                        "h-full",
                        padding ? {
                            "px-4": size === "large",
                            "px-3": size === "medium",
                            "px-2": size === "small" || size === "smallest",
                        } : "",
                        "outline-none focus:outline-none",
                        "select-none rounded-md text-sm",
                        error ? "text-red-500 dark:text-red-600" : "focus:text-text-primary dark:focus:text-text-primary-dark",
                        error ? "border border-red-500 dark:border-red-600" : "",
                        disabled ? "text-surface-accent-600 dark:text-surface-accent-400" : "text-surface-accent-800 dark:text-white",
                        "relative flex flex-row items-center",
                        {
                            "min-h-[28px]": size === "smallest",
                            "min-h-[32px]": size === "small",
                            "min-h-[42px]": size === "medium",
                            "min-h-[64px]": size === "large",
                            "w-full": fullWidth,
                            "w-fit": !fullWidth
                        },
                        inputClassName
                    )}>
                        <div
                            ref={ref}
                            className={cls(
                                "flex-grow max-w-full flex flex-row gap-2 items-center",
                                "overflow-visible",
                                {
                                    "min-h-[28px]": size === "smallest",
                                    "min-h-[32px]": size === "small",
                                    "min-h-[42px]": size === "medium",
                                    "min-h-[64px]": size === "large"
                                }
                            )}>
                            <SelectPrimitive.Value
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                placeholder={placeholder}
                                className={"w-full"}>
                                {hasValue && value !== undefined && renderValue ? renderValue(value) : placeholder}
                                {/*{hasValue && !renderValue && value}*/}
                                {hasValue && !renderValue && (() => {
                                    // @ts-ignore
                                    const childrenProps: SelectItemProps[] = Children.map(children, (child) => {
                                        if (React.isValidElement(child)) {
                                            return child.props;
                                        }
                                    }).filter(Boolean);

                                    const option = childrenProps.find((o) => String(o.value) === String(value));
                                    return option?.children;
                                })()}

                            </SelectPrimitive.Value>
                        </div>

                        <SelectPrimitive.Icon asChild>
                            <KeyboardArrowDownIcon size={size === "large" ? "medium" : "small"}
                                                   className={cls("transition", open ? "rotate-180" : "", {
                                                       "px-2": size === "large",
                                                       "px-1": size === "medium" || size === "small",
                                                   })}/>
                        </SelectPrimitive.Icon>
                    </div>
                </SelectPrimitive.Trigger>

                {endAdornment && (
                    <div
                        className={cls("h-full flex items-center absolute right-0 pr-12",)}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}>
                        {endAdornment}
                    </div>
                )}
            </div>
            <SelectPrimitive.Portal>
                <SelectPrimitive.Content position={position}
                                         className={cls(focusedDisabled, "z-50 relative overflow-hidden border bg-white dark:bg-surface-900 p-2 rounded-lg", defaultBorderMixin)}>
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

export type SelectItemProps<T extends SelectValue = string> = {
    value: T,
    children?: React.ReactNode,
    disabled?: boolean,
    className?: string,
};

export function SelectItem<T extends SelectValue = string>({
                                                               value,
                                                               children,
                                                               disabled,
                                                               className
                                                           }: SelectItemProps<T>) {
    // Convert value to string for Radix UI
    const stringValue = String(value);

    return <SelectPrimitive.Item
        key={stringValue}
        value={stringValue}
        disabled={disabled}
        className={cls(
            "w-full",
            "relative flex items-center p-2 rounded-md text-sm text-surface-accent-700 dark:text-surface-accent-300",
            "focus:z-10",
            "data-[state=checked]:bg-surface-accent-100 data-[state=checked]:dark:bg-surface-accent-800 focus:bg-surface-accent-100 dark:focus:bg-surface-950",
            "data-[state=checked]:focus:bg-surface-accent-200 data-[state=checked]:dark:focus:bg-surface-950",
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
                "text-xs text-surface-accent-900 dark:text-white uppercase tracking-wider font-bold mt-6 first:mt-2",
                "px-2 py-2",
                className
            )}>
            {label}
        </SelectPrimitive.Group>

        {children}
    </>;
}
