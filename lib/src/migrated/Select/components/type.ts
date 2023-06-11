import React from "react";

export interface Option {
    value: string;
    label: string;
    disabled?: boolean;
    isSelected?: boolean;
}

export interface GroupOption {
    label: string;
    options: Option[];
}

export type Options = Array<Option | GroupOption>;

export interface ClassNames {
    menuButton?: (value?: { isDisabled?: boolean }) => string;
    menu?: string;
    tagItem?: (value?: { item?: Option; isDisabled?: boolean }) => string;
    tagItemText?: string;
    tagItemIconContainer?: string;
    tagItemIcon?: string;
    list?: string;
    listGroupLabel?: string;
    listItem?: (value?: { isSelected?: boolean }) => string;
    listDisabledItem?: string;
    ChevronIcon?: (value?: { open?: boolean }) => string;
    searchContainer?: string;
    searchBox?: string;
    searchIcon?: string;
    closeIcon?: string;
}

export type SelectValue = Option | Option[] | null;

export interface SelectProps {
    options: Options;
    value: SelectValue;
    onChange: (value: SelectValue) => void;
    onSearchInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    isMultiple?: boolean;
    isClearable?: boolean;
    isSearchable?: boolean;
    isDisabled?: boolean;
    loading?: boolean;
    menuIsOpen?: boolean;
    searchInputPlaceholder?: string;
    noOptionsMessage?: string;
    primaryColor: string;
    formatGroupLabel?: ((data: GroupOption) => JSX.Element) | null;
    formatOptionLabel?: ((data: Option) => JSX.Element) | null;
    classNames?: ClassNames;
}
