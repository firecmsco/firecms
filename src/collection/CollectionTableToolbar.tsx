import { EntitySchema, FilterValues } from "../models";
import React from "react";
import FilterPopup from "./FilterPopup";
import Toolbar from "@material-ui/core/Toolbar";
import {
    Box,
    CircularProgress,
    createStyles,
    Hidden,
    makeStyles,
    Theme
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import SearchBar from "./SearchBar";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        toolbar: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(1),
            zIndex: 100,
            backgroundColor: "white",
            borderBottom: "1px solid rgba(224, 224, 224, 1)"
        }
    })
);


interface CollectionTableToolbarProps<S extends EntitySchema> {
    collectionPath: string;
    schema: S;
    filterValues?: FilterValues<S>;
    onTextSearch?: (searchString?: string) => void;
    filterableProperties?: (keyof S["properties"])[];
    actions?: React.ReactChild;

    loading: boolean;

    /**
     * Override the title in the toolbar
     */
    overrideTitle?: string,

    onFilterUpdate?(filterValues: FilterValues<S>): void;
}

export function CollectionTableToolbar<S extends EntitySchema>(props: CollectionTableToolbarProps<S>) {
    const classes = useStyles();

    const filterEnabled = props.onFilterUpdate && props.filterableProperties && props.filterableProperties.length > 0;
    const filterView = filterEnabled && props.onFilterUpdate && props.filterableProperties &&
        <FilterPopup schema={props.schema}
                     filterValues={props.filterValues}
                     onFilterUpdate={props.onFilterUpdate}
                     filterableProperties={props.filterableProperties}/>
    ;

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


                <Hidden xsDown>
                    <Box display={"flex"}
                         alignItems="center">
                        <Box mr={2}>
                            <Typography variant="h6">
                                {props.overrideTitle ? props.overrideTitle : `${props.schema.name} list`}
                            </Typography>
                            <Typography variant={"caption"}>
                                {props.collectionPath}
                            </Typography>
                        </Box>

                        {filterEnabled && filterView}

                    </Box>
                </Hidden>

                {filterEnabled && <Hidden smUp>
                    {filterView}
                </Hidden>}


                {props.onTextSearch &&
                <SearchBar
                    onTextSearch={props.onTextSearch}/>
                }

                <Box display={"flex"} alignItems={"center"}>
                    <Box width={20} marginRight={1}>
                        {props.loading && <CircularProgress size={16} thickness={8}/>}
                    </Box>
                    {props.actions}
                </Box>

            </Box>

        </Toolbar>
    );
}
