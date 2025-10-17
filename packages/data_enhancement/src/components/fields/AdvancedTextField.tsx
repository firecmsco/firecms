import React, { useCallback, useEffect, useRef } from "react";

import {
    cls,
    fieldBackgroundDisabledMixin,
    fieldBackgroundHoverMixin,
    fieldBackgroundMixin,
    InputLabel,
    TextareaAutosize,
    TextField
} from "@firecms/ui";

export type InputType<T> = T extends string ? "text" : "number";

export function AdvancedTextField<T extends string | number>({
                                                                 value,
                                                                 setValue,
                                                                 label,
                                                                 inputType,
                                                                 multiline = false,
                                                                 highlight,
                                                                 disabled,
                                                                 error,
                                                                 size = "large",
                                                                 className
                                                             }: {
    inputType: InputType<T>,
    value: T,
    setValue: (value: T | null) => void,
    highlight?: string,
    label: React.ReactNode,
    multiline?: boolean,
    disabled?: boolean,
    error?: boolean,
    size?: "smallest" | "small" | "medium" | "large",
    className?: string,
}) {

    const inputRef = useRef(null);
    const ref = useRef<HTMLDivElement>(null);

    const [internalValue, setInternalValue] = React.useState<string>(value ? value.toString() : "");

    useEffect(() => {
        setInternalValue(value ? value.toString() : "");
    }, [value]);

    const onScroll = useCallback((e: any) => {
        if (!ref.current) return;
        ref.current.scrollTop = e.target.scrollTop;
        ref.current.scrollLeft = e.target.scrollLeft;
    }, []);

    const [focused, setFocused] = React.useState(document.activeElement === inputRef.current);

    const hasValue = internalValue !== undefined && internalValue !== null && internalValue !== "";

    const endsWithHighlight = !!highlight && (value === highlight || String(value).endsWith(highlight));
    const originalValue = endsWithHighlight
        ? String(value).substring(0, String(value).length - highlight.length)
        : internalValue;

    const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const stringValue = event.target.value;
        if (inputType === "number") {
            if (stringValue === "-" || stringValue.startsWith(".") || stringValue.endsWith(".")) {
                setInternalValue(stringValue);
            } else {
                const numberValue = stringValue ? parseFloat(stringValue) : undefined;
                if (numberValue && isNaN(numberValue)) {
                    setValue(null);
                    setInternalValue("");
                } else if (numberValue !== undefined && numberValue !== null) {
                    setValue(numberValue as T);
                    setInternalValue(numberValue.toString());
                } else {
                    setValue(null);
                    setInternalValue("");
                }
            }
        } else {
            setValue(stringValue as T);
            setInternalValue(stringValue);
        }
    }, [inputType, setValue]);

    const numberInputOnWheelPreventChange = useCallback((e: any) => {
        e.target.blur()
        e.stopPropagation()
        setTimeout(() => {
            e.target.focus()
        }, 0)
    }, []);

    if (disabled) {
        return <TextField label={label}
                          disabled={true}
                          value={internalValue}/>
    }

    const additional: any = {
        onKeyPress: (e: any) => {
            // if (e.key === "Enter") {
            //     e.preventDefault();
            //     e.stopPropagation();
            // }
            if (!multiline && e.key === "Enter") {
                e.preventDefault();
            }
        }
    }

    return (
        <div className={cls(
            "rounded-md relative max-w-full",
            fieldBackgroundMixin,
            disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
            error ? "border border-red-500 dark:border-red-600" : "",
            {
                "min-h-[28px]": size === "smallest",
                "min-h-[32px]": size === "small",
                "min-h-[42px]": size === "medium",
                "min-h-[64px]": size === "large",
            },
            className)}>

            {label && (
                <InputLabel
                    className={cls("absolute pointer-events-none",
                        !error ? (focused ? "text-primary" : "text-text-secondary dark:text-text-secondary-dark") : "text-red-500 dark:text-red-600",
                        disabled ? "opacity-50" : "",
                        size === "large" ? "top-1" : "-top-px")}
                    shrink={hasValue || focused}
                >
                    {label}
                </InputLabel>
            )}

            <div ref={ref}
                 className={cls("inset-0 whitespace-pre-wrap overflow-x-auto select-none pb-2 px-3",
                     {
                         "pt-8": size === "large",
                         "pt-4": size === "medium" || size === "small",
                     })}>

                {addLineBreaks(originalValue, !endsWithHighlight && multiline)}

                {endsWithHighlight &&
                    <span className="dark:bg-surface-700 bg-surface-300 p-px -m-px rounded-sm">
                    {addLineBreaks(highlight, multiline)}
                </span>}

            </div>

            <TextareaAutosize
                className={cls(
                    {
                        "min-h-[28px]": size === "smallest",
                        "min-h-[32px]": size === "small",
                        "min-h-[42px]": size === "medium",
                        "min-h-[64px]": size === "large",
                    },
                    "rounded-md resize-none w-full outline-none text-base bg-transparent ",
                    disabled && "border border-transparent outline-none opacity-50 text-surface-600 dark:text-surface-500",
                    "absolute top-0 right-0 left-0 max-w-full bg-transparent text-transparent caret-text-primary dark:caret-text-primary-dark",
                    "pt-8 pb-2 px-3",
                    label ? (size === "large" ? "pt-8 pb-2" : "pt-4 pb-2") : "py-2"
                )}
                ignoreBoxSizing={true}
                ref={inputRef}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                value={internalValue}
                sizeRef={ref}
                onChange={onChange}
                onScroll={onScroll}
                {...additional}/>

        </div>
    );
}

function addLineBreaks(value?: string | number, addLastBreak = false) {
    if (typeof value === "number" || value === undefined)
        return value;
    if (typeof value !== "string") {
        console.error("addLineBreaks: value is not a string", value)
        return "";
    }
    const lines = value.split("\n");
    if (lines.length === 1)
        return <span className="break-words"
        >{value ?? " "}</span>;
    // @ts-ignore
    return lines.map((p, i) => <React.Fragment key={i}>
        <span className="break-words"
        >{p ?? " "}</span>
        {(lines.length - 1 !== i || addLastBreak) && <br/>}
    </React.Fragment>);
}
