import React, { useEffect, useState } from "react";
import InputBase from "@mui/material/InputBase";
import { alpha, darken, Theme } from "@mui/material/styles";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { FormControl, IconButton } from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import clsx from "clsx";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        search: {
            position: "relative",
            display: "flex",
            alignItems: "center",
            height: 40,
            borderRadius: theme.shape.borderRadius,
            backgroundColor: theme.palette.mode === "light" ? alpha(theme.palette.common.black, 0.05) : darken(theme.palette.background.default, .2),
            "&:hover": {
                backgroundColor: theme.palette.mode === "light" ? alpha(theme.palette.common.black, 0.10) : darken(theme.palette.background.default, .3)
            },
            marginLeft: theme.spacing(1),
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
            paddingLeft: `calc(1em + ${theme.spacing(4)})`,
            transition: theme.transitions.create("width"),
            width: "100%",
            [theme.breakpoints.up("sm")]: {
                width: "12ch"
            }
        },
        inputActive: {
            [theme.breakpoints.up("sm")]: {
                width: "20ch"
            }
        }
    })
);


interface SearchBarProps {
    onTextSearch: (searchString?: string) => void;
}

export function SearchBar({ onTextSearch }: SearchBarProps) {

    const classes = useStyles();

    const [searchText, setSearchText] = useState<string>("");
    const [active, setActive] = useState<boolean>(false);

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
        <FormControl>
            <div className={classes.search}>
                <div className={classes.searchIcon}>
                    <SearchIcon htmlColor={"#666"}/>
                </div>
                <InputBase
                    placeholder="Search"
                    value={searchText}
                    onChange={(event) => {
                        setSearchText(event.target.value);
                    }}
                    onFocus={() => setActive(true)}
                    onBlur={() => setActive(false)}
                    classes={{
                        root: classes.inputRoot,
                        input: clsx(classes.inputInput, {
                            [classes.inputActive]: active
                        })
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
        </FormControl>
    );
}
