import React, { useCallback, useDeferredValue, useState } from "react";
import { darken, Theme } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import { Box, IconButton } from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

interface SearchBarProps {
    onTextSearch: (searchString?: string) => void;
    placeholder?: string;
    expandable?: boolean;
    large?: boolean;
}

export function SearchBar({
                              onTextSearch,
                              placeholder = "Search",
                              expandable = false,
                              large = false
                          }: SearchBarProps) {

    const [searchText, setSearchText] = useState<string>("");
    const [active, setActive] = useState<boolean>(false);

    const deferredValues = useDeferredValue(searchText);

    /**
     * Debounce on Search text update
     */
    React.useEffect(() => {
        if (deferredValues) {
            onTextSearch(deferredValues);
        } else {
            onTextSearch(undefined);
        }
    }, [deferredValues]);

    const clearText = useCallback(() => {
        setSearchText("");
        onTextSearch(undefined);
    }, []);

    return (
        <Box sx={theme => ({
            position: "relative",
            display: "flex",
            alignItems: "center",
            height: large ? 56 : 40,
            width: expandable ? undefined : "100%",
            minWidth: "200px",
            borderRadius: `${theme.shape.borderRadius}px`,
            backgroundColor: theme.palette.mode === "light" ? darken(theme.palette.background.default, 0.05) : darken(theme.palette.background.default, 0.2),
            "&:hover": {
                backgroundColor: theme.palette.mode === "light" ? darken(theme.palette.background.default, 0.08) : darken(theme.palette.background.default, 0.3)
            },
            [theme.breakpoints.up("sm")]: {
                width: "auto"
            }
        })}>
            <Box sx={theme => ({
                padding: theme.spacing(0, 2),
                height: "100%",
                position: "absolute",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            })}>
                <SearchIcon htmlColor={"#888"}/>
            </Box>
            <InputBase
                placeholder={placeholder}
                value={searchText}
                onChange={(event) => {
                    setSearchText(event.target.value);
                }}
                onFocus={() => setActive(true)}
                onBlur={() => setActive(false)}
                sx={{
                    width: expandable ? undefined : "100%",
                    color: "inherit",
                    minHeight: "inherit"
                }}
                inputProps={{
                    sx: (theme: Theme) => ({
                        padding: theme.spacing(1, 1, 1, 0),
                        // vertical padding + font size from searchIcon
                        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                        transition: theme.transitions.create("width"),
                        width: "100%",
                        [theme.breakpoints.up("sm")]: {
                            width: expandable ? active ? "20ch" : "12ch" : "100%"
                        }
                    }),
                    "aria-label": placeholder
                }}
                endAdornment={searchText
                    ? <IconButton
                        sx={{ mr: large ? 2 : 1 }}
                        size={"small"}
                        onClick={clearText}>
                        <ClearIcon fontSize={"small"}/>
                    </IconButton>
                    : <div style={{ width: 26 }}/>
                }
            />
        </Box>
    );
}
