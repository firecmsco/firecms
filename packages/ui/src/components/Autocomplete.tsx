"use client";
import React from "react";

import { paperMixin } from "../styles";
import { Collapse } from "./Collapse";
import { cls } from "../util";
import { useOutsideAlerter } from "../hooks";

export type AutocompleteProps = {
    children: React.ReactNode;
    open: boolean;
    setOpen: (open: boolean) => void;
    className?: string;
}

export const useAutoComplete = ({ ref }: {
    ref: React.MutableRefObject<HTMLDivElement | null>;
}) => {

    const [autoCompleteOpen, setAutoCompleteOpen] = React.useState(false);
    const [inputFocused, setInputFocused] = React.useState(false);

    // if ref is not focused, close autocomplete
    React.useEffect(() => {
        if (ref.current) {
            ref.current.onfocus = () => {
                setAutoCompleteOpen(true);
                setInputFocused(true);
            }
            ref.current.onblur = () => {
                setInputFocused(false);
            }
        }
    }, [ref]);

    return {
        inputFocused,
        autoCompleteOpen,
        setAutoCompleteOpen
    };
}

export function Autocomplete({
                                 children,
                                 open,
                                 setOpen,
                                 className
                             }: AutocompleteProps) {

    const autocompleteRef = React.useRef<HTMLDivElement>(null);
    useOutsideAlerter(autocompleteRef, () => setOpen(false));

    return <Collapse
        in={open}
        duration={30}
        className={cls(
            "absolute top-full left-0 right-0 overflow-visible",
            open ? "shadow" : "",
            "my-2",
            "z-20",
            "w-full")}>
        <div ref={autocompleteRef}
             className={cls(
                 open ? paperMixin : "",
                 "bg-surface-50 dark:bg-surface-900",
                 className,
             )}>
            {children}
        </div>
    </Collapse>;

}

export type AutocompleteItemProps = {
    children: React.ReactNode,
    onClick?: () => void,
    className?: string
};

export const AutocompleteItem = React.memo(function AutocompleteItem({
                                     children,
                                     onClick,
                                     className
                                 }: AutocompleteItemProps) {

    return (
        <div
            className={cls("flex w-full items-center h-[48px] cursor-pointer hover:bg-surface-accent-100 dark:hover:bg-surface-accent-800", className)}
            onClick={onClick}>
            {children}
        </div>
    )
});
