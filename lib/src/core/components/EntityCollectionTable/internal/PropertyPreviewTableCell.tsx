import React from "react";
import equal from "react-fast-compare"
import { CMSType, Entity, ResolvedProperty } from "../../../../types";
import { PropertyPreview } from "../../../../preview";

import { getPreviewSizeFrom } from "../../../../preview/util";
import { useEntityCollectionTableController } from "../EntityCollectionTable";
import { getRowHeight } from "../../Table/common";
import { getValueInPath } from "../../../util";
import { TableCell } from "./TableCell";

export interface PropertyPreviewTableCellProps<T extends CMSType, M extends Record<string, any>> {
    propertyKey: string;
    columnIndex: number;
    align: "right" | "left" | "center";
    property: ResolvedProperty<T>;
    width: number;
    entity: Entity<M>;
    disabledTooltip?: string;
}

export const PropertyPreviewTableCell = React.memo<PropertyPreviewTableCellProps<any, any>>(
    function PropertyPreviewTableCell<T extends CMSType, M extends Record<string, any>>({
                                                                                            propertyKey,
                                                                                            columnIndex,
                                                                                            property,
                                                                                            align,
                                                                                            width,
                                                                                            entity,
                                                                                            disabledTooltip
                                                                                        }: PropertyPreviewTableCellProps<T, M>) {

        const {
            size,
            focused,
            selectedEntityIds
        } = useEntityCollectionTableController();
        const selectedRow = selectedEntityIds?.includes(entity.id) ?? false

        const value = getValueInPath(entity.values, propertyKey);
        return (
            <TableCell
                size={size}
                width={width}
                focused={focused}
                selectedRow={selectedRow}
                key={`preview_cell_${propertyKey}_${entity.id}`}
                value={value}
                align={align ?? "left"}
                disabledTooltip={disabledTooltip ?? "Read only"}
                disabled={true}>
                <PropertyPreview
                    width={width}
                    height={getRowHeight(size)}
                    propertyKey={propertyKey}
                    property={property}
                    entity={entity}
                    value={value}
                    size={getPreviewSizeFrom(size)}
                />
            </TableCell>
        );

    },
    equal) as React.FunctionComponent<PropertyPreviewTableCellProps<any, any>>;
