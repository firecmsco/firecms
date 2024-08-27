import React, { useRef } from "react";
import { defaultBorderMixin } from "../styles";
import { cls } from "../util";

export type TableProps = {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
} & React.TableHTMLAttributes<HTMLTableElement>;

export const Table = ({
                          children,
                          className,
                          style,
                          ...rest
                      }: TableProps) => (
    <table
        className={cls("text-left text-gray-800 dark:text-white rounded-md overflow-x-auto", className)}
        style={style}
        {...rest}
    >
        {children}
    </table>
);

export type TableBodyProps = {
    children?: React.ReactNode;
    className?: string;
} & React.HTMLAttributes<HTMLTableSectionElement>;

export const TableBody = ({
                              children,
                              className,
                              ...rest
                          }: TableBodyProps) => (
    <tbody
        className={cls("bg-white dark:bg-gray-950 text-sm divide-y divide-slate-200 dark:divide-gray-700", className)}
        {...rest}
    >
    {children}
    </tbody>
);

export type TableHeaderProps = {
    children?: React.ReactNode;
    className?: string;
} & React.HTMLAttributes<HTMLTableSectionElement>;

export const TableHeader = ({
                                children,
                                className,
                                ...rest
                            }: TableHeaderProps) => (
    <thead {...rest}>
    <tr
        className={cls(
            defaultBorderMixin,
            "text-sm font-medium text-gray-700 dark:text-slate-300",
            "bg-slate-50 border-b dark:bg-gray-900",
            className
        )}
    >
        {children}
    </tr>
    </thead>
);

export type TableRowProps = {
    children?: React.ReactNode;
    className?: string;
    onClick?: React.MouseEventHandler<any>;
    style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLTableRowElement>;

export const TableRow = ({
                             children,
                             className,
                             onClick,
                             style,
                             ...rest
                         }: TableRowProps) => (
    <tr
        onClick={onClick}
        style={style}
        className={cls(
            "divide-slate-100 dark:divide-gray-800",
            "bg-white dark:bg-gray-950",
            onClick ? "hover:bg-slate-100 dark:hover:bg-gray-800 cursor-pointer" : "",
            className
        )}
        {...rest}
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
} & React.HTMLAttributes<HTMLTableCellElement>;

export const TableCell = ({
                              children,
                              header = false,
                              scope = "",
                              align,
                              className,
                              style,
                              colspan,
                              ...rest
                          }: TableCellProps) => {
    const ref = useRef<HTMLTableCellElement>(null);
    const Tag = header || getParentName(ref.current) === "TableHeader" ? "th" : "td";
    return (
        <Tag
            scope={scope}
            colSpan={colspan}
            ref={ref}
            style={style}
            className={cls(
                "px-4 py-3 text-clip ",
                align === "center" ? "text-center" : (align === "right" ? "text-right" : "text-left"),
                className
            )}
            {...rest}
        >
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
