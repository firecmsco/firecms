import React from "react";

import { coolIconKeys, debounce, Icon, IconButton, iconKeys, SearchBar, Tooltip } from "@firecms/ui";
import { icon_synonyms, iconsSearch } from "../util";

const UPDATE_SEARCH_INDEX_WAIT_MS = 220;

if (process.env.NODE_ENV !== "production") {
    Object.keys(icon_synonyms).forEach((icon: string) => {
        if (!iconKeys.includes(icon)) {
            console.warn(`The icon ${icon} no longer exists. Remove it from \`icon_synonyms\``);
        }
    });
}

export interface SearchIconsProps {
    selectedIcon?: string;
    onIconSelected?: (icon: string) => void;
}

export function SearchIconsView({
                                selectedIcon = "",
                                onIconSelected
                            }: SearchIconsProps) {
    const [keys, setKeys] = React.useState<string[] | null>(null);
    const [query, setQuery] = React.useState<string>("");

    const updateSearchResults = React.useMemo(() =>
        debounce((value: string) => {
            if (!value || value === "") {
                setKeys(null);
            } else {
                const searchResult = iconsSearch.search(value);
                setKeys(searchResult.map((e: any) => e.key));
            }
        }, UPDATE_SEARCH_INDEX_WAIT_MS), []
    );

    React.useEffect(() => {
        updateSearchResults(query);
        return () => {
            updateSearchResults.clear();
        };
    }, [query, updateSearchResults]);

    const icons = keys === null ? coolIconKeys : keys;

    return (
        <>
            <SearchBar
                autoFocus
                innerClassName={"w-full sticky top-0 z-10"}
                onTextSearch={(value?: string) => setQuery(value ?? "")}
                placeholder="Search for more icons…"
            />

            <div className={"flex max-w-full flex-wrap mt-4"}>
                {icons.map((icon: string) => {
                    return (
                        <Tooltip title={icon} key={icon}>
                            <IconButton
                                shape={"square"}
                                toggled={selectedIcon === icon}
                                onClick={onIconSelected ? () => onIconSelected(icon) : undefined}
                                className="box-content m-1"
                            >
                                <Icon iconKey={icon} size={24}/>
                            </IconButton>
                        </Tooltip>
                    );
                })}
            </div>
        </>
    );
}
