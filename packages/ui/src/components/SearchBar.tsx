"use client";
import React, { useCallback, useState } from "react";

import { defaultBorderMixin } from "../styles";
import { CircularProgress, IconButton } from "./index";
import { CloseIcon, SearchIcon } from "../icons";
import { cls } from "../util";
import { useDebounceValue } from "../hooks";

interface SearchBarProps {
    onClick?: () => void;
    onTextSearch?: (searchString?: string) => void;
    placeholder?: string;
    expandable?: boolean;
    /**
     * Size of the search bar.
     * - "small": 32px height (matches TextField small)
     * - "medium": 44px height (matches TextField medium)
     * @default "medium"
     */
    size?: "small" | "medium";
    /**
     * @deprecated Use size="medium" or size="small" instead. This prop will be removed in a future version.
     */
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
    size = "medium",
    large,
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

    // Height classes matching TextField sizes
    const heightClass = size === "small" ? "h-[36px]" : "h-[44px]";
    const iconPaddingClass = size === "small" ? "px-2" : "px-4";
    const inputPaddingClass = size === "small" ? "pl-8" : "pl-12";

    return (
        <div
            onClick={onClick}
            className={cls("relative",
                heightClass,
                "bg-surface-accent-50 dark:bg-surface-800 border",
                defaultBorderMixin,
                "rounded-lg",
                className)}>
            <div
                className={cls("absolute p-0 h-full pointer-events-none flex items-center justify-center top-0", iconPaddingClass)}>
                {loading ? <CircularProgress size={"smallest"} /> : <SearchIcon className={"text-text-disabled dark:text-text-disabled-dark"} size={size === "small" ? "small" : "medium"} />}
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
                    inputPaddingClass, "h-full text-current",
                    size === "small" ? "text-sm" : "",
                    expandable ? (active ? "w-[220px]" : "w-[180px]") : "",
                    innerClassName
                )}
            />
            {searchText
                ? <IconButton
                    className={`${size === "small" ? "mr-0 top-0" : "mr-1 top-0"} absolute right-0 z-10`}
                    size={"small"}
                    onClick={clearText}>
                    <CloseIcon size={"smallest"} />
                </IconButton>
                : <div style={{ width: 26 }} />
            }
        </div>
    );
}
