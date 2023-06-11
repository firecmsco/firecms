import React from "react";

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
    const refInput = React.useRef<HTMLInputElement | null>(null);
    const [_, setFocused] = React.useState(false)
    const onFocus = () => setFocused(true)
    const onBlur = () => setFocused(false)

    const focus = document.activeElement === refInput?.current || document.activeElement === refWrap?.current;

    return (
        <>

            <div
                ref={refWrap}
                onFocus={onFocus}
                onBlur={onBlur}
                tabIndex={-1}
                className={`rounded-md relative cursor-pointer bg-field-default dark:bg-field-dark max-w-full hover:bg-field-hover dark:hover:bg-field-hover-dark
                    ${error
                    ? "text-error"
                    : focus
                        ? "text-primary"
                        : "text-text-secondary dark:text-text-secondary-dark"
                } justify-between w-full ${
                    small ? "min-h-[48px]" : "min-h-[64px]"
                } ${
                    small ? "pl-2" : "pl-4"
                } ${
                    small ? "pr-4" : "pr-6"
                } box-border relative inline-flex items-center ${
                    position === "end" ? "flex-row-reverse" : "flex-row"
                }`}
                onClick={(e) => {
                    onValueChange?.(!value);
                    refInput.current?.focus();
                }}
            >
                <input ref={refInput}
                       onFocus={onFocus}
                       onBlur={onBlur}
                       type="checkbox"
                       className="toggle toggle-secondary"
                       checked={value}
                       onChange={(evt) => {
                           onValueChange?.(evt.target.checked);
                       }}/>

                {label}
            </div>

        </>

    );
};
