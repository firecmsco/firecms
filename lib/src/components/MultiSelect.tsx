import * as React from "react";
import { useEffect } from "react";
import { Command as CommandPrimitive } from "cmdk";

import { ExpandMoreIcon } from "../icons";
import { fieldBackgroundDisabledMixin, fieldBackgroundHoverMixin, fieldBackgroundMixin, focusedMixin } from "../styles";
import { cn } from "./util/cn";
import { useOutsideAlerter } from "../core";
import { SelectInputLabel } from "./common/SelectInputLabel";

export type MultiSelectProps = {
    open?: boolean,
    defaultOpen?: boolean,
    name?: string,
    id?: string,
    onOpenChange?: (open: boolean) => void,
    value?: string[],
    containerClassName?: string,
    className?: string,
    inputClassName?: string,
    onMultiValueChange?: (updatedValue: string[]) => void,
    placeholder?: React.ReactNode,
    renderValue: (values: string, list: boolean) => React.ReactNode,
    size?: "small" | "medium",
    label?: React.ReactNode,
    disabled?: boolean,
    error?: boolean,
    position?: "item-aligned" | "popper",
    options: string[],
    endAdornment?: React.ReactNode,
    inputRef?: React.RefObject<HTMLButtonElement>,
    padding?: boolean,
    includeFocusOutline?: boolean,
};

export function MultiSelect({
                                value,
                                open,
                                onMultiValueChange,
                                size = "medium",
                                label,
                                options,
                                disabled,
                                renderValue,
                                includeFocusOutline = true,
                                containerClassName,
                                className
                            }: MultiSelectProps) {

    const inputRef = React.useRef<HTMLInputElement>(null);

    const listRef = React.useRef<HTMLDivElement>(null);
    useOutsideAlerter(listRef, () => setOpenInternal(false));

    const [openInternal, setOpenInternal] = React.useState(false);
    useEffect(() => {
        setOpenInternal(open ?? false);
    }, [open]);

    const onValueChangeInternal = React.useCallback((newValue: string) => {
        if (Array.isArray(value) && value.includes(newValue)) {
            onMultiValueChange?.(value.filter(v => v !== newValue));
        } else {
            onMultiValueChange?.([...(value ?? []), newValue]);
        }
    }, [value, onMultiValueChange]);

    const [inputValue, setInputValue] = React.useState("");

    const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current
        if (input) {
            if (e.key === "Delete" || e.key === "Backspace") {
                if (input.value === "") {
                    const newSelected = [...(value ?? [])];
                    newSelected.pop();
                    onMultiValueChange?.(newSelected);
                }
            }
            // This is not a default behaviour of the <input /> field
            if (e.key === "Escape") {
                input.blur();
                setOpenInternal(false);
                e.stopPropagation();
            }
        }
    }, [onMultiValueChange, value]);

    // const selectables = options.filter(framework => !(value ?? []).includes(framework));

    return (<>

            {typeof label === "string" ? <SelectInputLabel>{label}</SelectInputLabel> : label}

            <CommandPrimitive onKeyDown={handleKeyDown}
                              onClick={() => {
                                  inputRef.current?.focus();
                                  setOpenInternal(true);
                              }}
                              className={cn("overflow-visible bg-transparent", containerClassName)}>
                <div
                    className={cn(
                        "flex flex-row",
                        size === "small" ? "min-h-[42px]" : "min-h-[64px]",
                        "select-none rounded-md text-sm",
                        fieldBackgroundMixin,
                        disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
                        "relative flex items-center",
                        "p-4",
                        includeFocusOutline ? focusedMixin : "",
                        className)}
                >
                    <div className={cn("flex-grow flex gap-1.5 flex-wrap items-center")}>
                        {(value ?? []).map((v, i) => renderValue(v, false))}
                        <CommandPrimitive.Input
                            ref={inputRef}
                            value={inputValue}
                            onValueChange={setInputValue}
                            onBlur={() => setOpenInternal(false)}
                            onFocus={() => setOpenInternal(true)}
                            // placeholder="Select frameworks..."
                            className="ml-2 bg-transparent outline-none flex-1 h-full w-full "
                        />
                    </div>
                    <div className={"px-2 h-full flex items-center"}>
                        <ExpandMoreIcon size={"small"}
                                        className={cn("transition ", openInternal ? "rotate-180" : "")}/>
                    </div>

                </div>

                <CommandPrimitive.List className="relative mt-2" ref={listRef}>
                    {
                        openInternal &&
                        options.length > 0
                            ? <div
                                className="absolute w-full top-0 outline-none animate-in z-50 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg ">
                                <CommandPrimitive.Group className="h-full overflow-auto">
                                    {options.map((option, i) => (
                                        <CommandPrimitive.Item
                                            key={option}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onSelect={(_) => {
                                                setInputValue("");
                                                console.log("onSelect", _, option);
                                                onValueChangeInternal(option);
                                            }}
                                            className={cn(
                                                (value ?? []).includes(option) ? "bg-gray-200 dark:bg-gray-950" : "",
                                                "cursor-pointer",
                                                "m-1",
                                                "ring-offset-transparent",
                                                "p-2 rounded aria-[selected=true]:outline-none aria-[selected=true]:ring-2 aria-[selected=true]:ring-primary aria-[selected=true]:ring-opacity-75 aria-[selected=true]:ring-offset-2",
                                                "aria-[selected=true]:bg-gray-100 aria-[selected=true]:dark:bg-gray-900",
                                                "cursor-pointer p-2 rounded aria-[selected=true]:bg-gray-100 aria-[selected=true]:dark:bg-gray-900"
                                            )}
                                        >
                                            {renderValue(option, true) ?? option}
                                        </CommandPrimitive.Item>
                                    ))}
                                </CommandPrimitive.Group>
                            </div>
                            : null}
                </CommandPrimitive.List>
            </CommandPrimitive>

        </>
    )
}
