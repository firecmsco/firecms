import clsx from "clsx";
import { OptionHTMLAttributes, SelectHTMLAttributes } from "react";

export function FilledSelect(props: SelectHTMLAttributes<HTMLSelectElement> & {children: React.ReactNode}) {
    return (
        <select
            {...props}
            className={clsx(
                "appearance-none bg-white text-gray-700 border rounded px-3 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600",
                props.className
            )}
        >
            {props.children}
        </select>
    );
}

export function FilledMenuItem(props: OptionHTMLAttributes<HTMLOptionElement>) {
    return (
        <option
            {...props}
            className={clsx(
                "bg-white text-gray-700 text-sm font-medium py-1 hover:bg-gray-200 focus:bg-gray-300 focus:text-gray-800",
                props.className
            )}
        >
            {props.children}
        </option>
    );
}
