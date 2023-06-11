import React from "react";
import { CircularProgress, Hidden, IconButton, Tooltip, useMediaQuery, useTheme } from "@mui/material";

import { CollectionSize } from "../../../../types";
import { SearchBar } from "./SearchBar";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import { FilledMenuItem, FilledSelect } from "../../fields/FilledSelect";

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

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

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
        <FilledSelect
            value={props.size}
            className="w-14 h-10"
            onChange={(evt: any) => props.onSizeChanged(evt.target.value)}
            // renderValue={(value: any) => value.toUpperCase()}
        >
            {["xs", "s", "m", "l", "xl"].map((value) => (
                <FilledMenuItem
                    key={`size-select-${value}`} value={value}>
                    {value.toUpperCase()}
                </FilledMenuItem>
            ))}
        </FilledSelect>
    );

    return (
        <div
            className="min-h-[56px] overflow-x-auto sm:px-4 px-8 bg-default dark:bg-default-dark border-b border-divider dark:border-divider-dark flex flex-row justify-between items-center w-full"
        >

            <div className="flex items-center space-x-8 md:space-x-4">

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
