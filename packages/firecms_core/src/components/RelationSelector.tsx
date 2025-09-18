import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
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
    SelectInputLabel,
    Separator,
    useInjectStyles
} from "@firecms/ui";

export interface RelationItem {
    id: string | number;
    label: string;
    description?: string;
    data?: any;
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
    size?: "smallest" | "small" | "medium" | "large";
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

    // Data fetching props
    onSearch?: (searchString: string) => Promise<RelationItem[]>;
    onLoadMore?: (lastItem: RelationItem) => Promise<RelationItem[]>;
    initialItems?: RelationItem[];
    pageSize?: number;
    renderItem?: (item: RelationItem) => React.ReactNode;
    renderSelectedItem?: (item: RelationItem) => React.ReactNode;
    renderSelectedItems?: (items: RelationItem[]) => React.ReactNode;
    searchPlaceholder?: string;
    noResultsText?: string;
    loadingText?: string;
}

export const RelationSelector = React.forwardRef<
    HTMLButtonElement,
    RelationSelectorProps
>(
    (
        {
            value,
            size = "large",
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
            onSearch,
            onLoadMore,
            initialItems = [],
            pageSize = 20,
            renderItem,
            renderSelectedItem,
            renderSelectedItems,
            searchPlaceholder = "Search relations...",
            noResultsText = "No relations found.",
            loadingText = "Loading...",
        },
        ref
    ) => {
        const [isPopoverOpen, setIsPopoverOpen] = useState(open ?? false);
        const [selectedValues, setSelectedValues] = useState<RelationItem[]>(() => {
            if (!value) return [];
            return Array.isArray(value) ? value : [value];
        });
        const [searchString, setSearchString] = useState<string>("");
        const [items, setItems] = useState<RelationItem[]>(initialItems);
        const [isLoading, setIsLoading] = useState(false);
        const [hasMore, setHasMore] = useState(true);
        const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

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

        // Handle search with debouncing
        useEffect(() => {
            if (!onSearch) return;

            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }

            const timeout = setTimeout(async () => {
                if (searchString.trim()) {
                    setIsLoading(true);
                    try {
                        const results = await onSearch(searchString.trim());
                        setItems(results);
                        setHasMore(results.length >= pageSize);
                    } catch (error) {
                        console.error("Error searching relations:", error);
                        setItems([]);
                    } finally {
                        setIsLoading(false);
                    }
                } else {
                    setItems(initialItems);
                    setHasMore(true);
                }
            }, 300);

            setSearchTimeout(timeout);

            return () => {
                if (timeout) clearTimeout(timeout);
            };
        }, [searchString, onSearch, initialItems, pageSize]);

        // Load initial items
        useEffect(() => {
            if (!searchString && initialItems.length === 0 && onSearch) {
                setIsLoading(true);
                onSearch("")
                    .then((results) => {
                        setItems(results);
                        setHasMore(results.length >= pageSize);
                    })
                    .catch((error) => {
                        console.error("Error loading initial relations:", error);
                        setItems([]);
                    })
                    .finally(() => setIsLoading(false));
            }
        }, [onSearch, initialItems.length, pageSize, searchString]);

        const handleLoadMore = useCallback(async () => {
            if (!onLoadMore || isLoading || !hasMore || items.length === 0) return;

            setIsLoading(true);
            try {
                const lastItem = items[items.length - 1];
                const moreItems = await onLoadMore(lastItem);
                setItems(prev => [...prev, ...moreItems]);
                setHasMore(moreItems.length >= pageSize);
            } catch (error) {
                console.error("Error loading more relations:", error);
            } finally {
                setIsLoading(false);
            }
        }, [onLoadMore, isLoading, hasMore, items, pageSize]);

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
                            disabled={disabled}
                            className={cls(
                                {
                                    "min-h-[28px]": size === "smallest",
                                    "min-h-[32px]": size === "small",
                                    "min-h-[42px]": size === "medium",
                                    "min-h-[64px]": size === "large",
                                },
                                {
                                    "py-1": size === "small" || size === "smallest",
                                    "py-2": size === "medium" || size === "large",
                                },
                                {
                                    "px-2": size === "small" || size === "smallest",
                                    "px-4": size === "medium" || size === "large",
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
                                        {renderSelectedItems && renderSelectedItems(selectedValues)}
                                        {!renderSelectedItems && selectedValues.map((item) => {
                                            if (!useChips || !multiple) {
                                                return renderSelectedItem ? renderSelectedItem(item) : item.label;
                                            }
                                            return (
                                                <Chip
                                                    size={"medium"}
                                                    key={String(item.id)}
                                                    className={cls("flex flex-row items-center p-1")}
                                                >
                                                    {renderSelectedItem ? renderSelectedItem(item) : item.label}
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
                                    <div className="flex items-center justify-between">
                                        {includeClear && (
                                            <CloseIcon
                                                className={"ml-4"}
                                                size={"small"}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleClear();
                                                }}
                                            />
                                        )}
                                        <div className={cls("px-2 h-full flex items-center")}>
                                            <KeyboardArrowDownIcon
                                                size={size === "large" ? "medium" : "small"}
                                                className={cls("transition", isPopoverOpen ? "rotate-180" : "")}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between w-full mx-auto">
                                    <span className="text-sm text-text-secondary dark:text-text-secondary-dark">
                                        {placeholder}
                                    </span>
                                    <div className={cls("px-2 h-full flex items-center")}>
                                        <KeyboardArrowDownIcon
                                            size={size === "large" ? "medium" : "small"}
                                            className={cls("transition", isPopoverOpen ? "rotate-180" : "")}
                                        />
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
                                <div className="relative flex-1">
                                    <SearchIcon
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary dark:text-text-secondary-dark"
                                        size="small"/>
                                    <CommandPrimitive.Input
                                        className={cls(focusedDisabled, "bg-transparent outline-hidden flex-1 h-full w-full pl-10 pr-4 py-3")}
                                        placeholder={searchPlaceholder}
                                        value={searchString}
                                        onValueChange={setSearchString}
                                    />
                                </div>
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
                            <CommandPrimitive.List>
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
                                                    "cursor-pointer p-2 rounded-xs aria-selected:bg-surface-accent-100 dark:aria-selected:bg-surface-accent-900"
                                                )}
                                            >
                                                {multiple && (
                                                    <InnerCheckBox checked={isSelected}/>
                                                )}
                                                <div className="flex-1">
                                                    {renderItem ? renderItem(item) : (
                                                        <div>
                                                            <div className="text-sm font-medium">{item.label}</div>
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

                                    {hasMore && onLoadMore && !isLoading && items.length > 0 && (
                                        <div className="p-2">
                                            <button
                                                onClick={handleLoadMore}
                                                className="w-full text-sm text-primary hover:text-primary-dark py-2 text-center"
                                            >
                                                Load more...
                                            </button>
                                        </div>
                                    )}

                                    {isLoading && items.length > 0 && (
                                        <div className="flex items-center justify-center py-2">
                                            <CircularProgress size="smallest"/>
                                        </div>
                                    )}
                                </CommandPrimitive.Group>
                            </CommandPrimitive.List>
                        </CommandPrimitive>
                    </PopoverPrimitive.Content>
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
