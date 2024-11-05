import React, { useRef, useState } from "react";
import { CalendarMonthIcon, ClearIcon, ErrorIcon } from "../icons";
import { IconButton } from "./IconButton";
import { fieldBackgroundDisabledMixin, fieldBackgroundHoverMixin, fieldBackgroundMixin, } from "../styles";
import { InputLabel } from "./InputLabel";
import { Typography } from "./Typography";
import { cls } from "../util";
import { useInjectStyles } from "../hooks";

export type DateTimeFieldProps = {
    value?: Date | null;
    onChange?: (date: Date | null) => void;
    mode?: "date" | "date_time";
    disabled?: boolean;
    clearable?: boolean;
    error?: boolean;
    size?: "small" | "medium";
    label?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    inputClassName?: string;
    invisible?: boolean;
    locale?: string;
};

export const DateTimeField: React.FC<DateTimeFieldProps> = ({
                                                                value,
                                                                label,
                                                                onChange,
                                                                disabled,
                                                                clearable,
                                                                mode = "date",
                                                                error,
                                                                size = "medium",
                                                                className,
                                                                style,
                                                                inputClassName,
                                                                invisible,
                                                                locale, // Note: The 'locale' prop is not utilized with native inputs as they are managed by the browser.
                                                            }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [focused, setFocused] = useState(false);
    const hasValue = value !== undefined && value !== null;
    const invalidValue = value !== undefined && value !== null && !(value instanceof Date);

    useInjectStyles("DateTimeField", inputStyles);

    const handleClear = (e: React.MouseEvent) => {
        e.preventDefault();
        onChange?.(null);
    };

    // Convert Date object to input value string
    const valueAsInputValue = (
        dateValue: Date | null,
        mode: "date" | "date_time"
    ) => {
        if (!dateValue) {
            return "";
        }
        const pad = (n: number) => n.toString().padStart(2, "0");
        const year = dateValue.getFullYear();
        const month = pad(dateValue.getMonth() + 1);
        const day = pad(dateValue.getDate());

        if (mode === "date") {
            return `${year}-${month}-${day}`;
        } else {
            const hours = pad(dateValue.getHours());
            const minutes = pad(dateValue.getMinutes());
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        }
    };

    // Handle input value change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        if (!inputValue) {
            onChange?.(null);
            return;
        }

        let newDate: Date | null = null;
        try {
            if (mode === "date_time") {
                const [datePart, timePart] = inputValue.split("T");
                const [year, month, day] = datePart.split("-").map(Number);
                const [hours, minutes] = timePart.split(":").map(Number);
                newDate = new Date(year, month - 1, day, hours, minutes);
            } else {
                const [year, month, day] = inputValue.split("-").map(Number);
                newDate = new Date(year, month - 1, day);
            }
        } catch (e) {
            newDate = null;
        }

        onChange?.(newDate);
    };

    return (
        <>
            {/* Inject the styles to hide the calendar icon */}
            <style>{inputStyles}</style>
            <div
                className={cls(
                    "rounded-md relative max-w-full",
                    !invisible && fieldBackgroundMixin,
                    disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
                    {
                        "min-h-[48px]": size === "small",
                        "min-h-[64px]": size === "medium",
                    },
                    className
                )}
                style={style}
                onClick={() => {
                    if (!disabled) {
                        inputRef.current?.focus();
                    }
                }}
            >
                {label && (
                    <InputLabel
                        className={cls(
                            "absolute top-1 pointer-events-none",
                            !error
                                ? focused
                                    ? "text-primary"
                                    : "text-text-secondary dark:text-text-secondary-dark"
                                : "text-red-500 dark:text-red-500",
                            disabled ? "opacity-50" : ""
                        )}
                        shrink={true}
                        // shrink={hasValue || focused}
                    >
                        {label}
                    </InputLabel>
                )}

                    <input
                        ref={inputRef}
                        type={mode === "date_time" ? "datetime-local" : "date"}
                        value={valueAsInputValue(value ?? null, mode)}
                        onChange={handleInputChange}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        disabled={disabled}
                        className={cls(
                            "w-full outline-none bg-transparent leading-normal text-base px-3",
                            clearable ? "pr-14" : "pr-12",
                            "rounded-md",
                            size === "small" ? "min-h-[48px]" : "min-h-[64px]",
                            label ? "pt-8 pb-2" : "py-2",
                            inputClassName,
                            disabled &&
                            "border border-transparent outline-none opacity-50 dark:opacity-50 text-surface-accent-600 dark:text-surface-accent-500"
                        )}
                    />
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        inputRef.current?.showPicker();
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 !text-surface-accent-500"
                >
                    <CalendarMonthIcon color={"disabled"}/>
                </IconButton>
                {clearable && value && (
                    <IconButton
                        onClick={handleClear}
                        className="absolute right-14 top-1/2 transform -translate-y-1/2 text-surface-accent-400 "
                    >
                        <ClearIcon/>
                    </IconButton>
                )}
            </div>
            {invalidValue && (
                <div className="flex items-center m-2">
                    <ErrorIcon size={"small"} color={"error"}/>
                    <div className="pl-2">
                        <Typography variant={"body2"} className="font-medium">
                            Invalid date value for this field
                        </Typography>
                        <Typography variant={"body2"}>
                            {`The provided value is: ${JSON.stringify(value)}`}
                        </Typography>
                    </div>
                </div>
            )}
        </>
    );
};

const inputStyles = `
    /* Hide the default calendar icon in Chrome, Safari, Edge, Opera */
    input[type="date"]::-webkit-calendar-picker-indicator,
    input[type="datetime-local"]::-webkit-calendar-picker-indicator {
        display: none;
        -webkit-appearance: none;
    }
    /* Hide default calendar icon in Firefox */
    input[type="date"],
    input[type="datetime-local"] {
        -moz-appearance:textfield;
    }
  `;
