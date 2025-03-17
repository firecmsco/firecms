"use client";
import React, { ForwardedRef, forwardRef, useEffect, useRef } from "react";

import { TextareaAutosize } from "./TextareaAutosize";
import {
    fieldBackgroundDisabledMixin,
    fieldBackgroundHoverMixin,
    fieldBackgroundInvisibleMixin,
    fieldBackgroundMixin,
    focusedInvisibleMixin,
} from "../styles";
import { InputLabel } from "./InputLabel";
import { cls } from "../util";

export type InputType =
    | "text"
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
    type?: InputType;
    value?: T;
    onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    label?: React.ReactNode;
    multiline?: boolean;
    disabled?: boolean;
    invisible?: boolean;
    error?: boolean;
    endAdornment?: React.ReactNode;
    autoFocus?: boolean;
    placeholder?: string;
    size?: "small" | "medium" | "large";
    className?: string;
    style?: React.CSSProperties;
    inputClassName?: string;
    inputStyle?: React.CSSProperties;
    inputRef?: React.ForwardedRef<any>;
    /**
     * Maximum number of rows to display.
     */
    maxRows?: number | string;
    /**
     * Minimum number of rows to display.
     * @default 1
     */
    minRows?: number | string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">;

export const TextField = forwardRef<HTMLDivElement, TextFieldProps<string | number>>(
    <T extends string | number>(
        {
            value,
            onChange,
            label,
            type = "text",
            multiline = false,
            invisible,
            maxRows,
            minRows,
            disabled,
            error,
            endAdornment,
            autoFocus,
            placeholder,
            size = "large",
            className,
            style,
            inputClassName,
            inputStyle,
            inputRef: inputRefProp,
            ...inputProps
        }: TextFieldProps<T>,
        ref: ForwardedRef<HTMLDivElement>
    ) => {

        const inputRef = inputRefProp ?? useRef(null);

        // @ts-ignore
        const [focused, setFocused] = React.useState(document.activeElement === inputRef.current);
        const hasValue = value !== undefined && value !== null && value !== "";

        useEffect(() => {
            if (type !== "number") return;
            const handleWheel = (event: any) => {
                if (event.target instanceof HTMLElement) event.target.blur();
            };

            const element = "current" in inputRef ? inputRef.current : inputRef;

            element?.addEventListener("wheel", handleWheel);

            return () => {
                element?.removeEventListener("wheel", handleWheel);
            };
        }, [inputRef, type]);

        const input = multiline ? (
            <TextareaAutosize
                {...(inputProps as any)}
                ref={inputRef}
                placeholder={focused || hasValue || !label ? placeholder : undefined}
                autoFocus={autoFocus}
                minRows={minRows}
                maxRows={maxRows}
                value={value ?? ""}
                onChange={onChange}
                style={inputStyle}
                className={cls(
                    invisible ? focusedInvisibleMixin : "",
                    "rounded-md resize-none w-full outline-none p-[32px] text-base bg-transparent min-h-[64px] px-3 pt-8",
                    disabled && "outline-none opacity-50 text-surface-accent-600 dark:text-surface-accent-500",
                    inputClassName
                )}
            />
        ) : (
            <input
                {...inputProps}
                ref={inputRef}
                disabled={disabled}
                style={inputStyle}
                className={cls(
                    "w-full outline-none bg-transparent leading-normal px-3",
                    "rounded-md",
                    "focused:text-text-primary focused:dark:text-text-primary-dark",
                    invisible ? focusedInvisibleMixin : "",
                    disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
                    {
                        "min-h-[28px]": size === "small",
                        "min-h-[42px]": size === "medium",
                        "min-h-[64px]": size === "large",
                    },
                    label
                        ? size === "large"
                            ? "pt-8 pb-2"
                            : "pt-4 pb-2"
                        : "py-2",
                    endAdornment ? "pr-10" : "pr-3",
                    disabled &&
                    "outline-none opacity-50 dark:opacity-50 text-surface-accent-800 dark:text-white",
                    inputClassName
                )}
                placeholder={focused || hasValue || !label ? placeholder : undefined}
                autoFocus={autoFocus}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                type={type}
                value={type === "number" && Number.isNaN(value) ? "" : value ?? ""}
                onChange={onChange}
            />
        );

        return (
            <div
                ref={ref}
                className={cls(
                    "rounded-md relative max-w-full",
                    invisible ? fieldBackgroundInvisibleMixin : fieldBackgroundMixin,
                    disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
                    error ? "border border-red-500 dark:border-red-600" : "",
                    {
                        "min-h-[32px]": !invisible && size === "small",
                        "min-h-[48px]": !invisible && size === "medium",
                        "min-h-[64px]": !invisible && size === "large",
                    },
                    className
                )}
                style={style}
            >
                {label && (
                    <InputLabel
                        className={cls(
                            "pointer-events-none absolute",
                            size === "large" ? "top-1" : "top-[-1px]",
                            !error
                                ? focused
                                    ? "text-primary dark:text-primary"
                                    : "text-text-secondary dark:text-text-secondary-dark"
                                : "text-red-500 dark:text-red-600",
                            disabled ? "opacity-50" : ""
                        )}
                        shrink={hasValue || focused}
                    >
                        {label}
                    </InputLabel>
                )}

                {input}

                {endAdornment && (
                    <div
                        className={cls(
                            "flex flex-row justify-center items-center absolute h-full right-0 top-0",
                            {
                                "mr-4": size === "large",
                                "mr-3": size === "medium",
                                "mr-2": size === "small",
                            }
                        )}
                    >
                        {endAdornment}
                    </div>
                )}
            </div>
        );
    }
);

TextField.displayName = "TextField";
