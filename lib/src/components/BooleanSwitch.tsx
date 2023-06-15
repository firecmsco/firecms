import React from "react";
import clsx from "clsx";

type BooleanSwitchProps = {
    value: boolean,
    position?: "start" | "end",
    onValueChange?: (value: boolean) => void,
    label?: React.ReactNode,
    disabled?: boolean,
    error?: boolean,
    autoFocus?: boolean,
    small?: boolean,
};

/**
 * Simple boolean switch.
 *
 */
export const BooleanSwitch = function SwitchFieldBinding({
                                                             value,
                                                             position = "end",
                                                             onValueChange,
                                                             error,
                                                             label,
                                                             autoFocus,
                                                             disabled,
                                                             small
                                                         }: BooleanSwitchProps) {

    const refWrap = React.useRef<HTMLDivElement | null>(null);
    const refInput = React.useRef<HTMLButtonElement | null>(null);
    const [_, setFocused] = React.useState(autoFocus)
    const onFocus = () => setFocused(true);
    const onBlur = () => setFocused(false);

    React.useEffect(() => {
        if (autoFocus) {
            refInput.current?.focus();
        }
    }, []);

    const focus = document.activeElement === refInput?.current || document.activeElement === refInput?.current;

    return (
        <div
            ref={refWrap}
            onFocus={onFocus}
            onBlur={onBlur}
            tabIndex={-1}
            className={clsx(
                "rounded-md relative cursor-pointer bg-field-default dark:bg-field-dark max-w-full hover:bg-field-hover dark:hover:bg-field-hover-dark justify-between w-full box-border relative inline-flex items-center",
                error ? "text-error" : focus ? "text-primary" : "text-text-secondary dark:text-text-secondary-dark",
                small ? "min-h-[48px]" : "min-h-[64px]",
                small ? "pl-2" : "pl-4",
                small ? "pr-4" : "pr-6",
                position === "end" ? "flex-row-reverse" : "flex-row"
            )}
            onClick={(e) => {
                onValueChange?.(!value);
                refInput.current?.focus();
                e.stopPropagation()
                e.preventDefault()
            }}
        >
            <button
                ref={refInput}
                onClick={(e) => {
                    e.preventDefault();
                }}
                className={clsx("w-[42px] h-[26px] bg-gray-100 bg-opacity-54 rounded-full relative shadow-sm", {
                    "ring-secondary ring-1 bg-secondary": value
                })}>
                <div
                    className={clsx(
                        "block w-[21px] h-[21px] rounded-full transition-transform duration-100 transform  will-change-auto",
                        {
                            "translate-x-[3px] bg-gray-400": !value,
                            "translate-x-[19px] bg-white": value
                        }
                    )}
                />
            </button>

            {label}

        </div>

    );
};
