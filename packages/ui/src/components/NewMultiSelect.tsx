// src/components/multi-select.tsx
import * as PopoverPrimitive from "@radix-ui/react-popover";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { cls } from "../util";
import { CheckIcon, CloseIcon, ExpandMoreIcon } from "../icons";
import { Separator } from "./Separator";
import { Checkbox } from "./Checkbox";
import { Chip } from "./Chip";
import {
    defaultBorderMixin,
    fieldBackgroundDisabledMixin,
    fieldBackgroundHoverMixin,
    fieldBackgroundInvisibleMixin,
    fieldBackgroundMixin, focusedDisabled
} from "../styles.ts";

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * An array of option objects to be displayed in the multi-select component.
     * Each option object has a label, value, and an optional icon.
     */
    options: {
        /** The text to display for the option. */
        label: string;
        /** The unique value associated with the option. */
        value: string;
    }[];

    /**
     * Callback function triggered when the selected values change.
     * Receives an array of the new selected values.
     */
    onValueChange: (value: string[]) => void;

    /** The default selected values when the component mounts. */
    defaultValue: string[];

    /**
     * Placeholder text to be displayed when no values are selected.
     * Optional, defaults to "Select options".
     */
    placeholder?: string;

    /**
     * Animation duration in seconds for the visual effects (e.g., bouncing badges).
     * Optional, defaults to 0 (no animation).
     */
    animation?: number;

    /**
     * Maximum number of items to display. Extra selected items will be summarized.
     * Optional, defaults to 3.
     */
    maxCount?: number;

    /**
     * The modality of the popover. When set to true, interaction with outside elements
     * will be disabled and only popover content will be visible to screen readers.
     * Optional, defaults to false.
     */
    modalPopover?: boolean;

    /**
     * If true, renders the multi-select component as a child of another component.
     * Optional, defaults to false.
     */
    asChild?: boolean;

    /**
     * Additional class names to apply custom styles to the multi-select component.
     * Optional, can be used to add custom styles.
     */
    className?: string;

    size?: "small" | "medium",

    invisible?: boolean;
    disabled?: boolean;

    variant?: "default" | "secondary" | "destructive";
}

export const NewMultiSelect = React.forwardRef<
    HTMLButtonElement,
    MultiSelectProps
>(
    (
        {
            size,
            options,
            onValueChange,
            invisible,
            disabled,
            variant,
            defaultValue = [],
            placeholder = "Select options",
            animation = 0,
            maxCount = 3,
            modalPopover = false,
            asChild = false,
            className,
            ...props
        },
        ref
    ) => {
        const [selectedValues, setSelectedValues] =
            React.useState<string[]>(defaultValue);
        const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
        // const [isAnimating, setIsAnimating] = React.useState(false);

        React.useEffect(() => {
            setSelectedValues(defaultValue);
        }, [defaultValue]);

        const handleInputKeyDown = (
            event: React.KeyboardEvent<HTMLInputElement>
        ) => {
            if (event.key === "Enter") {
                setIsPopoverOpen(true);
            } else if (event.key === "Backspace" && !event.currentTarget.value) {
                const newSelectedValues = [...selectedValues];
                newSelectedValues.pop();
                setSelectedValues(newSelectedValues);
                onValueChange(newSelectedValues);
            }
        };

        const toggleOption = (value: string) => {
            const newSelectedValues = selectedValues.includes(value)
                ? selectedValues.filter((v) => v !== value)
                : [...selectedValues, value];
            setSelectedValues(newSelectedValues);
            onValueChange(newSelectedValues);
        };

        const handleClear = () => {
            setSelectedValues([]);
            onValueChange([]);
        };

        const handleTogglePopover = () => {
            setIsPopoverOpen((prev) => !prev);
        };

        const clearExtraOptions = () => {
            const newSelectedValues = selectedValues.slice(0, maxCount);
            setSelectedValues(newSelectedValues);
            onValueChange(newSelectedValues);
        };

        const toggleAll = () => {
            if (selectedValues.length === options.length) {
                handleClear();
            } else {
                const allValues = options.map((option) => option.value);
                setSelectedValues(allValues);
                onValueChange(allValues);
            }
        };

        return (
            <PopoverPrimitive.Root
                open={isPopoverOpen}
                onOpenChange={setIsPopoverOpen}
                modal={modalPopover}
            >
                <PopoverPrimitive.Trigger asChild>
                    <button
                        ref={ref}
                        {...props}
                        onClick={handleTogglePopover}
                        className={cls(
                            size === "small" ? "min-h-[42px]" : "min-h-[64px]",
                            "select-none rounded-md text-sm",
                            invisible ? fieldBackgroundInvisibleMixin : fieldBackgroundMixin,
                            disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
                            "relative flex items-center",
                            className
                        )}
                    >
                        {selectedValues.length > 0 ? (
                            <div className="flex justify-between items-center w-full">
                                <div className="flex flex-wrap items-center">
                                    {selectedValues.slice(0, maxCount).map((value) => {
                                        const option = options.find((o) => o.value === value);
                                        return (
                                            <Chip
                                                key={value}
                                                className={cls(
                                                    "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
                                                    {
                                                        "border-foreground/10 text-foreground bg-card hover:bg-card/80": variant === "default",
                                                        "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
                                                        "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80": variant === "destructive",
                                                    }
                                                )}
                                                style={{ animationDuration: `${animation}s` }}
                                            >
                                                {option?.label}
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
                                    {selectedValues.length > maxCount && (
                                        <Chip
                                            className={cls(
                                                "bg-transparent text-foreground border-foreground/1 hover:bg-transparent",
                                                "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
                                                {
                                                    "border-foreground/10 text-foreground bg-card hover:bg-card/80": variant === "default",
                                                    "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
                                                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80": variant === "destructive",
                                                }
                                            )}
                                            style={{ animationDuration: `${animation}s` }}
                                        >
                                            {`+ ${selectedValues.length - maxCount} more`}
                                            <CloseIcon
                                                size={"smallest"}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    clearExtraOptions();
                                                }}
                                            />
                                        </Chip>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <CloseIcon
                                        size={"small"}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleClear();
                                        }}
                                    />
                                    <Separator
                                        orientation="vertical"
                                    />

                                    <div className={cls("px-2 h-full flex items-center")}>
                                        <ExpandMoreIcon size={"small"}
                                                        className={cls("transition", isPopoverOpen ? "rotate-180" : "")}/>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between w-full mx-auto">
                                <span className="text-sm text-muted-foreground mx-3">
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
                    className={cls("z-50 relative overflow-hidden border bg-white dark:bg-gray-900 p-2 rounded-lg", defaultBorderMixin)}
                    align="start"
                    onEscapeKeyDown={() => setIsPopoverOpen(false)}
                >
                    <CommandPrimitive>
                        <CommandPrimitive.Input
                            className={cls(focusedDisabled, "bg-transparent outline-none flex-1 h-full w-full m-4")}
                            placeholder="Search..."
                            onKeyDown={handleInputKeyDown}
                        />
                        <CommandPrimitive.List>
                            <CommandPrimitive.Empty>No results found.</CommandPrimitive.Empty>
                            <CommandPrimitive.Group>
                                <CommandPrimitive.Item
                                    key="all"
                                    onSelect={toggleAll}
                                    className={
                                        cls(
                                            // (fieldValue ?? []).includes(value) ? "bg-slate-200 dark:bg-slate-950" : "",
                                            "cursor-pointer",
                                            "flex flex-row items-center gap-2",
                                            "ring-offset-transparent",
                                            "p-1 rounded aria-[selected=true]:outline-none aria-[selected=true]:ring-2 aria-[selected=true]:ring-primary aria-[selected=true]:ring-opacity-75 aria-[selected=true]:ring-offset-2",
                                            "aria-[selected=true]:bg-slate-100 aria-[selected=true]:dark:bg-slate-900",
                                            "cursor-pointer p-1 rounded aria-[selected=true]:bg-slate-100 aria-[selected=true]:dark:bg-slate-900",
                                            className
                                        )
                                    }
                                >
                                    <Checkbox checked={selectedValues.length === options.length} size={"small"}/>
                                    <span>(Select All)</span>
                                </CommandPrimitive.Item>
                                {options.map((option) => {
                                    const isSelected = selectedValues.includes(option.value);
                                    return (
                                        <CommandPrimitive.Item
                                            key={option.value}
                                            onSelect={() => toggleOption(option.value)}
                                            className={cls(
                                                // (fieldValue ?? []).includes(value) ? "bg-slate-200 dark:bg-slate-950" : "",
                                                "cursor-pointer",
                                                "flex flex-row items-center gap-2",
                                                "ring-offset-transparent",
                                                "p-1 rounded aria-[selected=true]:outline-none aria-[selected=true]:ring-2 aria-[selected=true]:ring-primary aria-[selected=true]:ring-opacity-75 aria-[selected=true]:ring-offset-2",
                                                "aria-[selected=true]:bg-slate-100 aria-[selected=true]:dark:bg-slate-900",
                                                "cursor-pointer p-1 rounded aria-[selected=true]:bg-slate-100 aria-[selected=true]:dark:bg-slate-900",
                                                className
                                            )}
                                        >

                                            <Checkbox checked={isSelected} size={"small"}/>
                                            <span>{option.label}</span>
                                        </CommandPrimitive.Item>
                                    );
                                })}
                            </CommandPrimitive.Group>
                            <CommandPrimitive.Separator/>
                            <CommandPrimitive.Group>
                                <div className="flex items-center justify-between">
                                    {selectedValues.length > 0 && (
                                        <>
                                            <CommandPrimitive.Item
                                                onSelect={handleClear}
                                                className="flex-1 justify-center cursor-pointer"
                                            >
                                                Clear
                                            </CommandPrimitive.Item>
                                            <Separator
                                                orientation="vertical"
                                            />
                                        </>
                                    )}
                                    <CommandPrimitive.Item
                                        onSelect={() => setIsPopoverOpen(false)}
                                        className="flex-1 justify-center cursor-pointer max-w-full"
                                    >
                                        Close
                                    </CommandPrimitive.Item>
                                </div>
                            </CommandPrimitive.Group>
                        </CommandPrimitive.List>
                    </CommandPrimitive>
                </PopoverPrimitive.Content>
                {/*{animation > 0 && selectedValues.length > 0 && (*/}
                {/*    <WandSparkles*/}
                {/*        className={cls(*/}
                {/*            "cursor-pointer my-2 text-foreground bg-background w-3 h-3",*/}
                {/*            isAnimating ? "" : "text-muted-foreground"*/}
                {/*        )}*/}
                {/*        onClick={() => setIsAnimating(!isAnimating)}*/}
                {/*    />*/}
                {/*)}*/}
            </PopoverPrimitive.Root>
        );
    }
);

NewMultiSelect.displayName = "MultiSelect";
