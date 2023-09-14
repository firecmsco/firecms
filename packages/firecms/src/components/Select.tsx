import React, { useEffect } from "react";

import * as SelectPrimitive from "@radix-ui/react-select";
import { fieldBackgroundDisabledMixin, fieldBackgroundHoverMixin, fieldBackgroundMixin, focusedMixin } from "../styles";
import { CheckIcon, ExpandMoreIcon } from "../icons";
import { cn } from "./util/cn";
import { SelectInputLabel } from "./common/SelectInputLabel";

export type SelectProps = {
    open?: boolean,
    name?: string,
    id?: string,
    onOpenChange?: (open: boolean) => void,
    value?: string | string[],
    className?: string,
    inputClassName?: string,
    onChange?: React.EventHandler<React.ChangeEvent<HTMLSelectElement>>,
    onValueChange?: (updatedValue: string) => void,
    onMultiValueChange?: (updatedValue: string[]) => void,
    placeholder?: React.ReactNode,
    renderValue?: (value: string) => React.ReactNode,
    renderValues?: (values: string[]) => React.ReactNode,
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
                           name,
                           id,
                           onOpenChange,
                           value,
                           onChange,
                           onValueChange,
                           onMultiValueChange,
                           className,
                           inputClassName,
                           placeholder,
                           renderValue,
                           renderValues,
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

    const [openInternal, setOpenInternal] = React.useState(false);
    useEffect(() => {
        setOpenInternal(open ?? false);
    }, [open]);

    const onValueChangeInternal = React.useCallback((newValue: string) => {
        if (multiple) {
            if (Array.isArray(value) && value.includes(newValue)) {
                onMultiValueChange?.(value.filter(v => v !== newValue));
            } else {
                onMultiValueChange?.([...(value ?? []), newValue]);
            }
        } else {
            onValueChange?.(newValue);
        }
        if (!multiple && onChange) {
            const event = {
                target: {
                    name,
                    value: newValue
                }
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange(event);
        }
    }, [multiple, onChange, value, onMultiValueChange, onValueChange]);

    return (
        <SelectPrimitive.Root
            name={name}
            value={Array.isArray(value) ? undefined : value}
            defaultOpen={open}
            open={openInternal}
            disabled={disabled}
            onValueChange={onValueChangeInternal}
            onOpenChange={(open) => {
                onOpenChange?.(open);
                setOpenInternal(open);
            }}>

            {typeof label === "string" ? <SelectInputLabel>{label}</SelectInputLabel> : label}

            <div
                className={cn(
                    size === "small" ? "min-h-[42px]" : "min-h-[64px]",
                    "select-none rounded-md text-sm",
                    fieldBackgroundMixin,
                    disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
                    "relative flex items-center",
                    className)}>

                <SelectPrimitive.Trigger
                    ref={inputRef}
                    id={id}
                    className={cn(
                        "w-full h-full",
                        size === "small" ? "h-[42px]" : "h-[64px]",
                        padding ? "px-4 " : "",
                        "outline-none focus:outline-none",
                        "select-none rounded-md text-sm",
                        error ? "text-red-500 dark:text-red-600" : "focus:text-text-primary dark:focus:text-text-primary-dark",
                        disabled ? "text-gray-600 dark:text-gray-400" : "text-gray-800 dark:text-gray-200",
                        "relative flex items-center",
                        includeFocusOutline ? focusedMixin : "",
                        inputClassName
                    )}>

                    <SelectPrimitive.Value asChild>
                        <div className={cn(
                            "flex-grow w-full max-w-full flex flex-row gap-2 items-center",
                            "overflow-visible",
                            size === "small" ? "h-[42px]" : "h-[64px]"
                        )}>
                            {renderValue &&
                                (value && Array.isArray(value)
                                    ? value.map((v) => (
                                        <div key={v} className={"flex items-center gap-1 max-w-full"}>
                                            {renderValue ? renderValue(v) : v}
                                        </div>))
                                    : (value ? (renderValue ? renderValue(value) : value) : placeholder))}

                            {renderValues && (!value || Array.isArray(value))
                                ? renderValues(value as string[] ?? [])
                                : null}

                            {!renderValue && !renderValues && value}

                        </div>
                    </SelectPrimitive.Value>

                    <SelectPrimitive.Icon className={cn(
                        "px-2 h-full flex items-center",
                    )}>
                        <ExpandMoreIcon size={"small"}
                                        className={cn("transition", open ? "rotate-180" : "")}/>
                    </SelectPrimitive.Icon>

                </SelectPrimitive.Trigger>

                {endAdornment && <div className={cn("absolute h-full flex items-center",
                    size === "small" ? "right-10" : "right-14")}
                                      onClick={(e) => e.stopPropagation()}>
                    {endAdornment}
                </div>}

            </div>
            <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                    className={cn("z-50 relative border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg ",
                        "overflow-auto",
                    )}
                    position={position}
                    align={"center"}>
                    <SelectPrimitive.Viewport asChild>
                        <div style={{ overflow: "visible" }}>
                            {children}
                        </div>
                    </SelectPrimitive.Viewport>
                </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
    );
}

export type SelectItemProps = {
    value: string,
    children?: React.ReactNode,
    disabled?: boolean,
    className?: string,
    // onClick?: () => void
};

export function SelectItem({
                               value,
                               children,
                               disabled,
                               className,
                               // onClick
                           }: SelectItemProps) {
    return <SelectPrimitive.Item
        key={value}
        value={value}
        disabled={disabled}
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
        }}
        className={cn(
            "w-full",
            "relative relative flex items-center p-2 rounded-md text-sm text-gray-700 dark:text-gray-300",
            focusedMixin,
            "focus:z-10",
            "data-[state=checked]:bg-gray-100 data-[state=checked]:dark:bg-gray-900 focus:bg-gray-100 dark:focus:bg-gray-950",
            "data-[state=checked]:focus:bg-gray-200 data-[state=checked]:dark:focus:bg-gray-950",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
            "[&>*]:w-full",
            "overflow-visible",
            className
        )}
    >
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
            className={cn(
                "text-xs text-gray-900 dark:text-gray-100 uppercase tracking-wider font-bold mt-6 first:mt-2",
                "px-2 py-2",
                className
            )}>
            {label}
        </SelectPrimitive.Group>

        {children}
    </>;
}

function selectOnChangeEventAdapter(fn: (event: React.ChangeEvent<HTMLSelectElement>) => void): (value: string) => void {
    return (value: string) => {
        const event = { target: { value } } as React.ChangeEvent<HTMLSelectElement>;
        fn(event);
    };
}
