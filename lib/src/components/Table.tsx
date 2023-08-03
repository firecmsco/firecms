import React from "react";
import { defaultBorderMixin } from "../styles";
import { cn } from "./util/cn";

export type TableProps = {
    children: React.ReactNode;
    className?: string;
};

export const Table = ({
                          children,
                          className
                      }: TableProps) => (
    <table className={cn("w-full text-left text-gray-800 dark:text-gray-200 rounded-md overflow-x-auto",
        className)}>
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
        className={cn("bg-white text-sm dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", className)}>
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
    <thead className={cn(
        defaultBorderMixin,
        "text-sm font-medium text-gray-700 dark:text-gray-300",
        "bg-gray-50 border-b dark:bg-gray-900", className)}>
    {children}
    </thead>
);

export type TableRowProps = {
    children?: React.ReactNode;
    className?: string;
    onClick?: React.MouseEventHandler<any>;
};

export const TableRow = ({
                             children,
                             className,
                             onClick
                         }: TableRowProps) => (
    <tr
        onClick={onClick}
        className={cn(
            defaultBorderMixin,
            "bg-white border-b last:border-b-0 dark:bg-gray-950",
            onClick ? "hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" : "",
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
};

export const TableCell = ({
                              children,
                              header = false,
                              scope = "",
                              align,
                              className,
                              style
                          }: TableCellProps) => {
    const Tag = header ? "th" : "td";
    return (
        <Tag scope={scope}
             style={style}
             className={cn("px-6 py-3 text-clip ",
                 align === "center" ? "text-center" : (align === "right" ? "text-right" : "text-left"),
                 className)}>
            {children}
        </Tag>
    );
};
