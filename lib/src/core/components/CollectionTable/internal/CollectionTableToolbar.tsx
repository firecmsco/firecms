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

import { CollectionSize } from "../../../../models";
import { SearchBar } from "./SearchBar";
import ClearIcon from "@mui/icons-material/Clear";
import {
    FilledMenuItem,
    FilledSelect
} from "../../../../form/components/FilledSelect";

interface CollectionTableToolbarProps {
    size: CollectionSize;
    filterIsSet: boolean;
    actions?: React.ReactNode;
    loading: boolean;
    title?: React.ReactNode,
    onTextSearch?: (searchString?: string) => void;
    onSizeChanged: (size: CollectionSize) => void;

    clearFilter(): void;
}

export function CollectionTableToolbar<M extends { [Key: string]: any }>(props: CollectionTableToolbarProps) {

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const filterView = props.filterIsSet &&
        <Box display={"flex"}
             alignItems="center">

            <Tooltip title="Clear filter">
                <IconButton
                    sx={{ height: "fit-content" }}
                    aria-label="filter clear"
                    onClick={props.clearFilter}
                    size="large">
                    <ClearIcon/>
                </IconButton>
            </Tooltip>

        </Box>;

    const sizeSelect = (
        <FilledSelect
            variant={"standard"}
            value={props.size}
            sx={{ width: 56 }}
            onChange={(evt: any) => {
                props.onSizeChanged(evt.target.value);
            }}
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
                [theme.breakpoints.down("xl")]: {
                    paddingLeft: theme.spacing(0.5),
                    paddingRight: theme.spacing(0.5)
                },
                paddingLeft: theme.spacing(1),
                paddingRight: theme.spacing(1),
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
                 alignItems="center">

                {props.title && <Hidden lgDown>
                    <Box mr={2}>
                        {props.title}
                    </Box>
                </Hidden>}

                {sizeSelect}

                {filterView}

            </Box>

            <Box sx={{
                display: "flex",
                alignItems: "center",
                "& > *": {
                    [theme.breakpoints.down("md")]: {
                        marginRight: theme.spacing(1)
                    },
                    marginRight: theme.spacing(2)
                }
            }}>

                {largeLayout && <Box width={22}>
                    {props.loading &&
                        <CircularProgress size={16} thickness={8}/>}
                </Box>}

                {props.onTextSearch &&
                    <SearchBar
                        key={"search-bar"}
                        onTextSearch={props.onTextSearch}/>
                }

                {props.actions}

            </Box>

        </Box>
    );
}
