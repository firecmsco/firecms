import React, { useCallback, useRef } from "react";

import { TextareaAutosize } from "./TextareaAutosize";
import { DisabledTextField } from "./DisabledTextField";
import InputLabel from "./InputLabel";
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
                                                         size = "medium",
                                                         inputClassName
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
    size?: "small" | "medium",
    inputClassName?: string
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
                                  size={size}
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
            className="rounded-md resize-none w-full outline-none p-[32px] text-base font-medium leading-normal bg-transparent min-h-[64px] px-3 pt-[28px] pb-2"
        />
        : <input ref={inputRef}
                 onWheel={inputType === "number" ? numberInputOnWheelPreventChange : undefined}
                 className={clsx(
                     "w-full outline-none bg-transparent leading-normal text-base px-3",
                     "rounded-md focus:outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-opacity-75",
                     size === "small" ? "min-h-[48px]" : "min-h-[64px]",
                     label ? "pt-[28px] pb-2" : "py-2",
                     focused ? "text-text-primary dark:text-text-primary-dark" : "",
                     endAdornment ? "pr-10" : "pr-3",
                     inputClassName
                 )}
                 placeholder={placeholder}
                 autoFocus={autoFocus}
                 onFocus={() => setFocused(true)}
                 onBlur={() => setFocused(false)}
                 type={inputType}
                 value={Number.isNaN(value) ? "" : (value ?? "")}
                 onChange={onChange}
        />;


    return (
        <div
            className={clsx(
                "rounded-md relative  max-w-full min-h-[64px]",
                "bg-opacity-70 hover:bg-opacity-90 bg-gray-100 dark:bg-gray-800 dark:bg-opacity-60 dark:hover:bg-opacity-90",
                {
                    "min-h-[48px]": size === "small",
                    "min-h-[64px]": size === "medium"
                })}>
            {label && (
                <InputLabel
                    className={`absolute left-0 top-1 pointer-events-none ${
                        !error ? (focused ? "text-primary" : "text-text-secondary dark:text-text-secondary-dark") : "text-error"
                    }`}
                    shrink={hasValue || focused}
                >
                    {label}
                </InputLabel>
            )}

            {input}

            {endAdornment && <div className="absolute right-0 top-3 mr-3 ">{endAdornment}</div>}
        </div>
    );
}
