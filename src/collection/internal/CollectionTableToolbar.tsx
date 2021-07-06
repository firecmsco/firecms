import React from "react";
import {
    Box,
    CircularProgress,
    createStyles,
    fade,
    Hidden,
    IconButton,
    InputBase,
    makeStyles,
    MenuItem,
    Select,
    Theme,
    Tooltip,
    useMediaQuery,
    useTheme
} from "@material-ui/core";

import { CollectionSize, EntitySchema, FilterValues } from "../../models";
import SearchBar from "./SearchBar";
import ClearIcon from "@material-ui/icons/Clear";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        toolbar: {
            minHeight: 56,
            [theme.breakpoints.down("md")]: {
                paddingLeft: theme.spacing(.5),
                paddingRight: theme.spacing(.5)
            },
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1),
            zIndex: 100,
            backgroundColor: theme.palette.background.paper,
            borderBottom: "1px solid rgba(224, 224, 224, 1)",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%"
        },
        actions: {
            display: "flex",
            alignItems: "center",
            "& > *": {
                [theme.breakpoints.down("md")]: {
                    marginRight: theme.spacing(.5)
                },
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
            backgroundColor: fade(theme.palette.common.black, 0.05),
            fontSize: 14,
            fontWeight: theme.typography.fontWeightMedium,
            padding: "10px 26px 10px 12px",
            transition: theme.transitions.create(["border-color", "box-shadow"]),
            "&:focus": {
                borderRadius: 4
            }
        },
        item: {
            backgroundColor: "#f5f5f5",
            fontSize: 14,
            fontWeight: theme.typography.fontWeightMedium,
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

interface CollectionTableToolbarProps<S extends EntitySchema<Key>, Key extends string> {
    schema: S;
    size: CollectionSize;
    filterIsSet: boolean;
    actions?: React.ReactNode;
    loading: boolean;
    title?: React.ReactNode,
    onTextSearch?: (searchString?: string) => void;
    onSizeChanged: (size: CollectionSize) => void;
    clearFilter(): void;
}

export default function CollectionTableToolbar<S extends EntitySchema<Key>, Key extends string>(props: CollectionTableToolbarProps<S, Key>) {
    const classes = useStyles();
    const sizeClasses = useSizeSelectStyles();

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const filterView = props.filterIsSet &&
        <Box display={"flex"}
             alignItems="center">

            <Tooltip title="Clear filter">
                <IconButton
                    style={{ height: "fit-content" }}
                    aria-label="filter clear"
                    onClick={props.clearFilter}>
                    <ClearIcon/>
                </IconButton>
            </Tooltip>

        </Box>;

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
        <div
            className={classes.toolbar}
        >

            <Box display={"flex"}
                 alignItems="center">

                {props.title && <Hidden smDown>
                    <Box mr={2}>
                        {props.title}
                    </Box>
                </Hidden>}

                {sizeSelect}

                {filterView}

            </Box>


            {props.onTextSearch &&
            <SearchBar
                key={"search-bar"}
                onTextSearch={props.onTextSearch}/>
            }

            <div className={classes.actions}>

                {largeLayout && <Box width={22}>
                    {props.loading &&
                    <CircularProgress size={16} thickness={8}/>}
                </Box>}

                {props.actions}

            </div>

        </div>
    );
}
