import React, { useCallback, useDeferredValue, useState } from "react";
import clsx from "clsx";

import SearchIcon from "@mui/icons-material/Search";

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
        <div className={clsx("relative", large ? "h-14" : "h-[42px]")}>
            <div
                className="absolute p-0 px-4 h-full absolute pointer-events-none flex items-center justify-center top-0">
                <SearchIcon htmlColor={"#888"}/>
            </div>
            <input
                placeholder={placeholder}
                value={searchText}
                onChange={(event) => {
                    setSearchText(event.target.value);
                }}
                onFocus={() => setActive(true)}
                onBlur={() => setActive(false)}
                className={clsx(
                    "relative flex items-center w-full rounded sm:w-auto",
                    "bg-opacity-70 hover:bg-opacity-90 bg-gray-100 dark:bg-gray-800 dark:bg-opacity-60 dark:hover:bg-opacity-90",
                    "pl-12 h-full text-current ",
                    active ? "width-[200px]" : "width-[140px]",
                    "focus:outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-opacity-75",
                    // "bg-transparent outline-none appearance-none border-none",
                )}
                // inputProps={{
                //     sx: (theme: Theme) => ({
                //         padding: theme.spacing(1, 1, 1, 0),
                //         // vertical padding + font size from searchIcon
                //         paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                //         transition: theme.transitions.create("width"),
                //         width: "100%",
                //         [theme.breakpoints.up("sm")]: {
                //             width: expandable ? active ? "20ch" : "12ch" : "100%"
                //         }
                //     }),
                //     "aria-label": placeholder
                // }}
                // endAdornment={searchText
                //     ? <IconButton
                //         className={`mr-${large ? 2 : 1}`}
                //         size={"small"}
                //         onClick={clearText}>
                //         <ClearIcon fontSize={"small"}/>
                //     </IconButton>
                //     : <div style={{ width: 26 }}/>
                // }
            />
        </div>
    );
}
