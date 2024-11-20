"use client";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";
import { ChangeEvent, Children, useEffect } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { cls } from "../util";
import { CloseIcon, ExpandMoreIcon, Icon } from "../icons";
import { Separator } from "./Separator";
import { Chip } from "./Chip";
import { SelectInputLabel } from "./common/SelectInputLabel";
import {
    defaultBorderMixin,
    fieldBackgroundDisabledMixin,
    fieldBackgroundHoverMixin,
    fieldBackgroundInvisibleMixin,
    fieldBackgroundMixin,
    focusedDisabled
} from "../styles";
import { useInjectStyles } from "../hooks";

interface MultiSelectContextProps {
    fieldValue?: string[];
    onItemClick: (v: string) => void;
}

export const MultiSelectContext = React.createContext<MultiSelectContextProps>({} as any);

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps {

    /**
     * The modality of the popover. When set to true, interaction with outside elements
     * will be disabled and only popover content will be visible to screen readers.
     * Optional, defaults to false.
     */
    modalPopover?: boolean;

    /**
     * Additional class names to apply custom styles to the multi-select component.
     * Optional, can be used to add custom styles.
     */
    className?: string;

    open?: boolean,
    name?: string,
    id?: string,
    onOpenChange?: (open: boolean) => void,
    value?: string[],
    inputClassName?: string,
    onChange?: React.EventHandler<ChangeEvent<HTMLSelectElement>>,
    onValueChange?: (updatedValue: string[]) => void,
    placeholder?: React.ReactNode,
    size?: "small" | "medium",
    useChips?: boolean,
    label?: React.ReactNode | string,
    disabled?: boolean,
    error?: boolean,
    position?: "item-aligned" | "popper",
    endAdornment?: React.ReactNode,
    multiple?: boolean,
    includeSelectAll?: boolean,
    includeClear?: boolean,
    inputRef?: React.RefObject<HTMLButtonElement>,
    padding?: boolean,
    invisible?: boolean,
    children: React.ReactNode;
    renderValues?: (values: string[]) => React.ReactNode;
}

export const MultiSelect = React.forwardRef<
    HTMLButtonElement,
    MultiSelectProps
>(
    (
        {
            value,
            size,
            label,
            error,
            onValueChange,
            invisible,
            disabled,
            placeholder,
            modalPopover = true,
            includeClear = true,
            includeSelectAll = true,
            useChips = true,
            className,
            children,
            renderValues,
            open,
            onOpenChange,
        },
        ref
    ) => {
        const [isPopoverOpen, setIsPopoverOpen] = React.useState(open ?? false);
        const [selectedValues, setSelectedValues] = React.useState<string[]>(value ?? []);

        const onPopoverOpenChange = (open: boolean) => {
            setIsPopoverOpen(open);
            onOpenChange?.(open);
        }

        useEffect(() => {
            setIsPopoverOpen(open ?? false);
        }, [open]);

        const allValues = children
            ?
            // @ts-ignore
            Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return child.props.value;
                }
                return null;
            }).filter(Boolean) as string[]
            : [];

        React.useEffect(() => {
            setSelectedValues(value ?? []);
        }, [value]);

        function onItemClick(newValue: string) {
            let newSelectedValues: string[];
            if (selectedValues.includes(newValue)) {
                newSelectedValues = selectedValues.filter((v) => v !== newValue);
            } else {
                newSelectedValues = [...selectedValues, newValue];
            }
            updateValues(newSelectedValues);
        }

        function updateValues(values: string[]) {
            setSelectedValues(values);
            onValueChange?.(values);
        }

        const handleInputKeyDown = (
            event: React.KeyboardEvent<HTMLInputElement>
        ) => {
            if (event.key === "Enter") {
                onPopoverOpenChange(true);
            } else if (event.key === "Backspace" && !event.currentTarget.value) {
                const newSelectedValues = [...selectedValues];
                newSelectedValues.pop();
                updateValues(newSelectedValues);
            }
        };

        const toggleOption = (value: string) => {
            const newSelectedValues = selectedValues.includes(value)
                ? selectedValues.filter((v) => v !== value)
                : [...selectedValues, value];
            updateValues(newSelectedValues);
        };

        const handleClear = () => {
            updateValues([]);
        };

        const handleTogglePopover = () => {
            onPopoverOpenChange(!isPopoverOpen);
        };

        const toggleAll = () => {
            if (selectedValues.length === allValues.length) {
                handleClear();
            } else {
                updateValues(allValues);
            }
            onPopoverOpenChange(false);
        };

        useInjectStyles("MultiSelect", `
[cmdk-group] {
  max-height: 45vh;
  overflow-y: auto;
  // width: 400px;
} `)

        return (
            <MultiSelectContext.Provider
                value={{
                    fieldValue: selectedValues,
                    onItemClick
                }}>

                {typeof label === "string" ? <SelectInputLabel error={error}>{label}</SelectInputLabel> : label}

                <PopoverPrimitive.Root
                    open={isPopoverOpen}
                    onOpenChange={onPopoverOpenChange}
                    modal={modalPopover}
                >
                    <PopoverPrimitive.Trigger asChild>
                        <button
                            ref={ref}
                            onClick={handleTogglePopover}
                            className={cls(
                                size === "small" ? "min-h-[42px]" : "min-h-[64px]",
                                "py-2",
                                "px-4",
                                "select-none rounded-md text-sm",
                                invisible ? fieldBackgroundInvisibleMixin : fieldBackgroundMixin,
                                disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
                                "relative flex items-center",
                                className
                            )}
                        >
                            {selectedValues.length > 0 ? (
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex flex-wrap items-center gap-1.5 text-start">
                                        {renderValues && renderValues(selectedValues)}
                                        {!renderValues && selectedValues.map((value) => {

                                            // @ts-ignore
                                            const childrenProps: MultiSelectItemProps[] = Children.map(children, (child) => {
                                                if (React.isValidElement(child)) {
                                                    return child.props;
                                                }
                                            }).filter(Boolean);

                                            const option = childrenProps.find((o) => o.value === value);
                                            if (!useChips) {
                                                return option?.children;
                                            }
                                            return (
                                                <Chip
                                                    size={"medium"}
                                                    key={value}
                                                    className={cls("flex flex-row items-center p-1")}
                                                >
                                                    {option?.children}
                                                    <CloseIcon
                                                        size={"smallest"}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            toggleOption(value);
                                                        }}
                                                    />
                                                </Chip>
                                            );
                                        })}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        {includeClear && <CloseIcon
                                            className={"ml-4"}
                                            size={"small"}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleClear();
                                            }}
                                        />}
                                        <div className={cls("px-2 h-full flex items-center")}>
                                            <ExpandMoreIcon size={"small"}
                                                            className={cls("transition", isPopoverOpen ? "rotate-180" : "")}/>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between w-full mx-auto">
                                    <span className="text-sm">
                                      {placeholder}
                                    </span>
                                    <div className={cls("px-2 h-full flex items-center")}>
                                        <ExpandMoreIcon size={"small"}
                                                        className={cls("transition", isPopoverOpen ? "rotate-180" : "")}/>
                                    </div>
                                </div>
                            )}
                        </button>
                    </PopoverPrimitive.Trigger>
                    <PopoverPrimitive.Content
                        className={cls("z-50 relative overflow-hidden border bg-white dark:bg-surface-900 rounded-lg w-[400px]", defaultBorderMixin)}
                        align="start"
                        sideOffset={8}
                        onEscapeKeyDown={() => onPopoverOpenChange(false)}
                    >
                        <CommandPrimitive>
                            <div className={"flex flex-row items-center"}>
                                <CommandPrimitive.Input
                                    className={cls(focusedDisabled, "bg-transparent outline-none flex-1 h-full w-full m-4 flex-grow ")}
                                    placeholder="Search..."
                                    onKeyDown={handleInputKeyDown}
                                />
                                {selectedValues.length > 0 && (
                                    <div
                                        onClick={handleClear}
                                        className="text-sm justify-center cursor-pointer py-3 px-4 text-text-secondary dark:text-text-secondary-dark">
                                        Clear
                                    </div>
                                )}
                            </div>
                            <Separator orientation={"horizontal"} className={"my-0"}/>
                            <CommandPrimitive.List>
                                <CommandPrimitive.Empty className={"px-4 py-2"}>
                                    No results found.
                                </CommandPrimitive.Empty>
                                <CommandPrimitive.Group>
                                    {includeSelectAll && <CommandPrimitive.Item
                                        key="all"
                                        onSelect={toggleAll}
                                        className={
                                            cls(
                                                "flex flex-row items-center gap-1.5",
                                                "cursor-pointer",
                                                "m-1",
                                                "ring-offset-transparent",
                                                "p-1 rounded aria-[selected=true]:outline-none aria-[selected=true]:ring-2 aria-[selected=true]:ring-primary aria-[selected=true]:ring-opacity-75 aria-[selected=true]:ring-offset-2",
                                                "aria-[selected=true]:bg-surface-accent-100 aria-[selected=true]:dark:bg-surface-accent-900",
                                                "cursor-pointer p-2 rounded aria-[selected=true]:bg-surface-accent-100 aria-[selected=true]:dark:bg-surface-accent-900"
                                            )
                                        }
                                    >
                                        <InnerCheckBox checked={selectedValues.length === allValues.length}/>
                                        <span className={"text-sm text-text-secondary dark:text-text-secondary-dark"}>(Select All)</span>
                                    </CommandPrimitive.Item>}
                                    {children}
                                </CommandPrimitive.Group>

                            </CommandPrimitive.List>
                        </CommandPrimitive>
                    </PopoverPrimitive.Content>
                </PopoverPrimitive.Root>
            </MultiSelectContext.Provider>
        );
    }
);

MultiSelect.displayName = "MultiSelect";

export interface MultiSelectItemProps {
    value: string;
    children?: React.ReactNode,
    className?: string;
}

export function MultiSelectItem({
                                    children,
                                    value,
                                    className
                                }: MultiSelectItemProps) {

    const context = React.useContext(MultiSelectContext);
    if (!context) throw new Error("MultiSelectItem must be used inside a MultiSelect");
    const {
        fieldValue,
        onItemClick
    } = context;

    const isSelected = (fieldValue ?? []).includes(value);
    return <CommandPrimitive.Item
        // value={value}
        onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
        }}
        onSelect={(_) => {
            onItemClick(value);
        }}
        className={cls(
            "flex flex-row items-center gap-1.5",
            isSelected ? "bg-surface-accent-200 dark:bg-surface-accent-950" : "",
            "cursor-pointer",
            "m-1",
            "ring-offset-transparent",
            "p-1 rounded aria-[selected=true]:outline-none aria-[selected=true]:ring-2 aria-[selected=true]:ring-primary aria-[selected=true]:ring-opacity-75 aria-[selected=true]:ring-offset-2",
            "aria-[selected=true]:bg-surface-accent-100 aria-[selected=true]:dark:bg-surface-accent-900",
            "cursor-pointer p-2 rounded aria-[selected=true]:bg-surface-accent-100 aria-[selected=true]:dark:bg-surface-accent-900",
            className
        )}
    >
        <InnerCheckBox checked={isSelected}/>
        {children}
    </CommandPrimitive.Item>;

}

function InnerCheckBox({ checked }: { checked: boolean }) {
    return <div className={cls(
        "p-2",
        "w-8 h-8",
        "inline-flex items-center justify-center text-sm font-medium focus:outline-none transition-colors ease-in-out duration-150",
    )}>
        <div
            className={cls(
                "border-2 relative transition-colors ease-in-out duration-150",
                "w-4 h-4 rounded flex items-center justify-center",
                (checked ? "bg-primary" : "bg-white dark:bg-surface-accent-900"),
                (checked) ? "text-surface-accent-100 dark:text-surface-accent-900" : "",
                (checked ? "border-transparent" : "border-surface-accent-800 dark:border-surface-accent-200")
            )}>
            {checked && <Icon iconKey={"check"} size={16} className={"absolute"}/>}
        </div>
    </div>
}

