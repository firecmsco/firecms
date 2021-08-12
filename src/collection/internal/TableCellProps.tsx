import React from "react";
import { Entity, Property } from "../../models";


export type TableCellProps<M> =
    {
        columnIndex: number,
        cellRect: DOMRect;
        width: number,
        height: number,
        name: keyof M,
        property: Property,
        entity: Entity<any>,
        usedPropertyBuilder: boolean,
    }
    | undefined;



