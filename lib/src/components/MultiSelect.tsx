import * as React from "react";
import { useEffect } from "react";
import * as Portal from "@radix-ui/react-portal";

import { Command as CommandPrimitive } from "cmdk";

import { ExpandMoreIcon } from "../icons";
import { fieldBackgroundDisabledMixin, fieldBackgroundHoverMixin, fieldBackgroundMixin, focusedMixin } from "../styles";
import { cn } from "./util/cn";
import { useOutsideAlerter } from "../core";
import { SelectInputLabel } from "./common/SelectInputLabel";

export type MultiSelectProps = {
    open?: boolean,
    name?: string,
    id?: string,
    onOpenChange?: (open: boolean) => void,
    value?: string[],
    containerClassName?: string,
    className?: string,
    inputClassName?: string,
    onMultiValueChange?: (updatedValue: string[]) => void,
    placeholder?: React.ReactNode,
    renderValue?: (values: string) => React.ReactNode,
    renderValues?: (values: string[]) => React.ReactNode,
    size?: "small" | "medium",
    label?: React.ReactNode,
    disabled?: boolean,
    error?: boolean,
    position?: "item-aligned" | "popper",
    endAdornment?: React.ReactNode,
    inputRef?: React.RefObject<HTMLButtonElement>,
    padding?: boolean,
    includeFocusOutline?: boolean,
    children?: React.ReactNode,
};

interface MultiSelectContextProps {
    fieldValue?: string[];
    setInputValue: (v: string) => void;
    onValueChangeInternal: (v: string) => void;
}

export const MultiSelectContext = React.createContext<MultiSelectContextProps>({} as any);

export function MultiSelect({
                                value,
                                open,
                                onMultiValueChange,
                                size = "medium",
                                label,
                                disabled,
                                renderValue,
                                renderValues,
                                includeFocusOutline = true,
                                containerClassName,
                                className,
                                children
                            }: MultiSelectProps) {

    const containerRef = React.useRef<HTMLInputElement>(null);
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

    const draggableBoundingRect = containerRef.current?.getBoundingClientRect();

    const maxHeight = window.innerHeight - (draggableBoundingRect?.top ?? 0);
    console.log({
        top: draggableBoundingRect?.top,
        windowH: window.innerHeight,
        maxHeight
    });
    return (<>

            {typeof label === "string" ? <SelectInputLabel>{label}</SelectInputLabel> : label}

            <CommandPrimitive onKeyDown={handleKeyDown}
                              onClick={() => {
                                  inputRef.current?.focus();
                                  setOpenInternal(true);
                              }}
                              className={cn("overflow-visible bg-transparent", containerClassName)}>
                <div
                    ref={containerRef}
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
                        {renderValue && (value ?? []).map((v, i) => renderValue(v))}
                        {renderValues && renderValues(value ?? [])}
                        <CommandPrimitive.Input
                            ref={inputRef}
                            value={inputValue}
                            onValueChange={setInputValue}
                            onBlur={() => setOpenInternal(false)}
                            onFocus={() => setOpenInternal(true)}
                            className="ml-2 bg-transparent outline-none flex-1 h-full w-full "
                        />
                    </div>
                    <div className={"px-2 h-full flex items-center"}>
                        <ExpandMoreIcon size={"small"}
                                        className={cn("transition ", openInternal ? "rotate-180" : "")}/>
                    </div>

                </div>

                {openInternal && <Portal.Root className={"z-[100] absolute mt-2 text-gray-900 dark:text-white"}
                                              role={"presentation"}
                                              ref={listRef}
                                              style={{
                                                  pointerEvents: openInternal ? "auto" : "none",
                                                  top: (draggableBoundingRect?.top ?? 0) + (draggableBoundingRect?.height ?? 0),
                                                  left: draggableBoundingRect?.left,
                                                  right: draggableBoundingRect?.right,
                                                  width: draggableBoundingRect?.width,
                                              }}>
                    <MultiSelectContext.Provider value={{
                        fieldValue: value,
                        setInputValue,
                        onValueChangeInternal
                    }}>
                        <div
                            style={{
                                maxHeight: maxHeight,
                                overflow: "auto"
                            }}
                            className="absolute w-full outline-none animate-in z-50 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg ">
                            <div className="h-full overflow-auto">
                                {children}
                            </div>
                        </div>
                    </MultiSelectContext.Provider>
                </Portal.Root>}
            </CommandPrimitive>

        </>
    )
}

export interface MultiSelectItemProps {
    value: string;
    children?: React.ReactNode,
    className?: string;
}

export function MultiSelectItem({ children, value, className }: MultiSelectItemProps) {

    const context = React.useContext(MultiSelectContext);
    if (!context) throw new Error("MultiSelectItem must be used inside a MultiSelect");
    const { fieldValue, setInputValue, onValueChangeInternal } = context;

    return <CommandPrimitive.Item
        onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
        }}
        onSelect={(_) => {
            setInputValue("");
            console.log("onSelect", _, value);
            onValueChangeInternal(value);
        }}
        className={cn(
            (fieldValue ?? []).includes(value) ? "bg-gray-200 dark:bg-gray-950" : "",
            "cursor-pointer",
            "m-1",
            "ring-offset-transparent",
            "p-2 rounded aria-[selected=true]:outline-none aria-[selected=true]:ring-2 aria-[selected=true]:ring-primary aria-[selected=true]:ring-opacity-75 aria-[selected=true]:ring-offset-2",
            "aria-[selected=true]:bg-gray-100 aria-[selected=true]:dark:bg-gray-900",
            "cursor-pointer p-2 rounded aria-[selected=true]:bg-gray-100 aria-[selected=true]:dark:bg-gray-900",
            className
        )}
    >
        {children}
    </CommandPrimitive.Item>;
}
