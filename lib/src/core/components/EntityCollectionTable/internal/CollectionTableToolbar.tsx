import React from "react";
import clsx from "clsx";
import { CircularProgress, Hidden } from "@mui/material";

import { CollectionSize } from "../../../../types";
import { SearchBar } from "./SearchBar";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import { IconButton, Select } from "../../../../components";
import { useLargeLayout } from "../../../../hooks/useLargeLayout";
import { defaultBorderMixin } from "../../../../styles";
import { Tooltip } from "../../../../components/Tooltip";

interface CollectionTableToolbarProps {
    size: CollectionSize;
    filterIsSet: boolean;
    loading: boolean;
    forceFilter: boolean;
    actionsStart?: React.ReactNode;
    actions?: React.ReactNode;
    title?: React.ReactNode,
    onTextSearch?: (searchString?: string) => void;
    onSizeChanged: (size: CollectionSize) => void;
    clearFilter: () => void;
}

export function CollectionTableToolbar<M extends Record<string, any>>(props: CollectionTableToolbarProps) {

    const largeLayout = useLargeLayout();

    const filterView = !props.forceFilter && props.filterIsSet &&
        <Tooltip title="Clear filter">
            <IconButton
                className="h-fit-content"
                aria-label="filter clear"
                onClick={props.clearFilter}
                size="medium">
                <FilterListOffIcon/>
            </IconButton>
        </Tooltip>;

    const sizeSelect = (
        <Select
            value={props.size as string}
            className="w-16 h-10"
            size={"small"}
            onValueChange={(v) => props.onSizeChanged(v as CollectionSize)}
            options={["xs", "s", "m", "l", "xl"]}
            renderOption={(v) => v.toUpperCase()}
        />
    );

    return (
        <div
            className={clsx(defaultBorderMixin, "min-h-[56px] overflow-x-auto sm:px-4 px-8 bg-gray-50 dark:bg-gray-900 border-b flex flex-row justify-between items-center w-full")}
        >

            <div className="flex items-center space-x-8 md:space-x-4 ">

                {props.title && <Hidden lgDown>
                    {props.title}
                </Hidden>}

                {sizeSelect}

                {props.actionsStart}

                {filterView}

            </div>

            <div className="flex items-center space-x-4 md:space-x-2">

                {largeLayout && <div className="w-[22px]">
                    {props.loading &&
                        <CircularProgress size={16} thickness={8}/>}
                </div>}

                {props.onTextSearch &&
                    <SearchBar
                        key={"search-bar"}
                        onTextSearch={props.onTextSearch}
                        expandable={true}/>
                }

                {props.actions}

            </div>

        </div>
    );
}
