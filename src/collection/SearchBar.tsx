import React, { useEffect, useState } from "react";
import InputBase from "@material-ui/core/InputBase";
import {
    createStyles,
    fade,
    makeStyles,
    Theme
} from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";

import SearchIcon from "@material-ui/icons/Search";
import ClearIcon from "@material-ui/icons/Clear";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        search: {
            position: "relative",
            borderRadius: theme.shape.borderRadius,
            backgroundColor: fade(theme.palette.common.black, 0.05),
            "&:hover": {
                backgroundColor: fade(theme.palette.common.black, 0.10)
            },
            marginLeft: 0,
            [theme.breakpoints.up("sm")]: {
                marginLeft: theme.spacing(1),
                width: "auto"
            }
        },
        searchIcon: {
            padding: theme.spacing(0, 2),
            height: "100%",
            position: "absolute",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        },
        inputRoot: {
            color: "inherit",
            minHeight: "inherit"
        },
        inputInput: {
            padding: theme.spacing(1, 1, 1, 0),
            // vertical padding + font size from searchIcon
            paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
            transition: theme.transitions.create("width"),
            width: "100%",
            [theme.breakpoints.up("sm")]: {
                width: "12ch",
                "&:focus": {
                    width: "20ch"
                }
            }
        }
    })
);


interface SearchBarProps {
    onTextSearch: (searchString?: string) => void;
}

export default function SearchBar({ onTextSearch }: SearchBarProps) {

    const classes = useStyles();

    const [searchText, setSearchText] = useState<string>("");

    /**
     * Debounce on Search text update
     */
    useEffect(
        () => {
            const handler = setTimeout(() => {
                if (searchText) {
                    onTextSearch(searchText);
                } else {
                    onTextSearch(undefined);
                }
            }, 250);

            return () => {
                clearTimeout(handler);
            };
        },
        [searchText]
    );

    function clearText() {
        setSearchText("");
        onTextSearch(undefined);
    }

    return (
        <div className={classes.search}>
            <div className={classes.searchIcon}>
                <SearchIcon/>
            </div>
            <InputBase
                placeholder="Search"
                value={searchText}
                onChange={(event) => {
                    setSearchText(event.target.value);
                }}
                classes={{
                    root: classes.inputRoot,
                    input: classes.inputInput
                }}
                endAdornment={searchText ?
                    <IconButton
                        size={"small"}
                        onClick={clearText}>
                        <ClearIcon fontSize={"small"}/>
                    </IconButton> :
                    <div style={{ width: 26 }}/>
                }
                inputProps={{ "aria-label": "search" }}
            />
        </div>
    );
}
