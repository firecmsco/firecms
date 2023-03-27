import React from "react";
import {
    Box,
    CircularProgress,
    Hidden,
    IconButton,
    Tooltip,
    useMediaQuery,
    useTheme
} from "@mui/material";

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
                sx={{ height: "fit-content" }}
                aria-label="filter clear"
                onClick={props.clearFilter}
                size="medium">
                <FilterListOffIcon/>
            </IconButton>
        </Tooltip>;

    const sizeSelect = (
        <FilledSelect
            variant={"standard"}
            value={props.size}
            sx={{
                width: 56,
                height: 40
            }}
            onChange={(evt: any) => props.onSizeChanged(evt.target.value)}
            renderValue={(value: any) => value.toUpperCase()}
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
        <Box
            sx={{
                minHeight: 56,
                overflowX: "auto",
                [theme.breakpoints.down("sm")]: {
                    px: theme.spacing(1)
                },
                px: theme.spacing(2),
                backgroundColor: theme.palette.background.default,
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%"
            }}
        >

            <Box display={"flex"}
                 alignItems="center"
                 sx={{
                     "& > *": {
                         [theme.breakpoints.down("md")]: {
                             marginRight: `${theme.spacing(1)} !important`
                         },
                         marginRight: `${theme.spacing(2)} !important`
                     }
                 }}>

                {props.title && <Hidden lgDown>
                    {props.title}
                </Hidden>}

                {sizeSelect}

                {props.actionsStart}

                {filterView}

            </Box>

            <Box sx={{
                display: "flex",
                alignItems: "center",
                "& > *": {
                    [theme.breakpoints.down("md")]: {
                        marginRight: `${theme.spacing(0.5)} !important`
                    },
                    marginRight: `${theme.spacing(1)} !important`
                }
            }}>

                {largeLayout && <Box width={22}>
                    {props.loading &&
                        <CircularProgress size={16} thickness={8}/>}
                </Box>}

                {props.onTextSearch &&
                    <SearchBar
                        key={"search-bar"}
                        onTextSearch={props.onTextSearch}
                        expandable={true}/>
                }

                {props.actions}

            </Box>

        </Box>
    );
}
