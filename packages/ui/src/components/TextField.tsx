import React, { useCallback, useRef } from "react";

import { TextareaAutosize } from "./TextareaAutosize";
import {
    fieldBackgroundDisabledMixin,
    fieldBackgroundHoverMixin,
    fieldBackgroundInvisibleMixin,
    fieldBackgroundMixin,
    focusedInvisibleMixin,
    focusedMixin
} from "../styles";
import { InputLabel } from "./InputLabel";
import { cn } from "../util";

export type InputType =
    "text"
    | "number"
    | "phone"
    | "email"
    | "password"
    | "search"
    | "url"
    | "date"
    | "time"
    | "datetime-local"
    | "month"
    | "week"
    | "color";

export type TextFieldProps<T extends string | number> = {
    type?: InputType,
    value?: T,
    onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    label?: React.ReactNode,
    multiline?: boolean,
    rows?: number,
    disabled?: boolean,
    invisible?: boolean,
    error?: boolean,
    endAdornment?: React.ReactNode,
    autoFocus?: boolean,
    placeholder?: string,
    size?: "small" | "medium",
    className?: string,
    style?: React.CSSProperties,
    inputClassName?: string,
    inputStyle?: React.CSSProperties,
    inputRef?: React.Ref<any>,
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">;

export function TextField<T extends string | number>({
                                                         value,
                                                         onChange,
                                                         label,
                                                         type = "text",
                                                         multiline = false,
                                                         invisible,
                                                         rows,
                                                         disabled,
                                                         error,
                                                         endAdornment,
                                                         autoFocus,
                                                         placeholder,
                                                         size = "medium",
                                                         className,
                                                         style,
                                                         inputClassName,
                                                         inputStyle,
                                                         inputRef: inputRefProp,
                                                         ...inputProps
                                                     }: TextFieldProps<T>) {

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const inputRef = inputRefProp ?? useRef(null);

    // @ts-ignore
    const [focused, setFocused] = React.useState(document.activeElement === inputRef.current);
    const hasValue = value !== undefined && value !== null && value !== "";

    const numberInputOnWheelPreventChange = useCallback((e: any) => {
        e.target.blur()
        e.stopPropagation()
        setTimeout(() => {
            e.target.focus()
        }, 0)
    }, []);

    const input = multiline
        ? <TextareaAutosize
            {...inputProps as any}
            ref={inputRef}
            placeholder={focused || hasValue || !label ? placeholder : undefined}
            autoFocus={autoFocus}
            rows={rows}
            // onFocus={() => setFocused(true)}
            // onBlur={() => setFocused(false)}
            value={value ?? ""}
            onChange={onChange}
            style={inputStyle}
            className={cn(
                invisible ? focusedInvisibleMixin : focusedMixin,
                "rounded-md resize-none w-full outline-none p-[32px] text-base bg-transparent min-h-[64px] px-3 pt-[28px]",
                disabled && "border border-transparent outline-none opacity-50 text-slate-600 dark:text-slate-500"
            )}
        />
        : <input
            {...inputProps}
            ref={inputRef}
            onWheel={type === "number" ? numberInputOnWheelPreventChange : undefined}
            disabled={disabled}
            style={inputStyle}
            className={cn(
                "w-full outline-none bg-transparent leading-normal px-3",
                "rounded-md",
                invisible ? focusedInvisibleMixin : focusedMixin,
                disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
                size === "small" ? "min-h-[48px]" : "min-h-[64px]",
                label ? (size === "medium" ? "pt-[28px] pb-2" : "pt-4 pb-2") : "py-2",
                focused ? "text-text-primary dark:text-text-primary-dark" : "",
                endAdornment ? "pr-10" : "pr-3",
                disabled && "border border-transparent outline-none opacity-50 dark:opacity-50 text-slate-800 dark:text-slate-200",
                inputClassName
            )}
            placeholder={focused || hasValue || !label ? placeholder : undefined}
            autoFocus={autoFocus}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            type={type}
            value={Number.isNaN(value) ? "" : (value ?? "")}
            onChange={onChange}
        />;

    return (
        <div
            className={cn(
                "rounded-md relative max-w-full",
                invisible ? fieldBackgroundInvisibleMixin : fieldBackgroundMixin,
                disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
                error ? "border border-red-500 dark:border-red-600" : "",
                {
                    "min-h-[48px]": !invisible && size === "small",
                    "min-h-[64px]": !invisible && size === "medium"
                },
                className)}
            style={style}>

            {label && (
                <InputLabel
                    className={cn(
                        "pointer-events-none absolute",
                        size === "medium" ? "top-1" : "-top-1",
                        !error ? (focused ? "text-primary dark:text-primary" : "text-text-secondary dark:text-text-secondary-dark") : "text-red-500 dark:text-red-600",
                        disabled ? "opacity-50" : "")}
                    shrink={hasValue || focused}
                >
                    {label}
                </InputLabel>
            )}

            {input}

            {endAdornment && <div className="flex flex-row justify-center items-center absolute h-full right-0 top-0 mr-4 ">{endAdornment}</div>}

        </div>
    );
}
