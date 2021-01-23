import React from "react";
import { Entity, Property } from "../models";


export type TableCellProps =
    {
        columnIndex: number,
        rowIndex: number,
        cellRect: DOMRect;
        width: number,
        height: number,
        name:  string,
        property: Property,
        entity: Entity<any>,
    }
    | undefined;



