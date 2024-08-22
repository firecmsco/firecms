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
            className={cls(
                !invisible && fieldBackgroundMixin,
                !invisible && (disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin),
                disabled ? "cursor-default" : "cursor-pointer",
                "rounded-md max-w-full justify-between w-full box-border relative inline-flex items-center",
                !invisible && focus && !disabled ? focusedClasses : "",
                error ? "text-red-500 dark:text-red-600" : (focus && !disabled ? "text-primary" : (!disabled ? "text-text-primary dark:text-text-primary-dark" : "text-text-secondary dark:text-text-secondary-dark")),
                size === "smallest" ? "min-h-[40px]" : (size === "small" ? "min-h-[48px]" : "min-h-[64px]"),
                size === "smallest" ? "pl-2" : "pl-4",
                size === "smallest" ? "pr-4" : "pr-6",
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

            <div className={cls(
                "flex-grow",
                position === "end" ? "mr-4" : "ml-4",
                size === "smallest" ? "text-sm" : "text-base"
            )}>
                {label}
            </div>

        </div>

    );
};
