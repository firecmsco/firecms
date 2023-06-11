import React, { useCallback, useEffect, useRef, useState } from "react";

import { COLORS, DEFAULT_THEME, THEME_DATA } from "../constants";
import useOnClickOutside from "../hooks/use-onclick-outside";

import { ChevronIcon, CloseIcon } from "./Icons";
import Options from "./Options";
import SearchInput from "./SearchInput";
import SelectProvider from "./SelectProvider";
import Spinner from "./Spinner";
import { Option, Options as ListOption, SelectProps } from "./type";

const Select: React.FC<SelectProps> = ({
    options = [],
    value = null,
    onChange,
    onSearchInputChange,
    placeholder = "Select...",
    searchInputPlaceholder = "Search...",
    isMultiple = false,
    isClearable = false,
    isSearchable = false,
    isDisabled = false,
    loading = false,
    menuIsOpen = false,
    noOptionsMessage = "No options found",
    primaryColor = DEFAULT_THEME,
    formatGroupLabel = null,
    formatOptionLabel = null,
    classNames
}) => {
    const [open, setOpen] = useState<boolean>(menuIsOpen);
    const [list, setList] = useState<ListOption>(options);
    const [inputValue, setInputValue] = useState<string>("");
    const ref = useRef<HTMLDivElement>(null);
    const searchBoxRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const formatItem = (item: Option) => {
            if ("disabled" in item) return item;
            return {
                ...item,
                disabled: false
            };
        };

        setList(
            options.map(item => {
                if ("options" in item) {
                    return {
                        label: item.label,
                        options: item.options.map(formatItem)
                    };
                } else {
                    return formatItem(item);
                }
            })
        );
    }, [options]);

    useEffect(() => {
        if (isSearchable) {
            if (open) {
                searchBoxRef.current?.select();
            } else {
                setInputValue("");
            }
        }
    }, [open, isSearchable]);

    const toggle = useCallback(() => {
        if (!isDisabled) {
            setOpen(!open);
        }
    }, [isDisabled, open]);

    const closeDropDown = useCallback(() => {
        if (open) setOpen(false);
    }, [open]);

    useOnClickOutside(ref, () => {
        closeDropDown();
    });

    const onPressEnterOrSpace = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            e.preventDefault();
            if ((e.code === "Enter" || e.code === "Space") && !isDisabled) {
                toggle();
            }
        },
        [isDisabled, toggle]
    );

    const handleValueChange = useCallback(
        (selected: Option) => {
            function update() {
                if (!isMultiple && !Array.isArray(value)) {
                    closeDropDown();
                    onChange(selected);
                }

                if (isMultiple && (Array.isArray(value) || value === null)) {
                    onChange(value === null ? [selected] : [...value, selected]);
                }
            }

            if (selected !== value) {
                update();
            }
        },
        [closeDropDown, isMultiple, onChange, value]
    );

    const clearValue = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            onChange(null);
        },
        [onChange]
    );

    const removeItem = useCallback(
        (e: React.MouseEvent<HTMLDivElement>, item: Option) => {
            if (isMultiple && Array.isArray(value) && value.length) {
                e.stopPropagation();
                const result = value.filter(current => item.value !== current.value);
                onChange(result.length ? result : null);
            }
        },
        [isMultiple, onChange, value]
    );

    const getSelectClass = useCallback(() => {
        let ringColor = THEME_DATA.ring[DEFAULT_THEME];
        if (COLORS.includes(primaryColor)) {
            ringColor = THEME_DATA.ring[primaryColor as keyof typeof THEME_DATA.ring];
        }

        let borderFocus = THEME_DATA.borderFocus[DEFAULT_THEME];
        if (COLORS.includes(primaryColor)) {
            borderFocus =
                THEME_DATA.borderFocus[primaryColor as keyof typeof THEME_DATA.borderFocus];
        }
        const baseClass =
            "flex text-sm text-gray-500 border border-gray-300 rounded shadow-sm transition-all duration-300 focus:outline-none";
        const defaultClass = `${baseClass} ${
            isDisabled
                ? "bg-gray-200"
                : `bg-white hover:border-gray-400 ${borderFocus} focus:ring ${ringColor}`
        }`;

        return classNames && classNames.menuButton
            ? classNames.menuButton({ isDisabled })
            : defaultClass;
    }, [classNames, isDisabled, primaryColor]);

    const getTagItemClass = useCallback(
        (item: Option) => {
            const baseClasse = "bg-gray-200 border rounded-sm flex space-x-1";
            const disabledClass = isDisabled ? "border-gray-500 px-1" : "pl-1";
            return classNames?.tagItem
                ? classNames.tagItem({ item, isDisabled })
                : `${baseClasse} ${disabledClass}`;
        },
        [classNames, isDisabled]
    );

    return (
        <SelectProvider
            otherData={{
                formatGroupLabel,
                formatOptionLabel,
                classNames
            }}
            value={value}
            handleValueChange={handleValueChange}
        >
            <div className="relative w-full" ref={ref}>
                <div
                    aria-expanded={open}
                    onKeyDown={onPressEnterOrSpace}
                    onClick={toggle}
                    className={getSelectClass()}
                >
                    <div className="grow pl-2.5 py-2 pr-2 flex flex-wrap gap-1">
                        {!isMultiple ? (
                            <p className="truncate cursor-default select-none">
                                {value && !Array.isArray(value) ? value.label : placeholder}
                            </p>
                        ) : (
                            <>
                                {value === null && placeholder}

                                {Array.isArray(value) &&
                                    value.map((item, index) => (
                                        <div className={getTagItemClass(item)} key={index}>
                                            <p
                                                className={
                                                    classNames?.tagItemText
                                                        ? classNames.tagItemText
                                                        : "text-gray-600 truncate cursor-default select-none"
                                                }
                                            >
                                                {item.label}
                                            </p>
                                            {!isDisabled && (
                                                <div
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={e => removeItem(e, item)}
                                                    className={
                                                        classNames?.tagItemIconContainer
                                                            ? classNames.tagItemIconContainer
                                                            : "flex items-center px-1 cursor-pointer rounded-r-sm hover:bg-red-200 hover:text-red-600"
                                                    }
                                                >
                                                    <CloseIcon
                                                        className={
                                                            classNames?.tagItemIcon
                                                                ? classNames.tagItemIcon
                                                                : "w-3 h-3 mt-0.5"
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </>
                        )}
                    </div>

                    <div className="flex flex-none items-center py-1.5">
                        {loading && (
                            <div className="px-1.5">
                                <Spinner primaryColor={primaryColor} />
                            </div>
                        )}

                        {isClearable && !isDisabled && value !== null && (
                            <div className="px-1.5 cursor-pointer" onClick={clearValue}>
                                <CloseIcon
                                    className={
                                        classNames?.closeIcon
                                            ? classNames.closeIcon
                                            : "w-5 h-5 p-0.5"
                                    }
                                />
                            </div>
                        )}

                        <div className="h-full">
                            <span className="w-px h-full inline-block text-white bg-gray-300 text-opacity-0" />
                        </div>

                        <div className="px-1.5">
                            <ChevronIcon
                                className={`transition duration-300 w-6 h-6 p-0.5${
                                    open ? " transform rotate-90 text-gray-500" : " text-gray-300"
                                }`}
                            />
                        </div>
                    </div>
                </div>

                {open && !isDisabled && (
                    <div
                        className={
                            classNames?.menu
                                ? classNames.menu
                                : "absolute z-10 w-full bg-white shadow-lg border rounded py-1 mt-1.5 text-sm text-gray-700"
                        }
                    >
                        {isSearchable && (
                            <SearchInput
                                ref={searchBoxRef}
                                value={inputValue}
                                placeholder={searchInputPlaceholder}
                                onChange={e => {
                                    if (
                                        onSearchInputChange &&
                                        typeof onSearchInputChange === "function"
                                    )
                                        onSearchInputChange(e);
                                    setInputValue(e.target.value);
                                }}
                            />
                        )}

                        <Options
                            list={list}
                            noOptionsMessage={noOptionsMessage}
                            text={inputValue}
                            isMultiple={isMultiple}
                            value={value}
                            primaryColor={primaryColor || DEFAULT_THEME}
                        />
                    </div>
                )}
            </div>
        </SelectProvider>
    );
};

export default Select;
