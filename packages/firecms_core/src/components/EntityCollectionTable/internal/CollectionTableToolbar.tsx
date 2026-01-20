import React, { useEffect } from "react";

import {
    Button,
    CircularProgress,
    cls,
    defaultBorderMixin,
    FilterListOffIcon,
    SearchBar,
    Select,
    SelectItem,
    Tooltip
} from "@firecms/ui";
import { CollectionSize } from "../../../types";
import { useLargeLayout } from "../../../hooks";

interface CollectionTableToolbarProps {
    loading: boolean;
    actionsStart?: React.ReactNode;
    actions?: React.ReactNode;
    /**
     * View mode toggle button, positioned left of the search bar.
     */
    viewModeToggle?: React.ReactNode;
    title?: React.ReactNode,
    onTextSearchClick?: () => void;
    onTextSearch?: (searchString?: string) => void;
    textSearchLoading?: boolean;
    /**
     * Size of the table rows. If not provided, the size selector will not be shown.
     */
    size?: CollectionSize;
    /**
     * Callback when the table row size changes. Required if size is provided.
     */
    onSizeChanged?: (size: CollectionSize) => void;
}

export function CollectionTableToolbar({
    actions,
    actionsStart,
    loading,
    onSizeChanged,
    onTextSearch,
    onTextSearchClick,
    size,
    textSearchLoading,
    title,
    viewModeToggle
}: CollectionTableToolbarProps) {

    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const largeLayout = useLargeLayout();

    const searchLoading = React.useRef<boolean>(false);

    useEffect(() => {
        if (searchInputRef.current && searchLoading.current && !textSearchLoading) {
            searchInputRef.current.focus();
        }
        searchLoading.current = textSearchLoading ?? false;
    }, [textSearchLoading]);


    const sizeSelect = size && onSizeChanged ? (
        <Tooltip title={"Table row size"} side={"right"} sideOffset={4}>
            <Select
                value={size as string}
                className="w-16 ml-2"
                size={"small"}
                onValueChange={(v) => onSizeChanged(v as CollectionSize)}
                renderValue={(v) => <div className={"font-medium"}>{v.toUpperCase()}</div>}
            >
                {["xs", "s", "m", "l", "xl"].map((size) => (
                    <SelectItem key={size} value={size} className={"w-12 font-medium text-center"}>
                        {size.toUpperCase()}
                    </SelectItem>
                ))}
            </Select>
        </Tooltip>
    ) : null;

    return (
        <div
            className={cls(defaultBorderMixin, "no-scrollbar min-h-[52px] overflow-x-auto px-2 md:px-4 bg-surface-50 dark:bg-surface-900 border-b flex flex-row justify-between items-center w-full")}>

            <div className="flex items-center gap-1 md:mr-4 mr-2">

                {title && <div className={"hidden lg:block"}>
                    {title}
                </div>}

                {sizeSelect}

                {actionsStart}

            </div>

            <div className="flex items-center gap-1">

                {largeLayout && <div className="w-[22px] mr-4">
                    {loading &&
                        <CircularProgress size={"smallest"} />}
                </div>}

                {viewModeToggle}

                {(onTextSearch || onTextSearchClick) &&
                    <SearchBar
                        key={"search-bar"}
                        size={"small"}
                        inputRef={searchInputRef}
                        loading={textSearchLoading}
                        disabled={Boolean(onTextSearchClick)}
                        onClick={onTextSearchClick}
                        onTextSearch={onTextSearchClick ? undefined : onTextSearch}
                        expandable={true} />}

                {actions}

            </div>

        </div>
    );
}
