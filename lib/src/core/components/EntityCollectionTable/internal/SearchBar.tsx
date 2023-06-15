import React, { useCallback, useDeferredValue, useState } from "react";
import { Theme } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import { IconButton } from "@mui/material";
import clsx from "clsx";

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
        <div className={clsx("relative flex items-center w-full min-w-[200px] rounded sm:w-auto",
            "bg-opacity-70 hover:bg-opacity-90 bg-gray-100 dark:bg-gray-800 dark:bg-opacity-60 dark:hover:bg-opacity-90",
            {
                "h-14": large,
                "h-10": !large
            })}>
            <div
                className="p-0 px-4 h-full absolute pointer-events-none flex items-center justify-center">
                <SearchIcon htmlColor={"#888"}/>
            </div>
            <InputBase
                placeholder={placeholder}
                value={searchText}
                onChange={(event) => {
                    setSearchText(event.target.value);
                }}
                onFocus={() => setActive(true)}
                onBlur={() => setActive(false)}
                className={`w-full ${expandable ? "" : "min-h-full"} text-current`}
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
                        className={`mr-${large ? 2 : 1}`}
                        size={"small"}
                        onClick={clearText}>
                        <ClearIcon fontSize={"small"}/>
                    </IconButton>
                    : <div style={{ width: 26 }}/>
                }
            />
        </div>
    );
}
