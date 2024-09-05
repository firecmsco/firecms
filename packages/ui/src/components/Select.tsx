import React, { ChangeEvent, forwardRef, useCallback, useEffect, useState } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import {
    defaultBorderMixin,
    fieldBackgroundDisabledMixin,
    fieldBackgroundHoverMixin,
    fieldBackgroundInvisibleMixin,
    fieldBackgroundMixin
} from "../styles";
import { CheckIcon, ExpandMoreIcon } from "../icons";
import { cls } from "../util";
import { SelectInputLabel } from "./common/SelectInputLabel";

export type SelectProps = {
    open?: boolean,
    name?: string,
    id?: string,
    onOpenChange?: (open: boolean) => void,
    value?: string | string[],
    className?: string,
    inputClassName?: string,
    onChange?: React.EventHandler<ChangeEvent<HTMLSelectElement>>,
    onValueChange?: (updatedValue: string) => void,
    onMultiValueChange?: (updatedValue: string[]) => void,
    placeholder?: React.ReactNode,
    renderValue?: (value: string, index: number) => React.ReactNode,
    renderValues?: (values: string[]) => React.ReactNode,
    size?: "small" | "medium",
    label?: React.ReactNode | string,
    disabled?: boolean,
    error?: boolean,
    position?: "item-aligned" | "popper",
    endAdornment?: React.ReactNode,
    multiple?: boolean,
    inputRef?: React.RefObject<HTMLButtonElement>,
    padding?: boolean,
    includeFocusOutline?: boolean,
    invisible?: boolean,
    children?: React.ReactNode
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
                                                                      position = "item-aligned",
                                                                      endAdornment,
                                                                      multiple,
                                                                      invisible,
                                                                      children,
                                                                      ...props
                                                                  }, ref) => {

    const [openInternal, setOpenInternal] = useState(false);

    useEffect(() => {
        setOpenInternal(open ?? false);
    }, [open]);

    const onValueChangeInternal = useCallback((newValue: string) => {
        if (multiple) {
            if (Array.isArray(value) && value.includes(newValue)) {
                onMultiValueChange?.(value.filter(v => v !== newValue));
            } else {
                onMultiValueChange?.([...(value as string[] ?? []), newValue]);
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
            } as ChangeEvent<HTMLSelectElement>;
            onChange(event);
        }
    }, [multiple, onChange, value, onMultiValueChange, onValueChange]);

    const hasValue = Array.isArray(value) ? value.length > 0 : value != null;

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
            }}
            {...props}
        >
            {typeof label === "string" ? <SelectInputLabel error={error}>{label}</SelectInputLabel> : label}
            <div className={cls(
                size === "small" ? "min-h-[42px]" : "min-h-[64px]",
                "select-none rounded-md text-sm",
                invisible ? fieldBackgroundInvisibleMixin : fieldBackgroundMixin,
                disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
                "relative flex items-center",
                className
            )}
            >
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
                        "relative flex items-center",
                        inputClassName
                    )}
                >
                    <div
                        ref={ref}
                        className={cls(
                            "flex-grow w-full max-w-full flex flex-row gap-2 items-center",
                            "overflow-visible",
                            size === "small" ? "h-[42px]" : "h-[64px]"
                        )}
                    >
                        <SelectPrimitive.Value placeholder={placeholder} className={"w-full"}>
                            {renderValue && (hasValue && Array.isArray(value) ? value.map((v, i) => (
                                <div key={v} className={"flex items-center gap-1 max-w-full"}>
                                    {renderValue ? renderValue(v, i) : v}
                                </div>
                            )) : (typeof value === "string" ? (renderValue ? renderValue(value, 0) : value) : placeholder))}
                            {renderValues && (!hasValue || Array.isArray(value)) ? renderValues(value as string[] ?? []) : null}
                            {!renderValue && !renderValues && hasValue}
                        </SelectPrimitive.Value>
                    </div>
                    <SelectPrimitive.Icon className={cls("px-2 h-full flex items-center")}>
                        <ExpandMoreIcon size={"small"} className={cls("transition", open ? "rotate-180" : "")}/>
                    </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>
                {endAdornment && (
                    <div
                        className={cls("absolute h-full flex items-center", size === "small" ? "right-10" : "right-14")}
                        onClick={(e) => e.stopPropagation()}>
                        {endAdornment}
                    </div>
                )}
            </div>
            <SelectPrimitive.Portal>
                <SelectPrimitive.Content position={position}
                                         className={cls("z-50 relative overflow-hidden border bg-white dark:bg-gray-900 p-2 rounded-lg", defaultBorderMixin)}>
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
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
        }}
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
