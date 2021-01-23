import { CollectionSize, EntitySchema, FilterValues } from "../models";
import React from "react";
import FilterPopup from "./FilterPopup";
import {
    Box,
    CircularProgress,
    createStyles,
    Hidden,
    InputBase,
    makeStyles,
    MenuItem,
    Select,
    Theme,
    Toolbar
} from "@material-ui/core";
import SearchBar from "./SearchBar";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        toolbar: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(1),
            zIndex: 100,
            backgroundColor: "white",
            borderBottom: "1px solid rgba(224, 224, 224, 1)"
        },
        actions: {
            display: "flex",
            alignItems: "center",
            "& > *": {
                marginRight: theme.spacing(1)
            }
        }
    })
);

const useSizeSelectStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            "label + &": {
                marginTop: theme.spacing(3)
            }
        },
        input: {
            borderRadius: 4,
            position: "relative",
            backgroundColor: "#e3e3e3",
            fontSize: 14,
            fontWeight: 500,
            padding: "10px 26px 10px 12px",
            transition: theme.transitions.create(["border-color", "box-shadow"]),
            "&:focus": {
                borderRadius: 4
            }
        },
        item: {
            backgroundColor: "#f5f5f5",
            fontSize: 14,
            fontWeight: 500,
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
            "&:hover": {
                backgroundColor: "#eeeeee"
            },
            "&:focus": {
                backgroundColor: "#e3e3e3",
                "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
                    color: theme.palette.common.white
                }
            }
        }
    })
);

interface CollectionTableToolbarProps<S extends EntitySchema> {
    collectionPath: string;
    schema: S;
    size: CollectionSize;
    onSizeChanged: (size: CollectionSize) => void;
    filterValues?: FilterValues<S>;
    onTextSearch?: (searchString?: string) => void;
    filterableProperties?: (keyof S["properties"])[];
    actions?: React.ReactNode;
    extraActions?: React.ReactNode;
    loading: boolean;
    title?: React.ReactNode,

    onFilterUpdate?(filterValues: FilterValues<S>): void;
}

export function CollectionTableToolbar<S extends EntitySchema>(props: CollectionTableToolbarProps<S>) {
    const classes = useStyles();
    const sizeClasses = useSizeSelectStyles();

    const filterEnabled = props.onFilterUpdate && props.filterableProperties && props.filterableProperties.length > 0;
    const filterView = filterEnabled && props.onFilterUpdate && props.filterableProperties &&
        <FilterPopup schema={props.schema}
                     filterValues={props.filterValues}
                     onFilterUpdate={props.onFilterUpdate}
                     filterableProperties={props.filterableProperties}/>;

    const sizeSelect = (
        <Select
            value={props.size}
            style={{ width: 56 }}
            onChange={(evt: any) => {
                props.onSizeChanged(evt.target.value);
            }}
            MenuProps={{
                MenuListProps: {
                    disablePadding: true,
                    style: {
                        borderRadius: 4
                    }
                },
                elevation: 1,
                anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left"
                },
                getContentAnchorEl: null
            }}
            input={<InputBase classes={{
                root: sizeClasses.root,
                input: sizeClasses.input
            }}/>}
            renderValue={(value: any) => value.toUpperCase()}
        >
            {["xs", "s", "m", "l", "xl"].map((value) => (
                <MenuItem
                    classes={{
                        root: sizeClasses.item
                    }}
                    key={`size-select-${value}`} value={value}>
                    {value.toUpperCase()}
                </MenuItem>
            ))}
        </Select>
    );

    return (
        <Toolbar
            className={classes.toolbar}
        >
            <Box
                display={"flex"}
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                width={"100%"}
            >

                <Box display={"flex"}
                     alignItems="center">

                    {props.title && <Hidden xsDown>
                        <Box mr={2}>
                            {props.title}
                        </Box>
                    </Hidden>}

                    {props.onSizeChanged && sizeSelect}

                    {filterEnabled && filterView}

                </Box>


                {props.onTextSearch &&
                <SearchBar
                    onTextSearch={props.onTextSearch}/>
                }

                <div className={classes.actions}>

                    <Box width={20}>
                        {props.loading &&
                        <CircularProgress size={16} thickness={8}/>}
                    </Box>

                    {props.extraActions}

                    {props.actions}

                </div>

            </Box>

        </Toolbar>
    );
}
