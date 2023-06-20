import React, { useCallback, useDeferredValue, useState } from "react";
import clsx from "clsx";
import ClearIcon from "@mui/icons-material/Clear";

import SearchIcon from "@mui/icons-material/Search";
import { focusedMixin } from "../../../../styles";
import { IconButton } from "../../../../components";

interface SearchBarProps {
    onTextSearch: (searchString?: string) => void;
    placeholder?: string;
    expandable?: boolean;
    large?: boolean;
    className?: string;
}

export function SearchBar({
                              onTextSearch,
                              placeholder = "Search",
                              expandable = false,
                              large = false,
                              className
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
        <div className={clsx("relative", large ? "h-14" : "h-[42px]",
            "rounded bg-opacity-70 hover:bg-opacity-90 bg-gray-100 dark:bg-gray-800 dark:bg-opacity-60 dark:hover:bg-opacity-90",)}>
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
                    "relative flex items-center rounded transition-all bg-transparent outline-none appearance-none border-none",
                    "pl-12 h-full text-current ",
                    expandable ? (active ? "w-[220px]" : "w-[180px]") : "",
                    focusedMixin,
                    className
                )}
            />
            {searchText
                ? <IconButton
                    className={`mr-${large ? 2 : 1} absolute right-0 top-1`}
                    // size={"small"}
                    onClick={clearText}>
                    <ClearIcon fontSize={"small"}/>
                </IconButton>
                : <div style={{ width: 26 }}/>
            }
        </div>
    );
}
