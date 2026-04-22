"use client";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { cls } from "../util";
import { CheckIcon, KeyboardArrowDownIcon } from "../icons";
import { Separator } from "./Separator";
import {
    defaultBorderMixin,
    fieldBackgroundDisabledMixin,
    fieldBackgroundHoverMixin,
    fieldBackgroundInvisibleMixin,
    fieldBackgroundMixin,
    focusedDisabled
} from "../styles";
import { useInjectStyles } from "../hooks";
import { usePortalContainer } from "../hooks/PortalContainerContext";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SearchableSelectProps {
    /** Currently selected value. Can be one of the items or a custom string. */
    value?: string;
    /** Callback when the value changes (from selection or custom input). */
    onValueChange?: (value: string) => void;
    /** Placeholder shown when no value is selected. */
    placeholder?: string;
    /** Label above the field. */
    label?: React.ReactNode | string;
    /** Size variant. */
    size?: "smallest" | "small" | "medium" | "large";
    /** Whether the field is disabled. */
    disabled?: boolean;
    /** Whether to show an error state. */
    error?: boolean;
    /** Whether to use the invisible (borderless) style. */
    invisible?: boolean;
    /** CSS class for the trigger button. */
    className?: string;
    /** CSS class for the trigger input area. */
    inputClassName?: string;
    /** Render the selected value in a custom way in the trigger. */
    renderValue?: (value: string) => React.ReactNode;
    /** Whether the popover should trap focus. */
    modalPopover?: boolean;
    /** If true, allow accepting the typed text as the value even if it doesn't match an item. */
    allowCustomValues?: boolean;
    /** Portal container element. */
    portalContainer?: HTMLElement | null;
    /** If true, auto-open the popover on mount so the user can start typing immediately. */
    autoFocus?: boolean;
    /** The option items — use SearchableSelectItem. */
    children: React.ReactNode;
}

export interface SearchableSelectItemProps {
    value: string;
    children?: React.ReactNode;
    className?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export const SearchableSelect = React.forwardRef<
    HTMLButtonElement,
    SearchableSelectProps
>(
    (
        {
            value,
            onValueChange,
            placeholder = "Select...",
            label,
            size = "large",
            disabled,
            error,
            invisible,
            className,
            inputClassName,
            renderValue,
            modalPopover = false,
            allowCustomValues = true,
            portalContainer,
            autoFocus,
            children,
        },
        ref
    ) => {
        const [isMounted, setIsMounted] = useState(false);
        const [isPopoverOpen, setIsPopoverOpen] = useState(false);
        const [search, setSearch] = useState("");
        const inputRef = useRef<HTMLInputElement>(null);

        const contextContainer = usePortalContainer();
        const finalContainer = (portalContainer ?? contextContainer ?? undefined) as HTMLElement | undefined;

        useEffect(() => {
            setIsMounted(true);
        }, []);

        // Auto-open popover on mount when autoFocus is true
        useEffect(() => {
            if (autoFocus && isMounted) {
                onPopoverOpenChange(true);
            }
        }, [autoFocus, isMounted]);

        // Collect all item values + labels from children
        const itemsMap = React.useMemo(() => {
            const map = new Map<string, React.ReactNode>();
            React.Children.forEach(children, (child) => {
                if (React.isValidElement<SearchableSelectItemProps>(child) && child.props.value != null) {
                    map.set(String(child.props.value), child.props.children ?? child.props.value);
                }
            });
            return map;
        }, [children]);

        const onPopoverOpenChange = (open: boolean) => {
            setIsPopoverOpen(open);
            if (open) {
                // Pre-fill search with current value for easy editing
                setSearch(value ?? "");
                // Focus the input after popover opens
                setTimeout(() => inputRef.current?.focus(), 0);
            }
        };

        const handleSelect = (selectedValue: string) => {
            onValueChange?.(selectedValue);
            setIsPopoverOpen(false);
            setSearch("");
        };

        const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && allowCustomValues) {
                const trimmed = search.trim();
                if (trimmed) {
                    // If cmdk found no match, accept custom value
                    // If there are matches, cmdk will handle selecting the highlighted one
                    // We check if the current search is NOT one of the items
                    const isExistingItem = itemsMap.has(trimmed);
                    if (!isExistingItem) {
                        e.preventDefault();
                        handleSelect(trimmed);
                    }
                }
            } else if (e.key === "Escape") {
                setIsPopoverOpen(false);
            }
        };

        // Resolve display label for the trigger
        const displayLabel = React.useMemo(() => {
            if (!value) return null;
            if (renderValue) return renderValue(value);
            const itemLabel = itemsMap.get(value);
            if (itemLabel) return itemLabel;
            return <span className="text-sm">{value}</span>;
        }, [value, renderValue, itemsMap]);

        useInjectStyles("SearchableSelect", `
[cmdk-group] {
  max-height: 45vh;
  overflow-y: auto;
}`);

        return (
            <div>
                {label && (
                    typeof label === "string"
                        ? <div className={cls("text-sm font-medium ml-3.5 mb-1",
                            error ? "text-red-500 dark:text-red-600" : "text-surface-accent-500 dark:text-surface-accent-300",
                        )}>{label}</div>
                        : label
                )}

                <PopoverPrimitive.Root
                    open={isMounted && isPopoverOpen}
                    onOpenChange={onPopoverOpenChange}
                    modal={modalPopover}
                >
                    <PopoverPrimitive.Trigger asChild>
                        <button
                            ref={ref}
                            disabled={disabled}
                            onClick={() => !disabled && onPopoverOpenChange(!isPopoverOpen)}
                            className={cls(
                                {
                                    "min-h-[28px]": size === "smallest",
                                    "min-h-[32px]": size === "small",
                                    "min-h-[44px]": size === "medium",
                                    "min-h-[64px]": size === "large",
                                },
                                {
                                    "py-0.5": size === "smallest",
                                    "py-1": size === "small",
                                    "py-2": size === "medium" || size === "large",
                                },
                                {
                                    "px-2": size === "small" || size === "smallest",
                                    "px-4": size === "medium" || size === "large",
                                },
                                "select-none rounded-md text-sm w-full text-start",
                                "focus:ring-0 focus-visible:ring-0 outline-none focus:outline-none focus-visible:outline-none",
                                invisible ? fieldBackgroundInvisibleMixin : fieldBackgroundMixin,
                                disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
                                "relative flex items-center",
                                className,
                                inputClassName
                            )}
                        >
                            <div className="flex items-center justify-between w-full gap-1">
                                <div className="flex-grow min-w-0 truncate">
                                    {displayLabel ?? (
                                        <span className="text-sm text-surface-accent-500 dark:text-surface-accent-400">
                                            {placeholder}
                                        </span>
                                    )}
                                </div>
                                <div className={cls("flex-shrink-0 flex items-center")}>
                                    <KeyboardArrowDownIcon
                                        size={size === "large" ? "medium" : "small"}
                                        className={cls("transition", isPopoverOpen ? "rotate-180" : "")}
                                    />
                                </div>
                            </div>
                        </button>
                    </PopoverPrimitive.Trigger>
                    <PopoverPrimitive.Portal container={finalContainer}>
                        <PopoverPrimitive.Content
                            className={cls(
                                "z-50 overflow-hidden border bg-white dark:bg-surface-900 rounded-lg",
                                defaultBorderMixin
                            )}
                            align="start"
                            sideOffset={4}
                            style={{ width: "var(--radix-popover-trigger-width)", minWidth: 180 }}
                            onEscapeKeyDown={() => onPopoverOpenChange(false)}
                        >
                            <CommandPrimitive shouldFilter={true}>
                                <div className="flex flex-row items-center">
                                    <CommandPrimitive.Input
                                        ref={inputRef}
                                        value={search}
                                        onValueChange={setSearch}
                                        className={cls(
                                            focusedDisabled,
                                            "bg-transparent outline-none flex-1 h-full w-full text-surface-accent-900 dark:text-white",
                                            {
                                                "m-2 text-xs": size === "smallest" || size === "small",
                                                "m-3 text-sm": size === "medium" || size === "large",
                                            },
                                        )}
                                        placeholder="Search..."
                                        onKeyDown={handleInputKeyDown}
                                    />
                                </div>
                                <Separator orientation="horizontal" className="my-0" />
                                <CommandPrimitive.List>
                                    {allowCustomValues && search.trim() && !itemsMap.has(search.trim()) ? (
                                        <CommandPrimitive.Empty
                                            className="px-3 py-2 text-xs cursor-pointer text-primary hover:bg-surface-accent-100 dark:hover:bg-surface-accent-800"
                                            onClick={() => handleSelect(search.trim())}
                                        >
                                            Use &ldquo;{search.trim()}&rdquo;
                                        </CommandPrimitive.Empty>
                                    ) : (
                                        <CommandPrimitive.Empty className="px-3 py-2 text-xs text-text-secondary dark:text-text-secondary-dark">
                                            No results found.
                                        </CommandPrimitive.Empty>
                                    )}
                                    <CommandPrimitive.Group>
                                        {React.Children.map(children, (child) => {
                                            if (!React.isValidElement<SearchableSelectItemProps>(child)) return child;
                                            const itemValue = child.props.value;
                                            const isSelected = String(value) === String(itemValue);
                                            return (
                                                <CommandPrimitive.Item
                                                    key={String(itemValue)}
                                                    value={String(itemValue)}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                    onSelect={() => handleSelect(String(itemValue))}
                                                    className={cls(
                                                        "flex flex-row items-center gap-1.5",
                                                        isSelected ? "bg-surface-accent-200 dark:bg-surface-accent-950" : "",
                                                        "cursor-pointer",
                                                        "m-0.5",
                                                        "ring-offset-transparent",
                                                        "p-1.5 rounded",
                                                        "aria-[selected=true]:outline-none",
                                                        "aria-[selected=true]:bg-surface-accent-100 aria-[selected=true]:dark:bg-surface-accent-900",
                                                        "text-surface-accent-700 dark:text-surface-accent-300",
                                                        child.props.className
                                                    )}
                                                >
                                                    <div className={cls(
                                                        "w-4 h-4 flex items-center justify-center flex-shrink-0",
                                                        isSelected ? "text-primary" : "text-transparent",
                                                    )}>
                                                        {isSelected && <CheckIcon size={14} />}
                                                    </div>
                                                    {child.props.children ?? child.props.value}
                                                </CommandPrimitive.Item>
                                            );
                                        })}
                                    </CommandPrimitive.Group>
                                </CommandPrimitive.List>
                            </CommandPrimitive>
                        </PopoverPrimitive.Content>
                    </PopoverPrimitive.Portal>
                </PopoverPrimitive.Root>
            </div>
        );
    }
);

SearchableSelect.displayName = "SearchableSelect";

// ─── Item ───────────────────────────────────────────────────────────────────

/**
 * A single option inside a SearchableSelect.
 * The `value` prop is the string value that gets selected.
 * The `children` is what's displayed in the dropdown.
 * This component is not rendered directly — SearchableSelect reads its props.
 */
export function SearchableSelectItem(_props: SearchableSelectItemProps) {
    // Rendered by SearchableSelect, not by React
    return null;
}
