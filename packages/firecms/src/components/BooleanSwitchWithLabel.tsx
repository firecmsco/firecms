import React from "react";
import {
    fieldBackgroundDisabledMixin,
    fieldBackgroundHoverMixin,
    fieldBackgroundMixin,
    focusedClasses
} from "../styles";
import { BooleanSwitch, BooleanSwitchProps } from "./BooleanSwitch";
import { cn } from "./util/cn";

export type BooleanSwitchWithLabelProps = BooleanSwitchProps & {
    position?: "start" | "end",
    invisible?: boolean,
    label?: React.ReactNode,
    error?: boolean,
    autoFocus?: boolean,
};

/**
 * Simple boolean switch.
 *
 */
export const BooleanSwitchWithLabel = function BooleanSwitchWithLabel({
                                                                          value,
                                                                          position = "end",
                                                                          invisible,
                                                                          onValueChange,
                                                                          error,
                                                                          label,
                                                                          autoFocus,
                                                                          disabled,
                                                                          size,
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
            className={cn(
                !invisible && fieldBackgroundMixin,
                !invisible && (disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin),
                disabled ? "cursor-default" : "cursor-pointer",
                "rounded-md relative max-w-full justify-between w-full box-border relative inline-flex items-center",
                !invisible && focus && !disabled ? focusedClasses : "",
                error ? "text-red-500 dark:text-red-600" : !invisible && focus && !disabled ? "text-primary" : "text-text-secondary dark:text-text-secondary-dark",
                size === "small" ? "min-h-[40px]" : "min-h-[64px]",
                size === "small" ? "pl-2" : "pl-4",
                size === "small" ? "pr-4" : "pr-6",
                position === "end" ? "flex-row-reverse" : "flex-row"
            )}
            onClick={disabled ? undefined : (e) => {
                if (props.allowIndeterminate) {
                    if (value === null || value === undefined) onValueChange?.(true)
                    else if (value) onValueChange?.(false)
                    else onValueChange?.(null as any); // TODO: fix this
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
                className={invisible && focus ? focusedClasses : ""}
                disabled={disabled}
                {...props}
            />

            <div className={cn(
                "flex-grow",
                position === "end" ? "mr-4" : "ml-4",
                size === "small" ? "text-sm" : "text-base"
            )}>
                {label}
            </div>

        </div>

    );
};
