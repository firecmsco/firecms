import React, { useRef } from "react";
import { defaultBorderMixin } from "../styles";
import { cn } from "../util";

export type TableProps = {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
};

export const Table = ({
                          children,
                          className,
                          style
                      }: TableProps) => (
    <table className={cn("w-full text-left text-gray-800 dark:text-white rounded-md overflow-x-auto",
        className)}
           style={style}>
        {children}
    </table>
);

export type TableBodyProps = {
    children?: React.ReactNode;
    className?: string;
};
export const TableBody = ({
                              children,
                              className
                          }: TableBodyProps) => (
    <tbody
        className={cn("bg-white text-sm dark:bg-gray-800 divide-y divide-slate-200 dark:divide-gray-700", className)}>
    {children}
    </tbody>
);

export type TableHeaderProps = {
    children?: React.ReactNode;
    className?: string;
};

export const TableHeader = ({
                                children,
                                className
                            }: TableHeaderProps) => (
    <thead>
    <tr className={cn(
        defaultBorderMixin,
        "text-sm font-medium text-gray-700 dark:text-gray-300",
        "bg-slate-50 border-b dark:bg-gray-900", className)}>
        {children}
    </tr>
    </thead>
);

export type TableRowProps = {
    children?: React.ReactNode;
    className?: string;
    onClick?: React.MouseEventHandler<any>;
    style?: React.CSSProperties;
};

export const TableRow = ({
                             children,
                             className,
                             onClick,
                             style
                         }: TableRowProps) => (
    <tr
        onClick={onClick}
        style={style}
        className={cn(
            "divide-slate-100 dark:divide-gray-800",
            "bg-white dark:bg-gray-950",
            onClick ? "hover:bg-slate-100 dark:hover:bg-gray-800 cursor-pointer" : "",
            className)}
    >
        {children}
    </tr>
);

export type TableCellProps = {
    children?: React.ReactNode;
    header?: boolean;
    scope?: string;
    className?: string;
    style?: React.CSSProperties;
    align?: "left" | "center" | "right";
    colspan?: number;
};

export const TableCell = ({
                              children,
                              header = false,
                              scope = "",
                              align,
                              className,
                              style,
                              colspan
                          }: TableCellProps) => {

    const ref = useRef<HTMLTableCellElement>(null);

    const Tag = header || getParentName(ref.current) === "TableHeader" ? "th" : "td";
    return (
        <Tag scope={scope}
             colSpan={colspan}
             ref={ref}
             style={style}
             className={cn("px-4 py-3 text-clip ",
                 align === "center" ? "text-center" : (align === "right" ? "text-right" : "text-left"),
                 className)}>
            {children}
        </Tag>
    );
};

// This is highly experimental and might break in the future
function getParentName(element: HTMLElement | null): string | undefined {
    if (element) {
        const key = Object.keys(element).find((key) => {
            return (
                key.startsWith("__reactFiber$") ||
                key.startsWith("__reactInternalInstance$")
            );
        });

        // @ts-ignore
        const domFiber = element[key];
        // @ts-ignore
        const getComponentFiber = (fiber) => {
            let parentFiber = fiber.return;
            while (typeof parentFiber.type === "string") {
                parentFiber = parentFiber.return;
            }
            return parentFiber;
        };
        let fiber = getComponentFiber(domFiber);
        fiber = getComponentFiber(fiber);
        return fiber?.elementType?.name;
    }
    return undefined;
}
