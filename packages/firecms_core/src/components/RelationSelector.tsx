import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { Command as CommandPrimitive } from "cmdk";
import {
    CheckIcon,
    Chip,
    CircularProgress,
    CloseIcon,
    cls,
    defaultBorderMixin,
    fieldBackgroundDisabledMixin,
    fieldBackgroundHoverMixin,
    fieldBackgroundInvisibleMixin,
    fieldBackgroundMixin,
    focusedDisabled,
    KeyboardArrowDownIcon,
    SearchIcon,
    Separator,
    useInjectStyles
} from "@firecms/ui";
import { Entity, EntityRelation } from "@firecms/types";
import { EntityPreviewData } from "./EntityPreview";

export interface RelationItem {
    id: string | number;
    label: string;
    description?: string;
    data?: Entity;
    relation: EntityRelation
}

export interface RelationSelectorProps {
    modalPopover?: boolean;
    className?: string;
    open?: boolean;
    name?: string;
    id?: string;
    onOpenChange?: (open: boolean) => void;
    value?: RelationItem | RelationItem[];
    inputClassName?: string;
    onChange?: React.EventHandler<ChangeEvent<HTMLSelectElement>>;
    onValueChange?: (updatedValue: RelationItem | RelationItem[] | undefined) => void;
    placeholder?: React.ReactNode;
    size?: "small" | "medium";
    useChips?: boolean;
    label?: React.ReactNode | string;
    disabled?: boolean;
    error?: boolean;
    position?: "item-aligned" | "popper";
    endAdornment?: React.ReactNode;
    multiple?: boolean;
    includeClear?: boolean;
    inputRef?: React.RefObject<HTMLButtonElement>;
    padding?: boolean;
    invisible?: boolean;

    // Data props - items and state come from parent/hook
    items: RelationItem[];
    isLoading?: boolean;
    hasMore?: boolean;
    onSearch?: (searchString: string) => void;
    onLoadMore?: () => void;
    searchPlaceholder?: string;
    noResultsText?: string;
    loadingText?: string;

    // Entity preview props
    includeId?: boolean;
    includeEntityLink?: boolean;
}

export const RelationSelector = React.forwardRef<
    HTMLButtonElement,
    RelationSelectorProps
>(
    (
        {
            value,
            size = "medium",
            label,
            error,
            onValueChange,
            invisible,
            disabled,
            placeholder,
            modalPopover = true,
            includeClear = true,
            useChips = true,
            className,
            open,
            onOpenChange,
            multiple = false,
            items,
            isLoading = false,
            hasMore = false,
            onSearch,
            onLoadMore,
            searchPlaceholder = "Search...",
            noResultsText = "No relations found.",
            loadingText = "Loading...",
            includeId,
            includeEntityLink,
        },
        ref
    ) => {
        const [isPopoverOpen, setIsPopoverOpen] = useState(open ?? false);
        const [selectedValues, setSelectedValues] = useState<RelationItem[]>(() => {
            if (!value) return [];
            return Array.isArray(value) ? value : [value];
        });
        const [searchString, setSearchString] = useState<string>("");

        // Ref for the scrollable container and sentinel element
        const scrollContainerRef = useRef<HTMLDivElement>(null);
        const sentinelRef = useRef<HTMLDivElement>(null);
        const observerRef = useRef<IntersectionObserver | null>(null);

        const onPopoverOpenChange = (open: boolean) => {
            setIsPopoverOpen(open);
            onOpenChange?.(open);
        };

        useEffect(() => {
            setIsPopoverOpen(open ?? false);
        }, [open]);

        useEffect(() => {
            if (!value) {
                setSelectedValues([]);
                return;
            }
            const newValues = Array.isArray(value) ? value : [value];
            setSelectedValues(newValues);
        }, [value]);

        // Callback ref for sentinel element - this ensures the observer is set up after DOM update
        const sentinelCallbackRef = useCallback((node: HTMLDivElement | null) => {
            // Clean up existing observer
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }

            // Store the node reference (fix TS2540 error)
            if (sentinelRef.current !== node) {
                (sentinelRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }

            if (!node) {
                return;
            }

            if (!hasMore || isLoading || !onLoadMore) {
                return;
            }

            const observer = new IntersectionObserver(
                (entries) => {
                    const entry = entries[0];
                    if (entry.isIntersecting && hasMore && !isLoading) {
                        onLoadMore();
                    }
                },
                {
                    root: scrollContainerRef.current,
                    rootMargin: "20px",
                    threshold: 0
                }
            );

            observer.observe(node);
            observerRef.current = observer;
        }, [hasMore, isLoading, onLoadMore]);

        // Clean up observer on unmount
        useEffect(() => {
            return () => {
                if (observerRef.current) {
                    observerRef.current.disconnect();
                }
            };
        }, []);

        // Handle search input changes
        const handleSearchChange = useCallback((newSearchString: string) => {
            setSearchString(newSearchString);
            onSearch?.(newSearchString);
        }, [onSearch]);

        const onItemClick = useCallback((item: RelationItem) => {
            let newSelectedValues: RelationItem[];

            if (multiple) {
                const isSelected = selectedValues.some(v => String(v.id) === String(item.id));
                if (isSelected) {
                    newSelectedValues = selectedValues.filter(v => String(v.id) !== String(item.id));
                } else {
                    newSelectedValues = [...selectedValues, item];
                }
            } else {
                newSelectedValues = [item];
                onPopoverOpenChange(false);
            }

            setSelectedValues(newSelectedValues);

            if (multiple) {
                onValueChange?.(newSelectedValues.length > 0 ? newSelectedValues : undefined);
            } else {
                onValueChange?.(newSelectedValues.length > 0 ? newSelectedValues[0] : undefined);
            }
        }, [multiple, selectedValues, onValueChange, onPopoverOpenChange]);

        const handleClear = useCallback(() => {
            setSelectedValues([]);
            onValueChange?.(undefined);
        }, [onValueChange]);

        const handleTogglePopover = () => {
            onPopoverOpenChange(!isPopoverOpen);
        };

        const handleRemoveItem = useCallback((itemToRemove: RelationItem) => {
            const newSelectedValues = selectedValues.filter(v => String(v.id) !== String(itemToRemove.id));
            setSelectedValues(newSelectedValues);

            if (multiple) {
                onValueChange?.(newSelectedValues.length > 0 ? newSelectedValues : undefined);
            } else {
                onValueChange?.(undefined);
            }
        }, [selectedValues, multiple, onValueChange]);

        useInjectStyles("RelationSelector", `
            [cmdk-group] {
                max-height: 45vh;
                overflow-y: auto;
            }
        `);

        return (
            <>
                <PopoverPrimitive.Root
                    open={isPopoverOpen}
                    onOpenChange={onPopoverOpenChange}
                    modal={false}
                >
                    <PopoverPrimitive.Trigger asChild>
                        <button
                            ref={ref}
                            onClick={handleTogglePopover}
                            disabled={disabled}
                            className={cls(
                                "w-full",
                                {
                                    "min-h-[32px]": size === "small",
                                    "min-h-[42px]": size === "medium",
                                },
                                {
                                    "py-1": size === "small",
                                    "py-2": size === "medium"
                                },
                                {
                                    "px-2": size === "small",
                                    "px-4": size === "medium",
                                },
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
                                        {selectedValues.map((item) => {
                                            if (!useChips || !multiple) {
                                                return (
                                                    <div key={String(item.id)}
                                                         className="flex flex-row items-center gap-2">
                                                        {item.data ? (
                                                            <EntityPreviewData
                                                                size={"small"}
                                                                entity={item.data}
                                                                includeEntityLink={false}
                                                                includeId={false}
                                                            />
                                                        ) : (
                                                            <span className="text-sm">{item.label}</span>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return (
                                                <Chip
                                                    size={"medium"}
                                                    key={String(item.id)}
                                                    className={cls("flex flex-row items-center p-1")}
                                                >
                                                    {item.data ? (
                                                        <EntityPreviewData
                                                            size={"small"}
                                                            entity={item.data}
                                                            includeEntityLink={false}
                                                            includeId={false}
                                                        />
                                                    ) : (
                                                        <span className="text-sm">{item.label}</span>
                                                    )}
                                                    <CloseIcon
                                                        size={"smallest"}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleRemoveItem(item);
                                                        }}
                                                    />
                                                </Chip>
                                            );
                                        })}
                                    </div>
                                    <KeyboardArrowDownIcon
                                        size={size === "medium" ? "medium" : "small"}
                                        className={cls("transition ml-2", isPopoverOpen ? "rotate-180" : "")}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-between w-full mx-auto">
                                    <span className="text-sm text-text-secondary dark:text-text-secondary-dark">
                                        {placeholder}
                                    </span>
                                    <div className={cls("px-2 h-full flex items-center")}>
                                        <KeyboardArrowDownIcon
                                            size={size === "medium" ? "medium" : "small"}
                                            className={cls("transition", isPopoverOpen ? "rotate-180" : "")}
                                        />
                                    </div>
                                </div>
                            )}
                        </button>
                    </PopoverPrimitive.Trigger>
                    <PopoverPrimitive.Portal container={typeof document !== "undefined" ? document.body : undefined}>
                        <PopoverPrimitive.Content
                            className={cls("z-50 overflow-hidden border bg-white dark:bg-surface-900 rounded-lg", defaultBorderMixin)}
                            align="start"
                            sideOffset={8}
                            avoidCollisions={true}
                            collisionPadding={16}
                            onEscapeKeyDown={() => onPopoverOpenChange(false)}
                            style={{
                                zIndex: 9999,
                                width: "var(--radix-popover-trigger-width)"
                            }}
                        >
                            <CommandPrimitive shouldFilter={false}>
                                <div className={"flex flex-row items-center"}>
                                    <div className="relative flex-1">
                                        <SearchIcon
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary dark:text-text-secondary-dark"
                                            size="small"/>
                                        <CommandPrimitive.Input
                                            className={cls(focusedDisabled, "bg-transparent outline-hidden flex-1 h-full w-full pl-10 pr-4 py-3 text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark")}
                                            placeholder={searchPlaceholder}
                                            value={searchString}
                                            onValueChange={handleSearchChange}
                                        />
                                    </div>
                                    {/* Loading indicator when loading more items */}
                                    {isLoading && (
                                        <div className="flex items-center justify-center px-3">
                                            <CircularProgress size="smallest"/>
                                        </div>
                                    )}
                                    {selectedValues.length > 0 && (
                                        <div
                                            onClick={handleClear}
                                            className="text-sm justify-center cursor-pointer py-3 px-4 text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark"
                                        >
                                            Clear
                                        </div>
                                    )}
                                </div>
                                <Separator orientation={"horizontal"} className={"my-0"}/>
                                <CommandPrimitive.List
                                    ref={scrollContainerRef}
                                    style={{
                                        maxHeight: "45vh",
                                        overflowY: "auto"
                                    }}
                                >
                                    {isLoading && items.length === 0 && (
                                        <div className="flex items-center justify-center py-6">
                                            <CircularProgress size="small"/>
                                            <span
                                                className="ml-2 text-sm text-text-secondary dark:text-text-secondary-dark">
                                                {loadingText}
                                            </span>
                                        </div>
                                    )}

                                    {!isLoading && items.length === 0 && (
                                        <CommandPrimitive.Empty
                                            className={"px-4 py-6 text-center text-text-secondary dark:text-text-secondary-dark"}>
                                            {noResultsText}
                                        </CommandPrimitive.Empty>
                                    )}

                                    <CommandPrimitive.Group>
                                        {items.map((item) => {
                                            const isSelected = selectedValues.some(v => String(v.id) === String(item.id));

                                            return (
                                                <CommandPrimitive.Item
                                                    key={String(item.id)}
                                                    value={String(item.id)}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                    onSelect={() => onItemClick(item)}
                                                    className={cls(
                                                        "flex flex-row items-center gap-1.5",
                                                        isSelected ? "bg-surface-accent-200 dark:bg-surface-accent-950" : "",
                                                        "cursor-pointer",
                                                        "m-1",
                                                        "ring-offset-transparent",
                                                        "p-1 rounded-xs aria-selected:outline-hidden aria-selected:ring-2 aria-selected:ring-primary/75 aria-selected:ring-offset-2",
                                                        "aria-selected:bg-surface-accent-100 dark:aria-selected:bg-surface-accent-900",
                                                        "cursor-pointer rounded-xs aria-selected:bg-surface-accent-100 dark:aria-selected:bg-surface-accent-900"
                                                    )}
                                                >
                                                    {multiple && (
                                                        <InnerCheckBox checked={isSelected}/>
                                                    )}
                                                    <div className="flex-1 rounded">

                                                        {item.data ? (
                                                            <div className="flex flex-row items-center gap-2">
                                                                <EntityPreviewData
                                                                    size={"small"}
                                                                    entity={item.data}
                                                                    includeId={includeId}
                                                                    includeEntityLink={includeEntityLink}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <div
                                                                    className="text-sm font-medium text-text-primary dark:text-text-primary-dark">{item.label}</div>
                                                                {item.description && (
                                                                    <div
                                                                        className="text-xs text-text-secondary dark:text-text-secondary-dark">
                                                                        {item.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </CommandPrimitive.Item>
                                            );
                                        })}

                                        {/* Sentinel element for intersection observer - invisible trigger for infinite scroll */}
                                        {items.length > 0 && hasMore && (
                                            <div
                                                ref={sentinelCallbackRef}
                                                className="h-1 w-full"
                                                style={{ visibility: "hidden" }}
                                            />
                                        )}

                                        {/* Loading indicator when loading more items */}
                                        {isLoading && items.length > 0 && (
                                            <div className="flex items-center justify-center py-4">
                                                <CircularProgress size="smallest"/>
                                                <span
                                                    className="ml-2 text-xs text-text-secondary dark:text-text-secondary-dark">
                                                    Loading...
                                                </span>
                                            </div>
                                        )}
                                    </CommandPrimitive.Group>
                                </CommandPrimitive.List>
                            </CommandPrimitive>
                        </PopoverPrimitive.Content>
                    </PopoverPrimitive.Portal>
                </PopoverPrimitive.Root>
            </>
        );
    }
);

RelationSelector.displayName = "RelationSelector";

function InnerCheckBox({ checked }: { checked: boolean }) {
    return (
        <div className={cls(
            "p-2",
            "w-8 h-8",
            "inline-flex items-center justify-center text-sm font-medium focus:outline-hidden transition-colors ease-in-out duration-150",
        )}>
            <div
                className={cls(
                    "border-2 relative transition-colors ease-in-out duration-150",
                    "w-4 h-4 rounded-xs flex items-center justify-center",
                    (checked ? "bg-primary" : "bg-white dark:bg-surface-accent-900"),
                    (checked) ? "text-surface-accent-100 dark:text-surface-accent-900" : "",
                    (checked ? "border-transparent" : "border-surface-accent-800 dark:border-surface-accent-200")
                )}>
                {checked && <CheckIcon size={16} className={"absolute"}/>}
            </div>
        </div>
    );
}
