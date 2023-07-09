import React from "react";
import clsx from "clsx";
import {
    fieldBackgroundDisabledMixin,
    fieldBackgroundHoverMixin,
    fieldBackgroundMixin,
    focusedClasses
} from "../styles";
import { BooleanSwitch } from "./BooleanSwitch";

export type BooleanSwitchWithLabelProps = {
    value: boolean,
    position?: "start" | "end",
    onValueChange?: (value: boolean) => void,
    label?: React.ReactNode,
    disabled?: boolean,
    error?: boolean,
    autoFocus?: boolean,
    size?: "small" | "medium";
};

/**
 * Simple boolean switch.
 *
 */
export const BooleanSwitchWithLabel = function BooleanSwitchWithLabel({
                                                                          value,
                                                                          position = "end",
                                                                          onValueChange,
                                                                          error,
                                                                          label,
                                                                          autoFocus,
                                                                          disabled,
                                                                          size
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
            className={clsx(
                fieldBackgroundMixin,
                disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
                "rounded-md relative cursor-pointer max-w-full justify-between w-full box-border relative inline-flex items-center",
                focus ? focusedClasses : "",
                error ? "text-red-500 dark:text-red-600" : focus ? "text-primary" : "text-text-secondary dark:text-text-secondary-dark",
                size === "small" ? "min-h-[48px]" : "min-h-[64px]",
                size === "small" ? "pl-2" : "pl-4",
                size === "small" ? "pr-4" : "pr-6",
                position === "end" ? "flex-row-reverse" : "flex-row"
            )}
            onClick={(e) => {
                onValueChange?.(!value);
                // refInput.current?.focus();
                e.stopPropagation()
                e.preventDefault()
            }}
        >

            <BooleanSwitch value={value} ref={refInput}/>

            {label}

        </div>

    );
};
