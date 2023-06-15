import React, { useCallback, useRef } from "react";

import { TextareaAutosize } from "./TextareaAutosize";
import { DisabledTextField } from "./DisabledTextField";
import TInputLabel from "./TInputLabel";
import clsx from "clsx";

export type InputType = "text" | "number";

export function TextInput<T extends string | number>({
                                                         value,
                                                         onChange,
                                                         label,
                                                         inputType = "text",
                                                         multiline = false,
                                                         disabled,
                                                         error,
                                                         endAdornment,
                                                         autoFocus,
                                                         placeholder,
                                                         small
                                                     }: {
    inputType?: InputType,
    value: T,
    onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    label?: React.ReactNode,
    multiline?: boolean,
    disabled?: boolean,
    error?: boolean,
    endAdornment?: React.ReactNode,
    autoFocus?: boolean,
    placeholder?: string,
    small?: boolean
}) {

    const inputRef = useRef(null);
    const [focused, setFocused] = React.useState(document.activeElement === inputRef.current);
    const hasValue = value !== undefined && value !== null && value !== "";

    const numberInputOnWheelPreventChange = useCallback((e: any) => {
        e.target.blur()
        e.stopPropagation()
        setTimeout(() => {
            e.target.focus()
        }, 0)
    }, []);

    if (disabled) {
        return <DisabledTextField label={label}
                                  small={small}
                                  value={value}/>
    }

    const input = multiline
        ? <TextareaAutosize
            ref={inputRef}
            placeholder={placeholder}
            autoFocus={autoFocus}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            value={value ?? ""}
            onChange={onChange}
            className="rounded-md resize-none w-full outline-none p-[32px] text-base font-medium leading-normal placeholder-[currentColor] bg-transparent min-h-[64px] px-3 pt-[32px] pb-2"
        />
        : <input ref={inputRef}
                 onWheel={inputType === "number" ? numberInputOnWheelPreventChange : undefined}
                 className={`w-full outline-none ${
                     small ? "min-h-[48px]" : "min-h-[64px]"
                 } text-base px-3 ${label ? "pt-[32px] pb-2" : "py-2"} bg-transparent leading-normal ${
                     error ? "text-error" : focused ? "text-text-primary dark:text-text-primary-dark" : ""
                 }`}
                 placeholder={placeholder}
                 autoFocus={autoFocus}
                 onFocus={() => setFocused(true)}
                 onBlur={() => setFocused(false)}
                 type={inputType}
                 value={Number.isNaN(value) ? "" : (value ?? "")}
                 onChange={onChange}
        />;

    const inner = endAdornment
        ? <div className="flex items-center justify-between">
            {input}
            <div className="mr-2 my-1">{endAdornment}</div>
        </div>
        : input;

    return (
        <div
            className={clsx(
                "rounded-md relative  max-w-full min-h-[64px]",
                "bg-opacity-70 hover:bg-opacity-90 bg-gray-100 dark:bg-gray-800 dark:bg-opacity-60 dark:hover:bg-opacity-90",
                {
                    "min-h-[48px]": small,
                    "min-h-[64px]": !small
                })}>
            {label && (
                <TInputLabel
                    className={`absolute left-0 top-1 pointer-events-none ${
                        !error ? (focused ? "text-primary" : "text-text-secondary dark:text-text-secondary-dark") : "text-error"
                    }`}
                    shrink={hasValue || focused}
                >
                    {label}
                </TInputLabel>
            )}

            {inner}
        </div>
    );
}
