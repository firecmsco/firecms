import React from "react";
import clsx from "clsx";

import { Collapse, useOutsideAlerter } from "../core";
import { paperMixin } from "../styles";

export type AutocompleteProps = {
    children: React.ReactNode;
    autocompleteOpen: boolean;
    setAutocompleteOpen: (open: boolean) => void;
}

export function Autocomplete({
                                 children,
                                 autocompleteOpen,
                                 setAutocompleteOpen
                             }: AutocompleteProps) {

    const autocompleteRef = React.useRef<HTMLDivElement>(null);
    useOutsideAlerter(autocompleteRef, () => setAutocompleteOpen(false));

    // return (
    //
    //     <DropdownMenu.Root >
    //         <DropdownMenu.Trigger asChild>
    //             {trigger}
    //         </DropdownMenu.Trigger>
    //
    //         <DropdownMenu.Portal className={"w-full"}>
    //             <DropdownMenu.Content className={clsx(
    //                 defaultBorderMixin,
    //                 autocompleteOpen ? "border-b shadow " : "",
    //                 "bg-gray-100 dark:bg-gray-900",
    //                 "z-20",
    //                 "w-full")} sideOffset={3}>
    //                 {children}
    //             </DropdownMenu.Content>
    //         </DropdownMenu.Portal>
    //     </DropdownMenu.Root>
    // )

    return <Collapse
        in={autocompleteOpen}
        duration={100}
        className={clsx(
            "absolute top-full left-0 right-0",
            "p-2",
            "z-20",
            "w-full")}>
        <div ref={autocompleteRef}
             className={clsx(
                 autocompleteOpen ? clsx(paperMixin, "shadow") : "",
                 "bg-gray-100 dark:bg-gray-900 py-2"
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
