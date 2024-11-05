"use client";
import React, { useCallback, useState } from "react";

import { defaultBorderMixin } from "../styles";
import { CircularProgress, IconButton } from "./index";
import { ClearIcon, SearchIcon } from "../icons";
import { cls } from "../util";
import { useDebounceValue } from "../hooks";

interface SearchBarProps {
    onClick?: () => void;
    onTextSearch?: (searchString?: string) => void;
    placeholder?: string;
    expandable?: boolean;
    large?: boolean;
    innerClassName?: string;
    className?: string;
    autoFocus?: boolean;
    disabled?: boolean;
    loading?: boolean;
    inputRef?: React.Ref<HTMLInputElement>;
}

export function SearchBar({
                              onClick,
                              onTextSearch,
                              placeholder = "Search",
                              expandable = false,
                              large = false,
                              innerClassName,
                              className,
                              autoFocus,
                              disabled,
                              loading,
                              inputRef
                          }: SearchBarProps) {

    const [searchText, setSearchText] = useState<string>("");
    const [active, setActive] = useState<boolean>(false);

    const deferredValues = useDebounceValue(searchText, 200);

    /**
     * Debounce on Search text update
     */
    React.useEffect(() => {
        if (!onTextSearch) return;
        if (deferredValues) {
            onTextSearch(deferredValues);
        } else {
            onTextSearch(undefined);
        }
    }, [deferredValues]);

    const clearText = useCallback(() => {
        if (!onTextSearch) return;
        setSearchText("");
        onTextSearch(undefined);
    }, [onTextSearch]);

    return (
        <div
            onClick={onClick}
            className={cls("relative",
                large ? "h-14" : "h-[42px]",
                "bg-surface-accent-50 dark:bg-surface-800 border",
                defaultBorderMixin,
                "rounded-lg",
                className)}>
            <div
                className="absolute p-0 px-4 h-full pointer-events-none flex items-center justify-center top-0">
                {loading ? <CircularProgress size={"small"}/> : <SearchIcon className={"text-text-disabled dark:text-text-disabled-dark"}/>}
            </div>
            <input
                value={searchText ?? ""}
                ref={inputRef}
                onClick={onClick}
                placeholder={placeholder}
                readOnly={!onTextSearch}
                onChange={onTextSearch
                    ? (event) => {
                        setSearchText(event.target.value);
                    }
                    : undefined}
                autoFocus={autoFocus}
                onFocus={() => setActive(true)}
                onBlur={() => setActive(false)}
                className={cls(
                    (disabled || loading) && "pointer-events-none",
                    "placeholder-text-disabled dark:placeholder-text-disabled-dark",
                    "relative flex items-center rounded-lg transition-all bg-transparent outline-none appearance-none border-none",
                    "pl-12 h-full text-current ",
                    expandable ? (active ? "w-[220px]" : "w-[180px]") : "",
                    innerClassName
                )}
            />
            {searchText
                ? <IconButton
                    className={`${large ? "mr-2 top-1" : "mr-1 top-0"} absolute right-0 z-10`}
                    onClick={clearText}>
                    <ClearIcon size={"small"}/>
                </IconButton>
                : <div style={{ width: 26 }}/>
            }
        </div>
    );
}
