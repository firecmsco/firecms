import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { Entity, EntityRelation, FilterValues, Relation } from "@firecms/types";
import { EntityPreviewData } from "./EntityPreview";
import { useDataSource, useRelationSelector } from "../hooks";

export interface RelationItem {
    id: string | number;
    label: string;
    description?: string;
    data?: Entity;
    relation: EntityRelation;
}

export interface RelationSelectorProps {
    className?: string;
    open?: boolean;
    name?: string;
    id?: string;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onOpenChange?: (_open: boolean) => void;
    value?: EntityRelation | EntityRelation[] | null;
    /** Callback returning selected EntityRelation(s) */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onValueChange?: (_updatedValue: EntityRelation | EntityRelation[] | undefined) => void;
    placeholder?: React.ReactNode;
    size?: "small" | "medium";
    useChips?: boolean;
    disabled?: boolean;
    error?: boolean; // kept for backwards compatibility (could be used for styling later)
    position?: "item-aligned" | "popper"; // legacy prop
    endAdornment?: React.ReactNode;
    multiple?: boolean; // overrides relation.cardinality === "many"
    inputRef?: React.RefObject<HTMLButtonElement>;
    padding?: boolean; // legacy prop
    invisible?: boolean;

    relation: Relation;
    forceFilter?: FilterValues<string>;
    pageSize?: number;
    emptyPlaceholder?: string;
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
            size = "medium",
            onValueChange,
            invisible,
            disabled,
            placeholder,
            useChips = true,
            className,
            open,
            onOpenChange,
            multiple: multipleProp,
            relation,
            forceFilter,
            pageSize,
            emptyPlaceholder,
            searchPlaceholder = "Search...",
            noResultsText = "No relations found.",
            loadingText = "Loading..."
        },
        ref
    ) => {
        const collection = relation.target();
        const dataSource = useDataSource(collection);
        const multiple = multipleProp !== undefined ? multipleProp : relation.cardinality === "many";

        const [isPopoverOpen, setIsPopoverOpen] = useState(open ?? false);
        const [selectedItems, setSelectedItems] = useState<RelationItem[]>([]);
        const [searchString, setSearchString] = useState<string>("");

        const {
            items: availableItems,
            isLoading,
            hasMore,
            search,
            loadMore,
            entityToRelationItem
        } = useRelationSelector({
            path: collection.slug,
            collection,
            forceFilter,
            pageSize
        });

        const scrollContainerRef = useRef<HTMLDivElement>(null);
        const sentinelRef = useRef<HTMLDivElement>(null);
        const observerRef = useRef<IntersectionObserver | null>(null);

        const handlePopoverOpenChange = (nextOpen: boolean) => {
            setIsPopoverOpen(nextOpen);
            onOpenChange?.(nextOpen);
        };

        useEffect(() => {
            setIsPopoverOpen(open ?? false);
        }, [open]);

        const computeSelectedItems = useCallback(async (val?: EntityRelation | EntityRelation[] | null) => {
            if (!val) return [] as RelationItem[];
            const relationsArray = Array.isArray(val) ? val : [val];
            const promises = relationsArray.map(async (rel) => {
                try {
                    const entity = await dataSource.fetchEntity({
                        path: rel.path,
                        entityId: rel.id,
                        collection
                    });
                    if (entity) return entityToRelationItem(entity, rel);
                } catch (e) {
                    console.warn("RelationSelector: could not fetch entity for relation", rel, e);
                }
                return {
                    id: rel.id,
                    label: String(rel.id),
                    relation: rel
                } as RelationItem;
            });
            return Promise.all(promises);
        }, [dataSource, collection, entityToRelationItem]);

        useEffect(() => {
            let active = true;
            computeSelectedItems(value || undefined).then(resolved => {
                if (active) setSelectedItems(resolved);
            });
            return () => { active = false; };
        }, [value, computeSelectedItems]);

        const sentinelCallbackRef = useCallback((node: HTMLDivElement | null) => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
            if (sentinelRef.current !== node) {
                (sentinelRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }
            if (!node || !hasMore || isLoading || !loadMore) return;
            const observer = new IntersectionObserver(
                (entries) => {
                    const entry = entries[0];
                    if (entry.isIntersecting && hasMore && !isLoading) loadMore();
                },
                {
                    root: scrollContainerRef.current,
                    rootMargin: "20px",
                    threshold: 0
                }
            );
            observer.observe(node);
            observerRef.current = observer;
        }, [hasMore, isLoading, loadMore]);

        useEffect(() => () => { if (observerRef.current) observerRef.current.disconnect(); }, []);

        const handleSearchChange = useCallback((newSearchString: string) => {
            setSearchString(newSearchString);
            search(newSearchString);
        }, [search]);

        const emitValueChange = useCallback((selected: RelationItem[]) => {
            if (multiple) onValueChange?.(selected.length ? selected.map(i => i.relation) : undefined);
            else onValueChange?.(selected[0]?.relation);
        }, [onValueChange, multiple]);

        const onItemClick = useCallback((item: RelationItem) => {
            let newSelected: RelationItem[];
            if (multiple) {
                const isSelected = selectedItems.some(v => String(v.id) === String(item.id));
                newSelected = isSelected
                    ? selectedItems.filter(v => String(v.id) !== String(item.id))
                    : [...selectedItems, item];
            } else {
                newSelected = [item];
                handlePopoverOpenChange(false);
            }
            setSelectedItems(newSelected);
            emitValueChange(newSelected);
        }, [multiple, selectedItems, emitValueChange]);

        const handleClear = useCallback(() => {
            setSelectedItems([]);
            onValueChange?.(undefined);
        }, [onValueChange]);

        const handleRemoveItem = useCallback((itemToRemove: RelationItem) => {
            const newSelected = selectedItems.filter(v => String(v.id) !== String(itemToRemove.id));
            setSelectedItems(newSelected);
            emitValueChange(newSelected);
        }, [selectedItems, emitValueChange]);

        const handleTogglePopover = () => handlePopoverOpenChange(!isPopoverOpen);

        useInjectStyles("RelationSelector", `
            [cmdk-group] { max-height: 45vh; overflow-y: auto; }
        `);

        const resolvedPlaceholder = placeholder || emptyPlaceholder || (multiple ? "Select multiple..." : "Select...");

        return (
            <>
                <PopoverPrimitive.Root
                    open={isPopoverOpen}
                    onOpenChange={handlePopoverOpenChange}
                    modal={false}
                >
                    <PopoverPrimitive.Trigger asChild>
                        <button
                            ref={ref}
                            onClick={handleTogglePopover}
                            disabled={disabled}
                            className={cls(
                                "w-full select-none rounded-md text-sm relative flex items-center",
                                size === "small" ? "min-h-[32px] py-1 px-2" : "min-h-[42px] py-2 px-4",
                                invisible ? fieldBackgroundInvisibleMixin : fieldBackgroundMixin,
                                disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
                                className
                            )}
                        >
                            {selectedItems.length > 0 ? (
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex flex-wrap items-center gap-1.5 text-start flex-1 min-w-0 mr-2">
                                        {selectedItems.map((item) => {
                                            if (!useChips || !multiple) {
                                                return (
                                                    <div key={String(item.id)} className="flex flex-row items-center gap-1 truncate">
                                                        {item.data ? (
                                                            <EntityPreviewData size={"medium"} entity={item.data} includeEntityLink={false} includeId={false} />
                                                        ) : (
                                                            <span className="text-sm truncate">{item.label}</span>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return (
                                                <Chip
                                                    size={"medium"}
                                                    key={String(item.id)}
                                                    className={cls("flex flex-row items-center gap-1 truncate")}
                                                >
                                                    {item.data ? (
                                                        <EntityPreviewData size={"smallest"} entity={item.data} includeEntityLink={false} includeId={false} />
                                                    ) : (
                                                        <span className="text-sm truncate">{item.label}</span>
                                                    )}
                                                    <CloseIcon
                                                        size={"smallest"}
                                                        onClick={(event) => { event.stopPropagation(); handleRemoveItem(item); }}
                                                    />
                                                </Chip>
                                            );
                                        })}
                                    </div>
                                    <div className="flex-shrink-0">
                                        <KeyboardArrowDownIcon
                                            size={size === "medium" ? "medium" : "small"}
                                            className={cls("transition", isPopoverOpen ? "rotate-180" : "")}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between w-full mx-auto">
                                    <span className="text-sm text-text-secondary dark:text-text-secondary-dark">
                                        {resolvedPlaceholder}
                                    </span>
                                    <div className="px-2 h-full flex items-center">
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
                            onEscapeKeyDown={() => handlePopoverOpenChange(false)}
                            style={{
                                zIndex: 9999,
                                width: "var(--radix-popover-trigger-width)"
                            }}
                        >
                            <CommandPrimitive shouldFilter={false}>
                                <div className="flex flex-row items-center">
                                    <div className="relative flex-1">
                                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary dark:text-text-secondary-dark" size="small" />
                                        <CommandPrimitive.Input
                                            className={cls(
                                                focusedDisabled,
                                                "bg-transparent outline-hidden flex-1 h-full w-full pl-10 pr-4 py-3 text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark"
                                            )}
                                            placeholder={searchPlaceholder}
                                            value={searchString}
                                            onValueChange={handleSearchChange}
                                        />
                                    </div>
                                    {isLoading && (
                                        <div className="flex items-center justify-center px-3">
                                            <CircularProgress size="smallest" />
                                        </div>
                                    )}
                                    {selectedItems.length > 0 && (
                                        <div
                                            onClick={handleClear}
                                            className="text-sm justify-center cursor-pointer py-3 px-4 text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark"
                                        >
                                            Clear
                                        </div>
                                    )}
                                </div>
                                <Separator orientation="horizontal" className="my-0" />
                                <CommandPrimitive.List
                                    ref={scrollContainerRef}
                                    style={{
                                        maxHeight: "45vh",
                                        overflowY: "auto"
                                    }}
                                >
                                    {isLoading && availableItems.length === 0 && (
                                        <div className="flex items-center justify-center py-6">
                                            <CircularProgress size="small" />
                                            <span className="ml-2 text-sm text-text-secondary dark:text-text-secondary-dark">{loadingText}</span>
                                        </div>
                                    )}
                                    {!isLoading && availableItems.length === 0 && (
                                        <CommandPrimitive.Empty className="px-4 py-6 text-center text-text-secondary dark:text-text-secondary-dark">
                                            {noResultsText}
                                        </CommandPrimitive.Empty>
                                    )}
                                    <CommandPrimitive.Group>
                                        {availableItems.map((item) => {
                                            const isSelected = selectedItems.some(v => String(v.id) === String(item.id));
                                            return (
                                                <CommandPrimitive.Item
                                                    key={String(item.id)}
                                                    value={String(item.id)}
                                                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                    onSelect={() => onItemClick(item)}
                                                    className={cls(
                                                        "flex flex-row items-center gap-1.5 m-1 p-1 rounded-xs cursor-pointer ring-offset-transparent",
                                                        isSelected && "bg-surface-accent-200 dark:bg-surface-accent-950",
                                                        "aria-selected:outline-hidden aria-selected:ring-2 aria-selected:ring-primary/75 aria-selected:ring-offset-2 aria-selected:bg-surface-accent-100 dark:aria-selected:bg-surface-accent-900"
                                                    )}
                                                >
                                                    {multiple && (<InnerCheckBox checked={isSelected} />)}
                                                    {item.data ? (
                                                        <div className="flex flex-row items-center gap-2 min-w-0 w-full">
                                                            <EntityPreviewData
                                                                size={multiple ? "smallest" : "medium"}
                                                                entity={item.data}
                                                                includeId={false}
                                                                includeEntityLink={true}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className="text-sm font-medium text-text-primary dark:text-text-primary-dark">{item.label}</div>
                                                            {item.description && (
                                                                <div className="text-xs text-text-secondary dark:text-text-secondary-dark">{item.description}</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </CommandPrimitive.Item>
                                            );
                                        })}
                                        {availableItems.length > 0 && hasMore && (
                                            <div ref={sentinelCallbackRef} className="h-1 w-full" style={{ visibility: "hidden" }} />
                                        )}
                                        {isLoading && availableItems.length > 0 && (
                                            <div className="flex items-center justify-center py-4">
                                                <CircularProgress size="smallest" />
                                                <span className="ml-2 text-xs text-text-secondary dark:text-text-secondary-dark">Loading...</span>
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
            "p-2 w-8 h-8 inline-flex items-center justify-center text-sm font-medium focus:outline-hidden transition-colors ease-in-out duration-150"
        )}>
            <div
                className={cls(
                    "border-2 relative transition-colors ease-in-out duration-150 w-4 h-4 rounded-xs flex items-center justify-center",
                    checked ? "bg-primary text-surface-accent-100 dark:text-surface-accent-900 border-transparent" : "bg-white dark:bg-surface-accent-900 border-surface-accent-800 dark:border-surface-accent-200"
                )}
            >
                {checked && <CheckIcon size={16} className="absolute" />}
            </div>
        </div>
    );
}
