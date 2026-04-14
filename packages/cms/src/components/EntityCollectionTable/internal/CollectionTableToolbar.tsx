import React from "react";

import {
    CircularProgress,
    cls,
    defaultBorderMixin,
    SearchBar
} from "@rebasepro/ui";
import { useLargeLayout, useTranslation } from "@rebasepro/core";

interface CollectionTableToolbarProps {
    loading: boolean;
    actionsStart?: React.ReactNode;
    actions?: React.ReactNode;
    /**
     * View mode toggle button, positioned left of the search bar.
     */
    viewModeToggle?: React.ReactNode;
    title?: React.ReactNode,
    onTextSearch?: (searchString?: string) => void;
}

export function CollectionTableToolbar({
    actions,
    actionsStart,
    loading,
    onTextSearch,
    title,
    viewModeToggle
}: CollectionTableToolbarProps) {

    const largeLayout = useLargeLayout();
    const { t } = useTranslation();

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

                {onTextSearch &&
                    <SearchBar
                        key={"search-bar"}
                        size={"small"}
                        placeholder={t("search")}
                        onTextSearch={onTextSearch}
                        expandable={true} />}

                {actions}

            </div>

        </div>
    );
}
