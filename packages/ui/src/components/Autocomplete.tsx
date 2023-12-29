import React from "react";

import { paperMixin } from "../styles";
import { Collapse } from "./Collapse";
import { cn, useOutsideAlerter } from "../utils";

export type AutocompleteProps = {
    children: React.ReactNode;
    open: boolean;
    setOpen: (open: boolean) => void;
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
                                 setOpen
                             }: AutocompleteProps) {

    const autocompleteRef = React.useRef<HTMLDivElement>(null);
    useOutsideAlerter(autocompleteRef, () => setOpen(false));

    return <Collapse
        in={open}
        duration={50}
        className={cn(
            "absolute top-full left-0 right-0 overflow-visible",
            open ? "shadow" : "",
            "my-2",
            "z-20",
            "w-full")}>
        <div ref={autocompleteRef}
             className={cn(
                 open ? paperMixin : "",
                 "bg-gray-50 dark:bg-gray-900 py-2"
             )}>
            {children}
        </div>
    </Collapse>;

}

export type AutocompleteItemProps = {
    children: React.ReactNode,
    onClick?: () => void,
};

export function AutocompleteItem({
                                     children,
                                     onClick
                                 }: AutocompleteItemProps) {

    return (
        <div
            className="flex w-full items-center pr-6 pl-14 h-[48px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onClick}>
            {children}
        </div>
    )
}
