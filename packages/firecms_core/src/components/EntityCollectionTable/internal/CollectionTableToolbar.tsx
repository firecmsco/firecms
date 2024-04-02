import React, { useEffect } from "react";

import {
    Button,
    CircularProgress,
    cn,
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
    size: CollectionSize;
    loading: boolean;
    actionsStart?: React.ReactNode;
    actions?: React.ReactNode;
    title?: React.ReactNode,
    onTextSearchClick?: () => void;
    onTextSearch?: (searchString?: string) => void;
    onSizeChanged: (size: CollectionSize) => void;
    textSearchLoading?: boolean;
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
                                           title
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


    const sizeSelect = (
        <Tooltip title={"Table row size"} side={"right"} sideOffset={4}>
            <Select
                value={size as string}
                className="w-16 h-10"
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
    );

    return (
        <div
            className={cn(defaultBorderMixin, "no-scrollbar min-h-[56px] overflow-x-auto px-2 md:px-4 bg-gray-50 dark:bg-gray-900 border-b flex flex-row justify-between items-center w-full")}>

            <div className="flex items-center gap-2 md:mr-4 mr-2">

                {title && <div className={"hidden lg:block"}>
                    {title}
                </div>}

                {sizeSelect}

                {actionsStart}

            </div>

            <div className="flex items-center gap-2">

                {largeLayout && <div className="w-[22px]">
                    {loading &&
                        <CircularProgress size={"small"}/>}
                </div>}

                {(onTextSearch || onTextSearchClick) &&
                    <SearchBar
                        key={"search-bar"}
                        inputRef={searchInputRef}
                        loading={textSearchLoading}
                        disabled={Boolean(onTextSearchClick)}
                        onClick={onTextSearchClick}
                        onTextSearch={onTextSearchClick ? undefined : onTextSearch}
                        expandable={true}/>}

                {actions}

            </div>

        </div>
    );
}
