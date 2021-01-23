import { EntitySchema } from "../models";
import React, { useState } from "react";
import clsx from "clsx";
import OverflowingCell from "./OverflowingCell";
import ErrorBoundary from "../components/ErrorBoundary";
import { CellStyleProps, useCellStyles } from "./styles";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";

interface DisabledTableCellProps<T, S extends EntitySchema<string>> {
    children: React.ReactNode
}

export function DisabledTableCell<T, S extends EntitySchema>({
                                                                 children,
                                                                 size,
                                                                 align
                                                             }: DisabledTableCellProps<T, S> & CellStyleProps) {

    const classes = useCellStyles({ size, align, disabled: true });

    const [onHover, setOnHover] = useState(false);

    const previewComponent = (
        <OverflowingCell allowScroll={false}
                         size={size}
                         align={align}>
            <ErrorBoundary>
                {children}
            </ErrorBoundary>
        </OverflowingCell>);

    return <div className={clsx(classes.tableCell, classes.disabled)}
                onMouseEnter={() => setOnHover(true)}
                onMouseMove={() => setOnHover(true)}
                onMouseLeave={() => setOnHover(false)}>
        {previewComponent}
        {onHover &&
        <div style={{
            position: "absolute",
            top: 4,
            right: 4,
            fontSize: "14px"
        }}>
            <RemoveCircleIcon color={"disabled"} fontSize={"inherit"}/>
        </div>}
    </div>;
}

export default React.memo<DisabledTableCellProps<any, any> & CellStyleProps>(DisabledTableCell);


