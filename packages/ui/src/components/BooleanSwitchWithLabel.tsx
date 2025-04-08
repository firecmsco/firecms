"use client";
import React from "react";
import {
    fieldBackgroundDisabledMixin,
    fieldBackgroundHoverMixin,
    fieldBackgroundMixin,
    focusedClasses
} from "../styles";
import { BooleanSwitch, BooleanSwitchProps } from "./BooleanSwitch";
import { cls } from "../util";

export type BooleanSwitchWithLabelProps = BooleanSwitchProps & {
    position?: "start" | "end",
    invisible?: boolean,
    label?: React.ReactNode,
    error?: boolean,
    autoFocus?: boolean,
    fullWidth?: boolean,
    className?: string,
    inputClassName?: string,
};

/**
 * Simple boolean switch.
 *
 */
export const BooleanSwitchWithLabel = function BooleanSwitchWithLabel({
                                                                          value,
                                                                          position = "end",
                                                                          size = "medium",
                                                                          invisible,
                                                                          onValueChange,
                                                                          error,
                                                                          label,
                                                                          autoFocus,
                                                                          disabled,
                                                                          className,
                                                                          fullWidth = true,
                                                                          inputClassName,
                                                                          ...props
                                                                      }: BooleanSwitchWithLabelProps) {

    const ref = React.useRef<HTMLDivElement | null>(null);
    const refInput = React.useRef<HTMLButtonElement | null>(null);
    const [_, setFocused] = React.useState(autoFocus)
    const onFocus = () => setFocused(true);
    const onBlur = () => setFocused(false);

    React.useEffect(() => {
        if (autoFocus) {
            // refInput.current?.focus();
        }
    }, []);

    const focus = document.activeElement === refInput?.current || document.activeElement === ref?.current

    return (
        <div
            ref={ref}
            onFocus={onFocus}
            onBlur={onBlur}
            tabIndex={-1}
            className={cls(
                !invisible && fieldBackgroundMixin,
                !invisible && (disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin),
                disabled ? "cursor-default" : "cursor-pointer",
                "rounded-md max-w-full justify-between box-border relative inline-flex items-center",
                !invisible && focus && !disabled ? focusedClasses : "",
                error ? "text-red-500 dark:text-red-600" : (focus && !disabled ? "text-primary" : (!disabled ? "text-text-primary dark:text-text-primary-dark" : "text-text-secondary dark:text-text-secondary-dark")),
                {
                    "min-h-[28px]": size === "smallest",
                    "min-h-[32px]": size === "small",
                    "min-h-[42px]": size === "medium",
                    "min-h-[64px]": size === "large",
                },
                size === "small" ? "pl-2" : "pl-4",
                size === "small" ? "pr-4" : "pr-6",
                position === "end" ? "flex-row-reverse" : "flex-row",
                fullWidth ? "w-full" : "",
                className
            )}
            onClick={disabled ? undefined : (e) => {
                if (props.allowIndeterminate) {
                    if (value === null || value === undefined) onValueChange?.(true)
                    else if (value) onValueChange?.(false)
                    else onValueChange?.(null as any);
                } else {
                    onValueChange?.(!value);
                }
                // refInput.current?.focus();
            }}
        >

            <BooleanSwitch
                value={value}
                ref={refInput}
                size={size}
                className={cls(invisible && focus ? focusedClasses : "", inputClassName)}
                disabled={disabled}
                {...props}
            />

            <div className={cls(
                "grow",
                position === "end" ? "mr-4" : "ml-4",
                size === "small" ? "text-sm" : "text-base"
            )}>
                {label}
            </div>

        </div>

    );
};
