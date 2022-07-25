import React from "react";
import equal from "react-fast-compare"
import { CMSType, Entity, ResolvedProperty } from "../../../../models";
import { PropertyPreview } from "../../../../preview";

import { getPreviewSizeFrom } from "../../../../preview/util";
import { TableCell } from "../../Table/TableCell";
import { useEntityCollectionTableController } from "../EntityCollectionTable";
import { getRowHeight } from "../../Table/common";
import { getValueInPath } from "../../../util";

export interface PropertyPreviewTableCellProps<T extends CMSType, M> {
    propertyKey: string;
    columnIndex: number;
    align: "right" | "left" | "center";
    property: ResolvedProperty<T>;
    width: number;
    entity: Entity<any>;
}

export const PropertyPreviewTableCell = React.memo<PropertyPreviewTableCellProps<any, any>>(
    function PropertyPreviewTableCell<T extends CMSType, M>({
                                                                 propertyKey,
                                                                 columnIndex,
                                                                 property,
                                                                 align,
                                                                 width,
                                                                 entity
                                                             }: PropertyPreviewTableCellProps<T, M>) {

        const {
            size,
            focused
        } = useEntityCollectionTableController();

        const value = getValueInPath(entity.values as any, propertyKey);
        return (
            <TableCell
                size={size}
                width={width}
                focused={focused}
                key={`preview_cell_${propertyKey}_${entity.id}`}
                value={value}
                align={align ?? "left"}
                disabled={true}>
                <PropertyPreview
                    width={width}
                    height={getRowHeight(size)}
                    propertyKey={propertyKey}
                    property={property as any}
                    entity={entity}
                    value={value}
                    size={getPreviewSizeFrom(size)}
                />
            </TableCell>
        );

    },
    areEqual) as React.FunctionComponent<PropertyPreviewTableCellProps<any, any>>;

function areEqual(prevProps: PropertyPreviewTableCellProps<any, any>, nextProps: PropertyPreviewTableCellProps<any, any>) {
    return prevProps.align === nextProps.align &&
        prevProps.width === nextProps.width &&
        prevProps.propertyKey === nextProps.propertyKey &&
        equal(prevProps.property, nextProps.property) &&
        equal(prevProps.property, nextProps.property)
        ;
}
