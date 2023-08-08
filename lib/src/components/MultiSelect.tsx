import * as React from "react";
import { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";

import { Command as CommandPrimitive } from "cmdk";

import { ExpandMoreIcon } from "../icons";
import { fieldBackgroundDisabledMixin, fieldBackgroundHoverMixin, fieldBackgroundMixin, focusedMixin } from "../styles";
import { cn } from "./util/cn";
import { SelectInputLabel } from "./common/SelectInputLabel";
import { useOutsideAlerter } from "./util/useOutsideAlerter";

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
    const [boundingRect, setBoundingRect] = React.useState<DOMRect | null>(null);

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

    const openDialog = React.useCallback(() => {
        setBoundingRect(containerRef.current?.getBoundingClientRect() ?? null);
        setOpenInternal(true);
    }, []);

    const usedBoundingRect = boundingRect ?? containerRef.current?.getBoundingClientRect();
    const maxHeight = window.innerHeight - (usedBoundingRect?.top ?? 0) - (usedBoundingRect?.height ?? 0) - 16;
    console.log({
        openInternal,
        top: usedBoundingRect?.top,
        windowH: window.outerHeight,
        windowi: window.innerHeight,
        maxHeight
    });
    return (<>

            {typeof label === "string" ? <SelectInputLabel>{label}</SelectInputLabel> : label}

            <CommandPrimitive onKeyDown={handleKeyDown}
                              onClick={() => {
                                  inputRef.current?.focus();
                                  openDialog()
                              }}
                              className={cn("relative overflow-visible bg-transparent", containerClassName)}>
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
                            // onBlur={() => setOpenInternal(false)}
                            onFocus={openDialog}
                            className="ml-2 bg-transparent outline-none flex-1 h-full w-full "
                        />
                    </div>
                    <div className={"px-2 h-full flex items-center"}>
                        <ExpandMoreIcon size={"small"}
                                        className={cn("transition ", openInternal ? "rotate-180" : "")}/>
                    </div>

                </div>

                <Dialog.Root open={openInternal} onOpenChange={setOpenInternal}>
                    <Dialog.Portal>
                        <MultiSelectContext.Provider
                            value={{
                                fieldValue: value,
                                setInputValue,
                                onValueChangeInternal
                            }}>
                            <div
                                ref={listRef}
                                className={"z-50 absolute overflow-auto outline-none"}
                                style={{
                                    pointerEvents: openInternal ? "auto" : "none",
                                    top: (usedBoundingRect?.top ?? 0) + (usedBoundingRect?.height ?? 0),
                                    left: usedBoundingRect?.left,
                                    // right: boundingRect?.right,
                                    width: usedBoundingRect?.width,
                                    maxHeight: maxHeight,

                                }}>

                                <CommandPrimitive.Group
                                    className="mt-2 text-gray-900 dark:text-white animate-in z-50 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg flex flex-col outline-none w-full"
                                >

                                    {children}
                                </CommandPrimitive.Group>

                            </div>
                        </MultiSelectContext.Provider>
                    </Dialog.Portal>
                </Dialog.Root>
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
