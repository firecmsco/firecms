import { EntitySchema } from "../models";
import React, { useState } from "react";
import clsx from "clsx";
import OverflowingCell from "./OverflowingCell";
import { ErrorBoundary } from "../components";
import { CellStyleProps, useCellStyles } from "./styles";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import { Tooltip } from "@material-ui/core";

interface DisabledTableCellProps<T, S extends EntitySchema<string>> {
    tooltip?:string;
    children: React.ReactNode
}

export function DisabledTableCell<T, S extends EntitySchema>({
                                                                 tooltip,
                                                                 children,
                                                                 size,
                                                                 align
                                                             }: DisabledTableCellProps<T, S> & CellStyleProps) {

    const classes = useCellStyles({ size, align, disabled: true });

    const [onHover, setOnHover] = useState(false);


    return <div className={clsx(classes.tableCell, classes.disabled)}
                onMouseEnter={() => setOnHover(true)}
                onMouseMove={() => setOnHover(true)}
                onMouseLeave={() => setOnHover(false)}>

        <OverflowingCell allowScroll={false}
                         size={size}
                         align={align}>
            <ErrorBoundary>
                {children}
            </ErrorBoundary>
        </OverflowingCell>

        {onHover &&
        <div style={{
            position: "absolute",
            top: 4,
            right: 4,
            fontSize: "14px"
        }}>
            <Tooltip title={tooltip ?? "Disabled"}>
                <RemoveCircleIcon color={"disabled"} fontSize={"inherit"}/>
            </Tooltip>
        </div>}
    </div>;
}

export default React.memo<DisabledTableCellProps<any, any> & CellStyleProps>(DisabledTableCell);


