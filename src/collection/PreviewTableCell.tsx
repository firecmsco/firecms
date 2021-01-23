import { EntitySchema } from "../models";
import React from "react";
import clsx from "clsx";
import OverflowingCell from "./OverflowingCell";
import ErrorBoundary from "../components/ErrorBoundary";
import { CellStyleProps, useCellStyles } from "./styles";

interface PreviewTableCellProps<T, S extends EntitySchema<string>> {
    children: React.ReactNode
}

export function PreviewTableCell<T, S extends EntitySchema>({
                                                                 children,
                                                                 size,
                                                                 align
                                                             }: PreviewTableCellProps<T, S> & CellStyleProps) {

    const classes = useCellStyles({ size, align, disabled: true });

    return <div className={clsx(classes.tableCell, classes.disabled)}>
        <OverflowingCell allowScroll={false}
                         size={size}
                         align={align}>
            <ErrorBoundary>
                {children}
            </ErrorBoundary>
        </OverflowingCell>
    </div>;
}

export default React.memo<PreviewTableCellProps<any, any> & CellStyleProps>(PreviewTableCell);


