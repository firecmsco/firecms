import React, { useCallback, useDeferredValue, useState } from "react";

import { defaultBorderMixin, focusedMixin } from "../styles";
import { IconButton } from "./index";
import { ClearIcon, SearchIcon } from "../icons";
import { cn } from "./util/cn";

interface SearchBarProps {
    onTextSearch: (searchString?: string) => void;
    placeholder?: string;
    expandable?: boolean;
    large?: boolean;
    className?: string;
    autoFocus?: boolean;
}

export function SearchBar({
                              onTextSearch,
                              placeholder = "Search",
                              expandable = false,
                              large = false,
                              className,
                              autoFocus
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
        <div className={cn("relative",
            large ? "h-14" : "h-[42px]",
            "bg-gray-50 dark:bg-gray-800 transition duration-150 ease-in-out border",
            defaultBorderMixin,
            "rounded",)}>
            <div
                className="absolute p-0 px-4 h-full absolute pointer-events-none flex items-center justify-center top-0">
                <SearchIcon className={"text-gray-500"}/>
            </div>
            <input
                placeholder={placeholder}
                value={searchText}
                onChange={(event) => {
                    setSearchText(event.target.value);
                }}
                autoFocus={autoFocus}
                onFocus={() => setActive(true)}
                onBlur={() => setActive(false)}
                className={cn(
                    "relative flex items-center rounded transition-all bg-transparent outline-none appearance-none border-none",
                    "pl-12 h-full text-current ",
                    expandable ? (active ? "w-[220px]" : "w-[180px]") : "",
                    focusedMixin,
                    className
                )}
            />
            {searchText
                ? <IconButton
                    className={`${large ? "mr-2 top-1" : "mr-1 top-0"} absolute right-0 z-10`}
                    // size={"small"}
                    onClick={clearText}>
                    <ClearIcon size={"small"}/>
                </IconButton>
                : <div style={{ width: 26 }}/>
            }
        </div>
    );
}
