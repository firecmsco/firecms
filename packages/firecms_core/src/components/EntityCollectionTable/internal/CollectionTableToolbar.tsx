import React, { useEffect } from "react";

import {
    CircularProgress,
    cls,
    defaultBorderMixin,
    SearchBar
} from "@firecms/ui";
import { CollectionSize } from "@firecms/types";
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
}

export function CollectionTableToolbar({
    actions,
    actionsStart,
    loading,
    onTextSearch,
    onTextSearchClick,
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


    return (
        <div
            className={cls(defaultBorderMixin, "no-scrollbar min-h-[52px] overflow-x-auto px-2 md:px-4 bg-surface-50 dark:bg-surface-900 border-b flex flex-row justify-between items-center w-full")}>

            <div className="flex items-center gap-1 md:mr-4 mr-2">

                {viewModeToggle}

                {title && <div className={"hidden lg:block"}>
                    {title}
                </div>}

                {actionsStart}

            </div>

            <div className="flex items-center gap-1">

                {largeLayout && <div className="w-[22px] mr-4">
                    {loading &&
                        <CircularProgress size={"smallest"} />}
                </div>}

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
