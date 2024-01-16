import React from "react";

import {
    Button,
    CircularProgress,
    cn,
    defaultBorderMixin,
    FilterListOffIcon,
    SearchBar,
    Select,
    SelectItem
} from "@firecms/ui";
import { CollectionSize } from "../../../types";
import { useLargeLayout } from "../../../hooks";

interface CollectionTableToolbarProps {
    size: CollectionSize;
    filterIsSet: boolean;
    loading: boolean;
    forceFilter: boolean;
    actionsStart?: React.ReactNode;
    actions?: React.ReactNode;
    title?: React.ReactNode,
    onTextSearchClick?: () => void;
    onTextSearch?: (searchString?: string) => void;
    onSizeChanged: (size: CollectionSize) => void;
    clearFilter?: () => void;
}

export function CollectionTableToolbar(props: CollectionTableToolbarProps) {

    const largeLayout = useLargeLayout();

    const clearFilterButton = !props.forceFilter && props.filterIsSet && props.clearFilter &&
        <Button
            variant={"outlined"}
            className="h-fit-content"
            aria-label="filter clear"
            onClick={props.clearFilter}
            size="small">
            <FilterListOffIcon/>
            Clear filter
        </Button>;

    const sizeSelect = (
        <Select
            value={props.size as string}
            className="w-16 h-10"
            size={"small"}
            onValueChange={(v) => props.onSizeChanged(v as CollectionSize)}
            renderValue={(v) => <div className={"font-medium"}>{v.toUpperCase()}</div>}
        >
            {["xs", "s", "m", "l", "xl"].map((size) => (
                <SelectItem key={size} value={size} className={"w-12 font-medium text-center"}>
                    {size.toUpperCase()}
                </SelectItem>
            ))}
        </Select>
    );

    return (
        <div
            className={cn(defaultBorderMixin, "no-scrollbar min-h-[56px] overflow-x-auto px-4 bg-gray-50 dark:bg-gray-900 border-b flex flex-row justify-between items-center w-full")}>

            <div className="flex items-center gap-2">

                {props.title && <div className={"hidden lg:block"}>
                    {props.title}
                </div>}

                {sizeSelect}

                {props.actionsStart}

                {clearFilterButton}

            </div>

            <div className="flex items-center gap-2">

                {largeLayout && <div className="w-[22px]">
                    {props.loading &&
                        <CircularProgress size={"small"}/>}
                </div>}

                {(props.onTextSearch || props.onTextSearchClick) &&
                    <SearchBar
                        key={"search-bar"}
                        disabled={Boolean(props.onTextSearchClick)}
                        onClick={props.onTextSearchClick}
                        onTextSearch={props.onTextSearchClick ? undefined : props.onTextSearch}
                        expandable={true}/>}

                {props.actions}

            </div>

        </div>
    );
}
